var ga=Object.defineProperty;var ya=(e,t)=>()=>(e&&(t=e(e=0)),t);var wa=(e,t)=>{for(var n in t)ga(e,n,{get:t[n],enumerable:!0})};var tn={};wa(tn,{ApiError:()=>_e,api:()=>k,getCsrfToken:()=>_t,setCsrfToken:()=>ke});function ke(e){Oe=e}function _t(){return Oe}async function k(e,t={}){let n=(t.method||"GET").toUpperCase(),a=new Headers(t.headers||{});a.set("Accept","application/json");let o=t.body;o&&typeof o!="string"&&(a.set("Content-Type","application/json"),o=JSON.stringify(o)),!["GET","HEAD","OPTIONS"].includes(n)&&Oe&&a.set("X-CSRF-Token",Oe);let s=await fetch(e,{...t,body:o,credentials:"same-origin",headers:a,method:n}),c=(s.headers.get("content-type")||"").includes("application/json")?await s.json():await s.text();if(!s.ok){s.status===401&&window.dispatchEvent(new CustomEvent("clipline:unauthorized"));let d=typeof c=="object"&&c?.error?c.error:s.statusText;throw new _e(d||"Request failed",s.status)}return c}var Oe,_e,J=ya(()=>{Oe=null;_e=class extends Error{constructor(t,n){super(t),this.status=n}}});var ze,A,Bt,ka,fe,At,Ot,Ht,it,Re,we,Vt,ut,lt,ct,xa,Le={},Ae=[],Ca=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,Fe=Array.isArray;function de(e,t){for(var n in t)e[n]=t[n];return e}function dt(e){e&&e.parentNode&&e.parentNode.removeChild(e)}function pt(e,t,n){var a,o,s,i={};for(s in t)s=="key"?a=t[s]:s=="ref"?o=t[s]:i[s]=t[s];if(arguments.length>2&&(i.children=arguments.length>3?ze.call(arguments,2):n),typeof e=="function"&&e.defaultProps!=null)for(s in e.defaultProps)i[s]===void 0&&(i[s]=e.defaultProps[s]);return Ue(e,i,a,o,null)}function Ue(e,t,n,a,o){var s={type:e,props:t,key:n,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:o??++Bt,__i:-1,__u:0};return o==null&&A.vnode!=null&&A.vnode(s),s}function Be(e){return e.children}function Ie(e,t){this.props=e,this.context=t}function ve(e,t){if(t==null)return e.__?ve(e.__,e.__i+1):null;for(var n;t<e.__k.length;t++)if((n=e.__k[t])!=null&&n.__e!=null)return n.__e;return typeof e.type=="function"?ve(e):null}function Sa(e){if(e.__P&&e.__d){var t=e.__v,n=t.__e,a=[],o=[],s=de({},t);s.__v=t.__v+1,A.vnode&&A.vnode(s),mt(e.__P,s,t,e.__n,e.__P.namespaceURI,32&t.__u?[n]:null,a,n??ve(t),!!(32&t.__u),o),s.__v=t.__v,s.__.__k[s.__i]=s,jt(a,s,o),t.__e=t.__=null,s.__e!=n&&qt(s)}}function qt(e){if((e=e.__)!=null&&e.__c!=null)return e.__e=e.__c.base=null,e.__k.some(function(t){if(t!=null&&t.__e!=null)return e.__e=e.__c.base=t.__e}),qt(e)}function Nt(e){(!e.__d&&(e.__d=!0)&&fe.push(e)&&!Ne.__r++||At!=A.debounceRendering)&&((At=A.debounceRendering)||Ot)(Ne)}function Ne(){try{for(var e,t=1;fe.length;)fe.length>t&&fe.sort(Ht),e=fe.shift(),t=fe.length,Sa(e)}finally{fe.length=Ne.__r=0}}function Kt(e,t,n,a,o,s,i,c,d,u,p){var h,l,m,v,g,w,x,y=a&&a.__k||Ae,P=t.length;for(d=Ta(n,t,y,d,P),h=0;h<P;h++)(m=n.__k[h])!=null&&(l=m.__i!=-1&&y[m.__i]||Le,m.__i=h,w=mt(e,m,l,o,s,i,c,d,u,p),v=m.__e,m.ref&&l.ref!=m.ref&&(l.ref&&ft(l.ref,null,m),p.push(m.ref,m.__c||v,m)),g==null&&v!=null&&(g=v),(x=!!(4&m.__u))||l.__k===m.__k?(d=Gt(m,d,e,x),x&&l.__e&&(l.__e=null)):typeof m.type=="function"&&w!==void 0?d=w:v&&(d=v.nextSibling),m.__u&=-7);return n.__e=g,d}function Ta(e,t,n,a,o){var s,i,c,d,u,p=n.length,h=p,l=0;for(e.__k=new Array(o),s=0;s<o;s++)(i=t[s])!=null&&typeof i!="boolean"&&typeof i!="function"?(typeof i=="string"||typeof i=="number"||typeof i=="bigint"||i.constructor==String?i=e.__k[s]=Ue(null,i,null,null,null):Fe(i)?i=e.__k[s]=Ue(Be,{children:i},null,null,null):i.constructor===void 0&&i.__b>0?i=e.__k[s]=Ue(i.type,i.props,i.key,i.ref?i.ref:null,i.__v):e.__k[s]=i,d=s+l,i.__=e,i.__b=e.__b+1,c=null,(u=i.__i=Ma(i,n,d,h))!=-1&&(h--,(c=n[u])&&(c.__u|=2)),c==null||c.__v==null?(u==-1&&(o>p?l--:o<p&&l++),typeof i.type!="function"&&(i.__u|=4)):u!=d&&(u==d-1?l--:u==d+1?l++:(u>d?l--:l++,i.__u|=4))):e.__k[s]=null;if(h)for(s=0;s<p;s++)(c=n[s])!=null&&(2&c.__u)==0&&(c.__e==a&&(a=ve(c)),Jt(c,c));return a}function Gt(e,t,n,a){var o,s;if(typeof e.type=="function"){for(o=e.__k,s=0;o&&s<o.length;s++)o[s]&&(o[s].__=e,t=Gt(o[s],t,n,a));return t}e.__e!=t&&(a&&(t&&e.type&&!t.parentNode&&(t=ve(e)),n.insertBefore(e.__e,t||null)),t=e.__e);do t=t&&t.nextSibling;while(t!=null&&t.nodeType==8);return t}function Ma(e,t,n,a){var o,s,i,c=e.key,d=e.type,u=t[n],p=u!=null&&(2&u.__u)==0;if(u===null&&c==null||p&&c==u.key&&d==u.type)return n;if(a>(p?1:0)){for(o=n-1,s=n+1;o>=0||s<t.length;)if((u=t[i=o>=0?o--:s++])!=null&&(2&u.__u)==0&&c==u.key&&d==u.type)return i}return-1}function zt(e,t,n){t[0]=="-"?e.setProperty(t,n??""):e[t]=n==null?"":typeof n!="number"||Ca.test(t)?n:n+"px"}function De(e,t,n,a,o){var s,i;e:if(t=="style")if(typeof n=="string")e.style.cssText=n;else{if(typeof a=="string"&&(e.style.cssText=a=""),a)for(t in a)n&&t in n||zt(e.style,t,"");if(n)for(t in n)a&&n[t]==a[t]||zt(e.style,t,n[t])}else if(t[0]=="o"&&t[1]=="n")s=t!=(t=t.replace(Vt,"$1")),i=t.toLowerCase(),t=i in e||t=="onFocusOut"||t=="onFocusIn"?i.slice(2):t.slice(2),e.l||(e.l={}),e.l[t+s]=n,n?a?n[we]=a[we]:(n[we]=ut,e.addEventListener(t,s?ct:lt,s)):e.removeEventListener(t,s?ct:lt,s);else{if(o=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&t[4]!="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&n==1?"":n))}}function Ft(e){return function(t){if(this.l){var n=this.l[t.type+e];if(t[Re]==null)t[Re]=ut++;else if(t[Re]<n[we])return;return n(A.event?A.event(t):t)}}}function mt(e,t,n,a,o,s,i,c,d,u){var p,h,l,m,v,g,w,x,y,P,L,K,Z,ae,ee,Q,z=t.type;if(t.constructor!==void 0)return null;128&n.__u&&(d=!!(32&n.__u),s=[c=t.__e=n.__e]),(p=A.__b)&&p(t);e:if(typeof z=="function"){h=i.length;try{if(y=t.props,P=z.prototype&&z.prototype.render,L=(p=z.contextType)&&a[p.__c],K=p?L?L.props.value:p.__:a,n.__c?x=(l=t.__c=n.__c).__=l.__E:(P?t.__c=l=new z(y,K):(t.__c=l=new Ie(y,K),l.constructor=z,l.render=Ea),L&&L.sub(l),l.state||(l.state={}),l.__n=a,m=l.__d=!0,l.__h=[],l._sb=[]),P&&l.__s==null&&(l.__s=l.state),P&&z.getDerivedStateFromProps!=null&&(l.__s==l.state&&(l.__s=de({},l.__s)),de(l.__s,z.getDerivedStateFromProps(y,l.__s))),v=l.props,g=l.state,l.__v=t,m)P&&z.getDerivedStateFromProps==null&&l.componentWillMount!=null&&l.componentWillMount(),P&&l.componentDidMount!=null&&l.__h.push(l.componentDidMount);else{if(P&&z.getDerivedStateFromProps==null&&y!==v&&l.componentWillReceiveProps!=null&&l.componentWillReceiveProps(y,K),t.__v==n.__v||!l.__e&&l.shouldComponentUpdate!=null&&l.shouldComponentUpdate(y,l.__s,K)===!1){t.__v!=n.__v&&(l.props=y,l.state=l.__s,l.__d=!1),t.__e=n.__e,t.__k=n.__k,t.__k.some(function(ne){ne&&(ne.__=t)}),Ae.push.apply(l.__h,l._sb),l._sb=[],l.__h.length&&i.push(l);break e}l.componentWillUpdate!=null&&l.componentWillUpdate(y,l.__s,K),P&&l.componentDidUpdate!=null&&l.__h.push(function(){l.componentDidUpdate(v,g,w)})}if(l.context=K,l.props=y,l.__P=e,l.__e=!1,Z=A.__r,ae=0,P)l.state=l.__s,l.__d=!1,Z&&Z(t),p=l.render(l.props,l.state,l.context),Ae.push.apply(l.__h,l._sb),l._sb=[];else do l.__d=!1,Z&&Z(t),p=l.render(l.props,l.state,l.context),l.state=l.__s;while(l.__d&&++ae<25);l.state=l.__s,l.getChildContext!=null&&(a=de(de({},a),l.getChildContext())),P&&!m&&l.getSnapshotBeforeUpdate!=null&&(w=l.getSnapshotBeforeUpdate(v,g)),ee=p!=null&&p.type===Be&&p.key==null?Zt(p.props.children):p,c=Kt(e,Fe(ee)?ee:[ee],t,n,a,o,s,i,c,d,u),l.base=t.__e,t.__u&=-161,l.__h.length&&i.push(l),x&&(l.__E=l.__=null)}catch(ne){if(i.length=h,t.__v=null,d||s!=null){if(ne.then){for(t.__u|=d?160:128;c&&c.nodeType==8&&c.nextSibling;)c=c.nextSibling;s!=null&&(s[s.indexOf(c)]=null),t.__e=c}else if(s!=null)for(Q=s.length;Q--;)dt(s[Q])}else t.__e=n.__e;t.__k==null&&(t.__k=n.__k||[]),ne.then||Wt(t),A.__e(ne,t,n)}}else s==null&&t.__v==n.__v?(t.__k=n.__k,t.__e=n.__e):c=t.__e=Pa(n.__e,t,n,a,o,s,i,d,u);return(p=A.diffed)&&p(t),128&t.__u?void 0:c}function Wt(e){e&&(e.__c&&(e.__c.__e=!0),e.__k&&e.__k.some(Wt))}function jt(e,t,n){for(var a=0;a<n.length;a++)ft(n[a],n[++a],n[++a]);A.__c&&A.__c(t,e),e.some(function(o){try{e=o.__h,o.__h=[],e.some(function(s){s.call(o)})}catch(s){A.__e(s,o.__v)}})}function Zt(e){return typeof e!="object"||e==null||e.__b>0?e:Fe(e)?e.map(Zt):e.constructor!==void 0?null:de({},e)}function Pa(e,t,n,a,o,s,i,c,d){var u,p,h,l,m,v,g,w=n.props||Le,x=t.props,y=t.type;if(y=="svg"?o="http://www.w3.org/2000/svg":y=="math"?o="http://www.w3.org/1998/Math/MathML":o||(o="http://www.w3.org/1999/xhtml"),s!=null){for(u=0;u<s.length;u++)if((m=s[u])&&"setAttribute"in m==!!y&&(y?m.localName==y:m.nodeType==3)){e=m,s[u]=null;break}}if(e==null){if(y==null)return document.createTextNode(x);e=document.createElementNS(o,y,x.is&&x),c&&(A.__m&&A.__m(t,s),c=!1),s=null}if(y==null)w===x||c&&e.data==x||(e.data=x);else{if(s=y=="textarea"&&x.defaultValue!=null?null:s&&ze.call(e.childNodes),!c&&s!=null)for(w={},u=0;u<e.attributes.length;u++)w[(m=e.attributes[u]).name]=m.value;for(u in w)m=w[u],u=="dangerouslySetInnerHTML"?h=m:u=="children"||u in x||u=="value"&&"defaultValue"in x||u=="checked"&&"defaultChecked"in x||De(e,u,null,m,o);for(u in x)m=x[u],u=="children"?l=m:u=="dangerouslySetInnerHTML"?p=m:u=="value"?v=m:u=="checked"?g=m:c&&typeof m!="function"||w[u]===m||De(e,u,m,w[u],o);if(p)c||h&&(p.__html==h.__html||p.__html==e.innerHTML)||(e.innerHTML=p.__html),t.__k=[];else if(h&&(e.innerHTML=""),Kt(t.type=="template"?e.content:e,Fe(l)?l:[l],t,n,a,y=="foreignObject"?"http://www.w3.org/1999/xhtml":o,s,i,s?s[0]:n.__k&&ve(n,0),c,d),s!=null)for(u=s.length;u--;)dt(s[u]);c&&y!="textarea"||(u="value",y=="progress"&&v==null?e.removeAttribute("value"):v!=null&&(v!==e[u]||y=="progress"&&!v||y=="option"&&v!=w[u])&&De(e,u,v,w[u],o),u="checked",g!=null&&g!=e[u]&&De(e,u,g,w[u],o))}return e}function ft(e,t,n){try{if(typeof e=="function"){var a=typeof e.__u=="function";a&&e.__u(),a&&t==null||(e.__u=e(t))}else e.current=t}catch(o){A.__e(o,n)}}function Jt(e,t,n){var a,o;if(A.unmount&&A.unmount(e),(a=e.ref)&&(a.current&&a.current!=e.__e||ft(a,null,t)),(a=e.__c)!=null){if(a.componentWillUnmount)try{a.componentWillUnmount()}catch(s){A.__e(s,t)}a.base=a.__P=a.__n=null}if(a=e.__k)for(o=0;o<a.length;o++)a[o]&&Jt(a[o],t,n||typeof e.type!="function");n||dt(e.__e),e.__c=e.__=e.__e=void 0}function Ea(e,t,n){return this.constructor(e,n)}function Yt(e,t,n){var a,o,s,i;t==document&&(t=document.documentElement),A.__&&A.__(e,t),o=(a=typeof n=="function")?null:n&&n.__k||t.__k,s=[],i=[],mt(t,e=(!a&&n||t).__k=pt(Be,null,[e]),o||Le,Le,t.namespaceURI,!a&&n?[n]:o?null:t.firstChild?ze.call(t.childNodes):null,s,!a&&n?n:o?o.__e:t.firstChild,a,i),jt(s,e,i),e.props.children=null}ze=Ae.slice,A={__e:function(e,t,n,a){for(var o,s,i;t=t.__;)if((o=t.__c)&&!o.__)try{if((s=o.constructor)&&s.getDerivedStateFromError!=null&&(o.setState(s.getDerivedStateFromError(e)),i=o.__d),o.componentDidCatch!=null&&(o.componentDidCatch(e,a||{}),i=o.__d),i)return o.__E=o}catch(c){e=c}throw e}},Bt=0,ka=function(e){return e!=null&&e.constructor===void 0},Ie.prototype.setState=function(e,t){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=de({},this.state),typeof e=="function"&&(e=e(de({},n),this.props)),e&&de(n,e),e!=null&&this.__v&&(t&&this._sb.push(t),Nt(this))},Ie.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),Nt(this))},Ie.prototype.render=Be,fe=[],Ot=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,Ht=function(e,t){return e.__v.__b-t.__v.__b},Ne.__r=0,it=Math.random().toString(8),Re="__d"+it,we="__a"+it,Vt=/(PointerCapture)$|Capture$/i,ut=0,lt=Ft(!1),ct=Ft(!0),xa=0;var Qt=function(e,t,n,a){var o;t[0]=0;for(var s=1;s<t.length;s++){var i=t[s++],c=t[s]?(t[0]|=i?1:2,n[t[s++]]):t[++s];i===3?a[0]=c:i===4?a[1]=Object.assign(a[1]||{},c):i===5?(a[1]=a[1]||{})[t[++s]]=c:i===6?a[1][t[++s]]+=c+"":i?(o=e.apply(c,Qt(e,c,n,["",null])),a.push(o),c[0]?t[0]|=2:(t[s-2]=0,t[s]=o)):a.push(c)}return a},Xt=new Map;function en(e){var t=Xt.get(this);return t||(t=new Map,Xt.set(this,t)),(t=Qt(this,t.get(e)||(t.set(e,t=(function(n){for(var a,o,s=1,i="",c="",d=[0],u=function(l){s===1&&(l||(i=i.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?d.push(0,l,i):s===3&&(l||i)?(d.push(3,l,i),s=2):s===2&&i==="..."&&l?d.push(4,l,0):s===2&&i&&!l?d.push(5,0,!0,i):s>=5&&((i||!l&&s===5)&&(d.push(s,0,i,o),s=6),l&&(d.push(s,l,0,o),s=6)),i=""},p=0;p<n.length;p++){p&&(s===1&&u(),u(p));for(var h=0;h<n[p].length;h++)a=n[p][h],s===1?a==="<"?(u(),d=[d],s=3):i+=a:s===4?i==="--"&&a===">"?(s=1,i=""):i=a+i[0]:c?a===c?c="":i+=a:a==='"'||a==="'"?c=a:a===">"?(u(),s=1):s&&(a==="="?(s=5,o=i,i=""):a==="/"&&(s<5||n[p][h+1]===">")?(u(),s===3&&(d=d[0]),s=d,(d=d[0]).push(2,0,s),s=0):a===" "||a==="	"||a===`
`||a==="\r"?(u(),s=2):i+=a),s===3&&i==="!--"&&(s=4,d=d[0])}return u(),d})(e)),t),arguments,[])).length>1?t:t[0]}var r=en.bind(pt);J();var xe,O,ht,nn,He=0,pn=[],V=A,an=V.__b,sn=V.__r,on=V.diffed,rn=V.__c,ln=V.unmount,cn=V.__;function vt(e,t){V.__h&&V.__h(O,e,He||t),He=0;var n=O.__H||(O.__H={__:[],__h:[]});return e>=n.__.length&&n.__.push({}),n.__[e]}function f(e){return He=1,Da(_n,e)}function Da(e,t,n){var a=vt(xe++,2);if(a.t=e,!a.__c&&(a.__=[n?n(t):_n(void 0,t),function(c){var d=a.__N?a.__N[0]:a.__[0],u=a.t(d,c);d!==u&&(a.__N=[u,a.__[1]],a.__c.setState({}))}],a.__c=O,!O.__f)){var o=function(c,d,u){if(!a.__c.__H)return!0;var p=!1,h=a.__c.props!==c;if(a.__c.__H.__.some(function(m){if(m.__N){p=!0;var v=m.__[0];m.__=m.__N,m.__N=void 0,v!==m.__[0]&&(h=!0)}}),s){var l=s.call(this,c,d,u);return p?l||h:l}return!p||h};O.__f=!0;var s=O.shouldComponentUpdate,i=O.componentWillUpdate;O.componentWillUpdate=function(c,d,u){if(this.__e){var p=s;s=void 0,o(c,d,u),s=p}i&&i.call(this,c,d,u)},O.shouldComponentUpdate=o}return a.__N||a.__}function T(e,t){var n=vt(xe++,3);!V.__s&&fn(n.__H,t)&&(n.__=e,n.u=t,O.__H.__h.push(n))}function F(e){return He=5,Ra(function(){return{current:e}},[])}function Ra(e,t){var n=vt(xe++,7);return fn(n.__H,t)&&(n.__=e(),n.__H=t,n.__h=e),n.__}function un(){for(var e;e=pn.shift();){var t=e.__H;if(e.__P&&t)try{t.__h.some(bt),t.__h.some(mn),t.__h=[]}catch(n){t.__h=[],V.__e(n,e.__v)}}}V.__b=function(e){O=null,an&&an(e)},V.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),cn&&cn(e,t)},V.__r=function(e){sn&&sn(e),xe=0;var t=(O=e.__c).__H;t&&(ht===O?(t.__h=[],O.__h=[],t.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(t.__h.length&&un(),xe=0)),ht=O},V.diffed=function(e){on&&on(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(pn.push(t)!==1&&nn===V.requestAnimationFrame||((nn=V.requestAnimationFrame)||Ua)(un)),t.__H.__.some(function(n){n.u&&(n.__H=n.u,n.u=void 0)})),ht=O=null},V.__c=function(e,t){t.some(function(n){try{n.__h.some(bt),n.__h=n.__h.filter(function(a){return!a.__||mn(a)})}catch(a){t.some(function(o){o.__h&&(o.__h=[])}),t=[],V.__e(a,n.__v)}}),rn&&rn(e,t)},V.unmount=function(e){ln&&ln(e);var t,n=e.__c;n&&n.__H&&(n.__H.__.some(function(a){try{bt(a)}catch(o){t=o}}),n.__H=void 0,t&&V.__e(t,n.__v))};var dn=typeof requestAnimationFrame=="function";function Ua(e){var t,n=function(){clearTimeout(a),dn&&cancelAnimationFrame(t),setTimeout(e)},a=setTimeout(n,35);dn&&(t=requestAnimationFrame(n))}function bt(e){var t=O,n=e.__c;typeof n=="function"&&(e.__c=void 0,n()),O=t}function mn(e){var t=O;e.__c=e.__(),O=t}function fn(e,t){return!e||e.length!==t.length||t.some(function(n,a){return n!==e[a]})}function _n(e,t){return typeof t=="function"?t(e):t}function hn(e){let t=e,n=new Set;return{get:()=>t,set(a){t=a,n.forEach(o=>o(t))},update(a){this.set(a(t))},subscribe(a){return n.add(a),()=>n.delete(a)}}}function j(e){let[t,n]=f(e.get());return T(()=>e.subscribe(n),[e]),t}var N=hn({user:null,csrfToken:null,ready:!1}),Ve=hn([]),Ia=0;function C(e,{actionLabel:t,onAction:n,timeoutMs:a=5e3}={}){let o=++Ia;return Ve.update(s=>[...s,{id:o,message:e,actionLabel:t,onAction:n}]),a&&setTimeout(()=>qe(o),a),o}function qe(e){Ve.update(t=>t.filter(n=>n.id!==e))}function Ke(e){try{return decodeURIComponent(e)}catch{return e}}function bn(e){let t=Number(e.get("page")||1);return{sort:e.get("sort")||"uploaded_at_desc",game:e.get("game")||"",q:e.get("q")||"",page:Number.isFinite(t)?Math.max(1,t):1}}var La=["login","resetPassword","public","publicLibrary","publicGame","publicUser","about","games"];function vn(e){return La.includes(e)}function Ge(e,t){let n=new URLSearchParams(t||""),a=e;return a.startsWith("/c/")?{name:"public",shareId:Ke(a.slice(3))}:a==="/"||a==="/public"||a==="/search"?{name:"publicLibrary",query:bn(n)}:a.startsWith("/game/")?{name:"publicGame",game:Ke(a.slice(6)),query:bn(n)}:a==="/about"?{name:"about"}:a==="/games"?{name:"games"}:a.startsWith("/u/")?{name:"publicUser",username:Ke(a.slice(3))}:a==="/library"?{name:"library"}:a.startsWith("/clip/")?{name:"clip",clipId:Ke(a.slice(6))}:a==="/admin"?{name:"admin",tab:n.get("tab")||"overview"}:a==="/account"?{name:"account"}:a==="/profile"?{name:"profile"}:a==="/login"?{name:"login"}:a==="/reset-password"?{name:"resetPassword",token:n.get("token")||"",invite:n.get("invite")==="1"}:{name:"publicLibrary"}}function $n(e){return Ge(e.pathname,e.search).name}var $t=new Set;function Y(e){window.history.pushState({},"",e),gn()}function gn(){let{pathname:e,search:t}=window.location,n=Ge(e,t);$t.forEach(a=>a(n))}window.addEventListener("popstate",gn);function yn(){let[e,t]=f(()=>Ge(window.location.pathname,window.location.search));return T(()=>($t.add(t),()=>$t.delete(t)),[]),e}function wn(e){let t=e.target.closest("a[href^='/']");!t||t.target||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||(e.preventDefault(),Y(t.getAttribute("href")))}var kn={alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',clipboard:'<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',copy:'<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',external:'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',fastForward:'<path d="m13 19 9-7-9-7v14Z"/><path d="m2 19 9-7-9-7v14Z"/>',film:'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 8h4"/><path d="M3 16h4"/><path d="M17 8h4"/><path d="M17 16h4"/>',fullscreen:'<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/><path d="M12 2a15.3 15.3 0 0 0 0 20"/>',home:'<path d="m3 10 9-7 9 7"/><path d="M5 8.5V20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5"/><path d="M9 22V12h6v10"/>',info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',library:'<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',lock:'<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',logOut:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',menu:'<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',message:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>',notepad:'<path d="M8 2v4"/><path d="M16 2v4"/><path d="M3 10h18"/><path d="M6 4h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/><path d="M8 14h8"/><path d="M8 18h5"/>',pause:'<path d="M8 5v14"/><path d="M16 5v14"/>',play:'<path d="m8 5 11 7-11 7V5Z"/>',plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',check:'<path d="M20 6 9 17l-5-5"/>',refresh:'<path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/><path d="M3 12A9 9 0 0 1 18.5 5.7L21 8"/><path d="M21 3v5h-5"/>',rewind:'<path d="m11 19-9-7 9-7v14Z"/><path d="m22 19-9-7 9-7v14Z"/>',save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',server:'<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',skipBack:'<path d="M19 20 9 12l10-8v16Z"/><path d="M5 19V5"/>',skipForward:'<path d="m5 4 10 8-10 8V4Z"/><path d="M19 5v14"/>',shield:'<path d="M20 13c0 5-3.5 7.5-7.7 8.8a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V5l8-3 8 3v8Z"/>',sliders:'<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>',theater:'<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M6 9h12"/><path d="M6 15h12"/>',trash:'<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',volume2:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9 9 0 0 1 0 14"/>',volumeX:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>',x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'};function M(e,{size:t=18}={}){return r`<svg viewBox="0 0 24 24" width=${t} height=${t} fill="none"
    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" dangerouslySetInnerHTML=${{__html:kn[e]||""}} />`}function xn({active:e}){let{user:t}=j(N),[n,a]=f(!1),o=F(null),s=t?.role==="admin"||t?.role==="owner";T(()=>{if(!n)return;let d=p=>{o.current?.contains(p.target)||a(!1)},u=p=>{p.key==="Escape"&&a(!1)};return document.addEventListener("pointerdown",d),document.addEventListener("keydown",u),()=>{document.removeEventListener("pointerdown",d),document.removeEventListener("keydown",u)}},[n]);let i=[["feed","/","Feed"],["library","/library","Library",!!t],["games","/games","Games"],["admin","/admin","Admin",s]].filter(([,,,d])=>d!==!1),c=d=>{d.preventDefault();let u=new FormData(d.target).get("q")?.toString().trim();Y(u?`/search?q=${encodeURIComponent(u)}`:"/search")};return r`<header class="topbar">
    <a class="wordmark" href="/" aria-label="Clipline home">
      <img src="/clipline-icon.svg" alt="" width="24" height="24" />
      CLIP<b>LINE</b>
    </a>
    <nav class="topnav" aria-label="Primary">
      ${i.map(([d,u,p])=>r`
        <a class=${d===e?"topnav-on":""} href=${u}>${p}</a>`)}
    </nav>
    <form class="topsearch" role="search" onSubmit=${c}>
      <input class="input" name="q" placeholder="Search clips, games, players…" aria-label="Search" />
    </form>
    ${t?r`<div class="avatar-wrap" ref=${o}>
          <button class="avatar-btn" aria-haspopup="menu" aria-expanded=${n}
            onClick=${()=>a(!n)}>
            <span class="avatar">${(t.display_name||t.username)[0].toUpperCase()}</span>
          </button>
          ${n&&r`<div class="menu" role="menu" onClick=${()=>a(!1)}>
            <a role="menuitem" href="/profile">Profile</a>
            <a role="menuitem" href="/account">Account</a>
            ${s&&r`<a role="menuitem" href="/admin">Admin</a>`}
            <button role="menuitem" class="menu-danger" onClick=${Aa}>Sign out</button>
          </div>`}
        </div>`:r`<a class="btn" href="/login">${M("lock",{size:14})} Sign in</a>`}
  </header>`}async function Aa(){let{api:e}=await Promise.resolve().then(()=>(J(),tn));try{await e("/api/v1/auth/logout",{method:"POST"})}catch{}N.set({user:null,csrfToken:null,ready:!0}),Y("/login")}function Cn({active:e}){return r`<nav class="tabbar" aria-label="Primary">
    ${[["feed","/","home","Feed"],["library","/library","library","Library"],["search","/search","search","Search"],["profile","/profile","user","Profile"]].map(([n,a,o,s])=>r`
      <a class=${n===e?"tab-on":""} href=${a}>${M(o)}<span>${s}</span></a>`)}
  </nav>`}function Sn(){let e=j(Ve);return r`<div class="toasts" role="status" aria-live="polite">
    ${e.map(t=>r`<div class="toast" key=${t.id}>
      <span>${t.message}</span>
      ${t.actionLabel&&r`<button class="toast-action"
        onClick=${()=>{t.onAction?.(),qe(t.id)}}>${t.actionLabel}</button>`}
      <button class="toast-x" aria-label="Dismiss" onClick=${()=>qe(t.id)}>✕</button>
    </div>`)}
  </div>`}J();function G(e){if(!e)return"Unknown";let t=new Date(e);return Number.isNaN(t.getTime())?"Unknown":new Intl.DateTimeFormat(void 0,{dateStyle:"medium",timeStyle:"short"}).format(t)}function he(e){if(e==null)return"Unknown";let t=Math.max(0,Math.round(Number(e)/1e3)),n=Math.floor(t/60),a=t%60;return`${n}:${String(a).padStart(2,"0")}`}function We(e){if(!e)return"Unknown";let t=new Date(e);if(Number.isNaN(t.getTime()))return"Unknown";let n=Math.min(0,t.getTime()-Date.now()),a=[["year",365*24*60*60*1e3],["month",720*60*60*1e3],["week",10080*60*1e3],["day",1440*60*1e3],["hour",3600*1e3],["minute",60*1e3],["second",1e3]],[o,s]=a.find(([,c])=>Math.abs(n)>=c)||a[a.length-1],i=Math.round(n/s);return new Intl.RelativeTimeFormat(void 0,{numeric:"always"}).format(i,o)}function q(e){if(e==null)return"Unknown";let t=Number(e);if(!Number.isFinite(t))return"Unknown";let n=["B","KiB","MiB","GiB","TiB"],a=t,o=0;for(;a>=1024&&o<n.length-1;)a/=1024,o+=1;return`${a.toFixed(o===0?0:1)} ${n[o]}`}function be(e){let t=Number(e||0),n=Number.isFinite(t)&&t>0?Math.floor(t):0;return`${new Intl.NumberFormat(void 0,{notation:n>=1e4?"compact":"standard"}).format(n)} view${n===1?"":"s"}`}function se(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/thumbnail`}function Ce(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/thumbnail`}function je(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/media`}function Tn(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/media`}var Ze=null;function Mn(e){Ze?.(),Ze=e}function Pn(e){Ze===e&&(Ze=null)}var Na=()=>window.matchMedia("(pointer: fine)").matches&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches&&!navigator.connection?.saveData;function En({src:e,poster:t,alt:n=""}){let[a,o]=f(!1),[s,i]=f(0),c=F(null),d=F(null),u=F(!0),p=F(),h=()=>{u.current&&(clearTimeout(c.current),o(!1),i(0))};p.current=h;let l=()=>{!e||!Na()||(c.current=setTimeout(()=>{u.current&&(Mn(p.current),o(!0))},300))},m=v=>{let g=v.target;g.duration&&i(g.currentTime/g.duration)};return T(()=>()=>{u.current=!1,clearTimeout(c.current),Pn(p.current)},[]),r`<span class="hover-preview" onPointerEnter=${l} onPointerLeave=${h}>
    ${a?r`<video ref=${d} src=${e} poster=${t} muted loop autoplay
          playsinline preload="none" onTimeUpdate=${m} />`:r`<img src=${t} alt=${n} loading="lazy" />`}
    ${a&&r`<span class="preview-scrub"><span style=${`width:${s*100}%`} /></span>`}
  </span>`}function gt(e){return e.owner?.display_name||e.owner?.username||e.owner_username||e.author_name||e.author_username||null}function $e({clip:e,href:t,selectable:n=!1,selected:a=!1,onToggleSelect:o,showVisibility:s=!1,showAuthor:i=!1}){let c=gt(e),d=[e.game_name&&r`<em>${e.game_name}</em>`,i&&c,e.view_count!=null&&be(e.view_count),e.uploaded_at&&We(e.uploaded_at)].filter(Boolean);return r`<article class=${`clip-card ${a?"is-selected":""} ${n?"is-selectable":""}`}>
    <a class="card-thumb" href=${t} tabindex="-1" aria-hidden="true">
      <${En} src=${e.media_url} poster=${e.thumbnail_url} />
      ${e.duration_ms!=null&&r`<span class="dur-pill">${he(e.duration_ms)}</span>`}
      ${s&&r`<span class=${`badge badge-${e.visibility} card-vis`}>${e.visibility}</span>`}
    </a>
    ${n&&r`<label class="card-check">
      <input type="checkbox" checked=${a} aria-label=${`Select ${e.title}`}
        onChange=${()=>o?.(e.id)} />
    </label>`}
    <h3 class="card-title"><a href=${t}>${e.title}</a></h3>
    <p class="card-meta">${d.map((u,p)=>r`${p>0&&" \xB7 "}${u}`)}</p>
  </article>`}function W({name:e="film",title:t,body:n,action:a}){return r`<div class="empty">
    <div class="empty-icon">${M(e,{size:28})}</div>
    <h3>${t}</h3>
    ${n&&r`<p>${n}</p>`}
    ${a}
  </div>`}var za=[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]],Fa=6;function Je({route:e}){let t={sort:"uploaded_at_desc",page:1,q:"",...e.query,game:e.name==="publicGame"?e.game:e.query?.game||""},[n,a]=f(null),[o,s]=f([]),[i,c]=f(null);T(()=>{let g=!0;a(null),c(null);let w=new URLSearchParams;return t.sort!=="uploaded_at_desc"&&w.set("sort",t.sort),t.game&&w.set("game",t.game),t.q&&w.set("q",t.q),Number(t.page)>1&&w.set("page",String(t.page)),k(`/api/v1/public/clips${w.size?`?${w}`:""}`).then(x=>g&&a(x)).catch(x=>g&&c(x)),()=>{g=!1}},[e.name,t.sort,t.game,t.q,t.page]),T(()=>{let g=!0;return k("/api/v1/public/games").then(w=>g&&s(w.games||[])).catch(()=>{}),()=>{g=!1}},[]);let d=g=>Y(Ha({...t,page:1,...g}));if(i)return r`<main class="page">
      <${W} name="alert" title="Couldn't load the feed" body=${i.message} />
    </main>`;let u=n?.clips,p=!!(t.game||t.q)||Number(t.page)>1,h=!p,l=[...o].sort((g,w)=>(w.clip_count||0)-(g.clip_count||0)),m=l.slice(0,Fa),v=l.length-m.length;return r`<main class="page">
    ${u==null?r`<${Oa} />`:u.length===0?r`<${W} name="film"
          title=${p?"No clips match this filter":"No public clips yet"}
          body=${p?"Try a different game, search, or clear your filters.":"Clips shared as public from a library will show up here."}
          action=${p&&r`<a class="btn" href="/">Clear filters</a>`} />`:r`
        ${h?Ba(u):""}
        <div class="feed-toolbar">
          <h2>Latest uploads</h2>
          <select class="input" value=${t.sort} onChange=${g=>d({sort:g.target.value})}>
            ${za.map(([g,w])=>r`<option value=${g}>${w}</option>`)}
          </select>
          <div class="chips">
            <button class=${`chip ${t.game?"":"chip-on"}`} onClick=${()=>d({game:""})}>All</button>
            ${m.map(g=>r`<button
              class=${`chip ${t.game===g.game?"chip-on":""}`}
              onClick=${()=>d({game:g.game})}>${g.game}</button>`)}
            ${v>0&&r`<a class="chip" href="/games">+${v}</a>`}
          </div>
        </div>
        <div class="card-grid">
          ${(h?u.slice(4):u).map(g=>r`<${$e} clip=${{...g,thumbnail_url:se(g)}}
              href=${yt(g)} showAuthor />`)}
        </div>
        ${Va(n,t,d)}
      `}
  </main>`}function Ba(e){let[t,...n]=e,a=n.slice(0,3);return r`<p class="kicker">Now playing on this server</p>
    <section class="hero">
      <a class="hero-main" href=${yt(t)}>
        <img src=${se(t)} alt="" loading="lazy" />
        <span class="hero-caption">▶ ${t.title} — ${t.game_name} · ${he(t.duration_ms)}</span>
      </a>
      <div class="hero-side">
        ${a.map(o=>r`<a class="hero-row" href=${yt(o)}>
            <img src=${se(o)} alt="" loading="lazy" />
            <span><b>${o.title}</b>
              <small>${gt(o)} · ${o.game_name} · ${be(o.view_count)}</small></span>
          </a>`)}
      </div>
    </section>`}function Oa({count:e=8}){return r`<div class="card-grid">
    ${Array.from({length:e},(t,n)=>r`<div class="clip-card" key=${n}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`}function yt(e){return`/c/${encodeURIComponent(e.share_id)}`}function Ha({sort:e="uploaded_at_desc",game:t="",q:n="",page:a=1}={}){let o=new URLSearchParams,s=e||"uploaded_at_desc",i=String(t||"").trim(),c=String(n||"").trim(),d=Math.max(1,Number(a||1));if(s!=="uploaded_at_desc"&&o.set("sort",s),d>1&&o.set("page",String(d)),c)return o.set("q",c),i&&o.set("game",i),`/search?${o.toString()}`;if(i){let p=o.toString();return`/game/${encodeURIComponent(i)}${p?`?${p}`:""}`}let u=o.toString();return u?`/search?${u}`:"/"}function Va(e,t,n){let a=Math.max(1,Number(t.page||1)),o=!!e?.has_more;return a<=1&&!o?"":r`<nav class="pager" aria-label="Public clip pages">
    <button class="btn" type="button" disabled=${a<=1}
      onClick=${()=>n({page:a-1})}>Previous</button>
    <span class="muted">Page ${a}</span>
    <button class="btn" type="button" disabled=${!o}
      onClick=${()=>n({page:a+1})}>Next</button>
  </nav>`}J();function Dn(){let[e,t]=f(null),[n,a]=f(null);return T(()=>{let o=!0;return k("/api/v1/public/games").then(s=>o&&t(s.games||[])).catch(s=>o&&a(s)),()=>{o=!1}},[]),n?r`<main class="page">
      <${W} name="alert" title="Couldn't load games" body=${n.message} />
    </main>`:r`<main class="page">
    <p class="kicker">Browse by game</p>
    ${e==null?r`<div class="game-grid">
          ${Array.from({length:6},(o,s)=>r`<div class="game-tile is-loading" key=${s}>
            <div class="skeleton-thumb"></div>
          </div>`)}
        </div>`:e.length===0?r`<${W} name="film" title="No games yet"
          body="Once clips are shared as public, their games will show up here." />`:r`<div class="game-grid">
          ${e.map(o=>r`<a class="game-tile" href=${`/game/${encodeURIComponent(o.game)}`}>
            ${o.thumbnail_url?r`<img src=${o.thumbnail_url} alt="" loading="lazy" />`:r`<div class="game-tile-fallback">${(o.game||"?")[0].toUpperCase()}</div>`}
            <div class="game-tile-body">
              <b>${o.game}</b>
              <small>${o.clip_count} clip${o.clip_count===1?"":"s"}</small>
            </div>
          </a>`)}
        </div>`}
  </main>`}J();function Rn({trigger:e,content:t,onClose:n,label:a,panelClass:o=""}){let[s,i]=f(!1),c=F(null),d=F(null),u=F(null),p=()=>{i(!1),n?.()},h=()=>{if(s){p();return}u.current=document.activeElement,i(!0)};return T(()=>{if(!s)return;let l=g=>{c.current?.contains(g.target)||p()},m=g=>{g.key==="Escape"&&p()};return document.addEventListener("pointerdown",l),document.addEventListener("keydown",m),d.current?.querySelector("input, select, textarea, button, a[href], [tabindex]")?.focus(),()=>{document.removeEventListener("pointerdown",l),document.removeEventListener("keydown",m),u.current?.focus?.()}},[s]),r`<div class="popover-wrap" ref=${c}>
    ${e({open:s,toggle:h})}
    ${s&&r`<div class=${`popover ${o}`} ref=${d} role="dialog" aria-label=${a||"Filters"}>
      ${t}
    </div>`}
  </div>`}function Un({count:e,onPublic:t,onPrivate:n,onCopyLinks:a,onDelete:o,onClear:s}){return e?r`<div class="bulkbar" role="toolbar" aria-label="Bulk actions">
    <b>${e} selected</b>
    <button class="btn" onClick=${t}>Make public</button>
    <button class="btn" onClick=${n}>Make private</button>
    <button class="btn" onClick=${a}>Copy links</button>
    <button class="btn btn-danger" onClick=${o}>Delete</button>
    <button class="btn bulk-x" aria-label="Clear selection" onClick=${s}>✕</button>
  </div>`:null}function re({open:e,title:t,body:n,confirmLabel:a="Confirm",onConfirm:o,onCancel:s,danger:i=!1,confirmDisabled:c=!1}){let d=F(null),u=F(null);return T(()=>{let p=d.current;p&&(e&&!p.open?(p.showModal(),u.current?.focus()):!e&&p.open&&p.close())},[e]),r`<dialog ref=${d} class="confirm-dialog" aria-labelledby="confirm-dialog-title"
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
  </dialog>`}var Ln="clipline.libraryView",qa=[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["updated_at_desc","Updated newest"],["updated_at_asc","Updated oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["size_desc","Size largest"],["size_asc","Size smallest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]],Ye={title:["title_asc","title_desc"],size:["size_asc","size_desc"],duration:["duration_asc","duration_desc"],uploaded:["uploaded_at_asc","uploaded_at_desc"]},Ka=["visibility","status","source_type","from","to","min_duration_seconds","max_duration_seconds","min_size_mib","max_size_mib"],et={sort:"uploaded_at_desc",game:"",source_type:"",visibility:"",status:"",q:"",from:"",to:"",min_duration_seconds:"",max_duration_seconds:"",min_size_mib:"",max_size_mib:""};function Xe(e){if(e===""||e==null)return null;let t=Number(e);return Number.isFinite(t)?t:null}function Ga(e){let t=new URLSearchParams;t.set("sort",e.sort||et.sort),t.set("page_size","100");for(let i of["game","source_type","visibility","status","q"])e[i]&&t.set(i,e[i]);e.from&&t.set("from",`${e.from}T00:00:00Z`),e.to&&t.set("to",`${e.to}T23:59:59Z`);let n=Xe(e.min_duration_seconds);n!=null&&t.set("min_duration_ms",String(Math.round(n*1e3)));let a=Xe(e.max_duration_seconds);a!=null&&t.set("max_duration_ms",String(Math.round(a*1e3)));let o=Xe(e.min_size_mib);o!=null&&t.set("min_size_bytes",String(Math.round(o*1024*1024)));let s=Xe(e.max_size_mib);return s!=null&&t.set("max_size_bytes",String(Math.round(s*1024*1024))),t}function Wa(e){return Ka.reduce((t,n)=>t+(e[n]?1:0),0)}function ja(e,t=6){let n=new Map;for(let a of e){let o=a.game_name;o&&n.set(o,(n.get(o)||0)+1)}return Array.from(n,([a,o])=>({game:a,count:o})).sort((a,o)=>o.count-a.count||a.game.localeCompare(o.game)).slice(0,t)}async function In(e,t,n){let a=0;async function o(){let s=a++;if(!(s>=e.length))return await n(e[s]),o()}await Promise.all(Array.from({length:Math.min(t,e.length)},o))}function Za(){try{return localStorage.getItem(Ln)==="rows"?"rows":"grid"}catch{return"grid"}}function An(){let[e,t]=f(Za),[n,a]=f(et),[o,s]=f(et.q),[i,c]=f(null),[d,u]=f(null),[p,h]=f(new Set),[l,m]=f(!1),[v,g]=f(0),w=F(null);T(()=>()=>clearTimeout(w.current),[]),T(()=>{let $=!0;return c(null),u(null),k(`/api/v1/clips?${Ga(n)}`).then(S=>{$&&(c(S),h(new Set))}).catch(S=>$&&u(S)),()=>{$=!1}},[JSON.stringify(n),v]);let x=$=>{t($);try{localStorage.setItem(Ln,$)}catch{}},y=()=>g($=>$+1),P=$=>{let S=$.target.value;s(S),clearTimeout(w.current),w.current=setTimeout(()=>{a(R=>({...R,q:S}))},300)},L=$=>S=>{let R=S.target.value;a(U=>({...U,[$]:R}))},K=()=>{a($=>({...$,visibility:"",status:"",source_type:"",from:"",to:"",min_duration_seconds:"",max_duration_seconds:"",min_size_mib:"",max_size_mib:""}))},Z=$=>a(S=>({...S,game:S.game===$?"":$})),ae=$=>a(S=>({...S,sort:$})),ee=$=>{h(S=>{let R=new Set(S);return R.has($)?R.delete($):R.add($),R})};function Q($,S){c(R=>R&&{...R,clips:R.clips.map(U=>U.id===$?{...U,...S}:U)})}function z($,S){let R=new Set($);c(U=>U&&{...U,clips:U.clips.map(b=>R.has(b.id)?{...b,...S}:b)})}async function ne($){let S=Array.from(p);if(!S.length)return;let R=i?.clips||[],U=new Map(S.map(E=>[E,R.find(H=>H.id===E)]));z(S,{visibility:$});let b=[];if(await In(S,4,async E=>{try{let H=await k(`/api/v1/clips/${encodeURIComponent(E)}/visibility`,{method:"POST",body:{visibility:$}});Q(E,{visibility:H.visibility,public_url:H.public_url})}catch(H){b.push({id:E,message:H.message})}}),b.length){for(let{id:E}of b){let H=U.get(E);H&&Q(E,{visibility:H.visibility,public_url:H.public_url})}C(b.length===S.length?b[0].message||"Couldn't update visibility.":`Couldn't update ${b.length} of ${S.length} clips.`)}let D=S.filter(E=>!b.some(H=>H.id===E));D.length&&(h(new Set),C(`Made ${D.length} clip${D.length===1?"":"s"} ${$}`,{actionLabel:"Undo",onAction:()=>ye(D,U)}))}async function ye($,S){for(let R of $){let U=S.get(R);U&&Q(R,{visibility:U.visibility,public_url:U.public_url})}await In($,4,async R=>{let U=S.get(R);if(U)try{await k(`/api/v1/clips/${encodeURIComponent(R)}/visibility`,{method:"POST",body:{visibility:U.visibility}})}catch{}})}async function ie(){let $=Array.from(p),S=i?.clips||[],R=$.map(D=>S.find(E=>E.id===D)).filter(Boolean),U=R.filter(D=>D.public_url),b=R.length-U.length;if(!U.length){C("No links to copy \u2014 selected clips are private.");return}try{await navigator.clipboard.writeText(U.map(D=>D.public_url).join(`
`)),C(`Copied ${U.length} link${U.length===1?"":"s"}`+(b?` (${b} skipped, private)`:""))}catch{C("Couldn't copy links to clipboard.")}}async function le(){let $=Array.from(p);m(!1);try{let S=await k("/api/v1/clips/bulk-delete",{method:"POST",body:{ids:$}});h(new Set),y(),C(`Deleted ${S.affected} clip${S.affected===1?"":"s"}.`)}catch(S){C(S.message)}}if(d)return r`<main class="page">
      <${W} name="alert" title="Couldn't load your library" body=${d.message} />
    </main>`;let te=i?.clips,pe=Wa(n),ce=!!(n.q||n.game)||pe>0,oe=ja(te||[]),ue=(te||[]).reduce(($,S)=>$+(S.file_size_bytes||0),0),me=r`<div class="popover-fields">
    <label class="field"><span>Visibility</span>
      <select class="input" value=${n.visibility} onChange=${L("visibility")}>
        <option value="">Any</option>
        <option value="private">Private</option>
        <option value="public">Public</option>
        <option value="unlisted">Unlisted</option>
      </select>
    </label>
    <label class="field"><span>Status</span>
      <select class="input" value=${n.status} onChange=${L("status")}>
        <option value="">Any</option>
        <option value="created">Created</option>
        <option value="uploading">Uploading</option>
        <option value="processing">Processing</option>
        <option value="ready">Ready</option>
        <option value="failed">Failed</option>
      </select>
    </label>
    <label class="field"><span>Source</span>
      <input class="input" type="text" value=${n.source_type} onInput=${L("source_type")} placeholder="Source type" />
    </label>
    <label class="field"><span>From</span>
      <input class="input" type="date" value=${n.from} onInput=${L("from")} />
    </label>
    <label class="field"><span>To</span>
      <input class="input" type="date" value=${n.to} onInput=${L("to")} />
    </label>
    <label class="field"><span>Min duration (s)</span>
      <input class="input" type="number" min="0" value=${n.min_duration_seconds} onInput=${L("min_duration_seconds")} />
    </label>
    <label class="field"><span>Max duration (s)</span>
      <input class="input" type="number" min="0" value=${n.max_duration_seconds} onInput=${L("max_duration_seconds")} />
    </label>
    <label class="field"><span>Min size (MiB)</span>
      <input class="input" type="number" min="0" step="0.1" value=${n.min_size_mib} onInput=${L("min_size_mib")} />
    </label>
    <label class="field"><span>Max size (MiB)</span>
      <input class="input" type="number" min="0" step="0.1" value=${n.max_size_mib} onInput=${L("max_size_mib")} />
    </label>
    <div class="popover-actions">
      <button type="button" class="btn" onClick=${K}>Clear filters</button>
    </div>
  </div>`;return r`<main class="page">
    <div class="lib-header">
      <div>
        <h1>Library</h1>
        <p>${(te||[]).length} clip${(te||[]).length===1?"":"s"} · ${q(ue)} used</p>
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
      <select class="input" aria-label="Sort" value=${n.sort} onChange=${$=>ae($.target.value)}>
        ${qa.map(([$,S])=>r`<option value=${$}>${S}</option>`)}
      </select>
      <${Rn}
        label="Filters"
        panelClass="popover-filters"
        trigger=${({open:$,toggle:S})=>r`<button type="button" class="btn" aria-haspopup="dialog"
          aria-expanded=${$} onClick=${S}>
          ${M("sliders",{size:14})} Filters
          ${pe>0&&r`<span class="filter-badge">${pe}</span>`}
        </button>`}
        content=${me} />
    </div>

    ${oe.length>0&&r`<div class="lib-chips">
      <button type="button" class=${`chip ${n.game?"":"chip-on"}`} aria-pressed=${!n.game}
        onClick=${()=>Z("")}>All</button>
      ${oe.map($=>r`<button type="button" class=${`chip ${n.game===$.game?"chip-on":""}`}
        aria-pressed=${n.game===$.game} onClick=${()=>Z($.game)}>${$.game}</button>`)}
    </div>`}

    ${te==null?r`<${Ya} />`:te.length===0?ce?r`<${W} name="film" title="No clips match this view"
            body="Try a different search, game, or clear your filters."
            action=${r`<button type="button" class="btn" onClick=${()=>{a(et),s("")}}>Clear filters</button>`} />`:r`<${W} name="upload" title="Connect the Clipline desktop app to start uploading"
            body="New clips uploaded from the desktop app will show up here."
            action=${r`<a class="btn" href="/about">Learn more</a>`} />`:e==="grid"?r`<div class=${`card-grid ${p.size>0?"selecting":""}`}>
          ${te.map($=>r`<${$e} key=${$.id}
            clip=${{...$,thumbnail_url:Ce($),media_url:je($)}}
            href=${`/clip/${encodeURIComponent($.id)}`}
            selectable selected=${p.has($.id)} onToggleSelect=${ee} showVisibility />`)}
        </div>`:r`<${Ja} clips=${te} query=${n} onSort=${ae} />`}

    <${Un} count=${p.size}
      onPublic=${()=>ne("public")}
      onPrivate=${()=>ne("private")}
      onCopyLinks=${ie}
      onDelete=${()=>m(!0)}
      onClear=${()=>h(new Set)} />

    <${re} open=${l}
      title=${`Delete ${p.size} clip${p.size===1?"":"s"}?`}
      body="Public links stop working immediately."
      confirmLabel="Delete" danger
      onConfirm=${le}
      onCancel=${()=>m(!1)} />
  </main>`}function Qe(e,[t,n]){let a=e.sort===t?"ascending":e.sort===n?"descending":"none",o=e.sort===n?t:n;return{ariaSort:a,next:o}}function Ja({clips:e,query:t,onSort:n}){let a=Qe(t,Ye.title),o=Qe(t,Ye.size),s=Qe(t,Ye.duration),i=Qe(t,Ye.uploaded);return r`<table class="lib-table">
    <thead>
      <tr>
        <th></th>
        <th aria-sort=${a.ariaSort}><button type="button" class="sort-btn" onClick=${()=>n(a.next)}>Title</button></th>
        <th>Game</th>
        <th>Visibility</th>
        <th aria-sort=${o.ariaSort}><button type="button" class="sort-btn" onClick=${()=>n(o.next)}>Size</button></th>
        <th aria-sort=${s.ariaSort}><button type="button" class="sort-btn" onClick=${()=>n(s.next)}>Duration</button></th>
        <th aria-sort=${i.ariaSort}><button type="button" class="sort-btn" onClick=${()=>n(i.next)}>Uploaded</button></th>
      </tr>
    </thead>
    <tbody>
      ${e.map(c=>r`<tr key=${c.id}>
        <td><img class="row-thumb" src=${Ce(c)} alt="" width="64" height="36" loading="lazy" /></td>
        <td><a href=${`/clip/${encodeURIComponent(c.id)}`}>${c.title}</a></td>
        <td>${c.game_name||"\u2014"}</td>
        <td><span class=${`badge badge-${c.visibility}`}>${c.visibility}</span></td>
        <td>${q(c.file_size_bytes)}</td>
        <td>${he(c.duration_ms)}</td>
        <td>${G(c.uploaded_at)}</td>
      </tr>`)}
    </tbody>
  </table>`}function Ya({count:e=8}){return r`<div class="card-grid">
    ${Array.from({length:e},(t,n)=>r`<div class="clip-card" key=${n}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`}J();var Xa={ChampionKill:"kill",FirstBlood:"kill",Multikill:"spree",Ace:"spree",DragonKill:"objective",HeraldKill:"objective",BaronKill:"objective",TurretKilled:"structure",InhibKilled:"structure",FirstBrick:"structure"};function zn(e){let t=Number(e);return Number.isFinite(t)&&t>0?t/1e3:0}function Fn(e,t){let n=Number.isFinite(e)?e:0,a=t>0?t:Number.MAX_SAFE_INTEGER;return Math.max(0,Math.min(a,n))}function tt(e,t){return t>0?Math.max(0,Math.min(100,e/t*100)):0}function wt(e){if(!Number.isFinite(e))return"0:00";let t=Math.max(0,Math.round(e)),n=Math.floor(t/60),a=t-n*60;return`${n}:${String(a).padStart(2,"0")}`}function Nn(e){if(!Number.isFinite(e))return"0:00.0";let t=Math.max(0,Math.round(e*10)),n=Math.floor(t/600),a=t-n*600,o=Math.floor(a/10);return`${n}:${String(o).padStart(2,"0")}.${a%10}`}function Bn(e,t){return`${Nn(e)} / ${t>0?Nn(t):"0:00.0"}`}function Qa(e){return Xa[e]||"info"}function On(e,t){return(e||[]).map((n,a)=>{let o=Number(n.timestamp_ms);if(!Number.isFinite(o))return null;let s=o/1e3;return s<0||t>0&&s>t?null:{index:a,time:s,kind:String(n.kind||"Marker"),label:String(n.label||n.kind||"Marker"),category:Qa(n.kind)}}).filter(Boolean).sort((n,a)=>n.time-a.time)}function Hn(e,t){if(!e.length)return null;for(let n of e)if(n.time>t+.05)return n;return e[0]}function Vn(e,t){if(!e.length)return null;for(let n=e.length-1;n>=0;n-=1)if(e[n].time<t-.05)return e[n];return e[e.length-1]}function qn(e,t){switch(e){case"Space":case"KeyK":return{kind:"toggle-play"};case"ArrowLeft":return{kind:"seek-by",seconds:t?-1:-5};case"ArrowRight":return{kind:"seek-by",seconds:t?1:5};case"KeyJ":return{kind:"seek-by",seconds:-10};case"KeyL":return{kind:"seek-by",seconds:10};case"Comma":return{kind:"seek-by",seconds:-.1};case"Period":return{kind:"seek-by",seconds:.1};case"KeyM":return{kind:t?"previous-marker":"next-marker"};case"Home":return{kind:"seek-to",seconds:0};case"End":return{kind:"seek-to-end"};case"KeyF":return{kind:"fullscreen"};case"KeyT":return{kind:"theater"};default:return null}}var Gn="clipline.playerVolume",Wn="clipline.clipTheaterMode",es=2e3,ts=[.25,.5,.75,1,1.25,1.5,2];function ns(e,t){switch(e){case"KeyM":return{kind:"toggle-mute"};case"KeyF":return{kind:"theater"};case"Escape":return{kind:"exit-theater"};default:return qn(e,t)}}function as(e){return e instanceof Element?!!e.closest("input, textarea, select, button, a, [contenteditable='true'], [contenteditable='']"):!1}function ss(){try{let e=window.localStorage.getItem(Gn);if(e==null)return 1;let t=Number(e);return Number.isFinite(t)?Math.max(0,Math.min(1,t)):1}catch{return 1}}function Kn(e){try{window.localStorage.setItem(Gn,String(Math.max(0,Math.min(1,e))))}catch{}}function os(){try{return window.localStorage.getItem(Wn)==="true"}catch{return!1}}function rs(e){try{window.localStorage.setItem(Wn,String(e))}catch{}}function jn({src:e,poster:t,durationMs:n,markers:a}){let o=F(null),s=F(null),i=F(null),c=F(!1),d=F(!1),u=zn(n),[p,h]=f(!1),[l,m]=f(0),[v,g]=f(u),[w,x]=f(0),[y,P]=f(ss),[L,K]=f(!1),[Z,ae]=f(1),[ee,Q]=f(!1),[z,ne]=f(os),[ye,ie]=f(!0),[le,te]=f(null),[pe,ce]=f(""),oe=On(a,v);function ue(){ie(!0),window.clearTimeout(i.current),i.current=window.setTimeout(()=>{let _=o.current;_&&!_.paused&&!_.ended&&ie(!1)},es)}T(()=>{p||(window.clearTimeout(i.current),ie(!0))},[p]),T(()=>{let _=o.current;if(!_)return;let I=()=>Number.isFinite(_.duration)&&_.duration>0?_.duration:u,B=()=>g(I()),St=()=>g(I()),Tt=()=>{c.current||m(_.currentTime||0)},Mt=()=>{let It=I();if(!(It>0)||!_.buffered?.length){x(0);return}let Lt=_.currentTime||0,Pe=0;for(let Ee=0;Ee<_.buffered.length;Ee+=1){let $a=_.buffered.start(Ee),rt=_.buffered.end(Ee);if(Lt>=$a&&Lt<=rt){Pe=rt;break}Pe=Math.max(Pe,rt)}x(tt(Pe,It))},Pt=()=>{h(!0),ce(""),ue()},Et=()=>h(!1),Dt=()=>h(!1),Rt=()=>{P(_.volume),K(_.muted||_.volume===0)},Ut=()=>ce("Playback unavailable");return _.addEventListener("loadedmetadata",B),_.addEventListener("durationchange",St),_.addEventListener("timeupdate",Tt),_.addEventListener("progress",Mt),_.addEventListener("play",Pt),_.addEventListener("pause",Et),_.addEventListener("ended",Dt),_.addEventListener("volumechange",Rt),_.addEventListener("error",Ut),()=>{_.removeEventListener("loadedmetadata",B),_.removeEventListener("durationchange",St),_.removeEventListener("timeupdate",Tt),_.removeEventListener("progress",Mt),_.removeEventListener("play",Pt),_.removeEventListener("pause",Et),_.removeEventListener("ended",Dt),_.removeEventListener("volumechange",Rt),_.removeEventListener("error",Ut)}},[e,u]),T(()=>{o.current&&(o.current.volume=y)},[y]),T(()=>{o.current&&(o.current.muted=L)},[L]),T(()=>{o.current&&(o.current.playbackRate=Z)},[Z]),T(()=>{if(document.documentElement.classList.toggle("clipline-theater",z),z){let _=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=_}}},[z]),T(()=>()=>document.documentElement.classList.remove("clipline-theater"),[]);function me(_){ne(_),rs(_)}function $(_){let I=o.current;if(!I)return;let B=v>0?Fn(_,v):Math.max(0,_);I.currentTime=B,m(B)}function S(_){$((o.current?.currentTime||0)+_)}async function R(){let _=o.current;if(_)if(_.paused||_.ended)try{await _.play()}catch(I){ce(I?.message||"Playback failed")}else _.pause()}function U(){let _=o.current;_&&(_.muted||_.volume===0?(_.muted=!1,_.volume===0&&(_.volume=1,P(1),Kn(1)),K(!1)):(_.muted=!0,K(!0)))}function b(_){let I=Number(_.target.value);P(I),K(I===0),Kn(I);let B=o.current;B&&(B.volume=I,B.muted=I===0)}async function D(){try{document.fullscreenElement?await document.exitFullscreen():await s.current?.requestFullscreen?.()}catch(_){ce(_?.message||"Fullscreen unavailable")}}function E(_){let I=o.current?.currentTime||0,B=_>0?Hn(oe,I):Vn(oe,I);B&&$(B.time)}function H(){c.current=!0,d.current=p,p&&o.current?.pause()}function Te(_){let I=Number(_.target.value);m(I),$(I)}function Me(){c.current&&(c.current=!1,d.current&&(d.current=!1,o.current?.play().catch(()=>{})))}function ba(_){let I=_.currentTarget.getBoundingClientRect();if(!(I.width>0))return;let B=Math.max(0,Math.min(1,(_.clientX-I.left)/I.width));te({pct:B*100,time:B*(v||0)})}function va(){te(null)}return T(()=>{function _(I){if(I.defaultPrevented||as(I.target))return;let B=ns(I.code,I.shiftKey);if(B&&!(B.kind==="exit-theater"&&!z))switch(I.preventDefault(),ue(),B.kind){case"toggle-play":R();break;case"seek-by":S(B.seconds);break;case"seek-to":$(B.seconds);break;case"seek-to-end":$(v);break;case"next-marker":E(1);break;case"previous-marker":E(-1);break;case"toggle-mute":U();break;case"theater":me(!z);break;case"exit-theater":me(!1);break;case"fullscreen":D();break;default:break}}return document.addEventListener("keydown",_),()=>document.removeEventListener("keydown",_)},[v,z,p]),r`<div class=${`player ${ye?"":"chrome-hidden"}`} ref=${s}
      onPointerMove=${ue} onPointerEnter=${ue}
      onPointerLeave=${()=>{let _=o.current;_&&!_.paused&&ie(!1)}}
      onFocusIn=${()=>ie(!0)}>
    <video ref=${o} class="player-video" src=${e} poster=${t||void 0}
      preload="metadata" playsinline onClick=${R}></video>
    ${pe&&r`<div class="player-note">${pe}</div>`}
    <div class="player-overlay">
      <div class="player-timeline" onPointerMove=${ba} onPointerLeave=${va}>
        <div class="player-buffered" style=${`width:${w}%`}></div>
        <div class="player-progress" style=${`width:${tt(l,v)}%`}></div>
        ${oe.map(_=>r`<span class="player-marker-tick" key=${_.index}
            style=${`left:${tt(_.time,v)}%`} title=${`${_.label} @ ${wt(_.time)}`}></span>`)}
        <input class="player-scrubber" type="range" min="0" max=${v>0?v:0} step="0.01"
          value=${l} disabled=${!(v>0)} aria-label="Seek"
          onPointerDown=${H} onInput=${Te} onChange=${Me}
          onPointerUp=${Me} onPointerCancel=${Me} onLostPointerCapture=${Me} />
        ${le&&r`<div class="player-hover-time" style=${`left:${le.pct}%`}>${wt(le.time)}</div>`}
      </div>
      <div class="player-controls">
        ${oe.length>0&&r`<div class="player-cluster">
          <button type="button" class="player-btn" title="Previous marker" aria-label="Previous marker"
            onClick=${()=>E(-1)}>${M("skipBack",{size:14})}</button>
          <button type="button" class="player-btn" title="Next marker" aria-label="Next marker"
            onClick=${()=>E(1)}>${M("skipForward",{size:14})}</button>
        </div>`}
        <button type="button" class="player-btn player-play" aria-label=${p?"Pause":"Play"} onClick=${R}>
          ${M(p?"pause":"play",{size:16})}
        </button>
        <span class="player-time">${Bn(l,v)}</span>
        <div class="player-spacer"></div>
        <div class="player-speed-wrap">
          <button type="button" class="player-btn player-speed" aria-haspopup="menu" aria-expanded=${ee}
            onClick=${()=>Q(_=>!_)}>${Z}×</button>
          ${ee&&r`<div class="player-speed-menu" role="menu">
            ${ts.map(_=>r`<button type="button" role="menuitem" key=${_}
                class=${`player-speed-item ${_===Z?"is-active":""}`}
                onClick=${()=>{ae(_),Q(!1)}}>${_}×</button>`)}
          </div>`}
        </div>
        <button type="button" class="player-btn" aria-label=${L?"Unmute":"Mute"} onClick=${U}>
          ${M(L?"volumeX":"volume2",{size:14})}
        </button>
        <input class="player-volume" type="range" min="0" max="1" step="0.01" value=${L?0:y}
          aria-label="Volume" onInput=${b} />
        <button type="button" class="player-btn" aria-label=${z?"Exit theater mode":"Theater mode"}
          aria-pressed=${z} onClick=${()=>me(!z)}>${M("theater",{size:14})}</button>
        <button type="button" class="player-btn" aria-label="Fullscreen" onClick=${D}>
          ${M("fullscreen",{size:14})}
        </button>
      </div>
    </div>
  </div>`}J();function is(e){let t=new Map(e.map(s=>[s.id,s])),n=new Map,a=[],o=0;return e.forEach(s=>{let i=s.parent_comment_id||"";i&&t.has(i)?(n.has(i)||n.set(i,[]),n.get(i).push(s),o+=1):i||(a.push(s),o+=1)}),{roots:a,repliesByParent:n,count:o}}function ls(e){return(e||"?").trim().slice(0,1).toUpperCase()||"?"}function cs(e){let t=e.author_avatar_url;return typeof t=="string"&&t.startsWith("/")?r`<img class="comment-avatar" src=${t} alt="" />`:r`<div class="comment-avatar">${ls(e.author_name)}</div>`}function Zn({shareId:e}){let{user:t}=j(N),[n,a]=f(null),[o,s]=f(""),[i,c]=f(null),[d,u]=f(""),[p,h]=f(null);function l(){k(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`).then(y=>a(y.comments||[])).catch(()=>a([]))}T(()=>{let y=!0;return a(null),k(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`).then(P=>y&&a(P.comments||[])).catch(()=>y&&a([])),()=>{y=!1}},[e]);async function m(y,P){let L=y.trim();if(L)try{await k(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`,{method:"POST",body:P?{body:L,parent_comment_id:P}:{body:L}}),l()}catch(K){C(K.message)}}async function v(y){y.preventDefault(),await m(o),s("")}async function g(y,P){y.preventDefault(),await m(d,P),u(""),c(null)}async function w(){let y=p;h(null);try{await k(`/api/v1/public/clips/${encodeURIComponent(e)}/comments/${encodeURIComponent(y)}`,{method:"DELETE"}),l()}catch(P){C(P.message)}}let x=is(n||[]);return r`<section class="comments">
    <div class="comments-header"><h2>Comments</h2><span class="muted">${x.count}</span></div>
    ${t?r`<form class="comment-form" onSubmit=${v}>
          <textarea rows="3" maxlength="2000" placeholder="Add a comment" value=${o}
            onInput=${y=>s(y.target.value)}></textarea>
          <div class="comment-form-actions">
            <button type="submit" class="btn btn-primary">${M("message",{size:14})} Post comment</button>
          </div>
        </form>`:r`<p class="comment-signin"><a href="/login">Sign in</a> to comment.</p>`}
    ${n==null?"":x.count===0?r`<p class="comment-signin">No comments yet.</p>`:r`<div class="comment-list">
          ${x.roots.map(y=>Jn(y,{depth:0,repliesByParent:x.repliesByParent,user:t,replyOpenId:i,setReplyOpenId:c,replyDraft:d,setReplyDraft:u,submitReply:g,onDelete:h}))}
        </div>`}
    <${re} open=${p!=null} title="Delete this comment?"
      body="This removes the comment from the public clip page." confirmLabel="Delete" danger
      onConfirm=${w} onCancel=${()=>h(null)} />
  </section>`}function Jn(e,t){let{depth:n,repliesByParent:a,user:o,replyOpenId:s,setReplyOpenId:i,replyDraft:c,setReplyDraft:d,submitReply:u,onDelete:p}=t,h=a.get(e.id)||[];return r`<article class="comment" key=${e.id}>
    ${cs(e)}
    <div class="comment-body">
      <div class="comment-head">
        ${e.author_username?r`<a href=${`/u/${encodeURIComponent(e.author_username)}`}>${e.author_name}</a>`:r`<strong>${e.author_name}</strong>`}
        ${e.is_uploader&&r`<span class="comment-badge">Uploader</span>`}
        <span>${We(e.created_at)}</span>
        <div class="comment-actions">
          ${o&&n===0&&r`<button type="button" class="comment-action"
            onClick=${()=>i(s===e.id?null:e.id)}>
            ${M("message",{size:12})} Reply</button>`}
          ${e.viewer_can_delete&&r`<button type="button" class="comment-delete" aria-label="Delete comment"
            title="Delete comment" onClick=${()=>p(e.id)}>${M("trash",{size:12})}</button>`}
        </div>
      </div>
      <p class="comment-text">${e.body}</p>
      ${o&&n===0&&s===e.id&&r`<form class="comment-reply-form"
        onSubmit=${l=>u(l,e.id)}>
        <textarea rows="2" maxlength="2000" placeholder="Write a reply" value=${c}
          onInput=${l=>d(l.target.value)}></textarea>
        <div class="comment-form-actions">
          <button type="submit" class="btn btn-primary">${M("message",{size:14})} Post reply</button>
        </div>
      </form>`}
      ${h.length>0&&r`<div class="comment-replies">
        ${h.map(l=>Jn(l,{...t,depth:n+1}))}
      </div>`}
    </div>
  </article>`}var us=["private","public","unlisted"];function ds(e,t){return e==="clip"?!0:!!t?.viewer_can_edit}function ps(e,t,n){return e==="public"?t.shareId:n?.public_share_id||null}function ms(e,t,n){return e==="clip"?t.clipId:n?.viewer_clip_id||null}function fs(e,t,n){if(e)try{return`${t}${new URL(e).pathname}`}catch{}return n?`${t}/c/${encodeURIComponent(n)}`:null}function _s(e){let t=e?.height!=null?e.height:"",n=Math.round(e?.fps||0)||"";return`${t}p${n}`}function hs(e,t,n=8){return(e||[]).filter(a=>a.share_id!==t).slice(0,n)}function kt({route:e}){let{user:t}=j(N),[n,a]=f(null),[o,s]=f(null),[i,c]=f([]),[d,u]=f(!1),[p,h]=f(""),[l,m]=f(!1),[v,g]=f(""),[w,x]=f(!1),[y,P]=f(!1),[L,K]=f(!1),Z=e.name==="clip"?`clip:${e.clipId}`:`public:${e.shareId}`;if(T(()=>{let b=!0;a(null),s(null),u(!1),m(!1),K(!1),x(!1);let D=e.name==="clip"?`/api/v1/clips/${encodeURIComponent(e.clipId)}`:`/api/v1/public/clips/${encodeURIComponent(e.shareId)}`;return k(D).then(E=>{b&&(a(E),e.name==="public"&&k(`/api/v1/public/clips/${encodeURIComponent(e.shareId)}/view`,{method:"POST",body:{}}).then(H=>b&&a(Te=>Te&&{...Te,view_count:H.view_count})).catch(()=>{}))}).catch(E=>b&&s(E)),()=>{b=!1}},[Z]),T(()=>{let b=!0;return k("/api/v1/public/clips").then(D=>b&&c(D.clips||[])).catch(()=>{}),()=>{b=!1}},[Z]),o)return r`<main class="page"><${W} name="alert" title="Couldn't load this clip" body=${o.message} /></main>`;if(!n)return r`<main class="page watch"><div><div class="skeleton-thumb"></div></div><aside class="upnext"></aside></main>`;let ae=ds(e.name,n),ee=ps(e.name,e,n),Q=ms(e.name,e,n),z=e.name==="clip"?je({id:n.id}):Tn({share_id:e.shareId}),ne=e.name==="clip"?Ce({id:n.id}):se({share_id:e.shareId}),ye=e.name==="clip"?t?.display_name||t?.username||"You":n.author_name||"Unknown creator",ie=n.public_url??n.share_url??null,le=fs(ie,window.location.origin,ee),te=e.name==="clip";function pe(){h(n.title),u(!0)}async function ce(b){b?.preventDefault?.();let D=p.trim();if(!D||D===n.title){u(!1);return}try{await k(`/api/v1/clips/${encodeURIComponent(Q)}`,{method:"PATCH",body:{title:D}}),a(E=>({...E,title:D})),u(!1),C("Title saved.")}catch(E){C(E.message)}}function oe(){g(n.description||""),m(!0)}async function ue(){let b=v.trim();try{await k(`/api/v1/clips/${encodeURIComponent(Q)}`,{method:"PATCH",body:{description:b||null}}),a(D=>({...D,description:b||null})),m(!1),C("Description saved.")}catch(D){C(D.message)}}async function me(b){let D=n.visibility;if(D!==b){a(E=>({...E,visibility:b}));try{let E=await k(`/api/v1/clips/${encodeURIComponent(Q)}/visibility`,{method:"POST",body:{visibility:b}});a(H=>({...H,visibility:E.visibility,public_url:E.public_url,public_share_id:E.public_share_id})),C(`Visibility set to ${b}.`,{actionLabel:"Undo",onAction:()=>me(D)})}catch(E){a(H=>({...H,visibility:D})),C(E.message)}}}async function $(){if(le)try{await navigator.clipboard.writeText(le),C("Link copied.")}catch{C("Couldn't copy the link.")}}async function S(){P(!1);try{await k(`/api/v1/clips/${encodeURIComponent(Q)}`,{method:"DELETE"}),C("Clip deleted."),Y("/library")}catch(b){C(b.message)}}let R=[n.game_name&&r`<a class="chip chip-on" href=${`/game/${encodeURIComponent(n.game_name)}`}>${n.game_name}</a>`,be(n.view_count),`Recorded ${G(n.recorded_at)}`,`by ${ye}`].filter(Boolean),U=hs(i,ee,8);return r`<main class="page watch">
    <div>
      <${jn} src=${z} poster=${ne} durationMs=${n.duration_ms} markers=${n.markers} />
      <div class="watch-titlerow">
        ${d?r`<input class="input watch-title-input" value=${p} autofocus
              onInput=${b=>h(b.target.value)} onBlur=${ce}
              onKeyDown=${b=>{b.key==="Enter"&&ce(b),b.key==="Escape"&&u(!1)}} />`:r`<h1>${n.title}
              ${ae&&r`<button type="button" class="edit-pencil" aria-label="Edit title" onClick=${pe}
                >${M("edit",{size:14})}</button>`}</h1>`}
      </div>
      <p class="watch-meta">${R.map((b,D)=>r`${D>0?" \xB7 ":""}${b}`)}</p>

      ${ae&&r`<div class="watch-actions">
        <div class="seg" role="radiogroup" aria-label="Visibility">
          ${us.map(b=>r`<button type="button" role="radio" key=${b} aria-checked=${n.visibility===b}
              class=${`seg-item ${n.visibility===b?"seg-on":""}`} onClick=${()=>me(b)}
              >${b[0].toUpperCase()+b.slice(1)}</button>`)}
        </div>
        <button type="button" class="btn btn-primary" disabled=${!le} onClick=${$}>
          ${M("copy",{size:14})} Copy share link</button>
        <div class="watch-more">
          <button type="button" class="btn" aria-haspopup="menu" aria-expanded=${w}
            onClick=${()=>x(b=>!b)}>⋯</button>
          ${w&&r`<div class="menu" role="menu">
            <button type="button" class="menu-danger" role="menuitem"
              onClick=${()=>{x(!1),P(!0)}}>${M("trash",{size:14})} Delete clip</button>
          </div>`}
        </div>
      </div>`}

      <div class="watch-desc">
        ${l?r`<textarea class="input" rows="5" value=${v} autofocus
              onInput=${b=>g(b.target.value)} onBlur=${ue}
              onKeyDown=${b=>{b.key==="Enter"&&(b.ctrlKey||b.metaKey)&&ue(),b.key==="Escape"&&m(!1)}}></textarea>`:n.description?r`<p>${n.description}
              ${ae&&r`<button type="button" class="edit-pencil" aria-label="Edit description" onClick=${oe}
                >${M("edit",{size:12})}</button>`}</p>`:ae?r`<button type="button" class="watch-desc-add" onClick=${oe}>+ Add a description</button>`:""}
      </div>

      ${te&&r`<button type="button" class="details-strip" aria-expanded=${L}
        onClick=${()=>K(b=>!b)}>
        <span><b>${he(n.duration_ms)}</b> length</span>
        <span><b>${q(n.file_size_bytes)}</b></span>
        <span><b>${_s(n)}</b></span>
        <span><b>${n.video_codec}/${n.audio_codec}</b> ${n.container}</span>
        <span class="details-chev">${L?"\u25B4 less":"\u25BE more"}</span>
      </button>`}
      ${te&&L&&r`<dl class="details-full">
        <div><dt>Recorded</dt><dd>${G(n.recorded_at)}</dd></div>
        <div><dt>Uploaded</dt><dd>${G(n.uploaded_at)}</dd></div>
        <div><dt>Dimensions</dt><dd>${n.width&&n.height?`${n.width} x ${n.height}`:"Unknown"}</dd></div>
        <div><dt>FPS</dt><dd>${n.fps??"Unknown"}</dd></div>
        <div><dt>Container</dt><dd>${n.container||"Unknown"}</dd></div>
        <div><dt>Video codec</dt><dd>${n.video_codec||"Unknown"}</dd></div>
        <div><dt>Audio codec</dt><dd>${n.audio_codec||"Unknown"}</dd></div>
        <div><dt>Source</dt><dd>${n.source_type||"Unknown"}</dd></div>
        <div><dt>Checksum</dt><dd>${n.checksum_sha256||"Unknown"}</dd></div>
      </dl>`}

      ${ee&&r`<${Zn} shareId=${ee} />`}
    </div>
    <aside class="upnext">
      <h4 class="kicker">Up next</h4>
      ${U.map(b=>r`<a class="upnext-row" key=${b.share_id} href=${`/c/${encodeURIComponent(b.share_id)}`}>
          <img src=${se(b)} alt="" loading="lazy" />
          <span><b>${b.title}</b><small>${b.author_name} · ${b.game_name||"No game"} · ${be(b.view_count)}</small></span>
        </a>`)}
    </aside>

    <${re} open=${y} title="Delete this clip?" body="Public links stop working immediately."
      confirmLabel="Delete" danger onConfirm=${S} onCancel=${()=>P(!1)} />
  </main>`}J();var xt=[{top:"4%",left:"4%",width:"34%",rotate:-7},{top:"0%",left:"44%",width:"30%",rotate:5},{top:"34%",left:"68%",width:"28%",rotate:-4},{top:"50%",left:"8%",width:"30%",rotate:6},{top:"62%",left:"42%",width:"26%",rotate:-5},{top:"26%",left:"-4%",width:"22%",rotate:9}];function bs(e){return Array.isArray(e)?e.slice(0,xt.length).map((t,n)=>({clip:t,...xt[n]})):[]}function vs(e){let t=e?.clips;if(!Array.isArray(t)||t.length===0)return null;let n=t.length,a=e.has_more?"+":"";return`${n}${a} clip${n===1?"":"s"} on this instance`}function $s({top:e,left:t,width:n,rotate:a}){return`top:${e};left:${t};width:${n};transform:rotate(${a}deg);`}function Yn(e){let t=String(e||"").trim();return t||null}function gs(){let[e,t]=f(null);T(()=>{let o=!0;return k(`/api/v1/public/clips?page_size=${xt.length}`).then(s=>o&&t(s)).catch(()=>o&&t(null)),()=>{o=!1}},[]);let n=bs(e?.clips),a=vs(e);return r`<aside class="login-montage" aria-hidden="true">
    ${n.length>0&&r`<div class="login-montage-tiles">
      ${n.map((o,s)=>r`<img key=${s} class="login-montage-tile" style=${$s(o)}
        src=${se(o.clip)} alt="" loading="lazy" />`)}
    </div>`}
    <div class="login-montage-copy">
      <h2>Your clips. Your server.</h2>
      ${a&&r`<p>${a}</p>`}
    </div>
  </aside>`}function ge({titleId:e,children:t}){return r`<div class="login-page">
    <${gs} />
    <section class="login-panel" aria-labelledby=${e}>
      <div class="login-brand" aria-hidden="true">
        <img src="/clipline-icon.svg" alt="" width="32" height="32" />
        <span class="login-brand-word">CLIP<b>LINE</b></span>
        <span class="login-brand-descriptor">CLOUD</span>
      </div>
      ${t}
    </section>
  </div>`}function Xn(){let{user:e}=j(N),[t,n]=f(""),[a,o]=f(""),[s,i]=f(""),[c,d]=f(!1);if(T(()=>{e&&Y("/library")},[e]),e)return null;async function u(p){if(p.preventDefault(),!c){d(!0),i("");try{let h=await k("/api/v1/auth/login",{method:"POST",body:{username:t,password:a}});ke(h.csrf_token),N.set({user:h.user,csrfToken:h.csrf_token,ready:!0}),Y("/library")}catch(h){i(h instanceof _e?h.message:"Sign in failed"),d(!1)}}}return r`<${ge} titleId="login-title">
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
  </${ge}>`}function Qn({route:e}){let t=!!e.invite,[n,a]=f(()=>t?"preflight":e.token?"form":"missing-token"),[o,s]=f(""),[i,c]=f(t?null:e.token),[d,u]=f(""),[p,h]=f(!1),l=t;T(()=>{if(!t)return;if(!e.token){a("missing-token");return}let w=!0;return a("preflight"),k("/api/v1/invites/claim",{method:"POST",body:{invite_token:e.token}}).then(x=>{w&&(c(x.reset_token),a("form"))}).catch(x=>{w&&(s(x instanceof _e?x.message:"This invite link is invalid, used, or expired."),a("invalid"))}),()=>{w=!1}},[t,e.token]);async function m(w){if(w.preventDefault(),p)return;h(!0),u("");let x=new FormData(w.currentTarget),y={reset_token:i,new_password:String(x.get("new_password")||"")};l&&(y.username=String(x.get("username")||""),y.display_name=Yn(x.get("display_name")),y.email=Yn(x.get("email")));try{await k("/api/v1/auth/reset-password",{method:"POST",body:y}),C(l?"Account created. Sign in with your new password.":"Password set. Sign in with your new password."),Y("/login")}catch(P){u(P instanceof _e?P.message:"Request failed"),h(!1)}}if(t&&n!=="form"){let w=n==="missing-token"||n==="invalid",x=n==="missing-token"?"This invite link is missing a token.":n==="invalid"?o:"Opening invite\u2026";return r`<${ge} titleId="invite-title">
      <h1 id="invite-title">Create account</h1>
      <p class="login-copy">${w?"This invite cannot be used.":"Preparing your account setup."}</p>
      ${w?r`<p class="form-error" role="alert">${x}</p>`:r`<p class="login-status">${x}</p>`}
    </${ge}>`}return r`<${ge} titleId="reset-title">
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
  </${ge}>`}J();function Se({label:e,value:t,sub:n,meter:a,tone:o}){let s=o?` stat-${o}`:"";return r`<div class="stat-card">
    <p class="stat-label">${e}</p>
    <p class=${`stat-value${s}`}>${t}</p>
    ${n!=null&&r`<p class="stat-sub">${n}</p>`}
    ${a!=null&&r`<div class="stat-meter${s}">
      <span style=${`width:${Math.max(0,Math.min(1,a))*100}%`}></span>
    </div>`}
  </div>`}function ys(e){let t=Number(e?.global_storage_warning_threshold_bytes||0);if(!t)return null;let n=Number(e?.total_storage_bytes||0);return Math.max(0,Math.min(1,n/t))}function ws(e){if(!e?.global_storage_warning_threshold_bytes)return"Disabled";let t=q(e.global_storage_warning_threshold_bytes);return e.global_storage_warning?`At or above ${t}`:`Below ${t}`}function ks({deadJobs:e=[],failedUploads:t=[]}={}){let n=e.length+t.length;return{failedCount:n,healthy:n===0}}function X(e,t){return r`<div><dt>${e}</dt><dd>${t??"Unknown"}</dd></div>`}function ea({overview:e,deadJobs:t,failedUploads:n}){let a=ys(e),{failedCount:o,healthy:s}=ks({deadJobs:t,failedUploads:n}),i=e.global_storage_warning_threshold_bytes;return r`<div>
    <div class="stat-grid">
      <${Se} label="Clips" value=${String(e.total_clips)} />
      <${Se} label="Storage" value=${q(e.total_storage_bytes)}
        sub=${i?`${q(i)} warning threshold`:null}
        meter=${a} tone=${e.global_storage_warning?"danger":void 0} />
      <${Se} label="Users" value=${String(e.total_users)} />
      <${Se} label="Jobs" value=${s?"All healthy":String(o)}
        tone=${s?"success":"danger"} />
    </div>
    <div class="panel">
      <h2>Server summary</h2>
      <dl class="ad-kv">
        ${X("Server version",e.server_version)}
        ${X("API version",e.api_version)}
        ${X("Public URL",e.public_url)}
        ${X("Database",e.database_backend)}
        ${X("Storage",`${e.storage_backend} \u2014 ${e.storage_summary}`)}
        ${X("Stored clips",`${e.total_clips} clips \u2014 ${q(e.total_storage_bytes)}`)}
        ${X("Users",`${e.total_users} total`)}
        ${X("Max upload",q(e.max_upload_size_bytes))}
        ${X("Part size",q(e.upload_part_size_bytes))}
        ${X("Single PUT max",q(e.single_put_max_bytes))}
        ${X("Active uploads/user",e.max_active_upload_sessions_per_user)}
        ${X("User quota",e.user_storage_quota_bytes?q(e.user_storage_quota_bytes):"Disabled")}
        ${X("Storage warning",ws(e))}
        ${X("Upload TTL",`${e.upload_session_ttl_seconds}s`)}
        ${X("Direct S3 uploads",e.direct_s3_uploads?"Enabled":"Disabled")}
        ${X("Public media",`${e.public_media_mode}, ${e.public_read_url_ttl_seconds}s TTL`)}
      </dl>
    </div>
  </div>`}J();function nt(e){let t=String(e||"").trim();return t||null}function xs(e){let t=Number(String(e||"").trim());if(!Number.isFinite(t)||t<0)throw new Error("Storage quota must be a non-negative number");return Math.round(t*1024*1024*1024)}function Cs(e,t){return!(e.is_disabled||t?.id===e.id||e.role==="owner"||e.role==="admin"&&t?.role!=="owner")}function ta(e){return e?[["user","User"],["admin","Admin"]]:[["user","User"]]}function Ss({isOwner:e,onCreated:t}){let[n,a]=f(!1);async function o(s){if(s.preventDefault(),n)return;a(!0);let i=s.currentTarget,c=new FormData(i);try{await k("/api/v1/users",{method:"POST",body:{username:String(c.get("username")||""),display_name:nt(c.get("display_name")),email:nt(c.get("email")),password:nt(c.get("password")),role:String(c.get("role")||"user")}}),C("User created."),i.reset(),t()}catch(d){C(d.message)}finally{a(!1)}}return r`<form class="panel section" onSubmit=${o}>
    <h2>Create user</h2>
    <label class="field"><span>Username</span><input class="input" name="username" required /></label>
    <label class="field"><span>Display name</span><input class="input" name="display_name" placeholder="Optional" /></label>
    <label class="field"><span>Email</span><input class="input" name="email" type="email" placeholder="Optional" /></label>
    <label class="field"><span>Password</span><input class="input" name="password" type="password" required /></label>
    <label class="field"><span>Role</span>
      <select class="input" name="role">
        ${ta(e).map(([s,i])=>r`<option value=${s}>${i}</option>`)}
      </select>
    </label>
    <button class="btn btn-primary" type="submit" disabled=${n}>${M("plus",{size:14})} Create user</button>
  </form>`}function Ts({isOwner:e,smtpEnabled:t,onCreated:n}){let[a,o]=f(!1);async function s(i){if(i.preventDefault(),a)return;o(!0);let c=new FormData(i.currentTarget),d=i.submitter?.value==="email"?"email":"link";try{let u=await k("/api/v1/invites",{method:"POST",body:{role:String(c.get("role")||"user"),email:nt(c.get("email")),send_email:d==="email"}});C(d==="email"?"Invite sent.":"Invite link created."),n({...u,kind:"invite"})}catch(u){C(u.message)}finally{o(!1)}}return r`<form class="panel section" onSubmit=${s}>
    <h2>Invite link</h2>
    <label class="field"><span>Role</span>
      <select class="input" name="role">
        ${ta(e).map(([i,c])=>r`<option value=${i}>${c}</option>`)}
      </select>
    </label>
    <label class="field"><span>Email</span>
      <input class="input" name="email" type="email" placeholder=${t?"Optional":"SMTP disabled"} disabled=${!t} />
    </label>
    <div class="actions">
      <button class="btn" type="submit" name="intent" value="link" disabled=${a}>${M("copy",{size:14})} Generate link</button>
      ${t&&r`<button class="btn btn-primary" type="submit" name="intent" value="email" disabled=${a}>${M("message",{size:14})} Send email</button>`}
    </div>
  </form>`}function Ms({resetLink:e}){if(!e)return null;let t=e.kind==="invite"?"Invite":"Reset",n=e.username?` for ${e.username}`:"",a=async()=>{try{await navigator.clipboard.writeText(e.reset_url),C("Copied to clipboard.")}catch{C("Copy failed. Select and copy the URL manually.")}};return r`<div class="notice admin-reset-link">
    <div>
      <strong>${t} link created${n}</strong>
      <span>Expires ${G(e.expires_at)}</span>
      <code>${e.reset_url}</code>
    </div>
    <button class="btn" type="button" onClick=${a}>${M("copy",{size:14})} Copy</button>
  </div>`}function Ps(e){return e.is_disabled?r`<span class="badge badge-warn">Disabled</span>`:r`<span class="badge badge-public">Active</span>`}function Es({user:e,currentUser:t,onQuota:n,onReset:a,onDisable:o}){let s=e.storage_quota_bytes!=null?q(e.storage_quota_bytes):"No limit",i=!Cs(e,t);return r`<tr>
    <td>
      <strong>${e.username}</strong>
      <div class="muted">${e.display_name||e.id}</div>
      ${e.email&&r`<div class="muted">${e.email}</div>`}
    </td>
    <td>${e.role}</td>
    <td>${Ps(e)}</td>
    <td>
      <strong>${q(e.storage_bytes||0)}</strong>
      <div class="muted">quota ${s}</div>
    </td>
    <td>${G(e.last_login_at)}</td>
    <td>
      <div class="actions">
        <button class="btn" type="button" onClick=${()=>n(e)}>${M("sliders",{size:14})} Quota</button>
        <button class="btn" type="button" onClick=${()=>a(e)}>${M("clipboard",{size:14})} Reset link</button>
        <button class="btn btn-danger" type="button" disabled=${i} onClick=${()=>o(e)}>${M("x",{size:14})} Disable</button>
      </div>
    </td>
  </tr>`}function na({users:e,settings:t,currentUser:n,resetLink:a,setResetLink:o,reload:s}){let[i,c]=f(null),d=n?.role==="owner",u=!!t?.smtp_enabled,p=()=>c(null);async function h(){let{type:m,user:v,value:g}=i;p();try{if(m==="quota"){let w=g.trim()?xs(g):null;await k(`/api/v1/users/${encodeURIComponent(v.id)}`,{method:"PATCH",body:{storage_quota_bytes:w}}),C("Storage quota updated.")}else if(m==="disable")await k(`/api/v1/users/${encodeURIComponent(v.id)}`,{method:"DELETE",body:{reauth_password:g}}),C("User disabled.");else if(m==="reset"){let w=await k(`/api/v1/users/${encodeURIComponent(v.id)}/reset-password`,{method:"POST",body:{reauth_password:g}});o({...w,kind:"reset"}),C("Reset link created.")}s()}catch(w){C(w.message)}}let l={quota:{title:"Set storage quota",description:"Enter a per-user storage limit in GiB. Leave it blank to remove the per-user limit.",confirmLabel:"Save quota",danger:!1,field:r`<label class="field"><span>Quota GiB</span>
        <input class="input" type="number" min="0" step="0.1" placeholder="No per-user limit"
          value=${i?.value||""} onInput=${m=>c(v=>({...v,value:m.target.value}))} /></label>`},disable:{title:"Disable user?",description:"This immediately revokes the user's sessions and device tokens.",confirmLabel:"Disable",danger:!0,field:r`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value||""}
          onInput=${m=>c(v=>({...v,value:m.target.value}))} /></label>`},reset:{title:"Create reset link?",description:"This creates a temporary password reset link for the selected user.",confirmLabel:"Create link",danger:!1,field:r`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value||""}
          onInput=${m=>c(v=>({...v,value:m.target.value}))} /></label>`}}[i?.type];return r`<div class="admin-grid">
    <div class="admin-side-stack">
      <${Ss} isOwner=${d} onCreated=${()=>{o(null),s()}} />
      <${Ts} isOwner=${d} smtpEnabled=${u}
        onCreated=${m=>{o(m),s()}} />
    </div>
    <div class="panel">
      <div class="section-header">
        <h2>Users</h2>
        <span class="muted">${e.length} total</span>
      </div>
      <${Ms} resetLink=${a} />
      <div class="table-wrap">
        <table class="lib-table">
          <thead><tr><th>Username</th><th>Role</th><th>Status</th><th>Storage</th><th>Last login</th><th></th></tr></thead>
          <tbody>
            ${e.map(m=>r`<${Es} key=${m.id} user=${m} currentUser=${n}
              onQuota=${v=>c({type:"quota",user:v,value:""})}
              onReset=${v=>c({type:"reset",user:v,value:""})}
              onDisable=${v=>c({type:"disable",user:v,value:""})} />`)}
          </tbody>
        </table>
      </div>
    </div>
    <${re} open=${!!i}
      title=${l?.title}
      body=${l&&r`${l.description} ${l.field}`}
      confirmLabel=${l?.confirmLabel} danger=${l?.danger}
      confirmDisabled=${i?.type!=="quota"&&!i?.value?.trim()}
      onConfirm=${h} onCancel=${p} />
  </div>`}J();function at(e){let t=String(e||"").trim();return t||null}function aa({settings:e,isOwner:t,reload:n}){let[a,o]=f(!1);async function s(i){if(i.preventDefault(),a)return;o(!0);let c=new FormData(i.currentTarget),d={allow_vod_uploads:c.get("allow_vod_uploads")==="on",vod_threshold_minutes:Number(c.get("vod_threshold_minutes")||30)};if(t){d.about_text=String(c.get("about_text")||""),d.smtp_enabled=c.get("smtp_enabled")==="on",d.smtp_host=at(c.get("smtp_host")),d.smtp_port=Number(c.get("smtp_port")||587),d.smtp_tls_mode=String(c.get("smtp_tls_mode")||"starttls"),d.smtp_username=at(c.get("smtp_username")),d.smtp_from_email=at(c.get("smtp_from_email")),d.smtp_from_name=at(c.get("smtp_from_name"));let u=String(c.get("smtp_password")||"").trim();u&&(d.smtp_password=u),c.get("smtp_password_clear")==="on"&&(d.smtp_password_clear=!0)}try{await k("/api/v1/admin/settings",{method:"PATCH",body:d}),C("Settings saved."),n()}catch(u){C(u.message)}finally{o(!1)}}return r`<form class="admin-settings-page" onSubmit=${s}>
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
      <button class="btn btn-primary" type="submit" disabled=${a}>${M("save",{size:14})} Save settings</button>
    </div>
  </form>`}function Ds(e){return`${(e/100).toFixed(e%100===0?0:1)}%`}function Rs(e){switch(e){case"delete_and_retry":return"delete the failed upload and retry from a new session";case"retry":return"retry the current upload request";default:return""}}function Us({upload:e}){let t=Math.max(0,Math.min(1e4,Number(e.progress_basis_points||0))),n=Rs(e.recovery_action);return r`<div class="job-item">
    <div class="job-title-line">
      <strong class="mono">${e.id}</strong>
      <span class="badge badge-warn">${Ds(t)}</span>
    </div>
    <div class="progress-meter" aria-label="Upload progress"><span style=${`width:${t/100}%`}></span></div>
    <span class="muted">clip ${e.clip_id} — ${q(e.received_size_bytes)} of ${q(e.expected_size_bytes)} — updated ${G(e.updated_at)}</span>
    ${e.failure_reason&&r`<span class="form-error">${e.failure_reason}</span>`}
    ${n&&r`<span class="muted">Recovery: ${n}</span>`}
  </div>`}function sa({job:e}){return r`<div class="job-item">
    <strong>${e.kind} <span class="mono">${e.id}</span></strong>
    <span class="muted">${e.status} — attempts ${e.attempts}/${e.max_attempts} — updated ${G(e.updated_at)} — target ${e.target_type||""}:${e.target_id||""}</span>
    ${e.last_error&&r`<span class="form-error">${e.last_error}</span>`}
  </div>`}function Ct({title:e,items:t,renderItem:n,emptyLabel:a}){return r`<div class="panel">
    <div class="section-header">
      <h2>${e}</h2>
      <span class="muted">${t.length}</span>
    </div>
    ${t.length?r`<div class="job-list">${t.map(n)}</div>`:r`<p class="muted">${a}</p>`}
  </div>`}function oa({failedUploads:e,deadJobs:t,recentErrors:n}){return r`<div class="section">
    <${Ct} title="Failed uploads" items=${e} emptyLabel="No failed uploads."
      renderItem=${a=>r`<${Us} key=${a.id} upload=${a} />`} />
    <${Ct} title="Dead jobs" items=${t} emptyLabel="No dead jobs."
      renderItem=${a=>r`<${sa} key=${a.id} job=${a} />`} />
    <${Ct} title="Recent job errors" items=${n} emptyLabel="No recent job errors."
      renderItem=${a=>r`<${sa} key=${a.id} job=${a} />`} />
  </div>`}var ra=[["overview","server","Overview"],["users","users","Users"],["settings","sliders","Settings"],["jobs","alert","Jobs"]];async function Is(){let[e,t,n,a,o,s]=await Promise.all([k("/api/v1/admin/overview"),k("/api/v1/admin/settings"),k("/api/v1/users"),k("/api/v1/admin/uploads/failed?limit=50"),k("/api/v1/admin/jobs/dead?limit=50"),k("/api/v1/admin/jobs/recent-errors?limit=50")]);return{overview:e,settings:t,users:n,failedUploads:a,deadJobs:o,recentErrors:s}}function ia({route:e}){let{user:t}=j(N),n=ra.some(([l])=>l===e.tab)?e.tab:"overview",[a,o]=f(null),[s,i]=f(null),[c,d]=f(null),[u,p]=f(0),h=()=>p(l=>l+1);return T(()=>{let l=!0;return i(null),Is().then(m=>l&&o(m)).catch(m=>l&&i(m)),()=>{l=!1}},[u]),r`<main class="page">
    <h1>Admin</h1>
    <p class="page-subtitle">Accounts, instance summary, and processing diagnostics.</p>
    <nav class="ad-tabs" aria-label="Admin views">
      ${ra.map(([l,m,v])=>r`<a key=${l} class=${`ad-tab ${l===n?"ad-tab-on":""}`}
        href=${`/admin?tab=${l}`} aria-current=${l===n?"page":void 0}>${M(m,{size:14})} ${v}</a>`)}
    </nav>
    ${s?r`<${W} name="alert" title="Couldn't load admin data" body=${s.message} />`:a?n==="users"?r`<${na} users=${a.users} settings=${a.settings} currentUser=${t}
          resetLink=${c} setResetLink=${d} reload=${h} />`:n==="settings"?r`<${aa} settings=${a.settings} isOwner=${t?.role==="owner"} reload=${h} />`:n==="jobs"?r`<${oa} failedUploads=${a.failedUploads} deadJobs=${a.deadJobs} recentErrors=${a.recentErrors} />`:r`<${ea} overview=${a.overview} deadJobs=${a.deadJobs} failedUploads=${a.failedUploads} />`:r`<p class="empty-state">Loading admin data…</p>`}
  </main>`}J();function Ls(e){if(!e?.avatar_url)return"";let t=e.updated_at||"";if(!t)return e.avatar_url;let n=String(e.avatar_url).includes("?")?"&":"?";return`${e.avatar_url}${n}v=${encodeURIComponent(t)}`}function As(e){return(e||"C").trim().slice(0,1).toUpperCase()||"C"}function st({user:e,size:t=40,className:n=""}){let a=Ls(e),o=`width:${t}px;height:${t}px;font-size:${Math.round(t*.4)}px`;if(a)return r`<img class=${`user-avatar ${n}`} style=${o} src=${a} alt="" />`;let s=e?.display_name||e?.username;return r`<div class=${`user-avatar user-avatar-fallback ${n}`} style=${o} aria-hidden="true">
    ${As(s)}
  </div>`}function la(e){let t=String(e||"").trim();return t||null}async function Ns(e){let t=new Headers;t.set("Accept","application/json"),t.set("Content-Type",e.type||"application/octet-stream");let n=_t();n&&t.set("X-CSRF-Token",n);let a=await fetch("/api/v1/me/avatar",{method:"PUT",credentials:"same-origin",headers:t,body:e}),o=await a.json().catch(()=>({}));if(!a.ok)throw new Error(o.error||a.statusText||"Avatar upload failed");return o}function ca(e){N.set({...N.get(),user:e})}function zs({user:e}){let[t,n]=f(!1);async function a(o){if(o.preventDefault(),t)return;n(!0);let s=new FormData(o.currentTarget);try{let i=await k("/api/v1/me/profile",{method:"PATCH",body:{display_name:la(s.get("display_name")),bio:la(s.get("bio"))}});ca(i),C("Profile saved.")}catch(i){C(i.message)}finally{n(!1)}}return r`<form class="profile-form" onSubmit=${a}>
    <label class="field"><span>Display name</span>
      <input class="input" name="display_name" maxlength="120" value=${e.display_name||""} placeholder=${e.username} /></label>
    <label class="field"><span>Bio</span>
      <textarea class="input" name="bio" rows="5" maxlength="2000" placeholder="Tell people what you upload.">${e.bio||""}</textarea></label>
    <div class="clip-inline-actions">
      <button class="btn btn-primary" type="submit" disabled=${t}>${M("save",{size:14})} Save profile</button>
    </div>
  </form>`}function Fs({user:e}){let[t,n]=f(!1);async function a(o){if(o.preventDefault(),t)return;let s=o.currentTarget.elements.avatar?.files?.[0];if(!s){C("Choose an avatar image first.");return}n(!0);try{let i=await Ns(s);ca(i),C("Avatar uploaded.")}catch(i){C(i.message)}finally{n(!1)}}return r`<form class="profile-form" onSubmit=${a}>
    <label class="field"><span>Avatar</span>
      <input name="avatar" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
      <small>PNG, JPEG, WebP, or GIF. Max 2 MiB.</small></label>
    <div class="clip-inline-actions">
      <button class="btn" type="submit" disabled=${t}>${M("upload",{size:14})} Upload avatar</button>
    </div>
  </form>`}function ua(){let{user:e}=j(N);return e?r`<main class="page">
    <h1>Profile</h1>
    <p class="page-subtitle">Public identity and avatar.</p>
    <div class="profile-settings-header">
      <${st} user=${e} size=${72} />
      <div>
        <h2>${e.display_name||e.username}</h2>
        <p>@${e.username} · ${e.role}</p>
      </div>
    </div>
    <${zs} user=${e} />
    <${Fs} user=${e} />
    <div class="profile-public-link">
      <a class="btn" href=${`/u/${encodeURIComponent(e.username)}`}>${M("external",{size:14})} View public profile</a>
    </div>
  </main>`:null}J();async function Bs(){let[e,t]=await Promise.all([k("/api/v1/auth/sessions"),k("/api/v1/auth/device-tokens")]);return{sessions:e,deviceTokens:t}}function Os({item:e,onRevoke:t}){return r`<div class="management-item">
    <div>
      <strong>${e.user_agent||"Unknown browser"}</strong>
      <div class="meta-line">
        <span>${e.ip_address||"Unknown IP"}</span>
        <span>Last used ${G(e.last_used_at||e.created_at)}</span>
        <span>Expires ${G(e.expires_at)}</span>
      </div>
    </div>
    <div class="actions">
      ${e.current&&r`<span class="badge badge-public">Current</span>`}
      <button class="btn btn-danger" type="button" onClick=${()=>t(e)}>${M("x",{size:14})} Revoke</button>
    </div>
  </div>`}function Hs({item:e,onRevoke:t}){let n=!!e.revoked_at;return r`<div class="management-item">
    <div>
      <strong>${e.name}</strong>
      <div class="meta-line">
        <span>Created ${G(e.created_at)}</span>
        <span>Last used ${G(e.last_used_at)}</span>
        ${e.expires_at&&r`<span>Expires ${G(e.expires_at)}</span>`}
        ${n&&r`<span>Revoked ${G(e.revoked_at)}</span>`}
      </div>
    </div>
    <div class="actions">
      <span class=${`badge ${n?"badge-private":"badge-public"}`}>${n?"Revoked":"Active"}</span>
      <button class="btn btn-danger" type="button" disabled=${n} onClick=${()=>t(e)}>${M("x",{size:14})} Revoke</button>
    </div>
  </div>`}function da(){let[e,t]=f(null),[n,a]=f(null),[o,s]=f(0),[i,c]=f(null);T(()=>{let p=!0;return a(null),Bs().then(h=>p&&t(h)).catch(h=>p&&a(h)),()=>{p=!1}},[o]);let d=()=>s(p=>p+1);async function u(){let p=i;c(null);try{if(p.kind==="session"){if(await k(`/api/v1/auth/sessions/${encodeURIComponent(p.item.id)}`,{method:"DELETE",body:{}}),p.item.current){N.set({user:null,csrfToken:null,ready:!0}),C("Current session revoked."),Y("/login");return}C("Session revoked.")}else await k(`/api/v1/auth/device-tokens/${encodeURIComponent(p.item.id)}`,{method:"DELETE",body:{}}),C("Device token revoked.");d()}catch(h){C(h.message)}}return n?r`<main class="page"><${W} name="alert" title="Couldn't load account data" body=${n.message} /></main>`:r`<main class="page">
    <h1>Account</h1>
    <p class="page-subtitle">Sessions and device tokens.</p>
    ${e?r`<div class="account-grid">
          <div class="panel">
            <div class="section-header"><h2>Browser sessions</h2><span class="muted">${e.sessions.length} active</span></div>
            ${e.sessions.length?r`<div class="management-list">${e.sessions.map(p=>r`<${Os} key=${p.id} item=${p}
                  onRevoke=${h=>c({kind:"session",item:h})} />`)}</div>`:r`<p class="muted">No active sessions.</p>`}
          </div>
          <div class="panel">
            <div class="section-header"><h2>Device tokens</h2><span class="muted">${e.deviceTokens.length} total</span></div>
            ${e.deviceTokens.length?r`<div class="management-list">${e.deviceTokens.map(p=>r`<${Hs} key=${p.id} item=${p}
                  onRevoke=${h=>c({kind:"device",item:h})} />`)}</div>`:r`<p class="muted">No device tokens.</p>`}
          </div>
        </div>`:r`<p class="empty-state">Loading account data…</p>`}
    <${re} open=${!!i}
      title=${i?.kind==="session"?"Revoke browser session?":"Revoke device token?"}
      body=${i?.kind==="session"?i.item.current?"This signs you out of the current browser session.":"This signs out that browser session immediately.":"The desktop client using this token will need to reconnect."}
      confirmLabel="Revoke" danger
      onConfirm=${u} onCancel=${()=>c(null)} />
  </main>`}J();function pa({route:e}){let{user:t}=j(N),[n,a]=f(null),[o,s]=f(null);if(T(()=>{let d=!0;return a(null),s(null),k(`/api/v1/public/users/${encodeURIComponent(e.username)}`).then(u=>d&&a(u)).catch(u=>d&&s(u)),()=>{d=!1}},[e.username]),o)return r`<main class="page"><${W} name="alert" title="Profile unavailable" body=${o.message} /></main>`;if(!n)return r`<main class="page"><p class="empty-state">Loading profile…</p></main>`;let i=t&&t.username.toLowerCase()===n.username.toLowerCase(),c=n.clips||[];return r`<main class="page">
    <header class="public-user-header">
      <${st} user=${n} size=${72} />
      <div class="public-user-header-body">
        <div class="public-user-title-row">
          <div>
            <h1>${n.display_name||n.username}</h1>
            <p>@${n.username}</p>
          </div>
          ${i&&r`<a class="btn" href="/profile">${M("edit",{size:14})} Edit profile</a>`}
        </div>
        ${n.bio&&r`<p class="public-user-bio">${n.bio}</p>`}
        <p class="meta-line">${n.clip_count} public clip${n.clip_count===1?"":"s"}</p>
      </div>
    </header>
    ${c.length===0?r`<${W} name="film" title="No public clips yet" />`:r`<div class="card-grid">
          ${c.map(d=>r`<${$e} key=${d.share_id}
            clip=${{...d,thumbnail_url:se(d)}}
            href=${`/c/${encodeURIComponent(d.share_id)}`} showAuthor=${!1} />`)}
        </div>`}
  </main>`}J();var ma="Clipline is a self-hosted clip library for saved gameplay moments.";function ot(e,t){return r`<div><dt>${e}</dt><dd>${t}</dd></div>`}function fa(){let[e,t]=f(ma);return T(()=>{let n=!0;return k("/api/v1/about").then(a=>n&&t(a.about_text||ma)).catch(()=>{}),()=>{n=!1}},[]),r`<main class="page">
    <h1>About</h1>
    <p class="page-subtitle">Clipline Cloud</p>
    <div class="panel about-panel">
      <h2>Clipline Cloud</h2>
      <p class="about-text">${e}</p>
      <dl class="ad-kv">
        ${ot("Home","Public clips that are ready for discovery.")}
        ${ot("Unlisted","Shareable by link, but not listed on Home.")}
        ${ot("Private","Visible only to the clip owner.")}
        ${ot("Media","Public and unlisted clips are not DRM-protected.")}
      </dl>
    </div>
  </main>`}var Vs={publicLibrary:Je,publicGame:Je,games:Dn,library:An,clip:kt,public:kt,login:Xn,resetPassword:Qn,admin:ia,profile:ua,account:da,publicUser:pa,about:fa},_a={publicLibrary:"feed",publicGame:"feed",games:"games",library:"library",clip:"library",admin:"admin",profile:"profile"},ha=$n({pathname:window.location.pathname,search:window.location.search});function qs(){let e=yn();ha=e.name;let{ready:t}=j(N);if(!t)return r`<div class="boot">Loading…</div>`;let n=Vs[e.name]||Je,a=e.name==="login"||e.name==="resetPassword";return r`<div class="ui" onClick=${wn}>
    ${!a&&r`<${xn} active=${_a[e.name]||""} />`}
    <${n} route=${e} />
    ${!a&&r`<${Cn} active=${_a[e.name]||""} />`}
    <${Sn} />
  </div>`}window.addEventListener("clipline:unauthorized",()=>{N.set({user:null,csrfToken:null,ready:!0}),vn(ha)||Y("/login")});(async()=>{try{let t=await k("/api/v1/auth/me");ke(t.csrf_token),N.set({user:t.user,csrfToken:t.csrf_token,ready:!0})}catch{N.set({user:null,csrfToken:null,ready:!0})}let e=document.querySelector("#app");e.textContent="",Yt(r`<${qs} />`,e)})();
