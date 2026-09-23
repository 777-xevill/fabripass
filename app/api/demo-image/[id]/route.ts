import {bucket,HttpError,fail} from '../../lib';

export const dynamic='force-dynamic';

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 try{
  const {id}=await params;
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))throw new HttpError(404,'Image not found.');
  const file=await bucket().get('public-product-images/'+id);
  if(!file)throw new HttpError(404,'Image not found.');
  return new Response(file.body,{headers:{'Content-Type':file.httpMetadata?.contentType||'image/jpeg','Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}});
 }catch(error){return fail(error)}
}
