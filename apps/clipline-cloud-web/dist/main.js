var Ea=Object.defineProperty;var Ra=(e,t)=>()=>(e&&(t=e(e=0)),t);var Da=(e,t)=>{for(var n in t)Ea(e,n,{get:t[n],enumerable:!0})};var xn={};Da(xn,{ApiError:()=>_e,api:()=>w,getCsrfToken:()=>kt,setCsrfToken:()=>ue});function ue(e){We=e}function kt(){return We}async function w(e,t={}){let n=(t.method||"GET").toUpperCase(),a=new Headers(t.headers||{});a.set("Accept","application/json");let r=t.body;r&&typeof r!="string"&&(a.set("Content-Type","application/json"),r=JSON.stringify(r)),!["GET","HEAD","OPTIONS"].includes(n)&&We&&a.set("X-CSRF-Token",We);let s=await fetch(e,{...t,body:r,credentials:"same-origin",headers:a,method:n}),u=(s.headers.get("content-type")||"").includes("application/json")?await s.json():await s.text();if(!s.ok){s.status===401&&window.dispatchEvent(new CustomEvent("clipline:unauthorized"));let p=typeof u=="object"&&u?.error?u.error:s.statusText;throw new _e(p||"Request failed",s.status)}return u}var We,_e,X=Ra(()=>{We=null;_e=class extends Error{constructor(t,n){super(t),this.status=n}}});var He,B,Jt,Ua,fe,Kt,Yt,Qt,pt,Ne,Me,Xt,_t,mt,ft,La,ze={},Ve=[],Ia=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,qe=Array.isArray;function ce(e,t){for(var n in t)e[n]=t[n];return e}function ht(e){e&&e.parentNode&&e.parentNode.removeChild(e)}function bt(e,t,n){var a,r,s,i={};for(s in t)s=="key"?a=t[s]:s=="ref"?r=t[s]:i[s]=t[s];if(arguments.length>2&&(i.children=arguments.length>3?He.call(arguments,2):n),typeof e=="function"&&e.defaultProps!=null)for(s in e.defaultProps)i[s]===void 0&&(i[s]=e.defaultProps[s]);return Be(e,i,a,r,null)}function Be(e,t,n,a,r){var s={type:e,props:t,key:n,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:r??++Jt,__i:-1,__u:0};return r==null&&B.vnode!=null&&B.vnode(s),s}function Ge(e){return e.children}function Fe(e,t){this.props=e,this.context=t}function Se(e,t){if(t==null)return e.__?Se(e.__,e.__i+1):null;for(var n;t<e.__k.length;t++)if((n=e.__k[t])!=null&&n.__e!=null)return n.__e;return typeof e.type=="function"?Se(e):null}function Aa(e){if(e.__P&&e.__d){var t=e.__v,n=t.__e,a=[],r=[],s=ce({},t);s.__v=t.__v+1,B.vnode&&B.vnode(s),vt(e.__P,s,t,e.__n,e.__P.namespaceURI,32&t.__u?[n]:null,a,n??Se(t),!!(32&t.__u),r),s.__v=t.__v,s.__.__k[s.__i]=s,sn(a,s,r),t.__e=t.__=null,s.__e!=n&&en(s)}}function en(e){if((e=e.__)!=null&&e.__c!=null)return e.__e=e.__c.base=null,e.__k.some(function(t){if(t!=null&&t.__e!=null)return e.__e=e.__c.base=t.__e}),en(e)}function Wt(e){(!e.__d&&(e.__d=!0)&&fe.push(e)&&!Oe.__r++||Kt!=B.debounceRendering)&&((Kt=B.debounceRendering)||Yt)(Oe)}function Oe(){try{for(var e,t=1;fe.length;)fe.length>t&&fe.sort(Qt),e=fe.shift(),t=fe.length,Aa(e)}finally{fe.length=Oe.__r=0}}function tn(e,t,n,a,r,s,i,u,p,c,d){var h,l,f,m,y,S,C,g=a&&a.__k||Ve,R=t.length;for(p=Na(n,t,g,p,R),h=0;h<R;h++)(f=n.__k[h])!=null&&(l=f.__i!=-1&&g[f.__i]||ze,f.__i=h,S=vt(e,f,l,r,s,i,u,p,c,d),m=f.__e,f.ref&&l.ref!=f.ref&&(l.ref&&$t(l.ref,null,f),d.push(f.ref,f.__c||m,f)),y==null&&m!=null&&(y=m),(C=!!(4&f.__u))||l.__k===f.__k?(p=nn(f,p,e,C),C&&l.__e&&(l.__e=null)):typeof f.type=="function"&&S!==void 0?p=S:m&&(p=m.nextSibling),f.__u&=-7);return n.__e=y,p}function Na(e,t,n,a,r){var s,i,u,p,c,d=n.length,h=d,l=0;for(e.__k=new Array(r),s=0;s<r;s++)(i=t[s])!=null&&typeof i!="boolean"&&typeof i!="function"?(typeof i=="string"||typeof i=="number"||typeof i=="bigint"||i.constructor==String?i=e.__k[s]=Be(null,i,null,null,null):qe(i)?i=e.__k[s]=Be(Ge,{children:i},null,null,null):i.constructor===void 0&&i.__b>0?i=e.__k[s]=Be(i.type,i.props,i.key,i.ref?i.ref:null,i.__v):e.__k[s]=i,p=s+l,i.__=e,i.__b=e.__b+1,u=null,(c=i.__i=Ba(i,n,p,h))!=-1&&(h--,(u=n[c])&&(u.__u|=2)),u==null||u.__v==null?(c==-1&&(r>d?l--:r<d&&l++),typeof i.type!="function"&&(i.__u|=4)):c!=p&&(c==p-1?l--:c==p+1?l++:(c>p?l--:l++,i.__u|=4))):e.__k[s]=null;if(h)for(s=0;s<d;s++)(u=n[s])!=null&&(2&u.__u)==0&&(u.__e==a&&(a=Se(u)),on(u,u));return a}function nn(e,t,n,a){var r,s;if(typeof e.type=="function"){for(r=e.__k,s=0;r&&s<r.length;s++)r[s]&&(r[s].__=e,t=nn(r[s],t,n,a));return t}e.__e!=t&&(a&&(t&&e.type&&!t.parentNode&&(t=Se(e)),n.insertBefore(e.__e,t||null)),t=e.__e);do t=t&&t.nextSibling;while(t!=null&&t.nodeType==8);return t}function Ba(e,t,n,a){var r,s,i,u=e.key,p=e.type,c=t[n],d=c!=null&&(2&c.__u)==0;if(c===null&&u==null||d&&u==c.key&&p==c.type)return n;if(a>(d?1:0)){for(r=n-1,s=n+1;r>=0||s<t.length;)if((c=t[i=r>=0?r--:s++])!=null&&(2&c.__u)==0&&u==c.key&&p==c.type)return i}return-1}function jt(e,t,n){t[0]=="-"?e.setProperty(t,n??""):e[t]=n==null?"":typeof n!="number"||Ia.test(t)?n:n+"px"}function Ae(e,t,n,a,r){var s,i;e:if(t=="style")if(typeof n=="string")e.style.cssText=n;else{if(typeof a=="string"&&(e.style.cssText=a=""),a)for(t in a)n&&t in n||jt(e.style,t,"");if(n)for(t in n)a&&n[t]==a[t]||jt(e.style,t,n[t])}else if(t[0]=="o"&&t[1]=="n")s=t!=(t=t.replace(Xt,"$1")),i=t.toLowerCase(),t=i in e||t=="onFocusOut"||t=="onFocusIn"?i.slice(2):t.slice(2),e.l||(e.l={}),e.l[t+s]=n,n?a?n[Me]=a[Me]:(n[Me]=_t,e.addEventListener(t,s?ft:mt,s)):e.removeEventListener(t,s?ft:mt,s);else{if(r=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&t[4]!="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&n==1?"":n))}}function Zt(e){return function(t){if(this.l){var n=this.l[t.type+e];if(t[Ne]==null)t[Ne]=_t++;else if(t[Ne]<n[Me])return;return n(B.event?B.event(t):t)}}}function vt(e,t,n,a,r,s,i,u,p,c){var d,h,l,f,m,y,S,C,g,R,j,Z,J,se,O,te,I=t.type;if(t.constructor!==void 0)return null;128&n.__u&&(p=!!(32&n.__u),s=[u=t.__e=n.__e]),(d=B.__b)&&d(t);e:if(typeof I=="function"){h=i.length;try{if(g=t.props,R=I.prototype&&I.prototype.render,j=(d=I.contextType)&&a[d.__c],Z=d?j?j.props.value:d.__:a,n.__c?C=(l=t.__c=n.__c).__=l.__E:(R?t.__c=l=new I(g,Z):(t.__c=l=new Fe(g,Z),l.constructor=I,l.render=za),j&&j.sub(l),l.state||(l.state={}),l.__n=a,f=l.__d=!0,l.__h=[],l._sb=[]),R&&l.__s==null&&(l.__s=l.state),R&&I.getDerivedStateFromProps!=null&&(l.__s==l.state&&(l.__s=ce({},l.__s)),ce(l.__s,I.getDerivedStateFromProps(g,l.__s))),m=l.props,y=l.state,l.__v=t,f)R&&I.getDerivedStateFromProps==null&&l.componentWillMount!=null&&l.componentWillMount(),R&&l.componentDidMount!=null&&l.__h.push(l.componentDidMount);else{if(R&&I.getDerivedStateFromProps==null&&g!==m&&l.componentWillReceiveProps!=null&&l.componentWillReceiveProps(g,Z),t.__v==n.__v||!l.__e&&l.shouldComponentUpdate!=null&&l.shouldComponentUpdate(g,l.__s,Z)===!1){t.__v!=n.__v&&(l.props=g,l.state=l.__s,l.__d=!1),t.__e=n.__e,t.__k=n.__k,t.__k.some(function(Y){Y&&(Y.__=t)}),Ve.push.apply(l.__h,l._sb),l._sb=[],l.__h.length&&i.push(l);break e}l.componentWillUpdate!=null&&l.componentWillUpdate(g,l.__s,Z),R&&l.componentDidUpdate!=null&&l.__h.push(function(){l.componentDidUpdate(m,y,S)})}if(l.context=Z,l.props=g,l.__P=e,l.__e=!1,J=B.__r,se=0,R)l.state=l.__s,l.__d=!1,J&&J(t),d=l.render(l.props,l.state,l.context),Ve.push.apply(l.__h,l._sb),l._sb=[];else do l.__d=!1,J&&J(t),d=l.render(l.props,l.state,l.context),l.state=l.__s;while(l.__d&&++se<25);l.state=l.__s,l.getChildContext!=null&&(a=ce(ce({},a),l.getChildContext())),R&&!f&&l.getSnapshotBeforeUpdate!=null&&(S=l.getSnapshotBeforeUpdate(m,y)),O=d!=null&&d.type===Ge&&d.key==null?rn(d.props.children):d,u=tn(e,qe(O)?O:[O],t,n,a,r,s,i,u,p,c),l.base=t.__e,t.__u&=-161,l.__h.length&&i.push(l),C&&(l.__E=l.__=null)}catch(Y){if(i.length=h,t.__v=null,p||s!=null){if(Y.then){for(t.__u|=p?160:128;u&&u.nodeType==8&&u.nextSibling;)u=u.nextSibling;s!=null&&(s[s.indexOf(u)]=null),t.__e=u}else if(s!=null)for(te=s.length;te--;)ht(s[te])}else t.__e=n.__e;t.__k==null&&(t.__k=n.__k||[]),Y.then||an(t),B.__e(Y,t,n)}}else s==null&&t.__v==n.__v?(t.__k=n.__k,t.__e=n.__e):u=t.__e=Fa(n.__e,t,n,a,r,s,i,p,c);return(d=B.diffed)&&d(t),128&t.__u?void 0:u}function an(e){e&&(e.__c&&(e.__c.__e=!0),e.__k&&e.__k.some(an))}function sn(e,t,n){for(var a=0;a<n.length;a++)$t(n[a],n[++a],n[++a]);B.__c&&B.__c(t,e),e.some(function(r){try{e=r.__h,r.__h=[],e.some(function(s){s.call(r)})}catch(s){B.__e(s,r.__v)}})}function rn(e){return typeof e!="object"||e==null||e.__b>0?e:qe(e)?e.map(rn):e.constructor!==void 0?null:ce({},e)}function Fa(e,t,n,a,r,s,i,u,p){var c,d,h,l,f,m,y,S=n.props||ze,C=t.props,g=t.type;if(g=="svg"?r="http://www.w3.org/2000/svg":g=="math"?r="http://www.w3.org/1998/Math/MathML":r||(r="http://www.w3.org/1999/xhtml"),s!=null){for(c=0;c<s.length;c++)if((f=s[c])&&"setAttribute"in f==!!g&&(g?f.localName==g:f.nodeType==3)){e=f,s[c]=null;break}}if(e==null){if(g==null)return document.createTextNode(C);e=document.createElementNS(r,g,C.is&&C),u&&(B.__m&&B.__m(t,s),u=!1),s=null}if(g==null)S===C||u&&e.data==C||(e.data=C);else{if(s=g=="textarea"&&C.defaultValue!=null?null:s&&He.call(e.childNodes),!u&&s!=null)for(S={},c=0;c<e.attributes.length;c++)S[(f=e.attributes[c]).name]=f.value;for(c in S)f=S[c],c=="dangerouslySetInnerHTML"?h=f:c=="children"||c in C||c=="value"&&"defaultValue"in C||c=="checked"&&"defaultChecked"in C||Ae(e,c,null,f,r);for(c in C)f=C[c],c=="children"?l=f:c=="dangerouslySetInnerHTML"?d=f:c=="value"?m=f:c=="checked"?y=f:u&&typeof f!="function"||S[c]===f||Ae(e,c,f,S[c],r);if(d)u||h&&(d.__html==h.__html||d.__html==e.innerHTML)||(e.innerHTML=d.__html),t.__k=[];else if(h&&(e.innerHTML=""),tn(t.type=="template"?e.content:e,qe(l)?l:[l],t,n,a,g=="foreignObject"?"http://www.w3.org/1999/xhtml":r,s,i,s?s[0]:n.__k&&Se(n,0),u,p),s!=null)for(c=s.length;c--;)ht(s[c]);u&&g!="textarea"||(c="value",g=="progress"&&m==null?e.removeAttribute("value"):m!=null&&(m!==e[c]||g=="progress"&&!m||g=="option"&&m!=S[c])&&Ae(e,c,m,S[c],r),c="checked",y!=null&&y!=e[c]&&Ae(e,c,y,S[c],r))}return e}function $t(e,t,n){try{if(typeof e=="function"){var a=typeof e.__u=="function";a&&e.__u(),a&&t==null||(e.__u=e(t))}else e.current=t}catch(r){B.__e(r,n)}}function on(e,t,n){var a,r;if(B.unmount&&B.unmount(e),(a=e.ref)&&(a.current&&a.current!=e.__e||$t(a,null,t)),(a=e.__c)!=null){if(a.componentWillUnmount)try{a.componentWillUnmount()}catch(s){B.__e(s,t)}a.base=a.__P=a.__n=null}if(a=e.__k)for(r=0;r<a.length;r++)a[r]&&on(a[r],t,n||typeof e.type!="function");n||ht(e.__e),e.__c=e.__=e.__e=void 0}function za(e,t,n){return this.constructor(e,n)}function ln(e,t,n){var a,r,s,i;t==document&&(t=document.documentElement),B.__&&B.__(e,t),r=(a=typeof n=="function")?null:n&&n.__k||t.__k,s=[],i=[],vt(t,e=(!a&&n||t).__k=bt(Ge,null,[e]),r||ze,ze,t.namespaceURI,!a&&n?[n]:r?null:t.firstChild?He.call(t.childNodes):null,s,!a&&n?n:r?r.__e:t.firstChild,a,i),sn(s,e,i),e.props.children=null}He=Ve.slice,B={__e:function(e,t,n,a){for(var r,s,i;t=t.__;)if((r=t.__c)&&!r.__)try{if((s=r.constructor)&&s.getDerivedStateFromError!=null&&(r.setState(s.getDerivedStateFromError(e)),i=r.__d),r.componentDidCatch!=null&&(r.componentDidCatch(e,a||{}),i=r.__d),i)return r.__E=r}catch(u){e=u}throw e}},Jt=0,Ua=function(e){return e!=null&&e.constructor===void 0},Fe.prototype.setState=function(e,t){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=ce({},this.state),typeof e=="function"&&(e=e(ce({},n),this.props)),e&&ce(n,e),e!=null&&this.__v&&(t&&this._sb.push(t),Wt(this))},Fe.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),Wt(this))},Fe.prototype.render=Ge,fe=[],Yt=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,Qt=function(e,t){return e.__v.__b-t.__v.__b},Oe.__r=0,pt=Math.random().toString(8),Ne="__d"+pt,Me="__a"+pt,Xt=/(PointerCapture)$|Capture$/i,_t=0,mt=Zt(!1),ft=Zt(!0),La=0;var Ee,V,gt,cn,Ke=0,vn=[],H=B,un=H.__b,dn=H.__r,pn=H.diffed,mn=H.__c,fn=H.unmount,_n=H.__;function wt(e,t){H.__h&&H.__h(V,e,Ke||t),Ke=0;var n=V.__H||(V.__H={__:[],__h:[]});return e>=n.__.length&&n.__.push({}),n.__[e]}function b(e){return Ke=1,Va(yn,e)}function Va(e,t,n){var a=wt(Ee++,2);if(a.t=e,!a.__c&&(a.__=[n?n(t):yn(void 0,t),function(u){var p=a.__N?a.__N[0]:a.__[0],c=a.t(p,u);p!==c&&(a.__N=[c,a.__[1]],a.__c.setState({}))}],a.__c=V,!V.__f)){var r=function(u,p,c){if(!a.__c.__H)return!0;var d=!1,h=a.__c.props!==u;if(a.__c.__H.__.some(function(f){if(f.__N){d=!0;var m=f.__[0];f.__=f.__N,f.__N=void 0,m!==f.__[0]&&(h=!0)}}),s){var l=s.call(this,u,p,c);return d?l||h:l}return!d||h};V.__f=!0;var s=V.shouldComponentUpdate,i=V.componentWillUpdate;V.componentWillUpdate=function(u,p,c){if(this.__e){var d=s;s=void 0,r(u,p,c),s=d}i&&i.call(this,u,p,c)},V.shouldComponentUpdate=r}return a.__N||a.__}function x(e,t){var n=wt(Ee++,3);!H.__s&&gn(n.__H,t)&&(n.__=e,n.u=t,V.__H.__h.push(n))}function F(e){return Ke=5,Oa(function(){return{current:e}},[])}function Oa(e,t){var n=wt(Ee++,7);return gn(n.__H,t)&&(n.__=e(),n.__H=t,n.__h=e),n.__}function hn(){for(var e;e=vn.shift();){var t=e.__H;if(e.__P&&t)try{t.__h.some(yt),t.__h.some($n),t.__h=[]}catch(n){t.__h=[],H.__e(n,e.__v)}}}H.__b=function(e){V=null,un&&un(e)},H.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),_n&&_n(e,t)},H.__r=function(e){dn&&dn(e),Ee=0;var t=(V=e.__c).__H;t&&(gt===V?(t.__h=[],V.__h=[],t.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(t.__h.length&&hn(),Ee=0)),gt=V},H.diffed=function(e){pn&&pn(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(vn.push(t)!==1&&cn===H.requestAnimationFrame||((cn=H.requestAnimationFrame)||Ha)(hn)),t.__H.__.some(function(n){n.u&&(n.__H=n.u,n.u=void 0)})),gt=V=null},H.__c=function(e,t){t.some(function(n){try{n.__h.some(yt),n.__h=n.__h.filter(function(a){return!a.__||$n(a)})}catch(a){t.some(function(r){r.__h&&(r.__h=[])}),t=[],H.__e(a,n.__v)}}),mn&&mn(e,t)},H.unmount=function(e){fn&&fn(e);var t,n=e.__c;n&&n.__H&&(n.__H.__.some(function(a){try{yt(a)}catch(r){t=r}}),n.__H=void 0,t&&H.__e(t,n.__v))};var bn=typeof requestAnimationFrame=="function";function Ha(e){var t,n=function(){clearTimeout(a),bn&&cancelAnimationFrame(t),setTimeout(e)},a=setTimeout(n,35);bn&&(t=requestAnimationFrame(n))}function yt(e){var t=V,n=e.__c;typeof n=="function"&&(e.__c=void 0,n()),V=t}function $n(e){var t=V;e.__c=e.__(),V=t}function gn(e,t){return!e||e.length!==t.length||t.some(function(n,a){return n!==e[a]})}function yn(e,t){return typeof t=="function"?t(e):t}var kn=function(e,t,n,a){var r;t[0]=0;for(var s=1;s<t.length;s++){var i=t[s++],u=t[s]?(t[0]|=i?1:2,n[t[s++]]):t[++s];i===3?a[0]=u:i===4?a[1]=Object.assign(a[1]||{},u):i===5?(a[1]=a[1]||{})[t[++s]]=u:i===6?a[1][t[++s]]+=u+"":i?(r=e.apply(u,kn(e,u,n,["",null])),a.push(r),u[0]?t[0]|=2:(t[s-2]=0,t[s]=r)):a.push(u)}return a},wn=new Map;function Sn(e){var t=wn.get(this);return t||(t=new Map,wn.set(this,t)),(t=kn(this,t.get(e)||(t.set(e,t=(function(n){for(var a,r,s=1,i="",u="",p=[0],c=function(l){s===1&&(l||(i=i.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?p.push(0,l,i):s===3&&(l||i)?(p.push(3,l,i),s=2):s===2&&i==="..."&&l?p.push(4,l,0):s===2&&i&&!l?p.push(5,0,!0,i):s>=5&&((i||!l&&s===5)&&(p.push(s,0,i,r),s=6),l&&(p.push(s,l,0,r),s=6)),i=""},d=0;d<n.length;d++){d&&(s===1&&c(),c(d));for(var h=0;h<n[d].length;h++)a=n[d][h],s===1?a==="<"?(c(),p=[p],s=3):i+=a:s===4?i==="--"&&a===">"?(s=1,i=""):i=a+i[0]:u?a===u?u="":i+=a:a==='"'||a==="'"?u=a:a===">"?(c(),s=1):s&&(a==="="?(s=5,r=i,i=""):a==="/"&&(s<5||n[d][h+1]===">")?(c(),s===3&&(p=p[0]),s=p,(p=p[0]).push(2,0,s),s=0):a===" "||a==="	"||a===`
`||a==="\r"?(c(),s=2):i+=a),s===3&&i==="!--"&&(s=4,p=p[0])}return c(),p})(e)),t),arguments,[])).length>1?t:t[0]}var o=Sn.bind(bt);X();function Cn(e){let t=e,n=new Set;return{get:()=>t,set(a){t=a,n.forEach(r=>r(t))},update(a){this.set(a(t))},subscribe(a){return n.add(a),()=>n.delete(a)}}}function q(e){let[t,n]=b(e.get());return x(()=>e.subscribe(n),[e]),t}var N=Cn({user:null,csrfToken:null,ready:!1}),je=Cn([]),qa=0;function k(e,{actionLabel:t,onAction:n,timeoutMs:a=5e3}={}){let r=++qa;return je.update(s=>[...s,{id:r,message:e,actionLabel:t,onAction:n}]),a&&setTimeout(()=>Ze(r),a),r}function Ze(e){je.update(t=>t.filter(n=>n.id!==e))}function Je(e){try{return decodeURIComponent(e)}catch{return e}}function Tn(e){let t=Number(e.get("page")||1);return{sort:e.get("sort")||"uploaded_at_desc",game:e.get("game")||"",q:e.get("q")||"",page:Number.isFinite(t)?Math.max(1,t):1}}var Ga=["login","resetPassword","public","publicLibrary","publicGame","publicUser","about","games"];function St(e){return Ga.includes(e)}function Pn(e,t){return!t&&!St(e)}var Ka={publicLibrary:"feed",publicGame:"feed",games:"games",library:"library",clip:"library",admin:"admin",profile:"profile"};function xt(e){return Ka[e?.name]||""}function Mn(e){return e?.name==="publicLibrary"&&e.surface==="search"?"search":xt(e)}function Ye(e,t){let n=new URLSearchParams(t||""),a=e;return a.startsWith("/c/")?{name:"public",shareId:Je(a.slice(3))}:a==="/"||a==="/public"||a==="/search"?{name:"publicLibrary",query:Tn(n),surface:a==="/search"?"search":"feed"}:a.startsWith("/game/")?{name:"publicGame",game:Je(a.slice(6)),query:Tn(n)}:a==="/about"?{name:"about"}:a==="/games"?{name:"games"}:a.startsWith("/u/")?{name:"publicUser",username:Je(a.slice(3))}:a==="/library"?{name:"library"}:a.startsWith("/clip/")?{name:"clip",clipId:Je(a.slice(6))}:a==="/admin"?{name:"admin",tab:n.get("tab")||"overview"}:a==="/account"?{name:"account"}:a==="/profile"?{name:"profile"}:a==="/login"?{name:"login"}:a==="/reset-password"?{name:"resetPassword",token:n.get("token")||"",invite:n.get("invite")==="1"}:{name:"publicLibrary"}}function En(e){return Ye(e.pathname,e.search).name}var Ct=new Set;function G(e){window.history.pushState({},"",e),Rn()}function Rn(){let{pathname:e,search:t}=window.location,n=Ye(e,t);Ct.forEach(a=>a(n))}window.addEventListener("popstate",Rn);function Dn(){let[e,t]=b(()=>Ye(window.location.pathname,window.location.search));return x(()=>(Ct.add(t),()=>Ct.delete(t)),[]),e}function Un(e){let t=e.target.closest("a[href^='/']");!t||t.target||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||(e.preventDefault(),G(t.getAttribute("href")))}var Ln={alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',clipboard:'<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',copy:'<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',external:'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',fastForward:'<path d="m13 19 9-7-9-7v14Z"/><path d="m2 19 9-7-9-7v14Z"/>',film:'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 8h4"/><path d="M3 16h4"/><path d="M17 8h4"/><path d="M17 16h4"/>',fullscreen:'<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/><path d="M12 2a15.3 15.3 0 0 0 0 20"/>',home:'<path d="m3 10 9-7 9 7"/><path d="M5 8.5V20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5"/><path d="M9 22V12h6v10"/>',info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',library:'<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',lock:'<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',logOut:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',menu:'<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',message:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>',notepad:'<path d="M8 2v4"/><path d="M16 2v4"/><path d="M3 10h18"/><path d="M6 4h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/><path d="M8 14h8"/><path d="M8 18h5"/>',pause:'<path d="M8 5v14"/><path d="M16 5v14"/>',play:'<path d="m8 5 11 7-11 7V5Z"/>',plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',check:'<path d="M20 6 9 17l-5-5"/>',refresh:'<path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/><path d="M3 12A9 9 0 0 1 18.5 5.7L21 8"/><path d="M21 3v5h-5"/>',rewind:'<path d="m11 19-9-7 9-7v14Z"/><path d="m22 19-9-7 9-7v14Z"/>',save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',server:'<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',skipBack:'<path d="M19 20 9 12l10-8v16Z"/><path d="M5 19V5"/>',skipForward:'<path d="m5 4 10 8-10 8V4Z"/><path d="M19 5v14"/>',shield:'<path d="M20 13c0 5-3.5 7.5-7.7 8.8a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V5l8-3 8 3v8Z"/>',sliders:'<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>',theater:'<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M6 9h12"/><path d="M6 15h12"/>',trash:'<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',volume2:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9 9 0 0 1 0 14"/>',volumeX:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>',x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'};function T(e,{size:t=18}={}){return o`<svg viewBox="0 0 24 24" width=${t} height=${t} fill="none"
    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" dangerouslySetInnerHTML=${{__html:Ln[e]||""}} />`}function Tt(e){if(!e||typeof e!="string")return"";if(e.startsWith("/"))return e;try{let t=new URL(e,window.location.origin);if(t.origin===window.location.origin)return`${t.pathname}${t.search}`}catch{return""}return""}function Wa(e){let t=Tt(e?.avatar_url);if(!t)return"";let n=e.updated_at||"";if(!n)return t;let a=t.includes("?")?"&":"?";return`${t}${a}v=${encodeURIComponent(n)}`}function ja(e){return(e||"C").trim().slice(0,1).toUpperCase()||"C"}function xe({user:e,size:t=40,className:n=""}){let a=Wa(e),r=`width:${t}px;height:${t}px;font-size:${Math.round(t*.4)}px`;if(a)return o`<img class=${`user-avatar ${n}`} style=${r} src=${a} alt="" />`;let s=e?.display_name||e?.username;return o`<div class=${`user-avatar user-avatar-fallback ${n}`} style=${r} aria-hidden="true">
    ${ja(s)}
  </div>`}function Za(e){return e?.query?.q||""}function Ja(e,t){let n=new URLSearchParams,a=String(t||"").trim(),r=e?.name==="publicGame"?e.game:e?.query?.game||"";a&&n.set("q",a),r&&n.set("game",r);let s=n.toString();return s?`/search?${s}`:"/search"}function In({active:e,route:t}){let{user:n}=q(N),[a,r]=b(!1),s=F(null),i=Za(t),[u,p]=b(i);x(()=>{p(i)},[i]);let c=n?.role==="admin"||n?.role==="owner";x(()=>{if(!a)return;let l=m=>{s.current?.contains(m.target)||r(!1)},f=m=>{m.key==="Escape"&&r(!1)};return document.addEventListener("pointerdown",l),document.addEventListener("keydown",f),()=>{document.removeEventListener("pointerdown",l),document.removeEventListener("keydown",f)}},[a]);let d=[["feed","/","Feed"],["library","/library","Library",!!n],["games","/games","Games"],["admin","/admin","Admin",c]].filter(([,,,l])=>l!==!1),h=l=>{l.preventDefault();let f=new FormData(l.target).get("q")?.toString()||"";G(Ja(t,f))};return o`<header class="topbar">
    <a class="wordmark" href="/" aria-label="Clipline home">
      <img src="/clipline-icon.svg" alt="" width="24" height="24" />
      <span class="wordmark-text">CLIP<span class="wordmark-accent">LINE</span></span>
    </a>
    <nav class="topnav" aria-label="Primary">
      ${d.map(([l,f,m])=>o`
        <a class=${l===e?"topnav-on":""} href=${f}>${m}</a>`)}
    </nav>
    <form class="topsearch" role="search" onSubmit=${h}>
      <input class="input" name="q" value=${u} onInput=${l=>p(l.target.value)}
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
            ${c&&o`<a role="menuitem" href="/admin">Admin</a>`}
            <button role="menuitem" class="menu-danger" onClick=${Ya}>Sign out</button>
          </div>`}
        </div>`:o`<a class="btn" href="/login">${T("lock",{size:14})} Sign in</a>`}
  </header>`}async function Ya(){let{api:e,setCsrfToken:t}=await Promise.resolve().then(()=>(X(),xn));try{await e("/api/v1/auth/logout",{method:"POST"})}catch{}t(null),N.set({user:null,csrfToken:null,ready:!0}),G("/login")}var Qa=[["feed","/","home","Feed",!0],["games","/games","globe","Games",!0],["library","/library","library","Library","auth"],["search","/search","search","Search",!0],["profile","/profile","user","Profile","auth"]];function Xa(e){return Qa.filter(([,,,,t])=>t!=="auth"||!!e)}function An({active:e}){let{user:t}=q(N),n=Xa(t);return o`<nav class="tabbar" aria-label="Primary">
    ${n.map(([a,r,s,i])=>o`
      <a class=${a===e?"tab-on":""} href=${r}>${T(s)}<span>${i}</span></a>`)}
  </nav>`}function Nn(){let e=q(je);return o`<div class="toasts" role="status" aria-live="polite">
    ${e.map(t=>o`<div class="toast" key=${t.id}>
      <span>${t.message}</span>
      ${t.actionLabel&&o`<button class="toast-action"
        onClick=${()=>{t.onAction?.(),Ze(t.id)}}>${t.actionLabel}</button>`}
      <button class="toast-x" aria-label="Dismiss" onClick=${()=>Ze(t.id)}>✕</button>
    </div>`)}
  </div>`}X();function K(e){if(!e)return"Unknown";let t=new Date(e);return Number.isNaN(t.getTime())?"Unknown":new Intl.DateTimeFormat(void 0,{dateStyle:"medium",timeStyle:"short"}).format(t)}function he(e){if(e==null)return"Unknown";let t=Math.max(0,Math.round(Number(e)/1e3)),n=Math.floor(t/60),a=t%60;return`${n}:${String(a).padStart(2,"0")}`}function Qe(e){if(!e)return"Unknown";let t=new Date(e);if(Number.isNaN(t.getTime()))return"Unknown";let n=Math.min(0,t.getTime()-Date.now()),a=[["year",365*24*60*60*1e3],["month",720*60*60*1e3],["week",10080*60*1e3],["day",1440*60*1e3],["hour",3600*1e3],["minute",60*1e3],["second",1e3]],[r,s]=a.find(([,u])=>Math.abs(n)>=u)||a[a.length-1],i=Math.round(n/s);return new Intl.RelativeTimeFormat(void 0,{numeric:"always"}).format(i,r)}function z(e){if(e==null)return"Unknown";let t=Number(e);if(!Number.isFinite(t))return"Unknown";let n=["B","KiB","MiB","GiB","TiB"],a=t,r=0;for(;a>=1024&&r<n.length-1;)a/=1024,r+=1;return`${a.toFixed(r===0?0:1)} ${n[r]}`}function ye(e){let t=Number(e||0),n=Number.isFinite(t)&&t>0?Math.floor(t):0;return`${new Intl.NumberFormat(void 0,{notation:n>=1e4?"compact":"standard"}).format(n)} view${n===1?"":"s"}`}function de(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/thumbnail`}function Pt(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/thumbnail`}function Xe(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/media`}function Bn(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/poster`}function et(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/poster`}function Ce(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/media`}function Re(e,t,n){if(e)try{return`${t}${new URL(e).pathname}`}catch{}return n?`${t}/c/${encodeURIComponent(n)}`:null}var tt=null;function Fn(e){tt?.(),tt=e}function zn(e){tt===e&&(tt=null)}var es=()=>window.matchMedia("(pointer: fine)").matches&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches&&!navigator.connection?.saveData;function Vn({src:e,poster:t,alt:n=""}){let[a,r]=b(!1),[s,i]=b(0),u=F(null),p=F(null),c=F(!0),d=F(),h=()=>{c.current&&(clearTimeout(u.current),r(!1),i(0))};d.current=h;let l=()=>{!e||!es()||(u.current=setTimeout(()=>{c.current&&(Fn(d.current),r(!0))},300))},f=m=>{let y=m.target;y.duration&&i(y.currentTime/y.duration)};return x(()=>()=>{c.current=!1,clearTimeout(u.current),zn(d.current)},[]),o`<span class="hover-preview" onPointerEnter=${l} onPointerLeave=${h}>
    ${a?o`<video ref=${p} src=${e} poster=${t} muted loop autoplay
          playsinline preload="none" onTimeUpdate=${f} />`:o`<img src=${t} alt=${n} loading="lazy" />`}
    ${a&&o`<span class="preview-scrub"><span style=${`width:${s*100}%`} /></span>`}
  </span>`}function Mt(e){return e.owner?.display_name||e.owner?.username||e.owner_username||e.author_name||e.author_username||null}function Te({clip:e,href:t,selectable:n=!1,selected:a=!1,onToggleSelect:r,showVisibility:s=!1,showAuthor:i=!1}){let u=Mt(e),p=[e.game_name&&o`<em>${e.game_name}</em>`,i&&u,e.view_count!=null&&ye(e.view_count),e.uploaded_at&&Qe(e.uploaded_at)].filter(Boolean);return o`<article class=${`clip-card ${a?"is-selected":""} ${n?"is-selectable":""}`}>
    <a class="card-thumb" href=${t} tabindex="-1" aria-hidden="true">
      <${Vn} src=${e.media_url} poster=${e.thumbnail_url} />
      ${e.duration_ms!=null&&o`<span class="dur-pill">${he(e.duration_ms)}</span>`}
      ${s&&o`<span class=${`badge badge-${e.visibility} card-vis`}>${e.visibility}</span>`}
    </a>
    ${n&&o`<label class="card-check">
      <input type="checkbox" checked=${a} aria-label=${`Select ${e.title}`}
        onChange=${()=>r?.(e.id)} />
    </label>`}
    <h3 class="card-title"><a href=${t}>${e.title}</a></h3>
    <p class="card-meta">${p.map((c,d)=>o`${d>0&&" \xB7 "}${c}`)}</p>
  </article>`}function W({name:e="film",title:t,body:n,action:a}){return o`<div class="empty">
    <div class="empty-icon">${T(e,{size:28})}</div>
    <h3>${t}</h3>
    ${n&&o`<p>${n}</p>`}
    ${a}
  </div>`}var ts=[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]],ns=6,as=60;function ss(e){let t=new URLSearchParams;return t.set("page_size",String(as)),e.sort!=="uploaded_at_desc"&&t.set("sort",e.sort),e.game&&t.set("game",e.game),e.q&&t.set("q",e.q),Number(e.page)>1&&t.set("page",String(e.page)),t}function On(e){return e?.game_name||"No game"}function rs(e,t,n=ns){let a=[...e||[]].sort((h,l)=>(l.clip_count||0)-(h.clip_count||0)),r=a.slice(0,n),s=String(t||"").trim(),i=s&&r.some(h=>h.game===s),u=s&&!i?a.find(h=>h.game===s)||{game:s,clip_count:0}:null,p=u?[u,...r]:r,c=new Set(p.map(h=>h.game)),d=a.filter(h=>!c.has(h.game)).length;return{chips:p,extraGameCount:d}}function nt({route:e}){let t={sort:"uploaded_at_desc",page:1,q:"",...e.query,game:e.name==="publicGame"?e.game:e.query?.game||""},[n,a]=b(null),[r,s]=b([]),[i,u]=b(null);x(()=>{let m=!0;a(null),u(null);let y=ss(t);return w(`/api/v1/public/clips?${y}`).then(S=>m&&a(S)).catch(S=>m&&u(S)),()=>{m=!1}},[e.name,t.sort,t.game,t.q,t.page]),x(()=>{let m=!0;return w("/api/v1/public/games").then(y=>m&&s(y.games||[])).catch(()=>{}),()=>{m=!1}},[]);let p=m=>G(ls({...t,page:1,...m}));if(i)return o`<main class="page">
      <${W} name="alert" title="Couldn't load the feed" body=${i.message} />
    </main>`;let c=n?.clips,d=!!(t.game||t.q)||Number(t.page)>1,h=!d,{chips:l,extraGameCount:f}=rs(r,t.game);return o`<main class="page">
    ${c==null?o`<${is} />`:c.length===0?o`<${W} name="film"
          title=${d?"No clips match this filter":"No public clips yet"}
          body=${d?"Try a different game, search, or clear your filters.":"Clips shared as public from a library will show up here."}
          action=${d&&o`<a class="btn" href="/">Clear filters</a>`} />`:o`
        ${h?os(c):""}
        <div class="feed-toolbar">
          <h2>Latest uploads</h2>
          <select class="input" value=${t.sort} onChange=${m=>p({sort:m.target.value})}>
            ${ts.map(([m,y])=>o`<option value=${m}>${y}</option>`)}
          </select>
          <div class="chips">
            <button class=${`chip ${t.game?"":"chip-on"}`} onClick=${()=>p({game:""})}>All</button>
            ${l.map(m=>o`<button
              class=${`chip ${t.game===m.game?"chip-on":""}`}
              onClick=${()=>p({game:m.game})}>${m.game}</button>`)}
            ${f>0&&o`<a class="chip" href="/games">+${f}</a>`}
          </div>
        </div>
        <div class="card-grid">
          ${(h?c.slice(4):c).map(m=>o`<${Te} clip=${{...m,thumbnail_url:de(m),media_url:Ce(m)}}
              href=${Et(m)} showAuthor />`)}
        </div>
        ${cs(n,t,p)}
      `}
  </main>`}function os(e){let[t,...n]=e,a=n.slice(0,3);return o`<p class="kicker">Now playing on this server</p>
    <section class="hero">
      <a class="hero-main" href=${Et(t)}>
        <img src=${et(t)} alt="" loading="lazy" />
        <span class="hero-caption">▶ ${t.title} — ${On(t)} · ${he(t.duration_ms)}</span>
      </a>
      <div class="hero-side">
        ${a.map(r=>o`<a class="hero-row" href=${Et(r)}>
            <img src=${de(r)} alt="" loading="lazy" />
            <span><b>${r.title}</b>
              <small>${Mt(r)} · ${On(r)} · ${ye(r.view_count)}</small></span>
          </a>`)}
      </div>
    </section>`}function is({count:e=8}){return o`<div class="card-grid">
    ${Array.from({length:e},(t,n)=>o`<div class="clip-card" key=${n}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`}function Et(e){return`/c/${encodeURIComponent(e.share_id)}`}function ls({sort:e="uploaded_at_desc",game:t="",q:n="",page:a=1}={}){let r=new URLSearchParams,s=e||"uploaded_at_desc",i=String(t||"").trim(),u=String(n||"").trim(),p=Math.max(1,Number(a||1));if(s!=="uploaded_at_desc"&&r.set("sort",s),p>1&&r.set("page",String(p)),u)return r.set("q",u),i&&r.set("game",i),`/search?${r.toString()}`;if(i){let d=r.toString();return`/game/${encodeURIComponent(i)}${d?`?${d}`:""}`}let c=r.toString();return c?`/search?${c}`:"/"}function cs(e,t,n){let a=Math.max(1,Number(t.page||1)),r=!!e?.has_more;return a<=1&&!r?"":o`<nav class="pager" aria-label="Public clip pages">
    <button class="btn" type="button" disabled=${a<=1}
      onClick=${()=>n({page:a-1})}>Previous</button>
    <span class="muted">Page ${a}</span>
    <button class="btn" type="button" disabled=${!r}
      onClick=${()=>n({page:a+1})}>Next</button>
  </nav>`}X();function Hn(){let[e,t]=b(null),[n,a]=b(null);return x(()=>{let r=!0;return w("/api/v1/public/games").then(s=>r&&t(s.games||[])).catch(s=>r&&a(s)),()=>{r=!1}},[]),n?o`<main class="page">
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
  </main>`}X();function qn({trigger:e,content:t,onClose:n,label:a,panelClass:r=""}){let[s,i]=b(!1),u=F(null),p=F(null),c=F(null),d=()=>{i(!1),n?.()},h=()=>{if(s){d();return}c.current=document.activeElement,i(!0)};return x(()=>{if(!s)return;let l=y=>{u.current?.contains(y.target)||d()},f=y=>{y.key==="Escape"&&d()};return document.addEventListener("pointerdown",l),document.addEventListener("keydown",f),p.current?.querySelector("input, select, textarea, button, a[href], [tabindex]")?.focus(),()=>{document.removeEventListener("pointerdown",l),document.removeEventListener("keydown",f),c.current?.focus?.()}},[s]),o`<div class="popover-wrap" ref=${u}>
    ${e({open:s,toggle:h})}
    ${s&&o`<div class=${`popover ${r}`} ref=${p} role="dialog" aria-label=${a||"Filters"}>
      ${t}
    </div>`}
  </div>`}function Gn({count:e,busy:t=!1,onPublic:n,onPrivate:a,onCopyLinks:r,onDelete:s,onClear:i}){return e?o`<div class="bulkbar" role="toolbar" aria-label="Bulk actions" aria-busy=${t?"true":"false"}>
    <b>${e} selected</b>
    <button class="btn" disabled=${t} onClick=${n}>Make public</button>
    <button class="btn" disabled=${t} onClick=${a}>Make private</button>
    <button class="btn" disabled=${t} onClick=${r}>Copy links</button>
    <button class="btn btn-danger" disabled=${t} onClick=${s}>Delete</button>
    <button class="btn bulk-x" disabled=${t} aria-label="Clear selection" onClick=${i}>✕</button>
  </div>`:null}function le({open:e,title:t,body:n,confirmLabel:a="Confirm",onConfirm:r,onCancel:s,danger:i=!1,confirmDisabled:u=!1}){let p=F(null),c=F(null);return x(()=>{let d=p.current;d&&(e&&!d.open?(d.showModal(),c.current?.focus()):!e&&d.open&&d.close())},[e]),o`<dialog ref=${p} class="confirm-dialog" aria-labelledby="confirm-dialog-title"
    onCancel=${d=>{d.preventDefault(),s?.()}}
    onClose=${()=>e&&s?.()}>
    ${e&&o`<div class="confirm-dialog-body">
      <h2 id="confirm-dialog-title">${t}</h2>
      ${n&&o`<p>${n}</p>`}
      <div class="confirm-dialog-actions">
        <button type="button" class="btn" onClick=${s}>Cancel</button>
        <button type="button" ref=${c} class=${`btn ${i?"btn-danger":"btn-primary"}`}
          disabled=${u} onClick=${r}>${a}</button>
      </div>
    </div>`}
  </dialog>`}var jn="clipline.libraryView",us=[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["updated_at_desc","Updated newest"],["updated_at_asc","Updated oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["size_desc","Size largest"],["size_asc","Size smallest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]],at={title:["title_asc","title_desc"],size:["size_asc","size_desc"],duration:["duration_asc","duration_desc"],uploaded:["uploaded_at_asc","uploaded_at_desc"]},ds=["visibility","status","source_type","from","to","min_duration_seconds","max_duration_seconds","min_size_mib","max_size_mib"],ot={sort:"uploaded_at_desc",game:"",source_type:"",visibility:"",status:"",q:"",from:"",to:"",min_duration_seconds:"",max_duration_seconds:"",min_size_mib:"",max_size_mib:""};function st(e){if(e===""||e==null)return null;let t=Number(e);return Number.isFinite(t)?t:null}function ps(e){let t=new URLSearchParams;t.set("sort",e.sort||ot.sort),t.set("page_size","100");for(let i of["game","source_type","visibility","status","q"])e[i]&&t.set(i,e[i]);e.from&&t.set("from",`${e.from}T00:00:00Z`),e.to&&t.set("to",`${e.to}T23:59:59Z`);let n=st(e.min_duration_seconds);n!=null&&t.set("min_duration_ms",String(Math.round(n*1e3)));let a=st(e.max_duration_seconds);a!=null&&t.set("max_duration_ms",String(Math.round(a*1e3)));let r=st(e.min_size_mib);r!=null&&t.set("min_size_bytes",String(Math.round(r*1024*1024)));let s=st(e.max_size_mib);return s!=null&&t.set("max_size_bytes",String(Math.round(s*1024*1024))),t}function ms(e){return ds.reduce((t,n)=>t+(e[n]?1:0),0)}function fs(e,t=6){let n=new Map;for(let a of e){let r=a.game_name;r&&n.set(r,(n.get(r)||0)+1)}return Array.from(n,([a,r])=>({game:a,count:r})).sort((a,r)=>r.count-a.count||a.game.localeCompare(r.game)).slice(0,t)}function Kn(e,t,{verb:n,allFailedMessage:a}){let r=e.filter(i=>!t.some(u=>u.id===i));if(!t.length)return{succeeded:r,message:null};let s=t.length===e.length?t[0]?.message||a:`Couldn't ${n} ${t.length} of ${e.length} clips.`;return{succeeded:r,message:s}}function _s(e,t){return(e||[]).map(n=>Re(n.public_url,t,n.public_share_id)).filter(Boolean)}async function Wn(e,t,n){let a=0;async function r(){let s=a++;if(!(s>=e.length))return await n(e[s]),r()}await Promise.all(Array.from({length:Math.min(t,e.length)},r))}function hs(){try{return localStorage.getItem(jn)==="rows"?"rows":"grid"}catch{return"grid"}}function Zn(){let[e,t]=b(hs),[n,a]=b(ot),[r,s]=b(ot.q),[i,u]=b(null),[p,c]=b(null),[d,h]=b(new Set),[l,f]=b(!1),[m,y]=b(!1),[S,C]=b(0),g=F(!1),R=F(null);x(()=>()=>clearTimeout(R.current),[]),x(()=>{let $=!0;return u(null),c(null),w(`/api/v1/clips?${ps(n)}`).then(P=>{$&&(u(P),h(new Set))}).catch(P=>$&&c(P)),()=>{$=!1}},[JSON.stringify(n),S]);let j=$=>{t($);try{localStorage.setItem(jn,$)}catch{}},Z=()=>C($=>$+1),J=$=>{g.current=$,f($)},se=$=>{let P=$.target.value;s(P),clearTimeout(R.current),R.current=setTimeout(()=>{a(v=>({...v,q:P}))},300)},O=$=>P=>{let v=P.target.value;a(E=>({...E,[$]:v}))},te=()=>{a($=>({...$,visibility:"",status:"",source_type:"",from:"",to:"",min_duration_seconds:"",max_duration_seconds:"",min_size_mib:"",max_size_mib:""}))},I=$=>a(P=>({...P,game:P.game===$?"":$})),Y=$=>a(P=>({...P,sort:$})),we=$=>{h(P=>{let v=new Set(P);return v.has($)?v.delete($):v.add($),v})};function ne($,P){u(v=>v&&{...v,clips:v.clips.map(E=>E.id===$?{...E,...P}:E)})}function be($,P){let v=new Set($);u(E=>E&&{...E,clips:E.clips.map(A=>v.has(A.id)?{...A,...P}:A)})}async function ve($){if(g.current)return;let P=Array.from(d);if(!P.length)return;let v=i?.clips||[],E=new Map(P.map(U=>[U,v.find(ae=>ae.id===U)]));J(!0),be(P,{visibility:$});let A=[],D=new Map;try{await Wn(P,4,async _=>{try{let M=await w(`/api/v1/clips/${encodeURIComponent(_)}/visibility`,{method:"POST",body:{visibility:$}}),L={visibility:M.visibility,public_url:M.public_url,public_share_id:M.public_share_id};ne(_,L),D.set(_,L)}catch(M){A.push({id:_,message:M.message})}});let{succeeded:U,message:ae}=Kn(P,A,{verb:"update",allFailedMessage:"Couldn't update visibility."});if(ae){for(let{id:_}of A){let M=E.get(_);M&&ne(_,{visibility:M.visibility,public_url:M.public_url,public_share_id:M.public_share_id})}k(ae)}U.length&&(h(new Set),k(`Made ${U.length} clip${U.length===1?"":"s"} ${$}`,{actionLabel:"Undo",onAction:()=>pe(U,E,D)}))}finally{J(!1)}}async function pe($,P,v){if(g.current){k("Wait for visibility changes to finish.");return}J(!0);try{for(let D of $){let U=P.get(D);U&&ne(D,{visibility:U.visibility,public_url:U.public_url,public_share_id:U.public_share_id})}let E=[];await Wn($,4,async D=>{let U=P.get(D);if(U)try{let ae=await w(`/api/v1/clips/${encodeURIComponent(D)}/visibility`,{method:"POST",body:{visibility:U.visibility}});ne(D,{visibility:ae.visibility,public_url:ae.public_url,public_share_id:ae.public_share_id})}catch(ae){E.push({id:D,message:ae.message})}});let{message:A}=Kn($,E,{verb:"undo",allFailedMessage:"Couldn't undo visibility change."});if(A){for(let{id:D}of E){let U=v.get(D);U&&ne(D,U)}k(A)}}finally{J(!1)}}async function re(){if(g.current){k("Wait for visibility changes to finish.");return}let $=Array.from(d),P=i?.clips||[],v=$.map(D=>P.find(U=>U.id===D)).filter(Boolean),E=_s(v,window.location.origin),A=v.length-E.length;if(!E.length){k("No links to copy \u2014 selected clips are private.");return}try{await navigator.clipboard.writeText(E.join(`
`)),k(`Copied ${E.length} link${E.length===1?"":"s"}`+(A?` (${A} skipped, private)`:""))}catch{k("Couldn't copy links to clipboard.")}}async function me(){let $=Array.from(d);y(!1);try{let P=await w("/api/v1/clips/bulk-delete",{method:"POST",body:{ids:$}});h(new Set),Z(),k(`Deleted ${P.affected} clip${P.affected===1?"":"s"}.`)}catch(P){k(P.message)}}if(p)return o`<main class="page">
      <${W} name="alert" title="Couldn't load your library" body=${p.message} />
    </main>`;let Q=i?.clips,oe=ms(n),ie=!!(n.q||n.game)||oe>0,$e=fs(Q||[]),ge=(Q||[]).reduce(($,P)=>$+(P.file_size_bytes||0),0),ke=o`<div class="popover-fields">
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
        <p>${(Q||[]).length} clip${(Q||[]).length===1?"":"s"} · ${z(ge)} used</p>
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
        ${us.map(([$,P])=>o`<option value=${$}>${P}</option>`)}
      </select>
      <${qn}
        label="Filters"
        panelClass="popover-filters"
        trigger=${({open:$,toggle:P})=>o`<button type="button" class="btn" aria-haspopup="dialog"
          aria-expanded=${$} onClick=${P}>
          ${T("sliders",{size:14})} Filters
          ${oe>0&&o`<span class="filter-badge">${oe}</span>`}
        </button>`}
        content=${ke} />
    </div>

    ${$e.length>0&&o`<div class="lib-chips">
      <button type="button" class=${`chip ${n.game?"":"chip-on"}`} aria-pressed=${!n.game}
        onClick=${()=>I("")}>All</button>
      ${$e.map($=>o`<button type="button" class=${`chip ${n.game===$.game?"chip-on":""}`}
        aria-pressed=${n.game===$.game} onClick=${()=>I($.game)}>${$.game}</button>`)}
    </div>`}

    ${Q==null?o`<${vs} />`:Q.length===0?ie?o`<${W} name="film" title="No clips match this view"
            body="Try a different search, game, or clear your filters."
            action=${o`<button type="button" class="btn" onClick=${()=>{a(ot),s("")}}>Clear filters</button>`} />`:o`<${W} name="upload" title="Connect the Clipline desktop app to start uploading"
            body="New clips uploaded from the desktop app will show up here."
            action=${o`<a class="btn" href="/about">Learn more</a>`} />`:e==="grid"?o`<div class=${`card-grid ${d.size>0?"selecting":""}`}>
          ${Q.map($=>o`<${Te} key=${$.id}
            clip=${{...$,thumbnail_url:Pt($),media_url:Xe($)}}
            href=${`/clip/${encodeURIComponent($.id)}`}
            selectable selected=${d.has($.id)} onToggleSelect=${we} showVisibility />`)}
        </div>`:o`<${bs} clips=${Q} query=${n} onSort=${Y}
          selected=${d} onToggleSelect=${we} />`}

    <${Gn} count=${d.size} busy=${l}
      onPublic=${()=>ve("public")}
      onPrivate=${()=>ve("private")}
      onCopyLinks=${re}
      onDelete=${()=>y(!0)}
      onClear=${()=>h(new Set)} />

    <${le} open=${m}
      title=${`Delete ${d.size} clip${d.size===1?"":"s"}?`}
      body="Public links stop working immediately."
      confirmLabel="Delete" danger
      onConfirm=${me}
      onCancel=${()=>y(!1)} />
  </main>`}function rt(e,[t,n]){let a=e.sort===t?"ascending":e.sort===n?"descending":"none",r=e.sort===n?t:n;return{ariaSort:a,next:r}}function bs({clips:e,query:t,onSort:n,selected:a,onToggleSelect:r}){let s=rt(t,at.title),i=rt(t,at.size),u=rt(t,at.duration),p=rt(t,at.uploaded);return o`<table class="lib-table">
    <thead>
      <tr>
        <th class="row-select-cell"></th>
        <th></th>
        <th aria-sort=${s.ariaSort}><button type="button" class="sort-btn" onClick=${()=>n(s.next)}>Title</button></th>
        <th>Game</th>
        <th>Visibility</th>
        <th aria-sort=${i.ariaSort}><button type="button" class="sort-btn" onClick=${()=>n(i.next)}>Size</button></th>
        <th aria-sort=${u.ariaSort}><button type="button" class="sort-btn" onClick=${()=>n(u.next)}>Duration</button></th>
        <th aria-sort=${p.ariaSort}><button type="button" class="sort-btn" onClick=${()=>n(p.next)}>Uploaded</button></th>
      </tr>
    </thead>
    <tbody>
      ${e.map(c=>o`<tr key=${c.id} class=${a?.has(c.id)?"is-selected":""}>
        <td class="row-select-cell">
          <input class="row-select" type="checkbox" checked=${a?.has(c.id)}
            aria-label=${`Select ${c.title}`} onChange=${()=>r?.(c.id)} />
        </td>
        <td><img class="row-thumb" src=${Pt(c)} alt="" width="64" height="36" loading="lazy" /></td>
        <td><a href=${`/clip/${encodeURIComponent(c.id)}`}>${c.title}</a></td>
        <td>${c.game_name||"\u2014"}</td>
        <td><span class=${`badge badge-${c.visibility}`}>${c.visibility}</span></td>
        <td>${z(c.file_size_bytes)}</td>
        <td>${he(c.duration_ms)}</td>
        <td>${K(c.uploaded_at)}</td>
      </tr>`)}
    </tbody>
  </table>`}function vs({count:e=8}){return o`<div class="card-grid">
    ${Array.from({length:e},(t,n)=>o`<div class="clip-card" key=${n}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`}X();var $s={ChampionKill:"kill",FirstBlood:"kill",Multikill:"spree",Ace:"spree",DragonKill:"objective",HeraldKill:"objective",BaronKill:"objective",TurretKilled:"structure",InhibKilled:"structure",FirstBrick:"structure"};function Yn(e){let t=Number(e);return Number.isFinite(t)&&t>0?t/1e3:0}function Qn(e,t){let n=Number.isFinite(e)?e:0,a=t>0?t:Number.MAX_SAFE_INTEGER;return Math.max(0,Math.min(a,n))}function it(e,t){return t>0?Math.max(0,Math.min(100,e/t*100)):0}function Rt(e){if(!Number.isFinite(e))return"0:00";let t=Math.max(0,Math.round(e)),n=Math.floor(t/60),a=t-n*60;return`${n}:${String(a).padStart(2,"0")}`}function Jn(e){if(!Number.isFinite(e))return"0:00.0";let t=Math.max(0,Math.round(e*10)),n=Math.floor(t/600),a=t-n*600,r=Math.floor(a/10);return`${n}:${String(r).padStart(2,"0")}.${a%10}`}function Xn(e,t){return`${Jn(e)} / ${t>0?Jn(t):"0:00.0"}`}function gs(e){return $s[e]||"info"}function ea(e,t){return(e||[]).map((n,a)=>{let r=Number(n.timestamp_ms);if(!Number.isFinite(r))return null;let s=r/1e3;return s<0||t>0&&s>t?null:{index:a,time:s,kind:String(n.kind||"Marker"),label:String(n.label||n.kind||"Marker"),category:gs(n.kind)}}).filter(Boolean).sort((n,a)=>n.time-a.time)}function ta(e,t){if(!e.length)return null;for(let n of e)if(n.time>t+.05)return n;return e[0]}function na(e,t){if(!e.length)return null;for(let n=e.length-1;n>=0;n-=1)if(e[n].time<t-.05)return e[n];return e[e.length-1]}function aa(e,t){switch(e){case"Space":case"KeyK":return{kind:"toggle-play"};case"ArrowLeft":return{kind:"seek-by",seconds:t?-1:-5};case"ArrowRight":return{kind:"seek-by",seconds:t?1:5};case"KeyJ":return{kind:"seek-by",seconds:-10};case"KeyL":return{kind:"seek-by",seconds:10};case"Comma":return{kind:"seek-by",seconds:-.1};case"Period":return{kind:"seek-by",seconds:.1};case"KeyM":return{kind:t?"previous-marker":"next-marker"};case"Home":return{kind:"seek-to",seconds:0};case"End":return{kind:"seek-to-end"};case"KeyF":return{kind:"fullscreen"};case"KeyT":return{kind:"theater"};default:return null}}var ra="clipline.playerVolume",oa="clipline.clipTheaterMode",ys=2e3,ws=[.25,.5,.75,1,1.25,1.5,2];function ks(e,t){switch(e){case"KeyM":return{kind:"toggle-mute"};case"KeyF":return{kind:"theater"};case"Escape":return{kind:"exit-theater"};default:return aa(e,t)}}function Ss(e){return e instanceof Element?!!e.closest("input, textarea, select, button, a, [contenteditable='true'], [contenteditable='']"):!1}function xs(){try{let e=window.localStorage.getItem(ra);if(e==null)return 1;let t=Number(e);return Number.isFinite(t)?Math.max(0,Math.min(1,t)):1}catch{return 1}}function sa(e){try{window.localStorage.setItem(ra,String(Math.max(0,Math.min(1,e))))}catch{}}function Cs(){try{return window.localStorage.getItem(oa)==="true"}catch{return!1}}function Ts(e){try{window.localStorage.setItem(oa,String(e))}catch{}}function ia({src:e,poster:t,durationMs:n,markers:a}){let r=F(null),s=F(null),i=F(null),u=F(!1),p=F(!1),c=Yn(n),[d,h]=b(!1),[l,f]=b(0),[m,y]=b(c),[S,C]=b(0),[g,R]=b(xs),[j,Z]=b(!1),[J,se]=b(1),[O,te]=b(!1),[I,Y]=b(Cs),[we,ne]=b(!0),[be,ve]=b(null),[pe,re]=b(""),me=ea(a,m);function Q(){ne(!0),window.clearTimeout(i.current),i.current=window.setTimeout(()=>{let _=r.current;_&&!_.paused&&!_.ended&&ne(!1)},ys)}x(()=>{d||(window.clearTimeout(i.current),ne(!0))},[d]),x(()=>{let _=r.current;if(!_)return;let M=()=>Number.isFinite(_.duration)&&_.duration>0?_.duration:c,L=()=>y(M()),Ue=()=>y(M()),Nt=()=>{u.current||f(_.currentTime||0)},Bt=()=>{let qt=M();if(!(qt>0)||!_.buffered?.length){C(0);return}let Gt=_.currentTime||0,Le=0;for(let Ie=0;Ie<_.buffered.length;Ie+=1){let Ma=_.buffered.start(Ie),dt=_.buffered.end(Ie);if(Gt>=Ma&&Gt<=dt){Le=dt;break}Le=Math.max(Le,dt)}C(it(Le,qt))},Ft=()=>{h(!0),re(""),Q()},zt=()=>h(!1),Vt=()=>h(!1),Ot=()=>{R(_.volume),Z(_.muted||_.volume===0)},Ht=()=>re("Playback unavailable");return _.addEventListener("loadedmetadata",L),_.addEventListener("durationchange",Ue),_.addEventListener("timeupdate",Nt),_.addEventListener("progress",Bt),_.addEventListener("play",Ft),_.addEventListener("pause",zt),_.addEventListener("ended",Vt),_.addEventListener("volumechange",Ot),_.addEventListener("error",Ht),()=>{_.removeEventListener("loadedmetadata",L),_.removeEventListener("durationchange",Ue),_.removeEventListener("timeupdate",Nt),_.removeEventListener("progress",Bt),_.removeEventListener("play",Ft),_.removeEventListener("pause",zt),_.removeEventListener("ended",Vt),_.removeEventListener("volumechange",Ot),_.removeEventListener("error",Ht)}},[e,c]),x(()=>{r.current&&(r.current.volume=g)},[g]),x(()=>{r.current&&(r.current.muted=j)},[j]),x(()=>{r.current&&(r.current.playbackRate=J)},[J]),x(()=>{let _=r.current;if(!_)return;let M=!1;async function L(){if(!M)try{await _.play();return}catch{if(M||!_.paused)return;_.muted=!0,Z(!0);try{await _.play()}catch(Ue){re(Ue?.message||"Playback unavailable")}}}return _.readyState>=HTMLMediaElement.HAVE_FUTURE_DATA?L():_.addEventListener("canplay",L,{once:!0}),()=>{M=!0,_.removeEventListener("canplay",L)}},[e]),x(()=>{let _=document.documentElement;return _.classList.toggle("clipline-theater",I),()=>_.classList.remove("clipline-theater")},[I]);function oe(_){Y(_),Ts(_)}function ie(_){let M=r.current;if(!M)return;let L=m>0?Qn(_,m):Math.max(0,_);M.currentTime=L,f(L)}function $e(_){ie((r.current?.currentTime||0)+_)}async function ge(){let _=r.current;if(_)if(_.paused||_.ended)try{await _.play()}catch(M){re(M?.message||"Playback failed")}else _.pause()}function ke(){let _=r.current;_&&(_.muted||_.volume===0?(_.muted=!1,_.volume===0&&(_.volume=1,R(1),sa(1)),Z(!1)):(_.muted=!0,Z(!0)))}function $(_){let M=Number(_.target.value);R(M),Z(M===0),sa(M);let L=r.current;L&&(L.volume=M,L.muted=M===0)}async function P(){try{document.fullscreenElement?await document.exitFullscreen():await s.current?.requestFullscreen?.()}catch(_){re(_?.message||"Fullscreen unavailable")}}function v(_){let M=r.current?.currentTime||0,L=_>0?ta(me,M):na(me,M);L&&ie(L.time)}function E(){u.current=!0,p.current=d,d&&r.current?.pause()}function A(_){let M=Number(_.target.value);f(M),ie(M)}function D(){u.current&&(u.current=!1,p.current&&(p.current=!1,r.current?.play().catch(()=>{})))}function U(_){let M=_.currentTarget.getBoundingClientRect();if(!(M.width>0))return;let L=Math.max(0,Math.min(1,(_.clientX-M.left)/M.width));ve({pct:L*100,time:L*(m||0)})}function ae(){ve(null)}return x(()=>{function _(M){if(M.defaultPrevented||Ss(M.target))return;let L=ks(M.code,M.shiftKey);if(L&&!(L.kind==="exit-theater"&&!I))switch(M.preventDefault(),Q(),L.kind){case"toggle-play":ge();break;case"seek-by":$e(L.seconds);break;case"seek-to":ie(L.seconds);break;case"seek-to-end":ie(m);break;case"next-marker":v(1);break;case"previous-marker":v(-1);break;case"toggle-mute":ke();break;case"theater":oe(!I);break;case"exit-theater":oe(!1);break;case"fullscreen":P();break;default:break}}return document.addEventListener("keydown",_),()=>document.removeEventListener("keydown",_)},[m,I,d]),o`<div class=${`player ${we?"":"chrome-hidden"}`} ref=${s}
      onPointerMove=${Q} onPointerEnter=${Q}
      onPointerLeave=${()=>{let _=r.current;_&&!_.paused&&ne(!1)}}
      onFocusIn=${()=>ne(!0)}>
    <video ref=${r} class="player-video" src=${e} poster=${t||void 0}
      preload="metadata" playsinline onClick=${ge}></video>
    ${pe&&o`<div class="player-note">${pe}</div>`}
    <div class="player-overlay">
      <div class="player-timeline" onPointerMove=${U} onPointerLeave=${ae}>
        <div class="player-buffered" style=${`width:${S}%`}></div>
        <div class="player-progress" style=${`width:${it(l,m)}%`}></div>
        ${me.map(_=>o`<span class="player-marker-tick" key=${_.index}
            style=${`left:${it(_.time,m)}%`} title=${`${_.label} @ ${Rt(_.time)}`}></span>`)}
        <input class="player-scrubber" type="range" min="0" max=${m>0?m:0} step="0.01"
          value=${l} disabled=${!(m>0)} aria-label="Seek"
          onPointerDown=${E} onInput=${A} onChange=${D}
          onPointerUp=${D} onPointerCancel=${D} onLostPointerCapture=${D} />
        ${be&&o`<div class="player-hover-time" style=${`left:${be.pct}%`}>${Rt(be.time)}</div>`}
      </div>
      <div class="player-controls">
        ${me.length>0&&o`<div class="player-cluster">
          <button type="button" class="player-btn" title="Previous marker" aria-label="Previous marker"
            onClick=${()=>v(-1)}>${T("skipBack",{size:14})}</button>
          <button type="button" class="player-btn" title="Next marker" aria-label="Next marker"
            onClick=${()=>v(1)}>${T("skipForward",{size:14})}</button>
        </div>`}
        <button type="button" class="player-btn player-play" aria-label=${d?"Pause":"Play"} onClick=${ge}>
          ${T(d?"pause":"play",{size:16})}
        </button>
        <span class="player-time">${Xn(l,m)}</span>
        <div class="player-spacer"></div>
        <div class="player-speed-wrap">
          <button type="button" class="player-btn player-speed" aria-haspopup="menu" aria-expanded=${O}
            onClick=${()=>te(_=>!_)}>${J}×</button>
          ${O&&o`<div class="player-speed-menu" role="menu">
            ${ws.map(_=>o`<button type="button" role="menuitem" key=${_}
                class=${`player-speed-item ${_===J?"is-active":""}`}
                onClick=${()=>{se(_),te(!1)}}>${_}×</button>`)}
          </div>`}
        </div>
        <button type="button" class="player-btn" aria-label=${j?"Unmute":"Mute"} onClick=${ke}>
          ${T(j?"volumeX":"volume2",{size:14})}
        </button>
        <input class="player-volume" type="range" min="0" max="1" step="0.01" value=${j?0:g}
          aria-label="Volume" onInput=${$} />
        <button type="button" class="player-btn" aria-label=${I?"Exit theater mode":"Theater mode"}
          aria-pressed=${I} onClick=${()=>oe(!I)}>${T("theater",{size:14})}</button>
        <button type="button" class="player-btn" aria-label="Fullscreen" onClick=${P}>
          ${T("fullscreen",{size:14})}
        </button>
      </div>
    </div>
  </div>`}X();function Ps(e){let t=new Map(e.map(s=>[s.id,s])),n=new Map,a=[],r=0;return e.forEach(s=>{let i=s.parent_comment_id||"";i&&t.has(i)?(n.has(i)||n.set(i,[]),n.get(i).push(s),r+=1):i||(a.push(s),r+=1)}),{roots:a,repliesByParent:n,count:r}}async function Ms({apiClient:e=w,shareId:t,body:n,parentCommentId:a,onReload:r=()=>{},onError:s=k}){let i=n.trim();if(!i)return!1;try{return await e(`/api/v1/public/clips/${encodeURIComponent(t)}/comments`,{method:"POST",body:a?{body:i,parent_comment_id:a}:{body:i}}),r(),!0}catch(u){return s(u.message),!1}}function Es(e){return(e||"?").trim().slice(0,1).toUpperCase()||"?"}function Rs(e){let t=Tt(e.author_avatar_url);return t?o`<img class="comment-avatar" src=${t} alt="" />`:o`<div class="comment-avatar">${Es(e.author_name)}</div>`}function la({shareId:e}){let{user:t}=q(N),[n,a]=b(null),[r,s]=b(""),[i,u]=b(null),[p,c]=b(""),[d,h]=b(null);function l(){w(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`).then(g=>a(g.comments||[])).catch(()=>a([]))}x(()=>{let g=!0;return a(null),w(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`).then(R=>g&&a(R.comments||[])).catch(()=>g&&a([])),()=>{g=!1}},[e]);async function f(g,R){return Ms({shareId:e,body:g,parentCommentId:R,onReload:l,onError:k})}async function m(g){g.preventDefault(),await f(r)&&s("")}async function y(g,R){g.preventDefault(),await f(p,R)&&(c(""),u(null))}async function S(){let g=d;h(null);try{await w(`/api/v1/public/clips/${encodeURIComponent(e)}/comments/${encodeURIComponent(g)}`,{method:"DELETE"}),l()}catch(R){k(R.message)}}let C=Ps(n||[]);return o`<section class="comments">
    <div class="comments-header"><h2>Comments</h2><span class="muted">${C.count}</span></div>
    ${t?o`<form class="comment-form" onSubmit=${m}>
          <textarea rows="3" maxlength="2000" placeholder="Add a comment" value=${r}
            onInput=${g=>s(g.target.value)}></textarea>
          <div class="comment-form-actions">
            <button type="submit" class="btn btn-primary">${T("message",{size:14})} Post comment</button>
          </div>
        </form>`:o`<p class="comment-signin"><a href="/login">Sign in</a> to comment.</p>`}
    ${n==null?"":C.count===0?o`<p class="comment-signin">No comments yet.</p>`:o`<div class="comment-list">
          ${C.roots.map(g=>ca(g,{depth:0,repliesByParent:C.repliesByParent,user:t,replyOpenId:i,setReplyOpenId:u,replyDraft:p,setReplyDraft:c,submitReply:y,onDelete:h}))}
        </div>`}
    <${le} open=${d!=null} title="Delete this comment?"
      body="This removes the comment from the public clip page." confirmLabel="Delete" danger
      onConfirm=${S} onCancel=${()=>h(null)} />
  </section>`}function ca(e,t){let{depth:n,repliesByParent:a,user:r,replyOpenId:s,setReplyOpenId:i,replyDraft:u,setReplyDraft:p,submitReply:c,onDelete:d}=t,h=a.get(e.id)||[];return o`<article class="comment" key=${e.id}>
    ${Rs(e)}
    <div class="comment-body">
      <div class="comment-head">
        ${e.author_username?o`<a href=${`/u/${encodeURIComponent(e.author_username)}`}>${e.author_name}</a>`:o`<strong>${e.author_name}</strong>`}
        ${e.is_uploader&&o`<span class="comment-badge">Uploader</span>`}
        <span>${Qe(e.created_at)}</span>
        <div class="comment-actions">
          ${r&&n===0&&o`<button type="button" class="comment-action"
            onClick=${()=>i(s===e.id?null:e.id)}>
            ${T("message",{size:12})} Reply</button>`}
          ${e.viewer_can_delete&&o`<button type="button" class="comment-delete" aria-label="Delete comment"
            title="Delete comment" onClick=${()=>d(e.id)}>${T("trash",{size:12})}</button>`}
        </div>
      </div>
      <p class="comment-text">${e.body}</p>
      ${r&&n===0&&s===e.id&&o`<form class="comment-reply-form"
        onSubmit=${l=>c(l,e.id)}>
        <textarea rows="2" maxlength="2000" placeholder="Write a reply" value=${u}
          onInput=${l=>p(l.target.value)}></textarea>
        <div class="comment-form-actions">
          <button type="submit" class="btn btn-primary">${T("message",{size:14})} Post reply</button>
        </div>
      </form>`}
      ${h.length>0&&o`<div class="comment-replies">
        ${h.map(l=>ca(l,{...t,depth:n+1}))}
      </div>`}
    </div>
  </article>`}var Ds=["private","public","unlisted"];function Us(e,t){return e==="clip"?!0:!!t?.viewer_can_edit}function Ls(e,t,n){return e==="public"?t.shareId:n?.public_share_id||null}function Is(e,t,n){return e==="clip"?t.clipId:n?.viewer_clip_id||null}function As(e){let t=e?.height!=null?e.height:"",n=Math.round(e?.fps||0)||"";return`${t}p${n}`}function Ns(e,t=8){let n=new URLSearchParams;return e&&n.set("share_id",e),n.set("limit",String(t)),`/api/v1/public/recommendations?${n}`}function Bs(e,t,n=8){return(e||[]).filter(a=>a.share_id!==t).slice(0,n)}function Dt({route:e}){let{user:t}=q(N),[n,a]=b(null),[r,s]=b(null),[i,u]=b([]),[p,c]=b(!1),[d,h]=b(""),[l,f]=b(!1),[m,y]=b(""),[S,C]=b(!1),[g,R]=b(!1),[j,Z]=b(!1),J=e.name==="clip"?`clip:${e.clipId}`:`public:${e.shareId}`,se=Ls(e.name,e,n),O=e.name==="public"||!!n;if(x(()=>{let v=!0;a(null),s(null),c(!1),f(!1),Z(!1),C(!1);let E=e.name==="clip"?`/api/v1/clips/${encodeURIComponent(e.clipId)}`:`/api/v1/public/clips/${encodeURIComponent(e.shareId)}`;return w(E).then(A=>{v&&(a(A),e.name==="public"&&w(`/api/v1/public/clips/${encodeURIComponent(e.shareId)}/view`,{method:"POST",body:{}}).then(D=>v&&a(U=>U&&{...U,view_count:D.view_count})).catch(()=>{}))}).catch(A=>v&&s(A)),()=>{v=!1}},[J]),x(()=>{let v=!0;return O?(u([]),w(Ns(se,8)).then(E=>v&&u(E.clips||[])).catch(()=>{}),()=>{v=!1}):(u([]),()=>{v=!1})},[J,se,O]),r)return o`<main class="page"><${W} name="alert" title="Couldn't load this clip" body=${r.message} /></main>`;if(!n)return o`<main class="page watch"><div><div class="skeleton-thumb"></div></div><aside class="upnext"></aside></main>`;let te=Us(e.name,n),I=se,Y=Is(e.name,e,n),we=e.name==="clip"?Xe({id:n.id}):Ce({share_id:e.shareId}),ne=e.name==="clip"?Bn({id:n.id}):et({share_id:e.shareId}),be=e.name==="clip"?t?.display_name||t?.username||"You":n.author_name||"Unknown creator",ve=n.public_url??n.share_url??null,pe=Re(ve,window.location.origin,I),re=e.name==="clip";function me(){h(n.title),c(!0)}async function Q(v){v?.preventDefault?.();let E=d.trim();if(!E||E===n.title){c(!1);return}try{await w(`/api/v1/clips/${encodeURIComponent(Y)}`,{method:"PATCH",body:{title:E}}),a(A=>({...A,title:E})),c(!1),k("Title saved.")}catch(A){k(A.message)}}function oe(){y(n.description||""),f(!0)}async function ie(){let v=m.trim();try{await w(`/api/v1/clips/${encodeURIComponent(Y)}`,{method:"PATCH",body:{description:v||null}}),a(E=>({...E,description:v||null})),f(!1),k("Description saved.")}catch(E){k(E.message)}}async function $e(v,{force:E=!1}={}){let A=n.visibility;if(!(A===v&&!E)){a(D=>({...D,visibility:v}));try{let D=await w(`/api/v1/clips/${encodeURIComponent(Y)}/visibility`,{method:"POST",body:{visibility:v}});a(U=>({...U,visibility:D.visibility,public_url:D.public_url,public_share_id:D.public_share_id})),k(`Visibility set to ${v}.`,{actionLabel:"Undo",onAction:()=>$e(A,{force:!0})})}catch(D){a(U=>({...U,visibility:A})),k(D.message)}}}async function ge(){if(pe)try{await navigator.clipboard.writeText(pe),k("Link copied.")}catch{k("Couldn't copy the link.")}}async function ke(){R(!1);try{await w(`/api/v1/clips/${encodeURIComponent(Y)}`,{method:"DELETE"}),k("Clip deleted."),G("/library")}catch(v){k(v.message)}}let $=[n.game_name&&o`<a class="chip chip-on" href=${`/game/${encodeURIComponent(n.game_name)}`}>${n.game_name}</a>`,ye(n.view_count),`Recorded ${K(n.recorded_at)}`,`by ${be}`].filter(Boolean),P=Bs(i,I,8);return o`<main class="page watch">
    <div>
      <${ia} src=${we} poster=${ne} durationMs=${n.duration_ms} markers=${n.markers} />
      <div class="watch-titlerow">
        ${p?o`<input class="input watch-title-input" value=${d} autofocus
              onInput=${v=>h(v.target.value)} onBlur=${Q}
              onKeyDown=${v=>{v.key==="Enter"&&Q(v),v.key==="Escape"&&c(!1)}} />`:o`<h1>${n.title}
              ${te&&o`<button type="button" class="edit-pencil" aria-label="Edit title" onClick=${me}
                >${T("edit",{size:14})}</button>`}</h1>`}
      </div>
      <p class="watch-meta">${$.map((v,E)=>o`${E>0?" \xB7 ":""}${v}`)}</p>

      ${te&&o`<div class="watch-actions">
        <div class="seg" role="radiogroup" aria-label="Visibility">
          ${Ds.map(v=>o`<button type="button" role="radio" key=${v} aria-checked=${n.visibility===v}
              class=${`seg-item ${n.visibility===v?"seg-on":""}`} onClick=${()=>$e(v)}
              >${v[0].toUpperCase()+v.slice(1)}</button>`)}
        </div>
        <button type="button" class="btn btn-primary" disabled=${!pe} onClick=${ge}>
          ${T("copy",{size:14})} Copy share link</button>
        <div class="watch-more">
          <button type="button" class="btn" aria-haspopup="menu" aria-expanded=${S}
            onClick=${()=>C(v=>!v)}>⋯</button>
          ${S&&o`<div class="menu" role="menu">
            <button type="button" class="menu-danger" role="menuitem"
              onClick=${()=>{C(!1),R(!0)}}>${T("trash",{size:14})} Delete clip</button>
          </div>`}
        </div>
      </div>`}

      <div class="watch-desc">
        ${l?o`<textarea class="input" rows="5" value=${m} autofocus
              onInput=${v=>y(v.target.value)} onBlur=${ie}
              onKeyDown=${v=>{v.key==="Enter"&&(v.ctrlKey||v.metaKey)&&ie(),v.key==="Escape"&&f(!1)}}></textarea>`:n.description?o`<p>${n.description}
              ${te&&o`<button type="button" class="edit-pencil" aria-label="Edit description" onClick=${oe}
                >${T("edit",{size:12})}</button>`}</p>`:te?o`<button type="button" class="watch-desc-add" onClick=${oe}>+ Add a description</button>`:""}
      </div>

      ${re&&o`<button type="button" class="details-strip" aria-expanded=${j}
        onClick=${()=>Z(v=>!v)}>
        <span><b>${he(n.duration_ms)}</b> length</span>
        <span><b>${z(n.file_size_bytes)}</b></span>
        <span><b>${As(n)}</b></span>
        <span><b>${n.video_codec}/${n.audio_codec}</b> ${n.container}</span>
        <span class="details-chev">${j?"\u25B4 less":"\u25BE more"}</span>
      </button>`}
      ${re&&j&&o`<dl class="details-full">
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

      ${I&&o`<${la} shareId=${I} />`}
    </div>
    <aside class="upnext">
      <h4 class="kicker">Up next</h4>
      ${P.map(v=>o`<a class="upnext-row" key=${v.share_id} href=${`/c/${encodeURIComponent(v.share_id)}`}>
          <img src=${de(v)} alt="" loading="lazy" />
          <span><b>${v.title}</b><small>${v.author_name} · ${v.game_name||"No game"} · ${ye(v.view_count)}</small></span>
        </a>`)}
    </aside>

    <${le} open=${g} title="Delete this clip?" body="Public links stop working immediately."
      confirmLabel="Delete" danger onConfirm=${ke} onCancel=${()=>R(!1)} />
  </main>`}X();var Ut=[{top:"4%",left:"4%",width:"34%",rotate:-7},{top:"0%",left:"44%",width:"30%",rotate:5},{top:"34%",left:"68%",width:"28%",rotate:-4},{top:"50%",left:"8%",width:"30%",rotate:6},{top:"62%",left:"42%",width:"26%",rotate:-5},{top:"26%",left:"-4%",width:"22%",rotate:9}];function Fs(e){return Array.isArray(e)?e.slice(0,Ut.length).map((t,n)=>({clip:t,...Ut[n]})):[]}function zs(e){let t=e?.clips;if(!Array.isArray(t)||t.length===0)return null;let n=t.length,a=e.has_more?"+":"";return`${n}${a} clip${n===1?"":"s"} on this instance`}function Vs({top:e,left:t,width:n,rotate:a}){return`top:${e};left:${t};width:${n};transform:rotate(${a}deg);`}function ua(e){let t=String(e||"").trim();return t||null}function Os(){let[e,t]=b(null);x(()=>{let r=!0;return w(`/api/v1/public/clips?page_size=${Ut.length}`).then(s=>r&&t(s)).catch(()=>r&&t(null)),()=>{r=!1}},[]);let n=Fs(e?.clips),a=zs(e);return o`<aside class="login-montage" aria-hidden="true">
    ${n.length>0&&o`<div class="login-montage-tiles">
      ${n.map((r,s)=>o`<img key=${s} class="login-montage-tile" style=${Vs(r)}
        src=${de(r.clip)} alt="" loading="lazy" />`)}
    </div>`}
    <div class="login-montage-copy">
      <h2>Your clips. Your server.</h2>
      ${a&&o`<p>${a}</p>`}
    </div>
  </aside>`}function Pe({titleId:e,children:t}){return o`<div class="login-page">
    <${Os} />
    <section class="login-panel" aria-labelledby=${e}>
      <div class="login-brand" aria-hidden="true">
        <img src="/clipline-icon.svg" alt="" width="32" height="32" />
        <span class="login-brand-word">CLIP<span class="wordmark-accent">LINE</span></span>
        <span class="login-brand-descriptor">CLOUD</span>
      </div>
      ${t}
    </section>
  </div>`}function da(){let{user:e}=q(N),[t,n]=b(""),[a,r]=b(""),[s,i]=b(""),[u,p]=b(!1);if(x(()=>{e&&G("/library")},[e]),e)return null;async function c(d){if(d.preventDefault(),!u){p(!0),i("");try{let h=await w("/api/v1/auth/login",{method:"POST",body:{username:t,password:a}});ue(h.csrf_token),N.set({user:h.user,csrfToken:h.csrf_token,ready:!0}),G("/library")}catch(h){i(h instanceof _e?h.message:"Sign in failed"),p(!1)}}}return o`<${Pe} titleId="login-title">
    <h1 id="login-title">Sign in</h1>
    ${s&&o`<p class="form-error" role="alert">${s}</p>`}
    <form class="login-form" onSubmit=${c}>
      <label class="login-field">
        <span>Username</span>
        <input class="input" name="username" autocomplete="username" required
          value=${t} onInput=${d=>n(d.target.value)} />
      </label>
      <label class="login-field">
        <span>Password</span>
        <input class="input" name="password" type="password" autocomplete="current-password" required
          value=${a} onInput=${d=>r(d.target.value)} />
      </label>
      <button class="btn btn-primary" type="submit" disabled=${u}>${u?"Signing in\u2026":"Sign in"}</button>
    </form>
    <p class="login-hint">Accounts are created by this server's admin.</p>
  </${Pe}>`}function pa({route:e}){let t=!!e.invite,[n,a]=b(()=>t?"preflight":e.token?"form":"missing-token"),[r,s]=b(""),[i,u]=b(t?null:e.token),[p,c]=b(""),[d,h]=b(!1),l=t;x(()=>{if(!t)return;if(!e.token){a("missing-token");return}let S=!0;return a("preflight"),w("/api/v1/invites/claim",{method:"POST",body:{invite_token:e.token}}).then(C=>{S&&(u(C.reset_token),a("form"))}).catch(C=>{S&&(s(C instanceof _e?C.message:"This invite link is invalid, used, or expired."),a("invalid"))}),()=>{S=!1}},[t,e.token]);async function f(S){if(S.preventDefault(),d)return;h(!0),c("");let C=new FormData(S.currentTarget),g={reset_token:i,new_password:String(C.get("new_password")||"")};l&&(g.username=String(C.get("username")||""),g.display_name=ua(C.get("display_name")),g.email=ua(C.get("email")));try{await w("/api/v1/auth/reset-password",{method:"POST",body:g}),k(l?"Account created. Sign in with your new password.":"Password set. Sign in with your new password."),G("/login")}catch(R){c(R instanceof _e?R.message:"Request failed"),h(!1)}}if(t&&n!=="form"){let S=n==="missing-token"||n==="invalid",C=n==="missing-token"?"This invite link is missing a token.":n==="invalid"?r:"Opening invite\u2026";return o`<${Pe} titleId="invite-title">
      <h1 id="invite-title">Create account</h1>
      <p class="login-copy">${S?"This invite cannot be used.":"Preparing your account setup."}</p>
      ${S?o`<p class="form-error" role="alert">${C}</p>`:o`<p class="login-status">${C}</p>`}
    </${Pe}>`}return o`<${Pe} titleId="reset-title">
    <h1 id="reset-title">${l?"Create account":"Set password"}</h1>
    <p class="login-copy">${l?"Choose your Clipline Cloud account details.":"Choose a new password for your Clipline Cloud account."}</p>
    ${n==="missing-token"?o`<p class="form-error" role="alert">This reset link is missing a token.</p>`:o`
        ${p&&o`<p class="form-error" role="alert">${p}</p>`}
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
          <button class="btn btn-primary" type="submit" disabled=${d}>
            ${l?"Create account":"Set password"}
          </button>
        </form>
      `}
    ${!l&&o`<a class="btn" href="/login">Sign in</a>`}
  </${Pe}>`}X();function De({label:e,value:t,sub:n,meter:a,tone:r}){let s=r?` stat-${r}`:"";return o`<div class="stat-card">
    <p class="stat-label">${e}</p>
    <p class=${`stat-value${s}`}>${t}</p>
    ${n!=null&&o`<p class="stat-sub">${n}</p>`}
    ${a!=null&&o`<div class="stat-meter${s}">
      <span style=${`width:${Math.max(0,Math.min(1,a))*100}%`}></span>
    </div>`}
  </div>`}function Hs(e){let t=Number(e?.global_storage_warning_threshold_bytes||0);if(!t)return null;let n=Number(e?.total_storage_bytes||0);return Math.max(0,Math.min(1,n/t))}function qs(e){if(!e?.global_storage_warning_threshold_bytes)return"Disabled";let t=z(e.global_storage_warning_threshold_bytes);return e.global_storage_warning?`At or above ${t}`:`Below ${t}`}function Gs({deadJobs:e=[],failedUploads:t=[]}={}){let n=e.length+t.length;return{failedCount:n,healthy:n===0}}function ee(e,t){return o`<div><dt>${e}</dt><dd>${t??"Unknown"}</dd></div>`}function ma({overview:e,deadJobs:t,failedUploads:n}){let a=Hs(e),{failedCount:r,healthy:s}=Gs({deadJobs:t,failedUploads:n}),i=e.global_storage_warning_threshold_bytes;return o`<div>
    <div class="stat-grid">
      <${De} label="Clips" value=${String(e.total_clips)} />
      <${De} label="Storage" value=${z(e.total_storage_bytes)}
        sub=${i?`${z(i)} warning threshold`:null}
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
        ${ee("Stored clips",`${e.total_clips} clips \u2014 ${z(e.total_storage_bytes)}`)}
        ${ee("Users",`${e.total_users} total`)}
        ${ee("Max upload",z(e.max_upload_size_bytes))}
        ${ee("Part size",z(e.upload_part_size_bytes))}
        ${ee("Single PUT max",z(e.single_put_max_bytes))}
        ${ee("Active uploads/user",e.max_active_upload_sessions_per_user)}
        ${ee("User quota",e.user_storage_quota_bytes?z(e.user_storage_quota_bytes):"Disabled")}
        ${ee("Storage warning",qs(e))}
        ${ee("Upload TTL",`${e.upload_session_ttl_seconds}s`)}
        ${ee("Direct S3 uploads",e.direct_s3_uploads?"Enabled":"Disabled")}
        ${ee("Public media",`${e.public_media_mode}, ${e.public_read_url_ttl_seconds}s TTL`)}
      </dl>
    </div>
  </div>`}X();function lt(e){let t=String(e||"").trim();return t||null}function Ks(e,t){return!(e.is_disabled||t?.id===e.id||e.role==="owner"||e.role==="admin"&&t?.role!=="owner")}function Ws(e,t){return!(!e.is_disabled||t?.id===e.id||e.role==="owner"||e.role==="admin"&&t?.role!=="owner")}function js(e,t){return t?.role==="owner"&&e.role!=="owner"&&t?.id!==e.id}function Zs(e,t){return!(t?.id===e.id||e.role==="owner"||e.role==="admin"&&t?.role!=="owner")}function Lt(e){return e?[["user","User"],["admin","Admin"]]:[["user","User"]]}function Js({isOwner:e,onCreated:t}){let[n,a]=b(!1);async function r(s){if(s.preventDefault(),n)return;a(!0);let i=s.currentTarget,u=new FormData(i);try{await w("/api/v1/users",{method:"POST",body:{username:String(u.get("username")||""),display_name:lt(u.get("display_name")),email:lt(u.get("email")),password:lt(u.get("password")),role:String(u.get("role")||"user")}}),k("User created."),i.reset(),t()}catch(p){k(p.message)}finally{a(!1)}}return o`<form class="panel section" onSubmit=${r}>
    <h2>Create user</h2>
    <label class="field"><span>Username</span><input class="input" name="username" required /></label>
    <label class="field"><span>Display name</span><input class="input" name="display_name" placeholder="Optional" /></label>
    <label class="field"><span>Email</span><input class="input" name="email" type="email" placeholder="Optional" /></label>
    <label class="field"><span>Password</span><input class="input" name="password" type="password" required /></label>
    <label class="field"><span>Role</span>
      <select class="input" name="role">
        ${Lt(e).map(([s,i])=>o`<option value=${s}>${i}</option>`)}
      </select>
    </label>
    <button class="btn btn-primary" type="submit" disabled=${n}>${T("plus",{size:14})} Create user</button>
  </form>`}function Ys({isOwner:e,smtpEnabled:t,onCreated:n}){let[a,r]=b(!1);async function s(i){if(i.preventDefault(),a)return;r(!0);let u=new FormData(i.currentTarget),p=i.submitter?.value==="email"?"email":"link";try{let c=await w("/api/v1/invites",{method:"POST",body:{role:String(u.get("role")||"user"),email:lt(u.get("email")),send_email:p==="email"}});k(p==="email"?"Invite sent.":"Invite link created."),n({...c,kind:"invite"})}catch(c){k(c.message)}finally{r(!1)}}return o`<form class="panel section" onSubmit=${s}>
    <h2>Invite link</h2>
    <label class="field"><span>Role</span>
      <select class="input" name="role">
        ${Lt(e).map(([i,u])=>o`<option value=${i}>${u}</option>`)}
      </select>
    </label>
    <label class="field"><span>Email</span>
      <input class="input" name="email" type="email" placeholder=${t?"Optional":"SMTP disabled"} disabled=${!t} />
    </label>
    <div class="actions">
      <button class="btn" type="submit" name="intent" value="link" disabled=${a}>${T("copy",{size:14})} Generate link</button>
      ${t&&o`<button class="btn btn-primary" type="submit" name="intent" value="email" disabled=${a}>${T("message",{size:14})} Send email</button>`}
    </div>
  </form>`}function Qs({resetLink:e}){if(!e)return null;let t=e.kind==="invite"?"Invite":"Reset",n=e.username?` for ${e.username}`:"",a=async()=>{try{await navigator.clipboard.writeText(e.reset_url),k("Copied to clipboard.")}catch{k("Copy failed. Select and copy the URL manually.")}};return o`<div class="notice admin-reset-link">
    <div>
      <strong>${t} link created${n}</strong>
      <span>Expires ${K(e.expires_at)}</span>
      <code>${e.reset_url}</code>
    </div>
    <button class="btn" type="button" onClick=${a}>${T("copy",{size:14})} Copy</button>
  </div>`}function Xs(e){return e.is_disabled?o`<span class="badge badge-warn">Disabled</span>`:o`<span class="badge badge-public">Active</span>`}function er(e){return e?e.user_storage_quota_bytes!=null&&e.user_storage_quota_bytes>0?e.user_storage_quota_bytes:e.user_storage_quota_env_fallback_bytes??null:null}function tr(e,t){if(e.storage_quota_bytes!=null&&e.storage_quota_bytes>0)return z(e.storage_quota_bytes);let n=er(t);return n!=null&&n>0?`Default (${z(n)})`:"No limit"}function nr({user:e,currentUser:t,settings:n,onQuota:a,onReset:r,onDisable:s,onEnable:i,onRole:u,onPurge:p}){let c=tr(e,n),d=!Ks(e,t),h=!Ws(e,t),l=!Zs(e,t),f=js(e,t),[m,y]=b(e.role);return x(()=>{y(e.role)},[e.role]),o`<tr>
    <td>
      <strong>${e.username}</strong>
      <div class="muted">${e.display_name||e.id}</div>
      ${e.email&&o`<div class="muted">${e.email}</div>`}
    </td>
    <td>
      ${f?o`<select class="input input-compact" value=${m}
            onChange=${S=>{let C=S.target.value;C!==e.role&&(y(e.role),u(e,C))}}>
            ${Lt(!0).map(([S,C])=>o`<option value=${S} selected=${m===S}>${C}</option>`)}
          </select>`:e.role}
    </td>
    <td>${Xs(e)}</td>
    <td>
      <strong>${z(e.storage_bytes||0)}</strong>
      <div class="muted">quota ${c}</div>
    </td>
    <td>${K(e.last_login_at)}</td>
    <td>
      <div class="actions">
        <button class="btn" type="button" onClick=${()=>a(e)}>${T("sliders",{size:14})} Quota</button>
        <button class="btn" type="button" onClick=${()=>r(e)}>${T("clipboard",{size:14})} Reset link</button>
        ${e.is_disabled?o`<button class="btn" type="button" disabled=${h} onClick=${()=>i(e)}>${T("check",{size:14})} Enable</button>`:o`<button class="btn btn-danger" type="button" disabled=${d} onClick=${()=>s(e)}>${T("x",{size:14})} Disable</button>`}
        <button class="btn btn-danger" type="button" disabled=${l} onClick=${()=>p(e)}>${T("trash",{size:14})} Delete</button>
      </div>
    </td>
  </tr>`}function fa({users:e,settings:t,currentUser:n,resetLink:a,setResetLink:r,reload:s}){let[i,u]=b(null),p=n?.role==="owner",c=!!t?.smtp_enabled,d=()=>u(null);async function h(){let{type:f,user:m,value:y}=i;d();try{if(f==="quota"){let S=y.trim()?It(y):null;await w(`/api/v1/users/${encodeURIComponent(m.id)}`,{method:"PATCH",body:{storage_quota_bytes:S}}),k("Storage quota updated.")}else if(f==="disable")await w(`/api/v1/users/${encodeURIComponent(m.id)}`,{method:"DELETE",body:{reauth_password:y}}),k("User disabled.");else if(f==="enable")await w(`/api/v1/users/${encodeURIComponent(m.id)}`,{method:"PATCH",body:{is_disabled:!1,reauth_password:y}}),k("User enabled.");else if(f==="role")await w(`/api/v1/users/${encodeURIComponent(m.id)}`,{method:"PATCH",body:{role:y.role,reauth_password:y.password}}),k(`Role updated to ${y.role}.`);else if(f==="purge")await w(`/api/v1/users/${encodeURIComponent(m.id)}/purge`,{method:"POST",body:{reauth_password:y}}),k("User deleted.");else if(f==="reset"){let S=await w(`/api/v1/users/${encodeURIComponent(m.id)}/reset-password`,{method:"POST",body:{reauth_password:y}});r({...S,kind:"reset"}),k("Reset link created.")}s()}catch(S){k(S.message),s()}}let l={quota:{title:"Set storage quota",description:"Enter a per-user storage limit in GiB. Leave it blank to remove the per-user limit.",confirmLabel:"Save quota",danger:!1,field:o`<label class="field"><span>Quota GiB</span>
        <input class="input" type="number" min="0" step="0.1" placeholder="No per-user limit"
          value=${i?.value||""} onInput=${f=>u(m=>({...m,value:f.target.value}))} /></label>`},disable:{title:"Disable user?",description:"This immediately revokes the user's sessions and device tokens.",confirmLabel:"Disable",danger:!0,field:o`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value||""}
          onInput=${f=>u(m=>({...m,value:f.target.value}))} /></label>`},enable:{title:"Enable user?",description:"This restores sign-in access for the selected account.",confirmLabel:"Enable",danger:!1,field:o`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value||""}
          onInput=${f=>u(m=>({...m,value:f.target.value}))} /></label>`},role:{title:"Change user role?",description:`Set ${i?.user?.username||"this user"} to ${i?.value?.role||"the selected role"}.`,confirmLabel:"Save role",danger:!1,field:o`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value?.password||""}
          onInput=${f=>u(m=>({...m,value:{...m.value,password:f.target.value}}))} /></label>`},purge:{title:"Delete user permanently?",description:"This removes the account, clips, comments, and auth records. This cannot be undone.",confirmLabel:"Delete user",danger:!0,field:o`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value||""}
          onInput=${f=>u(m=>({...m,value:f.target.value}))} /></label>`},reset:{title:"Create reset link?",description:"This creates a temporary password reset link for the selected user.",confirmLabel:"Create link",danger:!1,field:o`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value||""}
          onInput=${f=>u(m=>({...m,value:f.target.value}))} /></label>`}}[i?.type];return o`<div class="admin-users-layout">
    <div class="admin-users-forms">
      <${Js} isOwner=${p} onCreated=${()=>{r(null),s()}} />
      <${Ys} isOwner=${p} smtpEnabled=${c}
        onCreated=${f=>{r(f),s()}} />
    </div>
    <div class="panel admin-users-table">
      <div class="section-header">
        <h2>Users</h2>
        <span class="muted">${e.length} total</span>
      </div>
      <${Qs} resetLink=${a} />
      <div class="table-wrap">
        <table class="lib-table">
          <thead><tr><th>Username</th><th>Role</th><th>Status</th><th>Storage</th><th>Last login</th><th></th></tr></thead>
          <tbody>
            ${e.map(f=>o`<${nr} key=${f.id} user=${f} currentUser=${n} settings=${t}
              onQuota=${m=>u({type:"quota",user:m,value:""})}
              onReset=${m=>u({type:"reset",user:m,value:""})}
              onDisable=${m=>u({type:"disable",user:m,value:""})}
              onEnable=${m=>u({type:"enable",user:m,value:""})}
              onRole=${(m,y)=>u({type:"role",user:m,value:{role:y,password:""}})}
              onPurge=${m=>u({type:"purge",user:m,value:""})} />`)}
          </tbody>
        </table>
      </div>
    </div>
    <${le} open=${!!i}
      title=${l?.title}
      body=${l&&o`${l.description} ${l.field}`}
      confirmLabel=${l?.confirmLabel} danger=${l?.danger}
      confirmDisabled=${i?.type==="quota"?!1:i?.type==="role"?!i?.value?.password?.trim():!i?.value?.trim()}
      onConfirm=${h} onCancel=${d} />
  </div>`}function It(e){let t=Number(String(e||"").trim());if(!Number.isFinite(t)||t<0)throw new Error("Storage quota must be a non-negative number");return Math.round(t*1024*1024*1024)}X();function ct(e){let t=String(e||"").trim();return t||null}function _a(e){return e==null||e<=0?"":String(Math.round(e/1024**3*100)/100)}function ha({settings:e,isOwner:t,reload:n}){let[a,r]=b(!1),[s,i]=b(!1);async function u(p){if(p.preventDefault(),!a){r(!0);try{let c=new FormData(p.currentTarget),d={allow_vod_uploads:c.get("allow_vod_uploads")==="on",vod_threshold_minutes:Number(c.get("vod_threshold_minutes")||30)};if(s){let h=String(c.get("user_storage_quota_gib")||"").trim();d.user_storage_quota_bytes=h?It(h):null}if(t){d.about_text=String(c.get("about_text")||""),d.smtp_enabled=c.get("smtp_enabled")==="on",d.smtp_host=ct(c.get("smtp_host")),d.smtp_port=Number(c.get("smtp_port")||587),d.smtp_tls_mode=String(c.get("smtp_tls_mode")||"starttls"),d.smtp_username=ct(c.get("smtp_username")),d.smtp_from_email=ct(c.get("smtp_from_email")),d.smtp_from_name=ct(c.get("smtp_from_name"));let h=String(c.get("smtp_password")||"").trim();h&&(d.smtp_password=h),c.get("smtp_password_clear")==="on"&&(d.smtp_password_clear=!0)}await w("/api/v1/admin/settings",{method:"PATCH",body:d}),k("Settings saved."),i(!1),n()}catch(c){k(c.message)}finally{r(!1)}}}return o`<form class="admin-settings-page" onSubmit=${u}>
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
            placeholder=${e.user_storage_quota_env_fallback_bytes?`Env default: ${_a(e.user_storage_quota_env_fallback_bytes)} GiB`:"No default quota"}
            value=${_a(e.user_storage_quota_bytes)}
            onInput=${()=>i(!0)} /></label>
        ${e.user_storage_quota_bytes==null&&e.user_storage_quota_env_fallback_bytes?o`<p class="muted">Effective default: ${z(e.user_storage_quota_env_fallback_bytes)} from CLIPLINE_USER_STORAGE_QUOTA_BYTES.</p>`:null}
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
            ${[["starttls","STARTTLS"],["tls","TLS"],["none","None"]].map(([p,c])=>o`<option value=${p} selected=${(e.smtp_tls_mode||"starttls")===p}>${c}</option>`)}
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
  </form>`}function ar(e){return`${(e/100).toFixed(e%100===0?0:1)}%`}function sr(e){switch(e){case"delete_and_retry":return"delete the failed upload and retry from a new session";case"retry":return"retry the current upload request";default:return""}}function rr({upload:e}){let t=Math.max(0,Math.min(1e4,Number(e.progress_basis_points||0))),n=sr(e.recovery_action);return o`<div class="job-item">
    <div class="job-title-line">
      <strong class="mono">${e.id}</strong>
      <span class="badge badge-warn">${ar(t)}</span>
    </div>
    <div class="progress-meter" aria-label="Upload progress"><span style=${`width:${t/100}%`}></span></div>
    <span class="muted">clip ${e.clip_id} — ${z(e.received_size_bytes)} of ${z(e.expected_size_bytes)} — updated ${K(e.updated_at)}</span>
    ${e.failure_reason&&o`<span class="form-error">${e.failure_reason}</span>`}
    ${n&&o`<span class="muted">Recovery: ${n}</span>`}
  </div>`}function ba({job:e}){return o`<div class="job-item">
    <strong>${e.kind} <span class="mono">${e.id}</span></strong>
    <span class="muted">${e.status} — attempts ${e.attempts}/${e.max_attempts} — updated ${K(e.updated_at)} — target ${e.target_type||""}:${e.target_id||""}</span>
    ${e.last_error&&o`<span class="form-error">${e.last_error}</span>`}
  </div>`}function At({title:e,items:t,renderItem:n,emptyLabel:a}){return o`<div class="panel">
    <div class="section-header">
      <h2>${e}</h2>
      <span class="muted">${t.length}</span>
    </div>
    ${t.length?o`<div class="job-list">${t.map(n)}</div>`:o`<p class="muted">${a}</p>`}
  </div>`}function va({failedUploads:e,deadJobs:t,recentErrors:n}){return o`<div class="section">
    <${At} title="Failed uploads" items=${e} emptyLabel="No failed uploads."
      renderItem=${a=>o`<${rr} key=${a.id} upload=${a} />`} />
    <${At} title="Dead jobs" items=${t} emptyLabel="No dead jobs."
      renderItem=${a=>o`<${ba} key=${a.id} job=${a} />`} />
    <${At} title="Recent job errors" items=${n} emptyLabel="No recent job errors."
      renderItem=${a=>o`<${ba} key=${a.id} job=${a} />`} />
  </div>`}var $a=[["overview","server","Overview"],["users","users","Users"],["settings","sliders","Settings"],["jobs","alert","Jobs"]];function or(e){return e?.role==="admin"||e?.role==="owner"}async function ir(){let[e,t,n,a,r,s]=await Promise.all([w("/api/v1/admin/overview"),w("/api/v1/admin/settings"),w("/api/v1/users"),w("/api/v1/admin/uploads/failed?limit=50"),w("/api/v1/admin/jobs/dead?limit=50"),w("/api/v1/admin/jobs/recent-errors?limit=50")]);return{overview:e,settings:t,users:n,failedUploads:a,deadJobs:r,recentErrors:s}}function ga({route:e}){let{user:t}=q(N),n=or(t),a=!!(t&&!n),r=$a.some(([m])=>m===e.tab)?e.tab:"overview",[s,i]=b(null),[u,p]=b(null),[c,d]=b(null),[h,l]=b(0),f=()=>l(m=>m+1);return x(()=>{a&&(k("Admin access required."),G("/library"))},[a]),x(()=>{if(!n)return;let m=!0;return p(null),ir().then(y=>m&&i(y)).catch(y=>m&&p(y)),()=>{m=!1}},[n,h]),n?o`<main class="page">
    <h1>Admin</h1>
    <p class="page-subtitle">Accounts, instance summary, and processing diagnostics.</p>
    <nav class="ad-tabs" aria-label="Admin views">
      ${$a.map(([m,y,S])=>o`<a key=${m} class=${`ad-tab ${m===r?"ad-tab-on":""}`}
        href=${`/admin?tab=${m}`} aria-current=${m===r?"page":void 0}>${T(y,{size:14})} ${S}</a>`)}
    </nav>
    ${u?o`<${W} name="alert" title="Couldn't load admin data" body=${u.message} />`:s?r==="users"?o`<${fa} users=${s.users} settings=${s.settings} currentUser=${t}
          resetLink=${c} setResetLink=${d} reload=${f} />`:r==="settings"?o`<${ha} settings=${s.settings} isOwner=${t?.role==="owner"} reload=${f} />`:r==="jobs"?o`<${va} failedUploads=${s.failedUploads} deadJobs=${s.deadJobs} recentErrors=${s.recentErrors} />`:o`<${ma} overview=${s.overview} deadJobs=${s.deadJobs} failedUploads=${s.failedUploads} />`:o`<p class="empty-state">Loading admin data…</p>`}
  </main>`:null}X();function ya(e){let t=String(e||"").trim();return t||null}async function lr(e){let t=new Headers;t.set("Accept","application/json"),t.set("Content-Type",e.type||"application/octet-stream");let n=kt();n&&t.set("X-CSRF-Token",n);let a=await fetch("/api/v1/me/avatar",{method:"PUT",credentials:"same-origin",headers:t,body:e}),r=await a.json().catch(()=>({}));if(!a.ok)throw new Error(r.error||a.statusText||"Avatar upload failed");return r}function wa(e){N.set({...N.get(),user:e})}function cr({user:e}){let[t,n]=b(!1);async function a(r){if(r.preventDefault(),t)return;n(!0);let s=new FormData(r.currentTarget);try{let i=await w("/api/v1/me/profile",{method:"PATCH",body:{display_name:ya(s.get("display_name")),bio:ya(s.get("bio"))}});wa(i),k("Profile saved.")}catch(i){k(i.message)}finally{n(!1)}}return o`<form class="profile-form" onSubmit=${a}>
    <label class="field"><span>Display name</span>
      <input class="input" name="display_name" maxlength="120" value=${e.display_name||""} placeholder=${e.username} /></label>
    <label class="field"><span>Bio</span>
      <textarea class="input" name="bio" rows="5" maxlength="2000" placeholder="Tell people what you upload.">${e.bio||""}</textarea></label>
    <div class="clip-inline-actions">
      <button class="btn btn-primary" type="submit" disabled=${t}>${T("save",{size:14})} Save profile</button>
    </div>
  </form>`}function ur({user:e}){let[t,n]=b(!1);async function a(r){if(r.preventDefault(),t)return;let s=r.currentTarget.elements.avatar?.files?.[0];if(!s){k("Choose an avatar image first.");return}n(!0);try{let i=await lr(s);wa(i),k("Avatar uploaded.")}catch(i){k(i.message)}finally{n(!1)}}return o`<form class="profile-form" onSubmit=${a}>
    <label class="field"><span>Avatar</span>
      <input name="avatar" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
      <small>PNG, JPEG, WebP, or GIF. Max 2 MiB.</small></label>
    <div class="clip-inline-actions">
      <button class="btn" type="submit" disabled=${t}>${T("upload",{size:14})} Upload avatar</button>
    </div>
  </form>`}function ka(){let{user:e}=q(N);return e?o`<main class="page">
    <h1>Profile</h1>
    <p class="page-subtitle">Public identity and avatar.</p>
    <div class="profile-settings-header">
      <${xe} user=${e} size=${72} />
      <div>
        <h2>${e.display_name||e.username}</h2>
        <p>@${e.username} · ${e.role}</p>
      </div>
    </div>
    <${cr} user=${e} />
    <${ur} user=${e} />
    <div class="profile-public-link">
      <a class="btn" href=${`/u/${encodeURIComponent(e.username)}`}>${T("external",{size:14})} View public profile</a>
    </div>
  </main>`:null}X();async function dr(){let[e,t]=await Promise.all([w("/api/v1/auth/sessions"),w("/api/v1/auth/device-tokens")]);return{sessions:e,deviceTokens:t}}function pr({item:e,onRevoke:t}){return o`<div class="management-item">
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
      <button class="btn btn-danger" type="button" onClick=${()=>t(e)}>${T("x",{size:14})} Revoke</button>
    </div>
  </div>`}function mr({item:e,onRevoke:t}){let n=!!e.revoked_at;return o`<div class="management-item">
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
      <button class="btn btn-danger" type="button" disabled=${n} onClick=${()=>t(e)}>${T("x",{size:14})} Revoke</button>
    </div>
  </div>`}function Sa(){let[e,t]=b(null),[n,a]=b(null),[r,s]=b(0),[i,u]=b(null);x(()=>{let d=!0;return a(null),dr().then(h=>d&&t(h)).catch(h=>d&&a(h)),()=>{d=!1}},[r]);let p=()=>s(d=>d+1);async function c(){let d=i;u(null);try{if(d.kind==="session"){if(await w(`/api/v1/auth/sessions/${encodeURIComponent(d.item.id)}`,{method:"DELETE",body:{}}),d.item.current){ue(null),N.set({user:null,csrfToken:null,ready:!0}),k("Current session revoked."),G("/login");return}k("Session revoked.")}else await w(`/api/v1/auth/device-tokens/${encodeURIComponent(d.item.id)}`,{method:"DELETE",body:{}}),k("Device token revoked.");p()}catch(h){k(h.message)}}return n?o`<main class="page"><${W} name="alert" title="Couldn't load account data" body=${n.message} /></main>`:o`<main class="page">
    <h1>Account</h1>
    <p class="page-subtitle">Sessions and device tokens.</p>
    ${e?o`<div class="account-grid">
          <div class="panel">
            <div class="section-header"><h2>Browser sessions</h2><span class="muted">${e.sessions.length} active</span></div>
            ${e.sessions.length?o`<div class="management-list">${e.sessions.map(d=>o`<${pr} key=${d.id} item=${d}
                  onRevoke=${h=>u({kind:"session",item:h})} />`)}</div>`:o`<p class="muted">No active sessions.</p>`}
          </div>
          <div class="panel">
            <div class="section-header"><h2>Device tokens</h2><span class="muted">${e.deviceTokens.length} total</span></div>
            ${e.deviceTokens.length?o`<div class="management-list">${e.deviceTokens.map(d=>o`<${mr} key=${d.id} item=${d}
                  onRevoke=${h=>u({kind:"device",item:h})} />`)}</div>`:o`<p class="muted">No device tokens.</p>`}
          </div>
        </div>`:o`<p class="empty-state">Loading account data…</p>`}
    <${le} open=${!!i}
      title=${i?.kind==="session"?"Revoke browser session?":"Revoke device token?"}
      body=${i?.kind==="session"?i.item.current?"This signs you out of the current browser session.":"This signs out that browser session immediately.":"The desktop client using this token will need to reconnect."}
      confirmLabel="Revoke" danger
      onConfirm=${c} onCancel=${()=>u(null)} />
  </main>`}X();function xa({route:e}){let{user:t}=q(N),[n,a]=b(null),[r,s]=b(null);if(x(()=>{let p=!0;return a(null),s(null),w(`/api/v1/public/users/${encodeURIComponent(e.username)}`).then(c=>p&&a(c)).catch(c=>p&&s(c)),()=>{p=!1}},[e.username]),r)return o`<main class="page"><${W} name="alert" title="Profile unavailable" body=${r.message} /></main>`;if(!n)return o`<main class="page"><p class="empty-state">Loading profile…</p></main>`;let i=t&&t.username.toLowerCase()===n.username.toLowerCase(),u=n.clips||[];return o`<main class="page">
    <header class="public-user-header">
      <${xe} user=${n} size=${72} />
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
    ${u.length===0?o`<${W} name="film" title="No public clips yet" />`:o`<div class="card-grid">
          ${u.map(p=>o`<${Te} key=${p.share_id}
            clip=${{...p,thumbnail_url:de(p),media_url:Ce(p)}}
            href=${`/c/${encodeURIComponent(p.share_id)}`} showAuthor=${!1} />`)}
        </div>`}
  </main>`}X();var Ca="Clipline is a self-hosted clip library for saved gameplay moments.";function ut(e,t){return o`<div><dt>${e}</dt><dd>${t}</dd></div>`}function Ta(){let[e,t]=b(Ca);return x(()=>{let n=!0;return w("/api/v1/about").then(a=>n&&t(a.about_text||Ca)).catch(()=>{}),()=>{n=!1}},[]),o`<main class="page">
    <h1>About</h1>
    <p class="page-subtitle">Clipline Cloud</p>
    <div class="panel about-panel">
      <h2>Clipline Cloud</h2>
      <p class="about-text">${e}</p>
      <dl class="ad-kv">
        ${ut("Home","Public clips that are ready for discovery.")}
        ${ut("Unlisted","Shareable by link, but not listed on Home.")}
        ${ut("Private","Visible only to the clip owner.")}
        ${ut("Media","Public and unlisted clips are not DRM-protected.")}
      </dl>
    </div>
  </main>`}var fr={publicLibrary:nt,publicGame:nt,games:Hn,library:Zn,clip:Dt,public:Dt,login:da,resetPassword:pa,admin:ga,profile:ka,account:Sa,publicUser:xa,about:Ta},Pa=En({pathname:window.location.pathname,search:window.location.search});function _r(){let e=Dn();Pa=e.name;let{ready:t,user:n}=q(N),a=t&&Pn(e.name,n);if(x(()=>{a&&G("/login")},[a]),!t||a)return o`<div class="boot">Loading…</div>`;let r=fr[e.name]||nt,s=e.name==="login"||e.name==="resetPassword";return o`<div class="ui" onClick=${Un}>
    ${!s&&o`<${In} active=${xt(e)} route=${e} />`}
    <${r} route=${e} />
    ${!s&&o`<${An} active=${Mn(e)} />`}
    <${Nn} />
  </div>`}window.addEventListener("clipline:unauthorized",()=>{ue(null),N.set({user:null,csrfToken:null,ready:!0}),St(Pa)||G("/login")});(async()=>{try{let t=await w("/api/v1/auth/me");ue(t.csrf_token),N.set({user:t.user,csrfToken:t.csrf_token,ready:!0})}catch{ue(null),N.set({user:null,csrfToken:null,ready:!0})}let e=document.querySelector("#app");e.textContent="",ln(o`<${_r} />`,e)})();
