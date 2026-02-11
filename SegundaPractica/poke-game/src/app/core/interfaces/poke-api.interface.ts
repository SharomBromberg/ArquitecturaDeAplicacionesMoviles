export interface PokeApiResponse {
  id: number;
  name: string;
  sprites: {
    other: {
      'official-artwork': { front_default: string };
    };
  };
  types: Array<{ type: { name: string } }>;
  abilities: Array<{ ability: { name: string } }>;
}

//Con esto los cambios en la pokeapi no rompen la capa de dominio.
