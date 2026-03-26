import { Component, ViewChild } from '@angular/core';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';

@Component({
  selector: 'app-notification-overlay',
  standalone: true,
  imports: [OverlayPanelModule],
  templateUrl: './notification-overlay.component.html',
  styleUrl: './notification-overlay.component.scss'
})
export class NotificationOverlayComponent {
  @ViewChild('op') op!: OverlayPanel;

  toggle(event: Event) {
    this.op.toggle(event);
  }
}
