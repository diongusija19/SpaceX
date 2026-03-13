import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReposService, RepoDetail, PullRequest } from '../services/repos.service';
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

  branchName = '';
  commitBranch = 'main';
  commitMessage = '';

  prSource = '';
  prTarget = 'main';
  prTitle = '';

  notice = '';
  error = '';

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
    this.repos.get(id).subscribe({
      next: d => {
        this.detail = d;
        this.commitBranch = d.repo.default_branch || 'main';
        this.prTarget = d.repo.default_branch || 'main';
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load repository.';
        this.cdr.detectChanges();
      }
    });
  }

  createBranch() {
    if (!this.detail || !this.branchName.trim()) return;
    const repoId = this.detail.repo.id;
    this.clearMessages();
    this.repos.createBranch(repoId, this.branchName.trim()).subscribe({
      next: () => {
        this.notice = 'Branch created.';
        this.branchName = '';
        this.load(repoId);
      },
      error: () => {
        this.error = 'Could not create branch.';
        this.cdr.detectChanges();
      }
    });
  }

  commit() {
    if (!this.detail || !this.commitMessage.trim()) return;
    const repoId = this.detail.repo.id;
    this.clearMessages();
    this.repos.commit(repoId, this.commitBranch, this.commitMessage.trim()).subscribe({
      next: () => {
        this.notice = 'Commit created.';
        this.commitMessage = '';
        this.load(repoId);
      },
      error: () => {
        this.error = 'Could not create commit.';
        this.cdr.detectChanges();
      }
    });
  }

  createPr() {
    if (!this.detail || !this.prSource || !this.prTarget || !this.prTitle.trim()) return;
    const repoId = this.detail.repo.id;
    this.clearMessages();
    this.repos.createPr(repoId, this.prSource, this.prTarget, this.prTitle.trim()).subscribe({
      next: () => {
        this.notice = 'Pull request opened.';
        this.prTitle = '';
        this.load(repoId);
      },
      error: () => {
        this.error = 'Could not open pull request.';
        this.cdr.detectChanges();
      }
    });
  }

  setPrStatus(pr: PullRequest, status: 'merged' | 'closed') {
    if (!this.detail) return;
    const repoId = this.detail.repo.id;
    this.clearMessages();
    this.repos.setPrStatus(repoId, pr.id, status).subscribe({
      next: () => {
        this.notice = `PR ${status}.`;
        this.load(repoId);
      },
      error: () => {
        this.error = 'Could not update PR status.';
        this.cdr.detectChanges();
      }
    });
  }

  clearMessages() {
    this.notice = '';
    this.error = '';
  }
}
