import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ClienteService } from '../../services/cliente.service';
import { PedidoService } from '../../services/pedido.service';

@Component({
  selector: 'app-pedido-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedido-form-modal.component.html',
  styleUrls: ['./pedido-form-modal.component.css']
})
export class PedidoFormModalComponent {
  @Input() items: any[] = [];
  @Input() total = 0;
  @Output() cerrar = new EventEmitter<void>();
  @Output() pedidoRealizado = new EventEmitter<void>();

  dni_cliente = '';
  nombre_cliente = '';
  telefono_cliente = '';
  direccion_cliente = '';
  id_metodo_pago = '';
  id_modalidad_entrega = '';
  cargando = false;

  constructor(
    private clienteService: ClienteService,
    private pedidoService: PedidoService
  ) {}

  cerrarModal() {
    this.cerrar.emit();
  }

  onChangeModalidad(event: any) {
    this.id_modalidad_entrega = event.target.value;
  }

  enviarPedido() {
    if (!this.dni_cliente || !this.nombre_cliente) return;
    this.cargando = true;
  
    const clientePayload = {
      dni_cliente: this.dni_cliente,
      nombre_cliente: this.nombre_cliente,
      telefono_cliente: this.telefono_cliente,
      direccion_cliente:
        this.id_modalidad_entrega === '2' ? this.direccion_cliente : ''
    };
  
    // Paso 1: asegurarse de que el cliente existe
    this.clienteService.obtenerOCrearCliente(clientePayload).subscribe({
      next: () => {
        const pedidoPayload = {
          fecha_hora: new Date().toISOString().slice(0, 19).replace('T', ' '),
          monto_total: this.total,
          dni_cliente: this.dni_cliente,
          id_metodo_pago: this.id_metodo_pago,
          id_estado_pedido: 1,
          id_modalidad_entrega: this.id_modalidad_entrega
        };
  
        const detalles = this.items.map(it => ({
          id_producto: it.id_producto,
          cantidad: it.cantidad,
          subtotal: it.subtotal
        }));
  
        this.pedidoService.crearPedido(pedidoPayload, detalles).subscribe({
          next: () => {
            this.cargando = false;
            Swal.fire({
              icon: 'success',
              title: 'Pedido realizado',
              text: 'Muchas gracias',
              timer: 2000,
              showConfirmButton: false
            });
            this.pedidoRealizado.emit();
          },
          error: (error) => {
            this.cargando = false;
            console.error('Error al crear pedido:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo crear el pedido'
            });
          }
        });
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error al crear cliente:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo registrar o buscar el cliente'
        });
      }
    });
  }
}  
