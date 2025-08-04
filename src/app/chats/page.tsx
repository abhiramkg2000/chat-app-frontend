"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import NavBar from "@/components/navbar/navBar";
import ChatWindow from "@/modules/chatWindow/chatWindow";
import AuthenticationCheckText from "@/components/authenticationCheckText/authenticationCheckText";

import { getSocket } from "@/hooks/socketClient";
import { useAppSelector, useAppDispatch } from "@/hooks/storeHooks";
import {
  setUserName,
  setCurrentRoomId,
  setUserClientId,
} from "@/store/users/usersSlice";

import { API_URL } from "@/constants/commonConstants";

import { UserSliceType } from "@/types/commonTypes";

export default function Chats() {
  const currentUser = useAppSelector((state) => state.user);

  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const dispatch = useAppDispatch();

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

  useEffect(() => {
    // Connect to the NestJS WebSocket gateway
    const socket = getSocket();

    // Socket connection
    socket.on("connect", () => {
      // console.log("in chats Connected, joining room");

      // Emit joinroom here too (same as in chatWindow)
      socket.emit("joinroom");
    });

    // User Info
    socket.on("user:info", (userInfo: UserSliceType) => {
      // console.log("fetched user Info", userInfo);

      dispatch(setUserName({ name: userInfo.name }));
      dispatch(setCurrentRoomId({ roomId: userInfo.roomId }));
      dispatch(setUserClientId({ clientId: userInfo.clientId }));

      socket.off("user:info");
    });

    return () => {
      socket.off("connect");
    };
  }, [dispatch]);

  return (
    <>
      {!loading &&
      currentUser.name &&
      currentUser.roomId &&
      currentUser.clientId ? (
        <>
          <NavBar />
          <ChatWindow />
        </>
      ) : (
        <AuthenticationCheckText />
      )}
    </>
  );
}
