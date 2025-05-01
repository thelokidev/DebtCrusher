
'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { Debt, DebtStrategy } from '@/types/debt';
import { calculateDebtProjection, calculateTotalDebt } from '@/lib/debt-utils';
import { format } from 'date-fns';

interface DebtPaydownChartProps {
  initialDebts: Debt[];
  strategy: DebtStrategy;
  monthlyPayment: number;
}

const chartConfig = {
  remainingDebt: {
    label: 'Remaining Debt',
    color: 'hsl(var(--chart-1))', // Use theme color
  },
};

export function DebtPaydownChart({ initialDebts, strategy, monthlyPayment }: DebtPaydownChartProps) {
  const { debtFreeDate, monthlyBreakdown } = React.useMemo(() => {
     // Ensure valid inputs before calculating
     const validInitialDebts = initialDebts.filter(d => d.amount > 0.01);
     if (validInitialDebts.length === 0 || monthlyPayment <= 0) {
         return { debtFreeDate: null, monthlyBreakdown: [] };
     }
     return calculateDebtProjection(validInitialDebts, strategy, monthlyPayment);
  }, [initialDebts, strategy, monthlyPayment]);

  const chartData = React.useMemo(() => {
    if (monthlyBreakdown.length === 0 && initialDebts.length > 0) {
        // If projection failed but debts exist, show initial state
        const initialTotal = calculateTotalDebt(initialDebts);
        const currentDate = new Date();
         return [{ month: format(currentDate, 'MMM yyyy'), remainingDebt: initialTotal > 0 ? initialTotal : 0 }];
    }
    if (monthlyBreakdown.length === 0) {
        return []; // No debts, no data
    }


    const startDate = new Date();
    return monthlyBreakdown.map((item) => {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + item.month);
      return {
        month: format(date, 'MMM yyyy'),
        remainingDebt: Math.max(0, item.remainingDebt), // Ensure debt doesn't go below zero
      };
    });
  }, [monthlyBreakdown, initialDebts]);


   const initialTotalDebt = calculateTotalDebt(initialDebts);

    // Handle cases where projection is not possible or complete
   if (chartData.length === 0 && initialTotalDebt > 0) {
     return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Increase monthly payment to generate payoff projection.</p>
        </div>
        );
    }
    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p>Add debts to see the paydown projection.</p>
            </div>
        );
    }


  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
          accessibilityLayer
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)} // Show only month abbreviation
            className="text-xs text-muted-foreground"
          />
          <YAxis
             tickLine={false}
             axisLine={false}
             tickMargin={8}
             tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} // Format as thousands
             className="text-xs text-muted-foreground"
          />
          <Tooltip
             cursor={false}
             content={<ChartTooltipContent indicator="dot" />}
             wrapperClassName="bg-background/90 backdrop-blur-sm"
          />
          <Area
            dataKey="remainingDebt"
            type="natural"
            fill="var(--color-remainingDebt)"
            fillOpacity={0.4}
            stroke="var(--color-remainingDebt)"
            stackId="a"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
