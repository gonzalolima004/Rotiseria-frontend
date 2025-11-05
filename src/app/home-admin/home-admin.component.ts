import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriaService } from '../services/categoria.service';
import { Header } from '../header/header';
import { CategoriaFormModal } from '../home-admin/categorias/categoria-form-modal/categoria-form-modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [CommonModule, Header, CategoriaFormModal],
  templateUrl: './home-admin.component.html',
  styleUrls: ['./home-admin.component.css']
})

export class HomeAdminComponent implements OnInit {
  @ViewChild('carousel') carousel!: ElementRef;

  categorias: any[] = [];
  mostrarModal = false;
  modoEdicion = false;
  categoriaId: number | null = null;

  constructor(private categoriaService: CategoriaService) { }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.categoriaService.obtenerCategorias().subscribe(res => {
      this.categorias = res;
    });
  }

  scrollLeft() {
    const el = this.carousel?.nativeElement;
    if (el) el.scrollLeft -= 150;
  }

  scrollRight() {
    const el = this.carousel?.nativeElement;
    if (el) el.scrollLeft += 150;
  }

  abrirModalCrear() {
    this.modoEdicion = false;
    this.categoriaId = null;
    this.mostrarModal = true;
  }

  abrirModalEditar(cat: any) {
    this.modoEdicion = true;
    this.categoriaId = cat.id_categoria;
    this.mostrarModal = true;
  }


  cerrarModal(event: any) {
    this.mostrarModal = false;

    if (event === 'ok') {
      this.cargarCategorias();
    }
  }
  eliminarCategoria(id: number) {
    Swal.fire({
      title: '¿Eliminar categoría?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#7C662A',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoriaService.eliminarCategoria(id).subscribe(() => {

          Swal.fire({
            icon: 'success',
            title: 'Categoría eliminada',
            showConfirmButton: false,
            timer: 1500
          });

          this.cargarCategorias();
        });
      }
    });
  }

  //cuando esten las rutas de pedidos y ventas, eliminarlo 
  pendiente(seccion: 'pedidos'|'ventas'){
  Swal.fire({
    icon: 'info',
    title: 'Ruta pendiente',
    text: `La URL de "${seccion}" se definirá más adelante.`,
    confirmButtonColor: '#FFCA2B'
  });
}

}
