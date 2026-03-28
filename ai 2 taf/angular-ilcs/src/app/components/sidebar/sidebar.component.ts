import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { ChatSession } from '../../models/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  @Output() navigate = new EventEmitter<'chat' | 'etudiants'>();

  chatService = inject(ChatService);
  currentView: 'chat' | 'etudiants' = 'chat';

  newChat() {
    this.chatService.createSession();
    this.currentView = 'chat';
    this.navigate.emit('chat');
  }

  selectSession(session: ChatSession) {
    this.chatService.setActive(session.id);
    this.currentView = 'chat';
    this.navigate.emit('chat');
  }

  deleteSession(e: Event, id: string) {
    e.stopPropagation();
    this.chatService.deleteSession(id);
  }

  goTo(view: 'chat' | 'etudiants') {
    this.currentView = view;
    this.navigate.emit(view);
  }
}
