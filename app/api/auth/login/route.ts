import {z} from 'zod';
import {getStore} from '../../../../db/store/client';
import {verifyPassword,createSession} from '../../../auth';
import {json,fail,HttpError,originCheck,jsonBody} from '../../lib';

const schema=z.object({
  email:z.string().trim().toLowerCase().email().max(200),
  password:z.string().min(1).max(200),
});

export const dynamic='force-dynamic';

export async function POST(req:Request){
  try{
    originCheck(req);
    const parsed=schema.safeParse(await jsonBody(req));
    if(!parsed.success)throw new HttpError(400,'Enter your email and password.');
    const {email,password}=parsed.data;
    const store=getStore();
    const row=await store
      .prepare('SELECT id,password_hash,display_name FROM users WHERE email=?')
      .bind(email)
      .first<{id:string;password_hash:string;display_name:string}>();
    if(!row||!verifyPassword(password,row.password_hash))throw new HttpError(401,'Incorrect email or password.');
    await createSession(row.id);
    return json({user:{userId:row.id,email,displayName:row.display_name}});
  }catch(e){return fail(e)}
}
