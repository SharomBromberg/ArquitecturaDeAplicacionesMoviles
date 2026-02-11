import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private readonly KEY = ' poke_hig_score ';
  constructor() {}

  saveHighScore(score: number): void {
    const current = this.getHighScore();
    if (score > current) {
      localStorage.setItem(this.KEY, score.toString());
    }
  }

  getHighScore(): number {
    const saved = localStorage.getItem(this.KEY);
    return saved ? parseInt(saved, 10) : 0;
  }
}
