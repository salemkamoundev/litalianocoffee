import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, updateDoc, Timestamp } from "firebase/firestore";
import { environment } from '../../../../environments/environment';

interface Order {
  id: string;
  customer: { name: string; phone: string; address: string };
  items: any[];
  total: number;
  status: string;
  date: Timestamp;
}

const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe],
  template: `
    <div class="page-container">
      <h1>📦 Gestion des Commandes</h1>
      
      <div *ngIf="loading()" class="loading">Chargement des commandes...</div>
      
      <div *ngIf="!loading() && orders().length === 0" class="no-orders">
        Aucune commande trouvée.
      </div>

      <div class="orders-list" *ngIf="orders().length > 0">
        <div class="order-card" *ngFor="let order of orders()">
          <div class="order-header">
            <div>
                <h3>Commande #{{ order.id | slice:0:8 }}</h3>
                <span class="date">{{ order.date?.toDate() | date:'medium' }}</span>
            </div>
            <div class="status-group">
                <select [ngModel]="order.status" (ngModelChange)="updateStatus(order.id, $event)" [class]="'status-' + getStatusClass(order.status)">
                    <option value="En cours">En cours</option>
                    <option value="Livrée">Livrée</option>
                    <option value="Annulée">Annulée</option>
                </select>
            </div>
          </div>
          
          <div class="customer-info">
            <p><strong>Client:</strong> {{ order.customer.name }} | 📞 {{ order.customer.phone }}</p>
            <p><strong>Adresse:</strong> {{ order.customer.address }}</p>
          </div>

          <div class="order-items">
            <div *ngFor="let item of order.items" class="item-row">
                <span>{{ item.quantity }}x {{ item.name }}</span>
                <span>{{ (item.price * item.quantity) | number:'1.2-2' }} DT</span>
            </div>
          </div>

          <div class="order-total">
            Total: {{ order.total | number:'1.2-2' }} DT
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .order-card { background: white; border-radius: 10px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border-left: 5px solid var(--accent-color); }
    .order-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px; }
    .order-header h3 { margin: 0; color: var(--primary-color); }
    .date { color: #888; font-size: 0.9rem; }
    .customer-info { background: #f9f9f9; padding: 10px; border-radius: 5px; margin-bottom: 15px; font-size: 0.95rem; }
    .customer-info p { margin: 5px 0; }
    .item-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #eee; }
    .order-total { text-align: right; font-size: 1.2rem; font-weight: bold; margin-top: 15px; color: var(--secondary-color); }
    
    select { padding: 5px 10px; border-radius: 20px; border: 1px solid #ddd; font-weight: bold; cursor: pointer; }
    .status-warning { background: #fff3cd; color: #856404; } /* En cours */
    .status-success { background: #d4edda; color: #155724; } /* Livrée */
    .status-danger { background: #f8d7da; color: #721c24; } /* Annulée */
    
    .loading, .no-orders { text-align: center; padding: 40px; font-size: 1.2rem; color: #666; }
  `]
})
export class OrdersComponent implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(true);

  ngOnInit() {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
        this.orders.set(snapshot.docs.map(d => {
            const data = d.data();
            return { id: d.id, ...data, date: data['createdAt'] } as Order;
        }));
        this.loading.set(false);
    });
  }

  async updateStatus(id: string, newStatus: string) {
    await updateDoc(doc(db, "orders", id), { status: newStatus });
  }

  getStatusClass(status: string) {
    if (status === 'Livrée') return 'success';
    if (status === 'Annulée') return 'danger';
    return 'warning';
  }
}
