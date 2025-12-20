import { useState } from "react";
import { useLocation } from "wouter";
import { userStorage } from "@/lib/user-storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Masukkan nama pengguna",
        variant: "destructive",
      });
      return;
    }

    // Check if user exists
    if (!userStorage.userExists(username)) {
      toast({
        title: "Akun Tidak Ditemukan",
        description: `"${username}" belum terdaftar. Silakan buat akun terlebih dahulu.`,
        variant: "destructive",
      });
      return;
    }

    // Login user
    if (userStorage.loginUser(username)) {
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
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="text-3xl font-display font-bold tracking-tight">
            RATIO
          </CardTitle>
          <p className="text-xs text-muted-foreground font-mono mt-2">
            Rational Finance Engine
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Nama Pengguna
              </label>
              <Input
                type="text"
                placeholder="Masukkan nama pengguna Anda"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full">
              Masuk
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border space-y-3">
            <p className="text-xs text-muted-foreground text-center">
              Belum punya akun?
            </p>
            <Button
              onClick={handleRegisterClick}
              variant="outline"
              className="w-full"
            >
              Buat Akun Baru
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
