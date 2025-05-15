import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import { AuthProvider } from "@/context/auth-context"
// import { Toaster } from "@/components/ui/toaster"
import { Toaster } from "sonner"
import {Footer} from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
              <Footer/>
            <Toaster richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
