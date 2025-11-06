import { Component, EventEmitter, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/producto.service';
import { CategoriaService } from '../../services/categoria.service';
import { CategoriaFormModal } from '../categorias/categoria-form-modal/categoria-form-modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-productos-lista-admin',
  standalone: true,
  imports: [CommonModule, CategoriaFormModal],
  templateUrl: './productos-lista-admin.component.html',
  styleUrls: ['./productos-lista-admin.component.css']
})
export class ProductosListaAdminComponent implements OnInit {
  @Output() agregar = new EventEmitter<any>();

  categorias: any[] = [];
  productos: any[] = [];

  //PARA MODAL
  mostrarModal = false;
  modoEdicion = false;
  categoriaId: number | null = null;

  @ViewChild('carousel') carousel!: ElementRef;

  constructor(private productoService: ProductoService, private categoriaService: CategoriaService) {}

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarProductos();
  }

  cargarCategorias() {
    this.categoriaService.obtenerCategorias().subscribe((res) => {
      this.categorias = res;
    });
  }

  cargarProductos() {
    this.productoService.obtenerProductos().subscribe({
      next: (data) => (this.productos = data.filter(p => p.disponible === 1)),
      error: (err) => console.error('Error al cargar productos', err)
    });
  }

  // MODAL
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
        this.categoriaService.eliminarCategoria(id).subscribe(() => {

          Swal.fire({
            icon: 'success',
            title: 'Categoría eliminada',
            showConfirmButton: false,
            timer: 1500
          });

          this.cargarCategorias();
        });
      }
    });
  }

  //CARRUSEL
  scrollLeft() {
    const el = this.carousel?.nativeElement;
    if (el) el.scrollLeft -= 150;
  }

  scrollRight() {
    const el = this.carousel?.nativeElement;
    if (el) el.scrollLeft += 150;
  }

  filtrarProductosPorCategoria(id_categoria: number) {
    return this.productos.filter(p => p.id_categoria === id_categoria);
  }

  agregarProducto(producto: any) {
    this.agregar.emit(producto);
  }

  //BOTONES ABAJO PENDIENTE
  pendiente(seccion: 'pedidos'|'ventas'){
    Swal.fire({
      icon: 'info',
      title: 'Ruta pendiente',
      text: `La URL de "${seccion}" se definirá más adelante.`,
      confirmButtonColor: '#FFCA2B'
    });
  }

}
