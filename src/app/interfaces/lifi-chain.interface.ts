export interface LifiChainInterface {
    key: string;
    chainType: LifiChainType;
    name: string;
    coin: string;
    id: number;
    mainnet: boolean;
    logoURI: string;
    tokenlistUrl: string;
    faucetUrls: string[];
    multicallAddress: string;
    relayerSupported: boolean;
    metamask: LifiMetamaskConfig;
    nativeToken: LifiNativeToken;
    diamondAddress: string;
    permit2: string;
    permit2Proxy: string;
}

export interface LifiMetamaskConfig {
    chainId: string;
    blockExplorerUrls: string[];
    chainName: string;
    nativeCurrency: LifiNativeCurrency;
    rpcUrls: string[];
}

export interface LifiNativeCurrency {
    name: string;
    symbol: string;
    decimals: number;
}

export interface LifiNativeToken {
    address: string;
    chainId: number;
    symbol: string;
    decimals: number;
    name: string;
    coinKey: string;
    logoURI: string;
    priceUSD: string;
    tags: string[];
}

export enum LifiChainType {
    EVM = 'EVM',
    SOLANA = 'SOLANA',
    UTXO = 'UTXO'
}
