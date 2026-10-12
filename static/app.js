const $=id=>document.getElementById(id), audio=$("audio");
let results=[], playlist=JSON.parse(localStorage.getItem("darkwave-playlist")||"[]"), playingList=[], playingIndex=-1, token=0;
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function save(){localStorage.setItem("darkwave-playlist",JSON.stringify(playlist));}
function render(items,target,isPlaylist=false){
 const el=$(target);el.innerHTML="";
 items.forEach((t,i)=>{const row=document.createElement("div");row.className="track";
 row.innerHTML=`<img src="${esc(t.artwork)}" alt=""><div class="info"><b>${esc(t.title)}</b><small>${esc(t.artist)}${t.album?" · "+esc(t.album):""}</small></div><button class="playTrack">▶</button><button class="add">${isPlaylist?"HAPUS":"+ SIMPAN"}</button>`;
 row.querySelector("img").onerror=e=>e.target.style.visibility="hidden";
 row.querySelector(".playTrack").onclick=()=>play(items,i);
 row.querySelector(".add").onclick=()=>{if(isPlaylist){playlist.splice(i,1);save();renderPlaylist();}else if(!playlist.some(p=>String(p.id)===String(t.id))){playlist.push(t);save();renderPlaylist();}else message("Lagu sudah ada di playlist.");};
 el.appendChild(row);});
}
function message(s){$("message").textContent=s;$("message").style.display="block";}
function renderPlaylist(){render(playlist,"playlist",true);$("empty").style.display=playlist.length?"none":"block";}
$("search-form").onsubmit=async e=>{e.preventDefault();const q=$("query").value.trim(),mine=++token;if(!q)return;
 $("list-title").textContent="Hasil pencarian";$("results").innerHTML="";message("Lagi mencari lagu...");
 try{const r=await fetch("/api/search?q="+encodeURIComponent(q)),data=await r.json();if(mine!==token)return;if(!r.ok)throw Error(data.error||"Pencarian gagal.");
 results=data.results||[];$("message").style.display=results.length?"none":"block";if(!results.length)message("Belum ada hasil. Coba kata kunci lain.");render(results,"results");
 }catch(err){if(mine===token)message(err.message||"Koneksi bermasalah. Coba lagi.");}};
function play(list,i){if(!list.length)return;playingList=list;playingIndex=i;const t=list[i];audio.src=t.preview;$("title").textContent=t.title;$("artist").textContent=t.artist;$("art").src=t.artwork||"";
 audio.play().then(()=>$("play").textContent="Ⅱ").catch(()=>message("Audio belum bisa diputar. Coba lagu lain."));}
function next(n){if(playingList.length)play(playingList,(playingIndex+n+playingList.length)%playingList.length);}
$("play").onclick=()=>{if(!audio.src){if(results.length)play(results,0);else if(playlist.length)play(playlist,0);}else if(audio.paused)audio.play().catch(()=>{});else audio.pause();};
$("next").onclick=()=>next(1);$("prev").onclick=()=>next(-1);audio.onended=()=>next(1);
audio.onplay=()=>$("play").textContent="Ⅱ";audio.onpause=()=>$("play").textContent="▶";
function fmt(s){s=Number.isFinite(s)?s:0;return Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0");}
audio.ontimeupdate=()=>{$("progress").max=audio.duration||30;$("progress").value=audio.currentTime;$("time").textContent=fmt(audio.currentTime);$("duration").textContent=fmt(audio.duration||30);};
$("progress").oninput=()=>{if(Number.isFinite(audio.duration))audio.currentTime=+$("progress").value;};
$("volume").oninput=()=>audio.volume=+$("volume").value;audio.volume=.8;
$("clear").onclick=()=>{playlist=[];save();renderPlaylist();};renderPlaylist();
