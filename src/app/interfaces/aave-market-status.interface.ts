import { AaveMarketInterface } from "./aave-market.interface";
import { AccountInterface } from "./account.interface";

export interface AaveMarketStatusInterface {

    created_at: Date;

    healthFactor: number;

    totalBorrows: number

    liquidationThreshold: number

    account: string
    
    market: string

}

export interface GetAaveMarketStatusInterface {

    data : AaveMarketStatusInterface[];

    account?: string
    
    market?: string

}