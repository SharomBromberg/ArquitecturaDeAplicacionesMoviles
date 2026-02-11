import { Component } from '@angular/core';
import { PerformanceInterface } from '../interfaces/performance.interface';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  public performanceData: PerformanceInterface[] = [];

  constructor() {}
  ngOnInit() {
    this.generateLoad(1000);
  }

  generateLoad(count: number) {
    const newData: PerformanceInterface[] = [];
    for (let i = 1; i <= count; i++) {
      newData.push({
        id: i,
        name: `proceso optimizado ${i}`,
        category: i % 2 === 0 ? 'Infraestructura' : 'Dominio',
      });
    }

    this.performanceData = newData;
  }

  refresh() {
    this.performanceData = [...this.performanceData].sort(
      () => Math.random() - 0.5,
    );
  }
}
