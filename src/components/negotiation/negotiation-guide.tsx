
'use client';

import * as React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, ListChecks, Phone, Mail } from 'lucide-react';

export function NegotiationGuide() {
  return (
    <Card className="bg-card shadow-md border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-foreground">
          <ListChecks className="text-primary" /> Negotiation Steps & Guide
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Follow these steps to prepare for and conduct debt negotiations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-base font-medium hover:no-underline text-foreground/90">
                <span className="flex items-center gap-2"><GraduationCap size={18} className="text-primary/80"/> 1. Understand Your Situation</span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm space-y-2 pl-2">
               <p>Gather all details about the specific debt: current balance, original amount, interest rate, last payment date, account number.</p>
               <p>Review your budget: Determine realistically how much you can offer as a lump sum or in a payment plan.</p>
               <p>Know your rights: Familiarize yourself with the Fair Debt Collection Practices Act (FDCPA) if dealing with collectors.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-base font-medium hover:no-underline text-foreground/90">
                <span className="flex items-center gap-2"><Phone size={18} className="text-primary/80"/> 2. Prepare for Contact</span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm space-y-2 pl-2">
              <p>Decide on your communication method (phone or letter - letter provides a paper trail).</p>
              <p>Outline your key points: Explain your hardship briefly, state your goal (settlement, payment plan, rate reduction), and propose your initial offer.</p>
              <p>Practice your script (if calling). Be polite, firm, and professional. Avoid emotional language.</p>
              <p>Use the "Letter Generator" tool below for templates.</p>
            </AccordionContent>
          </AccordionItem>
           <AccordionItem value="item-3">
            <AccordionTrigger className="text-base font-medium hover:no-underline text-foreground/90">
                <span className="flex items-center gap-2"><Mail size={18} className="text-primary/80"/> 3. Initiate Contact & Negotiate</span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm space-y-2 pl-2">
               <p>Contact the original creditor first if possible, otherwise the collection agency.</p>
               <p>Clearly state your identity and the account you're discussing.</p>
               <p>Present your situation and your offer. Start lower than your maximum acceptable amount to leave room for negotiation.</p>
               <p>Listen to their response. Be prepared for counter-offers.</p>
               <p>Take notes: Record dates, times, representative names, and details of the conversation.</p>
               <p>Don't agree to anything immediately on the phone. Ask for the offer in writing.</p>
            </AccordionContent>
          </AccordionItem>
           <AccordionItem value="item-4">
            <AccordionTrigger className="text-base font-medium hover:no-underline text-foreground/90">
                <span className="flex items-center gap-2"><ListChecks size={18} className="text-primary/80"/> 4. Finalize the Agreement</span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm space-y-2 pl-2">
               <p><strong>Crucial:</strong> Get any settlement agreement IN WRITING before sending any payment.</p>
               <p>The written agreement should clearly state: the agreed settlement amount, that it settles the debt in full, how and when payment is due, and that they will report the debt as settled/paid to credit bureaus.</p>
               <p>Make payments via traceable methods (e.g., cashier's check, money order). Avoid giving direct bank account access if possible.</p>
               <p>Keep copies of the agreement and proof of payment indefinitely.</p>
               <p>Track the settlement progress using the "Offer Management" tool.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
