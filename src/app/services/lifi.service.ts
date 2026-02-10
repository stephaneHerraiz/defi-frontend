import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { LifiChainInterface } from '../interfaces/lifi-chain.interface';
import { LifiTransfersResponse } from '../interfaces/lifi-transfers-response.interface';
import { LifiTransfersParams } from '../interfaces/lifi-transfers-params.interface';
import { LifiToken } from '../interfaces/lifi-transaction.interface';
@Injectable({
  providedIn: 'root'
})
export class LifiService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'https://li.quest';

  constructor() { }

  /**
   * Get information about all currently supported chains
   * @param chainTypes Restrict the resulting chains to the given chainTypes (e.g., 'EVM', 'SOLANA')
   * @returns Observable of chains response
   */
  getChains(chainTypes?: string): Observable<LifiChainInterface[]> {
    let params = new HttpParams();
    if (chainTypes) {
      params = params.set('chainTypes', chainTypes);
    }

    return this.http.get<{ chains: LifiChainInterface[] }>(`${this.baseUrl}/v1/chains`, { params })
    .pipe(
      map(response => {
        return response.chains;
      })
    );
  }

  /**
   * Get a paginated list of filtered transfers for a specific wallet
   * @param transferParams Parameters to filter transfers
   * @returns Observable of paginated transfers response
   */
  getWalletTransfers(transferParams: LifiTransfersParams): Observable<LifiTransfersResponse> {
    let params = new HttpParams();

    // Set default limit if not provided
    if (transferParams.limit !== undefined) {
      params = params.set('limit', transferParams.limit.toString());
    }

    // Pagination cursors
    if (transferParams.next) {
      params = params.set('next', transferParams.next);
    }
    if (transferParams.previous) {
      params = params.set('previous', transferParams.previous);
    }

    // Filters
    if (transferParams.integrator) {
      if (Array.isArray(transferParams.integrator)) {
        transferParams.integrator.forEach(int => {
          params = params.append('integrator', int);
        });
      } else {
        params = params.set('integrator', transferParams.integrator);
      }
    }

    if (transferParams.wallet) {
      params = params.set('wallet', transferParams.wallet);
    }

    if (transferParams.status) {
      params = params.set('status', transferParams.status);
    }

    if (transferParams.fromTimestamp !== undefined) {
      params = params.set('fromTimestamp', transferParams.fromTimestamp.toString());
    }

    if (transferParams.toTimestamp !== undefined) {
      params = params.set('toTimestamp', transferParams.toTimestamp.toString());
    }

    if (transferParams.fromChain) {
      params = params.set('fromChain', transferParams.fromChain);
    }

    if (transferParams.toChain) {
      params = params.set('toChain', transferParams.toChain);
    }

    if (transferParams.fromToken) {
      params = params.set('fromToken', transferParams.fromToken);
    }

    if (transferParams.toToken) {
      params = params.set('toToken', transferParams.toToken);
    }

    return this.http.get<LifiTransfersResponse>(`${this.baseUrl}/v2/analytics/transfers`, { params });
  }

  /**
   * Get information about a token by its address or symbol and chain
   * @param chain Id or key of the chain that contains the token
   * @param token Address or symbol of the token on the requested chain
   * @returns Observable of token information
   */
  getTokenInformation(chain: string, token: string): Observable<LifiToken> {
    let params = new HttpParams()
      .set('chain', chain)
      .set('token', token);

    return this.http.get<LifiToken>(`${this.baseUrl}/v1/token`, { params });
  }
}
