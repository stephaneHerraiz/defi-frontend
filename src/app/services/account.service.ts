import { HttpClient } from '@angular/common/http';
import { inject, Injectable, } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountInterface } from '../interfaces/account.interface';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  constructor() { }


  get(): Observable<AccountInterface[]> {
    
    return this.http.get<AccountInterface[]>('accounts');
  }
}
