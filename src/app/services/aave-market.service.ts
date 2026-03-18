import { HttpClient } from '@angular/common/http';
import { inject, Injectable, } from '@angular/core';
import { catchError, map, Observable} from 'rxjs';
import { AaveUserBorrowsInterface, AaveUserSuppliesInterface } from '../interfaces/aave-user.interface';
import { AaveTransactionInterface } from '../interfaces/aave-transaction.interface';
import { GET_MARKET } from '../gql/getMarket.gql';
import { AaveChainInterface, AaveGetMarketsInterface, AaveMarketInterface, PortfolioRiskResultInterface, Reserve, GetAaveChainInterface } from '../interfaces/aave-market';
import { Apollo } from 'apollo-angular';
import { GET_USER_SUPPLIES } from '../gql/getUserSupplies.gql';
import { GET_USER_BORROWS } from '../gql/getUserBorrows.gql';
import { HistoricalPriceDataService } from './historical-price-data.service';
import { GET_CHAINS } from '../gql/getChains.gql';


@Injectable({
  providedIn: 'root'
})
export class AaveMarketService {
  private http = inject(HttpClient);
  private apollo = inject(Apollo);
  private historicalPriceDataService = inject(HistoricalPriceDataService);
  
  constructor() { }

  getTransactions(accountAddress?: string): Observable<AaveTransactionInterface[]> {
    const params: any = {};
    if (accountAddress) {
      params['accountAddress'] = accountAddress;
    }

    return this.http.get<AaveTransactionInterface[]>('aavemarkets/transactions', {
      params,
    }).pipe(
      map((data: any) => {
          return data.userTransactions;
      })
    );
  }

  getMarkets(): Observable<AaveChainInterface[]> {
    return this.http.get<AaveChainInterface[]>('aavemarkets/markets');
  }

  getMarketRiskManagement(accountAddress: string, chain: AaveChainInterface, market: AaveMarketInterface): Observable<PortfolioRiskResultInterface> {
    const params: any = {
      accountAddress,
      marketChain: market.address,
      chainId: chain.chainId,
    };
    return this.http.get<PortfolioRiskResultInterface>('aavemarkets/risk-management', {
      params,
    });
  }

  getChains(): Observable<AaveChainInterface[]> {
    return  this.apollo.query<GetAaveChainInterface>({
      query: GET_CHAINS,
      variables: { filter: 'MAINNET_ONLY' },
    }).pipe(
      map((result) => {
        if (!result || !result.data || !result.data.chains) {
          throw new Error('No chains found');
        }
        return result.data.chains;
      }),
      catchError((error) => {
        throw new Error(
          `Error fetching chains from The Graph API. Please check your query and try again. ${error}`,
        );
      })
    );
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
          reserves: result.data.markets[0].reserves,
          healthFactor: result.data.markets[0].userState.healthFactor,
          totalCollateralBase: result.data.markets[0].userState.totalCollateralBase,
          totalDebtBase: result.data.markets[0].userState.totalDebtBase,
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

  findReserveByTokenAddress(market: AaveMarketInterface, tokenAddress: string): Reserve {
    const reserve = market.reserves.find(reserve => reserve.underlyingToken.address.toLowerCase() === tokenAddress.toLowerCase());
    if (!reserve) {
      throw new Error(`Reserve with token address ${tokenAddress} not found in market ${market.name}`);
    }
    return reserve;
  }

  getUserSupplies(accountAddress: string, chainId: number, market: AaveMarketInterface): Observable<AaveUserSuppliesInterface[]> {
    return this.apollo.query<{ userSupplies: AaveUserSuppliesInterface[] }>({
      query: GET_USER_SUPPLIES,
      variables: { request: { user: accountAddress.toLowerCase(), markets: [ { chainId, address: market.address } ] } },
    }).pipe(
      map((result) => {
        if (!result || !result.data || !result.data.userSupplies) {
          throw new Error('No supplies found for the given user and market chain');
        }
        return result.data.userSupplies;
      }),
      catchError((error) => {
        throw new Error(
          `Error fetching user supplies from The Graph API. Please check your query and try again. ${error}`,
        );
      })
    );
  }

  getUserBorrows(accountAddress: string, marketChain: string): Observable<AaveUserBorrowsInterface[]> {
    return this.apollo.query<{ userBorrows: AaveUserBorrowsInterface[] }>({
      query: GET_USER_BORROWS,
      variables: { request: { user: accountAddress.toLowerCase(), marketChain } },
    }).pipe(
      map((result) => {
        if (!result || !result.data || !result.data.userBorrows) {
          throw new Error('No borrows found for the given user and market chain');
        }
        return result.data.userBorrows;
      }),
      catchError((error) => {
        throw new Error(
          `Error fetching user borrows from The Graph API. Please check your query and try again. ${error}`,
        );
      })
    );
  }
}
