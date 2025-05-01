
'use client';

import type * as React from 'react';
import { useState, useMemo, useEffect, useCallback } from 'react'; // Add useCallback
import type { Debt, DebtStrategy } from '@/types/debt';
import { calculateTotalMinimumPayment, calculatePaymentAllocation } from '@/lib/debt-utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, Calculator, Scale, Banknote, BarChartHorizontalBig, TrendingDown, ListTodo } from 'lucide-react'; // Added ListTodo, Banknote, BarChartHorizontalBig, TrendingDown
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Added Tooltip


interface PaymentPlannerProps {
  debts: Debt[];
  initialStrategy?: DebtStrategy; // Accept initial strategy
  initialMonthlyPayment?: number; // Accept initial payment
  onAllocationUpdate: (allocation: Record<string, number>, totalPayment: number, strategy: DebtStrategy) => void;
}

export function PaymentPlanner({
    debts,
    initialStrategy = 'snowball', // Default if not provided
    initialMonthlyPayment, // Use provided initial payment
    onAllocationUpdate
}: PaymentPlannerProps) {
  const [strategy, setStrategy] = useState<DebtStrategy>(initialStrategy);
  const totalMinimumPayment = useMemo(() => calculateTotalMinimumPayment(debts), [debts]);

  // Determine the initial payment for the state
  const initialPaymentState = useMemo(() => {
    const minPlusBuffer = totalMinimumPayment > 0 ? totalMinimumPayment + Math.min(50, totalMinimumPayment * 0.1) : 50;
    // Use initialMonthlyPayment if provided and valid, otherwise calculate default
    const paymentToUse = (initialMonthlyPayment !== undefined && initialMonthlyPayment >= totalMinimumPayment)
        ? initialMonthlyPayment
        : Math.max(minPlusBuffer, totalMinimumPayment, 50);
    return paymentToUse;
  }, [totalMinimumPayment, initialMonthlyPayment]);

  const [monthlyPayment, setMonthlyPayment] = useState<number>(initialPaymentState);
  const [allocation, setAllocation] = useState<Record<string, number>>({});

   // Update internal state if initial props change (e.g., loaded from storage after initial render)
   useEffect(() => {
       setStrategy(initialStrategy);
   }, [initialStrategy]);

   useEffect(() => {
        // Recalculate the base minimum payment state value
        const minPlusBuffer = totalMinimumPayment > 0 ? totalMinimumPayment + Math.min(50, totalMinimumPayment * 0.1) : 50;
        const newInitialPayment = Math.max(minPlusBuffer, totalMinimumPayment, 50);

        // If initialMonthlyPayment prop is provided and valid, prioritize it, otherwise use calculated base
        const paymentToUse = (initialMonthlyPayment !== undefined && initialMonthlyPayment >= totalMinimumPayment)
            ? initialMonthlyPayment
            : newInitialPayment;

        // Ensure the current state value is at least the minimum required, and respects the prop/calculated initial value
        setMonthlyPayment(prev => Math.max(prev, totalMinimumPayment, paymentToUse));

   }, [initialMonthlyPayment, totalMinimumPayment]);


  const maxSliderValue = useMemo(() => {
      const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0);
      // Increase max slider value headroom dynamically
      const calculatedMax = Math.max(totalMinimumPayment * 1.5 + 1000, totalDebt * 0.5 + 500, 1000);
      return Math.min(calculatedMax, 50000); // Cap at 50k for sanity
  }, [debts, totalMinimumPayment]);


    // Memoize the callback to prevent unnecessary re-renders if parent passes a new function instance
    const memoizedOnAllocationUpdate = useCallback(onAllocationUpdate, [onAllocationUpdate]); // Pass the actual callback dependency

   // Recalculate allocation when debts, strategy, or monthly payment changes
   useEffect(() => {
     if (debts.length > 0) {
        // Pass strategy directly to calculation function
        const newAllocation = calculatePaymentAllocation(debts, strategy, monthlyPayment);
        setAllocation(newAllocation);
        memoizedOnAllocationUpdate(newAllocation, monthlyPayment, strategy);
     } else {
        setAllocation({});
        memoizedOnAllocationUpdate({}, 0, strategy);
     }
   }, [debts, strategy, monthlyPayment, memoizedOnAllocationUpdate]); // Add memoized callback here


    const handleMonthlyPaymentChange = (newPayment: number) => {
         setMonthlyPayment(Math.max(newPayment, totalMinimumPayment));
    }


    const handleSliderChange = (value: number[]) => {
        handleMonthlyPaymentChange(value[0]);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value);
        if (!isNaN(value)) {
            handleMonthlyPaymentChange(value);
        }
    };

    const getStrategyDetails = (strat: DebtStrategy): { name: string; tooltip: string } => {
        switch (strat) {
            case 'snowball': return { name: 'Snowball', tooltip: 'Pay smallest balance first for quick wins.' };
            case 'avalanche': return { name: 'Avalanche', tooltip: 'Pay highest interest rate first to save money long-term.' };
            case 'interestDifferential': return { name: 'Interest Diff.', tooltip: 'Similar to Avalanche, focuses on highest interest rates.' };
            case 'paymentRatio': return { name: 'Payment Ratio', tooltip: 'Prioritize debts where minimum payment is highest % of balance.' };
            case 'velocityBanking': return { name: 'Velocity Banking', tooltip: 'Advanced: Uses HELOC/LOC to pay down high-interest debt. Requires careful management & understanding. Allocation logic here is simplified.' };
            case 'debtArbitrage': return { name: 'Debt Arbitrage', tooltip: 'Advanced: Borrows at low interest (e.g., 0% intro APR card) to pay off high-interest debt. Requires discipline. Allocation logic here is simplified.' };
            default: return { name: 'Selected', tooltip: 'Currently selected strategy.' };
        }
    }

    const targetDebt = useMemo(() => {
        if (debts.length === 0 || monthlyPayment <= totalMinimumPayment) return null;

        const validDebts = debts.filter(d => d.amount > 0.01); // Use tolerance
        if (validDebts.length === 0) return null;

        let sortedDebts: Debt[];
        switch (strategy) {
             case 'snowball':
                 sortedDebts = [...validDebts].sort((a, b) => a.amount - b.amount);
                 break;
             case 'avalanche':
             case 'interestDifferential':
             case 'velocityBanking': // Simplified: Target highest interest like Avalanche for this display
             case 'debtArbitrage': // Simplified: Target highest interest like Avalanche for this display
                 sortedDebts = [...validDebts].sort((a, b) => b.interestRate - a.interestRate);
                 break;
            case 'paymentRatio':
                 // Handle division by zero for amount
                sortedDebts = [...validDebts].sort((a, b) => {
                    const ratioA = a.amount > 0.01 ? a.minimumPayment / a.amount : 0;
                    const ratioB = b.amount > 0.01 ? b.minimumPayment / b.amount : 0;
                    return ratioB - ratioA; // Highest ratio first
                });
                break;
            default:
                sortedDebts = [...validDebts].sort((a, b) => b.interestRate - a.interestRate); // Default to Avalanche
        }


        // Find the first debt in the sorted list that will receive significantly more than its minimum payment.
        const extraPaymentThreshold = 0.05; // Need at least 5 cents extra to be considered 'targeted'
        for (const debt of sortedDebts) {
             const allocatedPayment = allocation[debt.id] || 0;
             if (allocatedPayment > debt.minimumPayment + extraPaymentThreshold) {
                 return debt;
             }
        }

        // Fallback: If extra payment is very small or allocation logic leads to no debt getting *more* than minimum, target the first in the sorted list.
        return sortedDebts[0] || null;

    }, [debts, strategy, monthlyPayment, totalMinimumPayment, allocation]);


  return (
    <TooltipProvider> {/* Wrap with TooltipProvider */}
    <Card className="bg-card shadow-md border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-foreground">
            <ListTodo className="text-primary" /> Smart Payment Planner {/* Changed icon */}
        </CardTitle>
        <CardDescription className="text-muted-foreground">Choose your strategy and decide how much extra to pay.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Strategy Selection */}
        <div>
          <Label className="text-base font-medium text-foreground/90 mb-2 block">Choose Your Strategy</Label>
           {/* Radio Group adjusted for dark theme & more options */}
           <RadioGroup
            value={strategy}
            onValueChange={(value: string) => setStrategy(value as DebtStrategy)}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" // Adjusted grid for 6 items
          >
             {/* Map over strategies for cleaner code */}
              {(['snowball', 'avalanche', 'interestDifferential', 'paymentRatio', 'velocityBanking', 'debtArbitrage'] as DebtStrategy[]).map((strat) => {
                 const details = getStrategyDetails(strat);
                 let IconComponent: React.ElementType = Scale; // Default icon
                 if (strat === 'snowball') IconComponent = TrendingUp; // Representing quick progress
                 if (strat === 'avalanche') IconComponent = TrendingDown; // Representing saving money (downward cost trend)
                 if (strat === 'interestDifferential') IconComponent = Calculator;
                 if (strat === 'paymentRatio') IconComponent = Scale;
                 if (strat === 'velocityBanking') IconComponent = Banknote;
                 if (strat === 'debtArbitrage') IconComponent = BarChartHorizontalBig; // Representing shifting debt

                 return (
                    <Tooltip key={strat}>
                        <TooltipTrigger asChild>
                            <Label htmlFor={strat} className="flex flex-col items-start space-y-1 border rounded-md p-4 border-border/50 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/10 cursor-pointer transition-colors">
                                <div className="flex items-center gap-2 w-full">
                                    <RadioGroupItem value={strat} id={strat} className="border-primary/50 text-primary"/>
                                    <span className="font-semibold text-foreground flex-1 flex items-center gap-1.5">
                                        <IconComponent size={16} className="inline text-primary/80" />
                                        {details.name}
                                    </span>
                                </div>
                                <span className="text-sm text-muted-foreground block pl-6">{details.tooltip.split('.')[0]}.</span>
                            </Label>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center" className="max-w-xs">
                             <p>{details.tooltip}</p>
                         </TooltipContent>
                    </Tooltip>
                );
              })}
          </RadioGroup>
        </div>

        {/* Monthly Payment Slider */}
        {debts.length > 0 && (
           <div>
              <Label htmlFor="monthlyPayment" className="text-base font-medium block mb-2 text-foreground/90">
                Adjust Your Total Monthly Payment
              </Label>
              <div className="flex items-center gap-4">
                 <Slider
                    id="monthlyPayment"
                    min={totalMinimumPayment}
                    max={Math.max(maxSliderValue, totalMinimumPayment)} // Ensure max is at least min payment
                    step={Math.max(10, Math.round((maxSliderValue - totalMinimumPayment) / 100))} // Dynamic step
                    value={[monthlyPayment]}
                    onValueChange={handleSliderChange}
                    className="flex-grow [&>span>span]:bg-primary [&>span]:bg-muted" // Target inner elements for color
                    aria-label="Monthly Payment Amount Slider"
                 />
                  <div className="flex items-center border border-border/50 rounded-md px-2 w-32 bg-input">
                      <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                      <Input
                          type="number"
                          value={monthlyPayment.toFixed(0)}
                          onChange={handleInputChange}
                          min={totalMinimumPayment}
                          max={Math.max(maxSliderValue, totalMinimumPayment)} // Ensure max is at least min payment
                          className="w-full h-8 border-0 shadow-none focus-visible:ring-0 text-right px-1 bg-transparent text-foreground placeholder:text-muted-foreground/70"
                          aria-label="Monthly Payment Amount Input"
                      />
                  </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                    Minimum Required: ${totalMinimumPayment.toFixed(2)}
                     <span className="mx-2">|</span> Max Slider: ${maxSliderValue.toFixed(0)} {/* Changed label to Max Slider */}
              </p>
            </div>
        )}

        {/* Payment Allocation Recommendation */}
        {debts.length > 0 && monthlyPayment > totalMinimumPayment && targetDebt && (
           <Alert className="bg-primary/10 border-primary/30 text-primary-foreground">
              <TrendingUp className="h-5 w-5 text-primary" />
              <AlertTitle className="text-primary font-semibold">Payment Focus: {getStrategyDetails(strategy).name}</AlertTitle>
             <AlertDescription className="text-foreground/90">
                 Focus your extra payment of <span className="font-semibold text-primary">${Math.max(0, monthlyPayment - totalMinimumPayment).toFixed(2)}</span> towards:
               <div className="mt-2">
                  <Badge variant="secondary" className="text-base py-1 px-3 bg-secondary text-secondary-foreground">
                       {targetDebt.creditorName} (${targetDebt.amount.toFixed(2)} @ {targetDebt.interestRate.toFixed(2)}%)
                  </Badge>
               </div>
                 {(strategy === 'velocityBanking' || strategy === 'debtArbitrage') ? (
                    <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">Note: Advanced strategy allocation is simplified here. Real-world application requires careful planning.</p>
                 ) : (
                    <p className="mt-2 text-sm text-muted-foreground">We'll automatically apply the minimum payments to all other debts first.</p>
                 )}
             </AlertDescription>
           </Alert>
         )}
         {debts.length > 0 && monthlyPayment <= totalMinimumPayment && totalMinimumPayment > 0 && (
              <Alert variant="default" className="bg-card border-border/50">
                 <DollarSign className="h-5 w-5 text-muted-foreground" />
                 <AlertTitle className="text-foreground">Minimum Payments Only</AlertTitle>
                 <AlertDescription className="text-muted-foreground">
                     You're currently set to pay only the minimum required. Consider increasing your payment (<span className="font-medium">&gt; ${totalMinimumPayment.toFixed(2)}</span>) to significantly accelerate your debt payoff!
                 </AlertDescription>
              </Alert>
         )}
         {debts.length === 0 && (
            <p className="text-center text-muted-foreground">Add debts on the Dashboard to start planning your payments.</p>
         )}

      </CardContent>
    </Card>
    </TooltipProvider>
  );
}
