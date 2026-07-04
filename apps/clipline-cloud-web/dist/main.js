var ya=Object.defineProperty;var wa=(e,t)=>()=>(e&&(t=e(e=0)),t);var ka=(e,t)=>{for(var n in t)ya(e,n,{get:t[n],enumerable:!0})};var an={};ka(an,{ApiError:()=>be,api:()=>k,getCsrfToken:()=>bt,setCsrfToken:()=>Ce});function Ce(e){He=e}function bt(){return He}async function k(e,t={}){let n=(t.method||"GET").toUpperCase(),a=new Headers(t.headers||{});a.set("Accept","application/json");let o=t.body;o&&typeof o!="string"&&(a.set("Content-Type","application/json"),o=JSON.stringify(o)),!["GET","HEAD","OPTIONS"].includes(n)&&He&&a.set("X-CSRF-Token",He);let s=await fetch(e,{...t,body:o,credentials:"same-origin",headers:a,method:n}),c=(s.headers.get("content-type")||"").includes("application/json")?await s.json():await s.text();if(!s.ok){s.status===401&&window.dispatchEvent(new CustomEvent("clipline:unauthorized"));let p=typeof c=="object"&&c?.error?c.error:s.statusText;throw new be(p||"Request failed",s.status)}return c}var He,be,X=wa(()=>{He=null;be=class extends Error{constructor(t,n){super(t),this.status=n}}});var Be,N,Vt,xa,he,zt,Ht,qt,ct,Ie,Se,Kt,pt,ut,dt,Sa,Ne={},ze=[],Ca=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,Oe=Array.isArray;function me(e,t){for(var n in t)e[n]=t[n];return e}function mt(e){e&&e.parentNode&&e.parentNode.removeChild(e)}function ft(e,t,n){var a,o,s,i={};for(s in t)s=="key"?a=t[s]:s=="ref"?o=t[s]:i[s]=t[s];if(arguments.length>2&&(i.children=arguments.length>3?Be.call(arguments,2):n),typeof e=="function"&&e.defaultProps!=null)for(s in e.defaultProps)i[s]===void 0&&(i[s]=e.defaultProps[s]);return Le(e,i,a,o,null)}function Le(e,t,n,a,o){var s={type:e,props:t,key:n,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:o??++Vt,__i:-1,__u:0};return o==null&&N.vnode!=null&&N.vnode(s),s}function Ve(e){return e.children}function Ae(e,t){this.props=e,this.context=t}function ge(e,t){if(t==null)return e.__?ge(e.__,e.__i+1):null;for(var n;t<e.__k.length;t++)if((n=e.__k[t])!=null&&n.__e!=null)return n.__e;return typeof e.type=="function"?ge(e):null}function Ta(e){if(e.__P&&e.__d){var t=e.__v,n=t.__e,a=[],o=[],s=me({},t);s.__v=t.__v+1,N.vnode&&N.vnode(s),_t(e.__P,s,t,e.__n,e.__P.namespaceURI,32&t.__u?[n]:null,a,n??ge(t),!!(32&t.__u),o),s.__v=t.__v,s.__.__k[s.__i]=s,Jt(a,s,o),t.__e=t.__=null,s.__e!=n&&Gt(s)}}function Gt(e){if((e=e.__)!=null&&e.__c!=null)return e.__e=e.__c.base=null,e.__k.some(function(t){if(t!=null&&t.__e!=null)return e.__e=e.__c.base=t.__e}),Gt(e)}function Ft(e){(!e.__d&&(e.__d=!0)&&he.push(e)&&!Fe.__r++||zt!=N.debounceRendering)&&((zt=N.debounceRendering)||Ht)(Fe)}function Fe(){try{for(var e,t=1;he.length;)he.length>t&&he.sort(qt),e=he.shift(),t=he.length,Ta(e)}finally{he.length=Fe.__r=0}}function Wt(e,t,n,a,o,s,i,c,p,u,d){var h,l,m,b,g,w,x,y=a&&a.__k||ze,E=t.length;for(p=Ma(n,t,y,p,E),h=0;h<E;h++)(m=n.__k[h])!=null&&(l=m.__i!=-1&&y[m.__i]||Ne,m.__i=h,w=_t(e,m,l,o,s,i,c,p,u,d),b=m.__e,m.ref&&l.ref!=m.ref&&(l.ref&&ht(l.ref,null,m),d.push(m.ref,m.__c||b,m)),g==null&&b!=null&&(g=b),(x=!!(4&m.__u))||l.__k===m.__k?(p=jt(m,p,e,x),x&&l.__e&&(l.__e=null)):typeof m.type=="function"&&w!==void 0?p=w:b&&(p=b.nextSibling),m.__u&=-7);return n.__e=g,p}function Ma(e,t,n,a,o){var s,i,c,p,u,d=n.length,h=d,l=0;for(e.__k=new Array(o),s=0;s<o;s++)(i=t[s])!=null&&typeof i!="boolean"&&typeof i!="function"?(typeof i=="string"||typeof i=="number"||typeof i=="bigint"||i.constructor==String?i=e.__k[s]=Le(null,i,null,null,null):Oe(i)?i=e.__k[s]=Le(Ve,{children:i},null,null,null):i.constructor===void 0&&i.__b>0?i=e.__k[s]=Le(i.type,i.props,i.key,i.ref?i.ref:null,i.__v):e.__k[s]=i,p=s+l,i.__=e,i.__b=e.__b+1,c=null,(u=i.__i=Pa(i,n,p,h))!=-1&&(h--,(c=n[u])&&(c.__u|=2)),c==null||c.__v==null?(u==-1&&(o>d?l--:o<d&&l++),typeof i.type!="function"&&(i.__u|=4)):u!=p&&(u==p-1?l--:u==p+1?l++:(u>p?l--:l++,i.__u|=4))):e.__k[s]=null;if(h)for(s=0;s<d;s++)(c=n[s])!=null&&(2&c.__u)==0&&(c.__e==a&&(a=ge(c)),Xt(c,c));return a}function jt(e,t,n,a){var o,s;if(typeof e.type=="function"){for(o=e.__k,s=0;o&&s<o.length;s++)o[s]&&(o[s].__=e,t=jt(o[s],t,n,a));return t}e.__e!=t&&(a&&(t&&e.type&&!t.parentNode&&(t=ge(e)),n.insertBefore(e.__e,t||null)),t=e.__e);do t=t&&t.nextSibling;while(t!=null&&t.nodeType==8);return t}function Pa(e,t,n,a){var o,s,i,c=e.key,p=e.type,u=t[n],d=u!=null&&(2&u.__u)==0;if(u===null&&c==null||d&&c==u.key&&p==u.type)return n;if(a>(d?1:0)){for(o=n-1,s=n+1;o>=0||s<t.length;)if((u=t[i=o>=0?o--:s++])!=null&&(2&u.__u)==0&&c==u.key&&p==u.type)return i}return-1}function Bt(e,t,n){t[0]=="-"?e.setProperty(t,n??""):e[t]=n==null?"":typeof n!="number"||Ca.test(t)?n:n+"px"}function Ue(e,t,n,a,o){var s,i;e:if(t=="style")if(typeof n=="string")e.style.cssText=n;else{if(typeof a=="string"&&(e.style.cssText=a=""),a)for(t in a)n&&t in n||Bt(e.style,t,"");if(n)for(t in n)a&&n[t]==a[t]||Bt(e.style,t,n[t])}else if(t[0]=="o"&&t[1]=="n")s=t!=(t=t.replace(Kt,"$1")),i=t.toLowerCase(),t=i in e||t=="onFocusOut"||t=="onFocusIn"?i.slice(2):t.slice(2),e.l||(e.l={}),e.l[t+s]=n,n?a?n[Se]=a[Se]:(n[Se]=pt,e.addEventListener(t,s?dt:ut,s)):e.removeEventListener(t,s?dt:ut,s);else{if(o=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&t[4]!="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&n==1?"":n))}}function Ot(e){return function(t){if(this.l){var n=this.l[t.type+e];if(t[Ie]==null)t[Ie]=pt++;else if(t[Ie]<n[Se])return;return n(N.event?N.event(t):t)}}}function _t(e,t,n,a,o,s,i,c,p,u){var d,h,l,m,b,g,w,x,y,E,U,K,Y,oe,ne,J,z=t.type;if(t.constructor!==void 0)return null;128&n.__u&&(p=!!(32&n.__u),s=[c=t.__e=n.__e]),(d=N.__b)&&d(t);e:if(typeof z=="function"){h=i.length;try{if(y=t.props,E=z.prototype&&z.prototype.render,U=(d=z.contextType)&&a[d.__c],K=d?U?U.props.value:d.__:a,n.__c?x=(l=t.__c=n.__c).__=l.__E:(E?t.__c=l=new z(y,K):(t.__c=l=new Ae(y,K),l.constructor=z,l.render=Da),U&&U.sub(l),l.state||(l.state={}),l.__n=a,m=l.__d=!0,l.__h=[],l._sb=[]),E&&l.__s==null&&(l.__s=l.state),E&&z.getDerivedStateFromProps!=null&&(l.__s==l.state&&(l.__s=me({},l.__s)),me(l.__s,z.getDerivedStateFromProps(y,l.__s))),b=l.props,g=l.state,l.__v=t,m)E&&z.getDerivedStateFromProps==null&&l.componentWillMount!=null&&l.componentWillMount(),E&&l.componentDidMount!=null&&l.__h.push(l.componentDidMount);else{if(E&&z.getDerivedStateFromProps==null&&y!==b&&l.componentWillReceiveProps!=null&&l.componentWillReceiveProps(y,K),t.__v==n.__v||!l.__e&&l.shouldComponentUpdate!=null&&l.shouldComponentUpdate(y,l.__s,K)===!1){t.__v!=n.__v&&(l.props=y,l.state=l.__s,l.__d=!1),t.__e=n.__e,t.__k=n.__k,t.__k.some(function(se){se&&(se.__=t)}),ze.push.apply(l.__h,l._sb),l._sb=[],l.__h.length&&i.push(l);break e}l.componentWillUpdate!=null&&l.componentWillUpdate(y,l.__s,K),E&&l.componentDidUpdate!=null&&l.__h.push(function(){l.componentDidUpdate(b,g,w)})}if(l.context=K,l.props=y,l.__P=e,l.__e=!1,Y=N.__r,oe=0,E)l.state=l.__s,l.__d=!1,Y&&Y(t),d=l.render(l.props,l.state,l.context),ze.push.apply(l.__h,l._sb),l._sb=[];else do l.__d=!1,Y&&Y(t),d=l.render(l.props,l.state,l.context),l.state=l.__s;while(l.__d&&++oe<25);l.state=l.__s,l.getChildContext!=null&&(a=me(me({},a),l.getChildContext())),E&&!m&&l.getSnapshotBeforeUpdate!=null&&(w=l.getSnapshotBeforeUpdate(b,g)),ne=d!=null&&d.type===Ve&&d.key==null?Yt(d.props.children):d,c=Wt(e,Oe(ne)?ne:[ne],t,n,a,o,s,i,c,p,u),l.base=t.__e,t.__u&=-161,l.__h.length&&i.push(l),x&&(l.__E=l.__=null)}catch(se){if(i.length=h,t.__v=null,p||s!=null){if(se.then){for(t.__u|=p?160:128;c&&c.nodeType==8&&c.nextSibling;)c=c.nextSibling;s!=null&&(s[s.indexOf(c)]=null),t.__e=c}else if(s!=null)for(J=s.length;J--;)mt(s[J])}else t.__e=n.__e;t.__k==null&&(t.__k=n.__k||[]),se.then||Zt(t),N.__e(se,t,n)}}else s==null&&t.__v==n.__v?(t.__k=n.__k,t.__e=n.__e):c=t.__e=Ea(n.__e,t,n,a,o,s,i,p,u);return(d=N.diffed)&&d(t),128&t.__u?void 0:c}function Zt(e){e&&(e.__c&&(e.__c.__e=!0),e.__k&&e.__k.some(Zt))}function Jt(e,t,n){for(var a=0;a<n.length;a++)ht(n[a],n[++a],n[++a]);N.__c&&N.__c(t,e),e.some(function(o){try{e=o.__h,o.__h=[],e.some(function(s){s.call(o)})}catch(s){N.__e(s,o.__v)}})}function Yt(e){return typeof e!="object"||e==null||e.__b>0?e:Oe(e)?e.map(Yt):e.constructor!==void 0?null:me({},e)}function Ea(e,t,n,a,o,s,i,c,p){var u,d,h,l,m,b,g,w=n.props||Ne,x=t.props,y=t.type;if(y=="svg"?o="http://www.w3.org/2000/svg":y=="math"?o="http://www.w3.org/1998/Math/MathML":o||(o="http://www.w3.org/1999/xhtml"),s!=null){for(u=0;u<s.length;u++)if((m=s[u])&&"setAttribute"in m==!!y&&(y?m.localName==y:m.nodeType==3)){e=m,s[u]=null;break}}if(e==null){if(y==null)return document.createTextNode(x);e=document.createElementNS(o,y,x.is&&x),c&&(N.__m&&N.__m(t,s),c=!1),s=null}if(y==null)w===x||c&&e.data==x||(e.data=x);else{if(s=y=="textarea"&&x.defaultValue!=null?null:s&&Be.call(e.childNodes),!c&&s!=null)for(w={},u=0;u<e.attributes.length;u++)w[(m=e.attributes[u]).name]=m.value;for(u in w)m=w[u],u=="dangerouslySetInnerHTML"?h=m:u=="children"||u in x||u=="value"&&"defaultValue"in x||u=="checked"&&"defaultChecked"in x||Ue(e,u,null,m,o);for(u in x)m=x[u],u=="children"?l=m:u=="dangerouslySetInnerHTML"?d=m:u=="value"?b=m:u=="checked"?g=m:c&&typeof m!="function"||w[u]===m||Ue(e,u,m,w[u],o);if(d)c||h&&(d.__html==h.__html||d.__html==e.innerHTML)||(e.innerHTML=d.__html),t.__k=[];else if(h&&(e.innerHTML=""),Wt(t.type=="template"?e.content:e,Oe(l)?l:[l],t,n,a,y=="foreignObject"?"http://www.w3.org/1999/xhtml":o,s,i,s?s[0]:n.__k&&ge(n,0),c,p),s!=null)for(u=s.length;u--;)mt(s[u]);c&&y!="textarea"||(u="value",y=="progress"&&b==null?e.removeAttribute("value"):b!=null&&(b!==e[u]||y=="progress"&&!b||y=="option"&&b!=w[u])&&Ue(e,u,b,w[u],o),u="checked",g!=null&&g!=e[u]&&Ue(e,u,g,w[u],o))}return e}function ht(e,t,n){try{if(typeof e=="function"){var a=typeof e.__u=="function";a&&e.__u(),a&&t==null||(e.__u=e(t))}else e.current=t}catch(o){N.__e(o,n)}}function Xt(e,t,n){var a,o;if(N.unmount&&N.unmount(e),(a=e.ref)&&(a.current&&a.current!=e.__e||ht(a,null,t)),(a=e.__c)!=null){if(a.componentWillUnmount)try{a.componentWillUnmount()}catch(s){N.__e(s,t)}a.base=a.__P=a.__n=null}if(a=e.__k)for(o=0;o<a.length;o++)a[o]&&Xt(a[o],t,n||typeof e.type!="function");n||mt(e.__e),e.__c=e.__=e.__e=void 0}function Da(e,t,n){return this.constructor(e,n)}function Qt(e,t,n){var a,o,s,i;t==document&&(t=document.documentElement),N.__&&N.__(e,t),o=(a=typeof n=="function")?null:n&&n.__k||t.__k,s=[],i=[],_t(t,e=(!a&&n||t).__k=ft(Ve,null,[e]),o||Ne,Ne,t.namespaceURI,!a&&n?[n]:o?null:t.firstChild?Be.call(t.childNodes):null,s,!a&&n?n:o?o.__e:t.firstChild,a,i),Jt(s,e,i),e.props.children=null}Be=ze.slice,N={__e:function(e,t,n,a){for(var o,s,i;t=t.__;)if((o=t.__c)&&!o.__)try{if((s=o.constructor)&&s.getDerivedStateFromError!=null&&(o.setState(s.getDerivedStateFromError(e)),i=o.__d),o.componentDidCatch!=null&&(o.componentDidCatch(e,a||{}),i=o.__d),i)return o.__E=o}catch(c){e=c}throw e}},Vt=0,xa=function(e){return e!=null&&e.constructor===void 0},Ae.prototype.setState=function(e,t){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=me({},this.state),typeof e=="function"&&(e=e(me({},n),this.props)),e&&me(n,e),e!=null&&this.__v&&(t&&this._sb.push(t),Ft(this))},Ae.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),Ft(this))},Ae.prototype.render=Ve,he=[],Ht=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,qt=function(e,t){return e.__v.__b-t.__v.__b},Fe.__r=0,ct=Math.random().toString(8),Ie="__d"+ct,Se="__a"+ct,Kt=/(PointerCapture)$|Capture$/i,pt=0,ut=Ot(!1),dt=Ot(!0),Sa=0;var tn=function(e,t,n,a){var o;t[0]=0;for(var s=1;s<t.length;s++){var i=t[s++],c=t[s]?(t[0]|=i?1:2,n[t[s++]]):t[++s];i===3?a[0]=c:i===4?a[1]=Object.assign(a[1]||{},c):i===5?(a[1]=a[1]||{})[t[++s]]=c:i===6?a[1][t[++s]]+=c+"":i?(o=e.apply(c,tn(e,c,n,["",null])),a.push(o),c[0]?t[0]|=2:(t[s-2]=0,t[s]=o)):a.push(c)}return a},en=new Map;function nn(e){var t=en.get(this);return t||(t=new Map,en.set(this,t)),(t=tn(this,t.get(e)||(t.set(e,t=(function(n){for(var a,o,s=1,i="",c="",p=[0],u=function(l){s===1&&(l||(i=i.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?p.push(0,l,i):s===3&&(l||i)?(p.push(3,l,i),s=2):s===2&&i==="..."&&l?p.push(4,l,0):s===2&&i&&!l?p.push(5,0,!0,i):s>=5&&((i||!l&&s===5)&&(p.push(s,0,i,o),s=6),l&&(p.push(s,l,0,o),s=6)),i=""},d=0;d<n.length;d++){d&&(s===1&&u(),u(d));for(var h=0;h<n[d].length;h++)a=n[d][h],s===1?a==="<"?(u(),p=[p],s=3):i+=a:s===4?i==="--"&&a===">"?(s=1,i=""):i=a+i[0]:c?a===c?c="":i+=a:a==='"'||a==="'"?c=a:a===">"?(u(),s=1):s&&(a==="="?(s=5,o=i,i=""):a==="/"&&(s<5||n[d][h+1]===">")?(u(),s===3&&(p=p[0]),s=p,(p=p[0]).push(2,0,s),s=0):a===" "||a==="	"||a===`
`||a==="\r"?(u(),s=2):i+=a),s===3&&i==="!--"&&(s=4,p=p[0])}return u(),p})(e)),t),arguments,[])).length>1?t:t[0]}var r=nn.bind(ft);X();var Te,O,vt,sn,qe=0,fn=[],V=N,on=V.__b,rn=V.__r,ln=V.diffed,cn=V.__c,un=V.unmount,dn=V.__;function gt(e,t){V.__h&&V.__h(O,e,qe||t),qe=0;var n=O.__H||(O.__H={__:[],__h:[]});return e>=n.__.length&&n.__.push({}),n.__[e]}function f(e){return qe=1,Ra(bn,e)}function Ra(e,t,n){var a=gt(Te++,2);if(a.t=e,!a.__c&&(a.__=[n?n(t):bn(void 0,t),function(c){var p=a.__N?a.__N[0]:a.__[0],u=a.t(p,c);p!==u&&(a.__N=[u,a.__[1]],a.__c.setState({}))}],a.__c=O,!O.__f)){var o=function(c,p,u){if(!a.__c.__H)return!0;var d=!1,h=a.__c.props!==c;if(a.__c.__H.__.some(function(m){if(m.__N){d=!0;var b=m.__[0];m.__=m.__N,m.__N=void 0,b!==m.__[0]&&(h=!0)}}),s){var l=s.call(this,c,p,u);return d?l||h:l}return!d||h};O.__f=!0;var s=O.shouldComponentUpdate,i=O.componentWillUpdate;O.componentWillUpdate=function(c,p,u){if(this.__e){var d=s;s=void 0,o(c,p,u),s=d}i&&i.call(this,c,p,u)},O.shouldComponentUpdate=o}return a.__N||a.__}function C(e,t){var n=gt(Te++,3);!V.__s&&hn(n.__H,t)&&(n.__=e,n.u=t,O.__H.__h.push(n))}function F(e){return qe=5,Ua(function(){return{current:e}},[])}function Ua(e,t){var n=gt(Te++,7);return hn(n.__H,t)&&(n.__=e(),n.__H=t,n.__h=e),n.__}function pn(){for(var e;e=fn.shift();){var t=e.__H;if(e.__P&&t)try{t.__h.some($t),t.__h.some(_n),t.__h=[]}catch(n){t.__h=[],V.__e(n,e.__v)}}}V.__b=function(e){O=null,on&&on(e)},V.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),dn&&dn(e,t)},V.__r=function(e){rn&&rn(e),Te=0;var t=(O=e.__c).__H;t&&(vt===O?(t.__h=[],O.__h=[],t.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(t.__h.length&&pn(),Te=0)),vt=O},V.diffed=function(e){ln&&ln(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(fn.push(t)!==1&&sn===V.requestAnimationFrame||((sn=V.requestAnimationFrame)||Ia)(pn)),t.__H.__.some(function(n){n.u&&(n.__H=n.u,n.u=void 0)})),vt=O=null},V.__c=function(e,t){t.some(function(n){try{n.__h.some($t),n.__h=n.__h.filter(function(a){return!a.__||_n(a)})}catch(a){t.some(function(o){o.__h&&(o.__h=[])}),t=[],V.__e(a,n.__v)}}),cn&&cn(e,t)},V.unmount=function(e){un&&un(e);var t,n=e.__c;n&&n.__H&&(n.__H.__.some(function(a){try{$t(a)}catch(o){t=o}}),n.__H=void 0,t&&V.__e(t,n.__v))};var mn=typeof requestAnimationFrame=="function";function Ia(e){var t,n=function(){clearTimeout(a),mn&&cancelAnimationFrame(t),setTimeout(e)},a=setTimeout(n,35);mn&&(t=requestAnimationFrame(n))}function $t(e){var t=O,n=e.__c;typeof n=="function"&&(e.__c=void 0,n()),O=t}function _n(e){var t=O;e.__c=e.__(),O=t}function hn(e,t){return!e||e.length!==t.length||t.some(function(n,a){return n!==e[a]})}function bn(e,t){return typeof t=="function"?t(e):t}function vn(e){let t=e,n=new Set;return{get:()=>t,set(a){t=a,n.forEach(o=>o(t))},update(a){this.set(a(t))},subscribe(a){return n.add(a),()=>n.delete(a)}}}function H(e){let[t,n]=f(e.get());return C(()=>e.subscribe(n),[e]),t}var A=vn({user:null,csrfToken:null,ready:!1}),Ke=vn([]),La=0;function S(e,{actionLabel:t,onAction:n,timeoutMs:a=5e3}={}){let o=++La;return Ke.update(s=>[...s,{id:o,message:e,actionLabel:t,onAction:n}]),a&&setTimeout(()=>Ge(o),a),o}function Ge(e){Ke.update(t=>t.filter(n=>n.id!==e))}function We(e){try{return decodeURIComponent(e)}catch{return e}}function $n(e){let t=Number(e.get("page")||1);return{sort:e.get("sort")||"uploaded_at_desc",game:e.get("game")||"",q:e.get("q")||"",page:Number.isFinite(t)?Math.max(1,t):1}}var Aa=["login","resetPassword","public","publicLibrary","publicGame","publicUser","about","games"];function gn(e){return Aa.includes(e)}function je(e,t){let n=new URLSearchParams(t||""),a=e;return a.startsWith("/c/")?{name:"public",shareId:We(a.slice(3))}:a==="/"||a==="/public"||a==="/search"?{name:"publicLibrary",query:$n(n)}:a.startsWith("/game/")?{name:"publicGame",game:We(a.slice(6)),query:$n(n)}:a==="/about"?{name:"about"}:a==="/games"?{name:"games"}:a.startsWith("/u/")?{name:"publicUser",username:We(a.slice(3))}:a==="/library"?{name:"library"}:a.startsWith("/clip/")?{name:"clip",clipId:We(a.slice(6))}:a==="/admin"?{name:"admin",tab:n.get("tab")||"overview"}:a==="/account"?{name:"account"}:a==="/profile"?{name:"profile"}:a==="/login"?{name:"login"}:a==="/reset-password"?{name:"resetPassword",token:n.get("token")||"",invite:n.get("invite")==="1"}:{name:"publicLibrary"}}function yn(e){return je(e.pathname,e.search).name}var yt=new Set;function Q(e){window.history.pushState({},"",e),wn()}function wn(){let{pathname:e,search:t}=window.location,n=je(e,t);yt.forEach(a=>a(n))}window.addEventListener("popstate",wn);function kn(){let[e,t]=f(()=>je(window.location.pathname,window.location.search));return C(()=>(yt.add(t),()=>yt.delete(t)),[]),e}function xn(e){let t=e.target.closest("a[href^='/']");!t||t.target||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||(e.preventDefault(),Q(t.getAttribute("href")))}var Sn={alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',clipboard:'<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',copy:'<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',external:'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',fastForward:'<path d="m13 19 9-7-9-7v14Z"/><path d="m2 19 9-7-9-7v14Z"/>',film:'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 8h4"/><path d="M3 16h4"/><path d="M17 8h4"/><path d="M17 16h4"/>',fullscreen:'<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/><path d="M12 2a15.3 15.3 0 0 0 0 20"/>',home:'<path d="m3 10 9-7 9 7"/><path d="M5 8.5V20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5"/><path d="M9 22V12h6v10"/>',info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',library:'<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',lock:'<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',logOut:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',menu:'<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',message:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>',notepad:'<path d="M8 2v4"/><path d="M16 2v4"/><path d="M3 10h18"/><path d="M6 4h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/><path d="M8 14h8"/><path d="M8 18h5"/>',pause:'<path d="M8 5v14"/><path d="M16 5v14"/>',play:'<path d="m8 5 11 7-11 7V5Z"/>',plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',check:'<path d="M20 6 9 17l-5-5"/>',refresh:'<path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/><path d="M3 12A9 9 0 0 1 18.5 5.7L21 8"/><path d="M21 3v5h-5"/>',rewind:'<path d="m11 19-9-7 9-7v14Z"/><path d="m22 19-9-7 9-7v14Z"/>',save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',server:'<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',skipBack:'<path d="M19 20 9 12l10-8v16Z"/><path d="M5 19V5"/>',skipForward:'<path d="m5 4 10 8-10 8V4Z"/><path d="M19 5v14"/>',shield:'<path d="M20 13c0 5-3.5 7.5-7.7 8.8a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V5l8-3 8 3v8Z"/>',sliders:'<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>',theater:'<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M6 9h12"/><path d="M6 15h12"/>',trash:'<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',volume2:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9 9 0 0 1 0 14"/>',volumeX:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>',x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'};function T(e,{size:t=18}={}){return r`<svg viewBox="0 0 24 24" width=${t} height=${t} fill="none"
    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" dangerouslySetInnerHTML=${{__html:Sn[e]||""}} />`}function Na(e){return e?.query?.q||""}function Cn({active:e,route:t}){let{user:n}=H(A),[a,o]=f(!1),s=F(null),i=Na(t),[c,p]=f(i);C(()=>{p(i)},[i]);let u=n?.role==="admin"||n?.role==="owner";C(()=>{if(!a)return;let l=b=>{s.current?.contains(b.target)||o(!1)},m=b=>{b.key==="Escape"&&o(!1)};return document.addEventListener("pointerdown",l),document.addEventListener("keydown",m),()=>{document.removeEventListener("pointerdown",l),document.removeEventListener("keydown",m)}},[a]);let d=[["feed","/","Feed"],["library","/library","Library",!!n],["games","/games","Games"],["admin","/admin","Admin",u]].filter(([,,,l])=>l!==!1),h=l=>{l.preventDefault();let m=new FormData(l.target).get("q")?.toString().trim();Q(m?`/search?q=${encodeURIComponent(m)}`:"/search")};return r`<header class="topbar">
    <a class="wordmark" href="/" aria-label="Clipline home">
      <img src="/clipline-icon.svg" alt="" width="24" height="24" />
      CLIP<b>LINE</b>
    </a>
    <nav class="topnav" aria-label="Primary">
      ${d.map(([l,m,b])=>r`
        <a class=${l===e?"topnav-on":""} href=${m}>${b}</a>`)}
    </nav>
    <form class="topsearch" role="search" onSubmit=${h}>
      <input class="input" name="q" value=${c} onInput=${l=>p(l.target.value)}
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
            <button role="menuitem" class="menu-danger" onClick=${za}>Sign out</button>
          </div>`}
        </div>`:r`<a class="btn" href="/login">${T("lock",{size:14})} Sign in</a>`}
  </header>`}async function za(){let{api:e}=await Promise.resolve().then(()=>(X(),an));try{await e("/api/v1/auth/logout",{method:"POST"})}catch{}A.set({user:null,csrfToken:null,ready:!0}),Q("/login")}var Fa=[["feed","/","home","Feed",!0],["library","/library","library","Library","auth"],["search","/search","search","Search",!0],["profile","/profile","user","Profile","auth"]];function Ba(e){return Fa.filter(([,,,,t])=>t!=="auth"||!!e)}function Tn({active:e}){let{user:t}=H(A),n=Ba(t);return r`<nav class="tabbar" aria-label="Primary">
    ${n.map(([a,o,s,i])=>r`
      <a class=${a===e?"tab-on":""} href=${o}>${T(s)}<span>${i}</span></a>`)}
  </nav>`}function Mn(){let e=H(Ke);return r`<div class="toasts" role="status" aria-live="polite">
    ${e.map(t=>r`<div class="toast" key=${t.id}>
      <span>${t.message}</span>
      ${t.actionLabel&&r`<button class="toast-action"
        onClick=${()=>{t.onAction?.(),Ge(t.id)}}>${t.actionLabel}</button>`}
      <button class="toast-x" aria-label="Dismiss" onClick=${()=>Ge(t.id)}>✕</button>
    </div>`)}
  </div>`}X();function j(e){if(!e)return"Unknown";let t=new Date(e);return Number.isNaN(t.getTime())?"Unknown":new Intl.DateTimeFormat(void 0,{dateStyle:"medium",timeStyle:"short"}).format(t)}function ve(e){if(e==null)return"Unknown";let t=Math.max(0,Math.round(Number(e)/1e3)),n=Math.floor(t/60),a=t%60;return`${n}:${String(a).padStart(2,"0")}`}function Ze(e){if(!e)return"Unknown";let t=new Date(e);if(Number.isNaN(t.getTime()))return"Unknown";let n=Math.min(0,t.getTime()-Date.now()),a=[["year",365*24*60*60*1e3],["month",720*60*60*1e3],["week",10080*60*1e3],["day",1440*60*1e3],["hour",3600*1e3],["minute",60*1e3],["second",1e3]],[o,s]=a.find(([,c])=>Math.abs(n)>=c)||a[a.length-1],i=Math.round(n/s);return new Intl.RelativeTimeFormat(void 0,{numeric:"always"}).format(i,o)}function q(e){if(e==null)return"Unknown";let t=Number(e);if(!Number.isFinite(t))return"Unknown";let n=["B","KiB","MiB","GiB","TiB"],a=t,o=0;for(;a>=1024&&o<n.length-1;)a/=1024,o+=1;return`${a.toFixed(o===0?0:1)} ${n[o]}`}function $e(e){let t=Number(e||0),n=Number.isFinite(t)&&t>0?Math.floor(t):0;return`${new Intl.NumberFormat(void 0,{notation:n>=1e4?"compact":"standard"}).format(n)} view${n===1?"":"s"}`}function re(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/thumbnail`}function Me(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/thumbnail`}function Je(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/media`}function ye(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/media`}var Ye=null;function Pn(e){Ye?.(),Ye=e}function En(e){Ye===e&&(Ye=null)}var Oa=()=>window.matchMedia("(pointer: fine)").matches&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches&&!navigator.connection?.saveData;function Dn({src:e,poster:t,alt:n=""}){let[a,o]=f(!1),[s,i]=f(0),c=F(null),p=F(null),u=F(!0),d=F(),h=()=>{u.current&&(clearTimeout(c.current),o(!1),i(0))};d.current=h;let l=()=>{!e||!Oa()||(c.current=setTimeout(()=>{u.current&&(Pn(d.current),o(!0))},300))},m=b=>{let g=b.target;g.duration&&i(g.currentTime/g.duration)};return C(()=>()=>{u.current=!1,clearTimeout(c.current),En(d.current)},[]),r`<span class="hover-preview" onPointerEnter=${l} onPointerLeave=${h}>
    ${a?r`<video ref=${p} src=${e} poster=${t} muted loop autoplay
          playsinline preload="none" onTimeUpdate=${m} />`:r`<img src=${t} alt=${n} loading="lazy" />`}
    ${a&&r`<span class="preview-scrub"><span style=${`width:${s*100}%`} /></span>`}
  </span>`}function wt(e){return e.owner?.display_name||e.owner?.username||e.owner_username||e.author_name||e.author_username||null}function we({clip:e,href:t,selectable:n=!1,selected:a=!1,onToggleSelect:o,showVisibility:s=!1,showAuthor:i=!1}){let c=wt(e),p=[e.game_name&&r`<em>${e.game_name}</em>`,i&&c,e.view_count!=null&&$e(e.view_count),e.uploaded_at&&Ze(e.uploaded_at)].filter(Boolean);return r`<article class=${`clip-card ${a?"is-selected":""} ${n?"is-selectable":""}`}>
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
    <p class="card-meta">${p.map((u,d)=>r`${d>0&&" \xB7 "}${u}`)}</p>
  </article>`}function Z({name:e="film",title:t,body:n,action:a}){return r`<div class="empty">
    <div class="empty-icon">${T(e,{size:28})}</div>
    <h3>${t}</h3>
    ${n&&r`<p>${n}</p>`}
    ${a}
  </div>`}var Va=[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]],Ha=6;function Xe({route:e}){let t={sort:"uploaded_at_desc",page:1,q:"",...e.query,game:e.name==="publicGame"?e.game:e.query?.game||""},[n,a]=f(null),[o,s]=f([]),[i,c]=f(null);C(()=>{let g=!0;a(null),c(null);let w=new URLSearchParams;return t.sort!=="uploaded_at_desc"&&w.set("sort",t.sort),t.game&&w.set("game",t.game),t.q&&w.set("q",t.q),Number(t.page)>1&&w.set("page",String(t.page)),k(`/api/v1/public/clips${w.size?`?${w}`:""}`).then(x=>g&&a(x)).catch(x=>g&&c(x)),()=>{g=!1}},[e.name,t.sort,t.game,t.q,t.page]),C(()=>{let g=!0;return k("/api/v1/public/games").then(w=>g&&s(w.games||[])).catch(()=>{}),()=>{g=!1}},[]);let p=g=>Q(Ga({...t,page:1,...g}));if(i)return r`<main class="page">
      <${Z} name="alert" title="Couldn't load the feed" body=${i.message} />
    </main>`;let u=n?.clips,d=!!(t.game||t.q)||Number(t.page)>1,h=!d,l=[...o].sort((g,w)=>(w.clip_count||0)-(g.clip_count||0)),m=l.slice(0,Ha),b=l.length-m.length;return r`<main class="page">
    ${u==null?r`<${Ka} />`:u.length===0?r`<${Z} name="film"
          title=${d?"No clips match this filter":"No public clips yet"}
          body=${d?"Try a different game, search, or clear your filters.":"Clips shared as public from a library will show up here."}
          action=${d&&r`<a class="btn" href="/">Clear filters</a>`} />`:r`
        ${h?qa(u):""}
        <div class="feed-toolbar">
          <h2>Latest uploads</h2>
          <select class="input" value=${t.sort} onChange=${g=>p({sort:g.target.value})}>
            ${Va.map(([g,w])=>r`<option value=${g}>${w}</option>`)}
          </select>
          <div class="chips">
            <button class=${`chip ${t.game?"":"chip-on"}`} onClick=${()=>p({game:""})}>All</button>
            ${m.map(g=>r`<button
              class=${`chip ${t.game===g.game?"chip-on":""}`}
              onClick=${()=>p({game:g.game})}>${g.game}</button>`)}
            ${b>0&&r`<a class="chip" href="/games">+${b}</a>`}
          </div>
        </div>
        <div class="card-grid">
          ${(h?u.slice(4):u).map(g=>r`<${we} clip=${{...g,thumbnail_url:re(g),media_url:ye(g)}}
              href=${kt(g)} showAuthor />`)}
        </div>
        ${Wa(n,t,p)}
      `}
  </main>`}function qa(e){let[t,...n]=e,a=n.slice(0,3);return r`<p class="kicker">Now playing on this server</p>
    <section class="hero">
      <a class="hero-main" href=${kt(t)}>
        <img src=${re(t)} alt="" loading="lazy" />
        <span class="hero-caption">▶ ${t.title} — ${t.game_name} · ${ve(t.duration_ms)}</span>
      </a>
      <div class="hero-side">
        ${a.map(o=>r`<a class="hero-row" href=${kt(o)}>
            <img src=${re(o)} alt="" loading="lazy" />
            <span><b>${o.title}</b>
              <small>${wt(o)} · ${o.game_name} · ${$e(o.view_count)}</small></span>
          </a>`)}
      </div>
    </section>`}function Ka({count:e=8}){return r`<div class="card-grid">
    ${Array.from({length:e},(t,n)=>r`<div class="clip-card" key=${n}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`}function kt(e){return`/c/${encodeURIComponent(e.share_id)}`}function Ga({sort:e="uploaded_at_desc",game:t="",q:n="",page:a=1}={}){let o=new URLSearchParams,s=e||"uploaded_at_desc",i=String(t||"").trim(),c=String(n||"").trim(),p=Math.max(1,Number(a||1));if(s!=="uploaded_at_desc"&&o.set("sort",s),p>1&&o.set("page",String(p)),c)return o.set("q",c),i&&o.set("game",i),`/search?${o.toString()}`;if(i){let d=o.toString();return`/game/${encodeURIComponent(i)}${d?`?${d}`:""}`}let u=o.toString();return u?`/search?${u}`:"/"}function Wa(e,t,n){let a=Math.max(1,Number(t.page||1)),o=!!e?.has_more;return a<=1&&!o?"":r`<nav class="pager" aria-label="Public clip pages">
    <button class="btn" type="button" disabled=${a<=1}
      onClick=${()=>n({page:a-1})}>Previous</button>
    <span class="muted">Page ${a}</span>
    <button class="btn" type="button" disabled=${!o}
      onClick=${()=>n({page:a+1})}>Next</button>
  </nav>`}X();function Rn(){let[e,t]=f(null),[n,a]=f(null);return C(()=>{let o=!0;return k("/api/v1/public/games").then(s=>o&&t(s.games||[])).catch(s=>o&&a(s)),()=>{o=!1}},[]),n?r`<main class="page">
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
  </main>`}X();function Un({trigger:e,content:t,onClose:n,label:a,panelClass:o=""}){let[s,i]=f(!1),c=F(null),p=F(null),u=F(null),d=()=>{i(!1),n?.()},h=()=>{if(s){d();return}u.current=document.activeElement,i(!0)};return C(()=>{if(!s)return;let l=g=>{c.current?.contains(g.target)||d()},m=g=>{g.key==="Escape"&&d()};return document.addEventListener("pointerdown",l),document.addEventListener("keydown",m),p.current?.querySelector("input, select, textarea, button, a[href], [tabindex]")?.focus(),()=>{document.removeEventListener("pointerdown",l),document.removeEventListener("keydown",m),u.current?.focus?.()}},[s]),r`<div class="popover-wrap" ref=${c}>
    ${e({open:s,toggle:h})}
    ${s&&r`<div class=${`popover ${o}`} ref=${p} role="dialog" aria-label=${a||"Filters"}>
      ${t}
    </div>`}
  </div>`}function In({count:e,onPublic:t,onPrivate:n,onCopyLinks:a,onDelete:o,onClear:s}){return e?r`<div class="bulkbar" role="toolbar" aria-label="Bulk actions">
    <b>${e} selected</b>
    <button class="btn" onClick=${t}>Make public</button>
    <button class="btn" onClick=${n}>Make private</button>
    <button class="btn" onClick=${a}>Copy links</button>
    <button class="btn btn-danger" onClick=${o}>Delete</button>
    <button class="btn bulk-x" aria-label="Clear selection" onClick=${s}>✕</button>
  </div>`:null}function le({open:e,title:t,body:n,confirmLabel:a="Confirm",onConfirm:o,onCancel:s,danger:i=!1,confirmDisabled:c=!1}){let p=F(null),u=F(null);return C(()=>{let d=p.current;d&&(e&&!d.open?(d.showModal(),u.current?.focus()):!e&&d.open&&d.close())},[e]),r`<dialog ref=${p} class="confirm-dialog" aria-labelledby="confirm-dialog-title"
    onCancel=${d=>{d.preventDefault(),s?.()}}
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
  </dialog>`}var Nn="clipline.libraryView",ja=[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["updated_at_desc","Updated newest"],["updated_at_asc","Updated oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["size_desc","Size largest"],["size_asc","Size smallest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]],Qe={title:["title_asc","title_desc"],size:["size_asc","size_desc"],duration:["duration_asc","duration_desc"],uploaded:["uploaded_at_asc","uploaded_at_desc"]},Za=["visibility","status","source_type","from","to","min_duration_seconds","max_duration_seconds","min_size_mib","max_size_mib"],nt={sort:"uploaded_at_desc",game:"",source_type:"",visibility:"",status:"",q:"",from:"",to:"",min_duration_seconds:"",max_duration_seconds:"",min_size_mib:"",max_size_mib:""};function et(e){if(e===""||e==null)return null;let t=Number(e);return Number.isFinite(t)?t:null}function Ja(e){let t=new URLSearchParams;t.set("sort",e.sort||nt.sort),t.set("page_size","100");for(let i of["game","source_type","visibility","status","q"])e[i]&&t.set(i,e[i]);e.from&&t.set("from",`${e.from}T00:00:00Z`),e.to&&t.set("to",`${e.to}T23:59:59Z`);let n=et(e.min_duration_seconds);n!=null&&t.set("min_duration_ms",String(Math.round(n*1e3)));let a=et(e.max_duration_seconds);a!=null&&t.set("max_duration_ms",String(Math.round(a*1e3)));let o=et(e.min_size_mib);o!=null&&t.set("min_size_bytes",String(Math.round(o*1024*1024)));let s=et(e.max_size_mib);return s!=null&&t.set("max_size_bytes",String(Math.round(s*1024*1024))),t}function Ya(e){return Za.reduce((t,n)=>t+(e[n]?1:0),0)}function Xa(e,t=6){let n=new Map;for(let a of e){let o=a.game_name;o&&n.set(o,(n.get(o)||0)+1)}return Array.from(n,([a,o])=>({game:a,count:o})).sort((a,o)=>o.count-a.count||a.game.localeCompare(o.game)).slice(0,t)}function Ln(e,t,{verb:n,allFailedMessage:a}){let o=e.filter(i=>!t.some(c=>c.id===i));if(!t.length)return{succeeded:o,message:null};let s=t.length===e.length?t[0]?.message||a:`Couldn't ${n} ${t.length} of ${e.length} clips.`;return{succeeded:o,message:s}}async function An(e,t,n){let a=0;async function o(){let s=a++;if(!(s>=e.length))return await n(e[s]),o()}await Promise.all(Array.from({length:Math.min(t,e.length)},o))}function Qa(){try{return localStorage.getItem(Nn)==="rows"?"rows":"grid"}catch{return"grid"}}function zn(){let[e,t]=f(Qa),[n,a]=f(nt),[o,s]=f(nt.q),[i,c]=f(null),[p,u]=f(null),[d,h]=f(new Set),[l,m]=f(!1),[b,g]=f(0),w=F(null);C(()=>()=>clearTimeout(w.current),[]),C(()=>{let $=!0;return c(null),u(null),k(`/api/v1/clips?${Ja(n)}`).then(M=>{$&&(c(M),h(new Set))}).catch(M=>$&&u(M)),()=>{$=!1}},[JSON.stringify(n),b]);let x=$=>{t($);try{localStorage.setItem(Nn,$)}catch{}},y=()=>g($=>$+1),E=$=>{let M=$.target.value;s(M),clearTimeout(w.current),w.current=setTimeout(()=>{a(I=>({...I,q:M}))},300)},U=$=>M=>{let I=M.target.value;a(L=>({...L,[$]:I}))},K=()=>{a($=>({...$,visibility:"",status:"",source_type:"",from:"",to:"",min_duration_seconds:"",max_duration_seconds:"",min_size_mib:"",max_size_mib:""}))},Y=$=>a(M=>({...M,game:M.game===$?"":$})),oe=$=>a(M=>({...M,sort:$})),ne=$=>{h(M=>{let I=new Set(M);return I.has($)?I.delete($):I.add($),I})};function J($,M){c(I=>I&&{...I,clips:I.clips.map(L=>L.id===$?{...L,...M}:L)})}function z($,M){let I=new Set($);c(L=>L&&{...L,clips:L.clips.map(v=>I.has(v.id)?{...v,...M}:v)})}async function se($){let M=Array.from(d);if(!M.length)return;let I=i?.clips||[],L=new Map(M.map(W=>[W,I.find(te=>te.id===W)]));z(M,{visibility:$});let v=[],P=new Map;await An(M,4,async W=>{try{let te=await k(`/api/v1/clips/${encodeURIComponent(W)}/visibility`,{method:"POST",body:{visibility:$}}),Ee={visibility:te.visibility,public_url:te.public_url};J(W,Ee),P.set(W,Ee)}catch(te){v.push({id:W,message:te.message})}});let{succeeded:D,message:G}=Ln(M,v,{verb:"update",allFailedMessage:"Couldn't update visibility."});if(G){for(let{id:W}of v){let te=L.get(W);te&&J(W,{visibility:te.visibility,public_url:te.public_url})}S(G)}D.length&&(h(new Set),S(`Made ${D.length} clip${D.length===1?"":"s"} ${$}`,{actionLabel:"Undo",onAction:()=>xe(D,L,P)}))}async function xe($,M,I){for(let P of $){let D=M.get(P);D&&J(P,{visibility:D.visibility,public_url:D.public_url})}let L=[];await An($,4,async P=>{let D=M.get(P);if(D)try{let G=await k(`/api/v1/clips/${encodeURIComponent(P)}/visibility`,{method:"POST",body:{visibility:D.visibility}});J(P,{visibility:G.visibility,public_url:G.public_url})}catch(G){L.push({id:P,message:G.message})}});let{message:v}=Ln($,L,{verb:"undo",allFailedMessage:"Couldn't undo visibility change."});if(v){for(let{id:P}of L){let D=I.get(P);D&&J(P,D)}S(v)}}async function ce(){let $=Array.from(d),M=i?.clips||[],I=$.map(P=>M.find(D=>D.id===P)).filter(Boolean),L=I.filter(P=>P.public_url),v=I.length-L.length;if(!L.length){S("No links to copy \u2014 selected clips are private.");return}try{await navigator.clipboard.writeText(L.map(P=>P.public_url).join(`
`)),S(`Copied ${L.length} link${L.length===1?"":"s"}`+(v?` (${v} skipped, private)`:""))}catch{S("Couldn't copy links to clipboard.")}}async function ue(){let $=Array.from(d);m(!1);try{let M=await k("/api/v1/clips/bulk-delete",{method:"POST",body:{ids:$}});h(new Set),y(),S(`Deleted ${M.affected} clip${M.affected===1?"":"s"}.`)}catch(M){S(M.message)}}if(p)return r`<main class="page">
      <${Z} name="alert" title="Couldn't load your library" body=${p.message} />
    </main>`;let ae=i?.clips,fe=Ya(n),de=!!(n.q||n.game)||fe>0,ie=Xa(ae||[]),pe=(ae||[]).reduce(($,M)=>$+(M.file_size_bytes||0),0),_e=r`<div class="popover-fields">
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
        <p>${(ae||[]).length} clip${(ae||[]).length===1?"":"s"} · ${q(pe)} used</p>
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
        value=${o} onInput=${E} />
      <select class="input" aria-label="Sort" value=${n.sort} onChange=${$=>oe($.target.value)}>
        ${ja.map(([$,M])=>r`<option value=${$}>${M}</option>`)}
      </select>
      <${Un}
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
        onClick=${()=>Y("")}>All</button>
      ${ie.map($=>r`<button type="button" class=${`chip ${n.game===$.game?"chip-on":""}`}
        aria-pressed=${n.game===$.game} onClick=${()=>Y($.game)}>${$.game}</button>`)}
    </div>`}

    ${ae==null?r`<${ts} />`:ae.length===0?de?r`<${Z} name="film" title="No clips match this view"
            body="Try a different search, game, or clear your filters."
            action=${r`<button type="button" class="btn" onClick=${()=>{a(nt),s("")}}>Clear filters</button>`} />`:r`<${Z} name="upload" title="Connect the Clipline desktop app to start uploading"
            body="New clips uploaded from the desktop app will show up here."
            action=${r`<a class="btn" href="/about">Learn more</a>`} />`:e==="grid"?r`<div class=${`card-grid ${d.size>0?"selecting":""}`}>
          ${ae.map($=>r`<${we} key=${$.id}
            clip=${{...$,thumbnail_url:Me($),media_url:Je($)}}
            href=${`/clip/${encodeURIComponent($.id)}`}
            selectable selected=${d.has($.id)} onToggleSelect=${ne} showVisibility />`)}
        </div>`:r`<${es} clips=${ae} query=${n} onSort=${oe} />`}

    <${In} count=${d.size}
      onPublic=${()=>se("public")}
      onPrivate=${()=>se("private")}
      onCopyLinks=${ce}
      onDelete=${()=>m(!0)}
      onClear=${()=>h(new Set)} />

    <${le} open=${l}
      title=${`Delete ${d.size} clip${d.size===1?"":"s"}?`}
      body="Public links stop working immediately."
      confirmLabel="Delete" danger
      onConfirm=${ue}
      onCancel=${()=>m(!1)} />
  </main>`}function tt(e,[t,n]){let a=e.sort===t?"ascending":e.sort===n?"descending":"none",o=e.sort===n?t:n;return{ariaSort:a,next:o}}function es({clips:e,query:t,onSort:n}){let a=tt(t,Qe.title),o=tt(t,Qe.size),s=tt(t,Qe.duration),i=tt(t,Qe.uploaded);return r`<table class="lib-table">
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
        <td><img class="row-thumb" src=${Me(c)} alt="" width="64" height="36" loading="lazy" /></td>
        <td><a href=${`/clip/${encodeURIComponent(c.id)}`}>${c.title}</a></td>
        <td>${c.game_name||"\u2014"}</td>
        <td><span class=${`badge badge-${c.visibility}`}>${c.visibility}</span></td>
        <td>${q(c.file_size_bytes)}</td>
        <td>${ve(c.duration_ms)}</td>
        <td>${j(c.uploaded_at)}</td>
      </tr>`)}
    </tbody>
  </table>`}function ts({count:e=8}){return r`<div class="card-grid">
    ${Array.from({length:e},(t,n)=>r`<div class="clip-card" key=${n}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`}X();var ns={ChampionKill:"kill",FirstBlood:"kill",Multikill:"spree",Ace:"spree",DragonKill:"objective",HeraldKill:"objective",BaronKill:"objective",TurretKilled:"structure",InhibKilled:"structure",FirstBrick:"structure"};function Bn(e){let t=Number(e);return Number.isFinite(t)&&t>0?t/1e3:0}function On(e,t){let n=Number.isFinite(e)?e:0,a=t>0?t:Number.MAX_SAFE_INTEGER;return Math.max(0,Math.min(a,n))}function at(e,t){return t>0?Math.max(0,Math.min(100,e/t*100)):0}function xt(e){if(!Number.isFinite(e))return"0:00";let t=Math.max(0,Math.round(e)),n=Math.floor(t/60),a=t-n*60;return`${n}:${String(a).padStart(2,"0")}`}function Fn(e){if(!Number.isFinite(e))return"0:00.0";let t=Math.max(0,Math.round(e*10)),n=Math.floor(t/600),a=t-n*600,o=Math.floor(a/10);return`${n}:${String(o).padStart(2,"0")}.${a%10}`}function Vn(e,t){return`${Fn(e)} / ${t>0?Fn(t):"0:00.0"}`}function as(e){return ns[e]||"info"}function Hn(e,t){return(e||[]).map((n,a)=>{let o=Number(n.timestamp_ms);if(!Number.isFinite(o))return null;let s=o/1e3;return s<0||t>0&&s>t?null:{index:a,time:s,kind:String(n.kind||"Marker"),label:String(n.label||n.kind||"Marker"),category:as(n.kind)}}).filter(Boolean).sort((n,a)=>n.time-a.time)}function qn(e,t){if(!e.length)return null;for(let n of e)if(n.time>t+.05)return n;return e[0]}function Kn(e,t){if(!e.length)return null;for(let n=e.length-1;n>=0;n-=1)if(e[n].time<t-.05)return e[n];return e[e.length-1]}function Gn(e,t){switch(e){case"Space":case"KeyK":return{kind:"toggle-play"};case"ArrowLeft":return{kind:"seek-by",seconds:t?-1:-5};case"ArrowRight":return{kind:"seek-by",seconds:t?1:5};case"KeyJ":return{kind:"seek-by",seconds:-10};case"KeyL":return{kind:"seek-by",seconds:10};case"Comma":return{kind:"seek-by",seconds:-.1};case"Period":return{kind:"seek-by",seconds:.1};case"KeyM":return{kind:t?"previous-marker":"next-marker"};case"Home":return{kind:"seek-to",seconds:0};case"End":return{kind:"seek-to-end"};case"KeyF":return{kind:"fullscreen"};case"KeyT":return{kind:"theater"};default:return null}}var jn="clipline.playerVolume",Zn="clipline.clipTheaterMode",ss=2e3,os=[.25,.5,.75,1,1.25,1.5,2];function rs(e,t){switch(e){case"KeyM":return{kind:"toggle-mute"};case"KeyF":return{kind:"theater"};case"Escape":return{kind:"exit-theater"};default:return Gn(e,t)}}function is(e){return e instanceof Element?!!e.closest("input, textarea, select, button, a, [contenteditable='true'], [contenteditable='']"):!1}function ls(){try{let e=window.localStorage.getItem(jn);if(e==null)return 1;let t=Number(e);return Number.isFinite(t)?Math.max(0,Math.min(1,t)):1}catch{return 1}}function Wn(e){try{window.localStorage.setItem(jn,String(Math.max(0,Math.min(1,e))))}catch{}}function cs(){try{return window.localStorage.getItem(Zn)==="true"}catch{return!1}}function us(e){try{window.localStorage.setItem(Zn,String(e))}catch{}}function Jn({src:e,poster:t,durationMs:n,markers:a}){let o=F(null),s=F(null),i=F(null),c=F(!1),p=F(!1),u=Bn(n),[d,h]=f(!1),[l,m]=f(0),[b,g]=f(u),[w,x]=f(0),[y,E]=f(ls),[U,K]=f(!1),[Y,oe]=f(1),[ne,J]=f(!1),[z,se]=f(cs),[xe,ce]=f(!0),[ue,ae]=f(null),[fe,de]=f(""),ie=Hn(a,b);function pe(){ce(!0),window.clearTimeout(i.current),i.current=window.setTimeout(()=>{let _=o.current;_&&!_.paused&&!_.ended&&ce(!1)},ss)}C(()=>{d||(window.clearTimeout(i.current),ce(!0))},[d]),C(()=>{let _=o.current;if(!_)return;let R=()=>Number.isFinite(_.duration)&&_.duration>0?_.duration:u,B=()=>g(R()),Mt=()=>g(R()),Pt=()=>{c.current||m(_.currentTime||0)},Et=()=>{let At=R();if(!(At>0)||!_.buffered?.length){x(0);return}let Nt=_.currentTime||0,De=0;for(let Re=0;Re<_.buffered.length;Re+=1){let ga=_.buffered.start(Re),lt=_.buffered.end(Re);if(Nt>=ga&&Nt<=lt){De=lt;break}De=Math.max(De,lt)}x(at(De,At))},Dt=()=>{h(!0),de(""),pe()},Rt=()=>h(!1),Ut=()=>h(!1),It=()=>{E(_.volume),K(_.muted||_.volume===0)},Lt=()=>de("Playback unavailable");return _.addEventListener("loadedmetadata",B),_.addEventListener("durationchange",Mt),_.addEventListener("timeupdate",Pt),_.addEventListener("progress",Et),_.addEventListener("play",Dt),_.addEventListener("pause",Rt),_.addEventListener("ended",Ut),_.addEventListener("volumechange",It),_.addEventListener("error",Lt),()=>{_.removeEventListener("loadedmetadata",B),_.removeEventListener("durationchange",Mt),_.removeEventListener("timeupdate",Pt),_.removeEventListener("progress",Et),_.removeEventListener("play",Dt),_.removeEventListener("pause",Rt),_.removeEventListener("ended",Ut),_.removeEventListener("volumechange",It),_.removeEventListener("error",Lt)}},[e,u]),C(()=>{o.current&&(o.current.volume=y)},[y]),C(()=>{o.current&&(o.current.muted=U)},[U]),C(()=>{o.current&&(o.current.playbackRate=Y)},[Y]),C(()=>{if(document.documentElement.classList.toggle("clipline-theater",z),z){let _=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=_}}},[z]),C(()=>()=>document.documentElement.classList.remove("clipline-theater"),[]);function _e(_){se(_),us(_)}function $(_){let R=o.current;if(!R)return;let B=b>0?On(_,b):Math.max(0,_);R.currentTime=B,m(B)}function M(_){$((o.current?.currentTime||0)+_)}async function I(){let _=o.current;if(_)if(_.paused||_.ended)try{await _.play()}catch(R){de(R?.message||"Playback failed")}else _.pause()}function L(){let _=o.current;_&&(_.muted||_.volume===0?(_.muted=!1,_.volume===0&&(_.volume=1,E(1),Wn(1)),K(!1)):(_.muted=!0,K(!0)))}function v(_){let R=Number(_.target.value);E(R),K(R===0),Wn(R);let B=o.current;B&&(B.volume=R,B.muted=R===0)}async function P(){try{document.fullscreenElement?await document.exitFullscreen():await s.current?.requestFullscreen?.()}catch(_){de(_?.message||"Fullscreen unavailable")}}function D(_){let R=o.current?.currentTime||0,B=_>0?qn(ie,R):Kn(ie,R);B&&$(B.time)}function G(){c.current=!0,p.current=d,d&&o.current?.pause()}function W(_){let R=Number(_.target.value);m(R),$(R)}function te(){c.current&&(c.current=!1,p.current&&(p.current=!1,o.current?.play().catch(()=>{})))}function Ee(_){let R=_.currentTarget.getBoundingClientRect();if(!(R.width>0))return;let B=Math.max(0,Math.min(1,(_.clientX-R.left)/R.width));ae({pct:B*100,time:B*(b||0)})}function $a(){ae(null)}return C(()=>{function _(R){if(R.defaultPrevented||is(R.target))return;let B=rs(R.code,R.shiftKey);if(B&&!(B.kind==="exit-theater"&&!z))switch(R.preventDefault(),pe(),B.kind){case"toggle-play":I();break;case"seek-by":M(B.seconds);break;case"seek-to":$(B.seconds);break;case"seek-to-end":$(b);break;case"next-marker":D(1);break;case"previous-marker":D(-1);break;case"toggle-mute":L();break;case"theater":_e(!z);break;case"exit-theater":_e(!1);break;case"fullscreen":P();break;default:break}}return document.addEventListener("keydown",_),()=>document.removeEventListener("keydown",_)},[b,z,d]),r`<div class=${`player ${xe?"":"chrome-hidden"}`} ref=${s}
      onPointerMove=${pe} onPointerEnter=${pe}
      onPointerLeave=${()=>{let _=o.current;_&&!_.paused&&ce(!1)}}
      onFocusIn=${()=>ce(!0)}>
    <video ref=${o} class="player-video" src=${e} poster=${t||void 0}
      preload="metadata" playsinline onClick=${I}></video>
    ${fe&&r`<div class="player-note">${fe}</div>`}
    <div class="player-overlay">
      <div class="player-timeline" onPointerMove=${Ee} onPointerLeave=${$a}>
        <div class="player-buffered" style=${`width:${w}%`}></div>
        <div class="player-progress" style=${`width:${at(l,b)}%`}></div>
        ${ie.map(_=>r`<span class="player-marker-tick" key=${_.index}
            style=${`left:${at(_.time,b)}%`} title=${`${_.label} @ ${xt(_.time)}`}></span>`)}
        <input class="player-scrubber" type="range" min="0" max=${b>0?b:0} step="0.01"
          value=${l} disabled=${!(b>0)} aria-label="Seek"
          onPointerDown=${G} onInput=${W} onChange=${te}
          onPointerUp=${te} onPointerCancel=${te} onLostPointerCapture=${te} />
        ${ue&&r`<div class="player-hover-time" style=${`left:${ue.pct}%`}>${xt(ue.time)}</div>`}
      </div>
      <div class="player-controls">
        ${ie.length>0&&r`<div class="player-cluster">
          <button type="button" class="player-btn" title="Previous marker" aria-label="Previous marker"
            onClick=${()=>D(-1)}>${T("skipBack",{size:14})}</button>
          <button type="button" class="player-btn" title="Next marker" aria-label="Next marker"
            onClick=${()=>D(1)}>${T("skipForward",{size:14})}</button>
        </div>`}
        <button type="button" class="player-btn player-play" aria-label=${d?"Pause":"Play"} onClick=${I}>
          ${T(d?"pause":"play",{size:16})}
        </button>
        <span class="player-time">${Vn(l,b)}</span>
        <div class="player-spacer"></div>
        <div class="player-speed-wrap">
          <button type="button" class="player-btn player-speed" aria-haspopup="menu" aria-expanded=${ne}
            onClick=${()=>J(_=>!_)}>${Y}×</button>
          ${ne&&r`<div class="player-speed-menu" role="menu">
            ${os.map(_=>r`<button type="button" role="menuitem" key=${_}
                class=${`player-speed-item ${_===Y?"is-active":""}`}
                onClick=${()=>{oe(_),J(!1)}}>${_}×</button>`)}
          </div>`}
        </div>
        <button type="button" class="player-btn" aria-label=${U?"Unmute":"Mute"} onClick=${L}>
          ${T(U?"volumeX":"volume2",{size:14})}
        </button>
        <input class="player-volume" type="range" min="0" max="1" step="0.01" value=${U?0:y}
          aria-label="Volume" onInput=${v} />
        <button type="button" class="player-btn" aria-label=${z?"Exit theater mode":"Theater mode"}
          aria-pressed=${z} onClick=${()=>_e(!z)}>${T("theater",{size:14})}</button>
        <button type="button" class="player-btn" aria-label="Fullscreen" onClick=${P}>
          ${T("fullscreen",{size:14})}
        </button>
      </div>
    </div>
  </div>`}X();function ds(e){let t=new Map(e.map(s=>[s.id,s])),n=new Map,a=[],o=0;return e.forEach(s=>{let i=s.parent_comment_id||"";i&&t.has(i)?(n.has(i)||n.set(i,[]),n.get(i).push(s),o+=1):i||(a.push(s),o+=1)}),{roots:a,repliesByParent:n,count:o}}function ps(e){return(e||"?").trim().slice(0,1).toUpperCase()||"?"}function ms(e){let t=e.author_avatar_url;return typeof t=="string"&&t.startsWith("/")?r`<img class="comment-avatar" src=${t} alt="" />`:r`<div class="comment-avatar">${ps(e.author_name)}</div>`}function Yn({shareId:e}){let{user:t}=H(A),[n,a]=f(null),[o,s]=f(""),[i,c]=f(null),[p,u]=f(""),[d,h]=f(null);function l(){k(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`).then(y=>a(y.comments||[])).catch(()=>a([]))}C(()=>{let y=!0;return a(null),k(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`).then(E=>y&&a(E.comments||[])).catch(()=>y&&a([])),()=>{y=!1}},[e]);async function m(y,E){let U=y.trim();if(U)try{await k(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`,{method:"POST",body:E?{body:U,parent_comment_id:E}:{body:U}}),l()}catch(K){S(K.message)}}async function b(y){y.preventDefault(),await m(o),s("")}async function g(y,E){y.preventDefault(),await m(p,E),u(""),c(null)}async function w(){let y=d;h(null);try{await k(`/api/v1/public/clips/${encodeURIComponent(e)}/comments/${encodeURIComponent(y)}`,{method:"DELETE"}),l()}catch(E){S(E.message)}}let x=ds(n||[]);return r`<section class="comments">
    <div class="comments-header"><h2>Comments</h2><span class="muted">${x.count}</span></div>
    ${t?r`<form class="comment-form" onSubmit=${b}>
          <textarea rows="3" maxlength="2000" placeholder="Add a comment" value=${o}
            onInput=${y=>s(y.target.value)}></textarea>
          <div class="comment-form-actions">
            <button type="submit" class="btn btn-primary">${T("message",{size:14})} Post comment</button>
          </div>
        </form>`:r`<p class="comment-signin"><a href="/login">Sign in</a> to comment.</p>`}
    ${n==null?"":x.count===0?r`<p class="comment-signin">No comments yet.</p>`:r`<div class="comment-list">
          ${x.roots.map(y=>Xn(y,{depth:0,repliesByParent:x.repliesByParent,user:t,replyOpenId:i,setReplyOpenId:c,replyDraft:p,setReplyDraft:u,submitReply:g,onDelete:h}))}
        </div>`}
    <${le} open=${d!=null} title="Delete this comment?"
      body="This removes the comment from the public clip page." confirmLabel="Delete" danger
      onConfirm=${w} onCancel=${()=>h(null)} />
  </section>`}function Xn(e,t){let{depth:n,repliesByParent:a,user:o,replyOpenId:s,setReplyOpenId:i,replyDraft:c,setReplyDraft:p,submitReply:u,onDelete:d}=t,h=a.get(e.id)||[];return r`<article class="comment" key=${e.id}>
    ${ms(e)}
    <div class="comment-body">
      <div class="comment-head">
        ${e.author_username?r`<a href=${`/u/${encodeURIComponent(e.author_username)}`}>${e.author_name}</a>`:r`<strong>${e.author_name}</strong>`}
        ${e.is_uploader&&r`<span class="comment-badge">Uploader</span>`}
        <span>${Ze(e.created_at)}</span>
        <div class="comment-actions">
          ${o&&n===0&&r`<button type="button" class="comment-action"
            onClick=${()=>i(s===e.id?null:e.id)}>
            ${T("message",{size:12})} Reply</button>`}
          ${e.viewer_can_delete&&r`<button type="button" class="comment-delete" aria-label="Delete comment"
            title="Delete comment" onClick=${()=>d(e.id)}>${T("trash",{size:12})}</button>`}
        </div>
      </div>
      <p class="comment-text">${e.body}</p>
      ${o&&n===0&&s===e.id&&r`<form class="comment-reply-form"
        onSubmit=${l=>u(l,e.id)}>
        <textarea rows="2" maxlength="2000" placeholder="Write a reply" value=${c}
          onInput=${l=>p(l.target.value)}></textarea>
        <div class="comment-form-actions">
          <button type="submit" class="btn btn-primary">${T("message",{size:14})} Post reply</button>
        </div>
      </form>`}
      ${h.length>0&&r`<div class="comment-replies">
        ${h.map(l=>Xn(l,{...t,depth:n+1}))}
      </div>`}
    </div>
  </article>`}var fs=["private","public","unlisted"];function _s(e,t){return e==="clip"?!0:!!t?.viewer_can_edit}function hs(e,t,n){return e==="public"?t.shareId:n?.public_share_id||null}function bs(e,t,n){return e==="clip"?t.clipId:n?.viewer_clip_id||null}function vs(e,t,n){if(e)try{return`${t}${new URL(e).pathname}`}catch{}return n?`${t}/c/${encodeURIComponent(n)}`:null}function $s(e){let t=e?.height!=null?e.height:"",n=Math.round(e?.fps||0)||"";return`${t}p${n}`}function gs(e,t,n=8){return(e||[]).filter(a=>a.share_id!==t).slice(0,n)}function St({route:e}){let{user:t}=H(A),[n,a]=f(null),[o,s]=f(null),[i,c]=f([]),[p,u]=f(!1),[d,h]=f(""),[l,m]=f(!1),[b,g]=f(""),[w,x]=f(!1),[y,E]=f(!1),[U,K]=f(!1),Y=e.name==="clip"?`clip:${e.clipId}`:`public:${e.shareId}`;if(C(()=>{let v=!0;a(null),s(null),u(!1),m(!1),K(!1),x(!1);let P=e.name==="clip"?`/api/v1/clips/${encodeURIComponent(e.clipId)}`:`/api/v1/public/clips/${encodeURIComponent(e.shareId)}`;return k(P).then(D=>{v&&(a(D),e.name==="public"&&k(`/api/v1/public/clips/${encodeURIComponent(e.shareId)}/view`,{method:"POST",body:{}}).then(G=>v&&a(W=>W&&{...W,view_count:G.view_count})).catch(()=>{}))}).catch(D=>v&&s(D)),()=>{v=!1}},[Y]),C(()=>{let v=!0;return k("/api/v1/public/clips").then(P=>v&&c(P.clips||[])).catch(()=>{}),()=>{v=!1}},[Y]),o)return r`<main class="page"><${Z} name="alert" title="Couldn't load this clip" body=${o.message} /></main>`;if(!n)return r`<main class="page watch"><div><div class="skeleton-thumb"></div></div><aside class="upnext"></aside></main>`;let oe=_s(e.name,n),ne=hs(e.name,e,n),J=bs(e.name,e,n),z=e.name==="clip"?Je({id:n.id}):ye({share_id:e.shareId}),se=e.name==="clip"?Me({id:n.id}):re({share_id:e.shareId}),xe=e.name==="clip"?t?.display_name||t?.username||"You":n.author_name||"Unknown creator",ce=n.public_url??n.share_url??null,ue=vs(ce,window.location.origin,ne),ae=e.name==="clip";function fe(){h(n.title),u(!0)}async function de(v){v?.preventDefault?.();let P=d.trim();if(!P||P===n.title){u(!1);return}try{await k(`/api/v1/clips/${encodeURIComponent(J)}`,{method:"PATCH",body:{title:P}}),a(D=>({...D,title:P})),u(!1),S("Title saved.")}catch(D){S(D.message)}}function ie(){g(n.description||""),m(!0)}async function pe(){let v=b.trim();try{await k(`/api/v1/clips/${encodeURIComponent(J)}`,{method:"PATCH",body:{description:v||null}}),a(P=>({...P,description:v||null})),m(!1),S("Description saved.")}catch(P){S(P.message)}}async function _e(v,{force:P=!1}={}){let D=n.visibility;if(!(D===v&&!P)){a(G=>({...G,visibility:v}));try{let G=await k(`/api/v1/clips/${encodeURIComponent(J)}/visibility`,{method:"POST",body:{visibility:v}});a(W=>({...W,visibility:G.visibility,public_url:G.public_url,public_share_id:G.public_share_id})),S(`Visibility set to ${v}.`,{actionLabel:"Undo",onAction:()=>_e(D,{force:!0})})}catch(G){a(W=>({...W,visibility:D})),S(G.message)}}}async function $(){if(ue)try{await navigator.clipboard.writeText(ue),S("Link copied.")}catch{S("Couldn't copy the link.")}}async function M(){E(!1);try{await k(`/api/v1/clips/${encodeURIComponent(J)}`,{method:"DELETE"}),S("Clip deleted."),Q("/library")}catch(v){S(v.message)}}let I=[n.game_name&&r`<a class="chip chip-on" href=${`/game/${encodeURIComponent(n.game_name)}`}>${n.game_name}</a>`,$e(n.view_count),`Recorded ${j(n.recorded_at)}`,`by ${xe}`].filter(Boolean),L=gs(i,ne,8);return r`<main class="page watch">
    <div>
      <${Jn} src=${z} poster=${se} durationMs=${n.duration_ms} markers=${n.markers} />
      <div class="watch-titlerow">
        ${p?r`<input class="input watch-title-input" value=${d} autofocus
              onInput=${v=>h(v.target.value)} onBlur=${de}
              onKeyDown=${v=>{v.key==="Enter"&&de(v),v.key==="Escape"&&u(!1)}} />`:r`<h1>${n.title}
              ${oe&&r`<button type="button" class="edit-pencil" aria-label="Edit title" onClick=${fe}
                >${T("edit",{size:14})}</button>`}</h1>`}
      </div>
      <p class="watch-meta">${I.map((v,P)=>r`${P>0?" \xB7 ":""}${v}`)}</p>

      ${oe&&r`<div class="watch-actions">
        <div class="seg" role="radiogroup" aria-label="Visibility">
          ${fs.map(v=>r`<button type="button" role="radio" key=${v} aria-checked=${n.visibility===v}
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
              onClick=${()=>{x(!1),E(!0)}}>${T("trash",{size:14})} Delete clip</button>
          </div>`}
        </div>
      </div>`}

      <div class="watch-desc">
        ${l?r`<textarea class="input" rows="5" value=${b} autofocus
              onInput=${v=>g(v.target.value)} onBlur=${pe}
              onKeyDown=${v=>{v.key==="Enter"&&(v.ctrlKey||v.metaKey)&&pe(),v.key==="Escape"&&m(!1)}}></textarea>`:n.description?r`<p>${n.description}
              ${oe&&r`<button type="button" class="edit-pencil" aria-label="Edit description" onClick=${ie}
                >${T("edit",{size:12})}</button>`}</p>`:oe?r`<button type="button" class="watch-desc-add" onClick=${ie}>+ Add a description</button>`:""}
      </div>

      ${ae&&r`<button type="button" class="details-strip" aria-expanded=${U}
        onClick=${()=>K(v=>!v)}>
        <span><b>${ve(n.duration_ms)}</b> length</span>
        <span><b>${q(n.file_size_bytes)}</b></span>
        <span><b>${$s(n)}</b></span>
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

      ${ne&&r`<${Yn} shareId=${ne} />`}
    </div>
    <aside class="upnext">
      <h4 class="kicker">Up next</h4>
      ${L.map(v=>r`<a class="upnext-row" key=${v.share_id} href=${`/c/${encodeURIComponent(v.share_id)}`}>
          <img src=${re(v)} alt="" loading="lazy" />
          <span><b>${v.title}</b><small>${v.author_name} · ${v.game_name||"No game"} · ${$e(v.view_count)}</small></span>
        </a>`)}
    </aside>

    <${le} open=${y} title="Delete this clip?" body="Public links stop working immediately."
      confirmLabel="Delete" danger onConfirm=${M} onCancel=${()=>E(!1)} />
  </main>`}X();var Ct=[{top:"4%",left:"4%",width:"34%",rotate:-7},{top:"0%",left:"44%",width:"30%",rotate:5},{top:"34%",left:"68%",width:"28%",rotate:-4},{top:"50%",left:"8%",width:"30%",rotate:6},{top:"62%",left:"42%",width:"26%",rotate:-5},{top:"26%",left:"-4%",width:"22%",rotate:9}];function ys(e){return Array.isArray(e)?e.slice(0,Ct.length).map((t,n)=>({clip:t,...Ct[n]})):[]}function ws(e){let t=e?.clips;if(!Array.isArray(t)||t.length===0)return null;let n=t.length,a=e.has_more?"+":"";return`${n}${a} clip${n===1?"":"s"} on this instance`}function ks({top:e,left:t,width:n,rotate:a}){return`top:${e};left:${t};width:${n};transform:rotate(${a}deg);`}function Qn(e){let t=String(e||"").trim();return t||null}function xs(){let[e,t]=f(null);C(()=>{let o=!0;return k(`/api/v1/public/clips?page_size=${Ct.length}`).then(s=>o&&t(s)).catch(()=>o&&t(null)),()=>{o=!1}},[]);let n=ys(e?.clips),a=ws(e);return r`<aside class="login-montage" aria-hidden="true">
    ${n.length>0&&r`<div class="login-montage-tiles">
      ${n.map((o,s)=>r`<img key=${s} class="login-montage-tile" style=${ks(o)}
        src=${re(o.clip)} alt="" loading="lazy" />`)}
    </div>`}
    <div class="login-montage-copy">
      <h2>Your clips. Your server.</h2>
      ${a&&r`<p>${a}</p>`}
    </div>
  </aside>`}function ke({titleId:e,children:t}){return r`<div class="login-page">
    <${xs} />
    <section class="login-panel" aria-labelledby=${e}>
      <div class="login-brand" aria-hidden="true">
        <img src="/clipline-icon.svg" alt="" width="32" height="32" />
        <span class="login-brand-word">CLIP<b>LINE</b></span>
        <span class="login-brand-descriptor">CLOUD</span>
      </div>
      ${t}
    </section>
  </div>`}function ea(){let{user:e}=H(A),[t,n]=f(""),[a,o]=f(""),[s,i]=f(""),[c,p]=f(!1);if(C(()=>{e&&Q("/library")},[e]),e)return null;async function u(d){if(d.preventDefault(),!c){p(!0),i("");try{let h=await k("/api/v1/auth/login",{method:"POST",body:{username:t,password:a}});Ce(h.csrf_token),A.set({user:h.user,csrfToken:h.csrf_token,ready:!0}),Q("/library")}catch(h){i(h instanceof be?h.message:"Sign in failed"),p(!1)}}}return r`<${ke} titleId="login-title">
    <h1 id="login-title">Sign in</h1>
    ${s&&r`<p class="form-error" role="alert">${s}</p>`}
    <form class="login-form" onSubmit=${u}>
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
      <button class="btn btn-primary" type="submit" disabled=${c}>${c?"Signing in\u2026":"Sign in"}</button>
    </form>
    <p class="login-hint">Accounts are created by this server's admin.</p>
  </${ke}>`}function ta({route:e}){let t=!!e.invite,[n,a]=f(()=>t?"preflight":e.token?"form":"missing-token"),[o,s]=f(""),[i,c]=f(t?null:e.token),[p,u]=f(""),[d,h]=f(!1),l=t;C(()=>{if(!t)return;if(!e.token){a("missing-token");return}let w=!0;return a("preflight"),k("/api/v1/invites/claim",{method:"POST",body:{invite_token:e.token}}).then(x=>{w&&(c(x.reset_token),a("form"))}).catch(x=>{w&&(s(x instanceof be?x.message:"This invite link is invalid, used, or expired."),a("invalid"))}),()=>{w=!1}},[t,e.token]);async function m(w){if(w.preventDefault(),d)return;h(!0),u("");let x=new FormData(w.currentTarget),y={reset_token:i,new_password:String(x.get("new_password")||"")};l&&(y.username=String(x.get("username")||""),y.display_name=Qn(x.get("display_name")),y.email=Qn(x.get("email")));try{await k("/api/v1/auth/reset-password",{method:"POST",body:y}),S(l?"Account created. Sign in with your new password.":"Password set. Sign in with your new password."),Q("/login")}catch(E){u(E instanceof be?E.message:"Request failed"),h(!1)}}if(t&&n!=="form"){let w=n==="missing-token"||n==="invalid",x=n==="missing-token"?"This invite link is missing a token.":n==="invalid"?o:"Opening invite\u2026";return r`<${ke} titleId="invite-title">
      <h1 id="invite-title">Create account</h1>
      <p class="login-copy">${w?"This invite cannot be used.":"Preparing your account setup."}</p>
      ${w?r`<p class="form-error" role="alert">${x}</p>`:r`<p class="login-status">${x}</p>`}
    </${ke}>`}return r`<${ke} titleId="reset-title">
    <h1 id="reset-title">${l?"Create account":"Set password"}</h1>
    <p class="login-copy">${l?"Choose your Clipline Cloud account details.":"Choose a new password for your Clipline Cloud account."}</p>
    ${n==="missing-token"?r`<p class="form-error" role="alert">This reset link is missing a token.</p>`:r`
        ${p&&r`<p class="form-error" role="alert">${p}</p>`}
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
          <button class="btn btn-primary" type="submit" disabled=${d}>
            ${l?"Create account":"Set password"}
          </button>
        </form>
      `}
    ${!l&&r`<a class="btn" href="/login">Sign in</a>`}
  </${ke}>`}X();function Pe({label:e,value:t,sub:n,meter:a,tone:o}){let s=o?` stat-${o}`:"";return r`<div class="stat-card">
    <p class="stat-label">${e}</p>
    <p class=${`stat-value${s}`}>${t}</p>
    ${n!=null&&r`<p class="stat-sub">${n}</p>`}
    ${a!=null&&r`<div class="stat-meter${s}">
      <span style=${`width:${Math.max(0,Math.min(1,a))*100}%`}></span>
    </div>`}
  </div>`}function Ss(e){let t=Number(e?.global_storage_warning_threshold_bytes||0);if(!t)return null;let n=Number(e?.total_storage_bytes||0);return Math.max(0,Math.min(1,n/t))}function Cs(e){if(!e?.global_storage_warning_threshold_bytes)return"Disabled";let t=q(e.global_storage_warning_threshold_bytes);return e.global_storage_warning?`At or above ${t}`:`Below ${t}`}function Ts({deadJobs:e=[],failedUploads:t=[]}={}){let n=e.length+t.length;return{failedCount:n,healthy:n===0}}function ee(e,t){return r`<div><dt>${e}</dt><dd>${t??"Unknown"}</dd></div>`}function na({overview:e,deadJobs:t,failedUploads:n}){let a=Ss(e),{failedCount:o,healthy:s}=Ts({deadJobs:t,failedUploads:n}),i=e.global_storage_warning_threshold_bytes;return r`<div>
    <div class="stat-grid">
      <${Pe} label="Clips" value=${String(e.total_clips)} />
      <${Pe} label="Storage" value=${q(e.total_storage_bytes)}
        sub=${i?`${q(i)} warning threshold`:null}
        meter=${a} tone=${e.global_storage_warning?"danger":void 0} />
      <${Pe} label="Users" value=${String(e.total_users)} />
      <${Pe} label="Jobs" value=${s?"All healthy":String(o)}
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
        ${ee("Storage warning",Cs(e))}
        ${ee("Upload TTL",`${e.upload_session_ttl_seconds}s`)}
        ${ee("Direct S3 uploads",e.direct_s3_uploads?"Enabled":"Disabled")}
        ${ee("Public media",`${e.public_media_mode}, ${e.public_read_url_ttl_seconds}s TTL`)}
      </dl>
    </div>
  </div>`}X();function st(e){let t=String(e||"").trim();return t||null}function Ms(e){let t=Number(String(e||"").trim());if(!Number.isFinite(t)||t<0)throw new Error("Storage quota must be a non-negative number");return Math.round(t*1024*1024*1024)}function Ps(e,t){return!(e.is_disabled||t?.id===e.id||e.role==="owner"||e.role==="admin"&&t?.role!=="owner")}function aa(e){return e?[["user","User"],["admin","Admin"]]:[["user","User"]]}function Es({isOwner:e,onCreated:t}){let[n,a]=f(!1);async function o(s){if(s.preventDefault(),n)return;a(!0);let i=s.currentTarget,c=new FormData(i);try{await k("/api/v1/users",{method:"POST",body:{username:String(c.get("username")||""),display_name:st(c.get("display_name")),email:st(c.get("email")),password:st(c.get("password")),role:String(c.get("role")||"user")}}),S("User created."),i.reset(),t()}catch(p){S(p.message)}finally{a(!1)}}return r`<form class="panel section" onSubmit=${o}>
    <h2>Create user</h2>
    <label class="field"><span>Username</span><input class="input" name="username" required /></label>
    <label class="field"><span>Display name</span><input class="input" name="display_name" placeholder="Optional" /></label>
    <label class="field"><span>Email</span><input class="input" name="email" type="email" placeholder="Optional" /></label>
    <label class="field"><span>Password</span><input class="input" name="password" type="password" required /></label>
    <label class="field"><span>Role</span>
      <select class="input" name="role">
        ${aa(e).map(([s,i])=>r`<option value=${s}>${i}</option>`)}
      </select>
    </label>
    <button class="btn btn-primary" type="submit" disabled=${n}>${T("plus",{size:14})} Create user</button>
  </form>`}function Ds({isOwner:e,smtpEnabled:t,onCreated:n}){let[a,o]=f(!1);async function s(i){if(i.preventDefault(),a)return;o(!0);let c=new FormData(i.currentTarget),p=i.submitter?.value==="email"?"email":"link";try{let u=await k("/api/v1/invites",{method:"POST",body:{role:String(c.get("role")||"user"),email:st(c.get("email")),send_email:p==="email"}});S(p==="email"?"Invite sent.":"Invite link created."),n({...u,kind:"invite"})}catch(u){S(u.message)}finally{o(!1)}}return r`<form class="panel section" onSubmit=${s}>
    <h2>Invite link</h2>
    <label class="field"><span>Role</span>
      <select class="input" name="role">
        ${aa(e).map(([i,c])=>r`<option value=${i}>${c}</option>`)}
      </select>
    </label>
    <label class="field"><span>Email</span>
      <input class="input" name="email" type="email" placeholder=${t?"Optional":"SMTP disabled"} disabled=${!t} />
    </label>
    <div class="actions">
      <button class="btn" type="submit" name="intent" value="link" disabled=${a}>${T("copy",{size:14})} Generate link</button>
      ${t&&r`<button class="btn btn-primary" type="submit" name="intent" value="email" disabled=${a}>${T("message",{size:14})} Send email</button>`}
    </div>
  </form>`}function Rs({resetLink:e}){if(!e)return null;let t=e.kind==="invite"?"Invite":"Reset",n=e.username?` for ${e.username}`:"",a=async()=>{try{await navigator.clipboard.writeText(e.reset_url),S("Copied to clipboard.")}catch{S("Copy failed. Select and copy the URL manually.")}};return r`<div class="notice admin-reset-link">
    <div>
      <strong>${t} link created${n}</strong>
      <span>Expires ${j(e.expires_at)}</span>
      <code>${e.reset_url}</code>
    </div>
    <button class="btn" type="button" onClick=${a}>${T("copy",{size:14})} Copy</button>
  </div>`}function Us(e){return e.is_disabled?r`<span class="badge badge-warn">Disabled</span>`:r`<span class="badge badge-public">Active</span>`}function Is({user:e,currentUser:t,onQuota:n,onReset:a,onDisable:o}){let s=e.storage_quota_bytes!=null?q(e.storage_quota_bytes):"No limit",i=!Ps(e,t);return r`<tr>
    <td>
      <strong>${e.username}</strong>
      <div class="muted">${e.display_name||e.id}</div>
      ${e.email&&r`<div class="muted">${e.email}</div>`}
    </td>
    <td>${e.role}</td>
    <td>${Us(e)}</td>
    <td>
      <strong>${q(e.storage_bytes||0)}</strong>
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
  </tr>`}function sa({users:e,settings:t,currentUser:n,resetLink:a,setResetLink:o,reload:s}){let[i,c]=f(null),p=n?.role==="owner",u=!!t?.smtp_enabled,d=()=>c(null);async function h(){let{type:m,user:b,value:g}=i;d();try{if(m==="quota"){let w=g.trim()?Ms(g):null;await k(`/api/v1/users/${encodeURIComponent(b.id)}`,{method:"PATCH",body:{storage_quota_bytes:w}}),S("Storage quota updated.")}else if(m==="disable")await k(`/api/v1/users/${encodeURIComponent(b.id)}`,{method:"DELETE",body:{reauth_password:g}}),S("User disabled.");else if(m==="reset"){let w=await k(`/api/v1/users/${encodeURIComponent(b.id)}/reset-password`,{method:"POST",body:{reauth_password:g}});o({...w,kind:"reset"}),S("Reset link created.")}s()}catch(w){S(w.message)}}let l={quota:{title:"Set storage quota",description:"Enter a per-user storage limit in GiB. Leave it blank to remove the per-user limit.",confirmLabel:"Save quota",danger:!1,field:r`<label class="field"><span>Quota GiB</span>
        <input class="input" type="number" min="0" step="0.1" placeholder="No per-user limit"
          value=${i?.value||""} onInput=${m=>c(b=>({...b,value:m.target.value}))} /></label>`},disable:{title:"Disable user?",description:"This immediately revokes the user's sessions and device tokens.",confirmLabel:"Disable",danger:!0,field:r`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value||""}
          onInput=${m=>c(b=>({...b,value:m.target.value}))} /></label>`},reset:{title:"Create reset link?",description:"This creates a temporary password reset link for the selected user.",confirmLabel:"Create link",danger:!1,field:r`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value||""}
          onInput=${m=>c(b=>({...b,value:m.target.value}))} /></label>`}}[i?.type];return r`<div class="admin-grid">
    <div class="admin-side-stack">
      <${Es} isOwner=${p} onCreated=${()=>{o(null),s()}} />
      <${Ds} isOwner=${p} smtpEnabled=${u}
        onCreated=${m=>{o(m),s()}} />
    </div>
    <div class="panel">
      <div class="section-header">
        <h2>Users</h2>
        <span class="muted">${e.length} total</span>
      </div>
      <${Rs} resetLink=${a} />
      <div class="table-wrap">
        <table class="lib-table">
          <thead><tr><th>Username</th><th>Role</th><th>Status</th><th>Storage</th><th>Last login</th><th></th></tr></thead>
          <tbody>
            ${e.map(m=>r`<${Is} key=${m.id} user=${m} currentUser=${n}
              onQuota=${b=>c({type:"quota",user:b,value:""})}
              onReset=${b=>c({type:"reset",user:b,value:""})}
              onDisable=${b=>c({type:"disable",user:b,value:""})} />`)}
          </tbody>
        </table>
      </div>
    </div>
    <${le} open=${!!i}
      title=${l?.title}
      body=${l&&r`${l.description} ${l.field}`}
      confirmLabel=${l?.confirmLabel} danger=${l?.danger}
      confirmDisabled=${i?.type!=="quota"&&!i?.value?.trim()}
      onConfirm=${h} onCancel=${d} />
  </div>`}X();function ot(e){let t=String(e||"").trim();return t||null}function oa({settings:e,isOwner:t,reload:n}){let[a,o]=f(!1);async function s(i){if(i.preventDefault(),a)return;o(!0);let c=new FormData(i.currentTarget),p={allow_vod_uploads:c.get("allow_vod_uploads")==="on",vod_threshold_minutes:Number(c.get("vod_threshold_minutes")||30)};if(t){p.about_text=String(c.get("about_text")||""),p.smtp_enabled=c.get("smtp_enabled")==="on",p.smtp_host=ot(c.get("smtp_host")),p.smtp_port=Number(c.get("smtp_port")||587),p.smtp_tls_mode=String(c.get("smtp_tls_mode")||"starttls"),p.smtp_username=ot(c.get("smtp_username")),p.smtp_from_email=ot(c.get("smtp_from_email")),p.smtp_from_name=ot(c.get("smtp_from_name"));let u=String(c.get("smtp_password")||"").trim();u&&(p.smtp_password=u),c.get("smtp_password_clear")==="on"&&(p.smtp_password_clear=!0)}try{await k("/api/v1/admin/settings",{method:"PATCH",body:p}),S("Settings saved."),n()}catch(u){S(u.message)}finally{o(!1)}}return r`<form class="admin-settings-page" onSubmit=${s}>
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
  </form>`}function Ls(e){return`${(e/100).toFixed(e%100===0?0:1)}%`}function As(e){switch(e){case"delete_and_retry":return"delete the failed upload and retry from a new session";case"retry":return"retry the current upload request";default:return""}}function Ns({upload:e}){let t=Math.max(0,Math.min(1e4,Number(e.progress_basis_points||0))),n=As(e.recovery_action);return r`<div class="job-item">
    <div class="job-title-line">
      <strong class="mono">${e.id}</strong>
      <span class="badge badge-warn">${Ls(t)}</span>
    </div>
    <div class="progress-meter" aria-label="Upload progress"><span style=${`width:${t/100}%`}></span></div>
    <span class="muted">clip ${e.clip_id} — ${q(e.received_size_bytes)} of ${q(e.expected_size_bytes)} — updated ${j(e.updated_at)}</span>
    ${e.failure_reason&&r`<span class="form-error">${e.failure_reason}</span>`}
    ${n&&r`<span class="muted">Recovery: ${n}</span>`}
  </div>`}function ra({job:e}){return r`<div class="job-item">
    <strong>${e.kind} <span class="mono">${e.id}</span></strong>
    <span class="muted">${e.status} — attempts ${e.attempts}/${e.max_attempts} — updated ${j(e.updated_at)} — target ${e.target_type||""}:${e.target_id||""}</span>
    ${e.last_error&&r`<span class="form-error">${e.last_error}</span>`}
  </div>`}function Tt({title:e,items:t,renderItem:n,emptyLabel:a}){return r`<div class="panel">
    <div class="section-header">
      <h2>${e}</h2>
      <span class="muted">${t.length}</span>
    </div>
    ${t.length?r`<div class="job-list">${t.map(n)}</div>`:r`<p class="muted">${a}</p>`}
  </div>`}function ia({failedUploads:e,deadJobs:t,recentErrors:n}){return r`<div class="section">
    <${Tt} title="Failed uploads" items=${e} emptyLabel="No failed uploads."
      renderItem=${a=>r`<${Ns} key=${a.id} upload=${a} />`} />
    <${Tt} title="Dead jobs" items=${t} emptyLabel="No dead jobs."
      renderItem=${a=>r`<${ra} key=${a.id} job=${a} />`} />
    <${Tt} title="Recent job errors" items=${n} emptyLabel="No recent job errors."
      renderItem=${a=>r`<${ra} key=${a.id} job=${a} />`} />
  </div>`}var la=[["overview","server","Overview"],["users","users","Users"],["settings","sliders","Settings"],["jobs","alert","Jobs"]];async function zs(){let[e,t,n,a,o,s]=await Promise.all([k("/api/v1/admin/overview"),k("/api/v1/admin/settings"),k("/api/v1/users"),k("/api/v1/admin/uploads/failed?limit=50"),k("/api/v1/admin/jobs/dead?limit=50"),k("/api/v1/admin/jobs/recent-errors?limit=50")]);return{overview:e,settings:t,users:n,failedUploads:a,deadJobs:o,recentErrors:s}}function ca({route:e}){let{user:t}=H(A),n=la.some(([l])=>l===e.tab)?e.tab:"overview",[a,o]=f(null),[s,i]=f(null),[c,p]=f(null),[u,d]=f(0),h=()=>d(l=>l+1);return C(()=>{let l=!0;return i(null),zs().then(m=>l&&o(m)).catch(m=>l&&i(m)),()=>{l=!1}},[u]),r`<main class="page">
    <h1>Admin</h1>
    <p class="page-subtitle">Accounts, instance summary, and processing diagnostics.</p>
    <nav class="ad-tabs" aria-label="Admin views">
      ${la.map(([l,m,b])=>r`<a key=${l} class=${`ad-tab ${l===n?"ad-tab-on":""}`}
        href=${`/admin?tab=${l}`} aria-current=${l===n?"page":void 0}>${T(m,{size:14})} ${b}</a>`)}
    </nav>
    ${s?r`<${Z} name="alert" title="Couldn't load admin data" body=${s.message} />`:a?n==="users"?r`<${sa} users=${a.users} settings=${a.settings} currentUser=${t}
          resetLink=${c} setResetLink=${p} reload=${h} />`:n==="settings"?r`<${oa} settings=${a.settings} isOwner=${t?.role==="owner"} reload=${h} />`:n==="jobs"?r`<${ia} failedUploads=${a.failedUploads} deadJobs=${a.deadJobs} recentErrors=${a.recentErrors} />`:r`<${na} overview=${a.overview} deadJobs=${a.deadJobs} failedUploads=${a.failedUploads} />`:r`<p class="empty-state">Loading admin data…</p>`}
  </main>`}X();function Fs(e){if(!e?.avatar_url)return"";let t=e.updated_at||"";if(!t)return e.avatar_url;let n=String(e.avatar_url).includes("?")?"&":"?";return`${e.avatar_url}${n}v=${encodeURIComponent(t)}`}function Bs(e){return(e||"C").trim().slice(0,1).toUpperCase()||"C"}function rt({user:e,size:t=40,className:n=""}){let a=Fs(e),o=`width:${t}px;height:${t}px;font-size:${Math.round(t*.4)}px`;if(a)return r`<img class=${`user-avatar ${n}`} style=${o} src=${a} alt="" />`;let s=e?.display_name||e?.username;return r`<div class=${`user-avatar user-avatar-fallback ${n}`} style=${o} aria-hidden="true">
    ${Bs(s)}
  </div>`}function ua(e){let t=String(e||"").trim();return t||null}async function Os(e){let t=new Headers;t.set("Accept","application/json"),t.set("Content-Type",e.type||"application/octet-stream");let n=bt();n&&t.set("X-CSRF-Token",n);let a=await fetch("/api/v1/me/avatar",{method:"PUT",credentials:"same-origin",headers:t,body:e}),o=await a.json().catch(()=>({}));if(!a.ok)throw new Error(o.error||a.statusText||"Avatar upload failed");return o}function da(e){A.set({...A.get(),user:e})}function Vs({user:e}){let[t,n]=f(!1);async function a(o){if(o.preventDefault(),t)return;n(!0);let s=new FormData(o.currentTarget);try{let i=await k("/api/v1/me/profile",{method:"PATCH",body:{display_name:ua(s.get("display_name")),bio:ua(s.get("bio"))}});da(i),S("Profile saved.")}catch(i){S(i.message)}finally{n(!1)}}return r`<form class="profile-form" onSubmit=${a}>
    <label class="field"><span>Display name</span>
      <input class="input" name="display_name" maxlength="120" value=${e.display_name||""} placeholder=${e.username} /></label>
    <label class="field"><span>Bio</span>
      <textarea class="input" name="bio" rows="5" maxlength="2000" placeholder="Tell people what you upload.">${e.bio||""}</textarea></label>
    <div class="clip-inline-actions">
      <button class="btn btn-primary" type="submit" disabled=${t}>${T("save",{size:14})} Save profile</button>
    </div>
  </form>`}function Hs({user:e}){let[t,n]=f(!1);async function a(o){if(o.preventDefault(),t)return;let s=o.currentTarget.elements.avatar?.files?.[0];if(!s){S("Choose an avatar image first.");return}n(!0);try{let i=await Os(s);da(i),S("Avatar uploaded.")}catch(i){S(i.message)}finally{n(!1)}}return r`<form class="profile-form" onSubmit=${a}>
    <label class="field"><span>Avatar</span>
      <input name="avatar" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
      <small>PNG, JPEG, WebP, or GIF. Max 2 MiB.</small></label>
    <div class="clip-inline-actions">
      <button class="btn" type="submit" disabled=${t}>${T("upload",{size:14})} Upload avatar</button>
    </div>
  </form>`}function pa(){let{user:e}=H(A);return e?r`<main class="page">
    <h1>Profile</h1>
    <p class="page-subtitle">Public identity and avatar.</p>
    <div class="profile-settings-header">
      <${rt} user=${e} size=${72} />
      <div>
        <h2>${e.display_name||e.username}</h2>
        <p>@${e.username} · ${e.role}</p>
      </div>
    </div>
    <${Vs} user=${e} />
    <${Hs} user=${e} />
    <div class="profile-public-link">
      <a class="btn" href=${`/u/${encodeURIComponent(e.username)}`}>${T("external",{size:14})} View public profile</a>
    </div>
  </main>`:null}X();async function qs(){let[e,t]=await Promise.all([k("/api/v1/auth/sessions"),k("/api/v1/auth/device-tokens")]);return{sessions:e,deviceTokens:t}}function Ks({item:e,onRevoke:t}){return r`<div class="management-item">
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
  </div>`}function Gs({item:e,onRevoke:t}){let n=!!e.revoked_at;return r`<div class="management-item">
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
  </div>`}function ma(){let[e,t]=f(null),[n,a]=f(null),[o,s]=f(0),[i,c]=f(null);C(()=>{let d=!0;return a(null),qs().then(h=>d&&t(h)).catch(h=>d&&a(h)),()=>{d=!1}},[o]);let p=()=>s(d=>d+1);async function u(){let d=i;c(null);try{if(d.kind==="session"){if(await k(`/api/v1/auth/sessions/${encodeURIComponent(d.item.id)}`,{method:"DELETE",body:{}}),d.item.current){A.set({user:null,csrfToken:null,ready:!0}),S("Current session revoked."),Q("/login");return}S("Session revoked.")}else await k(`/api/v1/auth/device-tokens/${encodeURIComponent(d.item.id)}`,{method:"DELETE",body:{}}),S("Device token revoked.");p()}catch(h){S(h.message)}}return n?r`<main class="page"><${Z} name="alert" title="Couldn't load account data" body=${n.message} /></main>`:r`<main class="page">
    <h1>Account</h1>
    <p class="page-subtitle">Sessions and device tokens.</p>
    ${e?r`<div class="account-grid">
          <div class="panel">
            <div class="section-header"><h2>Browser sessions</h2><span class="muted">${e.sessions.length} active</span></div>
            ${e.sessions.length?r`<div class="management-list">${e.sessions.map(d=>r`<${Ks} key=${d.id} item=${d}
                  onRevoke=${h=>c({kind:"session",item:h})} />`)}</div>`:r`<p class="muted">No active sessions.</p>`}
          </div>
          <div class="panel">
            <div class="section-header"><h2>Device tokens</h2><span class="muted">${e.deviceTokens.length} total</span></div>
            ${e.deviceTokens.length?r`<div class="management-list">${e.deviceTokens.map(d=>r`<${Gs} key=${d.id} item=${d}
                  onRevoke=${h=>c({kind:"device",item:h})} />`)}</div>`:r`<p class="muted">No device tokens.</p>`}
          </div>
        </div>`:r`<p class="empty-state">Loading account data…</p>`}
    <${le} open=${!!i}
      title=${i?.kind==="session"?"Revoke browser session?":"Revoke device token?"}
      body=${i?.kind==="session"?i.item.current?"This signs you out of the current browser session.":"This signs out that browser session immediately.":"The desktop client using this token will need to reconnect."}
      confirmLabel="Revoke" danger
      onConfirm=${u} onCancel=${()=>c(null)} />
  </main>`}X();function fa({route:e}){let{user:t}=H(A),[n,a]=f(null),[o,s]=f(null);if(C(()=>{let p=!0;return a(null),s(null),k(`/api/v1/public/users/${encodeURIComponent(e.username)}`).then(u=>p&&a(u)).catch(u=>p&&s(u)),()=>{p=!1}},[e.username]),o)return r`<main class="page"><${Z} name="alert" title="Profile unavailable" body=${o.message} /></main>`;if(!n)return r`<main class="page"><p class="empty-state">Loading profile…</p></main>`;let i=t&&t.username.toLowerCase()===n.username.toLowerCase(),c=n.clips||[];return r`<main class="page">
    <header class="public-user-header">
      <${rt} user=${n} size=${72} />
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
          ${c.map(p=>r`<${we} key=${p.share_id}
            clip=${{...p,thumbnail_url:re(p),media_url:ye(p)}}
            href=${`/c/${encodeURIComponent(p.share_id)}`} showAuthor=${!1} />`)}
        </div>`}
  </main>`}X();var _a="Clipline is a self-hosted clip library for saved gameplay moments.";function it(e,t){return r`<div><dt>${e}</dt><dd>${t}</dd></div>`}function ha(){let[e,t]=f(_a);return C(()=>{let n=!0;return k("/api/v1/about").then(a=>n&&t(a.about_text||_a)).catch(()=>{}),()=>{n=!1}},[]),r`<main class="page">
    <h1>About</h1>
    <p class="page-subtitle">Clipline Cloud</p>
    <div class="panel about-panel">
      <h2>Clipline Cloud</h2>
      <p class="about-text">${e}</p>
      <dl class="ad-kv">
        ${it("Home","Public clips that are ready for discovery.")}
        ${it("Unlisted","Shareable by link, but not listed on Home.")}
        ${it("Private","Visible only to the clip owner.")}
        ${it("Media","Public and unlisted clips are not DRM-protected.")}
      </dl>
    </div>
  </main>`}var Ws={publicLibrary:Xe,publicGame:Xe,games:Rn,library:zn,clip:St,public:St,login:ea,resetPassword:ta,admin:ca,profile:pa,account:ma,publicUser:fa,about:ha},ba={publicLibrary:"feed",publicGame:"feed",games:"games",library:"library",clip:"library",admin:"admin",profile:"profile"},va=yn({pathname:window.location.pathname,search:window.location.search});function js(){let e=kn();va=e.name;let{ready:t}=H(A);if(!t)return r`<div class="boot">Loading…</div>`;let n=Ws[e.name]||Xe,a=e.name==="login"||e.name==="resetPassword";return r`<div class="ui" onClick=${xn}>
    ${!a&&r`<${Cn} active=${ba[e.name]||""} route=${e} />`}
    <${n} route=${e} />
    ${!a&&r`<${Tn} active=${ba[e.name]||""} />`}
    <${Mn} />
  </div>`}window.addEventListener("clipline:unauthorized",()=>{A.set({user:null,csrfToken:null,ready:!0}),gn(va)||Q("/login")});(async()=>{try{let t=await k("/api/v1/auth/me");Ce(t.csrf_token),A.set({user:t.user,csrfToken:t.csrf_token,ready:!0})}catch{A.set({user:null,csrfToken:null,ready:!0})}let e=document.querySelector("#app");e.textContent="",Qt(r`<${js} />`,e)})();
