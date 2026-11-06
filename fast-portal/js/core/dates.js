/* Date + time-format helpers */
const ld=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const TODAY=ld(new Date()),WD=(d=>d>4?0:d)((new Date().getDay()+6)%7),WKND=((new Date().getDay()+6)%7)>4;
const dix=s=>(new Date(s+"T00:00:00").getDay()+6)%7;
const MD=m=>{const h=Math.floor(m/60)%24;return(h%12||12)+":"+String(m%60).padStart(2,"0")+" "+(h>=12?"PM":"AM")};
