var La=Object.defineProperty;var Aa=(e,t)=>()=>(e&&(t=e(e=0)),t);var Ia=(e,t)=>{for(var n in t)La(e,n,{get:t[n],enumerable:!0})};var Mn={};Ia(Mn,{ApiError:()=>we,api:()=>x,getCsrfToken:()=>Mt,setCsrfToken:()=>_e});function _e(e){Ye=e}function Mt(){return Ye}function Wa(e){try{let t=globalThis.location?.href||"http://clipline.invalid/";return new URL(e,t).origin===new URL(t).origin}catch{return!1}}async function ja(e,t){let n=await e.text();if(!t.includes("application/json"))return n;if(!n.trim())return null;try{return JSON.parse(n)}catch(a){if(e.ok)throw a;return null}}async function x(e,t={}){let n=(t.method||"GET").toUpperCase(),a=new Headers(t.headers||{});a.set("Accept","application/json");let s=t.body;s&&typeof s!="string"&&(a.set("Content-Type","application/json"),s=JSON.stringify(s)),Wa(e)?!["GET","HEAD","OPTIONS"].includes(n)&&Ye&&a.set("X-CSRF-Token",Ye):a.delete("X-CSRF-Token");let i=await fetch(e,{...t,body:s,credentials:"same-origin",headers:a,method:n}),u=i.headers.get("content-type")||"",d=await ja(i,u);if(!i.ok){i.status===401&&window.dispatchEvent(new CustomEvent("clipline:unauthorized"));let l=typeof d=="object"&&d?.error?d.error:i.statusText;throw new we(l||"Request failed",i.status)}return d}var Ye,we,se=Aa(()=>{Ye=null;we=class extends Error{constructor(t,n){super(t),this.status=n}}});var je,I,Xt,Na,ge,Zt,en,tn,bt,Ve,De,nn,gt,$t,vt,Ba,Ge={},Ke=[],Fa=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,Ze=Array.isArray;function fe(e,t){for(var n in t)e[n]=t[n];return e}function yt(e){e&&e.parentNode&&e.parentNode.removeChild(e)}function wt(e,t,n){var a,s,o,i={};for(o in t)o=="key"?a=t[o]:o=="ref"?s=t[o]:i[o]=t[o];if(arguments.length>2&&(i.children=arguments.length>3?je.call(arguments,2):n),typeof e=="function"&&e.defaultProps!=null)for(o in e.defaultProps)i[o]===void 0&&(i[o]=e.defaultProps[o]);return He(e,i,a,s,null)}function He(e,t,n,a,s){var o={type:e,props:t,key:n,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:s??++Xt,__i:-1,__u:0};return s==null&&I.vnode!=null&&I.vnode(o),o}function Je(e){return e.children}function qe(e,t){this.props=e,this.context=t}function Te(e,t){if(t==null)return e.__?Te(e.__,e.__i+1):null;for(var n;t<e.__k.length;t++)if((n=e.__k[t])!=null&&n.__e!=null)return n.__e;return typeof e.type=="function"?Te(e):null}function za(e){if(e.__P&&e.__d){var t=e.__v,n=t.__e,a=[],s=[],o=fe({},t);o.__v=t.__v+1,I.vnode&&I.vnode(o),kt(e.__P,o,t,e.__n,e.__P.namespaceURI,32&t.__u?[n]:null,a,n??Te(t),!!(32&t.__u),s),o.__v=t.__v,o.__.__k[o.__i]=o,ln(a,o,s),t.__e=t.__=null,o.__e!=n&&an(o)}}function an(e){if((e=e.__)!=null&&e.__c!=null)return e.__e=e.__c.base=null,e.__k.some(function(t){if(t!=null&&t.__e!=null)return e.__e=e.__c.base=t.__e}),an(e)}function Jt(e){(!e.__d&&(e.__d=!0)&&ge.push(e)&&!We.__r++||Zt!=I.debounceRendering)&&((Zt=I.debounceRendering)||en)(We)}function We(){try{for(var e,t=1;ge.length;)ge.length>t&&ge.sort(tn),e=ge.shift(),t=ge.length,za(e)}finally{ge.length=We.__r=0}}function sn(e,t,n,a,s,o,i,u,d,l,p){var h,c,m,_,w,P,R,T=a&&a.__k||Ke,D=t.length;for(d=Oa(n,t,T,d,D),h=0;h<D;h++)(m=n.__k[h])!=null&&(c=m.__i!=-1&&T[m.__i]||Ge,m.__i=h,P=kt(e,m,c,s,o,i,u,d,l,p),_=m.__e,m.ref&&c.ref!=m.ref&&(c.ref&&xt(c.ref,null,m),p.push(m.ref,m.__c||_,m)),w==null&&_!=null&&(w=_),(R=!!(4&m.__u))||c.__k===m.__k?(d=on(m,d,e,R),R&&c.__e&&(c.__e=null)):typeof m.type=="function"&&P!==void 0?d=P:_&&(d=_.nextSibling),m.__u&=-7);return n.__e=w,d}function Oa(e,t,n,a,s){var o,i,u,d,l,p=n.length,h=p,c=0;for(e.__k=new Array(s),o=0;o<s;o++)(i=t[o])!=null&&typeof i!="boolean"&&typeof i!="function"?(typeof i=="string"||typeof i=="number"||typeof i=="bigint"||i.constructor==String?i=e.__k[o]=He(null,i,null,null,null):Ze(i)?i=e.__k[o]=He(Je,{children:i},null,null,null):i.constructor===void 0&&i.__b>0?i=e.__k[o]=He(i.type,i.props,i.key,i.ref?i.ref:null,i.__v):e.__k[o]=i,d=o+c,i.__=e,i.__b=e.__b+1,u=null,(l=i.__i=Va(i,n,d,h))!=-1&&(h--,(u=n[l])&&(u.__u|=2)),u==null||u.__v==null?(l==-1&&(s>p?c--:s<p&&c++),typeof i.type!="function"&&(i.__u|=4)):l!=d&&(l==d-1?c--:l==d+1?c++:(l>d?c--:c++,i.__u|=4))):e.__k[o]=null;if(h)for(o=0;o<p;o++)(u=n[o])!=null&&(2&u.__u)==0&&(u.__e==a&&(a=Te(u)),un(u,u));return a}function on(e,t,n,a){var s,o;if(typeof e.type=="function"){for(s=e.__k,o=0;s&&o<s.length;o++)s[o]&&(s[o].__=e,t=on(s[o],t,n,a));return t}e.__e!=t&&(a&&(t&&e.type&&!t.parentNode&&(t=Te(e)),n.insertBefore(e.__e,t||null)),t=e.__e);do t=t&&t.nextSibling;while(t!=null&&t.nodeType==8);return t}function Va(e,t,n,a){var s,o,i,u=e.key,d=e.type,l=t[n],p=l!=null&&(2&l.__u)==0;if(l===null&&u==null||p&&u==l.key&&d==l.type)return n;if(a>(p?1:0)){for(s=n-1,o=n+1;s>=0||o<t.length;)if((l=t[i=s>=0?s--:o++])!=null&&(2&l.__u)==0&&u==l.key&&d==l.type)return i}return-1}function Yt(e,t,n){t[0]=="-"?e.setProperty(t,n??""):e[t]=n==null?"":typeof n!="number"||Fa.test(t)?n:n+"px"}function Oe(e,t,n,a,s){var o,i;e:if(t=="style")if(typeof n=="string")e.style.cssText=n;else{if(typeof a=="string"&&(e.style.cssText=a=""),a)for(t in a)n&&t in n||Yt(e.style,t,"");if(n)for(t in n)a&&n[t]==a[t]||Yt(e.style,t,n[t])}else if(t[0]=="o"&&t[1]=="n")o=t!=(t=t.replace(nn,"$1")),i=t.toLowerCase(),t=i in e||t=="onFocusOut"||t=="onFocusIn"?i.slice(2):t.slice(2),e.l||(e.l={}),e.l[t+o]=n,n?a?n[De]=a[De]:(n[De]=gt,e.addEventListener(t,o?vt:$t,o)):e.removeEventListener(t,o?vt:$t,o);else{if(s=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&t[4]!="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&n==1?"":n))}}function Qt(e){return function(t){if(this.l){var n=this.l[t.type+e];if(t[Ve]==null)t[Ve]=gt++;else if(t[Ve]<n[De])return;return n(I.event?I.event(t):t)}}}function kt(e,t,n,a,s,o,i,u,d,l){var p,h,c,m,_,w,P,R,T,D,V,B,E,J,H,ne,L=t.type;if(t.constructor!==void 0)return null;128&n.__u&&(d=!!(32&n.__u),o=[u=t.__e=n.__e]),(p=I.__b)&&p(t);e:if(typeof L=="function"){h=i.length;try{if(T=t.props,D=L.prototype&&L.prototype.render,V=(p=L.contextType)&&a[p.__c],B=p?V?V.props.value:p.__:a,n.__c?R=(c=t.__c=n.__c).__=c.__E:(D?t.__c=c=new L(T,B):(t.__c=c=new qe(T,B),c.constructor=L,c.render=qa),V&&V.sub(c),c.state||(c.state={}),c.__n=a,m=c.__d=!0,c.__h=[],c._sb=[]),D&&c.__s==null&&(c.__s=c.state),D&&L.getDerivedStateFromProps!=null&&(c.__s==c.state&&(c.__s=fe({},c.__s)),fe(c.__s,L.getDerivedStateFromProps(T,c.__s))),_=c.props,w=c.state,c.__v=t,m)D&&L.getDerivedStateFromProps==null&&c.componentWillMount!=null&&c.componentWillMount(),D&&c.componentDidMount!=null&&c.__h.push(c.componentDidMount);else{if(D&&L.getDerivedStateFromProps==null&&T!==_&&c.componentWillReceiveProps!=null&&c.componentWillReceiveProps(T,B),t.__v==n.__v||!c.__e&&c.shouldComponentUpdate!=null&&c.shouldComponentUpdate(T,c.__s,B)===!1){t.__v!=n.__v&&(c.props=T,c.state=c.__s,c.__d=!1),t.__e=n.__e,t.__k=n.__k,t.__k.some(function(Y){Y&&(Y.__=t)}),Ke.push.apply(c.__h,c._sb),c._sb=[],c.__h.length&&i.push(c);break e}c.componentWillUpdate!=null&&c.componentWillUpdate(T,c.__s,B),D&&c.componentDidUpdate!=null&&c.__h.push(function(){c.componentDidUpdate(_,w,P)})}if(c.context=B,c.props=T,c.__P=e,c.__e=!1,E=I.__r,J=0,D)c.state=c.__s,c.__d=!1,E&&E(t),p=c.render(c.props,c.state,c.context),Ke.push.apply(c.__h,c._sb),c._sb=[];else do c.__d=!1,E&&E(t),p=c.render(c.props,c.state,c.context),c.state=c.__s;while(c.__d&&++J<25);c.state=c.__s,c.getChildContext!=null&&(a=fe(fe({},a),c.getChildContext())),D&&!m&&c.getSnapshotBeforeUpdate!=null&&(P=c.getSnapshotBeforeUpdate(_,w)),H=p!=null&&p.type===Je&&p.key==null?cn(p.props.children):p,u=sn(e,Ze(H)?H:[H],t,n,a,s,o,i,u,d,l),c.base=t.__e,t.__u&=-161,c.__h.length&&i.push(c),R&&(c.__E=c.__=null)}catch(Y){if(i.length=h,t.__v=null,d||o!=null){if(Y.then){for(t.__u|=d?160:128;u&&u.nodeType==8&&u.nextSibling;)u=u.nextSibling;o!=null&&(o[o.indexOf(u)]=null),t.__e=u}else if(o!=null)for(ne=o.length;ne--;)yt(o[ne])}else t.__e=n.__e;t.__k==null&&(t.__k=n.__k||[]),Y.then||rn(t),I.__e(Y,t,n)}}else o==null&&t.__v==n.__v?(t.__k=n.__k,t.__e=n.__e):u=t.__e=Ha(n.__e,t,n,a,s,o,i,d,l);return(p=I.diffed)&&p(t),128&t.__u?void 0:u}function rn(e){e&&(e.__c&&(e.__c.__e=!0),e.__k&&e.__k.some(rn))}function ln(e,t,n){for(var a=0;a<n.length;a++)xt(n[a],n[++a],n[++a]);I.__c&&I.__c(t,e),e.some(function(s){try{e=s.__h,s.__h=[],e.some(function(o){o.call(s)})}catch(o){I.__e(o,s.__v)}})}function cn(e){return typeof e!="object"||e==null||e.__b>0?e:Ze(e)?e.map(cn):e.constructor!==void 0?null:fe({},e)}function Ha(e,t,n,a,s,o,i,u,d){var l,p,h,c,m,_,w,P=n.props||Ge,R=t.props,T=t.type;if(T=="svg"?s="http://www.w3.org/2000/svg":T=="math"?s="http://www.w3.org/1998/Math/MathML":s||(s="http://www.w3.org/1999/xhtml"),o!=null){for(l=0;l<o.length;l++)if((m=o[l])&&"setAttribute"in m==!!T&&(T?m.localName==T:m.nodeType==3)){e=m,o[l]=null;break}}if(e==null){if(T==null)return document.createTextNode(R);e=document.createElementNS(s,T,R.is&&R),u&&(I.__m&&I.__m(t,o),u=!1),o=null}if(T==null)P===R||u&&e.data==R||(e.data=R);else{if(o=T=="textarea"&&R.defaultValue!=null?null:o&&je.call(e.childNodes),!u&&o!=null)for(P={},l=0;l<e.attributes.length;l++)P[(m=e.attributes[l]).name]=m.value;for(l in P)m=P[l],l=="dangerouslySetInnerHTML"?h=m:l=="children"||l in R||l=="value"&&"defaultValue"in R||l=="checked"&&"defaultChecked"in R||Oe(e,l,null,m,s);for(l in R)m=R[l],l=="children"?c=m:l=="dangerouslySetInnerHTML"?p=m:l=="value"?_=m:l=="checked"?w=m:u&&typeof m!="function"||P[l]===m||Oe(e,l,m,P[l],s);if(p)u||h&&(p.__html==h.__html||p.__html==e.innerHTML)||(e.innerHTML=p.__html),t.__k=[];else if(h&&(e.innerHTML=""),sn(t.type=="template"?e.content:e,Ze(c)?c:[c],t,n,a,T=="foreignObject"?"http://www.w3.org/1999/xhtml":s,o,i,o?o[0]:n.__k&&Te(n,0),u,d),o!=null)for(l=o.length;l--;)yt(o[l]);u&&T!="textarea"||(l="value",T=="progress"&&_==null?e.removeAttribute("value"):_!=null&&(_!==e[l]||T=="progress"&&!_||T=="option"&&_!=P[l])&&Oe(e,l,_,P[l],s),l="checked",w!=null&&w!=e[l]&&Oe(e,l,w,P[l],s))}return e}function xt(e,t,n){try{if(typeof e=="function"){var a=typeof e.__u=="function";a&&e.__u(),a&&t==null||(e.__u=e(t))}else e.current=t}catch(s){I.__e(s,n)}}function un(e,t,n){var a,s;if(I.unmount&&I.unmount(e),(a=e.ref)&&(a.current&&a.current!=e.__e||xt(a,null,t)),(a=e.__c)!=null){if(a.componentWillUnmount)try{a.componentWillUnmount()}catch(o){I.__e(o,t)}a.base=a.__P=a.__n=null}if(a=e.__k)for(s=0;s<a.length;s++)a[s]&&un(a[s],t,n||typeof e.type!="function");n||yt(e.__e),e.__c=e.__=e.__e=void 0}function qa(e,t,n){return this.constructor(e,n)}function dn(e,t,n){var a,s,o,i;t==document&&(t=document.documentElement),I.__&&I.__(e,t),s=(a=typeof n=="function")?null:n&&n.__k||t.__k,o=[],i=[],kt(t,e=(!a&&n||t).__k=wt(Je,null,[e]),s||Ge,Ge,t.namespaceURI,!a&&n?[n]:s?null:t.firstChild?je.call(t.childNodes):null,o,!a&&n?n:s?s.__e:t.firstChild,a,i),ln(o,e,i),e.props.children=null}je=Ke.slice,I={__e:function(e,t,n,a){for(var s,o,i;t=t.__;)if((s=t.__c)&&!s.__)try{if((o=s.constructor)&&o.getDerivedStateFromError!=null&&(s.setState(o.getDerivedStateFromError(e)),i=s.__d),s.componentDidCatch!=null&&(s.componentDidCatch(e,a||{}),i=s.__d),i)return s.__E=s}catch(u){e=u}throw e}},Xt=0,Na=function(e){return e!=null&&e.constructor===void 0},qe.prototype.setState=function(e,t){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=fe({},this.state),typeof e=="function"&&(e=e(fe({},n),this.props)),e&&fe(n,e),e!=null&&this.__v&&(t&&this._sb.push(t),Jt(this))},qe.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),Jt(this))},qe.prototype.render=Je,ge=[],en=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,tn=function(e,t){return e.__v.__b-t.__v.__b},We.__r=0,bt=Math.random().toString(8),Ve="__d"+bt,De="__a"+bt,nn=/(PointerCapture)$|Capture$/i,gt=0,$t=Qt(!1),vt=Qt(!0),Ba=0;var Le,O,St,pn,Ae=0,yn=[],G=I,mn=G.__b,fn=G.__r,_n=G.diffed,hn=G.__c,bn=G.unmount,$n=G.__;function Tt(e,t){G.__h&&G.__h(O,e,Ae||t),Ae=0;var n=O.__H||(O.__H={__:[],__h:[]});return e>=n.__.length&&n.__.push({}),n.__[e]}function b(e){return Ae=1,Ga(Sn,e)}function Ga(e,t,n){var a=Tt(Le++,2);if(a.t=e,!a.__c&&(a.__=[n?n(t):Sn(void 0,t),function(u){var d=a.__N?a.__N[0]:a.__[0],l=a.t(d,u);d!==l&&(a.__N=[l,a.__[1]],a.__c.setState({}))}],a.__c=O,!O.__f)){var s=function(u,d,l){if(!a.__c.__H)return!0;var p=!1,h=a.__c.props!==u;if(a.__c.__H.__.some(function(m){if(m.__N){p=!0;var _=m.__[0];m.__=m.__N,m.__N=void 0,_!==m.__[0]&&(h=!0)}}),o){var c=o.call(this,u,d,l);return p?c||h:c}return!p||h};O.__f=!0;var o=O.shouldComponentUpdate,i=O.componentWillUpdate;O.componentWillUpdate=function(u,d,l){if(this.__e){var p=o;o=void 0,s(u,d,l),o=p}i&&i.call(this,u,d,l)},O.shouldComponentUpdate=s}return a.__N||a.__}function M(e,t){var n=Tt(Le++,3);!G.__s&&xn(n.__H,t)&&(n.__=e,n.u=t,O.__H.__h.push(n))}function F(e){return Ae=5,wn(function(){return{current:e}},[])}function wn(e,t){var n=Tt(Le++,7);return xn(n.__H,t)&&(n.__=e(),n.__H=t,n.__h=e),n.__}function Pt(e,t){return Ae=8,wn(function(){return e},t)}function vn(){for(var e;e=yn.shift();){var t=e.__H;if(e.__P&&t)try{t.__h.some(Ct),t.__h.some(kn),t.__h=[]}catch(n){t.__h=[],G.__e(n,e.__v)}}}G.__b=function(e){O=null,mn&&mn(e)},G.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),$n&&$n(e,t)},G.__r=function(e){fn&&fn(e),Le=0;var t=(O=e.__c).__H;t&&(St===O?(t.__h=[],O.__h=[],t.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(t.__h.length&&vn(),Le=0)),St=O},G.diffed=function(e){_n&&_n(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(yn.push(t)!==1&&pn===G.requestAnimationFrame||((pn=G.requestAnimationFrame)||Ka)(vn)),t.__H.__.some(function(n){n.u&&(n.__H=n.u,n.u=void 0)})),St=O=null},G.__c=function(e,t){t.some(function(n){try{n.__h.some(Ct),n.__h=n.__h.filter(function(a){return!a.__||kn(a)})}catch(a){t.some(function(s){s.__h&&(s.__h=[])}),t=[],G.__e(a,n.__v)}}),hn&&hn(e,t)},G.unmount=function(e){bn&&bn(e);var t,n=e.__c;n&&n.__H&&(n.__H.__.some(function(a){try{Ct(a)}catch(s){t=s}}),n.__H=void 0,t&&G.__e(t,n.__v))};var gn=typeof requestAnimationFrame=="function";function Ka(e){var t,n=function(){clearTimeout(a),gn&&cancelAnimationFrame(t),setTimeout(e)},a=setTimeout(n,35);gn&&(t=requestAnimationFrame(n))}function Ct(e){var t=O,n=e.__c;typeof n=="function"&&(e.__c=void 0,n()),O=t}function kn(e){var t=O;e.__c=e.__(),O=t}function xn(e,t){return!e||e.length!==t.length||t.some(function(n,a){return n!==e[a]})}function Sn(e,t){return typeof t=="function"?t(e):t}var Tn=function(e,t,n,a){var s;t[0]=0;for(var o=1;o<t.length;o++){var i=t[o++],u=t[o]?(t[0]|=i?1:2,n[t[o++]]):t[++o];i===3?a[0]=u:i===4?a[1]=Object.assign(a[1]||{},u):i===5?(a[1]=a[1]||{})[t[++o]]=u:i===6?a[1][t[++o]]+=u+"":i?(s=e.apply(u,Tn(e,u,n,["",null])),a.push(s),u[0]?t[0]|=2:(t[o-2]=0,t[o]=s)):a.push(u)}return a},Cn=new Map;function Pn(e){var t=Cn.get(this);return t||(t=new Map,Cn.set(this,t)),(t=Tn(this,t.get(e)||(t.set(e,t=(function(n){for(var a,s,o=1,i="",u="",d=[0],l=function(c){o===1&&(c||(i=i.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?d.push(0,c,i):o===3&&(c||i)?(d.push(3,c,i),o=2):o===2&&i==="..."&&c?d.push(4,c,0):o===2&&i&&!c?d.push(5,0,!0,i):o>=5&&((i||!c&&o===5)&&(d.push(o,0,i,s),o=6),c&&(d.push(o,c,0,s),o=6)),i=""},p=0;p<n.length;p++){p&&(o===1&&l(),l(p));for(var h=0;h<n[p].length;h++)a=n[p][h],o===1?a==="<"?(l(),d=[d],o=3):i+=a:o===4?i==="--"&&a===">"?(o=1,i=""):i=a+i[0]:u?a===u?u="":i+=a:a==='"'||a==="'"?u=a:a===">"?(l(),o=1):o&&(a==="="?(o=5,s=i,i=""):a==="/"&&(o<5||n[p][h+1]===">")?(l(),o===3&&(d=d[0]),o=d,(d=d[0]).push(2,0,o),o=0):a===" "||a==="	"||a===`
`||a==="\r"?(l(),o=2):i+=a),o===3&&i==="!--"&&(o=4,d=d[0])}return l(),d})(e)),t),arguments,[])).length>1?t:t[0]}var r=Pn.bind(wt);se();function Rn(e){let t=e,n=new Set;return{get:()=>t,set(a){t=a,n.forEach(s=>s(t))},update(a){this.set(a(t))},subscribe(a){return n.add(a),()=>n.delete(a)}}}function K(e){let[t,n]=b(e.get());return M(()=>e.subscribe(n),[e]),t}var A=Rn({user:null,csrfToken:null,ready:!1}),Qe=Rn([]),Za=0;function g(e,{actionLabel:t,onAction:n,timeoutMs:a=5e3}={}){let s=++Za;return Qe.update(o=>[...o,{id:s,message:e,actionLabel:t,onAction:n}]),a&&setTimeout(()=>Xe(s),a),s}function Xe(e){Qe.update(t=>t.filter(n=>n.id!==e))}function et(e){try{return decodeURIComponent(e)}catch{return e}}function En(e){let t=Number(e.get("page")||1);return{sort:e.get("sort")||"uploaded_at_desc",game:e.get("game")||"",q:e.get("q")||"",page:Number.isFinite(t)?Math.max(1,t):1}}var Ja=["login","resetPassword","public","publicLibrary","publicGame","publicUser","about","games"];function Rt(e){return Ja.includes(e)}function Un(e,t){return!t&&!Rt(e)}var Ya={publicLibrary:"feed",publicGame:"feed",games:"games",library:"library",clip:"library",admin:"admin",profile:"profile"};function Et(e){return Ya[e?.name]||""}function Dn(e){return e?.name==="publicLibrary"&&e.surface==="search"?"search":Et(e)}function tt(e,t){let n=new URLSearchParams(t||""),a=e;return a.startsWith("/c/")?{name:"public",shareId:et(a.slice(3))}:a==="/"||a==="/public"||a==="/search"?{name:"publicLibrary",query:En(n),surface:a==="/search"?"search":"feed"}:a.startsWith("/game/")?{name:"publicGame",game:et(a.slice(6)),query:En(n)}:a==="/about"?{name:"about"}:a==="/games"?{name:"games"}:a.startsWith("/u/")?{name:"publicUser",username:et(a.slice(3))}:a==="/library"?{name:"library"}:a.startsWith("/clip/")?{name:"clip",clipId:et(a.slice(6))}:a==="/admin"?{name:"admin",tab:n.get("tab")||"overview"}:a==="/account"?{name:"account"}:a==="/profile"?{name:"profile"}:a==="/login"?{name:"login"}:a==="/reset-password"?{name:"resetPassword",token:n.get("token")||"",invite:n.get("invite")==="1"}:{name:"publicLibrary"}}function Ln(e){return tt(e.pathname,e.search).name}var Ut=new Set;function W(e){window.history.pushState({},"",e),An()}function An(){let{pathname:e,search:t}=window.location,n=tt(e,t);Ut.forEach(a=>a(n))}window.addEventListener("popstate",An);function In(){let[e,t]=b(()=>tt(window.location.pathname,window.location.search));return M(()=>(Ut.add(t),()=>Ut.delete(t)),[]),e}function Nn(e){let t=e.target.closest("a[href^='/']");!t||t.target||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||(e.preventDefault(),W(t.getAttribute("href")))}var Bn={alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',clipboard:'<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',copy:'<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',external:'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',fastForward:'<path d="m13 19 9-7-9-7v14Z"/><path d="m2 19 9-7-9-7v14Z"/>',film:'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 8h4"/><path d="M3 16h4"/><path d="M17 8h4"/><path d="M17 16h4"/>',fullscreen:'<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/><path d="M12 2a15.3 15.3 0 0 0 0 20"/>',home:'<path d="m3 10 9-7 9 7"/><path d="M5 8.5V20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5"/><path d="M9 22V12h6v10"/>',info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',library:'<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',lock:'<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',logOut:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',menu:'<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',message:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>',notepad:'<path d="M8 2v4"/><path d="M16 2v4"/><path d="M3 10h18"/><path d="M6 4h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/><path d="M8 14h8"/><path d="M8 18h5"/>',pause:'<path d="M8 5v14"/><path d="M16 5v14"/>',play:'<path d="m8 5 11 7-11 7V5Z"/>',plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',check:'<path d="M20 6 9 17l-5-5"/>',refresh:'<path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/><path d="M3 12A9 9 0 0 1 18.5 5.7L21 8"/><path d="M21 3v5h-5"/>',rewind:'<path d="m11 19-9-7 9-7v14Z"/><path d="m22 19-9-7 9-7v14Z"/>',save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',server:'<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',skipBack:'<path d="M19 20 9 12l10-8v16Z"/><path d="M5 19V5"/>',skipForward:'<path d="m5 4 10 8-10 8V4Z"/><path d="M19 5v14"/>',shield:'<path d="M20 13c0 5-3.5 7.5-7.7 8.8a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V5l8-3 8 3v8Z"/>',sliders:'<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>',theater:'<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M6 9h12"/><path d="M6 15h12"/>',trash:'<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',volume2:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9 9 0 0 1 0 14"/>',volumeX:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>',x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'};function S(e,{size:t=18}={}){return r`<svg viewBox="0 0 24 24" width=${t} height=${t} fill="none"
    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" dangerouslySetInnerHTML=${{__html:Bn[e]||""}} />`}function Dt(e){if(!e||typeof e!="string")return"";if(e.startsWith("/"))return e;try{let t=new URL(e,window.location.origin);if(t.origin===window.location.origin)return`${t.pathname}${t.search}`}catch{return""}return""}function Qa(e){let t=Dt(e?.avatar_url);if(!t)return"";let n=e.updated_at||"";if(!n)return t;let a=t.includes("?")?"&":"?";return`${t}${a}v=${encodeURIComponent(n)}`}function Xa(e){return(e||"C").trim().slice(0,1).toUpperCase()||"C"}function Pe({user:e,size:t=40,className:n=""}){let a=Qa(e),s=`width:${t}px;height:${t}px;font-size:${Math.round(t*.4)}px`;if(a)return r`<img class=${`user-avatar ${n}`} style=${s} src=${a} alt="" />`;let o=e?.display_name||e?.username;return r`<div class=${`user-avatar user-avatar-fallback ${n}`} style=${s} aria-hidden="true">
    ${Xa(o)}
  </div>`}function es(e){return e?.query?.q||""}function ts(e,t){let n=new URLSearchParams,a=String(t||"").trim(),s=e?.name==="publicGame"?e.game:e?.query?.game||"";a&&n.set("q",a),s&&n.set("game",s);let o=n.toString();return o?`/search?${o}`:"/search"}function Fn({active:e,route:t}){let{user:n}=K(A),[a,s]=b(!1),o=F(null),i=es(t),[u,d]=b(i);M(()=>{d(i)},[i]);let l=n?.role==="admin"||n?.role==="owner";M(()=>{if(!a)return;let c=_=>{o.current?.contains(_.target)||s(!1)},m=_=>{_.key==="Escape"&&s(!1)};return document.addEventListener("pointerdown",c),document.addEventListener("keydown",m),()=>{document.removeEventListener("pointerdown",c),document.removeEventListener("keydown",m)}},[a]);let p=[["feed","/","Feed"],["library","/library","Library",!!n],["games","/games","Games"],["admin","/admin","Admin",l]].filter(([,,,c])=>c!==!1),h=c=>{c.preventDefault();let m=new FormData(c.target).get("q")?.toString()||"";W(ts(t,m))};return r`<header class="topbar">
    <a class="wordmark" href="/" aria-label="Clipline home">
      <img src="/clipline-icon.svg" alt="" width="24" height="24" />
      <span class="wordmark-text">CLIP<span class="wordmark-accent">LINE</span></span>
    </a>
    <nav class="topnav" aria-label="Primary">
      ${p.map(([c,m,_])=>r`
        <a class=${c===e?"topnav-on":""} href=${m}>${_}</a>`)}
    </nav>
    <form class="topsearch" role="search" onSubmit=${h}>
      <input class="input" name="q" value=${u} onInput=${c=>d(c.target.value)}
        placeholder="Search clips, games, players…" aria-label="Search" />
    </form>
    ${n?r`<div class="avatar-wrap" ref=${o}>
          <button class="avatar-btn" aria-haspopup="menu" aria-expanded=${a}
            onClick=${()=>s(!a)}>
            <${Pe} user=${n} size=${28} />
          </button>
          ${a&&r`<div class="menu" role="menu" onClick=${()=>s(!1)}>
            <a role="menuitem" href="/profile">Profile</a>
            <a role="menuitem" href="/account">Account</a>
            ${l&&r`<a role="menuitem" href="/admin">Admin</a>`}
            <button role="menuitem" class="menu-danger" onClick=${ns}>Sign out</button>
          </div>`}
        </div>`:r`<a class="btn" href="/login">${S("lock",{size:14})} Sign in</a>`}
  </header>`}async function ns(){let{api:e,setCsrfToken:t}=await Promise.resolve().then(()=>(se(),Mn));try{await e("/api/v1/auth/logout",{method:"POST"})}catch{}t(null),A.set({user:null,csrfToken:null,ready:!0}),W("/login")}var as=[["feed","/","home","Feed",!0],["games","/games","globe","Games",!0],["library","/library","library","Library","auth"],["search","/search","search","Search",!0],["profile","/profile","user","Profile","auth"]];function ss(e){return as.filter(([,,,,t])=>t!=="auth"||!!e)}function zn({active:e}){let{user:t}=K(A),n=ss(t);return r`<nav class="tabbar" aria-label="Primary">
    ${n.map(([a,s,o,i])=>r`
      <a class=${a===e?"tab-on":""} href=${s}>${S(o)}<span>${i}</span></a>`)}
  </nav>`}function On(){let e=K(Qe);return r`<div class="toasts" role="status" aria-live="polite">
    ${e.map(t=>r`<div class="toast" key=${t.id}>
      <span>${t.message}</span>
      ${t.actionLabel&&r`<button class="toast-action"
        onClick=${()=>{t.onAction?.(),Xe(t.id)}}>${t.actionLabel}</button>`}
      <button class="toast-x" aria-label="Dismiss" onClick=${()=>Xe(t.id)}>✕</button>
    </div>`)}
  </div>`}se();function Ie(e,t,n=null){let a=e!=null,[s,o]=b(()=>({key:e,data:n,error:null,loading:a}));M(()=>{if(!a){o({key:e,data:n,error:null,loading:!1});return}let u=new AbortController;return o({key:e,data:n,error:null,loading:!0}),Promise.resolve().then(()=>t(u.signal)).then(d=>{o(l=>l.key===e?{key:e,data:d,error:null,loading:!1}:l)}).catch(d=>{d?.name!=="AbortError"&&o(l=>l.key===e?{key:e,data:n,error:d,loading:!1}:l)}),()=>u.abort()},[e,t]);let i=Pt(u=>{o(d=>{if(d.key!==e)return d;let l=typeof u=="function"?u(d.data):u;return{...d,data:l}})},[e]);return s.key!==e?{data:n,error:null,loading:a,setData:i}:{data:s.data,error:s.error,loading:s.loading,setData:i}}function ee(e,t=0,n=null){let a=Pt(s=>x(e,{signal:s}),[e]);return Ie(`${e}\0${t}`,a,n)}function j(e){if(!e)return"Unknown";let t=new Date(e);return Number.isNaN(t.getTime())?"Unknown":new Intl.DateTimeFormat(void 0,{dateStyle:"medium",timeStyle:"short"}).format(t)}function he(e){if(e==null)return"Unknown";let t=Math.max(0,Math.round(Number(e)/1e3)),n=Math.floor(t/60),a=t%60;return`${n}:${String(a).padStart(2,"0")}`}function nt(e){if(!e)return"Unknown";let t=new Date(e);if(Number.isNaN(t.getTime()))return"Unknown";let n=Math.min(0,t.getTime()-Date.now()),a=[["year",365*24*60*60*1e3],["month",720*60*60*1e3],["week",10080*60*1e3],["day",1440*60*1e3],["hour",3600*1e3],["minute",60*1e3],["second",1e3]],[s,o]=a.find(([,u])=>Math.abs(n)>=u)||a[a.length-1],i=Math.round(n/o);return new Intl.RelativeTimeFormat(void 0,{numeric:"always"}).format(i,s)}function z(e){if(e==null)return"Unknown";let t=Number(e);if(!Number.isFinite(t))return"Unknown";let n=["B","KiB","MiB","GiB","TiB"],a=t,s=0;for(;a>=1024&&s<n.length-1;)a/=1024,s+=1;return`${a.toFixed(s===0?0:1)} ${n[s]}`}function ke(e){let t=Number(e||0),n=Number.isFinite(t)&&t>0?Math.floor(t):0;return`${new Intl.NumberFormat(void 0,{notation:n>=1e4?"compact":"standard"}).format(n)} view${n===1?"":"s"}`}function be(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/thumbnail`}function Lt(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/thumbnail`}function at(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/media`}function Vn(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/poster`}function st(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/poster`}function Me(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/media`}function Ne(e,t,n){if(e)try{return`${t}${new URL(e).pathname}`}catch{}return n?`${t}/c/${encodeURIComponent(n)}`:null}var ot=null;function Hn(e){ot?.(),ot=e}function qn(e){ot===e&&(ot=null)}var os=()=>window.matchMedia("(pointer: fine)").matches&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches&&!navigator.connection?.saveData;function Gn({src:e,poster:t,alt:n=""}){let[a,s]=b(!1),[o,i]=b(0),u=F(null),d=F(null),l=F(!0),p=F(),h=()=>{l.current&&(clearTimeout(u.current),s(!1),i(0))};p.current=h;let c=()=>{!e||!os()||(u.current=setTimeout(()=>{l.current&&(Hn(p.current),s(!0))},300))},m=_=>{let w=_.target;w.duration&&i(w.currentTime/w.duration)};return M(()=>()=>{l.current=!1,clearTimeout(u.current),qn(p.current)},[]),r`<span class="hover-preview" onPointerEnter=${c} onPointerLeave=${h}>
    ${a?r`<video ref=${d} src=${e} poster=${t} muted loop autoplay
          playsinline preload="none" onTimeUpdate=${m} />`:r`<img src=${t} alt=${n} loading="lazy" />`}
    ${a&&r`<span class="preview-scrub"><span style=${`width:${o*100}%`} /></span>`}
  </span>`}function At(e){return e.owner?.display_name||e.owner?.username||e.owner_username||e.author_name||e.author_username||null}function Re({clip:e,href:t,selectable:n=!1,selected:a=!1,onToggleSelect:s,showVisibility:o=!1,showAuthor:i=!1}){let u=At(e),d=[e.game_name&&r`<em>${e.game_name}</em>`,i&&u,e.view_count!=null&&ke(e.view_count),e.uploaded_at&&nt(e.uploaded_at)].filter(Boolean);return r`<article class=${`clip-card ${a?"is-selected":""} ${n?"is-selectable":""}`}>
    <a class="card-thumb" href=${t} tabindex="-1" aria-hidden="true">
      <${Gn} src=${e.media_url} poster=${e.thumbnail_url} />
      ${e.duration_ms!=null&&r`<span class="dur-pill">${he(e.duration_ms)}</span>`}
      ${o&&r`<span class=${`badge badge-${e.visibility} card-vis`}>${e.visibility}</span>`}
    </a>
    ${n&&r`<label class="card-check">
      <input type="checkbox" checked=${a} aria-label=${`Select ${e.title}`}
        onChange=${()=>s?.(e.id)} />
    </label>`}
    <h3 class="card-title"><a href=${t}>${e.title}</a></h3>
    <p class="card-meta">${d.map((l,p)=>r`${p>0&&" \xB7 "}${l}`)}</p>
  </article>`}function Z({name:e="film",title:t,body:n,action:a}){return r`<div class="empty">
    <div class="empty-icon">${S(e,{size:28})}</div>
    <h3>${t}</h3>
    ${n&&r`<p>${n}</p>`}
    ${a}
  </div>`}var rs=[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]],is=6,ls=60;function cs(e){let t=new URLSearchParams;return t.set("page_size",String(ls)),e.sort!=="uploaded_at_desc"&&t.set("sort",e.sort),e.game&&t.set("game",e.game),e.q&&t.set("q",e.q),Number(e.page)>1&&t.set("page",String(e.page)),t}function Kn(e){return e?.game_name||"No game"}function us(e,t,n=is){let a=[...e||[]].sort((h,c)=>(c.clip_count||0)-(h.clip_count||0)),s=a.slice(0,n),o=String(t||"").trim(),i=o&&s.some(h=>h.game===o),u=o&&!i?a.find(h=>h.game===o)||{game:o,clip_count:0}:null,d=u?[u,...s]:s,l=new Set(d.map(h=>h.game)),p=a.filter(h=>!l.has(h.game)).length;return{chips:d,extraGameCount:p}}function rt({route:e}){let t={sort:"uploaded_at_desc",page:1,q:"",...e.query,game:e.name==="publicGame"?e.game:e.query?.game||""},n=`/api/v1/public/clips?${cs(t)}`,{data:a,error:s}=ee(n),{data:o}=ee("/api/v1/public/games",0,{games:[]}),i=o?.games||[],u=m=>W(ms({...t,page:1,...m}));if(s)return r`<main class="page">
      <${Z} name="alert" title="Couldn't load the feed" body=${s.message} />
    </main>`;let d=a?.clips,l=!!(t.game||t.q)||Number(t.page)>1,p=!l,{chips:h,extraGameCount:c}=us(i,t.game);return r`<main class="page">
    ${d==null?r`<${ps} />`:d.length===0?r`<${Z} name="film"
          title=${l?"No clips match this filter":"No public clips yet"}
          body=${l?"Try a different game, search, or clear your filters.":"Clips shared as public from a library will show up here."}
          action=${l&&r`<a class="btn" href="/">Clear filters</a>`} />`:r`
        ${p?ds(d):""}
        <div class="feed-toolbar">
          <h2>Latest uploads</h2>
          <select class="input" value=${t.sort} onChange=${m=>u({sort:m.target.value})}>
            ${rs.map(([m,_])=>r`<option value=${m}>${_}</option>`)}
          </select>
          <div class="chips">
            <button class=${`chip ${t.game?"":"chip-on"}`} onClick=${()=>u({game:""})}>All</button>
            ${h.map(m=>r`<button
              class=${`chip ${t.game===m.game?"chip-on":""}`}
              onClick=${()=>u({game:m.game})}>${m.game}</button>`)}
            ${c>0&&r`<a class="chip" href="/games">+${c}</a>`}
          </div>
        </div>
        <div class="card-grid">
          ${(p?d.slice(4):d).map(m=>r`<${Re} clip=${{...m,thumbnail_url:be(m),media_url:Me(m)}}
              href=${It(m)} showAuthor />`)}
        </div>
        ${fs(a,t,u)}
      `}
  </main>`}function ds(e){let[t,...n]=e,a=n.slice(0,3);return r`<p class="kicker">Now playing on this server</p>
    <section class="hero">
      <a class="hero-main" href=${It(t)}>
        <img src=${st(t)} alt="" loading="lazy" />
        <span class="hero-caption">▶ ${t.title} — ${Kn(t)} · ${he(t.duration_ms)}</span>
      </a>
      <div class="hero-side">
        ${a.map(s=>r`<a class="hero-row" href=${It(s)}>
            <span class="hero-thumb">
              <img src=${be(s)} alt="" loading="lazy" />
              <span class="dur-pill">${he(s.duration_ms)}</span>
            </span>
            <span class="hero-copy"><b>${s.title}</b>
              <small>${At(s)} · ${Kn(s)} · ${ke(s.view_count)}</small></span>
          </a>`)}
      </div>
    </section>`}function ps({count:e=8}){return r`<div class="card-grid">
    ${Array.from({length:e},(t,n)=>r`<div class="clip-card" key=${n}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`}function It(e){return`/c/${encodeURIComponent(e.share_id)}`}function ms({sort:e="uploaded_at_desc",game:t="",q:n="",page:a=1}={}){let s=new URLSearchParams,o=e||"uploaded_at_desc",i=String(t||"").trim(),u=String(n||"").trim(),d=Math.max(1,Number(a||1));if(o!=="uploaded_at_desc"&&s.set("sort",o),d>1&&s.set("page",String(d)),u)return s.set("q",u),i&&s.set("game",i),`/search?${s.toString()}`;if(i){let p=s.toString();return`/game/${encodeURIComponent(i)}${p?`?${p}`:""}`}let l=s.toString();return l?`/search?${l}`:"/"}function fs(e,t,n){let a=Math.max(1,Number(t.page||1)),s=!!e?.has_more;return a<=1&&!s?"":r`<nav class="pager" aria-label="Public clip pages">
    <button class="btn" type="button" disabled=${a<=1}
      onClick=${()=>n({page:a-1})}>Previous</button>
    <span class="muted">Page ${a}</span>
    <button class="btn" type="button" disabled=${!s}
      onClick=${()=>n({page:a+1})}>Next</button>
  </nav>`}function Wn(){let{data:e,error:t}=ee("/api/v1/public/games"),n=e?.games??null;return t?r`<main class="page">
      <${Z} name="alert" title="Couldn't load games" body=${t.message} />
    </main>`:r`<main class="page">
    <p class="kicker">Browse by game</p>
    ${n==null?r`<div class="game-grid">
          ${Array.from({length:6},(a,s)=>r`<div class="game-tile is-loading" key=${s}>
            <div class="skeleton-thumb"></div>
          </div>`)}
        </div>`:n.length===0?r`<${Z} name="film" title="No games yet"
          body="Once clips are shared as public, their games will show up here." />`:r`<div class="game-grid">
          ${n.map(a=>r`<a class="game-tile" href=${`/game/${encodeURIComponent(a.game)}`}>
            ${a.thumbnail_url?r`<img src=${a.thumbnail_url} alt="" loading="lazy" />`:r`<div class="game-tile-fallback">${(a.game||"?")[0].toUpperCase()}</div>`}
            <div class="game-tile-body">
              <b>${a.game}</b>
              <small>${a.clip_count} clip${a.clip_count===1?"":"s"}</small>
            </div>
          </a>`)}
        </div>`}
  </main>`}se();function jn({trigger:e,content:t,onClose:n,label:a,panelClass:s=""}){let[o,i]=b(!1),u=F(null),d=F(null),l=F(null),p=()=>{i(!1),n?.()},h=()=>{if(o){p();return}l.current=document.activeElement,i(!0)};return M(()=>{if(!o)return;let c=w=>{u.current?.contains(w.target)||p()},m=w=>{w.key==="Escape"&&p()};return document.addEventListener("pointerdown",c),document.addEventListener("keydown",m),d.current?.querySelector("input, select, textarea, button, a[href], [tabindex]")?.focus(),()=>{document.removeEventListener("pointerdown",c),document.removeEventListener("keydown",m),l.current?.focus?.()}},[o]),r`<div class="popover-wrap" ref=${u}>
    ${e({open:o,toggle:h})}
    ${o&&r`<div class=${`popover ${s}`} ref=${d} role="dialog" aria-label=${a||"Filters"}>
      ${t}
    </div>`}
  </div>`}function Zn({count:e,busy:t=!1,onPublic:n,onPrivate:a,onCopyLinks:s,onDelete:o,onClear:i}){return e?r`<div class="bulkbar" role="toolbar" aria-label="Bulk actions" aria-busy=${t?"true":"false"}>
    <b>${e} selected</b>
    <button class="btn" disabled=${t} onClick=${n}>Make public</button>
    <button class="btn" disabled=${t} onClick=${a}>Make private</button>
    <button class="btn" disabled=${t} onClick=${s}>Copy links</button>
    <button class="btn btn-danger" disabled=${t} onClick=${o}>Delete</button>
    <button class="btn bulk-x" disabled=${t} aria-label="Clear selection" onClick=${i}>✕</button>
  </div>`:null}function de({open:e,title:t,body:n,confirmLabel:a="Confirm",onConfirm:s,onCancel:o,danger:i=!1,confirmDisabled:u=!1}){let d=F(null),l=F(null);return M(()=>{let p=d.current;p&&(e&&!p.open?(p.showModal(),l.current?.focus()):!e&&p.open&&p.close())},[e]),r`<dialog ref=${d} class="confirm-dialog" aria-labelledby="confirm-dialog-title"
    onCancel=${p=>{p.preventDefault(),o?.()}}
    onClose=${()=>e&&o?.()}>
    ${e&&r`<div class="confirm-dialog-body">
      <h2 id="confirm-dialog-title">${t}</h2>
      ${n&&r`<p>${n}</p>`}
      <div class="confirm-dialog-actions">
        <button type="button" class="btn" onClick=${o}>Cancel</button>
        <button type="button" ref=${l} class=${`btn ${i?"btn-danger":"btn-primary"}`}
          disabled=${u} onClick=${s}>${a}</button>
      </div>
    </div>`}
  </dialog>`}var Qn="clipline.libraryView",_s=[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["updated_at_desc","Updated newest"],["updated_at_asc","Updated oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["size_desc","Size largest"],["size_asc","Size smallest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]],it={title:["title_asc","title_desc"],size:["size_asc","size_desc"],duration:["duration_asc","duration_desc"],uploaded:["uploaded_at_asc","uploaded_at_desc"]},hs=["visibility","status","source_type","from","to","min_duration_seconds","max_duration_seconds","min_size_mib","max_size_mib"],ut={sort:"uploaded_at_desc",page:1,game:"",source_type:"",visibility:"",status:"",q:"",from:"",to:"",min_duration_seconds:"",max_duration_seconds:"",min_size_mib:"",max_size_mib:""};function lt(e){if(e===""||e==null)return null;let t=Number(e);return Number.isFinite(t)?t:null}function bs(e){let t=new URLSearchParams;t.set("sort",e.sort||ut.sort),t.set("page_size","100"),t.set("page",String(Math.max(1,Number(e.page||1))));for(let i of["game","source_type","visibility","status","q"])e[i]&&t.set(i,e[i]);e.from&&t.set("from",`${e.from}T00:00:00Z`),e.to&&t.set("to",`${e.to}T23:59:59Z`);let n=lt(e.min_duration_seconds);n!=null&&t.set("min_duration_ms",String(Math.round(n*1e3)));let a=lt(e.max_duration_seconds);a!=null&&t.set("max_duration_ms",String(Math.round(a*1e3)));let s=lt(e.min_size_mib);s!=null&&t.set("min_size_bytes",String(Math.round(s*1024*1024)));let o=lt(e.max_size_mib);return o!=null&&t.set("max_size_bytes",String(Math.round(o*1024*1024))),t}function $s(e){return hs.reduce((t,n)=>t+(e[n]?1:0),0)}function vs(e,t=6){let n=new Map;for(let a of e){let s=a.game_name;s&&n.set(s,(n.get(s)||0)+1)}return Array.from(n,([a,s])=>({game:a,count:s})).sort((a,s)=>s.count-a.count||a.game.localeCompare(s.game)).slice(0,t)}function Jn(e,t,{verb:n,allFailedMessage:a}){let s=e.filter(i=>!t.some(u=>u.id===i));if(!t.length)return{succeeded:s,message:null};let o=t.length===e.length?t[0]?.message||a:`Couldn't ${n} ${t.length} of ${e.length} clips.`;return{succeeded:s,message:o}}function gs(e,t){return(e||[]).map(n=>Ne(n.public_url,t,n.public_share_id)).filter(Boolean)}async function Yn(e,t,n){let a=0;async function s(){let o=a++;if(!(o>=e.length))return await n(e[o]),s()}await Promise.all(Array.from({length:Math.min(t,e.length)},s))}function ys(){try{return localStorage.getItem(Qn)==="rows"?"rows":"grid"}catch{return"grid"}}function Xn(){let[e,t]=b(ys),[n,a]=b(ut),[s,o]=b(ut.q),[i,u]=b(new Set),[d,l]=b(!1),[p,h]=b(!1),[c,m]=b(0),_=`/api/v1/clips?${bs(n)}`,{data:w,error:P,setData:R}=ee(_,c),T=F(!1),D=F(null);M(()=>()=>clearTimeout(D.current),[]),M(()=>u(new Set),[_,c]);let V=$=>{t($);try{localStorage.setItem(Qn,$)}catch{}},B=()=>m($=>$+1),E=$=>{T.current=$,l($)},J=$=>{let y=$.target.value;o(y),clearTimeout(D.current),D.current=setTimeout(()=>{a(U=>({...U,q:y,page:1}))},300)},H=$=>y=>{let U=y.target.value;a(N=>({...N,[$]:U,page:1}))},ne=()=>{a($=>({...$,page:1,visibility:"",status:"",source_type:"",from:"",to:"",min_duration_seconds:"",max_duration_seconds:"",min_size_mib:"",max_size_mib:""}))},L=$=>a(y=>({...y,game:y.game===$?"":$,page:1})),Y=$=>a(y=>({...y,sort:$,page:1})),xe=$=>a(y=>({...y,page:Math.max(1,$)})),ie=$=>{u(y=>{let U=new Set(y);return U.has($)?U.delete($):U.add($),U})};function re($,y){R(U=>U&&{...U,clips:U.clips.map(N=>N.id===$?{...N,...y}:N)})}function Se($,y){let U=new Set($);R(N=>N&&{...N,clips:N.clips.map(f=>U.has(f.id)?{...f,...y}:f)})}async function pe($){if(T.current)return;let y=Array.from(i);if(!y.length)return;let U=w?.clips||[],N=new Map(y.map(C=>[C,U.find(X=>X.id===C)]));E(!0),Se(y,{visibility:$});let f=[],k=new Map;try{await Yn(y,4,async ue=>{try{let ae=await x(`/api/v1/clips/${encodeURIComponent(ue)}/visibility`,{method:"POST",body:{visibility:$}}),Ue={visibility:ae.visibility,public_url:ae.public_url,public_share_id:ae.public_share_id};re(ue,Ue),k.set(ue,Ue)}catch(ae){f.push({id:ue,message:ae.message})}});let{succeeded:C,message:X}=Jn(y,f,{verb:"update",allFailedMessage:"Couldn't update visibility."});if(X){for(let{id:ue}of f){let ae=N.get(ue);ae&&re(ue,{visibility:ae.visibility,public_url:ae.public_url,public_share_id:ae.public_share_id})}g(X)}C.length&&(u(new Set),g(`Made ${C.length} clip${C.length===1?"":"s"} ${$}`,{actionLabel:"Undo",onAction:()=>le(C,N,k)}))}finally{E(!1)}}async function le($,y,U){if(T.current){g("Wait for visibility changes to finish.");return}E(!0);try{for(let k of $){let C=y.get(k);C&&re(k,{visibility:C.visibility,public_url:C.public_url,public_share_id:C.public_share_id})}let N=[];await Yn($,4,async k=>{let C=y.get(k);if(C)try{let X=await x(`/api/v1/clips/${encodeURIComponent(k)}/visibility`,{method:"POST",body:{visibility:C.visibility}});re(k,{visibility:X.visibility,public_url:X.public_url,public_share_id:X.public_share_id})}catch(X){N.push({id:k,message:X.message})}});let{message:f}=Jn($,N,{verb:"undo",allFailedMessage:"Couldn't undo visibility change."});if(f){for(let{id:k}of N){let C=U.get(k);C&&re(k,C)}g(f)}}finally{E(!1)}}async function $e(){if(T.current){g("Wait for visibility changes to finish.");return}let $=Array.from(i),y=w?.clips||[],U=$.map(k=>y.find(C=>C.id===k)).filter(Boolean),N=gs(U,window.location.origin),f=U.length-N.length;if(!N.length){g("No links to copy \u2014 selected clips are private.");return}try{await navigator.clipboard.writeText(N.join(`
`)),g(`Copied ${N.length} link${N.length===1?"":"s"}`+(f?` (${f} skipped, private)`:""))}catch{g("Couldn't copy links to clipboard.")}}async function me(){let $=Array.from(i);h(!1);try{let y=await x("/api/v1/clips/bulk-delete",{method:"POST",body:{ids:$}});u(new Set),B(),g(`Deleted ${y.affected} clip${y.affected===1?"":"s"}.`)}catch(y){g(y.message)}}if(P)return r`<main class="page">
      <${Z} name="alert" title="Couldn't load your library" body=${P.message} />
    </main>`;let te=w?.clips,oe=$s(n),Ce=!!(n.q||n.game)||oe>0,ve=vs(te||[]),ye=Number(w?.total??(te||[]).length),Ee=Number(w?.total_size_bytes??(te||[]).reduce(($,y)=>$+(y.file_size_bytes||0),0)),ce=Number(w?.page||n.page||1),v=ce>1||!!w?.has_more,q=r`<div class="popover-fields">
    <label class="field"><span>Visibility</span>
      <select class="input" value=${n.visibility} onChange=${H("visibility")}>
        <option value="">Any</option>
        <option value="private">Private</option>
        <option value="public">Public</option>
        <option value="unlisted">Unlisted</option>
      </select>
    </label>
    <label class="field"><span>Status</span>
      <select class="input" value=${n.status} onChange=${H("status")}>
        <option value="">Any</option>
        <option value="created">Created</option>
        <option value="uploading">Uploading</option>
        <option value="processing">Processing</option>
        <option value="ready">Ready</option>
        <option value="failed">Failed</option>
      </select>
    </label>
    <label class="field"><span>Source</span>
      <input class="input" type="text" value=${n.source_type} onInput=${H("source_type")} placeholder="Source type" />
    </label>
    <label class="field"><span>From</span>
      <input class="input" type="date" value=${n.from} onInput=${H("from")} />
    </label>
    <label class="field"><span>To</span>
      <input class="input" type="date" value=${n.to} onInput=${H("to")} />
    </label>
    <label class="field"><span>Min duration (s)</span>
      <input class="input" type="number" min="0" value=${n.min_duration_seconds} onInput=${H("min_duration_seconds")} />
    </label>
    <label class="field"><span>Max duration (s)</span>
      <input class="input" type="number" min="0" value=${n.max_duration_seconds} onInput=${H("max_duration_seconds")} />
    </label>
    <label class="field"><span>Min size (MiB)</span>
      <input class="input" type="number" min="0" step="0.1" value=${n.min_size_mib} onInput=${H("min_size_mib")} />
    </label>
    <label class="field"><span>Max size (MiB)</span>
      <input class="input" type="number" min="0" step="0.1" value=${n.max_size_mib} onInput=${H("max_size_mib")} />
    </label>
    <div class="popover-actions">
      <button type="button" class="btn" onClick=${ne}>Clear filters</button>
    </div>
  </div>`;return r`<main class="page">
    <div class="lib-header">
      <div>
        <h1>Library</h1>
        <p>${ye} clip${ye===1?"":"s"} · ${z(Ee)} used</p>
      </div>
      <div class="seg" role="group" aria-label="View">
        <button type="button" class=${`seg-item ${e==="grid"?"seg-on":""}`}
          aria-pressed=${e==="grid"} onClick=${()=>V("grid")}>Grid</button>
        <button type="button" class=${`seg-item ${e==="rows"?"seg-on":""}`}
          aria-pressed=${e==="rows"} onClick=${()=>V("rows")}>Rows</button>
      </div>
    </div>

    <div class="lib-toolbar">
      <input class="input" type="search" aria-label="Search clips" placeholder="Search title or game"
        value=${s} onInput=${J} />
      <select class="input" aria-label="Sort" value=${n.sort} onChange=${$=>Y($.target.value)}>
        ${_s.map(([$,y])=>r`<option value=${$}>${y}</option>`)}
      </select>
      <${jn}
        label="Filters"
        panelClass="popover-filters"
        trigger=${({open:$,toggle:y})=>r`<button type="button" class="btn" aria-haspopup="dialog"
          aria-expanded=${$} onClick=${y}>
          ${S("sliders",{size:14})} Filters
          ${oe>0&&r`<span class="filter-badge">${oe}</span>`}
        </button>`}
        content=${q} />
    </div>

    ${ve.length>0&&r`<div class="lib-chips">
      <button type="button" class=${`chip ${n.game?"":"chip-on"}`} aria-pressed=${!n.game}
        onClick=${()=>L("")}>All</button>
      ${ve.map($=>r`<button type="button" class=${`chip ${n.game===$.game?"chip-on":""}`}
        aria-pressed=${n.game===$.game} onClick=${()=>L($.game)}>${$.game}</button>`)}
    </div>`}

    ${te==null?r`<${ks} />`:te.length===0?Ce?r`<${Z} name="film" title="No clips match this view"
            body="Try a different search, game, or clear your filters."
            action=${r`<button type="button" class="btn" onClick=${()=>{a(ut),o("")}}>Clear filters</button>`} />`:r`<${Z} name="upload" title="Connect the Clipline desktop app to start uploading"
            body="New clips uploaded from the desktop app will show up here."
            action=${r`<a class="btn" href="/about">Learn more</a>`} />`:e==="grid"?r`<div class=${`card-grid ${i.size>0?"selecting":""}`}>
          ${te.map($=>r`<${Re} key=${$.id}
            clip=${{...$,thumbnail_url:Lt($),media_url:at($)}}
            href=${`/clip/${encodeURIComponent($.id)}`}
            selectable selected=${i.has($.id)} onToggleSelect=${ie} showVisibility />`)}
        </div>`:r`<${ws} clips=${te} query=${n} onSort=${Y}
          selected=${i} onToggleSelect=${ie} />`}

    ${v&&r`<nav class="pager" aria-label="Library pages">
      <button type="button" class="btn" disabled=${ce<=1}
        onClick=${()=>xe(ce-1)}>Previous</button>
      <span>Page ${ce}</span>
      <button type="button" class="btn" disabled=${!w?.has_more}
        onClick=${()=>xe(ce+1)}>Next</button>
    </nav>`}

    <${Zn} count=${i.size} busy=${d}
      onPublic=${()=>pe("public")}
      onPrivate=${()=>pe("private")}
      onCopyLinks=${$e}
      onDelete=${()=>h(!0)}
      onClear=${()=>u(new Set)} />

    <${de} open=${p}
      title=${`Delete ${i.size} clip${i.size===1?"":"s"}?`}
      body="Public links stop working immediately."
      confirmLabel="Delete" danger
      onConfirm=${me}
      onCancel=${()=>h(!1)} />
  </main>`}function ct(e,[t,n]){let a=e.sort===t?"ascending":e.sort===n?"descending":"none",s=e.sort===n?t:n;return{ariaSort:a,next:s}}function ws({clips:e,query:t,onSort:n,selected:a,onToggleSelect:s}){let o=ct(t,it.title),i=ct(t,it.size),u=ct(t,it.duration),d=ct(t,it.uploaded);return r`<table class="lib-table">
    <thead>
      <tr>
        <th class="row-select-cell"></th>
        <th></th>
        <th aria-sort=${o.ariaSort}><button type="button" class="sort-btn" onClick=${()=>n(o.next)}>Title</button></th>
        <th>Game</th>
        <th>Visibility</th>
        <th aria-sort=${i.ariaSort}><button type="button" class="sort-btn" onClick=${()=>n(i.next)}>Size</button></th>
        <th aria-sort=${u.ariaSort}><button type="button" class="sort-btn" onClick=${()=>n(u.next)}>Duration</button></th>
        <th aria-sort=${d.ariaSort}><button type="button" class="sort-btn" onClick=${()=>n(d.next)}>Uploaded</button></th>
      </tr>
    </thead>
    <tbody>
      ${e.map(l=>r`<tr key=${l.id} class=${a?.has(l.id)?"is-selected":""}>
        <td class="row-select-cell">
          <input class="row-select" type="checkbox" checked=${a?.has(l.id)}
            aria-label=${`Select ${l.title}`} onChange=${()=>s?.(l.id)} />
        </td>
        <td><img class="row-thumb" src=${Lt(l)} alt="" width="64" height="36" loading="lazy" /></td>
        <td><a href=${`/clip/${encodeURIComponent(l.id)}`}>${l.title}</a></td>
        <td>${l.game_name||"\u2014"}</td>
        <td><span class=${`badge badge-${l.visibility}`}>${l.visibility}</span></td>
        <td>${z(l.file_size_bytes)}</td>
        <td>${he(l.duration_ms)}</td>
        <td>${j(l.uploaded_at)}</td>
      </tr>`)}
    </tbody>
  </table>`}function ks({count:e=8}){return r`<div class="card-grid">
    ${Array.from({length:e},(t,n)=>r`<div class="clip-card" key=${n}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`}se();var xs={ChampionKill:"kill",FirstBlood:"kill",Multikill:"spree",Ace:"spree",DragonKill:"objective",HeraldKill:"objective",BaronKill:"objective",TurretKilled:"structure",InhibKilled:"structure",FirstBrick:"structure"};function ta(e){let t=Number(e);return Number.isFinite(t)&&t>0?t/1e3:0}function na(e,t){let n=Number.isFinite(e)?e:0,a=t>0?t:Number.MAX_SAFE_INTEGER;return Math.max(0,Math.min(a,n))}function dt(e,t){return t>0?Math.max(0,Math.min(100,e/t*100)):0}function Nt(e){if(!Number.isFinite(e))return"0:00";let t=Math.max(0,Math.round(e)),n=Math.floor(t/60),a=t-n*60;return`${n}:${String(a).padStart(2,"0")}`}function ea(e){if(!Number.isFinite(e))return"0:00.0";let t=Math.max(0,Math.round(e*10)),n=Math.floor(t/600),a=t-n*600,s=Math.floor(a/10);return`${n}:${String(s).padStart(2,"0")}.${a%10}`}function aa(e,t){return`${ea(e)} / ${t>0?ea(t):"0:00.0"}`}function Ss(e){return xs[e]||"info"}function sa(e,t){return(e||[]).map((n,a)=>{let s=Number(n.timestamp_ms);if(!Number.isFinite(s))return null;let o=s/1e3;return o<0||t>0&&o>t?null:{index:a,time:o,kind:String(n.kind||"Marker"),label:String(n.label||n.kind||"Marker"),category:Ss(n.kind)}}).filter(Boolean).sort((n,a)=>n.time-a.time)}function oa(e,t){if(!e.length)return null;for(let n of e)if(n.time>t+.05)return n;return e[0]}function ra(e,t){if(!e.length)return null;for(let n=e.length-1;n>=0;n-=1)if(e[n].time<t-.05)return e[n];return e[e.length-1]}function ia(e,t){switch(e){case"Space":case"KeyK":return{kind:"toggle-play"};case"ArrowLeft":return{kind:"seek-by",seconds:t?-1:-5};case"ArrowRight":return{kind:"seek-by",seconds:t?1:5};case"KeyJ":return{kind:"seek-by",seconds:-10};case"KeyL":return{kind:"seek-by",seconds:10};case"Comma":return{kind:"seek-by",seconds:-.1};case"Period":return{kind:"seek-by",seconds:.1};case"KeyM":return{kind:t?"previous-marker":"next-marker"};case"Home":return{kind:"seek-to",seconds:0};case"End":return{kind:"seek-to-end"};case"KeyF":return{kind:"fullscreen"};case"KeyT":return{kind:"theater"};default:return null}}var ca="clipline.playerVolume",ua="clipline.clipTheaterMode",Cs=2e3,Ts=[.25,.5,.75,1,1.25,1.5,2];function Ps(e,t){switch(e){case"KeyM":return{kind:"toggle-mute"};case"KeyF":return{kind:"theater"};case"Escape":return{kind:"exit-theater"};default:return ia(e,t)}}function Ms(e){return e instanceof Element?!!e.closest("input, textarea, select, button, a, [contenteditable='true'], [contenteditable='']"):!1}function Rs(){try{let e=window.localStorage.getItem(ca);if(e==null)return 1;let t=Number(e);return Number.isFinite(t)?Math.max(0,Math.min(1,t)):1}catch{return 1}}function la(e){try{window.localStorage.setItem(ca,String(Math.max(0,Math.min(1,e))))}catch{}}function Es(){try{return window.localStorage.getItem(ua)==="true"}catch{return!1}}function Us(e){try{window.localStorage.setItem(ua,String(e))}catch{}}function da({src:e,poster:t,durationMs:n,markers:a}){let s=F(null),o=F(null),i=F(null),u=F(!1),d=F(!1),l=ta(n),[p,h]=b(!1),[c,m]=b(0),[_,w]=b(l),[P,R]=b(0),[T,D]=b(Rs),[V,B]=b(!1),[E,J]=b(1),[H,ne]=b(!1),[L,Y]=b(Es),[xe,ie]=b(!0),[re,Se]=b(null),[pe,le]=b(""),$e=sa(a,_);function me(){ie(!0),window.clearTimeout(i.current),i.current=window.setTimeout(()=>{let f=s.current;f&&!f.paused&&!f.ended&&ie(!1)},Cs)}M(()=>{p||(window.clearTimeout(i.current),ie(!0))},[p]),M(()=>{let f=s.current;if(!f)return;let k=()=>Number.isFinite(f.duration)&&f.duration>0?f.duration:l,C=()=>w(k()),X=()=>w(k()),ue=()=>{u.current||m(f.currentTime||0)},ae=()=>{let Wt=k();if(!(Wt>0)||!f.buffered?.length){R(0);return}let jt=f.currentTime||0,Fe=0;for(let ze=0;ze<f.buffered.length;ze+=1){let Da=f.buffered.start(ze),ht=f.buffered.end(ze);if(jt>=Da&&jt<=ht){Fe=ht;break}Fe=Math.max(Fe,ht)}R(dt(Fe,Wt))},Ue=()=>{h(!0),le(""),me()},Ht=()=>h(!1),qt=()=>h(!1),Gt=()=>{D(f.volume),B(f.muted||f.volume===0)},Kt=()=>le("Playback unavailable");return f.addEventListener("loadedmetadata",C),f.addEventListener("durationchange",X),f.addEventListener("timeupdate",ue),f.addEventListener("progress",ae),f.addEventListener("play",Ue),f.addEventListener("pause",Ht),f.addEventListener("ended",qt),f.addEventListener("volumechange",Gt),f.addEventListener("error",Kt),()=>{f.removeEventListener("loadedmetadata",C),f.removeEventListener("durationchange",X),f.removeEventListener("timeupdate",ue),f.removeEventListener("progress",ae),f.removeEventListener("play",Ue),f.removeEventListener("pause",Ht),f.removeEventListener("ended",qt),f.removeEventListener("volumechange",Gt),f.removeEventListener("error",Kt)}},[e,l]),M(()=>{s.current&&(s.current.volume=T)},[T]),M(()=>{s.current&&(s.current.muted=V)},[V]),M(()=>{s.current&&(s.current.playbackRate=E)},[E]),M(()=>{let f=s.current;if(!f)return;let k=!1;async function C(){if(!k)try{await f.play();return}catch{if(k||!f.paused)return;f.muted=!0,B(!0);try{await f.play()}catch(X){le(X?.message||"Playback unavailable")}}}return f.readyState>=HTMLMediaElement.HAVE_FUTURE_DATA?C():f.addEventListener("canplay",C,{once:!0}),()=>{k=!0,f.removeEventListener("canplay",C)}},[e]),M(()=>{let f=document.documentElement;return f.classList.toggle("clipline-theater",L),()=>f.classList.remove("clipline-theater")},[L]);function te(f){Y(f),Us(f)}function oe(f){let k=s.current;if(!k)return;let C=_>0?na(f,_):Math.max(0,f);k.currentTime=C,m(C)}function Ce(f){oe((s.current?.currentTime||0)+f)}async function ve(){let f=s.current;if(f)if(f.paused||f.ended)try{await f.play()}catch(k){le(k?.message||"Playback failed")}else f.pause()}function ye(){let f=s.current;f&&(f.muted||f.volume===0?(f.muted=!1,f.volume===0&&(f.volume=1,D(1),la(1)),B(!1)):(f.muted=!0,B(!0)))}function Ee(f){let k=Number(f.target.value);D(k),B(k===0),la(k);let C=s.current;C&&(C.volume=k,C.muted=k===0)}async function ce(){try{document.fullscreenElement?await document.exitFullscreen():await o.current?.requestFullscreen?.()}catch(f){le(f?.message||"Fullscreen unavailable")}}function v(f){let k=s.current?.currentTime||0,C=f>0?oa($e,k):ra($e,k);C&&oe(C.time)}function q(){u.current=!0,d.current=p,p&&s.current?.pause()}function $(f){let k=Number(f.target.value);m(k),oe(k)}function y(){u.current&&(u.current=!1,d.current&&(d.current=!1,s.current?.play().catch(()=>{})))}function U(f){let k=f.currentTarget.getBoundingClientRect();if(!(k.width>0))return;let C=Math.max(0,Math.min(1,(f.clientX-k.left)/k.width));Se({pct:C*100,time:C*(_||0)})}function N(){Se(null)}return M(()=>{function f(k){if(k.defaultPrevented||Ms(k.target))return;let C=Ps(k.code,k.shiftKey);if(C&&!(C.kind==="exit-theater"&&!L))switch(k.preventDefault(),me(),C.kind){case"toggle-play":ve();break;case"seek-by":Ce(C.seconds);break;case"seek-to":oe(C.seconds);break;case"seek-to-end":oe(_);break;case"next-marker":v(1);break;case"previous-marker":v(-1);break;case"toggle-mute":ye();break;case"theater":te(!L);break;case"exit-theater":te(!1);break;case"fullscreen":ce();break;default:break}}return document.addEventListener("keydown",f),()=>document.removeEventListener("keydown",f)},[_,L,p]),r`<div class=${`player ${xe?"":"chrome-hidden"}`} ref=${o}
      onPointerMove=${me} onPointerEnter=${me}
      onPointerLeave=${()=>{let f=s.current;f&&!f.paused&&ie(!1)}}
      onFocusIn=${()=>ie(!0)}>
    <video ref=${s} class="player-video" src=${e} poster=${t||void 0}
      preload="metadata" playsinline onClick=${ve}></video>
    ${pe&&r`<div class="player-note">${pe}</div>`}
    <div class="player-overlay">
      <div class="player-timeline" onPointerMove=${U} onPointerLeave=${N}>
        <div class="player-buffered" style=${`width:${P}%`}></div>
        <div class="player-progress" style=${`width:${dt(c,_)}%`}></div>
        ${$e.map(f=>r`<span class="player-marker-tick" key=${f.index}
            style=${`left:${dt(f.time,_)}%`} title=${`${f.label} @ ${Nt(f.time)}`}></span>`)}
        <input class="player-scrubber" type="range" min="0" max=${_>0?_:0} step="0.01"
          value=${c} disabled=${!(_>0)} aria-label="Seek"
          onPointerDown=${q} onInput=${$} onChange=${y}
          onPointerUp=${y} onPointerCancel=${y} onLostPointerCapture=${y} />
        ${re&&r`<div class="player-hover-time" style=${`left:${re.pct}%`}>${Nt(re.time)}</div>`}
      </div>
      <div class="player-controls">
        ${$e.length>0&&r`<div class="player-cluster">
          <button type="button" class="player-btn" title="Previous marker" aria-label="Previous marker"
            onClick=${()=>v(-1)}>${S("skipBack",{size:14})}</button>
          <button type="button" class="player-btn" title="Next marker" aria-label="Next marker"
            onClick=${()=>v(1)}>${S("skipForward",{size:14})}</button>
        </div>`}
        <button type="button" class="player-btn player-play" aria-label=${p?"Pause":"Play"} onClick=${ve}>
          ${S(p?"pause":"play",{size:16})}
        </button>
        <span class="player-time">${aa(c,_)}</span>
        <div class="player-spacer"></div>
        <div class="player-speed-wrap">
          <button type="button" class="player-btn player-speed" aria-haspopup="menu" aria-expanded=${H}
            onClick=${()=>ne(f=>!f)}>${E}×</button>
          ${H&&r`<div class="player-speed-menu" role="menu">
            ${Ts.map(f=>r`<button type="button" role="menuitem" key=${f}
                class=${`player-speed-item ${f===E?"is-active":""}`}
                onClick=${()=>{J(f),ne(!1)}}>${f}×</button>`)}
          </div>`}
        </div>
        <button type="button" class="player-btn" aria-label=${V?"Unmute":"Mute"} onClick=${ye}>
          ${S(V?"volumeX":"volume2",{size:14})}
        </button>
        <input class="player-volume" type="range" min="0" max="1" step="0.01" value=${V?0:T}
          aria-label="Volume" onInput=${Ee} />
        <button type="button" class="player-btn" aria-label=${L?"Exit theater mode":"Theater mode"}
          aria-pressed=${L} onClick=${()=>te(!L)}>${S("theater",{size:14})}</button>
        <button type="button" class="player-btn" aria-label="Fullscreen" onClick=${ce}>
          ${S("fullscreen",{size:14})}
        </button>
      </div>
    </div>
  </div>`}se();function Ds(e){let t=new Map(e.map(o=>[o.id,o])),n=new Map,a=[],s=0;return e.forEach(o=>{let i=o.parent_comment_id||"";i&&t.has(i)?(n.has(i)||n.set(i,[]),n.get(i).push(o),s+=1):i||(a.push(o),s+=1)}),{roots:a,repliesByParent:n,count:s}}async function Ls({apiClient:e=x,shareId:t,body:n,parentCommentId:a,onReload:s=()=>{},onError:o=g}){let i=n.trim();if(!i)return!1;try{return await e(`/api/v1/public/clips/${encodeURIComponent(t)}/comments`,{method:"POST",body:a?{body:i,parent_comment_id:a}:{body:i}}),s(),!0}catch(u){return o(u.message),!1}}function As(e){return(e||"?").trim().slice(0,1).toUpperCase()||"?"}function Is(e){let t=Dt(e.author_avatar_url);return t?r`<img class="comment-avatar" src=${t} alt="" />`:r`<div class="comment-avatar">${As(e.author_name)}</div>`}function pa({shareId:e}){let{user:t}=K(A),[n,a]=b(0),[s,o]=b(""),[i,u]=b(null),[d,l]=b(""),[p,h]=b(null),c=`/api/v1/public/clips/${encodeURIComponent(e)}/comments`,{data:m,error:_}=ee(c,n),w=_?[]:m?.comments??null;function P(){a(E=>E+1)}async function R(E,J){return Ls({shareId:e,body:E,parentCommentId:J,onReload:P,onError:g})}async function T(E){E.preventDefault(),await R(s)&&o("")}async function D(E,J){E.preventDefault(),await R(d,J)&&(l(""),u(null))}async function V(){let E=p;h(null);try{await x(`/api/v1/public/clips/${encodeURIComponent(e)}/comments/${encodeURIComponent(E)}`,{method:"DELETE"}),P()}catch(J){g(J.message)}}let B=Ds(w||[]);return r`<section class="comments">
    <div class="comments-header"><h2>Comments</h2><span class="muted">${B.count}</span></div>
    ${t?r`<form class="comment-form" onSubmit=${T}>
          <textarea rows="3" maxlength="2000" placeholder="Add a comment" value=${s}
            onInput=${E=>o(E.target.value)}></textarea>
          <div class="comment-form-actions">
            <button type="submit" class="btn btn-primary">${S("message",{size:14})} Post comment</button>
          </div>
        </form>`:r`<p class="comment-signin"><a href="/login">Sign in</a> to comment.</p>`}
    ${w==null?"":B.count===0?r`<p class="comment-signin">No comments yet.</p>`:r`<div class="comment-list">
          ${B.roots.map(E=>ma(E,{depth:0,repliesByParent:B.repliesByParent,user:t,replyOpenId:i,setReplyOpenId:u,replyDraft:d,setReplyDraft:l,submitReply:D,onDelete:h}))}
        </div>`}
    <${de} open=${p!=null} title="Delete this comment?"
      body="This removes the comment from the public clip page." confirmLabel="Delete" danger
      onConfirm=${V} onCancel=${()=>h(null)} />
  </section>`}function ma(e,t){let{depth:n,repliesByParent:a,user:s,replyOpenId:o,setReplyOpenId:i,replyDraft:u,setReplyDraft:d,submitReply:l,onDelete:p}=t,h=a.get(e.id)||[];return r`<article class="comment" key=${e.id}>
    ${Is(e)}
    <div class="comment-body">
      <div class="comment-head">
        ${e.author_username?r`<a href=${`/u/${encodeURIComponent(e.author_username)}`}>${e.author_name}</a>`:r`<strong>${e.author_name}</strong>`}
        ${e.is_uploader&&r`<span class="comment-badge">Uploader</span>`}
        <span>${nt(e.created_at)}</span>
        <div class="comment-actions">
          ${s&&n===0&&r`<button type="button" class="comment-action"
            onClick=${()=>i(o===e.id?null:e.id)}>
            ${S("message",{size:12})} Reply</button>`}
          ${e.viewer_can_delete&&r`<button type="button" class="comment-delete" aria-label="Delete comment"
            title="Delete comment" onClick=${()=>p(e.id)}>${S("trash",{size:12})}</button>`}
        </div>
      </div>
      <p class="comment-text">${e.body}</p>
      ${s&&n===0&&o===e.id&&r`<form class="comment-reply-form"
        onSubmit=${c=>l(c,e.id)}>
        <textarea rows="2" maxlength="2000" placeholder="Write a reply" value=${u}
          onInput=${c=>d(c.target.value)}></textarea>
        <div class="comment-form-actions">
          <button type="submit" class="btn btn-primary">${S("message",{size:14})} Post reply</button>
        </div>
      </form>`}
      ${h.length>0&&r`<div class="comment-replies">
        ${h.map(c=>ma(c,{...t,depth:n+1}))}
      </div>`}
    </div>
  </article>`}var Ns=["private","public","unlisted"];function Bs(e,t){return e==="clip"?!0:!!t?.viewer_can_edit}function Fs(e,t,n){return e==="public"?t.shareId:n?.public_share_id||null}function zs(e,t,n){return e==="clip"?t.clipId:n?.viewer_clip_id||null}function Os(e){let t=e?.height!=null?e.height:"",n=Math.round(e?.fps||0)||"";return`${t}p${n}`}function Vs(e,t=8){let n=new URLSearchParams;return e&&n.set("share_id",e),n.set("limit",String(t)),`/api/v1/public/recommendations?${n}`}function Hs(e,t,n=8){return(e||[]).filter(a=>a.share_id!==t).slice(0,n)}function Bt({route:e}){let{user:t}=K(A),[n,a]=b(null),[s,o]=b(null),[i,u]=b([]),[d,l]=b(!1),[p,h]=b(""),[c,m]=b(!1),[_,w]=b(""),[P,R]=b(!1),[T,D]=b(!1),[V,B]=b(!1),E=e.name==="clip"?`clip:${e.clipId}`:`public:${e.shareId}`,J=Fs(e.name,e,n),H=e.name==="public"||!!n;if(M(()=>{let v=new AbortController;a(null),o(null),l(!1),m(!1),B(!1),R(!1);let q=e.name==="clip"?`/api/v1/clips/${encodeURIComponent(e.clipId)}`:`/api/v1/public/clips/${encodeURIComponent(e.shareId)}`;return x(q,{signal:v.signal}).then($=>{a($),e.name==="public"&&x(`/api/v1/public/clips/${encodeURIComponent(e.shareId)}/view`,{method:"POST",body:{},signal:v.signal}).then(y=>a(U=>U&&{...U,view_count:y.view_count})).catch(()=>{})}).catch($=>{$?.name!=="AbortError"&&o($)}),()=>v.abort()},[E]),M(()=>{if(!H){u([]);return}let v=new AbortController;return u([]),x(Vs(J,8),{signal:v.signal}).then(q=>u(q.clips||[])).catch(()=>{}),()=>v.abort()},[E,J,H]),s)return r`<main class="page"><${Z} name="alert" title="Couldn't load this clip" body=${s.message} /></main>`;if(!n)return r`<main class="page watch"><div><div class="skeleton-thumb"></div></div><aside class="upnext"></aside></main>`;let ne=Bs(e.name,n),L=J,Y=zs(e.name,e,n),xe=e.name==="clip"?at({id:n.id}):Me({share_id:e.shareId}),ie=e.name==="clip"?Vn({id:n.id}):st({share_id:e.shareId}),re=e.name==="clip"?t?.display_name||t?.username||"You":n.author_name||"Unknown creator",Se=n.public_url??n.share_url??null,pe=Ne(Se,window.location.origin,L),le=e.name==="clip";function $e(){h(n.title),l(!0)}async function me(v){v?.preventDefault?.();let q=p.trim();if(!q||q===n.title){l(!1);return}try{await x(`/api/v1/clips/${encodeURIComponent(Y)}`,{method:"PATCH",body:{title:q}}),a($=>({...$,title:q})),l(!1),g("Title saved.")}catch($){g($.message)}}function te(){w(n.description||""),m(!0)}async function oe(){let v=_.trim();try{await x(`/api/v1/clips/${encodeURIComponent(Y)}`,{method:"PATCH",body:{description:v||null}}),a(q=>({...q,description:v||null})),m(!1),g("Description saved.")}catch(q){g(q.message)}}async function Ce(v,{force:q=!1}={}){let $=n.visibility;if(!($===v&&!q)){a(y=>({...y,visibility:v}));try{let y=await x(`/api/v1/clips/${encodeURIComponent(Y)}/visibility`,{method:"POST",body:{visibility:v}});a(U=>({...U,visibility:y.visibility,public_url:y.public_url,public_share_id:y.public_share_id})),g(`Visibility set to ${v}.`,{actionLabel:"Undo",onAction:()=>Ce($,{force:!0})})}catch(y){a(U=>({...U,visibility:$})),g(y.message)}}}async function ve(){if(pe)try{await navigator.clipboard.writeText(pe),g("Link copied.")}catch{g("Couldn't copy the link.")}}async function ye(){D(!1);try{await x(`/api/v1/clips/${encodeURIComponent(Y)}`,{method:"DELETE"}),g("Clip deleted."),W("/library")}catch(v){g(v.message)}}let Ee=[n.game_name&&r`<a class="chip chip-on" href=${`/game/${encodeURIComponent(n.game_name)}`}>${n.game_name}</a>`,ke(n.view_count),`Recorded ${j(n.recorded_at)}`,`by ${re}`].filter(Boolean),ce=Hs(i,L,8);return r`<main class="page watch">
    <div>
      <${da} src=${xe} poster=${ie} durationMs=${n.duration_ms} markers=${n.markers} />
      <div class="watch-titlerow">
        ${d?r`<input class="input watch-title-input" value=${p} autofocus
              onInput=${v=>h(v.target.value)} onBlur=${me}
              onKeyDown=${v=>{v.key==="Enter"&&me(v),v.key==="Escape"&&l(!1)}} />`:r`<h1>${n.title}
              ${ne&&r`<button type="button" class="edit-pencil" aria-label="Edit title" onClick=${$e}
                >${S("edit",{size:14})}</button>`}</h1>`}
      </div>
      <p class="watch-meta">${Ee.map((v,q)=>r`${q>0?" \xB7 ":""}${v}`)}</p>

      ${ne&&r`<div class="watch-actions">
        <div class="seg" role="radiogroup" aria-label="Visibility">
          ${Ns.map(v=>r`<button type="button" role="radio" key=${v} aria-checked=${n.visibility===v}
              class=${`seg-item ${n.visibility===v?"seg-on":""}`} onClick=${()=>Ce(v)}
              >${v[0].toUpperCase()+v.slice(1)}</button>`)}
        </div>
        <button type="button" class="btn btn-primary" disabled=${!pe} onClick=${ve}>
          ${S("copy",{size:14})} Copy share link</button>
        <div class="watch-more">
          <button type="button" class="btn" aria-haspopup="menu" aria-expanded=${P}
            onClick=${()=>R(v=>!v)}>⋯</button>
          ${P&&r`<div class="menu" role="menu">
            <button type="button" class="menu-danger" role="menuitem"
              onClick=${()=>{R(!1),D(!0)}}>${S("trash",{size:14})} Delete clip</button>
          </div>`}
        </div>
      </div>`}

      <div class="watch-desc">
        ${c?r`<textarea class="input" rows="5" value=${_} autofocus
              onInput=${v=>w(v.target.value)} onBlur=${oe}
              onKeyDown=${v=>{v.key==="Enter"&&(v.ctrlKey||v.metaKey)&&oe(),v.key==="Escape"&&m(!1)}}></textarea>`:n.description?r`<p>${n.description}
              ${ne&&r`<button type="button" class="edit-pencil" aria-label="Edit description" onClick=${te}
                >${S("edit",{size:12})}</button>`}</p>`:ne?r`<button type="button" class="watch-desc-add" onClick=${te}>+ Add a description</button>`:""}
      </div>

      ${le&&r`<button type="button" class="details-strip" aria-expanded=${V}
        onClick=${()=>B(v=>!v)}>
        <span><b>${he(n.duration_ms)}</b> length</span>
        <span><b>${z(n.file_size_bytes)}</b></span>
        <span><b>${Os(n)}</b></span>
        <span><b>${n.video_codec}/${n.audio_codec}</b> ${n.container}</span>
        <span class="details-chev">${V?"\u25B4 less":"\u25BE more"}</span>
      </button>`}
      ${le&&V&&r`<dl class="details-full">
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

      ${L&&r`<${pa} shareId=${L} />`}
    </div>
    <aside class="upnext">
      <h4 class="kicker">Up next</h4>
      ${ce.map(v=>r`<a class="upnext-row" key=${v.share_id} href=${`/c/${encodeURIComponent(v.share_id)}`}>
          <img src=${be(v)} alt="" loading="lazy" />
          <span><b>${v.title}</b><small>${v.author_name} · ${v.game_name||"No game"} · ${ke(v.view_count)}</small></span>
        </a>`)}
    </aside>

    <${de} open=${T} title="Delete this clip?" body="Public links stop working immediately."
      confirmLabel="Delete" danger onConfirm=${ye} onCancel=${()=>D(!1)} />
  </main>`}se();var Ft=[{top:"4%",left:"4%",width:"34%",rotate:-7},{top:"0%",left:"44%",width:"30%",rotate:5},{top:"34%",left:"68%",width:"28%",rotate:-4},{top:"50%",left:"8%",width:"30%",rotate:6},{top:"62%",left:"42%",width:"26%",rotate:-5},{top:"26%",left:"-4%",width:"22%",rotate:9}];function qs(e){return Array.isArray(e)?e.slice(0,Ft.length).map((t,n)=>({clip:t,...Ft[n]})):[]}function Gs(e){let t=e?.clips;if(!Array.isArray(t)||t.length===0)return null;let n=t.length,a=e.has_more?"+":"";return`${n}${a} clip${n===1?"":"s"} on this instance`}function Ks({top:e,left:t,width:n,rotate:a}){return`top:${e};left:${t};width:${n};transform:rotate(${a}deg);`}function fa(e){let t=String(e||"").trim();return t||null}function Ws(){let{data:e}=ee(`/api/v1/public/clips?page_size=${Ft.length}`),t=qs(e?.clips),n=Gs(e);return r`<aside class="login-montage" aria-hidden="true">
    ${t.length>0&&r`<div class="login-montage-tiles">
      ${t.map((a,s)=>r`<img key=${s} class="login-montage-tile" style=${Ks(a)}
        src=${be(a.clip)} alt="" loading="lazy" />`)}
    </div>`}
    <div class="login-montage-copy">
      <h2>Your clips. Your server.</h2>
      ${n&&r`<p>${n}</p>`}
    </div>
  </aside>`}function pt({titleId:e,children:t}){return r`<div class="login-page">
    <${Ws} />
    <section class="login-panel" aria-labelledby=${e}>
      <div class="login-brand" aria-hidden="true">
        <img src="/clipline-icon.svg" alt="" width="32" height="32" />
        <span class="login-brand-word">CLIP<span class="wordmark-accent">LINE</span></span>
        <span class="login-brand-descriptor">CLOUD</span>
      </div>
      ${t}
    </section>
  </div>`}function _a(){let{user:e}=K(A),[t,n]=b(""),[a,s]=b(""),[o,i]=b(""),[u,d]=b(!1);if(M(()=>{e&&W("/library")},[e]),e)return null;async function l(p){if(p.preventDefault(),!u){d(!0),i("");try{let h=await x("/api/v1/auth/login",{method:"POST",body:{username:t,password:a}});_e(h.csrf_token),A.set({user:h.user,csrfToken:h.csrf_token,ready:!0}),W("/library")}catch(h){i(h instanceof we?h.message:"Sign in failed"),d(!1)}}}return r`<${pt} titleId="login-title">
    <h1 id="login-title">Sign in</h1>
    ${o&&r`<p class="form-error" role="alert">${o}</p>`}
    <form class="login-form" onSubmit=${l}>
      <label class="login-field">
        <span>Username</span>
        <input class="input" name="username" autocomplete="username" required
          value=${t} onInput=${p=>n(p.target.value)} />
      </label>
      <label class="login-field">
        <span>Password</span>
        <input class="input" name="password" type="password" autocomplete="current-password" required
          value=${a} onInput=${p=>s(p.target.value)} />
      </label>
      <button class="btn btn-primary" type="submit" disabled=${u}>${u?"Signing in\u2026":"Sign in"}</button>
    </form>
    <p class="login-hint">Accounts are created by this server's admin.</p>
  </${pt}>`}function ha({route:e}){let t=!!e.invite,n=e.token?"form":"missing-token",[a,s]=b(""),[o,i]=b(!1),u=t;async function d(h){if(h.preventDefault(),o)return;i(!0),s("");let c=new FormData(h.currentTarget),m={reset_token:e.token,new_password:String(c.get("new_password")||"")};u&&(m.username=String(c.get("username")||""),m.display_name=fa(c.get("display_name")),m.email=fa(c.get("email")));try{await x("/api/v1/auth/reset-password",{method:"POST",body:m}),g(u?"Account created. Sign in with your new password.":"Password set. Sign in with your new password."),W("/login")}catch(_){s(_ instanceof we?_.message:"Request failed"),i(!1)}}return r`<${pt} titleId="reset-title">
    <h1 id="reset-title">${u?"Create account":"Set password"}</h1>
    <p class="login-copy">${u?"Choose your Clipline Cloud account details.":"Choose a new password for your Clipline Cloud account."}</p>
    ${n==="missing-token"?r`<p class="form-error" role="alert">This reset link is missing a token.</p>`:r`
        ${a&&r`<p class="form-error" role="alert">${a}</p>`}
        <form class="login-form" onSubmit=${d}>
          ${u&&r`
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
          <button class="btn btn-primary" type="submit" disabled=${o}>
            ${o?u?"Creating account\u2026":"Setting password\u2026":u?"Create account":"Set password"}
          </button>
        </form>
      `}
    ${!u&&r`<a class="btn" href="/login">Sign in</a>`}
  </${pt}>`}se();function Be({label:e,value:t,sub:n,meter:a,tone:s}){let o=s?` stat-${s}`:"";return r`<div class="stat-card">
    <p class="stat-label">${e}</p>
    <p class=${`stat-value${o}`}>${t}</p>
    ${n!=null&&r`<p class="stat-sub">${n}</p>`}
    ${a!=null&&r`<div class="stat-meter${o}">
      <span style=${`width:${Math.max(0,Math.min(1,a))*100}%`}></span>
    </div>`}
  </div>`}function js(e){let t=Number(e?.global_storage_warning_threshold_bytes||0);if(!t)return null;let n=Number(e?.total_storage_bytes||0);return Math.max(0,Math.min(1,n/t))}function Zs(e){if(!e?.global_storage_warning_threshold_bytes)return"Disabled";let t=z(e.global_storage_warning_threshold_bytes);return e.global_storage_warning?`At or above ${t}`:`Below ${t}`}function Js({deadJobs:e=[],failedUploads:t=[]}={}){let n=e.length+t.length;return{failedCount:n,healthy:n===0}}function Q(e,t){return r`<div><dt>${e}</dt><dd>${t??"Unknown"}</dd></div>`}function ba({overview:e,deadJobs:t,failedUploads:n}){let a=js(e),{failedCount:s,healthy:o}=Js({deadJobs:t,failedUploads:n}),i=e.global_storage_warning_threshold_bytes;return r`<div>
    <div class="stat-grid">
      <${Be} label="Clips" value=${String(e.total_clips)} />
      <${Be} label="Storage" value=${z(e.total_storage_bytes)}
        sub=${i?`${z(i)} warning threshold`:null}
        meter=${a} tone=${e.global_storage_warning?"danger":void 0} />
      <${Be} label="Users" value=${String(e.total_users)} />
      <${Be} label="Jobs" value=${o?"All healthy":String(s)}
        tone=${o?"success":"danger"} />
    </div>
    <div class="panel">
      <h2>Server summary</h2>
      <dl class="ad-kv">
        ${Q("Server version",e.server_version)}
        ${Q("API version",e.api_version)}
        ${Q("Public URL",e.public_url)}
        ${Q("Database",e.database_backend)}
        ${Q("Storage",`${e.storage_backend} \u2014 ${e.storage_summary}`)}
        ${Q("Stored clips",`${e.total_clips} clips \u2014 ${z(e.total_storage_bytes)}`)}
        ${Q("Users",`${e.total_users} total`)}
        ${Q("Max upload",z(e.max_upload_size_bytes))}
        ${Q("Part size",z(e.upload_part_size_bytes))}
        ${Q("Single PUT max",z(e.single_put_max_bytes))}
        ${Q("Active uploads/user",e.max_active_upload_sessions_per_user)}
        ${Q("User quota",e.user_storage_quota_bytes?z(e.user_storage_quota_bytes):"Disabled")}
        ${Q("Storage warning",Zs(e))}
        ${Q("Upload TTL",`${e.upload_session_ttl_seconds}s`)}
        ${Q("Direct S3 uploads",e.direct_s3_uploads?"Enabled":"Disabled")}
        ${Q("Public media",`${e.public_media_mode}, ${e.public_read_url_ttl_seconds}s TTL`)}
      </dl>
    </div>
  </div>`}se();function mt(e){let t=String(e||"").trim();return t||null}function Ys(e,t){return!(e.is_disabled||t?.id===e.id||e.role==="owner"||e.role==="admin"&&t?.role!=="owner")}function Qs(e,t){return!(!e.is_disabled||t?.id===e.id||e.role==="owner"||e.role==="admin"&&t?.role!=="owner")}function Xs(e,t){return t?.role==="owner"&&e.role!=="owner"&&t?.id!==e.id}function eo(e,t){return!(t?.id===e.id||e.role==="owner"||e.role==="admin"&&t?.role!=="owner")}function zt(e){return e?[["user","User"],["admin","Admin"]]:[["user","User"]]}function to({isOwner:e,onCreated:t}){let[n,a]=b(!1);async function s(o){if(o.preventDefault(),n)return;a(!0);let i=o.currentTarget,u=new FormData(i);try{await x("/api/v1/users",{method:"POST",body:{username:String(u.get("username")||""),display_name:mt(u.get("display_name")),email:mt(u.get("email")),password:mt(u.get("password")),role:String(u.get("role")||"user")}}),g("User created."),i.reset(),t()}catch(d){g(d.message)}finally{a(!1)}}return r`<form class="panel section" onSubmit=${s}>
    <h2>Create user</h2>
    <label class="field"><span>Username</span><input class="input" name="username" required /></label>
    <label class="field"><span>Display name</span><input class="input" name="display_name" placeholder="Optional" /></label>
    <label class="field"><span>Email</span><input class="input" name="email" type="email" placeholder="Optional" /></label>
    <label class="field"><span>Password</span><input class="input" name="password" type="password" required /></label>
    <label class="field"><span>Role</span>
      <select class="input" name="role">
        ${zt(e).map(([o,i])=>r`<option value=${o}>${i}</option>`)}
      </select>
    </label>
    <button class="btn btn-primary" type="submit" disabled=${n}>${S("plus",{size:14})} Create user</button>
  </form>`}function no({isOwner:e,smtpEnabled:t,onCreated:n}){let[a,s]=b(!1);async function o(i){if(i.preventDefault(),a)return;s(!0);let u=new FormData(i.currentTarget),d=i.submitter?.value==="email"?"email":"link";try{let l=await x("/api/v1/invites",{method:"POST",body:{role:String(u.get("role")||"user"),email:mt(u.get("email")),send_email:d==="email"}});g(d==="email"?"Invite sent.":"Invite link created."),n({...l,kind:"invite"})}catch(l){g(l.message)}finally{s(!1)}}return r`<form class="panel section" onSubmit=${o}>
    <h2>Invite link</h2>
    <label class="field"><span>Role</span>
      <select class="input" name="role">
        ${zt(e).map(([i,u])=>r`<option value=${i}>${u}</option>`)}
      </select>
    </label>
    <label class="field"><span>Email</span>
      <input class="input" name="email" type="email" placeholder=${t?"Optional":"SMTP disabled"} disabled=${!t} />
    </label>
    <div class="actions">
      <button class="btn" type="submit" name="intent" value="link" disabled=${a}>${S("copy",{size:14})} Generate link</button>
      ${t&&r`<button class="btn btn-primary" type="submit" name="intent" value="email" disabled=${a}>${S("message",{size:14})} Send email</button>`}
    </div>
  </form>`}function ao({resetLink:e}){if(!e)return null;let t=e.kind==="invite"?"Invite":"Reset",n=e.username?` for ${e.username}`:"",a=async()=>{try{await navigator.clipboard.writeText(e.reset_url),g("Copied to clipboard.")}catch{g("Copy failed. Select and copy the URL manually.")}};return r`<div class="notice admin-reset-link">
    <div>
      <strong>${t} link created${n}</strong>
      <span>Expires ${j(e.expires_at)}</span>
      <code>${e.reset_url}</code>
    </div>
    <button class="btn" type="button" onClick=${a}>${S("copy",{size:14})} Copy</button>
  </div>`}function so(e){return e.is_disabled?r`<span class="badge badge-warn">Disabled</span>`:r`<span class="badge badge-public">Active</span>`}function oo(e){return e?e.user_storage_quota_bytes!=null&&e.user_storage_quota_bytes>0?e.user_storage_quota_bytes:e.user_storage_quota_env_fallback_bytes??null:null}function ro(e,t){if(e.storage_quota_bytes!=null&&e.storage_quota_bytes>0)return z(e.storage_quota_bytes);let n=oo(t);return n!=null&&n>0?`Default (${z(n)})`:"No limit"}function io({user:e,currentUser:t,settings:n,onQuota:a,onReset:s,onDisable:o,onEnable:i,onRole:u,onPurge:d}){let l=ro(e,n),p=!Ys(e,t),h=!Qs(e,t),c=!eo(e,t),m=Xs(e,t),[_,w]=b(e.role);return M(()=>{w(e.role)},[e.role]),r`<tr>
    <td>
      <strong>${e.username}</strong>
      <div class="muted">${e.display_name||e.id}</div>
      ${e.email&&r`<div class="muted">${e.email}</div>`}
    </td>
    <td>
      ${m?r`<select class="input input-compact" value=${_}
            onChange=${P=>{let R=P.target.value;R!==e.role&&(w(e.role),u(e,R))}}>
            ${zt(!0).map(([P,R])=>r`<option value=${P} selected=${_===P}>${R}</option>`)}
          </select>`:e.role}
    </td>
    <td>${so(e)}</td>
    <td>
      <strong>${z(e.storage_bytes||0)}</strong>
      <div class="muted">quota ${l}</div>
    </td>
    <td>${j(e.last_login_at)}</td>
    <td>
      <div class="actions">
        <button class="btn" type="button" onClick=${()=>a(e)}>${S("sliders",{size:14})} Quota</button>
        <button class="btn" type="button" onClick=${()=>s(e)}>${S("clipboard",{size:14})} Reset link</button>
        ${e.is_disabled?r`<button class="btn" type="button" disabled=${h} onClick=${()=>i(e)}>${S("check",{size:14})} Enable</button>`:r`<button class="btn btn-danger" type="button" disabled=${p} onClick=${()=>o(e)}>${S("x",{size:14})} Disable</button>`}
        <button class="btn btn-danger" type="button" disabled=${c} onClick=${()=>d(e)}>${S("trash",{size:14})} Delete</button>
      </div>
    </td>
  </tr>`}function $a({users:e,settings:t,currentUser:n,resetLink:a,setResetLink:s,reload:o}){let[i,u]=b(null),d=n?.role==="owner",l=!!t?.smtp_enabled,p=()=>u(null);async function h(){let{type:m,user:_,value:w}=i;p();try{if(m==="quota"){let P=w.trim()?Ot(w):null;await x(`/api/v1/users/${encodeURIComponent(_.id)}`,{method:"PATCH",body:{storage_quota_bytes:P}}),g("Storage quota updated.")}else if(m==="disable")await x(`/api/v1/users/${encodeURIComponent(_.id)}`,{method:"DELETE",body:{reauth_password:w}}),g("User disabled.");else if(m==="enable")await x(`/api/v1/users/${encodeURIComponent(_.id)}`,{method:"PATCH",body:{is_disabled:!1,reauth_password:w}}),g("User enabled.");else if(m==="role")await x(`/api/v1/users/${encodeURIComponent(_.id)}`,{method:"PATCH",body:{role:w.role,reauth_password:w.password}}),g(`Role updated to ${w.role}.`);else if(m==="purge")await x(`/api/v1/users/${encodeURIComponent(_.id)}/purge`,{method:"POST",body:{reauth_password:w}}),g("User deleted.");else if(m==="reset"){let P=await x(`/api/v1/users/${encodeURIComponent(_.id)}/reset-password`,{method:"POST",body:{reauth_password:w}});s({...P,kind:"reset"}),g("Reset link created.")}o()}catch(P){g(P.message),o()}}let c={quota:{title:"Set storage quota",description:"Enter a per-user storage limit in GiB. Leave it blank to remove the per-user limit.",confirmLabel:"Save quota",danger:!1,field:r`<label class="field"><span>Quota GiB</span>
        <input class="input" type="number" min="0" step="0.1" placeholder="No per-user limit"
          value=${i?.value||""} onInput=${m=>u(_=>({..._,value:m.target.value}))} /></label>`},disable:{title:"Disable user?",description:"This immediately revokes the user's sessions and device tokens.",confirmLabel:"Disable",danger:!0,field:r`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value||""}
          onInput=${m=>u(_=>({..._,value:m.target.value}))} /></label>`},enable:{title:"Enable user?",description:"This restores sign-in access for the selected account.",confirmLabel:"Enable",danger:!1,field:r`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value||""}
          onInput=${m=>u(_=>({..._,value:m.target.value}))} /></label>`},role:{title:"Change user role?",description:`Set ${i?.user?.username||"this user"} to ${i?.value?.role||"the selected role"}.`,confirmLabel:"Save role",danger:!1,field:r`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value?.password||""}
          onInput=${m=>u(_=>({..._,value:{..._.value,password:m.target.value}}))} /></label>`},purge:{title:"Delete user permanently?",description:"This removes the account, clips, comments, and auth records. This cannot be undone.",confirmLabel:"Delete user",danger:!0,field:r`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value||""}
          onInput=${m=>u(_=>({..._,value:m.target.value}))} /></label>`},reset:{title:"Create reset link?",description:"This creates a temporary password reset link for the selected user.",confirmLabel:"Create link",danger:!1,field:r`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value||""}
          onInput=${m=>u(_=>({..._,value:m.target.value}))} /></label>`}}[i?.type];return r`<div class="admin-users-layout">
    <div class="admin-users-forms">
      <${to} isOwner=${d} onCreated=${()=>{s(null),o()}} />
      <${no} isOwner=${d} smtpEnabled=${l}
        onCreated=${m=>{s(m),o()}} />
    </div>
    <div class="panel admin-users-table">
      <div class="section-header">
        <h2>Users</h2>
        <span class="muted">${e.length} total</span>
      </div>
      <${ao} resetLink=${a} />
      <div class="table-wrap">
        <table class="lib-table">
          <thead><tr><th>Username</th><th>Role</th><th>Status</th><th>Storage</th><th>Last login</th><th></th></tr></thead>
          <tbody>
            ${e.map(m=>r`<${io} key=${m.id} user=${m} currentUser=${n} settings=${t}
              onQuota=${_=>u({type:"quota",user:_,value:""})}
              onReset=${_=>u({type:"reset",user:_,value:""})}
              onDisable=${_=>u({type:"disable",user:_,value:""})}
              onEnable=${_=>u({type:"enable",user:_,value:""})}
              onRole=${(_,w)=>u({type:"role",user:_,value:{role:w,password:""}})}
              onPurge=${_=>u({type:"purge",user:_,value:""})} />`)}
          </tbody>
        </table>
      </div>
    </div>
    <${de} open=${!!i}
      title=${c?.title}
      body=${c&&r`${c.description} ${c.field}`}
      confirmLabel=${c?.confirmLabel} danger=${c?.danger}
      confirmDisabled=${i?.type==="quota"?!1:i?.type==="role"?!i?.value?.password?.trim():!i?.value?.trim()}
      onConfirm=${h} onCancel=${p} />
  </div>`}function Ot(e){let t=Number(String(e||"").trim());if(!Number.isFinite(t)||t<0)throw new Error("Storage quota must be a non-negative number");return Math.round(t*1024*1024*1024)}se();function ft(e){let t=String(e||"").trim();return t||null}function va(e){return e==null||e<=0?"":String(Math.round(e/1024**3*100)/100)}function ga({settings:e,isOwner:t,reload:n}){let[a,s]=b(!1),[o,i]=b(!1);async function u(d){if(d.preventDefault(),!a){s(!0);try{let l=new FormData(d.currentTarget),p={allow_vod_uploads:l.get("allow_vod_uploads")==="on",vod_threshold_minutes:Number(l.get("vod_threshold_minutes")||30)};if(o){let h=String(l.get("user_storage_quota_gib")||"").trim();p.user_storage_quota_bytes=h?Ot(h):null}if(t){p.about_text=String(l.get("about_text")||""),p.smtp_enabled=l.get("smtp_enabled")==="on",p.smtp_host=ft(l.get("smtp_host")),p.smtp_port=Number(l.get("smtp_port")||587),p.smtp_tls_mode=String(l.get("smtp_tls_mode")||"starttls"),p.smtp_username=ft(l.get("smtp_username")),p.smtp_from_email=ft(l.get("smtp_from_email")),p.smtp_from_name=ft(l.get("smtp_from_name"));let h=String(l.get("smtp_password")||"").trim();h&&(p.smtp_password=h),l.get("smtp_password_clear")==="on"&&(p.smtp_password_clear=!0)}await x("/api/v1/admin/settings",{method:"PATCH",body:p}),g("Settings saved."),i(!1),n()}catch(l){g(l.message)}finally{s(!1)}}}return r`<form class="admin-settings-page" onSubmit=${u}>
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
        <h2>Default storage quota</h2>
        <p>Per-user storage limit for accounts without an individual quota. Leave blank and save to use the environment default when set. Enter 0 to disable quotas. Leave unchanged to keep the current stored value.</p>
      </div>
      <div class="settings-controls">
        <label class="field"><span>Default quota GiB</span>
          <input class="input" name="user_storage_quota_gib" type="number" min="0" step="0.1"
            placeholder=${e.user_storage_quota_env_fallback_bytes?`Env default: ${va(e.user_storage_quota_env_fallback_bytes)} GiB`:"No default quota"}
            value=${va(e.user_storage_quota_bytes)}
            onInput=${()=>i(!0)} /></label>
        ${e.user_storage_quota_bytes==null&&e.user_storage_quota_env_fallback_bytes?r`<p class="muted">Effective default: ${z(e.user_storage_quota_env_fallback_bytes)} from CLIPLINE_USER_STORAGE_QUOTA_BYTES.</p>`:null}
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
            ${[["starttls","STARTTLS"],["tls","TLS"],["none","None"]].map(([d,l])=>r`<option value=${d} selected=${(e.smtp_tls_mode||"starttls")===d}>${l}</option>`)}
          </select></label>
        <label class="field"><span>SMTP username</span>
          <input class="input" name="smtp_username" value=${e.smtp_username||""} placeholder="Optional" disabled=${!t} /></label>
        <label class="field"><span>SMTP password</span>
          <input class="input" name="smtp_password" type="password"
            placeholder=${e.smtp_password_configured?"Configured; leave blank to keep":"Optional"} disabled=${!t} /></label>
        ${e.smtp_password_configured&&r`<label class="check-field">
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
      <button class="btn btn-primary" type="submit" disabled=${a}>${S("save",{size:14})} Save settings</button>
    </div>
  </form>`}function lo(e){return`${(e/100).toFixed(e%100===0?0:1)}%`}function co(e){switch(e){case"delete_and_retry":return"delete the failed upload and retry from a new session";case"retry":return"retry the current upload request";default:return""}}function uo({upload:e}){let t=Math.max(0,Math.min(1e4,Number(e.progress_basis_points||0))),n=co(e.recovery_action);return r`<div class="job-item">
    <div class="job-title-line">
      <strong class="mono">${e.id}</strong>
      <span class="badge badge-warn">${lo(t)}</span>
    </div>
    <div class="progress-meter" aria-label="Upload progress"><span style=${`width:${t/100}%`}></span></div>
    <span class="muted">clip ${e.clip_id} — ${z(e.received_size_bytes)} of ${z(e.expected_size_bytes)} — updated ${j(e.updated_at)}</span>
    ${e.failure_reason&&r`<span class="form-error">${e.failure_reason}</span>`}
    ${n&&r`<span class="muted">Recovery: ${n}</span>`}
  </div>`}function ya({job:e}){return r`<div class="job-item">
    <strong>${e.kind} <span class="mono">${e.id}</span></strong>
    <span class="muted">${e.status} — attempts ${e.attempts}/${e.max_attempts} — updated ${j(e.updated_at)} — target ${e.target_type||""}:${e.target_id||""}</span>
    ${e.last_error&&r`<span class="form-error">${e.last_error}</span>`}
  </div>`}function Vt({title:e,items:t,renderItem:n,emptyLabel:a}){return r`<div class="panel">
    <div class="section-header">
      <h2>${e}</h2>
      <span class="muted">${t.length}</span>
    </div>
    ${t.length?r`<div class="job-list">${t.map(n)}</div>`:r`<p class="muted">${a}</p>`}
  </div>`}function wa({failedUploads:e,deadJobs:t,recentErrors:n}){return r`<div class="section">
    <${Vt} title="Failed uploads" items=${e} emptyLabel="No failed uploads."
      renderItem=${a=>r`<${uo} key=${a.id} upload=${a} />`} />
    <${Vt} title="Dead jobs" items=${t} emptyLabel="No dead jobs."
      renderItem=${a=>r`<${ya} key=${a.id} job=${a} />`} />
    <${Vt} title="Recent job errors" items=${n} emptyLabel="No recent job errors."
      renderItem=${a=>r`<${ya} key=${a.id} job=${a} />`} />
  </div>`}var ka=[["overview","server","Overview"],["users","users","Users"],["settings","sliders","Settings"],["jobs","alert","Jobs"]];function po(e){return e?.role==="admin"||e?.role==="owner"}async function mo(e){let t={signal:e},[n,a,s,o,i,u]=await Promise.all([x("/api/v1/admin/overview",t),x("/api/v1/admin/settings",t),x("/api/v1/users",t),x("/api/v1/admin/uploads/failed?limit=50",t),x("/api/v1/admin/jobs/dead?limit=50",t),x("/api/v1/admin/jobs/recent-errors?limit=50",t)]);return{overview:n,settings:a,users:s,failedUploads:o,deadJobs:i,recentErrors:u}}function xa({route:e}){let{user:t}=K(A),n=po(t),a=!!(t&&!n),s=ka.some(([c])=>c===e.tab)?e.tab:"overview",[o,i]=b(null),[u,d]=b(0),{data:l,error:p}=Ie(n?`admin:${u}`:null,mo),h=()=>d(c=>c+1);return M(()=>{a&&(g("Admin access required."),W("/library"))},[a]),n?r`<main class="page">
    <h1>Admin</h1>
    <p class="page-subtitle">Accounts, instance summary, and processing diagnostics.</p>
    <nav class="ad-tabs" aria-label="Admin views">
      ${ka.map(([c,m,_])=>r`<a key=${c} class=${`ad-tab ${c===s?"ad-tab-on":""}`}
        href=${`/admin?tab=${c}`} aria-current=${c===s?"page":void 0}>${S(m,{size:14})} ${_}</a>`)}
    </nav>
    ${p?r`<${Z} name="alert" title="Couldn't load admin data" body=${p.message} />`:l?s==="users"?r`<${$a} users=${l.users} settings=${l.settings} currentUser=${t}
          resetLink=${o} setResetLink=${i} reload=${h} />`:s==="settings"?r`<${ga} settings=${l.settings} isOwner=${t?.role==="owner"} reload=${h} />`:s==="jobs"?r`<${wa} failedUploads=${l.failedUploads} deadJobs=${l.deadJobs} recentErrors=${l.recentErrors} />`:r`<${ba} overview=${l.overview} deadJobs=${l.deadJobs} failedUploads=${l.failedUploads} />`:r`<p class="empty-state">Loading admin data…</p>`}
  </main>`:null}se();function Sa(e){let t=String(e||"").trim();return t||null}async function fo(e){let t=new Headers;t.set("Accept","application/json"),t.set("Content-Type",e.type||"application/octet-stream");let n=Mt();n&&t.set("X-CSRF-Token",n);let a=await fetch("/api/v1/me/avatar",{method:"PUT",credentials:"same-origin",headers:t,body:e}),s=await a.json().catch(()=>({}));if(!a.ok)throw new Error(s.error||a.statusText||"Avatar upload failed");return s}function Ca(e){A.set({...A.get(),user:e})}function _o({user:e}){let[t,n]=b(!1);async function a(s){if(s.preventDefault(),t)return;n(!0);let o=new FormData(s.currentTarget);try{let i=await x("/api/v1/me/profile",{method:"PATCH",body:{display_name:Sa(o.get("display_name")),bio:Sa(o.get("bio"))}});Ca(i),g("Profile saved.")}catch(i){g(i.message)}finally{n(!1)}}return r`<form class="profile-form" onSubmit=${a}>
    <label class="field"><span>Display name</span>
      <input class="input" name="display_name" maxlength="120" value=${e.display_name||""} placeholder=${e.username} /></label>
    <label class="field"><span>Bio</span>
      <textarea class="input" name="bio" rows="5" maxlength="2000" placeholder="Tell people what you upload.">${e.bio||""}</textarea></label>
    <div class="clip-inline-actions">
      <button class="btn btn-primary" type="submit" disabled=${t}>${S("save",{size:14})} Save profile</button>
    </div>
  </form>`}function ho({user:e}){let[t,n]=b(!1);async function a(s){if(s.preventDefault(),t)return;let o=s.currentTarget.elements.avatar?.files?.[0];if(!o){g("Choose an avatar image first.");return}n(!0);try{let i=await fo(o);Ca(i),g("Avatar uploaded.")}catch(i){g(i.message)}finally{n(!1)}}return r`<form class="profile-form" onSubmit=${a}>
    <label class="field"><span>Avatar</span>
      <input name="avatar" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
      <small>PNG, JPEG, WebP, or GIF. Max 2 MiB.</small></label>
    <div class="clip-inline-actions">
      <button class="btn" type="submit" disabled=${t}>${S("upload",{size:14})} Upload avatar</button>
    </div>
  </form>`}function Ta(){let{user:e}=K(A);return e?r`<main class="page">
    <h1>Profile</h1>
    <p class="page-subtitle">Public identity and avatar.</p>
    <div class="profile-settings-header">
      <${Pe} user=${e} size=${72} />
      <div>
        <h2>${e.display_name||e.username}</h2>
        <p>@${e.username} · ${e.role}</p>
      </div>
    </div>
    <${_o} user=${e} />
    <${ho} user=${e} />
    <div class="profile-public-link">
      <a class="btn" href=${`/u/${encodeURIComponent(e.username)}`}>${S("external",{size:14})} View public profile</a>
    </div>
  </main>`:null}se();async function bo(e){let t={signal:e},[n,a]=await Promise.all([x("/api/v1/auth/sessions",t),x("/api/v1/auth/device-tokens",t)]);return{sessions:n,deviceTokens:a}}function $o({item:e,onRevoke:t}){return r`<div class="management-item">
    <div>
      <strong>${e.user_agent||"Unknown browser"}</strong>
      <div class="meta-line">
        <span>${e.ip_address||"Unknown IP"}</span>
        <span>Last used ${j(e.last_used_at||e.created_at)}</span>
        <span>Expires ${j(e.expires_at)}</span>
      </div>
    </div>
    <div class="actions">
      ${e.current&&r`<span class="badge badge-public">Current</span>`}
      <button class="btn btn-danger" type="button" onClick=${()=>t(e)}>${S("x",{size:14})} Revoke</button>
    </div>
  </div>`}function vo({item:e,onRevoke:t}){let n=!!e.revoked_at;return r`<div class="management-item">
    <div>
      <strong>${e.name}</strong>
      <div class="meta-line">
        <span>Created ${j(e.created_at)}</span>
        <span>Last used ${j(e.last_used_at)}</span>
        ${e.expires_at&&r`<span>Expires ${j(e.expires_at)}</span>`}
        ${n&&r`<span>Revoked ${j(e.revoked_at)}</span>`}
      </div>
    </div>
    <div class="actions">
      <span class=${`badge ${n?"badge-private":"badge-public"}`}>${n?"Revoked":"Active"}</span>
      <button class="btn btn-danger" type="button" disabled=${n} onClick=${()=>t(e)}>${S("x",{size:14})} Revoke</button>
    </div>
  </div>`}function Pa(){let[e,t]=b(0),{data:n,error:a}=Ie(e,bo),[s,o]=b(null),i=()=>t(d=>d+1);async function u(){let d=s;o(null);try{if(d.kind==="session"){if(await x(`/api/v1/auth/sessions/${encodeURIComponent(d.item.id)}`,{method:"DELETE",body:{}}),d.item.current){_e(null),A.set({user:null,csrfToken:null,ready:!0}),g("Current session revoked."),W("/login");return}g("Session revoked.")}else await x(`/api/v1/auth/device-tokens/${encodeURIComponent(d.item.id)}`,{method:"DELETE",body:{}}),g("Device token revoked.");i()}catch(l){g(l.message)}}return a?r`<main class="page"><${Z} name="alert" title="Couldn't load account data" body=${a.message} /></main>`:r`<main class="page">
    <h1>Account</h1>
    <p class="page-subtitle">Sessions and device tokens.</p>
    ${n?r`<div class="account-grid">
          <div class="panel">
            <div class="section-header"><h2>Browser sessions</h2><span class="muted">${n.sessions.length} active</span></div>
            ${n.sessions.length?r`<div class="management-list">${n.sessions.map(d=>r`<${$o} key=${d.id} item=${d}
                  onRevoke=${l=>o({kind:"session",item:l})} />`)}</div>`:r`<p class="muted">No active sessions.</p>`}
          </div>
          <div class="panel">
            <div class="section-header"><h2>Device tokens</h2><span class="muted">${n.deviceTokens.length} total</span></div>
            ${n.deviceTokens.length?r`<div class="management-list">${n.deviceTokens.map(d=>r`<${vo} key=${d.id} item=${d}
                  onRevoke=${l=>o({kind:"device",item:l})} />`)}</div>`:r`<p class="muted">No device tokens.</p>`}
          </div>
        </div>`:r`<p class="empty-state">Loading account data…</p>`}
    <${de} open=${!!s}
      title=${s?.kind==="session"?"Revoke browser session?":"Revoke device token?"}
      body=${s?.kind==="session"?s.item.current?"This signs you out of the current browser session.":"This signs out that browser session immediately.":"The desktop client using this token will need to reconnect."}
      confirmLabel="Revoke" danger
      onConfirm=${u} onCancel=${()=>o(null)} />
  </main>`}function Ma({route:e}){let{user:t}=K(A),n=`/api/v1/public/users/${encodeURIComponent(e.username)}`,{data:a,error:s}=ee(n);if(s)return r`<main class="page"><${Z} name="alert" title="Profile unavailable" body=${s.message} /></main>`;if(!a)return r`<main class="page"><p class="empty-state">Loading profile…</p></main>`;let o=t&&t.username.toLowerCase()===a.username.toLowerCase(),i=a.clips||[];return r`<main class="page">
    <header class="public-user-header">
      <${Pe} user=${a} size=${72} />
      <div class="public-user-header-body">
        <div class="public-user-title-row">
          <div>
            <h1>${a.display_name||a.username}</h1>
            <p>@${a.username}</p>
          </div>
          ${o&&r`<a class="btn" href="/profile">${S("edit",{size:14})} Edit profile</a>`}
        </div>
        ${a.bio&&r`<p class="public-user-bio">${a.bio}</p>`}
        <p class="meta-line">${a.clip_count} public clip${a.clip_count===1?"":"s"}</p>
      </div>
    </header>
    ${i.length===0?r`<${Z} name="film" title="No public clips yet" />`:r`<div class="card-grid">
          ${i.map(u=>r`<${Re} key=${u.share_id}
            clip=${{...u,thumbnail_url:be(u),media_url:Me(u)}}
            href=${`/c/${encodeURIComponent(u.share_id)}`} showAuthor=${!1} />`)}
        </div>`}
  </main>`}var Ra="Clipline is a self-hosted clip library for saved gameplay moments.";function _t(e,t){return r`<div><dt>${e}</dt><dd>${t}</dd></div>`}function Ea(){let{data:e}=ee("/api/v1/about",0,{about_text:Ra}),t=e?.about_text||Ra;return r`<main class="page">
    <h1>About</h1>
    <p class="page-subtitle">Clipline Cloud</p>
    <div class="panel about-panel">
      <h2>Clipline Cloud</h2>
      <p class="about-text">${t}</p>
      <dl class="ad-kv">
        ${_t("Home","Public clips that are ready for discovery.")}
        ${_t("Unlisted","Shareable by link, but not listed on Home.")}
        ${_t("Private","Visible only to the clip owner.")}
        ${_t("Media","Public and unlisted clips are not DRM-protected.")}
      </dl>
    </div>
  </main>`}var go={publicLibrary:rt,publicGame:rt,games:Wn,library:Xn,clip:Bt,public:Bt,login:_a,resetPassword:ha,admin:xa,profile:Ta,account:Pa,publicUser:Ma,about:Ea},Ua=Ln({pathname:window.location.pathname,search:window.location.search});function yo(){let e=In();Ua=e.name;let{ready:t,user:n}=K(A),a=t&&Un(e.name,n);if(M(()=>{a&&W("/login")},[a]),!t||a)return r`<div class="boot">Loading…</div>`;let s=go[e.name]||rt,o=e.name==="login"||e.name==="resetPassword";return r`<div class="ui" onClick=${Nn}>
    ${!o&&r`<${Fn} active=${Et(e)} route=${e} />`}
    <${s} route=${e} />
    ${!o&&r`<${zn} active=${Dn(e)} />`}
    <${On} />
  </div>`}window.addEventListener("clipline:unauthorized",()=>{_e(null),A.set({user:null,csrfToken:null,ready:!0}),Rt(Ua)||W("/login")});(async()=>{try{let t=await x("/api/v1/auth/me");_e(t.csrf_token),A.set({user:t.user,csrfToken:t.csrf_token,ready:!0})}catch{_e(null),A.set({user:null,csrfToken:null,ready:!0})}let e=document.querySelector("#app");e.textContent="",dn(r`<${yo} />`,e)})();
