import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="contact-header">
        <h1>Contactez-nous</h1>
        <p class="subtitle">Une question ? Une commande ? Notre équipe est à votre écoute.</p>
      </div>

      <div class="contact-layout">
        <!-- Info Box -->
        <div class="info-box fade-in-up">
            <div class="info-item">
                <div class="icon-circle">📞</div>
                <h3>Téléphone</h3>
                <p>26 488 448</p>
                <p>26 488 445</p>
            </div>
            
            <div class="info-item">
                <div class="icon-circle">✉️</div>
                <h3>Email</h3>
                <p><a href="mailto:contact@litalianocaffe.tn">contact@litalianocaffe.tn</a></p>
            </div>

            <div class="info-item">
                <div class="icon-circle">📍</div>
                <h3>Adresse</h3>
                <p>Teboulba, Monastir</p>
                <p>Tunisie</p>
            </div>

            <div class="social-section">
                <h3>Suivez-nous</h3>
                <div class="badges">
                    <span class="social-badge facebook">Facebook (En cours)</span>
                    <span class="social-badge instagram">Instagram (En cours)</span>
                </div>
            </div>
        </div>

        <!-- Map -->
        <div class="map-container fade-in-up delay-1">
            <iframe 
                src="https://maps.google.com/maps?q=Teboulba+Monastir&t=&z=13&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                style="border:0;" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade">
            </iframe>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding: 120px 20px 80px; }
    
    .contact-header { text-align: center; margin-bottom: 60px; }
    h1 { font-size: 3.5rem; margin-bottom: 15px; color: var(--primary-color); }
    .subtitle { font-size: 1.2rem; color: #666; }

    .contact-layout { 
        display: grid; 
        grid-template-columns: 1fr 1.5fr; 
        gap: 50px; 
        background: white;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 10px 40px rgba(0,0,0,0.05);
    }

    /* Info Box */
    .info-box { 
        padding: 50px; 
        background: #fdfbf7; 
        display: flex; 
        flex-direction: column; 
        gap: 40px; 
        border-right: 1px solid #eee;
    }

    .info-item { text-align: center; }
    .icon-circle { 
        width: 60px; height: 60px; 
        background: var(--accent-color); 
        color: white; 
        font-size: 1.8rem; 
        border-radius: 50%; 
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 15px;
        box-shadow: 0 5px 15px rgba(212, 163, 115, 0.4);
    }
    .info-item h3 { font-size: 1.2rem; color: var(--secondary-color); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
    .info-item p { color: #555; font-size: 1.1rem; font-weight: 500; margin: 5px 0; }
    .info-item a { color: var(--primary-color); text-decoration: none; font-weight: bold; }

    .social-section { text-align: center; margin-top: 20px; padding-top: 30px; border-top: 1px dashed #ccc; }
    .social-section h3 { font-size: 1rem; margin-bottom: 15px; color: #888; }
    .badges { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
    .social-badge { padding: 8px 15px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; color: white; }
    .facebook { background: #3b5998; }
    .instagram { background: #e1306c; }

    /* Map */
    .map-container { min-height: 500px; height: 100%; background: #eee; }
    
    /* Animations */
    .fade-in-up { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; transform: translateY(30px); }
    .delay-1 { animation-delay: 0.2s; }
    @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 900px) {
        .contact-layout { grid-template-columns: 1fr; }
        .map-container { height: 400px; }
    }
  `]
})
export class ContactComponent {}
