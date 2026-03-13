import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PipelinesService, PipelineDetail, PipelineRun } from '../services/pipelines.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-pipeline-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pipeline-detail.page.html',
  styleUrls: ['./pipeline-detail.page.css']
})
export class PipelineDetailPage {
  detail: PipelineDetail | null = null;
  selectedRunId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private pipelines: PipelinesService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.auth.ensure().subscribe(() => this.load(id));
  }

  load(id: number) {
    this.pipelines.get(id).subscribe(d => {
      this.detail = d;
      if (!this.selectedRunId && d.runs.length > 0) {
        this.selectedRunId = d.runs[0].id;
      }
      this.cdr.detectChanges();
    });
  }

  selectRun(run: PipelineRun) {
    this.selectedRunId = run.id;
  }

  selectedRun() {
    if (!this.detail) return null;
    return this.detail.runs.find(r => r.id === this.selectedRunId) ?? null;
  }
}
