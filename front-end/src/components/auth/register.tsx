"use client";
import React, { useActionState, useEffect } from "react";

import { registerAction } from "@/actions/authActions";
import SubmitBtn from "@/components/common/SubmitBtn";
import { Input } from "@/components/ui/input";
// import { useFormState } from 'react-dom';
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Image from "next/image";
const Register = () => {
  const initalState = {
    status: 0,
    message: "",
    errors: {},
  };
  const [state, formAction] = useActionState(registerAction, initalState);

  useEffect(() => {
    if (state.status === 500) {
      toast.error(state.message);
    } else if (state.status === 422) {
      toast.error(state.message);
    } else if (state.status === 200) {
      toast.success(state.message);
    }
  }, [state]);

  const handleGoogleSignup = () => {
    signIn("google", { callbackUrl: "/dashboard", redirect: true });
  };

  return (
    <div>
      <form action={formAction}>
        <div className="mt-4">
          <Label htmlFor="Name">Name</Label>
          <Input
            id="Name"
            name="name"
            placeholder="Enter Your name"
            type="text"
          />
          <span className="text-red-500">{state.errors?.name}</span>
        </div>
        <div className="mt-4">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            placeholder="Enter Your Email"
            type="email"
          />
          <span className="text-red-500">{state.errors?.email}</span>
        </div>
        <div className="mt-4">
          <Label htmlFor="Password">Password</Label>
          <Input
            id="Password"
            name="password"
            placeholder="Enter Your Password"
            type="password"
          />
          <span className="text-red-500">{state.errors?.password}</span>
        </div>
        <div className="mt-4">
          <Label htmlFor="ConfirmPassword">ConfirmPassword</Label>
          <Input
            id="ConfirmPassword"
            name="confirmpassword"
            placeholder="Confirm  Your Password"
            type="password"
          />
          <span className="text-red-500">{state.errors?.confirm_password}</span>
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
        <Button
          type="button"
          variant="outline"
          className="mt-4 flex w-full items-center justify-center gap-3 border-[#ecdccf]"
          onClick={handleGoogleSignup}
        >
          <Image
            src="/images/google.png"
            alt="Google logo"
            width={18}
            height={18}
          />
          Sign up with Google
        </Button>
      </div>
    </div>
  );
};

export default Register;
