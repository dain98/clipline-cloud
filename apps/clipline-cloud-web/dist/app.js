var Xt={ChampionKill:"kill",FirstBlood:"kill",Multikill:"spree",Ace:"spree",DragonKill:"objective",HeraldKill:"objective",BaronKill:"objective",TurretKilled:"structure",InhibKilled:"structure",FirstBrick:"structure"};function ct(e){let t=Number(e);return Number.isFinite(t)&&t>0?t/1e3:0}function Re(e,t){let a=Number.isFinite(e)?e:0,n=t>0?t:Number.MAX_SAFE_INTEGER;return Math.max(0,Math.min(n,a))}function te(e,t){return t>0?Math.max(0,Math.min(100,e/t*100)):0}function pe(e){if(!Number.isFinite(e))return"0:00";let t=Math.max(0,Math.round(e)),a=Math.floor(t/60),n=t-a*60;return`${a}:${String(n).padStart(2,"0")}`}function lt(e){if(!Number.isFinite(e))return"0:00.0";let t=Math.max(0,Math.round(e*10)),a=Math.floor(t/600),n=t-a*600,i=Math.floor(n/10);return`${a}:${String(i).padStart(2,"0")}.${n%10}`}function dt(e,t){return`${lt(e)} / ${t>0?lt(t):"0:00.0"}`}function Yt(e){return Xt[e]||"info"}function qe(e,t){return(e||[]).map((a,n)=>{let i=Number(a.timestamp_ms);if(!Number.isFinite(i))return null;let s=i/1e3;return s<0||t>0&&s>t?null:{index:n,time:s,kind:String(a.kind||"Marker"),label:String(a.label||a.kind||"Marker"),category:Yt(a.kind)}}).filter(Boolean).sort((a,n)=>a.time-n.time)}function ut(e){return e.length?e.length===1?"1 marker":`${e.length} markers`:"No markers"}function pt(e,t){if(!e.length)return null;for(let a of e)if(a.time>t+.05)return a;return e[0]}function mt(e,t){if(!e.length)return null;for(let a=e.length-1;a>=0;a-=1)if(e[a].time<t-.05)return e[a];return e[e.length-1]}function bt(e,t){switch(e){case"Space":case"KeyK":return{kind:"toggle-play"};case"ArrowLeft":return{kind:"seek-by",seconds:t?-1:-5};case"ArrowRight":return{kind:"seek-by",seconds:t?1:5};case"KeyJ":return{kind:"seek-by",seconds:-10};case"KeyL":return{kind:"seek-by",seconds:10};case"Comma":return{kind:"seek-by",seconds:-.1};case"Period":return{kind:"seek-by",seconds:.1};case"KeyM":return{kind:t?"previous-marker":"next-marker"};case"Home":return{kind:"seek-to",seconds:0};case"End":return{kind:"seek-to-end"};case"KeyF":return{kind:"fullscreen"};case"KeyT":return{kind:"theater"};default:return null}}var fe=document.querySelector("#app"),Mt="clipline.sidebarCollapsed",Lt="clipline.playerVolume",Ct="clipline.clipTheaterMode",he=null,P=0,r={user:null,csrfToken:null,flash:null,sidebarCollapsed:na(),clipTheaterMode:oa(),selectedClipIds:new Set,libraryQuery:{sort:"uploaded_at_desc",game:"",source_type:"",visibility:"",status:"",q:"",from:"",to:"",min_duration_seconds:"",max_duration_seconds:"",min_size_mib:"",max_size_mib:"",group:"none"},publicQuery:{sort:"uploaded_at_desc",game:"",q:"",page:1},publicGames:[],adminResetLink:null},yt={alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',clipboard:'<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',copy:'<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',external:'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',fastForward:'<path d="m13 19 9-7-9-7v14Z"/><path d="m2 19 9-7-9-7v14Z"/>',film:'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 8h4"/><path d="M3 16h4"/><path d="M17 8h4"/><path d="M17 16h4"/>',fullscreen:'<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/><path d="M12 2a15.3 15.3 0 0 0 0 20"/>',home:'<path d="m3 10 9-7 9 7"/><path d="M5 8.5V20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5"/><path d="M9 22V12h6v10"/>',info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',library:'<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',lock:'<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',logOut:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',menu:'<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',message:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>',notepad:'<path d="M8 2v4"/><path d="M16 2v4"/><path d="M3 10h18"/><path d="M6 4h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/><path d="M8 14h8"/><path d="M8 18h5"/>',pause:'<path d="M8 5v14"/><path d="M16 5v14"/>',play:'<path d="m8 5 11 7-11 7V5Z"/>',plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',check:'<path d="M20 6 9 17l-5-5"/>',refresh:'<path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/><path d="M3 12A9 9 0 0 1 18.5 5.7L21 8"/><path d="M21 3v5h-5"/>',rewind:'<path d="m11 19-9-7 9-7v14Z"/><path d="m22 19-9-7 9-7v14Z"/>',save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',server:'<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',skipBack:'<path d="M19 20 9 12l10-8v16Z"/><path d="M5 19V5"/>',skipForward:'<path d="m5 4 10 8-10 8V4Z"/><path d="M19 5v14"/>',shield:'<path d="M20 13c0 5-3.5 7.5-7.7 8.8a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V5l8-3 8 3v8Z"/>',sliders:'<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>',theater:'<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M6 9h12"/><path d="M6 15h12"/>',trash:'<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',volume2:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9 9 0 0 1 0 14"/>',volumeX:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>',x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'};window.addEventListener("popstate",ve);document.addEventListener("click",ea);ve();async function ve(){let e=++P,t=R(),a=()=>_(e,t),n=I();if(pa(n.name),n.name==="public"){if(!r.user&&(await O(),!a()))return;await D(n.shareId);return}if(n.name==="publicLibrary"||n.name==="publicGame"){if(!r.user&&(await O(),!a()))return;await ga(n);return}if(n.name==="about"){if(!r.user&&(await O(),!a()))return;await Ra();return}if(n.name==="publicUser"){if(!r.user&&(await O(),!a()))return;await Ea(n.username);return}if(n.name==="login"){if(r.user){C("/library");return}Tt();return}if(n.name==="resetPassword"){n.invite?await ta(n.token,a):He(n.token,!1);return}if(!r.user){let i=await O();if(!a())return;if(!i){C("/login");return}}if(n.name==="clip")await q(n.clipId);else if(n.name==="profile")await z();else if(n.name==="admin"){if(!xt()){p("Admin access is required.","error"),C("/library");return}await N(n.tab)}else n.name==="account"?await ie():await A()}function I(){let e=window.location.pathname;if(e.startsWith("/c/"))return{name:"public",shareId:me(e.slice(3))};if(e==="/"||e==="/public"||e==="/search")return{name:"publicLibrary",query:Fe()};if(e.startsWith("/game/"))return{name:"publicGame",game:me(e.slice(6)),query:Fe()};if(e==="/about")return{name:"about"};if(e.startsWith("/u/"))return{name:"publicUser",username:me(e.slice(3))};if(e==="/library")return{name:"library"};if(e.startsWith("/clip/"))return{name:"clip",clipId:me(e.slice(6))};if(e==="/admin")return{name:"admin",tab:new URLSearchParams(window.location.search).get("tab")||"overview"};if(e==="/account")return{name:"account"};if(e==="/profile")return{name:"profile"};if(e==="/login")return{name:"login"};if(e==="/reset-password"){let t=new URLSearchParams(window.location.search);return{name:"resetPassword",token:t.get("token")||"",invite:t.get("invite")==="1"}}return{name:"publicLibrary"}}function R(){return`${window.location.pathname}${window.location.search}`}function _(e,t){return e===P&&t===R()}function me(e){try{return decodeURIComponent(e)}catch{return e}}function C(e){window.history.pushState({},"",e),ve()}async function E(e,t){e.preventDefault();let a=e.submitter;if(a?.dataset.submitting!=="true"){a&&(a.dataset.submitting="true",a.disabled=!0);try{await t()}finally{a?.isConnected&&(a.disabled=!1,delete a.dataset.submitting)}}}function Fe(){let e=new URLSearchParams(window.location.search),t=Number(e.get("page")||1);return{sort:e.get("sort")||"uploaded_at_desc",game:e.get("game")||"",q:e.get("q")||"",page:Number.isFinite(t)?Math.max(1,t):1}}function ea(e){let t=e.target.closest("[data-route]");if(t){e.preventDefault(),C(t.getAttribute("href"));return}let a=e.target.closest("[data-copy]");a&&(e.preventDefault(),pi(a.dataset.copy))}async function O(){try{let e=await m("/api/v1/auth/me");return r.user=e.user,r.csrfToken=e.csrf_token,!0}catch{return r.user=null,r.csrfToken=null,!1}}async function m(e,t={}){let a=(t.method||"GET").toUpperCase(),n=new Headers(t.headers||{});n.set("Accept","application/json");let i=t.body;i&&typeof i!="string"&&(n.set("Content-Type","application/json"),i=JSON.stringify(i)),!["GET","HEAD","OPTIONS"].includes(a)&&r.csrfToken&&n.set("X-CSRF-Token",r.csrfToken);let s=await fetch(e,{...t,body:i,credentials:"same-origin",headers:n,method:a}),y=(s.headers.get("content-type")||"").includes("application/json")?await s.json():await s.text();if(!s.ok){let $=typeof y=="object"&&y&&y.error?y.error:s.statusText;throw new Error($||"Request failed")}return y}function Tt(e=""){ne(),fe.innerHTML=`
    <main class="login-shell">
      <section class="login-panel" aria-labelledby="login-title">
        <div class="brand-mark" aria-hidden="true">CL</div>
        <h1 id="login-title">Clipline Cloud</h1>
        <p>Sign in with an account created by this instance's admin.</p>
        ${e?`<div class="error-box">${o(e)}</div>`:""}
        <form id="login-form" class="section" autocomplete="on">
          <label class="field">
            <span>Username</span>
            <input name="username" autocomplete="username" required>
          </label>
          <label class="field">
            <span>Password</span>
            <input name="password" type="password" autocomplete="current-password" required>
          </label>
          <button class="btn-primary" type="submit">${c("lock")} Sign in</button>
        </form>
      </section>
    </main>
  `,document.querySelector("#login-form").addEventListener("submit",t=>E(t,async()=>{let a=new FormData(t.currentTarget);try{let n=await m("/api/v1/auth/login",{method:"POST",body:{username:String(a.get("username")||""),password:String(a.get("password")||"")}});r.user=n.user,r.csrfToken=n.csrf_token,C("/library")}catch(n){Tt(n.message)}}))}function He(e,t=!1,a=""){let n=t?"Create Account":"Set Password",i=t?"Choose your Clipline Cloud account details.":"Choose a new password for your Clipline Cloud account.";ne(),fe.innerHTML=`
    <main class="login-shell">
      <section class="login-panel" aria-labelledby="reset-title">
        <div class="brand-mark" aria-hidden="true">CL</div>
        <h1 id="reset-title">${o(n)}</h1>
        <p>${o(i)}</p>
        ${a?`<div class="error-box">${o(a)}</div>`:""}
        ${e?`<form id="reset-password-form" class="section" autocomplete="on">
                ${t?`<label class="field">
                        <span>Username</span>
                        <input name="username" autocomplete="username" required>
                      </label>
                      <label class="field">
                        <span>Display name</span>
                        <input name="display_name" autocomplete="name">
                      </label>
                      <label class="field">
                        <span>Email</span>
                        <input name="email" type="email" autocomplete="email">
                      </label>`:""}
                <label class="field">
                  <span>New password</span>
                  <input name="new_password" type="password" autocomplete="new-password" minlength="8" required>
                </label>
                <button class="btn-primary" type="submit">${c("lock")} ${o(t?"Create account":"Set password")}</button>
              </form>`:'<div class="error-box">This reset link is missing a token.</div>'}
        ${t?"":`<a class="btn-secondary" href="/login" data-route>${c("lock")} Sign in</a>`}
      </section>
    </main>
  `,document.querySelector("#reset-password-form")?.addEventListener("submit",s=>E(s,async()=>{let l=new FormData(s.currentTarget);try{let y={reset_token:e,new_password:String(l.get("new_password")||"")};t&&(y.username=String(l.get("username")||""),y.display_name=T(l.get("display_name")),y.email=T(l.get("email"))),await m("/api/v1/auth/reset-password",{method:"POST",body:y}),p(t?"Account created. Sign in with your new password.":"Password set. Sign in with your new password."),C("/login")}catch(y){He(e,t,y.message)}}))}async function ta(e,t){if(!e){Ae("This invite link is missing a token.",!0);return}Ae("Opening invite...");try{let a=await m("/api/v1/invites/claim",{method:"POST",body:{invite_token:e}});if(!t())return;He(a.reset_token,!0)}catch(a){if(!t())return;Ae(a.message||"This invite link is invalid, used, or expired.",!0)}}function Ae(e,t=!1){ne(),fe.innerHTML=`
    <main class="login-shell">
      <section class="login-panel" aria-labelledby="invite-title">
        <div class="brand-mark" aria-hidden="true">CL</div>
        <h1 id="invite-title">Create Account</h1>
        <p>${o(t?"This invite cannot be used.":"Preparing your account setup.")}</p>
        <div class="${t?"error-box":"empty-state"}">${o(e)}</div>
      </section>
    </main>
  `}function f({active:e,title:t,subtitle:a,body:n,hideTopbar:i=!1}){ne();let s=r.sidebarCollapsed?"Expand sidebar":"Collapse sidebar",l=r.user?`
          ${ae("/library","library",e,c("library"),"Library")}
          ${ae("/account","account",e,c("user"),"Account")}
        `:"",y=xt()?ae("/admin","admin",e,c("shield"),"Admin"):"";fe.innerHTML=`
    <div class="app-shell ${r.sidebarCollapsed?"sidebar-collapsed":""}">
      <header class="app-topbar">
        <div class="app-brand-cluster">
          <button id="sidebar-toggle" class="app-menu-button" type="button" aria-label="${s}" aria-pressed="${r.sidebarCollapsed?"true":"false"}" title="${s}">
            ${c("menu")}
          </button>
          <a class="app-brand" href="/" data-route aria-label="Clipline Home">
            <div class="brand-mark" aria-hidden="true">CL</div>
            <div class="app-brand-text">
              <strong>Clipline</strong>
              <span>Cloud library</span>
            </div>
          </a>
        </div>
        <form id="app-search-form" class="app-search-form" role="search">
          <div class="app-search-row">
            <input name="q" type="search" value="${u(r.publicQuery.q)}" placeholder="Search" aria-label="Search public clips" autocomplete="off">
            <button class="app-search-button" type="submit" aria-label="Search">${c("search")}</button>
          </div>
        </form>
        <div class="app-topbar-actions">
          ${aa()}
        </div>
      </header>
      <aside class="sidebar">
        <nav class="nav-stack" aria-label="Primary">
          ${ae("/","public",e,c("home"),"Home")}
          ${l}
          ${y}
        </nav>
        <section id="sidebar-recommendations" class="sidebar-recommendations" hidden></section>
        <div class="sidebar-footer">
          ${ae("/about","about",e,c("info"),"About")}
        </div>
      </aside>
      <main class="main-pane">
        ${i?"":`<header class="page-heading">
                <div>
                  <h1>${o(t)}</h1>
                  ${a?`<p>${o(a)}</p>`:""}
                </div>
              </header>`}
        <div class="content">
          ${di()}
          ${n}
        </div>
      </main>
    </div>
  `,document.querySelector("#sidebar-toggle")?.addEventListener("click",ca),document.querySelector("#app-search-form")?.addEventListener("submit",da),document.querySelector("#logout-button")?.addEventListener("click",ma),ia()}function aa(){return r.user?`
    <a class="topbar-profile" href="/profile" data-route title="Profile settings" aria-label="Profile settings">
      ${se(r.user,"topbar-avatar")}
      <span>${o(re(r.user))}</span>
    </a>
    <button id="logout-button" class="btn-ghost topbar-signout" type="button" title="Sign out" aria-label="Sign out">
      ${c("logOut")}
    </button>
  `:`<a class="btn-secondary topbar-signin" href="/login" data-route>${c("lock")} Sign in</a>`}function xt(){return r.user&&["owner","admin"].includes(r.user.role)}function k(){return r.user?.role==="owner"}function ae(e,t,a,n,i){return`
    <a class="nav-link ${a===t?"active":""}" href="${u(e)}" data-route aria-label="${u(i)}" title="${u(i)}">
      ${n}<span>${o(i)}</span>
    </a>
  `}async function ia(){let e=document.querySelector("#sidebar-recommendations");if(e)try{let t=await m("/api/v1/public/recommendations?limit=3");if(document.querySelector("#sidebar-recommendations")!==e)return;if(!t.clips?.length){e.hidden=!0;return}e.innerHTML=`
      ${Ft(t.clips)}
    `,e.hidden=!1}catch{e.hidden=!0}}function na(){try{return window.localStorage.getItem(Mt)==="true"}catch{return!1}}function ra(e){try{window.localStorage.setItem(Mt,String(e))}catch{}}function sa(){try{let e=Number(window.localStorage.getItem(Lt));return Number.isFinite(e)?Math.max(0,Math.min(1,e)):1}catch{return 1}}function ht(e){try{window.localStorage.setItem(Lt,String(Math.max(0,Math.min(1,e))))}catch{}}function oa(){try{return window.localStorage.getItem(Ct)==="true"}catch{return!1}}function la(e){try{window.localStorage.setItem(Ct,String(e))}catch{}}function ca(){Ve(!r.sidebarCollapsed)}function da(e){e.preventDefault();let t=new FormData(e.currentTarget);C(Qe({sort:r.publicQuery.sort,game:r.publicQuery.game,q:String(t.get("q")||""),page:1}))}function ne(){he&&(he(),he=null)}function ua(e){return e instanceof Element?!!e.closest("input, textarea, select, button, a, [contenteditable='true'], [contenteditable='']"):!1}function Ve(e){r.sidebarCollapsed=e,ra(e);let t=document.querySelector(".app-shell"),a=document.querySelector("#sidebar-toggle");if(t?.classList.toggle("sidebar-collapsed",e),a){let n=e?"Expand sidebar":"Collapse sidebar";a.setAttribute("aria-label",n),a.setAttribute("aria-pressed",String(e)),a.setAttribute("title",n)}}function pa(e){e==="publicLibrary"?Ve(!1):(e==="public"||e==="clip")&&Ve(!0)}async function ma(){try{await m("/api/v1/auth/logout",{method:"POST",body:{}})}catch{}r.user=null,r.csrfToken=null,C("/login")}async function A(){let e=P,t=R();f({active:"library",title:"Library",subtitle:"Your cloud clips, filters, and sharing controls.",body:'<div class="empty-state">Loading clips...</div>'});try{let a=await m(`/api/v1/clips?${ba().toString()}`);if(!_(e,t))return;qa(a.clips),f({active:"library",title:"Library",subtitle:`${a.clips.length} clip${a.clips.length===1?"":"s"} in this view.`,body:ya(a.clips)}),va()}catch(a){if(!_(e,t))return;f({active:"library",title:"Library",subtitle:"Your cloud clips, filters, and sharing controls.",body:`<div class="error-box">${o(a.message)}</div>`})}}function ba(){let e=new URLSearchParams;e.set("sort",r.libraryQuery.sort),e.set("page_size","100");for(let t of["game","source_type","visibility","status","q"])r.libraryQuery[t]&&e.set(t,r.libraryQuery[t]);return r.libraryQuery.from&&e.set("from",`${r.libraryQuery.from}T00:00:00Z`),r.libraryQuery.to&&e.set("to",`${r.libraryQuery.to}T23:59:59Z`),ye(e,"min_duration_ms",wt(r.libraryQuery.min_duration_seconds)),ye(e,"max_duration_ms",wt(r.libraryQuery.max_duration_seconds)),ye(e,"min_size_bytes",kt(r.libraryQuery.min_size_mib)),ye(e,"max_size_bytes",kt(r.libraryQuery.max_size_mib)),e}function ya(e){return`
    <section class="section">
      <form id="library-filter-form" class="panel toolbar">
        ${S("Search","q","search",r.libraryQuery.q,"Title or game")}
        ${U("Sort","sort",r.libraryQuery.sort,[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["updated_at_desc","Updated newest"],["updated_at_asc","Updated oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["size_desc","Size largest"],["size_asc","Size smallest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]])}
        ${U("Group","group",r.libraryQuery.group,[["none","None"],["game","Game"]])}
        ${S("Game","game","text",r.libraryQuery.game,"Name or ID")}
        ${S("Source","source_type","text",r.libraryQuery.source_type,"Source type")}
        ${U("Visibility","visibility",r.libraryQuery.visibility,[["","Any"],["private","Private"],["public","Public"],["unlisted","Unlisted"]])}
        ${U("Status","status",r.libraryQuery.status,[["","Any"],["created","Created"],["uploading","Uploading"],["processing","Processing"],["ready","Ready"],["failed","Failed"]])}
        ${S("From","from","date",r.libraryQuery.from,"")}
        ${S("To","to","date",r.libraryQuery.to,"")}
        ${K("Min duration","min_duration_seconds",r.libraryQuery.min_duration_seconds,"Seconds")}
        ${K("Max duration","max_duration_seconds",r.libraryQuery.max_duration_seconds,"Seconds")}
        ${K("Min size","min_size_mib",r.libraryQuery.min_size_mib,"MiB","0.1")}
        ${K("Max size","max_size_mib",r.libraryQuery.max_size_mib,"MiB","0.1")}
        <button class="btn-primary" type="submit">${c("search")} Apply</button>
      </form>
      ${e.length?`${ha(e)}${fa(e)}`:'<div class="empty-state">No clips match this view.</div>'}
    </section>
  `}function ha(e){let t=Aa(e);return`
    <div class="panel bulk-toolbar">
      <label class="check-line">
        <input id="select-visible-clips" type="checkbox" ${e.length>0&&t===e.length?"checked":""}>
        <span>Select visible</span>
      </label>
      <span id="bulk-selected-count" class="muted">${r.selectedClipIds.size} selected</span>
      <label class="field">
        <span>Visibility</span>
        <select id="bulk-visibility">
          <option value="private">Private</option>
          <option value="public">Public</option>
          <option value="unlisted">Unlisted</option>
        </select>
      </label>
      <button id="bulk-visibility-button" class="btn-secondary" type="button" ${r.selectedClipIds.size?"":"disabled"}>${c("globe")} Apply visibility</button>
      <button id="bulk-delete-button" class="btn-danger" type="button" ${r.selectedClipIds.size?"":"disabled"}>${c("trash")} Delete selected</button>
    </div>
  `}function fa(e){if(r.libraryQuery.group!=="game")return`<div class="clip-grid">${e.map(ft).join("")}</div>`;let t=new Map;for(let n of e){let i=ge(n),s=t.get(i)||[];s.push(n),t.set(i,s)}return`
    <div class="clip-groups">
      ${Array.from(t.entries()).sort(([n],[i])=>n.localeCompare(i,void 0,{sensitivity:"base"})).map(([n,i])=>`
            <section class="clip-group">
              <div class="clip-group-header">
                <h2>${o(n)}</h2>
                <span class="muted">${i.length} clip${i.length===1?"":"s"}</span>
              </div>
              <div class="clip-grid">${i.map(ft).join("")}</div>
            </section>
          `).join("")}
    </div>
  `}function ft(e){let t=e.visibility==="public"||e.visibility==="unlisted",a=t?"Make private":"Publish",n=c(t?"lock":"globe"),i=e.public_url||"";return`
    <article class="clip-row">
      <label class="clip-select" title="Select clip">
        <input type="checkbox" data-select-clip="${u(e.id)}" ${r.selectedClipIds.has(e.id)?"checked":""} aria-label="Select ${u(e.title)}">
      </label>
      <img class="thumb" src="/api/v1/clips/${encodeURIComponent(e.id)}/thumbnail" alt="">
      <div>
        <a class="clip-title" href="/clip/${encodeURIComponent(e.id)}" data-route>${o(e.title)}</a>
        <div class="meta-line">
          <span>${o(ge(e))}</span>
          <span>${oe(e.duration_ms)}</span>
          <span>${x(e.file_size_bytes)}</span>
        </div>
      </div>
      <div>
        ${Vt(e.visibility)}
        <div class="meta-line"><span>${o(e.status)}</span></div>
      </div>
      <div class="meta-line">
        <span>Recorded ${M(e.recorded_at)}</span>
        <span>Uploaded ${M(e.uploaded_at)}</span>
      </div>
      <div class="actions">
        <a class="btn-secondary" href="/clip/${encodeURIComponent(e.id)}" data-route>${c("film")} View</a>
        <button class="btn-secondary icon-btn" title="Copy public link" aria-label="Copy public link" ${i?`data-copy="${u(i)}"`:"disabled"}>${c("copy")}</button>
        <button class="btn-secondary" data-clip-action="toggle" data-clip-id="${u(e.id)}" data-next-visibility="${t?"private":"public"}">${n} ${a}</button>
        <button class="btn-danger icon-btn" title="Delete clip" aria-label="Delete clip" data-clip-action="delete" data-clip-id="${u(e.id)}">${c("trash")}</button>
      </div>
    </article>
  `}function va(){document.querySelector("#library-filter-form").addEventListener("submit",e=>{e.preventDefault();let t=new FormData(e.currentTarget);for(let a of Object.keys(r.libraryQuery))r.libraryQuery[a]=String(t.get(a)||"");A()}),document.querySelectorAll("[data-clip-action]").forEach(e=>{e.addEventListener("click",async()=>{let t=e.dataset.clipId,a=e.dataset.clipAction;try{if(a==="toggle")await m(`/api/v1/clips/${encodeURIComponent(t)}/visibility`,{method:"POST",body:{visibility:e.dataset.nextVisibility}}),p(e.dataset.nextVisibility==="private"?"Public access removed.":"Public link created.");else if(a==="delete"){if(!await G("Delete clip?","This removes the clip from your library and public links stop working.","Delete",!0))return;await m(`/api/v1/clips/${encodeURIComponent(t)}`,{method:"DELETE",body:{}}),p("Clip deleted.")}A()}catch(n){p(n.message,"error"),A()}})}),Ua()}async function ga(e=I()){let t=P,a=R();$a(e),De({title:Ue(),body:Ne([],{statusHtml:'<div class="empty-state">Loading public clips...</div>'})});try{let[n,i]=await Promise.all([m(`/api/v1/public/clips?${_a().toString()}`),m("/api/v1/public/games").catch(()=>({games:[]}))]);if(!_(t,a))return;r.publicGames=Array.isArray(i.games)?i.games:[],r.publicQuery.page=Number(n.page||r.publicQuery.page||1),De({title:Ue(),body:Ne(n.clips,{resultText:`${n.clips.length} clip${n.clips.length===1?"":"s"}`,page:n.page,hasMore:!!n.has_more})}),Ma()}catch(n){if(!_(t,a))return;De({title:Ue(),body:Ne([],{statusHtml:`<div class="error-box">${o(n.message)}</div>`})})}}function $a(e=I()){let t=e.query||Fe();r.publicQuery.sort=t.sort||"uploaded_at_desc",r.publicQuery.q=t.q||"",r.publicQuery.game=e.name==="publicGame"?e.game||"":t.game||"";let a=Number(t.page||1);r.publicQuery.page=Number.isFinite(a)?Math.max(1,a):1}function Ue(){return r.publicQuery.q?"Search":r.publicQuery.game?r.publicQuery.game:"Home"}function De({title:e,subtitle:t,body:a}){f({active:"public",title:e,subtitle:t,body:a,hideTopbar:!0})}function _a(){let e=new URLSearchParams;e.set("sort",r.publicQuery.sort),e.set("page_size","60"),e.set("page",String(Math.max(1,Number(r.publicQuery.page||1))));for(let t of["game","q"])r.publicQuery[t]&&e.set(t,r.publicQuery[t]);return e}function Qe({sort:e="uploaded_at_desc",game:t="",q:a="",page:n=1}={}){let i=new URLSearchParams,s=e||"uploaded_at_desc",l=String(t||"").trim(),y=String(a||"").trim(),$=Math.max(1,Number(n||1));if(s!=="uploaded_at_desc"&&i.set("sort",s),$>1&&i.set("page",String($)),y)return i.set("q",y),l&&i.set("game",l),`/search?${i.toString()}`;if(l){let L=i.toString();return`/game/${encodeURIComponent(l)}${L?`?${L}`:""}`}let w=i.toString();return w?`/search?${w}`:"/"}function Ne(e,t={}){return`
    <section class="section public-home">
      ${ka(t.resultText||"")}
      ${t.statusHtml?t.statusHtml:e.length?`
              <div class="public-clip-grid">${e.map(Et).join("")}</div>
              ${wa(t.page||r.publicQuery.page,!!t.hasMore)}
            `:'<div class="empty-state">No public clips match this view.</div>'}
    </section>
  `}function wa(e,t){let a=Math.max(1,Number(e||1));return a<=1&&!t?"":`
    <nav class="public-pager" aria-label="Public clip pages">
      <button class="btn-secondary" type="button" data-public-page="${a-1}" ${a<=1?"disabled":""}>Previous</button>
      <span class="muted">Page ${a}</span>
      <button class="btn-secondary" type="button" data-public-page="${a+1}" ${t?"":"disabled"}>Next</button>
    </nav>
  `}function ka(e){return`
    <form id="public-filter-form" class="public-search-form public-filter-form">
      <div class="public-search-controls">
        ${vt("Sort","sort",r.publicQuery.sort,[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]])}
        ${vt("Game","game",r.publicQuery.game,Sa())}
        ${e?`<span class="public-result-count">${o(e)}</span>`:""}
      </div>
    </form>
  `}function Sa(){let e=[["","Any game"]],t=r.publicQuery.game,a=Array.isArray(r.publicGames)?r.publicGames:[];t&&!a.some(n=>n.game===t)&&e.push([t,t]);for(let n of a){if(!n?.game)continue;let i=Number(n.clip_count||0);e.push([n.game,i>0?`${n.game} (${i})`:n.game])}return e}function vt(e,t,a,n){return`
    <label class="public-filter-control">
      <span>${o(e)}</span>
      <select name="${u(t)}">
        ${n.map(([i,s])=>`<option value="${u(i)}" ${i===a?"selected":""}>${o(s)}</option>`).join("")}
      </select>
    </label>
  `}function Et(e){let t=`/c/${encodeURIComponent(e.share_id)}`,a=`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/thumbnail`,n=je(e),i=Oe(e),s=oe(e.duration_ms),l=$e(e.uploaded_at);return`
    <article class="public-clip-card">
      <a class="public-card-main" href="${u(t)}" data-route>
        <div class="public-thumb-wrap">
          <img class="thumb" src="${u(a)}" alt="">
          ${s!=="Unknown"?`<span class="public-duration-badge">${o(s)}</span>`:""}
        </div>
        <h2>${o(e.title)}</h2>
      </a>
      <div class="public-clip-body">
        ${i?`<a class="public-author" href="${u(i)}" data-route>${o(n)}</a>`:`<p class="public-author">${o(n)}</p>`}
        <div class="meta-line public-card-meta">
          ${Pt(e)}
          ${l!=="Unknown"?`<span aria-hidden="true">&middot;</span><span>${o(l)}</span>`:""}
          <span aria-hidden="true">&middot;</span><span>${o(Ke(e.view_count))}</span>
        </div>
      </div>
    </article>
  `}function Ma(){let e=document.querySelector("#public-filter-form");if(!e)return;let t=()=>{let a=new FormData(e);C(Qe({sort:String(a.get("sort")||"uploaded_at_desc"),game:String(a.get("game")||""),q:r.publicQuery.q,page:1}))};e.addEventListener("submit",a=>{a.preventDefault(),t()}),e.querySelectorAll("select, input").forEach(a=>{a.addEventListener("change",t)}),document.querySelectorAll("[data-public-page]").forEach(a=>{a.addEventListener("click",()=>{let n=Number(a.dataset.publicPage||1);!Number.isFinite(n)||n<1||C(Qe({sort:r.publicQuery.sort,game:r.publicQuery.game,q:r.publicQuery.q,page:n}))})})}function ge(e){return e.game_name||e.game_id||"No game"}function La(e){return`/game/${encodeURIComponent(e)}`}function Pt(e,t="public-game-link"){let a=ge(e);return a==="No game"?`<span>${o(a)}</span>`:`<a class="${u(t)}" href="${u(La(a))}" data-route>${o(a)}</a>`}function je(e){return e.author_name||"Unknown creator"}function Oe(e){return e.author_username?`/u/${encodeURIComponent(e.author_username)}`:""}function re(e){return e?.display_name||e?.username||"Unknown creator"}function Ca(e){if(!e?.avatar_url)return"";let t=e.updated_at||"";if(!t)return e.avatar_url;let a=String(e.avatar_url).includes("?")?"&":"?";return`${e.avatar_url}${a}v=${encodeURIComponent(t)}`}function se(e,t="user-avatar"){let a=re(e),n=Ca(e);return n?`<img class="${u(t)} user-avatar-img" src="${u(n)}" alt="">`:`<div class="${u(t)} user-avatar-fallback" aria-hidden="true">${o(ja(a))}</div>`}function Ta(e,t){let a=Oe(e);return a?`<a href="${u(a)}" data-route><strong>${o(t)}</strong></a>`:`<strong>${o(t)}</strong>`}function xa(e,t){let a=se({username:e.author_username||t,display_name:t,avatar_url:e.author_avatar_url,updated_at:e.updated_at},"public-author-avatar"),n=Oe(e);return n?`<a href="${u(n)}" data-route>${a}</a>`:a}async function Ea(e){let t=P,a=R();f({active:"public",title:"Profile",body:'<div class="empty-state">Loading profile...</div>',hideTopbar:!0});try{let n=await m(`/api/v1/public/users/${encodeURIComponent(e)}`);if(!_(t,a))return;f({active:"public",title:re(n),body:Pa(n),hideTopbar:!0})}catch(n){if(!_(t,a))return;f({active:"public",title:"Profile unavailable",body:`<div class="error-box">${o(n.message)}</div>`,hideTopbar:!0})}}function Pa(e){let t=re(e),a=r.user&&r.user.username?.toLowerCase()===e.username.toLowerCase();return`
    <section class="public-user-page">
      <header class="public-user-header">
        ${se(e,"public-user-avatar")}
        <div class="public-user-header-body">
          <div class="public-user-title-row">
            <div>
              <h1>${o(t)}</h1>
              <p>@${o(e.username)}</p>
            </div>
            ${a?`<a class="btn-secondary" href="/profile" data-route>${c("edit")} Edit profile</a>`:""}
          </div>
          ${e.bio?`<div class="public-user-bio">${o(e.bio)}</div>`:""}
          <div class="meta-line">
            <span>${o(e.clip_count)} public clip${e.clip_count===1?"":"s"}</span>
          </div>
        </div>
      </header>
      ${e.clips?.length?`<div class="public-clip-grid">${e.clips.map(Et).join("")}</div>`:'<div class="empty-state">No public clips yet.</div>'}
    </section>
  `}async function Ra(){let e=P,t=R();f({active:"about",title:"About",subtitle:"Clipline Cloud",body:'<div class="empty-state">Loading About...</div>'});let a="Clipline is a self-hosted clip library for saved gameplay moments.";try{a=(await m("/api/v1/about")).about_text||a}catch(n){p(n.message,"error")}_(e,t)&&f({active:"about",title:"About",subtitle:"Clipline Cloud",body:`
      <section class="about-page">
        <div class="panel section about-panel">
          <h2>Clipline Cloud</h2>
          <p class="about-text">${o(a)}</p>
          <dl class="data-list about-list">
            ${h("Home","Public clips that are ready for discovery.")}
            ${h("Unlisted","Shareable by link, but not listed on Home.")}
            ${h("Private","Visible only to the clip owner.")}
            ${h("Media","Public and unlisted clips are not DRM-protected.")}
          </dl>
        </div>
      </section>
    `})}function qa(e){let t=new Set(e.map(a=>a.id));for(let a of Array.from(r.selectedClipIds))t.has(a)||r.selectedClipIds.delete(a)}function Aa(e){return e.filter(t=>r.selectedClipIds.has(t.id)).length}function gt(){return Array.from(r.selectedClipIds)}function Ua(){let e=document.querySelector("#select-visible-clips");if(!e)return;let t=Array.from(document.querySelectorAll("[data-select-clip]"));e.indeterminate=t.some(a=>a.checked)&&!t.every(a=>a.checked),e.addEventListener("change",()=>{for(let a of t)e.checked?(r.selectedClipIds.add(a.dataset.selectClip),a.checked=!0):(r.selectedClipIds.delete(a.dataset.selectClip),a.checked=!1);$t()});for(let a of t)a.addEventListener("change",()=>{a.checked?r.selectedClipIds.add(a.dataset.selectClip):r.selectedClipIds.delete(a.dataset.selectClip),$t()});document.querySelector("#bulk-visibility-button")?.addEventListener("click",async()=>{let a=gt(),n=document.querySelector("#bulk-visibility").value;if(a.length)try{let i=await m("/api/v1/clips/bulk-visibility",{method:"POST",body:{ids:a,visibility:n}});r.selectedClipIds.clear(),p(`Visibility updated for ${i.affected} clip${i.affected===1?"":"s"}.`),A()}catch(i){p(i.message,"error"),A()}}),document.querySelector("#bulk-delete-button")?.addEventListener("click",async()=>{let a=gt();if(!(!a.length||!await G("Delete selected clips?",`This removes ${a.length} clip${a.length===1?"":"s"} from your library.`,"Delete",!0)))try{let i=await m("/api/v1/clips/bulk-delete",{method:"POST",body:{ids:a}});r.selectedClipIds.clear(),p(`Deleted ${i.affected} clip${i.affected===1?"":"s"}.`),A()}catch(i){p(i.message,"error"),A()}})}function $t(){let e=r.selectedClipIds.size,t=document.querySelector("#bulk-selected-count");t&&(t.textContent=`${e} selected`),document.querySelector("#bulk-visibility-button")?.toggleAttribute("disabled",e===0),document.querySelector("#bulk-delete-button")?.toggleAttribute("disabled",e===0);let a=Array.from(document.querySelectorAll("[data-select-clip]")),n=document.querySelector("#select-visible-clips");n&&a.length&&(n.checked=a.every(i=>i.checked),n.indeterminate=a.some(i=>i.checked)&&!a.every(i=>i.checked))}async function q(e){let t=P,a=R();f({active:"library",title:"Clip detail",subtitle:"Playback and clip controls.",hideTopbar:!0,body:'<div class="empty-state">Loading clip...</div>'});try{let n=await m(`/api/v1/clips/${encodeURIComponent(e)}`);if(!_(t,a))return;f({active:"library",title:"Clip detail",subtitle:"",hideTopbar:!0,body:Da(n)}),Na(n)}catch(n){if(!_(t,a))return;f({active:"library",title:"Clip detail",subtitle:"Playback and clip controls.",hideTopbar:!0,body:`<div class="error-box">${o(n.message)}</div>`})}}function Rt({playerId:e,src:t,poster:a="",durationMs:n=null,theater:i=!1}){let s=t?u(t):"",l=a?u(a):"",y=n==null?"Loading media...":oe(n),$=i?`<button type="button" class="player-icon" data-player-theater title="Theater mode (T)" aria-label="Theater mode" aria-pressed="false">${c("theater")}</button>`:"";return`
    <div class="clip-player" data-clip-player="${u(e)}" tabindex="0" aria-label="Video player">
      <div class="clip-player-stage" data-player-stage>
        <video
          class="clip-player-video"
          data-player-video
          preload="metadata"
          playsinline
          ${l?`poster="${l}"`:""}
          ${s?`src="${s}"`:""}
        ></video>
        <div class="clip-player-note" data-player-note>${o(y)}</div>
        <div class="clip-player-skip-feedback" data-player-skip-feedback aria-hidden="true"></div>
        <div class="clip-player-state-feedback" data-player-state-feedback aria-hidden="true"></div>
        <div class="clip-player-overlay">
          <div class="clip-player-transport" data-player-transport>
            <div class="player-cluster" data-player-marker-cluster>
              <button type="button" class="player-icon" data-player-prev-marker title="Previous marker (Shift+M)" aria-label="Previous marker">${c("skipBack")}</button>
              <button type="button" class="player-icon" data-player-next-marker title="Next marker (M)" aria-label="Next marker">${c("skipForward")}</button>
              <span class="player-marker-count" data-player-marker-count>No markers</span>
            </div>
            <div class="player-cluster player-cluster-main">
              <button type="button" class="player-icon" data-player-back title="Back 5 seconds" aria-label="Back 5 seconds">${c("rewind")}</button>
              <button type="button" class="player-icon player-play" data-player-toggle title="Play / pause (Space)" aria-label="Play / pause">
                <span class="player-play-icon">${c("play")}</span>
                <span class="player-pause-icon">${c("pause")}</span>
              </button>
              <button type="button" class="player-icon" data-player-forward title="Forward 5 seconds" aria-label="Forward 5 seconds">${c("fastForward")}</button>
              <span class="player-time" data-player-time>0:00.0 / 0:00.0</span>
            </div>
            <div class="player-cluster player-cluster-right">
              <select class="player-rate" data-player-rate title="Playback speed" aria-label="Playback speed">
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1" selected>1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
              <button type="button" class="player-icon" data-player-mute title="Mute / unmute" aria-label="Mute / unmute">
                <span class="player-volume-icon">${c("volume2")}</span>
                <span class="player-muted-icon">${c("volumeX")}</span>
              </button>
              <input class="player-volume" data-player-volume type="range" min="0" max="1" step="0.01" value="1" aria-label="Volume">
              ${$}
              <button type="button" class="player-icon" data-player-fullscreen title="Fullscreen (F)" aria-label="Fullscreen">${c("fullscreen")}</button>
            </div>
          </div>
        </div>
        <div class="clip-player-timeline" data-player-timeline>
          <div class="clip-player-buffered" data-player-buffered></div>
          <div class="clip-player-progress" data-player-progress></div>
          <div class="clip-player-marker-layer" data-player-marker-layer></div>
          <input class="clip-player-scrubber" data-player-scrubber type="range" min="0" max="0" step="0.01" value="0" aria-label="Seek">
        </div>
      </div>
    </div>
  `}function qt(e,{durationMs:t=null,markers:a=[],onTheaterToggle:n=null}={}){if(ne(),!e)return;let i=e.querySelector("[data-player-video]"),s=e.querySelector("[data-player-note]"),l=e.querySelector("[data-player-time]"),y=e.querySelector("[data-player-progress]"),$=e.querySelector("[data-player-buffered]"),w=e.querySelector("[data-player-scrubber]"),L=e.querySelector("[data-player-marker-layer]"),_e=e.querySelector("[data-player-marker-count]"),Bt=e.querySelector("[data-player-marker-cluster]"),Ge=e.querySelector("[data-player-transport]"),Ze=e.querySelector("[data-player-prev-marker]"),We=e.querySelector("[data-player-next-marker]"),Z=e.querySelector("[data-player-volume]"),Ht=e.querySelector("[data-player-mute]"),jt=e.querySelector("[data-player-theater]"),Ot=e.querySelector("[data-player-fullscreen]"),we=e.querySelector("[data-player-rate]"),Je=Array.from(e.querySelectorAll("[data-player-toggle]")),F=e.querySelector("[data-player-skip-feedback]"),V=e.querySelector("[data-player-state-feedback]"),ke=ct(t),v=ke,Q=qe(a,v),W=null,J=!1,le=!1,X=null,Se=null,Me=null;i.controls=!1,i.playbackRate=Number(we.value),i.volume=sa(),e.classList.add("is-controls-visible");function Xe(){return!!(i.currentSrc||i.getAttribute("src"))}function Ye(d,b,g){let ee=g>0?te(b,g):0;d.style.setProperty("--range-fill",`${ee}%`)}function et(){return Number.isFinite(i.duration)&&i.duration>0?i.duration:ke}function Le(d){v=Number.isFinite(d)&&d>0?d:ke,w.max=v>0?String(v):"0",w.disabled=!(v>0),Q=qe(a,v),zt(),Ce(i.currentTime||0)}function Ce(d=i.currentTime||0){let b=v>0?Re(d,v):Math.max(0,d||0),g=te(b,v);y.style.width=`${g}%`,J||(w.value=String(b)),Ye(w,b,v),l.textContent=dt(b,v),B()}function B(){if(!$)return;if(v<=0||!i.buffered?.length){$.style.width="0%";return}let d=i.currentTime||0,b=0;for(let g=0;g<i.buffered.length;g+=1){let ee=i.buffered.start(g),Pe=i.buffered.end(g);if(d>=ee&&d<=Pe){b=Pe;break}b=Math.max(b,Pe)}$.style.width=`${te(b,v)}%`}function H(){let d=!i.paused&&!i.ended;e.classList.toggle("is-playing",d),Je.forEach(b=>{b.setAttribute("aria-label",d?"Pause video":"Play video"),b.setAttribute("aria-pressed",String(d))})}function ce(){let d=i.muted||i.volume===0;e.classList.toggle("is-muted",d),Z.value=String(d?0:i.volume),Ye(Z,Number(Z.value),1)}function zt(){let d=Q.length>0;Bt.hidden=!d,Ge.classList.toggle("has-markers",d),Ge.classList.toggle("no-markers",!d),L.replaceChildren(),_e.textContent=ut(Q),Ze.disabled=!d,We.disabled=!d;for(let b of Q){let g=document.createElement("button");g.type="button",g.className=`clip-player-marker marker-${b.category}`,g.style.left=`${te(b.time,v)}%`,g.title=`${b.label} @ ${pe(b.time)}`,g.setAttribute("aria-label",`Seek to ${b.label} at ${pe(b.time)}`),g.addEventListener("click",ee=>{ee.stopPropagation(),j(b.time)}),L.appendChild(g)}}function j(d){if(!Xe())return;let b=v>0?Re(Number(d),v):Math.max(0,Number(d)||0);i.seeking?W=b:(W=null,i.currentTime=b)}function Te(d){j((i.currentTime||0)+d),Jt(d)}async function Kt(){i.networkState===HTMLMediaElement.NETWORK_EMPTY&&i.load(),e.classList.add("is-loading");try{await i.play()}catch(d){s.textContent=d?.message||"Playback failed"}finally{e.classList.remove("is-loading"),H()}}function xe(){if(!Xe()){s.textContent="Media unavailable";return}i.paused||i.ended?(st("play"),Kt()):(st("pause"),i.pause())}function de(d){let b=i.currentTime||0,g=d>0?pt(Q,b):mt(Q,b);g&&j(g.time)}function Gt(){i.muted||i.volume===0?(i.muted=!1,i.volume===0&&(i.volume=1,ht(i.volume))):i.muted=!0,ce()}async function tt(){document.fullscreenElement?await document.exitFullscreen():e.requestFullscreen&&await e.requestFullscreen()}function at(){typeof n=="function"&&n()}function it(){i.videoWidth&&i.videoHeight&&(s.textContent=`${i.videoWidth}x${i.videoHeight} - ${v>0?pe(v):"ready"}`)}function Zt(){J=!0,le=!i.paused,le&&i.pause()}function ue(){J&&(J=!1,le&&(le=!1,i.play().catch(H)),Ee())}function Y(){e.classList.add("is-controls-visible"),e.classList.remove("is-controls-hidden")}function nt(){J||(e.classList.remove("is-controls-visible"),e.classList.add("is-controls-hidden"))}function Ee(d=1600){window.clearTimeout(X),X=window.setTimeout(()=>{!i.paused&&!i.ended&&nt()},d)}function rt(){Y(),Ee()}function Wt(d){let b=Math.abs(Number(d)||0);return`${Number.isInteger(b)?b:b.toFixed(1)}s`}function Jt(d){!F||!Number.isFinite(d)||d===0||(window.clearTimeout(Se),F.className=`clip-player-skip-feedback is-${d>0?"forward":"back"}`,F.innerHTML=`${c(d>0?"fastForward":"rewind")}<span>${o(Wt(d))}</span>`,F.offsetWidth,F.classList.add("is-visible"),Se=window.setTimeout(()=>{F.classList.remove("is-visible")},620))}function st(d){V&&(window.clearTimeout(Me),V.className=`clip-player-state-feedback is-${d}`,V.innerHTML=c(d==="pause"?"pause":"play"),V.offsetWidth,V.classList.add("is-visible"),Me=window.setTimeout(()=>{V.classList.remove("is-visible")},560))}function ot(d){if(d.defaultPrevented||!e.isConnected||ua(d.target))return;let b=bt(d.code,d.shiftKey);if(b&&!(b.kind==="theater"&&typeof n!="function"))switch(d.preventDefault(),b.kind){case"toggle-play":xe();break;case"seek-by":Te(b.seconds);break;case"seek-to":j(b.seconds);break;case"seek-to-end":j(v);break;case"next-marker":de(1);break;case"previous-marker":de(-1);break;case"fullscreen":tt().catch(()=>{});break;case"theater":at();break}}Je.forEach(d=>d.addEventListener("click",xe)),i.addEventListener("click",xe),e.querySelector("[data-player-back]").addEventListener("click",()=>Te(-5)),e.querySelector("[data-player-forward]").addEventListener("click",()=>Te(5)),Ze.addEventListener("click",()=>de(-1)),We.addEventListener("click",()=>de(1)),Ht.addEventListener("click",Gt),jt?.addEventListener("click",at),Ot.addEventListener("click",()=>{tt().catch(d=>{s.textContent=d?.message||"Fullscreen unavailable"})}),we.addEventListener("change",()=>{i.playbackRate=Number(we.value)}),Z.addEventListener("input",()=>{i.volume=Number(Z.value),i.muted=i.volume===0,ht(i.volume),ce()}),w.addEventListener("pointerdown",Zt),w.addEventListener("input",()=>{j(Number(w.value))}),w.addEventListener("change",ue),w.addEventListener("pointerup",ue),w.addEventListener("pointercancel",ue),w.addEventListener("lostpointercapture",ue),e.addEventListener("pointerenter",rt),e.addEventListener("pointermove",rt),e.addEventListener("pointerleave",nt),e.addEventListener("focusin",Y),e.addEventListener("pointerdown",()=>{Y(),e.focus({preventScroll:!0})}),document.addEventListener("keydown",ot),i.addEventListener("loadedmetadata",()=>{Le(et()),it(),B()}),i.addEventListener("durationchange",()=>Le(et())),i.addEventListener("timeupdate",()=>Ce()),i.addEventListener("progress",B),i.addEventListener("canplay",()=>{e.classList.remove("is-loading"),B()}),i.addEventListener("waiting",()=>e.classList.add("is-loading")),i.addEventListener("playing",()=>{e.classList.remove("is-loading"),B()}),i.addEventListener("play",()=>{H(),Ee(900)}),i.addEventListener("pause",()=>{H(),Y(),window.clearTimeout(X)}),i.addEventListener("ended",()=>{H(),Y(),window.clearTimeout(X)}),i.addEventListener("volumechange",ce),i.addEventListener("seeked",()=>{if(W!=null){let d=W;W=null,i.currentTime=d}Ce(),B()}),i.addEventListener("error",()=>{let d=i.error;s.textContent=`Load error ${d?d.code:""}`.trim()}),Le(v),H(),ce(),it(),he=()=>{document.removeEventListener("keydown",ot),window.clearTimeout(X),window.clearTimeout(Se),window.clearTimeout(Me)}}function Da(e){let t=e.description||"";return`
    <section class="detail-layout clip-edit-layout ${r.clipTheaterMode?"is-theater":""}" data-clip-detail-layout data-theater-layout>
      <div class="clip-edit-main">
        <div class="clip-title-editor" data-title-editor>
          <div class="clip-title-display" data-title-display>
            <h1>${o(e.title)}</h1>
            <button class="icon-btn clip-title-button" type="button" data-title-edit title="Edit title" aria-label="Edit title">${c("edit")}</button>
          </div>
          <form class="clip-title-form" data-title-form hidden>
            <label class="sr-only" for="clip-title-input">Title</label>
            <input id="clip-title-input" name="title" type="text" value="${u(e.title)}" maxlength="220" required>
            <button class="icon-btn clip-title-button" type="submit" title="Apply title" aria-label="Apply title">${c("check")}</button>
            <button class="icon-btn clip-title-button" type="button" data-title-cancel title="Discard title edit" aria-label="Discard title edit">${c("x")}</button>
          </form>
        </div>
        ${Rt({playerId:`clip-${e.id}`,src:`/api/v1/clips/${encodeURIComponent(e.id)}/media`,durationMs:e.duration_ms,theater:!0})}
        <form id="clip-description-form" class="clip-description-form">
          <label class="field">
            <span>Description</span>
            <textarea name="description" rows="5" maxlength="5000" placeholder="Add context for this clip.">${o(t)}</textarea>
          </label>
          <div class="clip-inline-actions">
            <button class="btn-secondary" type="submit">${c("save")} Save description</button>
          </div>
        </form>
        <div class="clip-management-row">
          <section class="clip-management-section">
            <div>
              <h2>Visibility</h2>
              <p class="muted">Control who can view this clip.</p>
            </div>
            <div class="clip-visibility-controls">
              ${Vt(e.visibility)}
              ${U("Visibility","detail_visibility",e.visibility,[["private","Private"],["public","Public"],["unlisted","Unlisted"]])}
              <button id="clip-visibility-button" class="btn-secondary">${c("refresh")} Apply</button>
            </div>
            ${e.public_url?`<div class="share-line">
                    <input readonly value="${u(e.public_url)}" aria-label="Public URL">
                    <button class="btn-secondary" data-copy="${u(e.public_url)}">${c("copy")} Copy</button>
                  </div>`:'<p class="muted">No public URL is active.</p>'}
          </section>
          <section class="clip-management-section clip-danger-section">
            <div>
              <h2>Danger zone</h2>
              <p class="muted">Delete this clip and stop public links from working.</p>
            </div>
            <button id="clip-delete-button" class="btn-danger">${c("trash")} Delete clip</button>
          </section>
        </div>
      </div>
      <aside class="clip-detail-aside">
        <div class="panel">
          <h2>Details</h2>
          <dl class="data-list">
            ${h("Recorded",M(e.recorded_at))}
            ${h("Uploaded",M(e.uploaded_at))}
            ${h("Duration",oe(e.duration_ms))}
            ${h("Size",x(e.file_size_bytes))}
            ${h("Dimensions",e.width&&e.height?`${e.width} x ${e.height}`:"Unknown")}
            ${h("FPS",e.fps??"Unknown")}
            ${h("Container",e.container||"Unknown")}
            ${h("Video codec",e.video_codec||"Unknown")}
            ${h("Audio codec",e.audio_codec||"Unknown")}
            ${h("Checksum",e.checksum_sha256||"Unknown",!0)}
          </dl>
        </div>
      </aside>
    </section>
  `}function Na(e){qt(document.querySelector("[data-clip-player]"),{durationMs:e.duration_ms,markers:[],onTheaterToggle:At}),ze(r.clipTheaterMode);let t=document.querySelector("[data-title-display]"),a=document.querySelector("[data-title-form]"),n=a?.querySelector("input[name='title']");document.querySelector("[data-title-edit]")?.addEventListener("click",()=>{t.hidden=!0,a.hidden=!1,n?.focus(),n?.select()}),document.querySelector("[data-title-cancel]")?.addEventListener("click",()=>{a.hidden=!0,t.hidden=!1,n&&(n.value=e.title)}),a?.addEventListener("submit",i=>E(i,async()=>{let s=new FormData(i.currentTarget);try{await m(`/api/v1/clips/${encodeURIComponent(e.id)}`,{method:"PATCH",body:{title:String(s.get("title")||"")}}),p("Title saved."),q(e.id)}catch(l){p(l.message,"error"),q(e.id)}})),document.querySelector("#clip-description-form")?.addEventListener("submit",i=>E(i,async()=>{let s=new FormData(i.currentTarget);try{await m(`/api/v1/clips/${encodeURIComponent(e.id)}`,{method:"PATCH",body:{description:T(s.get("description"))}}),p("Description saved."),q(e.id)}catch(l){p(l.message,"error"),q(e.id)}})),document.querySelector("#clip-visibility-button").addEventListener("click",async()=>{let i=document.querySelector("[name='detail_visibility']").value;try{await m(`/api/v1/clips/${encodeURIComponent(e.id)}/visibility`,{method:"POST",body:{visibility:i}}),p(i==="private"?"Public access removed.":"Visibility updated."),q(e.id)}catch(s){p(s.message,"error"),q(e.id)}}),document.querySelector("#clip-delete-button").addEventListener("click",async()=>{if(await G("Delete clip?","This removes the clip from your library and public links stop working.","Delete",!0))try{await m(`/api/v1/clips/${encodeURIComponent(e.id)}`,{method:"DELETE",body:{}}),p("Clip deleted."),C("/library")}catch(s){p(s.message,"error"),q(e.id)}})}function At(){ze(!r.clipTheaterMode)}function ze(e){r.clipTheaterMode=!!e,la(r.clipTheaterMode);let t=document.querySelector("[data-player-theater]");if(document.querySelectorAll("[data-theater-layout]").forEach(a=>{a.classList.toggle("is-theater",r.clipTheaterMode)}),t){let a=r.clipTheaterMode?"Exit theater mode":"Theater mode";t.setAttribute("aria-label",a),t.setAttribute("aria-pressed",String(r.clipTheaterMode)),t.setAttribute("title",`${a} (T)`)}}async function D(e){let t=P,a=R();Ie({title:"Loading clip",body:`
      <section class="public-watch-page">
        <div class="empty-state">Loading public clip...</div>
      </section>
    `});try{let n=await m(`/api/v1/public/clips/${encodeURIComponent(e)}`);if(!_(t,a))return;let i=St(n.media_url),s=St(n.thumbnail_url),l=je(n);Ie({title:n.title,subtitle:`${l} - ${n.game_name||n.game_id||"Shared clip"}`,body:Fa(n,l,i,s,[],[])}),qt(document.querySelector("[data-clip-player]"),{durationMs:n.duration_ms,markers:[],onTheaterToggle:At}),ze(r.clipTheaterMode),Nt(n.share_id),Ba(n.share_id),Ia(n)}catch{if(!_(t,a))return;Ie({title:"Clip unavailable",body:`
        <section class="public-watch-page">
          <h1>Clip unavailable</h1>
          <p>This public link is no longer active.</p>
        </section>
      `})}}async function Ia(e){let t=e.share_id,[a,n]=await Promise.all([m(`/api/v1/public/recommendations?share_id=${encodeURIComponent(t)}&limit=8`).catch(()=>({clips:[]})),m(`/api/v1/public/clips/${encodeURIComponent(t)}/comments`).catch(()=>({comments:[]}))]);if(I().name!=="public"||I().shareId!==t)return;let i=a.clips||[];i.length||(i=((await m("/api/v1/public/recommendations?limit=8").catch(()=>({clips:[]}))).clips||[]).filter(w=>w.share_id!==e.share_id));let s=document.querySelector("#public-comments-slot");s&&(s.innerHTML=Ut(e,n.comments||[]),Nt(t));let l=document.querySelector("#public-recommendations-slot"),y=document.querySelector(".public-watch-layout");l&&(l.innerHTML=i.length?It(i):"",y?.classList.toggle("has-recommendations",i.length>0))}function Fa(e,t,a,n,i,s){return`
    <section class="public-watch-page ${r.clipTheaterMode?"is-theater":""}" aria-labelledby="public-title" data-theater-layout>
      <div class="public-watch-layout ${i.length?"has-recommendations":""} ${r.clipTheaterMode?"is-theater":""}" data-theater-layout>
        <div class="public-watch-main">
          ${Rt({playerId:`public-${e.share_id}`,src:a,poster:n,durationMs:e.duration_ms,theater:!0})}
          ${Va(e,t)}
          <div id="public-comments-slot">${Ut(e,s)}</div>
        </div>
        <div id="public-recommendations-slot">${i.length?It(i):""}</div>
      </div>
    </section>
  `}function Va(e,t){let a=$e(e.uploaded_at),n=[Pt(e,"public-game-link public-watch-game-link"),a!=="Unknown"?`<span>${o(a)}</span>`:""].filter(Boolean),i=e.viewer_can_edit&&e.viewer_clip_id?`/clip/${encodeURIComponent(e.viewer_clip_id)}`:"";return`
    <section class="public-watch-info">
      <div class="public-watch-title-row">
        <h1 id="public-title">${o(e.title)}</h1>
        ${i?`<a class="btn-secondary" href="${u(i)}" data-route>${c("edit")} Edit</a>`:""}
      </div>
      <div class="public-watch-meta">
        ${n.join('<span aria-hidden="true">&middot;</span>')}
        ${n.length?'<span aria-hidden="true">&middot;</span>':""}
        <span data-public-view-count>${o(Ke(e.view_count))}</span>
      </div>
      ${e.description?`<p class="public-watch-description">${o(e.description)}</p>`:""}
      <div class="public-author-row">
        ${xa(e,t)}
        <div>
          ${Ta(e,t)}
          <span>Uploaded ${o(M(e.uploaded_at))}</span>
        </div>
      </div>
    </section>
  `}function Ut(e,t){let a=Qa(t);return`
    <section class="public-comments" aria-labelledby="comments-title">
      <div class="section-header">
        <h2 id="comments-title">Comments</h2>
        <span class="muted">${a.count}</span>
      </div>
      ${r.user?`<form id="public-comment-form" class="public-comment-form">
              <label class="field">
                <span>Comment</span>
                <textarea name="body" rows="3" maxlength="2000" placeholder="Add a comment"></textarea>
              </label>
              <div class="clip-inline-actions">
                <button class="btn-secondary" type="submit">${c("message")} Post comment</button>
              </div>
            </form>`:'<div class="notice public-comment-signin"><a href="/login" data-route>Sign in</a> to comment.</div>'}
      ${a.count?`<div class="public-comment-list">${a.roots.map(n=>Dt(n,e.share_id,a.repliesByParent)).join("")}</div>`:'<div class="empty-state">No comments yet.</div>'}
    </section>
  `}function Qa(e){let t=new Map(e.map(s=>[s.id,s])),a=new Map,n=[],i=0;return e.forEach(s=>{let l=s.parent_comment_id||"";l&&t.has(l)?(a.has(l)||a.set(l,[]),a.get(l).push(s),i+=1):l||(n.push(s),i+=1)}),{roots:n,repliesByParent:a,count:i}}function Dt(e,t,a,n=0){let i=e.author_name||"Unknown creator",s=e.author_username?`/u/${encodeURIComponent(e.author_username)}`:"",l=a.get(e.id)||[],y=[r.user&&n===0?`<button class="public-comment-action" type="button" data-reply-comment="${u(e.id)}">${c("message")} Reply</button>`:"",e.viewer_can_delete?`<button class="icon-button public-comment-delete" type="button" data-delete-comment="${u(e.id)}" data-share-id="${u(t)}" aria-label="Delete comment" title="Delete comment">${c("trash")}</button>`:""].filter(Boolean);return`
    <article class="public-comment ${e.is_uploader?"public-comment-uploader":""} ${n>0?"public-comment-reply-item":""}" data-comment-id="${u(e.id)}">
      ${se({username:e.author_username||i,display_name:i,avatar_url:e.author_avatar_url,updated_at:e.updated_at},"public-comment-avatar")}
      <div>
        <div class="public-comment-head">
          <div class="public-comment-byline">
            ${s?`<a href="${u(s)}" data-route>${o(i)}</a>`:`<strong>${o(i)}</strong>`}
            ${e.is_uploader?'<span class="public-comment-badge">Uploader</span>':""}
            <span>${o($e(e.created_at))}</span>
          </div>
          ${y.length?`<div class="public-comment-actions">${y.join("")}</div>`:""}
        </div>
        <p>${o(e.body)}</p>
        ${r.user&&n===0?`<form class="public-comment-reply-form" data-reply-form="${u(e.id)}" hidden>
                <label class="field">
                  <span>Reply</span>
                  <textarea name="body" rows="2" maxlength="2000" placeholder="Write a reply"></textarea>
                </label>
                <div class="clip-inline-actions">
                  <button class="btn-secondary" type="submit">${c("message")} Post reply</button>
                </div>
              </form>`:""}
        ${l.length?`<div class="public-comment-replies">${l.map($=>Dt($,t,a,n+1)).join("")}</div>`:""}
      </div>
    </article>
  `}function Nt(e){document.querySelector("#public-comment-form")?.addEventListener("submit",t=>E(t,async()=>{let a=new FormData(t.currentTarget);try{await m(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`,{method:"POST",body:{body:String(a.get("body")||"")}}),p("Comment posted."),D(e)}catch(n){p(n.message,"error"),D(e)}})),document.querySelectorAll("[data-reply-comment]").forEach(t=>{t.addEventListener("click",a=>{a.preventDefault();let i=t.closest("[data-comment-id]")?.querySelector("[data-reply-form]");i&&(i.hidden=!i.hidden,i.hidden||i.querySelector("textarea")?.focus())})}),document.querySelectorAll("[data-reply-form]").forEach(t=>{t.addEventListener("submit",a=>E(a,async()=>{let n=a.currentTarget,i=new FormData(n),s=n.dataset.replyForm;try{await m(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`,{method:"POST",body:{body:String(i.get("body")||""),parent_comment_id:s}}),p("Reply posted."),D(e)}catch(l){p(l.message,"error"),D(e)}}))}),document.querySelectorAll("[data-delete-comment]").forEach(t=>{t.addEventListener("click",async a=>{a.preventDefault();let n=t.dataset.deleteComment,i=t.dataset.shareId||e;if(!(!n||!await G("Delete comment?","This removes the comment from the public clip page.","Delete",!0)))try{await m(`/api/v1/public/clips/${encodeURIComponent(i)}/comments/${encodeURIComponent(n)}`,{method:"DELETE",body:{}}),p("Comment deleted."),D(i)}catch(l){p(l.message,"error"),D(i)}})})}async function Ba(e){try{let t=await m(`/api/v1/public/clips/${encodeURIComponent(e)}/view`,{method:"POST",body:{}});if(I().name!=="public"||I().shareId!==e)return;document.querySelector("[data-public-view-count]")?.replaceChildren(document.createTextNode(Ke(t.view_count)))}catch{}}function It(e){return`
    <aside class="public-recommendation-rail" aria-label="Recommended clips">
      ${Ft(e)}
    </aside>
  `}function Ft(e){return`
    <h2>Recommended</h2>
    <div class="recommendation-list recommendation-list-sidebar">
      ${e.map(t=>Ha(t,"sidebar")).join("")}
    </div>
  `}function Ha(e,t){let a=`/c/${encodeURIComponent(e.share_id)}`,n=`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/thumbnail`,i=je(e),s=oe(e.duration_ms),l=$e(e.uploaded_at);return`
    <a class="recommendation-card recommendation-card-${u(t)}" href="${u(a)}" data-route>
      <div class="recommendation-thumb">
        <img src="${u(n)}" alt="">
        ${s!=="Unknown"?`<span class="public-duration-badge">${o(s)}</span>`:""}
      </div>
      <div class="recommendation-body">
        <strong>${o(e.title)}</strong>
        <span>${o(i)}</span>
        <span>${o(ge(e))}${l!=="Unknown"?` &middot; ${o(l)}`:""}</span>
      </div>
    </a>
  `}function ja(e){return(e||"C").trim().slice(0,1).toUpperCase()||"C"}function Ie({title:e,subtitle:t,body:a}){f({active:"public",title:e,subtitle:t,body:a,hideTopbar:!0})}async function z(){let e=P,t=R();f({active:"profile",title:"Profile",subtitle:"Public identity and avatar.",body:'<div class="empty-state">Loading profile settings...</div>'});try{if(await O(),!_(e,t))return;f({active:"profile",title:"Profile",subtitle:"Public identity and avatar.",body:Oa(r.user)}),za()}catch(a){if(!_(e,t))return;f({active:"profile",title:"Profile",subtitle:"Public identity and avatar.",body:`<div class="error-box">${o(a.message)}</div>`})}}function Oa(e){return`
    <section class="profile-settings-page">
      <div class="profile-settings-header">
        ${se(e,"profile-avatar")}
        <div>
          <h2>${o(re(e))}</h2>
          <p>@${o(e.username)} \xB7 ${o(e.role)}</p>
        </div>
      </div>
      <form id="profile-form" class="profile-form">
        <label class="field">
          <span>Display name</span>
          <input name="display_name" type="text" maxlength="120" value="${u(e.display_name||"")}" placeholder="${u(e.username)}">
        </label>
        <label class="field">
          <span>Bio</span>
          <textarea name="bio" rows="6" maxlength="2000" placeholder="Tell people what you upload.">${o(e.bio||"")}</textarea>
        </label>
        <div class="clip-inline-actions">
          <button class="btn-primary" type="submit">${c("save")} Save profile</button>
        </div>
      </form>
      <form id="avatar-form" class="profile-form">
        <label class="field">
          <span>Avatar</span>
          <input name="avatar" type="file" accept="image/png,image/jpeg,image/webp,image/gif">
          <small>PNG, JPEG, WebP, or GIF. Max 2 MiB.</small>
        </label>
        <div class="clip-inline-actions">
          <button class="btn-secondary" type="submit">${c("upload")} Upload avatar</button>
        </div>
      </form>
      <div class="profile-public-link">
        <a class="btn-secondary" href="/u/${encodeURIComponent(e.username)}" data-route>${c("external")} View public profile</a>
      </div>
    </section>
  `}function za(){document.querySelector("#profile-form")?.addEventListener("submit",e=>E(e,async()=>{let t=new FormData(e.currentTarget);try{let a=await m("/api/v1/me/profile",{method:"PATCH",body:{display_name:T(t.get("display_name")),bio:T(t.get("bio"))}});r.user=a,p("Profile saved."),z()}catch(a){p(a.message,"error"),z()}})),document.querySelector("#avatar-form")?.addEventListener("submit",e=>E(e,async()=>{let t=e.currentTarget.elements.avatar?.files?.[0];if(!t){p("Choose an avatar image first.","error"),z();return}try{let a=await Ka(t);r.user=a,p("Avatar uploaded."),z()}catch(a){p(a.message,"error"),z()}}))}async function Ka(e){let t=new Headers;t.set("Accept","application/json"),t.set("Content-Type",e.type||"application/octet-stream"),r.csrfToken&&t.set("X-CSRF-Token",r.csrfToken);let a=await fetch("/api/v1/me/avatar",{method:"PUT",credentials:"same-origin",headers:t,body:e}),n=await a.json().catch(()=>({}));if(!a.ok)throw new Error(n.error||a.statusText||"Avatar upload failed");return n}async function ie(){let e=P,t=R();f({active:"account",title:"Account",subtitle:"Sessions and device tokens.",body:'<div class="empty-state">Loading account data...</div>'});try{let[a,n]=await Promise.all([m("/api/v1/auth/sessions"),m("/api/v1/auth/device-tokens")]);if(!_(e,t))return;f({active:"account",title:"Account",subtitle:"Sessions and device tokens.",body:Ga(a,n)}),Ja()}catch(a){if(!_(e,t))return;f({active:"account",title:"Account",subtitle:"Sessions and device tokens.",body:`<div class="error-box">${o(a.message)}</div>`})}}function Ga(e,t){return`
    <section class="account-grid">
      <div class="panel section">
        <div class="section-header">
          <h2>Browser sessions</h2>
          <span class="muted">${e.length} active</span>
        </div>
        ${e.length?`<div class="management-list">${e.map(Za).join("")}</div>`:'<div class="empty-state">No active sessions.</div>'}
      </div>
      <div class="panel section">
        <div class="section-header">
          <h2>Device tokens</h2>
          <span class="muted">${t.length} total</span>
        </div>
        ${t.length?`<div class="management-list">${t.map(Wa).join("")}</div>`:'<div class="empty-state">No device tokens.</div>'}
      </div>
    </section>
  `}function Za(e){return`
    <div class="management-item">
      <div>
        <strong>${o(e.user_agent||"Unknown browser")}</strong>
        <div class="meta-line">
          <span>${o(e.ip_address||"Unknown IP")}</span>
          <span>Last used ${M(e.last_used_at||e.created_at)}</span>
          <span>Expires ${M(e.expires_at)}</span>
        </div>
      </div>
      <div class="actions">
        ${e.current?'<span class="badge badge-public">Current</span>':""}
        <button class="btn-danger" data-session-revoke="${u(e.id)}" data-current="${e.current?"true":"false"}">${c("x")} Revoke</button>
      </div>
    </div>
  `}function Wa(e){let t=!!e.revoked_at;return`
    <div class="management-item">
      <div>
        <strong>${o(e.name)}</strong>
        <div class="meta-line">
          <span>Created ${M(e.created_at)}</span>
          <span>Last used ${M(e.last_used_at)}</span>
          ${e.expires_at?`<span>Expires ${M(e.expires_at)}</span>`:""}
          ${t?`<span>Revoked ${M(e.revoked_at)}</span>`:""}
        </div>
      </div>
      <div class="actions">
        ${t?'<span class="badge badge-private">Revoked</span>':'<span class="badge badge-public">Active</span>'}
        <button class="btn-danger" data-device-token-revoke="${u(e.id)}" ${t?"disabled":""}>${c("x")} Revoke</button>
      </div>
    </div>
  `}function Ja(){document.querySelectorAll("[data-session-revoke]").forEach(e=>{e.addEventListener("click",async()=>{if(await G("Revoke browser session?",e.dataset.current==="true"?"This signs you out of the current browser session.":"This signs out that browser session immediately.","Revoke",!0))try{if(await m(`/api/v1/auth/sessions/${encodeURIComponent(e.dataset.sessionRevoke)}`,{method:"DELETE",body:{}}),e.dataset.current==="true"){r.user=null,r.csrfToken=null,p("Current session revoked."),C("/login");return}p("Session revoked."),ie()}catch(a){p(a.message,"error"),ie()}})}),document.querySelectorAll("[data-device-token-revoke]").forEach(e=>{e.addEventListener("click",async()=>{if(await G("Revoke device token?","The desktop client using this token will need to reconnect.","Revoke",!0))try{await m(`/api/v1/auth/device-tokens/${encodeURIComponent(e.dataset.deviceTokenRevoke)}`,{method:"DELETE",body:{}}),p("Device token revoked."),ie()}catch(a){p(a.message,"error"),ie()}})})}async function N(e){let t=P,a=R();f({active:"admin",title:"Admin",subtitle:"Accounts, instance summary, and processing diagnostics.",body:'<div class="empty-state">Loading admin data...</div>'});try{let[n,i,s,l,y,$]=await Promise.all([m("/api/v1/admin/overview"),m("/api/v1/admin/settings"),m("/api/v1/users"),m("/api/v1/admin/uploads/failed?limit=50"),m("/api/v1/admin/jobs/dead?limit=50"),m("/api/v1/admin/jobs/recent-errors?limit=50")]);if(!_(t,a))return;f({active:"admin",title:"Admin",subtitle:"Accounts, instance summary, and processing diagnostics.",body:Xa(e,{overview:n,settings:i,users:s,failedUploads:l,deadJobs:y,recentErrors:$})}),ci()}catch(n){if(!_(t,a))return;f({active:"admin",title:"Admin",subtitle:"Accounts, instance summary, and processing diagnostics.",body:`<div class="error-box">${o(n.message)}</div>`})}}function Xa(e,t){let a=["overview","users","settings","jobs"].includes(e)?e:"overview";return`
    <section class="section">
      <div class="tabs" role="tablist" aria-label="Admin views">
        ${be("/admin?tab=overview","overview",a,c("server"),"Overview")}
        ${be("/admin?tab=users","users",a,c("users"),"Users")}
        ${be("/admin?tab=settings","settings",a,c("sliders"),"Settings")}
        ${be("/admin?tab=jobs","jobs",a,c("alert"),"Jobs")}
      </div>
      ${a==="users"?ti(t.users,t.settings):""}
      ${a==="settings"?ri(t.settings):""}
      ${a==="jobs"?si(t.failedUploads,t.deadJobs,t.recentErrors):""}
      ${a==="overview"?Ya(t.overview):""}
    </section>
  `}function be(e,t,a,n,i){return`<a class="tab ${t===a?"active":""}" href="${u(e)}" data-route>${n} ${o(i)}</a>`}function Ya(e){return`
    <div class="panel">
      <h2>Server summary</h2>
      <dl class="data-list">
        ${h("Server version",e.server_version)}
        ${h("API version",e.api_version)}
        ${h("Public URL",e.public_url)}
        ${h("Database",e.database_backend)}
        ${h("Storage",`${e.storage_backend} - ${e.storage_summary}`)}
        ${h("Stored clips",`${e.total_clips} clips - ${x(e.total_storage_bytes)}`)}
        ${h("Users",`${e.total_users} total`)}
        ${h("Max upload",x(e.max_upload_size_bytes))}
        ${h("Part size",x(e.upload_part_size_bytes))}
        ${h("Single PUT max",x(e.single_put_max_bytes))}
        ${h("Active uploads/user",e.max_active_upload_sessions_per_user)}
        ${h("User quota",e.user_storage_quota_bytes?x(e.user_storage_quota_bytes):"Disabled")}
        ${h("Storage warning",ei(e))}
        ${h("Upload TTL",`${e.upload_session_ttl_seconds}s`)}
        ${h("Direct S3 uploads",e.direct_s3_uploads?"Enabled":"Disabled")}
        ${h("Public media",`${e.public_media_mode}, ${e.public_read_url_ttl_seconds}s TTL`)}
      </dl>
    </div>
  `}function ei(e){if(!e.global_storage_warning_threshold_bytes)return"Disabled";let t=x(e.global_storage_warning_threshold_bytes);return e.global_storage_warning?`At or above ${t}`:`Below ${t}`}function ti(e,t){let a=[["user","User"]];k()&&a.push(["admin","Admin"]);let n=!!t?.smtp_enabled;return`
    <div class="admin-grid">
      <div class="admin-side-stack">
        <form id="create-user-form" class="panel section">
          <h2>Create user</h2>
          ${S("Username","username","text","","Required")}
          ${S("Display name","display_name","text","","Optional")}
          ${S("Email","email","email","","Optional")}
          ${S("Password","password","password","","Required")}
          ${U("Role","role","user",a)}
          <button class="btn-primary" type="submit">${c("plus")} Create user</button>
        </form>
        <form id="invite-link-form" class="panel section">
          <h2>Invite link</h2>
          ${U("Role","role","user",a)}
          ${S("Email","email","email","",n?"Optional":"SMTP disabled",!n)}
          <div class="actions">
            <button class="btn-secondary" type="submit" name="intent" value="link">${c("copy")} Generate link</button>
            ${n?`<button class="btn-primary" type="submit" name="intent" value="email">${c("message")} Send email</button>`:""}
          </div>
        </form>
      </div>
      <div class="panel">
        <div class="section-header">
          <h2>Users</h2>
          <span class="muted">${e.length} total</span>
        </div>
        ${ii()}
        <div class="table-wrap">
          <table>
            <thead><tr><th>Username</th><th>Role</th><th>Status</th><th>Storage</th><th>Last login</th><th></th></tr></thead>
            <tbody>${e.map(ai).join("")}</tbody>
          </table>
        </div>
      </div>
    </div>
  `}function ai(e){let t=e.storage_quota_bytes!=null?x(e.storage_quota_bytes):"No limit",a=!ni(e);return`
    <tr>
      <td>
        <strong>${o(e.username)}</strong>
        <div class="muted">${o(e.display_name||e.id)}</div>
        ${e.email?`<div class="muted">${o(e.email)}</div>`:""}
      </td>
      <td>${o(e.role)}</td>
      <td>${e.is_disabled?'<span class="badge badge-warn">Disabled</span>':'<span class="badge badge-public">Active</span>'}</td>
      <td>
        <strong>${x(e.storage_bytes||0)}</strong>
        <div class="muted">quota ${o(t)}</div>
      </td>
      <td>${M(e.last_login_at)}</td>
      <td>
        <div class="actions">
          <button class="btn-secondary" data-user-action="quota" data-user-id="${u(e.id)}">${c("sliders")} Quota</button>
          <button class="btn-secondary" data-user-action="reset" data-user-id="${u(e.id)}">${c("clipboard")} Reset link</button>
          <button class="btn-danger" data-user-action="disable" data-user-id="${u(e.id)}" ${a?"disabled":""}>${c("x")} Disable</button>
        </div>
      </td>
    </tr>
  `}function ii(){if(!r.adminResetLink)return"";let e=r.adminResetLink.kind==="invite"?"Invite":"Reset",t=r.adminResetLink.username?` for ${r.adminResetLink.username}`:"";return`
    <div class="notice admin-reset-link">
      <div>
        <strong>${o(e)} link created${o(t)}</strong>
        <span>Expires ${o(M(r.adminResetLink.expires_at))}</span>
        <code>${o(r.adminResetLink.reset_url)}</code>
      </div>
      <button class="btn-secondary" type="button" data-copy="${u(r.adminResetLink.reset_url)}">${c("copy")} Copy</button>
    </div>
  `}function ni(e){return!(e.is_disabled||r.user?.id===e.id||e.role==="owner"||e.role==="admin"&&!k())}function ri(e){return`
    <form id="admin-settings-form" class="admin-settings-page">
      <section class="settings-section">
        <div class="settings-copy">
          <h2>Upload policy</h2>
          <p>Control whether long recordings can be uploaded and where Clipline classifies a clip as a full VOD.</p>
        </div>
        <div class="settings-controls">
          <label class="check-field">
            <input name="allow_vod_uploads" type="checkbox" ${e.allow_vod_uploads?"checked":""}>
            <span>Allow full-length VOD uploads</span>
          </label>
          ${K("VOD threshold minutes","vod_threshold_minutes",e.vod_threshold_minutes??30,"30")}
        </div>
      </section>
      <section class="settings-section">
        <div class="settings-copy">
          <h2>About page</h2>
          <p>${k()?"Edit the public About page shown to all visitors.":"Only the owner can edit the public About page."}</p>
        </div>
        <div class="settings-controls">
          <label class="field">
            <span>About text</span>
            <textarea name="about_text" maxlength="5000" ${k()?"":"disabled"}>${o(e.about_text||"")}</textarea>
          </label>
        </div>
      </section>
      <section class="settings-section">
        <div class="settings-copy">
          <h2>Email invites</h2>
          <p>${k()?"Configure SMTP so new users can receive password setup links by email.":"Only the owner can edit SMTP invite settings."}</p>
        </div>
        <div class="settings-controls">
          <label class="check-field">
            <input name="smtp_enabled" type="checkbox" ${e.smtp_enabled?"checked":""} ${k()?"":"disabled"}>
            <span>Enable SMTP invites</span>
          </label>
          ${S("SMTP host","smtp_host","text",e.smtp_host||"","smtp.example.com",!k())}
          ${K("SMTP port","smtp_port",e.smtp_port??587,"587","1",!k())}
          ${U("TLS mode","smtp_tls_mode",e.smtp_tls_mode||"starttls",[["starttls","STARTTLS"],["tls","TLS"],["none","None"]],!k())}
          ${S("SMTP username","smtp_username","text",e.smtp_username||"","Optional",!k())}
          ${S("SMTP password","smtp_password","password","",e.smtp_password_configured?"Configured; leave blank to keep":"Optional",!k())}
          ${e.smtp_password_configured?`<label class="check-field">
                  <input name="smtp_password_clear" type="checkbox" ${k()?"":"disabled"}>
                  <span>Clear stored SMTP password</span>
                </label>`:""}
          ${S("From email","smtp_from_email","email",e.smtp_from_email||"","clips@example.com",!k())}
          ${S("From name","smtp_from_name","text",e.smtp_from_name||"","Clipline Cloud",!k())}
        </div>
      </section>
      <div class="settings-action-row">
        <button class="btn-primary" type="submit">${c("save")} Save settings</button>
      </div>
    </form>
  `}function si(e,t,a){return`
    <div class="section">
      <div class="panel">
        <div class="section-header">
          <h2>Failed uploads</h2>
          <span class="muted">${e.length}</span>
        </div>
        ${e.length?`<div class="job-list">${e.map(oi).join("")}</div>`:'<p class="muted">No failed uploads.</p>'}
      </div>
      <div class="panel">
        <div class="section-header">
          <h2>Dead jobs</h2>
          <span class="muted">${t.length}</span>
        </div>
        ${t.length?`<div class="job-list">${t.map(_t).join("")}</div>`:'<p class="muted">No dead jobs.</p>'}
      </div>
      <div class="panel">
        <div class="section-header">
          <h2>Recent job errors</h2>
          <span class="muted">${a.length}</span>
        </div>
        ${a.length?`<div class="job-list">${a.map(_t).join("")}</div>`:'<p class="muted">No recent job errors.</p>'}
      </div>
    </div>
  `}function oi(e){let t=Math.max(0,Math.min(1e4,Number(e.progress_basis_points||0))),a=li(e.recovery_action);return`
    <div class="job-item">
      <div class="job-title-line">
        <strong class="mono">${o(e.id)}</strong>
        <span class="badge badge-warn">${bi(t)}</span>
      </div>
      <div class="progress-meter" aria-label="Upload progress">
        <span style="width:${t/100}%"></span>
      </div>
      <span class="muted">clip ${o(e.clip_id)} - ${x(e.received_size_bytes)} of ${x(e.expected_size_bytes)} - updated ${M(e.updated_at)}</span>
      ${e.failure_reason?`<span class="error-box">${o(e.failure_reason)}</span>`:""}
      ${a?`<span class="muted">Recovery: ${o(a)}</span>`:""}
    </div>
  `}function li(e){switch(e){case"delete_and_retry":return"delete the failed upload and retry from a new session";case"retry":return"retry the current upload request";default:return""}}function _t(e){return`
    <div class="job-item">
      <strong>${o(e.kind)} <span class="mono">${o(e.id)}</span></strong>
      <span class="muted">${o(e.status)} - attempts ${e.attempts}/${e.max_attempts} - updated ${M(e.updated_at)} - target ${o(e.target_type||"")}:${o(e.target_id||"")}</span>
      ${e.last_error?`<span class="error-box">${o(e.last_error)}</span>`:""}
    </div>
  `}function ci(){let e=document.querySelector("#create-user-form");e&&e.addEventListener("submit",n=>E(n,async()=>{let i=new FormData(n.currentTarget);try{await m("/api/v1/users",{method:"POST",body:{username:String(i.get("username")||""),display_name:T(i.get("display_name")),email:T(i.get("email")),password:T(i.get("password")),role:String(i.get("role")||"user")}}),r.adminResetLink=null,p("User created."),C("/admin?tab=users")}catch(s){p(s.message,"error"),N("users")}}));let t=document.querySelector("#invite-link-form");t&&t.addEventListener("submit",n=>E(n,async()=>{let i=new FormData(n.currentTarget),s=n.submitter?.value==="email"?"email":"link";try{let l=await m("/api/v1/invites",{method:"POST",body:{role:String(i.get("role")||"user"),email:T(i.get("email")),send_email:s==="email"}});r.adminResetLink={...l,kind:"invite"},p(s==="email"?"Invite sent.":"Invite link created."),C("/admin?tab=users")}catch(l){p(l.message,"error"),N("users")}}));let a=document.querySelector("#admin-settings-form");a&&a.addEventListener("submit",n=>E(n,async()=>{let i=new FormData(n.currentTarget),s={allow_vod_uploads:i.get("allow_vod_uploads")==="on",vod_threshold_minutes:Number(i.get("vod_threshold_minutes")||30)};if(k()){s.about_text=String(i.get("about_text")||""),s.smtp_enabled=i.get("smtp_enabled")==="on",s.smtp_host=T(i.get("smtp_host")),s.smtp_port=Number(i.get("smtp_port")||587),s.smtp_tls_mode=String(i.get("smtp_tls_mode")||"starttls"),s.smtp_username=T(i.get("smtp_username")),s.smtp_from_email=T(i.get("smtp_from_email")),s.smtp_from_name=T(i.get("smtp_from_name"));let l=String(i.get("smtp_password")||"").trim();l&&(s.smtp_password=l),i.get("smtp_password_clear")==="on"&&(s.smtp_password_clear=!0)}try{await m("/api/v1/admin/settings",{method:"PATCH",body:s}),p("Settings saved."),N("settings")}catch(l){p(l.message,"error"),N("settings")}})),document.querySelectorAll("[data-user-action]").forEach(n=>{n.addEventListener("click",async()=>{let i=n.dataset.userId,s=n.dataset.userAction;try{if(s==="quota"){let l=await Be({title:"Set storage quota",description:"Enter a per-user storage limit in GiB. Leave it blank to remove the per-user limit.",confirmLabel:"Save quota",fields:[{name:"quota_gib",label:"Quota GiB",type:"number",step:"0.1",min:"0",placeholder:"No per-user limit"}]});if(!l)return;await m(`/api/v1/users/${encodeURIComponent(i)}`,{method:"PATCH",body:{storage_quota_bytes:l.quota_gib.trim()?mi(l.quota_gib):null}}),p("Storage quota updated.")}else{let l=await Be({title:s==="disable"?"Disable user?":"Create reset link?",description:s==="disable"?"This immediately revokes the user's sessions and device tokens.":"This creates a temporary password reset link for the selected user.",confirmLabel:s==="disable"?"Disable":"Create link",danger:s==="disable",fields:[{name:"reauth_password",label:"Your password",type:"password",required:!0}]});if(!l)return;if(s==="disable")await m(`/api/v1/users/${encodeURIComponent(i)}`,{method:"DELETE",body:{reauth_password:l.reauth_password}}),p("User disabled.");else if(s==="reset"){let y=await m(`/api/v1/users/${encodeURIComponent(i)}/reset-password`,{method:"POST",body:{reauth_password:l.reauth_password}});r.adminResetLink={...y,kind:"reset"},p("Reset link created.")}}N("users")}catch(l){p(l.message,"error"),N("users")}})})}function S(e,t,a,n,i,s=!1){return`
    <label class="field">
      <span>${o(e)}</span>
      <input name="${u(t)}" type="${u(a)}" value="${u(n)}" placeholder="${u(i||"")}" ${s?"disabled":""}>
    </label>
  `}function K(e,t,a,n,i="1",s=!1){return`
    <label class="field">
      <span>${o(e)}</span>
      <input name="${u(t)}" type="number" min="0" step="${u(i)}" value="${u(a)}" placeholder="${u(n||"")}" ${s?"disabled":""}>
    </label>
  `}function U(e,t,a,n,i=!1){return`
    <label class="field">
      <span>${o(e)}</span>
      <select name="${u(t)}" ${i?"disabled":""}>
        ${n.map(([s,l])=>`<option value="${u(s)}" ${s===a?"selected":""}>${o(l)}</option>`).join("")}
      </select>
    </label>
  `}function h(e,t,a=!1){return`
    <div>
      <dt>${o(e)}</dt>
      <dd class="${a?"mono":""}">${o(t??"Unknown")}</dd>
    </div>
  `}function Vt(e){let t=e||"private";return`<span class="badge ${t==="public"?"badge-public":t==="unlisted"?"badge-unlisted":"badge-private"}">${c(t==="private"?"lock":"globe")} ${o(t)}</span>`}function di(){if(!r.flash)return"";let e=r.flash;return r.flash=null,`<div class="${e.type==="error"?"error-box":"notice"}">${o(e.message)}</div>`}function p(e,t="notice"){r.flash={message:e,type:t}}function Be({title:e,description:t="",fields:a=[],confirmLabel:n="Confirm",danger:i=!1}){return new Promise(s=>{let l=document.createElement("div");l.className="modal-backdrop",l.innerHTML=`
      <section class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <form class="modal-form">
          <div class="modal-header">
            <h2 id="modal-title">${o(e)}</h2>
            ${t?`<p>${o(t)}</p>`:""}
          </div>
          ${a.length?`<div class="modal-fields">${a.map(ui).join("")}</div>`:""}
          <div class="modal-actions">
            <button class="btn-secondary" type="button" data-modal-cancel>Cancel</button>
            <button class="${i?"btn-danger":"btn-primary"}" type="submit">${o(n)}</button>
          </div>
        </form>
      </section>
    `;let y=L=>{document.removeEventListener("keydown",$),l.remove(),s(L)},$=L=>{L.key==="Escape"&&y(null)};document.body.append(l),document.addEventListener("keydown",$),l.addEventListener("click",L=>{L.target===l&&y(null)}),l.querySelector("[data-modal-cancel]").addEventListener("click",()=>y(null)),l.querySelector("form").addEventListener("submit",L=>{L.preventDefault();let _e=Object.fromEntries(new FormData(L.currentTarget).entries());y(_e)}),l.querySelector("input, textarea, select, button")?.focus()})}function ui(e){let t=[`name="${u(e.name)}"`,`type="${u(e.type||"text")}"`,e.required?"required":"",e.step?`step="${u(e.step)}"`:"",e.min!=null?`min="${u(e.min)}"`:"",e.placeholder?`placeholder="${u(e.placeholder)}"`:"",e.value!=null?`value="${u(e.value)}"`:""].filter(Boolean).join(" ");return`
    <label class="field">
      <span>${o(e.label)}</span>
      <input ${t}>
      ${e.help?`<small>${o(e.help)}</small>`:""}
    </label>
  `}async function G(e,t,a="Confirm",n=!1){return!!await Be({title:e,description:t,confirmLabel:a,danger:n})}async function pi(e){if(e){try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(e);else{let t=document.createElement("textarea");t.value=e,document.body.append(t),t.select(),document.execCommand("copy"),t.remove()}p("Copied to clipboard.")}catch{p("Copy failed. Select and copy the URL manually.","error")}ve()}}function T(e){let t=String(e||"").trim();return t||null}function M(e){if(!e)return"Unknown";let t=new Date(e);return Number.isNaN(t.getTime())?"Unknown":new Intl.DateTimeFormat(void 0,{dateStyle:"medium",timeStyle:"short"}).format(t)}function oe(e){if(e==null)return"Unknown";let t=Math.max(0,Math.round(Number(e)/1e3)),a=Math.floor(t/60),n=t%60;return`${a}:${String(n).padStart(2,"0")}`}function $e(e){if(!e)return"Unknown";let t=new Date(e);if(Number.isNaN(t.getTime()))return"Unknown";let a=Math.min(0,t.getTime()-Date.now()),n=[["year",365*24*60*60*1e3],["month",720*60*60*1e3],["week",10080*60*1e3],["day",1440*60*1e3],["hour",3600*1e3],["minute",60*1e3],["second",1e3]],[i,s]=n.find(([,y])=>Math.abs(a)>=y)||n[n.length-1],l=Math.round(a/s);return new Intl.RelativeTimeFormat(void 0,{numeric:"always"}).format(l,i)}function x(e){if(e==null)return"Unknown";let t=Number(e);if(!Number.isFinite(t))return"Unknown";let a=["B","KiB","MiB","GiB","TiB"],n=t,i=0;for(;n>=1024&&i<a.length-1;)n/=1024,i+=1;return`${n.toFixed(i===0?0:1)} ${a[i]}`}function Ke(e){let t=Number(e||0),a=Number.isFinite(t)&&t>0?Math.floor(t):0;return`${new Intl.NumberFormat(void 0,{notation:a>=1e4?"compact":"standard"}).format(a)} view${a===1?"":"s"}`}function mi(e){let t=Number(String(e||"").trim());if(!Number.isFinite(t)||t<0)throw new Error("Storage quota must be a non-negative number");return Math.round(t*1024*1024*1024)}function ye(e,t,a){a!=null&&e.set(t,String(a))}function wt(e){let t=Qt(e);return t==null?null:Math.round(t*1e3)}function kt(e){let t=Qt(e);return t==null?null:Math.round(t*1024*1024)}function Qt(e){if(e==="")return null;let t=Number(e);return Number.isFinite(t)?t:null}function bi(e){return`${(e/100).toFixed(e%100===0?0:1)}%`}function c(e){return`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${yt[e]||yt.alert}</svg>`}function o(e){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function u(e){return o(e)}function St(e){if(!e)return"";let t=String(e);try{let a=new URL(t,window.location.origin);return["http:","https:"].includes(a.protocol)?t:""}catch{return""}}
