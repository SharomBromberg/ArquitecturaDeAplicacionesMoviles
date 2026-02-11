import { Component, OnInit } from '@angular/core';
import { PokemonEntity } from '../../core/entities/pokemon.entity';
import { PokeService } from 'src/app/core/services/poke.service';
import { DatabaseService } from 'src/app/core/services/database.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
  standalone: false,
})
export class GamePage implements OnInit {
  currentPokemon: PokemonEntity | null = null;
  userGuess: string = '';
  score: number = 0;
  highScore: number = 0;
  loading: boolean = false;
  message: string = '¿Quién es este Pokémon?';

  constructor(
    private pokeService: PokeService,
    private dbService: DatabaseService,
  ) {}

  ngOnInit() {
    this.highScore = this.dbService.getHighScore();
    this.loadNewPokemon();
  }

  loadNewPokemon() {
    this.loading = true;
    const randomId = Math.floor(Math.random() * 151) + 1;
    this.pokeService.getPokemoById(randomId).subscribe({
      next: (p) => {
        this.currentPokemon = p;
        this.loading = false;
        this.userGuess = '';
      },
      error: () => {
        this.loading = false;
        this.message = 'Error de conexión';
      },
    });
  }

  checkAnswer() {
    if (!this.currentPokemon) return;
    if (
      this.userGuess.toLowerCase().trim() ===
      this.currentPokemon.name.toLowerCase()
    ) {
      this.currentPokemon.reveal();
      this.score++;
      this.dbService.saveHighScore(this.score);
      this.highScore = this.dbService.getHighScore();
      this.message = `¡Correcto! Es ${this.currentPokemon.name.toUpperCase()}`;
      setTimeout(() => {
        this.message = '¿Quién es este Pokémon?';
        this.loadNewPokemon();
      }, 2500);
    } else {
      this.message = 'Inténtalo de nuevo...';
    }
  }
}
