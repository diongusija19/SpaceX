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
  assignee = '';
  tags = '';
  due_date: string | null = null;
  draggingId: number | null = null;

  filterAssignee = 'all';
  filterTag = 'all';
  filterOverdue = false;

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
    this.boards.create(
      this.title.trim(),
      this.description.trim(),
      this.status,
      this.priority,
      this.assignee.trim(),
      this.tags.trim(),
      this.due_date
    ).subscribe(() => {
      this.title = '';
      this.description = '';
      this.status = 'todo';
      this.priority = 'medium';
      this.assignee = '';
      this.tags = '';
      this.due_date = null;
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

  onSelect(item: BoardItem) {
    this.draggingId = item.id;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDragEnter(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent, status: BoardItem['status']) {
    event.preventDefault();
    const raw = event.dataTransfer?.getData('text/plain') ?? '';
    const id = Number(raw);
    if (!id) return;
    const item = this.items.find(i => i.id === id);
    if (!item || item.status === status) return;
    this.move(item, status);
  }

  onColumnClick(status: BoardItem['status']) {
    if (!this.draggingId) return;
    const item = this.items.find(i => i.id === this.draggingId);
    if (!item || item.status === status) return;
    this.move(item, status);
    this.draggingId = null;
  }

  remove(item: BoardItem) {
    this.boards.delete(item.id).subscribe(() => this.load());
  }

  byStatus(status: BoardItem['status']) {
    return this.filtered().filter(i => i.status === status);
  }

  tagList(tags: string) {
    return tags.split(',').map(t => t.trim()).filter(Boolean);
  }

  uniqueAssignees() {
    const set = new Set(this.items.map(i => (i.assignee || '').trim()).filter(Boolean));
    return Array.from(set);
  }

  swimlaneAssignees() {
    if (this.filterAssignee !== 'all') return [this.filterAssignee];
    const assignees = this.uniqueAssignees();
    const hasUnassigned = this.items.some(i => !(i.assignee || '').trim());
    return hasUnassigned ? [...assignees, 'Unassigned'] : assignees;
  }

  uniqueTags() {
    const set = new Set(this.items.flatMap(i => this.tagList(i.tags)));
    return Array.from(set);
  }

  isOverdue(item: BoardItem) {
    if (!item.due_date) return false;
    const today = new Date();
    const due = new Date(item.due_date + 'T00:00:00');
    return due < today;
  }

  filtered() {
    return this.items.filter(i => {
      if (this.filterAssignee !== 'all' && (i.assignee || '') !== this.filterAssignee) return false;
      if (this.filterTag !== 'all' && !this.tagList(i.tags).includes(this.filterTag)) return false;
      if (this.filterOverdue && !this.isOverdue(i)) return false;
      return true;
    });
  }

  itemsByStatusAndAssignee(status: BoardItem['status'], assignee: string) {
    return this.filtered().filter(i => {
      const name = (i.assignee || '').trim();
      const lane = name === '' ? 'Unassigned' : name;
      return i.status === status && lane === assignee;
    });
  }
}
