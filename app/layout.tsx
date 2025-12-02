import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "پردیس گستر چینود",
  description: "پنل مدیریت پردیس گستر چینود",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-vazir">
        {children}
      </body>
    </html>
  );
}
