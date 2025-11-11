import { Component, EventEmitter, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/producto.service';
import { CategoriaService } from '../../services/categoria.service';
import { ProductoFormModal } from '../producto-form-modal/producto-form-modal.component';
import { CategoriaFormModal } from '../categoria-form-modal/categoria-form-modal';
import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';
import { NgZone } from '@angular/core';



@Component({
  selector: 'app-productos-lista-admin',
  standalone: true,
  imports: [CommonModule, CategoriaFormModal, ProductoFormModal],
  templateUrl: './productos-lista-admin.component.html',
  styleUrls: ['./productos-lista-admin.component.css']
})
export class ProductosListaAdminComponent implements OnInit {
  @Output() agregar = new EventEmitter<any>();
  @ViewChild('carousel', { static: false }) carousel!: ElementRef;

  categorias: any[] = [];
  productos: any[] = [];

  mostrarModal = false;
  modoEdicion = false;
  categoriaId: number | null = null;
  productoIdSeleccionado: number | null = null;
  tipoModal: 'categoria' | 'producto' | null = null;

constructor(
  private productoService: ProductoService,
  private categoriaService: CategoriaService,
  private zone: NgZone
) {}


  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarProductos();
  }

  // ===================================
  // 🔔 HELPER GLOBAL PARA ALERTAS
  // ===================================
  private mostrarAlerta(options: SweetAlertOptions, cerrarModal = false): Promise<SweetAlertResult<any>> {
    if (cerrarModal) {
      this.mostrarModal = false; // 🔹 Cierra el modal antes de mostrar la alerta
    }

    return Swal.fire({
      ...options,
      didOpen: popup => {
        popup.style.zIndex = '20000';
      },
      didRender: () => {
        const container = document.querySelector('.swal2-container') as HTMLElement;
        if (container) container.style.zIndex = '20000';
      }
    });
  }

  // ===================================
  // CATEGORÍAS
  // ===================================
  cargarCategorias() {
    this.categoriaService.obtenerCategorias().subscribe({
      next: res => (this.categorias = res),
      error: err => console.error('Error al cargar categorías', err)
    });
  }

  abrirModalCrearCategoria() {
    this.modoEdicion = false;
    this.categoriaId = null;
    this.tipoModal = 'categoria';
    this.mostrarModal = true;
  }

  abrirModalEditarCategoria(cat: any) {
    this.modoEdicion = true;
    this.categoriaId = cat.id_categoria;
    this.tipoModal = 'categoria';
    this.mostrarModal = true;
  }

  eliminarCategoria(id: number) {
    this.mostrarAlerta({
      title: '¿Eliminar categoría?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#7C662A',
      confirmButtonText: 'Sí, eliminar'
    }).then((result: SweetAlertResult<any>) => {
      if (result.isConfirmed) {
        this.categoriaService.eliminarCategoria(id).subscribe({
          next: () => {
            this.categorias = this.categorias.filter(c => c.id_categoria !== id);
            this.mostrarAlerta({
              icon: 'success',
              title: 'Categoría eliminada',
              showConfirmButton: false,
              timer: 1500
            }, true); // 🔹 Cierra modal antes de mostrar la alerta
          },
          error: () => {
            this.mostrarAlerta({
              icon: 'error',
              title: 'No se puede eliminar',
              text: 'La categoría tiene productos asociados'
            }, true);
          }
        });
      }
    });
  }

  // ===================================
  // PRODUCTOS
  // ===================================
  cargarProductos() {
    this.productoService.obtenerProductos().subscribe({
      next: data => {
        this.productos = data.filter(p => p.disponible === 1);
      },
      error: err => console.error('Error al cargar productos', err)
    });
  }

  filtrarProductosPorCategoria(id_categoria: number) {
    return this.productos.filter(p => p.id_categoria === id_categoria);
  }

  agregarProducto(producto: any) {
    this.agregar.emit(producto);
  }

  abrirModalCrearProducto() {
    this.modoEdicion = false;
    this.productoIdSeleccionado = null;
    this.tipoModal = 'producto';
    this.mostrarModal = true;
  }

  editarProducto(producto: any) {
    this.modoEdicion = true;
    this.productoIdSeleccionado = producto.id_producto;
    this.tipoModal = 'producto';
    this.mostrarModal = true;
  }

  eliminarProducto(producto: any) {
    this.mostrarAlerta({
      title: '¿Estás seguro?',
      text: `Se eliminará el producto "${producto.nombre_producto}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FFCA2B',
      cancelButtonColor: '#7C662A',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result: SweetAlertResult<any>) => {
      if (result.isConfirmed) {
        this.productoService.eliminarProducto(producto.id_producto).subscribe({
          next: () => {
            this.productos = this.productos.filter(p => p.id_producto !== producto.id_producto);
            this.mostrarAlerta({
              icon: 'success',
              title: 'Producto eliminado',
              showConfirmButton: false,
              timer: 1200
            }, true); // 🔹 Cierra modal antes de mostrar la alerta
          },
          error: err => {
            this.mostrarAlerta({
              icon: 'error',
              title: 'Error al eliminar',
              text: err.error.message || 'Ocurrió un error',
              confirmButtonColor: '#FFCA2B'
            }, true);
          }
        });
      }
    });
  }

  // ===================================
  // MODAL
  // ===================================
  cerrarModal(evento: string) {
    this.mostrarModal = false;

    if (evento === 'ok') {
      setTimeout(() => {
        if (this.tipoModal === 'producto') {
          this.cargarProductos();
        } else if (this.tipoModal === 'categoria') {
          this.cargarCategorias();
        }
      }, 300);
    }
  }

onCategoriaActualizada(): void {
  this.mostrarModal = false;

  // 🔥 Forzamos la actualización DENTRO del ciclo de Angular
  this.zone.run(() => {
    this.cargarCategorias();
  });
}

onProductoActualizado(): void {
  this.mostrarModal = false;
  this.zone.run(() => this.cargarProductos());
}


  // ===================================
  // SCROLL / UI
  // ===================================
  scrollLeft() {
    const carousel = document.querySelector('.categoria-container') as HTMLElement;
    carousel.scrollBy({ left: -200, behavior: 'smooth' });
  }

  scrollRight() {
    const carousel = document.querySelector('.categoria-container') as HTMLElement;
    carousel.scrollBy({ left: 200, behavior: 'smooth' });
  }

  scrollToCategoria(id: number) {
    const element = document.getElementById('cat-' + id);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
