import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResourcesService, Resource } from '../services/resources.service';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './resources.page.html'
})
export class ResourcesPage {
  resources: Resource[] = [];
  type = 'all';
  status = 'all';
  region = 'all';

  name = '';
  createType = 'vm';
  createRegion = 'east-us';
  createSize = 'small';

  constructor(
    private service: ResourcesService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.auth.ensure().subscribe(() => this.load());
  }

  load() {
    this.service.list({ type: this.type, status: this.status, region: this.region }).subscribe(r => {
      this.resources = r;
      this.cdr.detectChanges();
    });
  }

  create() {
    if (!this.name.trim()) return;
    this.service.create({
      name: this.name.trim(),
      type: this.createType,
      region: this.createRegion,
      size: this.createSize
    }).subscribe(() => {
      this.name = '';
      this.load();
    });
  }
}
