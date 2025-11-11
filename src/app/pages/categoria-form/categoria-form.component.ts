import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CategoriaService } from '../../services/categoria.service';

@Component({
  selector: 'app-categoria-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './categoria-form.component.html',
  styleUrls: ['./categoria-form.component.css']
})
export class CategoriaFormComponent {
  categoriaForm: FormGroup;
  imagenSeleccionada: File | null = null;
  preview: string | ArrayBuffer | null = null;
  modoEdicion = false;
  categoriaId?: number;

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService
  ) {
    this.categoriaForm = this.fb.group({
      nombre_categoria: ['', Validators.required],
    });
  }
  //guardar imagen 
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imagenSeleccionada = file;
      const reader = new FileReader();
      reader.onload = () => (this.preview = reader.result);
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    const formData = new FormData();
    formData.append('nombre_categoria', this.categoriaForm.get('nombre_categoria')?.value);

    if (this.imagenSeleccionada) {
      formData.append('imagen', this.imagenSeleccionada);
    }

    if (this.modoEdicion && this.categoriaId) {
      this.categoriaService.actualizarCategoria(this.categoriaId, formData).subscribe(() => {
        alert('Categoría actualizada correctamente');
        this.resetForm();
      });
    } else {
      this.categoriaService.crearCategoria(formData).subscribe(() => {
        alert('Categoría creada correctamente');
        this.resetForm();
      });
    }
  }

  resetForm(): void {
    this.categoriaForm.reset();
    this.imagenSeleccionada = null;
    this.preview = null;
  }
}
