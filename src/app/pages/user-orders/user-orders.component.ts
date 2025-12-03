import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, onSnapshot, orderBy, Timestamp } from "firebase/firestore";
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);

interface Order {
  id: string;
  date: any;
  status: string;
  total: number;
  items: any[];
}

@Component({
  selector: 'app-user-orders',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe],
  template: `
    <div class="page-container">
      <div class="header-section">
        <h1>Mes Commandes</h1>
        <p class="subtitle">Retrouvez l'historique de vos dégustations.</p>
      </div>

      @if (loading()) {
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Chargement de vos commandes...</p>
        </div>
      } @else if (orders().length === 0) {
        <div class="empty-state fade-in">
            <span class="icon">☕</span>
            <h2>Aucune commande passée</h2>
            <p>Il est temps de découvrir nos sélections.</p>
            <a href="/products" class="btn-discover">Voir le catalogue</a>
        </div>
      } @else {
        <div class="orders-grid">
            @for (order of orders(); track order.id) {
                <div class="order-card fade-in-up">
                    <!-- En-tête de la carte -->
                    <div class="card-header">
                        <div class="order-meta">
                            <span class="order-date">{{ order.date?.toDate() | date:'dd MMM yyyy' }}</span>
                            <span class="order-ref">Ref: #{{ order.id | slice:0:8 }}</span>
                        </div>
                        <div class="order-status" [class]="getStatusClass(order.status)">
                            <span class="status-dot"></span>
                            {{ order.status }}
                        </div>
                    </div>

                    <!-- Barre de progression (Visuel) -->
                    <div class="progress-track">
                        <div class="step active">Cmd</div>
                        <div class="line" [class.active]="order.status !== 'En attente'"></div>
                        <div class="step" [class.active]="order.status === 'En cours' || order.status === 'Livrée'">Prép</div>
                        <div class="line" [class.active]="order.status === 'Livrée'"></div>
                        <div class="step" [class.active]="order.status === 'Livrée'">Livré</div>
                    </div>

                    <!-- Liste des articles -->
                    <div class="order-items">
                        @for (item of order.items; track item.id) {
                            <div class="item-row">
                                <div class="item-thumb">
                                    <img [src]="item.imageUrl || 'assets/slider1.png'" [alt]="item.name">
                                    <span class="item-qty">x{{ item.quantity }}</span>
                                </div>
                                <div class="item-info">
                                    <h4>{{ item.name }}</h4>
                                    <span class="item-price">{{ item.price | number:'1.2-2' }} DT</span>
                                </div>
                            </div>
                        }
                    </div>

                    <!-- Pied de la carte -->
                    <div class="card-footer">
                        <span class="label">Total payé</span>
                        <span class="total-amount">{{ order.total | currency:'DT':'symbol':'1.2-2':'fr' }}</span>
                    </div>
                </div>
            }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 900px; margin: 0 auto; padding: 120px 20px 60px; }
    .header-section { text-align: center; margin-bottom: 50px; }
    h1 { font-family: 'Playfair Display', serif; font-size: 3rem; color: var(--primary-color); margin: 0; }
    .subtitle { color: #888; margin-top: 10px; font-size: 1.1rem; }

    /* Grid Layout */
    .orders-grid { display: grid; gap: 30px; }

    /* Card Design */
    .order-card {
        background: white; border-radius: 15px; overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        border: 1px solid #f5f5f5;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .order-card:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(111, 78, 55, 0.1); }

    /* Header Card */
    .card-header {
        padding: 20px 25px; background: #fcfbf9; border-bottom: 1px solid #eee;
        display: flex; justify-content: space-between; align-items: center;
    }
    .order-meta { display: flex; flex-direction: column; }
    .order-date { font-weight: 700; color: var(--secondary-color); font-size: 1.1rem; }
    .order-ref { font-size: 0.8rem; color: #aaa; font-family: monospace; letter-spacing: 1px; margin-top: 2px; }

    /* Status Badges */
    .order-status { 
        padding: 6px 15px; border-radius: 30px; font-size: 0.85rem; font-weight: 600; 
        display: flex; align-items: center; gap: 8px; 
    }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; display: block; }
    
    /* Status Colors */
    .status-en-cours { background: #fff8e1; color: #f39c12; }
    .status-en-cours .status-dot { background: #f39c12; }
    .status-livree { background: #e8f8f5; color: #27ae60; }
    .status-livree .status-dot { background: #27ae60; }
    .status-annulee { background: #fdedec; color: #c0392b; }
    .status-annulee .status-dot { background: #c0392b; }

    /* Timeline */
    .progress-track {
        display: flex; align-items: center; justify-content: space-between;
        padding: 20px 40px; position: relative;
    }
    .step { font-size: 0.75rem; color: #ccc; font-weight: bold; text-transform: uppercase; position: relative; z-index: 2; background: white; padding: 0 5px; }
    .step.active { color: var(--primary-color); }
    .line { flex: 1; height: 2px; background: #eee; margin: 0 10px; position: relative; top: 1px; }
    .line.active { background: var(--accent-color); }

    /* Items */
    .order-items { padding: 0 25px 20px; }
    .item-row { display: flex; align-items: center; margin-bottom: 15px; }
    .item-thumb { position: relative; width: 60px; height: 60px; margin-right: 20px; flex-shrink: 0; }
    .item-thumb img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; border: 1px solid #eee; }
    .item-qty { 
        position: absolute; top: -5px; right: -5px; background: var(--accent-color); 
        color: #2c3e50; font-size: 0.7rem; font-weight: bold; 
        width: 20px; height: 20px; border-radius: 50%; 
        display: flex; align-items: center; justify-content: center;
    }
    .item-info h4 { margin: 0 0 5px; color: var(--secondary-color); font-size: 1rem; }
    .item-price { color: #888; font-size: 0.9rem; }

    /* Footer Card */
    .card-footer {
        padding: 20px 25px; background: #fcfcfc; border-top: 1px solid #eee;
        display: flex; justify-content: space-between; align-items: center;
    }
    .label { font-size: 0.9rem; text-transform: uppercase; color: #888; letter-spacing: 1px; }
    .total-amount { font-size: 1.5rem; font-weight: 800; color: var(--primary-color); }

    /* States */
    .loading-state, .empty-state { text-align: center; padding: 60px 20px; color: #999; }
    .icon { font-size: 3rem; display: block; margin-bottom: 20px; }
    .btn-discover { 
        display: inline-block; margin-top: 20px; padding: 12px 30px; 
        background: var(--primary-color); color: white; text-decoration: none; 
        border-radius: 30px; font-weight: bold; transition: 0.3s; 
    }
    .btn-discover:hover { background: var(--secondary-color); }

    .fade-in-up { animation: fadeInUp 0.6s ease-out; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class UserOrdersComponent implements OnInit {
  auth = inject(AuthService);
  orders = signal<Order[]>([]);
  loading = signal(true);

  ngOnInit() {
    const user = this.auth.currentUser();
    if (user) {
        const q = query(
            collection(db, "orders"), 
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );
        onSnapshot(q, (snapshot) => {
            this.orders.set(snapshot.docs.map(d => {
                const data = d.data();
                return { 
                    id: d.id, 
                    ...data, 
                    date: data['createdAt'] || data['date'] // Fallback si createdAt n'existe pas
                } as Order;
            }));
            this.loading.set(false);
        });
    } else {
        this.loading.set(false);
    }
  }

  getStatusClass(status: string) {
      const s = status.toLowerCase();
      if (s.includes('livré') || s.includes('terminé')) return 'status-livree';
      if (s.includes('annulé')) return 'status-annulee';
      return 'status-en-cours';
  }
}
