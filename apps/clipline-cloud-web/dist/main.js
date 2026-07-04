var Sa=Object.defineProperty;var Ca=(e,t)=>()=>(e&&(t=e(e=0)),t);var Ta=(e,t)=>{for(var n in t)Sa(e,n,{get:t[n],enumerable:!0})};var yn={};Ta(yn,{ApiError:()=>he,api:()=>k,getCsrfToken:()=>kt,setCsrfToken:()=>Pe});function Pe(e){Ge=e}function kt(){return Ge}async function k(e,t={}){let n=(t.method||"GET").toUpperCase(),a=new Headers(t.headers||{});a.set("Accept","application/json");let o=t.body;o&&typeof o!="string"&&(a.set("Content-Type","application/json"),o=JSON.stringify(o)),!["GET","HEAD","OPTIONS"].includes(n)&&Ge&&a.set("X-CSRF-Token",Ge);let s=await fetch(e,{...t,body:o,credentials:"same-origin",headers:a,method:n}),c=(s.headers.get("content-type")||"").includes("application/json")?await s.json():await s.text();if(!s.ok){s.status===401&&window.dispatchEvent(new CustomEvent("clipline:unauthorized"));let d=typeof c=="object"&&c?.error?c.error:s.statusText;throw new he(d||"Request failed",s.status)}return c}var Ge,he,X=Ca(()=>{Ge=null;he=class extends Error{constructor(t,n){super(t),this.status=n}}});var Ve,A,Gt,Ma,_e,Vt,Wt,jt,dt,Ae,Te,Zt,ft,pt,mt,Pa,ze={},Be=[],Ea=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,He=Array.isArray;function fe(e,t){for(var n in t)e[n]=t[n];return e}function _t(e){e&&e.parentNode&&e.parentNode.removeChild(e)}function ht(e,t,n){var a,o,s,i={};for(s in t)s=="key"?a=t[s]:s=="ref"?o=t[s]:i[s]=t[s];if(arguments.length>2&&(i.children=arguments.length>3?Ve.call(arguments,2):n),typeof e=="function"&&e.defaultProps!=null)for(s in e.defaultProps)i[s]===void 0&&(i[s]=e.defaultProps[s]);return Ne(e,i,a,o,null)}function Ne(e,t,n,a,o){var s={type:e,props:t,key:n,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:o??++Gt,__i:-1,__u:0};return o==null&&A.vnode!=null&&A.vnode(s),s}function qe(e){return e.children}function Fe(e,t){this.props=e,this.context=t}function ye(e,t){if(t==null)return e.__?ye(e.__,e.__i+1):null;for(var n;t<e.__k.length;t++)if((n=e.__k[t])!=null&&n.__e!=null)return n.__e;return typeof e.type=="function"?ye(e):null}function Ra(e){if(e.__P&&e.__d){var t=e.__v,n=t.__e,a=[],o=[],s=fe({},t);s.__v=t.__v+1,A.vnode&&A.vnode(s),bt(e.__P,s,t,e.__n,e.__P.namespaceURI,32&t.__u?[n]:null,a,n??ye(t),!!(32&t.__u),o),s.__v=t.__v,s.__.__k[s.__i]=s,en(a,s,o),t.__e=t.__=null,s.__e!=n&&Jt(s)}}function Jt(e){if((e=e.__)!=null&&e.__c!=null)return e.__e=e.__c.base=null,e.__k.some(function(t){if(t!=null&&t.__e!=null)return e.__e=e.__c.base=t.__e}),Jt(e)}function Ht(e){(!e.__d&&(e.__d=!0)&&_e.push(e)&&!Oe.__r++||Vt!=A.debounceRendering)&&((Vt=A.debounceRendering)||Wt)(Oe)}function Oe(){try{for(var e,t=1;_e.length;)_e.length>t&&_e.sort(jt),e=_e.shift(),t=_e.length,Ra(e)}finally{_e.length=Oe.__r=0}}function Yt(e,t,n,a,o,s,i,c,d,u,p){var b,l,m,h,$,x,S,y=a&&a.__k||Be,E=t.length;for(d=Da(n,t,y,d,E),b=0;b<E;b++)(m=n.__k[b])!=null&&(l=m.__i!=-1&&y[m.__i]||ze,m.__i=b,x=bt(e,m,l,o,s,i,c,d,u,p),h=m.__e,m.ref&&l.ref!=m.ref&&(l.ref&&vt(l.ref,null,m),p.push(m.ref,m.__c||h,m)),$==null&&h!=null&&($=h),(S=!!(4&m.__u))||l.__k===m.__k?(d=Xt(m,d,e,S),S&&l.__e&&(l.__e=null)):typeof m.type=="function"&&x!==void 0?d=x:h&&(d=h.nextSibling),m.__u&=-7);return n.__e=$,d}function Da(e,t,n,a,o){var s,i,c,d,u,p=n.length,b=p,l=0;for(e.__k=new Array(o),s=0;s<o;s++)(i=t[s])!=null&&typeof i!="boolean"&&typeof i!="function"?(typeof i=="string"||typeof i=="number"||typeof i=="bigint"||i.constructor==String?i=e.__k[s]=Ne(null,i,null,null,null):He(i)?i=e.__k[s]=Ne(qe,{children:i},null,null,null):i.constructor===void 0&&i.__b>0?i=e.__k[s]=Ne(i.type,i.props,i.key,i.ref?i.ref:null,i.__v):e.__k[s]=i,d=s+l,i.__=e,i.__b=e.__b+1,c=null,(u=i.__i=Ua(i,n,d,b))!=-1&&(b--,(c=n[u])&&(c.__u|=2)),c==null||c.__v==null?(u==-1&&(o>p?l--:o<p&&l++),typeof i.type!="function"&&(i.__u|=4)):u!=d&&(u==d-1?l--:u==d+1?l++:(u>d?l--:l++,i.__u|=4))):e.__k[s]=null;if(b)for(s=0;s<p;s++)(c=n[s])!=null&&(2&c.__u)==0&&(c.__e==a&&(a=ye(c)),nn(c,c));return a}function Xt(e,t,n,a){var o,s;if(typeof e.type=="function"){for(o=e.__k,s=0;o&&s<o.length;s++)o[s]&&(o[s].__=e,t=Xt(o[s],t,n,a));return t}e.__e!=t&&(a&&(t&&e.type&&!t.parentNode&&(t=ye(e)),n.insertBefore(e.__e,t||null)),t=e.__e);do t=t&&t.nextSibling;while(t!=null&&t.nodeType==8);return t}function Ua(e,t,n,a){var o,s,i,c=e.key,d=e.type,u=t[n],p=u!=null&&(2&u.__u)==0;if(u===null&&c==null||p&&c==u.key&&d==u.type)return n;if(a>(p?1:0)){for(o=n-1,s=n+1;o>=0||s<t.length;)if((u=t[i=o>=0?o--:s++])!=null&&(2&u.__u)==0&&c==u.key&&d==u.type)return i}return-1}function qt(e,t,n){t[0]=="-"?e.setProperty(t,n??""):e[t]=n==null?"":typeof n!="number"||Ea.test(t)?n:n+"px"}function Ie(e,t,n,a,o){var s,i;e:if(t=="style")if(typeof n=="string")e.style.cssText=n;else{if(typeof a=="string"&&(e.style.cssText=a=""),a)for(t in a)n&&t in n||qt(e.style,t,"");if(n)for(t in n)a&&n[t]==a[t]||qt(e.style,t,n[t])}else if(t[0]=="o"&&t[1]=="n")s=t!=(t=t.replace(Zt,"$1")),i=t.toLowerCase(),t=i in e||t=="onFocusOut"||t=="onFocusIn"?i.slice(2):t.slice(2),e.l||(e.l={}),e.l[t+s]=n,n?a?n[Te]=a[Te]:(n[Te]=ft,e.addEventListener(t,s?mt:pt,s)):e.removeEventListener(t,s?mt:pt,s);else{if(o=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&t[4]!="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&n==1?"":n))}}function Kt(e){return function(t){if(this.l){var n=this.l[t.type+e];if(t[Ae]==null)t[Ae]=ft++;else if(t[Ae]<n[Te])return;return n(A.event?A.event(t):t)}}}function bt(e,t,n,a,o,s,i,c,d,u){var p,b,l,m,h,$,x,S,y,E,B,G,F,se,ee,ne,N=t.type;if(t.constructor!==void 0)return null;128&n.__u&&(d=!!(32&n.__u),s=[c=t.__e=n.__e]),(p=A.__b)&&p(t);e:if(typeof N=="function"){b=i.length;try{if(y=t.props,E=N.prototype&&N.prototype.render,B=(p=N.contextType)&&a[p.__c],G=p?B?B.props.value:p.__:a,n.__c?S=(l=t.__c=n.__c).__=l.__E:(E?t.__c=l=new N(y,G):(t.__c=l=new Fe(y,G),l.constructor=N,l.render=Ia),B&&B.sub(l),l.state||(l.state={}),l.__n=a,m=l.__d=!0,l.__h=[],l._sb=[]),E&&l.__s==null&&(l.__s=l.state),E&&N.getDerivedStateFromProps!=null&&(l.__s==l.state&&(l.__s=fe({},l.__s)),fe(l.__s,N.getDerivedStateFromProps(y,l.__s))),h=l.props,$=l.state,l.__v=t,m)E&&N.getDerivedStateFromProps==null&&l.componentWillMount!=null&&l.componentWillMount(),E&&l.componentDidMount!=null&&l.__h.push(l.componentDidMount);else{if(E&&N.getDerivedStateFromProps==null&&y!==h&&l.componentWillReceiveProps!=null&&l.componentWillReceiveProps(y,G),t.__v==n.__v||!l.__e&&l.shouldComponentUpdate!=null&&l.shouldComponentUpdate(y,l.__s,G)===!1){t.__v!=n.__v&&(l.props=y,l.state=l.__s,l.__d=!1),t.__e=n.__e,t.__k=n.__k,t.__k.some(function(J){J&&(J.__=t)}),Be.push.apply(l.__h,l._sb),l._sb=[],l.__h.length&&i.push(l);break e}l.componentWillUpdate!=null&&l.componentWillUpdate(y,l.__s,G),E&&l.componentDidUpdate!=null&&l.__h.push(function(){l.componentDidUpdate(h,$,x)})}if(l.context=G,l.props=y,l.__P=e,l.__e=!1,F=A.__r,se=0,E)l.state=l.__s,l.__d=!1,F&&F(t),p=l.render(l.props,l.state,l.context),Be.push.apply(l.__h,l._sb),l._sb=[];else do l.__d=!1,F&&F(t),p=l.render(l.props,l.state,l.context),l.state=l.__s;while(l.__d&&++se<25);l.state=l.__s,l.getChildContext!=null&&(a=fe(fe({},a),l.getChildContext())),E&&!m&&l.getSnapshotBeforeUpdate!=null&&(x=l.getSnapshotBeforeUpdate(h,$)),ee=p!=null&&p.type===qe&&p.key==null?tn(p.props.children):p,c=Yt(e,He(ee)?ee:[ee],t,n,a,o,s,i,c,d,u),l.base=t.__e,t.__u&=-161,l.__h.length&&i.push(l),S&&(l.__E=l.__=null)}catch(J){if(i.length=b,t.__v=null,d||s!=null){if(J.then){for(t.__u|=d?160:128;c&&c.nodeType==8&&c.nextSibling;)c=c.nextSibling;s!=null&&(s[s.indexOf(c)]=null),t.__e=c}else if(s!=null)for(ne=s.length;ne--;)_t(s[ne])}else t.__e=n.__e;t.__k==null&&(t.__k=n.__k||[]),J.then||Qt(t),A.__e(J,t,n)}}else s==null&&t.__v==n.__v?(t.__k=n.__k,t.__e=n.__e):c=t.__e=La(n.__e,t,n,a,o,s,i,d,u);return(p=A.diffed)&&p(t),128&t.__u?void 0:c}function Qt(e){e&&(e.__c&&(e.__c.__e=!0),e.__k&&e.__k.some(Qt))}function en(e,t,n){for(var a=0;a<n.length;a++)vt(n[a],n[++a],n[++a]);A.__c&&A.__c(t,e),e.some(function(o){try{e=o.__h,o.__h=[],e.some(function(s){s.call(o)})}catch(s){A.__e(s,o.__v)}})}function tn(e){return typeof e!="object"||e==null||e.__b>0?e:He(e)?e.map(tn):e.constructor!==void 0?null:fe({},e)}function La(e,t,n,a,o,s,i,c,d){var u,p,b,l,m,h,$,x=n.props||ze,S=t.props,y=t.type;if(y=="svg"?o="http://www.w3.org/2000/svg":y=="math"?o="http://www.w3.org/1998/Math/MathML":o||(o="http://www.w3.org/1999/xhtml"),s!=null){for(u=0;u<s.length;u++)if((m=s[u])&&"setAttribute"in m==!!y&&(y?m.localName==y:m.nodeType==3)){e=m,s[u]=null;break}}if(e==null){if(y==null)return document.createTextNode(S);e=document.createElementNS(o,y,S.is&&S),c&&(A.__m&&A.__m(t,s),c=!1),s=null}if(y==null)x===S||c&&e.data==S||(e.data=S);else{if(s=y=="textarea"&&S.defaultValue!=null?null:s&&Ve.call(e.childNodes),!c&&s!=null)for(x={},u=0;u<e.attributes.length;u++)x[(m=e.attributes[u]).name]=m.value;for(u in x)m=x[u],u=="dangerouslySetInnerHTML"?b=m:u=="children"||u in S||u=="value"&&"defaultValue"in S||u=="checked"&&"defaultChecked"in S||Ie(e,u,null,m,o);for(u in S)m=S[u],u=="children"?l=m:u=="dangerouslySetInnerHTML"?p=m:u=="value"?h=m:u=="checked"?$=m:c&&typeof m!="function"||x[u]===m||Ie(e,u,m,x[u],o);if(p)c||b&&(p.__html==b.__html||p.__html==e.innerHTML)||(e.innerHTML=p.__html),t.__k=[];else if(b&&(e.innerHTML=""),Yt(t.type=="template"?e.content:e,He(l)?l:[l],t,n,a,y=="foreignObject"?"http://www.w3.org/1999/xhtml":o,s,i,s?s[0]:n.__k&&ye(n,0),c,d),s!=null)for(u=s.length;u--;)_t(s[u]);c&&y!="textarea"||(u="value",y=="progress"&&h==null?e.removeAttribute("value"):h!=null&&(h!==e[u]||y=="progress"&&!h||y=="option"&&h!=x[u])&&Ie(e,u,h,x[u],o),u="checked",$!=null&&$!=e[u]&&Ie(e,u,$,x[u],o))}return e}function vt(e,t,n){try{if(typeof e=="function"){var a=typeof e.__u=="function";a&&e.__u(),a&&t==null||(e.__u=e(t))}else e.current=t}catch(o){A.__e(o,n)}}function nn(e,t,n){var a,o;if(A.unmount&&A.unmount(e),(a=e.ref)&&(a.current&&a.current!=e.__e||vt(a,null,t)),(a=e.__c)!=null){if(a.componentWillUnmount)try{a.componentWillUnmount()}catch(s){A.__e(s,t)}a.base=a.__P=a.__n=null}if(a=e.__k)for(o=0;o<a.length;o++)a[o]&&nn(a[o],t,n||typeof e.type!="function");n||_t(e.__e),e.__c=e.__=e.__e=void 0}function Ia(e,t,n){return this.constructor(e,n)}function an(e,t,n){var a,o,s,i;t==document&&(t=document.documentElement),A.__&&A.__(e,t),o=(a=typeof n=="function")?null:n&&n.__k||t.__k,s=[],i=[],bt(t,e=(!a&&n||t).__k=ht(qe,null,[e]),o||ze,ze,t.namespaceURI,!a&&n?[n]:o?null:t.firstChild?Ve.call(t.childNodes):null,s,!a&&n?n:o?o.__e:t.firstChild,a,i),en(s,e,i),e.props.children=null}Ve=Be.slice,A={__e:function(e,t,n,a){for(var o,s,i;t=t.__;)if((o=t.__c)&&!o.__)try{if((s=o.constructor)&&s.getDerivedStateFromError!=null&&(o.setState(s.getDerivedStateFromError(e)),i=o.__d),o.componentDidCatch!=null&&(o.componentDidCatch(e,a||{}),i=o.__d),i)return o.__E=o}catch(c){e=c}throw e}},Gt=0,Ma=function(e){return e!=null&&e.constructor===void 0},Fe.prototype.setState=function(e,t){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=fe({},this.state),typeof e=="function"&&(e=e(fe({},n),this.props)),e&&fe(n,e),e!=null&&this.__v&&(t&&this._sb.push(t),Ht(this))},Fe.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),Ht(this))},Fe.prototype.render=qe,_e=[],Wt=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,jt=function(e,t){return e.__v.__b-t.__v.__b},Oe.__r=0,dt=Math.random().toString(8),Ae="__d"+dt,Te="__a"+dt,Zt=/(PointerCapture)$|Capture$/i,ft=0,pt=Kt(!1),mt=Kt(!0),Pa=0;var Me,V,$t,sn,Ke=0,fn=[],H=A,on=H.__b,rn=H.__r,ln=H.diffed,cn=H.__c,un=H.unmount,dn=H.__;function yt(e,t){H.__h&&H.__h(V,e,Ke||t),Ke=0;var n=V.__H||(V.__H={__:[],__h:[]});return e>=n.__.length&&n.__.push({}),n.__[e]}function f(e){return Ke=1,Aa(bn,e)}function Aa(e,t,n){var a=yt(Me++,2);if(a.t=e,!a.__c&&(a.__=[n?n(t):bn(void 0,t),function(c){var d=a.__N?a.__N[0]:a.__[0],u=a.t(d,c);d!==u&&(a.__N=[u,a.__[1]],a.__c.setState({}))}],a.__c=V,!V.__f)){var o=function(c,d,u){if(!a.__c.__H)return!0;var p=!1,b=a.__c.props!==c;if(a.__c.__H.__.some(function(m){if(m.__N){p=!0;var h=m.__[0];m.__=m.__N,m.__N=void 0,h!==m.__[0]&&(b=!0)}}),s){var l=s.call(this,c,d,u);return p?l||b:l}return!p||b};V.__f=!0;var s=V.shouldComponentUpdate,i=V.componentWillUpdate;V.componentWillUpdate=function(c,d,u){if(this.__e){var p=s;s=void 0,o(c,d,u),s=p}i&&i.call(this,c,d,u)},V.shouldComponentUpdate=o}return a.__N||a.__}function C(e,t){var n=yt(Me++,3);!H.__s&&hn(n.__H,t)&&(n.__=e,n.u=t,V.__H.__h.push(n))}function z(e){return Ke=5,Na(function(){return{current:e}},[])}function Na(e,t){var n=yt(Me++,7);return hn(n.__H,t)&&(n.__=e(),n.__H=t,n.__h=e),n.__}function pn(){for(var e;e=fn.shift();){var t=e.__H;if(e.__P&&t)try{t.__h.some(gt),t.__h.some(_n),t.__h=[]}catch(n){t.__h=[],H.__e(n,e.__v)}}}H.__b=function(e){V=null,on&&on(e)},H.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),dn&&dn(e,t)},H.__r=function(e){rn&&rn(e),Me=0;var t=(V=e.__c).__H;t&&($t===V?(t.__h=[],V.__h=[],t.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(t.__h.length&&pn(),Me=0)),$t=V},H.diffed=function(e){ln&&ln(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(fn.push(t)!==1&&sn===H.requestAnimationFrame||((sn=H.requestAnimationFrame)||Fa)(pn)),t.__H.__.some(function(n){n.u&&(n.__H=n.u,n.u=void 0)})),$t=V=null},H.__c=function(e,t){t.some(function(n){try{n.__h.some(gt),n.__h=n.__h.filter(function(a){return!a.__||_n(a)})}catch(a){t.some(function(o){o.__h&&(o.__h=[])}),t=[],H.__e(a,n.__v)}}),cn&&cn(e,t)},H.unmount=function(e){un&&un(e);var t,n=e.__c;n&&n.__H&&(n.__H.__.some(function(a){try{gt(a)}catch(o){t=o}}),n.__H=void 0,t&&H.__e(t,n.__v))};var mn=typeof requestAnimationFrame=="function";function Fa(e){var t,n=function(){clearTimeout(a),mn&&cancelAnimationFrame(t),setTimeout(e)},a=setTimeout(n,35);mn&&(t=requestAnimationFrame(n))}function gt(e){var t=V,n=e.__c;typeof n=="function"&&(e.__c=void 0,n()),V=t}function _n(e){var t=V;e.__c=e.__(),V=t}function hn(e,t){return!e||e.length!==t.length||t.some(function(n,a){return n!==e[a]})}function bn(e,t){return typeof t=="function"?t(e):t}var $n=function(e,t,n,a){var o;t[0]=0;for(var s=1;s<t.length;s++){var i=t[s++],c=t[s]?(t[0]|=i?1:2,n[t[s++]]):t[++s];i===3?a[0]=c:i===4?a[1]=Object.assign(a[1]||{},c):i===5?(a[1]=a[1]||{})[t[++s]]=c:i===6?a[1][t[++s]]+=c+"":i?(o=e.apply(c,$n(e,c,n,["",null])),a.push(o),c[0]?t[0]|=2:(t[s-2]=0,t[s]=o)):a.push(c)}return a},vn=new Map;function gn(e){var t=vn.get(this);return t||(t=new Map,vn.set(this,t)),(t=$n(this,t.get(e)||(t.set(e,t=(function(n){for(var a,o,s=1,i="",c="",d=[0],u=function(l){s===1&&(l||(i=i.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?d.push(0,l,i):s===3&&(l||i)?(d.push(3,l,i),s=2):s===2&&i==="..."&&l?d.push(4,l,0):s===2&&i&&!l?d.push(5,0,!0,i):s>=5&&((i||!l&&s===5)&&(d.push(s,0,i,o),s=6),l&&(d.push(s,l,0,o),s=6)),i=""},p=0;p<n.length;p++){p&&(s===1&&u(),u(p));for(var b=0;b<n[p].length;b++)a=n[p][b],s===1?a==="<"?(u(),d=[d],s=3):i+=a:s===4?i==="--"&&a===">"?(s=1,i=""):i=a+i[0]:c?a===c?c="":i+=a:a==='"'||a==="'"?c=a:a===">"?(u(),s=1):s&&(a==="="?(s=5,o=i,i=""):a==="/"&&(s<5||n[p][b+1]===">")?(u(),s===3&&(d=d[0]),s=d,(d=d[0]).push(2,0,s),s=0):a===" "||a==="	"||a===`
`||a==="\r"?(u(),s=2):i+=a),s===3&&i==="!--"&&(s=4,d=d[0])}return u(),d})(e)),t),arguments,[])).length>1?t:t[0]}var r=gn.bind(ht);X();function kn(e){let t=e,n=new Set;return{get:()=>t,set(a){t=a,n.forEach(o=>o(t))},update(a){this.set(a(t))},subscribe(a){return n.add(a),()=>n.delete(a)}}}function q(e){let[t,n]=f(e.get());return C(()=>e.subscribe(n),[e]),t}var I=kn({user:null,csrfToken:null,ready:!1}),We=kn([]),za=0;function w(e,{actionLabel:t,onAction:n,timeoutMs:a=5e3}={}){let o=++za;return We.update(s=>[...s,{id:o,message:e,actionLabel:t,onAction:n}]),a&&setTimeout(()=>je(o),a),o}function je(e){We.update(t=>t.filter(n=>n.id!==e))}function Ze(e){try{return decodeURIComponent(e)}catch{return e}}function wn(e){let t=Number(e.get("page")||1);return{sort:e.get("sort")||"uploaded_at_desc",game:e.get("game")||"",q:e.get("q")||"",page:Number.isFinite(t)?Math.max(1,t):1}}var Ba=["login","resetPassword","public","publicLibrary","publicGame","publicUser","about","games"];function wt(e){return Ba.includes(e)}function xn(e,t){return!t&&!wt(e)}var Oa={publicLibrary:"feed",publicGame:"feed",games:"games",library:"library",clip:"library",admin:"admin",profile:"profile"};function xt(e){return Oa[e?.name]||""}function Sn(e){return e?.name==="publicLibrary"&&e.surface==="search"?"search":xt(e)}function Je(e,t){let n=new URLSearchParams(t||""),a=e;return a.startsWith("/c/")?{name:"public",shareId:Ze(a.slice(3))}:a==="/"||a==="/public"||a==="/search"?{name:"publicLibrary",query:wn(n),surface:a==="/search"?"search":"feed"}:a.startsWith("/game/")?{name:"publicGame",game:Ze(a.slice(6)),query:wn(n)}:a==="/about"?{name:"about"}:a==="/games"?{name:"games"}:a.startsWith("/u/")?{name:"publicUser",username:Ze(a.slice(3))}:a==="/library"?{name:"library"}:a.startsWith("/clip/")?{name:"clip",clipId:Ze(a.slice(6))}:a==="/admin"?{name:"admin",tab:n.get("tab")||"overview"}:a==="/account"?{name:"account"}:a==="/profile"?{name:"profile"}:a==="/login"?{name:"login"}:a==="/reset-password"?{name:"resetPassword",token:n.get("token")||"",invite:n.get("invite")==="1"}:{name:"publicLibrary"}}function Cn(e){return Je(e.pathname,e.search).name}var St=new Set;function W(e){window.history.pushState({},"",e),Tn()}function Tn(){let{pathname:e,search:t}=window.location,n=Je(e,t);St.forEach(a=>a(n))}window.addEventListener("popstate",Tn);function Mn(){let[e,t]=f(()=>Je(window.location.pathname,window.location.search));return C(()=>(St.add(t),()=>St.delete(t)),[]),e}function Pn(e){let t=e.target.closest("a[href^='/']");!t||t.target||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||(e.preventDefault(),W(t.getAttribute("href")))}var En={alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',clipboard:'<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',copy:'<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',external:'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',fastForward:'<path d="m13 19 9-7-9-7v14Z"/><path d="m2 19 9-7-9-7v14Z"/>',film:'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 8h4"/><path d="M3 16h4"/><path d="M17 8h4"/><path d="M17 16h4"/>',fullscreen:'<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/><path d="M12 2a15.3 15.3 0 0 0 0 20"/>',home:'<path d="m3 10 9-7 9 7"/><path d="M5 8.5V20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5"/><path d="M9 22V12h6v10"/>',info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',library:'<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',lock:'<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',logOut:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',menu:'<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',message:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>',notepad:'<path d="M8 2v4"/><path d="M16 2v4"/><path d="M3 10h18"/><path d="M6 4h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/><path d="M8 14h8"/><path d="M8 18h5"/>',pause:'<path d="M8 5v14"/><path d="M16 5v14"/>',play:'<path d="m8 5 11 7-11 7V5Z"/>',plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',check:'<path d="M20 6 9 17l-5-5"/>',refresh:'<path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/><path d="M3 12A9 9 0 0 1 18.5 5.7L21 8"/><path d="M21 3v5h-5"/>',rewind:'<path d="m11 19-9-7 9-7v14Z"/><path d="m22 19-9-7 9-7v14Z"/>',save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',server:'<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',skipBack:'<path d="M19 20 9 12l10-8v16Z"/><path d="M5 19V5"/>',skipForward:'<path d="m5 4 10 8-10 8V4Z"/><path d="M19 5v14"/>',shield:'<path d="M20 13c0 5-3.5 7.5-7.7 8.8a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V5l8-3 8 3v8Z"/>',sliders:'<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>',theater:'<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M6 9h12"/><path d="M6 15h12"/>',trash:'<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',volume2:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9 9 0 0 1 0 14"/>',volumeX:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>',x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'};function M(e,{size:t=18}={}){return r`<svg viewBox="0 0 24 24" width=${t} height=${t} fill="none"
    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" dangerouslySetInnerHTML=${{__html:En[e]||""}} />`}function Va(e){return e?.query?.q||""}function Rn({active:e,route:t}){let{user:n}=q(I),[a,o]=f(!1),s=z(null),i=Va(t),[c,d]=f(i);C(()=>{d(i)},[i]);let u=n?.role==="admin"||n?.role==="owner";C(()=>{if(!a)return;let l=h=>{s.current?.contains(h.target)||o(!1)},m=h=>{h.key==="Escape"&&o(!1)};return document.addEventListener("pointerdown",l),document.addEventListener("keydown",m),()=>{document.removeEventListener("pointerdown",l),document.removeEventListener("keydown",m)}},[a]);let p=[["feed","/","Feed"],["library","/library","Library",!!n],["games","/games","Games"],["admin","/admin","Admin",u]].filter(([,,,l])=>l!==!1),b=l=>{l.preventDefault();let m=new FormData(l.target).get("q")?.toString().trim();W(m?`/search?q=${encodeURIComponent(m)}`:"/search")};return r`<header class="topbar">
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
            <button role="menuitem" class="menu-danger" onClick=${Ha}>Sign out</button>
          </div>`}
        </div>`:r`<a class="btn" href="/login">${M("lock",{size:14})} Sign in</a>`}
  </header>`}async function Ha(){let{api:e}=await Promise.resolve().then(()=>(X(),yn));try{await e("/api/v1/auth/logout",{method:"POST"})}catch{}I.set({user:null,csrfToken:null,ready:!0}),W("/login")}var qa=[["feed","/","home","Feed",!0],["library","/library","library","Library","auth"],["search","/search","search","Search",!0],["profile","/profile","user","Profile","auth"]];function Ka(e){return qa.filter(([,,,,t])=>t!=="auth"||!!e)}function Dn({active:e}){let{user:t}=q(I),n=Ka(t);return r`<nav class="tabbar" aria-label="Primary">
    ${n.map(([a,o,s,i])=>r`
      <a class=${a===e?"tab-on":""} href=${o}>${M(s)}<span>${i}</span></a>`)}
  </nav>`}function Un(){let e=q(We);return r`<div class="toasts" role="status" aria-live="polite">
    ${e.map(t=>r`<div class="toast" key=${t.id}>
      <span>${t.message}</span>
      ${t.actionLabel&&r`<button class="toast-action"
        onClick=${()=>{t.onAction?.(),je(t.id)}}>${t.actionLabel}</button>`}
      <button class="toast-x" aria-label="Dismiss" onClick=${()=>je(t.id)}>✕</button>
    </div>`)}
  </div>`}X();function j(e){if(!e)return"Unknown";let t=new Date(e);return Number.isNaN(t.getTime())?"Unknown":new Intl.DateTimeFormat(void 0,{dateStyle:"medium",timeStyle:"short"}).format(t)}function be(e){if(e==null)return"Unknown";let t=Math.max(0,Math.round(Number(e)/1e3)),n=Math.floor(t/60),a=t%60;return`${n}:${String(a).padStart(2,"0")}`}function Ye(e){if(!e)return"Unknown";let t=new Date(e);if(Number.isNaN(t.getTime()))return"Unknown";let n=Math.min(0,t.getTime()-Date.now()),a=[["year",365*24*60*60*1e3],["month",720*60*60*1e3],["week",10080*60*1e3],["day",1440*60*1e3],["hour",3600*1e3],["minute",60*1e3],["second",1e3]],[o,s]=a.find(([,c])=>Math.abs(n)>=c)||a[a.length-1],i=Math.round(n/s);return new Intl.RelativeTimeFormat(void 0,{numeric:"always"}).format(i,o)}function K(e){if(e==null)return"Unknown";let t=Number(e);if(!Number.isFinite(t))return"Unknown";let n=["B","KiB","MiB","GiB","TiB"],a=t,o=0;for(;a>=1024&&o<n.length-1;)a/=1024,o+=1;return`${a.toFixed(o===0?0:1)} ${n[o]}`}function $e(e){let t=Number(e||0),n=Number.isFinite(t)&&t>0?Math.floor(t):0;return`${new Intl.NumberFormat(void 0,{notation:n>=1e4?"compact":"standard"}).format(n)} view${n===1?"":"s"}`}function re(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/thumbnail`}function Ee(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/thumbnail`}function Xe(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/media`}function ke(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/media`}function Re(e,t,n){if(e)try{return`${t}${new URL(e).pathname}`}catch{}return n?`${t}/c/${encodeURIComponent(n)}`:null}var Qe=null;function Ln(e){Qe?.(),Qe=e}function In(e){Qe===e&&(Qe=null)}var Ga=()=>window.matchMedia("(pointer: fine)").matches&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches&&!navigator.connection?.saveData;function An({src:e,poster:t,alt:n=""}){let[a,o]=f(!1),[s,i]=f(0),c=z(null),d=z(null),u=z(!0),p=z(),b=()=>{u.current&&(clearTimeout(c.current),o(!1),i(0))};p.current=b;let l=()=>{!e||!Ga()||(c.current=setTimeout(()=>{u.current&&(Ln(p.current),o(!0))},300))},m=h=>{let $=h.target;$.duration&&i($.currentTime/$.duration)};return C(()=>()=>{u.current=!1,clearTimeout(c.current),In(p.current)},[]),r`<span class="hover-preview" onPointerEnter=${l} onPointerLeave=${b}>
    ${a?r`<video ref=${d} src=${e} poster=${t} muted loop autoplay
          playsinline preload="none" onTimeUpdate=${m} />`:r`<img src=${t} alt=${n} loading="lazy" />`}
    ${a&&r`<span class="preview-scrub"><span style=${`width:${s*100}%`} /></span>`}
  </span>`}function Ct(e){return e.owner?.display_name||e.owner?.username||e.owner_username||e.author_name||e.author_username||null}function we({clip:e,href:t,selectable:n=!1,selected:a=!1,onToggleSelect:o,showVisibility:s=!1,showAuthor:i=!1}){let c=Ct(e),d=[e.game_name&&r`<em>${e.game_name}</em>`,i&&c,e.view_count!=null&&$e(e.view_count),e.uploaded_at&&Ye(e.uploaded_at)].filter(Boolean);return r`<article class=${`clip-card ${a?"is-selected":""} ${n?"is-selectable":""}`}>
    <a class="card-thumb" href=${t} tabindex="-1" aria-hidden="true">
      <${An} src=${e.media_url} poster=${e.thumbnail_url} />
      ${e.duration_ms!=null&&r`<span class="dur-pill">${be(e.duration_ms)}</span>`}
      ${s&&r`<span class=${`badge badge-${e.visibility} card-vis`}>${e.visibility}</span>`}
    </a>
    ${n&&r`<label class="card-check">
      <input type="checkbox" checked=${a} aria-label=${`Select ${e.title}`}
        onChange=${()=>o?.(e.id)} />
    </label>`}
    <h3 class="card-title"><a href=${t}>${e.title}</a></h3>
    <p class="card-meta">${d.map((u,p)=>r`${p>0&&" \xB7 "}${u}`)}</p>
  </article>`}function Z({name:e="film",title:t,body:n,action:a}){return r`<div class="empty">
    <div class="empty-icon">${M(e,{size:28})}</div>
    <h3>${t}</h3>
    ${n&&r`<p>${n}</p>`}
    ${a}
  </div>`}var Wa=[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]],ja=6,Za=60;function Ja(e){let t=new URLSearchParams;return t.set("page_size",String(Za)),e.sort!=="uploaded_at_desc"&&t.set("sort",e.sort),e.game&&t.set("game",e.game),e.q&&t.set("q",e.q),Number(e.page)>1&&t.set("page",String(e.page)),t}function Nn(e){return e?.game_name||"No game"}function et({route:e}){let t={sort:"uploaded_at_desc",page:1,q:"",...e.query,game:e.name==="publicGame"?e.game:e.query?.game||""},[n,a]=f(null),[o,s]=f([]),[i,c]=f(null);C(()=>{let $=!0;a(null),c(null);let x=Ja(t);return k(`/api/v1/public/clips?${x}`).then(S=>$&&a(S)).catch(S=>$&&c(S)),()=>{$=!1}},[e.name,t.sort,t.game,t.q,t.page]),C(()=>{let $=!0;return k("/api/v1/public/games").then(x=>$&&s(x.games||[])).catch(()=>{}),()=>{$=!1}},[]);let d=$=>W(Qa({...t,page:1,...$}));if(i)return r`<main class="page">
      <${Z} name="alert" title="Couldn't load the feed" body=${i.message} />
    </main>`;let u=n?.clips,p=!!(t.game||t.q)||Number(t.page)>1,b=!p,l=[...o].sort(($,x)=>(x.clip_count||0)-($.clip_count||0)),m=l.slice(0,ja),h=l.length-m.length;return r`<main class="page">
    ${u==null?r`<${Xa} />`:u.length===0?r`<${Z} name="film"
          title=${p?"No clips match this filter":"No public clips yet"}
          body=${p?"Try a different game, search, or clear your filters.":"Clips shared as public from a library will show up here."}
          action=${p&&r`<a class="btn" href="/">Clear filters</a>`} />`:r`
        ${b?Ya(u):""}
        <div class="feed-toolbar">
          <h2>Latest uploads</h2>
          <select class="input" value=${t.sort} onChange=${$=>d({sort:$.target.value})}>
            ${Wa.map(([$,x])=>r`<option value=${$}>${x}</option>`)}
          </select>
          <div class="chips">
            <button class=${`chip ${t.game?"":"chip-on"}`} onClick=${()=>d({game:""})}>All</button>
            ${m.map($=>r`<button
              class=${`chip ${t.game===$.game?"chip-on":""}`}
              onClick=${()=>d({game:$.game})}>${$.game}</button>`)}
            ${h>0&&r`<a class="chip" href="/games">+${h}</a>`}
          </div>
        </div>
        <div class="card-grid">
          ${(b?u.slice(4):u).map($=>r`<${we} clip=${{...$,thumbnail_url:re($),media_url:ke($)}}
              href=${Tt($)} showAuthor />`)}
        </div>
        ${es(n,t,d)}
      `}
  </main>`}function Ya(e){let[t,...n]=e,a=n.slice(0,3);return r`<p class="kicker">Now playing on this server</p>
    <section class="hero">
      <a class="hero-main" href=${Tt(t)}>
        <img src=${re(t)} alt="" loading="lazy" />
        <span class="hero-caption">▶ ${t.title} — ${Nn(t)} · ${be(t.duration_ms)}</span>
      </a>
      <div class="hero-side">
        ${a.map(o=>r`<a class="hero-row" href=${Tt(o)}>
            <img src=${re(o)} alt="" loading="lazy" />
            <span><b>${o.title}</b>
              <small>${Ct(o)} · ${Nn(o)} · ${$e(o.view_count)}</small></span>
          </a>`)}
      </div>
    </section>`}function Xa({count:e=8}){return r`<div class="card-grid">
    ${Array.from({length:e},(t,n)=>r`<div class="clip-card" key=${n}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`}function Tt(e){return`/c/${encodeURIComponent(e.share_id)}`}function Qa({sort:e="uploaded_at_desc",game:t="",q:n="",page:a=1}={}){let o=new URLSearchParams,s=e||"uploaded_at_desc",i=String(t||"").trim(),c=String(n||"").trim(),d=Math.max(1,Number(a||1));if(s!=="uploaded_at_desc"&&o.set("sort",s),d>1&&o.set("page",String(d)),c)return o.set("q",c),i&&o.set("game",i),`/search?${o.toString()}`;if(i){let p=o.toString();return`/game/${encodeURIComponent(i)}${p?`?${p}`:""}`}let u=o.toString();return u?`/search?${u}`:"/"}function es(e,t,n){let a=Math.max(1,Number(t.page||1)),o=!!e?.has_more;return a<=1&&!o?"":r`<nav class="pager" aria-label="Public clip pages">
    <button class="btn" type="button" disabled=${a<=1}
      onClick=${()=>n({page:a-1})}>Previous</button>
    <span class="muted">Page ${a}</span>
    <button class="btn" type="button" disabled=${!o}
      onClick=${()=>n({page:a+1})}>Next</button>
  </nav>`}X();function Fn(){let[e,t]=f(null),[n,a]=f(null);return C(()=>{let o=!0;return k("/api/v1/public/games").then(s=>o&&t(s.games||[])).catch(s=>o&&a(s)),()=>{o=!1}},[]),n?r`<main class="page">
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
  </main>`}X();function zn({trigger:e,content:t,onClose:n,label:a,panelClass:o=""}){let[s,i]=f(!1),c=z(null),d=z(null),u=z(null),p=()=>{i(!1),n?.()},b=()=>{if(s){p();return}u.current=document.activeElement,i(!0)};return C(()=>{if(!s)return;let l=$=>{c.current?.contains($.target)||p()},m=$=>{$.key==="Escape"&&p()};return document.addEventListener("pointerdown",l),document.addEventListener("keydown",m),d.current?.querySelector("input, select, textarea, button, a[href], [tabindex]")?.focus(),()=>{document.removeEventListener("pointerdown",l),document.removeEventListener("keydown",m),u.current?.focus?.()}},[s]),r`<div class="popover-wrap" ref=${c}>
    ${e({open:s,toggle:b})}
    ${s&&r`<div class=${`popover ${o}`} ref=${d} role="dialog" aria-label=${a||"Filters"}>
      ${t}
    </div>`}
  </div>`}function Bn({count:e,busy:t=!1,onPublic:n,onPrivate:a,onCopyLinks:o,onDelete:s,onClear:i}){return e?r`<div class="bulkbar" role="toolbar" aria-label="Bulk actions" aria-busy=${t?"true":"false"}>
    <b>${e} selected</b>
    <button class="btn" disabled=${t} onClick=${n}>Make public</button>
    <button class="btn" disabled=${t} onClick=${a}>Make private</button>
    <button class="btn" disabled=${t} onClick=${o}>Copy links</button>
    <button class="btn btn-danger" disabled=${t} onClick=${s}>Delete</button>
    <button class="btn bulk-x" disabled=${t} aria-label="Clear selection" onClick=${i}>✕</button>
  </div>`:null}function le({open:e,title:t,body:n,confirmLabel:a="Confirm",onConfirm:o,onCancel:s,danger:i=!1,confirmDisabled:c=!1}){let d=z(null),u=z(null);return C(()=>{let p=d.current;p&&(e&&!p.open?(p.showModal(),u.current?.focus()):!e&&p.open&&p.close())},[e]),r`<dialog ref=${d} class="confirm-dialog" aria-labelledby="confirm-dialog-title"
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
  </dialog>`}var Hn="clipline.libraryView",ts=[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["updated_at_desc","Updated newest"],["updated_at_asc","Updated oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["size_desc","Size largest"],["size_asc","Size smallest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]],tt={title:["title_asc","title_desc"],size:["size_asc","size_desc"],duration:["duration_asc","duration_desc"],uploaded:["uploaded_at_asc","uploaded_at_desc"]},ns=["visibility","status","source_type","from","to","min_duration_seconds","max_duration_seconds","min_size_mib","max_size_mib"],st={sort:"uploaded_at_desc",game:"",source_type:"",visibility:"",status:"",q:"",from:"",to:"",min_duration_seconds:"",max_duration_seconds:"",min_size_mib:"",max_size_mib:""};function nt(e){if(e===""||e==null)return null;let t=Number(e);return Number.isFinite(t)?t:null}function as(e){let t=new URLSearchParams;t.set("sort",e.sort||st.sort),t.set("page_size","100");for(let i of["game","source_type","visibility","status","q"])e[i]&&t.set(i,e[i]);e.from&&t.set("from",`${e.from}T00:00:00Z`),e.to&&t.set("to",`${e.to}T23:59:59Z`);let n=nt(e.min_duration_seconds);n!=null&&t.set("min_duration_ms",String(Math.round(n*1e3)));let a=nt(e.max_duration_seconds);a!=null&&t.set("max_duration_ms",String(Math.round(a*1e3)));let o=nt(e.min_size_mib);o!=null&&t.set("min_size_bytes",String(Math.round(o*1024*1024)));let s=nt(e.max_size_mib);return s!=null&&t.set("max_size_bytes",String(Math.round(s*1024*1024))),t}function ss(e){return ns.reduce((t,n)=>t+(e[n]?1:0),0)}function os(e,t=6){let n=new Map;for(let a of e){let o=a.game_name;o&&n.set(o,(n.get(o)||0)+1)}return Array.from(n,([a,o])=>({game:a,count:o})).sort((a,o)=>o.count-a.count||a.game.localeCompare(o.game)).slice(0,t)}function On(e,t,{verb:n,allFailedMessage:a}){let o=e.filter(i=>!t.some(c=>c.id===i));if(!t.length)return{succeeded:o,message:null};let s=t.length===e.length?t[0]?.message||a:`Couldn't ${n} ${t.length} of ${e.length} clips.`;return{succeeded:o,message:s}}function rs(e,t){return(e||[]).map(n=>Re(n.public_url,t,n.public_share_id)).filter(Boolean)}async function Vn(e,t,n){let a=0;async function o(){let s=a++;if(!(s>=e.length))return await n(e[s]),o()}await Promise.all(Array.from({length:Math.min(t,e.length)},o))}function is(){try{return localStorage.getItem(Hn)==="rows"?"rows":"grid"}catch{return"grid"}}function qn(){let[e,t]=f(is),[n,a]=f(st),[o,s]=f(st.q),[i,c]=f(null),[d,u]=f(null),[p,b]=f(new Set),[l,m]=f(!1),[h,$]=f(!1),[x,S]=f(0),y=z(null);C(()=>()=>clearTimeout(y.current),[]),C(()=>{let g=!0;return c(null),u(null),k(`/api/v1/clips?${as(n)}`).then(T=>{g&&(c(T),b(new Set))}).catch(T=>g&&u(T)),()=>{g=!1}},[JSON.stringify(n),x]);let E=g=>{t(g);try{localStorage.setItem(Hn,g)}catch{}},B=()=>S(g=>g+1),G=g=>{let T=g.target.value;s(T),clearTimeout(y.current),y.current=setTimeout(()=>{a(v=>({...v,q:T}))},300)},F=g=>T=>{let v=T.target.value;a(P=>({...P,[g]:v}))},se=()=>{a(g=>({...g,visibility:"",status:"",source_type:"",from:"",to:"",min_duration_seconds:"",max_duration_seconds:"",min_size_mib:"",max_size_mib:""}))},ee=g=>a(T=>({...T,game:T.game===g?"":g})),ne=g=>a(T=>({...T,sort:g})),N=g=>{b(T=>{let v=new Set(T);return v.has(g)?v.delete(g):v.add(g),v})};function J(g,T){c(v=>v&&{...v,clips:v.clips.map(P=>P.id===g?{...P,...T}:P)})}function Se(g,T){let v=new Set(g);c(P=>P&&{...P,clips:P.clips.map(R=>v.has(R.id)?{...R,...T}:R)})}async function ie(g){if(l)return;let T=Array.from(p);if(!T.length)return;let v=i?.clips||[],P=new Map(T.map(U=>[U,v.find(te=>te.id===U)]));m(!0),Se(T,{visibility:g});let R=[],L=new Map;try{await Vn(T,4,async me=>{try{let ae=await k(`/api/v1/clips/${encodeURIComponent(me)}/visibility`,{method:"POST",body:{visibility:g}}),_={visibility:ae.visibility,public_url:ae.public_url,public_share_id:ae.public_share_id};J(me,_),L.set(me,_)}catch(ae){R.push({id:me,message:ae.message})}});let{succeeded:U,message:te}=On(T,R,{verb:"update",allFailedMessage:"Couldn't update visibility."});if(te){for(let{id:me}of R){let ae=P.get(me);ae&&J(me,{visibility:ae.visibility,public_url:ae.public_url,public_share_id:ae.public_share_id})}w(te)}U.length&&(b(new Set),w(`Made ${U.length} clip${U.length===1?"":"s"} ${g}`,{actionLabel:"Undo",onAction:()=>ce(U,P,L)}))}finally{m(!1)}}async function ce(g,T,v){for(let L of g){let U=T.get(L);U&&J(L,{visibility:U.visibility,public_url:U.public_url,public_share_id:U.public_share_id})}let P=[];await Vn(g,4,async L=>{let U=T.get(L);if(U)try{let te=await k(`/api/v1/clips/${encodeURIComponent(L)}/visibility`,{method:"POST",body:{visibility:U.visibility}});J(L,{visibility:te.visibility,public_url:te.public_url,public_share_id:te.public_share_id})}catch(te){P.push({id:L,message:te.message})}});let{message:R}=On(g,P,{verb:"undo",allFailedMessage:"Couldn't undo visibility change."});if(R){for(let{id:L}of P){let U=v.get(L);U&&J(L,U)}w(R)}}async function ve(){if(l){w("Wait for visibility changes to finish.");return}let g=Array.from(p),T=i?.clips||[],v=g.map(L=>T.find(U=>U.id===L)).filter(Boolean),P=rs(v,window.location.origin),R=v.length-P.length;if(!P.length){w("No links to copy \u2014 selected clips are private.");return}try{await navigator.clipboard.writeText(P.join(`
`)),w(`Copied ${P.length} link${P.length===1?"":"s"}`+(R?` (${R} skipped, private)`:""))}catch{w("Couldn't copy links to clipboard.")}}async function ge(){let g=Array.from(p);$(!1);try{let T=await k("/api/v1/clips/bulk-delete",{method:"POST",body:{ids:g}});b(new Set),B(),w(`Deleted ${T.affected} clip${T.affected===1?"":"s"}.`)}catch(T){w(T.message)}}if(d)return r`<main class="page">
      <${Z} name="alert" title="Couldn't load your library" body=${d.message} />
    </main>`;let Y=i?.clips,oe=ss(n),ue=!!(n.q||n.game)||oe>0,de=os(Y||[]),pe=(Y||[]).reduce((g,T)=>g+(T.file_size_bytes||0),0),Ce=r`<div class="popover-fields">
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
      <button type="button" class="btn" onClick=${se}>Clear filters</button>
    </div>
  </div>`;return r`<main class="page">
    <div class="lib-header">
      <div>
        <h1>Library</h1>
        <p>${(Y||[]).length} clip${(Y||[]).length===1?"":"s"} · ${K(pe)} used</p>
      </div>
      <div class="seg" role="group" aria-label="View">
        <button type="button" class=${`seg-item ${e==="grid"?"seg-on":""}`}
          aria-pressed=${e==="grid"} onClick=${()=>E("grid")}>Grid</button>
        <button type="button" class=${`seg-item ${e==="rows"?"seg-on":""}`}
          aria-pressed=${e==="rows"} onClick=${()=>E("rows")}>Rows</button>
      </div>
    </div>

    <div class="lib-toolbar">
      <input class="input" type="search" aria-label="Search clips" placeholder="Search title or game"
        value=${o} onInput=${G} />
      <select class="input" aria-label="Sort" value=${n.sort} onChange=${g=>ne(g.target.value)}>
        ${ts.map(([g,T])=>r`<option value=${g}>${T}</option>`)}
      </select>
      <${zn}
        label="Filters"
        panelClass="popover-filters"
        trigger=${({open:g,toggle:T})=>r`<button type="button" class="btn" aria-haspopup="dialog"
          aria-expanded=${g} onClick=${T}>
          ${M("sliders",{size:14})} Filters
          ${oe>0&&r`<span class="filter-badge">${oe}</span>`}
        </button>`}
        content=${Ce} />
    </div>

    ${de.length>0&&r`<div class="lib-chips">
      <button type="button" class=${`chip ${n.game?"":"chip-on"}`} aria-pressed=${!n.game}
        onClick=${()=>ee("")}>All</button>
      ${de.map(g=>r`<button type="button" class=${`chip ${n.game===g.game?"chip-on":""}`}
        aria-pressed=${n.game===g.game} onClick=${()=>ee(g.game)}>${g.game}</button>`)}
    </div>`}

    ${Y==null?r`<${cs} />`:Y.length===0?ue?r`<${Z} name="film" title="No clips match this view"
            body="Try a different search, game, or clear your filters."
            action=${r`<button type="button" class="btn" onClick=${()=>{a(st),s("")}}>Clear filters</button>`} />`:r`<${Z} name="upload" title="Connect the Clipline desktop app to start uploading"
            body="New clips uploaded from the desktop app will show up here."
            action=${r`<a class="btn" href="/about">Learn more</a>`} />`:e==="grid"?r`<div class=${`card-grid ${p.size>0?"selecting":""}`}>
          ${Y.map(g=>r`<${we} key=${g.id}
            clip=${{...g,thumbnail_url:Ee(g),media_url:Xe(g)}}
            href=${`/clip/${encodeURIComponent(g.id)}`}
            selectable selected=${p.has(g.id)} onToggleSelect=${N} showVisibility />`)}
        </div>`:r`<${ls} clips=${Y} query=${n} onSort=${ne}
          selected=${p} onToggleSelect=${N} />`}

    <${Bn} count=${p.size} busy=${l}
      onPublic=${()=>ie("public")}
      onPrivate=${()=>ie("private")}
      onCopyLinks=${ve}
      onDelete=${()=>$(!0)}
      onClear=${()=>b(new Set)} />

    <${le} open=${h}
      title=${`Delete ${p.size} clip${p.size===1?"":"s"}?`}
      body="Public links stop working immediately."
      confirmLabel="Delete" danger
      onConfirm=${ge}
      onCancel=${()=>$(!1)} />
  </main>`}function at(e,[t,n]){let a=e.sort===t?"ascending":e.sort===n?"descending":"none",o=e.sort===n?t:n;return{ariaSort:a,next:o}}function ls({clips:e,query:t,onSort:n,selected:a,onToggleSelect:o}){let s=at(t,tt.title),i=at(t,tt.size),c=at(t,tt.duration),d=at(t,tt.uploaded);return r`<table class="lib-table">
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
        <td><img class="row-thumb" src=${Ee(u)} alt="" width="64" height="36" loading="lazy" /></td>
        <td><a href=${`/clip/${encodeURIComponent(u.id)}`}>${u.title}</a></td>
        <td>${u.game_name||"\u2014"}</td>
        <td><span class=${`badge badge-${u.visibility}`}>${u.visibility}</span></td>
        <td>${K(u.file_size_bytes)}</td>
        <td>${be(u.duration_ms)}</td>
        <td>${j(u.uploaded_at)}</td>
      </tr>`)}
    </tbody>
  </table>`}function cs({count:e=8}){return r`<div class="card-grid">
    ${Array.from({length:e},(t,n)=>r`<div class="clip-card" key=${n}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`}X();var us={ChampionKill:"kill",FirstBlood:"kill",Multikill:"spree",Ace:"spree",DragonKill:"objective",HeraldKill:"objective",BaronKill:"objective",TurretKilled:"structure",InhibKilled:"structure",FirstBrick:"structure"};function Gn(e){let t=Number(e);return Number.isFinite(t)&&t>0?t/1e3:0}function Wn(e,t){let n=Number.isFinite(e)?e:0,a=t>0?t:Number.MAX_SAFE_INTEGER;return Math.max(0,Math.min(a,n))}function ot(e,t){return t>0?Math.max(0,Math.min(100,e/t*100)):0}function Mt(e){if(!Number.isFinite(e))return"0:00";let t=Math.max(0,Math.round(e)),n=Math.floor(t/60),a=t-n*60;return`${n}:${String(a).padStart(2,"0")}`}function Kn(e){if(!Number.isFinite(e))return"0:00.0";let t=Math.max(0,Math.round(e*10)),n=Math.floor(t/600),a=t-n*600,o=Math.floor(a/10);return`${n}:${String(o).padStart(2,"0")}.${a%10}`}function jn(e,t){return`${Kn(e)} / ${t>0?Kn(t):"0:00.0"}`}function ds(e){return us[e]||"info"}function Zn(e,t){return(e||[]).map((n,a)=>{let o=Number(n.timestamp_ms);if(!Number.isFinite(o))return null;let s=o/1e3;return s<0||t>0&&s>t?null:{index:a,time:s,kind:String(n.kind||"Marker"),label:String(n.label||n.kind||"Marker"),category:ds(n.kind)}}).filter(Boolean).sort((n,a)=>n.time-a.time)}function Jn(e,t){if(!e.length)return null;for(let n of e)if(n.time>t+.05)return n;return e[0]}function Yn(e,t){if(!e.length)return null;for(let n=e.length-1;n>=0;n-=1)if(e[n].time<t-.05)return e[n];return e[e.length-1]}function Xn(e,t){switch(e){case"Space":case"KeyK":return{kind:"toggle-play"};case"ArrowLeft":return{kind:"seek-by",seconds:t?-1:-5};case"ArrowRight":return{kind:"seek-by",seconds:t?1:5};case"KeyJ":return{kind:"seek-by",seconds:-10};case"KeyL":return{kind:"seek-by",seconds:10};case"Comma":return{kind:"seek-by",seconds:-.1};case"Period":return{kind:"seek-by",seconds:.1};case"KeyM":return{kind:t?"previous-marker":"next-marker"};case"Home":return{kind:"seek-to",seconds:0};case"End":return{kind:"seek-to-end"};case"KeyF":return{kind:"fullscreen"};case"KeyT":return{kind:"theater"};default:return null}}var ea="clipline.playerVolume",ta="clipline.clipTheaterMode",ps=2e3,ms=[.25,.5,.75,1,1.25,1.5,2];function fs(e,t){switch(e){case"KeyM":return{kind:"toggle-mute"};case"KeyF":return{kind:"theater"};case"Escape":return{kind:"exit-theater"};default:return Xn(e,t)}}function _s(e){return e instanceof Element?!!e.closest("input, textarea, select, button, a, [contenteditable='true'], [contenteditable='']"):!1}function hs(){try{let e=window.localStorage.getItem(ea);if(e==null)return 1;let t=Number(e);return Number.isFinite(t)?Math.max(0,Math.min(1,t)):1}catch{return 1}}function Qn(e){try{window.localStorage.setItem(ea,String(Math.max(0,Math.min(1,e))))}catch{}}function bs(){try{return window.localStorage.getItem(ta)==="true"}catch{return!1}}function vs(e){try{window.localStorage.setItem(ta,String(e))}catch{}}function na({src:e,poster:t,durationMs:n,markers:a}){let o=z(null),s=z(null),i=z(null),c=z(!1),d=z(!1),u=Gn(n),[p,b]=f(!1),[l,m]=f(0),[h,$]=f(u),[x,S]=f(0),[y,E]=f(hs),[B,G]=f(!1),[F,se]=f(1),[ee,ne]=f(!1),[N,J]=f(bs),[Se,ie]=f(!0),[ce,ve]=f(null),[ge,Y]=f(""),oe=Zn(a,h);function ue(){ie(!0),window.clearTimeout(i.current),i.current=window.setTimeout(()=>{let _=o.current;_&&!_.paused&&!_.ended&&ie(!1)},ps)}C(()=>{p||(window.clearTimeout(i.current),ie(!0))},[p]),C(()=>{let _=o.current;if(!_)return;let D=()=>Number.isFinite(_.duration)&&_.duration>0?_.duration:u,O=()=>$(D()),Dt=()=>$(D()),Ut=()=>{c.current||m(_.currentTime||0)},Lt=()=>{let Bt=D();if(!(Bt>0)||!_.buffered?.length){S(0);return}let Ot=_.currentTime||0,Ue=0;for(let Le=0;Le<_.buffered.length;Le+=1){let xa=_.buffered.start(Le),ut=_.buffered.end(Le);if(Ot>=xa&&Ot<=ut){Ue=ut;break}Ue=Math.max(Ue,ut)}S(ot(Ue,Bt))},It=()=>{b(!0),Y(""),ue()},At=()=>b(!1),Nt=()=>b(!1),Ft=()=>{E(_.volume),G(_.muted||_.volume===0)},zt=()=>Y("Playback unavailable");return _.addEventListener("loadedmetadata",O),_.addEventListener("durationchange",Dt),_.addEventListener("timeupdate",Ut),_.addEventListener("progress",Lt),_.addEventListener("play",It),_.addEventListener("pause",At),_.addEventListener("ended",Nt),_.addEventListener("volumechange",Ft),_.addEventListener("error",zt),()=>{_.removeEventListener("loadedmetadata",O),_.removeEventListener("durationchange",Dt),_.removeEventListener("timeupdate",Ut),_.removeEventListener("progress",Lt),_.removeEventListener("play",It),_.removeEventListener("pause",At),_.removeEventListener("ended",Nt),_.removeEventListener("volumechange",Ft),_.removeEventListener("error",zt)}},[e,u]),C(()=>{o.current&&(o.current.volume=y)},[y]),C(()=>{o.current&&(o.current.muted=B)},[B]),C(()=>{o.current&&(o.current.playbackRate=F)},[F]),C(()=>{if(document.documentElement.classList.toggle("clipline-theater",N),N){let _=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=_}}},[N]),C(()=>()=>document.documentElement.classList.remove("clipline-theater"),[]);function de(_){J(_),vs(_)}function pe(_){let D=o.current;if(!D)return;let O=h>0?Wn(_,h):Math.max(0,_);D.currentTime=O,m(O)}function Ce(_){pe((o.current?.currentTime||0)+_)}async function g(){let _=o.current;if(_)if(_.paused||_.ended)try{await _.play()}catch(D){Y(D?.message||"Playback failed")}else _.pause()}function T(){let _=o.current;_&&(_.muted||_.volume===0?(_.muted=!1,_.volume===0&&(_.volume=1,E(1),Qn(1)),G(!1)):(_.muted=!0,G(!0)))}function v(_){let D=Number(_.target.value);E(D),G(D===0),Qn(D);let O=o.current;O&&(O.volume=D,O.muted=D===0)}async function P(){try{document.fullscreenElement?await document.exitFullscreen():await s.current?.requestFullscreen?.()}catch(_){Y(_?.message||"Fullscreen unavailable")}}function R(_){let D=o.current?.currentTime||0,O=_>0?Jn(oe,D):Yn(oe,D);O&&pe(O.time)}function L(){c.current=!0,d.current=p,p&&o.current?.pause()}function U(_){let D=Number(_.target.value);m(D),pe(D)}function te(){c.current&&(c.current=!1,d.current&&(d.current=!1,o.current?.play().catch(()=>{})))}function me(_){let D=_.currentTarget.getBoundingClientRect();if(!(D.width>0))return;let O=Math.max(0,Math.min(1,(_.clientX-D.left)/D.width));ve({pct:O*100,time:O*(h||0)})}function ae(){ve(null)}return C(()=>{function _(D){if(D.defaultPrevented||_s(D.target))return;let O=fs(D.code,D.shiftKey);if(O&&!(O.kind==="exit-theater"&&!N))switch(D.preventDefault(),ue(),O.kind){case"toggle-play":g();break;case"seek-by":Ce(O.seconds);break;case"seek-to":pe(O.seconds);break;case"seek-to-end":pe(h);break;case"next-marker":R(1);break;case"previous-marker":R(-1);break;case"toggle-mute":T();break;case"theater":de(!N);break;case"exit-theater":de(!1);break;case"fullscreen":P();break;default:break}}return document.addEventListener("keydown",_),()=>document.removeEventListener("keydown",_)},[h,N,p]),r`<div class=${`player ${Se?"":"chrome-hidden"}`} ref=${s}
      onPointerMove=${ue} onPointerEnter=${ue}
      onPointerLeave=${()=>{let _=o.current;_&&!_.paused&&ie(!1)}}
      onFocusIn=${()=>ie(!0)}>
    <video ref=${o} class="player-video" src=${e} poster=${t||void 0}
      preload="metadata" playsinline onClick=${g}></video>
    ${ge&&r`<div class="player-note">${ge}</div>`}
    <div class="player-overlay">
      <div class="player-timeline" onPointerMove=${me} onPointerLeave=${ae}>
        <div class="player-buffered" style=${`width:${x}%`}></div>
        <div class="player-progress" style=${`width:${ot(l,h)}%`}></div>
        ${oe.map(_=>r`<span class="player-marker-tick" key=${_.index}
            style=${`left:${ot(_.time,h)}%`} title=${`${_.label} @ ${Mt(_.time)}`}></span>`)}
        <input class="player-scrubber" type="range" min="0" max=${h>0?h:0} step="0.01"
          value=${l} disabled=${!(h>0)} aria-label="Seek"
          onPointerDown=${L} onInput=${U} onChange=${te}
          onPointerUp=${te} onPointerCancel=${te} onLostPointerCapture=${te} />
        ${ce&&r`<div class="player-hover-time" style=${`left:${ce.pct}%`}>${Mt(ce.time)}</div>`}
      </div>
      <div class="player-controls">
        ${oe.length>0&&r`<div class="player-cluster">
          <button type="button" class="player-btn" title="Previous marker" aria-label="Previous marker"
            onClick=${()=>R(-1)}>${M("skipBack",{size:14})}</button>
          <button type="button" class="player-btn" title="Next marker" aria-label="Next marker"
            onClick=${()=>R(1)}>${M("skipForward",{size:14})}</button>
        </div>`}
        <button type="button" class="player-btn player-play" aria-label=${p?"Pause":"Play"} onClick=${g}>
          ${M(p?"pause":"play",{size:16})}
        </button>
        <span class="player-time">${jn(l,h)}</span>
        <div class="player-spacer"></div>
        <div class="player-speed-wrap">
          <button type="button" class="player-btn player-speed" aria-haspopup="menu" aria-expanded=${ee}
            onClick=${()=>ne(_=>!_)}>${F}×</button>
          ${ee&&r`<div class="player-speed-menu" role="menu">
            ${ms.map(_=>r`<button type="button" role="menuitem" key=${_}
                class=${`player-speed-item ${_===F?"is-active":""}`}
                onClick=${()=>{se(_),ne(!1)}}>${_}×</button>`)}
          </div>`}
        </div>
        <button type="button" class="player-btn" aria-label=${B?"Unmute":"Mute"} onClick=${T}>
          ${M(B?"volumeX":"volume2",{size:14})}
        </button>
        <input class="player-volume" type="range" min="0" max="1" step="0.01" value=${B?0:y}
          aria-label="Volume" onInput=${v} />
        <button type="button" class="player-btn" aria-label=${N?"Exit theater mode":"Theater mode"}
          aria-pressed=${N} onClick=${()=>de(!N)}>${M("theater",{size:14})}</button>
        <button type="button" class="player-btn" aria-label="Fullscreen" onClick=${P}>
          ${M("fullscreen",{size:14})}
        </button>
      </div>
    </div>
  </div>`}X();function $s(e){let t=new Map(e.map(s=>[s.id,s])),n=new Map,a=[],o=0;return e.forEach(s=>{let i=s.parent_comment_id||"";i&&t.has(i)?(n.has(i)||n.set(i,[]),n.get(i).push(s),o+=1):i||(a.push(s),o+=1)}),{roots:a,repliesByParent:n,count:o}}function gs(e){return(e||"?").trim().slice(0,1).toUpperCase()||"?"}function ys(e){let t=e.author_avatar_url;return typeof t=="string"&&t.startsWith("/")?r`<img class="comment-avatar" src=${t} alt="" />`:r`<div class="comment-avatar">${gs(e.author_name)}</div>`}function aa({shareId:e}){let{user:t}=q(I),[n,a]=f(null),[o,s]=f(""),[i,c]=f(null),[d,u]=f(""),[p,b]=f(null);function l(){k(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`).then(y=>a(y.comments||[])).catch(()=>a([]))}C(()=>{let y=!0;return a(null),k(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`).then(E=>y&&a(E.comments||[])).catch(()=>y&&a([])),()=>{y=!1}},[e]);async function m(y,E){let B=y.trim();if(B)try{await k(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`,{method:"POST",body:E?{body:B,parent_comment_id:E}:{body:B}}),l()}catch(G){w(G.message)}}async function h(y){y.preventDefault(),await m(o),s("")}async function $(y,E){y.preventDefault(),await m(d,E),u(""),c(null)}async function x(){let y=p;b(null);try{await k(`/api/v1/public/clips/${encodeURIComponent(e)}/comments/${encodeURIComponent(y)}`,{method:"DELETE"}),l()}catch(E){w(E.message)}}let S=$s(n||[]);return r`<section class="comments">
    <div class="comments-header"><h2>Comments</h2><span class="muted">${S.count}</span></div>
    ${t?r`<form class="comment-form" onSubmit=${h}>
          <textarea rows="3" maxlength="2000" placeholder="Add a comment" value=${o}
            onInput=${y=>s(y.target.value)}></textarea>
          <div class="comment-form-actions">
            <button type="submit" class="btn btn-primary">${M("message",{size:14})} Post comment</button>
          </div>
        </form>`:r`<p class="comment-signin"><a href="/login">Sign in</a> to comment.</p>`}
    ${n==null?"":S.count===0?r`<p class="comment-signin">No comments yet.</p>`:r`<div class="comment-list">
          ${S.roots.map(y=>sa(y,{depth:0,repliesByParent:S.repliesByParent,user:t,replyOpenId:i,setReplyOpenId:c,replyDraft:d,setReplyDraft:u,submitReply:$,onDelete:b}))}
        </div>`}
    <${le} open=${p!=null} title="Delete this comment?"
      body="This removes the comment from the public clip page." confirmLabel="Delete" danger
      onConfirm=${x} onCancel=${()=>b(null)} />
  </section>`}function sa(e,t){let{depth:n,repliesByParent:a,user:o,replyOpenId:s,setReplyOpenId:i,replyDraft:c,setReplyDraft:d,submitReply:u,onDelete:p}=t,b=a.get(e.id)||[];return r`<article class="comment" key=${e.id}>
    ${ys(e)}
    <div class="comment-body">
      <div class="comment-head">
        ${e.author_username?r`<a href=${`/u/${encodeURIComponent(e.author_username)}`}>${e.author_name}</a>`:r`<strong>${e.author_name}</strong>`}
        ${e.is_uploader&&r`<span class="comment-badge">Uploader</span>`}
        <span>${Ye(e.created_at)}</span>
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
      ${b.length>0&&r`<div class="comment-replies">
        ${b.map(l=>sa(l,{...t,depth:n+1}))}
      </div>`}
    </div>
  </article>`}var ks=["private","public","unlisted"];function ws(e,t){return e==="clip"?!0:!!t?.viewer_can_edit}function xs(e,t,n){return e==="public"?t.shareId:n?.public_share_id||null}function Ss(e,t,n){return e==="clip"?t.clipId:n?.viewer_clip_id||null}function Cs(e){let t=e?.height!=null?e.height:"",n=Math.round(e?.fps||0)||"";return`${t}p${n}`}function Ts(e,t,n=8){return(e||[]).filter(a=>a.share_id!==t).slice(0,n)}function Pt({route:e}){let{user:t}=q(I),[n,a]=f(null),[o,s]=f(null),[i,c]=f([]),[d,u]=f(!1),[p,b]=f(""),[l,m]=f(!1),[h,$]=f(""),[x,S]=f(!1),[y,E]=f(!1),[B,G]=f(!1),F=e.name==="clip"?`clip:${e.clipId}`:`public:${e.shareId}`;if(C(()=>{let v=!0;a(null),s(null),u(!1),m(!1),G(!1),S(!1);let P=e.name==="clip"?`/api/v1/clips/${encodeURIComponent(e.clipId)}`:`/api/v1/public/clips/${encodeURIComponent(e.shareId)}`;return k(P).then(R=>{v&&(a(R),e.name==="public"&&k(`/api/v1/public/clips/${encodeURIComponent(e.shareId)}/view`,{method:"POST",body:{}}).then(L=>v&&a(U=>U&&{...U,view_count:L.view_count})).catch(()=>{}))}).catch(R=>v&&s(R)),()=>{v=!1}},[F]),C(()=>{let v=!0;return k("/api/v1/public/clips").then(P=>v&&c(P.clips||[])).catch(()=>{}),()=>{v=!1}},[F]),o)return r`<main class="page"><${Z} name="alert" title="Couldn't load this clip" body=${o.message} /></main>`;if(!n)return r`<main class="page watch"><div><div class="skeleton-thumb"></div></div><aside class="upnext"></aside></main>`;let se=ws(e.name,n),ee=xs(e.name,e,n),ne=Ss(e.name,e,n),N=e.name==="clip"?Xe({id:n.id}):ke({share_id:e.shareId}),J=e.name==="clip"?Ee({id:n.id}):re({share_id:e.shareId}),Se=e.name==="clip"?t?.display_name||t?.username||"You":n.author_name||"Unknown creator",ie=n.public_url??n.share_url??null,ce=Re(ie,window.location.origin,ee),ve=e.name==="clip";function ge(){b(n.title),u(!0)}async function Y(v){v?.preventDefault?.();let P=p.trim();if(!P||P===n.title){u(!1);return}try{await k(`/api/v1/clips/${encodeURIComponent(ne)}`,{method:"PATCH",body:{title:P}}),a(R=>({...R,title:P})),u(!1),w("Title saved.")}catch(R){w(R.message)}}function oe(){$(n.description||""),m(!0)}async function ue(){let v=h.trim();try{await k(`/api/v1/clips/${encodeURIComponent(ne)}`,{method:"PATCH",body:{description:v||null}}),a(P=>({...P,description:v||null})),m(!1),w("Description saved.")}catch(P){w(P.message)}}async function de(v,{force:P=!1}={}){let R=n.visibility;if(!(R===v&&!P)){a(L=>({...L,visibility:v}));try{let L=await k(`/api/v1/clips/${encodeURIComponent(ne)}/visibility`,{method:"POST",body:{visibility:v}});a(U=>({...U,visibility:L.visibility,public_url:L.public_url,public_share_id:L.public_share_id})),w(`Visibility set to ${v}.`,{actionLabel:"Undo",onAction:()=>de(R,{force:!0})})}catch(L){a(U=>({...U,visibility:R})),w(L.message)}}}async function pe(){if(ce)try{await navigator.clipboard.writeText(ce),w("Link copied.")}catch{w("Couldn't copy the link.")}}async function Ce(){E(!1);try{await k(`/api/v1/clips/${encodeURIComponent(ne)}`,{method:"DELETE"}),w("Clip deleted."),W("/library")}catch(v){w(v.message)}}let g=[n.game_name&&r`<a class="chip chip-on" href=${`/game/${encodeURIComponent(n.game_name)}`}>${n.game_name}</a>`,$e(n.view_count),`Recorded ${j(n.recorded_at)}`,`by ${Se}`].filter(Boolean),T=Ts(i,ee,8);return r`<main class="page watch">
    <div>
      <${na} src=${N} poster=${J} durationMs=${n.duration_ms} markers=${n.markers} />
      <div class="watch-titlerow">
        ${d?r`<input class="input watch-title-input" value=${p} autofocus
              onInput=${v=>b(v.target.value)} onBlur=${Y}
              onKeyDown=${v=>{v.key==="Enter"&&Y(v),v.key==="Escape"&&u(!1)}} />`:r`<h1>${n.title}
              ${se&&r`<button type="button" class="edit-pencil" aria-label="Edit title" onClick=${ge}
                >${M("edit",{size:14})}</button>`}</h1>`}
      </div>
      <p class="watch-meta">${g.map((v,P)=>r`${P>0?" \xB7 ":""}${v}`)}</p>

      ${se&&r`<div class="watch-actions">
        <div class="seg" role="radiogroup" aria-label="Visibility">
          ${ks.map(v=>r`<button type="button" role="radio" key=${v} aria-checked=${n.visibility===v}
              class=${`seg-item ${n.visibility===v?"seg-on":""}`} onClick=${()=>de(v)}
              >${v[0].toUpperCase()+v.slice(1)}</button>`)}
        </div>
        <button type="button" class="btn btn-primary" disabled=${!ce} onClick=${pe}>
          ${M("copy",{size:14})} Copy share link</button>
        <div class="watch-more">
          <button type="button" class="btn" aria-haspopup="menu" aria-expanded=${x}
            onClick=${()=>S(v=>!v)}>⋯</button>
          ${x&&r`<div class="menu" role="menu">
            <button type="button" class="menu-danger" role="menuitem"
              onClick=${()=>{S(!1),E(!0)}}>${M("trash",{size:14})} Delete clip</button>
          </div>`}
        </div>
      </div>`}

      <div class="watch-desc">
        ${l?r`<textarea class="input" rows="5" value=${h} autofocus
              onInput=${v=>$(v.target.value)} onBlur=${ue}
              onKeyDown=${v=>{v.key==="Enter"&&(v.ctrlKey||v.metaKey)&&ue(),v.key==="Escape"&&m(!1)}}></textarea>`:n.description?r`<p>${n.description}
              ${se&&r`<button type="button" class="edit-pencil" aria-label="Edit description" onClick=${oe}
                >${M("edit",{size:12})}</button>`}</p>`:se?r`<button type="button" class="watch-desc-add" onClick=${oe}>+ Add a description</button>`:""}
      </div>

      ${ve&&r`<button type="button" class="details-strip" aria-expanded=${B}
        onClick=${()=>G(v=>!v)}>
        <span><b>${be(n.duration_ms)}</b> length</span>
        <span><b>${K(n.file_size_bytes)}</b></span>
        <span><b>${Cs(n)}</b></span>
        <span><b>${n.video_codec}/${n.audio_codec}</b> ${n.container}</span>
        <span class="details-chev">${B?"\u25B4 less":"\u25BE more"}</span>
      </button>`}
      ${ve&&B&&r`<dl class="details-full">
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

      ${ee&&r`<${aa} shareId=${ee} />`}
    </div>
    <aside class="upnext">
      <h4 class="kicker">Up next</h4>
      ${T.map(v=>r`<a class="upnext-row" key=${v.share_id} href=${`/c/${encodeURIComponent(v.share_id)}`}>
          <img src=${re(v)} alt="" loading="lazy" />
          <span><b>${v.title}</b><small>${v.author_name} · ${v.game_name||"No game"} · ${$e(v.view_count)}</small></span>
        </a>`)}
    </aside>

    <${le} open=${y} title="Delete this clip?" body="Public links stop working immediately."
      confirmLabel="Delete" danger onConfirm=${Ce} onCancel=${()=>E(!1)} />
  </main>`}X();var Et=[{top:"4%",left:"4%",width:"34%",rotate:-7},{top:"0%",left:"44%",width:"30%",rotate:5},{top:"34%",left:"68%",width:"28%",rotate:-4},{top:"50%",left:"8%",width:"30%",rotate:6},{top:"62%",left:"42%",width:"26%",rotate:-5},{top:"26%",left:"-4%",width:"22%",rotate:9}];function Ms(e){return Array.isArray(e)?e.slice(0,Et.length).map((t,n)=>({clip:t,...Et[n]})):[]}function Ps(e){let t=e?.clips;if(!Array.isArray(t)||t.length===0)return null;let n=t.length,a=e.has_more?"+":"";return`${n}${a} clip${n===1?"":"s"} on this instance`}function Es({top:e,left:t,width:n,rotate:a}){return`top:${e};left:${t};width:${n};transform:rotate(${a}deg);`}function oa(e){let t=String(e||"").trim();return t||null}function Rs(){let[e,t]=f(null);C(()=>{let o=!0;return k(`/api/v1/public/clips?page_size=${Et.length}`).then(s=>o&&t(s)).catch(()=>o&&t(null)),()=>{o=!1}},[]);let n=Ms(e?.clips),a=Ps(e);return r`<aside class="login-montage" aria-hidden="true">
    ${n.length>0&&r`<div class="login-montage-tiles">
      ${n.map((o,s)=>r`<img key=${s} class="login-montage-tile" style=${Es(o)}
        src=${re(o.clip)} alt="" loading="lazy" />`)}
    </div>`}
    <div class="login-montage-copy">
      <h2>Your clips. Your server.</h2>
      ${a&&r`<p>${a}</p>`}
    </div>
  </aside>`}function xe({titleId:e,children:t}){return r`<div class="login-page">
    <${Rs} />
    <section class="login-panel" aria-labelledby=${e}>
      <div class="login-brand" aria-hidden="true">
        <img src="/clipline-icon.svg" alt="" width="32" height="32" />
        <span class="login-brand-word">CLIP<b>LINE</b></span>
        <span class="login-brand-descriptor">CLOUD</span>
      </div>
      ${t}
    </section>
  </div>`}function ra(){let{user:e}=q(I),[t,n]=f(""),[a,o]=f(""),[s,i]=f(""),[c,d]=f(!1);if(C(()=>{e&&W("/library")},[e]),e)return null;async function u(p){if(p.preventDefault(),!c){d(!0),i("");try{let b=await k("/api/v1/auth/login",{method:"POST",body:{username:t,password:a}});Pe(b.csrf_token),I.set({user:b.user,csrfToken:b.csrf_token,ready:!0}),W("/library")}catch(b){i(b instanceof he?b.message:"Sign in failed"),d(!1)}}}return r`<${xe} titleId="login-title">
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
  </${xe}>`}function ia({route:e}){let t=!!e.invite,[n,a]=f(()=>t?"preflight":e.token?"form":"missing-token"),[o,s]=f(""),[i,c]=f(t?null:e.token),[d,u]=f(""),[p,b]=f(!1),l=t;C(()=>{if(!t)return;if(!e.token){a("missing-token");return}let x=!0;return a("preflight"),k("/api/v1/invites/claim",{method:"POST",body:{invite_token:e.token}}).then(S=>{x&&(c(S.reset_token),a("form"))}).catch(S=>{x&&(s(S instanceof he?S.message:"This invite link is invalid, used, or expired."),a("invalid"))}),()=>{x=!1}},[t,e.token]);async function m(x){if(x.preventDefault(),p)return;b(!0),u("");let S=new FormData(x.currentTarget),y={reset_token:i,new_password:String(S.get("new_password")||"")};l&&(y.username=String(S.get("username")||""),y.display_name=oa(S.get("display_name")),y.email=oa(S.get("email")));try{await k("/api/v1/auth/reset-password",{method:"POST",body:y}),w(l?"Account created. Sign in with your new password.":"Password set. Sign in with your new password."),W("/login")}catch(E){u(E instanceof he?E.message:"Request failed"),b(!1)}}if(t&&n!=="form"){let x=n==="missing-token"||n==="invalid",S=n==="missing-token"?"This invite link is missing a token.":n==="invalid"?o:"Opening invite\u2026";return r`<${xe} titleId="invite-title">
      <h1 id="invite-title">Create account</h1>
      <p class="login-copy">${x?"This invite cannot be used.":"Preparing your account setup."}</p>
      ${x?r`<p class="form-error" role="alert">${S}</p>`:r`<p class="login-status">${S}</p>`}
    </${xe}>`}return r`<${xe} titleId="reset-title">
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
  </${xe}>`}X();function De({label:e,value:t,sub:n,meter:a,tone:o}){let s=o?` stat-${o}`:"";return r`<div class="stat-card">
    <p class="stat-label">${e}</p>
    <p class=${`stat-value${s}`}>${t}</p>
    ${n!=null&&r`<p class="stat-sub">${n}</p>`}
    ${a!=null&&r`<div class="stat-meter${s}">
      <span style=${`width:${Math.max(0,Math.min(1,a))*100}%`}></span>
    </div>`}
  </div>`}function Ds(e){let t=Number(e?.global_storage_warning_threshold_bytes||0);if(!t)return null;let n=Number(e?.total_storage_bytes||0);return Math.max(0,Math.min(1,n/t))}function Us(e){if(!e?.global_storage_warning_threshold_bytes)return"Disabled";let t=K(e.global_storage_warning_threshold_bytes);return e.global_storage_warning?`At or above ${t}`:`Below ${t}`}function Ls({deadJobs:e=[],failedUploads:t=[]}={}){let n=e.length+t.length;return{failedCount:n,healthy:n===0}}function Q(e,t){return r`<div><dt>${e}</dt><dd>${t??"Unknown"}</dd></div>`}function la({overview:e,deadJobs:t,failedUploads:n}){let a=Ds(e),{failedCount:o,healthy:s}=Ls({deadJobs:t,failedUploads:n}),i=e.global_storage_warning_threshold_bytes;return r`<div>
    <div class="stat-grid">
      <${De} label="Clips" value=${String(e.total_clips)} />
      <${De} label="Storage" value=${K(e.total_storage_bytes)}
        sub=${i?`${K(i)} warning threshold`:null}
        meter=${a} tone=${e.global_storage_warning?"danger":void 0} />
      <${De} label="Users" value=${String(e.total_users)} />
      <${De} label="Jobs" value=${s?"All healthy":String(o)}
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
        ${Q("Storage warning",Us(e))}
        ${Q("Upload TTL",`${e.upload_session_ttl_seconds}s`)}
        ${Q("Direct S3 uploads",e.direct_s3_uploads?"Enabled":"Disabled")}
        ${Q("Public media",`${e.public_media_mode}, ${e.public_read_url_ttl_seconds}s TTL`)}
      </dl>
    </div>
  </div>`}X();function rt(e){let t=String(e||"").trim();return t||null}function Is(e){let t=Number(String(e||"").trim());if(!Number.isFinite(t)||t<0)throw new Error("Storage quota must be a non-negative number");return Math.round(t*1024*1024*1024)}function As(e,t){return!(e.is_disabled||t?.id===e.id||e.role==="owner"||e.role==="admin"&&t?.role!=="owner")}function ca(e){return e?[["user","User"],["admin","Admin"]]:[["user","User"]]}function Ns({isOwner:e,onCreated:t}){let[n,a]=f(!1);async function o(s){if(s.preventDefault(),n)return;a(!0);let i=s.currentTarget,c=new FormData(i);try{await k("/api/v1/users",{method:"POST",body:{username:String(c.get("username")||""),display_name:rt(c.get("display_name")),email:rt(c.get("email")),password:rt(c.get("password")),role:String(c.get("role")||"user")}}),w("User created."),i.reset(),t()}catch(d){w(d.message)}finally{a(!1)}}return r`<form class="panel section" onSubmit=${o}>
    <h2>Create user</h2>
    <label class="field"><span>Username</span><input class="input" name="username" required /></label>
    <label class="field"><span>Display name</span><input class="input" name="display_name" placeholder="Optional" /></label>
    <label class="field"><span>Email</span><input class="input" name="email" type="email" placeholder="Optional" /></label>
    <label class="field"><span>Password</span><input class="input" name="password" type="password" required /></label>
    <label class="field"><span>Role</span>
      <select class="input" name="role">
        ${ca(e).map(([s,i])=>r`<option value=${s}>${i}</option>`)}
      </select>
    </label>
    <button class="btn btn-primary" type="submit" disabled=${n}>${M("plus",{size:14})} Create user</button>
  </form>`}function Fs({isOwner:e,smtpEnabled:t,onCreated:n}){let[a,o]=f(!1);async function s(i){if(i.preventDefault(),a)return;o(!0);let c=new FormData(i.currentTarget),d=i.submitter?.value==="email"?"email":"link";try{let u=await k("/api/v1/invites",{method:"POST",body:{role:String(c.get("role")||"user"),email:rt(c.get("email")),send_email:d==="email"}});w(d==="email"?"Invite sent.":"Invite link created."),n({...u,kind:"invite"})}catch(u){w(u.message)}finally{o(!1)}}return r`<form class="panel section" onSubmit=${s}>
    <h2>Invite link</h2>
    <label class="field"><span>Role</span>
      <select class="input" name="role">
        ${ca(e).map(([i,c])=>r`<option value=${i}>${c}</option>`)}
      </select>
    </label>
    <label class="field"><span>Email</span>
      <input class="input" name="email" type="email" placeholder=${t?"Optional":"SMTP disabled"} disabled=${!t} />
    </label>
    <div class="actions">
      <button class="btn" type="submit" name="intent" value="link" disabled=${a}>${M("copy",{size:14})} Generate link</button>
      ${t&&r`<button class="btn btn-primary" type="submit" name="intent" value="email" disabled=${a}>${M("message",{size:14})} Send email</button>`}
    </div>
  </form>`}function zs({resetLink:e}){if(!e)return null;let t=e.kind==="invite"?"Invite":"Reset",n=e.username?` for ${e.username}`:"",a=async()=>{try{await navigator.clipboard.writeText(e.reset_url),w("Copied to clipboard.")}catch{w("Copy failed. Select and copy the URL manually.")}};return r`<div class="notice admin-reset-link">
    <div>
      <strong>${t} link created${n}</strong>
      <span>Expires ${j(e.expires_at)}</span>
      <code>${e.reset_url}</code>
    </div>
    <button class="btn" type="button" onClick=${a}>${M("copy",{size:14})} Copy</button>
  </div>`}function Bs(e){return e.is_disabled?r`<span class="badge badge-warn">Disabled</span>`:r`<span class="badge badge-public">Active</span>`}function Os({user:e,currentUser:t,onQuota:n,onReset:a,onDisable:o}){let s=e.storage_quota_bytes!=null?K(e.storage_quota_bytes):"No limit",i=!As(e,t);return r`<tr>
    <td>
      <strong>${e.username}</strong>
      <div class="muted">${e.display_name||e.id}</div>
      ${e.email&&r`<div class="muted">${e.email}</div>`}
    </td>
    <td>${e.role}</td>
    <td>${Bs(e)}</td>
    <td>
      <strong>${K(e.storage_bytes||0)}</strong>
      <div class="muted">quota ${s}</div>
    </td>
    <td>${j(e.last_login_at)}</td>
    <td>
      <div class="actions">
        <button class="btn" type="button" onClick=${()=>n(e)}>${M("sliders",{size:14})} Quota</button>
        <button class="btn" type="button" onClick=${()=>a(e)}>${M("clipboard",{size:14})} Reset link</button>
        <button class="btn btn-danger" type="button" disabled=${i} onClick=${()=>o(e)}>${M("x",{size:14})} Disable</button>
      </div>
    </td>
  </tr>`}function ua({users:e,settings:t,currentUser:n,resetLink:a,setResetLink:o,reload:s}){let[i,c]=f(null),d=n?.role==="owner",u=!!t?.smtp_enabled,p=()=>c(null);async function b(){let{type:m,user:h,value:$}=i;p();try{if(m==="quota"){let x=$.trim()?Is($):null;await k(`/api/v1/users/${encodeURIComponent(h.id)}`,{method:"PATCH",body:{storage_quota_bytes:x}}),w("Storage quota updated.")}else if(m==="disable")await k(`/api/v1/users/${encodeURIComponent(h.id)}`,{method:"DELETE",body:{reauth_password:$}}),w("User disabled.");else if(m==="reset"){let x=await k(`/api/v1/users/${encodeURIComponent(h.id)}/reset-password`,{method:"POST",body:{reauth_password:$}});o({...x,kind:"reset"}),w("Reset link created.")}s()}catch(x){w(x.message)}}let l={quota:{title:"Set storage quota",description:"Enter a per-user storage limit in GiB. Leave it blank to remove the per-user limit.",confirmLabel:"Save quota",danger:!1,field:r`<label class="field"><span>Quota GiB</span>
        <input class="input" type="number" min="0" step="0.1" placeholder="No per-user limit"
          value=${i?.value||""} onInput=${m=>c(h=>({...h,value:m.target.value}))} /></label>`},disable:{title:"Disable user?",description:"This immediately revokes the user's sessions and device tokens.",confirmLabel:"Disable",danger:!0,field:r`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value||""}
          onInput=${m=>c(h=>({...h,value:m.target.value}))} /></label>`},reset:{title:"Create reset link?",description:"This creates a temporary password reset link for the selected user.",confirmLabel:"Create link",danger:!1,field:r`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${i?.value||""}
          onInput=${m=>c(h=>({...h,value:m.target.value}))} /></label>`}}[i?.type];return r`<div class="admin-grid">
    <div class="admin-side-stack">
      <${Ns} isOwner=${d} onCreated=${()=>{o(null),s()}} />
      <${Fs} isOwner=${d} smtpEnabled=${u}
        onCreated=${m=>{o(m),s()}} />
    </div>
    <div class="panel">
      <div class="section-header">
        <h2>Users</h2>
        <span class="muted">${e.length} total</span>
      </div>
      <${zs} resetLink=${a} />
      <div class="table-wrap">
        <table class="lib-table">
          <thead><tr><th>Username</th><th>Role</th><th>Status</th><th>Storage</th><th>Last login</th><th></th></tr></thead>
          <tbody>
            ${e.map(m=>r`<${Os} key=${m.id} user=${m} currentUser=${n}
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
  </div>`}X();function it(e){let t=String(e||"").trim();return t||null}function da({settings:e,isOwner:t,reload:n}){let[a,o]=f(!1);async function s(i){if(i.preventDefault(),a)return;o(!0);let c=new FormData(i.currentTarget),d={allow_vod_uploads:c.get("allow_vod_uploads")==="on",vod_threshold_minutes:Number(c.get("vod_threshold_minutes")||30)};if(t){d.about_text=String(c.get("about_text")||""),d.smtp_enabled=c.get("smtp_enabled")==="on",d.smtp_host=it(c.get("smtp_host")),d.smtp_port=Number(c.get("smtp_port")||587),d.smtp_tls_mode=String(c.get("smtp_tls_mode")||"starttls"),d.smtp_username=it(c.get("smtp_username")),d.smtp_from_email=it(c.get("smtp_from_email")),d.smtp_from_name=it(c.get("smtp_from_name"));let u=String(c.get("smtp_password")||"").trim();u&&(d.smtp_password=u),c.get("smtp_password_clear")==="on"&&(d.smtp_password_clear=!0)}try{await k("/api/v1/admin/settings",{method:"PATCH",body:d}),w("Settings saved."),n()}catch(u){w(u.message)}finally{o(!1)}}return r`<form class="admin-settings-page" onSubmit=${s}>
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
  </form>`}function Vs(e){return`${(e/100).toFixed(e%100===0?0:1)}%`}function Hs(e){switch(e){case"delete_and_retry":return"delete the failed upload and retry from a new session";case"retry":return"retry the current upload request";default:return""}}function qs({upload:e}){let t=Math.max(0,Math.min(1e4,Number(e.progress_basis_points||0))),n=Hs(e.recovery_action);return r`<div class="job-item">
    <div class="job-title-line">
      <strong class="mono">${e.id}</strong>
      <span class="badge badge-warn">${Vs(t)}</span>
    </div>
    <div class="progress-meter" aria-label="Upload progress"><span style=${`width:${t/100}%`}></span></div>
    <span class="muted">clip ${e.clip_id} — ${K(e.received_size_bytes)} of ${K(e.expected_size_bytes)} — updated ${j(e.updated_at)}</span>
    ${e.failure_reason&&r`<span class="form-error">${e.failure_reason}</span>`}
    ${n&&r`<span class="muted">Recovery: ${n}</span>`}
  </div>`}function pa({job:e}){return r`<div class="job-item">
    <strong>${e.kind} <span class="mono">${e.id}</span></strong>
    <span class="muted">${e.status} — attempts ${e.attempts}/${e.max_attempts} — updated ${j(e.updated_at)} — target ${e.target_type||""}:${e.target_id||""}</span>
    ${e.last_error&&r`<span class="form-error">${e.last_error}</span>`}
  </div>`}function Rt({title:e,items:t,renderItem:n,emptyLabel:a}){return r`<div class="panel">
    <div class="section-header">
      <h2>${e}</h2>
      <span class="muted">${t.length}</span>
    </div>
    ${t.length?r`<div class="job-list">${t.map(n)}</div>`:r`<p class="muted">${a}</p>`}
  </div>`}function ma({failedUploads:e,deadJobs:t,recentErrors:n}){return r`<div class="section">
    <${Rt} title="Failed uploads" items=${e} emptyLabel="No failed uploads."
      renderItem=${a=>r`<${qs} key=${a.id} upload=${a} />`} />
    <${Rt} title="Dead jobs" items=${t} emptyLabel="No dead jobs."
      renderItem=${a=>r`<${pa} key=${a.id} job=${a} />`} />
    <${Rt} title="Recent job errors" items=${n} emptyLabel="No recent job errors."
      renderItem=${a=>r`<${pa} key=${a.id} job=${a} />`} />
  </div>`}var fa=[["overview","server","Overview"],["users","users","Users"],["settings","sliders","Settings"],["jobs","alert","Jobs"]];function Ks(e){return e?.role==="admin"||e?.role==="owner"}async function Gs(){let[e,t,n,a,o,s]=await Promise.all([k("/api/v1/admin/overview"),k("/api/v1/admin/settings"),k("/api/v1/users"),k("/api/v1/admin/uploads/failed?limit=50"),k("/api/v1/admin/jobs/dead?limit=50"),k("/api/v1/admin/jobs/recent-errors?limit=50")]);return{overview:e,settings:t,users:n,failedUploads:a,deadJobs:o,recentErrors:s}}function _a({route:e}){let{user:t}=q(I),n=Ks(t),a=!!(t&&!n),o=fa.some(([h])=>h===e.tab)?e.tab:"overview",[s,i]=f(null),[c,d]=f(null),[u,p]=f(null),[b,l]=f(0),m=()=>l(h=>h+1);return C(()=>{a&&(w("Admin access required."),W("/library"))},[a]),C(()=>{if(!n)return;let h=!0;return d(null),Gs().then($=>h&&i($)).catch($=>h&&d($)),()=>{h=!1}},[n,b]),n?r`<main class="page">
    <h1>Admin</h1>
    <p class="page-subtitle">Accounts, instance summary, and processing diagnostics.</p>
    <nav class="ad-tabs" aria-label="Admin views">
      ${fa.map(([h,$,x])=>r`<a key=${h} class=${`ad-tab ${h===o?"ad-tab-on":""}`}
        href=${`/admin?tab=${h}`} aria-current=${h===o?"page":void 0}>${M($,{size:14})} ${x}</a>`)}
    </nav>
    ${c?r`<${Z} name="alert" title="Couldn't load admin data" body=${c.message} />`:s?o==="users"?r`<${ua} users=${s.users} settings=${s.settings} currentUser=${t}
          resetLink=${u} setResetLink=${p} reload=${m} />`:o==="settings"?r`<${da} settings=${s.settings} isOwner=${t?.role==="owner"} reload=${m} />`:o==="jobs"?r`<${ma} failedUploads=${s.failedUploads} deadJobs=${s.deadJobs} recentErrors=${s.recentErrors} />`:r`<${la} overview=${s.overview} deadJobs=${s.deadJobs} failedUploads=${s.failedUploads} />`:r`<p class="empty-state">Loading admin data…</p>`}
  </main>`:null}X();function Ws(e){if(!e?.avatar_url)return"";let t=e.updated_at||"";if(!t)return e.avatar_url;let n=String(e.avatar_url).includes("?")?"&":"?";return`${e.avatar_url}${n}v=${encodeURIComponent(t)}`}function js(e){return(e||"C").trim().slice(0,1).toUpperCase()||"C"}function lt({user:e,size:t=40,className:n=""}){let a=Ws(e),o=`width:${t}px;height:${t}px;font-size:${Math.round(t*.4)}px`;if(a)return r`<img class=${`user-avatar ${n}`} style=${o} src=${a} alt="" />`;let s=e?.display_name||e?.username;return r`<div class=${`user-avatar user-avatar-fallback ${n}`} style=${o} aria-hidden="true">
    ${js(s)}
  </div>`}function ha(e){let t=String(e||"").trim();return t||null}async function Zs(e){let t=new Headers;t.set("Accept","application/json"),t.set("Content-Type",e.type||"application/octet-stream");let n=kt();n&&t.set("X-CSRF-Token",n);let a=await fetch("/api/v1/me/avatar",{method:"PUT",credentials:"same-origin",headers:t,body:e}),o=await a.json().catch(()=>({}));if(!a.ok)throw new Error(o.error||a.statusText||"Avatar upload failed");return o}function ba(e){I.set({...I.get(),user:e})}function Js({user:e}){let[t,n]=f(!1);async function a(o){if(o.preventDefault(),t)return;n(!0);let s=new FormData(o.currentTarget);try{let i=await k("/api/v1/me/profile",{method:"PATCH",body:{display_name:ha(s.get("display_name")),bio:ha(s.get("bio"))}});ba(i),w("Profile saved.")}catch(i){w(i.message)}finally{n(!1)}}return r`<form class="profile-form" onSubmit=${a}>
    <label class="field"><span>Display name</span>
      <input class="input" name="display_name" maxlength="120" value=${e.display_name||""} placeholder=${e.username} /></label>
    <label class="field"><span>Bio</span>
      <textarea class="input" name="bio" rows="5" maxlength="2000" placeholder="Tell people what you upload.">${e.bio||""}</textarea></label>
    <div class="clip-inline-actions">
      <button class="btn btn-primary" type="submit" disabled=${t}>${M("save",{size:14})} Save profile</button>
    </div>
  </form>`}function Ys({user:e}){let[t,n]=f(!1);async function a(o){if(o.preventDefault(),t)return;let s=o.currentTarget.elements.avatar?.files?.[0];if(!s){w("Choose an avatar image first.");return}n(!0);try{let i=await Zs(s);ba(i),w("Avatar uploaded.")}catch(i){w(i.message)}finally{n(!1)}}return r`<form class="profile-form" onSubmit=${a}>
    <label class="field"><span>Avatar</span>
      <input name="avatar" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
      <small>PNG, JPEG, WebP, or GIF. Max 2 MiB.</small></label>
    <div class="clip-inline-actions">
      <button class="btn" type="submit" disabled=${t}>${M("upload",{size:14})} Upload avatar</button>
    </div>
  </form>`}function va(){let{user:e}=q(I);return e?r`<main class="page">
    <h1>Profile</h1>
    <p class="page-subtitle">Public identity and avatar.</p>
    <div class="profile-settings-header">
      <${lt} user=${e} size=${72} />
      <div>
        <h2>${e.display_name||e.username}</h2>
        <p>@${e.username} · ${e.role}</p>
      </div>
    </div>
    <${Js} user=${e} />
    <${Ys} user=${e} />
    <div class="profile-public-link">
      <a class="btn" href=${`/u/${encodeURIComponent(e.username)}`}>${M("external",{size:14})} View public profile</a>
    </div>
  </main>`:null}X();async function Xs(){let[e,t]=await Promise.all([k("/api/v1/auth/sessions"),k("/api/v1/auth/device-tokens")]);return{sessions:e,deviceTokens:t}}function Qs({item:e,onRevoke:t}){return r`<div class="management-item">
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
      <button class="btn btn-danger" type="button" onClick=${()=>t(e)}>${M("x",{size:14})} Revoke</button>
    </div>
  </div>`}function eo({item:e,onRevoke:t}){let n=!!e.revoked_at;return r`<div class="management-item">
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
      <button class="btn btn-danger" type="button" disabled=${n} onClick=${()=>t(e)}>${M("x",{size:14})} Revoke</button>
    </div>
  </div>`}function $a(){let[e,t]=f(null),[n,a]=f(null),[o,s]=f(0),[i,c]=f(null);C(()=>{let p=!0;return a(null),Xs().then(b=>p&&t(b)).catch(b=>p&&a(b)),()=>{p=!1}},[o]);let d=()=>s(p=>p+1);async function u(){let p=i;c(null);try{if(p.kind==="session"){if(await k(`/api/v1/auth/sessions/${encodeURIComponent(p.item.id)}`,{method:"DELETE",body:{}}),p.item.current){I.set({user:null,csrfToken:null,ready:!0}),w("Current session revoked."),W("/login");return}w("Session revoked.")}else await k(`/api/v1/auth/device-tokens/${encodeURIComponent(p.item.id)}`,{method:"DELETE",body:{}}),w("Device token revoked.");d()}catch(b){w(b.message)}}return n?r`<main class="page"><${Z} name="alert" title="Couldn't load account data" body=${n.message} /></main>`:r`<main class="page">
    <h1>Account</h1>
    <p class="page-subtitle">Sessions and device tokens.</p>
    ${e?r`<div class="account-grid">
          <div class="panel">
            <div class="section-header"><h2>Browser sessions</h2><span class="muted">${e.sessions.length} active</span></div>
            ${e.sessions.length?r`<div class="management-list">${e.sessions.map(p=>r`<${Qs} key=${p.id} item=${p}
                  onRevoke=${b=>c({kind:"session",item:b})} />`)}</div>`:r`<p class="muted">No active sessions.</p>`}
          </div>
          <div class="panel">
            <div class="section-header"><h2>Device tokens</h2><span class="muted">${e.deviceTokens.length} total</span></div>
            ${e.deviceTokens.length?r`<div class="management-list">${e.deviceTokens.map(p=>r`<${eo} key=${p.id} item=${p}
                  onRevoke=${b=>c({kind:"device",item:b})} />`)}</div>`:r`<p class="muted">No device tokens.</p>`}
          </div>
        </div>`:r`<p class="empty-state">Loading account data…</p>`}
    <${le} open=${!!i}
      title=${i?.kind==="session"?"Revoke browser session?":"Revoke device token?"}
      body=${i?.kind==="session"?i.item.current?"This signs you out of the current browser session.":"This signs out that browser session immediately.":"The desktop client using this token will need to reconnect."}
      confirmLabel="Revoke" danger
      onConfirm=${u} onCancel=${()=>c(null)} />
  </main>`}X();function ga({route:e}){let{user:t}=q(I),[n,a]=f(null),[o,s]=f(null);if(C(()=>{let d=!0;return a(null),s(null),k(`/api/v1/public/users/${encodeURIComponent(e.username)}`).then(u=>d&&a(u)).catch(u=>d&&s(u)),()=>{d=!1}},[e.username]),o)return r`<main class="page"><${Z} name="alert" title="Profile unavailable" body=${o.message} /></main>`;if(!n)return r`<main class="page"><p class="empty-state">Loading profile…</p></main>`;let i=t&&t.username.toLowerCase()===n.username.toLowerCase(),c=n.clips||[];return r`<main class="page">
    <header class="public-user-header">
      <${lt} user=${n} size=${72} />
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
    ${c.length===0?r`<${Z} name="film" title="No public clips yet" />`:r`<div class="card-grid">
          ${c.map(d=>r`<${we} key=${d.share_id}
            clip=${{...d,thumbnail_url:re(d),media_url:ke(d)}}
            href=${`/c/${encodeURIComponent(d.share_id)}`} showAuthor=${!1} />`)}
        </div>`}
  </main>`}X();var ya="Clipline is a self-hosted clip library for saved gameplay moments.";function ct(e,t){return r`<div><dt>${e}</dt><dd>${t}</dd></div>`}function ka(){let[e,t]=f(ya);return C(()=>{let n=!0;return k("/api/v1/about").then(a=>n&&t(a.about_text||ya)).catch(()=>{}),()=>{n=!1}},[]),r`<main class="page">
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
  </main>`}var to={publicLibrary:et,publicGame:et,games:Fn,library:qn,clip:Pt,public:Pt,login:ra,resetPassword:ia,admin:_a,profile:va,account:$a,publicUser:ga,about:ka},wa=Cn({pathname:window.location.pathname,search:window.location.search});function no(){let e=Mn();wa=e.name;let{ready:t,user:n}=q(I),a=t&&xn(e.name,n);if(C(()=>{a&&W("/login")},[a]),!t||a)return r`<div class="boot">Loading…</div>`;let o=to[e.name]||et,s=e.name==="login"||e.name==="resetPassword";return r`<div class="ui" onClick=${Pn}>
    ${!s&&r`<${Rn} active=${xt(e)} route=${e} />`}
    <${o} route=${e} />
    ${!s&&r`<${Dn} active=${Sn(e)} />`}
    <${Un} />
  </div>`}window.addEventListener("clipline:unauthorized",()=>{I.set({user:null,csrfToken:null,ready:!0}),wt(wa)||W("/login")});(async()=>{try{let t=await k("/api/v1/auth/me");Pe(t.csrf_token),I.set({user:t.user,csrfToken:t.csrf_token,ready:!0})}catch{I.set({user:null,csrfToken:null,ready:!0})}let e=document.querySelector("#app");e.textContent="",an(r`<${no} />`,e)})();
