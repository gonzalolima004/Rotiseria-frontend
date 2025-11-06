import { Component } from '@angular/core';
import { ProductosListaAdminComponent } from './productos-lista-admin/productos-lista-admin.component';

@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [ProductosListaAdminComponent],
  template: `<app-productos-lista-admin></app-productos-lista-admin>`
})
export class HomeAdminComponent {}
