import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = 'http://localhost:8000/api/pedidos'; 

  constructor(private http: HttpClient) {}

  getPedidos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  actualizarEstado(id: number, estadoId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/estado`, { id_estado_pedido: estadoId });
  }
}
