import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly darkMode = signal(false);

  constructor() {
    const saved = localStorage.getItem('cartify-theme');
    const dark = saved === 'dark';
    this.darkMode.set(dark);
    document.documentElement.classList.toggle('dark-theme', dark);
  }

  toggle(): void {
    const dark = !this.darkMode();
    this.darkMode.set(dark);
    document.documentElement.classList.toggle('dark-theme', dark);
    localStorage.setItem('cartify-theme', dark ? 'dark' : 'light');
  }
}
