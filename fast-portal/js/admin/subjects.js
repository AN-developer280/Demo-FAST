/* Admin: Subjects & Syllabus - add / edit / delete subjects, set total lectures + outline, AI builds the lecture plan */
function sbRead(){const g=i=>$("#"+i).value.trim(),nd=g("sbnd");return{n:g("sbn"),dd:g("sbd"),nd,d:nd||g("sbd"),sem:+g("sbs"),ch:+g("sbc"),lec:Math.max(1,Math.min(200,+g("sbl")||0)),r:$("#sbo").value,t:g("sbt")||undefined}}
const sbKey=x=>x.lec+"|"+x.r.trim();
async function sbGen(){const x=sbRead();if(!x.n)return toast("Enter the subject name first");st.ms.f=x;st.ms.busy=1;render();const r=await aiPlan(x);st.ms.dr={key:sbKey(x),lp:r.lp,mode:r.mode};st.ms.busy=0;render();toast("Lecture plan ready — review it, then save")}
async function sbSave(){const x=sbRead(),e=st.ms.eid?sub(st.ms.eid):null;
if(!x.n||!x.d)return toast("Subject name and department are required");
if(st.subs.some(s=>s!==e&&s.n.toLowerCase()==x.n.toLowerCase()&&s.d==x.d&&s.sem==x.sem))return toast("This subject already exists in that department and semester");
const key=sbKey(x),o=parseOutline(x.r);let lp;
if(st.ms.dr&&st.ms.dr.key==key)lp=st.ms.dr.lp;else if(e&&e.key==key&&e.lp&&e.lp.length==x.lec)lp=e.lp;else{toast("AI is dividing the outline into lectures…");lp=(await aiPlan(x)).lp}
if(!st.depts.includes(x.d))st.depts.push(x.d);
const data={n:x.n,d:x.d,sem:x.sem,ch:x.ch,lec:x.lec,raw:x.r,outline:o.length?o:undefined,lp,key,t:x.t};
if(e){const ot=e.t;Object.assign(e,data);st.tt=st.tt.filter(r=>r.sub!=e.id);if(e.t){gen(e.t);rebuildPlan(e)}
 if(ot&&ot!=e.t)notify(ot,`${e.n} was reassigned. Your timetable was updated.`);
 if(e.t)notify(e.t,`${e.n} (${e.d} Sem ${e.sem}): ${e.lec} lectures planned. Timetable and Syllabus Tracker refreshed.`)}
else{const s={id:Math.max(0,...st.subs.map(z=>z.id))+1,...data};st.subs.push(s);if(s.t){gen(s.t);notify(s.t,`New subject assigned: ${s.n} (${s.d} Sem ${s.sem}) — ${s.lec} lectures planned.`)}}
st.ms.eid=0;st.ms.f=null;st.ms.dr=null;render();toast(`${x.n} saved — ${x.lec} lectures divided${x.t?" and linked to "+x.t+"'s timetable":""}`)}
function sbDel(id){const s=sub(id);if(typeof confirm=="function"&&!confirm(`Delete "${s.n}"? Its timetable lectures and tracker will be removed.`))return;
st.tt=st.tt.filter(r=>r.sub!=id);delete st.plan[id];st.subs=st.subs.filter(z=>z.id!=id);if(s.t)notify(s.t,`${s.n} was removed from the curriculum.`);st.ms.eid=0;st.ms.f=null;st.ms.dr=null;render();toast("Subject deleted")}
function sbEdit(id){st.ms.eid=id;st.ms.f=null;st.ms.dr=null;render();typeof scrollTo=="function"&&scrollTo(0,0)}
function sbCancel(){st.ms.eid=0;st.ms.f=null;st.ms.dr=null;render()}
