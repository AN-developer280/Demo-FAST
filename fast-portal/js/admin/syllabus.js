/* Admin: AI syllabus tools - turns ANY outline text into a lecture-by-lecture plan */
const AIURL="https://api.anthropic.com/v1/messages";
/* "1. A  2. B", "A; B", bullet lines or "A, B, C" -> ["A","B","C"] */
function parseOutline(t){let a=String(t||"").split(/\r?\n|;|•|·|(?:^|\s)\d{1,2}[.)]\s+/).map(x=>x.replace(/^[-*•\s]+/,"").trim()).filter(Boolean);if(a.length==1&&a[0].includes(","))a=a[0].split(",").map(x=>x.trim()).filter(Boolean);return[...new Set(a)]}
/* [{t,l}] -> lecture counts that add up to exactly N (or null if impossible) */
function fitWeights(a,N){a=(Array.isArray(a)?a:[]).filter(x=>x&&typeof x.t=="string"&&x.t.trim()).map(x=>({t:x.t.trim(),l:Math.max(1,Math.round(+x.l||1))}));if(!a.length||a.length>N)return null;
let sum=a.reduce((p,x)=>p+x.l,0);while(sum!=N){const i=a.reduce((m,x,j)=>x.l>a[m].l?j:m,0);if(sum>N){if(a[i].l<=1)return null;a[i].l--;sum--}else{a[i].l++;sum++}}return a}
const expandPlan=a=>a.flatMap(x=>[...Array(x.l)].map((_,i)=>x.l>1?`${x.t} (part ${i+1}/${x.l})`:x.t));
async function aiPlan(x){const o=parseOutline(x.r);let lp,mode="✨ AI";
try{const r=await fetch(AIURL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,
system:'You plan university courses. Given a subject, the total number of lectures and an outline in ANY format (lines, a paragraph, numbered, comma separated) - or no outline at all, in which case create a standard one - split the content into ordered topics and decide how many lectures each topic needs (bigger or harder topics get more). The lecture counts must add up to exactly the total. Reply ONLY with a JSON array like [{"t":"Topic name","l":2}], no markdown.',
messages:[{role:"user",content:`Subject: ${x.n} (${x.d}, semester ${x.sem})\nTotal lectures: ${x.lec}\nOutline:\n${x.r.trim()||"(none - create a standard outline)"}`}]})});
const j=await r.json(),a=fitWeights(JSON.parse(j.content.map(i=>i.text||"").join("").replace(/```json|```/g,"").trim()),x.lec);if(!a)throw 0;lp=expandPlan(a)}
catch(e){lp=mkPlan({n:x.n,lec:x.lec,outline:o}).map(p=>p.tp);mode="Auto-split (AI offline)"}
return{lp,o,mode}}
/* Rebuild a subject's tracker from its lecture plan; completed lectures are kept */
function rebuildPlan(s){if(st.plan[s.id]||s.t){const old=st.plan[s.id]||[],np=mkPlan(s);old.filter(x=>x.s=="done").forEach((x,i)=>{if(np[i]){np[i].s="done";np[i].dt=x.dt;np[i].hw=x.hw}});st.plan[s.id]=np}}
