import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:8000/api/productos';

  constructor(private http: HttpClient) {}

  crearProducto(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  actualizarProducto(id: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}?_method=PUT`, formData);
  }

  obtenerProductos(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  obtenerProducto(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
