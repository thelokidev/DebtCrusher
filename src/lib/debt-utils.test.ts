import { calculateTotalDebt } from './debt-utils';
import type { Debt } from '@/types/debt';

describe('calculateTotalDebt', () => {
  it('should return 0 for an empty array of debts', () => {
    const debts: Debt[] = [];
    expect(calculateTotalDebt(debts)).toBe(0);
  });

  it('should calculate the sum of amounts for valid debts', () => {
    const debts: Debt[] = [
      { id: '1', creditorName: 'CC1', amount: 1000, interestRate: 10, minimumPayment: 50, type: 'creditCard' },
      { id: '2', creditorName: 'Loan1', amount: 5000, interestRate: 5, minimumPayment: 200, type: 'loan' },
    ];
    expect(calculateTotalDebt(debts)).toBe(6000);
  });

  it('should ignore debts with negative amounts, treating them as 0', () => {
    const debts: Debt[] = [
      { id: '1', creditorName: 'CC1', amount: 1000, interestRate: 10, minimumPayment: 50, type: 'creditCard' },
      { id: '2', creditorName: 'ErrorDebt', amount: -500, interestRate: 5, minimumPayment: 20, type: 'loan' },
      { id: '3', creditorName: 'Loan1', amount: 2000, interestRate: 5, minimumPayment: 100, type: 'loan' },
    ];
    expect(calculateTotalDebt(debts)).toBe(3000); // 1000 + 0 (for -500) + 2000
  });

  it('should return 0 if all debts have zero or negative amounts', () => {
    const debts: Debt[] = [
      { id: '1', creditorName: 'PaidOff1', amount: 0, interestRate: 10, minimumPayment: 50, type: 'creditCard' },
      { id: '2', creditorName: 'ErrorDebt', amount: -500, interestRate: 5, minimumPayment: 20, type: 'loan' },
      { id: '3', creditorName: 'PaidOff2', amount: 0, interestRate: 5, minimumPayment: 100, type: 'loan' },
    ];
    expect(calculateTotalDebt(debts)).toBe(0);
  });
});
