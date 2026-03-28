import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import RecordRTC from 'recordrtc';

// Extend the Window interface to include speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

@Injectable({ providedIn: 'root' })
export class AudioService {
  private mediaRecorder: RecordRTC | null = null;
  private recognition: any = null;
  private synthesis: SpeechSynthesis;
  private isRecordingSubject = new Subject<boolean>();
  private transcriptSubject = new Subject<string>();

  isRecording$ = this.isRecordingSubject.asObservable();
  transcript$ = this.transcriptSubject.asObservable();

  constructor(private zone: NgZone) {
    this.synthesis = window.speechSynthesis;
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'fr-FR';

      this.recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          this.zone.run(() => {
            this.transcriptSubject.next(finalTranscript);
          });
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.zone.run(() => {
          this.isRecordingSubject.next(false);
        });
      };

      this.recognition.onend = () => {
        this.zone.run(() => {
          this.isRecordingSubject.next(false);
        });
      };
    }
  }

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (this.recognition) {
        this.recognition.start();
        this.zone.run(() => {
          this.isRecordingSubject.next(true);
        });
      } else {
        // Fallback: RecordRTC for browsers without Speech Recognition
        this.mediaRecorder = new RecordRTC(stream, {
          type: 'audio',
          mimeType: 'audio/webm'
        });
        this.mediaRecorder.startRecording();
        this.zone.run(() => {
          this.isRecordingSubject.next(true);
        });
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw new Error('Impossible d\'accéder au microphone');
    }
  }

  stopRecording(): void {
    if (this.recognition) {
      this.recognition.stop();
    } else if (this.mediaRecorder) {
      this.mediaRecorder.stopRecording(() => {
        const blob = this.mediaRecorder!.getBlob();
        this.processAudioBlob(blob);
        this.mediaRecorder!.destroy();
        this.mediaRecorder = null;
      });
    }
  }

  private async processAudioBlob(blob: Blob): Promise<void> {
    // This would send the audio to a speech-to-text API
    // For now, we'll use a placeholder
    console.log('Audio blob recorded:', blob);
  }

  speak(text: string): void {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    this.synthesis.speak(utterance);
  }

  stopSpeaking(): void {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
  }

  isSpeechRecognitionSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  isSpeechSynthesisSupported(): boolean {
    return 'speechSynthesis' in window;
  }
}
