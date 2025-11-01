import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './lista-productos.component.html',
  styleUrls: ['./lista-productos.component.css']
})
export class ListaProductosComponent implements OnInit {
  productos: any[] = [];
  cargando = false;
  error: string | null = null;

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.obtenerProductos();
  }

  obtenerProductos(): void {
    this.cargando = true;
    this.productoService.obtenerProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar los productos.';
        this.cargando = false;
      }
    });
  }

  eliminarProducto(id: number): void {
    if (confirm('¿Deseas eliminar este producto?')) {
      this.productoService.eliminarProducto(id).subscribe({
        next: () => {
          // Ajuste para coincidir con tu backend: usa id_producto
          this.productos = this.productos.filter(p => p.id_producto !== id);
        },
        error: () => alert('Error al eliminar el producto')
      });
    }
  }
}
