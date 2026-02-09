import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PipelinesService, PipelineRow } from '../services/pipelines.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-pipelines',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pipelines.page.html',
  styleUrls: ['./pipelines.page.css']
})
export class PipelinesPage {
  rows: PipelineRow[] = [];
  name = '';
  repo = '';
  branch = 'main';

  constructor(
    private pipelines: PipelinesService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.auth.ensure().subscribe(() => this.load());
  }

  load() {
    this.pipelines.list().subscribe(list => {
      this.rows = list;
      this.cdr.detectChanges();
    });
  }

  create() {
    if (!this.name.trim() || !this.repo.trim()) return;
    this.pipelines.create(this.name.trim(), this.repo.trim(), this.branch.trim()).subscribe(() => {
      this.name = '';
      this.repo = '';
      this.branch = 'main';
      this.load();
    });
  }

  run(row: PipelineRow) {
    this.pipelines.run(row.id).subscribe(() => this.load());
  }
}
