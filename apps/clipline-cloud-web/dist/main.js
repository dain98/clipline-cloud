var ka=Object.defineProperty;var wa=(e,t)=>()=>(e&&(t=e(e=0)),t);var Sa=(e,t)=>{for(var n in t)ka(e,n,{get:t[n],enumerable:!0})};var sn={};Sa(sn,{ApiError:()=>be,api:()=>k,getCsrfToken:()=>vt,setCsrfToken:()=>Ce});function Ce(e){qe=e}function vt(){return qe}async function k(e,t={}){let n=(t.method||"GET").toUpperCase(),a=new Headers(t.headers||{});a.set("Accept","application/json");let o=t.body;o&&typeof o!="string"&&(a.set("Content-Type","application/json"),o=JSON.stringify(o)),!["GET","HEAD","OPTIONS"].includes(n)&&qe&&a.set("X-CSRF-Token",qe);let s=await fetch(e,{...t,body:o,credentials:"same-origin",headers:a,method:n}),c=(s.headers.get("content-type")||"").includes("application/json")?await s.json():await s.text();if(!s.ok){s.status===401&&window.dispatchEvent(new CustomEvent("clipline:unauthorized"));let d=typeof c=="object"&&c?.error?c.error:s.statusText;throw new be(d||"Request failed",s.status)}return c}var qe,be,ee=wa(()=>{qe=null;be=class extends Error{constructor(t,n){super(t),this.status=n}}});var Oe,N,Ht,xa,he,Ft,qt,Gt,ut,Le,xe,Kt,mt,dt,pt,Ca,ze={},Fe=[],Ta=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,Ve=Array.isArray;function me(e,t){for(var n in t)e[n]=t[n];return e}function ft(e){e&&e.parentNode&&e.parentNode.removeChild(e)}function _t(e,t,n){var a,o,s,i={};for(s in t)s=="key"?a=t[s]:s=="ref"?o=t[s]:i[s]=t[s];if(arguments.length>2&&(i.children=arguments.length>3?Oe.call(arguments,2):n),typeof e=="function"&&e.defaultProps!=null)for(s in e.defaultProps)i[s]===void 0&&(i[s]=e.defaultProps[s]);return Ae(e,i,a,o,null)}function Ae(e,t,n,a,o){var s={type:e,props:t,key:n,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:o??++Ht,__i:-1,__u:0};return o==null&&N.vnode!=null&&N.vnode(s),s}function He(e){return e.children}function Ne(e,t){this.props=e,this.context=t}function ge(e,t){if(t==null)return e.__?ge(e.__,e.__i+1):null;for(var n;t<e.__k.length;t++)if((n=e.__k[t])!=null&&n.__e!=null)return n.__e;return typeof e.type=="function"?ge(e):null}function Ma(e){if(e.__P&&e.__d){var t=e.__v,n=t.__e,a=[],o=[],s=me({},t);s.__v=t.__v+1,N.vnode&&N.vnode(s),ht(e.__P,s,t,e.__n,e.__P.namespaceURI,32&t.__u?[n]:null,a,n??ge(t),!!(32&t.__u),o),s.__v=t.__v,s.__.__k[s.__i]=s,Yt(a,s,o),t.__e=t.__=null,s.__e!=n&&Wt(s)}}function Wt(e){if((e=e.__)!=null&&e.__c!=null)return e.__e=e.__c.base=null,e.__k.some(function(t){if(t!=null&&t.__e!=null)return e.__e=e.__c.base=t.__e}),Wt(e)}function Bt(e){(!e.__d&&(e.__d=!0)&&he.push(e)&&!Be.__r++||Ft!=N.debounceRendering)&&((Ft=N.debounceRendering)||qt)(Be)}function Be(){try{for(var e,t=1;he.length;)he.length>t&&he.sort(Gt),e=he.shift(),t=he.length,Ma(e)}finally{he.length=Be.__r=0}}function jt(e,t,n,a,o,s,i,c,d,u,p){var b,l,m,h,g,w,x,y=a&&a.__k||Fe,P=t.length;for(d=Pa(n,t,y,d,P),b=0;b<P;b++)(m=n.__k[b])!=null&&(l=m.__i!=-1&&y[m.__i]||ze,m.__i=b,w=ht(e,m,l,o,s,i,c,d,u,p),h=m.__e,m.ref&&l.ref!=m.ref&&(l.ref&&bt(l.ref,null,m),p.push(m.ref,m.__c||h,m)),g==null&&h!=null&&(g=h),(x=!!(4&m.__u))||l.__k===m.__k?(d=Zt(m,d,e,x),x&&l.__e&&(l.__e=null)):typeof m.type=="function"&&w!==void 0?d=w:h&&(d=h.nextSibling),m.__u&=-7);return n.__e=g,d}function Pa(e,t,n,a,o){var s,i,c,d,u,p=n.length,b=p,l=0;for(e.__k=new Array(o),s=0;s<o;s++)(i=t[s])!=null&&typeof i!="boolean"&&typeof i!="function"?(typeof i=="string"||typeof i=="number"||typeof i=="bigint"||i.constructor==String?i=e.__k[s]=Ae(null,i,null,null,null):Ve(i)?i=e.__k[s]=Ae(He,{children:i},null,null,null):i.constructor===void 0&&i.__b>0?i=e.__k[s]=Ae(i.type,i.props,i.key,i.ref?i.ref:null,i.__v):e.__k[s]=i,d=s+l,i.__=e,i.__b=e.__b+1,c=null,(u=i.__i=Ea(i,n,d,b))!=-1&&(b--,(c=n[u])&&(c.__u|=2)),c==null||c.__v==null?(u==-1&&(o>p?l--:o<p&&l++),typeof i.type!="function"&&(i.__u|=4)):u!=d&&(u==d-1?l--:u==d+1?l++:(u>d?l--:l++,i.__u|=4))):e.__k[s]=null;if(b)for(s=0;s<p;s++)(c=n[s])!=null&&(2&c.__u)==0&&(c.__e==a&&(a=ge(c)),Qt(c,c));return a}function Zt(e,t,n,a){var o,s;if(typeof e.type=="function"){for(o=e.__k,s=0;o&&s<o.length;s++)o[s]&&(o[s].__=e,t=Zt(o[s],t,n,a));return t}e.__e!=t&&(a&&(t&&e.type&&!t.parentNode&&(t=ge(e)),n.insertBefore(e.__e,t||null)),t=e.__e);do t=t&&t.nextSibling;while(t!=null&&t.nodeType==8);return t}function Ea(e,t,n,a){var o,s,i,c=e.key,d=e.type,u=t[n],p=u!=null&&(2&u.__u)==0;if(u===null&&c==null||p&&c==u.key&&d==u.type)return n;if(a>(p?1:0)){for(o=n-1,s=n+1;o>=0||s<t.length;)if((u=t[i=o>=0?o--:s++])!=null&&(2&u.__u)==0&&c==u.key&&d==u.type)return i}return-1}function Ot(e,t,n){t[0]=="-"?e.setProperty(t,n??""):e[t]=n==null?"":typeof n!="number"||Ta.test(t)?n:n+"px"}function Ie(e,t,n,a,o){var s,i;e:if(t=="style")if(typeof n=="string")e.style.cssText=n;else{if(typeof a=="string"&&(e.style.cssText=a=""),a)for(t in a)n&&t in n||Ot(e.style,t,"");if(n)for(t in n)a&&n[t]==a[t]||Ot(e.style,t,n[t])}else if(t[0]=="o"&&t[1]=="n")s=t!=(t=t.replace(Kt,"$1")),i=t.toLowerCase(),t=i in e||t=="onFocusOut"||t=="onFocusIn"?i.slice(2):t.slice(2),e.l||(e.l={}),e.l[t+s]=n,n?a?n[xe]=a[xe]:(n[xe]=mt,e.addEventListener(t,s?pt:dt,s)):e.removeEventListener(t,s?pt:dt,s);else{if(o=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&t[4]!="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&n==1?"":n))}}function Vt(e){return function(t){if(this.l){var n=this.l[t.type+e];if(t[Le]==null)t[Le]=mt++;else if(t[Le]<n[xe])return;return n(N.event?N.event(t):t)}}}function ht(e,t,n,a,o,s,i,c,d,u){var p,b,l,m,h,g,w,x,y,P,U,K,Q,oe,ne,Y,z=t.type;if(t.constructor!==void 0)return null;128&n.__u&&(d=!!(32&n.__u),s=[c=t.__e=n.__e]),(p=N.__b)&&p(t);e:if(typeof z=="function"){b=i.length;try{if(y=t.props,P=z.prototype&&z.prototype.render,U=(p=z.contextType)&&a[p.__c],K=p?U?U.props.value:p.__:a,n.__c?x=(l=t.__c=n.__c).__=l.__E:(P?t.__c=l=new z(y,K):(t.__c=l=new Ne(y,K),l.constructor=z,l.render=Da),U&&U.sub(l),l.state||(l.state={}),l.__n=a,m=l.__d=!0,l.__h=[],l._sb=[]),P&&l.__s==null&&(l.__s=l.state),P&&z.getDerivedStateFromProps!=null&&(l.__s==l.state&&(l.__s=me({},l.__s)),me(l.__s,z.getDerivedStateFromProps(y,l.__s))),h=l.props,g=l.state,l.__v=t,m)P&&z.getDerivedStateFromProps==null&&l.componentWillMount!=null&&l.componentWillMount(),P&&l.componentDidMount!=null&&l.__h.push(l.componentDidMount);else{if(P&&z.getDerivedStateFromProps==null&&y!==h&&l.componentWillReceiveProps!=null&&l.componentWillReceiveProps(y,K),t.__v==n.__v||!l.__e&&l.shouldComponentUpdate!=null&&l.shouldComponentUpdate(y,l.__s,K)===!1){t.__v!=n.__v&&(l.props=y,l.state=l.__s,l.__d=!1),t.__e=n.__e,t.__k=n.__k,t.__k.some(function(se){se&&(se.__=t)}),Fe.push.apply(l.__h,l._sb),l._sb=[],l.__h.length&&i.push(l);break e}l.componentWillUpdate!=null&&l.componentWillUpdate(y,l.__s,K),P&&l.componentDidUpdate!=null&&l.__h.push(function(){l.componentDidUpdate(h,g,w)})}if(l.context=K,l.props=y,l.__P=e,l.__e=!1,Q=N.__r,oe=0,P)l.state=l.__s,l.__d=!1,Q&&Q(t),p=l.render(l.props,l.state,l.context),Fe.push.apply(l.__h,l._sb),l._sb=[];else do l.__d=!1,Q&&Q(t),p=l.render(l.props,l.state,l.context),l.state=l.__s;while(l.__d&&++oe<25);l.state=l.__s,l.getChildContext!=null&&(a=me(me({},a),l.getChildContext())),P&&!m&&l.getSnapshotBeforeUpdate!=null&&(w=l.getSnapshotBeforeUpdate(h,g)),ne=p!=null&&p.type===He&&p.key==null?Xt(p.props.children):p,c=jt(e,Ve(ne)?ne:[ne],t,n,a,o,s,i,c,d,u),l.base=t.__e,t.__u&=-161,l.__h.length&&i.push(l),x&&(l.__E=l.__=null)}catch(se){if(i.length=b,t.__v=null,d||s!=null){if(se.then){for(t.__u|=d?160:128;c&&c.nodeType==8&&c.nextSibling;)c=c.nextSibling;s!=null&&(s[s.indexOf(c)]=null),t.__e=c}else if(s!=null)for(Y=s.length;Y--;)ft(s[Y])}else t.__e=n.__e;t.__k==null&&(t.__k=n.__k||[]),se.then||Jt(t),N.__e(se,t,n)}}else s==null&&t.__v==n.__v?(t.__k=n.__k,t.__e=n.__e):c=t.__e=Ra(n.__e,t,n,a,o,s,i,d,u);return(p=N.diffed)&&p(t),128&t.__u?void 0:c}function Jt(e){e&&(e.__c&&(e.__c.__e=!0),e.__k&&e.__k.some(Jt))}function Yt(e,t,n){for(var a=0;a<n.length;a++)bt(n[a],n[++a],n[++a]);N.__c&&N.__c(t,e),e.some(function(o){try{e=o.__h,o.__h=[],e.some(function(s){s.call(o)})}catch(s){N.__e(s,o.__v)}})}function Xt(e){return typeof e!="object"||e==null||e.__b>0?e:Ve(e)?e.map(Xt):e.constructor!==void 0?null:me({},e)}function Ra(e,t,n,a,o,s,i,c,d){var u,p,b,l,m,h,g,w=n.props||ze,x=t.props,y=t.type;if(y=="svg"?o="http://www.w3.org/2000/svg":y=="math"?o="http://www.w3.org/1998/Math/MathML":o||(o="http://www.w3.org/1999/xhtml"),s!=null){for(u=0;u<s.length;u++)if((m=s[u])&&"setAttribute"in m==!!y&&(y?m.localName==y:m.nodeType==3)){e=m,s[u]=null;break}}if(e==null){if(y==null)return document.createTextNode(x);e=document.createElementNS(o,y,x.is&&x),c&&(N.__m&&N.__m(t,s),c=!1),s=null}if(y==null)w===x||c&&e.data==x||(e.data=x);else{if(s=y=="textarea"&&x.defaultValue!=null?null:s&&Oe.call(e.childNodes),!c&&s!=null)for(w={},u=0;u<e.attributes.length;u++)w[(m=e.attributes[u]).name]=m.value;for(u in w)m=w[u],u=="dangerouslySetInnerHTML"?b=m:u=="children"||u in x||u=="value"&&"defaultValue"in x||u=="checked"&&"defaultChecked"in x||Ie(e,u,null,m,o);for(u in x)m=x[u],u=="children"?l=m:u=="dangerouslySetInnerHTML"?p=m:u=="value"?h=m:u=="checked"?g=m:c&&typeof m!="function"||w[u]===m||Ie(e,u,m,w[u],o);if(p)c||b&&(p.__html==b.__html||p.__html==e.innerHTML)||(e.innerHTML=p.__html),t.__k=[];else if(b&&(e.innerHTML=""),jt(t.type=="template"?e.content:e,Ve(l)?l:[l],t,n,a,y=="foreignObject"?"http://www.w3.org/1999/xhtml":o,s,i,s?s[0]:n.__k&&ge(n,0),c,d),s!=null)for(u=s.length;u--;)ft(s[u]);c&&y!="textarea"||(u="value",y=="progress"&&h==null?e.removeAttribute("value"):h!=null&&(h!==e[u]||y=="progress"&&!h||y=="option"&&h!=w[u])&&Ie(e,u,h,w[u],o),u="checked",g!=null&&g!=e[u]&&Ie(e,u,g,w[u],o))}return e}function bt(e,t,n){try{if(typeof e=="function"){var a=typeof e.__u=="function";a&&e.__u(),a&&t==null||(e.__u=e(t))}else e.current=t}catch(o){N.__e(o,n)}}function Qt(e,t,n){var a,o;if(N.unmount&&N.unmount(e),(a=e.ref)&&(a.current&&a.current!=e.__e||bt(a,null,t)),(a=e.__c)!=null){if(a.componentWillUnmount)try{a.componentWillUnmount()}catch(s){N.__e(s,t)}a.base=a.__P=a.__n=null}if(a=e.__k)for(o=0;o<a.length;o++)a[o]&&Qt(a[o],t,n||typeof e.type!="function");n||ft(e.__e),e.__c=e.__=e.__e=void 0}function Da(e,t,n){return this.constructor(e,n)}function en(e,t,n){var a,o,s,i;t==document&&(t=document.documentElement),N.__&&N.__(e,t),o=(a=typeof n=="function")?null:n&&n.__k||t.__k,s=[],i=[],ht(t,e=(!a&&n||t).__k=_t(He,null,[e]),o||ze,ze,t.namespaceURI,!a&&n?[n]:o?null:t.firstChild?Oe.call(t.childNodes):null,s,!a&&n?n:o?o.__e:t.firstChild,a,i),Yt(s,e,i),e.props.children=null}Oe=Fe.slice,N={__e:function(e,t,n,a){for(var o,s,i;t=t.__;)if((o=t.__c)&&!o.__)try{if((s=o.constructor)&&s.getDerivedStateFromError!=null&&(o.setState(s.getDerivedStateFromError(e)),i=o.__d),o.componentDidCatch!=null&&(o.componentDidCatch(e,a||{}),i=o.__d),i)return o.__E=o}catch(c){e=c}throw e}},Ht=0,xa=function(e){return e!=null&&e.constructor===void 0},Ne.prototype.setState=function(e,t){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=me({},this.state),typeof e=="function"&&(e=e(me({},n),this.props)),e&&me(n,e),e!=null&&this.__v&&(t&&this._sb.push(t),Bt(this))},Ne.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),Bt(this))},Ne.prototype.render=He,he=[],qt=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,Gt=function(e,t){return e.__v.__b-t.__v.__b},Be.__r=0,ut=Math.random().toString(8),Le="__d"+ut,xe="__a"+ut,Kt=/(PointerCapture)$|Capture$/i,mt=0,dt=Vt(!1),pt=Vt(!0),Ca=0;var nn=function(e,t,n,a){var o;t[0]=0;for(var s=1;s<t.length;s++){var i=t[s++],c=t[s]?(t[0]|=i?1:2,n[t[s++]]):t[++s];i===3?a[0]=c:i===4?a[1]=Object.assign(a[1]||{},c):i===5?(a[1]=a[1]||{})[t[++s]]=c:i===6?a[1][t[++s]]+=c+"":i?(o=e.apply(c,nn(e,c,n,["",null])),a.push(o),c[0]?t[0]|=2:(t[s-2]=0,t[s]=o)):a.push(c)}return a},tn=new Map;function an(e){var t=tn.get(this);return t||(t=new Map,tn.set(this,t)),(t=nn(this,t.get(e)||(t.set(e,t=(function(n){for(var a,o,s=1,i="",c="",d=[0],u=function(l){s===1&&(l||(i=i.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?d.push(0,l,i):s===3&&(l||i)?(d.push(3,l,i),s=2):s===2&&i==="..."&&l?d.push(4,l,0):s===2&&i&&!l?d.push(5,0,!0,i):s>=5&&((i||!l&&s===5)&&(d.push(s,0,i,o),s=6),l&&(d.push(s,l,0,o),s=6)),i=""},p=0;p<n.length;p++){p&&(s===1&&u(),u(p));for(var b=0;b<n[p].length;b++)a=n[p][b],s===1?a==="<"?(u(),d=[d],s=3):i+=a:s===4?i==="--"&&a===">"?(s=1,i=""):i=a+i[0]:c?a===c?c="":i+=a:a==='"'||a==="'"?c=a:a===">"?(u(),s=1):s&&(a==="="?(s=5,o=i,i=""):a==="/"&&(s<5||n[p][b+1]===">")?(u(),s===3&&(d=d[0]),s=d,(d=d[0]).push(2,0,s),s=0):a===" "||a==="	"||a===`
`||a==="\r"?(u(),s=2):i+=a),s===3&&i==="!--"&&(s=4,d=d[0])}return u(),d})(e)),t),arguments,[])).length>1?t:t[0]}var r=an.bind(_t);ee();var Te,O,$t,on,Ge=0,_n=[],H=N,rn=H.__b,ln=H.__r,cn=H.diffed,un=H.__c,dn=H.unmount,pn=H.__;function yt(e,t){H.__h&&H.__h(O,e,Ge||t),Ge=0;var n=O.__H||(O.__H={__:[],__h:[]});return e>=n.__.length&&n.__.push({}),n.__[e]}function f(e){return Ge=1,Ua(vn,e)}function Ua(e,t,n){var a=yt(Te++,2);if(a.t=e,!a.__c&&(a.__=[n?n(t):vn(void 0,t),function(c){var d=a.__N?a.__N[0]:a.__[0],u=a.t(d,c);d!==u&&(a.__N=[u,a.__[1]],a.__c.setState({}))}],a.__c=O,!O.__f)){var o=function(c,d,u){if(!a.__c.__H)return!0;var p=!1,b=a.__c.props!==c;if(a.__c.__H.__.some(function(m){if(m.__N){p=!0;var h=m.__[0];m.__=m.__N,m.__N=void 0,h!==m.__[0]&&(b=!0)}}),s){var l=s.call(this,c,d,u);return p?l||b:l}return!p||b};O.__f=!0;var s=O.shouldComponentUpdate,i=O.componentWillUpdate;O.componentWillUpdate=function(c,d,u){if(this.__e){var p=s;s=void 0,o(c,d,u),s=p}i&&i.call(this,c,d,u)},O.shouldComponentUpdate=o}return a.__N||a.__}function C(e,t){var n=yt(Te++,3);!H.__s&&bn(n.__H,t)&&(n.__=e,n.u=t,O.__H.__h.push(n))}function F(e){return Ge=5,Ia(function(){return{current:e}},[])}function Ia(e,t){var n=yt(Te++,7);return bn(n.__H,t)&&(n.__=e(),n.__H=t,n.__h=e),n.__}function mn(){for(var e;e=_n.shift();){var t=e.__H;if(e.__P&&t)try{t.__h.some(gt),t.__h.some(hn),t.__h=[]}catch(n){t.__h=[],H.__e(n,e.__v)}}}H.__b=function(e){O=null,rn&&rn(e)},H.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),pn&&pn(e,t)},H.__r=function(e){ln&&ln(e),Te=0;var t=(O=e.__c).__H;t&&($t===O?(t.__h=[],O.__h=[],t.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(t.__h.length&&mn(),Te=0)),$t=O},H.diffed=function(e){cn&&cn(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(_n.push(t)!==1&&on===H.requestAnimationFrame||((on=H.requestAnimationFrame)||La)(mn)),t.__H.__.some(function(n){n.u&&(n.__H=n.u,n.u=void 0)})),$t=O=null},H.__c=function(e,t){t.some(function(n){try{n.__h.some(gt),n.__h=n.__h.filter(function(a){return!a.__||hn(a)})}catch(a){t.some(function(o){o.__h&&(o.__h=[])}),t=[],H.__e(a,n.__v)}}),un&&un(e,t)},H.unmount=function(e){dn&&dn(e);var t,n=e.__c;n&&n.__H&&(n.__H.__.some(function(a){try{gt(a)}catch(o){t=o}}),n.__H=void 0,t&&H.__e(t,n.__v))};var fn=typeof requestAnimationFrame=="function";function La(e){var t,n=function(){clearTimeout(a),fn&&cancelAnimationFrame(t),setTimeout(e)},a=setTimeout(n,35);fn&&(t=requestAnimationFrame(n))}function gt(e){var t=O,n=e.__c;typeof n=="function"&&(e.__c=void 0,n()),O=t}function hn(e){var t=O;e.__c=e.__(),O=t}function bn(e,t){return!e||e.length!==t.length||t.some(function(n,a){return n!==e[a]})}function vn(e,t){return typeof t=="function"?t(e):t}function $n(e){let t=e,n=new Set;return{get:()=>t,set(a){t=a,n.forEach(o=>o(t))},update(a){this.set(a(t))},subscribe(a){return n.add(a),()=>n.delete(a)}}}function q(e){let[t,n]=f(e.get());return C(()=>e.subscribe(n),[e]),t}var A=$n({user:null,csrfToken:null,ready:!1}),Ke=$n([]),Aa=0;function S(e,{actionLabel:t,onAction:n,timeoutMs:a=5e3}={}){let o=++Aa;return Ke.update(s=>[...s,{id:o,message:e,actionLabel:t,onAction:n}]),a&&setTimeout(()=>We(o),a),o}function We(e){Ke.update(t=>t.filter(n=>n.id!==e))}function je(e){try{return decodeURIComponent(e)}catch{return e}}function gn(e){let t=Number(e.get("page")||1);return{sort:e.get("sort")||"uploaded_at_desc",game:e.get("game")||"",q:e.get("q")||"",page:Number.isFinite(t)?Math.max(1,t):1}}var Na=["login","resetPassword","public","publicLibrary","publicGame","publicUser","about","games"];function yn(e){return Na.includes(e)}function Ze(e,t){let n=new URLSearchParams(t||""),a=e;return a.startsWith("/c/")?{name:"public",shareId:je(a.slice(3))}:a==="/"||a==="/public"||a==="/search"?{name:"publicLibrary",query:gn(n)}:a.startsWith("/game/")?{name:"publicGame",game:je(a.slice(6)),query:gn(n)}:a==="/about"?{name:"about"}:a==="/games"?{name:"games"}:a.startsWith("/u/")?{name:"publicUser",username:je(a.slice(3))}:a==="/library"?{name:"library"}:a.startsWith("/clip/")?{name:"clip",clipId:je(a.slice(6))}:a==="/admin"?{name:"admin",tab:n.get("tab")||"overview"}:a==="/account"?{name:"account"}:a==="/profile"?{name:"profile"}:a==="/login"?{name:"login"}:a==="/reset-password"?{name:"resetPassword",token:n.get("token")||"",invite:n.get("invite")==="1"}:{name:"publicLibrary"}}function kn(e){return Ze(e.pathname,e.search).name}var kt=new Set;function J(e){window.history.pushState({},"",e),wn()}function wn(){let{pathname:e,search:t}=window.location,n=Ze(e,t);kt.forEach(a=>a(n))}window.addEventListener("popstate",wn);function Sn(){let[e,t]=f(()=>Ze(window.location.pathname,window.location.search));return C(()=>(kt.add(t),()=>kt.delete(t)),[]),e}function xn(e){let t=e.target.closest("a[href^='/']");!t||t.target||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||(e.preventDefault(),J(t.getAttribute("href")))}var Cn={alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',clipboard:'<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',copy:'<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',external:'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',fastForward:'<path d="m13 19 9-7-9-7v14Z"/><path d="m2 19 9-7-9-7v14Z"/>',film:'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 8h4"/><path d="M3 16h4"/><path d="M17 8h4"/><path d="M17 16h4"/>',fullscreen:'<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/><path d="M12 2a15.3 15.3 0 0 0 0 20"/>',home:'<path d="m3 10 9-7 9 7"/><path d="M5 8.5V20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5"/><path d="M9 22V12h6v10"/>',info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',library:'<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',lock:'<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',logOut:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',menu:'<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',message:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>',notepad:'<path d="M8 2v4"/><path d="M16 2v4"/><path d="M3 10h18"/><path d="M6 4h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/><path d="M8 14h8"/><path d="M8 18h5"/>',pause:'<path d="M8 5v14"/><path d="M16 5v14"/>',play:'<path d="m8 5 11 7-11 7V5Z"/>',plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',check:'<path d="M20 6 9 17l-5-5"/>',refresh:'<path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/><path d="M3 12A9 9 0 0 1 18.5 5.7L21 8"/><path d="M21 3v5h-5"/>',rewind:'<path d="m11 19-9-7 9-7v14Z"/><path d="m22 19-9-7 9-7v14Z"/>',save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',server:'<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',skipBack:'<path d="M19 20 9 12l10-8v16Z"/><path d="M5 19V5"/>',skipForward:'<path d="m5 4 10 8-10 8V4Z"/><path d="M19 5v14"/>',shield:'<path d="M20 13c0 5-3.5 7.5-7.7 8.8a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V5l8-3 8 3v8Z"/>',sliders:'<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>',theater:'<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M6 9h12"/><path d="M6 15h12"/>',trash:'<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',volume2:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9 9 0 0 1 0 14"/>',volumeX:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>',x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'};function T(e,{size:t=18}={}){return r`<svg viewBox="0 0 24 24" width=${t} height=${t} fill="none"
    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" dangerouslySetInnerHTML=${{__html:Cn[e]||""}} />`}function za(e){return e?.query?.q||""}function Tn({active:e,route:t}){let{user:n}=q(A),[a,o]=f(!1),s=F(null),i=za(t),[c,d]=f(i);C(()=>{d(i)},[i]);let u=n?.role==="admin"||n?.role==="owner";C(()=>{if(!a)return;let l=h=>{s.current?.contains(h.target)||o(!1)},m=h=>{h.key==="Escape"&&o(!1)};return document.addEventListener("pointerdown",l),document.addEventListener("keydown",m),()=>{document.removeEventListener("pointerdown",l),document.removeEventListener("keydown",m)}},[a]);let p=[["feed","/","Feed"],["library","/library","Library",!!n],["games","/games","Games"],["admin","/admin","Admin",u]].filter(([,,,l])=>l!==!1),b=l=>{l.preventDefault();let m=new FormData(l.target).get("q")?.toString().trim();J(m?`/search?q=${encodeURIComponent(m)}`:"/search")};return r`<header class="topbar">
    <a class="wordmark" href="/" aria-label="Clipline home">
      <img src="/clipline-icon.svg" alt="" width="24" height="24" />
      CLIP<b>LINE</b>
    </a>
    <nav class="topnav" aria-label="Primary">
      ${p.map(([l,m,h])=>r`
        <a class=${l===e?"topnav-on":""} href=${m}>${h}</a>`)}
    </nav>
    <form class="topsearch" role="search" onSubmit=${b}>
      <input class="input" name="q" value=${c} onInput=${l=>d(l.target.value)}
        placeholder="Search clips, games, players…" aria-label="Search" />
    </form>
    ${n?r`<div class="avatar-wrap" ref=${s}>
          <button class="avatar-btn" aria-haspopup="menu" aria-expanded=${a}
            onClick=${()=>o(!a)}>
            <span class="avatar">${(n.display_name||n.username)[0].toUpperCase()}</span>
          </button>
          ${a&&r`<div class="menu" role="menu" onClick=${()=>o(!1)}>
            <a role="menuitem" href="/profile">Profile</a>
            <a role="menuitem" href="/account">Account</a>
            ${u&&r`<a role="menuitem" href="/admin">Admin</a>`}
            <button role="menuitem" class="menu-danger" onClick=${Fa}>Sign out</button>
          </div>`}
        </div>`:r`<a class="btn" href="/login">${T("lock",{size:14})} Sign in</a>`}
  </header>`}async function Fa(){let{api:e}=await Promise.resolve().then(()=>(ee(),sn));try{await e("/api/v1/auth/logout",{method:"POST"})}catch{}A.set({user:null,csrfToken:null,ready:!0}),J("/login")}var Ba=[["feed","/","home","Feed",!0],["library","/library","library","Library","auth"],["search","/search","search","Search",!0],["profile","/profile","user","Profile","auth"]];function Oa(e){return Ba.filter(([,,,,t])=>t!=="auth"||!!e)}function Mn({active:e}){let{user:t}=q(A),n=Oa(t);return r`<nav class="tabbar" aria-label="Primary">
    ${n.map(([a,o,s,i])=>r`
      <a class=${a===e?"tab-on":""} href=${o}>${T(s)}<span>${i}</span></a>`)}
  </nav>`}function Pn(){let e=q(Ke);return r`<div class="toasts" role="status" aria-live="polite">
    ${e.map(t=>r`<div class="toast" key=${t.id}>
      <span>${t.message}</span>
      ${t.actionLabel&&r`<button class="toast-action"
        onClick=${()=>{t.onAction?.(),We(t.id)}}>${t.actionLabel}</button>`}
      <button class="toast-x" aria-label="Dismiss" onClick=${()=>We(t.id)}>✕</button>
    </div>`)}
  </div>`}ee();function j(e){if(!e)return"Unknown";let t=new Date(e);return Number.isNaN(t.getTime())?"Unknown":new Intl.DateTimeFormat(void 0,{dateStyle:"medium",timeStyle:"short"}).format(t)}function ve(e){if(e==null)return"Unknown";let t=Math.max(0,Math.round(Number(e)/1e3)),n=Math.floor(t/60),a=t%60;return`${n}:${String(a).padStart(2,"0")}`}function Je(e){if(!e)return"Unknown";let t=new Date(e);if(Number.isNaN(t.getTime()))return"Unknown";let n=Math.min(0,t.getTime()-Date.now()),a=[["year",365*24*60*60*1e3],["month",720*60*60*1e3],["week",10080*60*1e3],["day",1440*60*1e3],["hour",3600*1e3],["minute",60*1e3],["second",1e3]],[o,s]=a.find(([,c])=>Math.abs(n)>=c)||a[a.length-1],i=Math.round(n/s);return new Intl.RelativeTimeFormat(void 0,{numeric:"always"}).format(i,o)}function G(e){if(e==null)return"Unknown";let t=Number(e);if(!Number.isFinite(t))return"Unknown";let n=["B","KiB","MiB","GiB","TiB"],a=t,o=0;for(;a>=1024&&o<n.length-1;)a/=1024,o+=1;return`${a.toFixed(o===0?0:1)} ${n[o]}`}function $e(e){let t=Number(e||0),n=Number.isFinite(t)&&t>0?Math.floor(t):0;return`${new Intl.NumberFormat(void 0,{notation:n>=1e4?"compact":"standard"}).format(n)} view${n===1?"":"s"}`}function re(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/thumbnail`}function Me(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/thumbnail`}function Ye(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/media`}function ye(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/media`}function Pe(e,t,n){if(e)try{return`${t}${new URL(e).pathname}`}catch{}return n?`${t}/c/${encodeURIComponent(n)}`:null}var Xe=null;function En(e){Xe?.(),Xe=e}function Rn(e){Xe===e&&(Xe=null)}var Va=()=>window.matchMedia("(pointer: fine)").matches&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches&&!navigator.connection?.saveData;function Dn({src:e,poster:t,alt:n=""}){let[a,o]=f(!1),[s,i]=f(0),c=F(null),d=F(null),u=F(!0),p=F(),b=()=>{u.current&&(clearTimeout(c.current),o(!1),i(0))};p.current=b;let l=()=>{!e||!Va()||(c.current=setTimeout(()=>{u.current&&(En(p.current),o(!0))},300))},m=h=>{let g=h.target;g.duration&&i(g.currentTime/g.duration)};return C(()=>()=>{u.current=!1,clearTimeout(c.current),Rn(p.current)},[]),r`<span class="hover-preview" onPointerEnter=${l} onPointerLeave=${b}>
    ${a?r`<video ref=${d} src=${e} poster=${t} muted loop autoplay
          playsinline preload="none" onTimeUpdate=${m} />`:r`<img src=${t} alt=${n} loading="lazy" />`}
    ${a&&r`<span class="preview-scrub"><span style=${`width:${s*100}%`} /></span>`}
  </span>`}function wt(e){return e.owner?.display_name||e.owner?.username||e.owner_username||e.author_name||e.author_username||null}function ke({clip:e,href:t,selectable:n=!1,selected:a=!1,onToggleSelect:o,showVisibility:s=!1,showAuthor:i=!1}){let c=wt(e),d=[e.game_name&&r`<em>${e.game_name}</em>`,i&&c,e.view_count!=null&&$e(e.view_count),e.uploaded_at&&Je(e.uploaded_at)].filter(Boolean);return r`<article class=${`clip-card ${a?"is-selected":""} ${n?"is-selectable":""}`}>
    <a class="card-thumb" href=${t} tabindex="-1" aria-hidden="true">
      <${Dn} src=${e.media_url} poster=${e.thumbnail_url} />
      ${e.duration_ms!=null&&r`<span class="dur-pill">${ve(e.duration_ms)}</span>`}
      ${s&&r`<span class=${`badge badge-${e.visibility} card-vis`}>${e.visibility}</span>`}
    </a>
    ${n&&r`<label class="card-check">
      <input type="checkbox" checked=${a} aria-label=${`Select ${e.title}`}
        onChange=${()=>o?.(e.id)} />
    </label>`}
    <h3 class="card-title"><a href=${t}>${e.title}</a></h3>
    <p class="card-meta">${d.map((u,p)=>r`${p>0&&" \xB7 "}${u}`)}</p>
  </article>`}function Z({name:e="film",title:t,body:n,action:a}){return r`<div class="empty">
    <div class="empty-icon">${T(e,{size:28})}</div>
    <h3>${t}</h3>
    ${n&&r`<p>${n}</p>`}
    ${a}
  </div>`}var Ha=[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]],qa=6,Ga=60;function Ka(e){let t=new URLSearchParams;return t.set("page_size",String(Ga)),e.sort!=="uploaded_at_desc"&&t.set("sort",e.sort),e.game&&t.set("game",e.game),e.q&&t.set("q",e.q),Number(e.page)>1&&t.set("page",String(e.page)),t}function Qe({route:e}){let t={sort:"uploaded_at_desc",page:1,q:"",...e.query,game:e.name==="publicGame"?e.game:e.query?.game||""},[n,a]=f(null),[o,s]=f([]),[i,c]=f(null);C(()=>{let g=!0;a(null),c(null);let w=Ka(t);return k(`/api/v1/public/clips?${w}`).then(x=>g&&a(x)).catch(x=>g&&c(x)),()=>{g=!1}},[e.name,t.sort,t.game,t.q,t.page]),C(()=>{let g=!0;return k("/api/v1/public/games").then(w=>g&&s(w.games||[])).catch(()=>{}),()=>{g=!1}},[]);let d=g=>J(Za({...t,page:1,...g}));if(i)return r`<main class="page">
      <${Z} name="alert" title="Couldn't load the feed" body=${i.message} />
    </main>`;let u=n?.clips,p=!!(t.game||t.q)||Number(t.page)>1,b=!p,l=[...o].sort((g,w)=>(w.clip_count||0)-(g.clip_count||0)),m=l.slice(0,qa),h=l.length-m.length;return r`<main class="page">
    ${u==null?r`<${ja} />`:u.length===0?r`<${Z} name="film"
          title=${p?"No clips match this filter":"No public clips yet"}
          body=${p?"Try a different game, search, or clear your filters.":"Clips shared as public from a library will show up here."}
          action=${p&&r`<a class="btn" href="/">Clear filters</a>`} />`:r`
        ${b?Wa(u):""}
        <div class="feed-toolbar">
          <h2>Latest uploads</h2>
          <select class="input" value=${t.sort} onChange=${g=>d({sort:g.target.value})}>
            ${Ha.map(([g,w])=>r`<option value=${g}>${w}</option>`)}
          </select>
          <div class="chips">
            <button class=${`chip ${t.game?"":"chip-on"}`} onClick=${()=>d({game:""})}>All</button>
            ${m.map(g=>r`<button
              class=${`chip ${t.game===g.game?"chip-on":""}`}
              onClick=${()=>d({game:g.game})}>${g.game}</button>`)}
            ${h>0&&r`<a class="chip" href="/games">+${h}</a>`}
          </div>
        </div>
        <div class="card-grid">
          ${(b?u.slice(4):u).map(g=>r`<${ke} clip=${{...g,thumbnail_url:re(g),media_url:ye(g)}}
              href=${St(g)} showAuthor />`)}
        </div>
        ${Ja(n,t,d)}
      `}
  </main>`}function Wa(e){let[t,...n]=e,a=n.slice(0,3);return r`<p class="kicker">Now playing on this server</p>
    <section class="hero">
      <a class="hero-main" href=${St(t)}>
        <img src=${re(t)} alt="" loading="lazy" />
        <span class="hero-caption">▶ ${t.title} — ${t.game_name} · ${ve(t.duration_ms)}</span>
      </a>
      <div class="hero-side">
        ${a.map(o=>r`<a class="hero-row" href=${St(o)}>
            <img src=${re(o)} alt="" loading="lazy" />
            <span><b>${o.title}</b>
              <small>${wt(o)} · ${o.game_name} · ${$e(o.view_count)}</small></span>
          </a>`)}
      </div>
    </section>`}function ja({count:e=8}){return r`<div class="card-grid">
    ${Array.from({length:e},(t,n)=>r`<div class="clip-card" key=${n}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`}function St(e){return`/c/${encodeURIComponent(e.share_id)}`}function Za({sort:e="uploaded_at_desc",game:t="",q:n="",page:a=1}={}){let o=new URLSearchParams,s=e||"uploaded_at_desc",i=String(t||"").trim(),c=String(n||"").trim(),d=Math.max(1,Number(a||1));if(s!=="uploaded_at_desc"&&o.set("sort",s),d>1&&o.set("page",String(d)),c)return o.set("q",c),i&&o.set("game",i),`/search?${o.toString()}`;if(i){let p=o.toString();return`/game/${encodeURIComponent(i)}${p?`?${p}`:""}`}let u=o.toString();return u?`/search?${u}`:"/"}function Ja(e,t,n){let a=Math.max(1,Number(t.page||1)),o=!!e?.has_more;return a<=1&&!o?"":r`<nav class="pager" aria-label="Public clip pages">
    <button class="btn" type="button" disabled=${a<=1}
      onClick=${()=>n({page:a-1})}>Previous</button>
    <span class="muted">Page ${a}</span>
    <button class="btn" type="button" disabled=${!o}
      onClick=${()=>n({page:a+1})}>Next</button>
  </nav>`}ee();function Un(){let[e,t]=f(null),[n,a]=f(null);return C(()=>{let o=!0;return k("/api/v1/public/games").then(s=>o&&t(s.games||[])).catch(s=>o&&a(s)),()=>{o=!1}},[]),n?r`<main class="page">
      <${Z} name="alert" title="Couldn't load games" body=${n.message} />
    </main>`:r`<main class="page">
    <p class="kicker">Browse by game</p>
    ${e==null?r`<div class="game-grid">
          ${Array.from({length:6},(o,s)=>r`<div class="game-tile is-loading" key=${s}>
            <div class="skeleton-thumb"></div>
          </div>`)}
        </div>`:e.length===0?r`<${Z} name="film" title="No games yet"
          body="Once clips are shared as public, their games will show up here." />`:r`<div class="game-grid">
          ${e.map(o=>r`<a class="game-tile" href=${`/game/${encodeURIComponent(o.game)}`}>
            ${o.thumbnail_url?r`<img src=${o.thumbnail_url} alt="" loading="lazy" />`:r`<div class="game-tile-fallback">${(o.game||"?")[0].toUpperCase()}</div>`}
            <div class="game-tile-body">
              <b>${o.game}</b>
              <small>${o.clip_count} clip${o.clip_count===1?"":"s"}</small>
            </div>
          </a>`)}
        </div>`}
  </main>`}ee();function In({trigger:e,content:t,onClose:n,label:a,panelClass:o=""}){let[s,i]=f(!1),c=F(null),d=F(null),u=F(null),p=()=>{i(!1),n?.()},b=()=>{if(s){p();return}u.current=document.activeElement,i(!0)};return C(()=>{if(!s)return;let l=g=>{c.current?.contains(g.target)||p()},m=g=>{g.key==="Escape"&&p()};return document.addEventListener("pointerdown",l),document.addEventListener("keydown",m),d.current?.querySelector("input, select, textarea, button, a[href], [tabindex]")?.focus(),()=>{document.removeEventListener("pointerdown",l),document.removeEventListener("keydown",m),u.current?.focus?.()}},[s]),r`<div class="popover-wrap" ref=${c}>
    ${e({open:s,toggle:b})}
    ${s&&r`<div class=${`popover ${o}`} ref=${d} role="dialog" aria-label=${a||"Filters"}>
      ${t}
    </div>`}
  </div>`}function Ln({count:e,onPublic:t,onPrivate:n,onCopyLinks:a,onDelete:o,onClear:s}){return e?r`<div class="bulkbar" role="toolbar" aria-label="Bulk actions">
    <b>${e} selected</b>
    <button class="btn" onClick=${t}>Make public</button>
    <button class="btn" onClick=${n}>Make private</button>
    <button class="btn" onClick=${a}>Copy links</button>
    <button class="btn btn-danger" onClick=${o}>Delete</button>
    <button class="btn bulk-x" aria-label="Clear selection" onClick=${s}>✕</button>
  </div>`:null}function le({open:e,title:t,body:n,confirmLabel:a="Confirm",onConfirm:o,onCancel:s,danger:i=!1,confirmDisabled:c=!1}){let d=F(null),u=F(null);return C(()=>{let p=d.current;p&&(e&&!p.open?(p.showModal(),u.current?.focus()):!e&&p.open&&p.close())},[e]),r`<dialog ref=${d} class="confirm-dialog" aria-labelledby="confirm-dialog-title"
    onCancel=${p=>{p.preventDefault(),s?.()}}
    onClose=${()=>e&&s?.()}>
    ${e&&r`<div class="confirm-dialog-body">
      <h2 id="confirm-dialog-title">${t}</h2>
      ${n&&r`<p>${n}</p>`}
      <div class="confirm-dialog-actions">
        <button type="button" class="btn" onClick=${s}>Cancel</button>
        <button type="button" ref=${u} class=${`btn ${i?"btn-danger":"btn-primary"}`}
          disabled=${c} onClick=${o}>${a}</button>
      </div>
    </div>`}
  </dialog>`}var zn="clipline.libraryView",Ya=[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["updated_at_desc","Updated newest"],["updated_at_asc","Updated oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["size_desc","Size largest"],["size_asc","Size smallest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]],et={title:["title_asc","title_desc"],size:["size_asc","size_desc"],duration:["duration_asc","duration_desc"],uploaded:["uploaded_at_asc","uploaded_at_desc"]},Xa=["visibility","status","source_type","from","to","min_duration_seconds","max_duration_seconds","min_size_mib","max_size_mib"],at={sort:"uploaded_at_desc",game:"",source_type:"",visibility:"",status:"",q:"",from:"",to:"",min_duration_seconds:"",max_duration_seconds:"",min_size_mib:"",max_size_mib:""};function tt(e){if(e===""||e==null)return null;let t=Number(e);return Number.isFinite(t)?t:null}function Qa(e){let t=new URLSearchParams;t.set("sort",e.sort||at.sort),t.set("page_size","100");for(let i of["game","source_type","visibility","status","q"])e[i]&&t.set(i,e[i]);e.from&&t.set("from",`${e.from}T00:00:00Z`),e.to&&t.set("to",`${e.to}T23:59:59Z`);let n=tt(e.min_duration_seconds);n!=null&&t.set("min_duration_ms",String(Math.round(n*1e3)));let a=tt(e.max_duration_seconds);a!=null&&t.set("max_duration_ms",String(Math.round(a*1e3)));let o=tt(e.min_size_mib);o!=null&&t.set("min_size_bytes",String(Math.round(o*1024*1024)));let s=tt(e.max_size_mib);return s!=null&&t.set("max_size_bytes",String(Math.round(s*1024*1024))),t}function es(e){return Xa.reduce((t,n)=>t+(e[n]?1:0),0)}function ts(e,t=6){let n=new Map;for(let a of e){let o=a.game_name;o&&n.set(o,(n.get(o)||0)+1)}return Array.from(n,([a,o])=>({game:a,count:o})).sort((a,o)=>o.count-a.count||a.game.localeCompare(o.game)).slice(0,t)}function An(e,t,{verb:n,allFailedMessage:a}){let o=e.filter(i=>!t.some(c=>c.id===i));if(!t.length)return{succeeded:o,message:null};let s=t.length===e.length?t[0]?.message||a:`Couldn't ${n} ${t.length} of ${e.length} clips.`;return{succeeded:o,message:s}}function ns(e,t){return(e||[]).map(n=>Pe(n.public_url,t,n.public_share_id)).filter(Boolean)}async function Nn(e,t,n){let a=0;async function o(){let s=a++;if(!(s>=e.length))return await n(e[s]),o()}await Promise.all(Array.from({length:Math.min(t,e.length)},o))}function as(){try{return localStorage.getItem(zn)==="rows"?"rows":"grid"}catch{return"grid"}}function Fn(){let[e,t]=f(as),[n,a]=f(at),[o,s]=f(at.q),[i,c]=f(null),[d,u]=f(null),[p,b]=f(new Set),[l,m]=f(!1),[h,g]=f(0),w=F(null);C(()=>()=>clearTimeout(w.current),[]),C(()=>{let $=!0;return c(null),u(null),k(`/api/v1/clips?${Qa(n)}`).then(M=>{$&&(c(M),b(new Set))}).catch(M=>$&&u(M)),()=>{$=!1}},[JSON.stringify(n),h]);let x=$=>{t($);try{localStorage.setItem(zn,$)}catch{}},y=()=>g($=>$+1),P=$=>{let M=$.target.value;s(M),clearTimeout(w.current),w.current=setTimeout(()=>{a(I=>({...I,q:M}))},300)},U=$=>M=>{let I=M.target.value;a(L=>({...L,[$]:I}))},K=()=>{a($=>({...$,visibility:"",status:"",source_type:"",from:"",to:"",min_duration_seconds:"",max_duration_seconds:"",min_size_mib:"",max_size_mib:""}))},Q=$=>a(M=>({...M,game:M.game===$?"":$})),oe=$=>a(M=>({...M,sort:$})),ne=$=>{b(M=>{let I=new Set(M);return I.has($)?I.delete($):I.add($),I})};function Y($,M){c(I=>I&&{...I,clips:I.clips.map(L=>L.id===$?{...L,...M}:L)})}function z($,M){let I=new Set($);c(L=>L&&{...L,clips:L.clips.map(v=>I.has(v.id)?{...v,...M}:v)})}async function se($){let M=Array.from(p);if(!M.length)return;let I=i?.clips||[],L=new Map(M.map(W=>[W,I.find(X=>X.id===W)]));z(M,{visibility:$});let v=[],E=new Map;await Nn(M,4,async W=>{try{let X=await k(`/api/v1/clips/${encodeURIComponent(W)}/visibility`,{method:"POST",body:{visibility:$}}),Re={visibility:X.visibility,public_url:X.public_url,public_share_id:X.public_share_id};Y(W,Re),E.set(W,Re)}catch(X){v.push({id:W,message:X.message})}});let{succeeded:R,message:V}=An(M,v,{verb:"update",allFailedMessage:"Couldn't update visibility."});if(V){for(let{id:W}of v){let X=L.get(W);X&&Y(W,{visibility:X.visibility,public_url:X.public_url,public_share_id:X.public_share_id})}S(V)}R.length&&(b(new Set),S(`Made ${R.length} clip${R.length===1?"":"s"} ${$}`,{actionLabel:"Undo",onAction:()=>Se(R,L,E)}))}async function Se($,M,I){for(let E of $){let R=M.get(E);R&&Y(E,{visibility:R.visibility,public_url:R.public_url,public_share_id:R.public_share_id})}let L=[];await Nn($,4,async E=>{let R=M.get(E);if(R)try{let V=await k(`/api/v1/clips/${encodeURIComponent(E)}/visibility`,{method:"POST",body:{visibility:R.visibility}});Y(E,{visibility:V.visibility,public_url:V.public_url,public_share_id:V.public_share_id})}catch(V){L.push({id:E,message:V.message})}});let{message:v}=An($,L,{verb:"undo",allFailedMessage:"Couldn't undo visibility change."});if(v){for(let{id:E}of L){let R=I.get(E);R&&Y(E,R)}S(v)}}async function ce(){let $=Array.from(p),M=i?.clips||[],I=$.map(E=>M.find(R=>R.id===E)).filter(Boolean),L=ns(I,window.location.origin),v=I.length-L.length;if(!L.length){S("No links to copy \u2014 selected clips are private.");return}try{await navigator.clipboard.writeText(L.join(`
`)),S(`Copied ${L.length} link${L.length===1?"":"s"}`+(v?` (${v} skipped, private)`:""))}catch{S("Couldn't copy links to clipboard.")}}async function ue(){let $=Array.from(p);m(!1);try{let M=await k("/api/v1/clips/bulk-delete",{method:"POST",body:{ids:$}});b(new Set),y(),S(`Deleted ${M.affected} clip${M.affected===1?"":"s"}.`)}catch(M){S(M.message)}}if(d)return r`<main class="page">
      <${Z} name="alert" title="Couldn't load your library" body=${d.message} />
    </main>`;let ae=i?.clips,fe=es(n),de=!!(n.q||n.game)||fe>0,ie=ts(ae||[]),pe=(ae||[]).reduce(($,M)=>$+(M.file_size_bytes||0),0),_e=r`<div class="popover-fields">
    <label class="field"><span>Visibility</span>
      <select class="input" value=${n.visibility} onChange=${U("visibility")}>
        <option value="">Any</option>
        <option value="private">Private</option>
        <option value="public">Public</option>
        <option value="unlisted">Unlisted</option>
      </select>
    </label>
    <label class="field"><span>Status</span>
      <select class="input" value=${n.status} onChange=${U("status")}>
        <option value="">Any</option>
        <option value="created">Created</option>
        <option value="uploading">Uploading</option>
        <option value="processing">Processing</option>
        <option value="ready">Ready</option>
        <option value="failed">Failed</option>
      </select>
    </label>
    <label class="field"><span>Source</span>
      <input class="input" type="text" value=${n.source_type} onInput=${U("source_type")} placeholder="Source type" />
    </label>
    <label class="field"><span>From</span>
      <input class="input" type="date" value=${n.from} onInput=${U("from")} />
    </label>
    <label class="field"><span>To</span>
      <input class="input" type="date" value=${n.to} onInput=${U("to")} />
    </label>
    <label class="field"><span>Min duration (s)</span>
      <input class="input" type="number" min="0" value=${n.min_duration_seconds} onInput=${U("min_duration_seconds")} />
    </label>
    <label class="field"><span>Max duration (s)</span>
      <input class="input" type="number" min="0" value=${n.max_duration_seconds} onInput=${U("max_duration_seconds")} />
    </label>
    <label class="field"><span>Min size (MiB)</span>
      <input class="input" type="number" min="0" step="0.1" value=${n.min_size_mib} onInput=${U("min_size_mib")} />
    </label>
    <label class="field"><span>Max size (MiB)</span>
      <input class="input" type="number" min="0" step="0.1" value=${n.max_size_mib} onInput=${U("max_size_mib")} />
    </label>
    <div class="popover-actions">
      <button type="button" class="btn" onClick=${K}>Clear filters</button>
    </div>
  </div>`;return r`<main class="page">
    <div class="lib-header">
      <div>
        <h1>Library</h1>
        <p>${(ae||[]).length} clip${(ae||[]).length===1?"":"s"} · ${G(pe)} used</p>
      </div>
      <div class="seg" role="group" aria-label="View">
        <button type="button" class=${`seg-item ${e==="grid"?"seg-on":""}`}
          aria-pressed=${e==="grid"} onClick=${()=>x("grid")}>Grid</button>
        <button type="button" class=${`seg-item ${e==="rows"?"seg-on":""}`}
          aria-pressed=${e==="rows"} onClick=${()=>x("rows")}>Rows</button>
      </div>
    </div>

    <div class="lib-toolbar">
      <input class="input" type="search" aria-label="Search clips" placeholder="Search title or game"
        value=${o} onInput=${P} />
      <select class="input" aria-label="Sort" value=${n.sort} onChange=${$=>oe($.target.value)}>
        ${Ya.map(([$,M])=>r`<option value=${$}>${M}</option>`)}
      </select>
      <${In}
        label="Filters"
        panelClass="popover-filters"
        trigger=${({open:$,toggle:M})=>r`<button type="button" class="btn" aria-haspopup="dialog"
          aria-expanded=${$} onClick=${M}>
          ${T("sliders",{size:14})} Filters
          ${fe>0&&r`<span class="filter-badge">${fe}</span>`}
        </button>`}
        content=${_e} />
    </div>

    ${ie.length>0&&r`<div class="lib-chips">
      <button type="button" class=${`chip ${n.game?"":"chip-on"}`} aria-pressed=${!n.game}
        onClick=${()=>Q("")}>All</button>
      ${ie.map($=>r`<button type="button" class=${`chip ${n.game===$.game?"chip-on":""}`}
        aria-pressed=${n.game===$.game} onClick=${()=>Q($.game)}>${$.game}</button>`)}
    </div>`}

    ${ae==null?r`<${os} />`:ae.length===0?de?r`<${Z} name="film" title="No clips match this view"
            body="Try a different search, game, or clear your filters."
            action=${r`<button type="button" class="btn" onClick=${()=>{a(at),s("")}}>Clear filters</button>`} />`:r`<${Z} name="upload" title="Connect the Clipline desktop app to start uploading"
            body="New clips uploaded from the desktop app will show up here."
            action=${r`<a class="btn" href="/about">Learn more</a>`} />`:e==="grid"?r`<div class=${`card-grid ${p.size>0?"selecting":""}`}>
          ${ae.map($=>r`<${ke} key=${$.id}
            clip=${{...$,thumbnail_url:Me($),media_url:Ye($)}}
            href=${`/clip/${encodeURIComponent($.id)}`}
            selectable selected=${p.has($.id)} onToggleSelect=${ne} showVisibility />`)}
        </div>`:r`<${ss} clips=${ae} query=${n} onSort=${oe}
          selected=${p} onToggleSelect=${ne} />`}

    <${Ln} count=${p.size}
      onPublic=${()=>se("public")}
      onPrivate=${()=>se("private")}
      onCopyLinks=${ce}
      onDelete=${()=>m(!0)}
      onClear=${()=>b(new Set)} />

    <${le} open=${l}
      title=${`Delete ${p.size} clip${p.size===1?"":"s"}?`}
      body="Public links stop working immediately."
      confirmLabel="Delete" danger
      onConfirm=${ue}
      onCancel=${()=>m(!1)} />
  </main>`}function nt(e,[t,n]){let a=e.sort===t?"ascending":e.sort===n?"descending":"none",o=e.sort===n?t:n;return{ariaSort:a,next:o}}function ss({clips:e,query:t,onSort:n,selected:a,onToggleSelect:o}){let s=nt(t,et.title),i=nt(t,et.size),c=nt(t,et.duration),d=nt(t,et.uploaded);return r`<table class="lib-table">
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
      ${e.map(u=>r`<tr key=${u.id} class=${a?.has(u.id)?"is-selected":""}>
        <td class="row-select-cell">
          <input class="row-select" type="checkbox" checked=${a?.has(u.id)}
            aria-label=${`Select ${u.title}`} onChange=${()=>o?.(u.id)} />
        </td>
        <td><img class="row-thumb" src=${Me(u)} alt="" width="64" height="36" loading="lazy" /></td>
        <td><a href=${`/clip/${encodeURIComponent(u.id)}`}>${u.title}</a></td>
        <td>${u.game_name||"\u2014"}</td>
        <td><span class=${`badge badge-${u.visibility}`}>${u.visibility}</span></td>
        <td>${G(u.file_size_bytes)}</td>
        <td>${ve(u.duration_ms)}</td>
        <td>${j(u.uploaded_at)}</td>
      </tr>`)}
    </tbody>
  </table>`}function os({count:e=8}){return r`<div class="card-grid">
    ${Array.from({length:e},(t,n)=>r`<div class="clip-card" key=${n}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`}ee();var rs={ChampionKill:"kill",FirstBlood:"kill",Multikill:"spree",Ace:"spree",DragonKill:"objective",HeraldKill:"objective",BaronKill:"objective",TurretKilled:"structure",InhibKilled:"structure",FirstBrick:"structure"};function On(e){let t=Number(e);return Number.isFinite(t)&&t>0?t/1e3:0}function Vn(e,t){let n=Number.isFinite(e)?e:0,a=t>0?t:Number.MAX_SAFE_INTEGER;return Math.max(0,Math.min(a,n))}function st(e,t){return t>0?Math.max(0,Math.min(100,e/t*100)):0}function xt(e){if(!Number.isFinite(e))return"0:00";let t=Math.max(0,Math.round(e)),n=Math.floor(t/60),a=t-n*60;return`${n}:${String(a).padStart(2,"0")}`}function Bn(e){if(!Number.isFinite(e))return"0:00.0";let t=Math.max(0,Math.round(e*10)),n=Math.floor(t/600),a=t-n*600,o=Math.floor(a/10);return`${n}:${String(o).padStart(2,"0")}.${a%10}`}function Hn(e,t){return`${Bn(e)} / ${t>0?Bn(t):"0:00.0"}`}function is(e){return rs[e]||"info"}function qn(e,t){return(e||[]).map((n,a)=>{let o=Number(n.timestamp_ms);if(!Number.isFinite(o))return null;let s=o/1e3;return s<0||t>0&&s>t?null:{index:a,time:s,kind:String(n.kind||"Marker"),label:String(n.label||n.kind||"Marker"),category:is(n.kind)}}).filter(Boolean).sort((n,a)=>n.time-a.time)}function Gn(e,t){if(!e.length)return null;for(let n of e)if(n.time>t+.05)return n;return e[0]}function Kn(e,t){if(!e.length)return null;for(let n=e.length-1;n>=0;n-=1)if(e[n].time<t-.05)return e[n];return e[e.length-1]}function Wn(e,t){switch(e){case"Space":case"KeyK":return{kind:"toggle-play"};case"ArrowLeft":return{kind:"seek-by",seconds:t?-1:-5};case"ArrowRight":return{kind:"seek-by",seconds:t?1:5};case"KeyJ":return{kind:"seek-by",seconds:-10};case"KeyL":return{kind:"seek-by",seconds:10};case"Comma":return{kind:"seek-by",seconds:-.1};case"Period":return{kind:"seek-by",seconds:.1};case"KeyM":return{kind:t?"previous-marker":"next-marker"};case"Home":return{kind:"seek-to",seconds:0};case"End":return{kind:"seek-to-end"};case"KeyF":return{kind:"fullscreen"};case"KeyT":return{kind:"theater"};default:return null}}var Zn="clipline.playerVolume",Jn="clipline.clipTheaterMode",ls=2e3,cs=[.25,.5,.75,1,1.25,1.5,2];function us(e,t){switch(e){case"KeyM":return{kind:"toggle-mute"};case"KeyF":return{kind:"theater"};case"Escape":return{kind:"exit-theater"};default:return Wn(e,t)}}function ds(e){return e instanceof Element?!!e.closest("input, textarea, select, button, a, [contenteditable='true'], [contenteditable='']"):!1}function ps(){try{let e=window.localStorage.getItem(Zn);if(e==null)return 1;let t=Number(e);return Number.isFinite(t)?Math.max(0,Math.min(1,t)):1}catch{return 1}}function jn(e){try{window.localStorage.setItem(Zn,String(Math.max(0,Math.min(1,e))))}catch{}}function ms(){try{return window.localStorage.getItem(Jn)==="true"}catch{return!1}}function fs(e){try{window.localStorage.setItem(Jn,String(e))}catch{}}function Yn({src:e,poster:t,durationMs:n,markers:a}){let o=F(null),s=F(null),i=F(null),c=F(!1),d=F(!1),u=On(n),[p,b]=f(!1),[l,m]=f(0),[h,g]=f(u),[w,x]=f(0),[y,P]=f(ps),[U,K]=f(!1),[Q,oe]=f(1),[ne,Y]=f(!1),[z,se]=f(ms),[Se,ce]=f(!0),[ue,ae]=f(null),[fe,de]=f(""),ie=qn(a,h);function pe(){ce(!0),window.clearTimeout(i.current),i.current=window.setTimeout(()=>{let _=o.current;_&&!_.paused&&!_.ended&&ce(!1)},ls)}C(()=>{p||(window.clearTimeout(i.current),ce(!0))},[p]),C(()=>{let _=o.current;if(!_)return;let D=()=>Number.isFinite(_.duration)&&_.duration>0?_.duration:u,B=()=>g(D()),Pt=()=>g(D()),Et=()=>{c.current||m(_.currentTime||0)},Rt=()=>{let Nt=D();if(!(Nt>0)||!_.buffered?.length){x(0);return}let zt=_.currentTime||0,De=0;for(let Ue=0;Ue<_.buffered.length;Ue+=1){let ya=_.buffered.start(Ue),ct=_.buffered.end(Ue);if(zt>=ya&&zt<=ct){De=ct;break}De=Math.max(De,ct)}x(st(De,Nt))},Dt=()=>{b(!0),de(""),pe()},Ut=()=>b(!1),It=()=>b(!1),Lt=()=>{P(_.volume),K(_.muted||_.volume===0)},At=()=>de("Playback unavailable");return _.addEventListener("loadedmetadata",B),_.addEventListener("durationchange",Pt),_.addEventListener("timeupdate",Et),_.addEventListener("progress",Rt),_.addEventListener("play",Dt),_.addEventListener("pause",Ut),_.addEventListener("ended",It),_.addEventListener("volumechange",Lt),_.addEventListener("error",At),()=>{_.removeEventListener("loadedmetadata",B),_.removeEventListener("durationchange",Pt),_.removeEventListener("timeupdate",Et),_.removeEventListener("progress",Rt),_.removeEventListener("play",Dt),_.removeEventListener("pause",Ut),_.removeEventListener("ended",It),_.removeEventListener("volumechange",Lt),_.removeEventListener("error",At)}},[e,u]),C(()=>{o.current&&(o.current.volume=y)},[y]),C(()=>{o.current&&(o.current.muted=U)},[U]),C(()=>{o.current&&(o.current.playbackRate=Q)},[Q]),C(()=>{if(document.documentElement.classList.toggle("clipline-theater",z),z){let _=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=_}}},[z]),C(()=>()=>document.documentElement.classList.remove("clipline-theater"),[]);function _e(_){se(_),fs(_)}function $(_){let D=o.current;if(!D)return;let B=h>0?Vn(_,h):Math.max(0,_);D.currentTime=B,m(B)}function M(_){$((o.current?.currentTime||0)+_)}async function I(){let _=o.current;if(_)if(_.paused||_.ended)try{await _.play()}catch(D){de(D?.message||"Playback failed")}else _.pause()}function L(){let _=o.current;_&&(_.muted||_.volume===0?(_.muted=!1,_.volume===0&&(_.volume=1,P(1),jn(1)),K(!1)):(_.muted=!0,K(!0)))}function v(_){let D=Number(_.target.value);P(D),K(D===0),jn(D);let B=o.current;B&&(B.volume=D,B.muted=D===0)}async function E(){try{document.fullscreenElement?await document.exitFullscreen():await s.current?.requestFullscreen?.()}catch(_){de(_?.message||"Fullscreen unavailable")}}function R(_){let D=o.current?.currentTime||0,B=_>0?Gn(ie,D):Kn(ie,D);B&&$(B.time)}function V(){c.current=!0,d.current=p,p&&o.current?.pause()}function W(_){let D=Number(_.target.value);m(D),$(D)}function X(){c.current&&(c.current=!1,d.current&&(d.current=!1,o.current?.play().catch(()=>{})))}function Re(_){let D=_.currentTarget.getBoundingClientRect();if(!(D.width>0))return;let B=Math.max(0,Math.min(1,(_.clientX-D.left)/D.width));ae({pct:B*100,time:B*(h||0)})}function ga(){ae(null)}return C(()=>{function _(D){if(D.defaultPrevented||ds(D.target))return;let B=us(D.code,D.shiftKey);if(B&&!(B.kind==="exit-theater"&&!z))switch(D.preventDefault(),pe(),B.kind){case"toggle-play":I();break;case"seek-by":M(B.seconds);break;case"seek-to":$(B.seconds);break;case"seek-to-end":$(h);break;case"next-marker":R(1);break;case"previous-marker":R(-1);break;case"toggle-mute":L();break;case"theater":_e(!z);break;case"exit-theater":_e(!1);break;case"fullscreen":E();break;default:break}}return document.addEventListener("keydown",_),()=>document.removeEventListener("keydown",_)},[h,z,p]),r`<div class=${`player ${Se?"":"chrome-hidden"}`} ref=${s}
      onPointerMove=${pe} onPointerEnter=${pe}
      onPointerLeave=${()=>{let _=o.current;_&&!_.paused&&ce(!1)}}
      onFocusIn=${()=>ce(!0)}>
    <video ref=${o} class="player-video" src=${e} poster=${t||void 0}
      preload="metadata" playsinline onClick=${I}></video>
    ${fe&&r`<div class="player-note">${fe}</div>`}
    <div class="player-overlay">
      <div class="player-timeline" onPointerMove=${Re} onPointerLeave=${ga}>
        <div class="player-buffered" style=${`width:${w}%`}></div>
        <div class="player-progress" style=${`width:${st(l,h)}%`}></div>
        ${ie.map(_=>r`<span class="player-marker-tick" key=${_.index}
            style=${`left:${st(_.time,h)}%`} title=${`${_.label} @ ${xt(_.time)}`}></span>`)}
        <input class="player-scrubber" type="range" min="0" max=${h>0?h:0} step="0.01"
          value=${l} disabled=${!(h>0)} aria-label="Seek"
          onPointerDown=${V} onInput=${W} onChange=${X}
          onPointerUp=${X} onPointerCancel=${X} onLostPointerCapture=${X} />
        ${ue&&r`<div class="player-hover-time" style=${`left:${ue.pct}%`}>${xt(ue.time)}</div>`}
      </div>
      <div class="player-controls">
        ${ie.length>0&&r`<div class="player-cluster">
          <button type="button" class="player-btn" title="Previous marker" aria-label="Previous marker"
            onClick=${()=>R(-1)}>${T("skipBack",{size:14})}</button>
          <button type="button" class="player-btn" title="Next marker" aria-label="Next marker"
            onClick=${()=>R(1)}>${T("skipForward",{size:14})}</button>
        </div>`}
        <button type="button" class="player-btn player-play" aria-label=${p?"Pause":"Play"} onClick=${I}>
          ${T(p?"pause":"play",{size:16})}
        </button>
        <span class="player-time">${Hn(l,h)}</span>
        <div class="player-spacer"></div>
        <div class="player-speed-wrap">
          <button type="button" class="player-btn player-speed" aria-haspopup="menu" aria-expanded=${ne}
            onClick=${()=>Y(_=>!_)}>${Q}×</button>
          ${ne&&r`<div class="player-speed-menu" role="menu">
            ${cs.map(_=>r`<button type="button" role="menuitem" key=${_}
                class=${`player-speed-item ${_===Q?"is-active":""}`}
                onClick=${()=>{oe(_),Y(!1)}}>${_}×</button>`)}
          </div>`}
        </div>
        <button type="button" class="player-btn" aria-label=${U?"Unmute":"Mute"} onClick=${L}>
          ${T(U?"volumeX":"volume2",{size:14})}
        </button>
        <input class="player-volume" type="range" min="0" max="1" step="0.01" value=${U?0:y}
          aria-label="Volume" onInput=${v} />
        <button type="button" class="player-btn" aria-label=${z?"Exit theater mode":"Theater mode"}
          aria-pressed=${z} onClick=${()=>_e(!z)}>${T("theater",{size:14})}</button>
        <button type="button" class="player-btn" aria-label="Fullscreen" onClick=${E}>
          ${T("fullscreen",{size:14})}
        </button>
      </div>
    </div>
  </div>`}ee();function _s(e){let t=new Map(e.map(s=>[s.id,s])),n=new Map,a=[],o=0;return e.forEach(s=>{let i=s.parent_comment_id||"";i&&t.has(i)?(n.has(i)||n.set(i,[]),n.get(i).push(s),o+=1):i||(a.push(s),o+=1)}),{roots:a,repliesByParent:n,count:o}}function hs(e){return(e||"?").trim().slice(0,1).toUpperCase()||"?"}function bs(e){let t=e.author_avatar_url;return typeof t=="string"&&t.startsWith("/")?r`<img class="comment-avatar" src=${t} alt="" />`:r`<div class="comment-avatar">${hs(e.author_name)}</div>`}function Xn({shareId:e}){let{user:t}=q(A),[n,a]=f(null),[o,s]=f(""),[i,c]=f(null),[d,u]=f(""),[p,b]=f(null);function l(){k(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`).then(y=>a(y.comments||[])).catch(()=>a([]))}C(()=>{let y=!0;return a(null),k(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`).then(P=>y&&a(P.comments||[])).catch(()=>y&&a([])),()=>{y=!1}},[e]);async function m(y,P){let U=y.trim();if(U)try{await k(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`,{method:"POST",body:P?{body:U,parent_comment_id:P}:{body:U}}),l()}catch(K){S(K.message)}}async function h(y){y.preventDefault(),await m(o),s("")}async function g(y,P){y.preventDefault(),await m(d,P),u(""),c(null)}async function w(){let y=p;b(null);try{await k(`/api/v1/public/clips/${encodeURIComponent(e)}/comments/${encodeURIComponent(y)}`,{method:"DELETE"}),l()}catch(P){S(P.message)}}let x=_s(n||[]);return r`<section class="comments">
    <div class="comments-header"><h2>Comments</h2><span class="muted">${x.count}</span></div>
    ${t?r`<form class="comment-form" onSubmit=${h}>
          <textarea rows="3" maxlength="2000" placeholder="Add a comment" value=${o}
            onInput=${y=>s(y.target.value)}></textarea>
          <div class="comment-form-actions">
            <button type="submit" class="btn btn-primary">${T("message",{size:14})} Post comment</button>
          </div>
        </form>`:r`<p class="comment-signin"><a href="/login">Sign in</a> to comment.</p>`}
    ${n==null?"":x.count===0?r`<p class="comment-signin">No comments yet.</p>`:r`<div class="comment-list">
          ${x.roots.map(y=>Qn(y,{depth:0,repliesByParent:x.repliesByParent,user:t,replyOpenId:i,setReplyOpenId:c,replyDraft:d,setReplyDraft:u,submitReply:g,onDelete:b}))}
        </div>`}
    <${le} open=${p!=null} title="Delete this comment?"
      body="This removes the comment from the public clip page." confirmLabel="Delete" danger
      onConfirm=${w} onCancel=${()=>b(null)} />
  </section>`}function Qn(e,t){let{depth:n,repliesByParent:a,user:o,replyOpenId:s,setReplyOpenId:i,replyDraft:c,setReplyDraft:d,submitReply:u,onDelete:p}=t,b=a.get(e.id)||[];return r`<article class="comment" key=${e.id}>
    ${bs(e)}
    <div class="comment-body">
      <div class="comment-head">
        ${e.author_username?r`<a href=${`/u/${encodeURIComponent(e.author_username)}`}>${e.author_name}</a>`:r`<strong>${e.author_name}</strong>`}
        ${e.is_uploader&&r`<span class="comment-badge">Uploader</span>`}
        <span>${Je(e.created_at)}</span>
        <div class="comment-actions">
          ${o&&n===0&&r`<button type="button" class="comment-action"
            onClick=${()=>i(s===e.id?null:e.id)}>
            ${T("message",{size:12})} Reply</button>`}
          ${e.viewer_can_delete&&r`<button type="button" class="comment-delete" aria-label="Delete comment"
            title="Delete comment" onClick=${()=>p(e.id)}>${T("trash",{size:12})}</button>`}
        </div>
      </div>
      <p class="comment-text">${e.body}</p>
      ${o&&n===0&&s===e.id&&r`<form class="comment-reply-form"
        onSubmit=${l=>u(l,e.id)}>
        <textarea rows="2" maxlength="2000" placeholder="Write a reply" value=${c}
          onInput=${l=>d(l.target.value)}></textarea>
        <div class="comment-form-actions">
          <button type="submit" class="btn btn-primary">${T("message",{size:14})} Post reply</button>
        </div>
      </form>`}
      ${b.length>0&&r`<div class="comment-replies">
        ${b.map(l=>Qn(l,{...t,depth:n+1}))}
      </div>`}
    </div>
  </article>`}var vs=["private","public","unlisted"];function $s(e,t){return e==="clip"?!0:!!t?.viewer_can_edit}function gs(e,t,n){return e==="public"?t.shareId:n?.public_share_id||null}function ys(e,t,n){return e==="clip"?t.clipId:n?.viewer_clip_id||null}function ks(e){let t=e?.height!=null?e.height:"",n=Math.round(e?.fps||0)||"";return`${t}p${n}`}function ws(e,t,n=8){return(e||[]).filter(a=>a.share_id!==t).slice(0,n)}function Ct({route:e}){let{user:t}=q(A),[n,a]=f(null),[o,s]=f(null),[i,c]=f([]),[d,u]=f(!1),[p,b]=f(""),[l,m]=f(!1),[h,g]=f(""),[w,x]=f(!1),[y,P]=f(!1),[U,K]=f(!1),Q=e.name==="clip"?`clip:${e.clipId}`:`public:${e.shareId}`;if(C(()=>{let v=!0;a(null),s(null),u(!1),m(!1),K(!1),x(!1);let E=e.name==="clip"?`/api/v1/clips/${encodeURIComponent(e.clipId)}`:`/api/v1/public/clips/${encodeURIComponent(e.shareId)}`;return k(E).then(R=>{v&&(a(R),e.name==="public"&&k(`/api/v1/public/clips/${encodeURIComponent(e.shareId)}/view`,{method:"POST",body:{}}).then(V=>v&&a(W=>W&&{...W,view_count:V.view_count})).catch(()=>{}))}).catch(R=>v&&s(R)),()=>{v=!1}},[Q]),C(()=>{let v=!0;return k("/api/v1/public/clips").then(E=>v&&c(E.clips||[])).catch(()=>{}),()=>{v=!1}},[Q]),o)return r`<main class="page"><${Z} name="alert" title="Couldn't load this clip" body=${o.message} /></main>`;if(!n)return r`<main class="page watch"><div><div class="skeleton-thumb"></div></div><aside class="upnext"></aside></main>`;let oe=$s(e.name,n),ne=gs(e.name,e,n),Y=ys(e.name,e,n),z=e.name==="clip"?Ye({id:n.id}):ye({share_id:e.shareId}),se=e.name==="clip"?Me({id:n.id}):re({share_id:e.shareId}),Se=e.name==="clip"?t?.display_name||t?.username||"You":n.author_name||"Unknown creator",ce=n.public_url??n.share_url??null,ue=Pe(ce,window.location.origin,ne),ae=e.name==="clip";function fe(){b(n.title),u(!0)}async function de(v){v?.preventDefault?.();let E=p.trim();if(!E||E===n.title){u(!1);return}try{await k(`/api/v1/clips/${encodeURIComponent(Y)}`,{method:"PATCH",body:{title:E}}),a(R=>({...R,title:E})),u(!1),S("Title saved.")}catch(R){S(R.message)}}function ie(){g(n.description||""),m(!0)}async function pe(){let v=h.trim();try{await k(`/api/v1/clips/${encodeURIComponent(Y)}`,{method:"PATCH",body:{description:v||null}}),a(E=>({...E,description:v||null})),m(!1),S("Description saved.")}catch(E){S(E.message)}}async function _e(v,{force:E=!1}={}){let R=n.visibility;if(!(R===v&&!E)){a(V=>({...V,visibility:v}));try{let V=await k(`/api/v1/clips/${encodeURIComponent(Y)}/visibility`,{method:"POST",body:{visibility:v}});a(W=>({...W,visibility:V.visibility,public_url:V.public_url,public_share_id:V.public_share_id})),S(`Visibility set to ${v}.`,{actionLabel:"Undo",onAction:()=>_e(R,{force:!0})})}catch(V){a(W=>({...W,visibility:R})),S(V.message)}}}async function $(){if(ue)try{await navigator.clipboard.writeText(ue),S("Link copied.")}catch{S("Couldn't copy the link.")}}async function M(){P(!1);try{await k(`/api/v1/clips/${encodeURIComponent(Y)}`,{method:"DELETE"}),S("Clip deleted."),J("/library")}catch(v){S(v.message)}}let I=[n.game_name&&r`<a class="chip chip-on" href=${`/game/${encodeURIComponent(n.game_name)}`}>${n.game_name}</a>`,$e(n.view_count),`Recorded ${j(n.recorded_at)}`,`by ${Se}`].filter(Boolean),L=ws(i,ne,8);return r`<main class="page watch">
    <div>
      <${Yn} src=${z} poster=${se} durationMs=${n.duration_ms} markers=${n.markers} />
      <div class="watch-titlerow">
        ${d?r`<input class="input watch-title-input" value=${p} autofocus
              onInput=${v=>b(v.target.value)} onBlur=${de}
              onKeyDown=${v=>{v.key==="Enter"&&de(v),v.key==="Escape"&&u(!1)}} />`:r`<h1>${n.title}
              ${oe&&r`<button type="button" class="edit-pencil" aria-label="Edit title" onClick=${fe}
                >${T("edit",{size:14})}</button>`}</h1>`}
      </div>
      <p class="watch-meta">${I.map((v,E)=>r`${E>0?" \xB7 ":""}${v}`)}</p>

      ${oe&&r`<div class="watch-actions">
        <div class="seg" role="radiogroup" aria-label="Visibility">
          ${vs.map(v=>r`<button type="button" role="radio" key=${v} aria-checked=${n.visibility===v}
              class=${`seg-item ${n.visibility===v?"seg-on":""}`} onClick=${()=>_e(v)}
              >${v[0].toUpperCase()+v.slice(1)}</button>`)}
        </div>
        <button type="button" class="btn btn-primary" disabled=${!ue} onClick=${$}>
          ${T("copy",{size:14})} Copy share link</button>
        <div class="watch-more">
          <button type="button" class="btn" aria-haspopup="menu" aria-expanded=${w}
            onClick=${()=>x(v=>!v)}>⋯</button>
          ${w&&r`<div class="menu" role="menu">
            <button type="button" class="menu-danger" role="menuitem"
              onClick=${()=>{x(!1),P(!0)}}>${T("trash",{size:14})} Delete clip</button>
          </div>`}
        </div>
      </div>`}

      <div class="watch-desc">
        ${l?r`<textarea class="input" rows="5" value=${h} autofocus
              onInput=${v=>g(v.target.value)} onBlur=${pe}
              onKeyDown=${v=>{v.key==="Enter"&&(v.ctrlKey||v.metaKey)&&pe(),v.key==="Escape"&&m(!1)}}></textarea>`:n.description?r`<p>${n.description}
              ${oe&&r`<button type="button" class="edit-pencil" aria-label="Edit description" onClick=${ie}
                >${T("edit",{size:12})}</button>`}</p>`:oe?r`<button type="button" class="watch-desc-add" onClick=${ie}>+ Add a description</button>`:""}
      </div>

      ${ae&&r`<button type="button" class="details-strip" aria-expanded=${U}
        onClick=${()=>K(v=>!v)}>
        <span><b>${ve(n.duration_ms)}</b> length</span>
        <span><b>${G(n.file_size_bytes)}</b></span>
        <span><b>${ks(n)}</b></span>
        <span><b>${n.video_codec}/${n.audio_codec}</b> ${n.container}</span>
        <span class="details-chev">${U?"\u25B4 less":"\u25BE more"}</span>
      </button>`}
      ${ae&&U&&r`<dl class="details-full">
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

      ${ne&&r`<${Xn} shareId=${ne} />`}
    </div>
    <aside class="upnext">
      <h4 class="kicker">Up next</h4>
      ${L.map(v=>r`<a class="upnext-row" key=${v.share_id} href=${`/c/${encodeURIComponent(v.share_id)}`}>
          <img src=${re(v)} alt="" loading="lazy" />
          <span><b>${v.title}</b><small>${v.author_name} · ${v.game_name||"No game"} · ${$e(v.view_count)}</small></span>
        </a>`)}
    </aside>

    <${le} open=${y} title="Delete this clip?" body="Public links stop working immediately."
      confirmLabel="Delete" danger onConfirm=${M} onCancel=${()=>P(!1)} />
  </main>`}ee();var Tt=[{top:"4%",left:"4%",width:"34%",rotate:-7},{top:"0%",left:"44%",width:"30%",rotate:5},{top:"34%",left:"68%",width:"28%",rotate:-4},{top:"50%",left:"8%",width:"30%",rotate:6},{top:"62%",left:"42%",width:"26%",rotate:-5},{top:"26%",left:"-4%",width:"22%",rotate:9}];function Ss(e){return Array.isArray(e)?e.slice(0,Tt.length).map((t,n)=>({clip:t,...Tt[n]})):[]}function xs(e){let t=e?.clips;if(!Array.isArray(t)||t.length===0)return null;let n=t.length,a=e.has_more?"+":"";return`${n}${a} clip${n===1?"":"s"} on this instance`}function Cs({top:e,left:t,width:n,rotate:a}){return`top:${e};left:${t};width:${n};transform:rotate(${a}deg);`}function ea(e){let t=String(e||"").trim();return t||null}function Ts(){let[e,t]=f(null);C(()=>{let o=!0;return k(`/api/v1/public/clips?page_size=${Tt.length}`).then(s=>o&&t(s)).catch(()=>o&&t(null)),()=>{o=!1}},[]);let n=Ss(e?.clips),a=xs(e);return r`<aside class="login-montage" aria-hidden="true">
    ${n.length>0&&r`<div class="login-montage-tiles">
      ${n.map((o,s)=>r`<img key=${s} class="login-montage-tile" style=${Cs(o)}
        src=${re(o.clip)} alt="" loading="lazy" />`)}
    </div>`}
    <div class="login-montage-copy">
      <h2>Your clips. Your server.</h2>
      ${a&&r`<p>${a}</p>`}
    </div>
  </aside>`}function we({titleId:e,children:t}){return r`<div class="login-page">
    <${Ts} />
    <section class="login-panel" aria-labelledby=${e}>
      <div class="login-brand" aria-hidden="true">
        <img src="/clipline-icon.svg" alt="" width="32" height="32" />
        <span class="login-brand-word">CLIP<b>LINE</b></span>
        <span class="login-brand-descriptor">CLOUD</span>
      </div>
      ${t}
    </section>
  </div>`}function ta(){let{user:e}=q(A),[t,n]=f(""),[a,o]=f(""),[s,i]=f(""),[c,d]=f(!1);if(C(()=>{e&&J("/library")},[e]),e)return null;async function u(p){if(p.preventDefault(),!c){d(!0),i("");try{let b=await k("/api/v1/auth/login",{method:"POST",body:{username:t,password:a}});Ce(b.csrf_token),A.set({user:b.user,csrfToken:b.csrf_token,ready:!0}),J("/library")}catch(b){i(b instanceof be?b.message:"Sign in failed"),d(!1)}}}return r`<${we} titleId="login-title">
    <h1 id="login-title">Sign in</h1>
    ${s&&r`<p class="form-error" role="alert">${s}</p>`}
    <form class="login-form" onSubmit=${u}>
      <label class="login-field">
        <span>Username</span>
        <input class="input" name="username" autocomplete="username" required
          value=${t} onInput=${p=>n(p.target.value)} />
      </label>
      <label class="login-field">
        <span>Password</span>
        <input class="input" name="password" type="password" autocomplete="current-password" required
          value=${a} onInput=${p=>o(p.target.value)} />
      </label>
      <button class="btn btn-primary" type="submit" disabled=${c}>${c?"Signing in\u2026":"Sign in"}</button>
    </form>
    <p class="login-hint">Accounts are created by this server's admin.</p>
  </${we}>`}function na({route:e}){let t=!!e.invite,[n,a]=f(()=>t?"preflight":e.token?"form":"missing-token"),[o,s]=f(""),[i,c]=f(t?null:e.token),[d,u]=f(""),[p,b]=f(!1),l=t;C(()=>{if(!t)return;if(!e.token){a("missing-token");return}let w=!0;return a("preflight"),k("/api/v1/invites/claim",{method:"POST",body:{invite_token:e.token}}).then(x=>{w&&(c(x.reset_token),a("form"))}).catch(x=>{w&&(s(x instanceof be?x.message:"This invite link is invalid, used, or expired."),a("invalid"))}),()=>{w=!1}},[t,e.token]);async function m(w){if(w.preventDefault(),p)return;b(!0),u("");let x=new FormData(w.currentTarget),y={reset_token:i,new_password:String(x.get("new_password")||"")};l&&(y.username=String(x.get("username")||""),y.display_name=ea(x.get("display_name")),y.email=ea(x.get("email")));try{await k("/api/v1/auth/reset-password",{method:"POST",body:y}),S(l?"Account created. Sign in with your new password.":"Password set. Sign in with your new password."),J("/login")}catch(P){u(P instanceof be?P.message:"Request failed"),b(!1)}}if(t&&n!=="form"){let w=n==="missing-token"||n==="invalid",x=n==="missing-token"?"This invite link is missing a token.":n==="invalid"?o:"Opening invite\u2026";return r`<${we} titleId="invite-title">
      <h1 id="invite-title">Create account</h1>
      <p class="login-copy">${w?"This invite cannot be used.":"Preparing your account setup."}</p>
      ${w?r`<p class="form-error" role="alert">${x}</p>`:r`<p class="login-status">${x}</p>`}
    </${we}>`}return r`<${we} titleId="reset-title">
    <h1 id="reset-title">${l?"Create account":"Set password"}</h1>
    <p class="login-copy">${l?"Choose your Clipline Cloud account details.":"Choose a new password for your Clipline Cloud account."}</p>
    ${n==="missing-token"?r`<p class="form-error" role="alert">This reset link is missing a token.</p>`:r`
        ${d&&r`<p class="form-error" role="alert">${d}</p>`}
        <form class="login-form" onSubmit=${m}>
          ${l&&r`
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
    ${!l&&r`<a class="btn" href="/login">Sign in</a>`}
  </${we}>`}ee();function Ee({label:e,value:t,sub:n,meter:a,tone:o}){let s=o?` stat-${o}`:"";return r`<div class="stat-card">
    <p class="stat-label">${e}</p>
    <p class=${`stat-value${s}`}>${t}</p>
    ${n!=null&&r`<p class="stat-sub">${n}</p>`}
    ${a!=null&&r`<div class="stat-meter${s}">
      <span style=${`width:${Math.max(0,Math.min(1,a))*100}%`}></span>
    </div>`}
  </div>`}function Ms(e){let t=Number(e?.global_storage_warning_threshold_bytes||0);if(!t)return null;let n=Number(e?.total_storage_bytes||0);return Math.max(0,Math.min(1,n/t))}function Ps(e){if(!e?.global_storage_warning_threshold_bytes)return"Disabled";let t=G(e.global_storage_warning_threshold_bytes);return e.global_storage_warning?`At or above ${t}`:`Below ${t}`}function Es({deadJobs:e=[],failedUploads:t=[]}={}){let n=e.length+t.length;return{failedCount:n,healthy:n===0}}function te(e,t){return r`<div><dt>${e}</dt><dd>${t??"Unknown"}</dd></div>`}function aa({overview:e,deadJobs:t,failedUploads:n}){let a=Ms(e),{failedCount:o,healthy:s}=Es({deadJobs:t,failedUploads:n}),i=e.global_storage_warning_threshold_bytes;return r`<div>
    <div class="stat-grid">
      <${Ee} label="Clips" value=${String(e.total_clips)} />
      <${Ee} label="Storage" value=${G(e.total_storage_bytes)}
        sub=${i?`${G(i)} warning threshold`:null}
        meter=${a} tone=${e.global_storage_warning?"danger":void 0} />
      <${Ee} label="Users" value=${String(e.total_users)} />
      <${Ee} label="Jobs" value=${s?"All healthy":String(o)}
        tone=${s?"success":"danger"} />
    </div>
    <div class="panel">
      <h2>Server summary</h2>
      <dl class="ad-kv">
        ${te("Server version",e.server_version)}
        ${te("API version",e.api_version)}
        ${te("Public URL",e.public_url)}
        ${te("Database",e.database_backend)}
        ${te("Storage",`${e.storage_backend} \u2014 ${e.storage_summary}`)}
        ${te("Stored clips",`${e.total_clips} clips \u2014 ${G(e.total_storage_bytes)}`)}
        ${te("Users",`${e.total_users} total`)}
        ${te("Max upload",G(e.max_upload_size_bytes))}
        ${te("Part size",G(e.upload_part_size_bytes))}
        ${te("Single PUT max",G(e.single_put_max_bytes))}
        ${te("Active uploads/user",e.max_active_upload_sessions_per_user)}
        ${te("User quota",e.user_storage_quota_bytes?G(e.user_storage_quota_bytes):"Disabled")}
        ${te("Storage warning",Ps(e))}
        ${te("Upload TTL",`${e.upload_session_ttl_seconds}s`)}
        ${te("Direct S3 uploads",e.direct_s3_uploads?"Enabled":"Disabled")}
        ${te("Public media",`${e.public_media_mode}, ${e.public_read_url_ttl_seconds}s TTL`)}
      </dl>
    </div>
  </div>`}ee();function ot(e){let t=String(e||"").trim();return t||null}function Rs(e){let t=Number(String(e||"").trim());if(!Number.isFinite(t)||t<0)throw new Error("Storage quota must be a non-negative number");return Math.round(t*1024*1024*1024)}function Ds(e,t){return!(e.is_disabled||t?.id===e.id||e.role==="owner"||e.role==="admin"&&t?.role!=="owner")}function sa(e){return e?[["user","User"],["admin","Admin"]]:[["user","User"]]}function Us({isOwner:e,onCreated:t}){let[n,a]=f(!1);async function o(s){if(s.preventDefault(),n)return;a(!0);let i=s.currentTarget,c=new FormData(i);try{await k("/api/v1/users",{method:"POST",body:{username:String(c.get("username")||""),display_name:ot(c.get("display_name")),email:ot(c.get("email")),password:ot(c.get("password")),role:String(c.get("role")||"user")}}),S("User created."),i.reset(),t()}catch(d){S(d.message)}finally{a(!1)}}return r`<form class="panel section" onSubmit=${o}>
    <h2>Create user</h2>
    <label class="field"><span>Username</span><input class="input" name="username" required /></label>
    <label class="field"><span>Display name</span><input class="input" name="display_name" placeholder="Optional" /></label>
    <label class="field"><span>Email</span><input class="input" name="email" type="email" placeholder="Optional" /></label>
    <label class="field"><span>Password</span><input class="input" name="password" type="password" required /></label>
    <label class="field"><span>Role</span>
      <select class="input" name="role">
        ${sa(e).map(([s,i])=>r`<option value=${s}>${i}</option>`)}
      </select>
    </label>
    <button class="btn btn-primary" type="submit" disabled=${n}>${T("plus",{size:14})} Create user</button>
  </form>`}function Is({isOwner:e,smtpEnabled:t,onCreated:n}){let[a,o]=f(!1);async function s(i){if(i.preventDefault(),a)return;o(!0);let c=new FormData(i.currentTarget),d=i.submitter?.value==="email"?"email":"link";try{let u=await k("/api/v1/invites",{method:"POST",body:{role:String(c.get("role")||"user"),email:ot(c.get("email")),send_email:d==="email"}});S(d==="email"?"Invite sent.":"Invite link created."),n({...u,kind:"invite"})}catch(u){S(u.message)}finally{o(!1)}}return r`<form class="panel section" onSubmit=${s}>
    <h2>Invite link</h2>
    <label class="field"><span>Role</span>
      <select class="input" name="role">
        ${sa(e).map(([i,c])=>r`<option value=${i}>${c}</option>`)}
      </select>
    </label>
    <label class="field"><span>Email</span>
      <input class="input" name="email" type="email" placeholder=${t?"Optional":"SMTP disabled"} disabled=${!t} />
    </label>
    <div class="actions">
      <button class="btn" type="submit" name="intent" value="link" disabled=${a}>${T("copy",{size:14})} Generate link</button>
      ${t&&r`<button class="btn btn-primary" type="submit" name="intent" value="email" disabled=${a}>${T("message",{size:14})} Send email</button>`}
    </div>
  </form>`}function Ls({resetLink:e}){if(!e)return null;let t=e.kind==="invite"?"Invite":"Reset",n=e.username?` for ${e.username}`:"",a=async()=>{try{await navigator.clipboard.writeText(e.reset_url),S("Copied to clipboard.")}catch{S("Copy failed. Select and copy the URL manually.")}};return r`<div class="notice admin-reset-link">
    <div>
      <strong>${t} link created${n}</strong>
      <span>Expires ${j(e.expires_at)}</span>
      <code>${e.reset_url}</code>
    </div>
    <button class="btn" type="button" onClick=${a}>${T("copy",{size:14})} Copy</button>
  </div>`}function As(e){return e.is_disabled?r`<span class="badge badge-warn">Disabled</span>`:r`<span class="badge badge-public">Active</span>`}function Ns({user:e,currentUser:t,onQuota:n,onReset:a,onDisable:o}){let s=e.storage_quota_bytes!=null?G(e.storage_quota_bytes):"No limit",i=!Ds(e,t);return r`<tr>
    <td>
      <strong>${e.username}</strong>
      <div class="muted">${e.display_name||e.id}</div>
      ${e.email&&r`<div class="muted">${e.email}</div>`}
    </td>
    <td>${e.role}</td>
    <td>${As(e)}</td>
    <td>
      <strong>${G(e.storage_bytes||0)}</strong>
      <div class="muted">quota ${s}</div>
    </td>
    <td>${j(e.last_login_at)}</td>
    <td>
      <div class="actions">
        <button class="btn" type="button" onClick=${()=>n(e)}>${T("sliders",{size:14})} Quota</button>
        <button class="btn" type="button" onClick=${()=>a(e)}>${T("clipboard",{size:14})} Reset link</button>
        <button class="btn btn-danger" type="button" disabled=${i} onClick=${()=>o(e)}>${T("x",{size:14})} Disable</button>
      </div>
    </td>
  </tr>`}function oa({users:e,settings:t,currentUser:n,resetLink:a,setResetLink:o,reload:s}){let[i,c]=f(null),d=n?.role==="owner",u=!!t?.smtp_enabled,p=()=>c(null);async function b(){let{type:m,user:h,value:g}=i;p();try{if(m==="quota"){let w=g.trim()?Rs(g):null;await k(`/api/v1/users/${encodeURIComponent(h.id)}`,{method:"PATCH",body:{storage_quota_bytes:w}}),S("Storage quota updated.")}else if(m==="disable")await k(`/api/v1/users/${encodeURIComponent(h.id)}`,{method:"DELETE",body:{reauth_password:g}}),S("User disabled.");else if(m==="reset"){let w=await k(`/api/v1/users/${encodeURIComponent(h.id)}/reset-password`,{method:"POST",body:{reauth_password:g}});o({...w,kind:"reset"}),S("Reset link created.")}s()}catch(w){S(w.message)}}let l={quota:{title:"Set storage quota",description:"Enter a per-user storage limit in GiB. Leave it blank to remove the per-user limit.",confirmLabel:"Save quota",danger:!1,field:r`<label class="field"><span>Quota GiB</span>
        <input class="input" type="number" min="0" step="0.1" placeholder="No per-user limit"
          value=${i?.value||""} onInput=${m=>c(h=>({...h,value:m.target.value}))} /></label>`},disable:{title:"Disable user?",description:"This immediately revokes the user's sessions and device tokens.",confirmLabel:"Disable",danger:!0,field:r`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value||""}
          onInput=${m=>c(h=>({...h,value:m.target.value}))} /></label>`},reset:{title:"Create reset link?",description:"This creates a temporary password reset link for the selected user.",confirmLabel:"Create link",danger:!1,field:r`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value||""}
          onInput=${m=>c(h=>({...h,value:m.target.value}))} /></label>`}}[i?.type];return r`<div class="admin-grid">
    <div class="admin-side-stack">
      <${Us} isOwner=${d} onCreated=${()=>{o(null),s()}} />
      <${Is} isOwner=${d} smtpEnabled=${u}
        onCreated=${m=>{o(m),s()}} />
    </div>
    <div class="panel">
      <div class="section-header">
        <h2>Users</h2>
        <span class="muted">${e.length} total</span>
      </div>
      <${Ls} resetLink=${a} />
      <div class="table-wrap">
        <table class="lib-table">
          <thead><tr><th>Username</th><th>Role</th><th>Status</th><th>Storage</th><th>Last login</th><th></th></tr></thead>
          <tbody>
            ${e.map(m=>r`<${Ns} key=${m.id} user=${m} currentUser=${n}
              onQuota=${h=>c({type:"quota",user:h,value:""})}
              onReset=${h=>c({type:"reset",user:h,value:""})}
              onDisable=${h=>c({type:"disable",user:h,value:""})} />`)}
          </tbody>
        </table>
      </div>
    </div>
    <${le} open=${!!i}
      title=${l?.title}
      body=${l&&r`${l.description} ${l.field}`}
      confirmLabel=${l?.confirmLabel} danger=${l?.danger}
      confirmDisabled=${i?.type!=="quota"&&!i?.value?.trim()}
      onConfirm=${b} onCancel=${p} />
  </div>`}ee();function rt(e){let t=String(e||"").trim();return t||null}function ra({settings:e,isOwner:t,reload:n}){let[a,o]=f(!1);async function s(i){if(i.preventDefault(),a)return;o(!0);let c=new FormData(i.currentTarget),d={allow_vod_uploads:c.get("allow_vod_uploads")==="on",vod_threshold_minutes:Number(c.get("vod_threshold_minutes")||30)};if(t){d.about_text=String(c.get("about_text")||""),d.smtp_enabled=c.get("smtp_enabled")==="on",d.smtp_host=rt(c.get("smtp_host")),d.smtp_port=Number(c.get("smtp_port")||587),d.smtp_tls_mode=String(c.get("smtp_tls_mode")||"starttls"),d.smtp_username=rt(c.get("smtp_username")),d.smtp_from_email=rt(c.get("smtp_from_email")),d.smtp_from_name=rt(c.get("smtp_from_name"));let u=String(c.get("smtp_password")||"").trim();u&&(d.smtp_password=u),c.get("smtp_password_clear")==="on"&&(d.smtp_password_clear=!0)}try{await k("/api/v1/admin/settings",{method:"PATCH",body:d}),S("Settings saved."),n()}catch(u){S(u.message)}finally{o(!1)}}return r`<form class="admin-settings-page" onSubmit=${s}>
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
            ${[["starttls","STARTTLS"],["tls","TLS"],["none","None"]].map(([i,c])=>r`<option value=${i} selected=${(e.smtp_tls_mode||"starttls")===i}>${c}</option>`)}
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
      <button class="btn btn-primary" type="submit" disabled=${a}>${T("save",{size:14})} Save settings</button>
    </div>
  </form>`}function zs(e){return`${(e/100).toFixed(e%100===0?0:1)}%`}function Fs(e){switch(e){case"delete_and_retry":return"delete the failed upload and retry from a new session";case"retry":return"retry the current upload request";default:return""}}function Bs({upload:e}){let t=Math.max(0,Math.min(1e4,Number(e.progress_basis_points||0))),n=Fs(e.recovery_action);return r`<div class="job-item">
    <div class="job-title-line">
      <strong class="mono">${e.id}</strong>
      <span class="badge badge-warn">${zs(t)}</span>
    </div>
    <div class="progress-meter" aria-label="Upload progress"><span style=${`width:${t/100}%`}></span></div>
    <span class="muted">clip ${e.clip_id} — ${G(e.received_size_bytes)} of ${G(e.expected_size_bytes)} — updated ${j(e.updated_at)}</span>
    ${e.failure_reason&&r`<span class="form-error">${e.failure_reason}</span>`}
    ${n&&r`<span class="muted">Recovery: ${n}</span>`}
  </div>`}function ia({job:e}){return r`<div class="job-item">
    <strong>${e.kind} <span class="mono">${e.id}</span></strong>
    <span class="muted">${e.status} — attempts ${e.attempts}/${e.max_attempts} — updated ${j(e.updated_at)} — target ${e.target_type||""}:${e.target_id||""}</span>
    ${e.last_error&&r`<span class="form-error">${e.last_error}</span>`}
  </div>`}function Mt({title:e,items:t,renderItem:n,emptyLabel:a}){return r`<div class="panel">
    <div class="section-header">
      <h2>${e}</h2>
      <span class="muted">${t.length}</span>
    </div>
    ${t.length?r`<div class="job-list">${t.map(n)}</div>`:r`<p class="muted">${a}</p>`}
  </div>`}function la({failedUploads:e,deadJobs:t,recentErrors:n}){return r`<div class="section">
    <${Mt} title="Failed uploads" items=${e} emptyLabel="No failed uploads."
      renderItem=${a=>r`<${Bs} key=${a.id} upload=${a} />`} />
    <${Mt} title="Dead jobs" items=${t} emptyLabel="No dead jobs."
      renderItem=${a=>r`<${ia} key=${a.id} job=${a} />`} />
    <${Mt} title="Recent job errors" items=${n} emptyLabel="No recent job errors."
      renderItem=${a=>r`<${ia} key=${a.id} job=${a} />`} />
  </div>`}var ca=[["overview","server","Overview"],["users","users","Users"],["settings","sliders","Settings"],["jobs","alert","Jobs"]];function Os(e){return e?.role==="admin"||e?.role==="owner"}async function Vs(){let[e,t,n,a,o,s]=await Promise.all([k("/api/v1/admin/overview"),k("/api/v1/admin/settings"),k("/api/v1/users"),k("/api/v1/admin/uploads/failed?limit=50"),k("/api/v1/admin/jobs/dead?limit=50"),k("/api/v1/admin/jobs/recent-errors?limit=50")]);return{overview:e,settings:t,users:n,failedUploads:a,deadJobs:o,recentErrors:s}}function ua({route:e}){let{user:t}=q(A),n=Os(t),a=!!(t&&!n),o=ca.some(([h])=>h===e.tab)?e.tab:"overview",[s,i]=f(null),[c,d]=f(null),[u,p]=f(null),[b,l]=f(0),m=()=>l(h=>h+1);return C(()=>{a&&(S("Admin access required."),J("/library"))},[a]),C(()=>{if(!n)return;let h=!0;return d(null),Vs().then(g=>h&&i(g)).catch(g=>h&&d(g)),()=>{h=!1}},[n,b]),n?r`<main class="page">
    <h1>Admin</h1>
    <p class="page-subtitle">Accounts, instance summary, and processing diagnostics.</p>
    <nav class="ad-tabs" aria-label="Admin views">
      ${ca.map(([h,g,w])=>r`<a key=${h} class=${`ad-tab ${h===o?"ad-tab-on":""}`}
        href=${`/admin?tab=${h}`} aria-current=${h===o?"page":void 0}>${T(g,{size:14})} ${w}</a>`)}
    </nav>
    ${c?r`<${Z} name="alert" title="Couldn't load admin data" body=${c.message} />`:s?o==="users"?r`<${oa} users=${s.users} settings=${s.settings} currentUser=${t}
          resetLink=${u} setResetLink=${p} reload=${m} />`:o==="settings"?r`<${ra} settings=${s.settings} isOwner=${t?.role==="owner"} reload=${m} />`:o==="jobs"?r`<${la} failedUploads=${s.failedUploads} deadJobs=${s.deadJobs} recentErrors=${s.recentErrors} />`:r`<${aa} overview=${s.overview} deadJobs=${s.deadJobs} failedUploads=${s.failedUploads} />`:r`<p class="empty-state">Loading admin data…</p>`}
  </main>`:null}ee();function Hs(e){if(!e?.avatar_url)return"";let t=e.updated_at||"";if(!t)return e.avatar_url;let n=String(e.avatar_url).includes("?")?"&":"?";return`${e.avatar_url}${n}v=${encodeURIComponent(t)}`}function qs(e){return(e||"C").trim().slice(0,1).toUpperCase()||"C"}function it({user:e,size:t=40,className:n=""}){let a=Hs(e),o=`width:${t}px;height:${t}px;font-size:${Math.round(t*.4)}px`;if(a)return r`<img class=${`user-avatar ${n}`} style=${o} src=${a} alt="" />`;let s=e?.display_name||e?.username;return r`<div class=${`user-avatar user-avatar-fallback ${n}`} style=${o} aria-hidden="true">
    ${qs(s)}
  </div>`}function da(e){let t=String(e||"").trim();return t||null}async function Gs(e){let t=new Headers;t.set("Accept","application/json"),t.set("Content-Type",e.type||"application/octet-stream");let n=vt();n&&t.set("X-CSRF-Token",n);let a=await fetch("/api/v1/me/avatar",{method:"PUT",credentials:"same-origin",headers:t,body:e}),o=await a.json().catch(()=>({}));if(!a.ok)throw new Error(o.error||a.statusText||"Avatar upload failed");return o}function pa(e){A.set({...A.get(),user:e})}function Ks({user:e}){let[t,n]=f(!1);async function a(o){if(o.preventDefault(),t)return;n(!0);let s=new FormData(o.currentTarget);try{let i=await k("/api/v1/me/profile",{method:"PATCH",body:{display_name:da(s.get("display_name")),bio:da(s.get("bio"))}});pa(i),S("Profile saved.")}catch(i){S(i.message)}finally{n(!1)}}return r`<form class="profile-form" onSubmit=${a}>
    <label class="field"><span>Display name</span>
      <input class="input" name="display_name" maxlength="120" value=${e.display_name||""} placeholder=${e.username} /></label>
    <label class="field"><span>Bio</span>
      <textarea class="input" name="bio" rows="5" maxlength="2000" placeholder="Tell people what you upload.">${e.bio||""}</textarea></label>
    <div class="clip-inline-actions">
      <button class="btn btn-primary" type="submit" disabled=${t}>${T("save",{size:14})} Save profile</button>
    </div>
  </form>`}function Ws({user:e}){let[t,n]=f(!1);async function a(o){if(o.preventDefault(),t)return;let s=o.currentTarget.elements.avatar?.files?.[0];if(!s){S("Choose an avatar image first.");return}n(!0);try{let i=await Gs(s);pa(i),S("Avatar uploaded.")}catch(i){S(i.message)}finally{n(!1)}}return r`<form class="profile-form" onSubmit=${a}>
    <label class="field"><span>Avatar</span>
      <input name="avatar" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
      <small>PNG, JPEG, WebP, or GIF. Max 2 MiB.</small></label>
    <div class="clip-inline-actions">
      <button class="btn" type="submit" disabled=${t}>${T("upload",{size:14})} Upload avatar</button>
    </div>
  </form>`}function ma(){let{user:e}=q(A);return e?r`<main class="page">
    <h1>Profile</h1>
    <p class="page-subtitle">Public identity and avatar.</p>
    <div class="profile-settings-header">
      <${it} user=${e} size=${72} />
      <div>
        <h2>${e.display_name||e.username}</h2>
        <p>@${e.username} · ${e.role}</p>
      </div>
    </div>
    <${Ks} user=${e} />
    <${Ws} user=${e} />
    <div class="profile-public-link">
      <a class="btn" href=${`/u/${encodeURIComponent(e.username)}`}>${T("external",{size:14})} View public profile</a>
    </div>
  </main>`:null}ee();async function js(){let[e,t]=await Promise.all([k("/api/v1/auth/sessions"),k("/api/v1/auth/device-tokens")]);return{sessions:e,deviceTokens:t}}function Zs({item:e,onRevoke:t}){return r`<div class="management-item">
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
      <button class="btn btn-danger" type="button" onClick=${()=>t(e)}>${T("x",{size:14})} Revoke</button>
    </div>
  </div>`}function Js({item:e,onRevoke:t}){let n=!!e.revoked_at;return r`<div class="management-item">
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
      <button class="btn btn-danger" type="button" disabled=${n} onClick=${()=>t(e)}>${T("x",{size:14})} Revoke</button>
    </div>
  </div>`}function fa(){let[e,t]=f(null),[n,a]=f(null),[o,s]=f(0),[i,c]=f(null);C(()=>{let p=!0;return a(null),js().then(b=>p&&t(b)).catch(b=>p&&a(b)),()=>{p=!1}},[o]);let d=()=>s(p=>p+1);async function u(){let p=i;c(null);try{if(p.kind==="session"){if(await k(`/api/v1/auth/sessions/${encodeURIComponent(p.item.id)}`,{method:"DELETE",body:{}}),p.item.current){A.set({user:null,csrfToken:null,ready:!0}),S("Current session revoked."),J("/login");return}S("Session revoked.")}else await k(`/api/v1/auth/device-tokens/${encodeURIComponent(p.item.id)}`,{method:"DELETE",body:{}}),S("Device token revoked.");d()}catch(b){S(b.message)}}return n?r`<main class="page"><${Z} name="alert" title="Couldn't load account data" body=${n.message} /></main>`:r`<main class="page">
    <h1>Account</h1>
    <p class="page-subtitle">Sessions and device tokens.</p>
    ${e?r`<div class="account-grid">
          <div class="panel">
            <div class="section-header"><h2>Browser sessions</h2><span class="muted">${e.sessions.length} active</span></div>
            ${e.sessions.length?r`<div class="management-list">${e.sessions.map(p=>r`<${Zs} key=${p.id} item=${p}
                  onRevoke=${b=>c({kind:"session",item:b})} />`)}</div>`:r`<p class="muted">No active sessions.</p>`}
          </div>
          <div class="panel">
            <div class="section-header"><h2>Device tokens</h2><span class="muted">${e.deviceTokens.length} total</span></div>
            ${e.deviceTokens.length?r`<div class="management-list">${e.deviceTokens.map(p=>r`<${Js} key=${p.id} item=${p}
                  onRevoke=${b=>c({kind:"device",item:b})} />`)}</div>`:r`<p class="muted">No device tokens.</p>`}
          </div>
        </div>`:r`<p class="empty-state">Loading account data…</p>`}
    <${le} open=${!!i}
      title=${i?.kind==="session"?"Revoke browser session?":"Revoke device token?"}
      body=${i?.kind==="session"?i.item.current?"This signs you out of the current browser session.":"This signs out that browser session immediately.":"The desktop client using this token will need to reconnect."}
      confirmLabel="Revoke" danger
      onConfirm=${u} onCancel=${()=>c(null)} />
  </main>`}ee();function _a({route:e}){let{user:t}=q(A),[n,a]=f(null),[o,s]=f(null);if(C(()=>{let d=!0;return a(null),s(null),k(`/api/v1/public/users/${encodeURIComponent(e.username)}`).then(u=>d&&a(u)).catch(u=>d&&s(u)),()=>{d=!1}},[e.username]),o)return r`<main class="page"><${Z} name="alert" title="Profile unavailable" body=${o.message} /></main>`;if(!n)return r`<main class="page"><p class="empty-state">Loading profile…</p></main>`;let i=t&&t.username.toLowerCase()===n.username.toLowerCase(),c=n.clips||[];return r`<main class="page">
    <header class="public-user-header">
      <${it} user=${n} size=${72} />
      <div class="public-user-header-body">
        <div class="public-user-title-row">
          <div>
            <h1>${n.display_name||n.username}</h1>
            <p>@${n.username}</p>
          </div>
          ${i&&r`<a class="btn" href="/profile">${T("edit",{size:14})} Edit profile</a>`}
        </div>
        ${n.bio&&r`<p class="public-user-bio">${n.bio}</p>`}
        <p class="meta-line">${n.clip_count} public clip${n.clip_count===1?"":"s"}</p>
      </div>
    </header>
    ${c.length===0?r`<${Z} name="film" title="No public clips yet" />`:r`<div class="card-grid">
          ${c.map(d=>r`<${ke} key=${d.share_id}
            clip=${{...d,thumbnail_url:re(d),media_url:ye(d)}}
            href=${`/c/${encodeURIComponent(d.share_id)}`} showAuthor=${!1} />`)}
        </div>`}
  </main>`}ee();var ha="Clipline is a self-hosted clip library for saved gameplay moments.";function lt(e,t){return r`<div><dt>${e}</dt><dd>${t}</dd></div>`}function ba(){let[e,t]=f(ha);return C(()=>{let n=!0;return k("/api/v1/about").then(a=>n&&t(a.about_text||ha)).catch(()=>{}),()=>{n=!1}},[]),r`<main class="page">
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
  </main>`}var Ys={publicLibrary:Qe,publicGame:Qe,games:Un,library:Fn,clip:Ct,public:Ct,login:ta,resetPassword:na,admin:ua,profile:ma,account:fa,publicUser:_a,about:ba},va={publicLibrary:"feed",publicGame:"feed",games:"games",library:"library",clip:"library",admin:"admin",profile:"profile"},$a=kn({pathname:window.location.pathname,search:window.location.search});function Xs(){let e=Sn();$a=e.name;let{ready:t}=q(A);if(!t)return r`<div class="boot">Loading…</div>`;let n=Ys[e.name]||Qe,a=e.name==="login"||e.name==="resetPassword";return r`<div class="ui" onClick=${xn}>
    ${!a&&r`<${Tn} active=${va[e.name]||""} route=${e} />`}
    <${n} route=${e} />
    ${!a&&r`<${Mn} active=${va[e.name]||""} />`}
    <${Pn} />
  </div>`}window.addEventListener("clipline:unauthorized",()=>{A.set({user:null,csrfToken:null,ready:!0}),yn($a)||J("/login")});(async()=>{try{let t=await k("/api/v1/auth/me");Ce(t.csrf_token),A.set({user:t.user,csrfToken:t.csrf_token,ready:!0})}catch{A.set({user:null,csrfToken:null,ready:!0})}let e=document.querySelector("#app");e.textContent="",en(r`<${Xs} />`,e)})();
