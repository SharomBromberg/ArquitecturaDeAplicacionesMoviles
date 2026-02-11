import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { PerformanceInterface } from 'src/app/interfaces/performance.interface';

@Component({
  selector: 'app-performance-list',
  templateUrl: './performance-list.component.html',
  styleUrls: ['./performance-list.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerformanceListComponent implements OnInit {
  @Input() items: PerformanceInterface[] = [];

  constructor() {}
  ngOnInit(): void {}

  //Optmización de RAM y DOM con trackByFn para evitar renderizados innecesarios
  trackByFn(index: number, item: PerformanceInterface): number {
    return item.id;
  }
}
