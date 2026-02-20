export interface AaveMarketInterface extends AaveUserMarketInterface {
  name: string;
  address: string;
  icon: string;
  reserves: UnderlyingToken[];
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
    reserves: {
      underlyingToken: UnderlyingToken;
    }[];
  }[];
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
