import {db,identity,json,fail,HttpError} from '../../lib';
import {passportData} from '../../../model';
export const dynamic='force-dynamic';
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){try{const user=await identity();const {id}=await params;const row=await db().prepare('SELECT payload FROM products WHERE id=? AND owner=?').bind(id,user.userId).first<{payload:string}>();if(!row)throw new HttpError(404,'Passport not found in your workspace.');return json(passportData(JSON.parse(row.payload)))}catch(e){return fail(e)}}
