import type { Metadata } from 'next';
import './globals.css';
import './mono.css';
import './sales/sales.css';
export const metadata: Metadata = { title:'LoomPass | Garment passport workspace', description:'Traceability, evidence and Digital Product Passport readiness for garment exporters.', icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'} };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
