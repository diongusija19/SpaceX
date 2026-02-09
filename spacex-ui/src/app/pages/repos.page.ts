import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReposService, RepoRow } from '../services/repos.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-repos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './repos.page.html',
  styleUrls: ['./repos.page.css']
})
export class ReposPage {
  rows: RepoRow[] = [];
  name = '';
  branch = 'main';

  constructor(
    private repos: ReposService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.auth.ensure().subscribe(() => this.load());
  }

  load() {
    this.repos.list().subscribe(list => {
      this.rows = list;
      this.cdr.detectChanges();
    });
  }

  create() {
    if (!this.name.trim()) return;
    this.repos.create(this.name.trim(), this.branch.trim()).subscribe(() => {
      this.name = '';
      this.branch = 'main';
      this.load();
    });
  }
}
