
'use client';

import * as React from 'react';
import type { Debt } from '@/types/debt';
import { Handshake } from 'lucide-react';
import { NegotiationGuide } from '@/components/negotiation/negotiation-guide';
import { LetterGenerator } from '@/components/negotiation/letter-generator';
import { OfferTracker } from '@/components/negotiation/offer-tracker';
import { EducationalResources } from '@/components/negotiation/educational-resources';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';


export default function NegotiationPage() {
    const [debts, setDebts] = React.useState<Debt[]>([]);

    // Load debts from local storage (or fetch) - needed for Letter Generator and Offer Tracker
     React.useEffect(() => {
        const storedDebts = localStorage.getItem('debts');
        if (storedDebts) {
            setDebts(JSON.parse(storedDebts));
        }
     }, []);

    return (
         <>
            <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-xl font-semibold text-foreground flex items-center gap-2"><Handshake size={22}/> Debt Negotiation Center</h1>
                 {/* Add actions if needed */}
            </header>

            <main className="container mx-auto p-4 md:p-8 space-y-8">

                 <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 text-destructive-foreground">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <AlertTitle className="text-destructive font-semibold">Important Disclaimer</AlertTitle>
                    <AlertDescription className="text-destructive/90">
                        The tools and information provided here are for educational purposes only and do not constitute financial or legal advice. Debt settlement can have significant impacts on your credit score and may have tax implications. Consult with a qualified professional before making decisions.
                    </AlertDescription>
                </Alert>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Guide & Resources */}
                    <div className="space-y-8">
                        <NegotiationGuide />
                        <EducationalResources />
                    </div>

                    {/* Right Column: Tools */}
                    <div className="space-y-8">
                         <LetterGenerator debts={debts} />
                         <OfferTracker debts={debts} />
                    </div>
                 </div>

            </main>
        </>
    );
}
