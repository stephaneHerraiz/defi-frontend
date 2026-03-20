import { HttpClient } from '@angular/common/http';
import { inject, Injectable, } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountInterface } from '../interfaces/account.interface';

export interface AccountEntity extends AccountInterface {
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  constructor() { }

  get(): Observable<AccountEntity[]> {
    return this.http.get<AccountEntity[]>('accounts');
  }

  create(account: AccountInterface): Observable<AccountEntity> {
    return this.http.post<AccountEntity>('accounts', account);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`accounts/${id}`);
  }
}
