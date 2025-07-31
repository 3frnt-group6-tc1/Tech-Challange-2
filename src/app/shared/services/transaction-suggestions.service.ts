import { Injectable } from '@angular/core';
import { TransactionType } from '../models/transaction';

@Injectable({
  providedIn: 'root'
})
export class TransactionSuggestionsService {
  private suggestions: Record<TransactionType, string[]> = {
    [TransactionType.Exchange]: [
      'Câmbio: Compra de USD para viagem',
      'Câmbio: Venda de EUR de retorno',
      'Câmbio: Remessa internacional para investimento (USD)',
      'Câmbio: Recebimento de pagamento PJ do exterior (GBP)',
      'Câmbio: Conversão BRL para EUR para despesas',
      'Câmbio: Resgate de USD de conta global',
      'Câmbio: Compra de EUR para mensalidade curso',
      'Câmbio: Venda de JPY',
      'Câmbio: Recebimento de pensão do exterior',
      'Câmbio: Transferência entre contas (BRL para USD)',
      'Câmbio: Pagamento de serviço internacional (streaming)',
    ],
    [TransactionType.Loan]: [
      'Empréstimo: Recebimento de crédito pessoal',
      'Financiamento: Parcela mensal de imóvel',
      'Empréstimo: Amortização de dívida de carro',
      'Financiamento: Recebimento de crédito estudantil',
      'Empréstimo: Pagamento de juros de cheque especial',
      'Financiamento: Parcela de reforma residencial',
      'Empréstimo: Quitação antecipada de empréstimo',
      'Financiamento: Entrada de veículo novo',
      'Empréstimo: Pagamento de parcela consignado',
      'Financiamento: Parcela de maquinário (PJ)',
      'Empréstimo: Juros sobre financiamento agrícola',
    ],
    [TransactionType.Transfer]: [
      'TED: Transferência para pagamento de aluguel',
      'DOC: Pagamento de conta de luz',
      'TED: Envio para familiar (mesmo banco)',
      'DOC: Pagamento de fornecedor (serviços)',
      'TED: Transferência para corretora (aporte em fundos)',
      'TED: Recebimento de reembolso de amigo',
      'DOC: Pagamento de internet mensal',
      'TED: Transferência entre contas próprias (diferentes bancos)',
      'TED: Reembolso de despesas de viagem',
      'DOC: Pagamento de mensalidade escolar',
      'TED: Compra online (transferência direta para vendedor)',
    ],
  };

  constructor() {}

  getFilteredSuggestions(transactionType: TransactionType, inputValue: string): string[] {
    if (!inputValue || inputValue.length < 2) {
      return [];
    }

    const typeSuggestions = this.suggestions[transactionType] || [];
    const normalizedInput = this.normalizeString(inputValue);

    return typeSuggestions.filter(suggestion =>
      this.normalizeString(suggestion).includes(normalizedInput)
    ).slice(0, 5);
  }

  getAllSuggestions(transactionType: TransactionType): string[] {
    return this.suggestions[transactionType] || [];
  }

  addCustomSuggestion(transactionType: TransactionType, suggestion: string): void {
    if (!this.suggestions[transactionType]) {
      this.suggestions[transactionType] = [];
    }

    if (!this.suggestions[transactionType].includes(suggestion)) {
      this.suggestions[transactionType].push(suggestion);
    }
  }

  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}