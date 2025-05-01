import type { Debt } from '@/types/debt';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DebtListProps {
  debts: Debt[];
  onDelete?: (id: string) => void;
}

export function DebtList({ debts, onDelete }: DebtListProps) {
  const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);
  const totalMinPayment = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);

  return (
    // Adjusted card style for dark theme
    <Card className="bg-card shadow-md border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-foreground">
          <List className="text-primary" /> Your Debts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Table styling adjustments for dark theme */}
        <Table>
          <TableCaption className="text-muted-foreground/80">
             {debts.length === 0 ? "You haven't added any debts yet." : `Total Debt: $${totalDebt.toFixed(2)} | Total Minimum Payment: $${totalMinPayment.toFixed(2)}`}
          </TableCaption>
          <TableHeader>
            {/* Header row with muted foreground */}
            <TableRow className="border-b-border/50 hover:bg-muted/10">
              <TableHead className="text-muted-foreground">Creditor</TableHead>
              <TableHead className="text-right text-muted-foreground">Balance</TableHead>
              <TableHead className="text-right text-muted-foreground">Interest Rate</TableHead>
              <TableHead className="text-right text-muted-foreground">Min. Payment</TableHead>
              {onDelete && <TableHead className="text-right text-muted-foreground">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {debts.length === 0 ? (
              <TableRow className="border-b-border/50">
                <TableCell colSpan={onDelete ? 5 : 4} className="text-center text-muted-foreground h-24">
                  No debts added. Use the form above to add your first debt!
                </TableCell>
              </TableRow>
            ) : (
              debts.map((debt) => (
                // Row styling for dark theme
                <TableRow key={debt.id} className="border-b-border/50 hover:bg-muted/10 data-[state=selected]:bg-muted/20">
                  <TableCell className="font-medium text-foreground">{debt.creditorName}</TableCell>
                  <TableCell className="text-right text-foreground/90">${debt.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-foreground/90">{debt.interestRate.toFixed(2)}%</TableCell>
                  <TableCell className="text-right text-foreground/90">${debt.minimumPayment.toFixed(2)}</TableCell>
                  {onDelete && (
                    <TableCell className="text-right">
                      {/* Destructive button styling updated for dark theme */}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(debt.id)}
                        aria-label={`Delete ${debt.creditorName} debt`}
                        className="bg-destructive/80 hover:bg-destructive text-destructive-foreground"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
