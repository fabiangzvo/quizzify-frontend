import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";

import { AuthProvider } from "@context/AuthContext";
import { UserProvider } from "@context/UserContext";

import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <UserProvider>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
