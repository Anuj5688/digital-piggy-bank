import { useState, useEffect } from "react";
import { useUsersSearch } from "@/hooks/use-users";
import { useTransfer } from "@/hooks/use-banking";
import { formatMoney, getInitials } from "@/lib/utils";
import { Search, Send, CheckCircle2, User as UserIcon, QrCode, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function SendMoney() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [, setLocation] = useLocation();

  const { data: users, isLoading: searchLoading } = useUsersSearch(debouncedSearch);
  const transfer = useTransfer();

  // QR Scanner logic
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (showScanner) {
      scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
      scanner.render((decodedText) => {
        try {
          const data = JSON.parse(decodedText);
          if (data.type === "piggybank_transfer" && data.userId) {
            setSelectedUser({
              id: data.userId,
              firstName: data.name?.split(' ')[0] || "User",
              lastName: data.name?.split(' ')[1] || "",
              email: data.email || ""
            });
            setShowScanner(false);
            scanner?.clear();
          }
        } catch (e) {
          console.error("Invalid QR code", e);
        }
      }, (error) => {
        // console.warn(error);
      });
    }
    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [showScanner]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    try {
      await transfer.mutateAsync({
        toUserId: selectedUser.id,
        dollars: Number(amount),
        description: description || "Transfer"
      });
      setIsSuccess(true);
      setTimeout(() => setLocation("/"), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center text-success">
          <CheckCircle2 size={48} />
        </div>
        <div>
          <h2 className="text-3xl font-display font-bold">Money Sent!</h2>
          <p className="text-muted-foreground mt-2 text-lg">
            Successfully sent {formatMoney(Number(amount) * 100)} to {selectedUser.firstName}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Send Money</h1>
          <p className="text-muted-foreground mt-1">Instantly transfer funds to friends.</p>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-2xl h-12 w-12 border-primary/20"
          onClick={() => setShowScanner(!showScanner)}
        >
          {showScanner ? <X /> : <QrCode className="text-primary" />}
        </Button>
      </header>

      {showScanner && (
        <div className="bg-card rounded-3xl border border-border/50 shadow-soft overflow-hidden p-4">
          <div id="reader" className="w-full"></div>
          <p className="text-center text-sm text-muted-foreground mt-4">Scan a PiggyLink QR code to send money</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!selectedUser ? (
          <motion.div 
            key="search"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-border bg-card text-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="bg-card rounded-3xl border border-border/50 shadow-soft overflow-hidden min-h-[300px]">
              {searchLoading ? (
                <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </div>
              ) : debouncedSearch.length < 2 ? (
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                  <UserIcon size={40} className="mb-4 opacity-50" />
                  <p>Type at least 2 characters to search</p>
                </div>
              ) : users?.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <p>No users found matching "{debouncedSearch}"</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {users?.map((u) => (
                    <button
                      key={u.id}
                      className="w-full text-left p-4 sm:p-6 flex items-center gap-4 hover:bg-muted/50 transition-colors focus:bg-muted outline-none"
                      onClick={() => setSelectedUser(u)}
                    >
                      {u.profileImageUrl ? (
                        <img src={u.profileImageUrl} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground font-bold flex items-center justify-center text-lg">
                          {getInitials(u.firstName, u.lastName, u.email)}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-lg">{u.firstName} {u.lastName}</p>
                        <p className="text-muted-foreground">{u.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.form 
            key="amount"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleSend}
            className="bg-card rounded-3xl border border-border/50 shadow-soft p-6 sm:p-8 space-y-8"
          >
            <div className="flex items-center justify-between pb-6 border-b border-border/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground font-bold flex items-center justify-center text-lg">
                  {getInitials(selectedUser.firstName, selectedUser.lastName, selectedUser.email)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sending to</p>
                  <p className="font-bold text-lg">{selectedUser.firstName} {selectedUser.lastName}</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedUser(null)}
                className="text-sm text-primary font-semibold hover:underline"
              >
                Change
              </button>
            </div>

            <div className="space-y-4 text-center">
              <label className="block text-sm font-semibold text-muted-foreground">Amount</label>
              <div className="flex justify-center items-center text-5xl sm:text-6xl font-display font-extrabold text-foreground">
                <span className="text-muted-foreground mr-1">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  required
                  autoFocus
                  className="bg-transparent border-none focus:outline-none focus:ring-0 w-full max-w-[200px] text-center placeholder:text-muted"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-muted-foreground">What's it for? (Optional)</label>
              <input
                type="text"
                placeholder="Dinner, movies, rent..."
                className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full text-lg"
              disabled={!amount || Number(amount) <= 0 || transfer.isPending}
            >
              {transfer.isPending ? "Sending..." : "Send Money"}
              {!transfer.isPending && <Send className="ml-2 w-5 h-5" />}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
