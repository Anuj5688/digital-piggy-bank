import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useBalance, useTransactions } from "@/hooks/use-banking";
import { formatMoney, formatDate, cn, getInitials } from "@/lib/utils";
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowRightLeft, 
  Plus, 
  Send,
  QrCode 
} from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: balanceData, isLoading: balanceLoading } = useBalance();
  const { data: transactions, isLoading: txLoading } = useTransactions();
  const [showQR, setShowQR] = useState(false);

  const balance = balanceData?.amount || 0;

  const qrValue = JSON.stringify({
    type: "piggybank_transfer",
    userId: user?.id,
    name: `${user?.firstName} ${user?.lastName}`,
    email: user?.email
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Good morning, {user?.firstName || 'Friend'}!</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your piggybank.</p>
        </div>
        <Dialog open={showQR} onOpenChange={setShowQR}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-2xl h-12 w-12 border-primary/20 hover:bg-primary/5">
              <QrCode className="text-primary" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-center font-display text-2xl">Your Receive QR</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center p-6 space-y-6">
              <div className="p-4 bg-white rounded-3xl shadow-soft">
                <QRCode value={qrValue} size={200} />
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <p className="text-xs text-muted-foreground text-center max-w-[200px]">
                Show this QR to friends to receive money instantly.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {/* Hero Balance Card */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent-foreground p-8 sm:p-10 text-white shadow-glow"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <p className="text-primary-foreground/80 font-medium mb-2 flex items-center gap-2">
            Total Balance
          </p>
          {balanceLoading ? (
            <div className="h-14 w-48 bg-white/20 rounded-xl animate-pulse"></div>
          ) : (
            <h2 className="text-5xl sm:text-6xl font-display font-extrabold tracking-tight">
              {formatMoney(balance)}
            </h2>
          )}
          
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/manage" className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-white text-primary font-bold hover:bg-white/90 hover:scale-105 transition-all shadow-lg">
              <Plus className="mr-2" size={20} />
              Add Money
            </Link>
            <Link href="/send" className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-primary-foreground/20 backdrop-blur-md border border-white/20 text-white font-bold hover:bg-primary-foreground/30 hover:scale-105 transition-all">
              <Send className="mr-2" size={20} />
              Send
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-xl font-display font-bold">Recent Activity</h3>
        </div>

        <div className="bg-card rounded-3xl border border-border/50 shadow-soft overflow-hidden">
          {txLoading ? (
            <div className="p-8 flex flex-col gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 bg-secondary rounded animate-pulse"></div>
                    <div className="h-3 w-1/4 bg-secondary rounded animate-pulse"></div>
                  </div>
                  <div className="h-4 w-16 bg-secondary rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : transactions?.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-muted-foreground mb-4">
                <ArrowRightLeft size={32} />
              </div>
              <p className="font-bold text-lg">No transactions yet</p>
              <p className="text-muted-foreground mt-1">When you send or receive money, it will show up here.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {transactions?.map((tx, idx) => {
                const isPositive = tx.type === 'deposit' || (tx.type === 'transfer' && tx.toUserId === user?.id);
                
                let icon = <ArrowRightLeft size={20} />;
                let colorClass = "bg-secondary text-secondary-foreground";
                let title = "Transfer";
                let amountPrefix = isPositive ? "+" : "-";

                if (tx.type === 'deposit') {
                  icon = <ArrowDownLeft size={20} />;
                  colorClass = "bg-success/10 text-success";
                  title = "Deposit";
                } else if (tx.type === 'withdraw') {
                  icon = <ArrowUpRight size={20} />;
                  colorClass = "bg-destructive/10 text-destructive";
                  title = "Withdrawal";
                } else if (tx.type === 'transfer') {
                  if (isPositive) {
                    icon = <ArrowDownLeft size={20} />;
                    colorClass = "bg-primary/10 text-primary";
                    title = `From ${tx.otherUser?.firstName || 'Someone'}`;
                  } else {
                    icon = <ArrowUpRight size={20} />;
                    colorClass = "bg-accent text-accent-foreground";
                    title = `To ${tx.otherUser?.firstName || 'Someone'}`;
                  }
                }

                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={tx.id} 
                    className="p-4 sm:p-6 flex items-center gap-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", colorClass)}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base truncate">{title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {tx.description || formatDate(tx.createdAt || new Date())}
                      </p>
                    </div>
                    <div className={cn(
                      "font-bold text-lg text-right shrink-0",
                      isPositive ? "text-success" : "text-foreground"
                    )}>
                      {amountPrefix}{formatMoney(tx.amount)}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
