"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Alert } from "@heroui/alert";
import { Divider } from "@heroui/divider";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

import { LoginSpinner } from "@/components/ui/skeleton";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect jika sudah login
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Handle specific error messages
        if (result.error.includes("Database connection error")) {
          setError("Database connection error. Please check your database configuration.");
        } else if (result.error.includes("timeout")) {
          setError("Connection timeout. Please try again.");
        } else if (result.error.includes("No user found")) {
          setError("Email tidak ditemukan. Silakan cek kembali.");
        } else if (result.error.includes("Invalid password")) {
          setError("Password salah. Silakan cek kembali.");
        } else if (result.error.includes("Please enter email and password")) {
          setError("Silakan masukkan email dan password.");
        } else {
          setError(result.error);
        }
      } else if (result?.ok) {
        router.push("/dashboard");
      } else {
        setError("Terjadi kesalahan tak terduga. Silakan coba lagi.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Terjadi kesalahan saat login. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Tampilkan loading hanya jika sedang mengecek session, bukan jika sudah authenticated
  if (status === "loading") {
    return <LoginSpinner />;
  }

  // Redirect otomatis jika sudah authenticated
  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-black p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-col gap-3 text-center">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">Login</h1>
            <p className="text-sm text-gray-500">
              Sign in to your account to continue
            </p>
          </div>
        </CardHeader>

        <Divider className="my-2" />

        <CardBody className="flex flex-col gap-4">
          {error && (
            <Alert className="mb-4" color="danger" variant="faded">
              {error}
            </Alert>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              isRequired
              className="w-full"
              isDisabled={loading}
              label="Email"
              placeholder="Enter your email"
              type="email"
              value={email}
              variant="bordered"
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              isRequired
              className="w-full"
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibility}
                >
                  {isVisible ? (
                    <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              }
              isDisabled={loading}
              label="Password"
              placeholder="Enter your password"
              type={isVisible ? "text" : "password"}
              value={password}
              variant="bordered"
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              className="w-full mt-2"
              color="primary"
              disabled={loading || !email || !password}
              isLoading={loading}
              size="lg"
              type="submit"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardBody>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <a
              className="text-blue-600 hover:underline font-medium"
              href="/register"
            >
              Sign up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
