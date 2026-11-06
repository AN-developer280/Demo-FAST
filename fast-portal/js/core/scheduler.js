/* Auto-timetable generator + conflict check */
const free=(t,s,d,m,ig)=>!st.tt.some(x=>x!==ig&&x.d==d&&ov(tm(x,st.td),m)&&(x.t==t||(sub(x.sub).d==s.d&&sub(x.sub).sem==s.sem)));
function gen(t){const fail=[],sl=slots(st.td);st.subs.filter(s=>s.t==t&&!st.tt.some(x=>x.sub==s.id)).forEach(s=>{const used=[];for(let c=0;c<s.ch;c++){let b=null;for(let d=0;d<5;d++){if(used.includes(d))continue;const l=st.tt.filter(x=>x.t==t&&x.d==d).length;for(let k=0;k<sl.length;k++)if(free(t,s,d,sl[k])){if(!b||l<b.l)b={d,k,l};break}}if(b){st.tt.push({t,sub:s.id,d:b.d,k:b.k,pin:0});used.push(b.d)}else fail.push(s.n)}
if(!st.plan[s.id])st.plan[s.id]=mkPlan(s)});return fail}
