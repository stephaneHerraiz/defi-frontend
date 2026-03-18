import { HttpClient } from '@angular/common/http';
import { inject, Injectable, } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class HistoricalPriceDataService {
  private http = inject(HttpClient);
  
  constructor() { }

  getLatestMonthlyBollingerBand(tokenAddress?: string, chainId?: string, limit?: number, stdDev?: number): Observable<{ lower: number; middle: number; upper: number }> {
    const params: any = {};
    if (tokenAddress) {
      params['tokenAddress'] = tokenAddress;
    }
    if (chainId) {
      params['chainId'] = chainId;
    }
    if (limit) {
      params['limit'] = limit;
    }
    if (stdDev) {
      params['stdDev'] = stdDev;
    }

    return this.http.get<{ lower: number; middle: number; upper: number }>(`ohlc/${tokenAddress}/bollinger/latest`, {
      params,
    })
  }

 
}
