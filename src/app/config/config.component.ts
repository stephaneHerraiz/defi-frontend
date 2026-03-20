import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AccountService, AccountEntity } from '../services/account.service';
import { AccountInterface } from '../interfaces/account.interface';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    ConfirmDialogModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './config.component.html',
  styleUrl: './config.component.scss',
})
export class ConfigComponent implements OnInit {
  private accountService = inject(AccountService);
  private authService = inject(AuthService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  accounts: AccountEntity[] = [];
  newAccount: AccountInterface = { address: '', label: '' };
  loading = false;

  ngOnInit(): void {
    this.loadAccounts();
    this.authService.logged$.subscribe(() => this.loadAccounts());
  }

  loadAccounts(): void {
    if (!this.authService.isAuthenticated()) return;
    this.loading = true;
    this.accountService.get().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  addAccount(): void {
    if (!this.newAccount.address || !this.newAccount.label) return;
    this.accountService.create(this.newAccount).subscribe({
      next: (account) => {
        this.accounts.push(account);
        this.newAccount = { address: '', label: '' };
        this.messageService.add({ severity: 'success', summary: 'Account added' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Failed to add account' });
      },
    });
  }

  confirmDelete(account: AccountEntity, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Delete account "${account.label}"?`,
      accept: () => this.deleteAccount(account),
    });
  }

  private deleteAccount(account: AccountEntity): void {
    this.accountService.remove(account.id).subscribe({
      next: () => {
        this.accounts = this.accounts.filter((a) => a.id !== account.id);
        this.messageService.add({ severity: 'success', summary: 'Account deleted' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Failed to delete account' });
      },
    });
  }
}
