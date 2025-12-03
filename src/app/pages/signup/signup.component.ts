import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({ selector: 'app-signup', standalone: true, imports: [CommonModule, FormsModule, RouterLink], template: `<div class="auth-bg"><div class="auth-card"><h1>Inscription</h1><input [(ngModel)]="email" name="email" class="input-modern" placeholder="Email"><br><br><input type="password" [(ngModel)]="pass" name="pass" class="input-modern" placeholder="Mot de passe"><br><br><button (click)="reg()" class="btn-submit">S'inscrire</button></div></div>` })
export class SignupComponent { email=''; pass=''; auth=inject(AuthService); router=inject(Router); async reg(){ try{ await this.auth.signUp(this.email,this.pass); this.router.navigate(['/']); }catch(e){} } }
