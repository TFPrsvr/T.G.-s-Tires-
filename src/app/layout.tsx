import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  themeColor: "#64748b",
  width: "device-width",
  initialScale: 1,
};
export const metadata: Metadata = {
  title: "T.G.'s Tires - Professional Tire Marketplace",
  description: "Find quality used tires with professional mounting services and secure payments. Browse yard sale items and shop with confidence.",
  keywords: "tires, used tires, tire mounting, rim service, tire marketplace, yard sale",
  authors: [{ name: "T.G.'s Tires" }],
  creator: "T.G.'s Tires",
  publisher: "T.G.'s Tires",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "T.G.'s Tires",
    startupImage: "/icons/icon-512x512.png",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "T.G.'s Tires - Professional Tire Marketplace",
    description: "Find quality used tires with professional mounting services and secure payments.",
    siteName: "T.G.'s Tires",
  },
  twitter: {
    card: "summary_large_image",
    title: "T.G.'s Tires - Professional Tire Marketplace",
    description: "Find quality used tires with professional mounting services and secure payments.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#64748b",
          colorText: "#1f2937",
          colorTextOnPrimaryBackground: "#ffffff",
          colorBackground: "#ffffff",
          colorInputBackground: "#ffffff",
          colorInputText: "#1f2937",
          borderRadius: "0.75rem",
        },
        elements: {
          formButtonPrimary: {
            background: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
            borderRadius: "0.75rem",
            border: "none",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            "&:hover": {
              background: "linear-gradient(135deg, #475569 0%, #334155 100%)",
              transform: "translateY(-1px)",
              boxShadow: "0 8px 15px -3px rgb(0 0 0 / 0.1)",
            },
          },
          card: {
            borderRadius: "1rem",
            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
            border: "1px solid #e5e7eb",
          },
          headerTitle: {
            fontWeight: "600",
            color: "#1f2937",
          },
          headerSubtitle: {
            color: "#6b7280",
          },
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "hsl(var(--background))",
                  color: "hsl(var(--foreground))",
                  border: "1px solid hsl(var(--border))",
                },
              }}
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}