import { CommonModule } from '@angular/common';
import { MicroFrontendContainerComponent } from './micro-frontend-container.component';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [CommonModule, MicroFrontendContainerComponent],
  exports: [MicroFrontendContainerComponent],
})
export class MicroFrontendContainerModule {}
