/* Teacher-side helpers: syllabus %, subject selector, subject picking, lecture-slot picker (AI clash check), diary + attendance helpers */
const pct=()=>{let a=0,b=0;mine().forEach(s=>(st.plan[s.id]||[]).forEach(l=>{b++;if(l.s=="done")a++}));return b?Math.round(a*100/b):0};
const subSel=ms=>{if(!ms.some(x=>x.id==st.sel))st.sel=ms[0].id;return`<p><select onchange="st.sel=+this.value;st.sum=null;st.as=null;st.dsel=[];st.dtx='';st.hw='';render()">${ms.map(s=>`<option value="${s.id}" ${s.id==st.sel?"selected":""}>${esc(s.n)} (${s.d} Sem ${s.sem})</option>`).join("")}</select></p>`},none=()=>`<div class="bn">No subjects yet. Choose them from Department first.</div>`;
function pick(id,c){const s=sub(id);if(c){const tot=mine().reduce((a,x)=>a+x.ch,0)+st.pick.reduce((a,i)=>a+sub(i).ch,0)+s.ch;if(tot>MAXCH){toast(`Workload limit: maximum ${MAXCH} credit hours`);return render()}st.pick.push(id)}else st.pick=st.pick.filter(i=>i!=id);render()}

/* ---------- 1. Lecture slot picker: "Done" on the subject list opens this card ----------
   The teacher gives a day + time for every weekly lecture. The AI check refuses a slot when the teacher
   (or the same class = same dept + semester) already has a lecture then, and suggests free days/times. */
function done(){if(!st.pick.length)return toast("Select at least one subject");st.sch={rows:st.pick.flatMap(id=>[...Array(sub(id).ch)].map(()=>({sid:id,d:-1,k:-1})))};render();scrollTo(0,0)}
const slLbl=k=>{const m=slots(st.td)[k];return m?MD(m.s)+" – "+MD(m.e):""};
/* null = slot is free, otherwise the reason why lecture row i cannot go on day d, slot k */
function chk(i,d,k){const R=st.sch.rows,r=R[i],s=sub(r.sid),S=slots(st.td),m=S[k];if(!m)return null;
const hit=st.tt.find(x=>x.d==d&&ov(tm(x,st.td),m)&&(x.t==st.me||(sub(x.sub).d==s.d&&sub(x.sub).sem==s.sem)));
if(hit){const o=sub(hit.sub);return hit.t==st.me?`you already have ${o.n} at this time`:`${hit.t} already takes ${o.n} for ${o.d} Sem ${o.sem} at this time`}
const j=R.findIndex((x,n)=>n!=i&&x.d==d&&x.k>=0&&S[x.k]&&ov(S[x.k],m));if(j>=0)return`you picked this time for ${sub(R[j].sid).n} as well`;
return null}
/* free alternatives: other times on the same day, and the same time on other days */
function sug(i,d,k){const a=[],b=[];slots(st.td).forEach((_,j)=>{if(j!=k&&!chk(i,d,j))a.push(j)});for(let e=0;e<5;e++)if(e!=d&&!chk(i,e,k))b.push(e);return[a.slice(0,3),b.slice(0,3)]}
function schSet(i,f,v){st.sch.rows[i][f]=+v;render()}
const schPut=(i,d,k)=>{const r=st.sch.rows[i];r.d=d;r.k=k;render()};
function schMsg(i){const r=st.sch.rows[i];if(r.d<0||r.k<0)return`<div class="am mu">Select a day and a time.</div>`;const w=chk(i,r.d,r.k);
if(!w)return`<div class="am ok">✅ AI check: ${D[r.d]} ${slLbl(r.k)} is free. You can take this slot.</div>`;
const[a,b]=sug(i,r.d,r.k);return`<div class="am er">⚠️ AI check: you can't take ${D[r.d]} ${slLbl(r.k)}, because ${esc(w)}.</div>`
+(a.length?`<div class="am">On ${D[r.d]} you can take: ${a.map(k=>`<button class="ghost sm" onclick="schPut(${i},${r.d},${k})">${slLbl(k)}</button>`).join(" ")}</div>`:"")
+(b.length?`<div class="am">At ${slLbl(r.k)} you can take: ${b.map(d=>`<button class="ghost sm" onclick="schPut(${i},${d},${r.k})">${D[d]}</button>`).join(" ")}</div>`:"")
+(a.length||b.length?"":`<div class="am mu">No free slot on this day or at this time. Please try another day and time.</div>`)}
function schView(){const R=st.sch.rows,ids=[...new Set(R.map(r=>r.sid))],S=slots(st.td),ok=R.filter((r,i)=>r.d>=0&&r.k>=0&&!chk(i,r.d,r.k)).length;
return`<a onclick="st.sch=null;render()">← Back to subjects</a><h2>When can you take your lectures?</h2><p class="mu">Choose a day and a time for every weekly lecture. You can place two lectures of the same subject on the same day, as long as the times are different. The AI checks your timetable and the class timetable for clashes and tells you which day or time is free.</p>${tline()}`
+ids.map(id=>{const s=sub(id);return`<div class="card"><b>${esc(s.n)}</b> <span class="mu">${s.d} Sem ${s.sem} · ${s.ch} lectures / week</span>`+R.map((r,i)=>r.sid!=id?"":`<div class="sch"><span class="mu">Lecture ${R.filter((x,n)=>x.sid==id&&n<=i).length}</span><select onchange="schSet(${i},'d',this.value)"><option value="-1">Day</option>${D.map((x,d)=>`<option value="${d}" ${r.d==d?"selected":""}>${x}</option>`).join("")}</select><select onchange="schSet(${i},'k',this.value)"><option value="-1">Time</option>${S.map((_,k)=>`<option value="${k}" ${r.k==k?"selected":""}>${slLbl(k)}</option>`).join("")}</select></div>${schMsg(i)}`).join("")+`</div>`}).join("")
+`<p><button class="ghost" onclick="schAuto()">🤖 Suggest for me</button> <button onclick="schDone()">Done (${ok}/${R.length} ready)</button></p>`}
/* AI fills every lecture with the free slot on the day where the teacher is least busy */
function schAuto(){const R=st.sch.rows,S=slots(st.td);R.forEach(r=>{r.d=-1;r.k=-1});R.forEach((r,i)=>{let b=null;for(let d=0;d<5;d++){const l=st.tt.filter(x=>x.t==st.me&&x.d==d).length+R.filter(x=>x.d==d).length+R.filter(x=>x.sid==r.sid&&x.d==d).length*10;S.forEach((_,k)=>{if(!chk(i,d,k)&&(!b||l<b.l))b={d,k,l}})}if(b){r.d=b.d;r.k=b.k}});render();toast(R.some(r=>r.d<0)?"Some lectures could not be placed. Choose them by hand":"AI suggested a free slot for every lecture")}
function schDone(){const R=st.sch.rows;if(R.some(r=>r.d<0||r.k<0))return toast("Please choose a day and time for every lecture");if(R.some((r,i)=>chk(i,r.d,r.k)))return toast("Some slots clash. Use the AI suggestions to fix them");
const m=me(),ids=[...new Set(R.map(r=>r.sid))];ids.forEach(id=>{const s=sub(id);if(!s.t)s.t=st.me;if(!st.plan[id])st.plan[id]=mkPlan(s)});R.forEach(r=>st.tt.push({t:st.me,sub:r.sid,d:r.d,k:r.k,pin:0}));
m.done=1;st.pick=[];st.sch=null;notify(st.me,"Your timetable and Syllabus Tracker are ready");notify("Admin",`${st.me} selected ${ids.length} subject(s). Timetable generated.`);st.dept="";if(st.vt)st.vp="Timetable";else st.page="Timetable";render();toast("Timetable and Syllabus Tracker generated")}

/* ---------- 2/3. Topic rows shared by Diary and Syllabus Tracker: Done = green, Next = orange, Upcoming = purple (Missed = red) ---------- */
const tpLegend=()=>`<p class="lgd"><span class="tp done">Done</span><span class="tp next">Next</span><span class="tp up">Upcoming</span><span class="tp miss">Missed</span></p>`;
const tpRow=(l,i,nx,cb)=>{const c=l.s=="done"?"done":l.s=="miss"?"miss":i==nx?"next":"up",lab=l.s=="done"?chip("Done "+l.dt,"ok"):l.s=="miss"?chip("Missed","er"):i==nx?chip("Next","nx"):chip("Upcoming","upc"),
inp=cb?(l.s=="pending"?`<input type="checkbox" ${st.dsel.includes(i)?"checked":""} onchange="dTick(${i},this.checked)">`:`<input type="checkbox" ${l.s=="done"?"checked":""} disabled>`):"";
return`<label class="tp ${c}">${inp}<span class="tx">${i+1}. ${esc(l.tp)}</span>${lab}</label>`};
/* diary text written automatically from the ticked topics */
const dAuto=()=>{const pl=st.plan[st.sel]||[],t=st.dsel.map(i=>pl[i]&&pl[i].tp).filter(Boolean);return t.length?`Today (${TODAY}) I covered: ${t.join("; ")}.`:""};

/* ---------- 4. Attendance: everyone starts Present (P); un-tick = Absent (A); Leave (L) ---------- */
const LV={Ayesha:"fever",Bilal:"family event"};
const asv=()=>{if(!st.as||st.as.length!=ST.length)st.as=ST.map(()=>"P");return st.as};
const attC=()=>{const A=asv();return{P:A.filter(x=>x=="P").length,A:A.filter(x=>x=="A").length,L:A.filter(x=>x=="L").length}};

/* ---------- Choose subjects: availability summary, department filter, search, "only available" switch ----------
   Free subject = no teacher yet (s.t empty). The list is rebuilt by subList() so typing in the search box never loses focus. */
const subUsed=()=>mine().reduce((a,x)=>a+x.ch,0)+st.pick.reduce((a,i)=>a+sub(i).ch,0);
const subHit=s=>{const q=(st.q||"").trim().toLowerCase();return(!st.dept||s.d==st.dept)&&(!st.av||!s.t||s.t==st.me)&&(!q||(s.n+" "+s.d+" sem "+s.sem+" semester "+s.sem).toLowerCase().includes(q))};
function subList(){const L=st.subs.filter(subHit);if(!L.length)return`<div class="bn">No subjects match. ${st.av?"Switch off “Only available subjects” to see subjects that other teachers already took, or ":""}clear the search / department filter.</div>`;
let h="";st.depts.forEach(d=>{[...new Set(L.filter(s=>s.d==d).map(s=>s.sem))].sort((a,b)=>a-b).forEach(n=>{const g=L.filter(s=>s.d==d&&s.sem==n),f=g.filter(s=>!s.t).length;
h+=`<h3>${esc(d)} · Semester ${n} <span class="mu" style="font-size:13px;font-weight:400">${f} of ${g.length} available</span></h3>`+g.map(s=>{const tk=s.t&&s.t!=st.me,my=s.t==st.me,on=my||st.pick.includes(s.id);
return`<label class="sr ${tk?"tk":""} ${on?"sel":""}"><input type="checkbox" ${tk||my?"disabled":""} ${on?"checked":""} onchange="pick(${s.id},this.checked)"><span>${esc(s.n)} <small class="mu">${s.ch} CH · ${s.ch} lectures/week · ${s.lec} lectures in total</small></span>${tk?chip("Taken by "+esc(s.t),"er"):my?chip("Yours"):chip("Available","ok")}</label>`}).join("")})});return h}
function subjView(){const fr=st.subs.filter(s=>!s.t),used=subUsed(),left=Math.max(0,MAXCH-used),
chipB=(v,l,n)=>`<button class="sm ${st.dept==v?"":"ghost"}" onclick="st.dept='${v}';render()">${esc(l)} (${n})</button>`;
return`<h2>Choose your subjects</h2><p class="mu">Every free subject of every department is listed here. Tick the ones you want to teach, then press Done to choose your lecture days and times.</p>
<div class="row">${stat("Available subjects",fr.length)}${stat("Selected now",st.pick.length)}${stat("Credit hours left",left+" / "+MAXCH)}</div>
<div class="bar" style="margin:0 0 12px"><i style="width:${Math.min(100,used*100/MAXCH)}%"></i></div>
<div class="card"><div class="fl"><label style="flex:1;min-width:200px">Search subject<input id="sq" type="search" placeholder="e.g. Algorithms, Networks, Sem 5" value="${esc(st.q)}" oninput="st.q=this.value;$('#sl').innerHTML=subList()"></label><label class="lvb" style="padding-bottom:8px"><input type="checkbox" ${st.av?"checked":""} onchange="st.av=this.checked?1:0;render()"> Only available subjects</label></div>
<p style="margin:10px 0 0">${chipB("","All departments",fr.length)} ${st.depts.map(d=>chipB(d,d,fr.filter(s=>s.d==d).length)).join(" ")}</p></div>
<div id="sl">${subList()}</div>
<div class="pkbar"><span><b>${st.pick.length}</b> selected · ${used} / ${MAXCH} credit hours</span><button onclick="done()">Done (${st.pick.length} selected)</button></div>`}
