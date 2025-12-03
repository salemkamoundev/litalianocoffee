import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="checkout-wrapper">
        
        <!-- Card de Validation -->
        <div class="checkout-card fade-in">
            <div class="card-header">
                <h1>Finaliser la Commande</h1>
                <p>Complétez vos informations pour la livraison.</p>
            </div>
            
            <div *ngIf="cart.cartItems().length > 0; else empty">
                
                <!-- Section Login (Si non connecté) -->
                <div *ngIf="!auth.isAuthenticated()" class="login-prompt">
                    <h3>Déjà client ? Connectez-vous</h3>
                    <p class="info-text">Connectez-vous pour suivre cette commande dans votre espace.</p>
                    
                    <div class="inline-login">
                        <input type="email" [(ngModel)]="loginEmail" placeholder="Email" class="input-small">
                        <input type="password" [(ngModel)]="loginPass" placeholder="Mot de passe" class="input-small">
                        <button (click)="quickLogin()" class="btn-small">OK</button>
                    </div>
                    <button (click)="quickGoogle()" class="btn-google-small"> G </button>
                    <p class="error-text" *ngIf="loginError()">{{ loginError() }}</p>
                    <div class="divider"><span>OU CONTINUER EN INVITÉ</span></div>
                </div>

                <div class="order-summary">
                    <span class="label">Total à régler</span>
                    <span class="amount">{{ cart.subTotal() | number:'1.2-2' }} DT</span>
                </div>

                <form (ngSubmit)="submit()">
                    <div class="form-group">
                        <label>Nom complet</label>
                        <input type="text" [(ngModel)]="data.name" name="name" required class="input-modern" placeholder="Votre Nom">
                    </div>
                    <div class="form-group">
                        <label>Téléphone</label>
                        <input type="tel" [(ngModel)]="data.phone" name="phone" required class="input-modern" placeholder="22 333 444">
                    </div>
                    <div class="form-group">
                        <label>Adresse de livraison</label>
                        <textarea [(ngModel)]="data.address" name="addr" required class="input-modern" rows="2" placeholder="Rue, Ville, Code Postal..."></textarea>
                    </div>
                    
                    <!-- Champ Commentaire Ajouté -->
                    <div class="form-group">
                        <label>Commentaire (Optionnel)</label>
                        <textarea [(ngModel)]="comment" name="comment" class="input-modern" rows="2" placeholder="Instructions spéciales, code porte, etc."></textarea>
                    </div>

                    <button type="submit" class="btn-primary w-100 btn-confirm" [disabled]="loading()">
                        {{ loading() ? 'Traitement...' : 'Confirmer la commande' }}
                    </button>
                </form>
            </div>
            
            <ng-template #empty>
                <div class="empty-state">
                    <p>Votre panier est vide.</p>
                    <button (click)="router.navigate(['/products'])" class="btn-text">Retour au catalogue</button>
                </div>
            </ng-template>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .checkout-wrapper { display: flex; justify-content: center; padding-top: 20px; }
    .checkout-card {
        background: white; padding: 40px; border-radius: 20px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.08); width: 100%; max-width: 600px;
        border-top: 5px solid var(--primary-color);
    }
    .card-header { text-align: center; margin-bottom: 30px; }
    .card-header h1 { font-size: 2.2rem; margin: 0; color: var(--primary-dark); }
    .card-header p { color: #888; margin-top: 5px; }

    /* Login Prompt Styles */
    .login-prompt { background: #fdfbf7; padding: 20px; border-radius: 10px; border: 1px solid #e0d6ce; margin-bottom: 30px; text-align: center; }
    .login-prompt h3 { margin: 0 0 5px 0; color: var(--primary-color); font-size: 1.1rem; }
    .info-text { font-size: 0.85rem; color: #666; margin-bottom: 15px; }
    .inline-login { display: flex; gap: 10px; justify-content: center; margin-bottom: 10px; }
    .input-small { padding: 8px 12px; border: 1px solid #ccc; border-radius: 5px; width: 35%; font-size: 0.9rem; }
    .btn-small { background: var(--secondary-color); color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; }
    .btn-google-small { background: white; border: 1px solid #ccc; padding: 5px 12px; border-radius: 5px; cursor: pointer; font-weight: bold; color: #555; }
    .error-text { color: red; font-size: 0.8rem; margin-top: 5px; }
    .divider { margin: 20px 0 10px; border-bottom: 1px solid #ddd; line-height: 0.1em; }
    .divider span { background: #fdfbf7; padding: 0 10px; color: #999; font-size: 0.7rem; letter-spacing: 1px; }

    .order-summary {
        background: #faf8f5; border: 1px solid #e0d6ce; padding: 15px 25px;
        border-radius: 12px; display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 25px;
    }
    .order-summary .label { font-weight: 600; color: var(--secondary-color); }
    .order-summary .amount { font-size: 1.5rem; color: var(--primary-color); font-weight: 800; }

    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-weight: 700; margin-bottom: 5px; color: var(--primary-dark); font-size: 0.9rem; }
    
    .input-modern { width: 100%; padding: 12px; border: 1px solid #e0e0e0; border-radius: 8px; transition: 0.3s; box-sizing: border-box; }
    .input-modern:focus { border-color: var(--accent-color); box-shadow: 0 0 0 3px rgba(212,163,115,0.2); outline: none; }

    .w-100 { width: 100%; }
    .btn-confirm { padding: 16px; font-size: 1.1rem; letter-spacing: 1px; margin-top: 10px; }
    .empty-state { text-align: center; color: #999; padding: 40px; }
    .btn-text { background: none; border: none; color: var(--primary-color); text-decoration: underline; cursor: pointer; font-weight: bold; }
    
    .fade-in { animation: fadeIn 0.8s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    
    @media (max-width: 600px) {
        .inline-login { flex-direction: column; }
        .input-small { width: 100%; }
    }
  `]
})
export class CheckoutComponent {
  cart = inject(CartService);
  auth = inject(AuthService);
  router = inject(Router);
  
  data = { name: '', phone: '', address: '' };
  comment = '';
  loading = signal(false);
  
  // Login rapide states
  loginEmail = '';
  loginPass = '';
  loginError = signal('');

  async quickLogin() {
      try {
          await this.auth.signIn(this.loginEmail, this.loginPass);
          this.loginError.set('');
      } catch (e) {
          this.loginError.set("Erreur de connexion");
      }
  }
  
  async quickGoogle() {
      try { await this.auth.signInWithGoogle(); } catch(e) {}
  }
  
  async submit() {
    if(!this.data.name || !this.data.phone || !this.data.address) return;
    this.loading.set(true);
    
    // Récupérer l'ID utilisateur s'il est connecté, sinon null
    const userId = this.auth.currentUser()?.uid || null;
    
    try {
        await this.cart.checkout(this.data, userId, this.comment);
        alert("Commande reçue ! " + (userId ? "Vous pouvez la suivre dans 'Mes Commandes'." : ""));
        this.router.navigate(['/']);
    } catch (e) {
        console.error(e);
        alert("Erreur lors de la commande.");
    } finally {
        this.loading.set(false);
    }
  }
}
