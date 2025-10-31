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
  cargando = false;

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargando = true;
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.productos = data.filter(p => p.disponible === 1);
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  agregarProducto(producto: any) {
    this.agregar.emit(producto);
  }
}
