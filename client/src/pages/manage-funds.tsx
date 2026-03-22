import { useState } from "react";
import { useDeposit, useWithdraw, useBalance } from "@/hooks/use-banking";
import { formatMoney } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Wallet, CreditCard, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', icon: Wallet, color: 'text-blue-500' },
  { id: 'phonepe', name: 'PhonePe', icon: Landmark, color: 'text-purple-600' },
  { id: 'paytm', name: 'Paytm', icon: CreditCard, color: 'text-cyan-500' },
];

export default function ManageFunds() {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState("");
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [depositUpiId, setDepositUpiId] = useState("");
  const [withdrawUpiId, setWithdrawUpiId] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { data: balanceData } = useBalance();
  const deposit = useDeposit();
  const withdraw = useWithdraw();

  const balance = balanceData?.amount || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dollars = Number(amount);
    if (!dollars || isNaN(dollars) || dollars <= 0) return;

    try {
      if (activeTab === 'deposit') {
        if (selectedApp && !depositUpiId.trim()) {
          alert("Please enter your receiving UPI ID");
          return;
        }
        await deposit.mutateAsync({ dollars, externalApp: selectedApp || undefined, upiId: depositUpiId || undefined });
        setSuccessMsg(`Successfully deposited ${formatMoney(dollars * 100)}${selectedApp ? ` via ${UPI_APPS.find(a => a.id === selectedApp)?.name}` : ''}`);
      } else {
        if (!withdrawUpiId.trim()) {
          alert("Please enter a UPI ID");
          return;
        }
        await withdraw.mutateAsync({ dollars, upiId: withdrawUpiId });
        setSuccessMsg(`Successfully withdrew ${formatMoney(dollars * 100)} to UPI: ${withdrawUpiId}`);
      }
      setAmount("");
      setDepositUpiId("");
      setWithdrawUpiId("");
      setSelectedApp(null);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      alert(err.message || "Action failed");
    }
  };

  const setPreset = (val: number) => setAmount(val.toString());

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold">Manage Funds</h1>
          <p className="text-muted-foreground mt-1">Current Balance: <span className="font-bold text-foreground">{formatMoney(balance)}</span></p>
        </div>
      </header>

      <div className="bg-card rounded-3xl border border-border/50 shadow-soft overflow-hidden">
        {/* Custom Tabs */}
        <div className="flex p-2 bg-muted/50 border-b border-border/50">
          <button
            onClick={() => { setActiveTab('deposit'); setAmount(""); }}
            className={cn(
              "flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2",
              activeTab === 'deposit' ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/50"
            )}
          >
            <ArrowDownLeft size={18} />
            Deposit
          </button>
          <button
            onClick={() => { setActiveTab('withdraw'); setAmount(""); }}
            className={cn(
              "flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2",
              activeTab === 'withdraw' ? "bg-white shadow-sm text-destructive" : "text-muted-foreground hover:text-foreground hover:bg-white/50"
            )}
          >
            <ArrowUpRight size={18} />
            Withdraw
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {successMsg ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center text-center space-y-4"
            >
              <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center text-success">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-display font-bold text-success">Success!</h3>
              <p className="text-muted-foreground font-medium">{successMsg}</p>
            </motion.div>
          ) : (
            <motion.form 
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              <div className="space-y-4 text-center">
                <label className="block text-sm font-semibold text-muted-foreground">
                  {activeTab === 'deposit' ? 'Amount to add' : 'Amount to withdraw'}
                </label>
                <div className="flex justify-center items-center text-5xl sm:text-6xl font-display font-extrabold text-foreground">
                  <span className="text-muted-foreground mr-1">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    required
                    className="bg-transparent border-none focus:outline-none focus:ring-0 w-full max-w-[200px] text-center placeholder:text-muted"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {[10, 20, 50, 100].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setPreset(preset)}
                    className="px-4 py-2 rounded-xl border border-border bg-background font-bold text-muted-foreground hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-colors"
                  >
                    +${preset}
                  </button>
                ))}
              </div>

              {activeTab === 'withdraw' && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-muted-foreground">Withdraw to UPI ID</label>
                  <input
                    type="text"
                    placeholder="Enter UPI ID (e.g., username@bank)"
                    className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    value={withdrawUpiId}
                    onChange={(e) => setWithdrawUpiId(e.target.value)}
                    required={activeTab === 'withdraw'}
                  />
                  <p className="text-xs text-muted-foreground">Format: username@bankname or phonenumber@upi</p>
                </div>
              )}

              {activeTab === 'deposit' && selectedApp && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-muted-foreground">Your UPI ID (to receive deposit)</label>
                  <input
                    type="text"
                    placeholder="Enter your UPI ID (e.g., username@bank)"
                    className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    value={depositUpiId}
                    onChange={(e) => setDepositUpiId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Format: username@bankname or phonenumber@upi</p>
                </div>
              )}

              {activeTab === 'deposit' && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-muted-foreground text-center">
                    Select UPI App (Optional)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {UPI_APPS.map((app) => {
                      const isSelected = selectedApp === app.id;
                      return (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => setSelectedApp(isSelected ? null : app.id)}
                          className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-md scale-105"
                              : "border-border bg-background hover:border-primary hover:bg-primary/5"
                          }`}
                        >
                          <app.icon className={cn("w-6 h-6", app.color)} />
                          <span className="text-xs font-bold text-center">{app.name}</span>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-primary mt-1"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                size="lg" 
                variant={activeTab === 'deposit' ? 'default' : 'destructive'}
                className="w-full text-lg shadow-lg"
                disabled={!amount || Number(amount) <= 0 || deposit.isPending || withdraw.isPending}
              >
                {deposit.isPending || withdraw.isPending ? "Processing..." : (
                  activeTab === 'deposit' ? "Confirm Deposit" : "Confirm Withdrawal"
                )}
              </Button>
            </motion.form>
          )}
        </div>
      </div>
    </div>
  );
}
