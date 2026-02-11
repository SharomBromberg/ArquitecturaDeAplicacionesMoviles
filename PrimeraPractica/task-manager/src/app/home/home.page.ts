import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonList,
  IonLabel,
  IonCheckbox,
} from '@ionic/angular/standalone';
import { TaskService } from '../services/task.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonList,
    IonLabel,
    IonCheckbox,
  ],
})

//Este componente va a actuar como el ViewModel en la arquitectura MVVM
//hace parte de la capa de la capa de presentación
export class HomePage {
  newTaskTitle: string = '';

  //Inyección de dependencias, no se está creando el servicio aquí mismo, solo lo estamos pidiendo
  constructor(public taskService: TaskService) {}

  saveTask() {
    if (this.newTaskTitle.trim().length > 0) {
      this.taskService.addTask(this.newTaskTitle);
      this.newTaskTitle = '';
    }
  }

  //UX
  //Se estan recolctando los datos el formulario
  //validando que el campo no esté vacío
  //Mas inputs, imagenes, vídeos, uploader...
}
