import {db,bucket,identity,json,fail,HttpError,originCheck,limitedBody} from '../lib';
import type {Product} from '../../model';

export const dynamic='force-dynamic';

export async function POST(req:Request){
 try{
  originCheck(req);
  const user=await identity();
  const bytes=await limitedBody(req,6*1024*1024);
  const form=await new Response(bytes,{headers:{'Content-Type':req.headers.get('content-type')||''}}).formData();
  const file=form.get('file');
  const productId=String(form.get('productId')||'');
  if(!(file instanceof File)||!file.size)throw new HttpError(400,'Choose a JPG, PNG or WebP product image.');
  if(file.size>5*1024*1024)throw new HttpError(413,'Maximum product image size is 5 MB.');
  const store=db();
  const row=await store.prepare('SELECT payload FROM products WHERE id=? AND owner=?').bind(productId,user.userId).first<{payload:string}>();
  if(!row)throw new HttpError(404,'Product not found.');
  const content=new Uint8Array(await file.arrayBuffer());
  const isPng=content[0]===137&&content[1]===80&&content[2]===78&&content[3]===71;
  const isJpg=content[0]===255&&content[1]===216&&content[2]===255;
  const isWebp=new TextDecoder().decode(content.slice(0,4))==='RIFF'&&new TextDecoder().decode(content.slice(8,12))==='WEBP';
  const mime=isPng?'image/png':isJpg?'image/jpeg':isWebp?'image/webp':'';
  if(!mime||mime!==file.type)throw new HttpError(400,'Image contents must match a JPG, PNG or WebP file.');
  const imageId=crypto.randomUUID();
  const objectKey='public-product-images/'+imageId;
  const product=JSON.parse(row.payload) as Product;
  const previous=product.imageUrl?.match(/^\/api\/demo-image\/([0-9a-f-]{36})$/i)?.[1];
  const updated:Product={...product,imageUrl:'/api/demo-image/'+imageId,updatedAt:new Date().toISOString()};
  await bucket().put(objectKey,content,{httpMetadata:{contentType:mime}});
  try{
   await store.batch([
    store.prepare('UPDATE products SET payload=?,updated_at=? WHERE id=? AND owner=?').bind(JSON.stringify(updated),updated.updatedAt,productId,user.userId),
    store.prepare('INSERT INTO activity(id,owner,message,created_at,snapshot) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),user.userId,'Updated public demo photo for '+product.sku,updated.updatedAt,JSON.stringify({productId,imageUrl:updated.imageUrl}))
   ]);
  }catch(error){await bucket().delete(objectKey);throw error}
  if(previous)await bucket().delete('public-product-images/'+previous).catch(()=>{});
  return json({product:updated});
 }catch(error){return fail(error)}
}
