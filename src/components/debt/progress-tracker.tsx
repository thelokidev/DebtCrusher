
'use client';

import type * as React from 'react';
import { useMemo } from 'react';
import type { Debt, DebtStrategy } from '@/types/debt';
import { calculateDebtProjection, calculateTotalDebt, calculateTotalMinimumPayment } from '@/lib/debt-utils'; // Import calculateTotalMinimumPayment
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Target, CalendarCheck, TrendingDown, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import { format, addMonths } from 'date-fns'; // Added addMonths

interface ProgressTrackerProps {
  initialDebts: Debt[];
  currentDebts: Debt[];
  strategy: DebtStrategy;
  monthlyPayment: number;
}

export function ProgressTracker({ initialDebts, currentDebts, strategy, monthlyPayment }: ProgressTrackerProps) {
  const initialTotalDebt = useMemo(() => calculateTotalDebt(initialDebts), [initialDebts]);
  const currentTotalDebt = useMemo(() => calculateTotalDebt(currentDebts), [currentDebts]);
  const currentMinPayment = useMemo(() => calculateTotalMinimumPayment(currentDebts), [currentDebts]);

  const progressPercentage = useMemo(() => {
    const validInitialDebt = initialTotalDebt > 0.01; // Use tolerance
    if (!validInitialDebt) return initialDebts.length > 0 ? 100 : 0; // If initial was 0 or negative, progress is 100% or 0%
    const paidOff = Math.max(0, initialTotalDebt - currentTotalDebt);
    return Math.max(0, Math.min(100, (paidOff / initialTotalDebt) * 100));
  }, [initialTotalDebt, currentTotalDebt, initialDebts.length]);

  const { debtFreeDate, monthlyBreakdown } = useMemo(() => {
    const validCurrentDebts = currentDebts.filter(d => d.amount > 0.01);
    if (validCurrentDebts.length === 0) {
         return { debtFreeDate: initialDebts.length > 0 ? new Date() : null, monthlyBreakdown: [] };
    }
    // Use the calculated currentMinPayment here
    if (monthlyPayment <= 0 || monthlyPayment < currentMinPayment) {
        return { debtFreeDate: null, monthlyBreakdown: [] };
    }

    return calculateDebtProjection(validCurrentDebts, strategy, monthlyPayment);
  }, [currentDebts, strategy, monthlyPayment, initialDebts, currentMinPayment]); // Added currentMinPayment dependency


  const totalPaid = Math.max(0, initialTotalDebt - currentTotalDebt);
  const isProjectionLimited = debtFreeDate === null && monthlyBreakdown.length > 0 && monthlyBreakdown[monthlyBreakdown.length - 1].remainingDebt > 0.01;
  const isPaymentInsufficient = debtFreeDate === null && monthlyPayment < currentMinPayment && currentMinPayment > 0;


  return (
    // Adjusted card style for dark theme
    <Card className="bg-card shadow-md border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-foreground">
          <Target className="text-primary" /> Debt Freedom Progress
        </CardTitle>
        <CardDescription className="text-muted-foreground">Track your journey to becoming debt-free.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        {initialDebts.length > 0 ? (
          <div>
            <Label className="text-base font-medium text-foreground/90">Overall Progress</Label>
            <div className="flex items-center gap-4 mt-2">
              {/* Progress bar styling adjusted for dark theme */}
              <Progress value={progressPercentage} className="flex-grow h-4 bg-muted [&>span]:bg-primary" aria-label={`Debt payoff progress: ${progressPercentage.toFixed(1)}%`} />
              {/* Text color adjusted */}
              <span className="font-semibold text-lg text-primary">{progressPercentage.toFixed(1)}%</span>
            </div>
            {/* Muted text styling adjusted */}
            <p className="text-sm text-muted-foreground mt-1">
              You've paid off <span className="font-medium text-primary">${totalPaid.toFixed(2)}</span> of your initial ${initialTotalDebt.toFixed(2)} debt.
            </p>
              <p className="text-sm text-muted-foreground mt-1">
              Remaining Debt: <span className="font-medium text-foreground/90">${currentTotalDebt.toFixed(2)}</span>
            </p>
          </div>
        ) : (
            <p className="text-muted-foreground text-center">Add some debts to see your progress!</p>
        )}


        {/* Projected Debt-Free Date */}
         {currentDebts.length > 0 && monthlyPayment > 0 && (
             // Container styling adjusted
             <div className="flex items-center gap-3 p-3 border border-border/50 rounded-md bg-secondary/50">
             {isPaymentInsufficient || isProjectionLimited ? (
                <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
             ) : debtFreeDate ? (
                <CalendarCheck className="h-6 w-6 text-primary flex-shrink-0" />
             ) : (
                 <CalendarCheck className="h-6 w-6 text-muted-foreground flex-shrink-0" /> // Fallback icon
             )}
                 <div className="flex-1">
                 {/* Label styling adjusted */}
                 <Label className={`font-semibold ${isPaymentInsufficient || isProjectionLimited ? 'text-destructive' : 'text-primary'}`}>
                    Projected Debt-Free Date
                 </Label>
                 {debtFreeDate ? (
                     // Text color adjusted
                     <p className="text-lg font-bold text-foreground">{format(debtFreeDate, 'MMMM yyyy')}</p>
                 ) : (
                     <p className="text-lg font-bold text-muted-foreground">
                         {isPaymentInsufficient ? 'Payment too low' : 'Beyond projection limit'}
                     </p>
                 )}
                 {isPaymentInsufficient && (
                         <p className="text-xs text-destructive/90">Monthly payment (${monthlyPayment.toFixed(2)}) is below the total minimum required (${currentMinPayment.toFixed(2)}).</p>
                 )}
                  {isProjectionLimited && (
                         <p className="text-xs text-destructive/90">Payoff date is beyond the 75-year calculation limit. Consider increasing payment significantly.</p>
                 )}
                 {debtFreeDate === null && !isPaymentInsufficient && !isProjectionLimited && monthlyPayment >= currentMinPayment && (
                         <p className="text-xs text-muted-foreground">Calculation issue or requires very long term. Increase payment?</p>
                 )}
                 </div>
             </div>
         )}
          {currentDebts.length === 0 && initialDebts.length > 0 && (
             // Success message styling adjusted
             <div className="flex items-center gap-3 p-3 border border-primary/50 rounded-md bg-primary/10">
                <CalendarCheck className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                    <Label className="font-semibold text-primary">Congratulations!</Label>
                    <p className="text-lg font-bold text-foreground">You are debt free!</p>
                </div>
             </div>
          )}


      </CardContent>
    </Card>
  );
}
