import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  crearPedido(pedido: any, detalles: any[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/pedidos`, pedido).pipe(
      switchMap((res) => {
        // ✅ Detectar correctamente el id_pedido
        const idPedido = res?.pedido?.id_pedido;

        if (!idPedido) {
          throw new Error('No se recibió id_pedido desde el backend.');
        }

        // ✅ Crear cada detalle con el id_pedido correcto
        const requests = detalles.map(detalle => {
          const detalleConPedido = {
            ...detalle,
            id_pedido: idPedido
          };
          return this.http.post(`${this.apiUrl}/detalle_pedidos`, detalleConPedido);
        });

        return forkJoin(requests);
      })
    );
  }
}
