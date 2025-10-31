import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pedido-resumen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedido-resumen.component.html',
  styleUrls: ['./pedido-resumen.component.css']
})
export class PedidoResumenComponent {
  @Input() items: any[] = [];
  @Input() total = 0;
  @Output() eliminar = new EventEmitter<any>();
  @Output() cambiarCantidad = new EventEmitter<{id_producto: number, cantidad: number}>();
  @Output() finalizar = new EventEmitter<void>();

  eliminarItem(item: any) {
    this.eliminar.emit(item);
  }

  cambiarCant(item: any, event: any) {
    const val = Number(event.target.value);
    if (val <= 0) return;
    this.cambiarCantidad.emit({id_producto: item.id_producto, cantidad: val});
  }

  finalizarPedido() {
    this.finalizar.emit();
  }
}
