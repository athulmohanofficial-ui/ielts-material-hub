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
      <head>
        <link 
          href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" 
          rel="stylesheet"
        />
      </head>
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
