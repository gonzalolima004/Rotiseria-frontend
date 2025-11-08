import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/producto.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-producto-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './producto-form-modal.component.html',
  styleUrls: ['./producto-form-modal.component.css']
})
export class ProductoFormModal implements OnInit, OnChanges {
  @Input() modoEdicion = false;
  @Input() productoId: number | null = null;
  @Output() cerrar = new EventEmitter<string>();

  productoForm: FormGroup;
  imagenSeleccionada: File | null = null;
  preview: string | ArrayBuffer | null = null;
  categorias: any[] = [];

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService
  ) {
    this.productoForm = this.fb.group({
      nombre_producto: ['', Validators.required],
      descripcion_producto: [''],
      precio_producto: ['', [Validators.required, Validators.min(0)]],
      id_categoria: ['', Validators.required],
      disponible: [true]
    });
  }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productoId'] && this.modoEdicion && this.productoId) {
      this.productoService.obtenerProducto(this.productoId).subscribe((response: any) => {
        console.log("PRODUCTO RECIBIDO:", response);
        const data = response.producto;
        this.productoForm.patchValue({
          nombre_producto: data.nombre_producto,
          descripcion_producto: data.descripcion_producto,
          precio_producto: data.precio_producto,
          id_categoria: data.id_categoria,
          disponible: data.disponible === 1
        });
        if (data.imagen) {
          this.preview = 'http://localhost:8000/storage/' + data.imagen;
        }
      });
    }
  }

  cargarCategorias() {
    this.productoService.obtenerCategorias().subscribe({
      next: (data) => (this.categorias = data),
      error: (err) => console.error('Error al cargar categorías', err)
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
    if (this.productoForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Completa los campos requeridos',
        text: 'El nombre, precio y categoría son obligatorios.',
        confirmButtonColor: '#FFCA2B'
      });
      return;
    }

    const formData = new FormData();

    // ✅ Aplicando la lógica del modal funcional
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

    const req = (this.modoEdicion && this.productoId)
      ? this.productoService.actualizarProducto(this.productoId, formData)
      : this.productoService.crearProducto(formData);

    req.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: this.modoEdicion ? 'Producto actualizado' : 'Producto creado',
          showConfirmButton: false,
          timer: 1500
        });
        this.cerrar.emit('ok');
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error.message || 'Ocurrió un error al guardar el producto',
          confirmButtonColor: '#FFCA2B'
        });
      }
    });
  }

  cerrarModal(): void {
    this.cerrar.emit('ok');
  }
}