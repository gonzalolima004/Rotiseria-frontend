import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../header/header';
import { AdminService } from '../services/admin-service';
import { Categoria } from '../models/categoria.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [CommonModule, Header, FormsModule],
  templateUrl: './home-admin.html',
  styleUrls: ['./home-admin.css']
})
export class HomeAdmin implements OnInit {
  categorias: Categoria[] = [];
  mostrarModal = false;
  esEdicion = false;
  categoriaActual: any = { id_categoria: null, nombre_categoria: '' };

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.obtenerCategorias();
  }

  obtenerCategorias(): void {
    this.adminService.obtenerCategorias().subscribe(
      (data) => {
        this.categorias = data;
      },
      (error) => {
        console.error('Error al obtener categorías:', error);
      }
    );
  }

  abrirModalCrear(): void {
    this.mostrarModal = true;
    this.esEdicion = false;
    this.categoriaActual = { id_categoria: null, nombre_categoria: '' };
  }

  abrirModalEditar(categoria: Categoria): void {
    this.mostrarModal = true;
    this.esEdicion = true;
    this.categoriaActual = { ...categoria };
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardarCategoria(): void {
    const formData = new FormData();
    formData.append('nombre_categoria', this.categoriaActual.nombre_categoria);

    if (this.esEdicion) {
      this.adminService.actualizarCategoria(this.categoriaActual.id_categoria, formData).subscribe(() => {
        this.obtenerCategorias();
        this.cerrarModal();
      });
    } else {
      this.adminService.crearCategoria(formData).subscribe(() => {
        this.obtenerCategorias();
        this.cerrarModal();
      });
    }
  }

  eliminarCategoria(id: number): void {
    if (confirm('¿Seguro que deseas eliminar esta categoría?')) {
      this.adminService.eliminarCategoria(id).subscribe(() => {
        this.obtenerCategorias();
      });
    }
  }

  moverCarrusel(direccion: 'izquierda' | 'derecha') {
    const carrusel = document.querySelector('.carrusel');
    if (!carrusel) return;
    const scrollAmount = 200;
    carrusel.scrollBy({
      left: direccion === 'izquierda' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }
}
