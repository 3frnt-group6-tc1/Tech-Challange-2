import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { Subject, of } from 'rxjs';
import { MenuComponent } from './menu.component';
import { ThemeService } from '../../services/Theme/theme.service';
import { UserSettingsService } from '../../services/UserSettings/user-settings.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let themeServiceSpy: jasmine.SpyObj<ThemeService>;
  let userSettingsServiceSpy: jasmine.SpyObj<UserSettingsService>;
  let changeDetectorSpy: jasmine.SpyObj<ChangeDetectorRef>;
  let routerEventsSubject: Subject<any>;

  beforeEach(async () => {
    routerEventsSubject = new Subject();

    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate'], {
      events: routerEventsSubject.asObservable(),
      url: '/panel',
    });

    const themeServiceSpyObj = jasmine.createSpyObj('ThemeService', [
      'isDarkMode',
      'toggleDarkMode',
    ]);
    const userSettingsServiceSpyObj = jasmine.createSpyObj(
      'UserSettingsService',
      ['getUserSettings', 'updateUserSettings'],
      { userSettings$: of(null) }
    );
    const changeDetectorSpyObj = jasmine.createSpyObj('ChangeDetectorRef', [
      'markForCheck',
    ]);

    await TestBed.configureTestingModule({
      imports: [MenuComponent, HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerSpyObj },
        { provide: ThemeService, useValue: themeServiceSpyObj },
        { provide: UserSettingsService, useValue: userSettingsServiceSpyObj },
        { provide: ChangeDetectorRef, useValue: changeDetectorSpyObj },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: {} },
            params: of({}),
            queryParams: of({}),
          },
        },
      ],
    }).compileComponents();

    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    themeServiceSpy = TestBed.inject(
      ThemeService
    ) as jasmine.SpyObj<ThemeService>;
    userSettingsServiceSpy = TestBed.inject(
      UserSettingsService
    ) as jasmine.SpyObj<UserSettingsService>;
    changeDetectorSpy = TestBed.inject(
      ChangeDetectorRef
    ) as jasmine.SpyObj<ChangeDetectorRef>;

    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;

    // Reset spy calls after component creation
    changeDetectorSpy.markForCheck.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should emit menuRefReady after view init when menuRefElement exists', () => {
      spyOn(component.menuRefReady, 'emit');
      // Mock menuRefElement
      component.menuRefElement = { nativeElement: {} } as any;

      component.ngAfterViewInit();

      expect(component.menuRefReady.emit).toHaveBeenCalledWith(
        component.menuRefElement
      );
    });
  });

  describe('navigation methods', () => {
    it('should navigate to panel', () => {
      component.goToPanel();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/panel']);
    });

    it('should navigate to investments', () => {
      component.goToInvestments();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/investments']);
    });

    it('should navigate to transactions', () => {
      component.goToTransactions();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/transactions']);
    });

    it('should navigate to cards', () => {
      component.goToCards();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/cards']);
    });

    it('should navigate to configuration', () => {
      component.goToConfiguration();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/configurations']);
    });
  });

  describe('active route detection', () => {
    it('should detect active route correctly', () => {
      Object.defineProperty(routerSpy, 'url', {
        value: '/panel',
        writable: true,
      });

      expect(component.isActive('/panel')).toBe(true);
      expect(component.isActive('/investments')).toBe(false);
    });

    it('should handle sub-routes correctly', () => {
      Object.defineProperty(routerSpy, 'url', {
        value: '/panel/dashboard',
        writable: true,
      });

      expect(component.isActive('/panel')).toBe(true);
      expect(component.isActive('/investments')).toBe(false);
    });

    it('should ignore query parameters and fragments', () => {
      Object.defineProperty(routerSpy, 'url', {
        value: '/panel?tab=overview#section1',
        writable: true,
      });

      expect(component.isActive('/panel')).toBe(true);
    });

    it('should handle exact path matching', () => {
      Object.defineProperty(routerSpy, 'url', {
        value: '/panel',
        writable: true,
      });

      expect(component.isActive('/panel')).toBe(true);
      expect(component.isActive('/pan')).toBe(false);
    });
  });

  describe('theme integration', () => {
    it('should return correct theme button variant for dark mode', () => {
      themeServiceSpy.isDarkMode.and.returnValue(true);

      const buttonVariant = component.themeButton;

      expect(buttonVariant).toBe('ghost-white');
      expect(themeServiceSpy.isDarkMode).toHaveBeenCalled();
    });

    it('should return correct theme button variant for light mode', () => {
      themeServiceSpy.isDarkMode.and.returnValue(false);

      const buttonVariant = component.themeButton;

      expect(buttonVariant).toBe('outline-cyan-blue');
      expect(themeServiceSpy.isDarkMode).toHaveBeenCalled();
    });
  });

  describe('event handling', () => {
    it('should emit closeMenu when onLinkClick is called', () => {
      spyOn(component.closeMenu, 'emit');
      const mockEvent = {
        preventDefault: jasmine.createSpy('preventDefault'),
        stopPropagation: jasmine.createSpy('stopPropagation'),
      } as any;

      component.onLinkClick(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(component.closeMenu.emit).toHaveBeenCalled();
    });
  });

  describe('input properties', () => {
    it('should have default values for input properties', () => {
      expect(component.mobile).toBe(false);
      expect(component.tablet).toBe(false);
      expect(component.menuOpen).toBe(false);
    });

    it('should accept input property values', () => {
      component.mobile = true;
      component.tablet = true;
      component.menuOpen = true;

      expect(component.mobile).toBe(true);
      expect(component.tablet).toBe(true);
      expect(component.menuOpen).toBe(true);
    });
  });

  describe('template rendering', () => {
    beforeEach(() => {
      // Set up component state to ensure template renders content
      component.tablet = true;
      fixture.detectChanges();
    });

    it('should render menu component', () => {
      const compiled = fixture.nativeElement;
      expect(compiled).toBeTruthy();
    });

    it('should have navigation elements when logged in on tablet', () => {
      const compiled = fixture.nativeElement;
      const navElement = compiled.querySelector('nav');
      expect(navElement).toBeTruthy();

      const anchors = compiled.querySelectorAll('a');
      expect(anchors.length).toBeGreaterThan(0);
    });
  });

  describe('component lifecycle', () => {
    it('should unsubscribe from router events on destroy', () => {
      component.ngOnInit();
      const subscription = component['routerSub'];
      spyOn(subscription!, 'unsubscribe');

      component.ngOnDestroy();

      expect(subscription!.unsubscribe).toHaveBeenCalled();
    });

    it('should handle undefined subscription on destroy', () => {
      component['routerSub'] = undefined;

      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      // Set up logged in tablet state to render nav element
      component.tablet = true;
      fixture.detectChanges();
    });

    it('should have proper semantic structure', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('nav')).toBeTruthy();
    });

    it('should provide accessible navigation options', () => {
      const compiled = fixture.nativeElement;
      const focusableElements = compiled.querySelectorAll('a, [tabindex]');

      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });

  describe('responsive behavior', () => {
    it('should handle mobile state', () => {
      component.mobile = true;
      fixture.detectChanges();

      expect(component.mobile).toBe(true);
    });

    it('should handle tablet state', () => {
      component.tablet = true;
      fixture.detectChanges();

      expect(component.tablet).toBe(true);
    });

    it('should handle menu open state', () => {
      component.menuOpen = true;
      fixture.detectChanges();

      expect(component.menuOpen).toBe(true);
    });

    it('should render mobile menu when logged in, mobile and menu is open', () => {
      component.mobile = true;
      component.menuOpen = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const mobileMenu = compiled.querySelector('.fixed.inset-0.z-50');
      expect(mobileMenu).toBeTruthy();
    });

    it('should render tablet navigation when logged in and on tablet', () => {
      component.tablet = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const tabletNav = compiled.querySelector('nav');
      expect(tabletNav).toBeTruthy();
    });
  });
});
