import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { environment } from '../../../../environments/environment';
const app = initializeApp(environment.firebaseConfig); const db = getFirestore(app); const storage = getStorage(app);

@Component({
  selector: 'app-crud', standalone:true, imports:[CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <h1>Gestion Catalogue</h1>
      <div style="display:flex;gap:10px;margin-bottom:20px">
        <input [(ngModel)]="st" placeholder="Rechercher..." class="input-modern" style="flex:2">
        <select [(ngModel)]="cat" class="input-modern" style="flex:1"><option value="">Toutes Cat.</option><option *ngFor="let c of cats()" [value]="c">{{c}}</option></select>
        <button (click)="open()" class="btn-primary">+ Nouveau</button>
      </div>
      
      <!-- Modal -->
      <div *ngIf="show()" style="position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:2000">
        <div style="background:white;padding:30px;border-radius:10px;width:400px">
            <h2>{{isEdit?'Modifier':'Ajouter'}}</h2>
            <input [(ngModel)]="f.name" placeholder="Nom" class="input-modern" style="margin-bottom:10px">
            <input [(ngModel)]="f.price" type="number" placeholder="Prix" class="input-modern" style="margin-bottom:10px">
            <input [(ngModel)]="f.stock" type="number" placeholder="Stock" class="input-modern" style="margin-bottom:10px">
            <input [(ngModel)]="f.category" placeholder="Catégorie" class="input-modern" style="margin-bottom:10px">
            <input type="file" (change)="up($event)" style="margin-bottom:10px">
            <img *ngIf="f.imageUrl" [src]="f.imageUrl" width="50">
            <div style="text-align:right"><button (click)="save()" class="btn-primary">Sauver</button> <button (click)="show.set(false)">Annuler</button></div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:20px">
        <div *ngFor="let p of filtered()" style="background:white;padding:15px;border-radius:10px;box-shadow:0 2px 5px #ccc">
            <img [src]="p.imageUrl" style="width:100%;height:150px;object-fit:cover;border-radius:5px">
            <h3 style="margin:10px 0">{{p.name}}</h3>
            <p>{{p.category}} | Stock: {{p.stock}}</p>
            <p style="font-weight:bold">{{p.price}} DT</p>
            <button (click)="edit(p)">✎</button> <button (click)="del(p.id)" style="color:red">🗑</button>
        </div>
      </div>
    </div>
  `
})
export class CrudProductsComponent implements OnInit {
  products=signal<any[]>([]); show=signal(false); f:any={}; isEdit=false; st=signal(''); cat=signal('');
  cats = computed(() => [...new Set(this.products().map(p => p.category).filter(Boolean))].sort());
  filtered = computed(() => this.products().filter(p => p.name.toLowerCase().includes(this.st().toLowerCase()) && (!this.cat() || p.category === this.cat())));
  ngOnInit(){ onSnapshot(collection(db,"products"),s=>this.products.set(s.docs.map(d=>({...d.data(),id:d.id})))); }
  open(){ this.f={id:'',name:'',price:0,stock:0,category:'',imageUrl:''}; this.isEdit=false; this.show.set(true); }
  edit(p:any){ this.f={...p}; this.isEdit=true; this.show.set(true); }
  async save(){ if(this.isEdit) await updateDoc(doc(db,"products",this.f.id),this.f); else await addDoc(collection(db,"products"),this.f); this.show.set(false); }
  async del(id:string){ if(confirm('Sur ?')) await deleteDoc(doc(db,"products",id)); }
  async up(e:any){ const file=e.target.files[0]; if(!file)return; const r=ref(storage, 'p/'+Date.now()); await uploadBytes(r,file); this.f.imageUrl=await getDownloadURL(r); }
}
