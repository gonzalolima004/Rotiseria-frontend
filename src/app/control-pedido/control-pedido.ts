import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HeaderAdminComponent } from '../header-admin/header-admin';
import Swal from 'sweetalert2';

interface Cliente {
  dni_cliente: string;
  nombre_cliente: string;
  telefono_cliente: string;
  direccion_cliente: string;
}

interface DetallePedido {
  id_producto: number | null;
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

interface Venta {
  fecha: string;
  monto_venta: number;
  id_pedido: number;
}

@Component({
  selector: 'app-control-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderAdminComponent],
  templateUrl: './control-pedido.html',
  styleUrls: ['./control-pedido.css']
})
export class ControlPedidoComponent implements OnInit {

  pedidos = signal<Pedido[]>([]);
  pedidosFiltrados = signal<Pedido[]>([]);
  productos = signal<Producto[]>([]);
  cargando = signal(true);
  paginaActual = signal(0);
  pedidosPorPagina = 10;

  private apiUrl = 'http://localhost:8000/api/pedidos';
  private productosUrl = 'http://localhost:8000/api/productos';
  private ventasUrl = 'http://localhost:8000/api/ventas';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
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

    const headers = this.getAuthHeaders();

    this.http.get<Pedido[]>(this.apiUrl, { headers }).subscribe({
      next: (data) => {

        const pedidosVisibles = data.filter(
          pedido => pedido.estado.nombre_estado_pedido === 'Confirmado'
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

  obtenerNombreProducto(id: number | null): string {
    if (id === null || id === undefined) {
      return 'Producto eliminado';
    }
    
    const prod = this.productos().find(p => p.id_producto === id);
    return prod ? prod.nombre_producto : 'Producto eliminado';
  }

  completarPedido(pedido: Pedido): void {
    if (pedido.estado.nombre_estado_pedido !== 'Confirmado') return;

    const headers = this.getAuthHeaders();

    const ventaData: Venta = {
      fecha: new Date().toISOString().split('T')[0],
      monto_venta: pedido.monto_total,
      id_pedido: pedido.id_pedido
    };

    this.http.post(this.ventasUrl, ventaData, { headers }).subscribe({
      next: () => {
        this.http.put(`${this.apiUrl}/${pedido.id_pedido}`, {
          id_estado_pedido: 4 
        }, { headers }).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Venta registrada',
              text: `El pedido #${pedido.id_pedido} fue entregado y la venta fue creada exitosamente.`,
              confirmButtonColor: '#4CAF50',
              timer: 4000,
              timerProgressBar: true
            }).then(() => {
              window.location.reload();
            });
          },
          error: (err) => {
            console.error('Error al actualizar el estado del pedido:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'La venta fue creada pero hubo un error al actualizar el pedido.',
              confirmButtonColor: '#d33',
              timer: 3000,
              timerProgressBar: true
            }).then(() => {
              window.location.reload();
            });
          }
        });
      },
      error: (err) => {
        console.error('Error al crear la venta:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo crear la venta. Por favor, intenta nuevamente.',
          confirmButtonColor: '#d33',
          timer: 3000,
          timerProgressBar: true
        }).then(() => {
          window.location.reload();
        });
      }
    });
  }

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

        const headers = this.getAuthHeaders();

        this.http.put(`${this.apiUrl}/${pedido.id_pedido}`, {
          id_estado_pedido: 3
        }, { headers }).subscribe({
          next: () => {
            this.http.delete(`${this.apiUrl}/${pedido.id_pedido}`, { headers }).subscribe({
              next: () => {
                Swal.fire({
                  icon: 'success',
                  title: 'Pedido rechazado',
                  text: `El pedido #${pedido.id_pedido} fue eliminado correctamente.`,
                  confirmButtonColor: '#d33',
                  timer: 2000,
                  timerProgressBar: true
                }).then(() => {
                  window.location.reload();
                });
              },
              error: () => {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'No se pudo eliminar el pedido.',
                  confirmButtonColor: '#d33',
                  timer: 3000,
                  timerProgressBar: true
                }).then(() => {
                  window.location.reload();
                });
              }
            });
          },
          error: (err) => {
            console.error('Error al rechazar pedido:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo rechazar el pedido.',
              confirmButtonColor: '#d33',
              timer: 3000,
              timerProgressBar: true
            }).then(() => {
              window.location.reload();
            });
          }
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

  getEstadoClase(estado: string): string {
    const clases: { [key: string]: string } = {
      'Confirmado': 'estado-confirmado',
      'Entregado': 'estado-completado',
      'Rechazado': 'estado-rechazado'
    };
    return clases[estado] || 'estado-default';
  }
}