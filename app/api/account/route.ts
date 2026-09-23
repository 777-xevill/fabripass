import {z} from 'zod';
import {db,identity,json,fail,HttpError,originCheck,jsonBody} from '../lib';

export const dynamic='force-dynamic';

export async function GET(){
  try{
    const user=await identity();
    const row=await db().prepare('SELECT company_name,logo_key FROM users WHERE id=?').bind(user.userId).first<{company_name:string|null;logo_key:string|null}>();
    return json({
      displayName:user.displayName,
      companyName:row?.company_name||null,
      logoUrl:row?.logo_key?'/api/account/logo':null,
    });
  }catch(e){return fail(e)}
}

const schema=z.object({companyName:z.string().trim().max(150)});

export async function POST(req:Request){
  try{
    originCheck(req);
    const user=await identity();
    const parsed=schema.safeParse(await jsonBody(req));
    if(!parsed.success)throw new HttpError(400,'Enter a company name up to 150 characters.');
    await db().prepare('UPDATE users SET company_name=? WHERE id=?').bind(parsed.data.companyName||null,user.userId).run();
    return json({companyName:parsed.data.companyName||null});
  }catch(e){return fail(e)}
}
