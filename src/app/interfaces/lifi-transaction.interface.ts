export interface LifiTransactionInterface {
    transactionId: string;
    sending: LifiTransactionData;
    receiving: LifiTransactionData;
    lifiExplorerLink: string;
    fromAddress: string;
    toAddress: string;
    tool: string;
    status: LifiTransactionStatus;
    substatus: LifiTransactionSubstatus;
    substatusMessage: string;
    metadata: LifiMetadata;
    feeCosts: any[];
}

export interface LifiTransactionData {
    txHash: string;
    txLink: string;
    token: LifiToken;
    chainId: number;
    gasPrice: string;
    gasUsed: string;
    gasToken: LifiToken;
    gasAmount: string;
    gasAmountUSD: string;
    amountUSD: string;
    value: string;
    includedSteps?: LifiIncludedStep[];
    amount: string;
    timestamp: number;
}

export interface LifiToken {
    address: string;
    chainId: number;
    symbol: string;
    decimals: number;
    name: string;
    coinKey: string;
    logoURI: string;
    priceUSD: string;
}

export interface LifiIncludedStep {
    tool: string;
    toolDetails: LifiToolDetails;
    fromAmount: string;
    fromToken: LifiToken;
    toToken: LifiToken;
    toAmount: string;
    bridgedAmount: string | null;
}

export interface LifiToolDetails {
    key: string;
    name: string;
    logoURI: string;
    webUrl: string;
}

export interface LifiMetadata {
    integrator: string;
}

export enum LifiTransactionStatus {
    PENDING = 'PENDING',
    DONE = 'DONE',
    FAILED = 'FAILED',
    INVALID = 'INVALID',
    NOT_FOUND = 'NOT_FOUND'
}

export enum LifiTransactionSubstatus {
    WAIT_SOURCE_CONFIRMATIONS = 'WAIT_SOURCE_CONFIRMATIONS',
    WAIT_DESTINATION_TRANSACTION = 'WAIT_DESTINATION_TRANSACTION',
    BRIDGE_NOT_AVAILABLE = 'BRIDGE_NOT_AVAILABLE',
    CHAIN_NOT_AVAILABLE = 'CHAIN_NOT_AVAILABLE',
    NOT_PROCESSABLE_REFUND_NEEDED = 'NOT_PROCESSABLE_REFUND_NEEDED',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    COMPLETED = 'COMPLETED',
    PARTIAL = 'PARTIAL',
    REFUNDED = 'REFUNDED'
}
