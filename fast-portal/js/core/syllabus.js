/* Syllabus engine: divides a subject's outline (topics) across its total lectures.
   More lectures than topics -> a topic spans several lectures ("part 1/3").
   More topics than lectures -> one lecture covers several topics ("A + B"). */
function mkPlan(s){const N=Math.max(1,s.lec||24);if(s.lp&&s.lp.length==N)return s.lp.map(tp=>({tp,s:"pending"}));/* AI/admin lecture plan wins */
const o=s.outline&&s.outline.length?s.outline:OUT.map(x=>s.n+": "+x),T=o.length,p=[];
if(T>N){for(let k=0;k<N;k++)p.push({tp:o.slice(Math.floor(k*T/N),Math.floor((k+1)*T/N)).join(" + "),s:"pending"})}
else{const g=[...Array(N)].map((_,k)=>Math.floor(k*T/N)),c={},q={};g.forEach(i=>c[i]=(c[i]||0)+1);g.forEach(i=>{q[i]=(q[i]||0)+1;p.push({tp:c[i]>1?`${o[i]} (part ${q[i]}/${c[i]})`:o[i],s:"pending"})})}
return p}

/* Timetable shows the next pending topic of each subject */
const nextTp=id=>{const p=(st.plan[id]||[]).find(x=>x.s=="pending");return p?p.tp:""};
