import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LayoutComponent } from '../../shared/components/layout/layout.component';
import { DashboardComponent } from '../../shared/components/dashboard/dashboard.component';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  route?: string;
  isComingSoon?: boolean;
}

@Component({
  selector: 'app-other-services',
  standalone: true,
  imports: [CommonModule, LayoutComponent, DashboardComponent],
  templateUrl: './other-services.component.html',
  styleUrl: './other-services.component.scss',
})
export class OtherServicesComponent {
  services: ServiceItem[] = [
    {
      id: 'loans',
      title: 'Empréstimos',
      description: 'Solicite empréstimos com as melhores taxas do mercado',
      icon: 'dollar',
      isComingSoon: true,
    },
    {
      id: 'cards',
      title: 'Meus Cartões',
      description: 'Gerencie seus cartões de crédito e débito',
      icon: 'card',
      route: '/cards',
    },
    {
      id: 'donations',
      title: 'Doações',
      description: 'Faça doações para instituições de caridade',
      icon: 'heart',
      isComingSoon: true,
    },
    {
      id: 'pix',
      title: 'PIX',
      description: 'Transferências instantâneas 24h por dia',
      icon: 'zap',
      isComingSoon: true,
    },
    {
      id: 'insurance',
      title: 'Seguros',
      description: 'Proteja o que é importante para você',
      icon: 'shield',
      isComingSoon: true,
    },
    {
      id: 'mobile-credit',
      title: 'Crédito de Celular',
      description: 'Recarregue seu celular de forma rápida e segura',
      icon: 'smartphone',
      isComingSoon: true,
    },
  ];

  constructor(private router: Router) {}

  onServiceClick(service: ServiceItem): void {
    if (service.isComingSoon) {
      // Mostrar mensagem de "em breve"
      return;
    }

    if (service.route) {
      this.router.navigate([service.route]);
    }
  }

  getIconPath(iconName: string): string {
    return `/assets/icons/${iconName}.svg`;
  }
}
