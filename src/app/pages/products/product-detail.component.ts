import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, DocumentData } from "firebase/firestore";
import { environment } from '../../../environments/environment';
import { CartService } from '../../services/cart.service';
const db = getFirestore(initializeApp(environment.firebaseConfig));
@Component({ selector: 'app-detail', standalone: true, imports:[CommonModule], template: `<div class="page-container" *ngIf="p() as product"><div style="display:flex;gap:40px"><img [src]="product.imageUrl" style="width:500px;border-radius:10px"><div style="flex:1"><h1>{{product.name}}</h1><h2>{{product.price}} DT</h2><p [innerHTML]="product.description"></p><button (click)="cart.addItem(product)" class="btn-primary">Ajouter au panier</button></div></div></div>` })
export class ProductDetailComponent implements OnInit {
  p = signal<any>(null); route = inject(ActivatedRoute); cart = inject(CartService);
  ngOnInit() { this.route.paramMap.subscribe(async m => { const s = await getDoc(doc(db,"products",m.get('id')!)); if(s.exists()) this.p.set({...s.data(), id:s.id}); }) }
}
