import { LifiTransactionInterface } from './lifi-transaction.interface';

export interface LifiTransfersResponse {
  hasNext: boolean;
  hasPrevious: boolean;
  next: string | null;
  previous: string | null;
  data: LifiTransactionInterface[];
}
