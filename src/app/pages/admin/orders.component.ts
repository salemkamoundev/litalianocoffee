import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1>Commandes Clients</h1>
      <p>Liste de toutes les commandes passées (hors paiement) à implémenter.</p>
      <!-- Logique de lecture des commandes à venir ici -->
    </div>
  `
})
export class OrdersComponent {}
