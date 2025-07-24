"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import NavBar from "@/components/navbar/navBar";
import ChatWindow from "@/modules/chatWindow/chatWindow";
import AuthenticationCheckText from "@/components/authenticationCheckText/authenticationCheckText";

import { useAppSelector } from "@/hooks/storeHooks";

import { API_URL } from "@/constants/commonConstants";

export default function Chats() {
  const currentUser = useAppSelector((state) => state.user);

  const [loading, setLoading] = useState(true);

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
          setLoading(false);
        }
      } catch (err) {
        console.error("Error verifying auth:", err);
        router.push("/auth/login");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <>
      {loading &&
      currentUser.name &&
      currentUser.roomId &&
      currentUser.clientId ? (
        <AuthenticationCheckText />
      ) : (
        <>
          <NavBar />
          <ChatWindow />
        </>
      )}
    </>
  );
}
