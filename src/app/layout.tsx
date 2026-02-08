import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HamburgerMenu from "@/lib/components/navigation/HamburgerMenu";
import ThemeToggle from "@/lib/components/theme/ThemeToggle";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChatApp",
  description: "会話するためのアプリ",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  
  // トークンエラーを処理
  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error) {
      user = data.user;
    } else {
      // リフレッシュトークンエラーの場合は無視してログアウト状態として扱う
      console.log("Auth error (user treated as logged out):", error.message);
    }
  } catch (error) {
    // 予期しないエラーも無視
    console.log("Unexpected auth error:", error);
  }

  let userProfile = null;
  if (user) {
    const { data: profile, error } = await supabase
      .from("profile")
      .select("nickname, avatar_url")
      .eq("id", user.id)
      .single();
    
    if (error) {
      console.error("Profile fetch error:", error);
    } else {
      userProfile = {
        nickname: profile.nickname,
        avatar_url: profile.avatar_url
      };
    }
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeToggle />
        <HamburgerMenu 
          nickname={userProfile?.nickname || null}
          avatarUrl={userProfile?.avatar_url || null}
          isLoggedIn={!!user}
        />
        {children}
      </body>
    </html>
  );
}
