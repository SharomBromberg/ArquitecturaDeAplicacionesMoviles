import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PokemonEntity } from '../entities/pokemon.entity';
import { map, Observable } from 'rxjs';
import { PokeApiResponse } from '../interfaces/poke-api.interface';

@Injectable({
  providedIn: 'root',
})
// DI servicio para obtener datos de la pokeapi
export class PokeService {
  private readonly apiUrl: string = ' https://pokeapi.co/api/v2/pokemon/';

  constructor(private http: HttpClient) {}

  //Obtener un objeto (pkemon) por su id
  //La función lo va a mapear a la entidad de dominio (PokemonEntity)
  //Esa  entidad  junto con el servicio evitarán que la UI maneje el dato crudo (JSON)

  public getPokemoById(id: number): Observable<PokemonEntity> {
    return this.http.get<PokeApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map((res: PokeApiResponse) => {
        const type = res.types.map((t) => t.type.name);
        const image = res.sprites.other['official-artwork'].front_default;
        const abilities = res.abilities.map((a) => a.ability.name);

        return new PokemonEntity(res.id, res.name, image, type, abilities);
      }),
    );
  }
}
