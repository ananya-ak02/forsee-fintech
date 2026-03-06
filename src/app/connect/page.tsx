"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Link2,
    Building2,
    CheckCircle2,
    Shield,
    ArrowRight,
    CreditCard,
    Wallet,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { getMockAccounts } from "@/lib/mock-data";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.15 },
    },
} as const;

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

type ConnectionStep = "intro" | "connecting" | "success";

export default function ConnectPage() {
    const [step, setStep] = useState<ConnectionStep>("intro");
    const [connectedAccounts, setConnectedAccounts] = useState<
        { id: string; name: string; type: string; balance: number; institution: string }[]
    >([]);

    const handleConnect = async () => {
        setStep("connecting");

        // In production, this would:
        // 1. Call /api/plaid/create-link-token
        // 2. Open Plaid Link
        // 3. Exchange public token for access token
        // 4. Fetch accounts and transactions

        // Simulate connection
        await new Promise((resolve) => setTimeout(resolve, 2500));

        const mockAccounts = getMockAccounts();
        setConnectedAccounts(mockAccounts);
        setStep("success");
    };

    return (
        <motion.div variants={container} initial="hidden" animate="show">
            {/* Header */}
            <motion.div variants={item} className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-1">
                    Connect Your Bank
                </h1>
                <p className="text-muted">
                    Securely link your accounts to unlock AI-powered insights
                </p>
            </motion.div>

            {/* Step indicators */}
            <motion.div variants={item} className="mb-8">
                <div className="flex items-center gap-3">
                    {["Connect", "Verify", "Done"].map((label, i) => {
                        const stepIndex =
                            step === "intro" ? 0 : step === "connecting" ? 1 : 2;
                        const isActive = i <= stepIndex;
                        return (
                            <div key={label} className="flex items-center gap-3">
                                <div
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500 ${isActive
                                        ? "bg-mint/10 border border-mint/30"
                                        : "bg-card border border-border"
                                        }`}
                                >
                                    <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${isActive
                                            ? "bg-mint text-background"
                                            : "bg-border text-muted"
                                            }`}
                                    >
                                        {i < stepIndex ? (
                                            <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                            i + 1
                                        )}
                                    </div>
                                    <span
                                        className={`text-sm font-medium transition-colors ${isActive ? "text-mint" : "text-muted"
                                            }`}
                                    >
                                        {label}
                                    </span>
                                </div>
                                {i < 2 && (
                                    <div
                                        className={`w-12 h-px transition-colors ${i < stepIndex ? "bg-mint" : "bg-border"
                                            }`}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Content */}
            <div className="max-w-3xl">
                {step === "intro" && (
                    <motion.div variants={item}>
                        <Card className="p-8">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-mint/20 to-lime/10 flex items-center justify-center mx-auto mb-6">
                                    <Building2 className="w-10 h-10 text-mint" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">
                                    Link Your Bank Account
                                </h2>
                                <p className="text-muted max-w-md mx-auto">
                                    We use Plaid to securely connect to over 12,000 financial
                                    institutions. Your credentials are never stored on our
                                    servers.
                                </p>
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                {[
                                    {
                                        icon: Shield,
                                        title: "Bank-Level Security",
                                        desc: "256-bit encryption protects your data",
                                    },
                                    {
                                        icon: CreditCard,
                                        title: "Auto-Sync",
                                        desc: "Transactions update in real-time",
                                    },
                                    {
                                        icon: Wallet,
                                        title: "Multi-Account",
                                        desc: "Connect checking, savings, and credit",
                                    },
                                ].map((feature) => (
                                    <div
                                        key={feature.title}
                                        className="text-center p-4 rounded-xl bg-background/50 border border-border"
                                    >
                                        <feature.icon className="w-6 h-6 text-mint mx-auto mb-2" />
                                        <h3 className="text-sm font-semibold text-foreground mb-1">
                                            {feature.title}
                                        </h3>
                                        <p className="text-xs text-muted">{feature.desc}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Connect Button */}
                            <div className="text-center">
                                <Button
                                    onClick={handleConnect}
                                    variant="mint"
                                    size="lg"
                                    className="px-10 text-base"
                                >
                                    <Link2 className="w-5 h-5 mr-2" />
                                    Connect with Plaid
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                                <p className="text-xs text-muted mt-3">
                                    Using Plaid sandbox mode for demo
                                </p>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {step === "connecting" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card className="p-12 text-center">
                            <div className="relative w-20 h-20 mx-auto mb-6">
                                <div className="w-20 h-20 rounded-full border-2 border-border border-t-mint animate-spin" />
                                <Building2 className="w-8 h-8 text-mint absolute inset-0 m-auto" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground mb-2">
                                Connecting to Your Bank...
                            </h2>
                            <p className="text-muted">
                                Securely verifying your credentials and fetching account data
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <RefreshCw className="w-4 h-4 text-mint animate-spin" />
                                <span className="text-sm text-mint">
                                    Syncing transactions...
                                </span>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {step === "success" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <Card className="p-8 text-center border-mint/20">
                            <div className="w-16 h-16 rounded-full bg-mint/10 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-mint" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground mb-1">
                                Successfully Connected!
                            </h2>
                            <p className="text-muted">
                                Your accounts are now synced with Foresee
                            </p>
                        </Card>

                        <Card className="p-6">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Building2 className="w-5 h-5 text-mint" />
                                    Connected Accounts
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {connectedAccounts.map((account) => (
                                    <div
                                        key={account.id}
                                        className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-mint/10 flex items-center justify-center">
                                                {account.type === "checking" ? (
                                                    <CreditCard className="w-5 h-5 text-mint" />
                                                ) : (
                                                    <Wallet className="w-5 h-5 text-lime" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    {account.name}
                                                </p>
                                                <p className="text-xs text-muted capitalize">
                                                    {account.institution} · {account.type}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-foreground">
                                                {formatCurrency(account.balance)}
                                            </p>
                                            <Badge variant="success" className="text-[10px] mt-1">
                                                Synced
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <div className="text-center">
                            <Button
                                onClick={() => (window.location.href = "/dashboard")}
                                variant="mint"
                                size="lg"
                                className="px-8"
                            >
                                Go to Dashboard
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Security Notice */}
            <motion.div variants={item} className="mt-8 max-w-3xl">
                <div className="flex items-start gap-3 rounded-xl bg-card/50 border border-border p-4">
                    <AlertCircle className="w-5 h-5 text-muted flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-foreground mb-0.5">
                            Your security is our priority
                        </p>
                        <p className="text-xs text-muted leading-relaxed">
                            Foresee uses Plaid&apos;s bank-grade security infrastructure. We
                            never store your banking credentials, and all data is encrypted
                            with AES-256. You can disconnect your accounts at any time.
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
