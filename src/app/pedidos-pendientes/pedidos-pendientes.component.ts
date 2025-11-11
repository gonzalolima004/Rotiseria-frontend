import { Component, OnInit, Inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PedidoService } from '../services/pedido-pendiente.service';
import { HeaderAdminComponent } from '../header-admin/header-admin';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pedidos-pendientes',
  standalone: true,
  imports: [CommonModule, HeaderAdminComponent],
  templateUrl: './pedidos-pendientes.component.html',
  styleUrls: ['./pedidos-pendientes.component.css']
})
export class PedidosPendientesComponent implements OnInit {
  pedidos: any[] = [];
  cargando = true;
  cantidadPendientes = signal<number>(0);
  eliminandoId: number | null = null;
  isBrowser = false;

  constructor(
    private pedidoService: PedidoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      const token = localStorage.getItem('token');
      if (token) this.obtenerPedidos();
    }
  }

  obtenerPedidos(): void {
    this.cargando = true;
    this.pedidoService.getPedidos().subscribe({
      next: (data) => {
        const pendientes = data.filter(
          (p) => p.estado?.nombre_estado_pedido === 'Pendiente'
        );
        this.pedidos = [...pendientes];
        this.cantidadPendientes.set(this.pedidos.length);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al obtener pedidos', err);
        this.cargando = false;
      },
    });
  }

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
                title: 'Pedido confirmado',
                text: 'El cliente ha sido notificado por WhatsApp.',
                timer: 3000,
                showConfirmButton: false,
              });

              this.eliminandoId = pedido.id_pedido;

              setTimeout(() => {
                this.pedidos = this.pedidos.filter(p => p.id_pedido !== pedido.id_pedido);
                this.cantidadPendientes.set(this.pedidos.length);
                this.eliminandoId = null;
              }, 500);
            },
            error: (err) => {
              console.error('Error al confirmar pedido', err);
              Swal.fire('Error', 'No se pudo confirmar el pedido.', 'error');
            },
          });
      }
    });
  }

rechazarPedido(pedido: any) {
  Swal.fire({
    title: `Rechazar pedido N°${pedido.id_pedido}`,
    text: '¿Estás seguro de que deseas eliminar este pedido?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  }).then((result) => {
    if (result.isConfirmed) {
      this.pedidoService.eliminarPedido(pedido.id_pedido).subscribe({
        next: () => {
          Swal.fire({
            icon: 'info',
            title: 'Pedido eliminado',
            text: 'El pedido fue eliminado correctamente.',
            timer: 1500,
            showConfirmButton: false,
          });

          this.eliminandoId = pedido.id_pedido;

          setTimeout(() => {
            this.pedidos = this.pedidos.filter(p => p.id_pedido !== pedido.id_pedido);
            this.cantidadPendientes.set(this.pedidos.length);
            this.eliminandoId = null;
          }, 500);
        },
        error: (err) => {
          console.error('Error al eliminar pedido', err);
          Swal.fire('Error', 'No se pudo eliminar el pedido.', 'error');
        },
      });
    }
  });
}

}
