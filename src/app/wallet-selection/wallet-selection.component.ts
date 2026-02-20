import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { AccountInterface } from '../interfaces/account.interface';
import { AccountService } from '../services/account.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-wallet-selection',
  standalone: true,
  imports: [
    CommonModule,
    SelectModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './wallet-selection.component.html',
  styleUrl: './wallet-selection.component.scss'
})
export class WalletSelectionComponent implements OnInit {
  accounts: AccountInterface[] = [];
  @Input() selectedAccount: AccountInterface | null = null;
  @Output() accountChange = new EventEmitter<any>();

  private accountService = inject(AccountService);
  private authService = inject(AuthService);

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
        this.getAccounts();
    }
    this.authService.logged$.subscribe(() => {
      this.getAccounts();
    });
  }

  getAccounts() {
      this.accountService.get()
        .subscribe((accounts: AccountInterface[]) => {
          this.accounts = accounts;
          this.selectedAccount = this.accounts[0];
          this.accountChange.emit({ value: this.selectedAccount });
        });
    }

  selectAccount(event: any) {
    this.accountChange.emit(event);
  }
}
