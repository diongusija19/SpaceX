import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { NotificationsService, NotificationItem } from '../services/notifications.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css']
})
export class ShellLayout {
  notifications: NotificationItem[] = [];
  unread = 0;

  constructor(public auth: AuthService, private notificationsService: NotificationsService) {
    this.refreshNotifications();
  }

  refreshNotifications() {
    if (!this.auth.current) return;
    this.notificationsService.list().subscribe(list => {
      this.notifications = list;
      this.unread = list.filter(n => n.is_read == 0).length;
    });
  }

  logout() {
    this.auth.logout().subscribe(() => window.location.href = '/SpaceX/login');
  }
}
