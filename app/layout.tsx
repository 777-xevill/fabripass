import type { Metadata } from 'next';
import './globals.css';
import './mono.css';
import './sales/sales.css';
export const metadata: Metadata = { title:'FabriPass | Garment passport workspace', description:'Traceability, evidence and Digital Product Passport readiness for garment exporters.', icons:{icon:'/brand/fabripass-logo.png',shortcut:'/brand/fabripass-logo.png'} };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
