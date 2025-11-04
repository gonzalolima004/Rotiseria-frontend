import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { PedidoService } from '../../services/pedido-pendiente.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

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
  isBrowser = false;

  constructor(
    private pedidoService: PedidoService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // 👈 inyectamos el id de la plataforma
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return; // 👈 evita usar localStorage en SSR

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ No hay token, redirigiendo al login...');
      this.router.navigate(['/login']);
      return;
    }
    this.obtenerPedidos();
  }

obtenerPedidos(): void {
  this.pedidoService.getPedidos().subscribe({
    next: (data) => {
      // 🔹 Filtrar pedidos pendientes
      this.pedidos = data.filter(
        (p) => p.estado?.nombre_estado_pedido === 'Pendiente'
      );
      this.cargando = false;
    },
    error: (err) => {
      console.error('❌ Error al obtener pedidos', err);
      this.cargando = false;
    }
  });
}


  cambiarEstado(pedidoId: number, nuevoEstado: number): void {
    this.pedidoService.actualizarEstado(pedidoId, nuevoEstado).subscribe({
      next: () => {
        alert('Estado actualizado correctamente');
        this.obtenerPedidos();
      },
      error: (err) => console.error('Error al actualizar estado', err)
    });
  }
}
