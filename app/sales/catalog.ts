export const garments=[
 {id:'LP-TEE-001',name:'Everyday cotton tee',category:'KNITWEAR',batch:'BD-2609-01',composition:'100% cotton',weight:'180 GSM',quantity:'2,400 pieces',origin:'Gazipur, Bangladesh',care:'Wash at 30°C. Line dry. Repair small tears before reuse.',sku:'CT-2401',size:'M',color:'Natural white'},
 {id:'LP-DEN-002',name:'Utility denim shirt',category:'WOVEN / DENIM',batch:'BD-2609-02',composition:'98% cotton · 2% elastane',weight:'7.5 oz denim',quantity:'1,200 pieces',origin:'Narayanganj, Bangladesh',care:'Wash inside out with similar colours. Air dry. Repair seams to extend use.',sku:'DN-2402',size:'L',color:'Indigo'},
 {id:'LP-POLO-003',name:'Essential piqué polo',category:'KNITWEAR / PIQUÉ',batch:'BD-2609-03',composition:'60% cotton · 40% polyester',weight:'220 GSM',quantity:'3,600 pieces',origin:'Dhaka, Bangladesh',care:'Machine wash at 30°C. Reshape while damp. Replace buttons when needed.',sku:'PL-2403',size:'S',color:'Black'}
] as const;
export const checkpoints=['Factory QC','Packing','Dispatch','Buyer received'] as const;
export type TrackEvent={id:string;product:string;checkpoint:string;createdAt:string};
export const validSession=(s:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
