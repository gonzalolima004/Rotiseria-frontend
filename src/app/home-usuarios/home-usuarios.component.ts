import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductosListaComponent } from './productos-lista/productos-lista.component';
import { PedidoResumenComponent } from './pedido-resumen/pedido-resumen.component';
import { PedidoFormModalComponent } from './pedido-form-modal/pedido-form-modal.component';
import { Header } from '../header/header';

@Component({
  selector: 'app-home-usuarios',
  standalone: true,
  imports: [CommonModule, ProductosListaComponent, PedidoResumenComponent, PedidoFormModalComponent, Header],
  templateUrl: './home-usuarios.component.html',
  styleUrls: ['./home-usuarios.component.css']
})
export class HomeUsuariosComponent {
  carrito: any[] = [];
  mostrarModal = false;
  total = 0;

  onAgregarProducto(producto: any) {
    const existe = this.carrito.find(p => p.id_producto === producto.id_producto);
    if (existe) {
      existe.cantidad += 1;
      existe.subtotal = existe.cantidad * existe.precio_producto;
    } else {
      this.carrito.push({
        id_producto: producto.id_producto,
        nombre_producto: producto.nombre_producto,
        precio_producto: producto.precio_producto,
        cantidad: 1,
        subtotal: producto.precio_producto
      });
    }
    this.calcularTotal();
  }

  onQuitarItem(item: any) {
    this.carrito = this.carrito.filter(p => p.id_producto !== item.id_producto);
    this.calcularTotal();
  }

  onCambiarCantidad(event: {id_producto: number, cantidad: number}) {
    const item = this.carrito.find(p => p.id_producto === event.id_producto);
    if (item) {
      item.cantidad = event.cantidad;
      item.subtotal = item.cantidad * item.precio_producto;
      this.calcularTotal();
    }
  }

  onFinalizarPedido() {
    if (this.carrito.length === 0) return;
    this.mostrarModal = true;
  }

  onPedidoRealizado() {
    this.carrito = [];
    this.total = 0;
    this.mostrarModal = false;
  }

  onCerrarModal() {
    this.mostrarModal = false;
  }

  private calcularTotal() {
  this.total = this.carrito.reduce((acc, p) => acc + Number(p.subtotal), 0);
}

}
