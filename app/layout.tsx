export const metadata = {
  title: 'IELTS Material Hub',
  description: 'Practice IELTS with AI feedback',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
