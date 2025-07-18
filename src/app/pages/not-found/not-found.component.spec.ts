import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NotFoundComponent } from './not-found.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [NotFoundComponent, ButtonComponent],
      providers: [{ provide: Router, useValue: routerSpyObj }],
    }).compileComponents();

    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

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

  it('should have home button with correct text', () => {
    const compiled = fixture.nativeElement;
    const homeButton = compiled.querySelector('app-button');
    expect(homeButton).toBeTruthy();
    const buttonText = homeButton.textContent?.trim();
    expect(buttonText).toContain('Página Inicial');
  });

  it('should have back button with correct text', () => {
    const compiled = fixture.nativeElement;
    const backButtons = compiled.querySelectorAll('app-button');
    expect(backButtons.length).toBe(2);
    const backButton = backButtons[1]; // Second button is the back button
    expect(backButton).toBeTruthy();
    const buttonText = backButton.textContent?.trim();
    expect(buttonText).toContain('Voltar');
  });

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
      const homeButton = fixture.nativeElement.querySelector('app-button');

      homeButton.click();

      expect(component.goHome).toHaveBeenCalled();
    });

    it('should call goBack when back button is clicked', () => {
      spyOn(component, 'goBack');
      const backButtons = fixture.nativeElement.querySelectorAll('app-button');
      const backButton = backButtons[1]; // Second button is the back button

      backButton.click();

      expect(component.goBack).toHaveBeenCalled();
    });
  });

  describe('template rendering', () => {
    it('should display 404 header', () => {
      const compiled = fixture.nativeElement;
      const errorHeader = compiled.querySelector('h1');
      expect(errorHeader).toBeTruthy();
      expect(errorHeader.textContent).toBe('404');
    });

    it('should have proper CSS classes', () => {
      const compiled = fixture.nativeElement;
      const container = compiled.querySelector('#notfound .notfound');
      expect(container).toBeTruthy();
    });

    it('should have accessible button elements', () => {
      const compiled = fixture.nativeElement;
      const appButtons = compiled.querySelectorAll('app-button');
      expect(appButtons.length).toBe(2);

      // Check that each app-button contains a native button element
      appButtons.forEach((appButton: Element) => {
        const nativeButton = appButton.querySelector('button');
        expect(nativeButton).toBeTruthy();
        expect(appButton.textContent?.trim()).toBeTruthy();
      });
    });
  });
});
