import { HttpClient } from '@angular/common/http';
import { inject, Injectable, } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';
import { AaveMarketStatusInterface, GetAaveMarketStatusInterface } from '../interfaces/aave-market-status.interface';
import { AaveMarketInterface } from '../interfaces/aave-market.interface';
import { AaveTransactionInterface } from '../interfaces/aave-transaction.interface';

@Injectable({
  providedIn: 'root'
})
export class AaveMarketService {
  private http = inject(HttpClient);
  
  constructor() { }

  get(accountAddress?: string, marketChain?: string): Observable<GetAaveMarketStatusInterface> {
    const params: any = {};
    if (accountAddress) {
      params['accountAddress'] = accountAddress;
    }
    if (marketChain) {
      params['marketChain'] = marketChain;
    }

    return this.http.get<AaveMarketStatusInterface[]>('aavemarkets', {
      params,
    }).pipe(
      map((data: AaveMarketStatusInterface[]) => {
        return { data, account: accountAddress, market: marketChain };
      })
    );
  }

  getTransactions(accountAddress?: string, marketChain?: string): Observable<AaveTransactionInterface[]> {
    const params: any = {};
    if (accountAddress) {
      params['accountAddress'] = accountAddress;
    }
    if (marketChain) {
      params['marketChain'] = marketChain;
    }

    return this.http.get<AaveTransactionInterface[]>('aavemarkets/transactions', {
      params,
    }).pipe(
      map((data: any) => {
          return data.userTransactions;
      })
    );
  }

  getMarkets(): Observable<AaveMarketInterface[]> {
    return this.http.get<AaveMarketInterface[]>('aavemarkets/markets');
  }
}
