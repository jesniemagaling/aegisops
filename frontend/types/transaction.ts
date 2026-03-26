export interface Transaction {
  id: string;
  sourceSystemId: string;
  externalTransactionId: string;
  referenceId: string;
  transactionType: string;
  amountIn: number;
  amountOut: number;
  currency: string;
  occurredAt: string;
  businessDate: string;
  lifecycleStatus: string;
  validationStatus: string;
  reconciliationStatus: string;
  reviewStatus: string;
  createdAt: string;
  updatedAt: string;
}
