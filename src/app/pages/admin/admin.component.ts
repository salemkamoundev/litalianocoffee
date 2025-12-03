import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-admin', standalone: true, imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <h1>Admin Dashboard</h1>
      <div *ngIf="auth.isAdmin()" style="display:grid; grid-template-columns:1fr 1fr; gap:30px;">
        <div style="background:white; padding:30px; border-radius:10px; box-shadow:0 5px 15px rgba(0,0,0,0.1); cursor:pointer;" routerLink="/admin/products"><h2>📦 Produits</h2></div>
        <div style="background:white; padding:30px; border-radius:10px; box-shadow:0 5px 15px rgba(0,0,0,0.1); cursor:pointer;" routerLink="/admin/orders"><h2>📄 Commandes</h2></div>
      </div>
      <div *ngIf="!auth.isAdmin()" style="text-align:center;"><p>Accès réservé.</p><button (click)="router.navigate(['/'])">Retour</button></div>
    </div>
  `
})
export class AdminComponent { auth = inject(AuthService); router = inject(Router); }
