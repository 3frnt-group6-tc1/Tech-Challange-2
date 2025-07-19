import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LayoutComponent } from '../../shared/components/layout/layout.component';
import { DashboardComponent } from '../../shared/components/dashboard/dashboard.component';

import { IconDollarComponent } from '../../shared/assets/icons/icon-dollar.component';
import { IconCardComponent } from '../../shared/assets/icons/icon-card.component';
import { IconHeartComponent } from '../../shared/assets/icons/icon-heart.component';
import { IconZapComponent } from '../../shared/assets/icons/icon-zap.component';
import { IconShieldComponent } from '../../shared/assets/icons/icon-shield.component';
import { IconSmartphoneComponent } from '../../shared/assets/icons/icon-smartphone.component';
import { IconBellComponent } from '../../shared/assets/icons/icon-bell.component';
import { IconArrowRightComponent } from '../../shared/assets/icons/icon-arrow-right.component';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: any;
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
      icon: IconDollarComponent,
      isComingSoon: true,
    },
    {
      id: 'cards',
      title: 'Meus Cartões',
      description: 'Gerencie seus cartões de crédito e débito',
      icon: IconCardComponent,
      route: '/cards',
    },
    {
      id: 'donations',
      title: 'Doações',
      description: 'Faça doações para instituições de caridade',
      icon: IconHeartComponent,
      isComingSoon: true,
    },
    {
      id: 'pix',
      title: 'PIX',
      description: 'Transferências instantâneas 24h por dia',
      icon: IconZapComponent,
      isComingSoon: true,
    },
    {
      id: 'insurance',
      title: 'Seguros',
      description: 'Proteja o que é importante para você',
      icon: IconShieldComponent,
      isComingSoon: true,
    },
    {
      id: 'mobile-credit',
      title: 'Crédito de Celular',
      description: 'Recarregue seu celular de forma rápida e segura',
      icon: IconSmartphoneComponent,
      isComingSoon: true,
    },
  ];

  IconArrowRightComponent = IconArrowRightComponent;
  IconBellComponent = IconBellComponent;

  constructor(private router: Router) {}

  // Método para obter classes específicas do ícone de serviço
  getServiceIconInputs() {
    return {
      class: 'w-8 h-8 text-cyan-blue-500 dark:text-white',
    };
  }

  // Método para obter classes específicas do ícone de seta
  getArrowIconInputs() {
    return {
      class: 'w-4 h-4 ml-1 text-cyan-blue-500 dark:text-blue-600',
    };
  }

  // Método para obter classes específicas do ícone de informação
  getInfoIconInputs() {
    return {
      class: 'w-5 h-5 mr-2 text-cyan-blue-500 dark:text-blue-600',
    };
  }

  onServiceClick(service: ServiceItem): void {
    if (service.isComingSoon) {
      // Mostrar mensagem de "em breve"
      return;
    }

    if (service.route) {
      this.router.navigate([service.route]);
    }
  }
}
