import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PiggyBank, ArrowLeft, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await apiRequest("POST", "/api/register", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        password: formData.password,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
      toast({
        title: "Welcome to PiggyLink!",
        description: "Your account has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong",
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
          <CardTitle className="text-2xl font-display font-bold">Create Account</CardTitle>
          <p className="text-muted-foreground text-sm">Start your digital piggybank journey</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="font-semibold">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="font-semibold">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="h-11 rounded-xl border-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="font-semibold">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
                className="h-11 rounded-xl border-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                className="h-11 rounded-xl border-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-semibold">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="h-11 rounded-xl border-2"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-bold mt-6" 
              disabled={loading}
            >
              <UserPlus className="mr-2 h-5 w-5" />
              {loading ? "Creating Account..." : "Register"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <div className="w-full text-center border-t border-border/50 pt-4">
            <p className="text-sm text-muted-foreground mb-3">Already have an account?</p>
            <Button 
              variant="outline" 
              onClick={() => setLocation("/login")}
              className="w-full h-11 rounded-xl"
            >
              Login Here
            </Button>
          </div>

          <div className="w-full text-center">
            <p className="text-xs text-muted-foreground mb-3">Or continue with</p>
            <Button 
              variant="outline" 
              asChild 
              className="w-full h-11 rounded-xl"
            >
              <a href="/api/login">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google Login
              </a>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
