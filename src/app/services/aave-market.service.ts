import { HttpClient } from '@angular/common/http';
import { inject, Injectable, } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { AaveMarketHistoryInterface, AaveMarketStatus, GetAaveMarketHistoryInterface } from '../interfaces/aave-market-status.interface';
import { UserChainInterface } from '../interfaces/user-chain.interface';
import { AaveTransactionInterface } from '../interfaces/aave-transaction.interface';
import { GET_MARKET } from '../gql/getMarket.gql';
import { AaveGetMarketsInterface, AaveMarketInterface } from '../interfaces/aave-market-reserve-info.interface';
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

  getMarkets(): Observable<UserChainInterface[]> {
    return this.http.get<UserChainInterface[]>('aavemarkets/markets');
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

  getMarket(chainId: number, accountAddress: string): Observable<AaveMarketInterface> {
    return this.apollo.query<AaveGetMarketsInterface>({
      query: GET_MARKET,
      variables: { request: { 
        chainIds: [chainId],
        user: accountAddress.toLowerCase(),
      }},
    }).pipe(
      map((result) => {
        if (!result || !result.data || !result.data.markets || result.data.markets.length === 0) {
          throw new Error('No markets found for the given chainId');
        }
        return {
          name:result.data.markets[0].name,
          address: result.data.markets[0].address,
          icon: result.data.markets[0].icon,
          reserves: result.data.markets[0].reserves.map(reserve => reserve.underlyingToken),
          ...result.data.markets[0].userState,
          currentLiquidationThreshold: result.data.markets[0].userState.currentLiquidationThreshold.value,
          netAPY: result.data.markets[0].userState.netAPY.value,
          userDebtAPY: result.data.markets[0].userState.userDebtAPY.value,
          userEarnedAPY: result.data.markets[0].userState.userEarnedAPY.value,
        } as AaveMarketInterface;
      }),
      catchError((error) => {
        throw new Error(
          `Error fetching data from The Graph API. Please check your query and try again. ${error}`,
        );
      })
    );
  }
}
