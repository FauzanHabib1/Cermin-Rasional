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

    userStorage.setUser(username);
    toast({
      title: "Login Berhasil",
      description: `Selamat datang, ${username}!`,
    });
    setLocation("/");
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
                placeholder="Contoh: Habib, Fatimah, Ahmad"
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
          <p className="text-xs text-muted-foreground text-center mt-4">
            Masukkan nama untuk mulai menganalisis keuangan Anda
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
