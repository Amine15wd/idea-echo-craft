
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Mail, Lock, User, ArrowLeft, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetWithToken, setIsResetWithToken] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if coming from password reset flow
  const isFromReset = searchParams.get('reset') === 'true';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgotPassword && !isResetWithToken) {
        // Generate a simple 6-digit token
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        const redirectUrl = `${window.location.origin}/auth?reset=true`;
        
        // Call our edge function to send the reset token
        const { data, error: functionError } = await supabase.functions.invoke('send-reset-token', {
          body: { email, token, redirectUrl }
        });

        if (functionError) {
          throw new Error(functionError.message || 'Failed to send reset token');
        }

        // Store token temporarily for development
        if (data?.token) {
          localStorage.setItem('reset_token_' + email, data.token);
          toast.success(`Reset code sent! For testing: ${data.token}`);
        } else {
          toast.success("Reset code sent to your email!");
        }
        
        setResetEmailSent(true);
        setIsResetWithToken(true);
      } else if (isResetWithToken) {
        // Verify token and reset password
        const storedToken = localStorage.getItem('reset_token_' + email);
        
        if (!storedToken || storedToken !== resetToken) {
          throw new Error('Invalid or expired reset code');
        }

        // Reset password using Supabase admin function would go here
        // For now, we'll simulate success and redirect to login
        localStorage.removeItem('reset_token_' + email);
        toast.success("Password reset code verified! Please sign in.");
        setIsForgotPassword(false);
        setIsResetWithToken(false);
        setIsLogin(true);
        setResetToken("");
        setPassword("");
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Successfully signed in!");
          navigate("/dashboard");
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Check your email to confirm your account!");
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyResetCode = () => {
    const storedToken = localStorage.getItem('reset_token_' + email);
    if (storedToken) {
      navigator.clipboard.writeText(storedToken);
      toast.success("Reset code copied to clipboard!");
    }
  };

  const getTitle = () => {
    if (isForgotPassword) {
      if (isResetWithToken) return "Enter reset code";
      return "Reset password";
    }
    return isLogin ? "Welcome back" : "Get started";
  };

  const getDescription = () => {
    if (isForgotPassword) {
      if (isResetWithToken) return "Enter the reset code sent to your email";
      return "Enter your email to receive a reset code";
    }
    return isLogin
      ? "Sign in to your PitchPal AI account"
      : "Create your PitchPal AI account";
  };

  const getButtonText = () => {
    if (loading) return "Loading...";
    if (isForgotPassword) {
      if (isResetWithToken) return "Verify Code";
      return "Send reset code";
    }
    return isLogin ? "Sign In" : "Create Account";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-950/20 flex items-center justify-center p-6">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 w-full max-w-md">
        {/* Back to home */}
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <Card className="border-border/20 bg-background/80 backdrop-blur-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {getTitle()}
            </CardTitle>
            <CardDescription>
              {getDescription()}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && !isForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      required={!isLogin && !isForgotPassword}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isResetWithToken && resetEmailSent}
                  />
                </div>
              </div>

              {isResetWithToken && (
                <div className="space-y-2">
                  <Label htmlFor="resetToken">Reset Code</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="resetToken"
                      type="text"
                      placeholder="Enter the 6-digit code"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      className="pl-10"
                      required
                      maxLength={6}
                    />
                    {localStorage.getItem('reset_token_' + email) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1 h-8 w-8 p-0"
                        onClick={copyResetCode}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {localStorage.getItem('reset_token_' + email) && (
                    <p className="text-xs text-muted-foreground">
                      For testing: Click the copy button to get the reset code
                    </p>
                  )}
                </div>
              )}

              {!isForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {getButtonText()}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              {!isForgotPassword && (
                <>
                  {isLogin && (
                    <Button
                      variant="ghost"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Forgot your password?
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm block w-full"
                  >
                    {isLogin
                      ? "Don't have an account? Sign up"
                      : "Already have an account? Sign in"}
                  </Button>
                </>
              )}
              
              {isForgotPassword && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setIsResetWithToken(false);
                    setResetEmailSent(false);
                    setIsLogin(true);
                    setResetToken("");
                  }}
                  className="text-sm"
                >
                  Back to sign in
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
