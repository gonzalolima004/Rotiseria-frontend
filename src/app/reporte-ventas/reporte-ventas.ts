import { Component, ChangeDetectionStrategy, signal, computed, effect, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasReportService, FilaReporte } from '../services/ventas-report.service';
import { HeaderAdminComponent } from '../header-admin/header-admin';

function toDateInputString(d: Date): string {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

function startOfWeek(d: Date): Date {
  const nd = new Date(d);
  const day = (nd.getDay() + 6) % 7;
  nd.setDate(nd.getDate() - day);
  nd.setHours(0, 0, 0, 0);
  return nd;
}

function startOfMonth(d: Date): Date {
  const nd = new Date(d.getFullYear(), d.getMonth(), 1);
  nd.setHours(0, 0, 0, 0);
  return nd;
}

@Component({
  selector: 'app-reporte-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderAdminComponent],
  templateUrl: './reporte-ventas.html',
  styleUrls: ['./reporte-ventas.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteVentasComponent {
  constructor(
    private api: VentasReportService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private today = new Date();
  desde = signal<string>(toDateInputString(startOfMonth(this.today)));
  hasta = signal<string>(toDateInputString(this.today));

  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  filas = signal<(FilaReporte & { detalle_pedido: string })[]>([]);

  _ = effect(() => {
    this.load();
  });

  load() {
    this.loading.set(true);
    this.error.set(null);

    this.api.getFilasReporte().subscribe({
      next: (rows) => {
        const filasConDetalle = rows.map((fila: any) => {
          // 🔹 Generamos texto legible con cantidad y nombre
          const detalleTexto =
            fila.items?.map((it: any) => {
              const nombre =
                it?.id_producto == null
                  ? 'Producto eliminado'
                  : (it?.nombre_producto ??
                     it?.nombre_producto_display ??
                     'Producto desconocido');

              const cantidad = it?.cantidad ?? 1;
              return `${cantidad}x ${nombre}`;
            }).join(', ') || 'Sin detalles';

          return {
            ...fila,
            detalle_pedido: detalleTexto,
          } as FilaReporte & { detalle_pedido: string };
        });

        this.filas.set(filasConDetalle);
        this.loading.set(false);
      },
      error: (e) => {
        console.error(e);
        this.error.set('No se pudieron cargar las ventas.');
        this.loading.set(false);
      },
    });
  }

  filasFiltradas = computed(() => {
    const d1 = this.desde();
    const d2 = this.hasta();
    const list = this.filas();
    if (!d1 && !d2) return list;
    return list.filter((r) => (!d1 || r.fecha >= d1) && (!d2 || r.fecha <= d2));
  });

  topProductos = computed(() => {
    const mapa = new Map<
      number | null,
      { id: number | null; nombre: string; cantidad: number }
    >();

    for (const fila of this.filasFiltradas()) {
      for (const it of fila.items ?? []) {
        const key = it.id_producto ?? null;
        const prev =
          mapa.get(key) ??
          {
            id: key,
            nombre: it.nombre_producto ?? 'Producto eliminado',
            cantidad: 0,
          };
        prev.cantidad += it.cantidad ?? 0;
        if (it.nombre_producto) prev.nombre = it.nombre_producto;
        mapa.set(key, prev);
      }
    }

    return Array.from(mapa.values())
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 3);
  });

  kpiHoy = computed(() => {
    const hoy = toDateInputString(this.today);
    return this.filas()
      .filter((f) => f.fecha === hoy)
      .reduce((acc, f) => acc + Number(f.monto_total ?? 0), 0);
  });

  kpiSemana = computed(() => {
    const ini = toDateInputString(startOfWeek(this.today));
    const fin = toDateInputString(this.today);
    return this.filas()
      .filter((f) => f.fecha >= ini && f.fecha <= fin)
      .reduce((acc, f) => acc + (f.monto_total ?? 0), 0);
  });

  kpiMes = computed(() => {
    const ini = toDateInputString(startOfMonth(this.today));
    const fin = toDateInputString(this.today);
    return this.filas()
      .filter((f) => f.fecha >= ini && f.fecha <= fin)
      .reduce((acc, f) => acc + (f.monto_total ?? 0), 0);
  });

  topClientes = computed(() => {
    const conteo = new Map<
      string,
      { nombre: string; dni: string; ventas: number; monto: number }
    >();

    for (const f of this.filasFiltradas()) {
      const dni = f.dni_cliente ?? '(sin-dni)';
      const prev =
        conteo.get(dni) ?? { nombre: f.cliente, dni, ventas: 0, monto: 0 };
      prev.ventas += 1;
      prev.monto += f.monto_total ?? 0;
      prev.nombre = f.cliente;
      conteo.set(dni, prev);
    }

    return Array.from(conteo.values())
      .sort((a, b) => b.ventas - a.ventas || b.monto - a.monto)
      .slice(0, 3);
  });

  money(v: number) {
    if (v == null) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 2,
    }).format(v);
  }
}
