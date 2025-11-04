import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriaService } from '../../services/categoria.service';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './categoria-list.component.html',
  styleUrls: ['./categoria-list.component.css']
})
export class CategoriaListComponent implements OnInit {
  categorias: any[] = [];
  cargando = false;

  constructor(
    private categoriaService: CategoriaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.obtenerCategorias();
  }

  obtenerCategorias(): void {
    this.cargando = true;
    this.categoriaService.obtenerCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al obtener categorías:', err);
        this.cargando = false;
      }
    });
  }

  editarCategoria(id: number): void {
    this.router.navigate(['/categorias/editar', id]);
  }

  eliminarCategoria(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      this.categoriaService.eliminarCategoria(id).subscribe({
        next: () => {
          this.categorias = this.categorias.filter(c => c.id_categoria !== id);
          alert('Categoría eliminada correctamente');
        },
        error: (err) => {
          console.error('Error al eliminar categoría:', err);
        }
      });
    }
  }
}
