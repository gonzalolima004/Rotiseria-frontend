import { Routes } from '@angular/router';

// 🧩 Componentes
import { Login } from './login/login';
import { HomeUsuariosComponent } from './home-usuarios/home-usuarios.component';
import { HomeAdmin } from './home-admin/home-admin';
import { ProductoFormComponent } from './pages/producto-form/producto-form.component';
import { ListaProductosComponent } from './pages/lista-productos/lista-productos.component';
import { CategoriaFormComponent } from './pages/categoria-form/categoria-form.component';
import { CategoriaListComponent } from './pages/categoria-list/categoria-list.component';
import { PedidosPendientesComponent } from './pages/pedidos-pendientes/pedidos-pendientes.component';

// 🧠 Guard
import { AuthGuard } from './services/auth-guard';

export const routes: Routes = [
  // Página principal para usuarios comunes
  { path: '', component: HomeUsuariosComponent },

  // Página de login (sin protección)
  { path: 'ingresar', component: Login },

  // Panel admin y secciones protegidas
  { path: 'admin', component: HomeAdmin, canActivate: [AuthGuard] },
  { path: 'productos', component: ProductoFormComponent, canActivate: [AuthGuard] },
  { path: 'lista-productos', component: ListaProductosComponent, canActivate: [AuthGuard] },
  { path: 'categorias', component: CategoriaFormComponent, canActivate: [AuthGuard] },
  { path: 'lista-categorias', component: CategoriaListComponent, canActivate: [AuthGuard] },
  { path: 'pedidos', component: PedidosPendientesComponent, canActivate: [AuthGuard] }, 

  // Redirección por defecto (404)
  { path: '**', redirectTo: '' },
];
