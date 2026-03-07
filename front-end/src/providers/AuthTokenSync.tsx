"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";

const AuthTokenSync = () => {
  const { data, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    const token = data?.user?.token;
    if (token) {
      window.localStorage.setItem("token", token);
      return;
    }

    if (status === "unauthenticated") {
      window.localStorage.removeItem("token");
    }
  }, [data?.user, data?.user?.token, status]);

  return null;
};

export default AuthTokenSync;
