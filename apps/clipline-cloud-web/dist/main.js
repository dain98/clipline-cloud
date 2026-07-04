var Jn=Object.defineProperty;var ea=(e,t)=>()=>(e&&(t=e(e=0)),t);var ta=(e,t)=>{for(var n in t)Jn(e,n,{get:t[n],enumerable:!0})};var jt={};ta(jt,{ApiError:()=>de,api:()=>E,getCsrfToken:()=>ua,setCsrfToken:()=>$e});function $e(e){Fe=e}function ua(){return Fe}async function E(e,t={}){let n=(t.method||"GET").toUpperCase(),a=new Headers(t.headers||{});a.set("Accept","application/json");let o=t.body;o&&typeof o!="string"&&(a.set("Content-Type","application/json"),o=JSON.stringify(o)),!["GET","HEAD","OPTIONS"].includes(n)&&Fe&&a.set("X-CSRF-Token",Fe);let r=await fetch(e,{...t,body:o,credentials:"same-origin",headers:a,method:n}),u=(r.headers.get("content-type")||"").includes("application/json")?await r.json():await r.text();if(!r.ok){r.status===401&&window.dispatchEvent(new CustomEvent("clipline:unauthorized"));let p=typeof u=="object"&&u?.error?u.error:r.statusText;throw new de(p||"Request failed",r.status)}return u}var Fe,de,ie=ea(()=>{Fe=null;de=class extends Error{constructor(t,n){super(t),this.status=n}}});var Ue,L,Lt,na,ue,Et,Ut,Nt,tt,Pe,ge,At,rt,nt,at,aa,Ie={},De=[],ra=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,Ne=Array.isArray;function oe(e,t){for(var n in t)e[n]=t[n];return e}function ot(e){e&&e.parentNode&&e.parentNode.removeChild(e)}function it(e,t,n){var a,o,r,l={};for(r in t)r=="key"?a=t[r]:r=="ref"?o=t[r]:l[r]=t[r];if(arguments.length>2&&(l.children=arguments.length>3?Ue.call(arguments,2):n),typeof e=="function"&&e.defaultProps!=null)for(r in e.defaultProps)l[r]===void 0&&(l[r]=e.defaultProps[r]);return Ee(e,l,a,o,null)}function Ee(e,t,n,a,o){var r={type:e,props:t,key:n,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:o??++Lt,__i:-1,__u:0};return o==null&&L.vnode!=null&&L.vnode(r),r}function Ae(e){return e.children}function Re(e,t){this.props=e,this.context=t}function fe(e,t){if(t==null)return e.__?fe(e.__,e.__i+1):null;for(var n;t<e.__k.length;t++)if((n=e.__k[t])!=null&&n.__e!=null)return n.__e;return typeof e.type=="function"?fe(e):null}function oa(e){if(e.__P&&e.__d){var t=e.__v,n=t.__e,a=[],o=[],r=oe({},t);r.__v=t.__v+1,L.vnode&&L.vnode(r),st(e.__P,r,t,e.__n,e.__P.namespaceURI,32&t.__u?[n]:null,a,n??fe(t),!!(32&t.__u),o),r.__v=t.__v,r.__.__k[r.__i]=r,Ot(a,r,o),t.__e=t.__=null,r.__e!=n&&Ft(r)}}function Ft(e){if((e=e.__)!=null&&e.__c!=null)return e.__e=e.__c.base=null,e.__k.some(function(t){if(t!=null&&t.__e!=null)return e.__e=e.__c.base=t.__e}),Ft(e)}function Rt(e){(!e.__d&&(e.__d=!0)&&ue.push(e)&&!Le.__r++||Et!=L.debounceRendering)&&((Et=L.debounceRendering)||Ut)(Le)}function Le(){try{for(var e,t=1;ue.length;)ue.length>t&&ue.sort(Nt),e=ue.shift(),t=ue.length,oa(e)}finally{ue.length=Le.__r=0}}function zt(e,t,n,a,o,r,l,u,p,c,d){var b,s,f,k,$,y,w,g=a&&a.__k||De,S=t.length;for(p=ia(n,t,g,p,S),b=0;b<S;b++)(f=n.__k[b])!=null&&(s=f.__i!=-1&&g[f.__i]||Ie,f.__i=b,y=st(e,f,s,o,r,l,u,p,c,d),k=f.__e,f.ref&&s.ref!=f.ref&&(s.ref&&lt(s.ref,null,f),d.push(f.ref,f.__c||k,f)),$==null&&k!=null&&($=k),(w=!!(4&f.__u))||s.__k===f.__k?(p=Ht(f,p,e,w),w&&s.__e&&(s.__e=null)):typeof f.type=="function"&&y!==void 0?p=y:k&&(p=k.nextSibling),f.__u&=-7);return n.__e=$,p}function ia(e,t,n,a,o){var r,l,u,p,c,d=n.length,b=d,s=0;for(e.__k=new Array(o),r=0;r<o;r++)(l=t[r])!=null&&typeof l!="boolean"&&typeof l!="function"?(typeof l=="string"||typeof l=="number"||typeof l=="bigint"||l.constructor==String?l=e.__k[r]=Ee(null,l,null,null,null):Ne(l)?l=e.__k[r]=Ee(Ae,{children:l},null,null,null):l.constructor===void 0&&l.__b>0?l=e.__k[r]=Ee(l.type,l.props,l.key,l.ref?l.ref:null,l.__v):e.__k[r]=l,p=r+s,l.__=e,l.__b=e.__b+1,u=null,(c=l.__i=sa(l,n,p,b))!=-1&&(b--,(u=n[c])&&(u.__u|=2)),u==null||u.__v==null?(c==-1&&(o>d?s--:o<d&&s++),typeof l.type!="function"&&(l.__u|=4)):c!=p&&(c==p-1?s--:c==p+1?s++:(c>p?s--:s++,l.__u|=4))):e.__k[r]=null;if(b)for(r=0;r<d;r++)(u=n[r])!=null&&(2&u.__u)==0&&(u.__e==a&&(a=fe(u)),Kt(u,u));return a}function Ht(e,t,n,a){var o,r;if(typeof e.type=="function"){for(o=e.__k,r=0;o&&r<o.length;r++)o[r]&&(o[r].__=e,t=Ht(o[r],t,n,a));return t}e.__e!=t&&(a&&(t&&e.type&&!t.parentNode&&(t=fe(e)),n.insertBefore(e.__e,t||null)),t=e.__e);do t=t&&t.nextSibling;while(t!=null&&t.nodeType==8);return t}function sa(e,t,n,a){var o,r,l,u=e.key,p=e.type,c=t[n],d=c!=null&&(2&c.__u)==0;if(c===null&&u==null||d&&u==c.key&&p==c.type)return n;if(a>(d?1:0)){for(o=n-1,r=n+1;o>=0||r<t.length;)if((c=t[l=o>=0?o--:r++])!=null&&(2&c.__u)==0&&u==c.key&&p==c.type)return l}return-1}function It(e,t,n){t[0]=="-"?e.setProperty(t,n??""):e[t]=n==null?"":typeof n!="number"||ra.test(t)?n:n+"px"}function Te(e,t,n,a,o){var r,l;e:if(t=="style")if(typeof n=="string")e.style.cssText=n;else{if(typeof a=="string"&&(e.style.cssText=a=""),a)for(t in a)n&&t in n||It(e.style,t,"");if(n)for(t in n)a&&n[t]==a[t]||It(e.style,t,n[t])}else if(t[0]=="o"&&t[1]=="n")r=t!=(t=t.replace(At,"$1")),l=t.toLowerCase(),t=l in e||t=="onFocusOut"||t=="onFocusIn"?l.slice(2):t.slice(2),e.l||(e.l={}),e.l[t+r]=n,n?a?n[ge]=a[ge]:(n[ge]=rt,e.addEventListener(t,r?at:nt,r)):e.removeEventListener(t,r?at:nt,r);else{if(o=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&t[4]!="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&n==1?"":n))}}function Dt(e){return function(t){if(this.l){var n=this.l[t.type+e];if(t[Pe]==null)t[Pe]=rt++;else if(t[Pe]<n[ge])return;return n(L.event?L.event(t):t)}}}function st(e,t,n,a,o,r,l,u,p,c){var d,b,s,f,k,$,y,w,g,S,D,B,K,X,W,G,N=t.type;if(t.constructor!==void 0)return null;128&n.__u&&(p=!!(32&n.__u),r=[u=t.__e=n.__e]),(d=L.__b)&&d(t);e:if(typeof N=="function"){b=l.length;try{if(g=t.props,S=N.prototype&&N.prototype.render,D=(d=N.contextType)&&a[d.__c],B=d?D?D.props.value:d.__:a,n.__c?w=(s=t.__c=n.__c).__=s.__E:(S?t.__c=s=new N(g,B):(t.__c=s=new Re(g,B),s.constructor=N,s.render=ca),D&&D.sub(s),s.state||(s.state={}),s.__n=a,f=s.__d=!0,s.__h=[],s._sb=[]),S&&s.__s==null&&(s.__s=s.state),S&&N.getDerivedStateFromProps!=null&&(s.__s==s.state&&(s.__s=oe({},s.__s)),oe(s.__s,N.getDerivedStateFromProps(g,s.__s))),k=s.props,$=s.state,s.__v=t,f)S&&N.getDerivedStateFromProps==null&&s.componentWillMount!=null&&s.componentWillMount(),S&&s.componentDidMount!=null&&s.__h.push(s.componentDidMount);else{if(S&&N.getDerivedStateFromProps==null&&g!==k&&s.componentWillReceiveProps!=null&&s.componentWillReceiveProps(g,B),t.__v==n.__v||!s.__e&&s.shouldComponentUpdate!=null&&s.shouldComponentUpdate(g,s.__s,B)===!1){t.__v!=n.__v&&(s.props=g,s.state=s.__s,s.__d=!1),t.__e=n.__e,t.__k=n.__k,t.__k.some(function(Y){Y&&(Y.__=t)}),De.push.apply(s.__h,s._sb),s._sb=[],s.__h.length&&l.push(s);break e}s.componentWillUpdate!=null&&s.componentWillUpdate(g,s.__s,B),S&&s.componentDidUpdate!=null&&s.__h.push(function(){s.componentDidUpdate(k,$,y)})}if(s.context=B,s.props=g,s.__P=e,s.__e=!1,K=L.__r,X=0,S)s.state=s.__s,s.__d=!1,K&&K(t),d=s.render(s.props,s.state,s.context),De.push.apply(s.__h,s._sb),s._sb=[];else do s.__d=!1,K&&K(t),d=s.render(s.props,s.state,s.context),s.state=s.__s;while(s.__d&&++X<25);s.state=s.__s,s.getChildContext!=null&&(a=oe(oe({},a),s.getChildContext())),S&&!f&&s.getSnapshotBeforeUpdate!=null&&(y=s.getSnapshotBeforeUpdate(k,$)),W=d!=null&&d.type===Ae&&d.key==null?Bt(d.props.children):d,u=zt(e,Ne(W)?W:[W],t,n,a,o,r,l,u,p,c),s.base=t.__e,t.__u&=-161,s.__h.length&&l.push(s),w&&(s.__E=s.__=null)}catch(Y){if(l.length=b,t.__v=null,p||r!=null){if(Y.then){for(t.__u|=p?160:128;u&&u.nodeType==8&&u.nextSibling;)u=u.nextSibling;r!=null&&(r[r.indexOf(u)]=null),t.__e=u}else if(r!=null)for(G=r.length;G--;)ot(r[G])}else t.__e=n.__e;t.__k==null&&(t.__k=n.__k||[]),Y.then||Vt(t),L.__e(Y,t,n)}}else r==null&&t.__v==n.__v?(t.__k=n.__k,t.__e=n.__e):u=t.__e=la(n.__e,t,n,a,o,r,l,p,c);return(d=L.diffed)&&d(t),128&t.__u?void 0:u}function Vt(e){e&&(e.__c&&(e.__c.__e=!0),e.__k&&e.__k.some(Vt))}function Ot(e,t,n){for(var a=0;a<n.length;a++)lt(n[a],n[++a],n[++a]);L.__c&&L.__c(t,e),e.some(function(o){try{e=o.__h,o.__h=[],e.some(function(r){r.call(o)})}catch(r){L.__e(r,o.__v)}})}function Bt(e){return typeof e!="object"||e==null||e.__b>0?e:Ne(e)?e.map(Bt):e.constructor!==void 0?null:oe({},e)}function la(e,t,n,a,o,r,l,u,p){var c,d,b,s,f,k,$,y=n.props||Ie,w=t.props,g=t.type;if(g=="svg"?o="http://www.w3.org/2000/svg":g=="math"?o="http://www.w3.org/1998/Math/MathML":o||(o="http://www.w3.org/1999/xhtml"),r!=null){for(c=0;c<r.length;c++)if((f=r[c])&&"setAttribute"in f==!!g&&(g?f.localName==g:f.nodeType==3)){e=f,r[c]=null;break}}if(e==null){if(g==null)return document.createTextNode(w);e=document.createElementNS(o,g,w.is&&w),u&&(L.__m&&L.__m(t,r),u=!1),r=null}if(g==null)y===w||u&&e.data==w||(e.data=w);else{if(r=g=="textarea"&&w.defaultValue!=null?null:r&&Ue.call(e.childNodes),!u&&r!=null)for(y={},c=0;c<e.attributes.length;c++)y[(f=e.attributes[c]).name]=f.value;for(c in y)f=y[c],c=="dangerouslySetInnerHTML"?b=f:c=="children"||c in w||c=="value"&&"defaultValue"in w||c=="checked"&&"defaultChecked"in w||Te(e,c,null,f,o);for(c in w)f=w[c],c=="children"?s=f:c=="dangerouslySetInnerHTML"?d=f:c=="value"?k=f:c=="checked"?$=f:u&&typeof f!="function"||y[c]===f||Te(e,c,f,y[c],o);if(d)u||b&&(d.__html==b.__html||d.__html==e.innerHTML)||(e.innerHTML=d.__html),t.__k=[];else if(b&&(e.innerHTML=""),zt(t.type=="template"?e.content:e,Ne(s)?s:[s],t,n,a,g=="foreignObject"?"http://www.w3.org/1999/xhtml":o,r,l,r?r[0]:n.__k&&fe(n,0),u,p),r!=null)for(c=r.length;c--;)ot(r[c]);u&&g!="textarea"||(c="value",g=="progress"&&k==null?e.removeAttribute("value"):k!=null&&(k!==e[c]||g=="progress"&&!k||g=="option"&&k!=y[c])&&Te(e,c,k,y[c],o),c="checked",$!=null&&$!=e[c]&&Te(e,c,$,y[c],o))}return e}function lt(e,t,n){try{if(typeof e=="function"){var a=typeof e.__u=="function";a&&e.__u(),a&&t==null||(e.__u=e(t))}else e.current=t}catch(o){L.__e(o,n)}}function Kt(e,t,n){var a,o;if(L.unmount&&L.unmount(e),(a=e.ref)&&(a.current&&a.current!=e.__e||lt(a,null,t)),(a=e.__c)!=null){if(a.componentWillUnmount)try{a.componentWillUnmount()}catch(r){L.__e(r,t)}a.base=a.__P=a.__n=null}if(a=e.__k)for(o=0;o<a.length;o++)a[o]&&Kt(a[o],t,n||typeof e.type!="function");n||ot(e.__e),e.__c=e.__=e.__e=void 0}function ca(e,t,n){return this.constructor(e,n)}function Gt(e,t,n){var a,o,r,l;t==document&&(t=document.documentElement),L.__&&L.__(e,t),o=(a=typeof n=="function")?null:n&&n.__k||t.__k,r=[],l=[],st(t,e=(!a&&n||t).__k=it(Ae,null,[e]),o||Ie,Ie,t.namespaceURI,!a&&n?[n]:o?null:t.firstChild?Ue.call(t.childNodes):null,r,!a&&n?n:o?o.__e:t.firstChild,a,l),Ot(r,e,l),e.props.children=null}Ue=De.slice,L={__e:function(e,t,n,a){for(var o,r,l;t=t.__;)if((o=t.__c)&&!o.__)try{if((r=o.constructor)&&r.getDerivedStateFromError!=null&&(o.setState(r.getDerivedStateFromError(e)),l=o.__d),o.componentDidCatch!=null&&(o.componentDidCatch(e,a||{}),l=o.__d),l)return o.__E=o}catch(u){e=u}throw e}},Lt=0,na=function(e){return e!=null&&e.constructor===void 0},Re.prototype.setState=function(e,t){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=oe({},this.state),typeof e=="function"&&(e=e(oe({},n),this.props)),e&&oe(n,e),e!=null&&this.__v&&(t&&this._sb.push(t),Rt(this))},Re.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),Rt(this))},Re.prototype.render=Ae,ue=[],Ut=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,Nt=function(e,t){return e.__v.__b-t.__v.__b},Le.__r=0,tt=Math.random().toString(8),Pe="__d"+tt,ge="__a"+tt,At=/(PointerCapture)$|Capture$/i,rt=0,nt=Dt(!1),at=Dt(!0),aa=0;var Wt=function(e,t,n,a){var o;t[0]=0;for(var r=1;r<t.length;r++){var l=t[r++],u=t[r]?(t[0]|=l?1:2,n[t[r++]]):t[++r];l===3?a[0]=u:l===4?a[1]=Object.assign(a[1]||{},u):l===5?(a[1]=a[1]||{})[t[++r]]=u:l===6?a[1][t[++r]]+=u+"":l?(o=e.apply(u,Wt(e,u,n,["",null])),a.push(o),u[0]?t[0]|=2:(t[r-2]=0,t[r]=o)):a.push(u)}return a},qt=new Map;function Zt(e){var t=qt.get(this);return t||(t=new Map,qt.set(this,t)),(t=Wt(this,t.get(e)||(t.set(e,t=(function(n){for(var a,o,r=1,l="",u="",p=[0],c=function(s){r===1&&(s||(l=l.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?p.push(0,s,l):r===3&&(s||l)?(p.push(3,s,l),r=2):r===2&&l==="..."&&s?p.push(4,s,0):r===2&&l&&!s?p.push(5,0,!0,l):r>=5&&((l||!s&&r===5)&&(p.push(r,0,l,o),r=6),s&&(p.push(r,s,0,o),r=6)),l=""},d=0;d<n.length;d++){d&&(r===1&&c(),c(d));for(var b=0;b<n[d].length;b++)a=n[d][b],r===1?a==="<"?(c(),p=[p],r=3):l+=a:r===4?l==="--"&&a===">"?(r=1,l=""):l=a+l[0]:u?a===u?u="":l+=a:a==='"'||a==="'"?u=a:a===">"?(c(),r=1):r&&(a==="="?(r=5,o=l,l=""):a==="/"&&(r<5||n[d][b+1]===">")?(c(),r===3&&(p=p[0]),r=p,(p=p[0]).push(2,0,r),r=0):a===" "||a==="	"||a===`
`||a==="\r"?(c(),r=2):l+=a),r===3&&l==="!--"&&(r=4,p=p[0])}return c(),p})(e)),t),arguments,[])).length>1?t:t[0]}var i=Zt.bind(it);ie();var ye,H,ct,Yt,ze=0,on=[],O=L,Xt=O.__b,Qt=O.__r,Jt=O.diffed,en=O.__c,tn=O.unmount,nn=O.__;function dt(e,t){O.__h&&O.__h(H,e,ze||t),ze=0;var n=H.__H||(H.__H={__:[],__h:[]});return e>=n.__.length&&n.__.push({}),n.__[e]}function h(e){return ze=1,da(cn,e)}function da(e,t,n){var a=dt(ye++,2);if(a.t=e,!a.__c&&(a.__=[n?n(t):cn(void 0,t),function(u){var p=a.__N?a.__N[0]:a.__[0],c=a.t(p,u);p!==c&&(a.__N=[c,a.__[1]],a.__c.setState({}))}],a.__c=H,!H.__f)){var o=function(u,p,c){if(!a.__c.__H)return!0;var d=!1,b=a.__c.props!==u;if(a.__c.__H.__.some(function(f){if(f.__N){d=!0;var k=f.__[0];f.__=f.__N,f.__N=void 0,k!==f.__[0]&&(b=!0)}}),r){var s=r.call(this,u,p,c);return d?s||b:s}return!d||b};H.__f=!0;var r=H.shouldComponentUpdate,l=H.componentWillUpdate;H.componentWillUpdate=function(u,p,c){if(this.__e){var d=r;r=void 0,o(u,p,c),r=d}l&&l.call(this,u,p,c)},H.shouldComponentUpdate=o}return a.__N||a.__}function C(e,t){var n=dt(ye++,3);!O.__s&&ln(n.__H,t)&&(n.__=e,n.u=t,H.__H.__h.push(n))}function F(e){return ze=5,pa(function(){return{current:e}},[])}function pa(e,t){var n=dt(ye++,7);return ln(n.__H,t)&&(n.__=e(),n.__H=t,n.__h=e),n.__}function an(){for(var e;e=on.shift();){var t=e.__H;if(e.__P&&t)try{t.__h.some(ut),t.__h.some(sn),t.__h=[]}catch(n){t.__h=[],O.__e(n,e.__v)}}}O.__b=function(e){H=null,Xt&&Xt(e)},O.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),nn&&nn(e,t)},O.__r=function(e){Qt&&Qt(e),ye=0;var t=(H=e.__c).__H;t&&(ct===H?(t.__h=[],H.__h=[],t.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(t.__h.length&&an(),ye=0)),ct=H},O.diffed=function(e){Jt&&Jt(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(on.push(t)!==1&&Yt===O.requestAnimationFrame||((Yt=O.requestAnimationFrame)||ma)(an)),t.__H.__.some(function(n){n.u&&(n.__H=n.u,n.u=void 0)})),ct=H=null},O.__c=function(e,t){t.some(function(n){try{n.__h.some(ut),n.__h=n.__h.filter(function(a){return!a.__||sn(a)})}catch(a){t.some(function(o){o.__h&&(o.__h=[])}),t=[],O.__e(a,n.__v)}}),en&&en(e,t)},O.unmount=function(e){tn&&tn(e);var t,n=e.__c;n&&n.__H&&(n.__H.__.some(function(a){try{ut(a)}catch(o){t=o}}),n.__H=void 0,t&&O.__e(t,n.__v))};var rn=typeof requestAnimationFrame=="function";function ma(e){var t,n=function(){clearTimeout(a),rn&&cancelAnimationFrame(t),setTimeout(e)},a=setTimeout(n,35);rn&&(t=requestAnimationFrame(n))}function ut(e){var t=H,n=e.__c;typeof n=="function"&&(e.__c=void 0,n()),H=t}function sn(e){var t=H;e.__c=e.__(),H=t}function ln(e,t){return!e||e.length!==t.length||t.some(function(n,a){return n!==e[a]})}function cn(e,t){return typeof t=="function"?t(e):t}function un(e){let t=e,n=new Set;return{get:()=>t,set(a){t=a,n.forEach(o=>o(t))},update(a){this.set(a(t))},subscribe(a){return n.add(a),()=>n.delete(a)}}}function Q(e){let[t,n]=h(e.get());return C(()=>e.subscribe(n),[e]),t}var q=un({user:null,csrfToken:null,ready:!1}),He=un([]),fa=0;function A(e,{actionLabel:t,onAction:n,timeoutMs:a=5e3}={}){let o=++fa;return He.update(r=>[...r,{id:o,message:e,actionLabel:t,onAction:n}]),a&&setTimeout(()=>Ve(o),a),o}function Ve(e){He.update(t=>t.filter(n=>n.id!==e))}function Oe(e){try{return decodeURIComponent(e)}catch{return e}}function dn(e){let t=Number(e.get("page")||1);return{sort:e.get("sort")||"uploaded_at_desc",game:e.get("game")||"",q:e.get("q")||"",page:Number.isFinite(t)?Math.max(1,t):1}}var _a=["login","resetPassword","public","publicLibrary","publicGame","publicUser","about","games"];function pn(e){return _a.includes(e)}function Be(e,t){let n=new URLSearchParams(t||""),a=e;return a.startsWith("/c/")?{name:"public",shareId:Oe(a.slice(3))}:a==="/"||a==="/public"||a==="/search"?{name:"publicLibrary",query:dn(n)}:a.startsWith("/game/")?{name:"publicGame",game:Oe(a.slice(6)),query:dn(n)}:a==="/about"?{name:"about"}:a==="/games"?{name:"games"}:a.startsWith("/u/")?{name:"publicUser",username:Oe(a.slice(3))}:a==="/library"?{name:"library"}:a.startsWith("/clip/")?{name:"clip",clipId:Oe(a.slice(6))}:a==="/admin"?{name:"admin",tab:n.get("tab")||"overview"}:a==="/account"?{name:"account"}:a==="/profile"?{name:"profile"}:a==="/login"?{name:"login"}:a==="/reset-password"?{name:"resetPassword",token:n.get("token")||"",invite:n.get("invite")==="1"}:{name:"publicLibrary"}}var mn=()=>window.location.pathname==="/preview.html";function ha(e){let t=e.slice(1)||"/",[n,a=""]=t.split("?");return{pathname:n,search:a?`?${a}`:""}}function Ke(){return mn()?ha(window.location.hash):{pathname:window.location.pathname,search:window.location.search}}function fn(e){return Be(e.pathname,e.search).name}var pt=new Set;function j(e){mn()?window.location.hash=e:window.history.pushState({},"",e),mt()}function mt(){let{pathname:e,search:t}=Ke(),n=Be(e,t);pt.forEach(a=>a(n))}window.addEventListener("popstate",mt);window.addEventListener("hashchange",mt);function _n(){let{pathname:e,search:t}=Ke(),[n,a]=h(()=>Be(e,t));return C(()=>(pt.add(a),()=>pt.delete(a)),[]),n}function hn(e){let t=e.target.closest("a[href^='/']");!t||t.target||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||(e.preventDefault(),j(t.getAttribute("href")))}var vn={alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',clipboard:'<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',copy:'<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',external:'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',fastForward:'<path d="m13 19 9-7-9-7v14Z"/><path d="m2 19 9-7-9-7v14Z"/>',film:'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 8h4"/><path d="M3 16h4"/><path d="M17 8h4"/><path d="M17 16h4"/>',fullscreen:'<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/><path d="M12 2a15.3 15.3 0 0 0 0 20"/>',home:'<path d="m3 10 9-7 9 7"/><path d="M5 8.5V20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5"/><path d="M9 22V12h6v10"/>',info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',library:'<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',lock:'<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',logOut:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',menu:'<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',message:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>',notepad:'<path d="M8 2v4"/><path d="M16 2v4"/><path d="M3 10h18"/><path d="M6 4h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/><path d="M8 14h8"/><path d="M8 18h5"/>',pause:'<path d="M8 5v14"/><path d="M16 5v14"/>',play:'<path d="m8 5 11 7-11 7V5Z"/>',plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',check:'<path d="M20 6 9 17l-5-5"/>',refresh:'<path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/><path d="M3 12A9 9 0 0 1 18.5 5.7L21 8"/><path d="M21 3v5h-5"/>',rewind:'<path d="m11 19-9-7 9-7v14Z"/><path d="m22 19-9-7 9-7v14Z"/>',save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',server:'<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',skipBack:'<path d="M19 20 9 12l10-8v16Z"/><path d="M5 19V5"/>',skipForward:'<path d="m5 4 10 8-10 8V4Z"/><path d="M19 5v14"/>',shield:'<path d="M20 13c0 5-3.5 7.5-7.7 8.8a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V5l8-3 8 3v8Z"/>',sliders:'<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>',theater:'<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M6 9h12"/><path d="M6 15h12"/>',trash:'<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',volume2:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9 9 0 0 1 0 14"/>',volumeX:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>',x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'};function U(e,{size:t=18}={}){return i`<svg viewBox="0 0 24 24" width=${t} height=${t} fill="none"
    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" dangerouslySetInnerHTML=${{__html:vn[e]||""}} />`}function bn({active:e}){let{user:t}=Q(q),[n,a]=h(!1),o=F(null),r=t?.role==="admin";C(()=>{if(!n)return;let p=d=>{o.current?.contains(d.target)||a(!1)},c=d=>{d.key==="Escape"&&a(!1)};return document.addEventListener("pointerdown",p),document.addEventListener("keydown",c),()=>{document.removeEventListener("pointerdown",p),document.removeEventListener("keydown",c)}},[n]);let l=[["feed","/","Feed"],["library","/library","Library",!!t],["games","/games","Games"],["admin","/admin","Admin",r]].filter(([,,,p])=>p!==!1),u=p=>{p.preventDefault();let c=new FormData(p.target).get("q")?.toString().trim();j(c?`/search?q=${encodeURIComponent(c)}`:"/search")};return i`<header class="topbar">
    <a class="wordmark" href="/" aria-label="Clipline home">
      <img src="/clipline-icon.svg" alt="" width="24" height="24" />
      CLIP<b>LINE</b>
    </a>
    <nav class="topnav" aria-label="Primary">
      ${l.map(([p,c,d])=>i`
        <a class=${p===e?"topnav-on":""} href=${c}>${d}</a>`)}
    </nav>
    <form class="topsearch" role="search" onSubmit=${u}>
      <input class="input" name="q" placeholder="Search clips, games, players…" aria-label="Search" />
    </form>
    ${t?i`<div class="avatar-wrap" ref=${o}>
          <button class="avatar-btn" aria-haspopup="menu" aria-expanded=${n}
            onClick=${()=>a(!n)}>
            <span class="avatar">${(t.display_name||t.username)[0].toUpperCase()}</span>
          </button>
          ${n&&i`<div class="menu" role="menu" onClick=${()=>a(!1)}>
            <a role="menuitem" href="/profile">Profile</a>
            <a role="menuitem" href="/account">Account</a>
            ${r&&i`<a role="menuitem" href="/admin">Admin</a>`}
            <button role="menuitem" class="menu-danger" onClick=${va}>Sign out</button>
          </div>`}
        </div>`:i`<a class="btn" href="/login">${U("lock",{size:14})} Sign in</a>`}
  </header>`}async function va(){let{api:e}=await Promise.resolve().then(()=>(ie(),jt));try{await e("/api/v1/auth/logout",{method:"POST"})}catch{}q.set({user:null,csrfToken:null,ready:!0}),j("/login")}function gn({active:e}){return i`<nav class="tabbar" aria-label="Primary">
    ${[["feed","/","home","Feed"],["library","/library","library","Library"],["search","/search","search","Search"],["profile","/profile","user","Profile"]].map(([n,a,o,r])=>i`
      <a class=${n===e?"tab-on":""} href=${a}>${U(o)}<span>${r}</span></a>`)}
  </nav>`}function $n(){let e=Q(He);return i`<div class="toasts" role="status" aria-live="polite">
    ${e.map(t=>i`<div class="toast" key=${t.id}>
      <span>${t.message}</span>
      ${t.actionLabel&&i`<button class="toast-action"
        onClick=${()=>{t.onAction?.(),Ve(t.id)}}>${t.actionLabel}</button>`}
      <button class="toast-x" aria-label="Dismiss" onClick=${()=>Ve(t.id)}>✕</button>
    </div>`)}
  </div>`}ie();function _e(e){if(!e)return"Unknown";let t=new Date(e);return Number.isNaN(t.getTime())?"Unknown":new Intl.DateTimeFormat(void 0,{dateStyle:"medium",timeStyle:"short"}).format(t)}function pe(e){if(e==null)return"Unknown";let t=Math.max(0,Math.round(Number(e)/1e3)),n=Math.floor(t/60),a=t%60;return`${n}:${String(a).padStart(2,"0")}`}function Ge(e){if(!e)return"Unknown";let t=new Date(e);if(Number.isNaN(t.getTime()))return"Unknown";let n=Math.min(0,t.getTime()-Date.now()),a=[["year",365*24*60*60*1e3],["month",720*60*60*1e3],["week",10080*60*1e3],["day",1440*60*1e3],["hour",3600*1e3],["minute",60*1e3],["second",1e3]],[o,r]=a.find(([,u])=>Math.abs(n)>=u)||a[a.length-1],l=Math.round(n/r);return new Intl.RelativeTimeFormat(void 0,{numeric:"always"}).format(l,o)}function we(e){if(e==null)return"Unknown";let t=Number(e);if(!Number.isFinite(t))return"Unknown";let n=["B","KiB","MiB","GiB","TiB"],a=t,o=0;for(;a>=1024&&o<n.length-1;)a/=1024,o+=1;return`${a.toFixed(o===0?0:1)} ${n[o]}`}function me(e){let t=Number(e||0),n=Number.isFinite(t)&&t>0?Math.floor(t):0;return`${new Intl.NumberFormat(void 0,{notation:n>=1e4?"compact":"standard"}).format(n)} view${n===1?"":"s"}`}function se(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/thumbnail`}function ke(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/thumbnail`}function qe(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/media`}function yn(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/media`}var We=null;function wn(e){We?.(),We=e}function kn(e){We===e&&(We=null)}var ba=()=>window.matchMedia("(pointer: fine)").matches&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches&&!navigator.connection?.saveData;function xn({src:e,poster:t,alt:n=""}){let[a,o]=h(!1),[r,l]=h(0),u=F(null),p=F(null),c=F(!0),d=F(),b=()=>{c.current&&(clearTimeout(u.current),o(!1),l(0))};d.current=b;let s=()=>{!e||!ba()||(u.current=setTimeout(()=>{c.current&&(wn(d.current),o(!0))},300))},f=k=>{let $=k.target;$.duration&&l($.currentTime/$.duration)};return C(()=>()=>{c.current=!1,clearTimeout(u.current),kn(d.current)},[]),i`<span class="hover-preview" onPointerEnter=${s} onPointerLeave=${b}>
    ${a?i`<video ref=${p} src=${e} poster=${t} muted loop autoplay
          playsinline preload="none" onTimeUpdate=${f} />`:i`<img src=${t} alt=${n} loading="lazy" />`}
    ${a&&i`<span class="preview-scrub"><span style=${`width:${r*100}%`} /></span>`}
  </span>`}function ft(e){return e.owner?.display_name||e.owner?.username||e.owner_username||e.author_name||e.author_username||null}function Ze({clip:e,href:t,selectable:n=!1,selected:a=!1,onToggleSelect:o,showVisibility:r=!1,showAuthor:l=!1}){let u=ft(e),p=[e.game_name&&i`<em>${e.game_name}</em>`,l&&u,e.view_count!=null&&me(e.view_count),e.uploaded_at&&Ge(e.uploaded_at)].filter(Boolean);return i`<article class=${`clip-card ${a?"is-selected":""} ${n?"is-selectable":""}`}>
    <a class="card-thumb" href=${t} tabindex="-1" aria-hidden="true">
      <${xn} src=${e.media_url} poster=${e.thumbnail_url} />
      ${e.duration_ms!=null&&i`<span class="dur-pill">${pe(e.duration_ms)}</span>`}
      ${r&&i`<span class=${`badge badge-${e.visibility} card-vis`}>${e.visibility}</span>`}
    </a>
    ${n&&i`<label class="card-check">
      <input type="checkbox" checked=${a} aria-label=${`Select ${e.title}`}
        onChange=${()=>o?.(e.id)} />
    </label>`}
    <h3 class="card-title"><a href=${t}>${e.title}</a></h3>
    <p class="card-meta">${p.map((c,d)=>i`${d>0&&" \xB7 "}${c}`)}</p>
  </article>`}function J({name:e="film",title:t,body:n,action:a}){return i`<div class="empty">
    <div class="empty-icon">${U(e,{size:28})}</div>
    <h3>${t}</h3>
    ${n&&i`<p>${n}</p>`}
    ${a}
  </div>`}var ga=[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]],$a=6;function ht({route:e}){let t={sort:"uploaded_at_desc",page:1,q:"",...e.query,game:e.name==="publicGame"?e.game:e.query?.game||""},[n,a]=h(null),[o,r]=h([]),[l,u]=h(null);C(()=>{let $=!0;a(null),u(null);let y=new URLSearchParams;return t.sort!=="uploaded_at_desc"&&y.set("sort",t.sort),t.game&&y.set("game",t.game),t.q&&y.set("q",t.q),Number(t.page)>1&&y.set("page",String(t.page)),E(`/api/v1/public/clips${y.size?`?${y}`:""}`).then(w=>$&&a(w)).catch(w=>$&&u(w)),()=>{$=!1}},[e.name,t.sort,t.game,t.q,t.page]),C(()=>{let $=!0;return E("/api/v1/public/games").then(y=>$&&r(y.games||[])).catch(()=>{}),()=>{$=!1}},[]);let p=$=>j(ka({...t,page:1,...$}));if(l)return i`<main class="page">
      <${J} name="alert" title="Couldn't load the feed" body=${l.message} />
    </main>`;let c=n?.clips,d=!!(t.game||t.q)||Number(t.page)>1,b=!d,s=[...o].sort(($,y)=>(y.clip_count||0)-($.clip_count||0)),f=s.slice(0,$a),k=s.length-f.length;return i`<main class="page">
    ${c==null?i`<${wa} />`:c.length===0?i`<${J} name="film"
          title=${d?"No clips match this filter":"No public clips yet"}
          body=${d?"Try a different game, search, or clear your filters.":"Clips shared as public from a library will show up here."}
          action=${d&&i`<a class="btn" href="/">Clear filters</a>`} />`:i`
        ${b?ya(c):""}
        <div class="feed-toolbar">
          <h2>Latest uploads</h2>
          <select class="input" value=${t.sort} onChange=${$=>p({sort:$.target.value})}>
            ${ga.map(([$,y])=>i`<option value=${$}>${y}</option>`)}
          </select>
          <div class="chips">
            <button class=${`chip ${t.game?"":"chip-on"}`} onClick=${()=>p({game:""})}>All</button>
            ${f.map($=>i`<button
              class=${`chip ${t.game===$.game?"chip-on":""}`}
              onClick=${()=>p({game:$.game})}>${$.game}</button>`)}
            ${k>0&&i`<a class="chip" href="/games">+${k}</a>`}
          </div>
        </div>
        <div class="card-grid">
          ${(b?c.slice(4):c).map($=>i`<${Ze} clip=${{...$,thumbnail_url:se($)}}
              href=${_t($)} showAuthor />`)}
        </div>
        ${xa(n,t,p)}
      `}
  </main>`}function ya(e){let[t,...n]=e,a=n.slice(0,3);return i`<p class="kicker">Now playing on this server</p>
    <section class="hero">
      <a class="hero-main" href=${_t(t)}>
        <img src=${se(t)} alt="" loading="lazy" />
        <span class="hero-caption">▶ ${t.title} — ${t.game_name} · ${pe(t.duration_ms)}</span>
      </a>
      <div class="hero-side">
        ${a.map(o=>i`<a class="hero-row" href=${_t(o)}>
            <img src=${se(o)} alt="" loading="lazy" />
            <span><b>${o.title}</b>
              <small>${ft(o)} · ${o.game_name} · ${me(o.view_count)}</small></span>
          </a>`)}
      </div>
    </section>`}function wa({count:e=8}){return i`<div class="card-grid">
    ${Array.from({length:e},(t,n)=>i`<div class="clip-card" key=${n}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`}function _t(e){return`/c/${encodeURIComponent(e.share_id)}`}function ka({sort:e="uploaded_at_desc",game:t="",q:n="",page:a=1}={}){let o=new URLSearchParams,r=e||"uploaded_at_desc",l=String(t||"").trim(),u=String(n||"").trim(),p=Math.max(1,Number(a||1));if(r!=="uploaded_at_desc"&&o.set("sort",r),p>1&&o.set("page",String(p)),u)return o.set("q",u),l&&o.set("game",l),`/search?${o.toString()}`;if(l){let d=o.toString();return`/game/${encodeURIComponent(l)}${d?`?${d}`:""}`}let c=o.toString();return c?`/search?${c}`:"/"}function xa(e,t,n){let a=Math.max(1,Number(t.page||1)),o=!!e?.has_more;return a<=1&&!o?"":i`<nav class="pager" aria-label="Public clip pages">
    <button class="btn" type="button" disabled=${a<=1}
      onClick=${()=>n({page:a-1})}>Previous</button>
    <span class="muted">Page ${a}</span>
    <button class="btn" type="button" disabled=${!o}
      onClick=${()=>n({page:a+1})}>Next</button>
  </nav>`}ie();function Cn(){let[e,t]=h(null),[n,a]=h(null);return C(()=>{let o=!0;return E("/api/v1/public/games").then(r=>o&&t(r.games||[])).catch(r=>o&&a(r)),()=>{o=!1}},[]),n?i`<main class="page">
      <${J} name="alert" title="Couldn't load games" body=${n.message} />
    </main>`:i`<main class="page">
    <p class="kicker">Browse by game</p>
    ${e==null?i`<div class="game-grid">
          ${Array.from({length:6},(o,r)=>i`<div class="game-tile is-loading" key=${r}>
            <div class="skeleton-thumb"></div>
          </div>`)}
        </div>`:e.length===0?i`<${J} name="film" title="No games yet"
          body="Once clips are shared as public, their games will show up here." />`:i`<div class="game-grid">
          ${e.map(o=>i`<a class="game-tile" href=${`/game/${encodeURIComponent(o.game)}`}>
            ${o.thumbnail_url?i`<img src=${o.thumbnail_url} alt="" loading="lazy" />`:i`<div class="game-tile-fallback">${(o.game||"?")[0].toUpperCase()}</div>`}
            <div class="game-tile-body">
              <b>${o.game}</b>
              <small>${o.clip_count} clip${o.clip_count===1?"":"s"}</small>
            </div>
          </a>`)}
        </div>`}
  </main>`}ie();function Sn({trigger:e,content:t,onClose:n,label:a,panelClass:o=""}){let[r,l]=h(!1),u=F(null),p=F(null),c=F(null),d=()=>{l(!1),n?.()},b=()=>{if(r){d();return}c.current=document.activeElement,l(!0)};return C(()=>{if(!r)return;let s=$=>{u.current?.contains($.target)||d()},f=$=>{$.key==="Escape"&&d()};return document.addEventListener("pointerdown",s),document.addEventListener("keydown",f),p.current?.querySelector("input, select, textarea, button, a[href], [tabindex]")?.focus(),()=>{document.removeEventListener("pointerdown",s),document.removeEventListener("keydown",f),c.current?.focus?.()}},[r]),i`<div class="popover-wrap" ref=${u}>
    ${e({open:r,toggle:b})}
    ${r&&i`<div class=${`popover ${o}`} ref=${p} role="dialog" aria-label=${a||"Filters"}>
      ${t}
    </div>`}
  </div>`}function Mn({count:e,onPublic:t,onPrivate:n,onCopyLinks:a,onDelete:o,onClear:r}){return e?i`<div class="bulkbar" role="toolbar" aria-label="Bulk actions">
    <b>${e} selected</b>
    <button class="btn" onClick=${t}>Make public</button>
    <button class="btn" onClick=${n}>Make private</button>
    <button class="btn" onClick=${a}>Copy links</button>
    <button class="btn btn-danger" onClick=${o}>Delete</button>
    <button class="btn bulk-x" aria-label="Clear selection" onClick=${r}>✕</button>
  </div>`:null}function he({open:e,title:t,body:n,confirmLabel:a="Confirm",onConfirm:o,onCancel:r,danger:l=!1}){let u=F(null),p=F(null);return C(()=>{let c=u.current;c&&(e&&!c.open?(c.showModal(),p.current?.focus()):!e&&c.open&&c.close())},[e]),i`<dialog ref=${u} class="confirm-dialog" aria-labelledby="confirm-dialog-title"
    onCancel=${c=>{c.preventDefault(),r?.()}}
    onClose=${()=>e&&r?.()}>
    ${e&&i`<div class="confirm-dialog-body">
      <h2 id="confirm-dialog-title">${t}</h2>
      ${n&&i`<p>${n}</p>`}
      <div class="confirm-dialog-actions">
        <button type="button" class="btn" onClick=${r}>Cancel</button>
        <button type="button" ref=${p} class=${`btn ${l?"btn-danger":"btn-primary"}`}
          onClick=${o}>${a}</button>
      </div>
    </div>`}
  </dialog>`}var Pn="clipline.libraryView",Ca=[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["updated_at_desc","Updated newest"],["updated_at_asc","Updated oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["size_desc","Size largest"],["size_asc","Size smallest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]],je={title:["title_asc","title_desc"],size:["size_asc","size_desc"],duration:["duration_asc","duration_desc"],uploaded:["uploaded_at_asc","uploaded_at_desc"]},Sa=["visibility","status","source_type","from","to","min_duration_seconds","max_duration_seconds","min_size_mib","max_size_mib"],Qe={sort:"uploaded_at_desc",game:"",source_type:"",visibility:"",status:"",q:"",from:"",to:"",min_duration_seconds:"",max_duration_seconds:"",min_size_mib:"",max_size_mib:""};function Ye(e){if(e===""||e==null)return null;let t=Number(e);return Number.isFinite(t)?t:null}function Ma(e){let t=new URLSearchParams;t.set("sort",e.sort||Qe.sort),t.set("page_size","100");for(let l of["game","source_type","visibility","status","q"])e[l]&&t.set(l,e[l]);e.from&&t.set("from",`${e.from}T00:00:00Z`),e.to&&t.set("to",`${e.to}T23:59:59Z`);let n=Ye(e.min_duration_seconds);n!=null&&t.set("min_duration_ms",String(Math.round(n*1e3)));let a=Ye(e.max_duration_seconds);a!=null&&t.set("max_duration_ms",String(Math.round(a*1e3)));let o=Ye(e.min_size_mib);o!=null&&t.set("min_size_bytes",String(Math.round(o*1024*1024)));let r=Ye(e.max_size_mib);return r!=null&&t.set("max_size_bytes",String(Math.round(r*1024*1024))),t}function Ta(e){return Sa.reduce((t,n)=>t+(e[n]?1:0),0)}function Pa(e,t=6){let n=new Map;for(let a of e){let o=a.game_name;o&&n.set(o,(n.get(o)||0)+1)}return Array.from(n,([a,o])=>({game:a,count:o})).sort((a,o)=>o.count-a.count||a.game.localeCompare(o.game)).slice(0,t)}async function Tn(e,t,n){let a=0;async function o(){let r=a++;if(!(r>=e.length))return await n(e[r]),o()}await Promise.all(Array.from({length:Math.min(t,e.length)},o))}function Ea(){try{return localStorage.getItem(Pn)==="rows"?"rows":"grid"}catch{return"grid"}}function En(){let[e,t]=h(Ea),[n,a]=h(Qe),[o,r]=h(Qe.q),[l,u]=h(null),[p,c]=h(null),[d,b]=h(new Set),[s,f]=h(!1),[k,$]=h(0),y=F(null);C(()=>()=>clearTimeout(y.current),[]),C(()=>{let v=!0;return u(null),c(null),E(`/api/v1/clips?${Ma(n)}`).then(x=>{v&&(u(x),b(new Set))}).catch(x=>v&&c(x)),()=>{v=!1}},[JSON.stringify(n),k]);let w=v=>{t(v);try{localStorage.setItem(Pn,v)}catch{}},g=()=>$(v=>v+1),S=v=>{let x=v.target.value;r(x),clearTimeout(y.current),y.current=setTimeout(()=>{a(P=>({...P,q:x}))},300)},D=v=>x=>{let P=x.target.value;a(R=>({...R,[v]:P}))},B=()=>{a(v=>({...v,visibility:"",status:"",source_type:"",from:"",to:"",min_duration_seconds:"",max_duration_seconds:"",min_size_mib:"",max_size_mib:""}))},K=v=>a(x=>({...x,game:x.game===v?"":v})),X=v=>a(x=>({...x,sort:v})),W=v=>{b(x=>{let P=new Set(x);return P.has(v)?P.delete(v):P.add(v),P})};function G(v,x){u(P=>P&&{...P,clips:P.clips.map(R=>R.id===v?{...R,...x}:R)})}function N(v,x){let P=new Set(v);u(R=>R&&{...R,clips:R.clips.map(_=>P.has(_.id)?{..._,...x}:_)})}async function Y(v){let x=Array.from(d);if(!x.length)return;let P=l?.clips||[],R=new Map(x.map(M=>[M,P.find(V=>V.id===M)]));N(x,{visibility:v});let _=[];if(await Tn(x,4,async M=>{try{let V=await E(`/api/v1/clips/${encodeURIComponent(M)}/visibility`,{method:"POST",body:{visibility:v}});G(M,{visibility:V.visibility,public_url:V.public_url})}catch(V){_.push({id:M,message:V.message})}}),_.length){for(let{id:M}of _){let V=R.get(M);V&&G(M,{visibility:V.visibility,public_url:V.public_url})}A(_.length===x.length?_[0].message||"Couldn't update visibility.":`Couldn't update ${_.length} of ${x.length} clips.`)}let T=x.filter(M=>!_.some(V=>V.id===M));T.length&&(b(new Set),A(`Made ${T.length} clip${T.length===1?"":"s"} ${v}`,{actionLabel:"Undo",onAction:()=>be(T,R)}))}async function be(v,x){for(let P of v){let R=x.get(P);R&&G(P,{visibility:R.visibility,public_url:R.public_url})}await Tn(v,4,async P=>{let R=x.get(P);if(R)try{await E(`/api/v1/clips/${encodeURIComponent(P)}/visibility`,{method:"POST",body:{visibility:R.visibility}})}catch{}})}async function te(){let v=Array.from(d),x=l?.clips||[],P=v.map(T=>x.find(M=>M.id===T)).filter(Boolean),R=P.filter(T=>T.public_url),_=P.length-R.length;if(!R.length){A("No links to copy \u2014 selected clips are private.");return}try{await navigator.clipboard.writeText(R.map(T=>T.public_url).join(`
`)),A(`Copied ${R.length} link${R.length===1?"":"s"}`+(_?` (${_} skipped, private)`:""))}catch{A("Couldn't copy links to clipboard.")}}async function ne(){let v=Array.from(d);f(!1);try{let x=await E("/api/v1/clips/bulk-delete",{method:"POST",body:{ids:v}});b(new Set),g(),A(`Deleted ${x.affected} clip${x.affected===1?"":"s"}.`)}catch(x){A(x.message)}}if(p)return i`<main class="page">
      <${J} name="alert" title="Couldn't load your library" body=${p.message} />
    </main>`;let Z=l?.clips,le=Ta(n),ae=!!(n.q||n.game)||le>0,ee=Pa(Z||[]),re=(Z||[]).reduce((v,x)=>v+(x.file_size_bytes||0),0),ce=i`<div class="popover-fields">
    <label class="field"><span>Visibility</span>
      <select class="input" value=${n.visibility} onChange=${D("visibility")}>
        <option value="">Any</option>
        <option value="private">Private</option>
        <option value="public">Public</option>
        <option value="unlisted">Unlisted</option>
      </select>
    </label>
    <label class="field"><span>Status</span>
      <select class="input" value=${n.status} onChange=${D("status")}>
        <option value="">Any</option>
        <option value="created">Created</option>
        <option value="uploading">Uploading</option>
        <option value="processing">Processing</option>
        <option value="ready">Ready</option>
        <option value="failed">Failed</option>
      </select>
    </label>
    <label class="field"><span>Source</span>
      <input class="input" type="text" value=${n.source_type} onInput=${D("source_type")} placeholder="Source type" />
    </label>
    <label class="field"><span>From</span>
      <input class="input" type="date" value=${n.from} onInput=${D("from")} />
    </label>
    <label class="field"><span>To</span>
      <input class="input" type="date" value=${n.to} onInput=${D("to")} />
    </label>
    <label class="field"><span>Min duration (s)</span>
      <input class="input" type="number" min="0" value=${n.min_duration_seconds} onInput=${D("min_duration_seconds")} />
    </label>
    <label class="field"><span>Max duration (s)</span>
      <input class="input" type="number" min="0" value=${n.max_duration_seconds} onInput=${D("max_duration_seconds")} />
    </label>
    <label class="field"><span>Min size (MiB)</span>
      <input class="input" type="number" min="0" step="0.1" value=${n.min_size_mib} onInput=${D("min_size_mib")} />
    </label>
    <label class="field"><span>Max size (MiB)</span>
      <input class="input" type="number" min="0" step="0.1" value=${n.max_size_mib} onInput=${D("max_size_mib")} />
    </label>
    <div class="popover-actions">
      <button type="button" class="btn" onClick=${B}>Clear filters</button>
    </div>
  </div>`;return i`<main class="page">
    <div class="lib-header">
      <div>
        <h1>Library</h1>
        <p>${(Z||[]).length} clip${(Z||[]).length===1?"":"s"} · ${we(re)} used</p>
      </div>
      <div class="seg" role="group" aria-label="View">
        <button type="button" class=${`seg-item ${e==="grid"?"seg-on":""}`}
          aria-pressed=${e==="grid"} onClick=${()=>w("grid")}>Grid</button>
        <button type="button" class=${`seg-item ${e==="rows"?"seg-on":""}`}
          aria-pressed=${e==="rows"} onClick=${()=>w("rows")}>Rows</button>
      </div>
    </div>

    <div class="lib-toolbar">
      <input class="input" type="search" aria-label="Search clips" placeholder="Search title or game"
        value=${o} onInput=${S} />
      <select class="input" aria-label="Sort" value=${n.sort} onChange=${v=>X(v.target.value)}>
        ${Ca.map(([v,x])=>i`<option value=${v}>${x}</option>`)}
      </select>
      <${Sn}
        label="Filters"
        panelClass="popover-filters"
        trigger=${({open:v,toggle:x})=>i`<button type="button" class="btn" aria-haspopup="dialog"
          aria-expanded=${v} onClick=${x}>
          ${U("sliders",{size:14})} Filters
          ${le>0&&i`<span class="filter-badge">${le}</span>`}
        </button>`}
        content=${ce} />
    </div>

    ${ee.length>0&&i`<div class="lib-chips">
      <button type="button" class=${`chip ${n.game?"":"chip-on"}`} aria-pressed=${!n.game}
        onClick=${()=>K("")}>All</button>
      ${ee.map(v=>i`<button type="button" class=${`chip ${n.game===v.game?"chip-on":""}`}
        aria-pressed=${n.game===v.game} onClick=${()=>K(v.game)}>${v.game}</button>`)}
    </div>`}

    ${Z==null?i`<${Ia} />`:Z.length===0?ae?i`<${J} name="film" title="No clips match this view"
            body="Try a different search, game, or clear your filters."
            action=${i`<button type="button" class="btn" onClick=${()=>{a(Qe),r("")}}>Clear filters</button>`} />`:i`<${J} name="upload" title="Connect the Clipline desktop app to start uploading"
            body="New clips uploaded from the desktop app will show up here."
            action=${i`<a class="btn" href="/about">Learn more</a>`} />`:e==="grid"?i`<div class=${`card-grid ${d.size>0?"selecting":""}`}>
          ${Z.map(v=>i`<${Ze} key=${v.id}
            clip=${{...v,thumbnail_url:ke(v),media_url:qe(v)}}
            href=${`/clip/${encodeURIComponent(v.id)}`}
            selectable selected=${d.has(v.id)} onToggleSelect=${W} showVisibility />`)}
        </div>`:i`<${Ra} clips=${Z} query=${n} onSort=${X} />`}

    <${Mn} count=${d.size}
      onPublic=${()=>Y("public")}
      onPrivate=${()=>Y("private")}
      onCopyLinks=${te}
      onDelete=${()=>f(!0)}
      onClear=${()=>b(new Set)} />

    <${he} open=${s}
      title=${`Delete ${d.size} clip${d.size===1?"":"s"}?`}
      body="Public links stop working immediately."
      confirmLabel="Delete" danger
      onConfirm=${ne}
      onCancel=${()=>f(!1)} />
  </main>`}function Xe(e,[t,n]){let a=e.sort===t?"ascending":e.sort===n?"descending":"none",o=e.sort===n?t:n;return{ariaSort:a,next:o}}function Ra({clips:e,query:t,onSort:n}){let a=Xe(t,je.title),o=Xe(t,je.size),r=Xe(t,je.duration),l=Xe(t,je.uploaded);return i`<table class="lib-table">
    <thead>
      <tr>
        <th></th>
        <th aria-sort=${a.ariaSort}><button type="button" class="sort-btn" onClick=${()=>n(a.next)}>Title</button></th>
        <th>Game</th>
        <th>Visibility</th>
        <th aria-sort=${o.ariaSort}><button type="button" class="sort-btn" onClick=${()=>n(o.next)}>Size</button></th>
        <th aria-sort=${r.ariaSort}><button type="button" class="sort-btn" onClick=${()=>n(r.next)}>Duration</button></th>
        <th aria-sort=${l.ariaSort}><button type="button" class="sort-btn" onClick=${()=>n(l.next)}>Uploaded</button></th>
      </tr>
    </thead>
    <tbody>
      ${e.map(u=>i`<tr key=${u.id}>
        <td><img class="row-thumb" src=${ke(u)} alt="" width="64" height="36" loading="lazy" /></td>
        <td><a href=${`/clip/${encodeURIComponent(u.id)}`}>${u.title}</a></td>
        <td>${u.game_name||"\u2014"}</td>
        <td><span class=${`badge badge-${u.visibility}`}>${u.visibility}</span></td>
        <td>${we(u.file_size_bytes)}</td>
        <td>${pe(u.duration_ms)}</td>
        <td>${_e(u.uploaded_at)}</td>
      </tr>`)}
    </tbody>
  </table>`}function Ia({count:e=8}){return i`<div class="card-grid">
    ${Array.from({length:e},(t,n)=>i`<div class="clip-card" key=${n}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`}ie();var Da={ChampionKill:"kill",FirstBlood:"kill",Multikill:"spree",Ace:"spree",DragonKill:"objective",HeraldKill:"objective",BaronKill:"objective",TurretKilled:"structure",InhibKilled:"structure",FirstBrick:"structure"};function In(e){let t=Number(e);return Number.isFinite(t)&&t>0?t/1e3:0}function Dn(e,t){let n=Number.isFinite(e)?e:0,a=t>0?t:Number.MAX_SAFE_INTEGER;return Math.max(0,Math.min(a,n))}function Je(e,t){return t>0?Math.max(0,Math.min(100,e/t*100)):0}function vt(e){if(!Number.isFinite(e))return"0:00";let t=Math.max(0,Math.round(e)),n=Math.floor(t/60),a=t-n*60;return`${n}:${String(a).padStart(2,"0")}`}function Rn(e){if(!Number.isFinite(e))return"0:00.0";let t=Math.max(0,Math.round(e*10)),n=Math.floor(t/600),a=t-n*600,o=Math.floor(a/10);return`${n}:${String(o).padStart(2,"0")}.${a%10}`}function Ln(e,t){return`${Rn(e)} / ${t>0?Rn(t):"0:00.0"}`}function La(e){return Da[e]||"info"}function Un(e,t){return(e||[]).map((n,a)=>{let o=Number(n.timestamp_ms);if(!Number.isFinite(o))return null;let r=o/1e3;return r<0||t>0&&r>t?null:{index:a,time:r,kind:String(n.kind||"Marker"),label:String(n.label||n.kind||"Marker"),category:La(n.kind)}}).filter(Boolean).sort((n,a)=>n.time-a.time)}function Nn(e,t){if(!e.length)return null;for(let n of e)if(n.time>t+.05)return n;return e[0]}function An(e,t){if(!e.length)return null;for(let n=e.length-1;n>=0;n-=1)if(e[n].time<t-.05)return e[n];return e[e.length-1]}function Fn(e,t){switch(e){case"Space":case"KeyK":return{kind:"toggle-play"};case"ArrowLeft":return{kind:"seek-by",seconds:t?-1:-5};case"ArrowRight":return{kind:"seek-by",seconds:t?1:5};case"KeyJ":return{kind:"seek-by",seconds:-10};case"KeyL":return{kind:"seek-by",seconds:10};case"Comma":return{kind:"seek-by",seconds:-.1};case"Period":return{kind:"seek-by",seconds:.1};case"KeyM":return{kind:t?"previous-marker":"next-marker"};case"Home":return{kind:"seek-to",seconds:0};case"End":return{kind:"seek-to-end"};case"KeyF":return{kind:"fullscreen"};case"KeyT":return{kind:"theater"};default:return null}}var Hn="clipline.playerVolume",Vn="clipline.clipTheaterMode",Ua=2e3,Na=[.25,.5,.75,1,1.25,1.5,2];function Aa(e,t){switch(e){case"KeyM":return{kind:"toggle-mute"};case"KeyF":return{kind:"theater"};case"Escape":return{kind:"exit-theater"};default:return Fn(e,t)}}function Fa(e){return e instanceof Element?!!e.closest("input, textarea, select, button, a, [contenteditable='true'], [contenteditable='']"):!1}function za(){try{let e=window.localStorage.getItem(Hn);if(e==null)return 1;let t=Number(e);return Number.isFinite(t)?Math.max(0,Math.min(1,t)):1}catch{return 1}}function zn(e){try{window.localStorage.setItem(Hn,String(Math.max(0,Math.min(1,e))))}catch{}}function Ha(){try{return window.localStorage.getItem(Vn)==="true"}catch{return!1}}function Va(e){try{window.localStorage.setItem(Vn,String(e))}catch{}}function On({src:e,poster:t,durationMs:n,markers:a}){let o=F(null),r=F(null),l=F(null),u=F(!1),p=F(!1),c=In(n),[d,b]=h(!1),[s,f]=h(0),[k,$]=h(c),[y,w]=h(0),[g,S]=h(za),[D,B]=h(!1),[K,X]=h(1),[W,G]=h(!1),[N,Y]=h(Ha),[be,te]=h(!0),[ne,Z]=h(null),[le,ae]=h(""),ee=Un(a,k);function re(){te(!0),window.clearTimeout(l.current),l.current=window.setTimeout(()=>{let m=o.current;m&&!m.paused&&!m.ended&&te(!1)},Ua)}C(()=>{d||(window.clearTimeout(l.current),te(!0))},[d]),C(()=>{let m=o.current;if(!m)return;let I=()=>Number.isFinite(m.duration)&&m.duration>0?m.duration:c,z=()=>$(I()),$t=()=>$(I()),yt=()=>{u.current||f(m.currentTime||0)},wt=()=>{let Tt=I();if(!(Tt>0)||!m.buffered?.length){w(0);return}let Pt=m.currentTime||0,Se=0;for(let Me=0;Me<m.buffered.length;Me+=1){let Qn=m.buffered.start(Me),et=m.buffered.end(Me);if(Pt>=Qn&&Pt<=et){Se=et;break}Se=Math.max(Se,et)}w(Je(Se,Tt))},kt=()=>{b(!0),ae(""),re()},xt=()=>b(!1),Ct=()=>b(!1),St=()=>{S(m.volume),B(m.muted||m.volume===0)},Mt=()=>ae("Playback unavailable");return m.addEventListener("loadedmetadata",z),m.addEventListener("durationchange",$t),m.addEventListener("timeupdate",yt),m.addEventListener("progress",wt),m.addEventListener("play",kt),m.addEventListener("pause",xt),m.addEventListener("ended",Ct),m.addEventListener("volumechange",St),m.addEventListener("error",Mt),()=>{m.removeEventListener("loadedmetadata",z),m.removeEventListener("durationchange",$t),m.removeEventListener("timeupdate",yt),m.removeEventListener("progress",wt),m.removeEventListener("play",kt),m.removeEventListener("pause",xt),m.removeEventListener("ended",Ct),m.removeEventListener("volumechange",St),m.removeEventListener("error",Mt)}},[e,c]),C(()=>{o.current&&(o.current.volume=g)},[g]),C(()=>{o.current&&(o.current.muted=D)},[D]),C(()=>{o.current&&(o.current.playbackRate=K)},[K]),C(()=>{if(document.documentElement.classList.toggle("clipline-theater",N),N){let m=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=m}}},[N]),C(()=>()=>document.documentElement.classList.remove("clipline-theater"),[]);function ce(m){Y(m),Va(m)}function v(m){let I=o.current;if(!I)return;let z=k>0?Dn(m,k):Math.max(0,m);I.currentTime=z,f(z)}function x(m){v((o.current?.currentTime||0)+m)}async function P(){let m=o.current;if(m)if(m.paused||m.ended)try{await m.play()}catch(I){ae(I?.message||"Playback failed")}else m.pause()}function R(){let m=o.current;m&&(m.muted||m.volume===0?(m.muted=!1,m.volume===0&&(m.volume=1,S(1),zn(1)),B(!1)):(m.muted=!0,B(!0)))}function _(m){let I=Number(m.target.value);S(I),B(I===0),zn(I);let z=o.current;z&&(z.volume=I,z.muted=I===0)}async function T(){try{document.fullscreenElement?await document.exitFullscreen():await r.current?.requestFullscreen?.()}catch(m){ae(m?.message||"Fullscreen unavailable")}}function M(m){let I=o.current?.currentTime||0,z=m>0?Nn(ee,I):An(ee,I);z&&v(z.time)}function V(){u.current=!0,p.current=d,d&&o.current?.pause()}function xe(m){let I=Number(m.target.value);f(I),v(I)}function Ce(){u.current&&(u.current=!1,p.current&&(p.current=!1,o.current?.play().catch(()=>{})))}function Yn(m){let I=m.currentTarget.getBoundingClientRect();if(!(I.width>0))return;let z=Math.max(0,Math.min(1,(m.clientX-I.left)/I.width));Z({pct:z*100,time:z*(k||0)})}function Xn(){Z(null)}return C(()=>{function m(I){if(I.defaultPrevented||Fa(I.target))return;let z=Aa(I.code,I.shiftKey);if(z&&!(z.kind==="exit-theater"&&!N))switch(I.preventDefault(),re(),z.kind){case"toggle-play":P();break;case"seek-by":x(z.seconds);break;case"seek-to":v(z.seconds);break;case"seek-to-end":v(k);break;case"next-marker":M(1);break;case"previous-marker":M(-1);break;case"toggle-mute":R();break;case"theater":ce(!N);break;case"exit-theater":ce(!1);break;case"fullscreen":T();break;default:break}}return document.addEventListener("keydown",m),()=>document.removeEventListener("keydown",m)},[k,N,d]),i`<div class=${`player ${be?"":"chrome-hidden"}`} ref=${r}
      onPointerMove=${re} onPointerEnter=${re}
      onPointerLeave=${()=>{let m=o.current;m&&!m.paused&&te(!1)}}
      onFocusIn=${()=>te(!0)}>
    <video ref=${o} class="player-video" src=${e} poster=${t||void 0}
      preload="metadata" playsinline onClick=${P}></video>
    ${le&&i`<div class="player-note">${le}</div>`}
    <div class="player-overlay">
      <div class="player-timeline" onPointerMove=${Yn} onPointerLeave=${Xn}>
        <div class="player-buffered" style=${`width:${y}%`}></div>
        <div class="player-progress" style=${`width:${Je(s,k)}%`}></div>
        ${ee.map(m=>i`<span class="player-marker-tick" key=${m.index}
            style=${`left:${Je(m.time,k)}%`} title=${`${m.label} @ ${vt(m.time)}`}></span>`)}
        <input class="player-scrubber" type="range" min="0" max=${k>0?k:0} step="0.01"
          value=${s} disabled=${!(k>0)} aria-label="Seek"
          onPointerDown=${V} onInput=${xe} onChange=${Ce}
          onPointerUp=${Ce} onPointerCancel=${Ce} onLostPointerCapture=${Ce} />
        ${ne&&i`<div class="player-hover-time" style=${`left:${ne.pct}%`}>${vt(ne.time)}</div>`}
      </div>
      <div class="player-controls">
        ${ee.length>0&&i`<div class="player-cluster">
          <button type="button" class="player-btn" title="Previous marker" aria-label="Previous marker"
            onClick=${()=>M(-1)}>${U("skipBack",{size:14})}</button>
          <button type="button" class="player-btn" title="Next marker" aria-label="Next marker"
            onClick=${()=>M(1)}>${U("skipForward",{size:14})}</button>
        </div>`}
        <button type="button" class="player-btn player-play" aria-label=${d?"Pause":"Play"} onClick=${P}>
          ${U(d?"pause":"play",{size:16})}
        </button>
        <span class="player-time">${Ln(s,k)}</span>
        <div class="player-spacer"></div>
        <div class="player-speed-wrap">
          <button type="button" class="player-btn player-speed" aria-haspopup="menu" aria-expanded=${W}
            onClick=${()=>G(m=>!m)}>${K}×</button>
          ${W&&i`<div class="player-speed-menu" role="menu">
            ${Na.map(m=>i`<button type="button" role="menuitem" key=${m}
                class=${`player-speed-item ${m===K?"is-active":""}`}
                onClick=${()=>{X(m),G(!1)}}>${m}×</button>`)}
          </div>`}
        </div>
        <button type="button" class="player-btn" aria-label=${D?"Unmute":"Mute"} onClick=${R}>
          ${U(D?"volumeX":"volume2",{size:14})}
        </button>
        <input class="player-volume" type="range" min="0" max="1" step="0.01" value=${D?0:g}
          aria-label="Volume" onInput=${_} />
        <button type="button" class="player-btn" aria-label=${N?"Exit theater mode":"Theater mode"}
          aria-pressed=${N} onClick=${()=>ce(!N)}>${U("theater",{size:14})}</button>
        <button type="button" class="player-btn" aria-label="Fullscreen" onClick=${T}>
          ${U("fullscreen",{size:14})}
        </button>
      </div>
    </div>
  </div>`}ie();function Oa(e){let t=new Map(e.map(r=>[r.id,r])),n=new Map,a=[],o=0;return e.forEach(r=>{let l=r.parent_comment_id||"";l&&t.has(l)?(n.has(l)||n.set(l,[]),n.get(l).push(r),o+=1):l||(a.push(r),o+=1)}),{roots:a,repliesByParent:n,count:o}}function Ba(e){return(e||"?").trim().slice(0,1).toUpperCase()||"?"}function Ka(e){let t=e.author_avatar_url;return typeof t=="string"&&t.startsWith("/")?i`<img class="comment-avatar" src=${t} alt="" />`:i`<div class="comment-avatar">${Ba(e.author_name)}</div>`}function Bn({shareId:e}){let{user:t}=Q(q),[n,a]=h(null),[o,r]=h(""),[l,u]=h(null),[p,c]=h(""),[d,b]=h(null);function s(){E(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`).then(g=>a(g.comments||[])).catch(()=>a([]))}C(()=>{let g=!0;return a(null),E(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`).then(S=>g&&a(S.comments||[])).catch(()=>g&&a([])),()=>{g=!1}},[e]);async function f(g,S){let D=g.trim();if(D)try{await E(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`,{method:"POST",body:S?{body:D,parent_comment_id:S}:{body:D}}),s()}catch(B){A(B.message)}}async function k(g){g.preventDefault(),await f(o),r("")}async function $(g,S){g.preventDefault(),await f(p,S),c(""),u(null)}async function y(){let g=d;b(null);try{await E(`/api/v1/public/clips/${encodeURIComponent(e)}/comments/${encodeURIComponent(g)}`,{method:"DELETE"}),s()}catch(S){A(S.message)}}let w=Oa(n||[]);return i`<section class="comments">
    <div class="comments-header"><h2>Comments</h2><span class="muted">${w.count}</span></div>
    ${t?i`<form class="comment-form" onSubmit=${k}>
          <textarea rows="3" maxlength="2000" placeholder="Add a comment" value=${o}
            onInput=${g=>r(g.target.value)}></textarea>
          <div class="comment-form-actions">
            <button type="submit" class="btn btn-primary">${U("message",{size:14})} Post comment</button>
          </div>
        </form>`:i`<p class="comment-signin"><a href="/login">Sign in</a> to comment.</p>`}
    ${n==null?"":w.count===0?i`<p class="comment-signin">No comments yet.</p>`:i`<div class="comment-list">
          ${w.roots.map(g=>Kn(g,{depth:0,repliesByParent:w.repliesByParent,user:t,replyOpenId:l,setReplyOpenId:u,replyDraft:p,setReplyDraft:c,submitReply:$,onDelete:b}))}
        </div>`}
    <${he} open=${d!=null} title="Delete this comment?"
      body="This removes the comment from the public clip page." confirmLabel="Delete" danger
      onConfirm=${y} onCancel=${()=>b(null)} />
  </section>`}function Kn(e,t){let{depth:n,repliesByParent:a,user:o,replyOpenId:r,setReplyOpenId:l,replyDraft:u,setReplyDraft:p,submitReply:c,onDelete:d}=t,b=a.get(e.id)||[];return i`<article class="comment" key=${e.id}>
    ${Ka(e)}
    <div class="comment-body">
      <div class="comment-head">
        ${e.author_username?i`<a href=${`/u/${encodeURIComponent(e.author_username)}`}>${e.author_name}</a>`:i`<strong>${e.author_name}</strong>`}
        ${e.is_uploader&&i`<span class="comment-badge">Uploader</span>`}
        <span>${Ge(e.created_at)}</span>
        <div class="comment-actions">
          ${o&&n===0&&i`<button type="button" class="comment-action"
            onClick=${()=>l(r===e.id?null:e.id)}>
            ${U("message",{size:12})} Reply</button>`}
          ${e.viewer_can_delete&&i`<button type="button" class="comment-delete" aria-label="Delete comment"
            title="Delete comment" onClick=${()=>d(e.id)}>${U("trash",{size:12})}</button>`}
        </div>
      </div>
      <p class="comment-text">${e.body}</p>
      ${o&&n===0&&r===e.id&&i`<form class="comment-reply-form"
        onSubmit=${s=>c(s,e.id)}>
        <textarea rows="2" maxlength="2000" placeholder="Write a reply" value=${u}
          onInput=${s=>p(s.target.value)}></textarea>
        <div class="comment-form-actions">
          <button type="submit" class="btn btn-primary">${U("message",{size:14})} Post reply</button>
        </div>
      </form>`}
      ${b.length>0&&i`<div class="comment-replies">
        ${b.map(s=>Kn(s,{...t,depth:n+1}))}
      </div>`}
    </div>
  </article>`}var Ga=["private","public","unlisted"];function qa(e,t){return e==="clip"?!0:!!t?.viewer_can_edit}function Wa(e,t,n){return e==="public"?t.shareId:n?.public_share_id||null}function Za(e,t,n){return e==="clip"?t.clipId:n?.viewer_clip_id||null}function ja(e,t,n){if(e)try{return`${t}${new URL(e).pathname}`}catch{}return n?`${t}/c/${encodeURIComponent(n)}`:null}function Ya(e){let t=e?.height!=null?e.height:"",n=Math.round(e?.fps||0)||"";return`${t}p${n}`}function Xa(e,t,n=8){return(e||[]).filter(a=>a.share_id!==t).slice(0,n)}function bt({route:e}){let{user:t}=Q(q),[n,a]=h(null),[o,r]=h(null),[l,u]=h([]),[p,c]=h(!1),[d,b]=h(""),[s,f]=h(!1),[k,$]=h(""),[y,w]=h(!1),[g,S]=h(!1),[D,B]=h(!1),K=e.name==="clip"?`clip:${e.clipId}`:`public:${e.shareId}`;if(C(()=>{let _=!0;a(null),r(null),c(!1),f(!1),B(!1),w(!1);let T=e.name==="clip"?`/api/v1/clips/${encodeURIComponent(e.clipId)}`:`/api/v1/public/clips/${encodeURIComponent(e.shareId)}`;return E(T).then(M=>{_&&(a(M),e.name==="public"&&E(`/api/v1/public/clips/${encodeURIComponent(e.shareId)}/view`,{method:"POST",body:{}}).then(V=>_&&a(xe=>xe&&{...xe,view_count:V.view_count})).catch(()=>{}))}).catch(M=>_&&r(M)),()=>{_=!1}},[K]),C(()=>{let _=!0;return E("/api/v1/public/clips").then(T=>_&&u(T.clips||[])).catch(()=>{}),()=>{_=!1}},[K]),o)return i`<main class="page"><${J} name="alert" title="Couldn't load this clip" body=${o.message} /></main>`;if(!n)return i`<main class="page watch"><div><div class="skeleton-thumb"></div></div><aside class="upnext"></aside></main>`;let X=qa(e.name,n),W=Wa(e.name,e,n),G=Za(e.name,e,n),N=e.name==="clip"?qe({id:n.id}):yn({share_id:e.shareId}),Y=e.name==="clip"?ke({id:n.id}):se({share_id:e.shareId}),be=e.name==="clip"?t?.display_name||t?.username||"You":n.author_name||"Unknown creator",te=n.public_url??n.share_url??null,ne=ja(te,window.location.origin,W),Z=e.name==="clip";function le(){b(n.title),c(!0)}async function ae(_){_?.preventDefault?.();let T=d.trim();if(!T||T===n.title){c(!1);return}try{await E(`/api/v1/clips/${encodeURIComponent(G)}`,{method:"PATCH",body:{title:T}}),a(M=>({...M,title:T})),c(!1),A("Title saved.")}catch(M){A(M.message)}}function ee(){$(n.description||""),f(!0)}async function re(){let _=k.trim();try{await E(`/api/v1/clips/${encodeURIComponent(G)}`,{method:"PATCH",body:{description:_||null}}),a(T=>({...T,description:_||null})),f(!1),A("Description saved.")}catch(T){A(T.message)}}async function ce(_){let T=n.visibility;if(T!==_){a(M=>({...M,visibility:_}));try{let M=await E(`/api/v1/clips/${encodeURIComponent(G)}/visibility`,{method:"POST",body:{visibility:_}});a(V=>({...V,visibility:M.visibility,public_url:M.public_url,public_share_id:M.public_share_id})),A(`Visibility set to ${_}.`,{actionLabel:"Undo",onAction:()=>ce(T)})}catch(M){a(V=>({...V,visibility:T})),A(M.message)}}}async function v(){if(ne)try{await navigator.clipboard.writeText(ne),A("Link copied.")}catch{A("Couldn't copy the link.")}}async function x(){S(!1);try{await E(`/api/v1/clips/${encodeURIComponent(G)}`,{method:"DELETE"}),A("Clip deleted."),j("/library")}catch(_){A(_.message)}}let P=[n.game_name&&i`<a class="chip chip-on" href=${`/game/${encodeURIComponent(n.game_name)}`}>${n.game_name}</a>`,me(n.view_count),`Recorded ${_e(n.recorded_at)}`,`by ${be}`].filter(Boolean),R=Xa(l,W,8);return i`<main class="page watch">
    <div>
      <${On} src=${N} poster=${Y} durationMs=${n.duration_ms} markers=${n.markers} />
      <div class="watch-titlerow">
        ${p?i`<input class="input watch-title-input" value=${d} autofocus
              onInput=${_=>b(_.target.value)} onBlur=${ae}
              onKeyDown=${_=>{_.key==="Enter"&&ae(_),_.key==="Escape"&&c(!1)}} />`:i`<h1>${n.title}
              ${X&&i`<button type="button" class="edit-pencil" aria-label="Edit title" onClick=${le}
                >${U("edit",{size:14})}</button>`}</h1>`}
      </div>
      <p class="watch-meta">${P.map((_,T)=>i`${T>0?" \xB7 ":""}${_}`)}</p>

      ${X&&i`<div class="watch-actions">
        <div class="seg" role="radiogroup" aria-label="Visibility">
          ${Ga.map(_=>i`<button type="button" role="radio" key=${_} aria-checked=${n.visibility===_}
              class=${`seg-item ${n.visibility===_?"seg-on":""}`} onClick=${()=>ce(_)}
              >${_[0].toUpperCase()+_.slice(1)}</button>`)}
        </div>
        <button type="button" class="btn btn-primary" disabled=${!ne} onClick=${v}>
          ${U("copy",{size:14})} Copy share link</button>
        <div class="watch-more">
          <button type="button" class="btn" aria-haspopup="menu" aria-expanded=${y}
            onClick=${()=>w(_=>!_)}>⋯</button>
          ${y&&i`<div class="menu" role="menu">
            <button type="button" class="menu-danger" role="menuitem"
              onClick=${()=>{w(!1),S(!0)}}>${U("trash",{size:14})} Delete clip</button>
          </div>`}
        </div>
      </div>`}

      <div class="watch-desc">
        ${s?i`<textarea class="input" rows="5" value=${k} autofocus
              onInput=${_=>$(_.target.value)} onBlur=${re}
              onKeyDown=${_=>{_.key==="Enter"&&(_.ctrlKey||_.metaKey)&&re(),_.key==="Escape"&&f(!1)}}></textarea>`:n.description?i`<p>${n.description}
              ${X&&i`<button type="button" class="edit-pencil" aria-label="Edit description" onClick=${ee}
                >${U("edit",{size:12})}</button>`}</p>`:X?i`<button type="button" class="watch-desc-add" onClick=${ee}>+ Add a description</button>`:""}
      </div>

      ${Z&&i`<button type="button" class="details-strip" aria-expanded=${D}
        onClick=${()=>B(_=>!_)}>
        <span><b>${pe(n.duration_ms)}</b> length</span>
        <span><b>${we(n.file_size_bytes)}</b></span>
        <span><b>${Ya(n)}</b></span>
        <span><b>${n.video_codec}/${n.audio_codec}</b> ${n.container}</span>
        <span class="details-chev">${D?"\u25B4 less":"\u25BE more"}</span>
      </button>`}
      ${Z&&D&&i`<dl class="details-full">
        <div><dt>Recorded</dt><dd>${_e(n.recorded_at)}</dd></div>
        <div><dt>Uploaded</dt><dd>${_e(n.uploaded_at)}</dd></div>
        <div><dt>Dimensions</dt><dd>${n.width&&n.height?`${n.width} x ${n.height}`:"Unknown"}</dd></div>
        <div><dt>FPS</dt><dd>${n.fps??"Unknown"}</dd></div>
        <div><dt>Container</dt><dd>${n.container||"Unknown"}</dd></div>
        <div><dt>Video codec</dt><dd>${n.video_codec||"Unknown"}</dd></div>
        <div><dt>Audio codec</dt><dd>${n.audio_codec||"Unknown"}</dd></div>
        <div><dt>Source</dt><dd>${n.source_type||"Unknown"}</dd></div>
        <div><dt>Checksum</dt><dd>${n.checksum_sha256||"Unknown"}</dd></div>
      </dl>`}

      ${W&&i`<${Bn} shareId=${W} />`}
    </div>
    <aside class="upnext">
      <h4 class="kicker">Up next</h4>
      ${R.map(_=>i`<a class="upnext-row" key=${_.share_id} href=${`/c/${encodeURIComponent(_.share_id)}`}>
          <img src=${se(_)} alt="" loading="lazy" />
          <span><b>${_.title}</b><small>${_.author_name} · ${_.game_name||"No game"} · ${me(_.view_count)}</small></span>
        </a>`)}
    </aside>

    <${he} open=${g} title="Delete this clip?" body="Public links stop working immediately."
      confirmLabel="Delete" danger onConfirm=${x} onCancel=${()=>S(!1)} />
  </main>`}ie();var gt=[{top:"4%",left:"4%",width:"34%",rotate:-7},{top:"0%",left:"44%",width:"30%",rotate:5},{top:"34%",left:"68%",width:"28%",rotate:-4},{top:"50%",left:"8%",width:"30%",rotate:6},{top:"62%",left:"42%",width:"26%",rotate:-5},{top:"26%",left:"-4%",width:"22%",rotate:9}];function Qa(e){return Array.isArray(e)?e.slice(0,gt.length).map((t,n)=>({clip:t,...gt[n]})):[]}function Ja(e){let t=e?.clips;if(!Array.isArray(t)||t.length===0)return null;let n=t.length,a=e.has_more?"+":"";return`${n}${a} clip${n===1?"":"s"} on this instance`}function er({top:e,left:t,width:n,rotate:a}){return`top:${e};left:${t};width:${n};transform:rotate(${a}deg);`}function Gn(e){let t=String(e||"").trim();return t||null}function tr(){let[e,t]=h(null);C(()=>{let o=!0;return E(`/api/v1/public/clips?page_size=${gt.length}`).then(r=>o&&t(r)).catch(()=>o&&t(null)),()=>{o=!1}},[]);let n=Qa(e?.clips),a=Ja(e);return i`<aside class="login-montage" aria-hidden="true">
    ${n.length>0&&i`<div class="login-montage-tiles">
      ${n.map((o,r)=>i`<img key=${r} class="login-montage-tile" style=${er(o)}
        src=${se(o.clip)} alt="" loading="lazy" />`)}
    </div>`}
    <div class="login-montage-copy">
      <h2>Your clips. Your server.</h2>
      ${a&&i`<p>${a}</p>`}
    </div>
  </aside>`}function ve({titleId:e,children:t}){return i`<div class="login-page">
    <${tr} />
    <section class="login-panel" aria-labelledby=${e}>
      <div class="login-brand" aria-hidden="true">
        <img src="/clipline-icon.svg" alt="" width="32" height="32" />
        <span class="login-brand-word">CLIP<b>LINE</b></span>
        <span class="login-brand-descriptor">CLOUD</span>
      </div>
      ${t}
    </section>
  </div>`}function qn(){let{user:e}=Q(q),[t,n]=h(""),[a,o]=h(""),[r,l]=h(""),[u,p]=h(!1);if(C(()=>{e&&j("/library")},[e]),e)return null;async function c(d){if(d.preventDefault(),!u){p(!0),l("");try{let b=await E("/api/v1/auth/login",{method:"POST",body:{username:t,password:a}});$e(b.csrf_token),q.set({user:b.user,csrfToken:b.csrf_token,ready:!0}),j("/library")}catch(b){l(b instanceof de?b.message:"Sign in failed"),p(!1)}}}return i`<${ve} titleId="login-title">
    <h1 id="login-title">Sign in</h1>
    ${r&&i`<p class="form-error" role="alert">${r}</p>`}
    <form class="login-form" onSubmit=${c}>
      <label class="login-field">
        <span>Username</span>
        <input class="input" name="username" autocomplete="username" required
          value=${t} onInput=${d=>n(d.target.value)} />
      </label>
      <label class="login-field">
        <span>Password</span>
        <input class="input" name="password" type="password" autocomplete="current-password" required
          value=${a} onInput=${d=>o(d.target.value)} />
      </label>
      <button class="btn btn-primary" type="submit" disabled=${u}>${u?"Signing in\u2026":"Sign in"}</button>
    </form>
    <p class="login-hint">Accounts are created by this server's admin.</p>
  </${ve}>`}function Wn({route:e}){let t=!!e.invite,[n,a]=h(()=>t?"preflight":e.token?"form":"missing-token"),[o,r]=h(""),[l,u]=h(t?null:e.token),[p,c]=h(""),[d,b]=h(!1),s=t;C(()=>{if(!t)return;if(!e.token){a("missing-token");return}let y=!0;return a("preflight"),E("/api/v1/invites/claim",{method:"POST",body:{invite_token:e.token}}).then(w=>{y&&(u(w.reset_token),a("form"))}).catch(w=>{y&&(r(w instanceof de?w.message:"This invite link is invalid, used, or expired."),a("invalid"))}),()=>{y=!1}},[t,e.token]);async function f(y){if(y.preventDefault(),d)return;b(!0),c("");let w=new FormData(y.currentTarget),g={reset_token:l,new_password:String(w.get("new_password")||"")};s&&(g.username=String(w.get("username")||""),g.display_name=Gn(w.get("display_name")),g.email=Gn(w.get("email")));try{await E("/api/v1/auth/reset-password",{method:"POST",body:g}),A(s?"Account created. Sign in with your new password.":"Password set. Sign in with your new password."),j("/login")}catch(S){c(S instanceof de?S.message:"Request failed"),b(!1)}}if(t&&n!=="form"){let y=n==="missing-token"||n==="invalid",w=n==="missing-token"?"This invite link is missing a token.":n==="invalid"?o:"Opening invite\u2026";return i`<${ve} titleId="invite-title">
      <h1 id="invite-title">Create account</h1>
      <p class="login-copy">${y?"This invite cannot be used.":"Preparing your account setup."}</p>
      ${y?i`<p class="form-error" role="alert">${w}</p>`:i`<p class="login-status">${w}</p>`}
    </${ve}>`}return i`<${ve} titleId="reset-title">
    <h1 id="reset-title">${s?"Create account":"Set password"}</h1>
    <p class="login-copy">${s?"Choose your Clipline Cloud account details.":"Choose a new password for your Clipline Cloud account."}</p>
    ${n==="missing-token"?i`<p class="form-error" role="alert">This reset link is missing a token.</p>`:i`
        ${p&&i`<p class="form-error" role="alert">${p}</p>`}
        <form class="login-form" onSubmit=${f}>
          ${s&&i`
            <label class="login-field">
              <span>Username</span>
              <input class="input" name="username" autocomplete="username" required />
            </label>
            <label class="login-field">
              <span>Display name</span>
              <input class="input" name="display_name" autocomplete="name" />
            </label>
            <label class="login-field">
              <span>Email</span>
              <input class="input" name="email" type="email" autocomplete="email" />
            </label>
          `}
          <label class="login-field">
            <span>New password</span>
            <input class="input" name="new_password" type="password" autocomplete="new-password" minlength="8" required />
          </label>
          <button class="btn btn-primary" type="submit" disabled=${d}>
            ${s?"Create account":"Set password"}
          </button>
        </form>
      `}
    ${!s&&i`<a class="btn" href="/login">Sign in</a>`}
  </${ve}>`}var nr={publicLibrary:ht,publicGame:ht,games:Cn,library:En,clip:bt,public:bt,login:qn,resetPassword:Wn},Zn={publicLibrary:"feed",publicGame:"feed",games:"games",library:"library",clip:"library",admin:"admin",profile:"profile"},jn=fn(Ke());function ar({route:e}){return i`<main class="page"><p class="kicker">Not ported yet</p>
    <p>Route <code>${e.name}</code> still renders in the legacy app — open it from
    <a href="/">the served site</a>.</p></main>`}function rr(){let e=_n();jn=e.name;let{ready:t}=Q(q);if(!t)return i`<div class="boot">Loading…</div>`;let n=nr[e.name]||ar,a=e.name==="login"||e.name==="resetPassword";return i`<div class="ui" onClick=${hn}>
    ${!a&&i`<${bn} active=${Zn[e.name]||""} />`}
    <${n} route=${e} />
    ${!a&&i`<${gn} active=${Zn[e.name]||""} />`}
    <${$n} />
  </div>`}window.addEventListener("clipline:unauthorized",()=>{q.set({user:null,csrfToken:null,ready:!0}),pn(jn)||j("/login")});(async()=>{try{let e=await E("/api/v1/auth/me");$e(e.csrf_token),q.set({user:e.user,csrfToken:e.csrf_token,ready:!0})}catch{q.set({user:null,csrfToken:null,ready:!0})}Gt(i`<${rr} />`,document.querySelector("#app"))})();
