/* Teacher actions: diary, attendance, requests */
function dTick(i,c){st.dsel=c?[...new Set([...st.dsel,i])].sort((a,b)=>a-b):st.dsel.filter(x=>x!=i);if(!(st.dtx||"").trim()||st.dtx==st.dauto){st.dauto=dAuto();st.dtx=st.dauto}render()}
function subDiary(){const s=sub(st.sel),pl=st.plan[s.id],sel=st.dsel.filter(i=>pl[i]&&pl[i].s=="pending"),tx=(st.dtx||"").trim()||dAuto();if(!tx)return toast("Write your diary entry or tick a topic");
sel.forEach((i,n)=>{pl[i].s="done";pl[i].dt=TODAY;pl[i].hw=st.hw||"";pl[i].lg=1;if(!n)pl[i].dn=tx});st.dlog.unshift({t:st.me,sid:s.id,dt:TODAY,tps:sel.map(i=>pl[i].tp),tx,hw:st.hw||""});
notify("Admin",sel.length?`${st.me} submitted diary: ${sel.map(i=>pl[i].tp).join("; ")}`:`${st.me} submitted diary for ${s.n} (no syllabus topic)`);st.dsel=[];st.dtx="";st.dauto="";st.hw="";render();toast(sel.length?"Diary submitted. Topic marked Done":"Diary submitted")}
function aSet(i,v){asv()[i]=v;st.sum=null;render()}
function attSum(){const c=attC();st.sum=`${c.P} Present, ${c.L} Leave, ${c.A} Absent`;render()}
function saveAtt(){const A=asv(),c=attC();st.att.unshift({t:st.me,s:sub(st.sel).n,dt:TODAY,p:c.P,a:c.A,l:c.L,an:ST.filter((_,i)=>A[i]=="A"),ln:ST.filter((_,i)=>A[i]=="L")});st.sum=null;st.as=null;render();toast("Attendance saved")}
function sendReq(){const t=$("#rt").value,x=$("#rx").value.trim();if(!x)return toast("Please write the details");st.reqs.unshift({id:Date.now(),t:st.me,type:t,txt:x,s:"Pending"});notify("Admin",`New ${t} from ${st.me}`);render();toast("Sent to admin")}
