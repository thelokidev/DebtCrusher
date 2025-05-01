/**
 * Represents a bank account.
 */
export interface BankAccount {
  /**
   * The account ID.
   */
  accountId: string;
  /**
   * The account name.
   */
  accountName: string;
  /**
   * The current balance.
   */
  balance: number;
}

/**
 * Asynchronously retrieves bank accounts for a user.
 *
 * @param userId The ID of the user.
 * @returns A promise that resolves to a list of BankAccount objects.
 */
export async function getBankAccounts(userId: string): Promise<BankAccount[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      accountId: '1234567890',
      accountName: 'Checking Account',
      balance: 1000,
    },
    {
      accountId: '0987654321',
      accountName: 'Savings Account',
      balance: 5000,
    },
  ];
}

/**
 * Represents a debt transaction.
 */
export interface DebtTransaction {
  /**
   * The transaction ID.
   */
  transactionId: string;
  /**
   * The transaction date.
   */
  transactionDate: Date;
  /**
   * The transaction amount.
   */
  transactionAmount: number;
  /**
   * The transaction description.
   */
  transactionDescription: string;
}

/**
 * Asynchronously retrieves debt transactions for a bank account.
 *
 * @param accountId The ID of the bank account.
 * @returns A promise that resolves to a list of DebtTransaction objects.
 */
export async function getDebtTransactions(accountId: string): Promise<DebtTransaction[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      transactionId: '1',
      transactionDate: new Date(),
      transactionAmount: 100,
      transactionDescription: 'Credit Card Payment',
    },
    {
      transactionId: '2',
      transactionDate: new Date(),
      transactionAmount: 50,
      transactionDescription: 'Loan Payment',
    },
  ];
}
