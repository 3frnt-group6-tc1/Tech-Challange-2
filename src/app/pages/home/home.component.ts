import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import { TextComponent } from '../../shared/components/text/text.component';

import { IconGiftComponent } from '../../shared/assets/icons/icon-gift.component';
import { IconOnComponent } from '../../shared/assets/icons/icon-on.component';
import { IconStarComponent } from '../../shared/assets/icons/icon-star.component';
import { IconNotebookComponent } from '../../shared/assets/icons/icon-notebook.component';
import { IconDollarComponent } from '../../shared/assets/icons/icon-dollar.component';
import { IconZapComponent } from '../../shared/assets/icons/icon-zap.component';
import { IconSmartphoneComponent } from '../../shared/assets/icons/icon-smartphone.component';
import { IconShieldComponent } from '../../shared/assets/icons/icon-shield.component';

interface ContatoForm {
  nome: string;
  email: string;
  telefone: string;
  assunto: string;
  mensagem: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TextComponent, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  contatoForm!: FormGroup;
  isEnviando = false;
  mensagemSucesso = '';

  vantagens = [
    {
      titulo: 'Conta e cartão gratuitos',
      descricao: 'Conta digital, sem custo fixo e sem tarifa de manutenção.',
      icon: IconGiftComponent,
    },
    {
      titulo: 'Saques sem custo',
      descricao:
        'Você pode sacar gratuitamente 4x por mês de qualquer Banco 24h.',
      icon: IconOnComponent,
    },
    {
      titulo: 'Cartão internacional',
      descricao:
        'Você pode acumular pontos com suas compras no crédito sem pagar mensalidade!',
      icon: IconStarComponent,
    },
    {
      titulo: 'Proteção digital',
      descricao:
        'Seus dispositivos móveis (computador e laptop) protegidos por uma mensalidade simbólica.',
      icon: IconNotebookComponent,
    },
  ];

  outrosServicos = [
    {
      id: 'loans',
      title: 'Empréstimos',
      description: 'Solicite empréstimos com as melhores taxas do mercado',
      icon: IconDollarComponent,
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

  vantagensInputs = {
    class: 'text-white dark:text-gray-200 w-24 h-24',
  };

  servicosInputs = {
    class: 'w-8 h-8 text-white dark:text-cyan-blue-300',
  };

  constructor(private fb: FormBuilder, private router: Router) {
    this.initForm();
  }

  ngOnInit(): void {
    // Componente inicializado
  }

  private initForm(): void {
    this.contatoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: [''],
      assunto: ['', [Validators.required]],
      mensagem: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.contatoForm.get(fieldName);
    return !!(control?.invalid && control.touched);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.contatoForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldLabel(fieldName)} é obrigatório`;
      }
      if (control.errors['email']) {
        return 'E-mail inválido';
      }
      if (control.errors['minlength']) {
        const minLength = control.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(
          fieldName
        )} deve ter pelo menos ${minLength} caracteres`;
      }
      if (control.errors['maxlength']) {
        const maxLength = control.errors['maxlength'].requiredLength;
        return `${this.getFieldLabel(
          fieldName
        )} deve ter no máximo ${maxLength} caracteres`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nome: 'Nome',
      email: 'E-mail',
      telefone: 'Telefone',
      assunto: 'Assunto',
      mensagem: 'Mensagem',
    };
    return labels[fieldName] || fieldName;
  }

  onSubmitContato(): void {
    if (this.contatoForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isEnviando = true;
    const formData: ContatoForm = this.contatoForm.value;

    // Simular envio de formulário (logando informações)
    console.log('=== FORMULÁRIO DE CONTATO ENVIADO ===');
    console.log('Data/Hora:', new Date().toLocaleString('pt-BR'));
    console.log('Nome:', formData.nome);
    console.log('E-mail:', formData.email);
    console.log('Telefone:', formData.telefone || 'Não informado');
    console.log('Assunto:', formData.assunto);
    console.log('Mensagem:', formData.mensagem);
    console.log('====================================');

    // Simular tempo de envio
    setTimeout(() => {
      this.isEnviando = false;
      this.mensagemSucesso =
        'Mensagem enviada com sucesso! Entraremos em contato em breve.';
      this.contatoForm.reset();

      // Limpar mensagem de sucesso após 5 segundos
      setTimeout(() => {
        this.mensagemSucesso = '';
      }, 5000);
    }, 2000);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contatoForm.controls).forEach((key) => {
      const control = this.contatoForm.get(key);
      control?.markAsTouched();
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }
}
