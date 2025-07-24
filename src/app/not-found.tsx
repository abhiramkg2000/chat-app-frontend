"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { API_URL } from "@/constants/commonConstants";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/user/authentication`, {
          credentials: "include", // Sends the JWT cookie
        });
        const data = await res.json();

        if (!data?.authenticated) {
          router.push("/auth/login");
        } else {
          router.push("/chats");
        }
      } catch (err) {
        console.error("Error verifying auth:", err);
        router.push("/auth/login");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="not-found">
      <p>Oops requested page does not exist, redirecting...</p>
    </div>
  );
}
