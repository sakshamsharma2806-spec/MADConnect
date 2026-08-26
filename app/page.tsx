"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);
  return null;
}
