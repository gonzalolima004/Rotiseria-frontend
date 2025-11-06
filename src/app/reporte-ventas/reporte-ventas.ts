/*import { Component } from '@angular/core';

@Component({
  selector: 'app-reporte-ventas',
  imports: [],
  templateUrl: './reporte-ventas.html',
  styleUrl: './reporte-ventas.css'
})
export class ReporteVentas {

}
*/

import { Component, ChangeDetectionStrategy, signal, computed, effect, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasReportService, FilaReporte } from '../services/ventas-report.service';
import { Header } from '../header/header';

function toDateInputString(d: Date): string {
  // YYYY-MM-DD
  return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10);
}
function startOfWeek(d: Date): Date {
  const nd = new Date(d);
  const day = (nd.getDay() + 6) % 7; // lunes=0
  nd.setDate(nd.getDate() - day);
  nd.setHours(0,0,0,0);
  return nd;
}
function startOfMonth(d: Date): Date {
  const nd = new Date(d.getFullYear(), d.getMonth(), 1);
  nd.setHours(0,0,0,0);
  return nd;
}

@Component({
  selector: 'app-reporte-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule, Header],
  templateUrl: './reporte-ventas.html',
  styleUrls: ['./reporte-ventas.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReporteVentasComponent {
  constructor(
    private api: VentasReportService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // filtros (rango inicial: mes actual)
  private today = new Date();
  desde = signal<string>(toDateInputString(startOfMonth(this.today)));
  hasta = signal<string>(toDateInputString(this.today));

  // estado
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // datos
  filas = signal<FilaReporte[]>([]);

  // cargar
  _ = effect(() => { this.load(); });

  load() {
    this.loading.set(true);
    this.error.set(null);

    this.api.getFilasReporte().subscribe({
      next: (rows) => {
        this.filas.set(rows);
        this.loading.set(false);
      },
      error: (e) => {
        console.error(e);
        this.error.set('No se pudieron cargar las ventas.');
        this.loading.set(false);
      }
    });
  }

    // Top 3 productos más vendidos (por cantidad) dentro del rango filtrado
  topProductos = computed(() => {
    const mapa = new Map<number, { id: number; nombre: string; cantidad: number }>();

    for (const fila of this.filasFiltradas()) {
      for (const it of (fila.items ?? [])) {
        const key = it.id_producto;
        const prev = mapa.get(key) ?? { id: key, nombre: it.nombre_producto ?? `Prod ${key}`, cantidad: 0 };
        prev.cantidad += (it.cantidad ?? 0);
        // si en alguna fila aparece el nombre, nos quedamos con él
        if (it.nombre_producto) prev.nombre = it.nombre_producto;
        mapa.set(key, prev);
      }
    }

    return Array.from(mapa.values())
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 3);
  });


  // filtro client-side por fecha (venta.fecha es YYYY-MM-DD)
  filasFiltradas = computed(() => {
    const d1 = this.desde();
    const d2 = this.hasta();
    const list = this.filas();
    if (!d1 && !d2) return list;
    return list.filter(r => {
      return (!d1 || r.fecha >= d1) && (!d2 || r.fecha <= d2);
    });
  });

  // KPIs (hoy / semana / mes) usando venta.fecha + monto_total
  kpiHoy = computed(() => {
    const hoy = toDateInputString(this.today);
    return this.filas().filter(f => f.fecha === hoy)
      .reduce((acc, f) => acc + Number(f.monto_total ?? 0), 0);
  });

  kpiSemana = computed(() => {
    const ini = toDateInputString(startOfWeek(this.today));
    const fin = toDateInputString(this.today);
    return this.filas().filter(f => f.fecha >= ini && f.fecha <= fin)
      .reduce((acc, f) => acc + (f.monto_total ?? 0), 0);
  });

  kpiMes = computed(() => {
    const ini = toDateInputString(startOfMonth(this.today));
    const fin = toDateInputString(this.today);
    return this.filas().filter(f => f.fecha >= ini && f.fecha <= fin)
      .reduce((acc, f) => acc + (f.monto_total ?? 0), 0);
  });

  // Top 3 clientes usuales (por cantidad de ventas) del rango filtrado
  topClientes = computed(() => {
    const conteo = new Map<string, { nombre: string; dni: string; ventas: number; monto: number }>();
    for (const f of this.filasFiltradas()) {
      const dni = f.dni_cliente ?? '(sin-dni)';
      const prev = conteo.get(dni) ?? { nombre: f.cliente, dni, ventas: 0, monto: 0 };
      prev.ventas += 1;
      prev.monto += (f.monto_total ?? 0);
      prev.nombre = f.cliente; // mantener último nombre
      conteo.set(dni, prev);
    }
    return Array.from(conteo.values())
      .sort((a, b) => b.ventas - a.ventas || b.monto - a.monto)
      .slice(0, 3);
  });

  // helpers de formato
  money(v: number) {
    if (v == null) return '-';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 }).format(v);
  }

  //ELIMINACION Y EDICION DE VENTAS

   // ======= Estado para edición/eliminación =======
  editOpen = signal<boolean>(false);
  deleteOpen = signal<boolean>(false);

  // fila seleccionada
  selected = signal<FilaReporte | null>(null);

  // formulario de edición (campos que acepta tu backend)
  editFecha = signal<string>('');          // "YYYY-MM-DD"
  editMonto = signal<string>('');          // lo casteamos a number al enviar
  editIdPedido = signal<number>(0);

  // abrir modal de edición
  openEdit(f: FilaReporte) {
    this.selected.set(f);
    this.editFecha.set(f.fecha);
    this.editMonto.set(String(f.monto_total ?? ''));
    this.editIdPedido.set(f.id_pedido);
    this.editOpen.set(true);
  }

  // enviar edición
  saveEdit() {
    const f = this.selected();
    if (!f) return;
    const payload = {
      fecha: this.editFecha(),
      monto_venta: Number(this.editMonto()),
      id_pedido: this.editIdPedido()
    };
    // validación mínima
    if (!payload.fecha || !Number.isFinite(payload.monto_venta) || !payload.id_pedido) return;

    this.api.updateVenta(f.id_venta, payload).subscribe({
      next: () => {
        // actualizar en memoria (optimista)
        const updated = this.filas().map(row => {
          if (row.id_venta === f.id_venta) {
            return {
              ...row,
              fecha: payload.fecha,
              monto_total: payload.monto_venta,
              id_pedido: payload.id_pedido
            };
          }
          return row;
        });
        this.filas.set(updated);
        this.editOpen.set(false);
      },
      error: (e) => {
        console.error(e);
        alert('No se pudo actualizar la venta.');
      }
    });
  }

  // abrir confirmación de eliminación
  openDelete(f: FilaReporte) {
    this.selected.set(f);
    this.deleteOpen.set(true);
  }

  // confirmar eliminación
  confirmDelete() {
    const f = this.selected();
    if (!f) return;
    this.api.deleteVenta(f.id_venta).subscribe({
      next: () => {
        // quitar de la lista (optimista)
        this.filas.set(this.filas().filter(x => x.id_venta !== f.id_venta));
        this.deleteOpen.set(false);
      },
      error: (e) => {
        console.error(e);
        alert('No se pudo eliminar la venta.');
      }
    });
  }

  cancelModals() {
    this.editOpen.set(false);
    this.deleteOpen.set(false);
    this.selected.set(null);
  }
}
