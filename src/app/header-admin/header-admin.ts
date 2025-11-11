import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header-admin.html',
  styleUrl: './header-admin.css'
})
export class HeaderAdminComponent {

  constructor(private router: Router){}

  irA(seccion: string){
    this.router.navigate([`/admin/${seccion}`]);
  }

  cerrarSesion(){
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

}
