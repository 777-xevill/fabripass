import {z} from 'zod';
import {db,json,fail,HttpError,originCheck,jsonBody} from '../lib';

const str=(n:number)=>z.string().trim().max(n);
const schema=z.object({
  companyName:str(150).min(1),
  country:str(80).min(1),
  registrationNumber:str(100).min(1),
  website:str(200).optional().default(''),
  contactName:str(100).min(1),
  role:str(100).min(1),
  email:z.string().trim().email().max(200),
  phone:str(60).optional().default(''),
  categories:z.array(z.enum(['Knitwear','Woven','Denim','Outerwear','Other'])).min(1),
  markets:z.array(z.enum(['EU','UK','US & Canada','Other'])).optional().default([]),
  certifications:z.array(z.enum(['BSCI','WRAP','SEDEX / SMETA','ISO 9001','OEKO-TEX','GOTS','None yet'])).optional().default([]),
  reference:str(200).optional().default(''),
  traceTopics:z.array(z.enum(['Material composition & fibre origin','Supply chain / factory journey','Dyeing & chemical treatment','Certifications & compliance evidence','Care & end-of-life guidance','Something else'])).optional().default([]),
  message:str(1500).optional().default(''),
  consent:z.literal('yes'),
}).refine(v=>v.traceTopics.length>0||v.message.length>0,{message:'Select at least one trace topic, or describe it in your own words.',path:['message']});

export async function POST(req:Request){
  try{
    originCheck(req);
    const parsed=schema.safeParse(await jsonBody(req));
    if(!parsed.success)throw new HttpError(400,'Please complete the required company, contact and pilot scope fields with valid information.');
    const id=crypto.randomUUID();
    await db().prepare('INSERT INTO pilot_inquiries(id,payload,created_at) VALUES(?,?,?)').bind(id,JSON.stringify(parsed.data),new Date().toISOString()).run();
    return json({reference:id},201);
  }catch(e){return fail(e)}
}
