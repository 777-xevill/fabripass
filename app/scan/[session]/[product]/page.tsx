import {notFound} from 'next/navigation';
import {garments,validSession} from '../../../sales/catalog';
import CheckIn from './check-in';
export const metadata={title:'Garment check-in | LoomPass',description:'View a sample garment record and confirm a demo checkpoint in its shared tracking history.'};
export default async function Page({params}:{params:Promise<{session:string;product:string}>}){const {session,product}=await params;if(!validSession(session)||!garments.some(p=>p.id===product))notFound();return <CheckIn session={session} productId={product}/>}
