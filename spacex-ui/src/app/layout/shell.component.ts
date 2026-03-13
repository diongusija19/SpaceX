import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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
  mobileNavOpen = false;

  constructor(
    public auth: AuthService,
    private notificationsService: NotificationsService,
    private router: Router
  ) {
    this.refreshNotifications();
  }

  refreshNotifications() {
    if (!this.auth.current) return;
    this.notificationsService.list().subscribe(list => {
      this.notifications = list;
      this.unread = list.filter(n => n.is_read == 0).length;
    });
  }

  toggleMobileNav() {
    this.mobileNavOpen = !this.mobileNavOpen;
  }

  closeMobileNav() {
    this.mobileNavOpen = false;
  }

  logout() {
    this.closeMobileNav();
    this.auth.logout().subscribe(() => this.router.navigateByUrl('/login'));
  }
}
