import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Header } from '../header/header';
import { DashboardPedidosComponent } from './dashboard-pedido/dashboard-pedidos.component';
import Swal from 'sweetalert2';

interface Cliente {
  dni_cliente: string;
  nombre_cliente: string;
  telefono_cliente: string;
  direccion_cliente: string;
}

interface DetallePedido {
  id_producto: number;
  cantidad: number;
  subtotal: number;
  nombre_producto?: string;
}

interface Estado {
  nombre_estado_pedido: string;
}

interface Pedido {
  id_pedido: number;
  fecha_hora: string;
  monto_total: number;
  cliente: Cliente;
  estado: Estado;
  detalles: DetallePedido[];
}

interface Producto {
  id_producto: number;
  nombre_producto: string;
}

@Component({
  selector: 'app-historial-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, DashboardPedidosComponent],
  templateUrl: './historial-pedido.html',
  styleUrls: ['./historial-pedido.css']
})
export class HistorialPedidoComponent implements OnInit {

  pedidos = signal<Pedido[]>([]);
  pedidosFiltrados = signal<Pedido[]>([]);
  productos = signal<Producto[]>([]);
  cargando = signal(true);
  paginaActual = signal(0);
  pedidosPorPagina = 10;

  modalDashboardVisible = signal(false);

  private apiUrl = 'http://localhost:8000/api/pedidos';
  private productosUrl = 'http://localhost:8000/api/productos';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.http.get<Producto[]>(this.productosUrl).subscribe({
      next: (productos) => {
        this.productos.set(productos);
        this.obtenerPedidos();
      },
      error: () => this.obtenerPedidos()
    });
  }

  obtenerPedidos(): void {
    this.cargando.set(true);

    this.http.get<Pedido[]>(this.apiUrl).subscribe({
      next: (data) => {

        const pedidosVisibles = data.filter(
          pedido =>
            pedido.estado.nombre_estado_pedido === 'Confirmado' ||
            pedido.estado.nombre_estado_pedido === 'Entregado'
        );

        const pedidosConNombres = pedidosVisibles.map(pedido => ({
          ...pedido,
          detalles: pedido.detalles.map(detalle => ({
            ...detalle,
            nombre_producto: this.obtenerNombreProducto(detalle.id_producto)
          }))
        }));

        this.pedidos.set(pedidosConNombres);
        this.pedidosFiltrados.set(pedidosConNombres);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar pedidos:', err);
        this.cargando.set(false);
      }
    });
  }

  obtenerNombreProducto(id: number): string {
    const prod = this.productos().find(p => p.id_producto === id);
    return prod ? prod.nombre_producto : `Producto #${id}`;
  }

  /** ✅ Confirmado → ENTREGADO */
  completarPedido(pedido: Pedido): void {
    if (pedido.estado.nombre_estado_pedido !== 'Confirmado') return;

    this.http.put(`${this.apiUrl}/${pedido.id_pedido}`, {
      id_estado_pedido: 4 // ENTREGADO
    }).subscribe({
      next: () => {

        Swal.fire({
          icon: 'success',
          title: 'Pedido entregado',
          text: `El pedido #${pedido.id_pedido} fue marcado como entregado.`,
          confirmButtonColor: '#4CAF50'
        });

        this.obtenerPedidos();
      },
      error: (err) => console.error('Error al entregar pedido:', err)
    });
  }

  /** ✅ Rechazar + SweetAlert */
  rechazarPedido(pedido: Pedido): void {
    if (pedido.estado.nombre_estado_pedido !== 'Confirmado') return;

    Swal.fire({
      title: `¿Rechazar pedido #${pedido.id_pedido}?`,
      text: 'Esta acción eliminará el pedido de forma permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {

      if (result.isConfirmed) {

        // Cambiar estado a rechazado
        this.http.put(`${this.apiUrl}/${pedido.id_pedido}`, {
          id_estado_pedido: 3 // RECHAZADO
        }).subscribe({
          next: () => {
            // Luego eliminarlo
            this.http.delete(`${this.apiUrl}/${pedido.id_pedido}`).subscribe({
              next: () => {
                Swal.fire({
                  icon: 'success',
                  title: 'Pedido rechazado',
                  text: `El pedido #${pedido.id_pedido} fue eliminado correctamente.`,
                  confirmButtonColor: '#d33'
                });

                this.obtenerPedidos();
              },
              error: () => this.obtenerPedidos()
            });
          },
          error: (err) => console.error('Error al rechazar pedido:', err)
        });

      }

    });
  }

  formatearFecha(f: string): string {
    return new Date(f).toLocaleString('es-AR');
  }

  pedidosPaginados = computed(() => {
    const start = this.paginaActual() * this.pedidosPorPagina;
    return this.pedidosFiltrados().slice(start, start + this.pedidosPorPagina);
  });

  siguientePagina() {
    if ((this.paginaActual() + 1) * this.pedidosPorPagina < this.pedidosFiltrados().length) {
      this.paginaActual.update(v => v + 1);
    }
  }

  anteriorPagina() {
    if (this.paginaActual() > 0) {
      this.paginaActual.update(v => v - 1);
    }
  }

  abrirDashboard() {
    this.modalDashboardVisible.set(true);
  }

  cerrarDashboard() {
    this.modalDashboardVisible.set(false);
  }

  aplicarFiltrosDesdeModal(pedidosFiltrados: Pedido[]) {
    const visibles = pedidosFiltrados.filter(
      pedido =>
        pedido.estado.nombre_estado_pedido === 'Confirmado' ||
        pedido.estado.nombre_estado_pedido === 'Entregado'
    );
    this.pedidosFiltrados.set(visibles);
    this.paginaActual.set(0);
  }

  getEstadoClase(estado: string): string {
    const clases: { [key: string]: string } = {
      'Confirmado': 'estado-confirmado',
      'Entregado': 'estado-completado',
      'Rechazado': 'estado-rechazado'
    };
    return clases[estado] || 'estado-default';
  }
}
