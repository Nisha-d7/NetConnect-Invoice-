import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "NetConnect ISP Invoice Portal",
  description: "Manage your internet service bills with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="NetConnect ISP Logo" width={40} height={40} />
            <span className="font-bold text-blue-700 text-lg">NetConnect ISP</span>
          </div>
          <nav className="flex gap-6 items-center">
            <Link href="/" className="text-gray-700 hover:text-blue-700">About</Link>
            <Link href="/" className="text-gray-700 hover:text-blue-700">Services</Link>
            <Link href="/" className="text-gray-700 hover:text-blue-700">Support</Link>
            <Link href="/customer/dispute" className="text-gray-700 hover:text-blue-700">Contact</Link>
            {/* <Link href="/login" className="ml-4 bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700">Login</Link> */}
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-gray-900 text-white mt-8 pt-10 pb-4 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-6 border-b border-gray-700">
            {/* NetConnect ISP */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Image src="/logo.png" alt="NetConnect ISP Logo" width={28} height={28} />
                <span className="font-bold text-lg">NetConnect ISP</span>
              </div>
              <p className="text-gray-300 text-sm">Providing reliable internet services and transparent billing solutions.</p>
            </div>
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-2">Quick Links</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/">About Us</Link></li>
                <li><Link href="/">Services</Link></li>
                <li><Link href="/">Contact</Link></li>
              </ul>
            </div>
            {/* Support */}
            <div>
              <h4 className="font-semibold mb-2">Support</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li><Link href="/">Help Center</Link></li>
                <li><Link href="/">FAQ</Link></li>
                <li><Link href="/">Customer Support</Link></li>
                <li><Link href="/">Report an Issue</Link></li>
              </ul>
            </div>
            {/* Contact Us */}
            <div>
              <h4 className="font-semibold mb-2">Contact Us</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li><span className="inline-block mr-2">📞</span>+1 (555) 123-4567</li>
                <li><span className="inline-block mr-2">✉️</span>support@netconnectisp.com</li>
                <li><span className="inline-block mr-2">📍</span>123 Internet Ave, Server City, 10101</li>
              </ul>
            </div>
          </div>
          <div className="text-center text-gray-400 text-xs mt-4">&copy; 2023 NetConnect ISP. All rights reserved.</div>
        </footer>
      </body>
    </html>
  );
}