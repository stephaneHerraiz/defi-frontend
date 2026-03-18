export interface AaveMarketInterface extends AaveUserMarketInterface {
  name: string;
  address: string;
  icon: string;
  reserves: Reserve[];
}

export interface AaveGetMarketsInterface {
  markets: {
    name: string;
    address: string;
    icon: string;
    userState: {
      healthFactor: number;
      netAPY: {
        value: number;
      };
      totalCollateralBase: number;
      totalDebtBase: number;
      userDebtAPY: {
        value: number;
      };
      userEarnedAPY: {
        value: number;
      };
      netWorth: number;
      availableBorrowsBase: number;
      currentLiquidationThreshold: {
        value: number;
      };
    }
    reserves: Reserve[];
  }[];
}

export interface Reserve {
  underlyingToken: UnderlyingToken;
  supplyInfo: {
    liquidationThreshold: {
      value: number;
    }
  }
}

export interface UnderlyingToken {
  address: string;
  imageUrl: string;
  name: string;
  decimals: number;
  symbol: string;
}

export interface AaveUserMarketInterface {
  healthFactor: number;
  netAPY: number;
  totalCollateralBase: number;
  totalDebtBase: number;
  userDebtAPY: number;
  userEarnedAPY: number;
  netWorth: number;
  availableBorrowsBase: number;
  currentLiquidationThreshold: number;
};

export interface GetAaveChainInterface {
  chains: AaveChainInterface[];
}

export interface AaveChainInterface {
  name: string;
  chainId: number;
  icon: string;
}

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

export interface PortfolioRiskResultInterface {
  liquidationPrices: Record<string, supplyLiquidationInterface>;
  totalCollateralValue: string;
  var95: string;
  var99: string;
}

export interface supplyLiquidationInterface {
  price: number;
  error: string;
}