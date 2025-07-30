import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  AuthService,
  LoginResponse,
} from './shared/services/Auth/auth.service';
import { ThemeService } from './shared/services/Theme/theme.service';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { mfConfig } from './app.config';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RouterOutlet, CommonModule],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'TechChallenge - FIAP';
  iframeSrc: SafeResourceUrl | null = null;

  constructor(
    private themeService: ThemeService,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {}

  ngOnDestroy(): void {}

  ngOnInit() {
    // Allow both root and anchor links (/#section) to load the siteUrl in iframe
    const microFrontendsByRoute: { [key: string]: string } = {
      '/': mfConfig.siteUrl,
      '/login': `${mfConfig.siteUrl}/login`,
      '/register': `${mfConfig.siteUrl}/register`,
    };
    const path = window.location.pathname;
    const search = window.location.search;
    const hash = window.location.hash;

    let url = null;
    if (path === '/' && hash) {
      url = mfConfig.siteUrl + hash;
    } else if (path === '/login' && search.includes('logout=true')) {
      // Pass logout param to MF login page
      url = `${mfConfig.siteUrl}/login${search}`;
    } else if (microFrontendsByRoute[path + search]) {
      url = microFrontendsByRoute[path + search];
    } else {
      url = microFrontendsByRoute[path];
    }

    console.log(url);

    this.iframeSrc = url
      ? this.sanitizer.bypassSecurityTrustResourceUrl(url)
      : null;
  }

  ngAfterViewInit() {
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'microfront:navigate') {
        const link = event.data.link;
        if (link) {
          window.location.href = link;
        }
      }

      if (event.data && event.data.type === 'microfront:login') {
        this.authService.setSession(event.data.authResult as LoginResponse);
      }
    });
  }
}
