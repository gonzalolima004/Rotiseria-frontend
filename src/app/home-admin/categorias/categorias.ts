import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Categoria } from '../../models/categoria.model';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css']
})
export class CategoriasComponent {

  @Input() categorias: Categoria[] = [];
  @Output() editar = new EventEmitter<Categoria>();
  @Output() eliminar = new EventEmitter<Categoria>();

  @ViewChild('strip') stripRef!: ElementRef<HTMLDivElement>;

  // scroll simple
  scrollLeft()  { this.stripRef.nativeElement.scrollLeft -= 250; }
  scrollRight() { this.stripRef.nativeElement.scrollLeft += 250; }

 
  getImagen(cat: Categoria): string {
    return `assets/categorias/${cat.nombre_categoria}.png`;
  }
}
