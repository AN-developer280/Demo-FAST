/* Data layer (MOCK). Pages should call these functions instead of reading `st` directly.
   Today they read the demo data in `st`. When the backend is ready, replace the body of each
   function with a fetch() call; the pages stay the same. See docs/DATA_CONTRACT.md. */
const API_BASE="";/* e.g. "https://api.fast.edu" once the backend exists */
const ok=v=>Promise.resolve(JSON.parse(JSON.stringify(v===undefined?null:v)));
const bad=m=>Promise.reject(new Error(m));
/* Real version of every function:  return http("POST","/diary",body)  */
function http(method,path,body){return fetch(API_BASE+path,{method,headers:{"Content-Type":"application/json",...(st.token?{Authorization:"Bearer "+st.token}:{})},body:body?JSON.stringify(body):undefined}).then(r=>r.ok?r.json():r.json().then(e=>Promise.reject(new Error(e.message||"Request failed"))))}

const api={
 /* ---- auth ---- */
 login(email,password){email=(email||"").trim().toLowerCase();if(email==ADM.u&&password==ADM.p)return ok({role:"admin",name:"Admin"});const t=st.teachers.find(x=>x.email.toLowerCase()==email&&x.pw==password);if(!t)return bad("Incorrect email or password. New teachers can register themselves.");if(t.restricted)return bad("Your access is restricted by the admin.");return ok({role:"teacher",name:t.n})},
 /* ---- teacher (always "my" data; the server knows who I am from the token) ---- */
 getMySubjects(){return ok(st.subs.filter(s=>s.t==st.me))},
 getMyTimetable(){return ok(st.tt.filter(x=>x.t==st.me))},
 getMySyllabus(subjectId){return ok(st.plan[subjectId]||[])},
 getMyDiary(subjectId){return ok(st.dlog.filter(x=>x.t==st.me&&x.sid==subjectId))},
 getMyRequests(){return ok(st.reqs.filter(r=>r.t==st.me))},
 getMyNotifications(){return ok(st.notes.filter(n=>n.to==st.me))},
 getAnnouncements(){const d=(st.teachers.find(t=>t.n==st.me)||{}).dept;return ok(st.ann.filter(a=>a.a=="All"||a.a==d))},
 /* write calls: for now they call the existing demo actions */
 submitDiary(){subDiary();return ok(true)},
 saveAttendance(){saveAtt();return ok(true)},
 /* ---- admin ---- */
 listTeachers(){return ok(st.teachers.map(({pw,...t})=>t))},
 setTeacherRestricted(i){restrictT(i);return ok(true)},
 listSubjects(f={}){return ok(st.subs.filter(s=>(!f.d||s.d==f.d)&&(!f.sem||s.sem==f.sem)))},
 listRequests(){return ok(st.reqs)},
 decideRequest(id,status){decide(id,status);return ok(true)},
 getTeacherDashboard(name){return ok({teacher:st.teachers.find(t=>t.n==name),subjects:st.subs.filter(s=>s.t==name),timetable:st.tt.filter(x=>x.t==name)})}
};
