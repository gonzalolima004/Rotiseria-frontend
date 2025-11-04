import { Component, OnInit } from '@angular/core';
import { PedidoService } from '../../services/pedido-pendiente.service';
import { CommonModule } from '@angular/common';

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

  constructor(private pedidoService: PedidoService) {}

  ngOnInit(): void {
    this.obtenerPedidos();
  }

  obtenerPedidos(): void {
    this.pedidoService.getPedidos().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al obtener pedidos', err);
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
