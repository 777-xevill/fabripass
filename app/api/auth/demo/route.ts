import {getStore} from '../../../../db/store/client';
import {hashPassword,createSession} from '../../../auth';
import {json,fail,originCheck} from '../../lib';

const DEMO_EMAIL='demo@fabripass.app';
const DEMO_PASSWORD='FabriPass-Demo-2026';
const DEMO_NAME='Delta Fashions (demo)';

export const dynamic='force-dynamic';

export async function POST(req:Request){
  try{
    originCheck(req);
    const store=getStore();
    const now=new Date().toISOString();
    const created=await store
      .prepare('INSERT INTO users(id,email,password_hash,display_name,created_at) VALUES(?,?,?,?,?) ON CONFLICT(email) DO NOTHING RETURNING id')
      .bind(crypto.randomUUID(),DEMO_EMAIL,hashPassword(DEMO_PASSWORD),DEMO_NAME,now)
      .first<{id:string}>();
    const user=created||await store.prepare('SELECT id FROM users WHERE email=?').bind(DEMO_EMAIL).first<{id:string}>();
    if(!user)throw new Error('Demo account could not be prepared.');
    if(created){
      const day=86400000,at=(d:number)=>new Date(Date.now()-d*day).toISOString();
      await store.batch([
        ['Created LP-CT-2401 · Everyday cotton tee',3],
        ['Linked mill declaration to LP-DN-2402',2],
        ['Updated LP-PL-2403 supply chain: garment making stage',1],
      ].map(([message,d])=>store.prepare('INSERT INTO activity(id,owner,message,created_at,snapshot) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),user.id,message,at(d as number),'{}')));
    }
    await createSession(user.id);
    return json({user:{userId:user.id,email:DEMO_EMAIL,displayName:DEMO_NAME}});
  }catch(e){return fail(e)}
}
