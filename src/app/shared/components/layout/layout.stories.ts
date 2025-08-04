import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { LayoutComponent } from './layout.component';

// Mock ThemeService and AuthService for Header dependency
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { AsideComponent } from '../aside/aside.component';
import { FooterComponent } from '../footer/footer.component';
import { ThemeService } from '../../services/Theme/theme.service';
import { AuthService } from '../../services/Auth/auth.service';
import { UserService } from '../../services/User/user-service';
import { AccountService } from '../../services/Account/account.service';
class AccountServiceMock {
  getByUserId() { return of([]); }
}

class ThemeServiceMock {
  toggleDarkMode() {}
  isDarkMode = false;
  getCurrentTheme() { return 'light'; }
}
class RouterMock { url = '/panel'; events = of({}); navigate() {} }

const meta: Meta<LayoutComponent> = {
  title: 'Componentes/Layout',
  component: LayoutComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        HttpClientModule,
        RouterModule.forChild([]),
        HeaderComponent,
        AsideComponent,
        FooterComponent,
      ],
      providers: [
        { provide: ThemeService, useClass: ThemeServiceMock },
        { provide: AuthService, useValue: { currentUser$: of(null), getCurrentUser: () => null, isAuthenticated: () => false, logout: () => {} } },
        { provide: UserService, useValue: { getById: () => of({ name: 'Usuário Teste' }) } },
        { provide: AccountService, useClass: AccountServiceMock },
        { provide: Router, useClass: RouterMock },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            queryParams: of({}),
            snapshot: {
              paramMap: { get: () => null },
              queryParamMap: { get: () => null },
            },
          },
        },
      ],
    }),
  ],

  parameters: {
    previewTabs: {
      'storybook/docs/panel': { hidden: true },
    },
    viewMode: 'story',
    docsOnly: true,
  },
};

export default meta;
type Story = StoryObj<LayoutComponent>;

// Story vazia
export const Hidden: Story = {
  parameters: {
    docs: {
      disable: true,
    },
  },
};
