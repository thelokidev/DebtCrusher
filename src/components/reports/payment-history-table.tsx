
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

// Mock data structure - replace with actual data fetching
interface PaymentRecord {
  id: string;
  date: Date;
  creditorName: string;
  amountPaid: number;
  principalPaid: number; // Optional: add if you track this
  interestPaid: number; // Optional: add if you track this
}

// Mock data - replace with actual data
const mockPaymentHistory: PaymentRecord[] = [
  { id: 'p1', date: new Date(2024, 5, 15), creditorName: 'Credit Card A', amountPaid: 150.00, principalPaid: 120.00, interestPaid: 30.00 },
  { id: 'p2', date: new Date(2024, 5, 10), creditorName: 'Student Loan B', amountPaid: 250.50, principalPaid: 200.00, interestPaid: 50.50 },
  { id: 'p3', date: new Date(2024, 4, 15), creditorName: 'Credit Card A', amountPaid: 145.00, principalPaid: 115.00, interestPaid: 30.00 },
  { id: 'p4', date: new Date(2024, 4, 10), creditorName: 'Student Loan B', amountPaid: 250.50, principalPaid: 198.00, interestPaid: 52.50 },
  // Add more mock records as needed
];


export function PaymentHistoryTable() {
  // In a real app, fetch data based on date range filters
  const [paymentHistory, setPaymentHistory] = React.useState<PaymentRecord[]>(mockPaymentHistory);

  const handleDownload = () => {
     // Basic CSV download implementation
     const headers = ["Date", "Creditor", "Amount Paid", "Principal Paid", "Interest Paid"];
     const rows = paymentHistory.map(p => [
       p.date.toLocaleDateString(),
       `"${p.creditorName.replace(/"/g, '""')}"`, // Handle quotes in names
       p.amountPaid.toFixed(2),
       p.principalPaid.toFixed(2),
       p.interestPaid.toFixed(2)
     ]);

     const csvContent = "data:text/csv;charset=utf-8,"
       + headers.join(",") + "\n"
       + rows.map(e => e.join(",")).join("\n");

     const encodedUri = encodeURI(csvContent);
     const link = document.createElement("a");
     link.setAttribute("href", encodedUri);
     link.setAttribute("download", "debtcrusher_payment_history.csv");
     document.body.appendChild(link); // Required for FF
     link.click();
     document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
       <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={paymentHistory.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Download CSV
            </Button>
       </div>
      <Table>
        <TableCaption className="text-muted-foreground/80">
           {paymentHistory.length === 0 ? "No payment history found for the selected period." : "Recent payment history."}
        </TableCaption>
        <TableHeader>
          <TableRow className="border-b-border/50 hover:bg-muted/10">
            <TableHead className="text-muted-foreground">Date</TableHead>
            <TableHead className="text-muted-foreground">Creditor</TableHead>
            <TableHead className="text-right text-muted-foreground">Amount Paid</TableHead>
            <TableHead className="text-right text-muted-foreground">Principal</TableHead>
            <TableHead className="text-right text-muted-foreground">Interest</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paymentHistory.length === 0 ? (
            <TableRow className="border-b-border/50">
              <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                No payments recorded yet.
              </TableCell>
            </TableRow>
          ) : (
            paymentHistory.map((payment) => (
              <TableRow key={payment.id} className="border-b-border/50 hover:bg-muted/10 data-[state=selected]:bg-muted/20">
                <TableCell className="font-medium text-foreground">{payment.date.toLocaleDateString()}</TableCell>
                <TableCell className="text-foreground/90">{payment.creditorName}</TableCell>
                <TableCell className="text-right text-foreground/90">${payment.amountPaid.toFixed(2)}</TableCell>
                <TableCell className="text-right text-primary">${payment.principalPaid.toFixed(2)}</TableCell>
                 <TableCell className="text-right text-destructive/80">${payment.interestPaid.toFixed(2)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
