import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductosListaAdminComponent } from './productos-lista-admin/productos-lista-admin.component';
import { ProductoFormModal } from './producto-form-modal/producto-form-modal.component';
import { AuthService } from '../services/auth';
import { HeaderAdminComponent } from '../../app/header-admin/header-admin';

@Component({
  selector: 'app-home-admin',
  standalone: true,

  imports: [CommonModule, ProductosListaAdminComponent, HeaderAdminComponent, ProductoFormModal],

  templateUrl: './home-admin.component.html',
  styleUrls: ['./home-admin.component.css']
})
export class HomeAdminComponent {
  modalVisible = false;
  modalMode: 'create' | 'edit' = 'create';
  productoSeleccionado: any = null;

  @ViewChild(ProductosListaAdminComponent)
  lista!: ProductosListaAdminComponent;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  abrirCrearProducto() {
    this.modalMode = 'create';
    this.productoSeleccionado = null;
    this.modalVisible = true;
  }

  abrirEditarProducto(prod: any) {
    this.modalMode = 'edit';
    this.productoSeleccionado = prod;
    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
    this.refrescarLista();
  }

  refrescarLista() {
    this.lista?.cargarProductos();
  }
 }
  

