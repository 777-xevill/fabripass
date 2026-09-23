'use client';
import {useState,useRef,type FormEvent} from 'react';
import {ArrowUpRight,ArrowRight,ArrowLeft,ScanLine,FileCheck2,Route,Layers3,Search,ShieldCheck} from 'lucide-react';
import {SalesHeader,SalesFooter} from './shell';
export default function Landing(){
const [state,setState]=useState('');const [busy,setBusy]=useState(false);const [failed,setFailed]=useState(false);
const pilotStepLabels=['Company & registration','Your contact details','What you produce','Credentials','Pilot scope'];
const [step,setStep]=useState(0);const lastStep=pilotStepLabels.length-1;
const formRef=useRef<HTMLFormElement>(null);
function next(){if(formRef.current&&!formRef.current.reportValidity())return;setStep(s=>Math.min(s+1,lastStep))}
function back(){setStep(s=>Math.max(s-1,0))}
async function inquire(e:FormEvent<HTMLFormElement>){
e.preventDefault();if(step<lastStep){next();return}
const form=e.currentTarget;setBusy(true);setState('');setFailed(false);
try{const fd=new FormData(form);const payload={companyName:fd.get('companyName'),country:fd.get('country'),registrationNumber:fd.get('registrationNumber'),website:fd.get('website'),contactName:fd.get('contactName'),role:fd.get('role'),email:fd.get('email'),phone:fd.get('phone'),categories:fd.getAll('categories'),markets:fd.getAll('markets'),certifications:fd.getAll('certifications'),reference:fd.get('reference'),message:fd.get('message'),consent:fd.get('consent')};const r=await fetch('/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const out=await r.json() as {reference:string;error?:string};if(!r.ok)throw Error(out.error||'Unable to save. Please retry.');setState('Application saved. Reference '+out.reference+'. Keep this reference for your pilot discussion. No automatic email is sent by this prototype.');form.reset();setStep(0)}catch(e){setFailed(true);setState(e instanceof Error?e.message:'Unable to save. Please retry.')}finally{setBusy(false)}
}
const pilotCategories=['Knitwear','Woven','Denim','Outerwear','Other'];
const pilotMarkets=['EU','UK','US & Canada','Other'];
const pilotCertifications=['BSCI','WRAP','SEDEX / SMETA','ISO 9001','OEKO-TEX','GOTS','None yet'];
return <div className="sales"><a className="skip-link" href="#main">Skip to content</a><SalesHeader/><main id="main">
<section className="sales-hero"><div><div className="sales-kicker">FABRIPASS / GARMENT INTELLIGENCE, FROM SOURCE TO SCAN</div><h1>See every layer.<br/>Trace every handover.<br/><em>Share one clear record.</em></h1><p className="sales-lede">Turn scattered factory information into a product story buyers can inspect. Connect construction, materials, evidence and checkpoints to a QR for every garment record.</p><div className="sales-actions"><a className="sales-button dark" href="/demo">Try scan & track <ArrowUpRight size={18}/></a><a className="sales-button" href="/resources">Explore buyer resources <ArrowRight size={18}/></a></div><p className="sales-micro">For garment factories, sourcing teams and brands.</p></div><div className="exploded-hero sweatshirt-hero" aria-label="Plain sweatshirt with a scannable product passport QR inside the neckline"><img className="exploded-garment sweatshirt-garment" src="/visuals/fabripass-sweatshirt-qr.png" alt="Plain off-white sweatshirt with a small FabriPass QR printed inside the neckline"/><a className="qr-magnifier" href="/demo" aria-label="Scan the sweatshirt neck QR and open the FabriPass live demo"><span className="lens"><img src="/brand/fabripass-demo-qr.png" alt="Magnified sample product QR"/><Search size={41}/></span><strong>Scan the neck QR</strong><small>Open the product passport</small></a></div></section>
<div className="audience-strip"><span>DESIGNED FOR THE PEOPLE BEHIND THE GARMENT</span><strong>Factory owners</strong><strong>Merchandisers</strong><strong>Compliance teams</strong><strong>Global buyers</strong></div>
<section id="platform" className="sales-section"><div className="section-intro"><div><div className="sales-kicker">01 / THE PLATFORM</div><h2>Less chasing documents.<br/>More clarity on every order.</h2></div><p>A consistent product record helps your team answer buyer questions with context, supporting evidence and a clear view of what still needs work.</p></div><div className="feature-grid">{[{icon:Layers3,title:'One product record',body:'Keep style, batch, fibre composition, origin and care information together. Know which version the team is reviewing.'},{icon:FileCheck2,title:'Evidence with context',body:'Attach documents to the product they support. Track expiry and internal review status before preparing a buyer pack.'},{icon:Route,title:'A visible journey',body:'Map suppliers and processing stages. Record sample QC, packing, dispatch and receipt checkpoints in the live prototype.'},{icon:ScanLine,title:'A scan that connects',body:'Generate a product QR, open it on another phone and submit a demo check-in. See the event appear in the tracking history.'}].map(x=><article key={x.title}><x.icon size={26}/><h3>{x.title}</h3><p>{x.body}</p></article>)}</div></section>
<section className="scenario-section"><div><div className="sales-kicker">02 / A GARMENT SCENARIO</div><h2>From the factory floor<br/>to the buyer’s hands.</h2><p>Imagine a cotton tee order leaving Gazipur. Quality control checks the batch, packing confirms the handover, dispatch records the shipment, and the buyer checks in on receipt.</p><p>Use two devices to see the handover happen. Each submitted event is saved with its product, checkpoint and server timestamp.</p><a href="/demo" className="sales-button light">Follow the sample order <ArrowUpRight size={18}/></a></div><ol className="scenario-steps">{['Create the garment record','Generate the product QR','Scan and confirm a checkpoint','Watch the tracking history update'].map((s,i)=><li key={s}><span>0{i+1}</span><strong>{s}</strong><ArrowRight size={20}/></li>)}</ol></section>
<section className="sales-section"><div className="section-intro"><div><div className="sales-kicker">03 / THE BUYER CONVERSATION</div><h2>Give the next meeting<br/>something real to work with.</h2></div><a className="text-link" href="/resources">Open all resources <ArrowUpRight size={18}/></a></div><div className="resource-teasers">{[['01','Product overview','Who uses FabriPass, how the workflow fits and what is available today.'],['02','Step-by-step user manual','A simple guide for the landing page, live QR demo and private workspace.'],['03','Data & trust brief','Public demo data, private records and the limits of a scan.']].map(([n,t,d])=><a href={n==='02'?'/documents/FabriPass-Website-User-Manual.pdf':'/resources'} key={n}><span>{n} / BUYER DOCUMENT</span><h3>{t}</h3><p>{d}</p><ArrowUpRight size={22}/></a>)}</div></section>
<section className="sales-section faq-section"><div><div className="sales-kicker">04 / BEFORE YOU START</div><h2>Clear answers.<br/>A practical next step.</h2><ShieldCheck className="faq-mark" size={54}/></div><div>{[['Does the QR really work?','Yes. Each demo QR opens a product check-in page for your session. Another device can record an event, and the dashboard refreshes the shared history. Visitors must have access to the Site.'],['Does a scan prove authenticity?','No. A check-in is a submitted event. It does not prove physical possession, certify origin or provide GPS tracking. Production claims need independently reviewed evidence.'],['Can we upload a product image?','Yes. Add a JPG, PNG or WebP while creating or editing a product. The image is intentionally published with the sanitized Live Demo record; private buyer, supplier, note and evidence fields remain excluded.'],['Can we upload factory documents?','The signed-in workspace supports private evidence uploads and per-user product records. Agree production security, retention and access requirements before introducing confidential data.'],['Is this an EU compliance certificate?','No. FabriPass structures records and identifies information gaps. Applicable requirements, verification and registry integration need separate assessment.']].map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section>
<section id="pilot" className="pilot-section"><div><div className="sales-kicker">LET’S MAKE THE NEXT ORDER CLEARER</div><h2>Bring one factory.<br/>One buyer.<br/>One real use case.</h2><p>Four quick steps, no long forms. Tell us about your factory and what you want to trace — we review each application before starting a pilot.</p><a className="text-link" href="/resources#pilot">Read the pilot plan <ArrowUpRight size={18}/></a></div><form ref={formRef} onSubmit={inquire}><h3>Apply for a pilot</h3>
<div className="form-progress">{pilotStepLabels.map((_,i)=><span key={i} className={i<=step?'done':''}/>)}</div>
<div className="form-step-label">STEP {step+1} OF {pilotStepLabels.length} — {pilotStepLabels[step].toUpperCase()}</div>

<div className={'form-step'+(step===0?' active':'')}>
<label>Legal company / factory name<input name="companyName" required maxLength={150} autoComplete="organization"/></label>
<label>Country of registration<input name="country" required maxLength={80} autoComplete="country-name"/></label>
<label>Business registration / trade license no.<input name="registrationNumber" required maxLength={100}/></label>
<label>Company website<input name="website" maxLength={200} placeholder="Optional" autoComplete="url"/></label>
</div>

<div className={'form-step'+(step===1?' active':'')}>
<label>Your full name<input name="contactName" required maxLength={100} autoComplete="name"/></label>
<label>Your role<select name="role"><option>Factory owner / management</option><option>Buyer / sourcing team</option><option>Merchandising / operations</option><option>Compliance / sustainability</option></select></label>
<label>Work email<input type="email" name="email" required maxLength={200} autoComplete="email"/></label>
<label>Phone / WhatsApp<input name="phone" maxLength={60} placeholder="Optional" autoComplete="tel"/></label>
</div>

<div className={'form-step'+(step===2?' active':'')}>
<div className="field-group"><span className="field-legend">Product categories</span><div className="checkbox-group">{pilotCategories.map(c=><label key={c}><input type="checkbox" name="categories" value={c}/>{c}</label>)}</div></div>
<div className="field-group"><span className="field-legend">Primary export markets</span><div className="checkbox-group">{pilotMarkets.map(m=><label key={m}><input type="checkbox" name="markets" value={m}/>{m}</label>)}</div></div>
</div>

<div className={'form-step'+(step===3?' active':'')}>
<div className="field-group"><span className="field-legend">Existing certifications</span><div className="checkbox-group">{pilotCertifications.map(c=><label key={c}><input type="checkbox" name="certifications" value={c}/>{c}</label>)}</div></div>
<label>Reference buyer or trade reference<input name="reference" maxLength={200} placeholder="Optional"/></label>
</div>

<div className={'form-step'+(step===4?' active':'')}>
<label>What would you like to trace?<textarea name="message" required maxLength={1500} rows={3}/></label>
<label className="consent"><input type="checkbox" name="consent" value="yes" required/>I agree to the <a href="/resources#privacy">inquiry data use</a>.</label>
</div>

<div className="form-nav">
{step>0&&<button type="button" className="sales-button" onClick={back}><ArrowLeft size={17}/>Back</button>}
{step<lastStep?<button type="button" className="sales-button dark" onClick={next}>Next<ArrowRight size={17}/></button>:<button className="sales-button dark" disabled={busy}>{busy?'Submitting…':'Submit application'}<ArrowRight size={17}/></button>}
</div>
<p className="sales-micro">Reviewed before a pilot discussion. This prototype does not send email or book meetings.</p>{state&&<p role={failed?'alert':'status'} className="form-message">{state}</p>}</form></section>
</main><SalesFooter/></div>}
