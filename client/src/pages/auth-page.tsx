import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PiggyBank, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isRegister ? "/api/register" : "/api/login/local";
      await apiRequest("POST", endpoint, formData);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Button 
        variant="ghost" 
        className="absolute top-4 left-4" 
        onClick={() => setLocation("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card className="w-full max-w-md shadow-soft rounded-3xl border-border/50">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white mb-2">
            <PiggyBank size={28} />
          </div>
          <CardTitle className="text-2xl font-display font-bold">
            {isRegister ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <p className="text-muted-foreground">
            {isRegister ? "Start your digital piggybank journey" : "Log in to manage your savings"}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? "Please wait..." : (isRegister ? "Register" : "Login")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <Button 
            variant="link" 
            onClick={() => setIsRegister(!isRegister)}
            className="text-muted-foreground"
          >
            {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground mb-4">Or continue with</p>
        <Button variant="outline" asChild>
          <a href="/api/login">Google Account</a>
        </Button>
      </div>
    </div>
  );
}