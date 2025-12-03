import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { environment } from '../../../../environments/environment';

const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);

// Interface pour typer proprement les commandes
interface Order {
  id: string;
  customer: { name: string; phone: string; address: string };
  items: any[];
  total: number;
  status: string;
  date: any;
  comment?: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe],
  template: `
    <div class="page-container">
      <div class="header-section">
        <h1>📦 Gestion des Commandes</h1>
        <p class="subtitle">Suivi et filtrage des commandes clients</p>
      </div>

      <!-- BARRE DE FILTRES (NOUVEAU) -->
      <div class="filters-toolbar">
        <div class="search-group">
            <span class="search-icon">🔍</span>
            <input 
                type="text" 
                [(ngModel)]="searchTerm" 
                placeholder="Rechercher (Nom, Tél, ID...)" 
                class="input-search"
            >
        </div>
        
        <div class="filter-group">
            <label>Statut :</label>
            <select [(ngModel)]="filterStatus" class="select-filter">
                <option value="">Tous les statuts</option>
                <option value="En cours">⏳ En cours</option>
                <option value="Livrée">✅ Livrée</option>
                <option value="Annulée">❌ Annulée</option>
            </select>
        </div>

        <div class="stats-badge">
            {{ filteredOrders().length }} commande(s) trouvée(s)
        </div>
      </div>

      @if (loading()) {
        <div class="loading-state">Chargement des commandes...</div>
      } @else if (filteredOrders().length === 0) {
        <div class="empty-state">
            <p>Aucune commande ne correspond à vos critères.</p>
            <button (click)="resetFilters()" class="btn-reset">Réinitialiser les filtres</button>
        </div>
      } @else {
        <div class="orders-grid">
          @for (o of filteredOrders(); track o.id) {
            <div class="order-card" [class]="'status-border-' + getStatusClass(o.status)">
                <!-- En-tête -->
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

                <!-- Commentaire Client -->
                @if (o.comment) {
                    <div class="comment-section">
                        <span class="comment-icon">💬</span>
                        <div class="comment-content">
                            <p>“{{ o.comment }}”</p>
                        </div>
                    </div>
                }

                <!-- Liste des Articles -->
                <div class="items-section">
                    <div class="items-toggle" (click)="o.expanded = !o.expanded">
                        <span>{{ o.items.length }} article(s)</span>
                        <span class="arrow">{{ o.expanded ? '▲' : '▼' }}</span>
                    </div>
                    
                    <!-- Liste déroulante simple -->
                    <ul class="items-list" [class.expanded]="o.expanded">
                        <li *ngFor="let item of o.items">
                            <span class="qty">{{ item.quantity }}x</span>
                            <span class="prod-name">{{ item.name }}</span>
                        </li>
                    </ul>
                </div>

                <!-- Footer -->
                <div class="card-footer">
                    <div class="total-price">
                        <span class="amount">{{ o.total | number:'1.2-2' }} DT</span>
                    </div>
                    
                    <div class="status-control">
                        <select 
                            [ngModel]="o.status" 
                            (ngModelChange)="updateStatus(o.id, $event)"
                            [class]="'select-' + getStatusClass(o.status)"
                        >
                            <option value="En cours">En cours</option>
                            <option value="Livrée">Livrée</option>
                            <option value="Annulée">Annulée</option>
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
    .page-container { max-width: 1200px; margin: 0 auto; padding: 120px 20px; }
    .header-section { text-align: center; margin-bottom: 30px; }
    h1 { color: var(--primary-color); font-size: 2.5rem; margin: 0; }
    .subtitle { color: #888; margin-top: 5px; }

    /* --- FILTERS TOOLBAR --- */
    .filters-toolbar {
        display: flex; flex-wrap: wrap; gap: 15px; align-items: center;
        background: white; padding: 20px; border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 30px;
        border: 1px solid #eee;
    }
    
    .search-group { 
        flex: 2; min-width: 250px; display: flex; align-items: center; 
        background: #f9f9f9; border-radius: 8px; padding: 0 15px; border: 1px solid #eee;
    }
    .search-icon { font-size: 1.2rem; margin-right: 10px; opacity: 0.5; }
    .input-search { 
        width: 100%; border: none; background: transparent; padding: 12px 0; font-size: 1rem; 
    }
    
    .filter-group { 
        flex: 1; min-width: 200px; display: flex; align-items: center; gap: 10px; 
    }
    .filter-group label { font-weight: bold; color: var(--secondary-color); }
    .select-filter { 
        flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #ddd; font-size: 0.95rem; 
    }

    .stats-badge {
        background: var(--accent-color); color: #2c3e50; 
        padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 0.85rem;
    }

    /* --- GRID & CARDS --- */
    .orders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; }
    
    .order-card {
        background: white; border-radius: 12px; overflow: hidden;
        box-shadow: 0 5px 15px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;
        transition: transform 0.2s;
    }
    .order-card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }

    /* Status Borders */
    .status-border-warning { border-top: 4px solid #f1c40f; }
    .status-border-success { border-top: 4px solid #2ecc71; }
    .status-border-danger { border-top: 4px solid #e74c3c; }

    .card-header { 
        padding: 15px; background: #fcfcfc; border-bottom: 1px solid #eee; 
        display: flex; justify-content: space-between; 
    }
    .order-id { font-weight: 800; font-family: monospace; font-size: 1.1rem; color: #333; }
    .order-date { font-size: 0.85rem; color: #888; }

    .customer-section { padding: 15px; border-bottom: 1px solid #f9f9f9; }
    .info-row { display: flex; gap: 10px; margin-bottom: 5px; color: #555; font-size: 0.95rem; }
    .name { font-weight: bold; color: var(--primary-color); }
    .phone { color: var(--accent-color); text-decoration: none; font-weight: 500; }
    .address { font-size: 0.9rem; color: #666; line-height: 1.3; }

    .comment-section { 
        background: #fffbe6; padding: 10px 15px; font-size: 0.9rem; color: #5d4037; 
        font-style: italic; border-bottom: 1px dashed #eee; display: flex; gap: 10px; 
    }

    .items-section { padding: 10px 15px; background: #fff; }
    .items-toggle { 
        display: flex; justify-content: space-between; cursor: pointer; 
        color: #888; font-size: 0.85rem; text-transform: uppercase; font-weight: bold; 
        padding: 5px 0; 
    }
    .items-list { 
        list-style: none; padding: 0; margin: 0; max-height: 0; overflow: hidden; transition: max-height 0.3s ease; 
    }
    .items-list.expanded { max-height: 200px; overflow-y: auto; margin-top: 10px; }
    .items-list li { display: flex; gap: 10px; margin-bottom: 5px; font-size: 0.9rem; border-bottom: 1px solid #f9f9f9; padding-bottom: 5px; }
    .qty { font-weight: bold; color: var(--secondary-color); }

    .card-footer { 
        padding: 15px; background: #fafafa; border-top: 1px solid #eee; 
        display: flex; justify-content: space-between; align-items: center; 
    }
    .amount { font-size: 1.3rem; font-weight: 800; color: var(--primary-color); }
    
    select { padding: 6px 10px; border-radius: 15px; border: 1px solid #ddd; font-weight: bold; cursor: pointer; font-size: 0.85rem; }
    .select-warning { background: #fff8e1; color: #f39c12; border-color: #f39c12; }
    .select-success { background: #e8f8f5; color: #27ae60; border-color: #27ae60; }
    .select-danger { background: #fdedec; color: #c0392b; border-color: #c0392b; }

    .empty-state { text-align: center; padding: 40px; color: #999; font-size: 1.1rem; }
    .btn-reset { margin-top: 10px; padding: 8px 20px; background: #eee; border: none; border-radius: 5px; cursor: pointer; }
  `]
})
export class OrdersComponent implements OnInit {
  orders = signal<any[]>([]);
  loading = signal(true);

  // États des filtres
  searchTerm = signal('');
  filterStatus = signal('');

  // Liste filtrée (Computed)
  filteredOrders = computed(() => {
      const term = this.searchTerm().toLowerCase();
      const status = this.filterStatus();
      
      return this.orders().filter(order => {
          const matchesTerm = 
            order.id.toLowerCase().includes(term) ||
            order.customer.name.toLowerCase().includes(term) ||
            order.customer.phone.includes(term);
          
          const matchesStatus = status ? order.status === status : true;
          
          return matchesTerm && matchesStatus;
      });
  });
  
  ngOnInit() {
    onSnapshot(query(collection(db,"orders"), orderBy("createdAt","desc")), s => {
        this.orders.set(s.docs.map(d => {
            const data = d.data();
            const date = data['createdAt'] ? data['createdAt'] : data['date'];
            // Ajout propriété expanded pour l'UI
            return { id:d.id, ...data, date, expanded: true };
        }));
        this.loading.set(false);
    });
  }
  
  updateStatus(id: string, status: string) { 
      updateDoc(doc(db, "orders", id), { status }); 
  }

  resetFilters() {
      this.searchTerm.set('');
      this.filterStatus.set('');
  }

  getStatusClass(status: string): string {
      if (status === 'Livrée') return 'success';
      if (status === 'Annulée') return 'danger';
      return 'warning';
  }
}
