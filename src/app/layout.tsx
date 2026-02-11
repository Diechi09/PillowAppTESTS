import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Pillow",
  description: "Rental matchmaking app"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <div className="nav-wrap">
            <Link href="/" style={{ fontWeight: 800, letterSpacing: 0.6 }}>
              PILLOW
            </Link>
            <div className="row">
              <Link href="/onboarding">Onboarding</Link>
              <Link href="/discover">Discover</Link>
              <Link href="/chat">Chat</Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}

