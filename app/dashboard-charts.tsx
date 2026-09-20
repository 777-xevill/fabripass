'use client';

import {Bar,BarChart,Cell,Pie,PieChart,ResponsiveContainer,Tooltip,XAxis,YAxis} from 'recharts';

type Score = {name:string;score:number};
const palette={ready:'#2f5747',progress:'#a98345',setup:'#713b3a',bar:'#31483f'};

export default function DashboardCharts({scores}:{scores:Score[]}){
 const bands=[
  {name:'Ready',value:scores.filter(item=>item.score===100).length,color:palette.ready},
  {name:'In progress',value:scores.filter(item=>item.score>=50&&item.score<100).length,color:palette.progress},
  {name:'Needs setup',value:scores.filter(item=>item.score<50).length,color:palette.setup},
 ];
 const chartBands=bands.some(item=>item.value>0)?bands:[{name:'No records',value:1,color:'#cfc6b4'}];
 return <section className="analytics-grid" aria-label="Live workspace analytics">
  <article className="card chart-card">
   <div className="chart-heading"><div><span className="small-caps">PORTFOLIO MIX</span><h2>Readiness distribution</h2></div><span className="chart-total">{scores.length}<small>records</small></span></div>
   <div className="donut-layout"><div className="chart-frame" role="img" aria-label="Donut chart showing product readiness distribution">
    <ResponsiveContainer width="100%" height="100%" minWidth={150} minHeight={150} debounce={120}><PieChart><Pie data={chartBands} dataKey="value" nameKey="name" innerRadius="63%" outerRadius="90%" paddingAngle={3} stroke="none" isAnimationActive={false}>{chartBands.map(item=><Cell key={item.name} fill={item.color}/>)}</Pie><Tooltip contentStyle={{background:'#fbf7ee',border:'1px solid #c8b999',borderRadius:10,color:'#17231e'}}/></PieChart></ResponsiveContainer>
    <div className="donut-center"><strong>{scores.length?Math.round(scores.reduce((sum,item)=>sum+item.score,0)/scores.length):0}%</strong><small>average</small></div>
   </div><div className="chart-legend">{bands.map(item=><div key={item.name}><i style={{background:item.color}}/><span>{item.name}</span><strong>{item.value}</strong></div>)}</div></div>
  </article>
  <article className="card chart-card chart-card-wide">
   <div className="chart-heading"><div><span className="small-caps">STYLE PERFORMANCE</span><h2>Readiness by garment record</h2></div><span className="chart-note">Calculated from 8 checks</span></div>
   <div className="bar-frame" role="img" aria-label="Bar chart comparing readiness scores for garment records"><ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={180} debounce={120}><BarChart data={scores} margin={{top:12,right:8,left:-24,bottom:0}}><XAxis dataKey="name" axisLine={false} tickLine={false} interval={0} tick={{fill:'#66736d',fontSize:11,fontWeight:650}}/><YAxis domain={[0,100]} axisLine={false} tickLine={false} tick={{fill:'#5f6963',fontSize:10,fontWeight:650}}/><Tooltip cursor={{fill:'rgba(49,72,63,.06)'}} formatter={(value)=>[`${value}%`,'Readiness']} contentStyle={{background:'#fbf7ee',border:'1px solid #c8b999',borderRadius:10,color:'#17231e'}}/><Bar dataKey="score" fill={palette.bar} radius={[8,8,2,2]} maxBarSize={48} isAnimationActive={false}/></BarChart></ResponsiveContainer></div>
  </article>
 </section>;
}
