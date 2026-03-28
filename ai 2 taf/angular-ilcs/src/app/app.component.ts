import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ChatComponent } from './components/chat/chat.component';
import { EtudiantsComponent } from './components/etudiants/etudiants.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ChatComponent, EtudiantsComponent],
  template: `
    <div class="d-flex vh-100 overflow-hidden">
      <!-- Sidebar toggle for mobile -->
      <div *ngIf="sidebarOpen()"
           class="d-md-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
           style="z-index:999" (click)="sidebarOpen.set(false)"></div>

      <!-- Sidebar -->
      <div class="position-relative position-md-static"
           [class.d-none]="!sidebarOpen()"
           style="z-index:1000;flex-shrink:0">
        <app-sidebar (navigate)="onNavigate($event)" />
      </div>

      <!-- Main content -->
      <div class="flex-grow-1 d-flex flex-column overflow-hidden">
        <!-- Mobile topbar -->
        <div class="d-md-none d-flex align-items-center gap-2 px-3 py-2 bg-dark text-white border-bottom">
          <button class="btn btn-sm btn-outline-secondary" (click)="sidebarOpen.set(!sidebarOpen())">
            <i class="bi bi-list"></i>
          </button>
          <span class="fw-semibold">Agent <span class="text-primary">ILCS</span></span>
        </div>

        <!-- Views -->
        <app-chat *ngIf="view() === 'chat'" class="flex-grow-1 overflow-hidden d-flex flex-column" />
        <app-etudiants *ngIf="view() === 'etudiants'" class="flex-grow-1 overflow-hidden d-flex flex-column" />
      </div>
    </div>
  `
})
export class AppComponent {
  view = signal<'chat' | 'etudiants'>('chat');
  sidebarOpen = signal(true);

  onNavigate(v: 'chat' | 'etudiants') {
    this.view.set(v);
  }
}
