var Ln=Object.defineProperty;var Nn=(e,t)=>()=>(e&&(t=e(e=0)),t);var Bn=(e,t)=>{for(var a in t)Ln(e,a,{get:t[a],enumerable:!0})};var Pa={};Bn(Pa,{ApiError:()=>Te,api:()=>k,getCsrfToken:()=>Mt,setCsrfToken:()=>$e});function $e(e){et=e}function Mt(){return et}function jn(e){try{let t=globalThis.location?.href||"http://clipline.invalid/";return new URL(e,t).origin===new URL(t).origin}catch{return!1}}async function Jn(e,t){let a=await e.text();if(!t.includes("application/json"))return a;if(!a.trim())return null;try{return JSON.parse(a)}catch(n){if(e.ok)throw n;return null}}async function k(e,t={}){let a=(t.method||"GET").toUpperCase(),n=new Headers(t.headers||{});n.set("Accept","application/json");let o=t.body;o&&typeof o!="string"&&(n.set("Content-Type","application/json"),o=JSON.stringify(o)),jn(e)?!["GET","HEAD","OPTIONS"].includes(a)&&et&&n.set("X-CSRF-Token",et):n.delete("X-CSRF-Token");let i=await fetch(e,{...t,body:o,credentials:"same-origin",headers:n,method:a}),c=i.headers.get("content-type")||"",d=await Jn(i,c);if(!i.ok){i.status===401&&window.dispatchEvent(new CustomEvent("clipline:unauthorized"));let l=typeof d=="object"&&d?.error?d.error:i.statusText;throw new Te(l||"Request failed",i.status)}return d}var et,Te,le=Nn(()=>{et=null;Te=class extends Error{constructor(t,a){super(t),this.status=a}}});var Je,B,ea,zn,Ce,Jt,ta,aa,bt,qe,De,na,vt,gt,$t,Fn,We={},Ze=[],On=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,Qe=Array.isArray;function ge(e,t){for(var a in t)e[a]=t[a];return e}function yt(e){e&&e.parentNode&&e.parentNode.removeChild(e)}function wt(e,t,a){var n,o,s,i={};for(s in t)s=="key"?n=t[s]:s=="ref"?o=t[s]:i[s]=t[s];if(arguments.length>2&&(i.children=arguments.length>3?Je.call(arguments,2):a),typeof e=="function"&&e.defaultProps!=null)for(s in e.defaultProps)i[s]===void 0&&(i[s]=e.defaultProps[s]);return Ge(e,i,n,o,null)}function Ge(e,t,a,n,o){var s={type:e,props:t,key:a,ref:n,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:o??++ea,__i:-1,__u:0};return o==null&&B.vnode!=null&&B.vnode(s),s}function Ye(e){return e.children}function Ke(e,t){this.props=e,this.context=t}function Me(e,t){if(t==null)return e.__?Me(e.__,e.__i+1):null;for(var a;t<e.__k.length;t++)if((a=e.__k[t])!=null&&a.__e!=null)return a.__e;return typeof e.type=="function"?Me(e):null}function Vn(e){if(e.__P&&e.__d){var t=e.__v,a=t.__e,n=[],o=[],s=ge({},t);s.__v=t.__v+1,B.vnode&&B.vnode(s),kt(e.__P,s,t,e.__n,e.__P.namespaceURI,32&t.__u?[a]:null,n,a??Me(t),!!(32&t.__u),o),s.__v=t.__v,s.__.__k[s.__i]=s,la(n,s,o),t.__e=t.__=null,s.__e!=a&&oa(s)}}function oa(e){if((e=e.__)!=null&&e.__c!=null)return e.__e=e.__c.base=null,e.__k.some(function(t){if(t!=null&&t.__e!=null)return e.__e=e.__c.base=t.__e}),oa(e)}function Qt(e){(!e.__d&&(e.__d=!0)&&Ce.push(e)&&!je.__r++||Jt!=B.debounceRendering)&&((Jt=B.debounceRendering)||ta)(je)}function je(){try{for(var e,t=1;Ce.length;)Ce.length>t&&Ce.sort(aa),e=Ce.shift(),t=Ce.length,Vn(e)}finally{Ce.length=je.__r=0}}function sa(e,t,a,n,o,s,i,c,d,l,m){var h,u,f,b,w,P,R,S=n&&n.__k||Ze,D=t.length;for(d=Hn(a,t,S,d,D),h=0;h<D;h++)(f=a.__k[h])!=null&&(u=f.__i!=-1&&S[f.__i]||We,f.__i=h,P=kt(e,f,u,o,s,i,c,d,l,m),b=f.__e,f.ref&&u.ref!=f.ref&&(u.ref&&Ct(u.ref,null,f),m.push(f.ref,f.__c||b,f)),w==null&&b!=null&&(w=b),(R=!!(4&f.__u))||u.__k===f.__k?(d=ra(f,d,e,R),R&&u.__e&&(u.__e=null)):typeof f.type=="function"&&P!==void 0?d=P:b&&(d=b.nextSibling),f.__u&=-7);return a.__e=w,d}function Hn(e,t,a,n,o){var s,i,c,d,l,m=a.length,h=m,u=0;for(e.__k=new Array(o),s=0;s<o;s++)(i=t[s])!=null&&typeof i!="boolean"&&typeof i!="function"?(typeof i=="string"||typeof i=="number"||typeof i=="bigint"||i.constructor==String?i=e.__k[s]=Ge(null,i,null,null,null):Qe(i)?i=e.__k[s]=Ge(Ye,{children:i},null,null,null):i.constructor===void 0&&i.__b>0?i=e.__k[s]=Ge(i.type,i.props,i.key,i.ref?i.ref:null,i.__v):e.__k[s]=i,d=s+u,i.__=e,i.__b=e.__b+1,c=null,(l=i.__i=qn(i,a,d,h))!=-1&&(h--,(c=a[l])&&(c.__u|=2)),c==null||c.__v==null?(l==-1&&(o>m?u--:o<m&&u++),typeof i.type!="function"&&(i.__u|=4)):l!=d&&(l==d-1?u--:l==d+1?u++:(l>d?u--:u++,i.__u|=4))):e.__k[s]=null;if(h)for(s=0;s<m;s++)(c=a[s])!=null&&(2&c.__u)==0&&(c.__e==n&&(n=Me(c)),ua(c,c));return n}function ra(e,t,a,n){var o,s;if(typeof e.type=="function"){for(o=e.__k,s=0;o&&s<o.length;s++)o[s]&&(o[s].__=e,t=ra(o[s],t,a,n));return t}e.__e!=t&&(n&&(t&&e.type&&!t.parentNode&&(t=Me(e)),a.insertBefore(e.__e,t||null)),t=e.__e);do t=t&&t.nextSibling;while(t!=null&&t.nodeType==8);return t}function qn(e,t,a,n){var o,s,i,c=e.key,d=e.type,l=t[a],m=l!=null&&(2&l.__u)==0;if(l===null&&c==null||m&&c==l.key&&d==l.type)return a;if(n>(m?1:0)){for(o=a-1,s=a+1;o>=0||s<t.length;)if((l=t[i=o>=0?o--:s++])!=null&&(2&l.__u)==0&&c==l.key&&d==l.type)return i}return-1}function Yt(e,t,a){t[0]=="-"?e.setProperty(t,a??""):e[t]=a==null?"":typeof a!="number"||On.test(t)?a:a+"px"}function He(e,t,a,n,o){var s,i;e:if(t=="style")if(typeof a=="string")e.style.cssText=a;else{if(typeof n=="string"&&(e.style.cssText=n=""),n)for(t in n)a&&t in a||Yt(e.style,t,"");if(a)for(t in a)n&&a[t]==n[t]||Yt(e.style,t,a[t])}else if(t[0]=="o"&&t[1]=="n")s=t!=(t=t.replace(na,"$1")),i=t.toLowerCase(),t=i in e||t=="onFocusOut"||t=="onFocusIn"?i.slice(2):t.slice(2),e.l||(e.l={}),e.l[t+s]=a,a?n?a[De]=n[De]:(a[De]=vt,e.addEventListener(t,s?$t:gt,s)):e.removeEventListener(t,s?$t:gt,s);else{if(o=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=a??"";break e}catch{}typeof a=="function"||(a==null||a===!1&&t[4]!="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&a==1?"":a))}}function Xt(e){return function(t){if(this.l){var a=this.l[t.type+e];if(t[qe]==null)t[qe]=vt++;else if(t[qe]<a[De])return;return a(B.event?B.event(t):t)}}}function kt(e,t,a,n,o,s,i,c,d,l){var m,h,u,f,b,w,P,R,S,D,O,I,U,q,V,Y,A=t.type;if(t.constructor!==void 0)return null;128&a.__u&&(d=!!(32&a.__u),s=[c=t.__e=a.__e]),(m=B.__b)&&m(t);e:if(typeof A=="function"){h=i.length;try{if(S=t.props,D=A.prototype&&A.prototype.render,O=(m=A.contextType)&&n[m.__c],I=m?O?O.props.value:m.__:n,a.__c?R=(u=t.__c=a.__c).__=u.__E:(D?t.__c=u=new A(S,I):(t.__c=u=new Ke(S,I),u.constructor=A,u.render=Kn),O&&O.sub(u),u.state||(u.state={}),u.__n=n,f=u.__d=!0,u.__h=[],u._sb=[]),D&&u.__s==null&&(u.__s=u.state),D&&A.getDerivedStateFromProps!=null&&(u.__s==u.state&&(u.__s=ge({},u.__s)),ge(u.__s,A.getDerivedStateFromProps(S,u.__s))),b=u.props,w=u.state,u.__v=t,f)D&&A.getDerivedStateFromProps==null&&u.componentWillMount!=null&&u.componentWillMount(),D&&u.componentDidMount!=null&&u.__h.push(u.componentDidMount);else{if(D&&A.getDerivedStateFromProps==null&&S!==b&&u.componentWillReceiveProps!=null&&u.componentWillReceiveProps(S,I),t.__v==a.__v||!u.__e&&u.shouldComponentUpdate!=null&&u.shouldComponentUpdate(S,u.__s,I)===!1){t.__v!=a.__v&&(u.props=S,u.state=u.__s,u.__d=!1),t.__e=a.__e,t.__k=a.__k,t.__k.some(function(G){G&&(G.__=t)}),Ze.push.apply(u.__h,u._sb),u._sb=[],u.__h.length&&i.push(u);break e}u.componentWillUpdate!=null&&u.componentWillUpdate(S,u.__s,I),D&&u.componentDidUpdate!=null&&u.__h.push(function(){u.componentDidUpdate(b,w,P)})}if(u.context=I,u.props=S,u.__P=e,u.__e=!1,U=B.__r,q=0,D)u.state=u.__s,u.__d=!1,U&&U(t),m=u.render(u.props,u.state,u.context),Ze.push.apply(u.__h,u._sb),u._sb=[];else do u.__d=!1,U&&U(t),m=u.render(u.props,u.state,u.context),u.state=u.__s;while(u.__d&&++q<25);u.state=u.__s,u.getChildContext!=null&&(n=ge(ge({},n),u.getChildContext())),D&&!f&&u.getSnapshotBeforeUpdate!=null&&(P=u.getSnapshotBeforeUpdate(b,w)),V=m!=null&&m.type===Ye&&m.key==null?ca(m.props.children):m,c=sa(e,Qe(V)?V:[V],t,a,n,o,s,i,c,d,l),u.base=t.__e,t.__u&=-161,u.__h.length&&i.push(u),R&&(u.__E=u.__=null)}catch(G){if(i.length=h,t.__v=null,d||s!=null){if(G.then){for(t.__u|=d?160:128;c&&c.nodeType==8&&c.nextSibling;)c=c.nextSibling;s!=null&&(s[s.indexOf(c)]=null),t.__e=c}else if(s!=null)for(Y=s.length;Y--;)yt(s[Y])}else t.__e=a.__e;t.__k==null&&(t.__k=a.__k||[]),G.then||ia(t),B.__e(G,t,a)}}else s==null&&t.__v==a.__v?(t.__k=a.__k,t.__e=a.__e):c=t.__e=Gn(a.__e,t,a,n,o,s,i,d,l);return(m=B.diffed)&&m(t),128&t.__u?void 0:c}function ia(e){e&&(e.__c&&(e.__c.__e=!0),e.__k&&e.__k.some(ia))}function la(e,t,a){for(var n=0;n<a.length;n++)Ct(a[n],a[++n],a[++n]);B.__c&&B.__c(t,e),e.some(function(o){try{e=o.__h,o.__h=[],e.some(function(s){s.call(o)})}catch(s){B.__e(s,o.__v)}})}function ca(e){return typeof e!="object"||e==null||e.__b>0?e:Qe(e)?e.map(ca):e.constructor!==void 0?null:ge({},e)}function Gn(e,t,a,n,o,s,i,c,d){var l,m,h,u,f,b,w,P=a.props||We,R=t.props,S=t.type;if(S=="svg"?o="http://www.w3.org/2000/svg":S=="math"?o="http://www.w3.org/1998/Math/MathML":o||(o="http://www.w3.org/1999/xhtml"),s!=null){for(l=0;l<s.length;l++)if((f=s[l])&&"setAttribute"in f==!!S&&(S?f.localName==S:f.nodeType==3)){e=f,s[l]=null;break}}if(e==null){if(S==null)return document.createTextNode(R);e=document.createElementNS(o,S,R.is&&R),c&&(B.__m&&B.__m(t,s),c=!1),s=null}if(S==null)P===R||c&&e.data==R||(e.data=R);else{if(s=S=="textarea"&&R.defaultValue!=null?null:s&&Je.call(e.childNodes),!c&&s!=null)for(P={},l=0;l<e.attributes.length;l++)P[(f=e.attributes[l]).name]=f.value;for(l in P)f=P[l],l=="dangerouslySetInnerHTML"?h=f:l=="children"||l in R||l=="value"&&"defaultValue"in R||l=="checked"&&"defaultChecked"in R||He(e,l,null,f,o);for(l in R)f=R[l],l=="children"?u=f:l=="dangerouslySetInnerHTML"?m=f:l=="value"?b=f:l=="checked"?w=f:c&&typeof f!="function"||P[l]===f||He(e,l,f,P[l],o);if(m)c||h&&(m.__html==h.__html||m.__html==e.innerHTML)||(e.innerHTML=m.__html),t.__k=[];else if(h&&(e.innerHTML=""),sa(t.type=="template"?e.content:e,Qe(u)?u:[u],t,a,n,S=="foreignObject"?"http://www.w3.org/1999/xhtml":o,s,i,s?s[0]:a.__k&&Me(a,0),c,d),s!=null)for(l=s.length;l--;)yt(s[l]);c&&S!="textarea"||(l="value",S=="progress"&&b==null?e.removeAttribute("value"):b!=null&&(b!==e[l]||S=="progress"&&!b||S=="option"&&b!=P[l])&&He(e,l,b,P[l],o),l="checked",w!=null&&w!=e[l]&&He(e,l,w,P[l],o))}return e}function Ct(e,t,a){try{if(typeof e=="function"){var n=typeof e.__u=="function";n&&e.__u(),n&&t==null||(e.__u=e(t))}else e.current=t}catch(o){B.__e(o,a)}}function ua(e,t,a){var n,o;if(B.unmount&&B.unmount(e),(n=e.ref)&&(n.current&&n.current!=e.__e||Ct(n,null,t)),(n=e.__c)!=null){if(n.componentWillUnmount)try{n.componentWillUnmount()}catch(s){B.__e(s,t)}n.base=n.__P=n.__n=null}if(n=e.__k)for(o=0;o<n.length;o++)n[o]&&ua(n[o],t,a||typeof e.type!="function");a||yt(e.__e),e.__c=e.__=e.__e=void 0}function Kn(e,t,a){return this.constructor(e,a)}function da(e,t,a){var n,o,s,i;t==document&&(t=document.documentElement),B.__&&B.__(e,t),o=(n=typeof a=="function")?null:a&&a.__k||t.__k,s=[],i=[],kt(t,e=(!n&&a||t).__k=wt(Ye,null,[e]),o||We,We,t.namespaceURI,!n&&a?[a]:o?null:t.firstChild?Je.call(t.childNodes):null,s,!n&&a?a:o?o.__e:t.firstChild,n,i),la(s,e,i),e.props.children=null}Je=Ze.slice,B={__e:function(e,t,a,n){for(var o,s,i;t=t.__;)if((o=t.__c)&&!o.__)try{if((s=o.constructor)&&s.getDerivedStateFromError!=null&&(o.setState(s.getDerivedStateFromError(e)),i=o.__d),o.componentDidCatch!=null&&(o.componentDidCatch(e,n||{}),i=o.__d),i)return o.__E=o}catch(c){e=c}throw e}},ea=0,zn=function(e){return e!=null&&e.constructor===void 0},Ke.prototype.setState=function(e,t){var a;a=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=ge({},this.state),typeof e=="function"&&(e=e(ge({},a),this.props)),e&&ge(a,e),e!=null&&this.__v&&(t&&this._sb.push(t),Qt(this))},Ke.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),Qt(this))},Ke.prototype.render=Ye,Ce=[],ta=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,aa=function(e,t){return e.__v.__b-t.__v.__b},je.__r=0,bt=Math.random().toString(8),qe="__d"+bt,De="__a"+bt,na=/(PointerCapture)$|Capture$/i,vt=0,gt=Xt(!1),$t=Xt(!0),Fn=0;var Ie,K,St,pa,Ae=0,ya=[],Z=B,ma=Z.__b,fa=Z.__r,_a=Z.diffed,ha=Z.__c,ba=Z.unmount,ga=Z.__;function Tt(e,t){Z.__h&&Z.__h(K,e,Ae||t),Ae=0;var a=K.__H||(K.__H={__:[],__h:[]});return e>=a.__.length&&a.__.push({}),a.__[e]}function g(e){return Ae=1,Wn(Ca,e)}function Wn(e,t,a){var n=Tt(Ie++,2);if(n.t=e,!n.__c&&(n.__=[a?a(t):Ca(void 0,t),function(c){var d=n.__N?n.__N[0]:n.__[0],l=n.t(d,c);d!==l&&(n.__N=[l,n.__[1]],n.__c.setState({}))}],n.__c=K,!K.__f)){var o=function(c,d,l){if(!n.__c.__H)return!0;var m=!1,h=n.__c.props!==c;if(n.__c.__H.__.some(function(f){if(f.__N){m=!0;var b=f.__[0];f.__=f.__N,f.__N=void 0,b!==f.__[0]&&(h=!0)}}),s){var u=s.call(this,c,d,l);return m?u||h:u}return!m||h};K.__f=!0;var s=K.shouldComponentUpdate,i=K.componentWillUpdate;K.componentWillUpdate=function(c,d,l){if(this.__e){var m=s;s=void 0,o(c,d,l),s=m}i&&i.call(this,c,d,l)},K.shouldComponentUpdate=o}return n.__N||n.__}function E(e,t){var a=Tt(Ie++,3);!Z.__s&&ka(a.__H,t)&&(a.__=e,a.u=t,K.__H.__h.push(a))}function z(e){return Ae=5,Xe(function(){return{current:e}},[])}function Xe(e,t){var a=Tt(Ie++,7);return ka(a.__H,t)&&(a.__=e(),a.__H=t,a.__h=e),a.__}function Pt(e,t){return Ae=8,Xe(function(){return e},t)}function $a(){for(var e;e=ya.shift();){var t=e.__H;if(e.__P&&t)try{t.__h.some(xt),t.__h.some(wa),t.__h=[]}catch(a){t.__h=[],Z.__e(a,e.__v)}}}Z.__b=function(e){K=null,ma&&ma(e)},Z.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),ga&&ga(e,t)},Z.__r=function(e){fa&&fa(e),Ie=0;var t=(K=e.__c).__H;t&&(St===K?(t.__h=[],K.__h=[],t.__.some(function(a){a.__N&&(a.__=a.__N),a.u=a.__N=void 0})):(t.__h.length&&$a(),Ie=0)),St=K},Z.diffed=function(e){_a&&_a(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(ya.push(t)!==1&&pa===Z.requestAnimationFrame||((pa=Z.requestAnimationFrame)||Zn)($a)),t.__H.__.some(function(a){a.u&&(a.__H=a.u,a.u=void 0)})),St=K=null},Z.__c=function(e,t){t.some(function(a){try{a.__h.some(xt),a.__h=a.__h.filter(function(n){return!n.__||wa(n)})}catch(n){t.some(function(o){o.__h&&(o.__h=[])}),t=[],Z.__e(n,a.__v)}}),ha&&ha(e,t)},Z.unmount=function(e){ba&&ba(e);var t,a=e.__c;a&&a.__H&&(a.__H.__.some(function(n){try{xt(n)}catch(o){t=o}}),a.__H=void 0,t&&Z.__e(t,a.__v))};var va=typeof requestAnimationFrame=="function";function Zn(e){var t,a=function(){clearTimeout(n),va&&cancelAnimationFrame(t),setTimeout(e)},n=setTimeout(a,35);va&&(t=requestAnimationFrame(a))}function xt(e){var t=K,a=e.__c;typeof a=="function"&&(e.__c=void 0,a()),K=t}function wa(e){var t=K;e.__c=e.__(),K=t}function ka(e,t){return!e||e.length!==t.length||t.some(function(a,n){return a!==e[n]})}function Ca(e,t){return typeof t=="function"?t(e):t}var xa=function(e,t,a,n){var o;t[0]=0;for(var s=1;s<t.length;s++){var i=t[s++],c=t[s]?(t[0]|=i?1:2,a[t[s++]]):t[++s];i===3?n[0]=c:i===4?n[1]=Object.assign(n[1]||{},c):i===5?(n[1]=n[1]||{})[t[++s]]=c:i===6?n[1][t[++s]]+=c+"":i?(o=e.apply(c,xa(e,c,a,["",null])),n.push(o),c[0]?t[0]|=2:(t[s-2]=0,t[s]=o)):n.push(c)}return n},Sa=new Map;function Ta(e){var t=Sa.get(this);return t||(t=new Map,Sa.set(this,t)),(t=xa(this,t.get(e)||(t.set(e,t=(function(a){for(var n,o,s=1,i="",c="",d=[0],l=function(u){s===1&&(u||(i=i.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?d.push(0,u,i):s===3&&(u||i)?(d.push(3,u,i),s=2):s===2&&i==="..."&&u?d.push(4,u,0):s===2&&i&&!u?d.push(5,0,!0,i):s>=5&&((i||!u&&s===5)&&(d.push(s,0,i,o),s=6),u&&(d.push(s,u,0,o),s=6)),i=""},m=0;m<a.length;m++){m&&(s===1&&l(),l(m));for(var h=0;h<a[m].length;h++)n=a[m][h],s===1?n==="<"?(l(),d=[d],s=3):i+=n:s===4?i==="--"&&n===">"?(s=1,i=""):i=n+i[0]:c?n===c?c="":i+=n:n==='"'||n==="'"?c=n:n===">"?(l(),s=1):s&&(n==="="?(s=5,o=i,i=""):n==="/"&&(s<5||a[m][h+1]===">")?(l(),s===3&&(d=d[0]),s=d,(d=d[0]).push(2,0,s),s=0):n===" "||n==="	"||n===`
`||n==="\r"?(l(),s=2):i+=n),s===3&&i==="!--"&&(s=4,d=d[0])}return l(),d})(e)),t),arguments,[])).length>1?t:t[0]}var r=Ta.bind(wt);le();function Ma(e){let t=e,a=new Set;return{get:()=>t,set(n){t=n,a.forEach(o=>o(t))},update(n){this.set(n(t))},subscribe(n){return a.add(n),()=>a.delete(n)}}}function j(e){let[t,a]=g(e.get());return E(()=>e.subscribe(a),[e]),t}var N=Ma({user:null,csrfToken:null,ready:!1}),tt=Ma([]),Qn=0;function v(e,{actionLabel:t,onAction:a,timeoutMs:n=5e3}={}){let o=++Qn;return tt.update(s=>[...s,{id:o,message:e,actionLabel:t,onAction:a}]),n&&setTimeout(()=>at(o),n),o}function at(e){tt.update(t=>t.filter(a=>a.id!==e))}function Le(e){try{return decodeURIComponent(e)}catch{return e}}function Ra(e){let t=Number(e.get("page")||1);return{sort:e.get("sort")||"uploaded_at_desc",game:e.get("game")||"",q:e.get("q")||"",page:Number.isFinite(t)?Math.max(1,t):1}}var Yn=["login","resetPassword","public","publicLibrary","publicGame","publicUser","about","games"];function Rt(e){return Yn.includes(e)}function Ea(e,t){return!t&&!Rt(e)}var Xn={publicLibrary:"feed",publicGame:"feed",games:"games",library:"library",clip:"library",admin:"admin",profile:"profile"};function Et(e){return Xn[e?.name]||""}function Ua(e){return e?.name==="publicLibrary"&&e.surface==="search"?"search":Et(e)}function Ne(e,t){let a=new URLSearchParams(t||""),n=e;return n.startsWith("/c/")?{name:"public",shareId:Le(n.slice(3))}:n==="/"||n==="/public"||n==="/search"?{name:"publicLibrary",query:Ra(a),surface:n==="/search"?"search":"feed"}:n.startsWith("/game/")?{name:"publicGame",game:Le(n.slice(6)),query:Ra(a)}:n==="/about"?{name:"about"}:n==="/games"?{name:"games"}:n.startsWith("/u/")?{name:"publicUser",username:Le(n.slice(3))}:n==="/library"?{name:"library"}:n.startsWith("/clip/")?{name:"clip",clipId:Le(n.slice(6))}:n==="/admin/game-categories"?{name:"admin",tab:"categories"}:n.startsWith("/admin/game-categories/")?{name:"admin",tab:"categories",categoryId:Le(n.slice(23))}:n==="/admin"?{name:"admin",tab:a.get("tab")||"overview"}:n==="/account"?{name:"account"}:n==="/profile"?{name:"profile"}:n==="/login"?{name:"login"}:n==="/reset-password"?{name:"resetPassword",token:a.get("token")||"",invite:a.get("invite")==="1"}:{name:"publicLibrary"}}var Ut=new Set;function W(e){window.history.pushState({},"",e),Da()}function Da(){let{pathname:e,search:t}=window.location,a=Ne(e,t);Ut.forEach(n=>n(a))}typeof window<"u"&&window.addEventListener("popstate",Da);function Ia(){let[e,t]=g(()=>Ne(window.location.pathname,window.location.search));return E(()=>(Ut.add(t),()=>Ut.delete(t)),[]),e}function Aa(e){let t=e.target.closest("a[href^='/']");!t||t.target||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||(e.preventDefault(),W(t.getAttribute("href")))}var La={alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',arrowLeft:'<path d="m15 18-6-6 6-6"/><path d="M9 12h12"/>',clipboard:'<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',copy:'<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',external:'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',fastForward:'<path d="m13 19 9-7-9-7v14Z"/><path d="m2 19 9-7-9-7v14Z"/>',film:'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 8h4"/><path d="M3 16h4"/><path d="M17 8h4"/><path d="M17 16h4"/>',fullscreen:'<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/><path d="M12 2a15.3 15.3 0 0 0 0 20"/>',home:'<path d="m3 10 9-7 9 7"/><path d="M5 8.5V20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5"/><path d="M9 22V12h6v10"/>',info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',library:'<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',lock:'<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',logOut:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',menu:'<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',message:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>',notepad:'<path d="M8 2v4"/><path d="M16 2v4"/><path d="M3 10h18"/><path d="M6 4h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/><path d="M8 14h8"/><path d="M8 18h5"/>',pause:'<path d="M8 5v14"/><path d="M16 5v14"/>',play:'<path d="m8 5 11 7-11 7V5Z"/>',plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',check:'<path d="M20 6 9 17l-5-5"/>',refresh:'<path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/><path d="M3 12A9 9 0 0 1 18.5 5.7L21 8"/><path d="M21 3v5h-5"/>',rewind:'<path d="m11 19-9-7 9-7v14Z"/><path d="m22 19-9-7 9-7v14Z"/>',save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',server:'<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',skipBack:'<path d="M19 20 9 12l10-8v16Z"/><path d="M5 19V5"/>',skipForward:'<path d="m5 4 10 8-10 8V4Z"/><path d="M19 5v14"/>',shield:'<path d="M20 13c0 5-3.5 7.5-7.7 8.8a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V5l8-3 8 3v8Z"/>',sliders:'<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>',theater:'<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M6 9h12"/><path d="M6 15h12"/>',trash:'<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',volume2:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9 9 0 0 1 0 14"/>',volumeX:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>',x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'};function C(e,{size:t=18}={}){return r`<svg viewBox="0 0 24 24" width=${t} height=${t} fill="none"
    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" dangerouslySetInnerHTML=${{__html:La[e]||""}} />`}function Dt(e){if(!e||typeof e!="string")return"";if(e.startsWith("/"))return e;try{let t=new URL(e,window.location.origin);if(t.origin===window.location.origin)return`${t.pathname}${t.search}`}catch{return""}return""}function eo(e){let t=Dt(e?.avatar_url);if(!t)return"";let a=e.updated_at||"";if(!a)return t;let n=t.includes("?")?"&":"?";return`${t}${n}v=${encodeURIComponent(a)}`}function to(e){return(e||"C").trim().slice(0,1).toUpperCase()||"C"}function Se({user:e,size:t=40,className:a=""}){let n=eo(e),o=`width:${t}px;height:${t}px;font-size:${Math.round(t*.4)}px`;if(n)return r`<img class=${`user-avatar ${a}`} style=${o} src=${n} alt="" />`;let s=e?.display_name||e?.username;return r`<div class=${`user-avatar user-avatar-fallback ${a}`} style=${o} aria-hidden="true">
    ${to(s)}
  </div>`}function ao(e){return e?.query?.q||""}function no(e,t){let a=new URLSearchParams,n=String(t||"").trim(),o=e?.name==="publicGame"?e.game:e?.query?.game||"";n&&a.set("q",n),o&&a.set("game",o);let s=a.toString();return s?`/search?${s}`:"/search"}function Na({active:e,route:t}){let{user:a}=j(N),[n,o]=g(!1),s=z(null),i=ao(t),[c,d]=g(i);E(()=>{d(i)},[i]);let l=a?.role==="admin"||a?.role==="owner";E(()=>{if(!n)return;let u=b=>{s.current?.contains(b.target)||o(!1)},f=b=>{b.key==="Escape"&&o(!1)};return document.addEventListener("pointerdown",u),document.addEventListener("keydown",f),()=>{document.removeEventListener("pointerdown",u),document.removeEventListener("keydown",f)}},[n]);let m=[["feed","/","Feed"],["library","/library","Library",!!a],["games","/games","Games"],["admin","/admin","Admin",l]].filter(([,,,u])=>u!==!1),h=u=>{u.preventDefault();let f=new FormData(u.target).get("q")?.toString()||"";W(no(t,f))};return r`<header class="topbar">
    <a class="wordmark" href="/" aria-label="Clipline home">
      <img src="/clipline-icon.svg" alt="" width="24" height="24" />
      <span class="wordmark-text">CLIP<span class="wordmark-accent">LINE</span></span>
    </a>
    <nav class="topnav" aria-label="Primary">
      ${m.map(([u,f,b])=>r`
        <a class=${u===e?"topnav-on":""} href=${f}>${b}</a>`)}
    </nav>
    <form class="topsearch" role="search" onSubmit=${h}>
      <input class="input" name="q" value=${c} onInput=${u=>d(u.target.value)}
        placeholder="Search clips, games, players…" aria-label="Search" />
    </form>
    ${a?r`<div class="avatar-wrap" ref=${s}>
          <button class="avatar-btn" aria-haspopup="menu" aria-expanded=${n}
            onClick=${()=>o(!n)}>
            <${Se} user=${a} size=${28} />
          </button>
          ${n&&r`<div class="menu" role="menu" onClick=${()=>o(!1)}>
            <a role="menuitem" href="/profile">Profile</a>
            <a role="menuitem" href="/account">Account</a>
            ${l&&r`<a role="menuitem" href="/admin">Admin</a>`}
            <button role="menuitem" class="menu-danger" onClick=${oo}>Sign out</button>
          </div>`}
        </div>`:r`<a class="btn" href="/login">${C("lock",{size:14})} Sign in</a>`}
  </header>`}async function oo(){let{api:e,setCsrfToken:t}=await Promise.resolve().then(()=>(le(),Pa));try{await e("/api/v1/auth/logout",{method:"POST"})}catch{}t(null),N.set({user:null,csrfToken:null,ready:!0}),W("/login")}var so=[["feed","/","home","Feed",!0],["games","/games","globe","Games",!0],["library","/library","library","Library","auth"],["search","/search","search","Search",!0],["profile","/profile","user","Profile","auth"]];function ro(e){return so.filter(([,,,,t])=>t!=="auth"||!!e)}function Ba({active:e}){let{user:t}=j(N),a=ro(t);return r`<nav class="tabbar" aria-label="Primary">
    ${a.map(([n,o,s,i])=>r`
      <a class=${n===e?"tab-on":""} href=${o}>${C(s)}<span>${i}</span></a>`)}
  </nav>`}function za(){let e=j(tt);return r`<div class="toasts" role="status" aria-live="polite">
    ${e.map(t=>r`<div class="toast" key=${t.id}>
      <span>${t.message}</span>
      ${t.actionLabel&&r`<button class="toast-action"
        onClick=${()=>{t.onAction?.(),at(t.id)}}>${t.actionLabel}</button>`}
      <button class="toast-x" aria-label="Dismiss" onClick=${()=>at(t.id)}>✕</button>
    </div>`)}
  </div>`}le();function Be(e,t,a=null){let n=e!=null,[o,s]=g(()=>({key:e,data:a,error:null,loading:n}));E(()=>{if(!n){s({key:e,data:a,error:null,loading:!1});return}let c=new AbortController;return s({key:e,data:a,error:null,loading:!0}),Promise.resolve().then(()=>t(c.signal)).then(d=>{s(l=>l.key===e?{key:e,data:d,error:null,loading:!1}:l)}).catch(d=>{d?.name!=="AbortError"&&s(l=>l.key===e?{key:e,data:a,error:d,loading:!1}:l)}),()=>c.abort()},[e,t]);let i=Pt(c=>{s(d=>{if(d.key!==e)return d;let l=typeof c=="function"?c(d.data):c;return{...d,data:l}})},[e]);return o.key!==e?{data:a,error:null,loading:n,setData:i}:{data:o.data,error:o.error,loading:o.loading,setData:i}}function ie(e,t=0,a=null){let n=Pt(o=>k(e,{signal:o}),[e]);return Be(`${e}\0${t}`,n,a)}function J(e){if(!e)return"Unknown";let t=new Date(e);return Number.isNaN(t.getTime())?"Unknown":new Intl.DateTimeFormat(void 0,{dateStyle:"medium",timeStyle:"short"}).format(t)}function ve(e){if(e==null)return"Unknown";let t=Math.max(0,Math.round(Number(e)/1e3)),a=Math.floor(t/60),n=t%60;return`${a}:${String(n).padStart(2,"0")}`}function nt(e){if(!e)return"Unknown";let t=new Date(e);if(Number.isNaN(t.getTime()))return"Unknown";let a=Math.min(0,t.getTime()-Date.now()),n=[["year",365*24*60*60*1e3],["month",720*60*60*1e3],["week",10080*60*1e3],["day",1440*60*1e3],["hour",3600*1e3],["minute",60*1e3],["second",1e3]],[o,s]=n.find(([,c])=>Math.abs(a)>=c)||n[n.length-1],i=Math.round(a/s);return new Intl.RelativeTimeFormat(void 0,{numeric:"always"}).format(i,o)}function F(e){if(e==null)return"Unknown";let t=Number(e);if(!Number.isFinite(t))return"Unknown";let a=["B","KiB","MiB","GiB","TiB"],n=t,o=0;for(;n>=1024&&o<a.length-1;)n/=1024,o+=1;return`${n.toFixed(o===0?0:1)} ${a[o]}`}function Pe(e){let t=Number(e||0),a=Number.isFinite(t)&&t>0?Math.floor(t):0;return`${new Intl.NumberFormat(void 0,{notation:a>=1e4?"compact":"standard"}).format(a)} view${a===1?"":"s"}`}function ye(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/thumbnail`}function It(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/thumbnail`}function ot(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/media`}function Fa(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/poster`}function st(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/poster`}function Re(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/media`}function ze(e,t,a){if(e)try{return`${t}${new URL(e).pathname}`}catch{}return a?`${t}/c/${encodeURIComponent(a)}`:null}var rt=null;function Oa(e){rt?.(),rt=e}function Va(e){rt===e&&(rt=null)}var io=()=>window.matchMedia("(pointer: fine)").matches&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches&&!navigator.connection?.saveData;function Ha({src:e,poster:t,alt:a=""}){let[n,o]=g(!1),[s,i]=g(0),c=z(null),d=z(null),l=z(!0),m=z(),h=()=>{l.current&&(clearTimeout(c.current),o(!1),i(0))};m.current=h;let u=()=>{!e||!io()||(c.current=setTimeout(()=>{l.current&&(Oa(m.current),o(!0))},300))},f=b=>{let w=b.target;w.duration&&i(w.currentTime/w.duration)};return E(()=>()=>{l.current=!1,clearTimeout(c.current),Va(m.current)},[]),r`<span class="hover-preview" onPointerEnter=${u} onPointerLeave=${h}>
    ${n?r`<video ref=${d} src=${e} poster=${t} muted loop autoplay
          playsinline preload="none" onTimeUpdate=${f} />`:r`<img src=${t} alt=${a} loading="lazy" />`}
    ${n&&r`<span class="preview-scrub"><span style=${`width:${s*100}%`} /></span>`}
  </span>`}function At(e){return e.owner?.display_name||e.owner?.username||e.owner_username||e.author_name||e.author_username||null}function Ee({clip:e,href:t,selectable:a=!1,selected:n=!1,onToggleSelect:o,showVisibility:s=!1,showAuthor:i=!1}){let c=At(e),d=[e.game_name&&r`<em>${e.game_display_name||e.game_name}</em>`,i&&c,e.view_count!=null&&Pe(e.view_count),e.uploaded_at&&nt(e.uploaded_at)].filter(Boolean);return r`<article class=${`clip-card ${n?"is-selected":""} ${a?"is-selectable":""}`}>
    <a class="card-thumb" href=${t} tabindex="-1" aria-hidden="true">
      <${Ha} src=${e.media_url} poster=${e.thumbnail_url} />
      ${e.duration_ms!=null&&r`<span class="dur-pill">${ve(e.duration_ms)}</span>`}
      ${s&&r`<span class=${`badge badge-${e.visibility} card-vis`}>${e.visibility}</span>`}
    </a>
    ${a&&r`<label class="card-check">
      <input type="checkbox" checked=${n} aria-label=${`Select ${e.title}`}
        onChange=${()=>o?.(e.id)} />
    </label>`}
    <h3 class="card-title"><a href=${t}>${e.title}</a></h3>
    <p class="card-meta">${d.map((l,m)=>r`${m>0&&" \xB7 "}${l}`)}</p>
  </article>`}function Q({name:e="film",title:t,body:a,action:n}){return r`<div class="empty">
    <div class="empty-icon">${C(e,{size:28})}</div>
    <h3>${t}</h3>
    ${a&&r`<p>${a}</p>`}
    ${n}
  </div>`}var lo=[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]],co=6,uo=60,po=/^[0-9A-HJKMNP-TV-Z]{26}$/i;function mo(e){return po.test(String(e||"").trim())}function fo(e){let t=new URLSearchParams;return t.set("page_size",String(uo)),e.sort!=="uploaded_at_desc"&&t.set("sort",e.sort),e.game&&t.set(mo(e.game)?"game_category_id":"game",e.game),e.q&&t.set("q",e.q),Number(e.page)>1&&t.set("page",String(e.page)),t}function qa(e){return e?.game_display_name||e?.game_name||"No game"}function _o(e,t,a=co){let n=[...e||[]].sort((h,u)=>(u.clip_count||0)-(h.clip_count||0)),o=n.slice(0,a),s=String(t||"").trim(),i=s&&o.some(h=>h.category_id===s),c=s&&!i?n.find(h=>h.category_id===s)||{category_id:s,clip_count:0}:null,d=c?[c,...o]:o,l=new Set(d.map(h=>h.category_id)),m=n.filter(h=>!l.has(h.category_id)).length;return{chips:d,extraGameCount:m}}function Nt({route:e}){let t={sort:"uploaded_at_desc",page:1,q:"",...e.query,game:e.name==="publicGame"?e.game:e.query?.game||""},a=`/api/v1/public/clips?${fo(t)}`,{data:n,error:o}=ie(a),{data:s}=ie("/api/v1/public/games",0,{games:[]}),i=s?.games||[],c=f=>W(go({...t,page:1,...f}));if(o)return r`<main class="page">
      <${Q} name="alert" title="Couldn't load the feed" body=${o.message} />
    </main>`;let d=n?.clips,l=!!(t.game||t.q)||Number(t.page)>1,m=!l,{chips:h,extraGameCount:u}=_o(i,t.game);return r`<main class="page">
    ${d==null?r`<${bo} />`:d.length===0?r`<${Q} name="film"
          title=${l?"No clips match this filter":"No public clips yet"}
          body=${l?"Try a different game, search, or clear your filters.":"Clips shared as public from a library will show up here."}
          action=${l&&r`<a class="btn" href="/">Clear filters</a>`} />`:r`
        ${m?ho(d):""}
        <div class="feed-toolbar">
          <h2>Latest uploads</h2>
          <select class="input" value=${t.sort} onChange=${f=>c({sort:f.target.value})}>
            ${lo.map(([f,b])=>r`<option value=${f}>${b}</option>`)}
          </select>
          <div class="chips">
            <button class=${`chip ${t.game?"":"chip-on"}`} onClick=${()=>c({game:""})}>All</button>
            ${h.map(f=>r`<button
              class=${`chip ${t.game===f.category_id?"chip-on":""}`}
              onClick=${()=>c({game:f.category_id})}>${f.display_name}</button>`)}
            ${u>0&&r`<a class="chip" href="/games">+${u}</a>`}
          </div>
        </div>
        <div class="card-grid">
          ${(m?d.slice(4):d).map(f=>r`<${Ee} clip=${{...f,thumbnail_url:ye(f),media_url:Re(f)}}
              href=${Lt(f)} showAuthor />`)}
        </div>
        ${$o(n,t,c)}
      `}
  </main>`}function ho(e){let[t,...a]=e,n=a.slice(0,3);return r`<p class="kicker">Now playing on this server</p>
    <section class="hero">
      <a class="hero-main" href=${Lt(t)}>
        <img src=${st(t)} alt="" loading="lazy" />
        <span class="hero-caption">▶ ${t.title} — ${qa(t)} · ${ve(t.duration_ms)}</span>
      </a>
      <div class="hero-side">
        ${n.map(o=>r`<a class="hero-row" href=${Lt(o)}>
            <span class="hero-thumb">
              <img src=${ye(o)} alt="" loading="lazy" />
              <span class="dur-pill">${ve(o.duration_ms)}</span>
            </span>
            <span class="hero-copy"><b>${o.title}</b>
              <small>${At(o)} · ${qa(o)} · ${Pe(o.view_count)}</small></span>
          </a>`)}
      </div>
    </section>`}function bo({count:e=8}){return r`<div class="card-grid">
    ${Array.from({length:e},(t,a)=>r`<div class="clip-card" key=${a}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`}function Lt(e){return`/c/${encodeURIComponent(e.share_id)}`}function go({sort:e="uploaded_at_desc",game:t="",q:a="",page:n=1}={}){let o=new URLSearchParams,s=e||"uploaded_at_desc",i=String(t||"").trim(),c=String(a||"").trim(),d=Math.max(1,Number(n||1));if(s!=="uploaded_at_desc"&&o.set("sort",s),d>1&&o.set("page",String(d)),c)return o.set("q",c),i&&o.set("game",i),`/search?${o.toString()}`;if(i){let m=o.toString();return`/game/${encodeURIComponent(i)}${m?`?${m}`:""}`}let l=o.toString();return l?`/search?${l}`:"/"}function $o(e,t,a){let n=Math.max(1,Number(t.page||1)),o=!!e?.has_more;return n<=1&&!o?"":r`<nav class="pager" aria-label="Public clip pages">
    <button class="btn" type="button" disabled=${n<=1}
      onClick=${()=>a({page:n-1})}>Previous</button>
    <span class="muted">Page ${n}</span>
    <button class="btn" type="button" disabled=${!o}
      onClick=${()=>a({page:n+1})}>Next</button>
  </nav>`}function Ga(){let{data:e,error:t}=ie("/api/v1/public/games"),a=e?.games??null;return t?r`<main class="page">
      <${Q} name="alert" title="Couldn't load games" body=${t.message} />
    </main>`:r`<main class="page">
    <p class="kicker">Browse by game</p>
    ${a==null?r`<div class="game-grid">
          ${Array.from({length:6},(n,o)=>r`<div class="game-tile is-loading" key=${o}>
            <div class="skeleton-thumb"></div>
          </div>`)}
        </div>`:a.length===0?r`<${Q} name="film" title="No games yet"
          body="Once clips are shared as public, their games will show up here." />`:r`<div class="game-grid">
          ${a.map(n=>r`<a class="game-tile" href=${`/game/${encodeURIComponent(n.category_id)}`}>
            ${n.thumbnail_url?r`<img src=${n.thumbnail_url} alt="" loading="lazy" />`:r`<div class="game-tile-fallback">${(n.display_name||"?")[0].toUpperCase()}</div>`}
            <div class="game-tile-body">
              <b>${n.display_name}</b>
              <small>${n.clip_count} clip${n.clip_count===1?"":"s"}</small>
            </div>
          </a>`)}
        </div>`}
  </main>`}le();function Ka({trigger:e,content:t,onClose:a,label:n,panelClass:o=""}){let[s,i]=g(!1),c=z(null),d=z(null),l=z(null),m=()=>{i(!1),a?.()},h=()=>{if(s){m();return}l.current=document.activeElement,i(!0)};return E(()=>{if(!s)return;let u=w=>{c.current?.contains(w.target)||m()},f=w=>{w.key==="Escape"&&m()};return document.addEventListener("pointerdown",u),document.addEventListener("keydown",f),d.current?.querySelector("input, select, textarea, button, a[href], [tabindex]")?.focus(),()=>{document.removeEventListener("pointerdown",u),document.removeEventListener("keydown",f),l.current?.focus?.()}},[s]),r`<div class="popover-wrap" ref=${c}>
    ${e({open:s,toggle:h})}
    ${s&&r`<div class=${`popover ${o}`} ref=${d} role="dialog" aria-label=${n||"Filters"}>
      ${t}
    </div>`}
  </div>`}function Wa({count:e,busy:t=!1,onPublic:a,onPrivate:n,onCopyLinks:o,onDelete:s,onClear:i}){return e?r`<div class="bulkbar" role="toolbar" aria-label="Bulk actions" aria-busy=${t?"true":"false"}>
    <b>${e} selected</b>
    <button class="btn" disabled=${t} onClick=${a}>Make public</button>
    <button class="btn" disabled=${t} onClick=${n}>Make private</button>
    <button class="btn" disabled=${t} onClick=${o}>Copy links</button>
    <button class="btn btn-danger" disabled=${t} onClick=${s}>Delete</button>
    <button class="btn bulk-x" disabled=${t} aria-label="Clear selection" onClick=${i}>✕</button>
  </div>`:null}function pe({open:e,title:t,body:a,confirmLabel:n="Confirm",onConfirm:o,onCancel:s,danger:i=!1,confirmDisabled:c=!1}){let d=z(null),l=z(null);return E(()=>{let m=d.current;m&&(e&&!m.open?(m.showModal(),l.current?.focus()):!e&&m.open&&m.close())},[e]),r`<dialog ref=${d} class="confirm-dialog" aria-labelledby="confirm-dialog-title"
    onCancel=${m=>{m.preventDefault(),s?.()}}
    onClose=${()=>e&&s?.()}>
    ${e&&r`<div class="confirm-dialog-body">
      <h2 id="confirm-dialog-title">${t}</h2>
      ${a&&r`<p>${a}</p>`}
      <div class="confirm-dialog-actions">
        <button type="button" class="btn" onClick=${s}>Cancel</button>
        <button type="button" ref=${l} class=${`btn ${i?"btn-danger":"btn-primary"}`}
          disabled=${c} onClick=${o}>${n}</button>
      </div>
    </div>`}
  </dialog>`}var Ja="clipline.libraryView",vo=[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["updated_at_desc","Updated newest"],["updated_at_asc","Updated oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["size_desc","Size largest"],["size_asc","Size smallest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]],it={title:["title_asc","title_desc"],size:["size_asc","size_desc"],duration:["duration_asc","duration_desc"],uploaded:["uploaded_at_asc","uploaded_at_desc"]},yo=["visibility","status","source_type","from","to","min_duration_seconds","max_duration_seconds","min_size_mib","max_size_mib"],ut={sort:"uploaded_at_desc",page:1,game:"",source_type:"",visibility:"",status:"",q:"",from:"",to:"",min_duration_seconds:"",max_duration_seconds:"",min_size_mib:"",max_size_mib:""};function lt(e){if(e===""||e==null)return null;let t=Number(e);return Number.isFinite(t)?t:null}function wo(e){let t=new URLSearchParams;t.set("sort",e.sort||ut.sort),t.set("page_size","100"),t.set("page",String(Math.max(1,Number(e.page||1)))),e.game&&t.set("game_category_id",e.game);for(let i of["source_type","visibility","status","q"])e[i]&&t.set(i,e[i]);e.from&&t.set("from",`${e.from}T00:00:00Z`),e.to&&t.set("to",`${e.to}T23:59:59Z`);let a=lt(e.min_duration_seconds);a!=null&&t.set("min_duration_ms",String(Math.round(a*1e3)));let n=lt(e.max_duration_seconds);n!=null&&t.set("max_duration_ms",String(Math.round(n*1e3)));let o=lt(e.min_size_mib);o!=null&&t.set("min_size_bytes",String(Math.round(o*1024*1024)));let s=lt(e.max_size_mib);return s!=null&&t.set("max_size_bytes",String(Math.round(s*1024*1024))),t}function ko(e){return yo.reduce((t,a)=>t+(e[a]?1:0),0)}function Co(e,t=6){let a=new Map;for(let n of e){let o=n.game_category_id||n.game_name;if(!o)continue;let s=a.get(o)||{count:0,label:n.game_display_name||o,iconUrl:n.game_icon_url||null};s.count+=1,!s.iconUrl&&n.game_icon_url&&(s.iconUrl=n.game_icon_url),a.set(o,s)}return Array.from(a,([n,o])=>({game:n,count:o.count,label:o.label,...o.iconUrl?{icon_url:o.iconUrl}:{}})).sort((n,o)=>o.count-n.count||n.label.localeCompare(o.label)).slice(0,t)}function Za(e,t,{verb:a,allFailedMessage:n}){let o=e.filter(i=>!t.some(c=>c.id===i));if(!t.length)return{succeeded:o,message:null};let s=t.length===e.length?t[0]?.message||n:`Couldn't ${a} ${t.length} of ${e.length} clips.`;return{succeeded:o,message:s}}function So(e,t){return(e||[]).map(a=>ze(a.public_url,t,a.public_share_id)).filter(Boolean)}async function ja(e,t,a){let n=0;async function o(){let s=n++;if(!(s>=e.length))return await a(e[s]),o()}await Promise.all(Array.from({length:Math.min(t,e.length)},o))}function xo(){try{return localStorage.getItem(Ja)==="rows"?"rows":"grid"}catch{return"grid"}}function Qa(){let[e,t]=g(xo),[a,n]=g(ut),[o,s]=g(ut.q),[i,c]=g(new Set),[d,l]=g(!1),[m,h]=g(!1),[u,f]=g(0),b=`/api/v1/clips?${wo(a)}`,{data:w,error:P,setData:R}=ie(b,u),S=z(!1),D=z(null);E(()=>()=>clearTimeout(D.current),[]),E(()=>c(new Set),[b,u]);let O=p=>{t(p);try{localStorage.setItem(Ja,p)}catch{}},I=()=>f(p=>p+1),U=p=>{S.current=p,l(p)},q=p=>{let $=p.target.value;s($),clearTimeout(D.current),D.current=setTimeout(()=>{n(M=>({...M,q:$,page:1}))},300)},V=p=>$=>{let M=$.target.value;n(L=>({...L,[p]:M,page:1}))},Y=()=>{n(p=>({...p,page:1,visibility:"",status:"",source_type:"",from:"",to:"",min_duration_seconds:"",max_duration_seconds:"",min_size_mib:"",max_size_mib:""}))},A=p=>n($=>({...$,game:$.game===p?"":p,page:1})),G=p=>n($=>({...$,sort:p,page:1})),_e=p=>n($=>({...$,page:Math.max(1,p)})),me=p=>{c($=>{let M=new Set($);return M.has(p)?M.delete(p):M.add(p),M})};function oe(p,$){R(M=>M&&{...M,clips:M.clips.map(L=>L.id===p?{...L,...$}:L)})}function we(p,$){let M=new Set(p);R(L=>L&&{...L,clips:L.clips.map(_=>M.has(_.id)?{..._,...$}:_)})}async function ee(p){if(S.current)return;let $=Array.from(i);if(!$.length)return;let M=w?.clips||[],L=new Map($.map(T=>[T,M.find(re=>re.id===T)]));U(!0),we($,{visibility:p});let _=[],x=new Map;try{await ja($,4,async he=>{try{let de=await k(`/api/v1/clips/${encodeURIComponent(he)}/visibility`,{method:"POST",body:{visibility:p}}),Ue={visibility:de.visibility,public_url:de.public_url,public_share_id:de.public_share_id};oe(he,Ue),x.set(he,Ue)}catch(de){_.push({id:he,message:de.message})}});let{succeeded:T,message:re}=Za($,_,{verb:"update",allFailedMessage:"Couldn't update visibility."});if(re){for(let{id:he}of _){let de=L.get(he);de&&oe(he,{visibility:de.visibility,public_url:de.public_url,public_share_id:de.public_share_id})}v(re)}T.length&&(c(new Set),v(`Made ${T.length} clip${T.length===1?"":"s"} ${p}`,{actionLabel:"Undo",onAction:()=>X(T,L,x)}))}finally{U(!1)}}async function X(p,$,M){if(S.current){v("Wait for visibility changes to finish.");return}U(!0);try{for(let x of p){let T=$.get(x);T&&oe(x,{visibility:T.visibility,public_url:T.public_url,public_share_id:T.public_share_id})}let L=[];await ja(p,4,async x=>{let T=$.get(x);if(T)try{let re=await k(`/api/v1/clips/${encodeURIComponent(x)}/visibility`,{method:"POST",body:{visibility:T.visibility}});oe(x,{visibility:re.visibility,public_url:re.public_url,public_share_id:re.public_share_id})}catch(re){L.push({id:x,message:re.message})}});let{message:_}=Za(p,L,{verb:"undo",allFailedMessage:"Couldn't undo visibility change."});if(_){for(let{id:x}of L){let T=M.get(x);T&&oe(x,T)}v(_)}}finally{U(!1)}}async function ce(){if(S.current){v("Wait for visibility changes to finish.");return}let p=Array.from(i),$=w?.clips||[],M=p.map(x=>$.find(T=>T.id===x)).filter(Boolean),L=So(M,window.location.origin),_=M.length-L.length;if(!L.length){v("No links to copy \u2014 selected clips are private.");return}try{await navigator.clipboard.writeText(L.join(`
`)),v(`Copied ${L.length} link${L.length===1?"":"s"}`+(_?` (${_} skipped, private)`:""))}catch{v("Couldn't copy links to clipboard.")}}async function ue(){let p=Array.from(i);h(!1);try{let $=await k("/api/v1/clips/bulk-delete",{method:"POST",body:{ids:p}});c(new Set),I(),v(`Deleted ${$.affected} clip${$.affected===1?"":"s"}.`)}catch($){v($.message)}}if(P)return r`<main class="page">
      <${Q} name="alert" title="Couldn't load your library" body=${P.message} />
    </main>`;let te=w?.clips,ae=ko(a),ke=!!(a.q||a.game)||ae>0,se=Co(te||[]),be=Number(w?.total??(te||[]).length),xe=Number(w?.total_size_bytes??(te||[]).reduce((p,$)=>p+($.file_size_bytes||0),0)),fe=Number(w?.page||a.page||1),y=fe>1||!!w?.has_more,H=r`<div class="popover-fields">
    <label class="field"><span>Visibility</span>
      <select class="input" value=${a.visibility} onChange=${V("visibility")}>
        <option value="">Any</option>
        <option value="private">Private</option>
        <option value="public">Public</option>
        <option value="unlisted">Unlisted</option>
      </select>
    </label>
    <label class="field"><span>Status</span>
      <select class="input" value=${a.status} onChange=${V("status")}>
        <option value="">Any</option>
        <option value="created">Created</option>
        <option value="uploading">Uploading</option>
        <option value="processing">Processing</option>
        <option value="ready">Ready</option>
        <option value="failed">Failed</option>
      </select>
    </label>
    <label class="field"><span>Source</span>
      <input class="input" type="text" value=${a.source_type} onInput=${V("source_type")} placeholder="Source type" />
    </label>
    <label class="field"><span>From</span>
      <input class="input" type="date" value=${a.from} onInput=${V("from")} />
    </label>
    <label class="field"><span>To</span>
      <input class="input" type="date" value=${a.to} onInput=${V("to")} />
    </label>
    <label class="field"><span>Min duration (s)</span>
      <input class="input" type="number" min="0" value=${a.min_duration_seconds} onInput=${V("min_duration_seconds")} />
    </label>
    <label class="field"><span>Max duration (s)</span>
      <input class="input" type="number" min="0" value=${a.max_duration_seconds} onInput=${V("max_duration_seconds")} />
    </label>
    <label class="field"><span>Min size (MiB)</span>
      <input class="input" type="number" min="0" step="0.1" value=${a.min_size_mib} onInput=${V("min_size_mib")} />
    </label>
    <label class="field"><span>Max size (MiB)</span>
      <input class="input" type="number" min="0" step="0.1" value=${a.max_size_mib} onInput=${V("max_size_mib")} />
    </label>
    <div class="popover-actions">
      <button type="button" class="btn" onClick=${Y}>Clear filters</button>
    </div>
  </div>`;return r`<main class="page">
    <div class="lib-header">
      <div>
        <h1>Library</h1>
        <p>${be} clip${be===1?"":"s"} · ${F(xe)} used</p>
      </div>
      <div class="seg" role="group" aria-label="View">
        <button type="button" class=${`seg-item ${e==="grid"?"seg-on":""}`}
          aria-pressed=${e==="grid"} onClick=${()=>O("grid")}>Grid</button>
        <button type="button" class=${`seg-item ${e==="rows"?"seg-on":""}`}
          aria-pressed=${e==="rows"} onClick=${()=>O("rows")}>Rows</button>
      </div>
    </div>

    <div class="lib-toolbar">
      <input class="input" type="search" aria-label="Search clips" placeholder="Search title or game"
        value=${o} onInput=${q} />
      <select class="input" aria-label="Sort" value=${a.sort} onChange=${p=>G(p.target.value)}>
        ${vo.map(([p,$])=>r`<option value=${p}>${$}</option>`)}
      </select>
      <${Ka}
        label="Filters"
        panelClass="popover-filters"
        trigger=${({open:p,toggle:$})=>r`<button type="button" class="btn" aria-haspopup="dialog"
          aria-expanded=${p} onClick=${$}>
          ${C("sliders",{size:14})} Filters
          ${ae>0&&r`<span class="filter-badge">${ae}</span>`}
        </button>`}
        content=${H} />
    </div>

    ${se.length>0&&r`<div class="lib-chips">
      <button type="button" class=${`chip ${a.game?"":"chip-on"}`} aria-pressed=${!a.game}
        onClick=${()=>A("")}>All</button>
      ${se.map(p=>r`<button type="button" class=${`chip game-filter-chip ${p.icon_url?"has-icon":""} ${a.game===p.game?"chip-on":""}`}
        aria-label=${`Filter by ${p.label}`} title=${p.label}
        aria-pressed=${a.game===p.game} onClick=${()=>A(p.game)}>
        ${p.icon_url?r`<img src=${p.icon_url} alt="" loading="lazy" />`:p.label}
      </button>`)}
    </div>`}

    ${te==null?r`<${Po} />`:te.length===0?ke?r`<${Q} name="film" title="No clips match this view"
            body="Try a different search, game, or clear your filters."
            action=${r`<button type="button" class="btn" onClick=${()=>{n(ut),s("")}}>Clear filters</button>`} />`:r`<${Q} name="upload" title="Connect the Clipline desktop app to start uploading"
            body="New clips uploaded from the desktop app will show up here."
            action=${r`<a class="btn" href="/about">Learn more</a>`} />`:e==="grid"?r`<div class=${`card-grid ${i.size>0?"selecting":""}`}>
          ${te.map(p=>r`<${Ee} key=${p.id}
            clip=${{...p,thumbnail_url:It(p),media_url:ot(p)}}
            href=${`/clip/${encodeURIComponent(p.id)}`}
            selectable selected=${i.has(p.id)} onToggleSelect=${me} showVisibility />`)}
        </div>`:r`<${To} clips=${te} query=${a} onSort=${G}
          selected=${i} onToggleSelect=${me} />`}

    ${y&&r`<nav class="pager" aria-label="Library pages">
      <button type="button" class="btn" disabled=${fe<=1}
        onClick=${()=>_e(fe-1)}>Previous</button>
      <span>Page ${fe}</span>
      <button type="button" class="btn" disabled=${!w?.has_more}
        onClick=${()=>_e(fe+1)}>Next</button>
    </nav>`}

    <${Wa} count=${i.size} busy=${d}
      onPublic=${()=>ee("public")}
      onPrivate=${()=>ee("private")}
      onCopyLinks=${ce}
      onDelete=${()=>h(!0)}
      onClear=${()=>c(new Set)} />

    <${pe} open=${m}
      title=${`Delete ${i.size} clip${i.size===1?"":"s"}?`}
      body="Public links stop working immediately."
      confirmLabel="Delete" danger
      onConfirm=${ue}
      onCancel=${()=>h(!1)} />
  </main>`}function ct(e,[t,a]){let n=e.sort===t?"ascending":e.sort===a?"descending":"none",o=e.sort===a?t:a;return{ariaSort:n,next:o}}function To({clips:e,query:t,onSort:a,selected:n,onToggleSelect:o}){let s=ct(t,it.title),i=ct(t,it.size),c=ct(t,it.duration),d=ct(t,it.uploaded);return r`<table class="lib-table">
    <thead>
      <tr>
        <th class="row-select-cell"></th>
        <th></th>
        <th aria-sort=${s.ariaSort}><button type="button" class="sort-btn" onClick=${()=>a(s.next)}>Title</button></th>
        <th>Game</th>
        <th>Visibility</th>
        <th aria-sort=${i.ariaSort}><button type="button" class="sort-btn" onClick=${()=>a(i.next)}>Size</button></th>
        <th aria-sort=${c.ariaSort}><button type="button" class="sort-btn" onClick=${()=>a(c.next)}>Duration</button></th>
        <th aria-sort=${d.ariaSort}><button type="button" class="sort-btn" onClick=${()=>a(d.next)}>Uploaded</button></th>
      </tr>
    </thead>
    <tbody>
      ${e.map(l=>r`<tr key=${l.id} class=${n?.has(l.id)?"is-selected":""}>
        <td class="row-select-cell">
          <input class="row-select" type="checkbox" checked=${n?.has(l.id)}
            aria-label=${`Select ${l.title}`} onChange=${()=>o?.(l.id)} />
        </td>
        <td><img class="row-thumb" src=${It(l)} alt="" width="64" height="36" loading="lazy" /></td>
        <td><a href=${`/clip/${encodeURIComponent(l.id)}`}>${l.title}</a></td>
        <td>${l.game_display_name||l.game_name||"\u2014"}</td>
        <td><span class=${`badge badge-${l.visibility}`}>${l.visibility}</span></td>
        <td>${F(l.file_size_bytes)}</td>
        <td>${ve(l.duration_ms)}</td>
        <td>${J(l.uploaded_at)}</td>
      </tr>`)}
    </tbody>
  </table>`}function Po({count:e=8}){return r`<div class="card-grid">
    ${Array.from({length:e},(t,a)=>r`<div class="clip-card" key=${a}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`}le();function Xa(e){let t=Number(e);return Number.isFinite(t)&&t>0?t/1e3:0}function en(e,t){let a=Number.isFinite(e)?e:0,n=t>0?t:Number.MAX_SAFE_INTEGER;return Math.max(0,Math.min(n,a))}function dt(e,t){return t>0?Math.max(0,Math.min(100,e/t*100)):0}function Bt(e){if(!Number.isFinite(e))return"0:00";let t=Math.max(0,Math.round(e)),a=Math.floor(t/60),n=t-a*60;return`${a}:${String(n).padStart(2,"0")}`}function Ya(e){if(!Number.isFinite(e))return"0:00.0";let t=Math.max(0,Math.round(e*10)),a=Math.floor(t/600),n=t-a*600,o=Math.floor(n/10);return`${a}:${String(o).padStart(2,"0")}.${n%10}`}function tn(e,t){return`${Ya(e)} / ${t>0?Ya(t):"0:00.0"}`}function an(e,t){return(e||[]).map((a,n)=>{let o=Number(a.timestamp_ms);if(!Number.isFinite(o))return null;let s=o/1e3;return s<0||t>0&&s>t?null:{index:n,time:s,label:String(a.label||a.kind||"Marker")}}).filter(Boolean).sort((a,n)=>a.time-n.time)}function nn(e,t){if(!e.length)return null;for(let a of e)if(a.time>t+.05)return a;return e[0]}function on(e,t){if(!e.length)return null;for(let a=e.length-1;a>=0;a-=1)if(e[a].time<t-.05)return e[a];return e[e.length-1]}var rn="clipline.playerVolume",ln="clipline.clipTheaterMode",Mo=2e3,Ro=[.25,.5,.75,1,1.25,1.5,2];function Eo(e,t){switch(e){case"Space":case"KeyK":return{kind:"toggle-play"};case"ArrowLeft":return{kind:"seek-by",seconds:t?-1:-5};case"ArrowRight":return{kind:"seek-by",seconds:t?1:5};case"KeyJ":return{kind:"seek-by",seconds:-10};case"KeyL":return{kind:"seek-by",seconds:10};case"Comma":return{kind:"seek-by",seconds:-.1};case"Period":return{kind:"seek-by",seconds:.1};case"KeyM":return{kind:"toggle-mute"};case"Home":return{kind:"seek-to",seconds:0};case"End":return{kind:"seek-to-end"};case"KeyF":case"KeyT":return{kind:"theater"};case"Escape":return{kind:"exit-theater"};default:return null}}function Uo(e){return e instanceof Element?!!e.closest("input, textarea, select, button, a, [contenteditable='true'], [contenteditable='']"):!1}function Do(){try{let e=window.localStorage.getItem(rn);if(e==null)return 1;let t=Number(e);return Number.isFinite(t)?Math.max(0,Math.min(1,t)):1}catch{return 1}}function sn(e){try{window.localStorage.setItem(rn,String(Math.max(0,Math.min(1,e))))}catch{}}function Io(){try{return window.localStorage.getItem(ln)==="true"}catch{return!1}}function Ao(e){try{window.localStorage.setItem(ln,String(e))}catch{}}function cn({src:e,poster:t,durationMs:a,markers:n}){let o=z(null),s=z(null),i=z(null),c=z(!1),d=z(!1),l=Xa(a),[m,h]=g(!1),[u,f]=g(0),[b,w]=g(l),[P,R]=g(0),[S,D]=g(Do),[O,I]=g(!1),[U,q]=g(1),[V,Y]=g(!1),[A,G]=g(Io),[_e,me]=g(!0),[oe,we]=g(null),[ee,X]=g(""),ce=an(n,b);function ue(){me(!0),window.clearTimeout(i.current),i.current=window.setTimeout(()=>{let _=o.current;_&&!_.paused&&!_.ended&&me(!1)},Mo)}E(()=>{m||(window.clearTimeout(i.current),me(!0))},[m]),E(()=>{let _=o.current;if(!_)return;let x=()=>Number.isFinite(_.duration)&&_.duration>0?_.duration:l,T=()=>w(x()),re=()=>w(x()),he=()=>{c.current||f(_.currentTime||0)},de=()=>{let Zt=x();if(!(Zt>0)||!_.buffered?.length){R(0);return}let jt=_.currentTime||0,Oe=0;for(let Ve=0;Ve<_.buffered.length;Ve+=1){let An=_.buffered.start(Ve),ht=_.buffered.end(Ve);if(jt>=An&&jt<=ht){Oe=ht;break}Oe=Math.max(Oe,ht)}R(dt(Oe,Zt))},Ue=()=>{h(!0),X(""),ue()},qt=()=>h(!1),Gt=()=>h(!1),Kt=()=>{D(_.volume),I(_.muted||_.volume===0)},Wt=()=>X("Playback unavailable");return _.addEventListener("loadedmetadata",T),_.addEventListener("durationchange",re),_.addEventListener("timeupdate",he),_.addEventListener("progress",de),_.addEventListener("play",Ue),_.addEventListener("pause",qt),_.addEventListener("ended",Gt),_.addEventListener("volumechange",Kt),_.addEventListener("error",Wt),()=>{_.removeEventListener("loadedmetadata",T),_.removeEventListener("durationchange",re),_.removeEventListener("timeupdate",he),_.removeEventListener("progress",de),_.removeEventListener("play",Ue),_.removeEventListener("pause",qt),_.removeEventListener("ended",Gt),_.removeEventListener("volumechange",Kt),_.removeEventListener("error",Wt)}},[e,l]),E(()=>{o.current&&(o.current.volume=S)},[S]),E(()=>{o.current&&(o.current.muted=O)},[O]),E(()=>{o.current&&(o.current.playbackRate=U)},[U]),E(()=>{let _=o.current;if(!_)return;let x=!1;async function T(){if(!x)try{await _.play();return}catch{if(x||!_.paused)return;_.muted=!0,I(!0);try{await _.play()}catch(re){X(re?.message||"Playback unavailable")}}}return _.readyState>=HTMLMediaElement.HAVE_FUTURE_DATA?T():_.addEventListener("canplay",T,{once:!0}),()=>{x=!0,_.removeEventListener("canplay",T)}},[e]),E(()=>{let _=document.documentElement;return _.classList.toggle("clipline-theater",A),()=>_.classList.remove("clipline-theater")},[A]);function te(_){G(_),Ao(_)}function ae(_){let x=o.current;if(!x)return;let T=b>0?en(_,b):Math.max(0,_);x.currentTime=T,f(T)}function ke(_){ae((o.current?.currentTime||0)+_)}async function se(){let _=o.current;if(_)if(_.paused||_.ended)try{await _.play()}catch(x){X(x?.message||"Playback failed")}else _.pause()}function be(){let _=o.current;_&&(_.muted||_.volume===0?(_.muted=!1,_.volume===0&&(_.volume=1,D(1),sn(1)),I(!1)):(_.muted=!0,I(!0)))}function xe(_){let x=Number(_.target.value);D(x),I(x===0),sn(x);let T=o.current;T&&(T.volume=x,T.muted=x===0)}async function fe(){try{document.fullscreenElement?await document.exitFullscreen():await s.current?.requestFullscreen?.()}catch(_){X(_?.message||"Fullscreen unavailable")}}function y(_){let x=o.current?.currentTime||0,T=_>0?nn(ce,x):on(ce,x);T&&ae(T.time)}function H(){c.current=!0,d.current=m,m&&o.current?.pause()}function p(_){let x=Number(_.target.value);f(x),ae(x)}function $(){c.current&&(c.current=!1,d.current&&(d.current=!1,o.current?.play().catch(()=>{})))}function M(_){let x=_.currentTarget.getBoundingClientRect();if(!(x.width>0))return;let T=Math.max(0,Math.min(1,(_.clientX-x.left)/x.width));we({pct:T*100,time:T*(b||0)})}function L(){we(null)}return E(()=>{function _(x){if(x.defaultPrevented||Uo(x.target))return;let T=Eo(x.code,x.shiftKey);if(T&&!(T.kind==="exit-theater"&&!A))switch(x.preventDefault(),ue(),T.kind){case"toggle-play":se();break;case"seek-by":ke(T.seconds);break;case"seek-to":ae(T.seconds);break;case"seek-to-end":ae(b);break;case"toggle-mute":be();break;case"theater":te(!A);break;case"exit-theater":te(!1);break}}return document.addEventListener("keydown",_),()=>document.removeEventListener("keydown",_)},[b,A,m]),r`<div class=${`player ${_e?"":"chrome-hidden"}`} ref=${s}
      onPointerMove=${ue} onPointerEnter=${ue}
      onPointerLeave=${()=>{let _=o.current;_&&!_.paused&&me(!1)}}
      onFocusIn=${()=>me(!0)}>
    <video ref=${o} class="player-video" src=${e} poster=${t||void 0}
      preload="metadata" playsinline onClick=${se}></video>
    ${ee&&r`<div class="player-note">${ee}</div>`}
    <div class="player-overlay">
      <div class="player-timeline" onPointerMove=${M} onPointerLeave=${L}>
        <div class="player-buffered" style=${`width:${P}%`}></div>
        <div class="player-progress" style=${`width:${dt(u,b)}%`}></div>
        ${ce.map(_=>r`<span class="player-marker-tick" key=${_.index}
            style=${`left:${dt(_.time,b)}%`} title=${`${_.label} @ ${Bt(_.time)}`}></span>`)}
        <input class="player-scrubber" type="range" min="0" max=${b>0?b:0} step="0.01"
          value=${u} disabled=${!(b>0)} aria-label="Seek"
          onPointerDown=${H} onInput=${p} onChange=${$}
          onPointerUp=${$} onPointerCancel=${$} onLostPointerCapture=${$} />
        ${oe&&r`<div class="player-hover-time" style=${`left:${oe.pct}%`}>${Bt(oe.time)}</div>`}
      </div>
      <div class="player-controls">
        ${ce.length>0&&r`<div class="player-cluster">
          <button type="button" class="player-btn" title="Previous marker" aria-label="Previous marker"
            onClick=${()=>y(-1)}>${C("skipBack",{size:14})}</button>
          <button type="button" class="player-btn" title="Next marker" aria-label="Next marker"
            onClick=${()=>y(1)}>${C("skipForward",{size:14})}</button>
        </div>`}
        <button type="button" class="player-btn player-play" aria-label=${m?"Pause":"Play"} onClick=${se}>
          ${C(m?"pause":"play",{size:16})}
        </button>
        <span class="player-time">${tn(u,b)}</span>
        <div class="player-spacer"></div>
        <div class="player-speed-wrap">
          <button type="button" class="player-btn player-speed" aria-haspopup="menu" aria-expanded=${V}
            onClick=${()=>Y(_=>!_)}>${U}×</button>
          ${V&&r`<div class="player-speed-menu" role="menu">
            ${Ro.map(_=>r`<button type="button" role="menuitem" key=${_}
                class=${`player-speed-item ${_===U?"is-active":""}`}
                onClick=${()=>{q(_),Y(!1)}}>${_}×</button>`)}
          </div>`}
        </div>
        <button type="button" class="player-btn" aria-label=${O?"Unmute":"Mute"} onClick=${be}>
          ${C(O?"volumeX":"volume2",{size:14})}
        </button>
        <input class="player-volume" type="range" min="0" max="1" step="0.01" value=${O?0:S}
          aria-label="Volume" onInput=${xe} />
        <button type="button" class="player-btn" aria-label=${A?"Exit theater mode":"Theater mode"}
          aria-pressed=${A} onClick=${()=>te(!A)}>${C("theater",{size:14})}</button>
        <button type="button" class="player-btn" aria-label="Fullscreen" onClick=${fe}>
          ${C("fullscreen",{size:14})}
        </button>
      </div>
    </div>
  </div>`}le();function Lo(e){let t=new Map(e.map(s=>[s.id,s])),a=new Map,n=[],o=0;return e.forEach(s=>{let i=s.parent_comment_id||"";i&&t.has(i)?(a.has(i)||a.set(i,[]),a.get(i).push(s),o+=1):i||(n.push(s),o+=1)}),{roots:n,repliesByParent:a,count:o}}async function No({apiClient:e=k,shareId:t,body:a,parentCommentId:n,onReload:o=()=>{},onError:s=v}){let i=a.trim();if(!i)return!1;try{return await e(`/api/v1/public/clips/${encodeURIComponent(t)}/comments`,{method:"POST",body:n?{body:i,parent_comment_id:n}:{body:i}}),o(),!0}catch(c){return s(c.message),!1}}function Bo(e){return(e||"?").trim().slice(0,1).toUpperCase()||"?"}function zo(e){let t=Dt(e.author_avatar_url);return t?r`<img class="comment-avatar" src=${t} alt="" />`:r`<div class="comment-avatar">${Bo(e.author_name)}</div>`}function un({shareId:e}){let{user:t}=j(N),[a,n]=g(0),[o,s]=g(""),[i,c]=g(null),[d,l]=g(""),[m,h]=g(null),u=`/api/v1/public/clips/${encodeURIComponent(e)}/comments`,{data:f,error:b}=ie(u,a),w=b?[]:f?.comments??null;function P(){n(U=>U+1)}async function R(U,q){return No({shareId:e,body:U,parentCommentId:q,onReload:P,onError:v})}async function S(U){U.preventDefault(),await R(o)&&s("")}async function D(U,q){U.preventDefault(),await R(d,q)&&(l(""),c(null))}async function O(){let U=m;h(null);try{await k(`/api/v1/public/clips/${encodeURIComponent(e)}/comments/${encodeURIComponent(U)}`,{method:"DELETE"}),P()}catch(q){v(q.message)}}let I=Lo(w||[]);return r`<section class="comments">
    <div class="comments-header"><h2>Comments</h2><span class="muted">${I.count}</span></div>
    ${t?r`<form class="comment-form" onSubmit=${S}>
          <textarea rows="3" maxlength="2000" placeholder="Add a comment" value=${o}
            onInput=${U=>s(U.target.value)}></textarea>
          <div class="comment-form-actions">
            <button type="submit" class="btn btn-primary">${C("message",{size:14})} Post comment</button>
          </div>
        </form>`:r`<p class="comment-signin"><a href="/login">Sign in</a> to comment.</p>`}
    ${w==null?"":I.count===0?r`<p class="comment-signin">No comments yet.</p>`:r`<div class="comment-list">
          ${I.roots.map(U=>dn(U,{depth:0,repliesByParent:I.repliesByParent,user:t,replyOpenId:i,setReplyOpenId:c,replyDraft:d,setReplyDraft:l,submitReply:D,onDelete:h}))}
        </div>`}
    <${pe} open=${m!=null} title="Delete this comment?"
      body="This removes the comment from the public clip page." confirmLabel="Delete" danger
      onConfirm=${O} onCancel=${()=>h(null)} />
  </section>`}function dn(e,t){let{depth:a,repliesByParent:n,user:o,replyOpenId:s,setReplyOpenId:i,replyDraft:c,setReplyDraft:d,submitReply:l,onDelete:m}=t,h=n.get(e.id)||[];return r`<article class="comment" key=${e.id}>
    ${zo(e)}
    <div class="comment-body">
      <div class="comment-head">
        ${e.author_username?r`<a href=${`/u/${encodeURIComponent(e.author_username)}`}>${e.author_name}</a>`:r`<strong>${e.author_name}</strong>`}
        ${e.is_uploader&&r`<span class="comment-badge">Uploader</span>`}
        <span>${nt(e.created_at)}</span>
        <div class="comment-actions">
          ${o&&a===0&&r`<button type="button" class="comment-action"
            onClick=${()=>i(s===e.id?null:e.id)}>
            ${C("message",{size:12})} Reply</button>`}
          ${e.viewer_can_delete&&r`<button type="button" class="comment-delete" aria-label="Delete comment"
            title="Delete comment" onClick=${()=>m(e.id)}>${C("trash",{size:12})}</button>`}
        </div>
      </div>
      <p class="comment-text">${e.body}</p>
      ${o&&a===0&&s===e.id&&r`<form class="comment-reply-form"
        onSubmit=${u=>l(u,e.id)}>
        <textarea rows="2" maxlength="2000" placeholder="Write a reply" value=${c}
          onInput=${u=>d(u.target.value)}></textarea>
        <div class="comment-form-actions">
          <button type="submit" class="btn btn-primary">${C("message",{size:14})} Post reply</button>
        </div>
      </form>`}
      ${h.length>0&&r`<div class="comment-replies">
        ${h.map(u=>dn(u,{...t,depth:a+1}))}
      </div>`}
    </div>
  </article>`}var Fo=["private","public","unlisted"];function Oo(e,t){return e==="clip"?!0:!!t?.viewer_can_edit}function Vo(e,t,a){return e==="public"?t.shareId:a?.public_share_id||null}function Ho(e,t,a){return e==="clip"?t.clipId:a?.viewer_clip_id||null}function qo(e){let t=e?.height!=null?e.height:"",a=Math.round(e?.fps||0)||"";return`${t}p${a}`}function Go(e,t=8){let a=new URLSearchParams;return e&&a.set("share_id",e),a.set("limit",String(t)),`/api/v1/public/recommendations?${a}`}function Ko(e,t,a=8){return(e||[]).filter(n=>n.share_id!==t).slice(0,a)}function Wo(e,t,a){let n=e==="clip"?a||{}:{display_name:t?.author_name||null,username:t?.author_username||null,avatar_url:t?.author_avatar_url||null},o=n.username||null;return{label:n.display_name||o||"Unknown creator",username:o,href:o?`/u/${encodeURIComponent(o)}`:null,avatarUser:n}}function Zo({author:e}){let t=r`
    <${Se} user=${e.avatarUser} size=${36} />
    <span class="watch-author-name">${e.label}</span>
  `,a=e.href?r`<a class="watch-author-link" href=${e.href}>${t}</a>`:r`<span class="watch-author-link watch-author-static">${t}</span>`;return r`<div class="watch-author-row">${a}</div>`}function zt({route:e}){let{user:t}=j(N),[a,n]=g(null),[o,s]=g(null),[i,c]=g([]),[d,l]=g(!1),[m,h]=g(""),[u,f]=g(!1),[b,w]=g(""),[P,R]=g(!1),[S,D]=g(!1),[O,I]=g(!1),U=e.name==="clip"?`clip:${e.clipId}`:`public:${e.shareId}`,q=Vo(e.name,e,a),V=e.name==="public"||!!a;if(E(()=>{let y=new AbortController;n(null),s(null),l(!1),f(!1),I(!1),R(!1);let H=e.name==="clip"?`/api/v1/clips/${encodeURIComponent(e.clipId)}`:`/api/v1/public/clips/${encodeURIComponent(e.shareId)}`;return k(H,{signal:y.signal}).then(p=>{n(p),e.name==="public"&&k(`/api/v1/public/clips/${encodeURIComponent(e.shareId)}/view`,{method:"POST",body:{},signal:y.signal}).then($=>n(M=>M&&{...M,view_count:$.view_count})).catch(()=>{})}).catch(p=>{p?.name!=="AbortError"&&s(p)}),()=>y.abort()},[U]),E(()=>{if(!V){c([]);return}let y=new AbortController;return c([]),k(Go(q,8),{signal:y.signal}).then(H=>c(H.clips||[])).catch(()=>{}),()=>y.abort()},[U,q,V]),o)return r`<main class="page"><${Q} name="alert" title="Couldn't load this clip" body=${o.message} /></main>`;if(!a)return r`<main class="page watch"><div><div class="skeleton-thumb"></div></div><aside class="upnext"></aside></main>`;let Y=Oo(e.name,a),A=q,G=Ho(e.name,e,a),_e=e.name==="clip"?ot({id:a.id}):Re({share_id:e.shareId}),me=e.name==="clip"?Fa({id:a.id}):st({share_id:e.shareId}),oe=Wo(e.name,a,t),we=a.public_url??a.share_url??null,ee=ze(we,window.location.origin,A),X=e.name==="clip";function ce(){h(a.title),l(!0)}async function ue(y){y?.preventDefault?.();let H=m.trim();if(!H||H===a.title){l(!1);return}try{await k(`/api/v1/clips/${encodeURIComponent(G)}`,{method:"PATCH",body:{title:H}}),n(p=>({...p,title:H})),l(!1),v("Title saved.")}catch(p){v(p.message)}}function te(){w(a.description||""),f(!0)}async function ae(){let y=b.trim();try{await k(`/api/v1/clips/${encodeURIComponent(G)}`,{method:"PATCH",body:{description:y||null}}),n(H=>({...H,description:y||null})),f(!1),v("Description saved.")}catch(H){v(H.message)}}async function ke(y,{force:H=!1}={}){let p=a.visibility;if(!(p===y&&!H)){n($=>({...$,visibility:y}));try{let $=await k(`/api/v1/clips/${encodeURIComponent(G)}/visibility`,{method:"POST",body:{visibility:y}});n(M=>({...M,visibility:$.visibility,public_url:$.public_url,public_share_id:$.public_share_id})),v(`Visibility set to ${y}.`,{actionLabel:"Undo",onAction:()=>ke(p,{force:!0})})}catch($){n(M=>({...M,visibility:p})),v($.message)}}}async function se(){if(ee)try{await navigator.clipboard.writeText(ee),v("Link copied.")}catch{v("Couldn't copy the link.")}}async function be(){D(!1);try{await k(`/api/v1/clips/${encodeURIComponent(G)}`,{method:"DELETE"}),v("Clip deleted."),W("/library")}catch(y){v(y.message)}}let xe=[a.game_name&&r`<a class="chip chip-on" href=${`/game/${encodeURIComponent(a.game_category_id||a.game_name)}`}>${a.game_display_name||a.game_name}</a>`,Pe(a.view_count),`Recorded ${J(a.recorded_at)}`].filter(Boolean),fe=Ko(i,A,8);return r`<main class="page watch">
    <div>
      <${cn} src=${_e} poster=${me} durationMs=${a.duration_ms} markers=${a.markers} />
      <div class=${`watch-heading ${a.game_video_art_url?"has-game-art":""}`}>
        ${a.game_video_art_url&&r`<img class="watch-game-art" src=${a.game_video_art_url} alt="" />`}
        <div class="watch-heading-content">
        <div class="watch-titlerow">
          ${d?r`<input class="input watch-title-input" value=${m} autofocus
                onInput=${y=>h(y.target.value)} onBlur=${ue}
                onKeyDown=${y=>{y.key==="Enter"&&ue(y),y.key==="Escape"&&l(!1)}} />`:r`<h1>${a.title}
                ${Y&&r`<button type="button" class="edit-pencil" aria-label="Edit title" onClick=${ce}
                  >${C("edit",{size:14})}</button>`}</h1>`}
        </div>
        <${Zo} author=${oe} />
        <p class="watch-meta">${xe.map((y,H)=>r`${H>0?" \xB7 ":""}${y}`)}</p>
        </div>
      </div>

      ${Y&&r`<div class="watch-actions">
        <div class="seg" role="radiogroup" aria-label="Visibility">
          ${Fo.map(y=>r`<button type="button" role="radio" key=${y} aria-checked=${a.visibility===y}
              class=${`seg-item ${a.visibility===y?"seg-on":""}`} onClick=${()=>ke(y)}
              >${y[0].toUpperCase()+y.slice(1)}</button>`)}
        </div>
        <button type="button" class="btn btn-primary" disabled=${!ee} onClick=${se}>
          ${C("copy",{size:14})} Copy share link</button>
        <div class="watch-more">
          <button type="button" class="btn" aria-haspopup="menu" aria-expanded=${P}
            onClick=${()=>R(y=>!y)}>⋯</button>
          ${P&&r`<div class="menu" role="menu">
            <button type="button" class="menu-danger" role="menuitem"
              onClick=${()=>{R(!1),D(!0)}}>${C("trash",{size:14})} Delete clip</button>
          </div>`}
        </div>
      </div>`}

      <div class="watch-desc">
        ${u?r`<textarea class="input" rows="5" value=${b} autofocus
              onInput=${y=>w(y.target.value)} onBlur=${ae}
              onKeyDown=${y=>{y.key==="Enter"&&(y.ctrlKey||y.metaKey)&&ae(),y.key==="Escape"&&f(!1)}}></textarea>`:a.description?r`<p>${a.description}
              ${Y&&r`<button type="button" class="edit-pencil" aria-label="Edit description" onClick=${te}
                >${C("edit",{size:12})}</button>`}</p>`:Y?r`<button type="button" class="watch-desc-add" onClick=${te}>+ Add a description</button>`:""}
      </div>

      ${X&&r`<button type="button" class="details-strip" aria-expanded=${O}
        onClick=${()=>I(y=>!y)}>
        <span><b>${ve(a.duration_ms)}</b> length</span>
        <span><b>${F(a.file_size_bytes)}</b></span>
        <span><b>${qo(a)}</b></span>
        <span><b>${a.video_codec}/${a.audio_codec}</b> ${a.container}</span>
        <span class="details-chev">${O?"\u25B4 less":"\u25BE more"}</span>
      </button>`}
      ${X&&O&&r`<dl class="details-full">
        <div><dt>Recorded</dt><dd>${J(a.recorded_at)}</dd></div>
        <div><dt>Uploaded</dt><dd>${J(a.uploaded_at)}</dd></div>
        <div><dt>Dimensions</dt><dd>${a.width&&a.height?`${a.width} x ${a.height}`:"Unknown"}</dd></div>
        <div><dt>FPS</dt><dd>${a.fps??"Unknown"}</dd></div>
        <div><dt>Container</dt><dd>${a.container||"Unknown"}</dd></div>
        <div><dt>Video codec</dt><dd>${a.video_codec||"Unknown"}</dd></div>
        <div><dt>Audio codec</dt><dd>${a.audio_codec||"Unknown"}</dd></div>
        <div><dt>Source</dt><dd>${a.source_type||"Unknown"}</dd></div>
        <div><dt>Checksum</dt><dd>${a.checksum_sha256||"Unknown"}</dd></div>
      </dl>`}

      ${A&&r`<${un} shareId=${A} />`}
    </div>
    <aside class="upnext">
      <h4 class="kicker">Up next</h4>
      ${fe.map(y=>r`<a class="upnext-row" key=${y.share_id} href=${`/c/${encodeURIComponent(y.share_id)}`}>
          <img src=${ye(y)} alt="" loading="lazy" />
          <span><b>${y.title}</b><small>${y.author_name} · ${y.game_display_name||y.game_name||"No game"} · ${Pe(y.view_count)}</small></span>
        </a>`)}
    </aside>

    <${pe} open=${S} title="Delete this clip?" body="Public links stop working immediately."
      confirmLabel="Delete" danger onConfirm=${be} onCancel=${()=>D(!1)} />
  </main>`}le();var Ft=[{top:"4%",left:"4%",width:"34%",rotate:-7},{top:"0%",left:"44%",width:"30%",rotate:5},{top:"34%",left:"68%",width:"28%",rotate:-4},{top:"50%",left:"8%",width:"30%",rotate:6},{top:"62%",left:"42%",width:"26%",rotate:-5},{top:"26%",left:"-4%",width:"22%",rotate:9}];function jo(e){return Array.isArray(e)?e.slice(0,Ft.length).map((t,a)=>({clip:t,...Ft[a]})):[]}function Jo(e){let t=e?.clips;if(!Array.isArray(t)||t.length===0)return null;let a=t.length,n=e.has_more?"+":"";return`${a}${n} clip${a===1?"":"s"} on this instance`}function Qo({top:e,left:t,width:a,rotate:n}){return`top:${e};left:${t};width:${a};transform:rotate(${n}deg);`}function pn(e){let t=String(e||"").trim();return t||null}function Yo(){let{data:e}=ie(`/api/v1/public/clips?page_size=${Ft.length}`),t=jo(e?.clips),a=Jo(e);return r`<aside class="login-montage" aria-hidden="true">
    ${t.length>0&&r`<div class="login-montage-tiles">
      ${t.map((n,o)=>r`<img key=${o} class="login-montage-tile" style=${Qo(n)}
        src=${ye(n.clip)} alt="" loading="lazy" />`)}
    </div>`}
    <div class="login-montage-copy">
      <h2>Your clips. Your server.</h2>
      ${a&&r`<p>${a}</p>`}
    </div>
  </aside>`}function pt({titleId:e,children:t}){return r`<div class="login-page">
    <${Yo} />
    <section class="login-panel" aria-labelledby=${e}>
      <div class="login-brand" aria-hidden="true">
        <img src="/clipline-icon.svg" alt="" width="32" height="32" />
        <span class="login-brand-word">CLIP<span class="wordmark-accent">LINE</span></span>
        <span class="login-brand-descriptor">CLOUD</span>
      </div>
      ${t}
    </section>
  </div>`}function mn(){let{user:e}=j(N),[t,a]=g(""),[n,o]=g(""),[s,i]=g(""),[c,d]=g(!1);if(E(()=>{e&&W("/library")},[e]),e)return null;async function l(m){if(m.preventDefault(),!c){d(!0),i("");try{let h=await k("/api/v1/auth/login",{method:"POST",body:{username:t,password:n}});$e(h.csrf_token),N.set({user:h.user,csrfToken:h.csrf_token,ready:!0}),W("/library")}catch(h){i(h instanceof Te?h.message:"Sign in failed"),d(!1)}}}return r`<${pt} titleId="login-title">
    <h1 id="login-title">Sign in</h1>
    ${s&&r`<p class="form-error" role="alert">${s}</p>`}
    <form class="login-form" onSubmit=${l}>
      <label class="login-field">
        <span>Username</span>
        <input class="input" name="username" autocomplete="username" required
          value=${t} onInput=${m=>a(m.target.value)} />
      </label>
      <label class="login-field">
        <span>Password</span>
        <input class="input" name="password" type="password" autocomplete="current-password" required
          value=${n} onInput=${m=>o(m.target.value)} />
      </label>
      <button class="btn btn-primary" type="submit" disabled=${c}>${c?"Signing in\u2026":"Sign in"}</button>
    </form>
    <p class="login-hint">Accounts are created by this server's admin.</p>
  </${pt}>`}function fn({route:e}){let t=!!e.invite,a=e.token?"form":"missing-token",[n,o]=g(""),[s,i]=g(!1),c=t;async function d(h){if(h.preventDefault(),s)return;i(!0),o("");let u=new FormData(h.currentTarget),f={reset_token:e.token,new_password:String(u.get("new_password")||"")};c&&(f.username=String(u.get("username")||""),f.display_name=pn(u.get("display_name")),f.email=pn(u.get("email")));try{await k("/api/v1/auth/reset-password",{method:"POST",body:f}),v(c?"Account created. Sign in with your new password.":"Password set. Sign in with your new password."),W("/login")}catch(b){o(b instanceof Te?b.message:"Request failed"),i(!1)}}return r`<${pt} titleId="reset-title">
    <h1 id="reset-title">${c?"Create account":"Set password"}</h1>
    <p class="login-copy">${c?"Choose your Clipline Cloud account details.":"Choose a new password for your Clipline Cloud account."}</p>
    ${a==="missing-token"?r`<p class="form-error" role="alert">This reset link is missing a token.</p>`:r`
        ${n&&r`<p class="form-error" role="alert">${n}</p>`}
        <form class="login-form" onSubmit=${d}>
          ${c&&r`
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
          <button class="btn btn-primary" type="submit" disabled=${s}>
            ${s?c?"Creating account\u2026":"Setting password\u2026":c?"Create account":"Set password"}
          </button>
        </form>
      `}
    ${!c&&r`<a class="btn" href="/login">Sign in</a>`}
  </${pt}>`}le();function Fe({label:e,value:t,sub:a,meter:n,tone:o}){let s=o?` stat-${o}`:"";return r`<div class="stat-card">
    <p class="stat-label">${e}</p>
    <p class=${`stat-value${s}`}>${t}</p>
    ${a!=null&&r`<p class="stat-sub">${a}</p>`}
    ${n!=null&&r`<div class="stat-meter${s}">
      <span style=${`width:${Math.max(0,Math.min(1,n))*100}%`}></span>
    </div>`}
  </div>`}function Xo(e){let t=Number(e?.global_storage_warning_threshold_bytes||0);if(!t)return null;let a=Number(e?.total_storage_bytes||0);return Math.max(0,Math.min(1,a/t))}function es(e){if(!e?.global_storage_warning_threshold_bytes)return"Disabled";let t=F(e.global_storage_warning_threshold_bytes);return e.global_storage_warning?`At or above ${t}`:`Below ${t}`}function ts({deadJobs:e=[],failedUploads:t=[]}={}){let a=e.length+t.length;return{failedCount:a,healthy:a===0}}function ne(e,t){return r`<div><dt>${e}</dt><dd>${t??"Unknown"}</dd></div>`}function _n({overview:e,deadJobs:t,failedUploads:a}){let n=Xo(e),{failedCount:o,healthy:s}=ts({deadJobs:t,failedUploads:a}),i=e.global_storage_warning_threshold_bytes;return r`<div>
    <div class="stat-grid">
      <${Fe} label="Clips" value=${String(e.total_clips)} />
      <${Fe} label="Storage" value=${F(e.total_storage_bytes)}
        sub=${i?`${F(i)} warning threshold`:null}
        meter=${n} tone=${e.global_storage_warning?"danger":void 0} />
      <${Fe} label="Users" value=${String(e.total_users)} />
      <${Fe} label="Jobs" value=${s?"All healthy":String(o)}
        tone=${s?"success":"danger"} />
    </div>
    <div class="panel">
      <h2>Server summary</h2>
      <dl class="ad-kv">
        ${ne("Server version",e.server_version)}
        ${ne("API version",e.api_version)}
        ${ne("Public URL",e.public_url)}
        ${ne("Database",e.database_backend)}
        ${ne("Storage",`${e.storage_backend} \u2014 ${e.storage_summary}`)}
        ${ne("Stored clips",`${e.total_clips} clips \u2014 ${F(e.total_storage_bytes)}`)}
        ${ne("Users",`${e.total_users} total`)}
        ${ne("Max upload",F(e.max_upload_size_bytes))}
        ${ne("Part size",F(e.upload_part_size_bytes))}
        ${ne("Single PUT max",F(e.single_put_max_bytes))}
        ${ne("Active uploads/user",e.max_active_upload_sessions_per_user)}
        ${ne("User quota",e.user_storage_quota_bytes?F(e.user_storage_quota_bytes):"Disabled")}
        ${ne("Storage warning",es(e))}
        ${ne("Upload TTL",`${e.upload_session_ttl_seconds}s`)}
        ${ne("Direct S3 uploads",e.direct_s3_uploads?"Enabled":"Disabled")}
        ${ne("Public media",`${e.public_media_mode}, ${e.public_read_url_ttl_seconds}s TTL`)}
      </dl>
    </div>
  </div>`}le();function mt(e){let t=String(e||"").trim();return t||null}function as(e,t){return!(e.is_disabled||t?.id===e.id||e.role==="owner"||e.role==="admin"&&t?.role!=="owner")}function ns(e,t){return!(!e.is_disabled||t?.id===e.id||e.role==="owner"||e.role==="admin"&&t?.role!=="owner")}function os(e,t){return t?.role==="owner"&&e.role!=="owner"&&t?.id!==e.id}function ss(e,t){return!(t?.id===e.id||e.role==="owner"||e.role==="admin"&&t?.role!=="owner")}function Ot(e){return e?[["user","User"],["admin","Admin"]]:[["user","User"]]}function rs({isOwner:e,onCreated:t}){let[a,n]=g(!1);async function o(s){if(s.preventDefault(),a)return;n(!0);let i=s.currentTarget,c=new FormData(i);try{await k("/api/v1/users",{method:"POST",body:{username:String(c.get("username")||""),display_name:mt(c.get("display_name")),email:mt(c.get("email")),password:mt(c.get("password")),role:String(c.get("role")||"user")}}),v("User created."),i.reset(),t()}catch(d){v(d.message)}finally{n(!1)}}return r`<form class="panel section" onSubmit=${o}>
    <h2>Create user</h2>
    <label class="field"><span>Username</span><input class="input" name="username" required /></label>
    <label class="field"><span>Display name</span><input class="input" name="display_name" placeholder="Optional" /></label>
    <label class="field"><span>Email</span><input class="input" name="email" type="email" placeholder="Optional" /></label>
    <label class="field"><span>Password</span><input class="input" name="password" type="password" required /></label>
    <label class="field"><span>Role</span>
      <select class="input" name="role">
        ${Ot(e).map(([s,i])=>r`<option value=${s}>${i}</option>`)}
      </select>
    </label>
    <button class="btn btn-primary" type="submit" disabled=${a}>${C("plus",{size:14})} Create user</button>
  </form>`}function is({isOwner:e,smtpEnabled:t,onCreated:a}){let[n,o]=g(!1);async function s(i){if(i.preventDefault(),n)return;o(!0);let c=new FormData(i.currentTarget),d=i.submitter?.value==="email"?"email":"link";try{let l=await k("/api/v1/invites",{method:"POST",body:{role:String(c.get("role")||"user"),email:mt(c.get("email")),send_email:d==="email"}});v(d==="email"?"Invite sent.":"Invite link created."),a({...l,kind:"invite"})}catch(l){v(l.message)}finally{o(!1)}}return r`<form class="panel section" onSubmit=${s}>
    <h2>Invite link</h2>
    <label class="field"><span>Role</span>
      <select class="input" name="role">
        ${Ot(e).map(([i,c])=>r`<option value=${i}>${c}</option>`)}
      </select>
    </label>
    <label class="field"><span>Email</span>
      <input class="input" name="email" type="email" placeholder=${t?"Optional":"SMTP disabled"} disabled=${!t} />
    </label>
    <div class="actions">
      <button class="btn" type="submit" name="intent" value="link" disabled=${n}>${C("copy",{size:14})} Generate link</button>
      ${t&&r`<button class="btn btn-primary" type="submit" name="intent" value="email" disabled=${n}>${C("message",{size:14})} Send email</button>`}
    </div>
  </form>`}function ls({resetLink:e}){if(!e)return null;let t=e.kind==="invite"?"Invite":"Reset",a=e.username?` for ${e.username}`:"",n=async()=>{try{await navigator.clipboard.writeText(e.reset_url),v("Copied to clipboard.")}catch{v("Copy failed. Select and copy the URL manually.")}};return r`<div class="notice admin-reset-link">
    <div>
      <strong>${t} link created${a}</strong>
      <span>Expires ${J(e.expires_at)}</span>
      <code>${e.reset_url}</code>
    </div>
    <button class="btn" type="button" onClick=${n}>${C("copy",{size:14})} Copy</button>
  </div>`}function cs(e){return e.is_disabled?r`<span class="badge badge-warn">Disabled</span>`:r`<span class="badge badge-public">Active</span>`}function us(e){return e?e.user_storage_quota_bytes!=null&&e.user_storage_quota_bytes>0?e.user_storage_quota_bytes:e.user_storage_quota_env_fallback_bytes??null:null}function ds(e,t){if(e.storage_quota_bytes!=null&&e.storage_quota_bytes>0)return F(e.storage_quota_bytes);let a=us(t);return a!=null&&a>0?`Default (${F(a)})`:"No limit"}function ps({user:e,currentUser:t,settings:a,onQuota:n,onReset:o,onDisable:s,onEnable:i,onRole:c,onPurge:d}){let l=ds(e,a),m=!as(e,t),h=!ns(e,t),u=!ss(e,t),f=os(e,t),[b,w]=g(e.role);return E(()=>{w(e.role)},[e.role]),r`<tr>
    <td>
      <strong>${e.username}</strong>
      <div class="muted">${e.display_name||e.id}</div>
      ${e.email&&r`<div class="muted">${e.email}</div>`}
    </td>
    <td>
      ${f?r`<select class="input input-compact" value=${b}
            onChange=${P=>{let R=P.target.value;R!==e.role&&(w(e.role),c(e,R))}}>
            ${Ot(!0).map(([P,R])=>r`<option value=${P} selected=${b===P}>${R}</option>`)}
          </select>`:e.role}
    </td>
    <td>${cs(e)}</td>
    <td>
      <strong>${F(e.storage_bytes||0)}</strong>
      <div class="muted">quota ${l}</div>
    </td>
    <td>${J(e.last_login_at)}</td>
    <td>
      <div class="actions">
        <button class="btn" type="button" onClick=${()=>n(e)}>${C("sliders",{size:14})} Quota</button>
        <button class="btn" type="button" onClick=${()=>o(e)}>${C("clipboard",{size:14})} Reset link</button>
        ${e.is_disabled?r`<button class="btn" type="button" disabled=${h} onClick=${()=>i(e)}>${C("check",{size:14})} Enable</button>`:r`<button class="btn btn-danger" type="button" disabled=${m} onClick=${()=>s(e)}>${C("x",{size:14})} Disable</button>`}
        <button class="btn btn-danger" type="button" disabled=${u} onClick=${()=>d(e)}>${C("trash",{size:14})} Delete</button>
      </div>
    </td>
  </tr>`}function hn({users:e,settings:t,currentUser:a,resetLink:n,setResetLink:o,reload:s}){let[i,c]=g(null),d=a?.role==="owner",l=!!t?.smtp_enabled,m=()=>c(null);async function h(){let{type:f,user:b,value:w}=i;m();try{if(f==="quota"){let P=w.trim()?Vt(w):null;await k(`/api/v1/users/${encodeURIComponent(b.id)}`,{method:"PATCH",body:{storage_quota_bytes:P}}),v("Storage quota updated.")}else if(f==="disable")await k(`/api/v1/users/${encodeURIComponent(b.id)}`,{method:"DELETE",body:{reauth_password:w}}),v("User disabled.");else if(f==="enable")await k(`/api/v1/users/${encodeURIComponent(b.id)}`,{method:"PATCH",body:{is_disabled:!1,reauth_password:w}}),v("User enabled.");else if(f==="role")await k(`/api/v1/users/${encodeURIComponent(b.id)}`,{method:"PATCH",body:{role:w.role,reauth_password:w.password}}),v(`Role updated to ${w.role}.`);else if(f==="purge")await k(`/api/v1/users/${encodeURIComponent(b.id)}/purge`,{method:"POST",body:{reauth_password:w}}),v("User deleted.");else if(f==="reset"){let P=await k(`/api/v1/users/${encodeURIComponent(b.id)}/reset-password`,{method:"POST",body:{reauth_password:w}});o({...P,kind:"reset"}),v("Reset link created.")}s()}catch(P){v(P.message),s()}}let u={quota:{title:"Set storage quota",description:"Enter a per-user storage limit in GiB. Leave it blank to remove the per-user limit.",confirmLabel:"Save quota",danger:!1,field:r`<label class="field"><span>Quota GiB</span>
        <input class="input" type="number" min="0" step="0.1" placeholder="No per-user limit"
          value=${i?.value||""} onInput=${f=>c(b=>({...b,value:f.target.value}))} /></label>`},disable:{title:"Disable user?",description:"This immediately revokes the user's sessions and device tokens.",confirmLabel:"Disable",danger:!0,field:r`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value||""}
          onInput=${f=>c(b=>({...b,value:f.target.value}))} /></label>`},enable:{title:"Enable user?",description:"This restores sign-in access for the selected account.",confirmLabel:"Enable",danger:!1,field:r`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value||""}
          onInput=${f=>c(b=>({...b,value:f.target.value}))} /></label>`},role:{title:"Change user role?",description:`Set ${i?.user?.username||"this user"} to ${i?.value?.role||"the selected role"}.`,confirmLabel:"Save role",danger:!1,field:r`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value?.password||""}
          onInput=${f=>c(b=>({...b,value:{...b.value,password:f.target.value}}))} /></label>`},purge:{title:"Delete user permanently?",description:"This removes the account, clips, comments, and auth records. This cannot be undone.",confirmLabel:"Delete user",danger:!0,field:r`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value||""}
          onInput=${f=>c(b=>({...b,value:f.target.value}))} /></label>`},reset:{title:"Create reset link?",description:"This creates a temporary password reset link for the selected user.",confirmLabel:"Create link",danger:!1,field:r`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value||""}
          onInput=${f=>c(b=>({...b,value:f.target.value}))} /></label>`}}[i?.type];return r`<div class="admin-users-layout">
    <div class="admin-users-forms">
      <${rs} isOwner=${d} onCreated=${()=>{o(null),s()}} />
      <${is} isOwner=${d} smtpEnabled=${l}
        onCreated=${f=>{o(f),s()}} />
    </div>
    <div class="panel admin-users-table">
      <div class="section-header">
        <h2>Users</h2>
        <span class="muted">${e.length} total</span>
      </div>
      <${ls} resetLink=${n} />
      <div class="table-wrap">
        <table class="lib-table">
          <thead><tr><th>Username</th><th>Role</th><th>Status</th><th>Storage</th><th>Last login</th><th></th></tr></thead>
          <tbody>
            ${e.map(f=>r`<${ps} key=${f.id} user=${f} currentUser=${a} settings=${t}
              onQuota=${b=>c({type:"quota",user:b,value:""})}
              onReset=${b=>c({type:"reset",user:b,value:""})}
              onDisable=${b=>c({type:"disable",user:b,value:""})}
              onEnable=${b=>c({type:"enable",user:b,value:""})}
              onRole=${(b,w)=>c({type:"role",user:b,value:{role:w,password:""}})}
              onPurge=${b=>c({type:"purge",user:b,value:""})} />`)}
          </tbody>
        </table>
      </div>
    </div>
    <${pe} open=${!!i}
      title=${u?.title}
      body=${u&&r`${u.description} ${u.field}`}
      confirmLabel=${u?.confirmLabel} danger=${u?.danger}
      confirmDisabled=${i?.type==="quota"?!1:i?.type==="role"?!i?.value?.password?.trim():!i?.value?.trim()}
      onConfirm=${h} onCancel=${m} />
  </div>`}function Vt(e){let t=Number(String(e||"").trim());if(!Number.isFinite(t)||t<0)throw new Error("Storage quota must be a non-negative number");return Math.round(t*1024*1024*1024)}le();function ft(e){let t=String(e||"").trim();return t||null}function bn(e){return e==null||e<=0?"":String(Math.round(e/1024**3*100)/100)}function gn({settings:e,isOwner:t,reload:a}){let[n,o]=g(!1),[s,i]=g(!1);async function c(d){if(d.preventDefault(),!n){o(!0);try{let l=new FormData(d.currentTarget),m={allow_vod_uploads:l.get("allow_vod_uploads")==="on",vod_threshold_minutes:Number(l.get("vod_threshold_minutes")||30)};if(s){let h=String(l.get("user_storage_quota_gib")||"").trim();m.user_storage_quota_bytes=h?Vt(h):null}if(t){m.about_text=String(l.get("about_text")||""),m.smtp_enabled=l.get("smtp_enabled")==="on",m.smtp_host=ft(l.get("smtp_host")),m.smtp_port=Number(l.get("smtp_port")||587),m.smtp_tls_mode=String(l.get("smtp_tls_mode")||"starttls"),m.smtp_username=ft(l.get("smtp_username")),m.smtp_from_email=ft(l.get("smtp_from_email")),m.smtp_from_name=ft(l.get("smtp_from_name"));let h=String(l.get("smtp_password")||"").trim();h&&(m.smtp_password=h),l.get("smtp_password_clear")==="on"&&(m.smtp_password_clear=!0)}await k("/api/v1/admin/settings",{method:"PATCH",body:m}),v("Settings saved."),i(!1),a()}catch(l){v(l.message)}finally{o(!1)}}}return r`<form class="admin-settings-page" onSubmit=${c}>
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
            placeholder=${e.user_storage_quota_env_fallback_bytes?`Env default: ${bn(e.user_storage_quota_env_fallback_bytes)} GiB`:"No default quota"}
            value=${bn(e.user_storage_quota_bytes)}
            onInput=${()=>i(!0)} /></label>
        ${e.user_storage_quota_bytes==null&&e.user_storage_quota_env_fallback_bytes?r`<p class="muted">Effective default: ${F(e.user_storage_quota_env_fallback_bytes)} from CLIPLINE_USER_STORAGE_QUOTA_BYTES.</p>`:null}
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
      <button class="btn btn-primary" type="submit" disabled=${n}>${C("save",{size:14})} Save settings</button>
    </div>
  </form>`}function ms(e){return`${(e/100).toFixed(e%100===0?0:1)}%`}function fs(e){switch(e){case"delete_and_retry":return"delete the failed upload and retry from a new session";case"retry":return"retry the current upload request";default:return""}}function _s({upload:e}){let t=Math.max(0,Math.min(1e4,Number(e.progress_basis_points||0))),a=fs(e.recovery_action);return r`<div class="job-item">
    <div class="job-title-line">
      <strong class="mono">${e.id}</strong>
      <span class="badge badge-warn">${ms(t)}</span>
    </div>
    <div class="progress-meter" aria-label="Upload progress"><span style=${`width:${t/100}%`}></span></div>
    <span class="muted">clip ${e.clip_id} — ${F(e.received_size_bytes)} of ${F(e.expected_size_bytes)} — updated ${J(e.updated_at)}</span>
    ${e.failure_reason&&r`<span class="form-error">${e.failure_reason}</span>`}
    ${a&&r`<span class="muted">Recovery: ${a}</span>`}
  </div>`}function $n({job:e}){return r`<div class="job-item">
    <strong>${e.kind} <span class="mono">${e.id}</span></strong>
    <span class="muted">${e.status} — attempts ${e.attempts}/${e.max_attempts} — updated ${J(e.updated_at)} — target ${e.target_type||""}:${e.target_id||""}</span>
    ${e.last_error&&r`<span class="form-error">${e.last_error}</span>`}
  </div>`}function Ht({title:e,items:t,renderItem:a,emptyLabel:n}){return r`<div class="panel">
    <div class="section-header">
      <h2>${e}</h2>
      <span class="muted">${t.length}</span>
    </div>
    ${t.length?r`<div class="job-list">${t.map(a)}</div>`:r`<p class="muted">${n}</p>`}
  </div>`}function vn({failedUploads:e,deadJobs:t,recentErrors:a}){return r`<div class="section">
    <${Ht} title="Failed uploads" items=${e} emptyLabel="No failed uploads."
      renderItem=${n=>r`<${_s} key=${n.id} upload=${n} />`} />
    <${Ht} title="Dead jobs" items=${t} emptyLabel="No dead jobs."
      renderItem=${n=>r`<${$n} key=${n.id} job=${n} />`} />
    <${Ht} title="Recent job errors" items=${a} emptyLabel="No recent job errors."
      renderItem=${n=>r`<${$n} key=${n.id} job=${n} />`} />
  </div>`}le();var yn={grid:{kind:"grid",label:"Category Grid",description:"Portrait artwork used for this category on the Games page."},video:{kind:"hero",label:"Video Art",description:"Wide artwork shown subtly behind video titles and metadata."},icon:{kind:"icon",label:"Icon",description:"Compact artwork used in Library filters and category management."}};function wn(e,t,a){return`/api/v1/admin/game-categories/steamgriddb/games/${encodeURIComponent(e)}/artwork/${encodeURIComponent(t)}/${encodeURIComponent(a)}/preview`}function hs({displayName:e,steamGameId:t,selectedArtworks:a}){return{display_name:e,steamgriddb_game_id:t||null,grid_artwork_id:a?.grid?.id||null,video_artwork_id:a?.video?.id||null,icon_artwork_id:a?.icon?.id||null}}function bs(e,t){return t?e?.steamgriddb_game_id?"Matched":"Not matched":"Not configured"}function gs(e,t,a=""){let n=a.trim().toLocaleLowerCase();return(e||[]).filter(o=>o.id===t?!1:n?[o.display_name,...(o.reported_names||[]).map(s=>s.reported_name)].some(s=>String(s||"").toLocaleLowerCase().includes(n)):!0)}function kn(e){return`/admin/game-categories/${encodeURIComponent(e)}`}function Cn({data:e,reload:t,categoryId:a}){let n=e?.categories||[];if(a){let o=n.find(s=>s.id===a);return o?r`<${vs} key=${o.id} data=${e} reload=${t}
      editing=${o} categories=${n} />`:r`<section class="admin-card">
        <div class="admin-section-heading">
          <div><p class="kicker">Game categories</p><h2>Category not found</h2></div>
          <a class="btn" href="/admin/game-categories">Back to categories</a>
        </div>
        <p class="muted">This category may have been merged or removed.</p>
      </section>`}return r`<section class="admin-card">
    <div class="admin-section-heading"><div><p class="kicker">Library taxonomy</p><h2>Game categories</h2></div></div>
    ${n.length===0?r`<p class="muted">Categories appear automatically when clips report a game name.</p>`:r`<div class="table-wrap"><table class="lib-table admin-category-table">
        <thead><tr><th>Icon</th><th>Category</th><th>Reported names</th><th>Clips</th><th>SteamGridDB</th><th></th></tr></thead>
        <tbody>${n.map(o=>r`<tr key=${o.id}>
          <td>${o.icon_artwork_url?r`<img class="category-icon-thumb" src=${o.icon_artwork_url} alt="" loading="lazy" />`:r`<span class="category-artwork-empty">—</span>`}</td>
          <td><strong>${o.display_name}</strong></td>
          <td><div class="category-name-chips">${(o.reported_names||[]).map(s=>r`<code>${s.reported_name}</code>`)}</div></td>
          <td>${o.clip_count}</td>
          <td><span class=${`category-status ${o.steamgriddb_game_id?"is-matched":""}`}>${bs(o,e?.steamgriddb_configured)}</span></td>
          <td><a class="btn" href=${kn(o.id)}>${C("edit",{size:14})} Edit</a></td>
        </tr>`)}</tbody>
      </table></div>`}
  </section>`}function $s({slot:e,config:t,steamGameId:a,selected:n,active:o,results:s,busy:i,error:c,onToggle:d,onClear:l,onSelect:m}){return r`<section class=${`category-artwork-slot artwork-slot-${e}`}>
    <div class="category-artwork-slot-heading">
      <div><strong>${t.label}</strong><small>${t.description}</small></div>
      <div class="actions">
        ${n&&r`<button class="btn btn-small" type="button" onClick=${l}>Clear</button>`}
        ${!o&&r`<button class="btn btn-small" type="button" aria-expanded="false" onClick=${d}>
          ${n?"Change artwork":"Choose artwork"}
        </button>`}
      </div>
    </div>
    ${n&&r`<img class="category-selected-artwork" src=${n.preview_url||wn(a,t.kind,n.id)} alt="" />`}
    ${o&&r`<div class="category-artwork-browser">
      ${i?r`<small class="muted">Loading artwork…</small>`:""}
      ${c&&r`<small class="field-error">${c}</small>`}
      ${!i&&!c&&s.length===0&&r`<small class="muted">No artwork found for this slot.</small>`}
      ${s.length>0&&r`<small class="muted">Scroll to browse. Click an image to select it.</small>`}
      <div class="category-artwork-grid">
        ${s.map(h=>r`<button type="button"
          class=${`category-artwork-option ${n?.id===h.id?"is-selected":""}`}
          aria-label=${`Select ${t.label} artwork ${h.id}`}
          onClick=${()=>m(h)}>
          <img src=${h.preview_url||wn(a,h.kind,h.id)} alt="" loading="lazy" />
        </button>`)}
      </div>
    </div>`}
  </section>`}function vs({data:e,reload:t,editing:a,categories:n}){let[o,s]=g(a.display_name),[i,c]=g(a.display_name),[d,l]=g(a.steamgriddb_game_id||null),[m,h]=g(!1),[u,f]=g([]),[b,w]=g(!1),[P,R]=g(""),[S,D]=g(null),[O,I]=g([]),[U,q]=g(!1),[V,Y]=g(""),[A,G]=g({grid:a.grid_artwork_id?{id:a.grid_artwork_id,kind:"grid",preview_url:a.grid_artwork_url}:null,video:a.video_artwork_id?{id:a.video_artwork_id,kind:"hero",preview_url:a.video_artwork_url}:null,icon:a.icon_artwork_id?{id:a.icon_artwork_id,kind:"icon",preview_url:a.icon_artwork_url}:null}),[_e,me]=g(""),[oe,we]=g(""),[ee,X]=g(!1),[ce,ue]=g(null),[te,ae]=g(!1),ke=Xe(()=>gs(n,a.id,_e),[n,a.id,_e]),se=n.find(p=>p.id===oe)||null;E(()=>{if(!e?.steamgriddb_configured||!m||i.trim().length<2){f([]),w(!1),R("");return}let p=!1,$=i.trim();w(!0),R("");let M=setTimeout(async()=>{try{let L=await k(`/api/v1/admin/game-categories/steamgriddb/search?q=${encodeURIComponent($)}`);p||f(L||[])}catch(L){p||(f([]),R(L.message))}finally{p||w(!1)}},300);return()=>{p=!0,clearTimeout(M)}},[e?.steamgriddb_configured,m,i]),E(()=>{if(!d||!e?.steamgriddb_configured||!S){I([]),Y("");return}let p=yn[S].kind,$=!1;return q(!0),Y(""),k(`/api/v1/admin/game-categories/steamgriddb/games/${encodeURIComponent(d)}/artwork?kind=${encodeURIComponent(p)}`).then(M=>{$||I(M||[])}).catch(M=>{$||(I([]),Y(M.message))}).finally(()=>{$||q(!1)}),()=>{$=!0}},[e?.steamgriddb_configured,d,S]);function be(p){l(p.id),c(p.name),s(p.name),h(!1),f([]),D(null),I([]),G({grid:null,video:null,icon:null})}function xe(){l(null),G({grid:null,video:null,icon:null}),D(null),I([]),h(!0)}async function fe(p){if(p.preventDefault(),!(!a||ee)){X(!0);try{await k(`/api/v1/admin/game-categories/${encodeURIComponent(a.id)}`,{method:"PATCH",body:hs({displayName:o,steamGameId:d,selectedArtworks:A})}),v("Game category updated."),await t()}catch($){v($.message)}finally{X(!1)}}}async function y(){let p=ce;if(ue(null),!(!p||ee)){X(!0);try{await k(`/api/v1/admin/game-categories/${encodeURIComponent(p.category.id)}/reported-names/${encodeURIComponent(p.name.id)}/separate`,{method:"POST"}),v(`${p.name.reported_name} separated into its own category.`),await t()}catch($){v($.message),($.status===404||$.status===409)&&await t()}finally{X(!1)}}}async function H(){if(ae(!1),!(!a||!se||ee)){X(!0);try{await k(`/api/v1/admin/game-categories/${encodeURIComponent(a.id)}/merge`,{method:"POST",body:{destination_category_id:se.id}}),v(`${a.display_name} merged into ${se.display_name}.`),await t(),W(kn(se.id))}catch(p){v(p.message),(p.status===404||p.status===409)&&await t()}finally{X(!1)}}}return r`<div class="admin-categories-page">
    <form class="admin-card admin-category-editor" onSubmit=${fe}>
      <div class="admin-section-heading category-editor-heading">
        <a class="category-back-arrow" href="/admin/game-categories" aria-label="Back to game categories">
          ${C("arrowLeft",{size:20})}
        </a>
        <div><p class="kicker">Category settings</p><h2>${a.display_name}</h2></div>
      </div>

      <section class="category-settings-section">
        <h3>Appearance</h3>
        <label class="field"><span>Display name</span>
          <input class="input" maxlength="200" required value=${o}
            onInput=${p=>s(p.target.value)} />
        </label>
      </section>

      <section class="category-settings-section">
        <h3>Game metadata</h3>
        ${e?.steamgriddb_configured?r`<label class="field steamgriddb-search"><span>Find on SteamGridDB</span>
          <input class="input" value=${i} placeholder="Enter the official game title"
            onFocus=${()=>h(!0)}
            onInput=${p=>{c(p.target.value),h(!0)}} />
          ${b&&r`<small class="muted">Searching…</small>`}
          ${P&&r`<small class="field-error">${P}</small>`}
          ${m&&!b&&!P&&i.trim().length>=2&&u.length===0&&r`<small class="muted">No results. Try the full official game title.</small>`}
          ${m&&u.length>0&&r`<div class="steamgriddb-results">
            ${u.map(p=>r`<button type="button" onClick=${()=>be(p)}>
              <strong>${p.name}</strong><small>#${p.id}${p.verified?" \xB7 verified":""}</small>
            </button>`)}
          </div>`}
          ${d&&r`<span class="steamgriddb-selected">SteamGridDB #${d}
            <button class="btn btn-small" type="button" onClick=${xe}>Clear match</button>
          </span>`}
        </label>`:r`<p class="muted"><strong>SteamGridDB is not configured.</strong> Set the API key file to enable matching and artwork.</p>`}
        ${d&&r`<div class="category-artwork-slots">
          ${Object.entries(yn).map(([p,$])=>r`<${$s}
            key=${p}
            slot=${p}
            config=${$}
            steamGameId=${d}
            selected=${A[p]}
            active=${S===p}
            results=${S===p?O:[]}
            busy=${S===p&&U}
            error=${S===p?V:""}
            onToggle=${()=>{q(S!==p),I([]),Y(""),D(M=>M===p?null:p)}}
            onClear=${()=>G(M=>({...M,[p]:null}))}
            onSelect=${M=>{G(L=>({...L,[p]:M})),D(null),I([]),q(!1)}} />`)}
        </div>`}
      </section>

      <section class="category-settings-section">
        <h3>Reported names</h3>
        <div class="category-reported-name-list">
          ${(a.reported_names||[]).map(p=>r`<div class="category-reported-name">
            <span><code>${p.reported_name}</code><small>${p.clip_count} clip${p.clip_count===1?"":"s"}</small></span>
            ${a.reported_names.length>1&&r`<button class="btn" type="button" disabled=${ee}
              onClick=${()=>ue({category:a,name:p})}>Separate</button>`}
          </div>`)}
        </div>
      </section>

      <section class="category-settings-section">
        <h3>Merge with another category</h3>
        <p class="muted">All reported names move to the destination. Its display name, SteamGridDB match, and artwork win.</p>
        <label class="field"><span>Search categories</span>
          <input class="input" value=${_e} onInput=${p=>me(p.target.value)} />
        </label>
        <label class="field"><span>Destination</span>
          <select class="input" value=${oe} onChange=${p=>we(p.target.value)}>
            <option value="">Select a category</option>
            ${ke.map(p=>r`<option value=${p.id}>${p.display_name} · ${(p.reported_names||[]).map($=>$.reported_name).join(", ")}</option>`)}
          </select>
        </label>
        <button class="btn btn-danger" type="button" disabled=${ee||!oe}
          onClick=${()=>ae(!0)}>Merge category</button>
      </section>

      <div class="admin-form-actions">
        <button class="btn btn-primary" type="submit" disabled=${ee}>${C("save",{size:14})} Save changes</button>
      </div>
    </form>

    <${pe} open=${!!ce} title="Separate this reported name?"
      body=${ce?`${ce.name.reported_name} will become a new category with no SteamGridDB match or artwork.`:""}
      confirmLabel="Separate" onCancel=${()=>ue(null)} onConfirm=${y} />
    <${pe} open=${te} title="Merge these categories?"
      body=${a&&se?`${a.display_name} will disappear. ${(a.reported_names||[]).map(p=>p.reported_name).join(", ")} will move to ${se.display_name}, whose appearance and metadata will win.`:""}
      confirmLabel="Merge category" danger onCancel=${()=>ae(!1)} onConfirm=${H} />
  </div>`}var Sn=[["overview","server","Overview"],["users","users","Users"],["categories","film","Game categories"],["settings","sliders","Settings"],["jobs","alert","Jobs"]];function ys(e){return e?.role==="admin"||e?.role==="owner"}async function ws(e){let t={signal:e},[a,n,o,s,i,c,d]=await Promise.all([k("/api/v1/admin/overview",t),k("/api/v1/admin/settings",t),k("/api/v1/users",t),k("/api/v1/admin/game-categories",t),k("/api/v1/admin/uploads/failed?limit=50",t),k("/api/v1/admin/jobs/dead?limit=50",t),k("/api/v1/admin/jobs/recent-errors?limit=50",t)]);return{overview:a,settings:n,users:o,categories:s,failedUploads:i,deadJobs:c,recentErrors:d}}function xn({route:e}){let{user:t}=j(N),a=ys(t),n=!!(t&&!a),o=Sn.some(([u])=>u===e.tab)?e.tab:"overview",[s,i]=g(null),[c,d]=g(0),{data:l,error:m}=Be(a?`admin:${c}`:null,ws),h=()=>d(u=>u+1);return E(()=>{n&&(v("Admin access required."),W("/library"))},[n]),a?r`<main class="page">
    <h1>Admin</h1>
    <p class="page-subtitle">Accounts, instance summary, and processing diagnostics.</p>
    <nav class="ad-tabs" aria-label="Admin views">
      ${Sn.map(([u,f,b])=>r`<a key=${u} class=${`ad-tab ${u===o?"ad-tab-on":""}`}
        href=${u==="categories"?"/admin/game-categories":`/admin?tab=${u}`}
        aria-current=${u===o?"page":void 0}>${C(f,{size:14})} ${b}</a>`)}
    </nav>
    ${m?r`<${Q} name="alert" title="Couldn't load admin data" body=${m.message} />`:l?o==="users"?r`<${hn} users=${l.users} settings=${l.settings} currentUser=${t}
          resetLink=${s} setResetLink=${i} reload=${h} />`:o==="settings"?r`<${gn} settings=${l.settings} isOwner=${t?.role==="owner"} reload=${h} />`:o==="categories"?r`<${Cn} data=${l.categories} reload=${h} categoryId=${e.categoryId} />`:o==="jobs"?r`<${vn} failedUploads=${l.failedUploads} deadJobs=${l.deadJobs} recentErrors=${l.recentErrors} />`:r`<${_n} overview=${l.overview} deadJobs=${l.deadJobs} failedUploads=${l.failedUploads} />`:r`<p class="empty-state">Loading admin data…</p>`}
  </main>`:null}le();function Tn(e){let t=String(e||"").trim();return t||null}async function ks(e){let t=new Headers;t.set("Accept","application/json"),t.set("Content-Type",e.type||"application/octet-stream");let a=Mt();a&&t.set("X-CSRF-Token",a);let n=await fetch("/api/v1/me/avatar",{method:"PUT",credentials:"same-origin",headers:t,body:e}),o=await n.json().catch(()=>({}));if(!n.ok)throw new Error(o.error||n.statusText||"Avatar upload failed");return o}function Pn(e){N.set({...N.get(),user:e})}function Cs({user:e}){let[t,a]=g(!1);async function n(o){if(o.preventDefault(),t)return;a(!0);let s=new FormData(o.currentTarget);try{let i=await k("/api/v1/me/profile",{method:"PATCH",body:{display_name:Tn(s.get("display_name")),bio:Tn(s.get("bio"))}});Pn(i),v("Profile saved.")}catch(i){v(i.message)}finally{a(!1)}}return r`<form class="profile-form" onSubmit=${n}>
    <label class="field"><span>Display name</span>
      <input class="input" name="display_name" maxlength="120" value=${e.display_name||""} placeholder=${e.username} /></label>
    <label class="field"><span>Bio</span>
      <textarea class="input" name="bio" rows="5" maxlength="2000" placeholder="Tell people what you upload.">${e.bio||""}</textarea></label>
    <div class="clip-inline-actions">
      <button class="btn btn-primary" type="submit" disabled=${t}>${C("save",{size:14})} Save profile</button>
    </div>
  </form>`}function Ss({user:e}){let[t,a]=g(!1);async function n(o){if(o.preventDefault(),t)return;let s=o.currentTarget.elements.avatar?.files?.[0];if(!s){v("Choose an avatar image first.");return}a(!0);try{let i=await ks(s);Pn(i),v("Avatar uploaded.")}catch(i){v(i.message)}finally{a(!1)}}return r`<form class="profile-form" onSubmit=${n}>
    <label class="field"><span>Avatar</span>
      <input name="avatar" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
      <small>PNG, JPEG, WebP, or GIF. Max 2 MiB.</small></label>
    <div class="clip-inline-actions">
      <button class="btn" type="submit" disabled=${t}>${C("upload",{size:14})} Upload avatar</button>
    </div>
  </form>`}function Mn(){let{user:e}=j(N);return e?r`<main class="page">
    <h1>Profile</h1>
    <p class="page-subtitle">Public identity and avatar.</p>
    <div class="profile-settings-header">
      <${Se} user=${e} size=${72} />
      <div>
        <h2>${e.display_name||e.username}</h2>
        <p>@${e.username} · ${e.role}</p>
      </div>
    </div>
    <${Cs} user=${e} />
    <${Ss} user=${e} />
    <div class="profile-public-link">
      <a class="btn" href=${`/u/${encodeURIComponent(e.username)}`}>${C("external",{size:14})} View public profile</a>
    </div>
  </main>`:null}le();async function xs(e){let t={signal:e},[a,n]=await Promise.all([k("/api/v1/auth/sessions",t),k("/api/v1/auth/device-tokens",t)]);return{sessions:a,deviceTokens:n}}function Ts({item:e,onRevoke:t}){return r`<div class="management-item">
    <div>
      <strong>${e.user_agent||"Unknown browser"}</strong>
      <div class="meta-line">
        <span>${e.ip_address||"Unknown IP"}</span>
        <span>Last used ${J(e.last_used_at||e.created_at)}</span>
        <span>Expires ${J(e.expires_at)}</span>
      </div>
    </div>
    <div class="actions">
      ${e.current&&r`<span class="badge badge-public">Current</span>`}
      <button class="btn btn-danger" type="button" onClick=${()=>t(e)}>${C("x",{size:14})} Revoke</button>
    </div>
  </div>`}function Ps({item:e,onRevoke:t}){let a=!!e.revoked_at;return r`<div class="management-item">
    <div>
      <strong>${e.name}</strong>
      <div class="meta-line">
        <span>Created ${J(e.created_at)}</span>
        <span>Last used ${J(e.last_used_at)}</span>
        ${e.expires_at&&r`<span>Expires ${J(e.expires_at)}</span>`}
        ${a&&r`<span>Revoked ${J(e.revoked_at)}</span>`}
      </div>
    </div>
    <div class="actions">
      <span class=${`badge ${a?"badge-private":"badge-public"}`}>${a?"Revoked":"Active"}</span>
      <button class="btn btn-danger" type="button" disabled=${a} onClick=${()=>t(e)}>${C("x",{size:14})} Revoke</button>
    </div>
  </div>`}function Rn(){let[e,t]=g(0),{data:a,error:n}=Be(e,xs),[o,s]=g(null),i=()=>t(d=>d+1);async function c(){let d=o;s(null);try{if(d.kind==="session"){if(await k(`/api/v1/auth/sessions/${encodeURIComponent(d.item.id)}`,{method:"DELETE",body:{}}),d.item.current){$e(null),N.set({user:null,csrfToken:null,ready:!0}),v("Current session revoked."),W("/login");return}v("Session revoked.")}else await k(`/api/v1/auth/device-tokens/${encodeURIComponent(d.item.id)}`,{method:"DELETE",body:{}}),v("Device token revoked.");i()}catch(l){v(l.message)}}return n?r`<main class="page"><${Q} name="alert" title="Couldn't load account data" body=${n.message} /></main>`:r`<main class="page">
    <h1>Account</h1>
    <p class="page-subtitle">Sessions and device tokens.</p>
    ${a?r`<div class="account-grid">
          <div class="panel">
            <div class="section-header"><h2>Browser sessions</h2><span class="muted">${a.sessions.length} active</span></div>
            ${a.sessions.length?r`<div class="management-list">${a.sessions.map(d=>r`<${Ts} key=${d.id} item=${d}
                  onRevoke=${l=>s({kind:"session",item:l})} />`)}</div>`:r`<p class="muted">No active sessions.</p>`}
          </div>
          <div class="panel">
            <div class="section-header"><h2>Device tokens</h2><span class="muted">${a.deviceTokens.length} total</span></div>
            ${a.deviceTokens.length?r`<div class="management-list">${a.deviceTokens.map(d=>r`<${Ps} key=${d.id} item=${d}
                  onRevoke=${l=>s({kind:"device",item:l})} />`)}</div>`:r`<p class="muted">No device tokens.</p>`}
          </div>
        </div>`:r`<p class="empty-state">Loading account data…</p>`}
    <${pe} open=${!!o}
      title=${o?.kind==="session"?"Revoke browser session?":"Revoke device token?"}
      body=${o?.kind==="session"?o.item.current?"This signs you out of the current browser session.":"This signs out that browser session immediately.":"The desktop client using this token will need to reconnect."}
      confirmLabel="Revoke" danger
      onConfirm=${c} onCancel=${()=>s(null)} />
  </main>`}function En({route:e}){let{user:t}=j(N),a=`/api/v1/public/users/${encodeURIComponent(e.username)}`,{data:n,error:o}=ie(a);if(o)return r`<main class="page"><${Q} name="alert" title="Profile unavailable" body=${o.message} /></main>`;if(!n)return r`<main class="page"><p class="empty-state">Loading profile…</p></main>`;let s=t&&t.username.toLowerCase()===n.username.toLowerCase(),i=n.clips||[];return r`<main class="page">
    <header class="public-user-header">
      <${Se} user=${n} size=${72} />
      <div class="public-user-header-body">
        <div class="public-user-title-row">
          <div>
            <h1>${n.display_name||n.username}</h1>
            <p>@${n.username}</p>
          </div>
          ${s&&r`<a class="btn" href="/profile">${C("edit",{size:14})} Edit profile</a>`}
        </div>
        ${n.bio&&r`<p class="public-user-bio">${n.bio}</p>`}
        <p class="meta-line">${n.clip_count} public clip${n.clip_count===1?"":"s"}</p>
      </div>
    </header>
    ${i.length===0?r`<${Q} name="film" title="No public clips yet" />`:r`<div class="card-grid">
          ${i.map(c=>r`<${Ee} key=${c.share_id}
            clip=${{...c,thumbnail_url:ye(c),media_url:Re(c)}}
            href=${`/c/${encodeURIComponent(c.share_id)}`} showAuthor=${!1} />`)}
        </div>`}
  </main>`}var Un="Clipline is a self-hosted clip library for saved gameplay moments.";function _t(e,t){return r`<div><dt>${e}</dt><dd>${t}</dd></div>`}function Dn(){let{data:e}=ie("/api/v1/about",0,{about_text:Un}),t=e?.about_text||Un;return r`<main class="page">
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
  </main>`}var Ms={publicLibrary:Nt,publicGame:Nt,games:Ga,library:Qa,clip:zt,public:zt,login:mn,resetPassword:fn,admin:xn,profile:Mn,account:Rn,publicUser:En,about:Dn},In=Ne(window.location.pathname,window.location.search).name;function Rs(){let e=Ia();In=e.name;let{ready:t,user:a}=j(N),n=t&&Ea(e.name,a);if(E(()=>{n&&W("/login")},[n]),!t||n)return r`<div class="boot">Loading…</div>`;let o=Ms[e.name],s=e.name==="login"||e.name==="resetPassword";return r`<div class="ui" onClick=${Aa}>
    ${!s&&r`<${Na} active=${Et(e)} route=${e} />`}
    <${o} route=${e} />
    ${!s&&r`<${Ba} active=${Ua(e)} />`}
    <${za} />
  </div>`}window.addEventListener("clipline:unauthorized",()=>{$e(null),N.set({user:null,csrfToken:null,ready:!0}),Rt(In)||W("/login")});(async()=>{try{let t=await k("/api/v1/auth/me");$e(t.csrf_token),N.set({user:t.user,csrfToken:t.csrf_token,ready:!0})}catch{$e(null),N.set({user:null,csrfToken:null,ready:!0})}let e=document.querySelector("#app");e.textContent="",da(r`<${Rs} />`,e)})();
