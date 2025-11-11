import { Component, EventEmitter, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/producto.service';
import { ProductoFormModal } from '../producto-form-modal/producto-form-modal.component';
import { CategoriaService } from '../../services/categoria.service';
import { CategoriaFormModal } from '../categorias/categoria-form-modal/categoria-form-modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-productos-lista-admin',
  standalone: true,

  imports: [CommonModule, CategoriaFormModal, ProductoFormModal],

  templateUrl: './productos-lista-admin.component.html',
  styleUrls: ['./productos-lista-admin.component.css']
})
export class ProductosListaAdminComponent implements OnInit {
  @Output() agregar = new EventEmitter<any>();
  categorias: any[] = [];
  productos: any[] = [];

  mostrarModal = false;
  modoEdicion = false;
  categoriaId: number | null = null;
  productoIdSeleccionado: number | null = null;
  @ViewChild('carousel', { static: false }) carousel!: ElementRef;

  constructor(private productoService: ProductoService, private categoriaService: CategoriaService) { }


  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarProductos();
  }

  cargarCategorias() {
    this.categoriaService.obtenerCategorias().subscribe(res => {
      this.categorias = res;
    });
  }

  abrirModalCrear() {
    this.modoEdicion = false;
    this.categoriaId = null;
    this.mostrarModal = true;
  }

  abrirModalEditar(cat: any) {
    this.modoEdicion = true;
    this.categoriaId = cat.id_categoria;
    this.mostrarModal = true;
  }

  cerrarModal(event: any) {
    this.mostrarModal = false;

    if (event === 'ok') {
      this.cargarCategorias();
    }
  }

  eliminarCategoria(id: number) {
    Swal.fire({
      title: '¿Eliminar categoría?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#7C662A',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoriaService.eliminarCategoria(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Categoría eliminada',
              showConfirmButton: false,
              timer: 1500
            }).then(() => {
              this.cargarCategorias(); 
            });
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'No se puede eliminar',
              text: 'La categoría tiene productos asociados'
            });
          }
        });
      }
    });
  }

  scrollLeft() {
    const carousel = this.carousel?.nativeElement;
    if (carousel) carousel.scrollLeft -= 150;
  }

  scrollRight() {
    const carousel = this.carousel?.nativeElement;
    if (carousel) carousel.scrollLeft += 150;
  }

  cargarProductos() {
    this.productoService.obtenerProductos().subscribe({
      next: (data) => (this.productos = data.filter(p => p.disponible === 1)),
      error: (err) => console.error('Error al cargar productos', err)
    });
  }

  filtrarProductosPorCategoria(id_categoria: number) {
    return this.productos.filter(p => p.id_categoria === id_categoria);
  }

  agregarProducto(producto: any) {
    this.agregar.emit(producto);
  }

  abrirModalCrear() {
    this.modoEdicion = false;
    this.productoIdSeleccionado = null;
    this.mostrarModal = true;
  }

  editarProducto(producto: any) {
    this.modoEdicion = true;
    this.productoIdSeleccionado = producto.id_producto;
    this.mostrarModal = true;
  }

  eliminarProducto(producto: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará el producto "${producto.nombre_producto}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FFCA2B',
      cancelButtonColor: '#7C662A',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productoService.eliminarProducto(producto.id_producto).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Producto eliminado',
              showConfirmButton: false,
              timer: 1200
            }).then(() => {
              this.cargarProductos();
                location.reload();
            });
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error al eliminar',
              text: err.error.message || 'Ocurrió un error',
              confirmButtonColor: '#FFCA2B'
            });
          }
        });
      }
    });
  }

  cerrarModal(evento: string) {
    this.mostrarModal = false;

    if (evento === 'ok') {
      setTimeout(() => {
        this.cargarProductos();
      }, 100);
    }
  }

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
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }




}
