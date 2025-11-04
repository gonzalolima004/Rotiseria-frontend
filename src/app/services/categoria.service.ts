import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = 'http://localhost:8000/api/categorias';

  constructor(private http: HttpClient) {}

  crearCategoria(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  actualizarCategoria(id: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}?_method=PUT`, formData);
  }

  obtenerCategorias(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  obtenerCategoria(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  eliminarCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
