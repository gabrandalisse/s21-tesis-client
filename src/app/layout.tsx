import type { Metadata } from 'next'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import '../styles/leaflet-fixes.css'

export const metadata: Metadata = {
  title: 'Pet Finder - Lost & Found Pets',
  description: 'Help reunite lost pets with their families',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}