import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

interface OptionItem {
  display: string;
  value: any;
}

@Component({
  selector: 'app-input',
  imports: [CommonModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor { // Implemente ControlValueAccessor
  @Input() options: (string | OptionItem)[] = [];
  @Input() size: 'G' | 'P' = 'G';
  @Input() placeholder = 'Selecione o tipo de transação';

  isOpen = false;
  selectedOption: string | null = null;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    if (value !== undefined && value !== null) {
      const foundOption = this.options.find(option => {
        if (typeof option === 'string') {
          return option === value;
        } else {
          return option.value === value;
        }
      });
      this.selectedOption = foundOption ? this.getDisplayValue(foundOption) : null;
    } else {
      this.selectedOption = null;
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    this.onTouched();
  }

  selectOption(option: string | OptionItem) {
    const valueToEmit = typeof option === 'string' ? option : option.value;
    this.selectedOption = this.getDisplayValue(option);
    this.isOpen = false;
    this.onChange(valueToEmit);
    this.onTouched();
  }

  getDisplayValue(option: string | OptionItem): string {
    return typeof option === 'string' ? option : option.display;
  }
}