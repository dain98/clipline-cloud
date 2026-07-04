var Ma=Object.defineProperty;var Pa=(e,t)=>()=>(e&&(t=e(e=0)),t);var Ea=(e,t)=>{for(var n in t)Ma(e,n,{get:t[n],enumerable:!0})};var wn={};Ea(wn,{ApiError:()=>he,api:()=>y,getCsrfToken:()=>yt,setCsrfToken:()=>de});function de(e){Ke=e}function yt(){return Ke}async function y(e,t={}){let n=(t.method||"GET").toUpperCase(),a=new Headers(t.headers||{});a.set("Accept","application/json");let r=t.body;r&&typeof r!="string"&&(a.set("Content-Type","application/json"),r=JSON.stringify(r)),!["GET","HEAD","OPTIONS"].includes(n)&&Ke&&a.set("X-CSRF-Token",Ke);let s=await fetch(e,{...t,body:r,credentials:"same-origin",headers:a,method:n}),c=(s.headers.get("content-type")||"").includes("application/json")?await s.json():await s.text();if(!s.ok){s.status===401&&window.dispatchEvent(new CustomEvent("clipline:unauthorized"));let d=typeof c=="object"&&c?.error?c.error:s.statusText;throw new he(d||"Request failed",s.status)}return c}var Ke,he,Q=Pa(()=>{Ke=null;he=class extends Error{constructor(t,n){super(t),this.status=n}}});var Ve,N,Wt,Ra,fe,Ht,jt,Zt,ut,Ae,Pe,Jt,mt,dt,pt,Da,ze={},Be=[],Ua=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,He=Array.isArray;function ue(e,t){for(var n in t)e[n]=t[n];return e}function ft(e){e&&e.parentNode&&e.parentNode.removeChild(e)}function ht(e,t,n){var a,r,s,i={};for(s in t)s=="key"?a=t[s]:s=="ref"?r=t[s]:i[s]=t[s];if(arguments.length>2&&(i.children=arguments.length>3?Ve.call(arguments,2):n),typeof e=="function"&&e.defaultProps!=null)for(s in e.defaultProps)i[s]===void 0&&(i[s]=e.defaultProps[s]);return Ne(e,i,a,r,null)}function Ne(e,t,n,a,r){var s={type:e,props:t,key:n,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:r??++Wt,__i:-1,__u:0};return r==null&&N.vnode!=null&&N.vnode(s),s}function qe(e){return e.children}function Fe(e,t){this.props=e,this.context=t}function Se(e,t){if(t==null)return e.__?Se(e.__,e.__i+1):null;for(var n;t<e.__k.length;t++)if((n=e.__k[t])!=null&&n.__e!=null)return n.__e;return typeof e.type=="function"?Se(e):null}function La(e){if(e.__P&&e.__d){var t=e.__v,n=t.__e,a=[],r=[],s=ue({},t);s.__v=t.__v+1,N.vnode&&N.vnode(s),_t(e.__P,s,t,e.__n,e.__P.namespaceURI,32&t.__u?[n]:null,a,n??Se(t),!!(32&t.__u),r),s.__v=t.__v,s.__.__k[s.__i]=s,tn(a,s,r),t.__e=t.__=null,s.__e!=n&&Yt(s)}}function Yt(e){if((e=e.__)!=null&&e.__c!=null)return e.__e=e.__c.base=null,e.__k.some(function(t){if(t!=null&&t.__e!=null)return e.__e=e.__c.base=t.__e}),Yt(e)}function qt(e){(!e.__d&&(e.__d=!0)&&fe.push(e)&&!Oe.__r++||Ht!=N.debounceRendering)&&((Ht=N.debounceRendering)||jt)(Oe)}function Oe(){try{for(var e,t=1;fe.length;)fe.length>t&&fe.sort(Zt),e=fe.shift(),t=fe.length,La(e)}finally{fe.length=Oe.__r=0}}function Xt(e,t,n,a,r,s,i,c,d,u,p){var b,l,f,m,k,x,C,g=a&&a.__k||Be,R=t.length;for(d=Ia(n,t,g,d,R),b=0;b<R;b++)(f=n.__k[b])!=null&&(l=f.__i!=-1&&g[f.__i]||ze,f.__i=b,x=_t(e,f,l,r,s,i,c,d,u,p),m=f.__e,f.ref&&l.ref!=f.ref&&(l.ref&&bt(l.ref,null,f),p.push(f.ref,f.__c||m,f)),k==null&&m!=null&&(k=m),(C=!!(4&f.__u))||l.__k===f.__k?(d=Qt(f,d,e,C),C&&l.__e&&(l.__e=null)):typeof f.type=="function"&&x!==void 0?d=x:m&&(d=m.nextSibling),f.__u&=-7);return n.__e=k,d}function Ia(e,t,n,a,r){var s,i,c,d,u,p=n.length,b=p,l=0;for(e.__k=new Array(r),s=0;s<r;s++)(i=t[s])!=null&&typeof i!="boolean"&&typeof i!="function"?(typeof i=="string"||typeof i=="number"||typeof i=="bigint"||i.constructor==String?i=e.__k[s]=Ne(null,i,null,null,null):He(i)?i=e.__k[s]=Ne(qe,{children:i},null,null,null):i.constructor===void 0&&i.__b>0?i=e.__k[s]=Ne(i.type,i.props,i.key,i.ref?i.ref:null,i.__v):e.__k[s]=i,d=s+l,i.__=e,i.__b=e.__b+1,c=null,(u=i.__i=Aa(i,n,d,b))!=-1&&(b--,(c=n[u])&&(c.__u|=2)),c==null||c.__v==null?(u==-1&&(r>p?l--:r<p&&l++),typeof i.type!="function"&&(i.__u|=4)):u!=d&&(u==d-1?l--:u==d+1?l++:(u>d?l--:l++,i.__u|=4))):e.__k[s]=null;if(b)for(s=0;s<p;s++)(c=n[s])!=null&&(2&c.__u)==0&&(c.__e==a&&(a=Se(c)),an(c,c));return a}function Qt(e,t,n,a){var r,s;if(typeof e.type=="function"){for(r=e.__k,s=0;r&&s<r.length;s++)r[s]&&(r[s].__=e,t=Qt(r[s],t,n,a));return t}e.__e!=t&&(a&&(t&&e.type&&!t.parentNode&&(t=Se(e)),n.insertBefore(e.__e,t||null)),t=e.__e);do t=t&&t.nextSibling;while(t!=null&&t.nodeType==8);return t}function Aa(e,t,n,a){var r,s,i,c=e.key,d=e.type,u=t[n],p=u!=null&&(2&u.__u)==0;if(u===null&&c==null||p&&c==u.key&&d==u.type)return n;if(a>(p?1:0)){for(r=n-1,s=n+1;r>=0||s<t.length;)if((u=t[i=r>=0?r--:s++])!=null&&(2&u.__u)==0&&c==u.key&&d==u.type)return i}return-1}function Gt(e,t,n){t[0]=="-"?e.setProperty(t,n??""):e[t]=n==null?"":typeof n!="number"||Ua.test(t)?n:n+"px"}function Ie(e,t,n,a,r){var s,i;e:if(t=="style")if(typeof n=="string")e.style.cssText=n;else{if(typeof a=="string"&&(e.style.cssText=a=""),a)for(t in a)n&&t in n||Gt(e.style,t,"");if(n)for(t in n)a&&n[t]==a[t]||Gt(e.style,t,n[t])}else if(t[0]=="o"&&t[1]=="n")s=t!=(t=t.replace(Jt,"$1")),i=t.toLowerCase(),t=i in e||t=="onFocusOut"||t=="onFocusIn"?i.slice(2):t.slice(2),e.l||(e.l={}),e.l[t+s]=n,n?a?n[Pe]=a[Pe]:(n[Pe]=mt,e.addEventListener(t,s?pt:dt,s)):e.removeEventListener(t,s?pt:dt,s);else{if(r=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&t[4]!="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&n==1?"":n))}}function Kt(e){return function(t){if(this.l){var n=this.l[t.type+e];if(t[Ae]==null)t[Ae]=mt++;else if(t[Ae]<n[Pe])return;return n(N.event?N.event(t):t)}}}function _t(e,t,n,a,r,s,i,c,d,u){var p,b,l,f,m,k,x,C,g,R,j,J,Z,se,O,te,L=t.type;if(t.constructor!==void 0)return null;128&n.__u&&(d=!!(32&n.__u),s=[c=t.__e=n.__e]),(p=N.__b)&&p(t);e:if(typeof L=="function"){b=i.length;try{if(g=t.props,R=L.prototype&&L.prototype.render,j=(p=L.contextType)&&a[p.__c],J=p?j?j.props.value:p.__:a,n.__c?C=(l=t.__c=n.__c).__=l.__E:(R?t.__c=l=new L(g,J):(t.__c=l=new Fe(g,J),l.constructor=L,l.render=Fa),j&&j.sub(l),l.state||(l.state={}),l.__n=a,f=l.__d=!0,l.__h=[],l._sb=[]),R&&l.__s==null&&(l.__s=l.state),R&&L.getDerivedStateFromProps!=null&&(l.__s==l.state&&(l.__s=ue({},l.__s)),ue(l.__s,L.getDerivedStateFromProps(g,l.__s))),m=l.props,k=l.state,l.__v=t,f)R&&L.getDerivedStateFromProps==null&&l.componentWillMount!=null&&l.componentWillMount(),R&&l.componentDidMount!=null&&l.__h.push(l.componentDidMount);else{if(R&&L.getDerivedStateFromProps==null&&g!==m&&l.componentWillReceiveProps!=null&&l.componentWillReceiveProps(g,J),t.__v==n.__v||!l.__e&&l.shouldComponentUpdate!=null&&l.shouldComponentUpdate(g,l.__s,J)===!1){t.__v!=n.__v&&(l.props=g,l.state=l.__s,l.__d=!1),t.__e=n.__e,t.__k=n.__k,t.__k.some(function(Y){Y&&(Y.__=t)}),Be.push.apply(l.__h,l._sb),l._sb=[],l.__h.length&&i.push(l);break e}l.componentWillUpdate!=null&&l.componentWillUpdate(g,l.__s,J),R&&l.componentDidUpdate!=null&&l.__h.push(function(){l.componentDidUpdate(m,k,x)})}if(l.context=J,l.props=g,l.__P=e,l.__e=!1,Z=N.__r,se=0,R)l.state=l.__s,l.__d=!1,Z&&Z(t),p=l.render(l.props,l.state,l.context),Be.push.apply(l.__h,l._sb),l._sb=[];else do l.__d=!1,Z&&Z(t),p=l.render(l.props,l.state,l.context),l.state=l.__s;while(l.__d&&++se<25);l.state=l.__s,l.getChildContext!=null&&(a=ue(ue({},a),l.getChildContext())),R&&!f&&l.getSnapshotBeforeUpdate!=null&&(x=l.getSnapshotBeforeUpdate(m,k)),O=p!=null&&p.type===qe&&p.key==null?nn(p.props.children):p,c=Xt(e,He(O)?O:[O],t,n,a,r,s,i,c,d,u),l.base=t.__e,t.__u&=-161,l.__h.length&&i.push(l),C&&(l.__E=l.__=null)}catch(Y){if(i.length=b,t.__v=null,d||s!=null){if(Y.then){for(t.__u|=d?160:128;c&&c.nodeType==8&&c.nextSibling;)c=c.nextSibling;s!=null&&(s[s.indexOf(c)]=null),t.__e=c}else if(s!=null)for(te=s.length;te--;)ft(s[te])}else t.__e=n.__e;t.__k==null&&(t.__k=n.__k||[]),Y.then||en(t),N.__e(Y,t,n)}}else s==null&&t.__v==n.__v?(t.__k=n.__k,t.__e=n.__e):c=t.__e=Na(n.__e,t,n,a,r,s,i,d,u);return(p=N.diffed)&&p(t),128&t.__u?void 0:c}function en(e){e&&(e.__c&&(e.__c.__e=!0),e.__k&&e.__k.some(en))}function tn(e,t,n){for(var a=0;a<n.length;a++)bt(n[a],n[++a],n[++a]);N.__c&&N.__c(t,e),e.some(function(r){try{e=r.__h,r.__h=[],e.some(function(s){s.call(r)})}catch(s){N.__e(s,r.__v)}})}function nn(e){return typeof e!="object"||e==null||e.__b>0?e:He(e)?e.map(nn):e.constructor!==void 0?null:ue({},e)}function Na(e,t,n,a,r,s,i,c,d){var u,p,b,l,f,m,k,x=n.props||ze,C=t.props,g=t.type;if(g=="svg"?r="http://www.w3.org/2000/svg":g=="math"?r="http://www.w3.org/1998/Math/MathML":r||(r="http://www.w3.org/1999/xhtml"),s!=null){for(u=0;u<s.length;u++)if((f=s[u])&&"setAttribute"in f==!!g&&(g?f.localName==g:f.nodeType==3)){e=f,s[u]=null;break}}if(e==null){if(g==null)return document.createTextNode(C);e=document.createElementNS(r,g,C.is&&C),c&&(N.__m&&N.__m(t,s),c=!1),s=null}if(g==null)x===C||c&&e.data==C||(e.data=C);else{if(s=g=="textarea"&&C.defaultValue!=null?null:s&&Ve.call(e.childNodes),!c&&s!=null)for(x={},u=0;u<e.attributes.length;u++)x[(f=e.attributes[u]).name]=f.value;for(u in x)f=x[u],u=="dangerouslySetInnerHTML"?b=f:u=="children"||u in C||u=="value"&&"defaultValue"in C||u=="checked"&&"defaultChecked"in C||Ie(e,u,null,f,r);for(u in C)f=C[u],u=="children"?l=f:u=="dangerouslySetInnerHTML"?p=f:u=="value"?m=f:u=="checked"?k=f:c&&typeof f!="function"||x[u]===f||Ie(e,u,f,x[u],r);if(p)c||b&&(p.__html==b.__html||p.__html==e.innerHTML)||(e.innerHTML=p.__html),t.__k=[];else if(b&&(e.innerHTML=""),Xt(t.type=="template"?e.content:e,He(l)?l:[l],t,n,a,g=="foreignObject"?"http://www.w3.org/1999/xhtml":r,s,i,s?s[0]:n.__k&&Se(n,0),c,d),s!=null)for(u=s.length;u--;)ft(s[u]);c&&g!="textarea"||(u="value",g=="progress"&&m==null?e.removeAttribute("value"):m!=null&&(m!==e[u]||g=="progress"&&!m||g=="option"&&m!=x[u])&&Ie(e,u,m,x[u],r),u="checked",k!=null&&k!=e[u]&&Ie(e,u,k,x[u],r))}return e}function bt(e,t,n){try{if(typeof e=="function"){var a=typeof e.__u=="function";a&&e.__u(),a&&t==null||(e.__u=e(t))}else e.current=t}catch(r){N.__e(r,n)}}function an(e,t,n){var a,r;if(N.unmount&&N.unmount(e),(a=e.ref)&&(a.current&&a.current!=e.__e||bt(a,null,t)),(a=e.__c)!=null){if(a.componentWillUnmount)try{a.componentWillUnmount()}catch(s){N.__e(s,t)}a.base=a.__P=a.__n=null}if(a=e.__k)for(r=0;r<a.length;r++)a[r]&&an(a[r],t,n||typeof e.type!="function");n||ft(e.__e),e.__c=e.__=e.__e=void 0}function Fa(e,t,n){return this.constructor(e,n)}function sn(e,t,n){var a,r,s,i;t==document&&(t=document.documentElement),N.__&&N.__(e,t),r=(a=typeof n=="function")?null:n&&n.__k||t.__k,s=[],i=[],_t(t,e=(!a&&n||t).__k=ht(qe,null,[e]),r||ze,ze,t.namespaceURI,!a&&n?[n]:r?null:t.firstChild?Ve.call(t.childNodes):null,s,!a&&n?n:r?r.__e:t.firstChild,a,i),tn(s,e,i),e.props.children=null}Ve=Be.slice,N={__e:function(e,t,n,a){for(var r,s,i;t=t.__;)if((r=t.__c)&&!r.__)try{if((s=r.constructor)&&s.getDerivedStateFromError!=null&&(r.setState(s.getDerivedStateFromError(e)),i=r.__d),r.componentDidCatch!=null&&(r.componentDidCatch(e,a||{}),i=r.__d),i)return r.__E=r}catch(c){e=c}throw e}},Wt=0,Ra=function(e){return e!=null&&e.constructor===void 0},Fe.prototype.setState=function(e,t){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=ue({},this.state),typeof e=="function"&&(e=e(ue({},n),this.props)),e&&ue(n,e),e!=null&&this.__v&&(t&&this._sb.push(t),qt(this))},Fe.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),qt(this))},Fe.prototype.render=qe,fe=[],jt=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,Zt=function(e,t){return e.__v.__b-t.__v.__b},Oe.__r=0,ut=Math.random().toString(8),Ae="__d"+ut,Pe="__a"+ut,Jt=/(PointerCapture)$|Capture$/i,mt=0,dt=Kt(!1),pt=Kt(!0),Da=0;var Ee,B,vt,rn,Ge=0,hn=[],V=N,on=V.__b,ln=V.__r,cn=V.diffed,un=V.__c,dn=V.unmount,pn=V.__;function gt(e,t){V.__h&&V.__h(B,e,Ge||t),Ge=0;var n=B.__H||(B.__H={__:[],__h:[]});return e>=n.__.length&&n.__.push({}),n.__[e]}function _(e){return Ge=1,za(vn,e)}function za(e,t,n){var a=gt(Ee++,2);if(a.t=e,!a.__c&&(a.__=[n?n(t):vn(void 0,t),function(c){var d=a.__N?a.__N[0]:a.__[0],u=a.t(d,c);d!==u&&(a.__N=[u,a.__[1]],a.__c.setState({}))}],a.__c=B,!B.__f)){var r=function(c,d,u){if(!a.__c.__H)return!0;var p=!1,b=a.__c.props!==c;if(a.__c.__H.__.some(function(f){if(f.__N){p=!0;var m=f.__[0];f.__=f.__N,f.__N=void 0,m!==f.__[0]&&(b=!0)}}),s){var l=s.call(this,c,d,u);return p?l||b:l}return!p||b};B.__f=!0;var s=B.shouldComponentUpdate,i=B.componentWillUpdate;B.componentWillUpdate=function(c,d,u){if(this.__e){var p=s;s=void 0,r(c,d,u),s=p}i&&i.call(this,c,d,u)},B.shouldComponentUpdate=r}return a.__N||a.__}function S(e,t){var n=gt(Ee++,3);!V.__s&&bn(n.__H,t)&&(n.__=e,n.u=t,B.__H.__h.push(n))}function z(e){return Ge=5,Ba(function(){return{current:e}},[])}function Ba(e,t){var n=gt(Ee++,7);return bn(n.__H,t)&&(n.__=e(),n.__H=t,n.__h=e),n.__}function mn(){for(var e;e=hn.shift();){var t=e.__H;if(e.__P&&t)try{t.__h.some($t),t.__h.some(_n),t.__h=[]}catch(n){t.__h=[],V.__e(n,e.__v)}}}V.__b=function(e){B=null,on&&on(e)},V.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),pn&&pn(e,t)},V.__r=function(e){ln&&ln(e),Ee=0;var t=(B=e.__c).__H;t&&(vt===B?(t.__h=[],B.__h=[],t.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(t.__h.length&&mn(),Ee=0)),vt=B},V.diffed=function(e){cn&&cn(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(hn.push(t)!==1&&rn===V.requestAnimationFrame||((rn=V.requestAnimationFrame)||Oa)(mn)),t.__H.__.some(function(n){n.u&&(n.__H=n.u,n.u=void 0)})),vt=B=null},V.__c=function(e,t){t.some(function(n){try{n.__h.some($t),n.__h=n.__h.filter(function(a){return!a.__||_n(a)})}catch(a){t.some(function(r){r.__h&&(r.__h=[])}),t=[],V.__e(a,n.__v)}}),un&&un(e,t)},V.unmount=function(e){dn&&dn(e);var t,n=e.__c;n&&n.__H&&(n.__H.__.some(function(a){try{$t(a)}catch(r){t=r}}),n.__H=void 0,t&&V.__e(t,n.__v))};var fn=typeof requestAnimationFrame=="function";function Oa(e){var t,n=function(){clearTimeout(a),fn&&cancelAnimationFrame(t),setTimeout(e)},a=setTimeout(n,35);fn&&(t=requestAnimationFrame(n))}function $t(e){var t=B,n=e.__c;typeof n=="function"&&(e.__c=void 0,n()),B=t}function _n(e){var t=B;e.__c=e.__(),B=t}function bn(e,t){return!e||e.length!==t.length||t.some(function(n,a){return n!==e[a]})}function vn(e,t){return typeof t=="function"?t(e):t}var gn=function(e,t,n,a){var r;t[0]=0;for(var s=1;s<t.length;s++){var i=t[s++],c=t[s]?(t[0]|=i?1:2,n[t[s++]]):t[++s];i===3?a[0]=c:i===4?a[1]=Object.assign(a[1]||{},c):i===5?(a[1]=a[1]||{})[t[++s]]=c:i===6?a[1][t[++s]]+=c+"":i?(r=e.apply(c,gn(e,c,n,["",null])),a.push(r),c[0]?t[0]|=2:(t[s-2]=0,t[s]=r)):a.push(c)}return a},$n=new Map;function yn(e){var t=$n.get(this);return t||(t=new Map,$n.set(this,t)),(t=gn(this,t.get(e)||(t.set(e,t=(function(n){for(var a,r,s=1,i="",c="",d=[0],u=function(l){s===1&&(l||(i=i.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?d.push(0,l,i):s===3&&(l||i)?(d.push(3,l,i),s=2):s===2&&i==="..."&&l?d.push(4,l,0):s===2&&i&&!l?d.push(5,0,!0,i):s>=5&&((i||!l&&s===5)&&(d.push(s,0,i,r),s=6),l&&(d.push(s,l,0,r),s=6)),i=""},p=0;p<n.length;p++){p&&(s===1&&u(),u(p));for(var b=0;b<n[p].length;b++)a=n[p][b],s===1?a==="<"?(u(),d=[d],s=3):i+=a:s===4?i==="--"&&a===">"?(s=1,i=""):i=a+i[0]:c?a===c?c="":i+=a:a==='"'||a==="'"?c=a:a===">"?(u(),s=1):s&&(a==="="?(s=5,r=i,i=""):a==="/"&&(s<5||n[p][b+1]===">")?(u(),s===3&&(d=d[0]),s=d,(d=d[0]).push(2,0,s),s=0):a===" "||a==="	"||a===`
`||a==="\r"?(u(),s=2):i+=a),s===3&&i==="!--"&&(s=4,d=d[0])}return u(),d})(e)),t),arguments,[])).length>1?t:t[0]}var o=yn.bind(ht);Q();function kn(e){let t=e,n=new Set;return{get:()=>t,set(a){t=a,n.forEach(r=>r(t))},update(a){this.set(a(t))},subscribe(a){return n.add(a),()=>n.delete(a)}}}function H(e){let[t,n]=_(e.get());return S(()=>e.subscribe(n),[e]),t}var A=kn({user:null,csrfToken:null,ready:!1}),We=kn([]),Va=0;function w(e,{actionLabel:t,onAction:n,timeoutMs:a=5e3}={}){let r=++Va;return We.update(s=>[...s,{id:r,message:e,actionLabel:t,onAction:n}]),a&&setTimeout(()=>je(r),a),r}function je(e){We.update(t=>t.filter(n=>n.id!==e))}function Ze(e){try{return decodeURIComponent(e)}catch{return e}}function Sn(e){let t=Number(e.get("page")||1);return{sort:e.get("sort")||"uploaded_at_desc",game:e.get("game")||"",q:e.get("q")||"",page:Number.isFinite(t)?Math.max(1,t):1}}var Ha=["login","resetPassword","public","publicLibrary","publicGame","publicUser","about","games"];function wt(e){return Ha.includes(e)}function xn(e,t){return!t&&!wt(e)}var qa={publicLibrary:"feed",publicGame:"feed",games:"games",library:"library",clip:"library",admin:"admin",profile:"profile"};function kt(e){return qa[e?.name]||""}function Cn(e){return e?.name==="publicLibrary"&&e.surface==="search"?"search":kt(e)}function Je(e,t){let n=new URLSearchParams(t||""),a=e;return a.startsWith("/c/")?{name:"public",shareId:Ze(a.slice(3))}:a==="/"||a==="/public"||a==="/search"?{name:"publicLibrary",query:Sn(n),surface:a==="/search"?"search":"feed"}:a.startsWith("/game/")?{name:"publicGame",game:Ze(a.slice(6)),query:Sn(n)}:a==="/about"?{name:"about"}:a==="/games"?{name:"games"}:a.startsWith("/u/")?{name:"publicUser",username:Ze(a.slice(3))}:a==="/library"?{name:"library"}:a.startsWith("/clip/")?{name:"clip",clipId:Ze(a.slice(6))}:a==="/admin"?{name:"admin",tab:n.get("tab")||"overview"}:a==="/account"?{name:"account"}:a==="/profile"?{name:"profile"}:a==="/login"?{name:"login"}:a==="/reset-password"?{name:"resetPassword",token:n.get("token")||"",invite:n.get("invite")==="1"}:{name:"publicLibrary"}}function Tn(e){return Je(e.pathname,e.search).name}var St=new Set;function G(e){window.history.pushState({},"",e),Mn()}function Mn(){let{pathname:e,search:t}=window.location,n=Je(e,t);St.forEach(a=>a(n))}window.addEventListener("popstate",Mn);function Pn(){let[e,t]=_(()=>Je(window.location.pathname,window.location.search));return S(()=>(St.add(t),()=>St.delete(t)),[]),e}function En(e){let t=e.target.closest("a[href^='/']");!t||t.target||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||(e.preventDefault(),G(t.getAttribute("href")))}var Rn={alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',clipboard:'<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',copy:'<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',external:'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',fastForward:'<path d="m13 19 9-7-9-7v14Z"/><path d="m2 19 9-7-9-7v14Z"/>',film:'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 8h4"/><path d="M3 16h4"/><path d="M17 8h4"/><path d="M17 16h4"/>',fullscreen:'<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/><path d="M12 2a15.3 15.3 0 0 0 0 20"/>',home:'<path d="m3 10 9-7 9 7"/><path d="M5 8.5V20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5"/><path d="M9 22V12h6v10"/>',info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',library:'<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',lock:'<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',logOut:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',menu:'<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',message:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>',notepad:'<path d="M8 2v4"/><path d="M16 2v4"/><path d="M3 10h18"/><path d="M6 4h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/><path d="M8 14h8"/><path d="M8 18h5"/>',pause:'<path d="M8 5v14"/><path d="M16 5v14"/>',play:'<path d="m8 5 11 7-11 7V5Z"/>',plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',check:'<path d="M20 6 9 17l-5-5"/>',refresh:'<path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/><path d="M3 12A9 9 0 0 1 18.5 5.7L21 8"/><path d="M21 3v5h-5"/>',rewind:'<path d="m11 19-9-7 9-7v14Z"/><path d="m22 19-9-7 9-7v14Z"/>',save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',server:'<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',skipBack:'<path d="M19 20 9 12l10-8v16Z"/><path d="M5 19V5"/>',skipForward:'<path d="m5 4 10 8-10 8V4Z"/><path d="M19 5v14"/>',shield:'<path d="M20 13c0 5-3.5 7.5-7.7 8.8a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V5l8-3 8 3v8Z"/>',sliders:'<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>',theater:'<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M6 9h12"/><path d="M6 15h12"/>',trash:'<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',volume2:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9 9 0 0 1 0 14"/>',volumeX:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>',x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'};function M(e,{size:t=18}={}){return o`<svg viewBox="0 0 24 24" width=${t} height=${t} fill="none"
    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" dangerouslySetInnerHTML=${{__html:Rn[e]||""}} />`}function xt(e){if(!e||typeof e!="string")return"";if(e.startsWith("/"))return e;try{let t=new URL(e,window.location.origin);if(t.origin===window.location.origin)return`${t.pathname}${t.search}`}catch{return""}return""}function Ga(e){let t=xt(e?.avatar_url);if(!t)return"";let n=e.updated_at||"";if(!n)return t;let a=t.includes("?")?"&":"?";return`${t}${a}v=${encodeURIComponent(n)}`}function Ka(e){return(e||"C").trim().slice(0,1).toUpperCase()||"C"}function xe({user:e,size:t=40,className:n=""}){let a=Ga(e),r=`width:${t}px;height:${t}px;font-size:${Math.round(t*.4)}px`;if(a)return o`<img class=${`user-avatar ${n}`} style=${r} src=${a} alt="" />`;let s=e?.display_name||e?.username;return o`<div class=${`user-avatar user-avatar-fallback ${n}`} style=${r} aria-hidden="true">
    ${Ka(s)}
  </div>`}function Wa(e){return e?.query?.q||""}function ja(e,t){let n=new URLSearchParams,a=String(t||"").trim(),r=e?.name==="publicGame"?e.game:e?.query?.game||"";a&&n.set("q",a),r&&n.set("game",r);let s=n.toString();return s?`/search?${s}`:"/search"}function Dn({active:e,route:t}){let{user:n}=H(A),[a,r]=_(!1),s=z(null),i=Wa(t),[c,d]=_(i);S(()=>{d(i)},[i]);let u=n?.role==="admin"||n?.role==="owner";S(()=>{if(!a)return;let l=m=>{s.current?.contains(m.target)||r(!1)},f=m=>{m.key==="Escape"&&r(!1)};return document.addEventListener("pointerdown",l),document.addEventListener("keydown",f),()=>{document.removeEventListener("pointerdown",l),document.removeEventListener("keydown",f)}},[a]);let p=[["feed","/","Feed"],["library","/library","Library",!!n],["games","/games","Games"],["admin","/admin","Admin",u]].filter(([,,,l])=>l!==!1),b=l=>{l.preventDefault();let f=new FormData(l.target).get("q")?.toString()||"";G(ja(t,f))};return o`<header class="topbar">
    <a class="wordmark" href="/" aria-label="Clipline home">
      <img src="/clipline-icon.svg" alt="" width="24" height="24" />
      <span class="wordmark-text">CLIP<span class="wordmark-accent">LINE</span></span>
    </a>
    <nav class="topnav" aria-label="Primary">
      ${p.map(([l,f,m])=>o`
        <a class=${l===e?"topnav-on":""} href=${f}>${m}</a>`)}
    </nav>
    <form class="topsearch" role="search" onSubmit=${b}>
      <input class="input" name="q" value=${c} onInput=${l=>d(l.target.value)}
        placeholder="Search clips, games, players…" aria-label="Search" />
    </form>
    ${n?o`<div class="avatar-wrap" ref=${s}>
          <button class="avatar-btn" aria-haspopup="menu" aria-expanded=${a}
            onClick=${()=>r(!a)}>
            <${xe} user=${n} size=${28} />
          </button>
          ${a&&o`<div class="menu" role="menu" onClick=${()=>r(!1)}>
            <a role="menuitem" href="/profile">Profile</a>
            <a role="menuitem" href="/account">Account</a>
            ${u&&o`<a role="menuitem" href="/admin">Admin</a>`}
            <button role="menuitem" class="menu-danger" onClick=${Za}>Sign out</button>
          </div>`}
        </div>`:o`<a class="btn" href="/login">${M("lock",{size:14})} Sign in</a>`}
  </header>`}async function Za(){let{api:e,setCsrfToken:t}=await Promise.resolve().then(()=>(Q(),wn));try{await e("/api/v1/auth/logout",{method:"POST"})}catch{}t(null),A.set({user:null,csrfToken:null,ready:!0}),G("/login")}var Ja=[["feed","/","home","Feed",!0],["games","/games","globe","Games",!0],["library","/library","library","Library","auth"],["search","/search","search","Search",!0],["profile","/profile","user","Profile","auth"]];function Ya(e){return Ja.filter(([,,,,t])=>t!=="auth"||!!e)}function Un({active:e}){let{user:t}=H(A),n=Ya(t);return o`<nav class="tabbar" aria-label="Primary">
    ${n.map(([a,r,s,i])=>o`
      <a class=${a===e?"tab-on":""} href=${r}>${M(s)}<span>${i}</span></a>`)}
  </nav>`}function Ln(){let e=H(We);return o`<div class="toasts" role="status" aria-live="polite">
    ${e.map(t=>o`<div class="toast" key=${t.id}>
      <span>${t.message}</span>
      ${t.actionLabel&&o`<button class="toast-action"
        onClick=${()=>{t.onAction?.(),je(t.id)}}>${t.actionLabel}</button>`}
      <button class="toast-x" aria-label="Dismiss" onClick=${()=>je(t.id)}>✕</button>
    </div>`)}
  </div>`}Q();function K(e){if(!e)return"Unknown";let t=new Date(e);return Number.isNaN(t.getTime())?"Unknown":new Intl.DateTimeFormat(void 0,{dateStyle:"medium",timeStyle:"short"}).format(t)}function _e(e){if(e==null)return"Unknown";let t=Math.max(0,Math.round(Number(e)/1e3)),n=Math.floor(t/60),a=t%60;return`${n}:${String(a).padStart(2,"0")}`}function Ye(e){if(!e)return"Unknown";let t=new Date(e);if(Number.isNaN(t.getTime()))return"Unknown";let n=Math.min(0,t.getTime()-Date.now()),a=[["year",365*24*60*60*1e3],["month",720*60*60*1e3],["week",10080*60*1e3],["day",1440*60*1e3],["hour",3600*1e3],["minute",60*1e3],["second",1e3]],[r,s]=a.find(([,c])=>Math.abs(n)>=c)||a[a.length-1],i=Math.round(n/s);return new Intl.RelativeTimeFormat(void 0,{numeric:"always"}).format(i,r)}function q(e){if(e==null)return"Unknown";let t=Number(e);if(!Number.isFinite(t))return"Unknown";let n=["B","KiB","MiB","GiB","TiB"],a=t,r=0;for(;a>=1024&&r<n.length-1;)a/=1024,r+=1;return`${a.toFixed(r===0?0:1)} ${n[r]}`}function ye(e){let t=Number(e||0),n=Number.isFinite(t)&&t>0?Math.floor(t):0;return`${new Intl.NumberFormat(void 0,{notation:n>=1e4?"compact":"standard"}).format(n)} view${n===1?"":"s"}`}function ie(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/thumbnail`}function Ct(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/thumbnail`}function Xe(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/media`}function In(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/poster`}function An(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/poster`}function Ce(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/media`}function Re(e,t,n){if(e)try{return`${t}${new URL(e).pathname}`}catch{}return n?`${t}/c/${encodeURIComponent(n)}`:null}var Qe=null;function Nn(e){Qe?.(),Qe=e}function Fn(e){Qe===e&&(Qe=null)}var Xa=()=>window.matchMedia("(pointer: fine)").matches&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches&&!navigator.connection?.saveData;function zn({src:e,poster:t,alt:n=""}){let[a,r]=_(!1),[s,i]=_(0),c=z(null),d=z(null),u=z(!0),p=z(),b=()=>{u.current&&(clearTimeout(c.current),r(!1),i(0))};p.current=b;let l=()=>{!e||!Xa()||(c.current=setTimeout(()=>{u.current&&(Nn(p.current),r(!0))},300))},f=m=>{let k=m.target;k.duration&&i(k.currentTime/k.duration)};return S(()=>()=>{u.current=!1,clearTimeout(c.current),Fn(p.current)},[]),o`<span class="hover-preview" onPointerEnter=${l} onPointerLeave=${b}>
    ${a?o`<video ref=${d} src=${e} poster=${t} muted loop autoplay
          playsinline preload="none" onTimeUpdate=${f} />`:o`<img src=${t} alt=${n} loading="lazy" />`}
    ${a&&o`<span class="preview-scrub"><span style=${`width:${s*100}%`} /></span>`}
  </span>`}function Tt(e){return e.owner?.display_name||e.owner?.username||e.owner_username||e.author_name||e.author_username||null}function Te({clip:e,href:t,selectable:n=!1,selected:a=!1,onToggleSelect:r,showVisibility:s=!1,showAuthor:i=!1}){let c=Tt(e),d=[e.game_name&&o`<em>${e.game_name}</em>`,i&&c,e.view_count!=null&&ye(e.view_count),e.uploaded_at&&Ye(e.uploaded_at)].filter(Boolean);return o`<article class=${`clip-card ${a?"is-selected":""} ${n?"is-selectable":""}`}>
    <a class="card-thumb" href=${t} tabindex="-1" aria-hidden="true">
      <${zn} src=${e.media_url} poster=${e.thumbnail_url} />
      ${e.duration_ms!=null&&o`<span class="dur-pill">${_e(e.duration_ms)}</span>`}
      ${s&&o`<span class=${`badge badge-${e.visibility} card-vis`}>${e.visibility}</span>`}
    </a>
    ${n&&o`<label class="card-check">
      <input type="checkbox" checked=${a} aria-label=${`Select ${e.title}`}
        onChange=${()=>r?.(e.id)} />
    </label>`}
    <h3 class="card-title"><a href=${t}>${e.title}</a></h3>
    <p class="card-meta">${d.map((u,p)=>o`${p>0&&" \xB7 "}${u}`)}</p>
  </article>`}function W({name:e="film",title:t,body:n,action:a}){return o`<div class="empty">
    <div class="empty-icon">${M(e,{size:28})}</div>
    <h3>${t}</h3>
    ${n&&o`<p>${n}</p>`}
    ${a}
  </div>`}var Qa=[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]],es=6,ts=60;function ns(e){let t=new URLSearchParams;return t.set("page_size",String(ts)),e.sort!=="uploaded_at_desc"&&t.set("sort",e.sort),e.game&&t.set("game",e.game),e.q&&t.set("q",e.q),Number(e.page)>1&&t.set("page",String(e.page)),t}function Bn(e){return e?.game_name||"No game"}function as(e,t,n=es){let a=[...e||[]].sort((b,l)=>(l.clip_count||0)-(b.clip_count||0)),r=a.slice(0,n),s=String(t||"").trim(),i=s&&r.some(b=>b.game===s),c=s&&!i?a.find(b=>b.game===s)||{game:s,clip_count:0}:null,d=c?[c,...r]:r,u=new Set(d.map(b=>b.game)),p=a.filter(b=>!u.has(b.game)).length;return{chips:d,extraGameCount:p}}function et({route:e}){let t={sort:"uploaded_at_desc",page:1,q:"",...e.query,game:e.name==="publicGame"?e.game:e.query?.game||""},[n,a]=_(null),[r,s]=_([]),[i,c]=_(null);S(()=>{let m=!0;a(null),c(null);let k=ns(t);return y(`/api/v1/public/clips?${k}`).then(x=>m&&a(x)).catch(x=>m&&c(x)),()=>{m=!1}},[e.name,t.sort,t.game,t.q,t.page]),S(()=>{let m=!0;return y("/api/v1/public/games").then(k=>m&&s(k.games||[])).catch(()=>{}),()=>{m=!1}},[]);let d=m=>G(os({...t,page:1,...m}));if(i)return o`<main class="page">
      <${W} name="alert" title="Couldn't load the feed" body=${i.message} />
    </main>`;let u=n?.clips,p=!!(t.game||t.q)||Number(t.page)>1,b=!p,{chips:l,extraGameCount:f}=as(r,t.game);return o`<main class="page">
    ${u==null?o`<${rs} />`:u.length===0?o`<${W} name="film"
          title=${p?"No clips match this filter":"No public clips yet"}
          body=${p?"Try a different game, search, or clear your filters.":"Clips shared as public from a library will show up here."}
          action=${p&&o`<a class="btn" href="/">Clear filters</a>`} />`:o`
        ${b?ss(u):""}
        <div class="feed-toolbar">
          <h2>Latest uploads</h2>
          <select class="input" value=${t.sort} onChange=${m=>d({sort:m.target.value})}>
            ${Qa.map(([m,k])=>o`<option value=${m}>${k}</option>`)}
          </select>
          <div class="chips">
            <button class=${`chip ${t.game?"":"chip-on"}`} onClick=${()=>d({game:""})}>All</button>
            ${l.map(m=>o`<button
              class=${`chip ${t.game===m.game?"chip-on":""}`}
              onClick=${()=>d({game:m.game})}>${m.game}</button>`)}
            ${f>0&&o`<a class="chip" href="/games">+${f}</a>`}
          </div>
        </div>
        <div class="card-grid">
          ${(b?u.slice(4):u).map(m=>o`<${Te} clip=${{...m,thumbnail_url:ie(m),media_url:Ce(m)}}
              href=${Mt(m)} showAuthor />`)}
        </div>
        ${is(n,t,d)}
      `}
  </main>`}function ss(e){let[t,...n]=e,a=n.slice(0,3);return o`<p class="kicker">Now playing on this server</p>
    <section class="hero">
      <a class="hero-main" href=${Mt(t)}>
        <img src=${ie(t)} alt="" loading="lazy" />
        <span class="hero-caption">▶ ${t.title} — ${Bn(t)} · ${_e(t.duration_ms)}</span>
      </a>
      <div class="hero-side">
        ${a.map(r=>o`<a class="hero-row" href=${Mt(r)}>
            <img src=${ie(r)} alt="" loading="lazy" />
            <span><b>${r.title}</b>
              <small>${Tt(r)} · ${Bn(r)} · ${ye(r.view_count)}</small></span>
          </a>`)}
      </div>
    </section>`}function rs({count:e=8}){return o`<div class="card-grid">
    ${Array.from({length:e},(t,n)=>o`<div class="clip-card" key=${n}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`}function Mt(e){return`/c/${encodeURIComponent(e.share_id)}`}function os({sort:e="uploaded_at_desc",game:t="",q:n="",page:a=1}={}){let r=new URLSearchParams,s=e||"uploaded_at_desc",i=String(t||"").trim(),c=String(n||"").trim(),d=Math.max(1,Number(a||1));if(s!=="uploaded_at_desc"&&r.set("sort",s),d>1&&r.set("page",String(d)),c)return r.set("q",c),i&&r.set("game",i),`/search?${r.toString()}`;if(i){let p=r.toString();return`/game/${encodeURIComponent(i)}${p?`?${p}`:""}`}let u=r.toString();return u?`/search?${u}`:"/"}function is(e,t,n){let a=Math.max(1,Number(t.page||1)),r=!!e?.has_more;return a<=1&&!r?"":o`<nav class="pager" aria-label="Public clip pages">
    <button class="btn" type="button" disabled=${a<=1}
      onClick=${()=>n({page:a-1})}>Previous</button>
    <span class="muted">Page ${a}</span>
    <button class="btn" type="button" disabled=${!r}
      onClick=${()=>n({page:a+1})}>Next</button>
  </nav>`}Q();function On(){let[e,t]=_(null),[n,a]=_(null);return S(()=>{let r=!0;return y("/api/v1/public/games").then(s=>r&&t(s.games||[])).catch(s=>r&&a(s)),()=>{r=!1}},[]),n?o`<main class="page">
      <${W} name="alert" title="Couldn't load games" body=${n.message} />
    </main>`:o`<main class="page">
    <p class="kicker">Browse by game</p>
    ${e==null?o`<div class="game-grid">
          ${Array.from({length:6},(r,s)=>o`<div class="game-tile is-loading" key=${s}>
            <div class="skeleton-thumb"></div>
          </div>`)}
        </div>`:e.length===0?o`<${W} name="film" title="No games yet"
          body="Once clips are shared as public, their games will show up here." />`:o`<div class="game-grid">
          ${e.map(r=>o`<a class="game-tile" href=${`/game/${encodeURIComponent(r.game)}`}>
            ${r.thumbnail_url?o`<img src=${r.thumbnail_url} alt="" loading="lazy" />`:o`<div class="game-tile-fallback">${(r.game||"?")[0].toUpperCase()}</div>`}
            <div class="game-tile-body">
              <b>${r.game}</b>
              <small>${r.clip_count} clip${r.clip_count===1?"":"s"}</small>
            </div>
          </a>`)}
        </div>`}
  </main>`}Q();function Vn({trigger:e,content:t,onClose:n,label:a,panelClass:r=""}){let[s,i]=_(!1),c=z(null),d=z(null),u=z(null),p=()=>{i(!1),n?.()},b=()=>{if(s){p();return}u.current=document.activeElement,i(!0)};return S(()=>{if(!s)return;let l=k=>{c.current?.contains(k.target)||p()},f=k=>{k.key==="Escape"&&p()};return document.addEventListener("pointerdown",l),document.addEventListener("keydown",f),d.current?.querySelector("input, select, textarea, button, a[href], [tabindex]")?.focus(),()=>{document.removeEventListener("pointerdown",l),document.removeEventListener("keydown",f),u.current?.focus?.()}},[s]),o`<div class="popover-wrap" ref=${c}>
    ${e({open:s,toggle:b})}
    ${s&&o`<div class=${`popover ${r}`} ref=${d} role="dialog" aria-label=${a||"Filters"}>
      ${t}
    </div>`}
  </div>`}function Hn({count:e,busy:t=!1,onPublic:n,onPrivate:a,onCopyLinks:r,onDelete:s,onClear:i}){return e?o`<div class="bulkbar" role="toolbar" aria-label="Bulk actions" aria-busy=${t?"true":"false"}>
    <b>${e} selected</b>
    <button class="btn" disabled=${t} onClick=${n}>Make public</button>
    <button class="btn" disabled=${t} onClick=${a}>Make private</button>
    <button class="btn" disabled=${t} onClick=${r}>Copy links</button>
    <button class="btn btn-danger" disabled=${t} onClick=${s}>Delete</button>
    <button class="btn bulk-x" disabled=${t} aria-label="Clear selection" onClick=${i}>✕</button>
  </div>`:null}function le({open:e,title:t,body:n,confirmLabel:a="Confirm",onConfirm:r,onCancel:s,danger:i=!1,confirmDisabled:c=!1}){let d=z(null),u=z(null);return S(()=>{let p=d.current;p&&(e&&!p.open?(p.showModal(),u.current?.focus()):!e&&p.open&&p.close())},[e]),o`<dialog ref=${d} class="confirm-dialog" aria-labelledby="confirm-dialog-title"
    onCancel=${p=>{p.preventDefault(),s?.()}}
    onClose=${()=>e&&s?.()}>
    ${e&&o`<div class="confirm-dialog-body">
      <h2 id="confirm-dialog-title">${t}</h2>
      ${n&&o`<p>${n}</p>`}
      <div class="confirm-dialog-actions">
        <button type="button" class="btn" onClick=${s}>Cancel</button>
        <button type="button" ref=${u} class=${`btn ${i?"btn-danger":"btn-primary"}`}
          disabled=${c} onClick=${r}>${a}</button>
      </div>
    </div>`}
  </dialog>`}var Kn="clipline.libraryView",ls=[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["updated_at_desc","Updated newest"],["updated_at_asc","Updated oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["size_desc","Size largest"],["size_asc","Size smallest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]],tt={title:["title_asc","title_desc"],size:["size_asc","size_desc"],duration:["duration_asc","duration_desc"],uploaded:["uploaded_at_asc","uploaded_at_desc"]},cs=["visibility","status","source_type","from","to","min_duration_seconds","max_duration_seconds","min_size_mib","max_size_mib"],st={sort:"uploaded_at_desc",game:"",source_type:"",visibility:"",status:"",q:"",from:"",to:"",min_duration_seconds:"",max_duration_seconds:"",min_size_mib:"",max_size_mib:""};function nt(e){if(e===""||e==null)return null;let t=Number(e);return Number.isFinite(t)?t:null}function us(e){let t=new URLSearchParams;t.set("sort",e.sort||st.sort),t.set("page_size","100");for(let i of["game","source_type","visibility","status","q"])e[i]&&t.set(i,e[i]);e.from&&t.set("from",`${e.from}T00:00:00Z`),e.to&&t.set("to",`${e.to}T23:59:59Z`);let n=nt(e.min_duration_seconds);n!=null&&t.set("min_duration_ms",String(Math.round(n*1e3)));let a=nt(e.max_duration_seconds);a!=null&&t.set("max_duration_ms",String(Math.round(a*1e3)));let r=nt(e.min_size_mib);r!=null&&t.set("min_size_bytes",String(Math.round(r*1024*1024)));let s=nt(e.max_size_mib);return s!=null&&t.set("max_size_bytes",String(Math.round(s*1024*1024))),t}function ds(e){return cs.reduce((t,n)=>t+(e[n]?1:0),0)}function ps(e,t=6){let n=new Map;for(let a of e){let r=a.game_name;r&&n.set(r,(n.get(r)||0)+1)}return Array.from(n,([a,r])=>({game:a,count:r})).sort((a,r)=>r.count-a.count||a.game.localeCompare(r.game)).slice(0,t)}function qn(e,t,{verb:n,allFailedMessage:a}){let r=e.filter(i=>!t.some(c=>c.id===i));if(!t.length)return{succeeded:r,message:null};let s=t.length===e.length?t[0]?.message||a:`Couldn't ${n} ${t.length} of ${e.length} clips.`;return{succeeded:r,message:s}}function ms(e,t){return(e||[]).map(n=>Re(n.public_url,t,n.public_share_id)).filter(Boolean)}async function Gn(e,t,n){let a=0;async function r(){let s=a++;if(!(s>=e.length))return await n(e[s]),r()}await Promise.all(Array.from({length:Math.min(t,e.length)},r))}function fs(){try{return localStorage.getItem(Kn)==="rows"?"rows":"grid"}catch{return"grid"}}function Wn(){let[e,t]=_(fs),[n,a]=_(st),[r,s]=_(st.q),[i,c]=_(null),[d,u]=_(null),[p,b]=_(new Set),[l,f]=_(!1),[m,k]=_(!1),[x,C]=_(0),g=z(!1),R=z(null);S(()=>()=>clearTimeout(R.current),[]),S(()=>{let $=!0;return c(null),u(null),y(`/api/v1/clips?${us(n)}`).then(T=>{$&&(c(T),b(new Set))}).catch(T=>$&&u(T)),()=>{$=!1}},[JSON.stringify(n),x]);let j=$=>{t($);try{localStorage.setItem(Kn,$)}catch{}},J=()=>C($=>$+1),Z=$=>{g.current=$,f($)},se=$=>{let T=$.target.value;s(T),clearTimeout(R.current),R.current=setTimeout(()=>{a(v=>({...v,q:T}))},300)},O=$=>T=>{let v=T.target.value;a(P=>({...P,[$]:v}))},te=()=>{a($=>({...$,visibility:"",status:"",source_type:"",from:"",to:"",min_duration_seconds:"",max_duration_seconds:"",min_size_mib:"",max_size_mib:""}))},L=$=>a(T=>({...T,game:T.game===$?"":$})),Y=$=>a(T=>({...T,sort:$})),we=$=>{b(T=>{let v=new Set(T);return v.has($)?v.delete($):v.add($),v})};function ne($,T){c(v=>v&&{...v,clips:v.clips.map(P=>P.id===$?{...P,...T}:P)})}function be($,T){let v=new Set($);c(P=>P&&{...P,clips:P.clips.map(I=>v.has(I.id)?{...I,...T}:I)})}async function ve($){if(g.current)return;let T=Array.from(p);if(!T.length)return;let v=i?.clips||[],P=new Map(T.map(U=>[U,v.find(ae=>ae.id===U)]));Z(!0),be(T,{visibility:$});let I=[],D=new Map;try{await Gn(T,4,async h=>{try{let E=await y(`/api/v1/clips/${encodeURIComponent(h)}/visibility`,{method:"POST",body:{visibility:$}}),F={visibility:E.visibility,public_url:E.public_url,public_share_id:E.public_share_id};ne(h,F),D.set(h,F)}catch(E){I.push({id:h,message:E.message})}});let{succeeded:U,message:ae}=qn(T,I,{verb:"update",allFailedMessage:"Couldn't update visibility."});if(ae){for(let{id:h}of I){let E=P.get(h);E&&ne(h,{visibility:E.visibility,public_url:E.public_url,public_share_id:E.public_share_id})}w(ae)}U.length&&(b(new Set),w(`Made ${U.length} clip${U.length===1?"":"s"} ${$}`,{actionLabel:"Undo",onAction:()=>pe(U,P,D)}))}finally{Z(!1)}}async function pe($,T,v){if(g.current){w("Wait for visibility changes to finish.");return}Z(!0);try{for(let D of $){let U=T.get(D);U&&ne(D,{visibility:U.visibility,public_url:U.public_url,public_share_id:U.public_share_id})}let P=[];await Gn($,4,async D=>{let U=T.get(D);if(U)try{let ae=await y(`/api/v1/clips/${encodeURIComponent(D)}/visibility`,{method:"POST",body:{visibility:U.visibility}});ne(D,{visibility:ae.visibility,public_url:ae.public_url,public_share_id:ae.public_share_id})}catch(ae){P.push({id:D,message:ae.message})}});let{message:I}=qn($,P,{verb:"undo",allFailedMessage:"Couldn't undo visibility change."});if(I){for(let{id:D}of P){let U=v.get(D);U&&ne(D,U)}w(I)}}finally{Z(!1)}}async function ce(){if(g.current){w("Wait for visibility changes to finish.");return}let $=Array.from(p),T=i?.clips||[],v=$.map(D=>T.find(U=>U.id===D)).filter(Boolean),P=ms(v,window.location.origin),I=v.length-P.length;if(!P.length){w("No links to copy \u2014 selected clips are private.");return}try{await navigator.clipboard.writeText(P.join(`
`)),w(`Copied ${P.length} link${P.length===1?"":"s"}`+(I?` (${I} skipped, private)`:""))}catch{w("Couldn't copy links to clipboard.")}}async function me(){let $=Array.from(p);k(!1);try{let T=await y("/api/v1/clips/bulk-delete",{method:"POST",body:{ids:$}});b(new Set),J(),w(`Deleted ${T.affected} clip${T.affected===1?"":"s"}.`)}catch(T){w(T.message)}}if(d)return o`<main class="page">
      <${W} name="alert" title="Couldn't load your library" body=${d.message} />
    </main>`;let X=i?.clips,re=ds(n),oe=!!(n.q||n.game)||re>0,$e=ps(X||[]),ge=(X||[]).reduce(($,T)=>$+(T.file_size_bytes||0),0),ke=o`<div class="popover-fields">
    <label class="field"><span>Visibility</span>
      <select class="input" value=${n.visibility} onChange=${O("visibility")}>
        <option value="">Any</option>
        <option value="private">Private</option>
        <option value="public">Public</option>
        <option value="unlisted">Unlisted</option>
      </select>
    </label>
    <label class="field"><span>Status</span>
      <select class="input" value=${n.status} onChange=${O("status")}>
        <option value="">Any</option>
        <option value="created">Created</option>
        <option value="uploading">Uploading</option>
        <option value="processing">Processing</option>
        <option value="ready">Ready</option>
        <option value="failed">Failed</option>
      </select>
    </label>
    <label class="field"><span>Source</span>
      <input class="input" type="text" value=${n.source_type} onInput=${O("source_type")} placeholder="Source type" />
    </label>
    <label class="field"><span>From</span>
      <input class="input" type="date" value=${n.from} onInput=${O("from")} />
    </label>
    <label class="field"><span>To</span>
      <input class="input" type="date" value=${n.to} onInput=${O("to")} />
    </label>
    <label class="field"><span>Min duration (s)</span>
      <input class="input" type="number" min="0" value=${n.min_duration_seconds} onInput=${O("min_duration_seconds")} />
    </label>
    <label class="field"><span>Max duration (s)</span>
      <input class="input" type="number" min="0" value=${n.max_duration_seconds} onInput=${O("max_duration_seconds")} />
    </label>
    <label class="field"><span>Min size (MiB)</span>
      <input class="input" type="number" min="0" step="0.1" value=${n.min_size_mib} onInput=${O("min_size_mib")} />
    </label>
    <label class="field"><span>Max size (MiB)</span>
      <input class="input" type="number" min="0" step="0.1" value=${n.max_size_mib} onInput=${O("max_size_mib")} />
    </label>
    <div class="popover-actions">
      <button type="button" class="btn" onClick=${te}>Clear filters</button>
    </div>
  </div>`;return o`<main class="page">
    <div class="lib-header">
      <div>
        <h1>Library</h1>
        <p>${(X||[]).length} clip${(X||[]).length===1?"":"s"} · ${q(ge)} used</p>
      </div>
      <div class="seg" role="group" aria-label="View">
        <button type="button" class=${`seg-item ${e==="grid"?"seg-on":""}`}
          aria-pressed=${e==="grid"} onClick=${()=>j("grid")}>Grid</button>
        <button type="button" class=${`seg-item ${e==="rows"?"seg-on":""}`}
          aria-pressed=${e==="rows"} onClick=${()=>j("rows")}>Rows</button>
      </div>
    </div>

    <div class="lib-toolbar">
      <input class="input" type="search" aria-label="Search clips" placeholder="Search title or game"
        value=${r} onInput=${se} />
      <select class="input" aria-label="Sort" value=${n.sort} onChange=${$=>Y($.target.value)}>
        ${ls.map(([$,T])=>o`<option value=${$}>${T}</option>`)}
      </select>
      <${Vn}
        label="Filters"
        panelClass="popover-filters"
        trigger=${({open:$,toggle:T})=>o`<button type="button" class="btn" aria-haspopup="dialog"
          aria-expanded=${$} onClick=${T}>
          ${M("sliders",{size:14})} Filters
          ${re>0&&o`<span class="filter-badge">${re}</span>`}
        </button>`}
        content=${ke} />
    </div>

    ${$e.length>0&&o`<div class="lib-chips">
      <button type="button" class=${`chip ${n.game?"":"chip-on"}`} aria-pressed=${!n.game}
        onClick=${()=>L("")}>All</button>
      ${$e.map($=>o`<button type="button" class=${`chip ${n.game===$.game?"chip-on":""}`}
        aria-pressed=${n.game===$.game} onClick=${()=>L($.game)}>${$.game}</button>`)}
    </div>`}

    ${X==null?o`<${_s} />`:X.length===0?oe?o`<${W} name="film" title="No clips match this view"
            body="Try a different search, game, or clear your filters."
            action=${o`<button type="button" class="btn" onClick=${()=>{a(st),s("")}}>Clear filters</button>`} />`:o`<${W} name="upload" title="Connect the Clipline desktop app to start uploading"
            body="New clips uploaded from the desktop app will show up here."
            action=${o`<a class="btn" href="/about">Learn more</a>`} />`:e==="grid"?o`<div class=${`card-grid ${p.size>0?"selecting":""}`}>
          ${X.map($=>o`<${Te} key=${$.id}
            clip=${{...$,thumbnail_url:Ct($),media_url:Xe($)}}
            href=${`/clip/${encodeURIComponent($.id)}`}
            selectable selected=${p.has($.id)} onToggleSelect=${we} showVisibility />`)}
        </div>`:o`<${hs} clips=${X} query=${n} onSort=${Y}
          selected=${p} onToggleSelect=${we} />`}

    <${Hn} count=${p.size} busy=${l}
      onPublic=${()=>ve("public")}
      onPrivate=${()=>ve("private")}
      onCopyLinks=${ce}
      onDelete=${()=>k(!0)}
      onClear=${()=>b(new Set)} />

    <${le} open=${m}
      title=${`Delete ${p.size} clip${p.size===1?"":"s"}?`}
      body="Public links stop working immediately."
      confirmLabel="Delete" danger
      onConfirm=${me}
      onCancel=${()=>k(!1)} />
  </main>`}function at(e,[t,n]){let a=e.sort===t?"ascending":e.sort===n?"descending":"none",r=e.sort===n?t:n;return{ariaSort:a,next:r}}function hs({clips:e,query:t,onSort:n,selected:a,onToggleSelect:r}){let s=at(t,tt.title),i=at(t,tt.size),c=at(t,tt.duration),d=at(t,tt.uploaded);return o`<table class="lib-table">
    <thead>
      <tr>
        <th class="row-select-cell"></th>
        <th></th>
        <th aria-sort=${s.ariaSort}><button type="button" class="sort-btn" onClick=${()=>n(s.next)}>Title</button></th>
        <th>Game</th>
        <th>Visibility</th>
        <th aria-sort=${i.ariaSort}><button type="button" class="sort-btn" onClick=${()=>n(i.next)}>Size</button></th>
        <th aria-sort=${c.ariaSort}><button type="button" class="sort-btn" onClick=${()=>n(c.next)}>Duration</button></th>
        <th aria-sort=${d.ariaSort}><button type="button" class="sort-btn" onClick=${()=>n(d.next)}>Uploaded</button></th>
      </tr>
    </thead>
    <tbody>
      ${e.map(u=>o`<tr key=${u.id} class=${a?.has(u.id)?"is-selected":""}>
        <td class="row-select-cell">
          <input class="row-select" type="checkbox" checked=${a?.has(u.id)}
            aria-label=${`Select ${u.title}`} onChange=${()=>r?.(u.id)} />
        </td>
        <td><img class="row-thumb" src=${Ct(u)} alt="" width="64" height="36" loading="lazy" /></td>
        <td><a href=${`/clip/${encodeURIComponent(u.id)}`}>${u.title}</a></td>
        <td>${u.game_name||"\u2014"}</td>
        <td><span class=${`badge badge-${u.visibility}`}>${u.visibility}</span></td>
        <td>${q(u.file_size_bytes)}</td>
        <td>${_e(u.duration_ms)}</td>
        <td>${K(u.uploaded_at)}</td>
      </tr>`)}
    </tbody>
  </table>`}function _s({count:e=8}){return o`<div class="card-grid">
    ${Array.from({length:e},(t,n)=>o`<div class="clip-card" key=${n}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`}Q();var bs={ChampionKill:"kill",FirstBlood:"kill",Multikill:"spree",Ace:"spree",DragonKill:"objective",HeraldKill:"objective",BaronKill:"objective",TurretKilled:"structure",InhibKilled:"structure",FirstBrick:"structure"};function Zn(e){let t=Number(e);return Number.isFinite(t)&&t>0?t/1e3:0}function Jn(e,t){let n=Number.isFinite(e)?e:0,a=t>0?t:Number.MAX_SAFE_INTEGER;return Math.max(0,Math.min(a,n))}function rt(e,t){return t>0?Math.max(0,Math.min(100,e/t*100)):0}function Pt(e){if(!Number.isFinite(e))return"0:00";let t=Math.max(0,Math.round(e)),n=Math.floor(t/60),a=t-n*60;return`${n}:${String(a).padStart(2,"0")}`}function jn(e){if(!Number.isFinite(e))return"0:00.0";let t=Math.max(0,Math.round(e*10)),n=Math.floor(t/600),a=t-n*600,r=Math.floor(a/10);return`${n}:${String(r).padStart(2,"0")}.${a%10}`}function Yn(e,t){return`${jn(e)} / ${t>0?jn(t):"0:00.0"}`}function vs(e){return bs[e]||"info"}function Xn(e,t){return(e||[]).map((n,a)=>{let r=Number(n.timestamp_ms);if(!Number.isFinite(r))return null;let s=r/1e3;return s<0||t>0&&s>t?null:{index:a,time:s,kind:String(n.kind||"Marker"),label:String(n.label||n.kind||"Marker"),category:vs(n.kind)}}).filter(Boolean).sort((n,a)=>n.time-a.time)}function Qn(e,t){if(!e.length)return null;for(let n of e)if(n.time>t+.05)return n;return e[0]}function ea(e,t){if(!e.length)return null;for(let n=e.length-1;n>=0;n-=1)if(e[n].time<t-.05)return e[n];return e[e.length-1]}function ta(e,t){switch(e){case"Space":case"KeyK":return{kind:"toggle-play"};case"ArrowLeft":return{kind:"seek-by",seconds:t?-1:-5};case"ArrowRight":return{kind:"seek-by",seconds:t?1:5};case"KeyJ":return{kind:"seek-by",seconds:-10};case"KeyL":return{kind:"seek-by",seconds:10};case"Comma":return{kind:"seek-by",seconds:-.1};case"Period":return{kind:"seek-by",seconds:.1};case"KeyM":return{kind:t?"previous-marker":"next-marker"};case"Home":return{kind:"seek-to",seconds:0};case"End":return{kind:"seek-to-end"};case"KeyF":return{kind:"fullscreen"};case"KeyT":return{kind:"theater"};default:return null}}var aa="clipline.playerVolume",sa="clipline.clipTheaterMode",$s=2e3,gs=[.25,.5,.75,1,1.25,1.5,2];function ys(e,t){switch(e){case"KeyM":return{kind:"toggle-mute"};case"KeyF":return{kind:"theater"};case"Escape":return{kind:"exit-theater"};default:return ta(e,t)}}function ws(e){return e instanceof Element?!!e.closest("input, textarea, select, button, a, [contenteditable='true'], [contenteditable='']"):!1}function ks(){try{let e=window.localStorage.getItem(aa);if(e==null)return 1;let t=Number(e);return Number.isFinite(t)?Math.max(0,Math.min(1,t)):1}catch{return 1}}function na(e){try{window.localStorage.setItem(aa,String(Math.max(0,Math.min(1,e))))}catch{}}function Ss(){try{return window.localStorage.getItem(sa)==="true"}catch{return!1}}function xs(e){try{window.localStorage.setItem(sa,String(e))}catch{}}function ra({src:e,poster:t,durationMs:n,markers:a}){let r=z(null),s=z(null),i=z(null),c=z(!1),d=z(!1),u=Zn(n),[p,b]=_(!1),[l,f]=_(0),[m,k]=_(u),[x,C]=_(0),[g,R]=_(ks),[j,J]=_(!1),[Z,se]=_(1),[O,te]=_(!1),[L,Y]=_(Ss),[we,ne]=_(!0),[be,ve]=_(null),[pe,ce]=_(""),me=Xn(a,m);function X(){ne(!0),window.clearTimeout(i.current),i.current=window.setTimeout(()=>{let h=r.current;h&&!h.paused&&!h.ended&&ne(!1)},$s)}S(()=>{p||(window.clearTimeout(i.current),ne(!0))},[p]),S(()=>{let h=r.current;if(!h)return;let E=()=>Number.isFinite(h.duration)&&h.duration>0?h.duration:u,F=()=>k(E()),Ut=()=>k(E()),Lt=()=>{c.current||f(h.currentTime||0)},It=()=>{let Ot=E();if(!(Ot>0)||!h.buffered?.length){C(0);return}let Vt=h.currentTime||0,Ue=0;for(let Le=0;Le<h.buffered.length;Le+=1){let Ta=h.buffered.start(Le),ct=h.buffered.end(Le);if(Vt>=Ta&&Vt<=ct){Ue=ct;break}Ue=Math.max(Ue,ct)}C(rt(Ue,Ot))},At=()=>{b(!0),ce(""),X()},Nt=()=>b(!1),Ft=()=>b(!1),zt=()=>{R(h.volume),J(h.muted||h.volume===0)},Bt=()=>ce("Playback unavailable");return h.addEventListener("loadedmetadata",F),h.addEventListener("durationchange",Ut),h.addEventListener("timeupdate",Lt),h.addEventListener("progress",It),h.addEventListener("play",At),h.addEventListener("pause",Nt),h.addEventListener("ended",Ft),h.addEventListener("volumechange",zt),h.addEventListener("error",Bt),()=>{h.removeEventListener("loadedmetadata",F),h.removeEventListener("durationchange",Ut),h.removeEventListener("timeupdate",Lt),h.removeEventListener("progress",It),h.removeEventListener("play",At),h.removeEventListener("pause",Nt),h.removeEventListener("ended",Ft),h.removeEventListener("volumechange",zt),h.removeEventListener("error",Bt)}},[e,u]),S(()=>{r.current&&(r.current.volume=g)},[g]),S(()=>{r.current&&(r.current.muted=j)},[j]),S(()=>{r.current&&(r.current.playbackRate=Z)},[Z]),S(()=>{if(document.documentElement.classList.toggle("clipline-theater",L),L){let h=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=h}}},[L]),S(()=>()=>document.documentElement.classList.remove("clipline-theater"),[]);function re(h){Y(h),xs(h)}function oe(h){let E=r.current;if(!E)return;let F=m>0?Jn(h,m):Math.max(0,h);E.currentTime=F,f(F)}function $e(h){oe((r.current?.currentTime||0)+h)}async function ge(){let h=r.current;if(h)if(h.paused||h.ended)try{await h.play()}catch(E){ce(E?.message||"Playback failed")}else h.pause()}function ke(){let h=r.current;h&&(h.muted||h.volume===0?(h.muted=!1,h.volume===0&&(h.volume=1,R(1),na(1)),J(!1)):(h.muted=!0,J(!0)))}function $(h){let E=Number(h.target.value);R(E),J(E===0),na(E);let F=r.current;F&&(F.volume=E,F.muted=E===0)}async function T(){try{document.fullscreenElement?await document.exitFullscreen():await s.current?.requestFullscreen?.()}catch(h){ce(h?.message||"Fullscreen unavailable")}}function v(h){let E=r.current?.currentTime||0,F=h>0?Qn(me,E):ea(me,E);F&&oe(F.time)}function P(){c.current=!0,d.current=p,p&&r.current?.pause()}function I(h){let E=Number(h.target.value);f(E),oe(E)}function D(){c.current&&(c.current=!1,d.current&&(d.current=!1,r.current?.play().catch(()=>{})))}function U(h){let E=h.currentTarget.getBoundingClientRect();if(!(E.width>0))return;let F=Math.max(0,Math.min(1,(h.clientX-E.left)/E.width));ve({pct:F*100,time:F*(m||0)})}function ae(){ve(null)}return S(()=>{function h(E){if(E.defaultPrevented||ws(E.target))return;let F=ys(E.code,E.shiftKey);if(F&&!(F.kind==="exit-theater"&&!L))switch(E.preventDefault(),X(),F.kind){case"toggle-play":ge();break;case"seek-by":$e(F.seconds);break;case"seek-to":oe(F.seconds);break;case"seek-to-end":oe(m);break;case"next-marker":v(1);break;case"previous-marker":v(-1);break;case"toggle-mute":ke();break;case"theater":re(!L);break;case"exit-theater":re(!1);break;case"fullscreen":T();break;default:break}}return document.addEventListener("keydown",h),()=>document.removeEventListener("keydown",h)},[m,L,p]),o`<div class=${`player ${we?"":"chrome-hidden"}`} ref=${s}
      onPointerMove=${X} onPointerEnter=${X}
      onPointerLeave=${()=>{let h=r.current;h&&!h.paused&&ne(!1)}}
      onFocusIn=${()=>ne(!0)}>
    <video ref=${r} class="player-video" src=${e} poster=${t||void 0}
      preload="metadata" playsinline onClick=${ge}></video>
    ${pe&&o`<div class="player-note">${pe}</div>`}
    <div class="player-overlay">
      <div class="player-timeline" onPointerMove=${U} onPointerLeave=${ae}>
        <div class="player-buffered" style=${`width:${x}%`}></div>
        <div class="player-progress" style=${`width:${rt(l,m)}%`}></div>
        ${me.map(h=>o`<span class="player-marker-tick" key=${h.index}
            style=${`left:${rt(h.time,m)}%`} title=${`${h.label} @ ${Pt(h.time)}`}></span>`)}
        <input class="player-scrubber" type="range" min="0" max=${m>0?m:0} step="0.01"
          value=${l} disabled=${!(m>0)} aria-label="Seek"
          onPointerDown=${P} onInput=${I} onChange=${D}
          onPointerUp=${D} onPointerCancel=${D} onLostPointerCapture=${D} />
        ${be&&o`<div class="player-hover-time" style=${`left:${be.pct}%`}>${Pt(be.time)}</div>`}
      </div>
      <div class="player-controls">
        ${me.length>0&&o`<div class="player-cluster">
          <button type="button" class="player-btn" title="Previous marker" aria-label="Previous marker"
            onClick=${()=>v(-1)}>${M("skipBack",{size:14})}</button>
          <button type="button" class="player-btn" title="Next marker" aria-label="Next marker"
            onClick=${()=>v(1)}>${M("skipForward",{size:14})}</button>
        </div>`}
        <button type="button" class="player-btn player-play" aria-label=${p?"Pause":"Play"} onClick=${ge}>
          ${M(p?"pause":"play",{size:16})}
        </button>
        <span class="player-time">${Yn(l,m)}</span>
        <div class="player-spacer"></div>
        <div class="player-speed-wrap">
          <button type="button" class="player-btn player-speed" aria-haspopup="menu" aria-expanded=${O}
            onClick=${()=>te(h=>!h)}>${Z}×</button>
          ${O&&o`<div class="player-speed-menu" role="menu">
            ${gs.map(h=>o`<button type="button" role="menuitem" key=${h}
                class=${`player-speed-item ${h===Z?"is-active":""}`}
                onClick=${()=>{se(h),te(!1)}}>${h}×</button>`)}
          </div>`}
        </div>
        <button type="button" class="player-btn" aria-label=${j?"Unmute":"Mute"} onClick=${ke}>
          ${M(j?"volumeX":"volume2",{size:14})}
        </button>
        <input class="player-volume" type="range" min="0" max="1" step="0.01" value=${j?0:g}
          aria-label="Volume" onInput=${$} />
        <button type="button" class="player-btn" aria-label=${L?"Exit theater mode":"Theater mode"}
          aria-pressed=${L} onClick=${()=>re(!L)}>${M("theater",{size:14})}</button>
        <button type="button" class="player-btn" aria-label="Fullscreen" onClick=${T}>
          ${M("fullscreen",{size:14})}
        </button>
      </div>
    </div>
  </div>`}Q();function Cs(e){let t=new Map(e.map(s=>[s.id,s])),n=new Map,a=[],r=0;return e.forEach(s=>{let i=s.parent_comment_id||"";i&&t.has(i)?(n.has(i)||n.set(i,[]),n.get(i).push(s),r+=1):i||(a.push(s),r+=1)}),{roots:a,repliesByParent:n,count:r}}async function Ts({apiClient:e=y,shareId:t,body:n,parentCommentId:a,onReload:r=()=>{},onError:s=w}){let i=n.trim();if(!i)return!1;try{return await e(`/api/v1/public/clips/${encodeURIComponent(t)}/comments`,{method:"POST",body:a?{body:i,parent_comment_id:a}:{body:i}}),r(),!0}catch(c){return s(c.message),!1}}function Ms(e){return(e||"?").trim().slice(0,1).toUpperCase()||"?"}function Ps(e){let t=xt(e.author_avatar_url);return t?o`<img class="comment-avatar" src=${t} alt="" />`:o`<div class="comment-avatar">${Ms(e.author_name)}</div>`}function oa({shareId:e}){let{user:t}=H(A),[n,a]=_(null),[r,s]=_(""),[i,c]=_(null),[d,u]=_(""),[p,b]=_(null);function l(){y(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`).then(g=>a(g.comments||[])).catch(()=>a([]))}S(()=>{let g=!0;return a(null),y(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`).then(R=>g&&a(R.comments||[])).catch(()=>g&&a([])),()=>{g=!1}},[e]);async function f(g,R){return Ts({shareId:e,body:g,parentCommentId:R,onReload:l,onError:w})}async function m(g){g.preventDefault(),await f(r)&&s("")}async function k(g,R){g.preventDefault(),await f(d,R)&&(u(""),c(null))}async function x(){let g=p;b(null);try{await y(`/api/v1/public/clips/${encodeURIComponent(e)}/comments/${encodeURIComponent(g)}`,{method:"DELETE"}),l()}catch(R){w(R.message)}}let C=Cs(n||[]);return o`<section class="comments">
    <div class="comments-header"><h2>Comments</h2><span class="muted">${C.count}</span></div>
    ${t?o`<form class="comment-form" onSubmit=${m}>
          <textarea rows="3" maxlength="2000" placeholder="Add a comment" value=${r}
            onInput=${g=>s(g.target.value)}></textarea>
          <div class="comment-form-actions">
            <button type="submit" class="btn btn-primary">${M("message",{size:14})} Post comment</button>
          </div>
        </form>`:o`<p class="comment-signin"><a href="/login">Sign in</a> to comment.</p>`}
    ${n==null?"":C.count===0?o`<p class="comment-signin">No comments yet.</p>`:o`<div class="comment-list">
          ${C.roots.map(g=>ia(g,{depth:0,repliesByParent:C.repliesByParent,user:t,replyOpenId:i,setReplyOpenId:c,replyDraft:d,setReplyDraft:u,submitReply:k,onDelete:b}))}
        </div>`}
    <${le} open=${p!=null} title="Delete this comment?"
      body="This removes the comment from the public clip page." confirmLabel="Delete" danger
      onConfirm=${x} onCancel=${()=>b(null)} />
  </section>`}function ia(e,t){let{depth:n,repliesByParent:a,user:r,replyOpenId:s,setReplyOpenId:i,replyDraft:c,setReplyDraft:d,submitReply:u,onDelete:p}=t,b=a.get(e.id)||[];return o`<article class="comment" key=${e.id}>
    ${Ps(e)}
    <div class="comment-body">
      <div class="comment-head">
        ${e.author_username?o`<a href=${`/u/${encodeURIComponent(e.author_username)}`}>${e.author_name}</a>`:o`<strong>${e.author_name}</strong>`}
        ${e.is_uploader&&o`<span class="comment-badge">Uploader</span>`}
        <span>${Ye(e.created_at)}</span>
        <div class="comment-actions">
          ${r&&n===0&&o`<button type="button" class="comment-action"
            onClick=${()=>i(s===e.id?null:e.id)}>
            ${M("message",{size:12})} Reply</button>`}
          ${e.viewer_can_delete&&o`<button type="button" class="comment-delete" aria-label="Delete comment"
            title="Delete comment" onClick=${()=>p(e.id)}>${M("trash",{size:12})}</button>`}
        </div>
      </div>
      <p class="comment-text">${e.body}</p>
      ${r&&n===0&&s===e.id&&o`<form class="comment-reply-form"
        onSubmit=${l=>u(l,e.id)}>
        <textarea rows="2" maxlength="2000" placeholder="Write a reply" value=${c}
          onInput=${l=>d(l.target.value)}></textarea>
        <div class="comment-form-actions">
          <button type="submit" class="btn btn-primary">${M("message",{size:14})} Post reply</button>
        </div>
      </form>`}
      ${b.length>0&&o`<div class="comment-replies">
        ${b.map(l=>ia(l,{...t,depth:n+1}))}
      </div>`}
    </div>
  </article>`}var Es=["private","public","unlisted"];function Rs(e,t){return e==="clip"?!0:!!t?.viewer_can_edit}function Ds(e,t,n){return e==="public"?t.shareId:n?.public_share_id||null}function Us(e,t,n){return e==="clip"?t.clipId:n?.viewer_clip_id||null}function Ls(e){let t=e?.height!=null?e.height:"",n=Math.round(e?.fps||0)||"";return`${t}p${n}`}function Is(e,t=8){let n=new URLSearchParams;return e&&n.set("share_id",e),n.set("limit",String(t)),`/api/v1/public/recommendations?${n}`}function As(e,t,n=8){return(e||[]).filter(a=>a.share_id!==t).slice(0,n)}function Et({route:e}){let{user:t}=H(A),[n,a]=_(null),[r,s]=_(null),[i,c]=_([]),[d,u]=_(!1),[p,b]=_(""),[l,f]=_(!1),[m,k]=_(""),[x,C]=_(!1),[g,R]=_(!1),[j,J]=_(!1),Z=e.name==="clip"?`clip:${e.clipId}`:`public:${e.shareId}`,se=Ds(e.name,e,n),O=e.name==="public"||!!n;if(S(()=>{let v=!0;a(null),s(null),u(!1),f(!1),J(!1),C(!1);let P=e.name==="clip"?`/api/v1/clips/${encodeURIComponent(e.clipId)}`:`/api/v1/public/clips/${encodeURIComponent(e.shareId)}`;return y(P).then(I=>{v&&(a(I),e.name==="public"&&y(`/api/v1/public/clips/${encodeURIComponent(e.shareId)}/view`,{method:"POST",body:{}}).then(D=>v&&a(U=>U&&{...U,view_count:D.view_count})).catch(()=>{}))}).catch(I=>v&&s(I)),()=>{v=!1}},[Z]),S(()=>{let v=!0;return O?(c([]),y(Is(se,8)).then(P=>v&&c(P.clips||[])).catch(()=>{}),()=>{v=!1}):(c([]),()=>{v=!1})},[Z,se,O]),r)return o`<main class="page"><${W} name="alert" title="Couldn't load this clip" body=${r.message} /></main>`;if(!n)return o`<main class="page watch"><div><div class="skeleton-thumb"></div></div><aside class="upnext"></aside></main>`;let te=Rs(e.name,n),L=se,Y=Us(e.name,e,n),we=e.name==="clip"?Xe({id:n.id}):Ce({share_id:e.shareId}),ne=e.name==="clip"?In({id:n.id}):An({share_id:e.shareId}),be=e.name==="clip"?t?.display_name||t?.username||"You":n.author_name||"Unknown creator",ve=n.public_url??n.share_url??null,pe=Re(ve,window.location.origin,L),ce=e.name==="clip";function me(){b(n.title),u(!0)}async function X(v){v?.preventDefault?.();let P=p.trim();if(!P||P===n.title){u(!1);return}try{await y(`/api/v1/clips/${encodeURIComponent(Y)}`,{method:"PATCH",body:{title:P}}),a(I=>({...I,title:P})),u(!1),w("Title saved.")}catch(I){w(I.message)}}function re(){k(n.description||""),f(!0)}async function oe(){let v=m.trim();try{await y(`/api/v1/clips/${encodeURIComponent(Y)}`,{method:"PATCH",body:{description:v||null}}),a(P=>({...P,description:v||null})),f(!1),w("Description saved.")}catch(P){w(P.message)}}async function $e(v,{force:P=!1}={}){let I=n.visibility;if(!(I===v&&!P)){a(D=>({...D,visibility:v}));try{let D=await y(`/api/v1/clips/${encodeURIComponent(Y)}/visibility`,{method:"POST",body:{visibility:v}});a(U=>({...U,visibility:D.visibility,public_url:D.public_url,public_share_id:D.public_share_id})),w(`Visibility set to ${v}.`,{actionLabel:"Undo",onAction:()=>$e(I,{force:!0})})}catch(D){a(U=>({...U,visibility:I})),w(D.message)}}}async function ge(){if(pe)try{await navigator.clipboard.writeText(pe),w("Link copied.")}catch{w("Couldn't copy the link.")}}async function ke(){R(!1);try{await y(`/api/v1/clips/${encodeURIComponent(Y)}`,{method:"DELETE"}),w("Clip deleted."),G("/library")}catch(v){w(v.message)}}let $=[n.game_name&&o`<a class="chip chip-on" href=${`/game/${encodeURIComponent(n.game_name)}`}>${n.game_name}</a>`,ye(n.view_count),`Recorded ${K(n.recorded_at)}`,`by ${be}`].filter(Boolean),T=As(i,L,8);return o`<main class="page watch">
    <div>
      <${ra} src=${we} poster=${ne} durationMs=${n.duration_ms} markers=${n.markers} />
      <div class="watch-titlerow">
        ${d?o`<input class="input watch-title-input" value=${p} autofocus
              onInput=${v=>b(v.target.value)} onBlur=${X}
              onKeyDown=${v=>{v.key==="Enter"&&X(v),v.key==="Escape"&&u(!1)}} />`:o`<h1>${n.title}
              ${te&&o`<button type="button" class="edit-pencil" aria-label="Edit title" onClick=${me}
                >${M("edit",{size:14})}</button>`}</h1>`}
      </div>
      <p class="watch-meta">${$.map((v,P)=>o`${P>0?" \xB7 ":""}${v}`)}</p>

      ${te&&o`<div class="watch-actions">
        <div class="seg" role="radiogroup" aria-label="Visibility">
          ${Es.map(v=>o`<button type="button" role="radio" key=${v} aria-checked=${n.visibility===v}
              class=${`seg-item ${n.visibility===v?"seg-on":""}`} onClick=${()=>$e(v)}
              >${v[0].toUpperCase()+v.slice(1)}</button>`)}
        </div>
        <button type="button" class="btn btn-primary" disabled=${!pe} onClick=${ge}>
          ${M("copy",{size:14})} Copy share link</button>
        <div class="watch-more">
          <button type="button" class="btn" aria-haspopup="menu" aria-expanded=${x}
            onClick=${()=>C(v=>!v)}>⋯</button>
          ${x&&o`<div class="menu" role="menu">
            <button type="button" class="menu-danger" role="menuitem"
              onClick=${()=>{C(!1),R(!0)}}>${M("trash",{size:14})} Delete clip</button>
          </div>`}
        </div>
      </div>`}

      <div class="watch-desc">
        ${l?o`<textarea class="input" rows="5" value=${m} autofocus
              onInput=${v=>k(v.target.value)} onBlur=${oe}
              onKeyDown=${v=>{v.key==="Enter"&&(v.ctrlKey||v.metaKey)&&oe(),v.key==="Escape"&&f(!1)}}></textarea>`:n.description?o`<p>${n.description}
              ${te&&o`<button type="button" class="edit-pencil" aria-label="Edit description" onClick=${re}
                >${M("edit",{size:12})}</button>`}</p>`:te?o`<button type="button" class="watch-desc-add" onClick=${re}>+ Add a description</button>`:""}
      </div>

      ${ce&&o`<button type="button" class="details-strip" aria-expanded=${j}
        onClick=${()=>J(v=>!v)}>
        <span><b>${_e(n.duration_ms)}</b> length</span>
        <span><b>${q(n.file_size_bytes)}</b></span>
        <span><b>${Ls(n)}</b></span>
        <span><b>${n.video_codec}/${n.audio_codec}</b> ${n.container}</span>
        <span class="details-chev">${j?"\u25B4 less":"\u25BE more"}</span>
      </button>`}
      ${ce&&j&&o`<dl class="details-full">
        <div><dt>Recorded</dt><dd>${K(n.recorded_at)}</dd></div>
        <div><dt>Uploaded</dt><dd>${K(n.uploaded_at)}</dd></div>
        <div><dt>Dimensions</dt><dd>${n.width&&n.height?`${n.width} x ${n.height}`:"Unknown"}</dd></div>
        <div><dt>FPS</dt><dd>${n.fps??"Unknown"}</dd></div>
        <div><dt>Container</dt><dd>${n.container||"Unknown"}</dd></div>
        <div><dt>Video codec</dt><dd>${n.video_codec||"Unknown"}</dd></div>
        <div><dt>Audio codec</dt><dd>${n.audio_codec||"Unknown"}</dd></div>
        <div><dt>Source</dt><dd>${n.source_type||"Unknown"}</dd></div>
        <div><dt>Checksum</dt><dd>${n.checksum_sha256||"Unknown"}</dd></div>
      </dl>`}

      ${L&&o`<${oa} shareId=${L} />`}
    </div>
    <aside class="upnext">
      <h4 class="kicker">Up next</h4>
      ${T.map(v=>o`<a class="upnext-row" key=${v.share_id} href=${`/c/${encodeURIComponent(v.share_id)}`}>
          <img src=${ie(v)} alt="" loading="lazy" />
          <span><b>${v.title}</b><small>${v.author_name} · ${v.game_name||"No game"} · ${ye(v.view_count)}</small></span>
        </a>`)}
    </aside>

    <${le} open=${g} title="Delete this clip?" body="Public links stop working immediately."
      confirmLabel="Delete" danger onConfirm=${ke} onCancel=${()=>R(!1)} />
  </main>`}Q();var Rt=[{top:"4%",left:"4%",width:"34%",rotate:-7},{top:"0%",left:"44%",width:"30%",rotate:5},{top:"34%",left:"68%",width:"28%",rotate:-4},{top:"50%",left:"8%",width:"30%",rotate:6},{top:"62%",left:"42%",width:"26%",rotate:-5},{top:"26%",left:"-4%",width:"22%",rotate:9}];function Ns(e){return Array.isArray(e)?e.slice(0,Rt.length).map((t,n)=>({clip:t,...Rt[n]})):[]}function Fs(e){let t=e?.clips;if(!Array.isArray(t)||t.length===0)return null;let n=t.length,a=e.has_more?"+":"";return`${n}${a} clip${n===1?"":"s"} on this instance`}function zs({top:e,left:t,width:n,rotate:a}){return`top:${e};left:${t};width:${n};transform:rotate(${a}deg);`}function la(e){let t=String(e||"").trim();return t||null}function Bs(){let[e,t]=_(null);S(()=>{let r=!0;return y(`/api/v1/public/clips?page_size=${Rt.length}`).then(s=>r&&t(s)).catch(()=>r&&t(null)),()=>{r=!1}},[]);let n=Ns(e?.clips),a=Fs(e);return o`<aside class="login-montage" aria-hidden="true">
    ${n.length>0&&o`<div class="login-montage-tiles">
      ${n.map((r,s)=>o`<img key=${s} class="login-montage-tile" style=${zs(r)}
        src=${ie(r.clip)} alt="" loading="lazy" />`)}
    </div>`}
    <div class="login-montage-copy">
      <h2>Your clips. Your server.</h2>
      ${a&&o`<p>${a}</p>`}
    </div>
  </aside>`}function Me({titleId:e,children:t}){return o`<div class="login-page">
    <${Bs} />
    <section class="login-panel" aria-labelledby=${e}>
      <div class="login-brand" aria-hidden="true">
        <img src="/clipline-icon.svg" alt="" width="32" height="32" />
        <span class="login-brand-word">CLIP<span class="wordmark-accent">LINE</span></span>
        <span class="login-brand-descriptor">CLOUD</span>
      </div>
      ${t}
    </section>
  </div>`}function ca(){let{user:e}=H(A),[t,n]=_(""),[a,r]=_(""),[s,i]=_(""),[c,d]=_(!1);if(S(()=>{e&&G("/library")},[e]),e)return null;async function u(p){if(p.preventDefault(),!c){d(!0),i("");try{let b=await y("/api/v1/auth/login",{method:"POST",body:{username:t,password:a}});de(b.csrf_token),A.set({user:b.user,csrfToken:b.csrf_token,ready:!0}),G("/library")}catch(b){i(b instanceof he?b.message:"Sign in failed"),d(!1)}}}return o`<${Me} titleId="login-title">
    <h1 id="login-title">Sign in</h1>
    ${s&&o`<p class="form-error" role="alert">${s}</p>`}
    <form class="login-form" onSubmit=${u}>
      <label class="login-field">
        <span>Username</span>
        <input class="input" name="username" autocomplete="username" required
          value=${t} onInput=${p=>n(p.target.value)} />
      </label>
      <label class="login-field">
        <span>Password</span>
        <input class="input" name="password" type="password" autocomplete="current-password" required
          value=${a} onInput=${p=>r(p.target.value)} />
      </label>
      <button class="btn btn-primary" type="submit" disabled=${c}>${c?"Signing in\u2026":"Sign in"}</button>
    </form>
    <p class="login-hint">Accounts are created by this server's admin.</p>
  </${Me}>`}function ua({route:e}){let t=!!e.invite,[n,a]=_(()=>t?"preflight":e.token?"form":"missing-token"),[r,s]=_(""),[i,c]=_(t?null:e.token),[d,u]=_(""),[p,b]=_(!1),l=t;S(()=>{if(!t)return;if(!e.token){a("missing-token");return}let x=!0;return a("preflight"),y("/api/v1/invites/claim",{method:"POST",body:{invite_token:e.token}}).then(C=>{x&&(c(C.reset_token),a("form"))}).catch(C=>{x&&(s(C instanceof he?C.message:"This invite link is invalid, used, or expired."),a("invalid"))}),()=>{x=!1}},[t,e.token]);async function f(x){if(x.preventDefault(),p)return;b(!0),u("");let C=new FormData(x.currentTarget),g={reset_token:i,new_password:String(C.get("new_password")||"")};l&&(g.username=String(C.get("username")||""),g.display_name=la(C.get("display_name")),g.email=la(C.get("email")));try{await y("/api/v1/auth/reset-password",{method:"POST",body:g}),w(l?"Account created. Sign in with your new password.":"Password set. Sign in with your new password."),G("/login")}catch(R){u(R instanceof he?R.message:"Request failed"),b(!1)}}if(t&&n!=="form"){let x=n==="missing-token"||n==="invalid",C=n==="missing-token"?"This invite link is missing a token.":n==="invalid"?r:"Opening invite\u2026";return o`<${Me} titleId="invite-title">
      <h1 id="invite-title">Create account</h1>
      <p class="login-copy">${x?"This invite cannot be used.":"Preparing your account setup."}</p>
      ${x?o`<p class="form-error" role="alert">${C}</p>`:o`<p class="login-status">${C}</p>`}
    </${Me}>`}return o`<${Me} titleId="reset-title">
    <h1 id="reset-title">${l?"Create account":"Set password"}</h1>
    <p class="login-copy">${l?"Choose your Clipline Cloud account details.":"Choose a new password for your Clipline Cloud account."}</p>
    ${n==="missing-token"?o`<p class="form-error" role="alert">This reset link is missing a token.</p>`:o`
        ${d&&o`<p class="form-error" role="alert">${d}</p>`}
        <form class="login-form" onSubmit=${f}>
          ${l&&o`
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
          <button class="btn btn-primary" type="submit" disabled=${p}>
            ${l?"Create account":"Set password"}
          </button>
        </form>
      `}
    ${!l&&o`<a class="btn" href="/login">Sign in</a>`}
  </${Me}>`}Q();function De({label:e,value:t,sub:n,meter:a,tone:r}){let s=r?` stat-${r}`:"";return o`<div class="stat-card">
    <p class="stat-label">${e}</p>
    <p class=${`stat-value${s}`}>${t}</p>
    ${n!=null&&o`<p class="stat-sub">${n}</p>`}
    ${a!=null&&o`<div class="stat-meter${s}">
      <span style=${`width:${Math.max(0,Math.min(1,a))*100}%`}></span>
    </div>`}
  </div>`}function Os(e){let t=Number(e?.global_storage_warning_threshold_bytes||0);if(!t)return null;let n=Number(e?.total_storage_bytes||0);return Math.max(0,Math.min(1,n/t))}function Vs(e){if(!e?.global_storage_warning_threshold_bytes)return"Disabled";let t=q(e.global_storage_warning_threshold_bytes);return e.global_storage_warning?`At or above ${t}`:`Below ${t}`}function Hs({deadJobs:e=[],failedUploads:t=[]}={}){let n=e.length+t.length;return{failedCount:n,healthy:n===0}}function ee(e,t){return o`<div><dt>${e}</dt><dd>${t??"Unknown"}</dd></div>`}function da({overview:e,deadJobs:t,failedUploads:n}){let a=Os(e),{failedCount:r,healthy:s}=Hs({deadJobs:t,failedUploads:n}),i=e.global_storage_warning_threshold_bytes;return o`<div>
    <div class="stat-grid">
      <${De} label="Clips" value=${String(e.total_clips)} />
      <${De} label="Storage" value=${q(e.total_storage_bytes)}
        sub=${i?`${q(i)} warning threshold`:null}
        meter=${a} tone=${e.global_storage_warning?"danger":void 0} />
      <${De} label="Users" value=${String(e.total_users)} />
      <${De} label="Jobs" value=${s?"All healthy":String(r)}
        tone=${s?"success":"danger"} />
    </div>
    <div class="panel">
      <h2>Server summary</h2>
      <dl class="ad-kv">
        ${ee("Server version",e.server_version)}
        ${ee("API version",e.api_version)}
        ${ee("Public URL",e.public_url)}
        ${ee("Database",e.database_backend)}
        ${ee("Storage",`${e.storage_backend} \u2014 ${e.storage_summary}`)}
        ${ee("Stored clips",`${e.total_clips} clips \u2014 ${q(e.total_storage_bytes)}`)}
        ${ee("Users",`${e.total_users} total`)}
        ${ee("Max upload",q(e.max_upload_size_bytes))}
        ${ee("Part size",q(e.upload_part_size_bytes))}
        ${ee("Single PUT max",q(e.single_put_max_bytes))}
        ${ee("Active uploads/user",e.max_active_upload_sessions_per_user)}
        ${ee("User quota",e.user_storage_quota_bytes?q(e.user_storage_quota_bytes):"Disabled")}
        ${ee("Storage warning",Vs(e))}
        ${ee("Upload TTL",`${e.upload_session_ttl_seconds}s`)}
        ${ee("Direct S3 uploads",e.direct_s3_uploads?"Enabled":"Disabled")}
        ${ee("Public media",`${e.public_media_mode}, ${e.public_read_url_ttl_seconds}s TTL`)}
      </dl>
    </div>
  </div>`}Q();function ot(e){let t=String(e||"").trim();return t||null}function qs(e){let t=Number(String(e||"").trim());if(!Number.isFinite(t)||t<0)throw new Error("Storage quota must be a non-negative number");return Math.round(t*1024*1024*1024)}function Gs(e,t){return!(e.is_disabled||t?.id===e.id||e.role==="owner"||e.role==="admin"&&t?.role!=="owner")}function pa(e){return e?[["user","User"],["admin","Admin"]]:[["user","User"]]}function Ks({isOwner:e,onCreated:t}){let[n,a]=_(!1);async function r(s){if(s.preventDefault(),n)return;a(!0);let i=s.currentTarget,c=new FormData(i);try{await y("/api/v1/users",{method:"POST",body:{username:String(c.get("username")||""),display_name:ot(c.get("display_name")),email:ot(c.get("email")),password:ot(c.get("password")),role:String(c.get("role")||"user")}}),w("User created."),i.reset(),t()}catch(d){w(d.message)}finally{a(!1)}}return o`<form class="panel section" onSubmit=${r}>
    <h2>Create user</h2>
    <label class="field"><span>Username</span><input class="input" name="username" required /></label>
    <label class="field"><span>Display name</span><input class="input" name="display_name" placeholder="Optional" /></label>
    <label class="field"><span>Email</span><input class="input" name="email" type="email" placeholder="Optional" /></label>
    <label class="field"><span>Password</span><input class="input" name="password" type="password" required /></label>
    <label class="field"><span>Role</span>
      <select class="input" name="role">
        ${pa(e).map(([s,i])=>o`<option value=${s}>${i}</option>`)}
      </select>
    </label>
    <button class="btn btn-primary" type="submit" disabled=${n}>${M("plus",{size:14})} Create user</button>
  </form>`}function Ws({isOwner:e,smtpEnabled:t,onCreated:n}){let[a,r]=_(!1);async function s(i){if(i.preventDefault(),a)return;r(!0);let c=new FormData(i.currentTarget),d=i.submitter?.value==="email"?"email":"link";try{let u=await y("/api/v1/invites",{method:"POST",body:{role:String(c.get("role")||"user"),email:ot(c.get("email")),send_email:d==="email"}});w(d==="email"?"Invite sent.":"Invite link created."),n({...u,kind:"invite"})}catch(u){w(u.message)}finally{r(!1)}}return o`<form class="panel section" onSubmit=${s}>
    <h2>Invite link</h2>
    <label class="field"><span>Role</span>
      <select class="input" name="role">
        ${pa(e).map(([i,c])=>o`<option value=${i}>${c}</option>`)}
      </select>
    </label>
    <label class="field"><span>Email</span>
      <input class="input" name="email" type="email" placeholder=${t?"Optional":"SMTP disabled"} disabled=${!t} />
    </label>
    <div class="actions">
      <button class="btn" type="submit" name="intent" value="link" disabled=${a}>${M("copy",{size:14})} Generate link</button>
      ${t&&o`<button class="btn btn-primary" type="submit" name="intent" value="email" disabled=${a}>${M("message",{size:14})} Send email</button>`}
    </div>
  </form>`}function js({resetLink:e}){if(!e)return null;let t=e.kind==="invite"?"Invite":"Reset",n=e.username?` for ${e.username}`:"",a=async()=>{try{await navigator.clipboard.writeText(e.reset_url),w("Copied to clipboard.")}catch{w("Copy failed. Select and copy the URL manually.")}};return o`<div class="notice admin-reset-link">
    <div>
      <strong>${t} link created${n}</strong>
      <span>Expires ${K(e.expires_at)}</span>
      <code>${e.reset_url}</code>
    </div>
    <button class="btn" type="button" onClick=${a}>${M("copy",{size:14})} Copy</button>
  </div>`}function Zs(e){return e.is_disabled?o`<span class="badge badge-warn">Disabled</span>`:o`<span class="badge badge-public">Active</span>`}function Js({user:e,currentUser:t,onQuota:n,onReset:a,onDisable:r}){let s=e.storage_quota_bytes!=null?q(e.storage_quota_bytes):"No limit",i=!Gs(e,t);return o`<tr>
    <td>
      <strong>${e.username}</strong>
      <div class="muted">${e.display_name||e.id}</div>
      ${e.email&&o`<div class="muted">${e.email}</div>`}
    </td>
    <td>${e.role}</td>
    <td>${Zs(e)}</td>
    <td>
      <strong>${q(e.storage_bytes||0)}</strong>
      <div class="muted">quota ${s}</div>
    </td>
    <td>${K(e.last_login_at)}</td>
    <td>
      <div class="actions">
        <button class="btn" type="button" onClick=${()=>n(e)}>${M("sliders",{size:14})} Quota</button>
        <button class="btn" type="button" onClick=${()=>a(e)}>${M("clipboard",{size:14})} Reset link</button>
        <button class="btn btn-danger" type="button" disabled=${i} onClick=${()=>r(e)}>${M("x",{size:14})} Disable</button>
      </div>
    </td>
  </tr>`}function ma({users:e,settings:t,currentUser:n,resetLink:a,setResetLink:r,reload:s}){let[i,c]=_(null),d=n?.role==="owner",u=!!t?.smtp_enabled,p=()=>c(null);async function b(){let{type:f,user:m,value:k}=i;p();try{if(f==="quota"){let x=k.trim()?qs(k):null;await y(`/api/v1/users/${encodeURIComponent(m.id)}`,{method:"PATCH",body:{storage_quota_bytes:x}}),w("Storage quota updated.")}else if(f==="disable")await y(`/api/v1/users/${encodeURIComponent(m.id)}`,{method:"DELETE",body:{reauth_password:k}}),w("User disabled.");else if(f==="reset"){let x=await y(`/api/v1/users/${encodeURIComponent(m.id)}/reset-password`,{method:"POST",body:{reauth_password:k}});r({...x,kind:"reset"}),w("Reset link created.")}s()}catch(x){w(x.message)}}let l={quota:{title:"Set storage quota",description:"Enter a per-user storage limit in GiB. Leave it blank to remove the per-user limit.",confirmLabel:"Save quota",danger:!1,field:o`<label class="field"><span>Quota GiB</span>
        <input class="input" type="number" min="0" step="0.1" placeholder="No per-user limit"
          value=${i?.value||""} onInput=${f=>c(m=>({...m,value:f.target.value}))} /></label>`},disable:{title:"Disable user?",description:"This immediately revokes the user's sessions and device tokens.",confirmLabel:"Disable",danger:!0,field:o`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value||""}
          onInput=${f=>c(m=>({...m,value:f.target.value}))} /></label>`},reset:{title:"Create reset link?",description:"This creates a temporary password reset link for the selected user.",confirmLabel:"Create link",danger:!1,field:o`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value||""}
          onInput=${f=>c(m=>({...m,value:f.target.value}))} /></label>`}}[i?.type];return o`<div class="admin-users-layout">
    <div class="admin-users-forms">
      <${Ks} isOwner=${d} onCreated=${()=>{r(null),s()}} />
      <${Ws} isOwner=${d} smtpEnabled=${u}
        onCreated=${f=>{r(f),s()}} />
    </div>
    <div class="panel admin-users-table">
      <div class="section-header">
        <h2>Users</h2>
        <span class="muted">${e.length} total</span>
      </div>
      <${js} resetLink=${a} />
      <div class="table-wrap">
        <table class="lib-table">
          <thead><tr><th>Username</th><th>Role</th><th>Status</th><th>Storage</th><th>Last login</th><th></th></tr></thead>
          <tbody>
            ${e.map(f=>o`<${Js} key=${f.id} user=${f} currentUser=${n}
              onQuota=${m=>c({type:"quota",user:m,value:""})}
              onReset=${m=>c({type:"reset",user:m,value:""})}
              onDisable=${m=>c({type:"disable",user:m,value:""})} />`)}
          </tbody>
        </table>
      </div>
    </div>
    <${le} open=${!!i}
      title=${l?.title}
      body=${l&&o`${l.description} ${l.field}`}
      confirmLabel=${l?.confirmLabel} danger=${l?.danger}
      confirmDisabled=${i?.type!=="quota"&&!i?.value?.trim()}
      onConfirm=${b} onCancel=${p} />
  </div>`}Q();function it(e){let t=String(e||"").trim();return t||null}function fa({settings:e,isOwner:t,reload:n}){let[a,r]=_(!1);async function s(i){if(i.preventDefault(),a)return;r(!0);let c=new FormData(i.currentTarget),d={allow_vod_uploads:c.get("allow_vod_uploads")==="on",vod_threshold_minutes:Number(c.get("vod_threshold_minutes")||30)};if(t){d.about_text=String(c.get("about_text")||""),d.smtp_enabled=c.get("smtp_enabled")==="on",d.smtp_host=it(c.get("smtp_host")),d.smtp_port=Number(c.get("smtp_port")||587),d.smtp_tls_mode=String(c.get("smtp_tls_mode")||"starttls"),d.smtp_username=it(c.get("smtp_username")),d.smtp_from_email=it(c.get("smtp_from_email")),d.smtp_from_name=it(c.get("smtp_from_name"));let u=String(c.get("smtp_password")||"").trim();u&&(d.smtp_password=u),c.get("smtp_password_clear")==="on"&&(d.smtp_password_clear=!0)}try{await y("/api/v1/admin/settings",{method:"PATCH",body:d}),w("Settings saved."),n()}catch(u){w(u.message)}finally{r(!1)}}return o`<form class="admin-settings-page" onSubmit=${s}>
    <section class="settings-section">
      <div class="settings-copy">
        <h2>Upload policy</h2>
        <p>Control whether long recordings can be uploaded and where Clipline classifies a clip as a full VOD.</p>
      </div>
      <div class="settings-controls">
        <label class="check-field">
          <input name="allow_vod_uploads" type="checkbox" checked=${e.allow_vod_uploads} />
          <span>Allow full-length VOD uploads</span>
        </label>
        <label class="field"><span>VOD threshold minutes</span>
          <input class="input" name="vod_threshold_minutes" type="number" min="0" value=${e.vod_threshold_minutes??30} /></label>
      </div>
    </section>

    <section class="settings-section">
      <div class="settings-copy">
        <h2>About page</h2>
        <p>${t?"Edit the public About page shown to all visitors.":"Only the owner can edit the public About page."}</p>
      </div>
      <div class="settings-controls">
        <label class="field"><span>About text</span>
          <textarea class="input" name="about_text" rows="5" maxlength="5000" disabled=${!t}>${e.about_text||""}</textarea>
        </label>
      </div>
    </section>

    <section class="settings-section">
      <div class="settings-copy">
        <h2>Email invites</h2>
        <p>${t?"Configure SMTP so new users can receive password setup links by email.":"Only the owner can edit SMTP invite settings."}</p>
      </div>
      <div class="settings-controls">
        <label class="check-field">
          <input name="smtp_enabled" type="checkbox" checked=${e.smtp_enabled} disabled=${!t} />
          <span>Enable SMTP invites</span>
        </label>
        <label class="field"><span>SMTP host</span>
          <input class="input" name="smtp_host" value=${e.smtp_host||""} placeholder="smtp.example.com" disabled=${!t} /></label>
        <label class="field"><span>SMTP port</span>
          <input class="input" name="smtp_port" type="number" min="1" value=${e.smtp_port??587} disabled=${!t} /></label>
        <label class="field"><span>TLS mode</span>
          <select class="input" name="smtp_tls_mode" disabled=${!t}>
            ${[["starttls","STARTTLS"],["tls","TLS"],["none","None"]].map(([i,c])=>o`<option value=${i} selected=${(e.smtp_tls_mode||"starttls")===i}>${c}</option>`)}
          </select></label>
        <label class="field"><span>SMTP username</span>
          <input class="input" name="smtp_username" value=${e.smtp_username||""} placeholder="Optional" disabled=${!t} /></label>
        <label class="field"><span>SMTP password</span>
          <input class="input" name="smtp_password" type="password"
            placeholder=${e.smtp_password_configured?"Configured; leave blank to keep":"Optional"} disabled=${!t} /></label>
        ${e.smtp_password_configured&&o`<label class="check-field">
          <input name="smtp_password_clear" type="checkbox" disabled=${!t} />
          <span>Clear stored SMTP password</span>
        </label>`}
        <label class="field"><span>From email</span>
          <input class="input" name="smtp_from_email" type="email" value=${e.smtp_from_email||""} placeholder="clips@example.com" disabled=${!t} /></label>
        <label class="field"><span>From name</span>
          <input class="input" name="smtp_from_name" value=${e.smtp_from_name||""} placeholder="Clipline Cloud" disabled=${!t} /></label>
      </div>
    </section>

    <div class="settings-action-row">
      <button class="btn btn-primary" type="submit" disabled=${a}>${M("save",{size:14})} Save settings</button>
    </div>
  </form>`}function Ys(e){return`${(e/100).toFixed(e%100===0?0:1)}%`}function Xs(e){switch(e){case"delete_and_retry":return"delete the failed upload and retry from a new session";case"retry":return"retry the current upload request";default:return""}}function Qs({upload:e}){let t=Math.max(0,Math.min(1e4,Number(e.progress_basis_points||0))),n=Xs(e.recovery_action);return o`<div class="job-item">
    <div class="job-title-line">
      <strong class="mono">${e.id}</strong>
      <span class="badge badge-warn">${Ys(t)}</span>
    </div>
    <div class="progress-meter" aria-label="Upload progress"><span style=${`width:${t/100}%`}></span></div>
    <span class="muted">clip ${e.clip_id} — ${q(e.received_size_bytes)} of ${q(e.expected_size_bytes)} — updated ${K(e.updated_at)}</span>
    ${e.failure_reason&&o`<span class="form-error">${e.failure_reason}</span>`}
    ${n&&o`<span class="muted">Recovery: ${n}</span>`}
  </div>`}function ha({job:e}){return o`<div class="job-item">
    <strong>${e.kind} <span class="mono">${e.id}</span></strong>
    <span class="muted">${e.status} — attempts ${e.attempts}/${e.max_attempts} — updated ${K(e.updated_at)} — target ${e.target_type||""}:${e.target_id||""}</span>
    ${e.last_error&&o`<span class="form-error">${e.last_error}</span>`}
  </div>`}function Dt({title:e,items:t,renderItem:n,emptyLabel:a}){return o`<div class="panel">
    <div class="section-header">
      <h2>${e}</h2>
      <span class="muted">${t.length}</span>
    </div>
    ${t.length?o`<div class="job-list">${t.map(n)}</div>`:o`<p class="muted">${a}</p>`}
  </div>`}function _a({failedUploads:e,deadJobs:t,recentErrors:n}){return o`<div class="section">
    <${Dt} title="Failed uploads" items=${e} emptyLabel="No failed uploads."
      renderItem=${a=>o`<${Qs} key=${a.id} upload=${a} />`} />
    <${Dt} title="Dead jobs" items=${t} emptyLabel="No dead jobs."
      renderItem=${a=>o`<${ha} key=${a.id} job=${a} />`} />
    <${Dt} title="Recent job errors" items=${n} emptyLabel="No recent job errors."
      renderItem=${a=>o`<${ha} key=${a.id} job=${a} />`} />
  </div>`}var ba=[["overview","server","Overview"],["users","users","Users"],["settings","sliders","Settings"],["jobs","alert","Jobs"]];function er(e){return e?.role==="admin"||e?.role==="owner"}async function tr(){let[e,t,n,a,r,s]=await Promise.all([y("/api/v1/admin/overview"),y("/api/v1/admin/settings"),y("/api/v1/users"),y("/api/v1/admin/uploads/failed?limit=50"),y("/api/v1/admin/jobs/dead?limit=50"),y("/api/v1/admin/jobs/recent-errors?limit=50")]);return{overview:e,settings:t,users:n,failedUploads:a,deadJobs:r,recentErrors:s}}function va({route:e}){let{user:t}=H(A),n=er(t),a=!!(t&&!n),r=ba.some(([m])=>m===e.tab)?e.tab:"overview",[s,i]=_(null),[c,d]=_(null),[u,p]=_(null),[b,l]=_(0),f=()=>l(m=>m+1);return S(()=>{a&&(w("Admin access required."),G("/library"))},[a]),S(()=>{if(!n)return;let m=!0;return d(null),tr().then(k=>m&&i(k)).catch(k=>m&&d(k)),()=>{m=!1}},[n,b]),n?o`<main class="page">
    <h1>Admin</h1>
    <p class="page-subtitle">Accounts, instance summary, and processing diagnostics.</p>
    <nav class="ad-tabs" aria-label="Admin views">
      ${ba.map(([m,k,x])=>o`<a key=${m} class=${`ad-tab ${m===r?"ad-tab-on":""}`}
        href=${`/admin?tab=${m}`} aria-current=${m===r?"page":void 0}>${M(k,{size:14})} ${x}</a>`)}
    </nav>
    ${c?o`<${W} name="alert" title="Couldn't load admin data" body=${c.message} />`:s?r==="users"?o`<${ma} users=${s.users} settings=${s.settings} currentUser=${t}
          resetLink=${u} setResetLink=${p} reload=${f} />`:r==="settings"?o`<${fa} settings=${s.settings} isOwner=${t?.role==="owner"} reload=${f} />`:r==="jobs"?o`<${_a} failedUploads=${s.failedUploads} deadJobs=${s.deadJobs} recentErrors=${s.recentErrors} />`:o`<${da} overview=${s.overview} deadJobs=${s.deadJobs} failedUploads=${s.failedUploads} />`:o`<p class="empty-state">Loading admin data…</p>`}
  </main>`:null}Q();function $a(e){let t=String(e||"").trim();return t||null}async function nr(e){let t=new Headers;t.set("Accept","application/json"),t.set("Content-Type",e.type||"application/octet-stream");let n=yt();n&&t.set("X-CSRF-Token",n);let a=await fetch("/api/v1/me/avatar",{method:"PUT",credentials:"same-origin",headers:t,body:e}),r=await a.json().catch(()=>({}));if(!a.ok)throw new Error(r.error||a.statusText||"Avatar upload failed");return r}function ga(e){A.set({...A.get(),user:e})}function ar({user:e}){let[t,n]=_(!1);async function a(r){if(r.preventDefault(),t)return;n(!0);let s=new FormData(r.currentTarget);try{let i=await y("/api/v1/me/profile",{method:"PATCH",body:{display_name:$a(s.get("display_name")),bio:$a(s.get("bio"))}});ga(i),w("Profile saved.")}catch(i){w(i.message)}finally{n(!1)}}return o`<form class="profile-form" onSubmit=${a}>
    <label class="field"><span>Display name</span>
      <input class="input" name="display_name" maxlength="120" value=${e.display_name||""} placeholder=${e.username} /></label>
    <label class="field"><span>Bio</span>
      <textarea class="input" name="bio" rows="5" maxlength="2000" placeholder="Tell people what you upload.">${e.bio||""}</textarea></label>
    <div class="clip-inline-actions">
      <button class="btn btn-primary" type="submit" disabled=${t}>${M("save",{size:14})} Save profile</button>
    </div>
  </form>`}function sr({user:e}){let[t,n]=_(!1);async function a(r){if(r.preventDefault(),t)return;let s=r.currentTarget.elements.avatar?.files?.[0];if(!s){w("Choose an avatar image first.");return}n(!0);try{let i=await nr(s);ga(i),w("Avatar uploaded.")}catch(i){w(i.message)}finally{n(!1)}}return o`<form class="profile-form" onSubmit=${a}>
    <label class="field"><span>Avatar</span>
      <input name="avatar" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
      <small>PNG, JPEG, WebP, or GIF. Max 2 MiB.</small></label>
    <div class="clip-inline-actions">
      <button class="btn" type="submit" disabled=${t}>${M("upload",{size:14})} Upload avatar</button>
    </div>
  </form>`}function ya(){let{user:e}=H(A);return e?o`<main class="page">
    <h1>Profile</h1>
    <p class="page-subtitle">Public identity and avatar.</p>
    <div class="profile-settings-header">
      <${xe} user=${e} size=${72} />
      <div>
        <h2>${e.display_name||e.username}</h2>
        <p>@${e.username} · ${e.role}</p>
      </div>
    </div>
    <${ar} user=${e} />
    <${sr} user=${e} />
    <div class="profile-public-link">
      <a class="btn" href=${`/u/${encodeURIComponent(e.username)}`}>${M("external",{size:14})} View public profile</a>
    </div>
  </main>`:null}Q();async function rr(){let[e,t]=await Promise.all([y("/api/v1/auth/sessions"),y("/api/v1/auth/device-tokens")]);return{sessions:e,deviceTokens:t}}function or({item:e,onRevoke:t}){return o`<div class="management-item">
    <div>
      <strong>${e.user_agent||"Unknown browser"}</strong>
      <div class="meta-line">
        <span>${e.ip_address||"Unknown IP"}</span>
        <span>Last used ${K(e.last_used_at||e.created_at)}</span>
        <span>Expires ${K(e.expires_at)}</span>
      </div>
    </div>
    <div class="actions">
      ${e.current&&o`<span class="badge badge-public">Current</span>`}
      <button class="btn btn-danger" type="button" onClick=${()=>t(e)}>${M("x",{size:14})} Revoke</button>
    </div>
  </div>`}function ir({item:e,onRevoke:t}){let n=!!e.revoked_at;return o`<div class="management-item">
    <div>
      <strong>${e.name}</strong>
      <div class="meta-line">
        <span>Created ${K(e.created_at)}</span>
        <span>Last used ${K(e.last_used_at)}</span>
        ${e.expires_at&&o`<span>Expires ${K(e.expires_at)}</span>`}
        ${n&&o`<span>Revoked ${K(e.revoked_at)}</span>`}
      </div>
    </div>
    <div class="actions">
      <span class=${`badge ${n?"badge-private":"badge-public"}`}>${n?"Revoked":"Active"}</span>
      <button class="btn btn-danger" type="button" disabled=${n} onClick=${()=>t(e)}>${M("x",{size:14})} Revoke</button>
    </div>
  </div>`}function wa(){let[e,t]=_(null),[n,a]=_(null),[r,s]=_(0),[i,c]=_(null);S(()=>{let p=!0;return a(null),rr().then(b=>p&&t(b)).catch(b=>p&&a(b)),()=>{p=!1}},[r]);let d=()=>s(p=>p+1);async function u(){let p=i;c(null);try{if(p.kind==="session"){if(await y(`/api/v1/auth/sessions/${encodeURIComponent(p.item.id)}`,{method:"DELETE",body:{}}),p.item.current){de(null),A.set({user:null,csrfToken:null,ready:!0}),w("Current session revoked."),G("/login");return}w("Session revoked.")}else await y(`/api/v1/auth/device-tokens/${encodeURIComponent(p.item.id)}`,{method:"DELETE",body:{}}),w("Device token revoked.");d()}catch(b){w(b.message)}}return n?o`<main class="page"><${W} name="alert" title="Couldn't load account data" body=${n.message} /></main>`:o`<main class="page">
    <h1>Account</h1>
    <p class="page-subtitle">Sessions and device tokens.</p>
    ${e?o`<div class="account-grid">
          <div class="panel">
            <div class="section-header"><h2>Browser sessions</h2><span class="muted">${e.sessions.length} active</span></div>
            ${e.sessions.length?o`<div class="management-list">${e.sessions.map(p=>o`<${or} key=${p.id} item=${p}
                  onRevoke=${b=>c({kind:"session",item:b})} />`)}</div>`:o`<p class="muted">No active sessions.</p>`}
          </div>
          <div class="panel">
            <div class="section-header"><h2>Device tokens</h2><span class="muted">${e.deviceTokens.length} total</span></div>
            ${e.deviceTokens.length?o`<div class="management-list">${e.deviceTokens.map(p=>o`<${ir} key=${p.id} item=${p}
                  onRevoke=${b=>c({kind:"device",item:b})} />`)}</div>`:o`<p class="muted">No device tokens.</p>`}
          </div>
        </div>`:o`<p class="empty-state">Loading account data…</p>`}
    <${le} open=${!!i}
      title=${i?.kind==="session"?"Revoke browser session?":"Revoke device token?"}
      body=${i?.kind==="session"?i.item.current?"This signs you out of the current browser session.":"This signs out that browser session immediately.":"The desktop client using this token will need to reconnect."}
      confirmLabel="Revoke" danger
      onConfirm=${u} onCancel=${()=>c(null)} />
  </main>`}Q();function ka({route:e}){let{user:t}=H(A),[n,a]=_(null),[r,s]=_(null);if(S(()=>{let d=!0;return a(null),s(null),y(`/api/v1/public/users/${encodeURIComponent(e.username)}`).then(u=>d&&a(u)).catch(u=>d&&s(u)),()=>{d=!1}},[e.username]),r)return o`<main class="page"><${W} name="alert" title="Profile unavailable" body=${r.message} /></main>`;if(!n)return o`<main class="page"><p class="empty-state">Loading profile…</p></main>`;let i=t&&t.username.toLowerCase()===n.username.toLowerCase(),c=n.clips||[];return o`<main class="page">
    <header class="public-user-header">
      <${xe} user=${n} size=${72} />
      <div class="public-user-header-body">
        <div class="public-user-title-row">
          <div>
            <h1>${n.display_name||n.username}</h1>
            <p>@${n.username}</p>
          </div>
          ${i&&o`<a class="btn" href="/profile">${M("edit",{size:14})} Edit profile</a>`}
        </div>
        ${n.bio&&o`<p class="public-user-bio">${n.bio}</p>`}
        <p class="meta-line">${n.clip_count} public clip${n.clip_count===1?"":"s"}</p>
      </div>
    </header>
    ${c.length===0?o`<${W} name="film" title="No public clips yet" />`:o`<div class="card-grid">
          ${c.map(d=>o`<${Te} key=${d.share_id}
            clip=${{...d,thumbnail_url:ie(d),media_url:Ce(d)}}
            href=${`/c/${encodeURIComponent(d.share_id)}`} showAuthor=${!1} />`)}
        </div>`}
  </main>`}Q();var Sa="Clipline is a self-hosted clip library for saved gameplay moments.";function lt(e,t){return o`<div><dt>${e}</dt><dd>${t}</dd></div>`}function xa(){let[e,t]=_(Sa);return S(()=>{let n=!0;return y("/api/v1/about").then(a=>n&&t(a.about_text||Sa)).catch(()=>{}),()=>{n=!1}},[]),o`<main class="page">
    <h1>About</h1>
    <p class="page-subtitle">Clipline Cloud</p>
    <div class="panel about-panel">
      <h2>Clipline Cloud</h2>
      <p class="about-text">${e}</p>
      <dl class="ad-kv">
        ${lt("Home","Public clips that are ready for discovery.")}
        ${lt("Unlisted","Shareable by link, but not listed on Home.")}
        ${lt("Private","Visible only to the clip owner.")}
        ${lt("Media","Public and unlisted clips are not DRM-protected.")}
      </dl>
    </div>
  </main>`}var lr={publicLibrary:et,publicGame:et,games:On,library:Wn,clip:Et,public:Et,login:ca,resetPassword:ua,admin:va,profile:ya,account:wa,publicUser:ka,about:xa},Ca=Tn({pathname:window.location.pathname,search:window.location.search});function cr(){let e=Pn();Ca=e.name;let{ready:t,user:n}=H(A),a=t&&xn(e.name,n);if(S(()=>{a&&G("/login")},[a]),!t||a)return o`<div class="boot">Loading…</div>`;let r=lr[e.name]||et,s=e.name==="login"||e.name==="resetPassword";return o`<div class="ui" onClick=${En}>
    ${!s&&o`<${Dn} active=${kt(e)} route=${e} />`}
    <${r} route=${e} />
    ${!s&&o`<${Un} active=${Cn(e)} />`}
    <${Ln} />
  </div>`}window.addEventListener("clipline:unauthorized",()=>{de(null),A.set({user:null,csrfToken:null,ready:!0}),wt(Ca)||G("/login")});(async()=>{try{let t=await y("/api/v1/auth/me");de(t.csrf_token),A.set({user:t.user,csrfToken:t.csrf_token,ready:!0})}catch{de(null),A.set({user:null,csrfToken:null,ready:!0})}let e=document.querySelector("#app");e.textContent="",sn(o`<${cr} />`,e)})();
