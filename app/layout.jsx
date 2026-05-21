import "./globals.css";

export const metadata = {
  title: "CaptionAI",
  description: "Modern open-source image captioning with REST API endpoints.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
