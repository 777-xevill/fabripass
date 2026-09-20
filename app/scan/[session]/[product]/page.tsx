import {notFound} from 'next/navigation';
import {garments,parseSharedGarment,validSession} from '../../../sales/catalog';
import CheckIn from './check-in';
export const metadata={title:'Garment check-in | LoomPass',description:'View a sample garment record and confirm a demo checkpoint in its shared tracking history.'};
export default async function Page({params,searchParams}:{params:Promise<{session:string;product:string}>;searchParams:Promise<{p?:string}>}){const {session,product}=await params;const query=await searchParams;const garment=garments.find(item=>item.id===product)||parseSharedGarment(query.p,product);if(!validSession(session)||!garment)notFound();return <CheckIn session={session} product={garment}/>}
