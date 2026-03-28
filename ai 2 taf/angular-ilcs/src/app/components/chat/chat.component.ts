import {
  Component, inject, ElementRef, ViewChild,
  AfterViewChecked, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { AgentService } from '../../services/agent.service';
import { AudioService } from '../../services/audio.service';
import { Message } from '../../models/models';
import { AudioControlsComponent } from '../audio-controls/audio-controls.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, AudioControlsComponent],
  templateUrl: './chat.component.html'
})
export class ChatComponent implements AfterViewChecked, OnInit {
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  chatService = inject(ChatService);
  agentService = inject(AgentService);
  audioService = inject(AudioService);

  question = '';
  isLoading = false;
  selectedFile: File | null = null;
  dragOver = false;
  private shouldScroll = false;

  ngOnInit() {
    if (!this.chatService.activeSessionId()) {
      this.chatService.createSession();
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  scrollToBottom() {
    try {
      this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  }

  get activeSession() {
    return this.chatService.activeSession;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.selectedFile = input.files[0];
  }

  removeFile() {
    this.selectedFile = null;
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  onDragOver(e: DragEvent) { e.preventDefault(); this.dragOver = true; }
  onDragLeave() { this.dragOver = false; }
  onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragOver = false;
    const file = e.dataTransfer?.files[0];
    if (file) this.selectedFile = file;
  }

  handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); }
  }

  send() {
    const text = this.question.trim();
    if (!text || this.isLoading) return;

    let sessionId = this.chatService.activeSessionId();
    if (!sessionId) {
      const s = this.chatService.createSession();
      sessionId = s.id;
    }

    // Add user message
    this.chatService.addMessage(sessionId, { role: 'user', text, timestamp: new Date() });

    // Add AI placeholder (typing)
    this.chatService.addMessage(sessionId, { role: 'ai', text: '', timestamp: new Date(), isTyping: true });

    this.question = '';
    this.isLoading = true;
    this.shouldScroll = true;

    const file = this.selectedFile;
    this.selectedFile = null;
    if (this.fileInput) this.fileInput.nativeElement.value = '';

    const obs = file
        ? this.agentService.askWithFile(text, file)
        : this.agentService.askQuestion(text);

    obs.subscribe({
      next: (chunk: string) => {
        this.chatService.appendToLastAiMessage(sessionId!, chunk);
        this.shouldScroll = true;
      },
      error: () => {
        this.chatService.appendToLastAiMessage(
            sessionId!,
            '❌ Erreur de connexion. Vérifiez que le serveur Spring Boot est lancé sur le port 8080.'
        );
        this.isLoading = false;
        this.shouldScroll = true;
      },
      complete: () => {
        this.chatService.updateLastAiTyping(sessionId!, false);
        this.isLoading = false;
        this.shouldScroll = true;
      }
    });
  }

  copyText(text: string) {
    navigator.clipboard.writeText(text);
  }

  getFileIcon(name: string): string {
    if (name?.endsWith('.pdf')) return 'bi-file-pdf text-danger';
    if (name?.endsWith('.txt')) return 'bi-file-text text-info';
    if (name?.endsWith('.csv')) return 'bi-file-spreadsheet text-success';
    if (name?.endsWith('.jpg') || name?.endsWith('.jpeg') || name?.endsWith('.png') || 
        name?.endsWith('.gif') || name?.endsWith('.bmp') || name?.endsWith('.webp')) {
      return 'bi-file-image text-warning';
    }
    if (name?.endsWith('.md')) return 'bi-file-code text-secondary';
    return 'bi-file-earmark text-secondary';
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  onAudioTranscript(transcript: string) {
    this.question = transcript;
    // Auto-send after a short delay if it looks like a complete sentence
    if (transcript.trim().endsWith('.') || transcript.trim().endsWith('?') || transcript.trim().endsWith('!')) {
      setTimeout(() => {
        if (this.question.trim()) {
          this.send();
        }
      }, 1000);
    }
  }

  speakResponse(response: string) {
    if (this.audioService.isSpeechSynthesisSupported()) {
      this.audioService.speak(response);
    }
  }

  stopSpeaking() {
    this.audioService.stopSpeaking();
  }
}