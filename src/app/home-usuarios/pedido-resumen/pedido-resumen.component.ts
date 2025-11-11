import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

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
  @Output() cambiarCantidad = new EventEmitter<{ id_producto: number, cantidad: number }>();
  @Output() finalizar = new EventEmitter<void>();

  eliminarItem(item: any) {
    this.eliminar.emit(item);
  }

  cambiarCant(item: any, event: any) {
    const val = Number(event.target.value);
    if (val <= 0) return;

    const totalActual = this.items.reduce((acc, i) => acc + i.cantidad, 0);

    this.cambiarCantidad.emit({
      id_producto: item.id_producto,
      cantidad: val
    });
  }

  limpiarNumero(valor: any): string {
    if (valor == null) return '';
    const numStr = valor.toString().split('.')[0];
    return numStr.replace(/\D/g, '');
  }




  finalizarPedido() {
    this.finalizar.emit();
  }
}
