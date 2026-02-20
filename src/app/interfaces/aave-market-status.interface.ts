import { UserChainInterface } from "./user-chain.interface";
import { AccountInterface } from "./account.interface";

export interface AaveMarketHistoryInterface {

    created_at: Date;

    healthFactor: number;

    totalBorrows: number

    liquidationThreshold: number

    account: string
    
    market: string

}

export interface GetAaveMarketHistoryInterface {

    data : AaveMarketHistoryInterface[];

    account?: string
    
    market?: string
}

export interface AAveReserveStatus {
  id: string;
  underlyingAsset: string;
  name: string;
  symbol: string;
  decimals: number;
  underlyingBalance: number;
  monthlyBB?: {
    lower: number;
    middle: number;
    upper: number;
  };
}

export interface AaveMarketStatus {
  totalBorrowsUSD: number;
  monthlyBBScenario: lowerBollingerBandScenario;
}

export interface lowerBollingerBandScenario {
  healthFactor: number;
  maximumBorrowPower: number;
  liquidationBorrowPower: number;
  reserveStatusList: AAveReserveStatus[];
}