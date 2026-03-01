import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
    title: "Honest MRR",
    description: "Monthly Recurring Revenue Platform",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
          <ClerkProvider>
                <html lang="en">
                        <body>{children}</body>body>
                </html>html>
          </ClerkProvider>ClerkProvider>
        );
}</ClerkProvider>
