import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Header } from '../header/header';

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

@Component({
  selector: 'app-historial-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule, Header],
  templateUrl: './historial-pedido.html',
  styleUrls: ['./historial-pedido.css']
})
export class HistorialPedidoComponent implements OnInit {
  pedidos = signal<Pedido[]>([]);
  pedidosFiltrados = signal<Pedido[]>([]);
  cargando = signal(true);

  paginaActual = signal(0);
  pedidosPorPagina = 10;

  // ✅ Ahora modalVisible es una variable normal (no signal)
  modalVisible: boolean = false;

  fechaDesde: string = '';
  fechaHasta: string = '';

  private apiUrl = 'http://localhost:8000/api/pedidos';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.obtenerPedidos();
  }

  /** 🔹 Carga todos los pedidos desde la API */
  obtenerPedidos(): void {
    this.cargando.set(true);
    this.http.get<Pedido[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.pedidos.set(data);
        this.pedidosFiltrados.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('❌ Error al cargar pedidos:', err);
        this.cargando.set(false);
      }
    });
  }

  /** 🔹 Convierte la fecha al formato local */
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-AR');
  }

  /** 🔹 Devuelve los pedidos de la página actual */
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

  /** 🔹 Abre el modal */
  abrirModal() {
    console.log('🟡 Modal abierto');
    this.modalVisible = true;
  }

  /** 🔹 Cierra el modal */
  cerrarModal() {
    console.log('🟡 Modal cerrado');
    this.modalVisible = false;
  }

  /** 🔹 Aplica el filtro por fecha */
  aplicarFiltro() {
    const desde = this.fechaDesde ? new Date(this.fechaDesde) : null;
    const hasta = this.fechaHasta ? new Date(this.fechaHasta) : null;

    const filtrados = this.pedidos().filter(p => {
      const fechaPedido = new Date(p.fecha_hora);
      if (desde && fechaPedido < desde) return false;
      if (hasta) {
        const limite = new Date(hasta);
        limite.setHours(23, 59, 59, 999);
        if (fechaPedido > limite) return false;
      }
      return true;
    });

    this.pedidosFiltrados.set(filtrados);
    this.paginaActual.set(0);
    this.cerrarModal();
  }

  /** 🔹 Devuelve si el modal está visible */
  mostrarModal(): boolean {
    return this.modalVisible;
  }
}
