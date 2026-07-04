var xa=Object.defineProperty;var Ca=(e,t)=>()=>(e&&(t=e(e=0)),t);var Ta=(e,t)=>{for(var n in t)xa(e,n,{get:t[n],enumerable:!0})};var yn={};Ta(yn,{ApiError:()=>_e,api:()=>k,getCsrfToken:()=>kt,setCsrfToken:()=>Pe});function Pe(e){Ge=e}function kt(){return Ge}async function k(e,t={}){let n=(t.method||"GET").toUpperCase(),a=new Headers(t.headers||{});a.set("Accept","application/json");let r=t.body;r&&typeof r!="string"&&(a.set("Content-Type","application/json"),r=JSON.stringify(r)),!["GET","HEAD","OPTIONS"].includes(n)&&Ge&&a.set("X-CSRF-Token",Ge);let s=await fetch(e,{...t,body:r,credentials:"same-origin",headers:a,method:n}),c=(s.headers.get("content-type")||"").includes("application/json")?await s.json():await s.text();if(!s.ok){s.status===401&&window.dispatchEvent(new CustomEvent("clipline:unauthorized"));let d=typeof c=="object"&&c?.error?c.error:s.statusText;throw new _e(d||"Request failed",s.status)}return c}var Ge,_e,X=Ca(()=>{Ge=null;_e=class extends Error{constructor(t,n){super(t),this.status=n}}});var Ve,U,Gt,Ma,fe,Vt,Wt,jt,dt,Ae,Te,Zt,ft,pt,mt,Pa,ze={},Be=[],Ea=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,He=Array.isArray;function pe(e,t){for(var n in t)e[n]=t[n];return e}function _t(e){e&&e.parentNode&&e.parentNode.removeChild(e)}function ht(e,t,n){var a,r,s,i={};for(s in t)s=="key"?a=t[s]:s=="ref"?r=t[s]:i[s]=t[s];if(arguments.length>2&&(i.children=arguments.length>3?Ve.call(arguments,2):n),typeof e=="function"&&e.defaultProps!=null)for(s in e.defaultProps)i[s]===void 0&&(i[s]=e.defaultProps[s]);return Ne(e,i,a,r,null)}function Ne(e,t,n,a,r){var s={type:e,props:t,key:n,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:r??++Gt,__i:-1,__u:0};return r==null&&U.vnode!=null&&U.vnode(s),s}function qe(e){return e.children}function Fe(e,t){this.props=e,this.context=t}function we(e,t){if(t==null)return e.__?we(e.__,e.__i+1):null;for(var n;t<e.__k.length;t++)if((n=e.__k[t])!=null&&n.__e!=null)return n.__e;return typeof e.type=="function"?we(e):null}function Ra(e){if(e.__P&&e.__d){var t=e.__v,n=t.__e,a=[],r=[],s=pe({},t);s.__v=t.__v+1,U.vnode&&U.vnode(s),bt(e.__P,s,t,e.__n,e.__P.namespaceURI,32&t.__u?[n]:null,a,n??we(t),!!(32&t.__u),r),s.__v=t.__v,s.__.__k[s.__i]=s,en(a,s,r),t.__e=t.__=null,s.__e!=n&&Jt(s)}}function Jt(e){if((e=e.__)!=null&&e.__c!=null)return e.__e=e.__c.base=null,e.__k.some(function(t){if(t!=null&&t.__e!=null)return e.__e=e.__c.base=t.__e}),Jt(e)}function Ht(e){(!e.__d&&(e.__d=!0)&&fe.push(e)&&!Oe.__r++||Vt!=U.debounceRendering)&&((Vt=U.debounceRendering)||Wt)(Oe)}function Oe(){try{for(var e,t=1;fe.length;)fe.length>t&&fe.sort(jt),e=fe.shift(),t=fe.length,Ra(e)}finally{fe.length=Oe.__r=0}}function Yt(e,t,n,a,r,s,i,c,d,u,p){var v,l,f,b,$,S,x,g=a&&a.__k||Be,E=t.length;for(d=Da(n,t,g,d,E),v=0;v<E;v++)(f=n.__k[v])!=null&&(l=f.__i!=-1&&g[f.__i]||ze,f.__i=v,S=bt(e,f,l,r,s,i,c,d,u,p),b=f.__e,f.ref&&l.ref!=f.ref&&(l.ref&&vt(l.ref,null,f),p.push(f.ref,f.__c||b,f)),$==null&&b!=null&&($=b),(x=!!(4&f.__u))||l.__k===f.__k?(d=Xt(f,d,e,x),x&&l.__e&&(l.__e=null)):typeof f.type=="function"&&S!==void 0?d=S:b&&(d=b.nextSibling),f.__u&=-7);return n.__e=$,d}function Da(e,t,n,a,r){var s,i,c,d,u,p=n.length,v=p,l=0;for(e.__k=new Array(r),s=0;s<r;s++)(i=t[s])!=null&&typeof i!="boolean"&&typeof i!="function"?(typeof i=="string"||typeof i=="number"||typeof i=="bigint"||i.constructor==String?i=e.__k[s]=Ne(null,i,null,null,null):He(i)?i=e.__k[s]=Ne(qe,{children:i},null,null,null):i.constructor===void 0&&i.__b>0?i=e.__k[s]=Ne(i.type,i.props,i.key,i.ref?i.ref:null,i.__v):e.__k[s]=i,d=s+l,i.__=e,i.__b=e.__b+1,c=null,(u=i.__i=Ua(i,n,d,v))!=-1&&(v--,(c=n[u])&&(c.__u|=2)),c==null||c.__v==null?(u==-1&&(r>p?l--:r<p&&l++),typeof i.type!="function"&&(i.__u|=4)):u!=d&&(u==d-1?l--:u==d+1?l++:(u>d?l--:l++,i.__u|=4))):e.__k[s]=null;if(v)for(s=0;s<p;s++)(c=n[s])!=null&&(2&c.__u)==0&&(c.__e==a&&(a=we(c)),nn(c,c));return a}function Xt(e,t,n,a){var r,s;if(typeof e.type=="function"){for(r=e.__k,s=0;r&&s<r.length;s++)r[s]&&(r[s].__=e,t=Xt(r[s],t,n,a));return t}e.__e!=t&&(a&&(t&&e.type&&!t.parentNode&&(t=we(e)),n.insertBefore(e.__e,t||null)),t=e.__e);do t=t&&t.nextSibling;while(t!=null&&t.nodeType==8);return t}function Ua(e,t,n,a){var r,s,i,c=e.key,d=e.type,u=t[n],p=u!=null&&(2&u.__u)==0;if(u===null&&c==null||p&&c==u.key&&d==u.type)return n;if(a>(p?1:0)){for(r=n-1,s=n+1;r>=0||s<t.length;)if((u=t[i=r>=0?r--:s++])!=null&&(2&u.__u)==0&&c==u.key&&d==u.type)return i}return-1}function qt(e,t,n){t[0]=="-"?e.setProperty(t,n??""):e[t]=n==null?"":typeof n!="number"||Ea.test(t)?n:n+"px"}function Ie(e,t,n,a,r){var s,i;e:if(t=="style")if(typeof n=="string")e.style.cssText=n;else{if(typeof a=="string"&&(e.style.cssText=a=""),a)for(t in a)n&&t in n||qt(e.style,t,"");if(n)for(t in n)a&&n[t]==a[t]||qt(e.style,t,n[t])}else if(t[0]=="o"&&t[1]=="n")s=t!=(t=t.replace(Zt,"$1")),i=t.toLowerCase(),t=i in e||t=="onFocusOut"||t=="onFocusIn"?i.slice(2):t.slice(2),e.l||(e.l={}),e.l[t+s]=n,n?a?n[Te]=a[Te]:(n[Te]=ft,e.addEventListener(t,s?mt:pt,s)):e.removeEventListener(t,s?mt:pt,s);else{if(r=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&t[4]!="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&n==1?"":n))}}function Kt(e){return function(t){if(this.l){var n=this.l[t.type+e];if(t[Ae]==null)t[Ae]=ft++;else if(t[Ae]<n[Te])return;return n(U.event?U.event(t):t)}}}function bt(e,t,n,a,r,s,i,c,d,u){var p,v,l,f,b,$,S,x,g,E,N,G,J,se,F,ee,L=t.type;if(t.constructor!==void 0)return null;128&n.__u&&(d=!!(32&n.__u),s=[c=t.__e=n.__e]),(p=U.__b)&&p(t);e:if(typeof L=="function"){v=i.length;try{if(g=t.props,E=L.prototype&&L.prototype.render,N=(p=L.contextType)&&a[p.__c],G=p?N?N.props.value:p.__:a,n.__c?x=(l=t.__c=n.__c).__=l.__E:(E?t.__c=l=new L(g,G):(t.__c=l=new Fe(g,G),l.constructor=L,l.render=Ia),N&&N.sub(l),l.state||(l.state={}),l.__n=a,f=l.__d=!0,l.__h=[],l._sb=[]),E&&l.__s==null&&(l.__s=l.state),E&&L.getDerivedStateFromProps!=null&&(l.__s==l.state&&(l.__s=pe({},l.__s)),pe(l.__s,L.getDerivedStateFromProps(g,l.__s))),b=l.props,$=l.state,l.__v=t,f)E&&L.getDerivedStateFromProps==null&&l.componentWillMount!=null&&l.componentWillMount(),E&&l.componentDidMount!=null&&l.__h.push(l.componentDidMount);else{if(E&&L.getDerivedStateFromProps==null&&g!==b&&l.componentWillReceiveProps!=null&&l.componentWillReceiveProps(g,G),t.__v==n.__v||!l.__e&&l.shouldComponentUpdate!=null&&l.shouldComponentUpdate(g,l.__s,G)===!1){t.__v!=n.__v&&(l.props=g,l.state=l.__s,l.__d=!1),t.__e=n.__e,t.__k=n.__k,t.__k.some(function(te){te&&(te.__=t)}),Be.push.apply(l.__h,l._sb),l._sb=[],l.__h.length&&i.push(l);break e}l.componentWillUpdate!=null&&l.componentWillUpdate(g,l.__s,G),E&&l.componentDidUpdate!=null&&l.__h.push(function(){l.componentDidUpdate(b,$,S)})}if(l.context=G,l.props=g,l.__P=e,l.__e=!1,J=U.__r,se=0,E)l.state=l.__s,l.__d=!1,J&&J(t),p=l.render(l.props,l.state,l.context),Be.push.apply(l.__h,l._sb),l._sb=[];else do l.__d=!1,J&&J(t),p=l.render(l.props,l.state,l.context),l.state=l.__s;while(l.__d&&++se<25);l.state=l.__s,l.getChildContext!=null&&(a=pe(pe({},a),l.getChildContext())),E&&!f&&l.getSnapshotBeforeUpdate!=null&&(S=l.getSnapshotBeforeUpdate(b,$)),F=p!=null&&p.type===qe&&p.key==null?tn(p.props.children):p,c=Yt(e,He(F)?F:[F],t,n,a,r,s,i,c,d,u),l.base=t.__e,t.__u&=-161,l.__h.length&&i.push(l),x&&(l.__E=l.__=null)}catch(te){if(i.length=v,t.__v=null,d||s!=null){if(te.then){for(t.__u|=d?160:128;c&&c.nodeType==8&&c.nextSibling;)c=c.nextSibling;s!=null&&(s[s.indexOf(c)]=null),t.__e=c}else if(s!=null)for(ee=s.length;ee--;)_t(s[ee])}else t.__e=n.__e;t.__k==null&&(t.__k=n.__k||[]),te.then||Qt(t),U.__e(te,t,n)}}else s==null&&t.__v==n.__v?(t.__k=n.__k,t.__e=n.__e):c=t.__e=La(n.__e,t,n,a,r,s,i,d,u);return(p=U.diffed)&&p(t),128&t.__u?void 0:c}function Qt(e){e&&(e.__c&&(e.__c.__e=!0),e.__k&&e.__k.some(Qt))}function en(e,t,n){for(var a=0;a<n.length;a++)vt(n[a],n[++a],n[++a]);U.__c&&U.__c(t,e),e.some(function(r){try{e=r.__h,r.__h=[],e.some(function(s){s.call(r)})}catch(s){U.__e(s,r.__v)}})}function tn(e){return typeof e!="object"||e==null||e.__b>0?e:He(e)?e.map(tn):e.constructor!==void 0?null:pe({},e)}function La(e,t,n,a,r,s,i,c,d){var u,p,v,l,f,b,$,S=n.props||ze,x=t.props,g=t.type;if(g=="svg"?r="http://www.w3.org/2000/svg":g=="math"?r="http://www.w3.org/1998/Math/MathML":r||(r="http://www.w3.org/1999/xhtml"),s!=null){for(u=0;u<s.length;u++)if((f=s[u])&&"setAttribute"in f==!!g&&(g?f.localName==g:f.nodeType==3)){e=f,s[u]=null;break}}if(e==null){if(g==null)return document.createTextNode(x);e=document.createElementNS(r,g,x.is&&x),c&&(U.__m&&U.__m(t,s),c=!1),s=null}if(g==null)S===x||c&&e.data==x||(e.data=x);else{if(s=g=="textarea"&&x.defaultValue!=null?null:s&&Ve.call(e.childNodes),!c&&s!=null)for(S={},u=0;u<e.attributes.length;u++)S[(f=e.attributes[u]).name]=f.value;for(u in S)f=S[u],u=="dangerouslySetInnerHTML"?v=f:u=="children"||u in x||u=="value"&&"defaultValue"in x||u=="checked"&&"defaultChecked"in x||Ie(e,u,null,f,r);for(u in x)f=x[u],u=="children"?l=f:u=="dangerouslySetInnerHTML"?p=f:u=="value"?b=f:u=="checked"?$=f:c&&typeof f!="function"||S[u]===f||Ie(e,u,f,S[u],r);if(p)c||v&&(p.__html==v.__html||p.__html==e.innerHTML)||(e.innerHTML=p.__html),t.__k=[];else if(v&&(e.innerHTML=""),Yt(t.type=="template"?e.content:e,He(l)?l:[l],t,n,a,g=="foreignObject"?"http://www.w3.org/1999/xhtml":r,s,i,s?s[0]:n.__k&&we(n,0),c,d),s!=null)for(u=s.length;u--;)_t(s[u]);c&&g!="textarea"||(u="value",g=="progress"&&b==null?e.removeAttribute("value"):b!=null&&(b!==e[u]||g=="progress"&&!b||g=="option"&&b!=S[u])&&Ie(e,u,b,S[u],r),u="checked",$!=null&&$!=e[u]&&Ie(e,u,$,S[u],r))}return e}function vt(e,t,n){try{if(typeof e=="function"){var a=typeof e.__u=="function";a&&e.__u(),a&&t==null||(e.__u=e(t))}else e.current=t}catch(r){U.__e(r,n)}}function nn(e,t,n){var a,r;if(U.unmount&&U.unmount(e),(a=e.ref)&&(a.current&&a.current!=e.__e||vt(a,null,t)),(a=e.__c)!=null){if(a.componentWillUnmount)try{a.componentWillUnmount()}catch(s){U.__e(s,t)}a.base=a.__P=a.__n=null}if(a=e.__k)for(r=0;r<a.length;r++)a[r]&&nn(a[r],t,n||typeof e.type!="function");n||_t(e.__e),e.__c=e.__=e.__e=void 0}function Ia(e,t,n){return this.constructor(e,n)}function an(e,t,n){var a,r,s,i;t==document&&(t=document.documentElement),U.__&&U.__(e,t),r=(a=typeof n=="function")?null:n&&n.__k||t.__k,s=[],i=[],bt(t,e=(!a&&n||t).__k=ht(qe,null,[e]),r||ze,ze,t.namespaceURI,!a&&n?[n]:r?null:t.firstChild?Ve.call(t.childNodes):null,s,!a&&n?n:r?r.__e:t.firstChild,a,i),en(s,e,i),e.props.children=null}Ve=Be.slice,U={__e:function(e,t,n,a){for(var r,s,i;t=t.__;)if((r=t.__c)&&!r.__)try{if((s=r.constructor)&&s.getDerivedStateFromError!=null&&(r.setState(s.getDerivedStateFromError(e)),i=r.__d),r.componentDidCatch!=null&&(r.componentDidCatch(e,a||{}),i=r.__d),i)return r.__E=r}catch(c){e=c}throw e}},Gt=0,Ma=function(e){return e!=null&&e.constructor===void 0},Fe.prototype.setState=function(e,t){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=pe({},this.state),typeof e=="function"&&(e=e(pe({},n),this.props)),e&&pe(n,e),e!=null&&this.__v&&(t&&this._sb.push(t),Ht(this))},Fe.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),Ht(this))},Fe.prototype.render=qe,fe=[],Wt=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,jt=function(e,t){return e.__v.__b-t.__v.__b},Oe.__r=0,dt=Math.random().toString(8),Ae="__d"+dt,Te="__a"+dt,Zt=/(PointerCapture)$|Capture$/i,ft=0,pt=Kt(!1),mt=Kt(!0),Pa=0;var Me,O,$t,sn,Ke=0,fn=[],H=U,rn=H.__b,on=H.__r,ln=H.diffed,cn=H.__c,un=H.unmount,dn=H.__;function yt(e,t){H.__h&&H.__h(O,e,Ke||t),Ke=0;var n=O.__H||(O.__H={__:[],__h:[]});return e>=n.__.length&&n.__.push({}),n.__[e]}function h(e){return Ke=1,Aa(bn,e)}function Aa(e,t,n){var a=yt(Me++,2);if(a.t=e,!a.__c&&(a.__=[n?n(t):bn(void 0,t),function(c){var d=a.__N?a.__N[0]:a.__[0],u=a.t(d,c);d!==u&&(a.__N=[u,a.__[1]],a.__c.setState({}))}],a.__c=O,!O.__f)){var r=function(c,d,u){if(!a.__c.__H)return!0;var p=!1,v=a.__c.props!==c;if(a.__c.__H.__.some(function(f){if(f.__N){p=!0;var b=f.__[0];f.__=f.__N,f.__N=void 0,b!==f.__[0]&&(v=!0)}}),s){var l=s.call(this,c,d,u);return p?l||v:l}return!p||v};O.__f=!0;var s=O.shouldComponentUpdate,i=O.componentWillUpdate;O.componentWillUpdate=function(c,d,u){if(this.__e){var p=s;s=void 0,r(c,d,u),s=p}i&&i.call(this,c,d,u)},O.shouldComponentUpdate=r}return a.__N||a.__}function C(e,t){var n=yt(Me++,3);!H.__s&&hn(n.__H,t)&&(n.__=e,n.u=t,O.__H.__h.push(n))}function A(e){return Ke=5,Na(function(){return{current:e}},[])}function Na(e,t){var n=yt(Me++,7);return hn(n.__H,t)&&(n.__=e(),n.__H=t,n.__h=e),n.__}function pn(){for(var e;e=fn.shift();){var t=e.__H;if(e.__P&&t)try{t.__h.some(gt),t.__h.some(_n),t.__h=[]}catch(n){t.__h=[],H.__e(n,e.__v)}}}H.__b=function(e){O=null,rn&&rn(e)},H.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),dn&&dn(e,t)},H.__r=function(e){on&&on(e),Me=0;var t=(O=e.__c).__H;t&&($t===O?(t.__h=[],O.__h=[],t.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(t.__h.length&&pn(),Me=0)),$t=O},H.diffed=function(e){ln&&ln(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(fn.push(t)!==1&&sn===H.requestAnimationFrame||((sn=H.requestAnimationFrame)||Fa)(pn)),t.__H.__.some(function(n){n.u&&(n.__H=n.u,n.u=void 0)})),$t=O=null},H.__c=function(e,t){t.some(function(n){try{n.__h.some(gt),n.__h=n.__h.filter(function(a){return!a.__||_n(a)})}catch(a){t.some(function(r){r.__h&&(r.__h=[])}),t=[],H.__e(a,n.__v)}}),cn&&cn(e,t)},H.unmount=function(e){un&&un(e);var t,n=e.__c;n&&n.__H&&(n.__H.__.some(function(a){try{gt(a)}catch(r){t=r}}),n.__H=void 0,t&&H.__e(t,n.__v))};var mn=typeof requestAnimationFrame=="function";function Fa(e){var t,n=function(){clearTimeout(a),mn&&cancelAnimationFrame(t),setTimeout(e)},a=setTimeout(n,35);mn&&(t=requestAnimationFrame(n))}function gt(e){var t=O,n=e.__c;typeof n=="function"&&(e.__c=void 0,n()),O=t}function _n(e){var t=O;e.__c=e.__(),O=t}function hn(e,t){return!e||e.length!==t.length||t.some(function(n,a){return n!==e[a]})}function bn(e,t){return typeof t=="function"?t(e):t}var $n=function(e,t,n,a){var r;t[0]=0;for(var s=1;s<t.length;s++){var i=t[s++],c=t[s]?(t[0]|=i?1:2,n[t[s++]]):t[++s];i===3?a[0]=c:i===4?a[1]=Object.assign(a[1]||{},c):i===5?(a[1]=a[1]||{})[t[++s]]=c:i===6?a[1][t[++s]]+=c+"":i?(r=e.apply(c,$n(e,c,n,["",null])),a.push(r),c[0]?t[0]|=2:(t[s-2]=0,t[s]=r)):a.push(c)}return a},vn=new Map;function gn(e){var t=vn.get(this);return t||(t=new Map,vn.set(this,t)),(t=$n(this,t.get(e)||(t.set(e,t=(function(n){for(var a,r,s=1,i="",c="",d=[0],u=function(l){s===1&&(l||(i=i.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?d.push(0,l,i):s===3&&(l||i)?(d.push(3,l,i),s=2):s===2&&i==="..."&&l?d.push(4,l,0):s===2&&i&&!l?d.push(5,0,!0,i):s>=5&&((i||!l&&s===5)&&(d.push(s,0,i,r),s=6),l&&(d.push(s,l,0,r),s=6)),i=""},p=0;p<n.length;p++){p&&(s===1&&u(),u(p));for(var v=0;v<n[p].length;v++)a=n[p][v],s===1?a==="<"?(u(),d=[d],s=3):i+=a:s===4?i==="--"&&a===">"?(s=1,i=""):i=a+i[0]:c?a===c?c="":i+=a:a==='"'||a==="'"?c=a:a===">"?(u(),s=1):s&&(a==="="?(s=5,r=i,i=""):a==="/"&&(s<5||n[p][v+1]===">")?(u(),s===3&&(d=d[0]),s=d,(d=d[0]).push(2,0,s),s=0):a===" "||a==="	"||a===`
`||a==="\r"?(u(),s=2):i+=a),s===3&&i==="!--"&&(s=4,d=d[0])}return u(),d})(e)),t),arguments,[])).length>1?t:t[0]}var o=gn.bind(ht);X();function kn(e){let t=e,n=new Set;return{get:()=>t,set(a){t=a,n.forEach(r=>r(t))},update(a){this.set(a(t))},subscribe(a){return n.add(a),()=>n.delete(a)}}}function q(e){let[t,n]=h(e.get());return C(()=>e.subscribe(n),[e]),t}var D=kn({user:null,csrfToken:null,ready:!1}),We=kn([]),za=0;function w(e,{actionLabel:t,onAction:n,timeoutMs:a=5e3}={}){let r=++za;return We.update(s=>[...s,{id:r,message:e,actionLabel:t,onAction:n}]),a&&setTimeout(()=>je(r),a),r}function je(e){We.update(t=>t.filter(n=>n.id!==e))}function Ze(e){try{return decodeURIComponent(e)}catch{return e}}function wn(e){let t=Number(e.get("page")||1);return{sort:e.get("sort")||"uploaded_at_desc",game:e.get("game")||"",q:e.get("q")||"",page:Number.isFinite(t)?Math.max(1,t):1}}var Ba=["login","resetPassword","public","publicLibrary","publicGame","publicUser","about","games"];function wt(e){return Ba.includes(e)}function Sn(e,t){return!t&&!wt(e)}var Oa={publicLibrary:"feed",publicGame:"feed",games:"games",library:"library",clip:"library",admin:"admin",profile:"profile"};function St(e){return Oa[e?.name]||""}function xn(e){return e?.name==="publicLibrary"&&e.surface==="search"?"search":St(e)}function Je(e,t){let n=new URLSearchParams(t||""),a=e;return a.startsWith("/c/")?{name:"public",shareId:Ze(a.slice(3))}:a==="/"||a==="/public"||a==="/search"?{name:"publicLibrary",query:wn(n),surface:a==="/search"?"search":"feed"}:a.startsWith("/game/")?{name:"publicGame",game:Ze(a.slice(6)),query:wn(n)}:a==="/about"?{name:"about"}:a==="/games"?{name:"games"}:a.startsWith("/u/")?{name:"publicUser",username:Ze(a.slice(3))}:a==="/library"?{name:"library"}:a.startsWith("/clip/")?{name:"clip",clipId:Ze(a.slice(6))}:a==="/admin"?{name:"admin",tab:n.get("tab")||"overview"}:a==="/account"?{name:"account"}:a==="/profile"?{name:"profile"}:a==="/login"?{name:"login"}:a==="/reset-password"?{name:"resetPassword",token:n.get("token")||"",invite:n.get("invite")==="1"}:{name:"publicLibrary"}}function Cn(e){return Je(e.pathname,e.search).name}var xt=new Set;function W(e){window.history.pushState({},"",e),Tn()}function Tn(){let{pathname:e,search:t}=window.location,n=Je(e,t);xt.forEach(a=>a(n))}window.addEventListener("popstate",Tn);function Mn(){let[e,t]=h(()=>Je(window.location.pathname,window.location.search));return C(()=>(xt.add(t),()=>xt.delete(t)),[]),e}function Pn(e){let t=e.target.closest("a[href^='/']");!t||t.target||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||(e.preventDefault(),W(t.getAttribute("href")))}var En={alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',clipboard:'<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',copy:'<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',external:'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',fastForward:'<path d="m13 19 9-7-9-7v14Z"/><path d="m2 19 9-7-9-7v14Z"/>',film:'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 8h4"/><path d="M3 16h4"/><path d="M17 8h4"/><path d="M17 16h4"/>',fullscreen:'<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/><path d="M12 2a15.3 15.3 0 0 0 0 20"/>',home:'<path d="m3 10 9-7 9 7"/><path d="M5 8.5V20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5"/><path d="M9 22V12h6v10"/>',info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',library:'<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',lock:'<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',logOut:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',menu:'<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',message:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>',notepad:'<path d="M8 2v4"/><path d="M16 2v4"/><path d="M3 10h18"/><path d="M6 4h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/><path d="M8 14h8"/><path d="M8 18h5"/>',pause:'<path d="M8 5v14"/><path d="M16 5v14"/>',play:'<path d="m8 5 11 7-11 7V5Z"/>',plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',check:'<path d="M20 6 9 17l-5-5"/>',refresh:'<path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/><path d="M3 12A9 9 0 0 1 18.5 5.7L21 8"/><path d="M21 3v5h-5"/>',rewind:'<path d="m11 19-9-7 9-7v14Z"/><path d="m22 19-9-7 9-7v14Z"/>',save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',server:'<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',skipBack:'<path d="M19 20 9 12l10-8v16Z"/><path d="M5 19V5"/>',skipForward:'<path d="m5 4 10 8-10 8V4Z"/><path d="M19 5v14"/>',shield:'<path d="M20 13c0 5-3.5 7.5-7.7 8.8a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V5l8-3 8 3v8Z"/>',sliders:'<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>',theater:'<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M6 9h12"/><path d="M6 15h12"/>',trash:'<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',volume2:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9 9 0 0 1 0 14"/>',volumeX:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>',x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'};function T(e,{size:t=18}={}){return o`<svg viewBox="0 0 24 24" width=${t} height=${t} fill="none"
    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" dangerouslySetInnerHTML=${{__html:En[e]||""}} />`}function Va(e){return e?.query?.q||""}function Ha(e,t){let n=new URLSearchParams,a=String(t||"").trim(),r=e?.name==="publicGame"?e.game:e?.query?.game||"";a&&n.set("q",a),r&&n.set("game",r);let s=n.toString();return s?`/search?${s}`:"/search"}function Rn({active:e,route:t}){let{user:n}=q(D),[a,r]=h(!1),s=A(null),i=Va(t),[c,d]=h(i);C(()=>{d(i)},[i]);let u=n?.role==="admin"||n?.role==="owner";C(()=>{if(!a)return;let l=b=>{s.current?.contains(b.target)||r(!1)},f=b=>{b.key==="Escape"&&r(!1)};return document.addEventListener("pointerdown",l),document.addEventListener("keydown",f),()=>{document.removeEventListener("pointerdown",l),document.removeEventListener("keydown",f)}},[a]);let p=[["feed","/","Feed"],["library","/library","Library",!!n],["games","/games","Games"],["admin","/admin","Admin",u]].filter(([,,,l])=>l!==!1),v=l=>{l.preventDefault();let f=new FormData(l.target).get("q")?.toString()||"";W(Ha(t,f))};return o`<header class="topbar">
    <a class="wordmark" href="/" aria-label="Clipline home">
      <img src="/clipline-icon.svg" alt="" width="24" height="24" />
      CLIP<b>LINE</b>
    </a>
    <nav class="topnav" aria-label="Primary">
      ${p.map(([l,f,b])=>o`
        <a class=${l===e?"topnav-on":""} href=${f}>${b}</a>`)}
    </nav>
    <form class="topsearch" role="search" onSubmit=${v}>
      <input class="input" name="q" value=${c} onInput=${l=>d(l.target.value)}
        placeholder="Search clips, games, players…" aria-label="Search" />
    </form>
    ${n?o`<div class="avatar-wrap" ref=${s}>
          <button class="avatar-btn" aria-haspopup="menu" aria-expanded=${a}
            onClick=${()=>r(!a)}>
            <span class="avatar">${(n.display_name||n.username)[0].toUpperCase()}</span>
          </button>
          ${a&&o`<div class="menu" role="menu" onClick=${()=>r(!1)}>
            <a role="menuitem" href="/profile">Profile</a>
            <a role="menuitem" href="/account">Account</a>
            ${u&&o`<a role="menuitem" href="/admin">Admin</a>`}
            <button role="menuitem" class="menu-danger" onClick=${qa}>Sign out</button>
          </div>`}
        </div>`:o`<a class="btn" href="/login">${T("lock",{size:14})} Sign in</a>`}
  </header>`}async function qa(){let{api:e}=await Promise.resolve().then(()=>(X(),yn));try{await e("/api/v1/auth/logout",{method:"POST"})}catch{}D.set({user:null,csrfToken:null,ready:!0}),W("/login")}var Ka=[["feed","/","home","Feed",!0],["games","/games","globe","Games",!0],["library","/library","library","Library","auth"],["search","/search","search","Search",!0],["profile","/profile","user","Profile","auth"]];function Ga(e){return Ka.filter(([,,,,t])=>t!=="auth"||!!e)}function Dn({active:e}){let{user:t}=q(D),n=Ga(t);return o`<nav class="tabbar" aria-label="Primary">
    ${n.map(([a,r,s,i])=>o`
      <a class=${a===e?"tab-on":""} href=${r}>${T(s)}<span>${i}</span></a>`)}
  </nav>`}function Un(){let e=q(We);return o`<div class="toasts" role="status" aria-live="polite">
    ${e.map(t=>o`<div class="toast" key=${t.id}>
      <span>${t.message}</span>
      ${t.actionLabel&&o`<button class="toast-action"
        onClick=${()=>{t.onAction?.(),je(t.id)}}>${t.actionLabel}</button>`}
      <button class="toast-x" aria-label="Dismiss" onClick=${()=>je(t.id)}>✕</button>
    </div>`)}
  </div>`}X();function j(e){if(!e)return"Unknown";let t=new Date(e);return Number.isNaN(t.getTime())?"Unknown":new Intl.DateTimeFormat(void 0,{dateStyle:"medium",timeStyle:"short"}).format(t)}function he(e){if(e==null)return"Unknown";let t=Math.max(0,Math.round(Number(e)/1e3)),n=Math.floor(t/60),a=t%60;return`${n}:${String(a).padStart(2,"0")}`}function Ye(e){if(!e)return"Unknown";let t=new Date(e);if(Number.isNaN(t.getTime()))return"Unknown";let n=Math.min(0,t.getTime()-Date.now()),a=[["year",365*24*60*60*1e3],["month",720*60*60*1e3],["week",10080*60*1e3],["day",1440*60*1e3],["hour",3600*1e3],["minute",60*1e3],["second",1e3]],[r,s]=a.find(([,c])=>Math.abs(n)>=c)||a[a.length-1],i=Math.round(n/s);return new Intl.RelativeTimeFormat(void 0,{numeric:"always"}).format(i,r)}function K(e){if(e==null)return"Unknown";let t=Number(e);if(!Number.isFinite(t))return"Unknown";let n=["B","KiB","MiB","GiB","TiB"],a=t,r=0;for(;a>=1024&&r<n.length-1;)a/=1024,r+=1;return`${a.toFixed(r===0?0:1)} ${n[r]}`}function ve(e){let t=Number(e||0),n=Number.isFinite(t)&&t>0?Math.floor(t):0;return`${new Intl.NumberFormat(void 0,{notation:n>=1e4?"compact":"standard"}).format(n)} view${n===1?"":"s"}`}function re(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/thumbnail`}function Ee(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/thumbnail`}function Xe(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/media`}function Se(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/media`}function Re(e,t,n){if(e)try{return`${t}${new URL(e).pathname}`}catch{}return n?`${t}/c/${encodeURIComponent(n)}`:null}var Qe=null;function Ln(e){Qe?.(),Qe=e}function In(e){Qe===e&&(Qe=null)}var Wa=()=>window.matchMedia("(pointer: fine)").matches&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches&&!navigator.connection?.saveData;function An({src:e,poster:t,alt:n=""}){let[a,r]=h(!1),[s,i]=h(0),c=A(null),d=A(null),u=A(!0),p=A(),v=()=>{u.current&&(clearTimeout(c.current),r(!1),i(0))};p.current=v;let l=()=>{!e||!Wa()||(c.current=setTimeout(()=>{u.current&&(Ln(p.current),r(!0))},300))},f=b=>{let $=b.target;$.duration&&i($.currentTime/$.duration)};return C(()=>()=>{u.current=!1,clearTimeout(c.current),In(p.current)},[]),o`<span class="hover-preview" onPointerEnter=${l} onPointerLeave=${v}>
    ${a?o`<video ref=${d} src=${e} poster=${t} muted loop autoplay
          playsinline preload="none" onTimeUpdate=${f} />`:o`<img src=${t} alt=${n} loading="lazy" />`}
    ${a&&o`<span class="preview-scrub"><span style=${`width:${s*100}%`} /></span>`}
  </span>`}function Ct(e){return e.owner?.display_name||e.owner?.username||e.owner_username||e.author_name||e.author_username||null}function xe({clip:e,href:t,selectable:n=!1,selected:a=!1,onToggleSelect:r,showVisibility:s=!1,showAuthor:i=!1}){let c=Ct(e),d=[e.game_name&&o`<em>${e.game_name}</em>`,i&&c,e.view_count!=null&&ve(e.view_count),e.uploaded_at&&Ye(e.uploaded_at)].filter(Boolean);return o`<article class=${`clip-card ${a?"is-selected":""} ${n?"is-selectable":""}`}>
    <a class="card-thumb" href=${t} tabindex="-1" aria-hidden="true">
      <${An} src=${e.media_url} poster=${e.thumbnail_url} />
      ${e.duration_ms!=null&&o`<span class="dur-pill">${he(e.duration_ms)}</span>`}
      ${s&&o`<span class=${`badge badge-${e.visibility} card-vis`}>${e.visibility}</span>`}
    </a>
    ${n&&o`<label class="card-check">
      <input type="checkbox" checked=${a} aria-label=${`Select ${e.title}`}
        onChange=${()=>r?.(e.id)} />
    </label>`}
    <h3 class="card-title"><a href=${t}>${e.title}</a></h3>
    <p class="card-meta">${d.map((u,p)=>o`${p>0&&" \xB7 "}${u}`)}</p>
  </article>`}function Z({name:e="film",title:t,body:n,action:a}){return o`<div class="empty">
    <div class="empty-icon">${T(e,{size:28})}</div>
    <h3>${t}</h3>
    ${n&&o`<p>${n}</p>`}
    ${a}
  </div>`}var ja=[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]],Za=6,Ja=60;function Ya(e){let t=new URLSearchParams;return t.set("page_size",String(Ja)),e.sort!=="uploaded_at_desc"&&t.set("sort",e.sort),e.game&&t.set("game",e.game),e.q&&t.set("q",e.q),Number(e.page)>1&&t.set("page",String(e.page)),t}function Nn(e){return e?.game_name||"No game"}function et({route:e}){let t={sort:"uploaded_at_desc",page:1,q:"",...e.query,game:e.name==="publicGame"?e.game:e.query?.game||""},[n,a]=h(null),[r,s]=h([]),[i,c]=h(null);C(()=>{let $=!0;a(null),c(null);let S=Ya(t);return k(`/api/v1/public/clips?${S}`).then(x=>$&&a(x)).catch(x=>$&&c(x)),()=>{$=!1}},[e.name,t.sort,t.game,t.q,t.page]),C(()=>{let $=!0;return k("/api/v1/public/games").then(S=>$&&s(S.games||[])).catch(()=>{}),()=>{$=!1}},[]);let d=$=>W(es({...t,page:1,...$}));if(i)return o`<main class="page">
      <${Z} name="alert" title="Couldn't load the feed" body=${i.message} />
    </main>`;let u=n?.clips,p=!!(t.game||t.q)||Number(t.page)>1,v=!p,l=[...r].sort(($,S)=>(S.clip_count||0)-($.clip_count||0)),f=l.slice(0,Za),b=l.length-f.length;return o`<main class="page">
    ${u==null?o`<${Qa} />`:u.length===0?o`<${Z} name="film"
          title=${p?"No clips match this filter":"No public clips yet"}
          body=${p?"Try a different game, search, or clear your filters.":"Clips shared as public from a library will show up here."}
          action=${p&&o`<a class="btn" href="/">Clear filters</a>`} />`:o`
        ${v?Xa(u):""}
        <div class="feed-toolbar">
          <h2>Latest uploads</h2>
          <select class="input" value=${t.sort} onChange=${$=>d({sort:$.target.value})}>
            ${ja.map(([$,S])=>o`<option value=${$}>${S}</option>`)}
          </select>
          <div class="chips">
            <button class=${`chip ${t.game?"":"chip-on"}`} onClick=${()=>d({game:""})}>All</button>
            ${f.map($=>o`<button
              class=${`chip ${t.game===$.game?"chip-on":""}`}
              onClick=${()=>d({game:$.game})}>${$.game}</button>`)}
            ${b>0&&o`<a class="chip" href="/games">+${b}</a>`}
          </div>
        </div>
        <div class="card-grid">
          ${(v?u.slice(4):u).map($=>o`<${xe} clip=${{...$,thumbnail_url:re($),media_url:Se($)}}
              href=${Tt($)} showAuthor />`)}
        </div>
        ${ts(n,t,d)}
      `}
  </main>`}function Xa(e){let[t,...n]=e,a=n.slice(0,3);return o`<p class="kicker">Now playing on this server</p>
    <section class="hero">
      <a class="hero-main" href=${Tt(t)}>
        <img src=${re(t)} alt="" loading="lazy" />
        <span class="hero-caption">▶ ${t.title} — ${Nn(t)} · ${he(t.duration_ms)}</span>
      </a>
      <div class="hero-side">
        ${a.map(r=>o`<a class="hero-row" href=${Tt(r)}>
            <img src=${re(r)} alt="" loading="lazy" />
            <span><b>${r.title}</b>
              <small>${Ct(r)} · ${Nn(r)} · ${ve(r.view_count)}</small></span>
          </a>`)}
      </div>
    </section>`}function Qa({count:e=8}){return o`<div class="card-grid">
    ${Array.from({length:e},(t,n)=>o`<div class="clip-card" key=${n}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`}function Tt(e){return`/c/${encodeURIComponent(e.share_id)}`}function es({sort:e="uploaded_at_desc",game:t="",q:n="",page:a=1}={}){let r=new URLSearchParams,s=e||"uploaded_at_desc",i=String(t||"").trim(),c=String(n||"").trim(),d=Math.max(1,Number(a||1));if(s!=="uploaded_at_desc"&&r.set("sort",s),d>1&&r.set("page",String(d)),c)return r.set("q",c),i&&r.set("game",i),`/search?${r.toString()}`;if(i){let p=r.toString();return`/game/${encodeURIComponent(i)}${p?`?${p}`:""}`}let u=r.toString();return u?`/search?${u}`:"/"}function ts(e,t,n){let a=Math.max(1,Number(t.page||1)),r=!!e?.has_more;return a<=1&&!r?"":o`<nav class="pager" aria-label="Public clip pages">
    <button class="btn" type="button" disabled=${a<=1}
      onClick=${()=>n({page:a-1})}>Previous</button>
    <span class="muted">Page ${a}</span>
    <button class="btn" type="button" disabled=${!r}
      onClick=${()=>n({page:a+1})}>Next</button>
  </nav>`}X();function Fn(){let[e,t]=h(null),[n,a]=h(null);return C(()=>{let r=!0;return k("/api/v1/public/games").then(s=>r&&t(s.games||[])).catch(s=>r&&a(s)),()=>{r=!1}},[]),n?o`<main class="page">
      <${Z} name="alert" title="Couldn't load games" body=${n.message} />
    </main>`:o`<main class="page">
    <p class="kicker">Browse by game</p>
    ${e==null?o`<div class="game-grid">
          ${Array.from({length:6},(r,s)=>o`<div class="game-tile is-loading" key=${s}>
            <div class="skeleton-thumb"></div>
          </div>`)}
        </div>`:e.length===0?o`<${Z} name="film" title="No games yet"
          body="Once clips are shared as public, their games will show up here." />`:o`<div class="game-grid">
          ${e.map(r=>o`<a class="game-tile" href=${`/game/${encodeURIComponent(r.game)}`}>
            ${r.thumbnail_url?o`<img src=${r.thumbnail_url} alt="" loading="lazy" />`:o`<div class="game-tile-fallback">${(r.game||"?")[0].toUpperCase()}</div>`}
            <div class="game-tile-body">
              <b>${r.game}</b>
              <small>${r.clip_count} clip${r.clip_count===1?"":"s"}</small>
            </div>
          </a>`)}
        </div>`}
  </main>`}X();function zn({trigger:e,content:t,onClose:n,label:a,panelClass:r=""}){let[s,i]=h(!1),c=A(null),d=A(null),u=A(null),p=()=>{i(!1),n?.()},v=()=>{if(s){p();return}u.current=document.activeElement,i(!0)};return C(()=>{if(!s)return;let l=$=>{c.current?.contains($.target)||p()},f=$=>{$.key==="Escape"&&p()};return document.addEventListener("pointerdown",l),document.addEventListener("keydown",f),d.current?.querySelector("input, select, textarea, button, a[href], [tabindex]")?.focus(),()=>{document.removeEventListener("pointerdown",l),document.removeEventListener("keydown",f),u.current?.focus?.()}},[s]),o`<div class="popover-wrap" ref=${c}>
    ${e({open:s,toggle:v})}
    ${s&&o`<div class=${`popover ${r}`} ref=${d} role="dialog" aria-label=${a||"Filters"}>
      ${t}
    </div>`}
  </div>`}function Bn({count:e,busy:t=!1,onPublic:n,onPrivate:a,onCopyLinks:r,onDelete:s,onClear:i}){return e?o`<div class="bulkbar" role="toolbar" aria-label="Bulk actions" aria-busy=${t?"true":"false"}>
    <b>${e} selected</b>
    <button class="btn" disabled=${t} onClick=${n}>Make public</button>
    <button class="btn" disabled=${t} onClick=${a}>Make private</button>
    <button class="btn" disabled=${t} onClick=${r}>Copy links</button>
    <button class="btn btn-danger" disabled=${t} onClick=${s}>Delete</button>
    <button class="btn bulk-x" disabled=${t} aria-label="Clear selection" onClick=${i}>✕</button>
  </div>`:null}function ie({open:e,title:t,body:n,confirmLabel:a="Confirm",onConfirm:r,onCancel:s,danger:i=!1,confirmDisabled:c=!1}){let d=A(null),u=A(null);return C(()=>{let p=d.current;p&&(e&&!p.open?(p.showModal(),u.current?.focus()):!e&&p.open&&p.close())},[e]),o`<dialog ref=${d} class="confirm-dialog" aria-labelledby="confirm-dialog-title"
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
  </dialog>`}var Hn="clipline.libraryView",ns=[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["updated_at_desc","Updated newest"],["updated_at_asc","Updated oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["size_desc","Size largest"],["size_asc","Size smallest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]],tt={title:["title_asc","title_desc"],size:["size_asc","size_desc"],duration:["duration_asc","duration_desc"],uploaded:["uploaded_at_asc","uploaded_at_desc"]},as=["visibility","status","source_type","from","to","min_duration_seconds","max_duration_seconds","min_size_mib","max_size_mib"],st={sort:"uploaded_at_desc",game:"",source_type:"",visibility:"",status:"",q:"",from:"",to:"",min_duration_seconds:"",max_duration_seconds:"",min_size_mib:"",max_size_mib:""};function nt(e){if(e===""||e==null)return null;let t=Number(e);return Number.isFinite(t)?t:null}function ss(e){let t=new URLSearchParams;t.set("sort",e.sort||st.sort),t.set("page_size","100");for(let i of["game","source_type","visibility","status","q"])e[i]&&t.set(i,e[i]);e.from&&t.set("from",`${e.from}T00:00:00Z`),e.to&&t.set("to",`${e.to}T23:59:59Z`);let n=nt(e.min_duration_seconds);n!=null&&t.set("min_duration_ms",String(Math.round(n*1e3)));let a=nt(e.max_duration_seconds);a!=null&&t.set("max_duration_ms",String(Math.round(a*1e3)));let r=nt(e.min_size_mib);r!=null&&t.set("min_size_bytes",String(Math.round(r*1024*1024)));let s=nt(e.max_size_mib);return s!=null&&t.set("max_size_bytes",String(Math.round(s*1024*1024))),t}function rs(e){return as.reduce((t,n)=>t+(e[n]?1:0),0)}function os(e,t=6){let n=new Map;for(let a of e){let r=a.game_name;r&&n.set(r,(n.get(r)||0)+1)}return Array.from(n,([a,r])=>({game:a,count:r})).sort((a,r)=>r.count-a.count||a.game.localeCompare(r.game)).slice(0,t)}function On(e,t,{verb:n,allFailedMessage:a}){let r=e.filter(i=>!t.some(c=>c.id===i));if(!t.length)return{succeeded:r,message:null};let s=t.length===e.length?t[0]?.message||a:`Couldn't ${n} ${t.length} of ${e.length} clips.`;return{succeeded:r,message:s}}function is(e,t){return(e||[]).map(n=>Re(n.public_url,t,n.public_share_id)).filter(Boolean)}async function Vn(e,t,n){let a=0;async function r(){let s=a++;if(!(s>=e.length))return await n(e[s]),r()}await Promise.all(Array.from({length:Math.min(t,e.length)},r))}function ls(){try{return localStorage.getItem(Hn)==="rows"?"rows":"grid"}catch{return"grid"}}function qn(){let[e,t]=h(ls),[n,a]=h(st),[r,s]=h(st.q),[i,c]=h(null),[d,u]=h(null),[p,v]=h(new Set),[l,f]=h(!1),[b,$]=h(!1),[S,x]=h(0),g=A(!1),E=A(null);C(()=>()=>clearTimeout(E.current),[]),C(()=>{let m=!0;return c(null),u(null),k(`/api/v1/clips?${ss(n)}`).then(y=>{m&&(c(y),v(new Set))}).catch(y=>m&&u(y)),()=>{m=!1}},[JSON.stringify(n),S]);let N=m=>{t(m);try{localStorage.setItem(Hn,m)}catch{}},G=()=>x(m=>m+1),J=m=>{g.current=m,f(m)},se=m=>{let y=m.target.value;s(y),clearTimeout(E.current),E.current=setTimeout(()=>{a(P=>({...P,q:y}))},300)},F=m=>y=>{let P=y.target.value;a(R=>({...R,[m]:P}))},ee=()=>{a(m=>({...m,visibility:"",status:"",source_type:"",from:"",to:"",min_duration_seconds:"",max_duration_seconds:"",min_size_mib:"",max_size_mib:""}))},L=m=>a(y=>({...y,game:y.game===m?"":m})),te=m=>a(y=>({...y,sort:m})),$e=m=>{v(y=>{let P=new Set(y);return P.has(m)?P.delete(m):P.add(m),P})};function ne(m,y){c(P=>P&&{...P,clips:P.clips.map(R=>R.id===m?{...R,...y}:R)})}function le(m,y){let P=new Set(m);c(R=>R&&{...R,clips:R.clips.map(z=>P.has(z.id)?{...z,...y}:z)})}async function me(m){if(g.current)return;let y=Array.from(p);if(!y.length)return;let P=i?.clips||[],R=new Map(y.map(B=>[B,P.find(ae=>ae.id===B)]));J(!0),le(y,{visibility:m});let z=[],V=new Map;try{await Vn(y,4,async _=>{try{let M=await k(`/api/v1/clips/${encodeURIComponent(_)}/visibility`,{method:"POST",body:{visibility:m}}),I={visibility:M.visibility,public_url:M.public_url,public_share_id:M.public_share_id};ne(_,I),V.set(_,I)}catch(M){z.push({id:_,message:M.message})}});let{succeeded:B,message:ae}=On(y,z,{verb:"update",allFailedMessage:"Couldn't update visibility."});if(ae){for(let{id:_}of z){let M=R.get(_);M&&ne(_,{visibility:M.visibility,public_url:M.public_url,public_share_id:M.public_share_id})}w(ae)}B.length&&(v(new Set),w(`Made ${B.length} clip${B.length===1?"":"s"} ${m}`,{actionLabel:"Undo",onAction:()=>ge(B,R,V)}))}finally{J(!1)}}async function ge(m,y,P){if(g.current){w("Wait for visibility changes to finish.");return}J(!0);try{for(let V of m){let B=y.get(V);B&&ne(V,{visibility:B.visibility,public_url:B.public_url,public_share_id:B.public_share_id})}let R=[];await Vn(m,4,async V=>{let B=y.get(V);if(B)try{let ae=await k(`/api/v1/clips/${encodeURIComponent(V)}/visibility`,{method:"POST",body:{visibility:B.visibility}});ne(V,{visibility:ae.visibility,public_url:ae.public_url,public_share_id:ae.public_share_id})}catch(ae){R.push({id:V,message:ae.message})}});let{message:z}=On(m,R,{verb:"undo",allFailedMessage:"Couldn't undo visibility change."});if(z){for(let{id:V}of R){let B=P.get(V);B&&ne(V,B)}w(z)}}finally{J(!1)}}async function ce(){if(g.current){w("Wait for visibility changes to finish.");return}let m=Array.from(p),y=i?.clips||[],P=m.map(V=>y.find(B=>B.id===V)).filter(Boolean),R=is(P,window.location.origin),z=P.length-R.length;if(!R.length){w("No links to copy \u2014 selected clips are private.");return}try{await navigator.clipboard.writeText(R.join(`
`)),w(`Copied ${R.length} link${R.length===1?"":"s"}`+(z?` (${z} skipped, private)`:""))}catch{w("Couldn't copy links to clipboard.")}}async function ue(){let m=Array.from(p);$(!1);try{let y=await k("/api/v1/clips/bulk-delete",{method:"POST",body:{ids:m}});v(new Set),G(),w(`Deleted ${y.affected} clip${y.affected===1?"":"s"}.`)}catch(y){w(y.message)}}if(d)return o`<main class="page">
      <${Z} name="alert" title="Couldn't load your library" body=${d.message} />
    </main>`;let Y=i?.clips,oe=rs(n),de=!!(n.q||n.game)||oe>0,ye=os(Y||[]),be=(Y||[]).reduce((m,y)=>m+(y.file_size_bytes||0),0),ke=o`<div class="popover-fields">
    <label class="field"><span>Visibility</span>
      <select class="input" value=${n.visibility} onChange=${F("visibility")}>
        <option value="">Any</option>
        <option value="private">Private</option>
        <option value="public">Public</option>
        <option value="unlisted">Unlisted</option>
      </select>
    </label>
    <label class="field"><span>Status</span>
      <select class="input" value=${n.status} onChange=${F("status")}>
        <option value="">Any</option>
        <option value="created">Created</option>
        <option value="uploading">Uploading</option>
        <option value="processing">Processing</option>
        <option value="ready">Ready</option>
        <option value="failed">Failed</option>
      </select>
    </label>
    <label class="field"><span>Source</span>
      <input class="input" type="text" value=${n.source_type} onInput=${F("source_type")} placeholder="Source type" />
    </label>
    <label class="field"><span>From</span>
      <input class="input" type="date" value=${n.from} onInput=${F("from")} />
    </label>
    <label class="field"><span>To</span>
      <input class="input" type="date" value=${n.to} onInput=${F("to")} />
    </label>
    <label class="field"><span>Min duration (s)</span>
      <input class="input" type="number" min="0" value=${n.min_duration_seconds} onInput=${F("min_duration_seconds")} />
    </label>
    <label class="field"><span>Max duration (s)</span>
      <input class="input" type="number" min="0" value=${n.max_duration_seconds} onInput=${F("max_duration_seconds")} />
    </label>
    <label class="field"><span>Min size (MiB)</span>
      <input class="input" type="number" min="0" step="0.1" value=${n.min_size_mib} onInput=${F("min_size_mib")} />
    </label>
    <label class="field"><span>Max size (MiB)</span>
      <input class="input" type="number" min="0" step="0.1" value=${n.max_size_mib} onInput=${F("max_size_mib")} />
    </label>
    <div class="popover-actions">
      <button type="button" class="btn" onClick=${ee}>Clear filters</button>
    </div>
  </div>`;return o`<main class="page">
    <div class="lib-header">
      <div>
        <h1>Library</h1>
        <p>${(Y||[]).length} clip${(Y||[]).length===1?"":"s"} · ${K(be)} used</p>
      </div>
      <div class="seg" role="group" aria-label="View">
        <button type="button" class=${`seg-item ${e==="grid"?"seg-on":""}`}
          aria-pressed=${e==="grid"} onClick=${()=>N("grid")}>Grid</button>
        <button type="button" class=${`seg-item ${e==="rows"?"seg-on":""}`}
          aria-pressed=${e==="rows"} onClick=${()=>N("rows")}>Rows</button>
      </div>
    </div>

    <div class="lib-toolbar">
      <input class="input" type="search" aria-label="Search clips" placeholder="Search title or game"
        value=${r} onInput=${se} />
      <select class="input" aria-label="Sort" value=${n.sort} onChange=${m=>te(m.target.value)}>
        ${ns.map(([m,y])=>o`<option value=${m}>${y}</option>`)}
      </select>
      <${zn}
        label="Filters"
        panelClass="popover-filters"
        trigger=${({open:m,toggle:y})=>o`<button type="button" class="btn" aria-haspopup="dialog"
          aria-expanded=${m} onClick=${y}>
          ${T("sliders",{size:14})} Filters
          ${oe>0&&o`<span class="filter-badge">${oe}</span>`}
        </button>`}
        content=${ke} />
    </div>

    ${ye.length>0&&o`<div class="lib-chips">
      <button type="button" class=${`chip ${n.game?"":"chip-on"}`} aria-pressed=${!n.game}
        onClick=${()=>L("")}>All</button>
      ${ye.map(m=>o`<button type="button" class=${`chip ${n.game===m.game?"chip-on":""}`}
        aria-pressed=${n.game===m.game} onClick=${()=>L(m.game)}>${m.game}</button>`)}
    </div>`}

    ${Y==null?o`<${us} />`:Y.length===0?de?o`<${Z} name="film" title="No clips match this view"
            body="Try a different search, game, or clear your filters."
            action=${o`<button type="button" class="btn" onClick=${()=>{a(st),s("")}}>Clear filters</button>`} />`:o`<${Z} name="upload" title="Connect the Clipline desktop app to start uploading"
            body="New clips uploaded from the desktop app will show up here."
            action=${o`<a class="btn" href="/about">Learn more</a>`} />`:e==="grid"?o`<div class=${`card-grid ${p.size>0?"selecting":""}`}>
          ${Y.map(m=>o`<${xe} key=${m.id}
            clip=${{...m,thumbnail_url:Ee(m),media_url:Xe(m)}}
            href=${`/clip/${encodeURIComponent(m.id)}`}
            selectable selected=${p.has(m.id)} onToggleSelect=${$e} showVisibility />`)}
        </div>`:o`<${cs} clips=${Y} query=${n} onSort=${te}
          selected=${p} onToggleSelect=${$e} />`}

    <${Bn} count=${p.size} busy=${l}
      onPublic=${()=>me("public")}
      onPrivate=${()=>me("private")}
      onCopyLinks=${ce}
      onDelete=${()=>$(!0)}
      onClear=${()=>v(new Set)} />

    <${ie} open=${b}
      title=${`Delete ${p.size} clip${p.size===1?"":"s"}?`}
      body="Public links stop working immediately."
      confirmLabel="Delete" danger
      onConfirm=${ue}
      onCancel=${()=>$(!1)} />
  </main>`}function at(e,[t,n]){let a=e.sort===t?"ascending":e.sort===n?"descending":"none",r=e.sort===n?t:n;return{ariaSort:a,next:r}}function cs({clips:e,query:t,onSort:n,selected:a,onToggleSelect:r}){let s=at(t,tt.title),i=at(t,tt.size),c=at(t,tt.duration),d=at(t,tt.uploaded);return o`<table class="lib-table">
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
        <td><img class="row-thumb" src=${Ee(u)} alt="" width="64" height="36" loading="lazy" /></td>
        <td><a href=${`/clip/${encodeURIComponent(u.id)}`}>${u.title}</a></td>
        <td>${u.game_name||"\u2014"}</td>
        <td><span class=${`badge badge-${u.visibility}`}>${u.visibility}</span></td>
        <td>${K(u.file_size_bytes)}</td>
        <td>${he(u.duration_ms)}</td>
        <td>${j(u.uploaded_at)}</td>
      </tr>`)}
    </tbody>
  </table>`}function us({count:e=8}){return o`<div class="card-grid">
    ${Array.from({length:e},(t,n)=>o`<div class="clip-card" key=${n}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`}X();var ds={ChampionKill:"kill",FirstBlood:"kill",Multikill:"spree",Ace:"spree",DragonKill:"objective",HeraldKill:"objective",BaronKill:"objective",TurretKilled:"structure",InhibKilled:"structure",FirstBrick:"structure"};function Gn(e){let t=Number(e);return Number.isFinite(t)&&t>0?t/1e3:0}function Wn(e,t){let n=Number.isFinite(e)?e:0,a=t>0?t:Number.MAX_SAFE_INTEGER;return Math.max(0,Math.min(a,n))}function rt(e,t){return t>0?Math.max(0,Math.min(100,e/t*100)):0}function Mt(e){if(!Number.isFinite(e))return"0:00";let t=Math.max(0,Math.round(e)),n=Math.floor(t/60),a=t-n*60;return`${n}:${String(a).padStart(2,"0")}`}function Kn(e){if(!Number.isFinite(e))return"0:00.0";let t=Math.max(0,Math.round(e*10)),n=Math.floor(t/600),a=t-n*600,r=Math.floor(a/10);return`${n}:${String(r).padStart(2,"0")}.${a%10}`}function jn(e,t){return`${Kn(e)} / ${t>0?Kn(t):"0:00.0"}`}function ps(e){return ds[e]||"info"}function Zn(e,t){return(e||[]).map((n,a)=>{let r=Number(n.timestamp_ms);if(!Number.isFinite(r))return null;let s=r/1e3;return s<0||t>0&&s>t?null:{index:a,time:s,kind:String(n.kind||"Marker"),label:String(n.label||n.kind||"Marker"),category:ps(n.kind)}}).filter(Boolean).sort((n,a)=>n.time-a.time)}function Jn(e,t){if(!e.length)return null;for(let n of e)if(n.time>t+.05)return n;return e[0]}function Yn(e,t){if(!e.length)return null;for(let n=e.length-1;n>=0;n-=1)if(e[n].time<t-.05)return e[n];return e[e.length-1]}function Xn(e,t){switch(e){case"Space":case"KeyK":return{kind:"toggle-play"};case"ArrowLeft":return{kind:"seek-by",seconds:t?-1:-5};case"ArrowRight":return{kind:"seek-by",seconds:t?1:5};case"KeyJ":return{kind:"seek-by",seconds:-10};case"KeyL":return{kind:"seek-by",seconds:10};case"Comma":return{kind:"seek-by",seconds:-.1};case"Period":return{kind:"seek-by",seconds:.1};case"KeyM":return{kind:t?"previous-marker":"next-marker"};case"Home":return{kind:"seek-to",seconds:0};case"End":return{kind:"seek-to-end"};case"KeyF":return{kind:"fullscreen"};case"KeyT":return{kind:"theater"};default:return null}}var ea="clipline.playerVolume",ta="clipline.clipTheaterMode",ms=2e3,fs=[.25,.5,.75,1,1.25,1.5,2];function _s(e,t){switch(e){case"KeyM":return{kind:"toggle-mute"};case"KeyF":return{kind:"theater"};case"Escape":return{kind:"exit-theater"};default:return Xn(e,t)}}function hs(e){return e instanceof Element?!!e.closest("input, textarea, select, button, a, [contenteditable='true'], [contenteditable='']"):!1}function bs(){try{let e=window.localStorage.getItem(ea);if(e==null)return 1;let t=Number(e);return Number.isFinite(t)?Math.max(0,Math.min(1,t)):1}catch{return 1}}function Qn(e){try{window.localStorage.setItem(ea,String(Math.max(0,Math.min(1,e))))}catch{}}function vs(){try{return window.localStorage.getItem(ta)==="true"}catch{return!1}}function $s(e){try{window.localStorage.setItem(ta,String(e))}catch{}}function na({src:e,poster:t,durationMs:n,markers:a}){let r=A(null),s=A(null),i=A(null),c=A(!1),d=A(!1),u=Gn(n),[p,v]=h(!1),[l,f]=h(0),[b,$]=h(u),[S,x]=h(0),[g,E]=h(bs),[N,G]=h(!1),[J,se]=h(1),[F,ee]=h(!1),[L,te]=h(vs),[$e,ne]=h(!0),[le,me]=h(null),[ge,ce]=h(""),ue=Zn(a,b);function Y(){ne(!0),window.clearTimeout(i.current),i.current=window.setTimeout(()=>{let _=r.current;_&&!_.paused&&!_.ended&&ne(!1)},ms)}C(()=>{p||(window.clearTimeout(i.current),ne(!0))},[p]),C(()=>{let _=r.current;if(!_)return;let M=()=>Number.isFinite(_.duration)&&_.duration>0?_.duration:u,I=()=>$(M()),Dt=()=>$(M()),Ut=()=>{c.current||f(_.currentTime||0)},Lt=()=>{let Bt=M();if(!(Bt>0)||!_.buffered?.length){x(0);return}let Ot=_.currentTime||0,Ue=0;for(let Le=0;Le<_.buffered.length;Le+=1){let Sa=_.buffered.start(Le),ut=_.buffered.end(Le);if(Ot>=Sa&&Ot<=ut){Ue=ut;break}Ue=Math.max(Ue,ut)}x(rt(Ue,Bt))},It=()=>{v(!0),ce(""),Y()},At=()=>v(!1),Nt=()=>v(!1),Ft=()=>{E(_.volume),G(_.muted||_.volume===0)},zt=()=>ce("Playback unavailable");return _.addEventListener("loadedmetadata",I),_.addEventListener("durationchange",Dt),_.addEventListener("timeupdate",Ut),_.addEventListener("progress",Lt),_.addEventListener("play",It),_.addEventListener("pause",At),_.addEventListener("ended",Nt),_.addEventListener("volumechange",Ft),_.addEventListener("error",zt),()=>{_.removeEventListener("loadedmetadata",I),_.removeEventListener("durationchange",Dt),_.removeEventListener("timeupdate",Ut),_.removeEventListener("progress",Lt),_.removeEventListener("play",It),_.removeEventListener("pause",At),_.removeEventListener("ended",Nt),_.removeEventListener("volumechange",Ft),_.removeEventListener("error",zt)}},[e,u]),C(()=>{r.current&&(r.current.volume=g)},[g]),C(()=>{r.current&&(r.current.muted=N)},[N]),C(()=>{r.current&&(r.current.playbackRate=J)},[J]),C(()=>{if(document.documentElement.classList.toggle("clipline-theater",L),L){let _=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=_}}},[L]),C(()=>()=>document.documentElement.classList.remove("clipline-theater"),[]);function oe(_){te(_),$s(_)}function de(_){let M=r.current;if(!M)return;let I=b>0?Wn(_,b):Math.max(0,_);M.currentTime=I,f(I)}function ye(_){de((r.current?.currentTime||0)+_)}async function be(){let _=r.current;if(_)if(_.paused||_.ended)try{await _.play()}catch(M){ce(M?.message||"Playback failed")}else _.pause()}function ke(){let _=r.current;_&&(_.muted||_.volume===0?(_.muted=!1,_.volume===0&&(_.volume=1,E(1),Qn(1)),G(!1)):(_.muted=!0,G(!0)))}function m(_){let M=Number(_.target.value);E(M),G(M===0),Qn(M);let I=r.current;I&&(I.volume=M,I.muted=M===0)}async function y(){try{document.fullscreenElement?await document.exitFullscreen():await s.current?.requestFullscreen?.()}catch(_){ce(_?.message||"Fullscreen unavailable")}}function P(_){let M=r.current?.currentTime||0,I=_>0?Jn(ue,M):Yn(ue,M);I&&de(I.time)}function R(){c.current=!0,d.current=p,p&&r.current?.pause()}function z(_){let M=Number(_.target.value);f(M),de(M)}function V(){c.current&&(c.current=!1,d.current&&(d.current=!1,r.current?.play().catch(()=>{})))}function B(_){let M=_.currentTarget.getBoundingClientRect();if(!(M.width>0))return;let I=Math.max(0,Math.min(1,(_.clientX-M.left)/M.width));me({pct:I*100,time:I*(b||0)})}function ae(){me(null)}return C(()=>{function _(M){if(M.defaultPrevented||hs(M.target))return;let I=_s(M.code,M.shiftKey);if(I&&!(I.kind==="exit-theater"&&!L))switch(M.preventDefault(),Y(),I.kind){case"toggle-play":be();break;case"seek-by":ye(I.seconds);break;case"seek-to":de(I.seconds);break;case"seek-to-end":de(b);break;case"next-marker":P(1);break;case"previous-marker":P(-1);break;case"toggle-mute":ke();break;case"theater":oe(!L);break;case"exit-theater":oe(!1);break;case"fullscreen":y();break;default:break}}return document.addEventListener("keydown",_),()=>document.removeEventListener("keydown",_)},[b,L,p]),o`<div class=${`player ${$e?"":"chrome-hidden"}`} ref=${s}
      onPointerMove=${Y} onPointerEnter=${Y}
      onPointerLeave=${()=>{let _=r.current;_&&!_.paused&&ne(!1)}}
      onFocusIn=${()=>ne(!0)}>
    <video ref=${r} class="player-video" src=${e} poster=${t||void 0}
      preload="metadata" playsinline onClick=${be}></video>
    ${ge&&o`<div class="player-note">${ge}</div>`}
    <div class="player-overlay">
      <div class="player-timeline" onPointerMove=${B} onPointerLeave=${ae}>
        <div class="player-buffered" style=${`width:${S}%`}></div>
        <div class="player-progress" style=${`width:${rt(l,b)}%`}></div>
        ${ue.map(_=>o`<span class="player-marker-tick" key=${_.index}
            style=${`left:${rt(_.time,b)}%`} title=${`${_.label} @ ${Mt(_.time)}`}></span>`)}
        <input class="player-scrubber" type="range" min="0" max=${b>0?b:0} step="0.01"
          value=${l} disabled=${!(b>0)} aria-label="Seek"
          onPointerDown=${R} onInput=${z} onChange=${V}
          onPointerUp=${V} onPointerCancel=${V} onLostPointerCapture=${V} />
        ${le&&o`<div class="player-hover-time" style=${`left:${le.pct}%`}>${Mt(le.time)}</div>`}
      </div>
      <div class="player-controls">
        ${ue.length>0&&o`<div class="player-cluster">
          <button type="button" class="player-btn" title="Previous marker" aria-label="Previous marker"
            onClick=${()=>P(-1)}>${T("skipBack",{size:14})}</button>
          <button type="button" class="player-btn" title="Next marker" aria-label="Next marker"
            onClick=${()=>P(1)}>${T("skipForward",{size:14})}</button>
        </div>`}
        <button type="button" class="player-btn player-play" aria-label=${p?"Pause":"Play"} onClick=${be}>
          ${T(p?"pause":"play",{size:16})}
        </button>
        <span class="player-time">${jn(l,b)}</span>
        <div class="player-spacer"></div>
        <div class="player-speed-wrap">
          <button type="button" class="player-btn player-speed" aria-haspopup="menu" aria-expanded=${F}
            onClick=${()=>ee(_=>!_)}>${J}×</button>
          ${F&&o`<div class="player-speed-menu" role="menu">
            ${fs.map(_=>o`<button type="button" role="menuitem" key=${_}
                class=${`player-speed-item ${_===J?"is-active":""}`}
                onClick=${()=>{se(_),ee(!1)}}>${_}×</button>`)}
          </div>`}
        </div>
        <button type="button" class="player-btn" aria-label=${N?"Unmute":"Mute"} onClick=${ke}>
          ${T(N?"volumeX":"volume2",{size:14})}
        </button>
        <input class="player-volume" type="range" min="0" max="1" step="0.01" value=${N?0:g}
          aria-label="Volume" onInput=${m} />
        <button type="button" class="player-btn" aria-label=${L?"Exit theater mode":"Theater mode"}
          aria-pressed=${L} onClick=${()=>oe(!L)}>${T("theater",{size:14})}</button>
        <button type="button" class="player-btn" aria-label="Fullscreen" onClick=${y}>
          ${T("fullscreen",{size:14})}
        </button>
      </div>
    </div>
  </div>`}X();function gs(e){let t=new Map(e.map(s=>[s.id,s])),n=new Map,a=[],r=0;return e.forEach(s=>{let i=s.parent_comment_id||"";i&&t.has(i)?(n.has(i)||n.set(i,[]),n.get(i).push(s),r+=1):i||(a.push(s),r+=1)}),{roots:a,repliesByParent:n,count:r}}function ys(e){return(e||"?").trim().slice(0,1).toUpperCase()||"?"}function ks(e){let t=e.author_avatar_url;return typeof t=="string"&&t.startsWith("/")?o`<img class="comment-avatar" src=${t} alt="" />`:o`<div class="comment-avatar">${ys(e.author_name)}</div>`}function aa({shareId:e}){let{user:t}=q(D),[n,a]=h(null),[r,s]=h(""),[i,c]=h(null),[d,u]=h(""),[p,v]=h(null);function l(){k(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`).then(g=>a(g.comments||[])).catch(()=>a([]))}C(()=>{let g=!0;return a(null),k(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`).then(E=>g&&a(E.comments||[])).catch(()=>g&&a([])),()=>{g=!1}},[e]);async function f(g,E){let N=g.trim();if(N)try{await k(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`,{method:"POST",body:E?{body:N,parent_comment_id:E}:{body:N}}),l()}catch(G){w(G.message)}}async function b(g){g.preventDefault(),await f(r),s("")}async function $(g,E){g.preventDefault(),await f(d,E),u(""),c(null)}async function S(){let g=p;v(null);try{await k(`/api/v1/public/clips/${encodeURIComponent(e)}/comments/${encodeURIComponent(g)}`,{method:"DELETE"}),l()}catch(E){w(E.message)}}let x=gs(n||[]);return o`<section class="comments">
    <div class="comments-header"><h2>Comments</h2><span class="muted">${x.count}</span></div>
    ${t?o`<form class="comment-form" onSubmit=${b}>
          <textarea rows="3" maxlength="2000" placeholder="Add a comment" value=${r}
            onInput=${g=>s(g.target.value)}></textarea>
          <div class="comment-form-actions">
            <button type="submit" class="btn btn-primary">${T("message",{size:14})} Post comment</button>
          </div>
        </form>`:o`<p class="comment-signin"><a href="/login">Sign in</a> to comment.</p>`}
    ${n==null?"":x.count===0?o`<p class="comment-signin">No comments yet.</p>`:o`<div class="comment-list">
          ${x.roots.map(g=>sa(g,{depth:0,repliesByParent:x.repliesByParent,user:t,replyOpenId:i,setReplyOpenId:c,replyDraft:d,setReplyDraft:u,submitReply:$,onDelete:v}))}
        </div>`}
    <${ie} open=${p!=null} title="Delete this comment?"
      body="This removes the comment from the public clip page." confirmLabel="Delete" danger
      onConfirm=${S} onCancel=${()=>v(null)} />
  </section>`}function sa(e,t){let{depth:n,repliesByParent:a,user:r,replyOpenId:s,setReplyOpenId:i,replyDraft:c,setReplyDraft:d,submitReply:u,onDelete:p}=t,v=a.get(e.id)||[];return o`<article class="comment" key=${e.id}>
    ${ks(e)}
    <div class="comment-body">
      <div class="comment-head">
        ${e.author_username?o`<a href=${`/u/${encodeURIComponent(e.author_username)}`}>${e.author_name}</a>`:o`<strong>${e.author_name}</strong>`}
        ${e.is_uploader&&o`<span class="comment-badge">Uploader</span>`}
        <span>${Ye(e.created_at)}</span>
        <div class="comment-actions">
          ${r&&n===0&&o`<button type="button" class="comment-action"
            onClick=${()=>i(s===e.id?null:e.id)}>
            ${T("message",{size:12})} Reply</button>`}
          ${e.viewer_can_delete&&o`<button type="button" class="comment-delete" aria-label="Delete comment"
            title="Delete comment" onClick=${()=>p(e.id)}>${T("trash",{size:12})}</button>`}
        </div>
      </div>
      <p class="comment-text">${e.body}</p>
      ${r&&n===0&&s===e.id&&o`<form class="comment-reply-form"
        onSubmit=${l=>u(l,e.id)}>
        <textarea rows="2" maxlength="2000" placeholder="Write a reply" value=${c}
          onInput=${l=>d(l.target.value)}></textarea>
        <div class="comment-form-actions">
          <button type="submit" class="btn btn-primary">${T("message",{size:14})} Post reply</button>
        </div>
      </form>`}
      ${v.length>0&&o`<div class="comment-replies">
        ${v.map(l=>sa(l,{...t,depth:n+1}))}
      </div>`}
    </div>
  </article>`}var ws=["private","public","unlisted"];function Ss(e,t){return e==="clip"?!0:!!t?.viewer_can_edit}function xs(e,t,n){return e==="public"?t.shareId:n?.public_share_id||null}function Cs(e,t,n){return e==="clip"?t.clipId:n?.viewer_clip_id||null}function Ts(e){let t=e?.height!=null?e.height:"",n=Math.round(e?.fps||0)||"";return`${t}p${n}`}function Ms(e,t,n=8){return(e||[]).filter(a=>a.share_id!==t).slice(0,n)}function Pt({route:e}){let{user:t}=q(D),[n,a]=h(null),[r,s]=h(null),[i,c]=h([]),[d,u]=h(!1),[p,v]=h(""),[l,f]=h(!1),[b,$]=h(""),[S,x]=h(!1),[g,E]=h(!1),[N,G]=h(!1),J=e.name==="clip"?`clip:${e.clipId}`:`public:${e.shareId}`;if(C(()=>{let m=!0;a(null),s(null),u(!1),f(!1),G(!1),x(!1);let y=e.name==="clip"?`/api/v1/clips/${encodeURIComponent(e.clipId)}`:`/api/v1/public/clips/${encodeURIComponent(e.shareId)}`;return k(y).then(P=>{m&&(a(P),e.name==="public"&&k(`/api/v1/public/clips/${encodeURIComponent(e.shareId)}/view`,{method:"POST",body:{}}).then(R=>m&&a(z=>z&&{...z,view_count:R.view_count})).catch(()=>{}))}).catch(P=>m&&s(P)),()=>{m=!1}},[J]),C(()=>{let m=!0;return k("/api/v1/public/clips").then(y=>m&&c(y.clips||[])).catch(()=>{}),()=>{m=!1}},[J]),r)return o`<main class="page"><${Z} name="alert" title="Couldn't load this clip" body=${r.message} /></main>`;if(!n)return o`<main class="page watch"><div><div class="skeleton-thumb"></div></div><aside class="upnext"></aside></main>`;let se=Ss(e.name,n),F=xs(e.name,e,n),ee=Cs(e.name,e,n),L=e.name==="clip"?Xe({id:n.id}):Se({share_id:e.shareId}),te=e.name==="clip"?Ee({id:n.id}):re({share_id:e.shareId}),$e=e.name==="clip"?t?.display_name||t?.username||"You":n.author_name||"Unknown creator",ne=n.public_url??n.share_url??null,le=Re(ne,window.location.origin,F),me=e.name==="clip";function ge(){v(n.title),u(!0)}async function ce(m){m?.preventDefault?.();let y=p.trim();if(!y||y===n.title){u(!1);return}try{await k(`/api/v1/clips/${encodeURIComponent(ee)}`,{method:"PATCH",body:{title:y}}),a(P=>({...P,title:y})),u(!1),w("Title saved.")}catch(P){w(P.message)}}function ue(){$(n.description||""),f(!0)}async function Y(){let m=b.trim();try{await k(`/api/v1/clips/${encodeURIComponent(ee)}`,{method:"PATCH",body:{description:m||null}}),a(y=>({...y,description:m||null})),f(!1),w("Description saved.")}catch(y){w(y.message)}}async function oe(m,{force:y=!1}={}){let P=n.visibility;if(!(P===m&&!y)){a(R=>({...R,visibility:m}));try{let R=await k(`/api/v1/clips/${encodeURIComponent(ee)}/visibility`,{method:"POST",body:{visibility:m}});a(z=>({...z,visibility:R.visibility,public_url:R.public_url,public_share_id:R.public_share_id})),w(`Visibility set to ${m}.`,{actionLabel:"Undo",onAction:()=>oe(P,{force:!0})})}catch(R){a(z=>({...z,visibility:P})),w(R.message)}}}async function de(){if(le)try{await navigator.clipboard.writeText(le),w("Link copied.")}catch{w("Couldn't copy the link.")}}async function ye(){E(!1);try{await k(`/api/v1/clips/${encodeURIComponent(ee)}`,{method:"DELETE"}),w("Clip deleted."),W("/library")}catch(m){w(m.message)}}let be=[n.game_name&&o`<a class="chip chip-on" href=${`/game/${encodeURIComponent(n.game_name)}`}>${n.game_name}</a>`,ve(n.view_count),`Recorded ${j(n.recorded_at)}`,`by ${$e}`].filter(Boolean),ke=Ms(i,F,8);return o`<main class="page watch">
    <div>
      <${na} src=${L} poster=${te} durationMs=${n.duration_ms} markers=${n.markers} />
      <div class="watch-titlerow">
        ${d?o`<input class="input watch-title-input" value=${p} autofocus
              onInput=${m=>v(m.target.value)} onBlur=${ce}
              onKeyDown=${m=>{m.key==="Enter"&&ce(m),m.key==="Escape"&&u(!1)}} />`:o`<h1>${n.title}
              ${se&&o`<button type="button" class="edit-pencil" aria-label="Edit title" onClick=${ge}
                >${T("edit",{size:14})}</button>`}</h1>`}
      </div>
      <p class="watch-meta">${be.map((m,y)=>o`${y>0?" \xB7 ":""}${m}`)}</p>

      ${se&&o`<div class="watch-actions">
        <div class="seg" role="radiogroup" aria-label="Visibility">
          ${ws.map(m=>o`<button type="button" role="radio" key=${m} aria-checked=${n.visibility===m}
              class=${`seg-item ${n.visibility===m?"seg-on":""}`} onClick=${()=>oe(m)}
              >${m[0].toUpperCase()+m.slice(1)}</button>`)}
        </div>
        <button type="button" class="btn btn-primary" disabled=${!le} onClick=${de}>
          ${T("copy",{size:14})} Copy share link</button>
        <div class="watch-more">
          <button type="button" class="btn" aria-haspopup="menu" aria-expanded=${S}
            onClick=${()=>x(m=>!m)}>⋯</button>
          ${S&&o`<div class="menu" role="menu">
            <button type="button" class="menu-danger" role="menuitem"
              onClick=${()=>{x(!1),E(!0)}}>${T("trash",{size:14})} Delete clip</button>
          </div>`}
        </div>
      </div>`}

      <div class="watch-desc">
        ${l?o`<textarea class="input" rows="5" value=${b} autofocus
              onInput=${m=>$(m.target.value)} onBlur=${Y}
              onKeyDown=${m=>{m.key==="Enter"&&(m.ctrlKey||m.metaKey)&&Y(),m.key==="Escape"&&f(!1)}}></textarea>`:n.description?o`<p>${n.description}
              ${se&&o`<button type="button" class="edit-pencil" aria-label="Edit description" onClick=${ue}
                >${T("edit",{size:12})}</button>`}</p>`:se?o`<button type="button" class="watch-desc-add" onClick=${ue}>+ Add a description</button>`:""}
      </div>

      ${me&&o`<button type="button" class="details-strip" aria-expanded=${N}
        onClick=${()=>G(m=>!m)}>
        <span><b>${he(n.duration_ms)}</b> length</span>
        <span><b>${K(n.file_size_bytes)}</b></span>
        <span><b>${Ts(n)}</b></span>
        <span><b>${n.video_codec}/${n.audio_codec}</b> ${n.container}</span>
        <span class="details-chev">${N?"\u25B4 less":"\u25BE more"}</span>
      </button>`}
      ${me&&N&&o`<dl class="details-full">
        <div><dt>Recorded</dt><dd>${j(n.recorded_at)}</dd></div>
        <div><dt>Uploaded</dt><dd>${j(n.uploaded_at)}</dd></div>
        <div><dt>Dimensions</dt><dd>${n.width&&n.height?`${n.width} x ${n.height}`:"Unknown"}</dd></div>
        <div><dt>FPS</dt><dd>${n.fps??"Unknown"}</dd></div>
        <div><dt>Container</dt><dd>${n.container||"Unknown"}</dd></div>
        <div><dt>Video codec</dt><dd>${n.video_codec||"Unknown"}</dd></div>
        <div><dt>Audio codec</dt><dd>${n.audio_codec||"Unknown"}</dd></div>
        <div><dt>Source</dt><dd>${n.source_type||"Unknown"}</dd></div>
        <div><dt>Checksum</dt><dd>${n.checksum_sha256||"Unknown"}</dd></div>
      </dl>`}

      ${F&&o`<${aa} shareId=${F} />`}
    </div>
    <aside class="upnext">
      <h4 class="kicker">Up next</h4>
      ${ke.map(m=>o`<a class="upnext-row" key=${m.share_id} href=${`/c/${encodeURIComponent(m.share_id)}`}>
          <img src=${re(m)} alt="" loading="lazy" />
          <span><b>${m.title}</b><small>${m.author_name} · ${m.game_name||"No game"} · ${ve(m.view_count)}</small></span>
        </a>`)}
    </aside>

    <${ie} open=${g} title="Delete this clip?" body="Public links stop working immediately."
      confirmLabel="Delete" danger onConfirm=${ye} onCancel=${()=>E(!1)} />
  </main>`}X();var Et=[{top:"4%",left:"4%",width:"34%",rotate:-7},{top:"0%",left:"44%",width:"30%",rotate:5},{top:"34%",left:"68%",width:"28%",rotate:-4},{top:"50%",left:"8%",width:"30%",rotate:6},{top:"62%",left:"42%",width:"26%",rotate:-5},{top:"26%",left:"-4%",width:"22%",rotate:9}];function Ps(e){return Array.isArray(e)?e.slice(0,Et.length).map((t,n)=>({clip:t,...Et[n]})):[]}function Es(e){let t=e?.clips;if(!Array.isArray(t)||t.length===0)return null;let n=t.length,a=e.has_more?"+":"";return`${n}${a} clip${n===1?"":"s"} on this instance`}function Rs({top:e,left:t,width:n,rotate:a}){return`top:${e};left:${t};width:${n};transform:rotate(${a}deg);`}function ra(e){let t=String(e||"").trim();return t||null}function Ds(){let[e,t]=h(null);C(()=>{let r=!0;return k(`/api/v1/public/clips?page_size=${Et.length}`).then(s=>r&&t(s)).catch(()=>r&&t(null)),()=>{r=!1}},[]);let n=Ps(e?.clips),a=Es(e);return o`<aside class="login-montage" aria-hidden="true">
    ${n.length>0&&o`<div class="login-montage-tiles">
      ${n.map((r,s)=>o`<img key=${s} class="login-montage-tile" style=${Rs(r)}
        src=${re(r.clip)} alt="" loading="lazy" />`)}
    </div>`}
    <div class="login-montage-copy">
      <h2>Your clips. Your server.</h2>
      ${a&&o`<p>${a}</p>`}
    </div>
  </aside>`}function Ce({titleId:e,children:t}){return o`<div class="login-page">
    <${Ds} />
    <section class="login-panel" aria-labelledby=${e}>
      <div class="login-brand" aria-hidden="true">
        <img src="/clipline-icon.svg" alt="" width="32" height="32" />
        <span class="login-brand-word">CLIP<b>LINE</b></span>
        <span class="login-brand-descriptor">CLOUD</span>
      </div>
      ${t}
    </section>
  </div>`}function oa(){let{user:e}=q(D),[t,n]=h(""),[a,r]=h(""),[s,i]=h(""),[c,d]=h(!1);if(C(()=>{e&&W("/library")},[e]),e)return null;async function u(p){if(p.preventDefault(),!c){d(!0),i("");try{let v=await k("/api/v1/auth/login",{method:"POST",body:{username:t,password:a}});Pe(v.csrf_token),D.set({user:v.user,csrfToken:v.csrf_token,ready:!0}),W("/library")}catch(v){i(v instanceof _e?v.message:"Sign in failed"),d(!1)}}}return o`<${Ce} titleId="login-title">
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
  </${Ce}>`}function ia({route:e}){let t=!!e.invite,[n,a]=h(()=>t?"preflight":e.token?"form":"missing-token"),[r,s]=h(""),[i,c]=h(t?null:e.token),[d,u]=h(""),[p,v]=h(!1),l=t;C(()=>{if(!t)return;if(!e.token){a("missing-token");return}let S=!0;return a("preflight"),k("/api/v1/invites/claim",{method:"POST",body:{invite_token:e.token}}).then(x=>{S&&(c(x.reset_token),a("form"))}).catch(x=>{S&&(s(x instanceof _e?x.message:"This invite link is invalid, used, or expired."),a("invalid"))}),()=>{S=!1}},[t,e.token]);async function f(S){if(S.preventDefault(),p)return;v(!0),u("");let x=new FormData(S.currentTarget),g={reset_token:i,new_password:String(x.get("new_password")||"")};l&&(g.username=String(x.get("username")||""),g.display_name=ra(x.get("display_name")),g.email=ra(x.get("email")));try{await k("/api/v1/auth/reset-password",{method:"POST",body:g}),w(l?"Account created. Sign in with your new password.":"Password set. Sign in with your new password."),W("/login")}catch(E){u(E instanceof _e?E.message:"Request failed"),v(!1)}}if(t&&n!=="form"){let S=n==="missing-token"||n==="invalid",x=n==="missing-token"?"This invite link is missing a token.":n==="invalid"?r:"Opening invite\u2026";return o`<${Ce} titleId="invite-title">
      <h1 id="invite-title">Create account</h1>
      <p class="login-copy">${S?"This invite cannot be used.":"Preparing your account setup."}</p>
      ${S?o`<p class="form-error" role="alert">${x}</p>`:o`<p class="login-status">${x}</p>`}
    </${Ce}>`}return o`<${Ce} titleId="reset-title">
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
  </${Ce}>`}X();function De({label:e,value:t,sub:n,meter:a,tone:r}){let s=r?` stat-${r}`:"";return o`<div class="stat-card">
    <p class="stat-label">${e}</p>
    <p class=${`stat-value${s}`}>${t}</p>
    ${n!=null&&o`<p class="stat-sub">${n}</p>`}
    ${a!=null&&o`<div class="stat-meter${s}">
      <span style=${`width:${Math.max(0,Math.min(1,a))*100}%`}></span>
    </div>`}
  </div>`}function Us(e){let t=Number(e?.global_storage_warning_threshold_bytes||0);if(!t)return null;let n=Number(e?.total_storage_bytes||0);return Math.max(0,Math.min(1,n/t))}function Ls(e){if(!e?.global_storage_warning_threshold_bytes)return"Disabled";let t=K(e.global_storage_warning_threshold_bytes);return e.global_storage_warning?`At or above ${t}`:`Below ${t}`}function Is({deadJobs:e=[],failedUploads:t=[]}={}){let n=e.length+t.length;return{failedCount:n,healthy:n===0}}function Q(e,t){return o`<div><dt>${e}</dt><dd>${t??"Unknown"}</dd></div>`}function la({overview:e,deadJobs:t,failedUploads:n}){let a=Us(e),{failedCount:r,healthy:s}=Is({deadJobs:t,failedUploads:n}),i=e.global_storage_warning_threshold_bytes;return o`<div>
    <div class="stat-grid">
      <${De} label="Clips" value=${String(e.total_clips)} />
      <${De} label="Storage" value=${K(e.total_storage_bytes)}
        sub=${i?`${K(i)} warning threshold`:null}
        meter=${a} tone=${e.global_storage_warning?"danger":void 0} />
      <${De} label="Users" value=${String(e.total_users)} />
      <${De} label="Jobs" value=${s?"All healthy":String(r)}
        tone=${s?"success":"danger"} />
    </div>
    <div class="panel">
      <h2>Server summary</h2>
      <dl class="ad-kv">
        ${Q("Server version",e.server_version)}
        ${Q("API version",e.api_version)}
        ${Q("Public URL",e.public_url)}
        ${Q("Database",e.database_backend)}
        ${Q("Storage",`${e.storage_backend} \u2014 ${e.storage_summary}`)}
        ${Q("Stored clips",`${e.total_clips} clips \u2014 ${K(e.total_storage_bytes)}`)}
        ${Q("Users",`${e.total_users} total`)}
        ${Q("Max upload",K(e.max_upload_size_bytes))}
        ${Q("Part size",K(e.upload_part_size_bytes))}
        ${Q("Single PUT max",K(e.single_put_max_bytes))}
        ${Q("Active uploads/user",e.max_active_upload_sessions_per_user)}
        ${Q("User quota",e.user_storage_quota_bytes?K(e.user_storage_quota_bytes):"Disabled")}
        ${Q("Storage warning",Ls(e))}
        ${Q("Upload TTL",`${e.upload_session_ttl_seconds}s`)}
        ${Q("Direct S3 uploads",e.direct_s3_uploads?"Enabled":"Disabled")}
        ${Q("Public media",`${e.public_media_mode}, ${e.public_read_url_ttl_seconds}s TTL`)}
      </dl>
    </div>
  </div>`}X();function ot(e){let t=String(e||"").trim();return t||null}function As(e){let t=Number(String(e||"").trim());if(!Number.isFinite(t)||t<0)throw new Error("Storage quota must be a non-negative number");return Math.round(t*1024*1024*1024)}function Ns(e,t){return!(e.is_disabled||t?.id===e.id||e.role==="owner"||e.role==="admin"&&t?.role!=="owner")}function ca(e){return e?[["user","User"],["admin","Admin"]]:[["user","User"]]}function Fs({isOwner:e,onCreated:t}){let[n,a]=h(!1);async function r(s){if(s.preventDefault(),n)return;a(!0);let i=s.currentTarget,c=new FormData(i);try{await k("/api/v1/users",{method:"POST",body:{username:String(c.get("username")||""),display_name:ot(c.get("display_name")),email:ot(c.get("email")),password:ot(c.get("password")),role:String(c.get("role")||"user")}}),w("User created."),i.reset(),t()}catch(d){w(d.message)}finally{a(!1)}}return o`<form class="panel section" onSubmit=${r}>
    <h2>Create user</h2>
    <label class="field"><span>Username</span><input class="input" name="username" required /></label>
    <label class="field"><span>Display name</span><input class="input" name="display_name" placeholder="Optional" /></label>
    <label class="field"><span>Email</span><input class="input" name="email" type="email" placeholder="Optional" /></label>
    <label class="field"><span>Password</span><input class="input" name="password" type="password" required /></label>
    <label class="field"><span>Role</span>
      <select class="input" name="role">
        ${ca(e).map(([s,i])=>o`<option value=${s}>${i}</option>`)}
      </select>
    </label>
    <button class="btn btn-primary" type="submit" disabled=${n}>${T("plus",{size:14})} Create user</button>
  </form>`}function zs({isOwner:e,smtpEnabled:t,onCreated:n}){let[a,r]=h(!1);async function s(i){if(i.preventDefault(),a)return;r(!0);let c=new FormData(i.currentTarget),d=i.submitter?.value==="email"?"email":"link";try{let u=await k("/api/v1/invites",{method:"POST",body:{role:String(c.get("role")||"user"),email:ot(c.get("email")),send_email:d==="email"}});w(d==="email"?"Invite sent.":"Invite link created."),n({...u,kind:"invite"})}catch(u){w(u.message)}finally{r(!1)}}return o`<form class="panel section" onSubmit=${s}>
    <h2>Invite link</h2>
    <label class="field"><span>Role</span>
      <select class="input" name="role">
        ${ca(e).map(([i,c])=>o`<option value=${i}>${c}</option>`)}
      </select>
    </label>
    <label class="field"><span>Email</span>
      <input class="input" name="email" type="email" placeholder=${t?"Optional":"SMTP disabled"} disabled=${!t} />
    </label>
    <div class="actions">
      <button class="btn" type="submit" name="intent" value="link" disabled=${a}>${T("copy",{size:14})} Generate link</button>
      ${t&&o`<button class="btn btn-primary" type="submit" name="intent" value="email" disabled=${a}>${T("message",{size:14})} Send email</button>`}
    </div>
  </form>`}function Bs({resetLink:e}){if(!e)return null;let t=e.kind==="invite"?"Invite":"Reset",n=e.username?` for ${e.username}`:"",a=async()=>{try{await navigator.clipboard.writeText(e.reset_url),w("Copied to clipboard.")}catch{w("Copy failed. Select and copy the URL manually.")}};return o`<div class="notice admin-reset-link">
    <div>
      <strong>${t} link created${n}</strong>
      <span>Expires ${j(e.expires_at)}</span>
      <code>${e.reset_url}</code>
    </div>
    <button class="btn" type="button" onClick=${a}>${T("copy",{size:14})} Copy</button>
  </div>`}function Os(e){return e.is_disabled?o`<span class="badge badge-warn">Disabled</span>`:o`<span class="badge badge-public">Active</span>`}function Vs({user:e,currentUser:t,onQuota:n,onReset:a,onDisable:r}){let s=e.storage_quota_bytes!=null?K(e.storage_quota_bytes):"No limit",i=!Ns(e,t);return o`<tr>
    <td>
      <strong>${e.username}</strong>
      <div class="muted">${e.display_name||e.id}</div>
      ${e.email&&o`<div class="muted">${e.email}</div>`}
    </td>
    <td>${e.role}</td>
    <td>${Os(e)}</td>
    <td>
      <strong>${K(e.storage_bytes||0)}</strong>
      <div class="muted">quota ${s}</div>
    </td>
    <td>${j(e.last_login_at)}</td>
    <td>
      <div class="actions">
        <button class="btn" type="button" onClick=${()=>n(e)}>${T("sliders",{size:14})} Quota</button>
        <button class="btn" type="button" onClick=${()=>a(e)}>${T("clipboard",{size:14})} Reset link</button>
        <button class="btn btn-danger" type="button" disabled=${i} onClick=${()=>r(e)}>${T("x",{size:14})} Disable</button>
      </div>
    </td>
  </tr>`}function ua({users:e,settings:t,currentUser:n,resetLink:a,setResetLink:r,reload:s}){let[i,c]=h(null),d=n?.role==="owner",u=!!t?.smtp_enabled,p=()=>c(null);async function v(){let{type:f,user:b,value:$}=i;p();try{if(f==="quota"){let S=$.trim()?As($):null;await k(`/api/v1/users/${encodeURIComponent(b.id)}`,{method:"PATCH",body:{storage_quota_bytes:S}}),w("Storage quota updated.")}else if(f==="disable")await k(`/api/v1/users/${encodeURIComponent(b.id)}`,{method:"DELETE",body:{reauth_password:$}}),w("User disabled.");else if(f==="reset"){let S=await k(`/api/v1/users/${encodeURIComponent(b.id)}/reset-password`,{method:"POST",body:{reauth_password:$}});r({...S,kind:"reset"}),w("Reset link created.")}s()}catch(S){w(S.message)}}let l={quota:{title:"Set storage quota",description:"Enter a per-user storage limit in GiB. Leave it blank to remove the per-user limit.",confirmLabel:"Save quota",danger:!1,field:o`<label class="field"><span>Quota GiB</span>
        <input class="input" type="number" min="0" step="0.1" placeholder="No per-user limit"
          value=${i?.value||""} onInput=${f=>c(b=>({...b,value:f.target.value}))} /></label>`},disable:{title:"Disable user?",description:"This immediately revokes the user's sessions and device tokens.",confirmLabel:"Disable",danger:!0,field:o`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value||""}
          onInput=${f=>c(b=>({...b,value:f.target.value}))} /></label>`},reset:{title:"Create reset link?",description:"This creates a temporary password reset link for the selected user.",confirmLabel:"Create link",danger:!1,field:o`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value||""}
          onInput=${f=>c(b=>({...b,value:f.target.value}))} /></label>`}}[i?.type];return o`<div class="admin-grid">
    <div class="admin-side-stack">
      <${Fs} isOwner=${d} onCreated=${()=>{r(null),s()}} />
      <${zs} isOwner=${d} smtpEnabled=${u}
        onCreated=${f=>{r(f),s()}} />
    </div>
    <div class="panel">
      <div class="section-header">
        <h2>Users</h2>
        <span class="muted">${e.length} total</span>
      </div>
      <${Bs} resetLink=${a} />
      <div class="table-wrap">
        <table class="lib-table">
          <thead><tr><th>Username</th><th>Role</th><th>Status</th><th>Storage</th><th>Last login</th><th></th></tr></thead>
          <tbody>
            ${e.map(f=>o`<${Vs} key=${f.id} user=${f} currentUser=${n}
              onQuota=${b=>c({type:"quota",user:b,value:""})}
              onReset=${b=>c({type:"reset",user:b,value:""})}
              onDisable=${b=>c({type:"disable",user:b,value:""})} />`)}
          </tbody>
        </table>
      </div>
    </div>
    <${ie} open=${!!i}
      title=${l?.title}
      body=${l&&o`${l.description} ${l.field}`}
      confirmLabel=${l?.confirmLabel} danger=${l?.danger}
      confirmDisabled=${i?.type!=="quota"&&!i?.value?.trim()}
      onConfirm=${v} onCancel=${p} />
  </div>`}X();function it(e){let t=String(e||"").trim();return t||null}function da({settings:e,isOwner:t,reload:n}){let[a,r]=h(!1);async function s(i){if(i.preventDefault(),a)return;r(!0);let c=new FormData(i.currentTarget),d={allow_vod_uploads:c.get("allow_vod_uploads")==="on",vod_threshold_minutes:Number(c.get("vod_threshold_minutes")||30)};if(t){d.about_text=String(c.get("about_text")||""),d.smtp_enabled=c.get("smtp_enabled")==="on",d.smtp_host=it(c.get("smtp_host")),d.smtp_port=Number(c.get("smtp_port")||587),d.smtp_tls_mode=String(c.get("smtp_tls_mode")||"starttls"),d.smtp_username=it(c.get("smtp_username")),d.smtp_from_email=it(c.get("smtp_from_email")),d.smtp_from_name=it(c.get("smtp_from_name"));let u=String(c.get("smtp_password")||"").trim();u&&(d.smtp_password=u),c.get("smtp_password_clear")==="on"&&(d.smtp_password_clear=!0)}try{await k("/api/v1/admin/settings",{method:"PATCH",body:d}),w("Settings saved."),n()}catch(u){w(u.message)}finally{r(!1)}}return o`<form class="admin-settings-page" onSubmit=${s}>
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
      <button class="btn btn-primary" type="submit" disabled=${a}>${T("save",{size:14})} Save settings</button>
    </div>
  </form>`}function Hs(e){return`${(e/100).toFixed(e%100===0?0:1)}%`}function qs(e){switch(e){case"delete_and_retry":return"delete the failed upload and retry from a new session";case"retry":return"retry the current upload request";default:return""}}function Ks({upload:e}){let t=Math.max(0,Math.min(1e4,Number(e.progress_basis_points||0))),n=qs(e.recovery_action);return o`<div class="job-item">
    <div class="job-title-line">
      <strong class="mono">${e.id}</strong>
      <span class="badge badge-warn">${Hs(t)}</span>
    </div>
    <div class="progress-meter" aria-label="Upload progress"><span style=${`width:${t/100}%`}></span></div>
    <span class="muted">clip ${e.clip_id} — ${K(e.received_size_bytes)} of ${K(e.expected_size_bytes)} — updated ${j(e.updated_at)}</span>
    ${e.failure_reason&&o`<span class="form-error">${e.failure_reason}</span>`}
    ${n&&o`<span class="muted">Recovery: ${n}</span>`}
  </div>`}function pa({job:e}){return o`<div class="job-item">
    <strong>${e.kind} <span class="mono">${e.id}</span></strong>
    <span class="muted">${e.status} — attempts ${e.attempts}/${e.max_attempts} — updated ${j(e.updated_at)} — target ${e.target_type||""}:${e.target_id||""}</span>
    ${e.last_error&&o`<span class="form-error">${e.last_error}</span>`}
  </div>`}function Rt({title:e,items:t,renderItem:n,emptyLabel:a}){return o`<div class="panel">
    <div class="section-header">
      <h2>${e}</h2>
      <span class="muted">${t.length}</span>
    </div>
    ${t.length?o`<div class="job-list">${t.map(n)}</div>`:o`<p class="muted">${a}</p>`}
  </div>`}function ma({failedUploads:e,deadJobs:t,recentErrors:n}){return o`<div class="section">
    <${Rt} title="Failed uploads" items=${e} emptyLabel="No failed uploads."
      renderItem=${a=>o`<${Ks} key=${a.id} upload=${a} />`} />
    <${Rt} title="Dead jobs" items=${t} emptyLabel="No dead jobs."
      renderItem=${a=>o`<${pa} key=${a.id} job=${a} />`} />
    <${Rt} title="Recent job errors" items=${n} emptyLabel="No recent job errors."
      renderItem=${a=>o`<${pa} key=${a.id} job=${a} />`} />
  </div>`}var fa=[["overview","server","Overview"],["users","users","Users"],["settings","sliders","Settings"],["jobs","alert","Jobs"]];function Gs(e){return e?.role==="admin"||e?.role==="owner"}async function Ws(){let[e,t,n,a,r,s]=await Promise.all([k("/api/v1/admin/overview"),k("/api/v1/admin/settings"),k("/api/v1/users"),k("/api/v1/admin/uploads/failed?limit=50"),k("/api/v1/admin/jobs/dead?limit=50"),k("/api/v1/admin/jobs/recent-errors?limit=50")]);return{overview:e,settings:t,users:n,failedUploads:a,deadJobs:r,recentErrors:s}}function _a({route:e}){let{user:t}=q(D),n=Gs(t),a=!!(t&&!n),r=fa.some(([b])=>b===e.tab)?e.tab:"overview",[s,i]=h(null),[c,d]=h(null),[u,p]=h(null),[v,l]=h(0),f=()=>l(b=>b+1);return C(()=>{a&&(w("Admin access required."),W("/library"))},[a]),C(()=>{if(!n)return;let b=!0;return d(null),Ws().then($=>b&&i($)).catch($=>b&&d($)),()=>{b=!1}},[n,v]),n?o`<main class="page">
    <h1>Admin</h1>
    <p class="page-subtitle">Accounts, instance summary, and processing diagnostics.</p>
    <nav class="ad-tabs" aria-label="Admin views">
      ${fa.map(([b,$,S])=>o`<a key=${b} class=${`ad-tab ${b===r?"ad-tab-on":""}`}
        href=${`/admin?tab=${b}`} aria-current=${b===r?"page":void 0}>${T($,{size:14})} ${S}</a>`)}
    </nav>
    ${c?o`<${Z} name="alert" title="Couldn't load admin data" body=${c.message} />`:s?r==="users"?o`<${ua} users=${s.users} settings=${s.settings} currentUser=${t}
          resetLink=${u} setResetLink=${p} reload=${f} />`:r==="settings"?o`<${da} settings=${s.settings} isOwner=${t?.role==="owner"} reload=${f} />`:r==="jobs"?o`<${ma} failedUploads=${s.failedUploads} deadJobs=${s.deadJobs} recentErrors=${s.recentErrors} />`:o`<${la} overview=${s.overview} deadJobs=${s.deadJobs} failedUploads=${s.failedUploads} />`:o`<p class="empty-state">Loading admin data…</p>`}
  </main>`:null}X();function js(e){if(!e?.avatar_url)return"";let t=e.updated_at||"";if(!t)return e.avatar_url;let n=String(e.avatar_url).includes("?")?"&":"?";return`${e.avatar_url}${n}v=${encodeURIComponent(t)}`}function Zs(e){return(e||"C").trim().slice(0,1).toUpperCase()||"C"}function lt({user:e,size:t=40,className:n=""}){let a=js(e),r=`width:${t}px;height:${t}px;font-size:${Math.round(t*.4)}px`;if(a)return o`<img class=${`user-avatar ${n}`} style=${r} src=${a} alt="" />`;let s=e?.display_name||e?.username;return o`<div class=${`user-avatar user-avatar-fallback ${n}`} style=${r} aria-hidden="true">
    ${Zs(s)}
  </div>`}function ha(e){let t=String(e||"").trim();return t||null}async function Js(e){let t=new Headers;t.set("Accept","application/json"),t.set("Content-Type",e.type||"application/octet-stream");let n=kt();n&&t.set("X-CSRF-Token",n);let a=await fetch("/api/v1/me/avatar",{method:"PUT",credentials:"same-origin",headers:t,body:e}),r=await a.json().catch(()=>({}));if(!a.ok)throw new Error(r.error||a.statusText||"Avatar upload failed");return r}function ba(e){D.set({...D.get(),user:e})}function Ys({user:e}){let[t,n]=h(!1);async function a(r){if(r.preventDefault(),t)return;n(!0);let s=new FormData(r.currentTarget);try{let i=await k("/api/v1/me/profile",{method:"PATCH",body:{display_name:ha(s.get("display_name")),bio:ha(s.get("bio"))}});ba(i),w("Profile saved.")}catch(i){w(i.message)}finally{n(!1)}}return o`<form class="profile-form" onSubmit=${a}>
    <label class="field"><span>Display name</span>
      <input class="input" name="display_name" maxlength="120" value=${e.display_name||""} placeholder=${e.username} /></label>
    <label class="field"><span>Bio</span>
      <textarea class="input" name="bio" rows="5" maxlength="2000" placeholder="Tell people what you upload.">${e.bio||""}</textarea></label>
    <div class="clip-inline-actions">
      <button class="btn btn-primary" type="submit" disabled=${t}>${T("save",{size:14})} Save profile</button>
    </div>
  </form>`}function Xs({user:e}){let[t,n]=h(!1);async function a(r){if(r.preventDefault(),t)return;let s=r.currentTarget.elements.avatar?.files?.[0];if(!s){w("Choose an avatar image first.");return}n(!0);try{let i=await Js(s);ba(i),w("Avatar uploaded.")}catch(i){w(i.message)}finally{n(!1)}}return o`<form class="profile-form" onSubmit=${a}>
    <label class="field"><span>Avatar</span>
      <input name="avatar" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
      <small>PNG, JPEG, WebP, or GIF. Max 2 MiB.</small></label>
    <div class="clip-inline-actions">
      <button class="btn" type="submit" disabled=${t}>${T("upload",{size:14})} Upload avatar</button>
    </div>
  </form>`}function va(){let{user:e}=q(D);return e?o`<main class="page">
    <h1>Profile</h1>
    <p class="page-subtitle">Public identity and avatar.</p>
    <div class="profile-settings-header">
      <${lt} user=${e} size=${72} />
      <div>
        <h2>${e.display_name||e.username}</h2>
        <p>@${e.username} · ${e.role}</p>
      </div>
    </div>
    <${Ys} user=${e} />
    <${Xs} user=${e} />
    <div class="profile-public-link">
      <a class="btn" href=${`/u/${encodeURIComponent(e.username)}`}>${T("external",{size:14})} View public profile</a>
    </div>
  </main>`:null}X();async function Qs(){let[e,t]=await Promise.all([k("/api/v1/auth/sessions"),k("/api/v1/auth/device-tokens")]);return{sessions:e,deviceTokens:t}}function er({item:e,onRevoke:t}){return o`<div class="management-item">
    <div>
      <strong>${e.user_agent||"Unknown browser"}</strong>
      <div class="meta-line">
        <span>${e.ip_address||"Unknown IP"}</span>
        <span>Last used ${j(e.last_used_at||e.created_at)}</span>
        <span>Expires ${j(e.expires_at)}</span>
      </div>
    </div>
    <div class="actions">
      ${e.current&&o`<span class="badge badge-public">Current</span>`}
      <button class="btn btn-danger" type="button" onClick=${()=>t(e)}>${T("x",{size:14})} Revoke</button>
    </div>
  </div>`}function tr({item:e,onRevoke:t}){let n=!!e.revoked_at;return o`<div class="management-item">
    <div>
      <strong>${e.name}</strong>
      <div class="meta-line">
        <span>Created ${j(e.created_at)}</span>
        <span>Last used ${j(e.last_used_at)}</span>
        ${e.expires_at&&o`<span>Expires ${j(e.expires_at)}</span>`}
        ${n&&o`<span>Revoked ${j(e.revoked_at)}</span>`}
      </div>
    </div>
    <div class="actions">
      <span class=${`badge ${n?"badge-private":"badge-public"}`}>${n?"Revoked":"Active"}</span>
      <button class="btn btn-danger" type="button" disabled=${n} onClick=${()=>t(e)}>${T("x",{size:14})} Revoke</button>
    </div>
  </div>`}function $a(){let[e,t]=h(null),[n,a]=h(null),[r,s]=h(0),[i,c]=h(null);C(()=>{let p=!0;return a(null),Qs().then(v=>p&&t(v)).catch(v=>p&&a(v)),()=>{p=!1}},[r]);let d=()=>s(p=>p+1);async function u(){let p=i;c(null);try{if(p.kind==="session"){if(await k(`/api/v1/auth/sessions/${encodeURIComponent(p.item.id)}`,{method:"DELETE",body:{}}),p.item.current){D.set({user:null,csrfToken:null,ready:!0}),w("Current session revoked."),W("/login");return}w("Session revoked.")}else await k(`/api/v1/auth/device-tokens/${encodeURIComponent(p.item.id)}`,{method:"DELETE",body:{}}),w("Device token revoked.");d()}catch(v){w(v.message)}}return n?o`<main class="page"><${Z} name="alert" title="Couldn't load account data" body=${n.message} /></main>`:o`<main class="page">
    <h1>Account</h1>
    <p class="page-subtitle">Sessions and device tokens.</p>
    ${e?o`<div class="account-grid">
          <div class="panel">
            <div class="section-header"><h2>Browser sessions</h2><span class="muted">${e.sessions.length} active</span></div>
            ${e.sessions.length?o`<div class="management-list">${e.sessions.map(p=>o`<${er} key=${p.id} item=${p}
                  onRevoke=${v=>c({kind:"session",item:v})} />`)}</div>`:o`<p class="muted">No active sessions.</p>`}
          </div>
          <div class="panel">
            <div class="section-header"><h2>Device tokens</h2><span class="muted">${e.deviceTokens.length} total</span></div>
            ${e.deviceTokens.length?o`<div class="management-list">${e.deviceTokens.map(p=>o`<${tr} key=${p.id} item=${p}
                  onRevoke=${v=>c({kind:"device",item:v})} />`)}</div>`:o`<p class="muted">No device tokens.</p>`}
          </div>
        </div>`:o`<p class="empty-state">Loading account data…</p>`}
    <${ie} open=${!!i}
      title=${i?.kind==="session"?"Revoke browser session?":"Revoke device token?"}
      body=${i?.kind==="session"?i.item.current?"This signs you out of the current browser session.":"This signs out that browser session immediately.":"The desktop client using this token will need to reconnect."}
      confirmLabel="Revoke" danger
      onConfirm=${u} onCancel=${()=>c(null)} />
  </main>`}X();function ga({route:e}){let{user:t}=q(D),[n,a]=h(null),[r,s]=h(null);if(C(()=>{let d=!0;return a(null),s(null),k(`/api/v1/public/users/${encodeURIComponent(e.username)}`).then(u=>d&&a(u)).catch(u=>d&&s(u)),()=>{d=!1}},[e.username]),r)return o`<main class="page"><${Z} name="alert" title="Profile unavailable" body=${r.message} /></main>`;if(!n)return o`<main class="page"><p class="empty-state">Loading profile…</p></main>`;let i=t&&t.username.toLowerCase()===n.username.toLowerCase(),c=n.clips||[];return o`<main class="page">
    <header class="public-user-header">
      <${lt} user=${n} size=${72} />
      <div class="public-user-header-body">
        <div class="public-user-title-row">
          <div>
            <h1>${n.display_name||n.username}</h1>
            <p>@${n.username}</p>
          </div>
          ${i&&o`<a class="btn" href="/profile">${T("edit",{size:14})} Edit profile</a>`}
        </div>
        ${n.bio&&o`<p class="public-user-bio">${n.bio}</p>`}
        <p class="meta-line">${n.clip_count} public clip${n.clip_count===1?"":"s"}</p>
      </div>
    </header>
    ${c.length===0?o`<${Z} name="film" title="No public clips yet" />`:o`<div class="card-grid">
          ${c.map(d=>o`<${xe} key=${d.share_id}
            clip=${{...d,thumbnail_url:re(d),media_url:Se(d)}}
            href=${`/c/${encodeURIComponent(d.share_id)}`} showAuthor=${!1} />`)}
        </div>`}
  </main>`}X();var ya="Clipline is a self-hosted clip library for saved gameplay moments.";function ct(e,t){return o`<div><dt>${e}</dt><dd>${t}</dd></div>`}function ka(){let[e,t]=h(ya);return C(()=>{let n=!0;return k("/api/v1/about").then(a=>n&&t(a.about_text||ya)).catch(()=>{}),()=>{n=!1}},[]),o`<main class="page">
    <h1>About</h1>
    <p class="page-subtitle">Clipline Cloud</p>
    <div class="panel about-panel">
      <h2>Clipline Cloud</h2>
      <p class="about-text">${e}</p>
      <dl class="ad-kv">
        ${ct("Home","Public clips that are ready for discovery.")}
        ${ct("Unlisted","Shareable by link, but not listed on Home.")}
        ${ct("Private","Visible only to the clip owner.")}
        ${ct("Media","Public and unlisted clips are not DRM-protected.")}
      </dl>
    </div>
  </main>`}var nr={publicLibrary:et,publicGame:et,games:Fn,library:qn,clip:Pt,public:Pt,login:oa,resetPassword:ia,admin:_a,profile:va,account:$a,publicUser:ga,about:ka},wa=Cn({pathname:window.location.pathname,search:window.location.search});function ar(){let e=Mn();wa=e.name;let{ready:t,user:n}=q(D),a=t&&Sn(e.name,n);if(C(()=>{a&&W("/login")},[a]),!t||a)return o`<div class="boot">Loading…</div>`;let r=nr[e.name]||et,s=e.name==="login"||e.name==="resetPassword";return o`<div class="ui" onClick=${Pn}>
    ${!s&&o`<${Rn} active=${St(e)} route=${e} />`}
    <${r} route=${e} />
    ${!s&&o`<${Dn} active=${xn(e)} />`}
    <${Un} />
  </div>`}window.addEventListener("clipline:unauthorized",()=>{D.set({user:null,csrfToken:null,ready:!0}),wt(wa)||W("/login")});(async()=>{try{let t=await k("/api/v1/auth/me");Pe(t.csrf_token),D.set({user:t.user,csrfToken:t.csrf_token,ready:!0})}catch{D.set({user:null,csrfToken:null,ready:!0})}let e=document.querySelector("#app");e.textContent="",an(o`<${ar} />`,e)})();
