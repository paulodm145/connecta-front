"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

const withAuth = (WrappedComponent: React.FC) => {
  return (props: any) => {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!user) {
        router.push("/login");
      }
    }, [user, router]);

    if (!user) {
      return <p>Carregando...</p>;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
