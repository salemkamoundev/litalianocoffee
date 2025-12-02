import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { environment } from '../../../../environments/environment';

const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);

@Component({
  selector: 'app-orders', standalone: true, imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe],
  template: `
    <div class="page-container">
      <h1>Commandes</h1>
      <div *ngFor="let o of orders()">
        <div style="background:white; padding:20px; margin-bottom:20px; border-radius:10px; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
            <h3>Commande #{{o.id.slice(0,8)}} - {{o.total | number:'1.2-2'}} DT</h3>
            <p><strong>Client:</strong> {{o.customer.name}} ({{o.customer.phone}})</p>
            <p><strong>Statut:</strong> 
                <select [ngModel]="o.status" (ngModelChange)="updateStatus(o.id, $event)">
                    <option>En cours</option><option>Livrée</option><option>Annulée</option>
                </select>
            </p>
            <div *ngFor="let i of o.items">{{i.quantity}}x {{i.name}}</div>
        </div>
      </div>
    </div>
  `
})
export class OrdersComponent implements OnInit {
  orders = signal<any[]>([]);
  ngOnInit() {
    onSnapshot(query(collection(db,"orders"), orderBy("createdAt","desc")), s => {
        this.orders.set(s.docs.map(d => ({id:d.id, ...d.data()})));
    });
  }
  updateStatus(id:string, status:string) { updateDoc(doc(db,"orders",id), {status}); }
}
