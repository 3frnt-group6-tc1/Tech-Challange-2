import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { HeaderComponent } from './header.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ThemeService } from '../../services/Theme/theme.service';
import { ButtonComponent } from '../button/button.component';
import { TextComponent } from '../text/text.component';
import { MenuComponent } from '../menu/menu.component';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Component } from '@angular/core';
import { of } from 'rxjs';
import { UserService } from '../../services/User/user-service';
import { AuthService } from '../../services/Auth/auth.service';
import { AccountService } from '../../services/Account/account.service';

// Mock dos serviços necessários
class ThemeServiceMock {
  toggleDarkMode() {}
  isDarkMode() { return false; }
  getCurrentTheme() { return 'light'; }
}

class RouterMock {
  url = '/panel';
  events = of({});
  navigate() {}
}

// Componentes mock para ícones
@Component({
  selector: 'app-icon-logo',
  template: '<div class="w-8 h-8 bg-blue-500">Logo</div>',
  standalone: true
})
class MockIconLogoComponent {}

@Component({
  selector: 'app-icon-exit',
  template: '<div class="w-4 h-4 bg-gray-500">Exit</div>',
  standalone: true
})
class MockIconExitComponent {}

@Component({
  selector: 'app-icon-darkmode',
  template: '<div class="w-4 h-4 bg-gray-500">Dark</div>',
  standalone: true
})
class MockIconDarkmodeComponent {}

@Component({
  selector: 'app-icon-hamburger',
  template: '<div class="w-4 h-4 bg-gray-500">Menu</div>',
  standalone: true
})
class MockIconHamburgerComponent {}

@Component({
  selector: 'app-icon-bell',
  template: '<div class="w-4 h-4 bg-gray-500">Bell</div>',
  standalone: true
})
class MockIconBellComponent {}

@Component({
  selector: 'app-icon-account-circle',
  template: '<div class="w-4 h-4 bg-gray-500">Account</div>',
  standalone: true
})
class MockIconAccountCircleComponent {}

@Component({
  selector: 'app-icon-arrowdown',
  template: '<div class="w-4 h-4 bg-gray-500">Arrow</div>',
  standalone: true
})
class MockIconArrowdownComponent {}

export default {
  title: 'Componentes/Header',
  component: HeaderComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        HttpClientModule,
        RouterModule.forChild([]),
        ButtonComponent,
        TextComponent,
        MenuComponent,
        MockIconLogoComponent,
        MockIconExitComponent,
        MockIconDarkmodeComponent,
        MockIconHamburgerComponent,
        MockIconBellComponent,
        MockIconAccountCircleComponent,
        MockIconArrowdownComponent
      ],
      providers: [
        {
          provide: ThemeService,
          useClass: ThemeServiceMock
        },
        { provide: AccountService, useValue: { getByUserId: () => of([]) } },
        {
          provide: AuthService,
          useValue: { currentUser$: of(null), getCurrentUser: () => null, isAuthenticated: () => false, logout: () => {} }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            queryParams: of({}),
            snapshot: {
              paramMap: {
                get: () => null
              },
              queryParamMap: {
                get: () => null
              }
            }
          }
        },
        { provide: UserService, useValue: {
          getById: () => of({ name: 'Usuário Teste' })
        }},
        { provide: Router, useValue: new RouterMock() }
      ]
    })
  ],
  parameters: {
    docs: {
      description: {
        component: 'Componente de cabeçalho da aplicação, com diferentes estados para usuários logados e não logados, e responsivo para diferentes tamanhos de tela.'
      }
    }
  }
} as Meta<HeaderComponent>;

type Story = StoryObj<HeaderComponent>;

export const LoggedInDesktop: Story = {
  args: {
    mobile: false,
    tablet: false,
    userName: 'João Silva'
  }
};

export const LoggedInTablet: Story = {
  args: {
    mobile: false,
    tablet: true,
    userName: 'João Silva'
  }
};

export const LoggedInMobile: Story = {
  args: {
    mobile: true,
    tablet: false,
    userName: 'João Silva'
  }
};

export const NotLoggedInDesktop: Story = {
  args: {
    mobile: false,
    tablet: false
  }
};

export const NotLoggedInMobile: Story = {
  args: {
    mobile: true,
    tablet: false
  }
};
