/* Admin actions: view-as-teacher, decide requests, restrict / allow teacher, reassign, edit lecture */
function openV(i){exitV();st.real=st.me;st.me=st.teachers[i].n;st.vt=1;st.vp="Home";st.sel=0;st.dept="";st.pick=[];st.page="Teacher Dashboards";render()}
function decide(id,s){const r=st.reqs.find(x=>x.id==id);r.s=s;notify(r.t,`Your ${r.type} was ${s}`);render()}
function restrictT(i){const t=st.teachers[i];t.restricted=!t.restricted;if(t.restricted){t.on=0;t.dev=0}notify(t.n,t.restricted?"Your portal access was restricted by the admin":"Your portal access was restored by the admin");render();toast(t.restricted?t.n+" is restricted: logged out and cannot log in":t.n+"'s access restored")}
function reas(id,t){const s=sub(id);st.tt=st.tt.filter(x=>x.sub!=id);s.t=t||undefined;if(t){gen(t);notify(t,`Admin assigned you ${s.n}`)}render()}
function saveE(){const e=st.tt[st.ed],d=+$("#ed").value,s=tget("es"),en=tget("ee");if(en<=s)return toast("End time must be after start time");if(!free(e.t,sub(e.sub),d,{s,e:en},e))return toast("Conflict: the teacher or class is busy at that time");e.d=d;e.c=[s,en];e.pin=1;notify(e.t,`Admin moved ${sub(e.sub).n} to ${D[d]} ${MD(s)}–${MD(en)}`);st.ed=-1;render();toast("Saved and pinned")}

/* Applications: approving creates the real teacher account (they can log in at once); rejecting stores a reason shown at login */
function appDecide(id,s){const a=st.apps.find(x=>x.id==id);if(!a||a.s!="Pending")return;let why="";
if(s=="Rejected"){if(typeof prompt=="function"){const w=prompt(`Reason for rejecting ${a.n} (shown to the applicant, optional):`);if(w===null)return;why=w}}
if(s=="Approved"){if(st.teachers.some(t=>t.email.toLowerCase()==a.email.toLowerCase()||t.n.toLowerCase()==a.n.toLowerCase()))return toast("A teacher with this email or name already exists");
st.teachers.push({n:a.n,email:a.email,pw:a.pw,ph:a.ph,cn:a.cn,dept:a.dept,des:a.des,q:a.q,jd:a.jd,done:0,src:"self",cv:a.cv});notify(a.n,"Welcome to FAST Portal. Please select your subjects.")}
a.s=s;a.why=why.trim();a.on=TODAY;render();toast(s=="Approved"?`${a.n} approved. They can log in now`:`${a.n} rejected`)}

/* Applications block shown on the admin Teachers page: pending first (with CV + Approve/Reject), then decided ones */
function appList(){const A=st.apps,P=A.filter(x=>x.s=="Pending"),D=A.filter(x=>x.s!="Pending"),cv=x=>x.cv?`<a href="${x.cv.data}" download="${esc(x.cv.name)}">📎 ${esc(x.cv.name)}</a>`:"—",
card=x=>`<div class="card"><b>${esc(x.n)}</b> ${chip(x.s,x.s=="Approved"?"ok":x.s=="Rejected"?"er":"")} <span class="mu">applied ${x.at}</span><div class="fg" style="margin:10px 0"><span>📧 ${esc(x.email)}</span><span>🏫 ${esc(x.dept)} · ${esc(x.des||"")}</span><span>📞 ${esc(x.ph||"—")}</span><span>🪪 ${esc(x.cn||"—")}</span><span>🎓 ${esc(x.q||"—")}</span><span>📅 Joining: ${esc(x.jd||"—")}</span></div><p>CV: ${cv(x)}</p>`+(x.s=="Pending"?`<button onclick="appDecide(${x.id},'Approved')">Approve</button> <button class="red" onclick="appDecide(${x.id},'Rejected')">Reject</button>`:x.s=="Rejected"&&x.why?`<small class="mu">Reason: ${esc(x.why)}</small>`:"")+`</div>`;
return`<h3>New applications ${P.length?chip(P.length+" pending","er"):""}</h3>`+(P.map(card).join("")||'<p class="mu">No pending applications.</p>')+(D.length?`<details><summary class="mu" style="cursor:pointer;margin-bottom:8px">Decided applications (${D.length})</summary>${D.map(card).join("")}</details>`:"")}
