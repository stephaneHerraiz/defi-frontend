
export interface AaveTransactionInterface {

    action: AaveTransactionActions;
    amount: number;
    assetPriceUSD: number;
    id: string;
    reserve : AaveReserve;
    timestamp: number;
    txHash: string;

}

export interface AaveReserve {
    decimals: number;
    symbol: string;
}

export enum AaveTransactionActions {
    SUPPLY = 'Supply',
    REDEEM_UNDERLYING = 'RedeemUnderlying',
    BORROW = 'Borrow',
    REPAY = 'Repay',
    SWAP_BORROW_RATE = 'SwapBorrowRate',
    USAGE_AS_COLLATERAL = 'UsageAsCollateral',
    LIQUIDATION_CALL = 'LiquidationCall',
    FLASH_LOAN = 'FlashLoan',
    TRANSFER = 'Transfer',
    CLAIM_REWARDS = 'ClaimRewards',
    CLAIM_STAKING_REWARDS = 'ClaimStakingRewards',
    STAKE = 'Stake',
    UNSTAKE = 'Unstake',
    WITHDRAW = 'Withdraw',
    REWARD_REDEEM = 'RewardRedeem',

}

