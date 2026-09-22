'use client';
import {useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {Loader2} from 'lucide-react';

export default function Login(){
  const params=useSearchParams();
  const returnTo=params.get('return_to')||'/workspace';
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');

  async function submit(e:React.FormEvent){
    e.preventDefault();
    setBusy(true);setError('');
    try{
      const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
      const d=await r.json() as {error?:string};
      if(!r.ok)throw Error(d.error||'Sign in failed.');
      window.location.href=returnTo;
    }catch(e){setError((e as Error).message);setBusy(false)}
  }

  return <div className="auth-page">
    <div className="auth-card card">
      <a className="auth-brand" href="/"><img src="/brand/fabripass-logo.png" alt=""/><span>FabriPass</span></a>
      <h1>Sign in</h1>
      <p>Access your private workspace.</p>
      {error&&<div className="banner error">{error}</div>}
      <form onSubmit={submit}>
        <label className="block-label">Email<input type="email" required autoFocus maxLength={200} value={email} onChange={e=>setEmail(e.target.value)}/></label>
        <label className="block-label">Password<input type="password" required maxLength={200} value={password} onChange={e=>setPassword(e.target.value)}/></label>
        <button className="primary" disabled={busy}>{busy&&<Loader2 size={17} className="spin"/>}Sign in</button>
      </form>
      <p className="auth-foot">New to FabriPass? <a href={'/signup?return_to='+encodeURIComponent(returnTo)}>Create an account</a></p>
    </div>
  </div>;
}
