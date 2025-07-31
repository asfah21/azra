"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Alert,
  Divider,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "@heroui/react";
import {
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

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
        setError(result.error);
      } else if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } catch (err) {
      /* eslint-disable no-console */
      console.error("Login error:", err);
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Tampilkan loading jika sedang mengecek session
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-small text-default-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-gray-950 p-4 sm:p-6">
      <Card className="w-full max-w-md shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden border border-opacity-10 border-white dark:border-gray-700 backdrop-blur-sm bg-white/90 dark:bg-gray-900/30">
        <CardHeader className="flex flex-col gap-3 p-6 sm:p-8 pb-0">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <svg
                className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
          </div>
          <div className="flex flex-col text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Please enter your credentials to access your account
            </p>
          </div>
        </CardHeader>

        <Divider className="my-2 sm:my-3 opacity-40" />

        <CardBody className="flex flex-col gap-3 sm:gap-4 px-4 sm:px-8 py-2 sm:py-6">
          {error && (
            <Alert
              className="mb-3 sm:mb-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 py-2"
              startContent={
                <ExclamationCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
              }
            >
              <span className="text-sm text-red-700 dark:text-red-300">
                {error}
              </span>
            </Alert>
          )}

          <form
            className="flex flex-col gap-3 sm:gap-5"
            onSubmit={handleSubmit}
          >
            <div className="space-y-1">
              <label
                className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
                htmlFor="email"
              >
                Email
              </label>
              <Input
                isRequired
                className="w-full"
                classNames={{
                  input: "text-sm sm:text-base text-gray-800 dark:text-white",
                  inputWrapper:
                    "h-10 sm:h-12 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400",
                }}
                isDisabled={loading}
                placeholder="you@gmail.com"
                radius="sm"
                size="sm"
                type="email"
                value={email}
                variant="bordered"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label
                  className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
                  htmlFor="password"
                >
                  Password
                </label>
                <a
                  className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                  href="/forgot-password"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                isRequired
                className="w-full"
                classNames={{
                  input: "text-sm sm:text-base text-gray-800 dark:text-white",
                  inputWrapper:
                    "h-10 sm:h-12 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400",
                }}
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleVisibility}
                  >
                    {isVisible ? (
                      <EyeSlashIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    )}
                  </button>
                }
                isDisabled={loading}
                placeholder="••••••••"
                radius="sm"
                size="sm"
                type={isVisible ? "text" : "password"}
                value={password}
                variant="bordered"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
              />
            </div>

            <Button
              className="w-full mt-1 h-10 sm:h-12 font-medium tracking-wide"
              color="primary"
              disabled={loading || !email || !password}
              isLoading={loading}
              radius="sm"
              size="md"
              style={{
                background:
                  "linear-gradient(135deg,rgb(58, 180, 58),rgb(35, 38, 223))",
              }}
              type="submit"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardBody>

        <CardFooter className="mt-2 flex justify-center py-3 sm:py-6 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl sm:rounded-b-2xl">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
            2025 © Copyright by PT Gunung Samudera Internasional
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
