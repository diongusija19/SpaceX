import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReposService, RepoDetail } from '../services/repos.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-repo-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './repo-detail.page.html',
  styleUrls: ['./repo-detail.page.css']
})
export class RepoDetailPage {
  detail: RepoDetail | null = null;
  message = '';

  constructor(
    private route: ActivatedRoute,
    private repos: ReposService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.auth.ensure().subscribe(() => this.load(id));
  }

  load(id: number) {
    this.repos.get(id).subscribe(d => {
      this.detail = d;
      this.cdr.detectChanges();
    });
  }

  commit() {
    if (!this.detail || !this.message.trim()) return;
    const repoId = this.detail.repo.id;
    this.repos.commit(repoId, this.message.trim()).subscribe(() => {
      this.message = '';
      this.load(repoId);
    });
  }
}
