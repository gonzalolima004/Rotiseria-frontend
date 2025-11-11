import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './producto-form.component.html',
  styleUrls: ['./producto-form.component.css']
})
export class ProductoFormComponent {
  productoForm: FormGroup;
  imagenSeleccionada: File | null = null;
  preview: string | ArrayBuffer | null = null;
  modoEdicion = false;
  productoId?: number;

  constructor(private fb: FormBuilder, private productoService: ProductoService) {
    this.productoForm = this.fb.group({
      nombre_producto: ['', Validators.required],
      descripcion_producto: [''],
      precio_producto: [null, [Validators.required, Validators.min(0)]],
      disponible: [true],
      id_categoria: [null, Validators.required]
    });
  }

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

  Object.keys(this.productoForm.controls).forEach(key => {
    const value = this.productoForm.get(key)?.value;

    if (value !== null && value !== undefined) {
      if (typeof value === 'boolean') {
        formData.append(key, value ? '1' : '0');
      } else {
        formData.append(key, value);
      }
    }
  });

  if (this.imagenSeleccionada) {
    formData.append('imagen', this.imagenSeleccionada);
  }

  if (this.modoEdicion && this.productoId) {
    this.productoService.actualizarProducto(this.productoId, formData).subscribe(() => {
      alert('Producto actualizado correctamente');
      this.resetForm();
    });
  } else {
    this.productoService.crearProducto(formData).subscribe(() => {
      alert('Producto creado correctamente');
      this.resetForm();
    });
  }
}


  resetForm(): void {
    this.productoForm.reset({
      disponible: true
    });
    this.imagenSeleccionada = null;
    this.preview = null;
  }
}
