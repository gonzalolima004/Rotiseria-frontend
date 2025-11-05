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
  ) { }

  cerrarModal() {
    this.cerrar.emit();
  }

  buscarClientePorDni() {
    if (this.dni_cliente.trim().length === 8) {
      this.clienteService.obtenerClientePorDni(this.dni_cliente).subscribe({
        next: (res) => {
          if (res && res.cliente) {
            const cliente = res.cliente;
            this.nombre_cliente = cliente.nombre_cliente;
            this.telefono_cliente = cliente.telefono_cliente;
            this.direccion_cliente = cliente.direccion_cliente;

            Swal.fire({
              icon: 'info',
              title: 'Cliente encontrado',
              text: 'Los datos se completaron automáticamente.',
              timer: 1500,
              showConfirmButton: false
            });
          }
        },
        error: () => {
          console.log('Cliente no encontrado, se completará manualmente.');
        }
      });
    }
  }

  enviarPedido() {
    // 🔹 VALIDACIONES DE CAMPOS
    if (!this.dni_cliente.trim() || !this.nombre_cliente.trim() || !this.telefono_cliente.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completá todos los campos antes de continuar.',
        confirmButtonColor: '#CAA021'
      });
      return;
    }

    if (!this.id_modalidad_entrega) {
      Swal.fire({
        icon: 'warning',
        title: 'Modalidad de entrega',
        text: 'Debes seleccionar una modalidad de entrega antes de continuar.',
        confirmButtonColor: '#CAA021'
      });
      return;
    }

    if (this.id_modalidad_entrega === '2' && !this.direccion_cliente.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Dirección requerida',
        text: 'Por favor ingresá una dirección para el envío a domicilio.',
        confirmButtonColor: '#CAA021'
      });
      return;
    }

    if (!this.id_metodo_pago) {
      Swal.fire({
        icon: 'warning',
        title: 'Método de pago',
        text: 'Seleccioná una forma de pago para continuar.',
        confirmButtonColor: '#CAA021'
      });
      return;
    }

    if (!this.items || this.items.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin productos',
        text: 'No se puede realizar un pedido sin productos seleccionados.',
        confirmButtonColor: '#CAA021'
      });
      return;
    }

    // 🔹 CONTINÚA SI TODO ESTÁ COMPLETO
    this.cargando = true;

    const clientePayload = {
      dni_cliente: this.dni_cliente,
      nombre_cliente: this.nombre_cliente,
      telefono_cliente: this.telefono_cliente,
      direccion_cliente:
        this.id_modalidad_entrega == '2' ? this.direccion_cliente : ''
    };

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
              title: '¡Pedido realizado!',
              text: 'Te avisaremos por WhatsApp cuando esté próximo a prepararse',
              showCloseButton: true,
              confirmButtonText: 'Realizar otro pedido',
              confirmButtonColor: '#CAA021',
              allowOutsideClick: false,
              allowEscapeKey: false
            }).then(() => {
              this.pedidoRealizado.emit();
              window.location.reload();
            });


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
        console.error('❌ Error al crear cliente:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo registrar o buscar el cliente'
        });
      }
    });
  }
}
