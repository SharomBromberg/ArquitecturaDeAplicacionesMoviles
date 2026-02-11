import { PokemonInterface } from '../interfaces/pokemon.interface';

// La entidad mantiene el estado y el comportamiento del juego sin depender de la ui ni de las APIs

export class PokemonEntity implements PokemonInterface {
  constructor(
    public id: number,
    public name: string,
    public imageUrl: string,
    public types: string[],
    public abilities: string[],
    public isHidden: boolean = true,
  ) {}

  getSpriteFilter(): string {
    // logica visual minima para ocultar el pokemon
    return this.isHidden ? 'brightness(0%)' : 'brightness(100%)';
  }

  reveal(): void {
    //Muestra el pokemon al acertar
    this.isHidden = false;
  }

  //Metodos e pistas: Esto sirve pra mantener la UI Simple.

  getFirstLetter(): string {
    return this.name ? this.name.charAt(0).toUpperCase() : '';
  }

  getLastLetter(): string {
    return this.name
      ? this.name.charAt(this.name.length - 1).toUpperCase()
      : '';
  }
}
