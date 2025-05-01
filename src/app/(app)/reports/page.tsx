
'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import type { Debt, DebtStrategy } from '@/types/debt';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DebtPaydownChart } from '@/components/charts/debt-paydown-chart';
import { PaymentHistoryTable } from '@/components/reports/payment-history-table';
import { SpendingAnalysis } from '@/components/reports/spending-analysis';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { DateRangePicker } from '@/components/ui/date-range-picker'; // Assuming you have this component
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, CalendarDays, TrendingDown } from 'lucide-react';
import { calculateTotalDebt } from '@/lib/debt-utils';

// Placeholder for DateRangePicker if not available
const FallbackDateRangePicker = () => (
    <div className="p-2 border rounded text-sm text-muted-foreground bg-muted/30">Date Range Picker Placeholder</div>
);
const DatePickerComponent = FallbackDateRangePicker; // Use DateRangePicker if available, otherwise fallback


export default function ReportsPage() {
    const [debts, setDebts] = useState<Debt[]>([]);
    const [initialDebts, setInitialDebts] = useState<Debt[]>([]);
    const [strategy, setStrategy] = useState<DebtStrategy>('snowball');
    const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

     // Load necessary data from local storage (or fetch from backend)
     useEffect(() => {
        const storedDebts = localStorage.getItem('debts');
        const storedInitialDebts = localStorage.getItem('initialDebts');
        // You might also need stored strategy and monthly payment if not derived elsewhere
        const storedStrategy = localStorage.getItem('strategy') as DebtStrategy | null;
        const storedPayment = localStorage.getItem('monthlyPayment');

        if (storedDebts) setDebts(JSON.parse(storedDebts));
        if (storedInitialDebts) setInitialDebts(JSON.parse(storedInitialDebts));
        if (storedStrategy) setStrategy(storedStrategy);
        if (storedPayment) setMonthlyPayment(parseFloat(storedPayment));

        // Default date range (e.g., last 90 days)
        const to = new Date();
        const from = new Date();
        from.setDate(to.getDate() - 90);
        setDateRange({ from, to });

     }, []);

     // Save relevant state if needed (e.g., strategy for chart)
     useEffect(() => {
        localStorage.setItem('strategy', strategy);
        localStorage.setItem('monthlyPayment', monthlyPayment.toString());
     }, [strategy, monthlyPayment]);


     const totalDebt = useMemo(() => calculateTotalDebt(debts), [debts]);
     const initialTotalDebt = useMemo(() => calculateTotalDebt(initialDebts), [initialDebts]);
     const debtReduced = useMemo(() => Math.max(0, initialTotalDebt - totalDebt), [initialTotalDebt, totalDebt]);


    return (
         <>
            <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-xl font-semibold text-foreground flex items-center gap-2"><BarChart3 size={22}/> Reports</h1>
                 {/* Maybe add quick stats or global actions here */}
                 <div className="ml-auto flex items-center gap-4">
                    {/* Placeholder for Date Range Picker */}
                    {/* <DatePickerComponent
                        // Pass necessary props
                        onUpdate={(values) => setDateRange(values.range)}
                        initialDateFrom={dateRange.from}
                        initialDateTo={dateRange.to}
                        align="end"
                        locale="en-GB"
                        showCompare={false} // Optional
                    /> */}
                     <span className="text-sm text-muted-foreground hidden md:inline">Date Range:</span>
                    <FallbackDateRangePicker />
                 </div>
            </header>

            <main className="container mx-auto p-4 md:p-8 space-y-8">
                 {/* Key Metrics Summary */}
                 <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-card shadow-sm border-border/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-muted-foreground">Total Debt Remaining</CardDescription>
                             <CardTitle className="text-3xl text-destructive">${totalDebt.toFixed(2)}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Initial: ${initialTotalDebt.toFixed(2)}</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-card shadow-sm border-border/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-muted-foreground">Total Debt Reduced</CardDescription>
                             <CardTitle className="text-3xl text-primary">${debtReduced.toFixed(2)}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Across selected period (TBD)</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-card shadow-sm border-border/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-muted-foreground">Interest Saved (Est.)</CardDescription>
                            <CardTitle className="text-3xl text-accent-foreground">$ TBD</CardTitle>
                        </CardHeader>
                         <CardContent>
                             <p className="text-xs text-muted-foreground">Compared to minimum payments (TBD)</p>
                        </CardContent>
                    </Card>
                 </div>

                {/* Debt Paydown Chart */}
                <Card className="bg-card shadow-md border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                             <TrendingDown className="text-primary" /> Debt Paydown Projection
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Using</span>
                            <Select value={strategy} onValueChange={(value) => setStrategy(value as DebtStrategy)}>
                                <SelectTrigger className="h-7 w-auto text-xs px-2 py-1 border-border/50 bg-background">
                                    <SelectValue placeholder="Select strategy" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="snowball">Snowball</SelectItem>
                                    <SelectItem value="avalanche">Avalanche</SelectItem>
                                     <SelectItem value="interestDifferential">Interest Diff.</SelectItem>
                                     <SelectItem value="paymentRatio">Payment Ratio</SelectItem>
                                     <SelectItem value="velocityBanking">Velocity Banking</SelectItem>
                                     <SelectItem value="debtArbitrage">Debt Arbitrage</SelectItem>
                                </SelectContent>
                            </Select>
                             <span>strategy with</span>
                             <span className="font-medium text-foreground/90">${monthlyPayment.toFixed(2)}/month</span>
                             <span>payment.</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DebtPaydownChart
                             initialDebts={initialDebts} // Pass initial debts for accurate start point
                             strategy={strategy}
                             monthlyPayment={monthlyPayment}
                         />
                    </CardContent>
                </Card>

                {/* Payment History Table */}
                <Card className="bg-card shadow-md border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                           <CalendarDays className="text-primary" /> Payment History
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            View your past payments within the selected date range.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PaymentHistoryTable />
                    </CardContent>
                </Card>

                 {/* Spending Analysis Placeholder */}
                 <SpendingAnalysis />

            </main>
        </>
    );
}

// Basic DateRangePicker placeholder if the actual component doesn't exist
interface DateRangePickerProps {
    onUpdate?: (values: { range: { from?: Date, to?: Date } }) => void;
    initialDateFrom?: Date;
    initialDateTo?: Date;
    align?: string;
    locale?: string;
    showCompare?: boolean;
}

// const FallbackDateRangePicker: React.FC<DateRangePickerProps> = ({ initialDateFrom, initialDateTo }) => {
//     const fromStr = initialDateFrom ? initialDateFrom.toLocaleDateString() : 'Start';
//     const toStr = initialDateTo ? initialDateTo.toLocaleDateString() : 'End';
//     return (
//         <Button variant="outline" size="sm" className="text-muted-foreground">
//             <CalendarDays className="mr-2 h-4 w-4" />
//             {`${fromStr} - ${toStr}`}
//         </Button>
//     );
// };
