import {db,identity,json,fail} from '../lib';
import type {Product} from '../../model';
import type {DemoGarment} from '../../sales/catalog';

export const dynamic='force-dynamic';

export async function GET(){
 try{
  const user=await identity();
  const rows=await db().prepare('SELECT payload FROM products WHERE owner=? ORDER BY updated_at DESC').bind(user.userId).all<{payload:string}>();
  const products=rows.results.map(row=>JSON.parse(row.payload) as Product).filter(product=>!product.sample).map((product):DemoGarment=>({
   id:'WSP-'+product.id,
   name:product.name,
   category:product.category.toUpperCase(),
   batch:product.batch||'Not recorded',
   composition:product.materials.map(material=>`${material.percent}% ${material.name}`).join(' · '),
   weight:'Factory record',
   quantity:`${product.quantity.toLocaleString('en-US')} pieces`,
   origin:product.country||'Not recorded',
   care:product.care||'Care instructions not recorded.',
   sku:product.sku,
   size:'Sample',
   color:'Product record',
   workspace:true,
  }));
  return json({products});
 }catch(error){return fail(error)}
}
