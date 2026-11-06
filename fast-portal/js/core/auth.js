/* Restricted login, session enter/exit, navigation, logout */
function doLogin(){const u=$("#lu").value.trim().toLowerCase(),p=$("#lp").value;st.err="";if(st.lt=="admin"){if(u==ADM.u&&p==ADM.p)return enter("admin");st.err="Incorrect admin email or password."}else{const t=st.teachers.find(x=>x.email.toLowerCase()==u&&x.pw==p),ap=!t&&st.apps.find(x=>x.email.toLowerCase()==u&&x.pw==p);if(ap&&ap.s=="Pending")st.err="⏳ Your application is under review. You can log in as soon as the management approves it.";else if(ap&&ap.s=="Rejected")st.err="Your application was not approved."+(ap.why?" Reason: "+esc(ap.why):"")+" Please contact the administration.";else if(!t)st.err=`Incorrect email or password. If you are a new teacher, <a onclick="st.reg=1;st.rerr='';st.err='';render()">register here</a>.`;else if(t.restricted)st.err="Your access is restricted by the admin. Please contact the administration.";else{st.me=t.n;t.on=1;t.dev=(t.dev||0)+1;return enter("teacher")}}render()}
function enter(r){st.role=r;st.td=TODAY;st.vt=0;st.err="";st.page=r=="admin"?"Dashboard":me().done?"Home":"Department";render()}
function go(p){document.body.classList.remove("nav");exitV();st.rp=0;st.page=p;st.ed=-1;render()}
const nav=p=>st.vt?(st.vp=p,render()):go(p);
function exitV(){if(st.vt){st.me=st.real;st.vt=0;st.dept="";st.pick=[];st.sch=null}}
function logout(){exitV();if(st.role=="teacher"){const t=me();if(t){t.on=0;t.dev=0}}st.role="";st.landing=1;st.reg=0;st.pre="";render()}

/* ---------- Teacher application: register + CV -> admin approves -> teacher can log in ----------
   Application = {id,n,email,pw,ph,cn,dept,des,q,jd,cv:{name,size,data},at,s:"Pending"|"Approved"|"Rejected",why}.
   Approval (appDecide in admin/actions.js) creates the real teacher account. Duplicates are checked against teachers AND open applications. */
const cnd=s=>String(s||"").replace(/\D/g,""),maskE=e=>{const[a,b]=String(e).split("@");return a.slice(0,2)+"***@"+(b||"")};
const CVMAX=2*1024*1024,CVEXT=/\.(pdf|doc|docx)$/i;
function regFail(m){st.rerr=m;st.rdup=0;render();toast("Application not sent")}
function cvPick(inp){const f=inp.files&&inp.files[0];if(!f){st.cv=null;return render()}
if(!CVEXT.test(f.name))return(st.cv=null,regFail("CV must be a PDF, DOC or DOCX file."));if(f.size>CVMAX)return(st.cv=null,regFail("CV is too large. Maximum size is 2 MB."));
const r=new FileReader();r.onload=()=>{st.cv={name:f.name,size:f.size,data:r.result};st.rerr="";regKeep();render()};r.readAsDataURL(f)}
function regKeep(){const g=i=>($("#"+i)?$("#"+i).value:"").trim();st.rf={n:g("sn").replace(/\s+/g," "),e:g("se").toLowerCase(),d:g("sd"),ph:g("sp"),cn:g("sc"),des:g("sg"),q:g("sq2"),jd:g("sj")};return st.rf}
function regSelf(){const f=regKeep(),pw=$("#sw").value,pw2=$("#sw2").value;st.rerr="";st.rdup=0;
if(!f.n||!f.e||!f.d||!pw)return regFail("Name, email, department and password are required.");
if(!/^\S+@\S+\.\S+$/.test(f.e))return regFail("Enter a valid email address.");
if(f.cn&&cnd(f.cn).length!=13)return regFail("CNIC must have 13 digits (xxxxx-xxxxxxx-x).");
if(pw.length<6)return regFail("Password must be at least 6 characters.");
if(pw!=pw2)return regFail("The two passwords do not match.");
if(!st.cv)return regFail("Please upload your CV (PDF, DOC or DOCX, max 2 MB).");
const open=st.apps.filter(x=>x.s!="Rejected"),T=[...st.teachers.map(t=>({...t,k:"t"})),...open.map(t=>({...t,k:"a"}))],
byE=T.find(t=>t.email.toLowerCase()==f.e),byC=f.cn&&T.find(t=>t.cn&&cnd(t.cn)==cnd(f.cn)),byN=T.find(t=>t.n.toLowerCase()==f.n.toLowerCase()),x=byE||byC||byN;
if(x){const why=byE?"this email":byC?"this CNIC":"this name",e=byE?x.email:maskE(x.email);st.rdup=1;st.pre=x.email;
st.rerr=x.k=="a"?`<b>Your application is already submitted.</b> We found a pending application with ${why} (${esc(e)}). Please wait for the management decision, then log in.`
:`<b>You are already registered ${(x.src||"admin")=="admin"?"by the admin":"earlier"}.</b> We found an account with ${why} (login email: <b>${esc(e)}</b>). A second account cannot be created. Please log in with that email${(x.src||"admin")=="admin"?". If you do not know the password, ask the admin to reset it":""}.`;render();toast("Already registered");return}
const ap={id:Date.now(),n:f.n,email:f.e,pw,ph:f.ph,cn:f.cn,dept:f.d,des:f.des,q:f.q,jd:f.jd,cv:st.cv,at:TODAY,s:"Pending",why:""};st.apps.unshift(ap);
notify("Admin",`New teacher application: ${ap.n} (${ap.dept}). CV attached. Please review it in Applications.`);
st.cv=null;st.rf={};st.rerr="";st.rdup=0;st.done_app=ap.email;render()}
