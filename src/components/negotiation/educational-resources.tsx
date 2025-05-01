
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, LifeBuoy, ExternalLink } from 'lucide-react';
import Link from 'next/link'; // Use NextLink for external links for consistency

export function EducationalResources() {
  // Links to external resources (replace with actual reputable sources)
  const resources = [
    { title: 'Understanding Debt Settlement (FTC)', url: 'https://consumer.ftc.gov/articles/debt-settlement-companies', description: 'Official guidance from the Federal Trade Commission.' },
    { title: 'Fair Debt Collection Practices Act (CFPB)', url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-the-fair-debt-collection-practices-act-en-1403/', description: 'Know your rights when dealing with collectors.' },
    { title: 'National Foundation for Credit Counseling (NFCC)', url: 'https://www.nfcc.org/', description: 'Find non-profit credit counseling agencies.' },
    { title: 'Find a Certified Financial Planner (CFP Board)', url: 'https://www.letsmakeaplan.org/', description: 'Search for qualified financial advisors.' },
  ];

  return (
    <Card className="bg-card shadow-md border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-foreground">
          <GraduationCap className="text-primary" /> Educational Resources & Help
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Learn more about debt negotiation and find professional assistance if needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
            <h4 className="font-medium text-foreground/90 mb-2">Learn More:</h4>
            <ul className="space-y-3">
                {resources.map((res, index) => (
                    <li key={index} className="border-b border-border/30 pb-3 last:border-b-0 last:pb-0">
                       <Link href={res.url} target="_blank" rel="noopener noreferrer" className="group">
                             <h5 className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center">
                                {res.title} <ExternalLink size={14} className="ml-1 opacity-70 group-hover:opacity-100" />
                             </h5>
                       </Link>
                        <p className="text-sm text-muted-foreground mt-1">{res.description}</p>
                    </li>
                ))}
            </ul>
        </div>
         <div className="pt-4 border-t border-border/50">
            <h4 className="font-medium text-foreground/90 mb-2 flex items-center gap-1.5"><LifeBuoy size={16}/> Need Professional Help?</h4>
            <p className="text-sm text-muted-foreground mb-3">
                Consider contacting a non-profit credit counselor (like those found via NFCC) or a certified financial planner for personalized advice. Be cautious of for-profit debt settlement companies that charge high fees.
            </p>
            {/* Optional: Button to link directly to NFCC or CFP search */}
            <div className="flex gap-2">
                 <Button variant="outline" size="sm" asChild>
                     <Link href="https://www.nfcc.org/" target="_blank" rel="noopener noreferrer">
                         Find a Credit Counselor <ExternalLink size={14} className="ml-1" />
                     </Link>
                 </Button>
                 <Button variant="outline" size="sm" asChild>
                     <Link href="https://www.letsmakeaplan.org/" target="_blank" rel="noopener noreferrer">
                         Find a Financial Planner <ExternalLink size={14} className="ml-1" />
                     </Link>
                 </Button>
            </div>

         </div>
      </CardContent>
    </Card>
  );
}
