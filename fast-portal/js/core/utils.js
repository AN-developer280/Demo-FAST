/* Shared helpers: DOM, escaping, toast, chips, lookups */
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])),sub=id=>st.subs.find(s=>s.id==id),me=()=>st.teachers.find(x=>x.n==st.me),mine=()=>st.subs.filter(s=>s.t==st.me);
const toast=m=>{const t=$("#toast");t.textContent=m;t.style.display="block";clearTimeout(toast.h);toast.h=setTimeout(()=>t.style.display="none",3500)};
const notify=(to,m)=>st.notes.unshift({to,m}),stat=(l,v)=>`<div class="st"><b>${v}</b><span>${l}</span></div>`,chip=(t,c="")=>`<span class="chip ${c}">${t}</span>`;
const opts=(a,v)=>a.map(x=>`<option ${x==v?"selected":""}>${esc(x)}</option>`).join("");
