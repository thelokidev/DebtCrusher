
'use client';

import * as React from 'react';
import type { Debt } from '@/types/debt';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Mail, Copy, Download, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

type LetterType = 'settlement_offer_lump' | 'settlement_offer_plan' | 'payment_plan_request' | 'rate_reduction_request' | 'validation_request';

// Simplified template generation - a real app might use a more robust templating engine
const generateTemplate = (type: LetterType, debt: Debt | null, offerAmount?: number, planDetails?: string, hardshipReason?: string): string => {
    const today = new Date().toLocaleDateString();
    const creditor = debt?.creditorName || '[Creditor Name]';
    const accountNum = '[Your Account Number]'; // Needs to be input by user
    const balance = debt?.amount.toFixed(2) || '[Current Balance]';
    const userName = '[Your Name]'; // Needs to be input by user
    const userAddress = '[Your Address]\n[Your City, State, Zip]'; // Needs to be input by user
    const offer = offerAmount?.toFixed(2) || '[Offer Amount]';
    const reason = hardshipReason || '[Briefly explain your hardship, e.g., job loss, medical bills]';
    const plan = planDetails || '[Proposed payment plan details, e.g., $XX per month for YY months]';

    switch (type) {
        case 'settlement_offer_lump':
            return `
${today}

${userName}
${userAddress}

${creditor}
[Creditor Address]
[Creditor City, State, Zip]

Re: Account Number ${accountNum}, Current Balance: $${balance}

Dear ${creditor},

This letter is regarding the debt associated with account number ${accountNum}. Due to financial hardship (${reason}), I am unable to pay the full balance of $${balance}.

I would like to propose a one-time lump sum payment of $${offer} to settle this debt in full. This offer is contingent upon receiving a written agreement from you stating that this payment will satisfy the debt completely and that you will report the account as "settled in full" or "paid settled" to all major credit bureaus (Equifax, Experian, TransUnion).

Please respond in writing within [e.g., 15-30] days to accept or reject this offer. Payment will be made within [e.g., 10] days of receiving the signed written agreement.

Thank you for your consideration.

Sincerely,
${userName}
`;
        case 'settlement_offer_plan':
             return `
${today}

${userName}
${userAddress}

${creditor}
[Creditor Address]
[Creditor City, State, Zip]

Re: Account Number ${accountNum}, Current Balance: $${balance}

Dear ${creditor},

This letter concerns the debt for account number ${accountNum}. I am experiencing financial difficulties (${reason}) and cannot afford the full balance of $${balance}.

I propose settling this debt for a total amount of $${offer}, paid via the following payment plan: ${plan}. This offer is made on the condition that you provide a written agreement confirming that these payments, upon completion, will fully satisfy the debt and that the account will be reported as "settled in full" or "paid settled" to the credit bureaus.

Please respond in writing within [e.g., 15-30] days. The first payment will be made within [e.g., 10] days of receiving the signed agreement.

Thank you,
${userName}
`;
        case 'payment_plan_request':
            return `
${today}

${userName}
${userAddress}

${creditor}
[Creditor Address]
[Creditor City, State, Zip]

Re: Account Number ${accountNum}, Current Balance: $${balance}

Dear ${creditor},

I am writing about account number ${accountNum}. Due to my current financial situation (${reason}), I am having difficulty making the standard payments.

I would like to request a temporary payment plan to manage this debt responsibly. I propose the following arrangement: ${plan}.

I am committed to fulfilling my obligation and believe this plan will allow me to do so. Please let me know in writing if this arrangement is acceptable or propose an alternative.

Thank you for your understanding.

Sincerely,
${userName}
`;
         case 'rate_reduction_request':
             return `
${today}

${userName}
${userAddress}

${creditor}
[Creditor Address]
[Creditor City, State, Zip]

Re: Account Number ${accountNum}, Interest Rate

Dear ${creditor},

I am writing regarding my account, number ${accountNum}. I have been a customer for [Duration] and have generally maintained a good payment history.

However, due to [briefly mention reason if comfortable, e.g., changed financial circumstances, or simply state seeking relief], the current interest rate of ${debt?.interestRate.toFixed(2) || '[Current Rate]'}% is making it difficult to manage my balance effectively.

I request a review of my account for a possible interest rate reduction. A lower rate would significantly help me manage my payments and reduce the overall cost of this debt.

Thank you for considering my request. I look forward to your response.

Sincerely,
${userName}
`;
        case 'validation_request': // Usually sent to collection agencies
            return `
${today}

${userName}
${userAddress}

[Collection Agency Name]
[Collection Agency Address]
[Collection Agency City, State, Zip]

Re: Account Number ${accountNum} (Alleged debt owed to ${creditor})

Dear [Collection Agency Name],

I am writing in response to your communication regarding the debt referenced above (account number ${accountNum}), allegedly owed to ${creditor}.

Pursuant to my rights under the Fair Debt Collection Practices Act (FDCPA), I request validation of this debt. Please provide the following documentation:

1. Proof that you are licensed to collect debt in my state.
2. Documentation showing the amount of the debt, including any interest and fees.
3. Verification of the original creditor and account number.
4. Proof that you own the debt or have the legal authority to collect it.
5. A copy of the original signed contract or agreement related to this debt.

Until you provide this validation, I dispute this debt, and you must cease all collection activities. Please communicate only in writing to the address above.

Sincerely,
${userName}
`;
        default:
            return 'Select a letter type and debt to generate a template.';
    }
};


interface LetterGeneratorProps {
    debts: Debt[]; // Pass available debts to populate dropdown
}

export function LetterGenerator({ debts }: LetterGeneratorProps) {
    const [selectedDebtId, setSelectedDebtId] = React.useState<string>('');
    const [letterType, setLetterType] = React.useState<LetterType | ''>('');
    const [generatedLetter, setGeneratedLetter] = React.useState('');
    const [offerAmount, setOfferAmount] = React.useState<number | undefined>(undefined);
    const [planDetails, setPlanDetails] = React.useState('');
    const [hardshipReason, setHardshipReason] = React.useState('');
    const [isGenerating, setIsGenerating] = React.useState(false);
    const { toast } = useToast();

    const selectedDebt = React.useMemo(() => debts.find(d => d.id === selectedDebtId) || null, [debts, selectedDebtId]);

    const handleGenerate = () => {
        if (!letterType || !selectedDebtId) {
            toast({ title: "Missing Information", description: "Please select a debt and letter type.", variant: "destructive" });
            return;
        }
        // Basic validation for specific types
        if ((letterType === 'settlement_offer_lump' || letterType === 'settlement_offer_plan') && (!offerAmount || offerAmount <= 0)) {
            toast({ title: "Missing Information", description: "Please enter a valid offer amount.", variant: "destructive" });
            return;
        }
         if ((letterType === 'settlement_offer_plan' || letterType === 'payment_plan_request') && !planDetails) {
            toast({ title: "Missing Information", description: "Please provide payment plan details.", variant: "destructive" });
            return;
        }

        setIsGenerating(true);
        // Simulate generation time if needed
        setTimeout(() => {
            const letter = generateTemplate(letterType, selectedDebt, offerAmount, planDetails, hardshipReason);
            setGeneratedLetter(letter);
            setIsGenerating(false);
             toast({ title: "Letter Generated", description: "Review and customize the template below." });
        }, 300); // Short delay for visual feedback
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLetter)
            .then(() => toast({ title: "Copied to Clipboard!" }))
            .catch(err => toast({ title: "Copy Failed", description: "Could not copy text.", variant: "destructive" }));
    };

     const handleDownload = () => {
         const blob = new Blob([generatedLetter], { type: 'text/plain;charset=utf-8' });
         const link = document.createElement("a");
         const url = URL.createObjectURL(blob);
         link.setAttribute("href", url);
         link.setAttribute("download", `${letterType}_${selectedDebt?.creditorName || 'debt'}_letter.txt`);
         link.style.visibility = 'hidden';
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         URL.revokeObjectURL(url);
         toast({ title: "Download Started" });
     };


    return (
        <Card className="bg-card shadow-md border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                    <Mail className="text-primary" /> Negotiation Letter Generator
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                    Create template letters for common negotiation scenarios. Customize before sending.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Debt Selection */}
                     <div className="space-y-1.5">
                        <Label htmlFor="debt-select" className="text-foreground/90">Select Debt</Label>
                        <Select value={selectedDebtId} onValueChange={setSelectedDebtId}>
                            <SelectTrigger id="debt-select" className="bg-input border-border/80">
                                <SelectValue placeholder="Choose a debt..." />
                            </SelectTrigger>
                            <SelectContent>
                                {debts.length > 0 ? debts.map(debt => (
                                    <SelectItem key={debt.id} value={debt.id}>
                                        {debt.creditorName} (${debt.amount.toFixed(2)})
                                    </SelectItem>
                                )) : <SelectItem value="none" disabled>No debts added</SelectItem>}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Letter Type Selection */}
                    <div className="space-y-1.5">
                        <Label htmlFor="letter-type-select" className="text-foreground/90">Letter Type</Label>
                        <Select value={letterType} onValueChange={(v) => setLetterType(v as LetterType)}>
                            <SelectTrigger id="letter-type-select" className="bg-input border-border/80">
                                <SelectValue placeholder="Choose letter type..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="validation_request">Debt Validation Request (for Collectors)</SelectItem>
                                <SelectItem value="settlement_offer_lump">Settlement Offer (Lump Sum)</SelectItem>
                                <SelectItem value="settlement_offer_plan">Settlement Offer (Payment Plan)</SelectItem>
                                <SelectItem value="payment_plan_request">Payment Plan Request</SelectItem>
                                <SelectItem value="rate_reduction_request">Interest Rate Reduction Request</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                 {/* Conditional Inputs */}
                 {(letterType === 'settlement_offer_lump' || letterType === 'settlement_offer_plan') && (
                    <div className="space-y-1.5">
                        <Label htmlFor="offer-amount" className="text-foreground/90">Settlement Offer Amount ($)</Label>
                        <Input
                            id="offer-amount"
                            type="number"
                            placeholder="e.g., 1500"
                            value={offerAmount || ''}
                            onChange={(e) => setOfferAmount(parseFloat(e.target.value))}
                            className="bg-input border-border/80"
                            step="0.01"
                        />
                    </div>
                 )}
                 {(letterType === 'settlement_offer_plan' || letterType === 'payment_plan_request') && (
                    <div className="space-y-1.5">
                        <Label htmlFor="plan-details" className="text-foreground/90">Proposed Payment Plan Details</Label>
                        <Input
                            id="plan-details"
                            placeholder="e.g., $100 per month for 15 months"
                            value={planDetails}
                            onChange={(e) => setPlanDetails(e.target.value)}
                             className="bg-input border-border/80"
                        />
                    </div>
                 )}
                  {(letterType.startsWith('settlement_') || letterType === 'payment_plan_request') && (
                    <div className="space-y-1.5">
                        <Label htmlFor="hardship-reason" className="text-foreground/90">Brief Reason for Hardship (Optional)</Label>
                        <Input
                            id="hardship-reason"
                            placeholder="e.g., Reduced income due to job change"
                            value={hardshipReason}
                            onChange={(e) => setHardshipReason(e.target.value)}
                             className="bg-input border-border/80"
                        />
                    </div>
                 )}

                <Button onClick={handleGenerate} disabled={!letterType || !selectedDebtId || isGenerating} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                    {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Template
                </Button>

                {/* Generated Letter Display */}
                {generatedLetter && (
                    <div className="space-y-3 pt-4 border-t border-border/30">
                         <h4 className="font-medium text-foreground/90">Generated Template (Customize Before Sending!)</h4>
                         <Textarea
                            value={generatedLetter}
                            readOnly // Make it read-only, user should copy/paste to edit
                            rows={15}
                            className="text-sm font-mono bg-muted/20 border-border/50 focus-visible:ring-primary/30"
                            aria-label="Generated negotiation letter template"
                        />
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={handleCopy}>
                                <Copy className="mr-2 h-4 w-4" /> Copy Text
                            </Button>
                             <Button variant="outline" size="sm" onClick={handleDownload}>
                                <Download className="mr-2 h-4 w-4" /> Download .txt
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

