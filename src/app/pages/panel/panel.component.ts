import { Component } from '@angular/core';
import { LayoutComponent } from '../../shared/components/layout/layout.component';
import { StatementComponent } from '../../shared/components/statement/statement.component';
import { TransactionFormComponent } from '../../shared/components/transaction-form/transaction-form.component';
import { DashboardComponent } from '../../shared/components/dashboard/dashboard.component';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [
    LayoutComponent,
    DashboardComponent,
    StatementComponent,
    TransactionFormComponent,
  ],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.scss',
})
export class PainelComponent {
  title: string = 'tech-challenge';

  constructor() {}

  ngOnInit(): void {}
}
