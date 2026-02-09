import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoardsService, BoardItem } from '../services/boards.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-boards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './boards.page.html',
  styleUrls: ['./boards.page.css']
})
export class BoardsPage {
  items: BoardItem[] = [];
  title = '';
  description = '';
  status: BoardItem['status'] = 'todo';
  priority: BoardItem['priority'] = 'medium';
  draggingId: number | null = null;

  constructor(
    private boards: BoardsService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.auth.ensure().subscribe(() => this.load());
  }

  load() {
    this.boards.list().subscribe(rows => {
      this.items = rows;
      this.cdr.detectChanges();
    });
  }

  create() {
    if (!this.title.trim()) return;
    this.boards.create(this.title.trim(), this.description.trim(), this.status, this.priority).subscribe(() => {
      this.title = '';
      this.description = '';
      this.status = 'todo';
      this.priority = 'medium';
      this.load();
    });
  }

  move(item: BoardItem, status: BoardItem['status']) {
    this.boards.move(item.id, status).subscribe(() => this.load());
  }

  onDragStart(event: DragEvent, item: BoardItem) {
    this.draggingId = item.id;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(item.id));
    }
  }

  onDragEnd() {
    this.draggingId = null;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent, status: BoardItem['status']) {
    event.preventDefault();
    event.stopPropagation();
    const raw = event.dataTransfer?.getData('text/plain') ?? '';
    const id = Number(raw);
    if (!id) return;
    const item = this.items.find(i => i.id === id);
    if (!item || item.status === status) return;
    this.move(item, status);
  }

  remove(item: BoardItem) {
    this.boards.delete(item.id).subscribe(() => this.load());
  }

  byStatus(status: BoardItem['status']) {
    return this.items.filter(i => i.status === status);
  }
}
