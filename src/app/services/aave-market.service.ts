import { HttpClient } from '@angular/common/http';
import { inject, Injectable, } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { AaveMarketHistoryInterface, AaveMarketStatus, GetAaveMarketHistoryInterface } from '../interfaces/aave-market-status.interface';
import { AaveMarketInterface } from '../interfaces/aave-market.interface';
import { AaveTransactionInterface } from '../interfaces/aave-transaction.interface';
import { GET_MARKETS_RESERVES_INFO } from '../gql/getMarketsReservesInfo.gql';
import { MarketsReservesInfo, UnderlyingToken } from '../interfaces/aave-market-reserve-info.interface';
import { Apollo } from 'apollo-angular';


@Injectable({
  providedIn: 'root'
})
export class AaveMarketService {
  private http = inject(HttpClient);
  private apollo = inject(Apollo);
  
  constructor() { }

  get(accountAddress?: string, marketChain?: string): Observable<GetAaveMarketHistoryInterface> {
    const params: any = {};
    if (accountAddress) {
      params['accountAddress'] = accountAddress;
    }
    if (marketChain) {
      params['marketChain'] = marketChain;
    }

    return this.http.get<AaveMarketHistoryInterface[]>('aavemarkets', {
      params,
    }).pipe(
      map((data: AaveMarketHistoryInterface[]) => {
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

  getMarketStatus(accountAddress: string, address: string, marketChain: string): Observable<AaveMarketStatus> {
    const params: any = {
      accountAddress,
      address,
      marketChain,
    };
    return this.http.get<AaveMarketStatus>('aavemarkets/status', {
      params,
    });
  }

  getMarketReservesInfo(chainId: number): Observable<UnderlyingToken[]> {
    return this.apollo.query<MarketsReservesInfo>({
      query: GET_MARKETS_RESERVES_INFO,
      variables: { request: { chainIds: [chainId] } },
    }).pipe(
      map((result) => {
        if (!result || !result.data || !result.data.markets || result.data.markets.length === 0) {
          throw new Error('No markets found for the given chainId');
        }
        return result?.data?.markets[0].reserves.map((reserve) => reserve.underlyingToken);
      }),
      catchError((error) => {
        throw new Error(
          `Error fetching data from The Graph API. Please check your query and try again. ${error}`,
        );
      })
    );
  }
}
