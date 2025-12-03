import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
@Component({ selector: 'app-chk', standalone: true, imports:[CommonModule, FormsModule], template: `<div class="page-container" style="max-width:600px"><h1>Checkout</h1><p>Total: {{cart.subTotal()}} DT</p><input [(ngModel)]="d.name" placeholder="Nom" class="input-modern" style="margin-bottom:10px"><input [(ngModel)]="d.phone" placeholder="Tél" class="input-modern" style="margin-bottom:10px"><textarea [(ngModel)]="d.address" placeholder="Adresse" class="input-modern"></textarea><button (click)="sub()" class="btn-primary" style="width:100%;margin-top:20px">Valider</button></div>` })
export class CheckoutComponent { cart = inject(CartService); router=inject(Router); d={name:'',phone:'',address:''}; async sub(){ if(!this.d.name)return; await this.cart.checkout(this.d); alert('Merci !'); this.router.navigate(['/']); } }
