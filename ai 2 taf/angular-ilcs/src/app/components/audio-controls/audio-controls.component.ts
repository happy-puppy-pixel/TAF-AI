import { Component, inject, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService } from '../../services/audio.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-audio-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audio-controls.component.html',
  styleUrls: ['./audio-controls.component.css']
})
export class AudioControlsComponent implements OnInit, OnDestroy {
  audioService = inject(AudioService);
  
  isRecording = false;
  isSupported = false;
  transcript = '';
  
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    this.isSupported = this.audioService.isSpeechRecognitionSupported();
    
    this.subscriptions.push(
      this.audioService.isRecording$.subscribe(recording => {
        this.isRecording = recording;
      })
    );
    
    this.subscriptions.push(
      this.audioService.transcript$.subscribe(transcript => {
        if (transcript) {
          this.transcript = transcript;
          this.onTranscriptReady(transcript);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.isRecording) {
      this.audioService.stopRecording();
    }
  }

  async toggleRecording() {
    if (this.isRecording) {
      this.audioService.stopRecording();
    } else {
      try {
        await this.audioService.startRecording();
        this.transcript = '';
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    }
  }

  onTranscriptReady(transcript: string) {
    // This will be handled by the parent component
    this.onTranscript.emit(transcript);
  }

  speakLastResponse(response: string) {
    if (this.audioService.isSpeechSynthesisSupported()) {
      this.audioService.speak(response);
    }
  }

  stopSpeaking() {
    this.audioService.stopSpeaking();
  }

  @Output() onTranscript = new EventEmitter<string>();
}
