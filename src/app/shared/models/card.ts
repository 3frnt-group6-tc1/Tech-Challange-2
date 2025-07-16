export interface Card {
  id: string;
  accountId: string;
  cardNumber: string;
  cardType: 'debito' | 'credito';
}
