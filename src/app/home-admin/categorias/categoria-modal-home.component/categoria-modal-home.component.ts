import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Categoria } from '../../../models/categoria.model';

@Component({
  standalone: true,
  selector: 'app-categoria-modal-home',
  templateUrl: './categoria-modal-home.component.html',
  styleUrls: ['./categoria-modal-home.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class CategoriaModalHomeComponent implements OnInit {
  @Input() modo: 'crear' | 'editar' = 'crear';
  @Input() categoria: Categoria | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<FormData>();

  formulario!: FormGroup;
  imagen: File | null = null;
  preview: string | ArrayBuffer | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.formulario = this.fb.group({
      nombre_categoria: [
        this.categoria?.nombre_categoria || '',
        Validators.required,
      ],
    });
  }

  onClose(): void {
    this.close.emit();
  }

  seleccionarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.imagen = file;

    const lector = new FileReader();
    lector.onload = () => (this.preview = lector.result);
    lector.readAsDataURL(file);
  }

  guardar(): void {
    if (this.formulario.invalid) return;

    const formData = new FormData();
    formData.append(
      'nombre_categoria',
      this.formulario.get('nombre_categoria')?.value
    );

    if (this.imagen) formData.append('imagen', this.imagen);
    if (this.categoria?.id_categoria) {
      formData.append('id_categoria', this.categoria.id_categoria.toString());
    }

    this.save.emit(formData);
  }
}
