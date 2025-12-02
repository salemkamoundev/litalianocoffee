import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1>Contact</h1>
      <p>Email: contact@litalianocaffe.tn</p>
    </div>
  `
})
export class ContactComponent {}
