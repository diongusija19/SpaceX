import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PipelinesService, PipelineDetail } from '../services/pipelines.service';
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
      this.cdr.detectChanges();
    });
  }
}
