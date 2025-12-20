import { useState } from "react";
import { useLocation } from "wouter";
import { userStorage } from "@/lib/user-storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Masukkan username dan password",
        variant: "destructive",
      });
      return;
    }

    if (username.length < 3) {
      toast({
        title: "Error",
        description: "Username minimal 3 karakter",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password minimal 6 karakter",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Password dan konfirmasi tidak cocok",
        variant: "destructive",
      });
      return;
    }

    // Register user
    if (userStorage.registerUser(username, password)) {
      // Auto login after register
      userStorage.setUser(username);
      toast({
        title: "Pendaftaran Berhasil",
        description: `Selamat datang, ${username}!`,
      });
      setLocation("/");
    } else {
      toast({
        title: "Error",
        description: `"${username}" sudah terdaftar. Gunakan username lain.`,
        variant: "destructive",
      });
    }
  };

  const handleBackClick = () => {
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="text-3xl font-display font-bold tracking-tight">
            RATIO
          </CardTitle>
          <p className="text-xs text-muted-foreground font-mono mt-2">
            Buat Akun Baru
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Username
              </label>
              <Input
                type="text"
                placeholder="Minimal 3 karakter"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2"
                autoFocus
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Password
              </label>
              <Input
                type="password"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Konfirmasi Password
              </label>
              <Input
                type="password"
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2"
              />
            </div>

            <Button type="submit" className="w-full">
              Daftar Akun
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border space-y-3">
            <p className="text-xs text-muted-foreground text-center">
              Sudah punya akun?
            </p>
            <Button
              onClick={handleBackClick}
              variant="outline"
              className="w-full"
            >
              Kembali ke Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
