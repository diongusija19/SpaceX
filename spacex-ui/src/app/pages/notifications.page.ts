import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService, NotificationItem } from '../services/notifications.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.css']
})
export class NotificationsPage {
  items: NotificationItem[] = [];

  constructor(
    private notifications: NotificationsService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.auth.ensure().subscribe(() => this.load());
  }

  load() {
    this.notifications.list().subscribe(list => {
      this.items = list;
      this.cdr.detectChanges();
    });
  }

  markRead(item: NotificationItem) {
    this.notifications.markRead(item.id).subscribe(() => this.load());
  }

  markAll() {
    this.notifications.markAll().subscribe(() => this.load());
  }
}
