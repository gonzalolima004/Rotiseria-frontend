import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductosListaAdminComponent } from './productos-lista-admin/productos-lista-admin.component';
import { ProductoFormModal } from './producto-form-modal/producto-form-modal.component';
import { Header } from '../header/header';
import { AuthService } from '../services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [CommonModule, ProductosListaAdminComponent, ProductoFormModal, Header],
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

  // 👇 SOLO AGREGUÉ ESTE MÉTODO
  cerrarSesion() {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas salir?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#7C662A',
      cancelButtonColor: '#FFCA2B',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.router.navigate(['/home-usuarios']);
        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada',
          text: '¡Hasta pronto!',
          showConfirmButton: false,
          timer: 1500
        });
      }
    });
  }
}