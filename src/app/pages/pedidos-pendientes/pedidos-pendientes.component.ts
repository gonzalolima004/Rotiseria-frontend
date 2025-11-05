import { Component, OnInit, Inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PedidoService } from '../../services/pedido-pendiente.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pedidos-pendientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedidos-pendientes.component.html',
  styleUrls: ['./pedidos-pendientes.component.css']
})
export class PedidosPendientesComponent implements OnInit {
  pedidos: any[] = [];
  cargando = true;
  cantidadPendientes = signal<number>(0); // ✅ nuevo contador reactivo
  isBrowser = false;

  constructor(
    private pedidoService: PedidoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

ngOnInit(): void {
  if (isPlatformBrowser(this.platformId)) {
    const token = localStorage.getItem('token');
    if (token) {
      this.obtenerPedidos();
    } else {
      console.warn('Esperando token JWT antes de cargar pedidos...');
      
    }
  } else {
    console.warn('SSR activo: no hay localStorage disponible');
  }
}


  // 🔹 Cargar pedidos pendientes
  obtenerPedidos(): void {
    this.cargando = true;
    this.pedidoService.getPedidos().subscribe({
      next: (data) => {
        const pendientes = data.filter(
          (p) => p.estado?.nombre_estado_pedido === 'Pendiente'
        );
        // ✅ Clonamos el array para forzar detección de cambios
        this.pedidos = [...pendientes];
        this.cantidadPendientes.set(this.pedidos.length);
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error al obtener pedidos', err);
        this.cargando = false;
      },
    });
  }

  // ✅ Confirmar pedido (envía mensaje WhatsApp + refresca lista)
  confirmarPedido(pedido: any) {
    Swal.fire({
      title: `Confirmar pedido N°${pedido.id_pedido}`,
      html: `
        <p>Indica en cuántos minutos estará listo el pedido:</p>
        <input type="number" id="minutos" class="swal2-input" min="1" placeholder="Ej: 30">
      `,
      confirmButtonText: 'Confirmar pedido',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
      focusConfirm: false,
      preConfirm: () => {
        const minutos = (document.getElementById('minutos') as HTMLInputElement)?.value;
        if (!minutos || parseInt(minutos) <= 0) {
          Swal.showValidationMessage('Debes ingresar un número válido de minutos');
          return false;
        }
        return parseInt(minutos);
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const tiempo = result.value + ' minutos';
        this.pedidoService
          .actualizarPedido(pedido.id_pedido, {
            id_estado_pedido: 2,
            tiempo_estimado: tiempo,
          })
          .subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: '✅ Pedido confirmado',
                text: 'El cliente ha sido notificado por WhatsApp.',
                timer: 2000,
                showConfirmButton: false,
              });

              // 🔹 Eliminar inmediatamente el pedido confirmado del array
              this.pedidos = this.pedidos.filter(p => p.id_pedido !== pedido.id_pedido);
              this.cantidadPendientes.set(this.pedidos.length);
            },
            error: (err) => {
              console.error('❌ Error al confirmar pedido', err);
              Swal.fire('Error', 'No se pudo confirmar el pedido.', 'error');
            },
          });
      }
    });
  }

  // ❌ Rechazar pedido (refresca automáticamente)
  rechazarPedido(pedido: any) {
    Swal.fire({
      title: `Rechazar pedido N°${pedido.id_pedido}`,
      text: '¿Estás seguro de rechazar este pedido?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.pedidoService
          .actualizarPedido(pedido.id_pedido, { id_estado_pedido: 3 })
          .subscribe({
            next: () => {
              Swal.fire({
                icon: 'info',
                title: '🚫 Pedido rechazado',
                text: 'El pedido fue marcado como rechazado.',
                timer: 2000,
                showConfirmButton: false,
              });

              // 🔹 Eliminar inmediatamente el pedido rechazado del array
              this.pedidos = this.pedidos.filter(p => p.id_pedido !== pedido.id_pedido);
              this.cantidadPendientes.set(this.pedidos.length);
            },
            error: (err) => {
              console.error('❌ Error al rechazar pedido', err);
              Swal.fire('Error', 'No se pudo rechazar el pedido.', 'error');
            },
          });
      }
    });
  }
}
