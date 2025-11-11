import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';

export interface Venta {
  id_venta: number;
  fecha: string;         // "YYYY-MM-DD"
  monto_venta: number;
  id_pedido: number;
}

export interface PedidoDetalle {
  id_detalle: number;
  id_pedido: number;
  id_producto: number;
  cantidad: number;
  subtotal: number;
  producto?: { nombre_producto?: string }; // por si tu API lo trae anidado más adelante
}

export interface Pedido {
  id_pedido: number;
  fecha_hora: string; // ISO
  monto_total: number;
  dni_cliente: string;
  id_metodo_pago: number;
  id_modalidad_entrega: number;
  id_estado_pedido: number;
  cliente?: { nombre_cliente?: string };
  metodoPago?: { nombre_metodo_pago?: string };
  modalidad?: { nombre_modalidad_entrega?: string };
  estado?: { nombre_estado_pedido?: string };
  detalles?: PedidoDetalle[];
}

export interface FilaReporte {
  id_venta: number;
  fecha: string; // de venta
  id_pedido: number;
  cliente: string;
  detalle_pedido: string; // ej: "2x Milanesa; 1x Papas"
  metodo_pago: string;
  modalidad_entrega: string;
  monto_total: number; // de venta.monto_venta (o p.monto_total si preferís)
  dni_cliente?: string; // para top 3

  items?: Array<{
    id_producto: number;
    cantidad: number;
    nombre_producto?: string;
  }>;
}

@Injectable({ providedIn: 'root' })
export class VentasReportService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api';

  getVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.apiUrl}/ventas`);
  }

  getPedido(id_pedido: number): Observable<Pedido> {
    return this.http.get<{ message: string; pedido: Pedido }>(`${this.apiUrl}/pedidos/${id_pedido}`)
      .pipe(map(res => res.pedido));
  }

  /**
   * Construye las filas del reporte:
   * - carga /ventas
   * - agrupa ids de pedido y hace forkJoin a /pedidos/{id}
   * - fusiona para entregar FilaReporte[]
   */
  getFilasReporte(): Observable<FilaReporte[]> {
    return this.getVentas().pipe(
      // Traigo todos los pedidos involucrados en un solo paso
      // y luego armo las filas
      // (N+1 reducido a 1 para ventas + 1 para pedidos)
      // A nivel performance, después podemos paginar/filtrar server-side.
      // Para MVP está ok.
      map(ventas => {
        const uniquePedidoIds = Array.from(new Set(ventas.map(v => v.id_pedido)));
        return { ventas, uniquePedidoIds };
      }),
      // hago las requests a pedidos
      // (uso forkJoin con un diccionario para lookup rápido)
      (src) => new Observable<FilaReporte[]>(subscriber => {
        src.subscribe({
          next: ({ ventas, uniquePedidoIds }) => {
            const pedidos$ = uniquePedidoIds.map(id => this.getPedido(id));
            forkJoin(pedidos$).subscribe({
              next: (pedidos) => {
                const byId: Record<number, Pedido> = {};
                for (const p of pedidos) byId[p.id_pedido] = p;

                const filas: FilaReporte[] = ventas.map(v => {
                  const p = byId[v.id_pedido];
                  const cliente = p?.cliente?.nombre_cliente ?? '(sin cliente)';
                  const metodo = (p as any)?.metodo_pago?.nombre_metodo_pago ?? '(sin método)';
                  const modalidad = (p as any)?.modalidad?.nombre_modalidad_entrega ?? '(sin modalidad)';
                  /*const detalle = (p?.detalles ?? []).map(d => {
                    const rotulo = (d as any)?.producto?.nombre_producto ?? `Prod ${d.id_producto}`;
                    return `${d.cantidad}x ${rotulo}`;
                  }).join('; ');*/

                const items = (p?.detalles ?? []).map(d => ({
                  id_producto: d.id_producto,
                  cantidad: d.cantidad,
                  nombre_producto: (d as any)?.producto?.nombre_producto
                }));

                const detalle = items
                  .map(it => `${it.cantidad}x ${it.nombre_producto ?? 'Prod ' + it.id_producto}`)
                  .join('; ');

                  return {
                    id_venta: v.id_venta,
                    fecha: v.fecha,
                    id_pedido: v.id_pedido,
                    cliente,
                    detalle_pedido: detalle,
                    metodo_pago: metodo,
                    modalidad_entrega: modalidad,
                    monto_total:  Number(v.monto_venta),
                    dni_cliente: p?.dni_cliente,
                    items
                  };
                }); 


                subscriber.next(filas);
                subscriber.complete();
              },
              error: (e) => subscriber.error(e)
            });
          },
          error: (e) => subscriber.error(e)
        });
      })
    );
  }
  updateVenta(id_venta: number, payload: { fecha: string; monto_venta: number; id_pedido: number }) {
    return this.http.put<{ message: string; venta: any }>(`${this.apiUrl}/ventas/${id_venta}`, payload);
  }

   deleteVenta(id_venta: number) {
    return this.http.delete<{ message: string; venta: number }>(`${this.apiUrl}/ventas/${id_venta}`);
  }
}
