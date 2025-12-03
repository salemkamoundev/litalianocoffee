import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { environment } from '../../../../environments/environment';
const db = getFirestore(initializeApp(environment.firebaseConfig));
@Component({
  selector: 'app-orders', standalone:true, imports:[CommonModule, FormsModule, DatePipe, CurrencyPipe],
  template: `
    <div class="page-container"><h1>Commandes</h1>
    <div *ngFor="let o of orders()" style="background:white;padding:20px;margin-bottom:15px;box-shadow:0 2px 5px #ccc;border-radius:10px">
        <h3>#{{o.id.slice(0,6)}} - {{o.total}} DT - {{o.date?.toDate()|date:'short'}}</h3>
        <p><strong>Client:</strong> {{o.customer.name}} ({{o.customer.phone}})</p>
        <p><strong>Statut:</strong> <select [ngModel]="o.status" (ngModelChange)="upd(o.id, $event)"><option>En cours</option><option>Livrée</option><option>Annulée</option></select></p>
        <ul><li *ngFor="let i of o.items">{{i.quantity}}x {{i.name}}</li></ul>
    </div></div>
  `
})
export class OrdersComponent implements OnInit {
  orders=signal<any[]>([]);
  ngOnInit(){ onSnapshot(query(collection(db,"orders"),orderBy("date","desc")), s=>this.orders.set(s.docs.map(d=>({...d.data(),id:d.id})))); }
  upd(id:string, s:string){ updateDoc(doc(db,"orders",id), {status:s}); }
}
