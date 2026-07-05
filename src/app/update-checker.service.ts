import { Injectable, signal } from '@angular/core';

const CHECK_INTERVAL_MS = 5 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class UpdateCheckerService {
  updateAvailable = signal(false);

  private readonly loadedBundleHash = this.readCurrentBundleHash();
  private intervalId: ReturnType<typeof setInterval> | null = null;

  start() {
    if (!this.shouldCheckForUpdates()) return;

    window.setTimeout(() => void this.checkForUpdate(), 15_000);
    this.intervalId = setInterval(() => this.checkForUpdate(), CHECK_INTERVAL_MS);
    window.addEventListener('focus', this.onFocus);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    window.removeEventListener('focus', this.onFocus);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  reloadApp() {
    window.location.reload();
  }

  dismissUpdate() {
    this.updateAvailable.set(false);
  }

  private readonly onFocus = () => {
    void this.checkForUpdate();
  };

  private readonly onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      void this.checkForUpdate();
    }
  };

  private shouldCheckForUpdates(): boolean {
    return typeof window !== 'undefined' && window.location.hostname !== 'localhost';
  }

  private async checkForUpdate() {
    if (!this.loadedBundleHash) return;

    try {
      const response = await fetch(this.buildCheckUrl(), { cache: 'no-store' });
      if (!response.ok) return;

      const html = await response.text();
      const latestHash = this.extractMainBundleHash(html);

      if (latestHash && latestHash !== this.loadedBundleHash) {
        this.updateAvailable.set(true);
      }
    } catch {
      // Ignore network errors during background checks.
    }
  }

  private buildCheckUrl(): string {
    const baseHref = document.querySelector('base')?.getAttribute('href') ?? '/';
    const url = new URL(baseHref, window.location.origin);
    url.searchParams.set('update-check', String(Date.now()));
    return url.toString();
  }

  private readCurrentBundleHash(): string | null {
    const script = document.querySelector('script[src*="main-"]') as HTMLScriptElement | null;
    if (!script?.src) return null;

    return this.extractMainBundleHash(script.src);
  }

  private extractMainBundleHash(source: string): string | null {
    const match = source.match(/main-([A-Z0-9]+)\.js/);
    return match?.[1] ?? null;
  }
}
