import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LifiChainInterface } from '../interfaces/lifi-chain.interface';
import { LifiTransfersResponse } from '../interfaces/lifi-transfers-response.interface';
import { LifiTransfersParams } from '../interfaces/lifi-transfers-params.interface';

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
  getChains(chainTypes?: string): Observable<{ chains: LifiChainInterface[] }> {
    let params = new HttpParams();
    if (chainTypes) {
      params = params.set('chainTypes', chainTypes);
    }

    return this.http.get<{ chains: LifiChainInterface[] }>(`${this.baseUrl}/v1/chains`, { params });
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
}
