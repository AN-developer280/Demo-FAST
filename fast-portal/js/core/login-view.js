/* Login screen (styled with Tailwind utility classes) */
function loginView(){
 const a=st.lt=="admin",
 tab=on=>`cursor-pointer rounded-full border px-4 py-1.5 ${on?"border-transparent bg-gradient-to-r from-fast-ac to-fast-ac2 text-white":"border-fast-bd bg-white/60 text-fast-tx"}`,
 field="mb-2.5 flex flex-col gap-1 text-left text-xs text-fast-mu";
 return `<div class="mx-auto my-[6vh] w-full max-w-[430px] px-3 text-center">
 <img class="logo-img" src="assets/logo.svg" alt="FAST logo">
 <h2 class="text-2xl font-bold text-fast-pr">FAST Portal</h2>
 <p class="mb-1 font-semibold text-fast-ac">Faculty and Admin Scheduling Tool</p>
 <p class="mu mb-3">Restricted access — only registered users can log in.</p>
 <div class="mb-3 flex justify-center gap-2"><a class="${tab(a)}" onclick="st.lt='admin';st.err='';st.pre='';render()">Admin</a><a class="${tab(!a)}" onclick="st.lt='teacher';st.err='';render()">Teacher</a></div>
 <div class="card text-left"><label class="${field}">Email<input id="lu" type="email" value="${a?"":esc(st.pre)}" placeholder="${a?"admin@fast.edu":"teacher@fast.edu"}"></label><label class="${field}">Password<input id="lp" type="password" onkeydown="if(event.key=='Enter')doLogin()"></label>${st.err?`<div class="err">${st.err}</div>`:""}<button class="w-full" onclick="doLogin()">Login as ${a?"Admin":"Teacher"}</button></div>
 ${a?"":`<p class="mb-2 text-sm">New teacher? <a onclick="st.reg=1;st.rerr='';st.err='';render()"><b>Apply with your CV</b></a></p>`}<small class="mu">Demo — Admin: admin@fast.edu / admin123<br>Teacher: areeba@fast.edu / areeba123</small>
 <p class="mt-2"><a onclick="st.landing=1;st.err='';render()">← Home</a> &nbsp;·&nbsp; <a onclick="theme()">🌓 Theme</a></p><div class="wv login-wv"></div></div>`}

/* Public home page: logo, name and one Login button */
function homeView(){return`<div class="home"><div class="hn"><span class="hb"><img src="assets/logo.svg" alt="FAST logo"><b>FAST</b></span><a onclick="theme()">🌓 Theme</a></div>
<div class="hero"><img class="hlogo" src="assets/logo.svg" alt="FAST logo"><h1>FAST</h1><p class="hs">Faculty and Admin Scheduling Tool</p><p class="mu">Timetables, syllabus, diary and attendance in one place.</p><button class="hbtn" onclick="st.landing=0;st.err='';render()">Login</button><a onclick="st.landing=0;st.reg=1;st.rerr='';render()">New teacher? Apply with your CV</a><small class="mu">Teachers can apply online or be registered by the admin.</small>
<div class="steps"><div><b>1</b><span>Register &amp; upload your CV</span></div><i>→</i><div><b>2</b><span>Management reviews &amp; approves</span></div><i>→</i><div><b>3</b><span>Log in to your teacher dashboard</span></div></div></div>
<div class="wv login-wv hw"></div><div class="hf mu">© FAST · Faculty and Admin Scheduling Tool</div></div>`}

/* Teacher application screen: form + CV upload; after sending it shows "under review" */
function regView(){if(st.done_app)return`<div class="mx-auto my-[8vh] w-full max-w-[520px] px-3 text-center"><img class="logo-img" src="assets/logo.svg" alt="FAST logo"><h2 class="text-2xl font-bold text-fast-pr">Application sent ✅</h2>
<div class="card text-left"><p>Thank you! Your registration and CV were sent to the management.</p><div class="steps sm"><div class="ok"><b>1</b><span>Registered + CV</span></div><i>→</i><div class="now"><b>2</b><span>Under review</span></div><i>→</i><div><b>3</b><span>Login</span></div></div><p class="mu">Once the management approves, log in with <b>${esc(st.done_app)}</b> and your password. Your teacher dashboard opens straight away.</p><button class="w-full" onclick="st.pre=st.done_app;st.done_app=0;st.reg=0;st.lt='teacher';st.err='';render()">Go to Login</button></div></div>`;
const f=st.rf||{},v=k=>esc(f[k]||""),fld="flex flex-col gap-1 text-left text-xs text-fast-mu";
return`<div class="mx-auto my-[4vh] w-full max-w-[640px] px-3 text-center"><img class="logo-img" src="assets/logo.svg" alt="FAST logo"><h2 class="text-2xl font-bold text-fast-pr">Apply as a Teacher</h2>
<p class="mu mb-3">Register and upload your CV. After the management approves it, you can log in to your teacher dashboard.</p>
<div class="steps sm"><div class="now"><b>1</b><span>Register + CV</span></div><i>→</i><div><b>2</b><span>Approval</span></div><i>→</i><div><b>3</b><span>Login</span></div></div>
<div class="card text-left">${st.rerr?`<div class="al ${st.rdup?"":"er"}">${st.rerr}${st.rdup?`<br><button onclick="st.reg=0;st.lt='teacher';st.err='';render()">Go to Login</button>`:""}</div>`:""}
<div class="fg"><label class="${fld}">Full name *<input id="sn" value="${v("n")}" autocomplete="name"></label><label class="${fld}">Email (your login ID) *<input id="se" type="email" value="${v("e")}" autocomplete="email"></label>
<label class="${fld}">Password * (min 6)<input id="sw" type="password" autocomplete="new-password"></label><label class="${fld}">Confirm password *<input id="sw2" type="password" autocomplete="new-password"></label>
<label class="${fld}">Department *<select id="sd"><option value="">Select department</option>${st.depts.map(d=>`<option ${f.d==d?"selected":""}>${esc(d)}</option>`).join("")}</select></label>
<label class="${fld}">Designation<select id="sg">${opts(["Lecturer","Assistant Professor","Associate Professor","Professor"],f.des)}</select></label>
<label class="${fld}">Phone<input id="sp" value="${v("ph")}" placeholder="03xx-xxxxxxx"></label><label class="${fld}">CNIC<input id="sc" value="${v("cn")}" placeholder="xxxxx-xxxxxxx-x"></label>
<label class="${fld}">Qualification<input id="sq2" value="${v("q")}" placeholder="e.g. MS Computer Science"></label><label class="${fld}">Joining date<input id="sj" type="date" value="${f.jd||TODAY}"></label></div>
<label class="${fld}" style="margin-bottom:12px">Upload your CV * (PDF, DOC or DOCX, max 2 MB)<input id="scv" type="file" accept=".pdf,.doc,.docx" onchange="cvPick(this)"></label>${st.cv?`<p class="am ok" style="margin:-6px 0 12px">📎 ${esc(st.cv.name)} · ${Math.max(1,Math.round(st.cv.size/1024))} KB attached</p>`:""}
<button class="w-full" onclick="regSelf()">Submit application</button></div>
<p class="mt-3">Already applied or registered? <a onclick="st.reg=0;st.lt='teacher';st.err='';render()"><b>Log in</b></a> &nbsp;·&nbsp; <a onclick="st.reg=0;st.landing=1;render()">← Home</a> &nbsp;·&nbsp; <a onclick="theme()">🌓 Theme</a></p></div>`}
