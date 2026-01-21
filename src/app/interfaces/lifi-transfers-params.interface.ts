export interface LifiTransfersParams {
  limit?: number;
  next?: string;
  previous?: string;
  integrator?: string | string[];
  wallet?: string;
  status?: 'ALL' | 'DONE' | 'PENDING' | 'FAILED';
  fromTimestamp?: number;
  toTimestamp?: number;
  fromChain?: string;
  toChain?: string;
  fromToken?: string;
  toToken?: string;
}
