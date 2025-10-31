import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../header/header';

@Component({
  selector: 'app-home-usuarios',
  standalone: true,
  imports: [CommonModule, Header],
  templateUrl: './home-usuarios.html',
  styleUrls: ['./home-usuarios.css']
})
export class HomeUsuarios {}
