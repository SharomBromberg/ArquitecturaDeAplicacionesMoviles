//Los servicios son la capa de infraestructura donde se implementan las lógicas de negocio
import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private tasks: Task[] = [];
  private readonly STORAGE_KEY = 'Task_list';

  constructor() {
    this.loadFromStorage();
  }

  // Necesitamos cargar las tareas guardas en el navegador  al iniciar el servicio
  private loadFromStorage() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      this.tasks = JSON.parse(saved);
    }
  }
  private saveToStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks));
  }

  getTasks(): Task[] {
    return this.tasks;
  }

  addTask(title: string) {
    const newId = Date.now();
    this.tasks.push(new Task(newId, title));
    this.saveToStorage();
  }

  toggleTask(id: number) {
    const task = this.tasks.find((t) => t.id === id);
    if (task) task.completed = !task.completed;
    this.saveToStorage();
  }
}
