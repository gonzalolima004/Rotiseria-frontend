import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // ======= 🛒 PRODUCTOS =======

  obtenerProductos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/productos`);
  }

  obtenerProducto(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/productos/${id}`);
  }

  crearProducto(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/productos`, formData);
  }

  actualizarProducto(id: number, formData: FormData): Observable<any> {
    // Laravel espera POST con _method=PUT para actualización con archivos
    return this.http.post(`${this.baseUrl}/productos/${id}?_method=PUT`, formData);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/productos/${id}`);
  }

  // ======= 🗂️ CATEGORÍAS =======

  obtenerCategorias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categorias`);
  }

  obtenerProductosPorCategoria(id_categoria: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categorias/${id_categoria}`);
  }
}
