import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Person } from '../person-card/person-card.component';

@Component({
  selector: 'app-invitation-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invitation-card.component.html',
  styleUrls: ['./invitation-card.component.scss']
})
export class InvitationCardComponent {
  @Input() invitation!: Person;
  @Output() onAccept = new EventEmitter<Person>();
  @Output() onDecline = new EventEmitter<Person>();

  handleAccept(): void {
    this.onAccept.emit(this.invitation);
  }

  handleDecline(): void {
    this.onDecline.emit(this.invitation);
  }
}
