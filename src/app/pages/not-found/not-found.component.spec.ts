import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { Component } from '@angular/core';

import { NotFoundComponent } from './not-found.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LayoutComponent } from '../../shared/components/layout/layout.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

// Mock Menu Component to avoid errors with router.url in isActive method
@Component({
  selector: 'app-menu',
  template: '<div></div>',
  standalone: true,
})
class MockMenuComponent {
  isActive(path: string): boolean {
    return false;
  }
}

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create router spy with all needed methods
    const routerSpyObj = jasmine.createSpyObj('Router', [
      'navigate',
      'createUrlTree',
      'serializeUrl',
      'parseUrl',
    ]);
    routerSpyObj.events = of({});
    routerSpyObj.url = '/404';
    routerSpyObj.createUrlTree.and.returnValue({});
    routerSpyObj.parseUrl.and.returnValue({});
    routerSpyObj.serializeUrl.and.returnValue('');

    // Mock ActivatedRoute
    const activatedRouteMock = {
      params: of({}),
      queryParams: of({}),
      data: of({}),
      fragment: of(''),
      url: of([]),
      snapshot: {
        params: {},
        queryParams: {},
        data: {},
      },
    };

    await TestBed.configureTestingModule({
      imports: [
        NotFoundComponent,
        ButtonComponent,
        HttpClientTestingModule,
        LayoutComponent,
        MockMenuComponent,
      ],
      providers: [
        { provide: Router, useValue: routerSpyObj },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Basic component tests
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Content tests
  describe('content', () => {
    it('should have correct error message text', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain(
        'Ops! Esta Página Não Foi Encontrada'
      );
    });

    it('should display 404 error code', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('404');
    });

    it('should display error description message', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain(
        'Desculpe, mas a página que você está procurando não existe, foi removida, teve o nome alterado ou está temporariamente indisponível'
      );
    });
  });

  // Button tests
  describe('buttons', () => {
    it('should have home button with correct properties', () => {
      const compiled = fixture.nativeElement;
      const notfoundButtons = compiled.querySelector('.notfound-buttons');
      const homeButton = notfoundButtons.querySelector('app-button');
      expect(homeButton).toBeTruthy();

      const buttonElement = homeButton.querySelector('button');
      expect(buttonElement).toBeTruthy();
      expect(homeButton.getAttribute('ng-reflect-label')).toBe(
        'Página Inicial'
      );
      expect(homeButton.getAttribute('ng-reflect-theme')).toBe('primary');
      expect(homeButton.getAttribute('ng-reflect-size')).toBe('G');
    });

    it('should have back button with correct properties', () => {
      const compiled = fixture.nativeElement;
      const notfoundButtons = compiled.querySelector('.notfound-buttons');
      const buttons = notfoundButtons.querySelectorAll('app-button');
      expect(buttons.length).toBe(2);

      const backButton = buttons[1]; // Second button is the back button
      expect(backButton).toBeTruthy();
      const buttonElement = backButton.querySelector('button');
      expect(buttonElement).toBeTruthy();
      expect(backButton.getAttribute('ng-reflect-label')).toBe('Voltar');
      expect(backButton.getAttribute('ng-reflect-theme')).toBe('secondary');
      expect(backButton.getAttribute('ng-reflect-size')).toBe('G');
    });
  });

  // Navigation tests
  describe('navigation methods', () => {
    it('should navigate to home when goHome is called', () => {
      component.goHome();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should navigate back in history when goBack is called', () => {
      const historySpy = spyOn(window.history, 'back');
      component.goBack();
      expect(historySpy).toHaveBeenCalled();
    });

    it('should call goHome when home button is clicked', () => {
      spyOn(component, 'goHome');
      const notfoundButtons =
        fixture.nativeElement.querySelector('.notfound-buttons');
      const homeButton = notfoundButtons.querySelector('app-button');
      const buttonElement = homeButton.querySelector('button');
      buttonElement.click();
      fixture.detectChanges();
      expect(component.goHome).toHaveBeenCalled();
    });

    it('should call goBack when back button is clicked', () => {
      spyOn(component, 'goBack');
      const notfoundButtons =
        fixture.nativeElement.querySelector('.notfound-buttons');
      const buttons = notfoundButtons.querySelectorAll('app-button');
      const backButton = buttons[1].querySelector('button'); // Second button is the back button
      backButton.click();
      fixture.detectChanges();
      expect(component.goBack).toHaveBeenCalled();
    });
  });

  // Structure tests
  describe('template structure', () => {
    it('should display 404 header with correct structure', () => {
      const compiled = fixture.nativeElement;
      const errorHeader = compiled.querySelector('h1');
      expect(errorHeader).toBeTruthy();
      expect(errorHeader.textContent).toBe('404');
      expect(errorHeader.parentElement.className).toContain('notfound-404');
    });

    it('should have proper structure and CSS classes', () => {
      const compiled = fixture.nativeElement;

      // Check main container
      const notfoundContainer = compiled.querySelector('#notfound');
      expect(notfoundContainer).toBeTruthy();

      // Check inner container
      const notfoundInner = notfoundContainer.querySelector('.notfound');
      expect(notfoundInner).toBeTruthy();

      // Check 404 section
      const notfound404 = notfoundInner.querySelector('.notfound-404');
      expect(notfound404).toBeTruthy();

      // Check content section
      const notfoundContent = notfoundInner.querySelector('.notfound-content');
      expect(notfoundContent).toBeTruthy();
      expect(notfoundContent.querySelector('h2')).toBeTruthy();
      expect(notfoundContent.querySelector('p')).toBeTruthy();

      // Check buttons section
      const notfoundButtons = notfoundInner.querySelector('.notfound-buttons');
      expect(notfoundButtons).toBeTruthy();
      expect(notfoundButtons.querySelectorAll('app-button').length).toBe(2);
    });
  });
});
