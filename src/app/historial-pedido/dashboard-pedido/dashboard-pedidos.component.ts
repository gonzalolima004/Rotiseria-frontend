import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  selector: 'app-dashboard-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-pedidos.component.html',
  styleUrls: ['./dashboard-pedidos.component.css']
})
export class DashboardPedidosComponent {
  @Input() pedidos: Pedido[] = [];
  @Output() cerrar = new EventEmitter<void>();
  @Output() filtrosAplicados = new EventEmitter<Pedido[]>();

  fechaDesde = signal('');
  fechaHasta = signal('');
  pedidosFiltrados = signal<Pedido[]>([]);

  ngOnInit() {
    this.pedidosFiltrados.set(this.pedidos);
  }

  ngOnChanges() {
    if (!this.fechaDesde() && !this.fechaHasta()) {
      this.pedidosFiltrados.set(this.pedidos);
    }
  }

  /** 📊 ESTADÍSTICAS COMPUTADAS */
  estadisticas = computed(() => {
    const pedidos = this.pedidosFiltrados();
    
    return {
      totalPedidos: pedidos.length,
      montoTotal: pedidos.reduce((sum, p) => sum + p.monto_total, 0),
      promedioVenta: pedidos.length > 0 
        ? pedidos.reduce((sum, p) => sum + p.monto_total, 0) / pedidos.length 
        : 0,
      porEstado: this.contarPorEstado(pedidos)
    };
  });

  private contarPorEstado(pedidos: Pedido[]): {[key: string]: number} {
    return pedidos.reduce((acc, p) => {
      const estado = p.estado.nombre_estado_pedido;
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {} as {[key: string]: number});
  }

  /** 🔍 APLICAR FILTRO POR FECHA */
  aplicarFiltro() {
    const desde = this.fechaDesde() ? new Date(this.fechaDesde()) : null;
    const hasta = this.fechaHasta() ? new Date(this.fechaHasta()) : null;

    if (!desde && !hasta) {
      alert('Por favor selecciona al menos una fecha');
      return;
    }

    const filtrados = this.pedidos.filter(p => {
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
    this.filtrosAplicados.emit(filtrados);
  }

  /** 🔄 LIMPIAR FILTROS */
  limpiarFiltros() {
    this.fechaDesde.set('');
    this.fechaHasta.set('');
    this.pedidosFiltrados.set(this.pedidos);
    this.filtrosAplicados.emit(this.pedidos);
  }

  /** ❌ CERRAR MODAL */
  cerrarModal() {
    this.cerrar.emit();
  }

  /** 🎨 Obtener clase CSS según estado */
  getEstadoClase(estado: string): string {
    const clases: {[key: string]: string} = {
      'Confirmado': 'estado-confirmado',
      'Completado': 'estado-completado',
      'Rechazado': 'estado-rechazado'
    };
    return clases[estado] || 'estado-default';
  }

  /** 🔹 Obtener keys de objeto */
  Object = Object;
}