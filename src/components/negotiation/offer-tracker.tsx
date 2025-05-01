
'use client';

import * as React from 'react';
import type { Debt } from '@/types/debt';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Handshake, PlusCircle, Edit2, Trash2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns'; // For date formatting

interface Offer {
    id: string;
    debtId: string; // Link to the specific debt
    debtCreditorName?: string; // Denormalized for display
    type: 'sent' | 'received';
    date: Date;
    offerAmount: number;
    status: 'pending' | 'accepted' | 'rejected' | 'countered';
    notes?: string;
    settlementType?: 'lump_sum' | 'payment_plan';
}

// Mock Data - Replace with actual state/fetching
const mockOffers: Offer[] = [
    { id: 'offer1', debtId: 'debt_abc', debtCreditorName: 'Credit Card A', type: 'sent', date: new Date(2024, 5, 20), offerAmount: 1500, status: 'pending', settlementType: 'lump_sum', notes: 'Initial lump sum offer via letter.' },
    { id: 'offer2', debtId: 'debt_def', debtCreditorName: 'Student Loan B', type: 'received', date: new Date(2024, 5, 22), offerAmount: 4000, status: 'countered', settlementType: 'lump_sum', notes: 'Counter offer received via phone. Asked for $4500.' },
    { id: 'offer3', debtId: 'debt_abc', debtCreditorName: 'Credit Card A', type: 'received', date: new Date(2024, 5, 25), offerAmount: 1800, status: 'accepted', settlementType: 'lump_sum', notes: 'Accepted their counter via email. Agreement received.' },
];

interface OfferTrackerProps {
    debts: Debt[]; // Needed for linking offers
}

export function OfferTracker({ debts }: OfferTrackerProps) {
    const [offers, setOffers] = React.useState<Offer[]>(mockOffers);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [currentOffer, setCurrentOffer] = React.useState<Partial<Offer>>({}); // For add/edit form
    const [isEditing, setIsEditing] = React.useState(false);
    const { toast } = useToast();

    const handleOpenModal = (offerToEdit?: Offer) => {
        if (offerToEdit) {
            // Format date for input type="date"
            const formattedDate = offerToEdit.date ? format(offerToEdit.date, 'yyyy-MM-dd') : '';
            setCurrentOffer({ ...offerToEdit, date: formattedDate as any }); // Cast needed for form state
            setIsEditing(true);
        } else {
            setCurrentOffer({ type: 'sent', status: 'pending', date: format(new Date(), 'yyyy-MM-dd') as any }); // Default new offer
            setIsEditing(false);
        }
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
         const { name, value } = e.target;
         // Special handling for Select components might be needed depending on implementation
         setCurrentOffer(prev => ({ ...prev, [name]: value }));
     };

     const handleSelectChange = (name: string, value: string) => {
         setCurrentOffer(prev => ({ ...prev, [name]: value }));
     };


    const handleSaveOffer = () => {
        // Basic Validation
        if (!currentOffer.debtId || !currentOffer.offerAmount || !currentOffer.date || !currentOffer.type || !currentOffer.status || !currentOffer.settlementType) {
             toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" });
             return;
        }

        const selectedDebt = debts.find(d => d.id === currentOffer.debtId);

        const offerToSave: Offer = {
             ...currentOffer,
             id: isEditing ? currentOffer.id! : `offer_${Date.now()}`,
             debtCreditorName: selectedDebt?.creditorName || 'Unknown Creditor', // Add creditor name
             date: new Date(currentOffer.date as any), // Convert date string back to Date object
             offerAmount: parseFloat(currentOffer.offerAmount as any),
        } as Offer; // Assert type after filling mandatory fields


        if (isEditing) {
            // --- MOCK EDIT ---
             setOffers(prev => prev.map(o => o.id === offerToSave.id ? offerToSave : o));
             toast({ title: "Offer Updated", description: "Negotiation details saved." });
             // --- END MOCK ---
              // --- REAL EDIT API CALL ---
        } else {
             // --- MOCK ADD ---
            setOffers(prev => [offerToSave, ...prev]);
            toast({ title: "Offer Added", description: "Negotiation logged successfully." });
             // --- END MOCK ---
             // --- REAL ADD API CALL ---
        }

        setIsModalOpen(false);
        setCurrentOffer({}); // Reset form
    };

     const handleDeleteOffer = (offerId: string) => {
        // --- MOCK DELETE ---
         setOffers(prev => prev.filter(o => o.id !== offerId));
         toast({ title: "Offer Deleted", description: "Negotiation log removed.", variant: "destructive" });
        // --- END MOCK ---
        // --- REAL DELETE API CALL ---
     }

    const getStatusBadge = (status: Offer['status']) => {
        switch (status) {
            case 'accepted': return <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30"><CheckCircle2 className="mr-1 h-3 w-3" /> Accepted</Badge>;
            case 'rejected': return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" /> Rejected</Badge>;
            case 'countered': return <Badge variant="outline" className="border-yellow-500/50 text-yellow-600 dark:text-yellow-400"><Clock className="mr-1 h-3 w-3" /> Countered</Badge>;
            case 'pending':
            default: return <Badge variant="outline" className="text-muted-foreground"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
        }
    };

    return (
        <Card className="bg-card shadow-md border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                        <Handshake className="text-primary" /> Negotiation Offer Tracker
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Log offers sent and received during negotiations.
                    </CardDescription>
                </div>
                <Button size="sm" onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <PlusCircle size={16} className="mr-2" /> Log New Offer
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableCaption className="text-muted-foreground/80">
                        {offers.length === 0 ? "No negotiation offers logged yet." : "Your negotiation history."}
                    </TableCaption>
                    <TableHeader>
                        <TableRow className="border-b-border/50 hover:bg-muted/10">
                            <TableHead className="text-muted-foreground">Date</TableHead>
                            <TableHead className="text-muted-foreground">Creditor</TableHead>
                            <TableHead className="text-muted-foreground">Type</TableHead>
                            <TableHead className="text-right text-muted-foreground">Offer Amt.</TableHead>
                            <TableHead className="text-muted-foreground">Settlement</TableHead>
                            <TableHead className="text-center text-muted-foreground">Status</TableHead>
                             <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {offers.length === 0 ? (
                            <TableRow className="border-b-border/50">
                                <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                                    Use the button above to log your first offer.
                                </TableCell>
                            </TableRow>
                        ) : (
                            offers.map((offer) => (
                                <TableRow key={offer.id} className="border-b-border/50 hover:bg-muted/10">
                                    <TableCell className="text-foreground/90 text-xs">{format(offer.date, 'PP')}</TableCell>
                                    <TableCell className="font-medium text-foreground">{offer.debtCreditorName}</TableCell>
                                     <TableCell className="capitalize text-foreground/90">
                                         <Badge variant={offer.type === 'sent' ? 'secondary' : 'outline'}>
                                            {offer.type}
                                         </Badge>
                                     </TableCell>
                                    <TableCell className="text-right text-foreground/90">${offer.offerAmount.toFixed(2)}</TableCell>
                                     <TableCell className="capitalize text-xs text-muted-foreground">{offer.settlementType?.replace('_', ' ')}</TableCell>
                                    <TableCell className="text-center">{getStatusBadge(offer.status)}</TableCell>
                                    <TableCell className="text-right">
                                         <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => handleOpenModal(offer)}>
                                            <Edit2 size={14} />
                                         </Button>
                                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteOffer(offer.id)}>
                                            <Trash2 size={14} />
                                         </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Add/Edit Offer Modal */}
                 <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{isEditing ? 'Edit Negotiation Offer' : 'Log New Negotiation Offer'}</DialogTitle>
                            <DialogDescription>
                                Record the details of an offer sent or received.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                             {/* Debt Selection */}
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="debtId" className="text-right text-foreground/90">Debt *</Label>
                                <Select
                                    name="debtId"
                                    value={currentOffer.debtId || ''}
                                    onValueChange={(value) => handleSelectChange('debtId', value)}
                                >
                                    <SelectTrigger id="debtId" className="col-span-3 bg-input border-border/80">
                                        <SelectValue placeholder="Select debt..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                         {debts.map(debt => (
                                            <SelectItem key={debt.id} value={debt.id}>{debt.creditorName} (${debt.amount.toFixed(2)})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Offer Type */}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="type" className="text-right text-foreground/90">Offer Type *</Label>
                                <Select
                                    name="type"
                                    value={currentOffer.type || ''}
                                    onValueChange={(value) => handleSelectChange('type', value)}
                                >
                                     <SelectTrigger id="type" className="col-span-3 bg-input border-border/80">
                                         <SelectValue placeholder="Sent or Received..." />
                                     </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sent">Sent Offer</SelectItem>
                                        <SelectItem value="received">Received Offer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             {/* Date */}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="date" className="text-right text-foreground/90">Date *</Label>
                                <Input
                                    id="date"
                                    name="date"
                                    type="date"
                                    value={currentOffer.date as any || ''}
                                    onChange={handleInputChange}
                                    className="col-span-3 bg-input border-border/80"
                                />
                            </div>
                             {/* Offer Amount */}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="offerAmount" className="text-right text-foreground/90">Offer Amount *</Label>
                                <Input
                                    id="offerAmount"
                                    name="offerAmount"
                                    type="number"
                                    step="0.01"
                                    placeholder="e.g., 1500.00"
                                    value={currentOffer.offerAmount || ''}
                                    onChange={handleInputChange}
                                    className="col-span-3 bg-input border-border/80"
                                />
                            </div>
                            {/* Settlement Type */}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="settlementType" className="text-right text-foreground/90">Settlement *</Label>
                                <Select
                                    name="settlementType"
                                    value={currentOffer.settlementType || ''}
                                    onValueChange={(value) => handleSelectChange('settlementType', value)}
                                >
                                     <SelectTrigger id="settlementType" className="col-span-3 bg-input border-border/80">
                                         <SelectValue placeholder="Lump Sum or Plan..." />
                                     </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lump_sum">Lump Sum</SelectItem>
                                        <SelectItem value="payment_plan">Payment Plan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Status */}
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right text-foreground/90">Status *</Label>
                                <Select
                                    name="status"
                                    value={currentOffer.status || ''}
                                    onValueChange={(value) => handleSelectChange('status', value)}
                                >
                                    <SelectTrigger id="status" className="col-span-3 bg-input border-border/80">
                                         <SelectValue placeholder="Current status..." />
                                     </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="accepted">Accepted</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="countered">Countered</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Notes */}
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="notes" className="text-right text-foreground/90">Notes</Label>
                                <Textarea
                                    id="notes"
                                    name="notes"
                                    placeholder="Optional: Add details about the conversation, next steps, etc."
                                    value={currentOffer.notes || ''}
                                    onChange={handleInputChange}
                                    className="col-span-3 bg-input border-border/80"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="button" onClick={handleSaveOffer} className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Offer</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </CardContent>
        </Card>
    );
}
