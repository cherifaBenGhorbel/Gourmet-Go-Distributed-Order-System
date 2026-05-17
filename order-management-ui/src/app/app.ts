import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="shell">

      <!-- TOP NAV -->
      <nav class="topnav">
        <div class="nav-inner">

          <a class="brand" routerLink="/create">
            <span class="brand-icon">🍔</span>
            <span class="brand-name">GourmetGo</span>
          </a>

          <ul class="nav-links">
            <li>
              <a routerLink="/create" routerLinkActive="active"
                 [routerLinkActiveOptions]="{ exact: true }">
                <span class="nav-icon">🛒</span> New Order
              </a>
            </li>
            <li>
              <a routerLink="/dashboard" routerLinkActive="active"
                 [routerLinkActiveOptions]="{ exact: true }">
                <span class="nav-icon">📊</span> Dashboard
              </a>
            </li>
            <li>
              <a routerLink="/history" routerLinkActive="active"
                 [routerLinkActiveOptions]="{ exact: true }">
                <span class="nav-icon">📋</span> History
              </a>
            </li>
          </ul>

          <div class="nav-badge">
            <span class="dot"></span> Live Saga
          </div>

        </div>
      </nav>

      <!-- MAIN -->
      <main class="main-stage">
        <router-outlet></router-outlet>
      </main>

      <!-- FOOTER -->
      <footer class="footer">
        <span>© 2026 GourmetGo</span>
        <span class="sep">·</span>
        <span>Saga Orchestration via Spring Boot + Angular</span>
      </footer>

    </div>
  `,
  styles: [`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :host {
      --red:    #e8382b;
      --orange: #f97316;
      --yellow: #fbbf24;
      --cream:  #fffbf5;
      --ink:    #1a0a00;
      --muted:  #7c6a5a;
      --card-bg:#ffffff;
      --radius: 20px;
      font-family: 'Nunito', sans-serif;
      color: var(--ink);
    }

    .shell {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--cream);
      background-image:
        radial-gradient(circle at 10% 20%, rgba(251,191,36,.15) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(232,56,43,.10) 0%, transparent 40%);
    }

    /* ── TOPNAV ── */
    .topnav {
      background: var(--red);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 4px 20px rgba(232,56,43,.35);
    }

    .nav-inner {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 32px;
      height: 68px;
      display: flex;
      align-items: center;
      gap: 40px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      flex-shrink: 0;
    }

    .brand-icon { font-size: 2rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,.25)); }

    .brand-name {
      font-family: 'Fredoka One', cursive;
      font-size: 1.65rem;
      color: #fff;
      letter-spacing: .5px;
      text-shadow: 2px 2px 0 rgba(0,0,0,.18);
    }

    .nav-links {
      display: flex;
      list-style: none;
      gap: 4px;
      flex: 1;
    }

    .nav-links a {
      display: flex;
      align-items: center;
      gap: 7px;
      color: rgba(255,255,255,.85);
      text-decoration: none;
      font-weight: 700;
      font-size: .95rem;
      padding: 8px 18px;
      border-radius: 50px;
      transition: all .2s;
    }

    .nav-links a:hover,
    .nav-links a.active {
      background: rgba(255,255,255,.2);
      color: #fff;
    }

    .nav-links a.active {
      background: #fff;
      color: var(--red);
      box-shadow: 0 2px 8px rgba(0,0,0,.15);
    }

    .nav-icon { font-size: 1.1rem; }

    .nav-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,.15);
      border: 1px solid rgba(255,255,255,.3);
      color: #fff;
      font-size: .8rem;
      font-weight: 800;
      padding: 6px 16px;
      border-radius: 50px;
      letter-spacing: .5px;
      flex-shrink: 0;
    }

    .dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--yellow);
      animation: blink 1.5s ease-in-out infinite;
    }

    @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:.3 } }

    /* ── MAIN ── */
    .main-stage {
      flex: 1;
    }

    /* ── FOOTER ── */
    .footer {
      background: var(--ink);
      color: rgba(255,255,255,.45);
      text-align: center;
      padding: 18px 20px;
      font-size: .82rem;
      font-weight: 600;
      letter-spacing: .3px;
    }

    .sep { margin: 0 10px; opacity: .4; }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .nav-inner { padding: 0 16px; gap: 16px; }
      .brand-name { font-size: 1.3rem; }
      .nav-badge { display: none; }
      .nav-links a span.nav-icon { display: none; }
    }
  `]
})
export class App {}