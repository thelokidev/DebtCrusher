
import type { Debt, DebtStrategy } from '@/types/debt';

/**
 * Calculates the total current debt amount.
 * @param debts - Array of Debt objects.
 * @returns Total debt amount.
 */
export function calculateTotalDebt(debts: Debt[]): number {
  return debts.reduce((total, debt) => total + Math.max(0, debt.amount), 0); // Ensure non-negative sum
}

/**
 * Calculates the total minimum monthly payments required.
 * @param debts - Array of Debt objects.
 * @returns Total minimum payment.
 */
export function calculateTotalMinimumPayment(debts: Debt[]): number {
    // Ensure minimum payments are positive
    return debts.reduce((total, debt) => total + Math.max(0, debt.minimumPayment), 0);
}


/**
 * Calculates the payment allocation for each debt based on the chosen strategy
 * and the total monthly payment amount.
 * @param debts - Array of Debt objects filtered to only include those with amount > 0.
 * @param strategy - The chosen debt repayment strategy.
 * @param totalMonthlyPayment - The total amount the user wants to pay monthly.
 * @returns An object mapping debt IDs to their allocated payment amount.
 */
export function calculatePaymentAllocation(
  debts: Debt[],
  strategy: DebtStrategy,
  totalMonthlyPayment: number
): Record<string, number> {
  const allocation: Record<string, number> = {};
  const validDebts = debts.filter(d => d.amount > 0.01); // Filter out paid debts (with tolerance)
  if (validDebts.length === 0) return allocation;

  const totalMinimumPayment = calculateTotalMinimumPayment(validDebts);
  let remainingPayment = Math.max(0, totalMonthlyPayment); // Ensure non-negative

  // Initialize allocation with 0 for all valid debts
  validDebts.forEach(debt => {
      allocation[debt.id] = 0;
  });


  // Handle case where total payment is less than or equal to minimums
  if (totalMonthlyPayment <= totalMinimumPayment) {
    // Allocate minimums proportionally if total payment is less than required minimums
    // Or exactly the minimum if total payment equals total minimums
     const ratio = totalMinimumPayment > 0.01 ? totalMonthlyPayment / totalMinimumPayment : 0; // Avoid division by zero
     validDebts.forEach(debt => {
         // Allocate proportional minimum, but capped at the debt amount AND the minimum payment itself if ratio > 1 (shouldn't happen here, but safety)
         const proportionalMin = debt.minimumPayment * ratio;
         allocation[debt.id] = Math.min(proportionalMin, debt.amount, debt.minimumPayment);
     });
     // Ensure the total allocated doesn't exceed the totalMonthlyPayment due to rounding/caps
     let allocatedSum = Object.values(allocation).reduce((sum, val) => sum + val, 0);
     if (allocatedSum > totalMonthlyPayment) {
         // If over allocated (unlikely but possible with many small debts/rounding), scale back proportionally
         const adjustmentRatio = totalMonthlyPayment / allocatedSum;
         validDebts.forEach(debt => {
             allocation[debt.id] *= adjustmentRatio;
         });
     }

     return allocation;
  }

  // --- Payment is GREATER than total minimums ---

  // 1. Allocate minimum payment first to all debts
  validDebts.forEach(debt => {
      const payment = Math.min(debt.minimumPayment, debt.amount); // Pay minimum, capped at debt amount
      allocation[debt.id] = payment;
      remainingPayment -= payment;
  });


  // 2. Determine the order based on strategy for the remaining (extra) payment
  let sortedDebts: Debt[];
  switch (strategy) {
    case 'snowball':
      sortedDebts = [...validDebts].sort((a, b) => a.amount - b.amount);
      break;
    case 'avalanche':
    case 'interestDifferential':
    // --- Placeholder Logic for Advanced Strategies ---
    // Velocity Banking and Debt Arbitrage require complex external factors (LOC availability, 0% APR offers, etc.)
    // For this simplified allocation view, we'll default their *extra payment* targeting to Avalanche (highest interest).
    // A real implementation would need a much more sophisticated model.
    case 'velocityBanking':
    case 'debtArbitrage':
      console.warn(`Simplified allocation for ${strategy} strategy used. Targeting highest interest rate for extra payments.`);
      sortedDebts = [...validDebts].sort((a, b) => b.interestRate - a.interestRate);
      break;
    // --- End Placeholder Logic ---
    case 'paymentRatio':
      sortedDebts = [...validDebts].sort((a, b) => {
        // Calculate ratio: Minimum Payment / Balance. Handle balance = 0. Higher ratio first.
        const ratioA = a.amount > 0.01 ? a.minimumPayment / a.amount : 0;
        const ratioB = b.amount > 0.01 ? b.minimumPayment / b.amount : 0;
        return ratioB - ratioA; // Sort by highest ratio first
      });
      break;
    default: // Default to avalanche if strategy is unknown
      sortedDebts = [...validDebts].sort((a, b) => b.interestRate - a.interestRate);
  }

   // 3. Allocate the remaining payment (extra payment) according to the sorted order
   for (const debt of sortedDebts) {
       if (remainingPayment <= 0.01) break; // Stop if no more extra payment (with tolerance)

       // Calculate how much is still owed *on this specific debt* after its minimum was paid
       const amountOwedAfterMinimum = Math.max(0, debt.amount - allocation[debt.id]);
       if (amountOwedAfterMinimum > 0) {
           // Allocate the smaller of the remaining extra payment or the amount needed to pay off this debt
           const paymentForThisDebt = Math.min(remainingPayment, amountOwedAfterMinimum);
           allocation[debt.id] += paymentForThisDebt;
           remainingPayment -= paymentForThisDebt; // Decrease the pool of extra money
       }
   }

   // Final check: Ensure no allocation exceeds the debt amount (should be handled by logic above, but as a safeguard)
   validDebts.forEach(debt => {
        if (allocation[debt.id] > debt.amount) {
             console.warn(`Correcting over-allocation for ${debt.creditorName}. Allocated: ${allocation[debt.id]}, Amount: ${debt.amount}`);
             allocation[debt.id] = debt.amount;
        }
         // Ensure allocation is not negative
        if (allocation[debt.id] < 0) {
             allocation[debt.id] = 0;
        }
   });

  return allocation;
}

/**
 * Calculates the projected debt-free date and monthly progress.
 * NOTE: This projection assumes the chosen strategy and monthly payment remain constant.
 * It does NOT currently model complex strategies like Velocity Banking or Arbitrage accurately.
 *
 * @param initialDebts - Array of initial Debt objects (or current state for re-projection).
 * @param strategy - The chosen debt repayment strategy (affects allocation order).
 * @param monthlyPayment - The consistent monthly payment amount.
 * @returns Object containing projected debt-free date and monthly breakdown.
 */
export function calculateDebtProjection(
    initialDebts: Debt[],
    strategy: DebtStrategy,
    monthlyPayment: number
): { debtFreeDate: Date | null; monthlyBreakdown: { month: number; remainingDebt: number; paymentMade: number }[] } {
    // Deep copy and filter initially paid debts or those with 0 amount
    let debts = JSON.parse(JSON.stringify(initialDebts.filter(d => d.amount > 0.01))) as Debt[];
    const monthlyBreakdown: { month: number; remainingDebt: number; paymentMade: number }[] = [];
    let months = 0;
    const maxMonths = 12 * 75; // Limit calculation to 75 years to prevent infinite loops

    if (debts.length === 0) {
         return { debtFreeDate: new Date(), monthlyBreakdown: [] }; // Already debt free
    }

    // --- Initial Check for Solvability ---
    const totalMinimumPayment = calculateTotalMinimumPayment(debts);
    if (monthlyPayment <= 0) {
        console.warn("Monthly payment is zero or negative. Cannot calculate projection.");
        return { debtFreeDate: null, monthlyBreakdown: [] };
    }

    // More robust check: Will the payment cover interest + minimums?
    // Calculate total interest accrued in the first month for a rough estimate.
    let firstMonthInterest = 0;
    debts.forEach(debt => {
        firstMonthInterest += (debt.interestRate / 100 / 12) * debt.amount;
    });

    // If the monthly payment doesn't even cover the first month's interest + minimums (excluding overlap),
    // the debt will likely grow indefinitely (or until minimums decrease).
    // This is a heuristic, as minimums can change, but a strong indicator.
    // We compare payment to interest + (minimum - theoretical interest covered by minimum if applicable)
    // A simpler check is just payment vs (interest + minimums)
    if (monthlyPayment < totalMinimumPayment + firstMonthInterest - (/* potential overlap adjustment could go here */ 0) && monthlyPayment <= totalMinimumPayment) {
        console.warn(`Monthly payment ($${monthlyPayment.toFixed(2)}) may not cover minimums ($${totalMinimumPayment.toFixed(2)}) and estimated first month interest ($${firstMonthInterest.toFixed(2)}). Projection might be infinite.`);
         // We still attempt projection but it might hit the maxMonths limit.
        // Return { debtFreeDate: null, monthlyBreakdown: [] }; // Option to stop early
    }
     // --- End Solvability Check ---


    // --- Simulation Loop ---
    while (debts.length > 0 && months < maxMonths) {
        months++;
        let currentMonthTotalPaymentMade = 0;
        let totalDebtBeforeInterest = calculateTotalDebt(debts);

        // 1. Calculate and add interest for the month *based on the balance at the start of the month*
        debts.forEach(debt => {
            const monthlyInterest = (debt.interestRate / 100 / 12) * debt.amount;
            debt.amount += monthlyInterest;
        });

        // 2. Calculate payment allocation for the current month's state (after interest)
        // Pass the *current* state of debts to the allocation function
        const allocation = calculatePaymentAllocation(debts, strategy, monthlyPayment);

        // 3. Apply payments based on allocation
        const paidOffDebtIds: string[] = [];
        debts.forEach(debt => {
            const paymentAllocated = allocation[debt.id] || 0;
            // Ensure payment doesn't exceed the current amount *after* interest was added
            const actualPayment = Math.min(paymentAllocated, debt.amount);

            debt.amount -= actualPayment;
            currentMonthTotalPaymentMade += actualPayment;

            // Check if debt is paid off (use tolerance)
            if (debt.amount <= 0.01) {
                debt.amount = 0; // Set to zero explicitly to avoid tiny negative numbers
                paidOffDebtIds.push(debt.id);
            }
        });

        // 4. Record the state *after* payments for this month
        const remainingTotalDebt = calculateTotalDebt(debts); // Recalculate total after payments
        monthlyBreakdown.push({
             month: months,
             remainingDebt: remainingTotalDebt,
             paymentMade: currentMonthTotalPaymentMade, // Total paid this month across all debts
         });

        // 5. Remove fully paid-off debts for the next iteration
        debts = debts.filter(debt => !paidOffDebtIds.includes(debt.id));

        // Safety break: If total debt isn't decreasing sufficiently, stop.
        if (months > 1 && remainingTotalDebt >= totalDebtBeforeInterest && firstMonthInterest > 0.01) {
             // If debt didn't decrease or increased despite payment (and interest exists)
             console.warn(`Debt is not decreasing month ${months}. Payment ($${currentMonthTotalPaymentMade.toFixed(2)}) may be insufficient to cover interest. Stopping projection.`);
             return { debtFreeDate: null, monthlyBreakdown };
        }

    } // --- End Simulation Loop ---


    // --- Determine Outcome ---
    if (months >= maxMonths && debts.length > 0) {
         console.warn(`Projection reached maximum limit (${maxMonths / 12} years) with $${calculateTotalDebt(debts).toFixed(2)} debt remaining.`);
         // Return the breakdown up to this point, but indicate incompletion
         return { debtFreeDate: null, monthlyBreakdown };
    }

    // If loop finished and debts are empty, calculate the date
    const debtFreeDate = new Date();
    // Add 'months' because loop increments *then* checks. If it takes 1 month, loop runs once, months becomes 1.
    debtFreeDate.setMonth(debtFreeDate.getMonth() + months);


    return { debtFreeDate, monthlyBreakdown };
}
