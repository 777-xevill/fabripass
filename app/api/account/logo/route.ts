import {db,bucket,identity,json,fail,HttpError,originCheck,limitedBody} from '../../lib';

export const dynamic='force-dynamic';

export async function GET(){
  try{
    const user=await identity();
    const row=await db().prepare('SELECT logo_key FROM users WHERE id=?').bind(user.userId).first<{logo_key:string|null}>();
    if(!row?.logo_key)throw new HttpError(404,'No logo set.');
    const file=await bucket().get(row.logo_key);
    if(!file)throw new HttpError(404,'No logo set.');
    return new Response(file.body,{headers:{'Content-Type':file.httpMetadata?.contentType||'image/png','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
  }catch(e){return fail(e)}
}

export async function POST(req:Request){
  try{
    originCheck(req);
    const user=await identity();
    const bytes=await limitedBody(req,6*1024*1024);
    const form=await new Response(bytes,{headers:{'Content-Type':req.headers.get('content-type')||''}}).formData();
    const file=form.get('file');
    if(!(file instanceof File)||!file.size)throw new HttpError(400,'Choose a JPG, PNG or WebP logo image.');
    if(file.size>5*1024*1024)throw new HttpError(413,'Maximum logo size is 5 MB.');
    const content=new Uint8Array(await file.arrayBuffer());
    const isPng=content[0]===137&&content[1]===80&&content[2]===78&&content[3]===71;
    const isJpg=content[0]===255&&content[1]===216&&content[2]===255;
    const isWebp=new TextDecoder().decode(content.slice(0,4))==='RIFF'&&new TextDecoder().decode(content.slice(8,12))==='WEBP';
    const mime=isPng?'image/png':isJpg?'image/jpeg':isWebp?'image/webp':'';
    if(!mime||mime!==file.type)throw new HttpError(400,'Image contents must match a JPG, PNG or WebP file.');
    const key='account-logo/'+user.userId;
    await bucket().put(key,content,{httpMetadata:{contentType:mime}});
    await db().prepare('UPDATE users SET logo_key=? WHERE id=?').bind(key,user.userId).run();
    return json({logoUrl:'/api/account/logo'});
  }catch(e){return fail(e)}
}
