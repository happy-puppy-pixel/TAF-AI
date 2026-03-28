import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AgentService {
  private readonly API = 'http://localhost:8080';

  constructor(private zone: NgZone) {}

  // GET /askAgent — SSE via fetch (better control than EventSource)
  askQuestion(question: string): Observable<string> {
    return this.streamFetch(
        `${this.API}/askAgent?question=${encodeURIComponent(question)}`,
        { method: 'GET', headers: { Accept: 'text/event-stream' } }
    );
  }

  // POST /askAgentWithFile — SSE via fetch
  askWithFile(question: string, file?: File): Observable<string> {
    const formData = new FormData();
    formData.append('question', question);
    if (file) formData.append('file', file);
    return this.streamFetch(`${this.API}/askAgentWithFile`, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'text/event-stream' }
    });
  }

  // Core: fetch + ReadableStream + SSE parser
  private streamFetch(url: string, init: RequestInit): Observable<string> {
    return new Observable(observer => {
      let cancelled = false;

      fetch(url, init).then(async response => {
        if (!response.ok || !response.body) {
          this.zone.run(() => observer.error('Erreur serveur'));
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (!cancelled) {
          const { done, value } = await reader.read();
          if (done) break;

          // Accumulate chunks in buffer
          buffer += decoder.decode(value, { stream: true });

          // SSE format: each event is "data: <text>\n\n"
          // Split on double newline to get complete events
          const events = buffer.split('\n\n');

          // Last element may be incomplete — keep it in buffer
          buffer = events.pop() ?? '';

          for (const event of events) {
            for (const line of event.split('\n')) {
              if (line.startsWith('data:')) {
                // Strip "data:" prefix, keep exactly what backend sent
                const chunk = line.slice(5);
                // Skip SSE control tokens
                if (chunk !== '[DONE]' && chunk.trim() !== '') {
                  this.zone.run(() => observer.next(chunk));
                }
              }
            }
          }
        }

        this.zone.run(() => observer.complete());
      }).catch(err => {
        if (!cancelled) this.zone.run(() => observer.error(err));
      });

      return () => { cancelled = true; };
    });
  }
}