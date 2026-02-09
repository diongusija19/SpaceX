import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface BoardItem {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  tags: string;
  due_date: string | null;
  created_at: string;
  user_id: number;
}

@Injectable({ providedIn: 'root' })
export class BoardsService {
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<BoardItem[]>('/SpaceX/api/boards.php');
  }

  create(
    title: string,
    description: string,
    status: BoardItem['status'],
    priority: BoardItem['priority'],
    assignee: string,
    tags: string,
    due_date: string | null
  ) {
    return this.http.post('/SpaceX/api/boards.php', {
      action: 'create',
      title,
      description,
      status,
      priority,
      assignee,
      tags,
      due_date
    });
  }

  move(id: number, status: BoardItem['status']) {
    return this.http.post('/SpaceX/api/boards.php', { action: 'move', id, status });
  }

  delete(id: number) {
    return this.http.post('/SpaceX/api/boards.php', { action: 'delete', id });
  }
}
