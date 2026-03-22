import { PiggyBank, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-4 flex justify-between items-center bg-card/50 backdrop-blur-sm sticky top-0 z-50 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow text-white">
            <PiggyBank size={24} />
          </div>
          <span className="text-xl font-display font-bold tracking-tight">PiggyLink</span>
        </div>
        <Button asChild variant="outline" className="hidden sm:inline-flex">
          <a href="/login">Log In</a>
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center text-center px-4 pt-20 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            The Modern Digital Piggybank
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight text-balance leading-[1.1]">
            Save, Send, and Grow your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-foreground">allowance</span> instantly.
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            PiggyLink makes it incredibly easy to manage your funds, request money from parents, and send cash to friends without the hassle of a traditional bank.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto group">
              <a href="/login">
                Get Started Now
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>
        </motion.div>

        <div className="mt-32 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto w-full px-4">
          {[
            { icon: Zap, title: "Lightning Fast", desc: "Transfers happen in milliseconds. No waiting around." },
            { icon: ShieldCheck, title: "Bank Grade Security", desc: "Your digital funds are protected by industry standard encryption." },
            { icon: PiggyBank, title: "Fun to Save", desc: "Watch your balance grow with beautiful visual celebrations." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + (i * 0.1) }}
              className="p-6 rounded-3xl bg-card border border-border/50 shadow-soft text-left hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
