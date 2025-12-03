#!/bin/bash

echo "==================================================="
echo "📦 MISE À JOUR : AFFICHAGE COMMENTAIRE CLIENT"
echo "==================================================="

cat > src/app/pages/admin/orders/orders.component.ts <<'EOF'
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { environment } from '../../../../environments/environment';

const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe],
  template: `
    <div class="page-container">
      <div class="header-section">
        <h1>📦 Gestion des Commandes</h1>
        <p class="subtitle">Suivi en temps réel des achats clients</p>
      </div>

      @if (orders().length === 0) {
        <div class="empty-state">
            <p>Aucune commande pour le moment.</p>
        </div>
      } @else {
        <div class="orders-grid">
          @for (o of orders(); track o.id) {
            <div class="order-card" [class]="'status-border-' + getStatusClass(o.status)">
                <!-- En-tête de la carte -->
                <div class="card-header">
                    <div class="order-id">
                        <span class="hash">#</span>{{ o.id.slice(0, 8) }}
                    </div>
                    <div class="order-date">
                        {{ o.date?.toDate() | date:'dd MMM, HH:mm' }}
                    </div>
                </div>

                <!-- Infos Client -->
                <div class="customer-section">
                    <div class="info-row">
                        <span class="icon">👤</span> 
                        <span class="name">{{ o.customer.name }}</span>
                    </div>
                    <div class="info-row">
                        <span class="icon">📞</span> 
                        <a [href]="'tel:' + o.customer.phone" class="phone">{{ o.customer.phone }}</a>
                    </div>
                    <div class="info-row address-row">
                        <span class="icon">📍</span> 
                        <span class="address">{{ o.customer.address }}</span>
                    </div>
                </div>

                <!-- Commentaire Client (AJOUTÉ ICI) -->
                @if (o.comment) {
                    <div class="comment-section">
                        <span class="comment-icon">💬</span>
                        <div class="comment-content">
                            <span class="comment-label">Note du client :</span>
                            <p>“{{ o.comment }}”</p>
                        </div>
                    </div>
                }

                <!-- Liste des Articles -->
                <div class="items-section">
                    <h4>Articles ({{ o.items.length }})</h4>
                    <ul>
                        <li *ngFor="let item of o.items">
                            <span class="qty">{{ item.quantity }}x</span>
                            <span class="prod-name">{{ item.name }}</span>
                        </li>
                    </ul>
                </div>

                <!-- Footer : Total & Action -->
                <div class="card-footer">
                    <div class="total-price">
                        <span class="label">Total</span>
                        <span class="amount">{{ o.total | number:'1.2-2' }} DT</span>
                    </div>
                    
                    <div class="status-control">
                        <select 
                            [ngModel]="o.status" 
                            (ngModelChange)="updateStatus(o.id, $event)"
                            [class]="'select-' + getStatusClass(o.status)"
                        >
                            <option value="En cours">⏳ En cours</option>
                            <option value="Livrée">✅ Livrée</option>
                            <option value="Annulée">❌ Annulée</option>
                        </select>
                    </div>
                </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    /* Layout */
    .page-container { max-width: 1200px; margin: 0 auto; padding: 120px 20px; }
    .header-section { margin-bottom: 40px; text-align: center; }
    h1 { color: var(--primary-color); font-size: 2.5rem; margin-bottom: 10px; }
    .subtitle { color: #666; font-size: 1.1rem; }

    /* Grid */
    .orders-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 30px;
    }

    /* Card Design */
    .order-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        border: 1px solid #f0f0f0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transition: transform 0.3s, box-shadow 0.3s;
    }
    .order-card:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.1); }

    /* Status Borders */
    .status-border-warning { border-top: 5px solid #f1c40f; } /* En cours */
    .status-border-success { border-top: 5px solid #2ecc71; } /* Livrée */
    .status-border-danger { border-top: 5px solid #e74c3c; } /* Annulée */

    /* Header Card */
    .card-header {
        padding: 15px 20px;
        background: #fcfcfc;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .order-id { font-weight: 800; color: var(--secondary-color); font-family: monospace; font-size: 1.1rem; }
    .hash { color: #ccc; }
    .order-date { font-size: 0.85rem; color: #888; }

    /* Customer Section */
    .customer-section { padding: 20px; border-bottom: 1px solid #f5f5f5; }
    .info-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; color: #444; }
    .info-row:last-child { margin-bottom: 0; }
    .icon { font-size: 1.1rem; width: 20px; text-align: center; }
    .name { font-weight: bold; color: var(--primary-color); }
    .phone { color: var(--accent-color); text-decoration: none; font-weight: 500; }
    .phone:hover { text-decoration: underline; }
    .address-row { align-items: flex-start; }
    .address { font-size: 0.9rem; line-height: 1.4; color: #666; }

    /* --- STYLE COMMENTAIRE --- */
    .comment-section {
        background-color: #fff8e1; /* Fond jaune pâle type Post-it */
        padding: 15px 20px;
        border-top: 1px dashed #eee;
        border-bottom: 1px dashed #eee;
        display: flex;
        gap: 10px;
        align-items: flex-start;
    }
    .comment-icon { font-size: 1.2rem; }
    .comment-content { flex: 1; }
    .comment-label { display: block; font-size: 0.75rem; text-transform: uppercase; color: #8d6e63; font-weight: bold; margin-bottom: 3px; }
    .comment-section p { margin: 0; font-style: italic; color: #5d4037; font-size: 0.95rem; line-height: 1.4; }

    /* Items Section */
    .items-section { padding: 15px 20px; flex-grow: 1; background: #fff; }
    .items-section h4 { margin: 0 0 10px; font-size: 0.8rem; text-transform: uppercase; color: #aaa; letter-spacing: 1px; }
    .items-section ul { padding: 0; margin: 0; list-style: none; }
    .items-section li { display: flex; gap: 10px; margin-bottom: 6px; font-size: 0.95rem; }
    .qty { font-weight: bold; color: var(--secondary-color); background: #eee; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; }
    .prod-name { color: #333; }

    /* Footer Card */
    .card-footer {
        padding: 20px;
        background: #fafafa;
        border-top: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .total-price { display: flex; flex-direction: column; }
    .total-price .label { font-size: 0.8rem; color: #888; text-transform: uppercase; }
    .total-price .amount { font-size: 1.5rem; font-weight: 800; color: var(--secondary-color); }

    /* Select Styling */
    select {
        padding: 8px 15px;
        border-radius: 20px;
        border: 1px solid #ddd;
        font-weight: bold;
        cursor: pointer;
        outline: none;
        transition: all 0.3s;
        font-size: 0.9rem;
    }
    .select-warning { background: #fff8e1; color: #f39c12; border-color: #f39c12; }
    .select-success { background: #e8f8f5; color: #27ae60; border-color: #27ae60; }
    .select-danger { background: #fdedec; color: #c0392b; border-color: #c0392b; }

    .empty-state { text-align: center; color: #999; font-size: 1.2rem; margin-top: 50px; }
  `]
})
export class OrdersComponent implements OnInit {
  orders = signal<any[]>([]);
  
  ngOnInit() {
    onSnapshot(query(collection(db,"orders"), orderBy("createdAt","desc")), s => {
        this.orders.set(s.docs.map(d => {
            const data = d.data();
            const date = data['createdAt'] ? data['createdAt'] : data['date'];
            return { id:d.id, ...data, date };
        }));
    });
  }
  
  updateStatus(id: string, status: string) { 
      updateDoc(doc(db, "orders", id), { status }); 
  }

  getStatusClass(status: string): string {
      if (status === 'Livrée') return 'success';
      if (status === 'Annulée') return 'danger';
      return 'warning';
  }
}
EOF

echo "✅ Commentaires clients ajoutés à l'interface Admin !"