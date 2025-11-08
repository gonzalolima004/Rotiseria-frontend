import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Header } from '../header/header';
import { DashboardPedidosComponent } from './dashboard-pedido/dashboard-pedidos.component';

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
  imports: [CommonModule, FormsModule, Header, DashboardPedidosComponent],
  templateUrl: './historial-pedido.html',
  styleUrls: ['./historial-pedido.css']
})
export class HistorialPedidoComponent implements OnInit {
  pedidos = signal<Pedido[]>([]);
  pedidosFiltrados = signal<Pedido[]>([]);
  cargando = signal(true);
  paginaActual = signal(0);
  pedidosPorPagina = 10;

  // Modal Dashboard
  modalDashboardVisible = signal(false);

  private apiUrl = 'http://localhost:8000/api/pedidos';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.obtenerPedidos();
  }

  /** 🔹 Carga todos los pedidos desde la API y cambia automáticamente Confirmado → Completado */
  obtenerPedidos(): void {
    this.cargando.set(true);
    this.http.get<Pedido[]>(this.apiUrl).subscribe({
      next: (data) => {
        // Cambiar automáticamente los pedidos "Confirmado" a "Completado"
        const pedidosActualizados = data.map(pedido => {
          if (pedido.estado.nombre_estado_pedido === 'Confirmado') {
            // Actualizar en el backend (sin bloquear la UI)
            this.actualizarEstadoEnBackend(pedido.id_pedido);
            
            // Actualizar localmente
            return {
              ...pedido,
              estado: { nombre_estado_pedido: 'Completado' }
            };
          }
          return pedido;
        });

        this.pedidos.set(pedidosActualizados);
        this.pedidosFiltrados.set(pedidosActualizados);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('❌ Error al cargar pedidos:', err);
        this.cargando.set(false);
      }
    });
  }

  /** 🔹 Actualizar estado en el backend (sin esperar respuesta) */
  private actualizarEstadoEnBackend(idPedido: number): void {
    // Intenta con PATCH primero (más común para actualizaciones parciales)
    this.http.patch(`${this.apiUrl}/${idPedido}`, { 
      estado: { nombre_estado_pedido: 'Completado' }
    }).subscribe({
      next: () => console.log(`✅ Pedido #${idPedido} actualizado a Completado en el backend`),
      error: (err) => {
        console.warn(`⚠️ PATCH falló, intentando con PUT para pedido #${idPedido}`);
        
        // Si PATCH falla, intenta con PUT
        this.http.put(`${this.apiUrl}/${idPedido}`, { 
          estado: { nombre_estado_pedido: 'Completado' }
        }).subscribe({
          next: () => console.log(`✅ Pedido #${idPedido} actualizado a Completado (con PUT)`),
          error: (err2) => console.error(`❌ Error actualizando pedido #${idPedido}:`, err2)
        });
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

  /** 🔹 Navegación de páginas */
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

  /** 📊 Abrir/Cerrar Dashboard */
  abrirDashboard() {
    this.modalDashboardVisible.set(true);
  }

  cerrarDashboard() {
    this.modalDashboardVisible.set(false);
  }

  /** 🔹 Aplicar filtros desde el Dashboard */
  aplicarFiltrosDesdeModal(pedidosFiltrados: Pedido[]) {
    this.pedidosFiltrados.set(pedidosFiltrados);
    this.paginaActual.set(0);
  }

  /** 🔹 Obtener clase CSS según estado */
  getEstadoClase(estado: string): string {
    const clases: {[key: string]: string} = {
      'Confirmado': 'estado-confirmado',
      'Completado': 'estado-completado',
      'Rechazado': 'estado-rechazado'
    };
    return clases[estado] || 'estado-default';
  }
}