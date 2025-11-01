import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
  productos: any[] = [];
  productosPorCategoria: any[] = [];
  cargando = false;

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargando = true;
    this.productoService.obtenerProductos().subscribe({
      next: (data) => {
        this.productos = data.filter(p => p.disponible === 1);
        this.agruparPorCategoria();
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  agruparPorCategoria() {
    const grupos: { [key: string]: any[] } = {};

    this.productos.forEach(prod => {
      const categoria = prod.categoria?.nombre_categoria || 'Sin categoría';
      if (!grupos[categoria]) grupos[categoria] = [];
      grupos[categoria].push(prod);
    });

    this.productosPorCategoria = Object.entries(grupos).map(([nombre, productos]) => ({
      nombre,
      productos
    }));
  }

  agregarProducto(producto: any) {
    this.agregar.emit(producto);
  }
}
