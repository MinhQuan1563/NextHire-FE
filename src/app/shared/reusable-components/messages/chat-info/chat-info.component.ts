import { Component, Input } from '@angular/core';
import { ChatPartner } from '@app/models/message/message.model';

@Component({
  selector: 'app-chat-info',
  standalone: true,
  imports: [],
  templateUrl: './chat-info.component.html',
  styleUrl: './chat-info.component.scss'
})
export class ChatInfoComponent {
  @Input() partner!: ChatPartner;
}
