"use client";
import React, { useActionState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { loginAction } from "@/actions/authActions";
import SubmitBtn from "@/components/common/SubmitBtn";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function Login() {
  const initialState = {
    message: "",
    status: 0,
    errors: {},
    data: {},
  };
  const [state, formAction] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state.status === 500) {
      toast.error(state.message);
    } else if (state.status === 200) {
      toast.success(state.message);
      if (state.data?.token) {
        window.localStorage.setItem("token", state.data.token as string);
      }
      signIn("credentials", {
        email: state.data?.email,
        password: state.data?.password,
        redirect: true,
        callbackUrl: "/dashboard",
      });
    }
  }, [state]);

  const handleGuestLogin = async () => {
    try {
      toast.loading("Logging in as guest...");

      const result = await signIn("credentials", {
        email: "guest@clash.com",
        password: "GuestPass@2025!",
        redirect: false,
      });

      if (result?.error) {
        toast.dismiss();
        toast.error("Guest login failed. Please try manual login or register.");
        console.error("Guest login error:", result.error);
      } else {
        toast.dismiss();
        toast.success("Logged in as guest successfully!");
        window.location.href = "/dashboard";
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Something went wrong with guest login");
      console.error("Guest login error:", error);
    }
  };

  const fillGuestCredentials = () => {
    const emailInput = document.querySelector(
      'input[name="email"]',
    ) as HTMLInputElement;
    const passwordInput = document.querySelector(
      'input[name="password"]',
    ) as HTMLInputElement;

    if (emailInput && passwordInput) {
      emailInput.value = "guest@clash.com";
      passwordInput.value = "GuestPass@2025!";
      toast.success("Guest credentials filled! Click Login to continue.");
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard", redirect: true });
  };

  return (
    <>
      <form action={formAction}>
        <div className="mt-4">
          <Label htmlFor="email">Email</Label>
          <Input placeholder="Type your email" name="email" />
          <span className="text-red-400">{state.errors?.email}</span>
        </div>
        <div className="mt-4">
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            placeholder="Type your password"
            name="password"
          />
          <div className="text-right font-bold">
            <Link href="/forgot-password">Forgot Password?</Link>
          </div>
          <span className="text-red-400">{state.errors?.password}</span>
        </div>
        <div className="mt-4">
          <SubmitBtn />
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#ecdccf]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-[#8a6d56]">
              Or continue with
            </span>
          </div>
        </div>
        <div className="mt-4 grid gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex items-center justify-center gap-3 border-[#ecdccf]"
            onClick={handleGoogleLogin}
          >
            <Image
              src="/images/google.png"
              alt="Google logo"
              width={18}
              height={18}
            />
            Sign in with Google
          </Button>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="border-[#ecdccf]"
              onClick={fillGuestCredentials}
            >
              Fill demo info
            </Button>
            <Button
              type="button"
              variant="default"
              className="bg-[#1f1b16] text-white hover:bg-[#2c2520]"
              onClick={handleGuestLogin}
            >
              Demo login
            </Button>
          </div>
          <div className="text-center text-xs text-[#8a6d56]">
            Demo: guest@clash.com | GuestPass@2025!
          </div>
        </div>
      </div>
    </>
  );
}
