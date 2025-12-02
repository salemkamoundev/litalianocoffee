import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1>Nous Contacter</h1>
      
      <div class="contact-info">
        <h2>Informations Clés</h2>
        <p><strong>Email:</strong> <a href="mailto:contact@litalianocaffe.tn">contact@litalianocaffe.tn</a></p>
        <p><strong>Site:</strong> litalianocoffee.com</p>
        <p><strong>Réseaux:</strong> Page Facebook / Instagram (En Cours)</p>
      </div>

      <p class="note">Pour toute question sur nos cafés, machines ou commandes, n'hésitez pas à nous écrire.</p>
    </div>
  `,
  styles: [`
    .contact-info {
        background: var(--light-bg);
        padding: 30px;
        border-radius: 8px;
        max-width: 600px;
    }
    .contact-info a {
        color: var(--primary-color);
        font-weight: bold;
    }
    .note {
        margin-top: 30px;
        font-style: italic;
    }
  `]
})
export class ContactComponent {}
