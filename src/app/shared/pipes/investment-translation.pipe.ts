import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { InvestmentTranslationService } from '../services/Investment/investment-translation.service';

@Pipe({
  name: 'investmentType',
  standalone: true,
})
export class InvestmentTypePipe implements PipeTransform {
  constructor(private translationService: InvestmentTranslationService) {}

  transform(value: string): Observable<string> {
    if (!value) {
      return new Observable((subscriber) => subscriber.next(''));
    }
    return this.translationService.translateType(value);
  }
}

@Pipe({
  name: 'investmentCategory',
  standalone: true,
})
export class InvestmentCategoryPipe implements PipeTransform {
  constructor(private translationService: InvestmentTranslationService) {}

  transform(value: string): Observable<string> {
    if (!value) {
      return new Observable((subscriber) => subscriber.next(''));
    }
    return this.translationService.translateCategory(value);
  }
}

@Pipe({
  name: 'investmentRiskLevel',
  standalone: true,
})
export class InvestmentRiskLevelPipe implements PipeTransform {
  constructor(private translationService: InvestmentTranslationService) {}

  transform(value: string): Observable<string> {
    if (!value) {
      return new Observable((subscriber) => subscriber.next(''));
    }
    return this.translationService.translateRiskLevel(value);
  }
}
