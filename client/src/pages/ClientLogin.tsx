import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Scale, Lock, Mail, AlertCircle } from "lucide-react";

export default function ClientLogin() {
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loginMutation = trpc.clientAuth.login.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginMutation.mutateAsync({
        email,
        password,
      });

      if (result.success) {
        // Store client info in localStorage
        localStorage.setItem("clientAuth", JSON.stringify(result.client));
        // Redirect to client dashboard
        window.location.href = "/client-portal/dashboard";
      }
    } catch (err: any) {
      setError(err.message || (language === 'ar' ? 'خطأ في تسجيل الدخول' : 'Login error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Scale className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {language === 'ar' ? 'بوابة العملاء' : 'Client Portal'}
          </CardTitle>
          <CardDescription>
            {language === 'ar' 
              ? 'قم بتسجيل الدخول للوصول إلى قضاياك ووثائقك'
              : 'Sign in to access your cases and documents'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="w-4 h-4 inline me-1" />
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                <Lock className="w-4 h-4 inline me-1" />
                {language === 'ar' ? 'كلمة المرور' : 'Password'}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading 
                ? (language === 'ar' ? 'جاري تسجيل الدخول...' : 'Signing in...')
                : (language === 'ar' ? 'تسجيل الدخول' : 'Sign In')}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {language === 'ar' 
              ? 'لم تستلم رابط الدعوة؟ تواصل مع مكتبنا القانوني'
              : 'Haven\'t received an invitation link? Contact our law office'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
