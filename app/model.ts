export type Product = { id:string; name:string; sku:string; batch:string; category:string; buyer:string; facility:string; country:string; quantity:number; materials:{name:string;percent:number}[]; stages:{stage:string;supplier:string;country:string}[]; care:string; circularity:string; notes:string; imageUrl?:string; version:number; sample:boolean; updatedAt:string };
export type Evidence = {id:string;productId:string;name:string;kind:string;expires:string;status:'pending'|'reviewed';reviewer?:string;reviewedVersion?:number;uploadedAt:string;sha256?:string;hasFile:boolean;sample:boolean};
export type Activity = {id:string;message:string;createdAt:string};
export const stageNames=['Fibre & yarn','Fabric formation','Dyeing & finishing','Garment making'];
export const emptyProduct = ():Product=>({id:'',name:'',sku:'',batch:'',category:'Knitwear',buyer:'',facility:'',country:'',quantity:0,materials:[{name:'',percent:100}],stages:stageNames.map(stage=>({stage,supplier:'',country:''})),care:'',circularity:'',notes:'',version:0,sample:false,updatedAt:''});
export const sampleProducts:Product[]=[
 {...emptyProduct(),id:'sample-cotton',name:'Everyday cotton tee',sku:'LP-CT-2401',batch:'B-2026-081',buyer:'Nordic Apparel (sample)',facility:'Delta Fashions, Gazipur (sample)',country:'Bangladesh',quantity:12000,materials:[{name:'Cotton',percent:100}],stages:stageNames.map((stage,i)=>({stage,supplier:['River Yarn (sample)','Delta Knit (sample)','Colourworks (sample)','Delta Fashions (sample)'][i],country:i===0?'India':'Bangladesh'})),care:'Wash at 30°C with similar colours. Line dry. Repair small tears before reuse.',circularity:'Reuse or donate where suitable. Ask your local collection scheme about textile recycling.',sample:true,version:1,updatedAt:'2026-09-18T09:00:00Z'},
 {...emptyProduct(),id:'sample-denim',name:'Essential denim shirt',sku:'LP-DN-2402',batch:'B-2026-094',category:'Woven',buyer:'Studio North (sample)',facility:'Delta Fashions, Gazipur (sample)',country:'Bangladesh',quantity:6500,materials:[{name:'Cotton',percent:98},{name:'Elastane',percent:2}],stages:stageNames.map((stage,i)=>({stage,supplier:i===2?'':['Indus Cotton (sample)','Bengal Weave (sample)','','Delta Fashions (sample)'][i],country:'Bangladesh'})),care:'Wash inside out at 30°C. Air dry. Repair loose buttons.',sample:true,version:1,updatedAt:'2026-09-18T09:00:00Z'},
 {...emptyProduct(),id:'sample-polo',name:'Performance polo',sku:'LP-PL-2403',batch:'B-2026-106',buyer:'Atlas Collective (sample)',country:'Bangladesh',quantity:8000,materials:[{name:'Polyester',percent:65},{name:'Cotton',percent:35}],stages:stageNames.map((stage,i)=>({stage,supplier:i===3?'Delta Fashions (sample)':'',country:'Bangladesh'})),sample:true,version:1,updatedAt:'2026-09-18T09:00:00Z'}
];
export const sampleEvidence:Evidence[]=[{id:'sample-e1',productId:'sample-cotton',name:'Fibre composition test - sample reference',kind:'Material test',expires:'2027-03-31',status:'pending',uploadedAt:'2026-09-18T09:00:00Z',hasFile:false,sample:true},{id:'sample-e2',productId:'sample-denim',name:'Mill declaration - sample reference',kind:'Supplier declaration',expires:'2026-08-31',status:'pending',uploadedAt:'2026-09-18T09:00:00Z',hasFile:false,sample:true}];
export function expired(e:Evidence){return !!e.expires && e.expires < new Date().toISOString().slice(0,10)}
export function checks(p:Product,docs:Evidence[]){return [
 {label:'Product identity and style code',ok:!!p.name.trim()&&!!p.sku.trim()},
 {label:'Batch and production quantity',ok:!!p.batch.trim()&&p.quantity>0},
 {label:'Manufacturing facility and country',ok:!!p.facility.trim()&&!!p.country.trim()},
 {label:'Material composition totals 100%',ok:p.materials.length>0&&p.materials.every(m=>m.name.trim()&&m.percent>0)&&Math.abs(p.materials.reduce((s,m)=>s+m.percent,0)-100)<0.01},
 {label:'Four supply chain stages identified',ok:p.stages.length===4&&p.stages.every(s=>s.supplier.trim()&&s.country.trim())},
 {label:'Care and repair information',ok:!!p.care.trim()},
 {label:'Reuse and end-of-life guidance',ok:!!p.circularity.trim()},
 {label:'Current evidence internally reviewed',ok:docs.some(e=>e.productId===p.id&&e.hasFile&&e.status==='reviewed'&&e.reviewedVersion===p.version&&!expired(e))}
 ]}
export function readiness(p:Product,e:Evidence[]){return Math.round(checks(p,e).filter(c=>c.ok).length/8*100)}
export function passportData(p:Product){return {schema:'fabripass.preview.v1',notice:'DPP readiness preview. Not an EU-registered passport or certification.',sample:p.sample,productId:p.id,name:p.name,styleCode:p.sku,batch:p.batch,category:p.category,country:p.country,materials:p.materials,care:p.care,circularity:p.circularity,imageUrl:p.imageUrl,revision:p.version,updatedAt:p.updatedAt}}
