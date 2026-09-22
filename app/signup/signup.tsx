'use client';
import {useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {Loader2} from 'lucide-react';

export default function Signup(){
  const params=useSearchParams();
  const returnTo=params.get('return_to')||'/workspace';
  const [displayName,setDisplayName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');

  async function submit(e:React.FormEvent){
    e.preventDefault();
    setBusy(true);setError('');
    try{
      const r=await fetch('/api/auth/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({displayName,email,password})});
      const d=await r.json() as {error?:string};
      if(!r.ok)throw Error(d.error||'Could not create your account.');
      window.location.href=returnTo;
    }catch(e){setError((e as Error).message);setBusy(false)}
  }

  return <div className="auth-page">
    <div className="auth-card card">
      <a className="auth-brand" href="/"><img src="/brand/fabripass-logo.png" alt=""/><span>FabriPass</span></a>
      <h1>Create your workspace</h1>
      <p>Save products, evidence and passports to your own private account.</p>
      {error&&<div className="banner error">{error}</div>}
      <form onSubmit={submit}>
        <label className="block-label">Your name<input required autoFocus maxLength={120} value={displayName} onChange={e=>setDisplayName(e.target.value)}/></label>
        <label className="block-label">Email<input type="email" required maxLength={200} value={email} onChange={e=>setEmail(e.target.value)}/></label>
        <label className="block-label">Password<input type="password" required minLength={8} maxLength={200} value={password} onChange={e=>setPassword(e.target.value)}/><small>At least 8 characters.</small></label>
        <button className="primary" disabled={busy}>{busy&&<Loader2 size={17} className="spin"/>}Create account</button>
      </form>
      <p className="auth-foot">Already have a workspace? <a href={'/login?return_to='+encodeURIComponent(returnTo)}>Sign in</a></p>
    </div>
  </div>;
}
