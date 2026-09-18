import {z} from 'zod';
import {db,identity,json,fail,HttpError,originCheck,jsonBody} from '../lib';
import {stageNames,type Product,type Evidence} from '../../model';
const str=(n=160)=>z.string().trim().max(n);
const schema=z.object({id:str(200),name:str().min(1),sku:str(80).min(1),batch:str(80),category:z.enum(['Knitwear','Woven','Denim','Outerwear','Other']),buyer:str(),facility:str(),country:str(80),quantity:z.number().int().min(0).max(100000000),materials:z.array(z.object({name:str(80).min(1),percent:z.number().positive().max(100)})).min(1).max(12),stages:z.array(z.object({stage:str(80),supplier:str(),country:str(80)})).length(4),care:str(2000),circularity:str(2000),notes:str(2000),version:z.number().int().min(0)});
export const dynamic='force-dynamic';
export async function POST(req:Request){try{originCheck(req);const user=await identity();const parsed=schema.safeParse(await jsonBody(req));if(!parsed.success)throw new HttpError(400,'Check the product name, style code, quantities and material percentages.');const input=parsed.data;
 if(Math.abs(input.materials.reduce((s,m)=>s+m.percent,0)-100)>=0.01)throw new HttpError(400,'Material composition must total 100%.');
 if(!input.stages.every((s,i)=>s.stage===stageNames[i]))throw new HttpError(400,'Supply chain stages are invalid.');
 const store=db();const old=input.id?await store.prepare('SELECT payload,version FROM products WHERE id=? AND owner=?').bind(input.id,user.userId).first<{payload:string;version:number}>():null;
 if(input.id&&!old)throw new HttpError(404,'Product not found.');if(old&&old.version!==input.version)throw new HttpError(409,'This product has changed. Close the form, reload the page and apply your edits to the latest revision.');
 const duplicate=await store.prepare('SELECT id FROM products WHERE owner=? AND sku=? AND batch=? AND id<>?').bind(user.userId,input.sku,input.batch,input.id).first();if(duplicate)throw new HttpError(409,'This style code and batch already have a product record.');
 if(!old){const n=await store.prepare('SELECT COUNT(*) AS n FROM products WHERE owner=?').bind(user.userId).first<{n:number}>();if((n?.n||0)>=300)throw new HttpError(400,'The pilot workspace supports 300 product records.');}
 const now=new Date().toISOString(),id=input.id||crypto.randomUUID();const product:Product={...input,id,version:(old?.version||0)+1,sample:old?JSON.parse(old.payload).sample:false,updatedAt:now};
 if(old){const result=await store.batch([
 store.prepare('INSERT INTO activity(id,owner,message,created_at,snapshot) SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM products WHERE id=? AND owner=? AND version=?)').bind(crypto.randomUUID(),user.userId,'Updated '+product.sku+' to revision '+product.version+'; linked reviews reset',now,JSON.stringify(product),id,user.userId,input.version),
 store.prepare('UPDATE products SET sku=?,batch=?,payload=?,version=?,updated_at=? WHERE id=? AND owner=? AND version=?').bind(product.sku,product.batch,JSON.stringify(product),product.version,now,id,user.userId,input.version)
 ]);if(!result[1].meta.changes)throw new HttpError(409,'This record was changed elsewhere. Reload before saving.');
 // Every edit conservatively invalidates review status. Revision binding also prevents stale review races.
 const docs=await store.prepare('SELECT id,payload FROM evidence WHERE owner=? AND product_id=?').bind(user.userId,id).all<{id:string;payload:string}>();if(docs.results.length)await store.batch(docs.results.map(r=>store.prepare('UPDATE evidence SET payload=? WHERE id=? AND owner=?').bind(JSON.stringify({...JSON.parse(r.payload),status:'pending',reviewer:undefined,reviewedVersion:undefined}),r.id,user.userId)));
 }else{await store.batch([store.prepare('INSERT INTO products(id,owner,sku,batch,payload,version,updated_at) VALUES(?,?,?,?,?,?,?)').bind(id,user.userId,product.sku,product.batch,JSON.stringify(product),1,now),store.prepare('INSERT INTO activity(id,owner,message,created_at,snapshot) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),user.userId,'Created '+product.sku,now,JSON.stringify(product))])}
 return json({product},old?200:201);
 }catch(e){return fail(e)}}
