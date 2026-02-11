import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerformanceListComponent } from './performance-list/performance-list.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [PerformanceListComponent],
  imports: [CommonModule, IonicModule],
  exports: [PerformanceListComponent],
})
export class ComponentsModule {}
