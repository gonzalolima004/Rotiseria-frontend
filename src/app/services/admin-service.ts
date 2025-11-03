import { Injectable } from '@angular/core';
import { CategoriaService } from './categoria-service'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(
    private categoriaService: CategoriaService,
   
  ) {}

  crearCategoria(formData: FormData): Observable<any> {
    return this.categoriaService.crearCategoria(formData);
  }

  obtenerCategorias(): Observable<any> {
    return this.categoriaService.obtenerCategorias();
  }

  actualizarCategoria(id: number, formData: FormData): Observable<any> {
    return this.categoriaService.actualizarCategoria(id, formData);
  }

  eliminarCategoria(id: number): Observable<any> {
    return this.categoriaService.eliminarCategoria(id);
  }

 
/*   crearProducto(formData: FormData): Observable<any> {
    return this.productoService.crearProducto(formData);
  }

  obtenerProductos(): Observable<any> {
    return this.productoService.obtenerProductos();
  }

  actualizarProducto(id: number, formData: FormData): Observable<any> {
    return this.productoService.actualizarProducto(id, formData);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.productoService.eliminarProducto(id);
  } */
}
