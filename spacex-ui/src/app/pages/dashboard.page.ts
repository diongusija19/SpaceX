import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SummaryService, Summary } from '../services/summary.service';
import { ResourcesService, Resource } from '../services/resources.service';
import { AuthService } from '../services/auth.service';

declare const Chart: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.css']
})
export class DashboardPage implements AfterViewInit {
  summary: Summary | null = null;
  recent: Resource[] = [];

  constructor(
    private summaryService: SummaryService,
    private resources: ResourcesService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    this.auth.ensure().subscribe(() => {
      this.summaryService.get().subscribe(s => {
        this.summary = s;
        this.cdr.detectChanges();
        this.renderCharts();
      });

      this.resources.list().subscribe(list => {
        this.recent = list.slice(0, 5);
        this.cdr.detectChanges();
      });
    });
  }

  renderCharts() {
    if (!this.summary) return;

    const typeCtx = document.getElementById('typeChart') as HTMLCanvasElement | null;
    if (typeCtx) {
      new Chart(typeCtx, {
        type: 'doughnut',
        data: {
          labels: ['VM', 'Storage', 'Database'],
          datasets: [{
            data: [this.summary.types.vm, this.summary.types.storage, this.summary.types.db],
            backgroundColor: ['#2563EB', '#10B981', '#F59E0B']
          }]
        },
        options: { plugins: { legend: { position: 'bottom' } }, cutout: '60%' }
      });
    }

    const statusCtx = document.getElementById('statusChart') as HTMLCanvasElement | null;
    if (statusCtx) {
      new Chart(statusCtx, {
        type: 'bar',
        data: {
          labels: ['Running', 'Stopped', 'Provisioning'],
          datasets: [{
            data: [this.summary.running, this.summary.stopped, this.summary.provisioning],
            backgroundColor: ['#16A34A', '#DC2626', '#F59E0B']
          }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
      });
    }
  }
}
