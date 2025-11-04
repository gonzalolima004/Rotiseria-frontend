import { Component, OnInit } from '@angular/core';
import { Categoria } from '../../models/categoria.model';
import { CategoriaService } from '../services/categoria.service';

type ModoModal = 'crear' | 'editar';

@Component({
  selector: 'app-home-admin',
  standalone: true,
  templateUrl: './home-admin.component.html',
  styleUrls: ['./home-admin.component.css']
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
      next: (data) => { this.categorias = data; this.cargando = false; },
      error: () => { this.cargando = false; }
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

 onSave(formData: FormData) {
  if (this.modoModal === 'crear') {
    this.categoriasSvc.crearCategoria(formData).subscribe(() => {
      this.showModal = false;
      this.loadCategorias();
    });
  } else {
    this.categoriasSvc.actualizarCategoria(this.categoriaSeleccionada!.id_categoria, formData).subscribe(() => {
      this.showModal = false;
      this.loadCategorias();
    });
  }
}

  onDelete(cat: Categoria): void {
    if (!confirm(`¿Eliminar la categoría "${cat.nombre_categoria}"?`)) return;
    this.categoriasSvc.delete(cat.id_categoria).subscribe({
      next: () => this.loadCategorias()
    });
  }

}
