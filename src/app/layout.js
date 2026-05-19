import './globals.css';

export const metadata = {
  title: 'Prowider — Lead Distribution System',
  description: 'Mini lead generation and distribution platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
