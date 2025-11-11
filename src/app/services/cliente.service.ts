import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = 'http://localhost:8000/api/clientes';

  constructor(private http: HttpClient) { }

  obtenerClientePorDni(dni: string): Observable<any | null> {
    return this.http.get<any>(`${this.apiUrl}/${dni}`).pipe(
      catchError(() => of(null))
    );
  }

  crearCliente(cliente: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, cliente);
  }

  obtenerOCrearCliente(cliente: any): Observable<any> {
    return this.obtenerClientePorDni(cliente.dni_cliente).pipe(
      switchMap((existe) => {
        if (existe) {
          // Si ya existe, actualizarlo con los nuevos datos
          return this.actualizarCliente(cliente.dni_cliente, cliente);
        }
        // Si no existe, crearlo
        return this.crearCliente(cliente);
      })
    );
  }

  actualizarCliente(dni: string, cliente: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${dni}`, cliente);
  }
}
