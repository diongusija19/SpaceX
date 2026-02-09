import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegionsService, RegionSummary } from '../services/regions.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-regions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './regions.page.html',
  styleUrls: ['./regions.page.css']
})
export class RegionsPage {
  regions: RegionSummary[] = [];

  constructor(
    private regionsService: RegionsService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.auth.ensure().subscribe(() => this.load());
  }

  load() {
    this.regionsService.list().subscribe(rows => {
      this.regions = rows;
      this.cdr.detectChanges();
    });
  }

  totalResources() {
    return this.regions.reduce((sum, r) => sum + r.total, 0);
  }
}
