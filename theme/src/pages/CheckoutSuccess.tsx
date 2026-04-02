
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function CheckoutSuccess() {
    const [location] = useLocation();
    const searchParams = new URLSearchParams(window.location.search);
    const txnId = searchParams.get("txn-id");

    return (
        <Layout>
            <div className="min-h-[80vh] flex items-center justify-center px-4">
                <GlassCard className="max-w-lg w-full p-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>

                    <h1 className="text-3xl font-bold">Payment Successful!</h1>

                    <div className="space-y-2 text-muted-foreground">
                        <p>Thank you for your purchase.</p>
                        <p>Your packages will be delivered to you shortly.</p>
                        {txnId && (
                            <p className="text-sm font-mono bg-black/20 p-2 rounded mt-4">
                                Transaction ID: {txnId}
                            </p>
                        )}
                    </div>

                    <div className="pt-6">
                        <Link href="/store">
                            <Button className="w-full gap-2" size="lg">
                                Continue Shopping
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </GlassCard>
            </div>
        </Layout>
    );
}
