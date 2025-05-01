'use client';

import type * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

// Define the form schema using Zod
const debtSchema = z.object({
  creditorName: z.string().min(1, 'Creditor name is required'),
  amount: z.coerce.number().positive('Amount must be positive'), // Coerce ensures string input becomes number
  interestRate: z.coerce.number().min(0, 'Interest rate cannot be negative').max(100, 'Interest rate seems too high'),
  minimumPayment: z.coerce.number().positive('Minimum payment must be positive'),
});

type DebtFormData = z.infer<typeof debtSchema>;

interface AddDebtFormProps {
  onSubmit: (data: DebtFormData) => void;
  isLoading?: boolean;
}

export function AddDebtForm({ onSubmit, isLoading = false }: AddDebtFormProps) {
  const form = useForm<DebtFormData>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      creditorName: '',
      amount: 0,
      interestRate: 0,
      minimumPayment: 0,
    },
  });

  const handleFormSubmit = (data: DebtFormData) => {
    onSubmit(data);
    form.reset(); // Reset form after successful submission
  };

  return (
    // Adjusted card style to match Supabase dark theme look
    <Card className="w-full max-w-lg mx-auto bg-card shadow-md border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-foreground">
          <PlusCircle className="text-primary" /> Add New Debt
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="creditorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Creditor Name</FormLabel>
                  <FormControl>
                    {/* Input adjusted for dark theme */}
                    <Input placeholder="e.g., Credit Card Company" {...field} aria-label="Creditor Name" className="bg-input border-border/80 text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:ring-primary/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Current Balance ($)</FormLabel>
                  <FormControl>
                     <Input type="number" placeholder="e.g., 5000" {...field} step="0.01" aria-label="Current Balance" className="bg-input border-border/80 text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:ring-primary/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="interestRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Interest Rate (%)</FormLabel>
                  <FormControl>
                     <Input type="number" placeholder="e.g., 19.9" {...field} step="0.01" aria-label="Interest Rate" className="bg-input border-border/80 text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:ring-primary/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="minimumPayment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Minimum Payment ($)</FormLabel>
                  <FormControl>
                     <Input type="number" placeholder="e.g., 100" {...field} step="0.01" aria-label="Minimum Payment" className="bg-input border-border/80 text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:ring-primary/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <CardFooter className="p-0 pt-4">
                 {/* Button uses primary color from theme (green) */}
                 <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                    {isLoading ? 'Adding...' : 'Add Debt'}
                  </Button>
             </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
