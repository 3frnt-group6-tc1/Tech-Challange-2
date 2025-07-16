import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-edit-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent, FormsModule],
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.scss'],
})
export class EditModalComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() transaction: Transaction | null = null;
  @Output() save = new EventEmitter<{
    id: string;
    value: number;
    from: string;
    to: string;
    description: string;
  }>();
  @Output() cancel = new EventEmitter<void>();

  value: number = 0;
  description: string = '';
  valueFormatted: string = '';

  descriptionTouched = false;
  valueTouched = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.transaction) {
      this.value = this.transaction.value;
      this.description = this.transaction.description;
      this.valueFormatted = this.formatValue(this.value);
      this.descriptionTouched = false;
      this.valueTouched = false;
    }
  }

  get isDescriptionValid(): boolean {
    return this.description.trim().length >= 3;
  }

  get isValueValid(): boolean {
    return this.value > 0;
  }

  get isFormValid(): boolean {
    return this.isDescriptionValid && this.isValueValid;
  }

  onSave(): void {
    this.descriptionTouched = true;
    this.valueTouched = true;

    if (this.transaction && this.transaction.id && this.isFormValid) {
      // Split description to get from and to
      const parts = this.description.split(' → ');
      this.save.emit({
        id: this.transaction.id,
        value: this.value,
        from: parts[0] || this.transaction.from,
        to: parts[1] || this.transaction.to,
        description: this.description,
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  formatValue(value: number): string {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  onlyNumbers(event: KeyboardEvent): boolean {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  onAmountInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    value = value.substring(0, 12);

    while (value.length < 3) {
      value = '0' + value;
    }

    const cents = value.slice(-2);
    let integer = value.slice(0, -2);
    integer = integer.replace(/^0+/, '') || '0';
    integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    this.valueFormatted = `${integer},${cents}`;
    this.value = Number(integer.replace(/\./g, '') + '.' + cents);
    this.valueTouched = true;
  }
}
