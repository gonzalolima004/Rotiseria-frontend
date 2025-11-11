import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoriaService } from '../../../services/categoria.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-categoria-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categoria-form-modal.html',
  styleUrls: ['./categoria-form-modal.css']
})
export class CategoriaFormModal implements OnInit, OnChanges {

  @Input() modoEdicion = false;
  @Input() categoriaId: number | null = null;
  @Output() cerrar = new EventEmitter<string>();

  categoriaForm: FormGroup;
  imagenSeleccionada: File | null = null;
  preview: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService
  ) {
    this.categoriaForm = this.fb.group({
      nombre_categoria: ['', Validators.required],
    });
  }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoriaId'] && this.modoEdicion && this.categoriaId) {
      this.categoriaService.obtenerCategoria(this.categoriaId).subscribe((cat: any) => {

        console.log("CATEGORIA RECIBIDA:", cat);
        const data = cat.categoria;

        this.categoriaForm.patchValue({
          nombre_categoria: data.nombre_categoria
        });

        if (data.imagen) {
          this.preview = 'http://localhost:8000/storage/' + data.imagen;
        }
      });
    }
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
    if (this.categoriaForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Completa el nombre',
        text: 'El campo nombre es obligatorio.',
        confirmButtonColor: '#FFCA2B'
      });
      return;
    }

    const formData = new FormData();
    formData.append('nombre_categoria', this.categoriaForm.get('nombre_categoria')?.value);

    if (this.imagenSeleccionada) {
      formData.append('imagen', this.imagenSeleccionada);
    }

    const req = (this.modoEdicion && this.categoriaId)
      ? this.categoriaService.actualizarCategoria(this.categoriaId, formData)
      : this.categoriaService.crearCategoria(formData);

    req.subscribe(() => {

        Swal.fire({
        icon: 'success',
        title: this.modoEdicion ? 'Categoría actualizada' : 'Categoría creada',
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        this.cerrar.emit('ok'); 
      });
    });
  }
  
  cerrarModal(): void {
    this.cerrar.emit('ok');
  }

}


