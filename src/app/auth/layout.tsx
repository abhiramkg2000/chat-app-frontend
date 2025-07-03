"use client";

import { useRouter, usePathname } from "next/navigation";
import { ReactNode } from "react";

import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";

export default function Auth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = pathname.includes("login") ? "login" : "register";

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    if (newValue === "register") {
      router.push("/auth/register");
    } else if (newValue === "login") {
      router.push("/auth/login");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <TabContext value={activeTab}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            margin: "10px",
          }}
        >
          <TabList
            onChange={handleChange}
            aria-label="lab API tabs example"
            centered
          >
            <Tab label="Register" value="register" />
            <Tab label="Login" value="login" />
          </TabList>
        </Box>
        {children}
      </TabContext>
    </Box>
  );
}
