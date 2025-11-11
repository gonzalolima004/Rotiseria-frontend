import { Routes } from '@angular/router';
import { Login } from './login/login';
import { HomeUsuariosComponent } from './home-usuarios/home-usuarios.component';
import { HomeAdminComponent } from './home-admin/home-admin.component';
import { ControlPedidoComponent } from './control-pedido/control-pedido';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
import { PedidosPendientesComponent } from './pedidos-pendientes/pedidos-pendientes.component';
import { AuthGuard } from './services/auth-guard';
import { ReporteVentasComponent } from './reporte-ventas/reporte-ventas';


export const routes: Routes = [
    { path: '', component: HomeUsuariosComponent },
    { path: 'ingresar', component: Login },
    { path: 'admin', component: HomeAdminComponent, canActivate: [AuthGuard] },
    { path: 'control-pedido', component: ControlPedidoComponent, canActivate: [AuthGuard] },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    { path: 'reporte-ventas', component: ReporteVentasComponent, canActivate: [AuthGuard] },
    { path: 'pedidos', component: PedidosPendientesComponent, canActivate: [AuthGuard] }, 


  { path: '**', redirectTo: '' },
];
