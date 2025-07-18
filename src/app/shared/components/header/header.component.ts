import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ThemeService } from '../../services/Theme/theme.service';
import { UserService } from '../../services/User/user-service';
import { AuthService, AuthUser } from '../../services/Auth/auth.service';
import { systemConfig } from '../../../app.config';

import { IconExitComponent } from '../../assets/icons/icon-exit.component';
import { ButtonComponent } from '../button/button.component';
import { TextComponent } from '../text/text.component';
import { IconHamburgerComponent } from '../../assets/icons/icon-hamburger.component';
import { IconDarkmodeComponent } from '../../assets/icons/icon-darkmode.component';
import { IconBellComponent } from '../../assets/icons/icon-bell.component';
import { IconAccountCircleComponent } from '../../assets/icons/icon-account-circle.component';
import { IconLogoComponent } from '../../assets/icons/icon-logo.component';
import { IconArrowdownComponent } from '../../assets/icons/icon-arrowdown.component';
import { MenuComponent } from '../menu/menu.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    TextComponent,
    IconExitComponent,
    IconHamburgerComponent,
    IconDarkmodeComponent,
    IconBellComponent,
    IconAccountCircleComponent,
    IconLogoComponent,
    IconArrowdownComponent,
    MenuComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = true;
  mobile: boolean = false;
  tablet: boolean = false;
  menuOpen: boolean = false;

  userName: string = '';
  currentUser: AuthUser | null = null;

  isLoading: boolean = true;
  private destroy$ = new Subject<void>();

  constructor(
    public themeService: ThemeService,
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {
    const path = window.location.pathname;
    this.isLoggedIn = systemConfig.loggedPages.includes(path);
  }

  @ViewChild('menuRef') menuRef?: ElementRef;
  private resizeListener = () => this.checkScreen();
  private clickListener!: (event: MouseEvent) => void;
  private routerEventsSubscription: any;

  ngOnInit() {
    this.checkScreen();
    window.addEventListener('resize', this.resizeListener);

    this.clickListener = this.handleClickOutside.bind(this);
    document.addEventListener('click', this.clickListener, true);

    if (this.menuOpen) {
      document.body.classList.add('overflow-hidden');
    }

    this.routerEventsSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateLoginState(event.urlAfterRedirects);
      });

    this.subscribeToAuthUser();
    this.updateLoginState(this.router.url);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeListener);
    document.removeEventListener('click', this.clickListener, true);
    this.enableScroll();

    if (this.routerEventsSubscription) {
      this.routerEventsSubscription.unsubscribe();
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateLoginState(url: string) {
    // Use AuthService to check authentication status
    this.isLoggedIn =
      this.authService.isAuthenticated() &&
      systemConfig.loggedPages.includes(url);
  }

  private subscribeToAuthUser(): void {
    // Subscribe to current user from AuthService
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: AuthUser | null) => {
        this.currentUser = user;
        this.userName = user?.name || user?.username || '';
      });
  }

  fetchUser(): void {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.isLoading = false;
      console.error('User not authenticated');
      return;
    }

    this.userService.getById(currentUser.id).subscribe({
      next: (response: any) => {
        this.userName = response.name || response.username;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error fetching user name:', error);
      },
    });
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  checkScreen(): void {
    const width = window.innerWidth;
    this.mobile = width <= 639;
    this.tablet = width >= 640 && width <= 1279;
  }

  toggleMenu(event?: MouseEvent): void {
    if (event) event.stopPropagation();

    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      this.enableScroll();
    }
  }

  private enableScroll(): void {
    document.body.classList.remove('overflow-hidden');
  }

  private handleClickOutside(event: MouseEvent): void {
    if (!this.menuOpen) return;

    const target = event.target as Node;
    const menuElement = this.menuRef?.nativeElement;
    const hamburgerButton = document.querySelector(
      '.app-icon-hamburger'
    )?.parentElement;

    if (menuElement && menuElement.contains(target)) return;

    if (hamburgerButton && hamburgerButton.contains(target)) return;

    this.closeMenu();
  }

  get showLandingMobileMenu(): boolean {
    const condition =
      !this.isLoggedIn && (this.mobile || this.tablet) && this.menuOpen;

    if (condition) {
      document.body.classList.add('overflow-hidden');
    } else {
      this.enableScroll();
    }

    return condition;
  }

  get showLandingDesktopMenu(): boolean {
    return !this.isLoggedIn && !this.mobile;
  }

  get showLoggedMobileMenu(): boolean {
    return this.isLoggedIn && this.mobile && this.menuOpen;
  }

  get showLoggedTabletMenu(): boolean {
    return this.isLoggedIn && this.tablet;
  }

  setMenuRef(ref: ElementRef): void {
    this.menuRef = ref;
  }

  closeMenu(): void {
    this.menuOpen = false;
    this.enableScroll();
  }

  goToPanel(): void {
    // Check if user is authenticated, otherwise go to login
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/panel']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
