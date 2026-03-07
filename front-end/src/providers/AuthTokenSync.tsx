"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";

const AuthTokenSync = () => {
  const { data } = useSession();

  useEffect(() => {
    const token = data?.user?.token;
    if (token) {
      window.localStorage.setItem("token", token);
      return;
    }

    if (!data?.user) {
      window.localStorage.removeItem("token");
    }
  }, [data?.user, data?.user?.token]);

  return null;
};

export default AuthTokenSync;
