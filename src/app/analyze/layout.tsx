import { SessionProvider } from "next-auth/react";

export default function AnalyzeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
