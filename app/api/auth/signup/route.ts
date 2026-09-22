import {z} from 'zod';
import {getStore} from '../../../../db/store/client';
import {hashPassword,createSession} from '../../../auth';
import {json,fail,HttpError,originCheck,jsonBody} from '../../lib';

const schema=z.object({
  email:z.string().trim().toLowerCase().email().max(200),
  password:z.string().min(8).max(200),
  displayName:z.string().trim().min(1).max(120),
});

export const dynamic='force-dynamic';

export async function POST(req:Request){
  try{
    originCheck(req);
    const parsed=schema.safeParse(await jsonBody(req));
    if(!parsed.success)throw new HttpError(400,'Enter a valid email, display name and a password of at least 8 characters.');
    const {email,password,displayName}=parsed.data;
    const store=getStore();
    const existing=await store.prepare('SELECT id FROM users WHERE email=?').bind(email).first();
    if(existing)throw new HttpError(409,'An account with this email already exists.');
    const id=crypto.randomUUID();
    const now=new Date().toISOString();
    await store
      .prepare('INSERT INTO users(id,email,password_hash,display_name,created_at) VALUES(?,?,?,?,?)')
      .bind(id,email,hashPassword(password),displayName,now)
      .first();
    await createSession(id);
    return json({user:{userId:id,email,displayName}},201);
  }catch(e){return fail(e)}
}
