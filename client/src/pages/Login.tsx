import { useState } from "react";
import { useLocation } from "wouter";
import { userStorage } from "@/lib/user-storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { TrendingUp, ArrowRight } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Masukkan username dan password",
        variant: "destructive",
      });
      return;
    }

    // Check if user exists and password is correct
    if (!userStorage.userExists(username)) {
      toast({
        title: "Akun Tidak Ditemukan",
        description: `"${username}" belum terdaftar. Silakan buat akun terlebih dahulu.`,
        variant: "destructive",
      });
      return;
    }

    // Verify password
    if (!userStorage.verifyPassword(username, password)) {
      toast({
        title: "Password Salah",
        description: "Username atau password yang Anda masukkan salah.",
        variant: "destructive",
      });
      return;
    }

    // Login user
    if (userStorage.loginUser(username, password)) {
      toast({
        title: "Login Berhasil",
        description: `Selamat datang, ${username}!`,
      });
      setLocation("/");
    } else {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat login",
        variant: "destructive",
      });
    }
  };

  const handleRegisterClick = () => {
    setLocation("/register");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        <div className="absolute inset-0 gradient-primary opacity-90" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <TrendingUp className="h-16 w-16 mb-6" />
            <h1 className="text-5xl font-display font-bold mb-4">
              RATIO
            </h1>
            <p className="text-xl font-light mb-8 opacity-90">
              Rational Finance Engine
            </p>
            <div className="space-y-4 text-sm opacity-80">
              <div className="flex items-start gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-white mt-2" />
                <p>Kelola keuangan dengan rasio 50-30-20</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-white mt-2" />
                <p>Analisis pengeluaran secara real-time</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-white mt-2" />
                <p>Laporan keuangan yang komprehensif</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-20 left-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      </motion.div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="glass-strong border-border/50 shadow-2xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-3xl font-display font-bold tracking-tight">
                Selamat Datang
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Masuk ke akun Anda untuk melanjutkan
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Username
                  </label>
                  <Input
                    type="text"
                    placeholder="Masukkan username Anda"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-11 bg-secondary/50 border-border/50 focus:border-primary transition-colors"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Masukkan password Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 bg-secondary/50 border-border/50 focus:border-primary transition-colors"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 gradient-primary hover:opacity-90 transition-opacity shadow-glow group"
                >
                  Masuk
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border/50 space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  Belum punya akun?
                </p>
                <Button
                  onClick={handleRegisterClick}
                  variant="outline"
                  className="w-full h-11 border-border/50 hover:bg-secondary/50 transition-colors"
                >
                  Buat Akun Baru
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
