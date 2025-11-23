"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function useLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        alert("Login gagal");

        return;
      }

      //alert("Login sukses");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Terjadi masalah jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
