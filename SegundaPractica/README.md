# Guía Paso a Paso — Crear PokeGame Pro desde Cero

Esta guía te lleva desde un proyecto vacío hasta una app de trivia con Angular + Ionic que integra PokeAPI v2, mostrando la silueta del Pokémon y gestionando un récord local, aplicando principios de Arquitectura Limpia.

## Prerrequisitos

- Node.js v18+ (recomendado)
- Ionic CLI (opcional global)

```bash
npm install -g @ionic/cli
```

## 1. Crear el proyecto modular (Sin standalone)

```bash
ionic start poke-game blank --type=angular --no-standalone
```

Por qué: Crea una base Ionic + Angular sin standalone, ideal para un proyecto modular que separa presentación de dominio/infraestructura.

## 2. Entrar al directorio

```bash
cd poke-game
```

## 3. Creación de carpetas de Dominio e Infraestructura

```bash
mkdir src\app\core\interfaces
mkdir src\app\core\entities

```

## 4. Generación de Servicios

```bash
ionic g service core/services/poke
ionic g service core/services/database
```

## 5. Generación de Módulo de Funcionalidad

```bash
ionic g module features/game --routing
ionic g page features/game/game
```

## 2. Estructura de carpetas (capas)

Crea las carpetas para cada capa:

- Dominio: `src/app/core/entities`, `src/app/core/interfaces`
- Infraestructura: `src/app/core/services`
- Presentación: `src/app/features/game`

Justificación: Clean Architecture separa responsabilidades; el dominio es estable y no depende de la UI ni de servicios externos.

## 3. Configurar AppModule e importar HttpClient

Edita `src/app/app.module.ts` para usar Ionic y HTTP:

```ts
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";
import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { HttpClientModule } from "@angular/common/http";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

## 4. Rutas de aplicación

Configura la navegación principal (redirigir a juego e importar módulo perezoso): `src/app/app-routing.module.ts`

```ts
import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "game",
    loadChildren: () =>
      import("./features/game/game.module").then((m) => m.GamePageModule),
  },
  { path: "", redirectTo: "game", pathMatch: "full" },
  { path: "**", redirectTo: "game" },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
```

Por qué: La presentación (rutas/UI) depende del dominio, no al revés. Lazy loading mejora rendimiento móvil.

## 5. Crear el módulo y ruteo del feature Juego

Genera el módulo y la página de juego (ya hecho en el paso anterior con Ionic CLI).

Ajusta el ruteo del feature: `src/app/features/game/game-routing.module.ts`

```ts
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { GamePage } from "./game.page";

const routes: Routes = [{ path: "", component: GamePage }];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class GamePageRoutingModule {}
```

## 6. Contratos de Dominio (Interfaces)

Define qué es un Pokémon en el dominio: `src/app/core/interfaces/pokemon.interface.ts`

```ts
export interface IPokemon {
  id: number;
  name: string;
  imageUrl: string;
  types: string[];
  abilities: string[];
}
```

Define el DTO externo (PokeAPI): `src/app/core/interfaces/poke-api.interface.ts`

```ts
/**
 * DTO (Data Transfer Object)
 * Contrato específico para la respuesta externa de PokeAPI.
 */
export interface PokeApiResponse {
  id: number;
  name: string;
  sprites: {
    other: {
      "official-artwork": { front_default: string };
    };
  };
  types: Array<{ type: { name: string } }>;
  abilities: Array<{ ability: { name: string } }>;
}
```

Por qué: Abstracción. Interfaces clarifican el "qué" sin importar el "cómo". El dominio no conoce detalles de infraestructura.

## 7. Entidad de Dominio

Implementa la entidad con comportamiento: `src/app/core/entities/pokemon.entity.ts`

```ts
import { IPokemon } from "../interfaces/pokemon.interface";

export class Pokemon implements IPokemon {
  constructor(
    public id: number,
    public name: string,
    public imageUrl: string,
    public types: string[],
    public abilities: string[],
    public isHidden: boolean = true,
  ) {}

  // Lógica visual mínima encapsulada en el dominio
  getSpriteFilter(): string {
    return this.isHidden ? "brightness(0%)" : "brightness(100%)";
  }

  reveal(): void {
    this.isHidden = false;
  }

  // Pistas: letras inicial y final
  getFirstLetter(): string {
    return this.name ? this.name.charAt(0).toUpperCase() : "";
  }

  getLastLetter(): string {
    return this.name
      ? this.name.charAt(this.name.length - 1).toUpperCase()
      : "";
  }
}
```

Por qué: Encapsulamiento. La UI se simplifica; el dominio conserva el estado/behavior.

## 8. Servicios (Infraestructura)

### 8.1 PokeService (consumo PokeAPI + Data Mapper)

`src/app/core/services/poke.service.ts`

```ts
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Pokemon } from "../entities/pokemon.entity";
import { PokeApiResponse } from "../interfaces/poke-api.interface";

@Injectable({ providedIn: "root" })
export class PokeService {
  private readonly baseUrl: string = "https://pokeapi.co/api/v2/pokemon";

  constructor(private http: HttpClient) {}

  getPokemonById(id: number): Observable<Pokemon> {
    return this.http.get<PokeApiResponse>(`${this.baseUrl}/${id}`).pipe(
      map((res: PokeApiResponse) => {
        const types = res.types.map((t) => t.type.name);
        const image = res.sprites.other["official-artwork"].front_default;
        const abilities = res.abilities.map((a) => a.ability.name);
        return new Pokemon(res.id, res.name, image, types, abilities);
      }),
    );
  }
}
```

Por qué: Data Mapper traduce JSON externo (DTO) a entidad del dominio.

### 8.2 DatabaseService (persistencia local)

`src/app/core/services/database.service.ts`

```ts
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class DatabaseService {
  private readonly KEY = "poke_high_score";
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
```

Por qué: Infraestructura aislada. Puedes cambiar a SQLite/Capacitor Storage sin tocar el dominio ni la UI.

## 9. Presentación — GamePage

### 9.1 Módulo del feature

`src/app/features/game/game.module.ts`

```ts
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { GamePageRoutingModule } from "./game-routing.module";
import { GamePage } from "./game.page";

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, GamePageRoutingModule],
  declarations: [GamePage],
})
export class GamePageModule {}
```

### 9.2 Lógica de la página

`src/app/features/game/game.page.ts`

```ts
import { Component, OnInit } from "@angular/core";
import { Pokemon } from "src/app/core/entities/pokemon.entity";
import { DatabaseService } from "src/app/core/services/database.service";
import { PokeService } from "src/app/core/services/poke.service";

@Component({
  selector: "app-game",
  templateUrl: "./game.page.html",
  styleUrls: ["./game.page.scss"],
  standalone: false,
})
export class GamePage implements OnInit {
  currentPokemon: Pokemon | null = null;
  userGuess: string = "";
  score: number = 0;
  highScore: number = 0;
  loading: boolean = false;
  message: string = "¿Quién es este Pokémon?";

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
    this.pokeService.getPokemonById(randomId).subscribe({
      next: (p) => {
        this.currentPokemon = p;
        this.loading = false;
        this.userGuess = "";
      },
      error: () => {
        this.loading = false;
        this.message = "Error de conexión";
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
        this.message = "¿Quién es este Pokémon?";
        this.loadNewPokemon();
      }, 2500);
    } else {
      this.message = "Inténtalo de nuevo...";
    }
  }
}
```

### 9.3 Template

`src/app/features/game/game.page.html`

```html
<ion-header class="ion-no-border">
  <ion-toolbar color="danger">
    <ion-title>PokeGame Pro</ion-title>
    <ion-buttons slot="end">
      <ion-badge color="dark" class="ion-margin-end"
        >Record: {{ highScore }}</ion-badge
      >
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-padding ion-text-center">
  <div *ngIf="loading" class="ion-padding">
    <ion-spinner name="crescent" color="danger"></ion-spinner>
    <p>Buscando en la hierba alta...</p>
  </div>

  <div *ngIf="currentPokemon && !loading">
    <div class="score-display">
      <ion-text color="medium">
        <p>PUNTOS</p>
      </ion-text>
      <h1>{{ score }}</h1>
    </div>

    <div class="pokemon-container">
      <img
        [src]="currentPokemon.imageUrl"
        [style.filter]="currentPokemon.getSpriteFilter()"
        class="pokemon-img" />
    </div>

    <h2 class="status-message">{{ message }}</h2>

    <!-- Pistas -->
    <ion-card *ngIf="currentPokemon" class="ion-margin-bottom">
      <ion-card-header>
        <ion-card-title>Pistas</ion-card-title>
        <ion-card-subtitle>
          Empieza con: <strong>{{ currentPokemon.getFirstLetter() }}</strong> ·
          Termina con: <strong>{{ currentPokemon.getLastLetter() }}</strong>
        </ion-card-subtitle>
      </ion-card-header>
      <ion-card-content>
        <!-- Tipos -->
        <div class="ion-margin-bottom">
          <ion-chip color="primary" *ngFor="let t of currentPokemon.types">
            <ion-label>{{ t }}</ion-label>
          </ion-chip>
        </div>

        <!-- Tipos de claves (resaltos) -->
        <div class="ion-margin-bottom">
          <ion-text color="medium">Tipos de claves:</ion-text>
          <div class="ion-margin-top">
            <ion-chip
              color="tertiary"
              *ngIf="currentPokemon.types?.includes('flying')">
              <ion-label>flying</ion-label>
            </ion-chip>
            <ion-chip
              color="tertiary"
              *ngIf="currentPokemon.types?.includes('water')">
              <ion-label>water</ion-label>
            </ion-chip>
            <ion-chip
              color="tertiary"
              *ngIf="currentPokemon.types?.includes('fire')">
              <ion-label>fire</ion-label>
            </ion-chip>
          </div>
        </div>

        <!-- Habilidades -->
        <div>
          <ion-text color="medium">Talento:</ion-text>
          <div class="ion-margin-top">
            <ion-badge
              class="ion-margin"
              color="dark"
              *ngFor="let ab of currentPokemon.abilities">
              {{ ab }}
            </ion-badge>
          </div>
        </div>
      </ion-card-content>
    </ion-card>

    <ion-item lines="none" class="input-card">
      <ion-input
        [(ngModel)]="userGuess"
        placeholder="Nombre del Pokémon"
        [disabled]="!currentPokemon.isHidden"
        (keyup.enter)="checkAnswer()"
        class="ion-text-center">
      </ion-input>
    </ion-item>

    <ion-button
      expand="block"
      shape="round"
      color="danger"
      (click)="checkAnswer()"
      [disabled]="!userGuess || !currentPokemon.isHidden">
      ¡Atrapar!
    </ion-button>
  </div>
</ion-content>
```

## 10. Estilos (opcional)

Ajusta estilos en `src/app/features/game/game.page.scss` y variables globales en `src/theme/variables.scss` para una UI agradable.

## 11. Ejecutar la app

```bash
ionic serve
```

Abre http://localhost:8100.

## 12. Pruebas unitarias

Ejecuta las pruebas:

```bash
npm test
```

Consulta ejemplos en:

- [src/app/core/services/database.spec.ts](../src/app/core/services/database.spec.ts)
- [src/app/core/services/poke.spec.ts](../src/app/core/services/poke.spec.ts)

## 13. Extensiones (opcional)

- Pistas: mostrar habilidades de PokeAPI, letras inicial/final del nombre, resaltar tipos clave.
- Traducción dinámica de tipos: integrar un `TranslationService` con LibreTranslate/Google (evita diccionario manual).
- Casos de uso dedicados: extraer `checkAnswer()` y `loadNewPokemon()` a la capa de Aplicación.
- Cache offline: persistir últimos Pokémon o imágenes.

## 14. Razones arquitectónicas (resumen)

- **Encapsulamiento:** `Pokemon` contiene comportamiento visual mínimo (silueta) para que la UI sea simple.
- **Abstracción:** `IPokemon` y `PokeApiResponse` separan contrato de dominio y DTO externo.
- **Data Mapper:** `PokeService` traduce JSON externo a una entidad útil y estable.
- **Regla de Dependencia:** Presentación/infraestructura dependen del dominio; el dominio es independiente.

## 15. Arquitectura y Diagrama (Alineación)

Este proyecto sigue una separación clara de capas que coincide con el diagrama provisto en la carpeta de la Segunda Practica.

- **Dominio:** `IPokemon` (contrato) y `Pokemon` (entidad con estado `isHidden` y métodos `getSpriteFilter()`/`reveal()`), sin dependencias de Angular/Ionic.
- **Infraestructura:** `PokeService` (consumo de PokeAPI y mapeo a `Pokemon`) y `DatabaseService` (persistencia local del récord vía `localStorage`).
- **Presentación:** `GamePage` coordina la interacción, muestra la silueta, verifica la respuesta y actualiza `score` y `highScore`.

Pequeños ajustes recomendados para que el diagrama refleje 100% la guía:

- **Entidad/Contrato:** incluir `abilities: string[]` tanto en `IPokemon` como en `Pokemon` (se usan en la UI y están en el mapeo del servicio).
- **DTO externo:** especificar en `PokeApiResponse` las rutas reales usadas: `sprites.other["official-artwork"].front_default`, colecciones `types` y `abilities`.
- **Página de juego:** añadir `highScore: number` y `message: string` (se usan en la lógica y plantilla); evitar duplicar `score`.
- **Dependencias:** asegurar flechas unidireccionales: Presentación → Dominio; Infraestructura → Dominio. El Dominio no depende de Angular/Ionic.

Con estos ajustes, el diagrama queda totalmente alineado con la arquitectura y el flujo descritos en la guía.
