import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Etudiant } from '../../models/models';

@Component({
  selector: 'app-etudiants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './etudiants.component.html'
})
export class EtudiantsComponent implements OnInit {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080';

  etudiants = signal<Etudiant[]>([]);
  isLoading = signal(false);
  error = signal('');

  searchType: 'all' | 'apogee' | 'nom' | 'filiere' | 'niveau' = 'all';
  searchValue = '';

  averageNote = computed(() => {
    const arr = this.etudiants();
    if (!arr.length) return 0;
    return +(arr.reduce((s, e) => s + e.note, 0) / arr.length).toFixed(2);
  });

  bestEtudiant = computed(() => {
    const arr = this.etudiants();
    if (!arr.length) return null;
    return arr.reduce((best, e) => e.note > best.note ? e : best);
  });

  admisCount = computed(() =>
      this.etudiants().filter(e => e.note >= 10).length
  );

  ngOnInit() { this.loadAll(); }

  loadAll() {
    this.isLoading.set(true);
    this.error.set('');
    this.http.get<Etudiant[]>(`${this.API}/etudiants`).subscribe({
      next: (data) => { this.etudiants.set(data); this.isLoading.set(false); },
      error: () => {
        this.error.set('Impossible de charger les étudiants. Vérifiez que le serveur est lancé sur le port 8080.');
        this.isLoading.set(false);
      }
    });
  }

  search() {
    this.isLoading.set(true);
    this.error.set('');
    const val = this.searchValue.trim();
    let url = `${this.API}/etudiants`;
    if (this.searchType === 'apogee')   url += `/apogee/${val}`;
    else if (this.searchType === 'nom') url += `/search?nom=${encodeURIComponent(val)}`;
    else if (this.searchType === 'filiere') url += `/filiere/${val}`;
    else if (this.searchType === 'niveau')  url += `/niveau/${val}`;
    this.http.get<Etudiant[]>(url).subscribe({
      next: (data) => { this.etudiants.set(data); this.isLoading.set(false); },
      error: () => { this.error.set('Erreur lors de la recherche.'); this.isLoading.set(false); }
    });
  }

  reset() {
    this.searchValue = '';
    this.searchType = 'all';
    this.loadAll();
  }

  isBest(e: Etudiant): boolean {
    return e.apogee === this.bestEtudiant()?.apogee;
  }

  getMentionClass(note: number): string {
    if (note >= 16) return 'text-success fw-semibold';
    if (note >= 14) return 'text-primary';
    if (note >= 12) return 'text-info';
    if (note >= 10) return 'text-warning';
    return 'text-danger';
  }

  getMentionLabel(note: number): string {
    if (note >= 16) return 'Très Bien';
    if (note >= 14) return 'Bien';
    if (note >= 12) return 'Assez Bien';
    if (note >= 10) return 'Passable';
    return 'Insuffisant';
  }

  getProgressClass(note: number): string {
    if (note >= 16) return 'bg-success';
    if (note >= 14) return 'bg-primary';
    if (note >= 12) return 'bg-info';
    if (note >= 10) return 'bg-warning';
    return 'bg-danger';
  }

  getProgressWidth(note: number): string {
    return ((note / 20) * 100) + '%';
  }

  getNiveauClass(niveau: string): string {
    if (niveau === '1A') return 'badge bg-info text-white';
    if (niveau === '2A') return 'badge bg-purple text-white';
    return 'badge bg-secondary text-white';
  }
}