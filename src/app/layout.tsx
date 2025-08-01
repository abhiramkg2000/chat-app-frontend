import type { Metadata } from "next";

import StoreProvider from "@/store/storeProvider";

import ChatDotsIcon from "../assets/images/chat-dots.svg";

import "./globals.scss";

export const metadata: Metadata = {
  title: "chat_app",
  description: "chat_app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href={ChatDotsIcon.src} />
      </head>
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
