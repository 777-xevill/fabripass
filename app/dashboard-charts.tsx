'use client';

import {useEffect,useRef,useState} from 'react';
import {Bar,BarChart,Cell,Pie,PieChart,Tooltip,XAxis,YAxis} from 'recharts';

type Score = {name:string;score:number};
const palette={ready:'#15803d',progress:'#5521f1',setup:'#171717',bar:'#5521f1'};

export default function DashboardCharts({scores}:{scores:Score[]}){
 const barRef=useRef<HTMLDivElement>(null);
 const [barWidth,setBarWidth]=useState(0);
 useEffect(()=>{const frame=barRef.current;if(!frame)return;const update=()=>setBarWidth(Math.max(220,Math.floor(frame.getBoundingClientRect().width)));update();const observer=new ResizeObserver(update);observer.observe(frame);return()=>observer.disconnect()},[]);
 const bands=[
  {name:'Ready',value:scores.filter(item=>item.score===100).length,color:palette.ready},
  {name:'In progress',value:scores.filter(item=>item.score>=50&&item.score<100).length,color:palette.progress},
  {name:'Needs setup',value:scores.filter(item=>item.score<50).length,color:palette.setup},
 ];
 const chartBands=bands.some(item=>item.value>0)?bands:[{name:'No records',value:1,color:'#e5e7eb'}];
 return <section className="analytics-grid" aria-label="Live workspace analytics">
  <article className="card chart-card">
   <div className="chart-heading"><div><span className="small-caps">PORTFOLIO MIX</span><h2>Readiness distribution</h2></div><span className="chart-total">{scores.length}<small>records</small></span></div>
   <div className="donut-layout"><div className="chart-frame" role="img" aria-label="Donut chart showing product readiness distribution">
    <PieChart width={175} height={175}><Pie data={chartBands} dataKey="value" nameKey="name" innerRadius="63%" outerRadius="90%" paddingAngle={3} stroke="none" isAnimationActive={false}>{chartBands.map(item=><Cell key={item.name} fill={item.color}/>)}</Pie><Tooltip contentStyle={{background:'#ffffff',border:'1px solid #e5e7eb',borderRadius:10,color:'#171717'}}/></PieChart>
    <div className="donut-center"><strong>{scores.length?Math.round(scores.reduce((sum,item)=>sum+item.score,0)/scores.length):0}%</strong><small>average</small></div>
   </div><div className="chart-legend">{bands.map(item=><div key={item.name}><i style={{background:item.color}}/><span>{item.name}</span><strong>{item.value}</strong></div>)}</div></div>
  </article>
  <article className="card chart-card chart-card-wide">
   <div className="chart-heading"><div><span className="small-caps">STYLE PERFORMANCE</span><h2>Readiness by garment record</h2></div><span className="chart-note">Calculated from 8 checks</span></div>
   <div ref={barRef} className="bar-frame" role="img" aria-label="Bar chart comparing readiness scores for garment records">{barWidth>0?<BarChart width={barWidth} height={190} data={scores} margin={{top:12,right:8,left:-24,bottom:0}}><XAxis dataKey="name" axisLine={false} tickLine={false} interval={0} tick={{fill:'#6b7280',fontSize:11,fontWeight:650}}/><YAxis domain={[0,100]} axisLine={false} tickLine={false} tick={{fill:'#6b7280',fontSize:10,fontWeight:650}}/><Tooltip cursor={{fill:'rgba(85,33,241,.06)'}} formatter={(value)=>[`${value}%`,'Readiness']} contentStyle={{background:'#ffffff',border:'1px solid #e5e7eb',borderRadius:10,color:'#171717'}}/><Bar dataKey="score" fill={palette.bar} radius={[8,8,2,2]} maxBarSize={48} isAnimationActive={false}/></BarChart>:<div className="chart-placeholder wide-placeholder"/>}</div>
  </article>
 </section>;
}
