import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Categoria } from '../models/categoria.model';
import { CategoriaService } from '../services/categoria.service';
import { Header } from '../header/header';
import { CategoriasComponent } from './categorias/categorias';
import { CategoriaModalHomeComponent } from './categorias/categoria-modal-home.component/categoria-modal-home.component';

type ModoModal = 'crear' | 'editar';

@Component({
  standalone: true,
  selector: 'app-home-admin',
  templateUrl: './home-admin.component.html',
  styleUrls: ['./home-admin.component.css'],
  imports: [
    CommonModule,
    Header,
    CategoriasComponent,
    CategoriaModalHomeComponent,
  ],
})
export class HomeAdminComponent implements OnInit {
  categorias: Categoria[] = [];
  cargando = false;

  showModal = false;
  modoModal: ModoModal = 'crear';
  categoriaSeleccionada: Categoria | null = null;

  constructor(private categoriasSvc: CategoriaService) {}

  ngOnInit(): void {
    this.loadCategorias();
  }

  loadCategorias(): void {
    this.cargando = true;
    this.categoriasSvc.obtenerCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      },
    });
  }

  openAdd(): void {
    this.modoModal = 'crear';
    this.categoriaSeleccionada = null;
    this.showModal = true;
  }

  openEdit(cat: Categoria): void {
    this.modoModal = 'editar';
    this.categoriaSeleccionada = { ...cat };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSave(formData: FormData): void {
    if (this.modoModal === 'crear') {
      this.categoriasSvc.crearCategoria(formData).subscribe(() => {
        this.showModal = false;
        this.loadCategorias();
      });
    } else if (this.categoriaSeleccionada) {
      this.categoriasSvc
        .actualizarCategoria(this.categoriaSeleccionada.id_categoria, formData)
        .subscribe(() => {
          this.showModal = false;
          this.loadCategorias();
        });
    }
  }

  onDelete(cat: Categoria): void {
    if (!confirm(`¿Eliminar la categoría "${cat.nombre_categoria}"?`)) return;
    this.categoriasSvc.eliminarCategoria(cat.id_categoria).subscribe({
      next: () => this.loadCategorias(),
      error: (err) => console.error('Error al eliminar categoría:', err),
    });
  }
}
