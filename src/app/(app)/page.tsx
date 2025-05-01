
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Debt, DebtStrategy } from '@/types/debt';
import { AddDebtForm } from '@/components/debt/add-debt-form';
import { DebtList } from '@/components/debt/debt-list';
import { PaymentPlanner } from '@/components/debt/payment-planner';
import { ProgressTracker } from '@/components/debt/progress-tracker';
import { calculateTotalDebt } from '@/lib/debt-utils';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button'; // Keep Button if needed for other actions
import { SidebarTrigger } from '@/components/ui/sidebar'; // Keep Trigger for mobile

// Page-specific components or imports can remain here

export default function DashboardPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [initialDebts, setInitialDebts] = useState<Debt[]>([]);
  const [strategy, setStrategy] = useState<DebtStrategy>('snowball');
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [allocation, setAllocation] = useState<Record<string, number>>({});
  const { toast } = useToast();

  // Load debts from local storage on initial mount
  useEffect(() => {
    const storedDebts = localStorage.getItem('debts');
    const storedInitialDebts = localStorage.getItem('initialDebts');

    if (storedDebts) {
      const parsedDebts: Debt[] = JSON.parse(storedDebts);
      setDebts(parsedDebts);

      // Set initial debts only once if not already set
      if (!storedInitialDebts) {
        setInitialDebts(parsedDebts);
        localStorage.setItem('initialDebts', JSON.stringify(parsedDebts));
      }
    }

    if (storedInitialDebts) {
        setInitialDebts(JSON.parse(storedInitialDebts));
    } else if (!storedDebts) {
        // Handle case where both are null/empty initially
        setInitialDebts([]);
    }

     // Load strategy and monthly payment if stored
     const storedStrategy = localStorage.getItem('strategy') as DebtStrategy | null;
     const storedPayment = localStorage.getItem('monthlyPayment');
     if (storedStrategy) setStrategy(storedStrategy);
     if (storedPayment) setMonthlyPayment(parseFloat(storedPayment));


  }, []); // Empty dependency array ensures this runs only once

  // Save debts to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('debts', JSON.stringify(debts));
  }, [debts]);

  // Save strategy and payment when they change
   useEffect(() => {
     localStorage.setItem('strategy', strategy);
     localStorage.setItem('monthlyPayment', monthlyPayment.toString());
   }, [strategy, monthlyPayment]);


  const handleAddDebt = (newDebtData: Omit<Debt, 'id'>) => {
    const newDebt: Debt = {
      ...newDebtData,
      id: crypto.randomUUID(),
    };
    const updatedDebts = [...debts, newDebt];
    setDebts(updatedDebts);

     // Update initial debts only if it was empty before adding the first debt
     if (initialDebts.length === 0) {
        setInitialDebts(updatedDebts);
        localStorage.setItem('initialDebts', JSON.stringify(updatedDebts));
     }

    toast({
        title: "Debt Added",
        description: `${newDebt.creditorName} added successfully.`,
        variant: "default",
    });
  };

  const handleDeleteDebt = (idToDelete: string) => {
      const debtToDelete = debts.find(d => d.id === idToDelete);
      const updatedDebts = debts.filter(debt => debt.id !== idToDelete);
      setDebts(updatedDebts);

      // Also update initialDebts if the deleted debt existed there
      const updatedInitialDebts = initialDebts.filter(debt => debt.id !== idToDelete);
      setInitialDebts(updatedInitialDebts);
      localStorage.setItem('initialDebts', JSON.stringify(updatedInitialDebts));

      toast({
           title: "Debt Deleted",
           description: `${debtToDelete?.creditorName ?? 'Debt'} removed.`,
           variant: "destructive",
      });
  }

  const handleAllocationUpdate = useCallback((newAllocation: Record<string, number>, totalPayment: number, selectedStrategy: DebtStrategy) => {
     setAllocation(newAllocation);
     setMonthlyPayment(totalPayment); // Update monthly payment state here
     setStrategy(selectedStrategy); // Update strategy state here
  }, []); // Keep dependency array minimal


  const totalDebt = calculateTotalDebt(debts);


  return (
    <>
        {/* Main Content Area - Moved from old page.tsx */}
        <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
            <SidebarTrigger className="md:hidden" /> {/* Mobile trigger */}
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
            <div className="ml-auto flex items-center gap-2">
                {debts.length > 0 && (
                    <p className="text-lg font-semibold hidden sm:block">
                        Total Debt: <span className="text-destructive">${totalDebt.toFixed(2)}</span>
                    </p>
                )}
            </div>
        </header>

        <main className="container mx-auto p-4 md:p-8 space-y-8">

            {debts.length > 0 && (
                <p className="text-lg font-semibold sm:hidden text-center"> {/* Show total debt below header on mobile */}
                    Total Debt: <span className="text-destructive">${totalDebt.toFixed(2)}</span>
                </p>
            )}

            {/* Changed grid layout from lg:grid-cols-3 to lg:grid-cols-2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Left Column: Add Debt & List */}
                 {/* Column now takes 1/2 width on large screens */}
                 <div className="lg:col-span-1 space-y-8">
                     <AddDebtForm onSubmit={handleAddDebt} />
                     <DebtList debts={debts} onDelete={handleDeleteDebt} />
                 </div>

                 {/* Right Column: Planner & Progress */}
                  {/* Column now takes 1/2 width on large screens */}
                 <div className="lg:col-span-1 space-y-8">
                     <PaymentPlanner
                         debts={debts}
                         initialMonthlyPayment={monthlyPayment} // Pass initial value
                         initialStrategy={strategy} // Pass initial value
                         onAllocationUpdate={handleAllocationUpdate}
                      />
                     <ProgressTracker
                         initialDebts={initialDebts}
                         currentDebts={debts}
                         strategy={strategy}
                         monthlyPayment={monthlyPayment}
                     />
                 </div>
            </div>
        </main>
     </>
  );
}
