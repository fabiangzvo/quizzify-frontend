import { useEffect } from "react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { HeroUIProvider } from "@heroui/react";

import { AuthProvider } from "@context/AuthContext";
import { UserProvider } from "@context/UserContext";

import "@/styles/globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <div className={poppins.className}>
      <HeroUIProvider navigate={router.push}>
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem>
          <UserProvider>
            <AuthProvider>
              <Component {...pageProps} />
            </AuthProvider>
          </UserProvider>
        </ThemeProvider>
      </HeroUIProvider>
    </div>
  );
}
