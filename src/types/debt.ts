
export interface Debt {
  id: string;
  creditorName: string;
  amount: number;
  interestRate: number;
  minimumPayment: number;
}

// Added 'velocityBanking' and 'debtArbitrage'
export type DebtStrategy = 'snowball' | 'avalanche' | 'interestDifferential' | 'paymentRatio' | 'velocityBanking' | 'debtArbitrage';
