import { Component, EventEmitter, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-productos-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productos-lista.component.html',
  styleUrls: ['./productos-lista.component.css']
})
export class ProductosListaComponent implements OnInit {
  @Output() agregar = new EventEmitter<any>();

  categorias: any[] = [];
  productos: any[] = [];

  @ViewChild('carousel', { static: false }) carousel!: ElementRef;

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarProductos();
  }

  cargarCategorias() {
    this.productoService.obtenerCategorias().subscribe({
      next: (data) => (this.categorias = data),
      error: (err) => console.error('Error al cargar categorías', err)
    });
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

  scrollLeft() {
    this.carousel.nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
  }

  scrollRight() {
    this.carousel.nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
  }

  scrollToCategoria(id: number) {
    const element = document.getElementById('cat-' + id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollUp() {
    const carousel = document.querySelector('.categoria-container-vertical');
    if (carousel) {
      carousel.scrollBy({
        top: -100,
        behavior: 'smooth'
      });
    }
  }

  scrollDown() {
    const carousel = document.querySelector('.categoria-container-vertical');
    if (carousel) {
      carousel.scrollBy({
        top: 100,
        behavior: 'smooth'
      });
    }
  }

  limpiarNumero(valor: any): string {
  if (valor == null) return '';
  const numStr = valor.toString().split('.')[0];
  return numStr.replace(/\D/g, '');
}


}
