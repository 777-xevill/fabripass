'use client';
import {useState,useRef,type FormEvent} from 'react';
import {Shirt,CheckCircle2} from 'lucide-react';
import {garments,checkpoints} from '../../../sales/catalog';
import {SalesHeader,SalesFooter} from '../../../sales/shell';
export default function CheckIn({session,productId}:{session:string;productId:string}){
 const product=garments.find(p=>p.id===productId)!;
 const [checkpoint,setCheckpoint]=useState<string>(checkpoints[0]);
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [saved,setSaved]=useState('');
 const eventId=useRef<string|null>(null);
 async function submit(e:FormEvent){
 e.preventDefault();if(busy)return;setBusy(true);setError('');eventId.current??=crypto.randomUUID();
 try{const r=await fetch('/api/demo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:eventId.current,session,product:productId,checkpoint})});const result=await r.json() as {error?:string};if(!r.ok)throw Error(result.error||'Check-in could not be saved.');setSaved(checkpoint)}catch(e){setError(e instanceof Error?e.message:'Check-in could not be saved. Please retry.')}finally{setBusy(false)}
 }
 return <div className="sales"><SalesHeader/><main className="sales-page scan-page"><div className="sales-kicker">PRODUCT QR / DEMO CHECK-IN</div><div className="scan-heading"><Shirt size={52}/><h1>{product.name}</h1></div><p>{product.id} · Batch {product.batch}</p><div className="demo-note">You opened a sample garment record. Confirming below adds a real saved event to this demo session. No location or personal information is required.</div><section className="demo-box"><dl className="product-facts">{[['Composition',product.composition],['Origin',product.origin],['Fabric',product.weight],['Style',product.sku]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><p className="sales-micro">{product.care}</p>{saved?<div><div className="scan-success" role="status"><CheckCircle2 size={28}/><h3 style={{color:'white'}}>Check-in saved</h3><p>{saved} has been added to {product.id}. The dashboard will show it on its next refresh.</p></div><a className="sales-button dark" href={'/demo?session='+session}>View tracking history →</a><button className="sales-button" style={{marginTop:10}} onClick={()=>{eventId.current=null;setSaved('')}}>Record another checkpoint</button></div>:<form onSubmit={submit}><label htmlFor="checkpoint">Where is this sample in the journey?</label><select id="checkpoint" value={checkpoint} disabled={busy||!!eventId.current} onChange={e=>setCheckpoint(e.target.value)}>{checkpoints.map(c=><option key={c}>{c}</option>)}</select><button className="sales-button dark" disabled={busy}>{busy?'Saving check-in…':'Confirm demo check-in'}</button>{error&&<div role="alert" className="error-panel"><p>{error}</p><p>Retry to submit the same event without duplication.</p></div>}<p className="sales-micro">A check-in is self-reported. It does not certify authenticity or confirm physical delivery.</p></form>}</section><a className="text-link" href={'/demo?session='+session}>← Return to this demo session</a></main><SalesFooter/></div>
}

