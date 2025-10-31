import { Routes, provideRouter } from '@angular/router';
import { Login } from './login/login';
import { HomeUsuariosComponent } from './home-usuarios/home-usuarios.component';
import { HomeAdmin } from './home-admin/home-admin';
import { AuthGuard } from './services/auth-guard';
import { ProductoFormComponent } from './pages/producto-form/producto-form.component';
import { ListaProductosComponent } from './pages/lista-productos/lista-productos.component';
import { CategoriaFormComponent } from './pages/categoria-form/categoria-form.component';
import { CategoriaListComponent } from './pages/categoria-list/categoria-list.component';

export const routes: Routes = [
    { path: '', component: HomeUsuariosComponent },
    { path: 'ingresar', component: Login },
    { path: 'admin', component: HomeAdmin, canActivate: [AuthGuard] },
    { path: 'productos', component: ProductoFormComponent, canActivate: [AuthGuard] },
    { path: 'lista-productos', component: ListaProductosComponent, canActivate: [AuthGuard] },
    { path: 'categorias', component: CategoriaFormComponent, canActivate: [AuthGuard] },
    { path: 'lista-categorias', component: CategoriaListComponent, canActivate: [AuthGuard] },


];
