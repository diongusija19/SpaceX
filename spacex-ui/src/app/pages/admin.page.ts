import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, UserRow } from '../services/users.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.css']
})
export class AdminPage {
  users: UserRow[] = [];
  message = '';
  newEmail = '';
  newPassword = '';
  newRole: 'admin' | 'user' = 'user';
  resetPassword = '';

  constructor(private usersService: UsersService, private cdr: ChangeDetectorRef) {
    this.load();
  }

  load() {
    this.usersService.list().subscribe(rows => {
      this.users = rows;
      this.cdr.detectChanges();
    });
  }

  setRole(user: UserRow, role: 'admin' | 'user') {
    if (user.role === role) return;
    const prev = user.role;
    user.role = role;
    this.usersService.updateRole(user.id, role).subscribe({
      next: () => this.message = 'Role updated',
      error: () => { user.role = prev; this.message = 'Update failed'; }
    });
  }

  createUser() {
    if (!this.newEmail.trim() || !this.newPassword.trim()) {
      this.message = 'Email and password required';
      return;
    }
    this.usersService.create(this.newEmail.trim(), this.newPassword.trim(), this.newRole).subscribe({
      next: () => {
        this.message = 'User created';
        this.newEmail = '';
        this.newPassword = '';
        this.newRole = 'user';
        this.load();
      },
      error: () => this.message = 'Create failed'
    });
  }

  reset(user: UserRow) {
    if (!this.resetPassword.trim()) {
      this.message = 'New password required';
      return;
    }
    const pwd = this.resetPassword.trim();
    this.usersService.resetPassword(user.id, pwd).subscribe({
      next: () => { this.message = 'Password reset'; this.resetPassword = ''; },
      error: () => this.message = 'Reset failed'
    });
  }
}
