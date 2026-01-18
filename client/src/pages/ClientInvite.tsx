import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Scale, Lock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function ClientInvite() {
  const { language } = useLanguage();
  const [, params] = useRoute("/client-portal/invite/:token");
  const token = params?.token || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: tokenData, isLoading: verifying, error: tokenError } = trpc.clientAuth.verifyToken.useQuery(
    { token },
    { enabled: !!token }
  );

  const setPasswordMutation = trpc.clientAuth.setPassword.useMutation();

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError(language === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await setPasswordMutation.mutateAsync({
        token,
        password,
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/client-portal/login";
      }, 2000);
    } catch (err: any) {
      setError(err.message || (language === 'ar' ? 'خطأ في تعيين كلمة المرور' : 'Error setting password'));
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="pt-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">
              {language === 'ar' ? 'جاري التحقق من الدعوة...' : 'Verifying invitation...'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tokenError || !tokenData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">
              {language === 'ar' ? 'رابط غير صالح' : 'Invalid Link'}
            </CardTitle>
            <CardDescription>
              {language === 'ar' 
                ? 'رابط الدعوة غير صالح أو منتهي الصلاحية'
                : 'The invitation link is invalid or expired'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => window.location.href = "/client-portal/login"}
            >
              {language === 'ar' ? 'الذهاب لتسجيل الدخول' : 'Go to Login'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl">
              {language === 'ar' ? 'تم بنجاح!' : 'Success!'}
            </CardTitle>
            <CardDescription>
              {language === 'ar' 
                ? 'تم تعيين كلمة المرور بنجاح. جاري التحويل لتسجيل الدخول...'
                : 'Password set successfully. Redirecting to login...'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Scale className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {language === 'ar' ? 'مرحباً بك' : 'Welcome'}
          </CardTitle>
          <CardDescription>
            {language === 'ar' 
              ? `مرحباً ${tokenData.clientName}, قم بتعيين كلمة مرور لحسابك`
              : `Welcome ${tokenData.clientName}, set your account password`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetPassword} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

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
                placeholder={language === 'ar' ? 'أدخل كلمة مرور قوية' : 'Enter a strong password'}
                required
                disabled={loading}
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? '6 أحرف على الأقل' : 'At least 6 characters'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                <Lock className="w-4 h-4 inline me-1" />
                {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={language === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter your password'}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading 
                ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                : (language === 'ar' ? 'تعيين كلمة المرور' : 'Set Password')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
