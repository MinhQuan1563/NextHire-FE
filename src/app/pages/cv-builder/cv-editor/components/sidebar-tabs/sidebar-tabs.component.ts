import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-tabs.component.html',
  styleUrls: ['./sidebar-tabs.component.scss']
})
export class SidebarTabsComponent {
  @Input() activeTab: string = 'design';
  @Output() activeTabChange = new EventEmitter<string>();

  tabs = [
    { id: 'design', icon: 'icon-design', label: 'Thiết kế & Font' },
    { id: 'sections', icon: 'icon-add', label: 'Thêm mục' },
    { id: 'layout', icon: 'icon-layout', label: 'Bố cục' }
  ];

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.activeTabChange.emit(tab);
  }
}