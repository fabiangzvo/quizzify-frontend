import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";

import { AuthProvider } from "@context/AuthContext";

import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ThemeProvider>
  );
}
