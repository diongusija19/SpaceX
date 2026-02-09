import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface User {
  id: number;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user$ = new BehaviorSubject<User | null>(null);
  private loaded = false;

  constructor(private http: HttpClient) {}

  get current() {
    return this.user$.value;
  }

  ensure(): Observable<boolean> {
    if (this.loaded) return of(!!this.user$.value);
    return this.http.get<any>('/SpaceX/api/me.php').pipe(
      map(res => res && res.id ? (res as User) : null),
      tap(user => { this.user$.next(user); this.loaded = true; }),
      map(user => !!user),
      catchError(() => { this.loaded = true; return of(false); })
    );
  }

  login(email: string, password: string) {
    return this.http.post<User>('/SpaceX/api/login.php', { email, password }).pipe(
      tap(user => { this.user$.next(user); this.loaded = true; })
    );
  }

  logout() {
    return this.http.post('/SpaceX/api/logout.php', {}).pipe(
      tap(() => { this.user$.next(null); this.loaded = false; })
    );
  }
}
