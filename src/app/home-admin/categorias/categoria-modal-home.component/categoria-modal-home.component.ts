import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Categoria } from 'src/app/models/categoria.model';

@Component({
  selector: 'app-categoria-modal-home',
  templateUrl: './categoria-modal-home.component.html',
  styleUrls: ['./categoria-modal-home.component.css']
})
export class CategoriaModalHomeComponent implements OnInit {

  @Input() modo: 'crear' | 'editar' = 'crear';
  @Input() categoria: Categoria | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<FormData>();

  categoriaForm!: FormGroup;

  imagenSeleccionada: File | null = null;
  preview: string | ArrayBuffer | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.categoriaForm = this.fb.group({
      nombre_categoria: [this.categoria?.nombre_categoria || '', Validators.required],
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

  submit(): void {
    if (this.categoriaForm.invalid) return;

    const formData = new FormData();
    formData.append('nombre_categoria', this.categoriaForm.get('nombre_categoria')?.value);

    if (this.imagenSeleccionada) {
      formData.append('imagen', this.imagenSeleccionada);
    }

    if (this.categoria?.id_categoria) {
      formData.append('id_categoria', this.categoria.id_categoria.toString());
    }

    this.save.emit(formData);
  }
}
