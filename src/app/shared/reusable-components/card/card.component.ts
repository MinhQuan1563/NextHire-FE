import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {
  @Input() header: string | undefined;
  @Input() subheader: string | undefined;
  @Input() imageUrl: string | undefined;
  @Input() contentStyleClass: string | undefined;
  @Input() showHeader: boolean = true;
  @Input() showFooter: boolean = false;
}
