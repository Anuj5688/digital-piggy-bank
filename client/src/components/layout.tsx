import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Home, Send, Wallet, LogOut, PiggyBank } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "./ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/send", label: "Send Money", icon: Send },
    { href: "/manage", label: "Add/Withdraw", icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/50 bg-card px-4 py-8">
        <div className="flex items-center gap-3 px-2 mb-12">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow text-white">
            <PiggyBank size={24} />
          </div>
          <span className="text-xl font-display font-bold text-foreground tracking-tight">PiggyLink</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className="block">
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer font-medium",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <item.icon size={20} className={isActive ? "text-primary" : ""} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="mt-auto border-t border-border/50 pt-6">
            <div className="flex items-center gap-3 mb-4 px-2">
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                  {getInitials(user.firstName, user.lastName, user.email)}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={() => logout()}>
              <LogOut size={18} className="mr-2" />
              Log out
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 max-w-full pb-20 md:pb-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border/50 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <PiggyBank size={20} />
            </div>
            <span className="text-lg font-display font-bold">PiggyLink</span>
          </div>
          {user && (
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-xs" onClick={() => logout()}>
              {getInitials(user.firstName, user.lastName, user.email)}
            </div>
          )}
        </header>

        <div className="flex-1 p-4 md:p-8 lg:p-10 max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 flex justify-around p-2 pb-safe z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div className="flex flex-col items-center gap-1 p-2">
                <div className={cn(
                  "p-1.5 rounded-full transition-all duration-300",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                )}>
                  <item.icon size={22} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
