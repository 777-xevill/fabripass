import {db,identity,json,fail} from '../lib';
import {sampleProducts,sampleEvidence} from '../../model';
export const dynamic='force-dynamic';
export async function GET(){try{const user=await identity();const store=db();const owner=user.userId;
 const exists=await store.prepare('SELECT owner FROM workspaces WHERE owner=?').bind(owner).first();
 if(!exists){const now=new Date().toISOString();await store.batch([
  store.prepare('INSERT INTO workspaces(owner,created_at) VALUES(?,?) ON CONFLICT DO NOTHING').bind(owner,now),
  ...sampleProducts.map(p=>store.prepare('INSERT INTO products(id,owner,sku,batch,payload,version,updated_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT DO NOTHING').bind(owner+':'+p.id,owner,p.sku,p.batch,JSON.stringify({...p,id:owner+':'+p.id}),1,now)),
  ...sampleEvidence.map(e=>store.prepare('INSERT INTO evidence(id,owner,product_id,payload,object_key) VALUES(?,?,?,?,?) ON CONFLICT DO NOTHING').bind(owner+':'+e.id,owner,owner+':'+e.productId,JSON.stringify({...e,id:owner+':'+e.id,productId:owner+':'+e.productId}),null))
 ])}
 const [p,e,a]=await Promise.all([store.prepare('SELECT payload FROM products WHERE owner=? ORDER BY updated_at DESC').bind(owner).all<{payload:string}>(),store.prepare('SELECT payload FROM evidence WHERE owner=? ORDER BY seq DESC').bind(owner).all<{payload:string}>(),store.prepare('SELECT id,message,created_at AS "createdAt" FROM activity WHERE owner=? ORDER BY seq DESC LIMIT 30').bind(owner).all()]);
 return json({products:p.results.map(r=>JSON.parse(r.payload)),evidence:e.results.map(r=>JSON.parse(r.payload)),activity:a.results});
 }catch(e){return fail(e)}}
