'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, PiggyBank } from 'lucide-react';

// Mock spending categories - replace with actual data/analysis
const spendingCategories = [
  { category: 'Dining Out', amount: 350, potentialSavings: 100 },
  { category: 'Subscriptions', amount: 80, potentialSavings: 20 },
  { category: 'Shopping (Non-essential)', amount: 220, potentialSavings: 75 },
];

export function SpendingAnalysis() {
  // In a real app, this would involve fetching and analyzing spending data from connected accounts

  const totalPotentialSavings = spendingCategories.reduce((sum, cat) => sum + cat.potentialSavings, 0);

  return (
    <Card className="bg-card shadow-md border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-foreground">
          <PiggyBank className="text-primary" /> Spending Analysis (Placeholder)
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Identify areas where you could potentially save more to accelerate debt payoff.
          Requires connected accounts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-secondary/50 border-border/50">
          <Lightbulb className="h-4 w-4 text-muted-foreground" />
          <AlertTitle className="text-foreground">Feature Requires Connection</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Connect your bank accounts in the 'Connections' tab to enable spending analysis.
          </AlertDescription>
        </Alert>

        {/* Placeholder content if accounts were connected */}
        <div className="space-y-2 pt-4 border-t border-border/30">
            <h4 className="font-medium text-foreground/90">Potential Saving Opportunities:</h4>
            {spendingCategories.map((cat) => (
                <div key={cat.category} className="flex justify-between items-center text-sm p-2 rounded bg-muted/20">
                    <span className="text-muted-foreground">{cat.category}:</span>
                    <span className="font-medium text-primary/90">~${cat.potentialSavings}/month</span>
                </div>
            ))}
             <div className="flex justify-between items-center text-sm font-semibold p-2 border-t border-border/50 mt-2">
                <span className="text-foreground">Total Potential Savings:</span>
                <span className="text-primary">${totalPotentialSavings}/month</span>
             </div>
        </div>

         <p className="text-muted-foreground text-sm">
           Add your spending data manually to enable spending analysis.
         </p>
      </CardContent>
    </Card>
  );
}
