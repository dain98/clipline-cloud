var Zn=Object.defineProperty;var jn=(e,t)=>()=>(e&&(t=e(e=0)),t);var Xn=(e,t)=>{for(var n in t)Zn(e,n,{get:t[n],enumerable:!0})};var qt={};Xn(qt,{ApiError:()=>Ne,api:()=>L,getCsrfToken:()=>ro,setCsrfToken:()=>st});function st(e){Ue=e}function ro(){return Ue}async function L(e,t={}){let n=(t.method||"GET").toUpperCase(),o=new Headers(t.headers||{});o.set("Accept","application/json");let r=t.body;r&&typeof r!="string"&&(o.set("Content-Type","application/json"),r=JSON.stringify(r)),!["GET","HEAD","OPTIONS"].includes(n)&&Ue&&o.set("X-CSRF-Token",Ue);let a=await fetch(e,{...t,body:r,credentials:"same-origin",headers:o,method:n}),u=(a.headers.get("content-type")||"").includes("application/json")?await a.json():await a.text();if(!a.ok){a.status===401&&window.dispatchEvent(new CustomEvent("clipline:unauthorized"));let d=typeof u=="object"&&u?.error?u.error:a.statusText;throw new Ne(d||"Request failed",a.status)}return u}var Ue,Ne,ce=jn(()=>{Ue=null;Ne=class extends Error{constructor(t,n){super(t),this.status=n}}});var De,I,Dt,Yn,le,Tt,It,Lt,Je,Me,ve,Ut,nt,et,tt,Qn,Pe={},Ee=[],Jn=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,Ie=Array.isArray;function re(e,t){for(var n in t)e[n]=t[n];return e}function ot(e){e&&e.parentNode&&e.parentNode.removeChild(e)}function at(e,t,n){var o,r,a,s={};for(a in t)a=="key"?o=t[a]:a=="ref"?r=t[a]:s[a]=t[a];if(arguments.length>2&&(s.children=arguments.length>3?De.call(arguments,2):n),typeof e=="function"&&e.defaultProps!=null)for(a in e.defaultProps)s[a]===void 0&&(s[a]=e.defaultProps[a]);return Se(e,s,o,r,null)}function Se(e,t,n,o,r){var a={type:e,props:t,key:n,ref:o,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:r??++Dt,__i:-1,__u:0};return r==null&&I.vnode!=null&&I.vnode(a),a}function Le(e){return e.children}function Te(e,t){this.props=e,this.context=t}function me(e,t){if(t==null)return e.__?me(e.__,e.__i+1):null;for(var n;t<e.__k.length;t++)if((n=e.__k[t])!=null&&n.__e!=null)return n.__e;return typeof e.type=="function"?me(e):null}function eo(e){if(e.__P&&e.__d){var t=e.__v,n=t.__e,o=[],r=[],a=re({},t);a.__v=t.__v+1,I.vnode&&I.vnode(a),rt(e.__P,a,t,e.__n,e.__P.namespaceURI,32&t.__u?[n]:null,o,n??me(t),!!(32&t.__u),r),a.__v=t.__v,a.__.__k[a.__i]=a,Ht(o,a,r),t.__e=t.__=null,a.__e!=n&&Nt(a)}}function Nt(e){if((e=e.__)!=null&&e.__c!=null)return e.__e=e.__c.base=null,e.__k.some(function(t){if(t!=null&&t.__e!=null)return e.__e=e.__c.base=t.__e}),Nt(e)}function Pt(e){(!e.__d&&(e.__d=!0)&&le.push(e)&&!Re.__r++||Tt!=I.debounceRendering)&&((Tt=I.debounceRendering)||It)(Re)}function Re(){try{for(var e,t=1;le.length;)le.length>t&&le.sort(Lt),e=le.shift(),t=le.length,eo(e)}finally{le.length=Re.__r=0}}function At(e,t,n,o,r,a,s,u,d,c,p){var b,i,f,g,y,k,x,$=o&&o.__k||Ee,S=t.length;for(d=to(n,t,$,d,S),b=0;b<S;b++)(f=n.__k[b])!=null&&(i=f.__i!=-1&&$[f.__i]||Pe,f.__i=b,k=rt(e,f,i,r,a,s,u,d,c,p),g=f.__e,f.ref&&i.ref!=f.ref&&(i.ref&&it(i.ref,null,f),p.push(f.ref,f.__c||g,f)),y==null&&g!=null&&(y=g),(x=!!(4&f.__u))||i.__k===f.__k?(d=Ft(f,d,e,x),x&&i.__e&&(i.__e=null)):typeof f.type=="function"&&k!==void 0?d=k:g&&(d=g.nextSibling),f.__u&=-7);return n.__e=y,d}function to(e,t,n,o,r){var a,s,u,d,c,p=n.length,b=p,i=0;for(e.__k=new Array(r),a=0;a<r;a++)(s=t[a])!=null&&typeof s!="boolean"&&typeof s!="function"?(typeof s=="string"||typeof s=="number"||typeof s=="bigint"||s.constructor==String?s=e.__k[a]=Se(null,s,null,null,null):Ie(s)?s=e.__k[a]=Se(Le,{children:s},null,null,null):s.constructor===void 0&&s.__b>0?s=e.__k[a]=Se(s.type,s.props,s.key,s.ref?s.ref:null,s.__v):e.__k[a]=s,d=a+i,s.__=e,s.__b=e.__b+1,u=null,(c=s.__i=no(s,n,d,b))!=-1&&(b--,(u=n[c])&&(u.__u|=2)),u==null||u.__v==null?(c==-1&&(r>p?i--:r<p&&i++),typeof s.type!="function"&&(s.__u|=4)):c!=d&&(c==d-1?i--:c==d+1?i++:(c>d?i--:i++,s.__u|=4))):e.__k[a]=null;if(b)for(a=0;a<p;a++)(u=n[a])!=null&&(2&u.__u)==0&&(u.__e==o&&(o=me(u)),Bt(u,u));return o}function Ft(e,t,n,o){var r,a;if(typeof e.type=="function"){for(r=e.__k,a=0;r&&a<r.length;a++)r[a]&&(r[a].__=e,t=Ft(r[a],t,n,o));return t}e.__e!=t&&(o&&(t&&e.type&&!t.parentNode&&(t=me(e)),n.insertBefore(e.__e,t||null)),t=e.__e);do t=t&&t.nextSibling;while(t!=null&&t.nodeType==8);return t}function no(e,t,n,o){var r,a,s,u=e.key,d=e.type,c=t[n],p=c!=null&&(2&c.__u)==0;if(c===null&&u==null||p&&u==c.key&&d==c.type)return n;if(o>(p?1:0)){for(r=n-1,a=n+1;r>=0||a<t.length;)if((c=t[s=r>=0?r--:a++])!=null&&(2&c.__u)==0&&u==c.key&&d==c.type)return s}return-1}function Et(e,t,n){t[0]=="-"?e.setProperty(t,n??""):e[t]=n==null?"":typeof n!="number"||Jn.test(t)?n:n+"px"}function Ce(e,t,n,o,r){var a,s;e:if(t=="style")if(typeof n=="string")e.style.cssText=n;else{if(typeof o=="string"&&(e.style.cssText=o=""),o)for(t in o)n&&t in n||Et(e.style,t,"");if(n)for(t in n)o&&n[t]==o[t]||Et(e.style,t,n[t])}else if(t[0]=="o"&&t[1]=="n")a=t!=(t=t.replace(Ut,"$1")),s=t.toLowerCase(),t=s in e||t=="onFocusOut"||t=="onFocusIn"?s.slice(2):t.slice(2),e.l||(e.l={}),e.l[t+a]=n,n?o?n[ve]=o[ve]:(n[ve]=nt,e.addEventListener(t,a?tt:et,a)):e.removeEventListener(t,a?tt:et,a);else{if(r=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&t[4]!="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&n==1?"":n))}}function Rt(e){return function(t){if(this.l){var n=this.l[t.type+e];if(t[Me]==null)t[Me]=nt++;else if(t[Me]<n[ve])return;return n(I.event?I.event(t):t)}}}function rt(e,t,n,o,r,a,s,u,d,c){var p,b,i,f,g,y,k,x,$,S,D,O,K,j,W,G,N=t.type;if(t.constructor!==void 0)return null;128&n.__u&&(d=!!(32&n.__u),a=[u=t.__e=n.__e]),(p=I.__b)&&p(t);e:if(typeof N=="function"){b=s.length;try{if($=t.props,S=N.prototype&&N.prototype.render,D=(p=N.contextType)&&o[p.__c],O=p?D?D.props.value:p.__:o,n.__c?x=(i=t.__c=n.__c).__=i.__E:(S?t.__c=i=new N($,O):(t.__c=i=new Te($,O),i.constructor=N,i.render=ao),D&&D.sub(i),i.state||(i.state={}),i.__n=o,f=i.__d=!0,i.__h=[],i._sb=[]),S&&i.__s==null&&(i.__s=i.state),S&&N.getDerivedStateFromProps!=null&&(i.__s==i.state&&(i.__s=re({},i.__s)),re(i.__s,N.getDerivedStateFromProps($,i.__s))),g=i.props,y=i.state,i.__v=t,f)S&&N.getDerivedStateFromProps==null&&i.componentWillMount!=null&&i.componentWillMount(),S&&i.componentDidMount!=null&&i.__h.push(i.componentDidMount);else{if(S&&N.getDerivedStateFromProps==null&&$!==g&&i.componentWillReceiveProps!=null&&i.componentWillReceiveProps($,O),t.__v==n.__v||!i.__e&&i.shouldComponentUpdate!=null&&i.shouldComponentUpdate($,i.__s,O)===!1){t.__v!=n.__v&&(i.props=$,i.state=i.__s,i.__d=!1),t.__e=n.__e,t.__k=n.__k,t.__k.some(function(Z){Z&&(Z.__=t)}),Ee.push.apply(i.__h,i._sb),i._sb=[],i.__h.length&&s.push(i);break e}i.componentWillUpdate!=null&&i.componentWillUpdate($,i.__s,O),S&&i.componentDidUpdate!=null&&i.__h.push(function(){i.componentDidUpdate(g,y,k)})}if(i.context=O,i.props=$,i.__P=e,i.__e=!1,K=I.__r,j=0,S)i.state=i.__s,i.__d=!1,K&&K(t),p=i.render(i.props,i.state,i.context),Ee.push.apply(i.__h,i._sb),i._sb=[];else do i.__d=!1,K&&K(t),p=i.render(i.props,i.state,i.context),i.state=i.__s;while(i.__d&&++j<25);i.state=i.__s,i.getChildContext!=null&&(o=re(re({},o),i.getChildContext())),S&&!f&&i.getSnapshotBeforeUpdate!=null&&(k=i.getSnapshotBeforeUpdate(g,y)),W=p!=null&&p.type===Le&&p.key==null?Vt(p.props.children):p,u=At(e,Ie(W)?W:[W],t,n,o,r,a,s,u,d,c),i.base=t.__e,t.__u&=-161,i.__h.length&&s.push(i),x&&(i.__E=i.__=null)}catch(Z){if(s.length=b,t.__v=null,d||a!=null){if(Z.then){for(t.__u|=d?160:128;u&&u.nodeType==8&&u.nextSibling;)u=u.nextSibling;a!=null&&(a[a.indexOf(u)]=null),t.__e=u}else if(a!=null)for(G=a.length;G--;)ot(a[G])}else t.__e=n.__e;t.__k==null&&(t.__k=n.__k||[]),Z.then||zt(t),I.__e(Z,t,n)}}else a==null&&t.__v==n.__v?(t.__k=n.__k,t.__e=n.__e):u=t.__e=oo(n.__e,t,n,o,r,a,s,d,c);return(p=I.diffed)&&p(t),128&t.__u?void 0:u}function zt(e){e&&(e.__c&&(e.__c.__e=!0),e.__k&&e.__k.some(zt))}function Ht(e,t,n){for(var o=0;o<n.length;o++)it(n[o],n[++o],n[++o]);I.__c&&I.__c(t,e),e.some(function(r){try{e=r.__h,r.__h=[],e.some(function(a){a.call(r)})}catch(a){I.__e(a,r.__v)}})}function Vt(e){return typeof e!="object"||e==null||e.__b>0?e:Ie(e)?e.map(Vt):e.constructor!==void 0?null:re({},e)}function oo(e,t,n,o,r,a,s,u,d){var c,p,b,i,f,g,y,k=n.props||Pe,x=t.props,$=t.type;if($=="svg"?r="http://www.w3.org/2000/svg":$=="math"?r="http://www.w3.org/1998/Math/MathML":r||(r="http://www.w3.org/1999/xhtml"),a!=null){for(c=0;c<a.length;c++)if((f=a[c])&&"setAttribute"in f==!!$&&($?f.localName==$:f.nodeType==3)){e=f,a[c]=null;break}}if(e==null){if($==null)return document.createTextNode(x);e=document.createElementNS(r,$,x.is&&x),u&&(I.__m&&I.__m(t,a),u=!1),a=null}if($==null)k===x||u&&e.data==x||(e.data=x);else{if(a=$=="textarea"&&x.defaultValue!=null?null:a&&De.call(e.childNodes),!u&&a!=null)for(k={},c=0;c<e.attributes.length;c++)k[(f=e.attributes[c]).name]=f.value;for(c in k)f=k[c],c=="dangerouslySetInnerHTML"?b=f:c=="children"||c in x||c=="value"&&"defaultValue"in x||c=="checked"&&"defaultChecked"in x||Ce(e,c,null,f,r);for(c in x)f=x[c],c=="children"?i=f:c=="dangerouslySetInnerHTML"?p=f:c=="value"?g=f:c=="checked"?y=f:u&&typeof f!="function"||k[c]===f||Ce(e,c,f,k[c],r);if(p)u||b&&(p.__html==b.__html||p.__html==e.innerHTML)||(e.innerHTML=p.__html),t.__k=[];else if(b&&(e.innerHTML=""),At(t.type=="template"?e.content:e,Ie(i)?i:[i],t,n,o,$=="foreignObject"?"http://www.w3.org/1999/xhtml":r,a,s,a?a[0]:n.__k&&me(n,0),u,d),a!=null)for(c=a.length;c--;)ot(a[c]);u&&$!="textarea"||(c="value",$=="progress"&&g==null?e.removeAttribute("value"):g!=null&&(g!==e[c]||$=="progress"&&!g||$=="option"&&g!=k[c])&&Ce(e,c,g,k[c],r),c="checked",y!=null&&y!=e[c]&&Ce(e,c,y,k[c],r))}return e}function it(e,t,n){try{if(typeof e=="function"){var o=typeof e.__u=="function";o&&e.__u(),o&&t==null||(e.__u=e(t))}else e.current=t}catch(r){I.__e(r,n)}}function Bt(e,t,n){var o,r;if(I.unmount&&I.unmount(e),(o=e.ref)&&(o.current&&o.current!=e.__e||it(o,null,t)),(o=e.__c)!=null){if(o.componentWillUnmount)try{o.componentWillUnmount()}catch(a){I.__e(a,t)}o.base=o.__P=o.__n=null}if(o=e.__k)for(r=0;r<o.length;r++)o[r]&&Bt(o[r],t,n||typeof e.type!="function");n||ot(e.__e),e.__c=e.__=e.__e=void 0}function ao(e,t,n){return this.constructor(e,n)}function Ot(e,t,n){var o,r,a,s;t==document&&(t=document.documentElement),I.__&&I.__(e,t),r=(o=typeof n=="function")?null:n&&n.__k||t.__k,a=[],s=[],rt(t,e=(!o&&n||t).__k=at(Le,null,[e]),r||Pe,Pe,t.namespaceURI,!o&&n?[n]:r?null:t.firstChild?De.call(t.childNodes):null,a,!o&&n?n:r?r.__e:t.firstChild,o,s),Ht(a,e,s),e.props.children=null}De=Ee.slice,I={__e:function(e,t,n,o){for(var r,a,s;t=t.__;)if((r=t.__c)&&!r.__)try{if((a=r.constructor)&&a.getDerivedStateFromError!=null&&(r.setState(a.getDerivedStateFromError(e)),s=r.__d),r.componentDidCatch!=null&&(r.componentDidCatch(e,o||{}),s=r.__d),s)return r.__E=r}catch(u){e=u}throw e}},Dt=0,Yn=function(e){return e!=null&&e.constructor===void 0},Te.prototype.setState=function(e,t){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=re({},this.state),typeof e=="function"&&(e=e(re({},n),this.props)),e&&re(n,e),e!=null&&this.__v&&(t&&this._sb.push(t),Pt(this))},Te.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),Pt(this))},Te.prototype.render=Le,le=[],It=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,Lt=function(e,t){return e.__v.__b-t.__v.__b},Re.__r=0,Je=Math.random().toString(8),Me="__d"+Je,ve="__a"+Je,Ut=/(PointerCapture)$|Capture$/i,nt=0,et=Rt(!1),tt=Rt(!0),Qn=0;var Gt=function(e,t,n,o){var r;t[0]=0;for(var a=1;a<t.length;a++){var s=t[a++],u=t[a]?(t[0]|=s?1:2,n[t[a++]]):t[++a];s===3?o[0]=u:s===4?o[1]=Object.assign(o[1]||{},u):s===5?(o[1]=o[1]||{})[t[++a]]=u:s===6?o[1][t[++a]]+=u+"":s?(r=e.apply(u,Gt(e,u,n,["",null])),o.push(r),u[0]?t[0]|=2:(t[a-2]=0,t[a]=r)):o.push(u)}return o},Kt=new Map;function Wt(e){var t=Kt.get(this);return t||(t=new Map,Kt.set(this,t)),(t=Gt(this,t.get(e)||(t.set(e,t=(function(n){for(var o,r,a=1,s="",u="",d=[0],c=function(i){a===1&&(i||(s=s.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?d.push(0,i,s):a===3&&(i||s)?(d.push(3,i,s),a=2):a===2&&s==="..."&&i?d.push(4,i,0):a===2&&s&&!i?d.push(5,0,!0,s):a>=5&&((s||!i&&a===5)&&(d.push(a,0,s,r),a=6),i&&(d.push(a,i,0,r),a=6)),s=""},p=0;p<n.length;p++){p&&(a===1&&c(),c(p));for(var b=0;b<n[p].length;b++)o=n[p][b],a===1?o==="<"?(c(),d=[d],a=3):s+=o:a===4?s==="--"&&o===">"?(a=1,s=""):s=o+s[0]:u?o===u?u="":s+=o:o==='"'||o==="'"?u=o:o===">"?(c(),a=1):a&&(o==="="?(a=5,r=s,s=""):o==="/"&&(a<5||n[p][b+1]===">")?(c(),a===3&&(d=d[0]),a=d,(d=d[0]).push(2,0,a),a=0):o===" "||o==="	"||o===`
`||o==="\r"?(c(),a=2):s+=o),a===3&&s==="!--"&&(a=4,d=d[0])}return c(),d})(e)),t),arguments,[])).length>1?t:t[0]}var l=Wt.bind(at);ce();var be,H,lt,Zt,Ae=0,on=[],B=I,jt=B.__b,Xt=B.__r,Yt=B.diffed,Qt=B.__c,Jt=B.unmount,en=B.__;function ut(e,t){B.__h&&B.__h(H,e,Ae||t),Ae=0;var n=H.__H||(H.__H={__:[],__h:[]});return e>=n.__.length&&n.__.push({}),n.__[e]}function v(e){return Ae=1,io(sn,e)}function io(e,t,n){var o=ut(be++,2);if(o.t=e,!o.__c&&(o.__=[n?n(t):sn(void 0,t),function(u){var d=o.__N?o.__N[0]:o.__[0],c=o.t(d,u);d!==c&&(o.__N=[c,o.__[1]],o.__c.setState({}))}],o.__c=H,!H.__f)){var r=function(u,d,c){if(!o.__c.__H)return!0;var p=!1,b=o.__c.props!==u;if(o.__c.__H.__.some(function(f){if(f.__N){p=!0;var g=f.__[0];f.__=f.__N,f.__N=void 0,g!==f.__[0]&&(b=!0)}}),a){var i=a.call(this,u,d,c);return p?i||b:i}return!p||b};H.__f=!0;var a=H.shouldComponentUpdate,s=H.componentWillUpdate;H.componentWillUpdate=function(u,d,c){if(this.__e){var p=a;a=void 0,r(u,d,c),a=p}s&&s.call(this,u,d,c)},H.shouldComponentUpdate=r}return o.__N||o.__}function M(e,t){var n=ut(be++,3);!B.__s&&rn(n.__H,t)&&(n.__=e,n.u=t,H.__H.__h.push(n))}function A(e){return Ae=5,so(function(){return{current:e}},[])}function so(e,t){var n=ut(be++,7);return rn(n.__H,t)&&(n.__=e(),n.__H=t,n.__h=e),n.__}function tn(){for(var e;e=on.shift();){var t=e.__H;if(e.__P&&t)try{t.__h.some(ct),t.__h.some(an),t.__h=[]}catch(n){t.__h=[],B.__e(n,e.__v)}}}B.__b=function(e){H=null,jt&&jt(e)},B.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),en&&en(e,t)},B.__r=function(e){Xt&&Xt(e),be=0;var t=(H=e.__c).__H;t&&(lt===H?(t.__h=[],H.__h=[],t.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(t.__h.length&&tn(),be=0)),lt=H},B.diffed=function(e){Yt&&Yt(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(on.push(t)!==1&&Zt===B.requestAnimationFrame||((Zt=B.requestAnimationFrame)||lo)(tn)),t.__H.__.some(function(n){n.u&&(n.__H=n.u,n.u=void 0)})),lt=H=null},B.__c=function(e,t){t.some(function(n){try{n.__h.some(ct),n.__h=n.__h.filter(function(o){return!o.__||an(o)})}catch(o){t.some(function(r){r.__h&&(r.__h=[])}),t=[],B.__e(o,n.__v)}}),Qt&&Qt(e,t)},B.unmount=function(e){Jt&&Jt(e);var t,n=e.__c;n&&n.__H&&(n.__H.__.some(function(o){try{ct(o)}catch(r){t=r}}),n.__H=void 0,t&&B.__e(t,n.__v))};var nn=typeof requestAnimationFrame=="function";function lo(e){var t,n=function(){clearTimeout(o),nn&&cancelAnimationFrame(t),setTimeout(e)},o=setTimeout(n,35);nn&&(t=requestAnimationFrame(n))}function ct(e){var t=H,n=e.__c;typeof n=="function"&&(e.__c=void 0,n()),H=t}function an(e){var t=H;e.__c=e.__(),H=t}function rn(e,t){return!e||e.length!==t.length||t.some(function(n,o){return n!==e[o]})}function sn(e,t){return typeof t=="function"?t(e):t}function ln(e){let t=e,n=new Set;return{get:()=>t,set(o){t=o,n.forEach(r=>r(t))},update(o){this.set(o(t))},subscribe(o){return n.add(o),()=>n.delete(o)}}}function J(e){let[t,n]=v(e.get());return M(()=>e.subscribe(n),[e]),t}var X=ln({user:null,csrfToken:null,ready:!1}),Fe=ln([]),co=0;function F(e,{actionLabel:t,onAction:n,timeoutMs:o=5e3}={}){let r=++co;return Fe.update(a=>[...a,{id:r,message:e,actionLabel:t,onAction:n}]),o&&setTimeout(()=>ze(r),o),r}function ze(e){Fe.update(t=>t.filter(n=>n.id!==e))}function He(e){try{return decodeURIComponent(e)}catch{return e}}function cn(e){let t=Number(e.get("page")||1);return{sort:e.get("sort")||"uploaded_at_desc",game:e.get("game")||"",q:e.get("q")||"",page:Number.isFinite(t)?Math.max(1,t):1}}var uo=["login","resetPassword","public","publicLibrary","publicGame","publicUser","about","games"];function un(e){return uo.includes(e)}function Ve(e,t){let n=new URLSearchParams(t||""),o=e;return o.startsWith("/c/")?{name:"public",shareId:He(o.slice(3))}:o==="/"||o==="/public"||o==="/search"?{name:"publicLibrary",query:cn(n)}:o.startsWith("/game/")?{name:"publicGame",game:He(o.slice(6)),query:cn(n)}:o==="/about"?{name:"about"}:o==="/games"?{name:"games"}:o.startsWith("/u/")?{name:"publicUser",username:He(o.slice(3))}:o==="/library"?{name:"library"}:o.startsWith("/clip/")?{name:"clip",clipId:He(o.slice(6))}:o==="/admin"?{name:"admin",tab:n.get("tab")||"overview"}:o==="/account"?{name:"account"}:o==="/profile"?{name:"profile"}:o==="/login"?{name:"login"}:o==="/reset-password"?{name:"resetPassword",token:n.get("token")||"",invite:n.get("invite")==="1"}:{name:"publicLibrary"}}var dn=()=>window.location.pathname==="/preview.html";function po(e){let t=e.slice(1)||"/",[n,o=""]=t.split("?");return{pathname:n,search:o?`?${o}`:""}}function Be(){return dn()?po(window.location.hash):{pathname:window.location.pathname,search:window.location.search}}function pn(e){return Ve(e.pathname,e.search).name}var dt=new Set;function ee(e){dn()?window.location.hash=e:window.history.pushState({},"",e),pt()}function pt(){let{pathname:e,search:t}=Be(),n=Ve(e,t);dt.forEach(o=>o(n))}window.addEventListener("popstate",pt);window.addEventListener("hashchange",pt);function mn(){let{pathname:e,search:t}=Be(),[n,o]=v(()=>Ve(e,t));return M(()=>(dt.add(o),()=>dt.delete(o)),[]),n}function fn(e){let t=e.target.closest("a[href^='/']");!t||t.target||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||(e.preventDefault(),ee(t.getAttribute("href")))}var _n={alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',clipboard:'<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',copy:'<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',external:'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',fastForward:'<path d="m13 19 9-7-9-7v14Z"/><path d="m2 19 9-7-9-7v14Z"/>',film:'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 8h4"/><path d="M3 16h4"/><path d="M17 8h4"/><path d="M17 16h4"/>',fullscreen:'<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/><path d="M12 2a15.3 15.3 0 0 0 0 20"/>',home:'<path d="m3 10 9-7 9 7"/><path d="M5 8.5V20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5"/><path d="M9 22V12h6v10"/>',info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',library:'<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',lock:'<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',logOut:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',menu:'<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',message:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>',notepad:'<path d="M8 2v4"/><path d="M16 2v4"/><path d="M3 10h18"/><path d="M6 4h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/><path d="M8 14h8"/><path d="M8 18h5"/>',pause:'<path d="M8 5v14"/><path d="M16 5v14"/>',play:'<path d="m8 5 11 7-11 7V5Z"/>',plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',check:'<path d="M20 6 9 17l-5-5"/>',refresh:'<path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/><path d="M3 12A9 9 0 0 1 18.5 5.7L21 8"/><path d="M21 3v5h-5"/>',rewind:'<path d="m11 19-9-7 9-7v14Z"/><path d="m22 19-9-7 9-7v14Z"/>',save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',server:'<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',skipBack:'<path d="M19 20 9 12l10-8v16Z"/><path d="M5 19V5"/>',skipForward:'<path d="m5 4 10 8-10 8V4Z"/><path d="M19 5v14"/>',shield:'<path d="M20 13c0 5-3.5 7.5-7.7 8.8a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V5l8-3 8 3v8Z"/>',sliders:'<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>',theater:'<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M6 9h12"/><path d="M6 15h12"/>',trash:'<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',volume2:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9 9 0 0 1 0 14"/>',volumeX:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>',x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'};function U(e,{size:t=18}={}){return l`<svg viewBox="0 0 24 24" width=${t} height=${t} fill="none"
    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" dangerouslySetInnerHTML=${{__html:_n[e]||""}} />`}function hn({active:e}){let{user:t}=J(X),[n,o]=v(!1),r=A(null),a=t?.role==="admin";M(()=>{if(!n)return;let d=p=>{r.current?.contains(p.target)||o(!1)},c=p=>{p.key==="Escape"&&o(!1)};return document.addEventListener("pointerdown",d),document.addEventListener("keydown",c),()=>{document.removeEventListener("pointerdown",d),document.removeEventListener("keydown",c)}},[n]);let s=[["feed","/","Feed"],["library","/library","Library",!!t],["games","/games","Games"],["admin","/admin","Admin",a]].filter(([,,,d])=>d!==!1),u=d=>{d.preventDefault();let c=new FormData(d.target).get("q")?.toString().trim();ee(c?`/search?q=${encodeURIComponent(c)}`:"/search")};return l`<header class="topbar">
    <a class="wordmark" href="/" aria-label="Clipline home">
      <img src="/clipline-icon.svg" alt="" width="24" height="24" />
      CLIP<b>LINE</b>
    </a>
    <nav class="topnav" aria-label="Primary">
      ${s.map(([d,c,p])=>l`
        <a class=${d===e?"topnav-on":""} href=${c}>${p}</a>`)}
    </nav>
    <form class="topsearch" role="search" onSubmit=${u}>
      <input class="input" name="q" placeholder="Search clips, games, players…" aria-label="Search" />
    </form>
    ${t?l`<div class="avatar-wrap" ref=${r}>
          <button class="avatar-btn" aria-haspopup="menu" aria-expanded=${n}
            onClick=${()=>o(!n)}>
            <span class="avatar">${(t.display_name||t.username)[0].toUpperCase()}</span>
          </button>
          ${n&&l`<div class="menu" role="menu" onClick=${()=>o(!1)}>
            <a role="menuitem" href="/profile">Profile</a>
            <a role="menuitem" href="/account">Account</a>
            ${a&&l`<a role="menuitem" href="/admin">Admin</a>`}
            <button role="menuitem" class="menu-danger" onClick=${mo}>Sign out</button>
          </div>`}
        </div>`:l`<a class="btn" href="/login">${U("lock",{size:14})} Sign in</a>`}
  </header>`}async function mo(){let{api:e}=await Promise.resolve().then(()=>(ce(),qt));try{await e("/api/v1/auth/logout",{method:"POST"})}catch{}X.set({user:null,csrfToken:null,ready:!0}),ee("/login")}function vn({active:e}){return l`<nav class="tabbar" aria-label="Primary">
    ${[["feed","/","home","Feed"],["library","/library","library","Library"],["search","/search","search","Search"],["profile","/profile","user","Profile"]].map(([n,o,r,a])=>l`
      <a class=${n===e?"tab-on":""} href=${o}>${U(r)}<span>${a}</span></a>`)}
  </nav>`}function bn(){let e=J(Fe);return l`<div class="toasts" role="status" aria-live="polite">
    ${e.map(t=>l`<div class="toast" key=${t.id}>
      <span>${t.message}</span>
      ${t.actionLabel&&l`<button class="toast-action"
        onClick=${()=>{t.onAction?.(),ze(t.id)}}>${t.actionLabel}</button>`}
      <button class="toast-x" aria-label="Dismiss" onClick=${()=>ze(t.id)}>✕</button>
    </div>`)}
  </div>`}ce();function fe(e){if(!e)return"Unknown";let t=new Date(e);return Number.isNaN(t.getTime())?"Unknown":new Intl.DateTimeFormat(void 0,{dateStyle:"medium",timeStyle:"short"}).format(t)}function ue(e){if(e==null)return"Unknown";let t=Math.max(0,Math.round(Number(e)/1e3)),n=Math.floor(t/60),o=t%60;return`${n}:${String(o).padStart(2,"0")}`}function Oe(e){if(!e)return"Unknown";let t=new Date(e);if(Number.isNaN(t.getTime()))return"Unknown";let n=Math.min(0,t.getTime()-Date.now()),o=[["year",365*24*60*60*1e3],["month",720*60*60*1e3],["week",10080*60*1e3],["day",1440*60*1e3],["hour",3600*1e3],["minute",60*1e3],["second",1e3]],[r,a]=o.find(([,u])=>Math.abs(n)>=u)||o[o.length-1],s=Math.round(n/a);return new Intl.RelativeTimeFormat(void 0,{numeric:"always"}).format(s,r)}function $e(e){if(e==null)return"Unknown";let t=Number(e);if(!Number.isFinite(t))return"Unknown";let n=["B","KiB","MiB","GiB","TiB"],o=t,r=0;for(;o>=1024&&r<n.length-1;)o/=1024,r+=1;return`${o.toFixed(r===0?0:1)} ${n[r]}`}function de(e){let t=Number(e||0),n=Number.isFinite(t)&&t>0?Math.floor(t):0;return`${new Intl.NumberFormat(void 0,{notation:n>=1e4?"compact":"standard"}).format(n)} view${n===1?"":"s"}`}function pe(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/thumbnail`}function ye(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/thumbnail`}function Ke(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/media`}function $n(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/media`}var Ge=null;function yn(e){Ge?.(),Ge=e}function gn(e){Ge===e&&(Ge=null)}var fo=()=>window.matchMedia("(pointer: fine)").matches&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches&&!navigator.connection?.saveData;function wn({src:e,poster:t,alt:n=""}){let[o,r]=v(!1),[a,s]=v(0),u=A(null),d=A(null),c=A(!0),p=A(),b=()=>{c.current&&(clearTimeout(u.current),r(!1),s(0))};p.current=b;let i=()=>{!e||!fo()||(u.current=setTimeout(()=>{c.current&&(yn(p.current),r(!0))},300))},f=g=>{let y=g.target;y.duration&&s(y.currentTime/y.duration)};return M(()=>()=>{c.current=!1,clearTimeout(u.current),gn(p.current)},[]),l`<span class="hover-preview" onPointerEnter=${i} onPointerLeave=${b}>
    ${o?l`<video ref=${d} src=${e} poster=${t} muted loop autoplay
          playsinline preload="none" onTimeUpdate=${f} />`:l`<img src=${t} alt=${n} loading="lazy" />`}
    ${o&&l`<span class="preview-scrub"><span style=${`width:${a*100}%`} /></span>`}
  </span>`}function mt(e){return e.owner?.display_name||e.owner?.username||e.owner_username||e.author_name||e.author_username||null}function We({clip:e,href:t,selectable:n=!1,selected:o=!1,onToggleSelect:r,showVisibility:a=!1,showAuthor:s=!1}){let u=mt(e),d=[e.game_name&&l`<em>${e.game_name}</em>`,s&&u,e.view_count!=null&&de(e.view_count),e.uploaded_at&&Oe(e.uploaded_at)].filter(Boolean);return l`<article class=${`clip-card ${o?"is-selected":""} ${n?"is-selectable":""}`}>
    <a class="card-thumb" href=${t} tabindex="-1" aria-hidden="true">
      <${wn} src=${e.media_url} poster=${e.thumbnail_url} />
      ${e.duration_ms!=null&&l`<span class="dur-pill">${ue(e.duration_ms)}</span>`}
      ${a&&l`<span class=${`badge badge-${e.visibility} card-vis`}>${e.visibility}</span>`}
    </a>
    ${n&&l`<label class="card-check">
      <input type="checkbox" checked=${o} aria-label=${`Select ${e.title}`}
        onChange=${()=>r?.(e.id)} />
    </label>`}
    <h3 class="card-title"><a href=${t}>${e.title}</a></h3>
    <p class="card-meta">${d.map((c,p)=>l`${p>0&&" \xB7 "}${c}`)}</p>
  </article>`}function Y({name:e="film",title:t,body:n,action:o}){return l`<div class="empty">
    <div class="empty-icon">${U(e,{size:28})}</div>
    <h3>${t}</h3>
    ${n&&l`<p>${n}</p>`}
    ${o}
  </div>`}var _o=[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]],ho=6;function _t({route:e}){let t={sort:"uploaded_at_desc",page:1,q:"",...e.query,game:e.name==="publicGame"?e.game:e.query?.game||""},[n,o]=v(null),[r,a]=v([]),[s,u]=v(null);M(()=>{let y=!0;o(null),u(null);let k=new URLSearchParams;return t.sort!=="uploaded_at_desc"&&k.set("sort",t.sort),t.game&&k.set("game",t.game),t.q&&k.set("q",t.q),Number(t.page)>1&&k.set("page",String(t.page)),L(`/api/v1/public/clips${k.size?`?${k}`:""}`).then(x=>y&&o(x)).catch(x=>y&&u(x)),()=>{y=!1}},[e.name,t.sort,t.game,t.q,t.page]),M(()=>{let y=!0;return L("/api/v1/public/games").then(k=>y&&a(k.games||[])).catch(()=>{}),()=>{y=!1}},[]);let d=y=>ee($o({...t,page:1,...y}));if(s)return l`<main class="page">
      <${Y} name="alert" title="Couldn't load the feed" body=${s.message} />
    </main>`;let c=n?.clips,p=!!(t.game||t.q)||Number(t.page)>1,b=!p,i=[...r].sort((y,k)=>(k.clip_count||0)-(y.clip_count||0)),f=i.slice(0,ho),g=i.length-f.length;return l`<main class="page">
    ${c==null?l`<${bo} />`:c.length===0?l`<${Y} name="film"
          title=${p?"No clips match this filter":"No public clips yet"}
          body=${p?"Try a different game, search, or clear your filters.":"Clips shared as public from a library will show up here."}
          action=${p&&l`<a class="btn" href="/">Clear filters</a>`} />`:l`
        ${b?vo(c):""}
        <div class="feed-toolbar">
          <h2>Latest uploads</h2>
          <select class="input" value=${t.sort} onChange=${y=>d({sort:y.target.value})}>
            ${_o.map(([y,k])=>l`<option value=${y}>${k}</option>`)}
          </select>
          <div class="chips">
            <button class=${`chip ${t.game?"":"chip-on"}`} onClick=${()=>d({game:""})}>All</button>
            ${f.map(y=>l`<button
              class=${`chip ${t.game===y.game?"chip-on":""}`}
              onClick=${()=>d({game:y.game})}>${y.game}</button>`)}
            ${g>0&&l`<a class="chip" href="/games">+${g}</a>`}
          </div>
        </div>
        <div class="card-grid">
          ${(b?c.slice(4):c).map(y=>l`<${We} clip=${{...y,thumbnail_url:pe(y)}}
              href=${ft(y)} showAuthor />`)}
        </div>
        ${yo(n,t,d)}
      `}
  </main>`}function vo(e){let[t,...n]=e,o=n.slice(0,3);return l`<p class="kicker">Now playing on this server</p>
    <section class="hero">
      <a class="hero-main" href=${ft(t)}>
        <img src=${pe(t)} alt="" loading="lazy" />
        <span class="hero-caption">▶ ${t.title} — ${t.game_name} · ${ue(t.duration_ms)}</span>
      </a>
      <div class="hero-side">
        ${o.map(r=>l`<a class="hero-row" href=${ft(r)}>
            <img src=${pe(r)} alt="" loading="lazy" />
            <span><b>${r.title}</b>
              <small>${mt(r)} · ${r.game_name} · ${de(r.view_count)}</small></span>
          </a>`)}
      </div>
    </section>`}function bo({count:e=8}){return l`<div class="card-grid">
    ${Array.from({length:e},(t,n)=>l`<div class="clip-card" key=${n}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`}function ft(e){return`/c/${encodeURIComponent(e.share_id)}`}function $o({sort:e="uploaded_at_desc",game:t="",q:n="",page:o=1}={}){let r=new URLSearchParams,a=e||"uploaded_at_desc",s=String(t||"").trim(),u=String(n||"").trim(),d=Math.max(1,Number(o||1));if(a!=="uploaded_at_desc"&&r.set("sort",a),d>1&&r.set("page",String(d)),u)return r.set("q",u),s&&r.set("game",s),`/search?${r.toString()}`;if(s){let p=r.toString();return`/game/${encodeURIComponent(s)}${p?`?${p}`:""}`}let c=r.toString();return c?`/search?${c}`:"/"}function yo(e,t,n){let o=Math.max(1,Number(t.page||1)),r=!!e?.has_more;return o<=1&&!r?"":l`<nav class="pager" aria-label="Public clip pages">
    <button class="btn" type="button" disabled=${o<=1}
      onClick=${()=>n({page:o-1})}>Previous</button>
    <span class="muted">Page ${o}</span>
    <button class="btn" type="button" disabled=${!r}
      onClick=${()=>n({page:o+1})}>Next</button>
  </nav>`}ce();function kn(){let[e,t]=v(null),[n,o]=v(null);return M(()=>{let r=!0;return L("/api/v1/public/games").then(a=>r&&t(a.games||[])).catch(a=>r&&o(a)),()=>{r=!1}},[]),n?l`<main class="page">
      <${Y} name="alert" title="Couldn't load games" body=${n.message} />
    </main>`:l`<main class="page">
    <p class="kicker">Browse by game</p>
    ${e==null?l`<div class="game-grid">
          ${Array.from({length:6},(r,a)=>l`<div class="game-tile is-loading" key=${a}>
            <div class="skeleton-thumb"></div>
          </div>`)}
        </div>`:e.length===0?l`<${Y} name="film" title="No games yet"
          body="Once clips are shared as public, their games will show up here." />`:l`<div class="game-grid">
          ${e.map(r=>l`<a class="game-tile" href=${`/game/${encodeURIComponent(r.game)}`}>
            ${r.thumbnail_url?l`<img src=${r.thumbnail_url} alt="" loading="lazy" />`:l`<div class="game-tile-fallback">${(r.game||"?")[0].toUpperCase()}</div>`}
            <div class="game-tile-body">
              <b>${r.game}</b>
              <small>${r.clip_count} clip${r.clip_count===1?"":"s"}</small>
            </div>
          </a>`)}
        </div>`}
  </main>`}ce();function xn({trigger:e,content:t,onClose:n,label:o,panelClass:r=""}){let[a,s]=v(!1),u=A(null),d=A(null),c=A(null),p=()=>{s(!1),n?.()},b=()=>{if(a){p();return}c.current=document.activeElement,s(!0)};return M(()=>{if(!a)return;let i=y=>{u.current?.contains(y.target)||p()},f=y=>{y.key==="Escape"&&p()};return document.addEventListener("pointerdown",i),document.addEventListener("keydown",f),d.current?.querySelector("input, select, textarea, button, a[href], [tabindex]")?.focus(),()=>{document.removeEventListener("pointerdown",i),document.removeEventListener("keydown",f),c.current?.focus?.()}},[a]),l`<div class="popover-wrap" ref=${u}>
    ${e({open:a,toggle:b})}
    ${a&&l`<div class=${`popover ${r}`} ref=${d} role="dialog" aria-label=${o||"Filters"}>
      ${t}
    </div>`}
  </div>`}function Cn({count:e,onPublic:t,onPrivate:n,onCopyLinks:o,onDelete:r,onClear:a}){return e?l`<div class="bulkbar" role="toolbar" aria-label="Bulk actions">
    <b>${e} selected</b>
    <button class="btn" onClick=${t}>Make public</button>
    <button class="btn" onClick=${n}>Make private</button>
    <button class="btn" onClick=${o}>Copy links</button>
    <button class="btn btn-danger" onClick=${r}>Delete</button>
    <button class="btn bulk-x" aria-label="Clear selection" onClick=${a}>✕</button>
  </div>`:null}function _e({open:e,title:t,body:n,confirmLabel:o="Confirm",onConfirm:r,onCancel:a,danger:s=!1}){let u=A(null),d=A(null);return M(()=>{let c=u.current;c&&(e&&!c.open?(c.showModal(),d.current?.focus()):!e&&c.open&&c.close())},[e]),l`<dialog ref=${u} class="confirm-dialog" aria-labelledby="confirm-dialog-title"
    onCancel=${c=>{c.preventDefault(),a?.()}}
    onClose=${()=>e&&a?.()}>
    ${e&&l`<div class="confirm-dialog-body">
      <h2 id="confirm-dialog-title">${t}</h2>
      ${n&&l`<p>${n}</p>`}
      <div class="confirm-dialog-actions">
        <button type="button" class="btn" onClick=${a}>Cancel</button>
        <button type="button" ref=${d} class=${`btn ${s?"btn-danger":"btn-primary"}`}
          onClick=${r}>${o}</button>
      </div>
    </div>`}
  </dialog>`}var Sn="clipline.libraryView",go=[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["updated_at_desc","Updated newest"],["updated_at_asc","Updated oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["size_desc","Size largest"],["size_asc","Size smallest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]],qe={title:["title_asc","title_desc"],size:["size_asc","size_desc"],duration:["duration_asc","duration_desc"],uploaded:["uploaded_at_asc","uploaded_at_desc"]},wo=["visibility","status","source_type","from","to","min_duration_seconds","max_duration_seconds","min_size_mib","max_size_mib"],Xe={sort:"uploaded_at_desc",game:"",source_type:"",visibility:"",status:"",q:"",from:"",to:"",min_duration_seconds:"",max_duration_seconds:"",min_size_mib:"",max_size_mib:""};function Ze(e){if(e===""||e==null)return null;let t=Number(e);return Number.isFinite(t)?t:null}function ko(e){let t=new URLSearchParams;t.set("sort",e.sort||Xe.sort),t.set("page_size","100");for(let s of["game","source_type","visibility","status","q"])e[s]&&t.set(s,e[s]);e.from&&t.set("from",`${e.from}T00:00:00Z`),e.to&&t.set("to",`${e.to}T23:59:59Z`);let n=Ze(e.min_duration_seconds);n!=null&&t.set("min_duration_ms",String(Math.round(n*1e3)));let o=Ze(e.max_duration_seconds);o!=null&&t.set("max_duration_ms",String(Math.round(o*1e3)));let r=Ze(e.min_size_mib);r!=null&&t.set("min_size_bytes",String(Math.round(r*1024*1024)));let a=Ze(e.max_size_mib);return a!=null&&t.set("max_size_bytes",String(Math.round(a*1024*1024))),t}function xo(e){return wo.reduce((t,n)=>t+(e[n]?1:0),0)}function Co(e,t=6){let n=new Map;for(let o of e){let r=o.game_name;r&&n.set(r,(n.get(r)||0)+1)}return Array.from(n,([o,r])=>({game:o,count:r})).sort((o,r)=>r.count-o.count||o.game.localeCompare(r.game)).slice(0,t)}async function Mn(e,t,n){let o=0;async function r(){let a=o++;if(!(a>=e.length))return await n(e[a]),r()}await Promise.all(Array.from({length:Math.min(t,e.length)},r))}function Mo(){try{return localStorage.getItem(Sn)==="rows"?"rows":"grid"}catch{return"grid"}}function Tn(){let[e,t]=v(Mo),[n,o]=v(Xe),[r,a]=v(Xe.q),[s,u]=v(null),[d,c]=v(null),[p,b]=v(new Set),[i,f]=v(!1),[g,y]=v(0),k=A(null);M(()=>()=>clearTimeout(k.current),[]),M(()=>{let h=!0;return u(null),c(null),L(`/api/v1/clips?${ko(n)}`).then(w=>{h&&(u(w),b(new Set))}).catch(w=>h&&c(w)),()=>{h=!1}},[JSON.stringify(n),g]);let x=h=>{t(h);try{localStorage.setItem(Sn,h)}catch{}},$=()=>y(h=>h+1),S=h=>{let w=h.target.value;a(w),clearTimeout(k.current),k.current=setTimeout(()=>{o(P=>({...P,q:w}))},300)},D=h=>w=>{let P=w.target.value;o(E=>({...E,[h]:P}))},O=()=>{o(h=>({...h,visibility:"",status:"",source_type:"",from:"",to:"",min_duration_seconds:"",max_duration_seconds:"",min_size_mib:"",max_size_mib:""}))},K=h=>o(w=>({...w,game:w.game===h?"":h})),j=h=>o(w=>({...w,sort:h})),W=h=>{b(w=>{let P=new Set(w);return P.has(h)?P.delete(h):P.add(h),P})};function G(h,w){u(P=>P&&{...P,clips:P.clips.map(E=>E.id===h?{...E,...w}:E)})}function N(h,w){let P=new Set(h);u(E=>E&&{...E,clips:E.clips.map(_=>P.has(_.id)?{..._,...w}:_)})}async function Z(h){let w=Array.from(p);if(!w.length)return;let P=s?.clips||[],E=new Map(w.map(C=>[C,P.find(V=>V.id===C)]));N(w,{visibility:h});let _=[];if(await Mn(w,4,async C=>{try{let V=await L(`/api/v1/clips/${encodeURIComponent(C)}/visibility`,{method:"POST",body:{visibility:h}});G(C,{visibility:V.visibility,public_url:V.public_url})}catch(V){_.push({id:C,message:V.message})}}),_.length){for(let{id:C}of _){let V=E.get(C);V&&G(C,{visibility:V.visibility,public_url:V.public_url})}F(_.length===w.length?_[0].message||"Couldn't update visibility.":`Couldn't update ${_.length} of ${w.length} clips.`)}let T=w.filter(C=>!_.some(V=>V.id===C));T.length&&(b(new Set),F(`Made ${T.length} clip${T.length===1?"":"s"} ${h}`,{actionLabel:"Undo",onAction:()=>he(T,E)}))}async function he(h,w){for(let P of h){let E=w.get(P);E&&G(P,{visibility:E.visibility,public_url:E.public_url})}await Mn(h,4,async P=>{let E=w.get(P);if(E)try{await L(`/api/v1/clips/${encodeURIComponent(P)}/visibility`,{method:"POST",body:{visibility:E.visibility}})}catch{}})}async function te(){let h=Array.from(p),w=s?.clips||[],P=h.map(T=>w.find(C=>C.id===T)).filter(Boolean),E=P.filter(T=>T.public_url),_=P.length-E.length;if(!E.length){F("No links to copy \u2014 selected clips are private.");return}try{await navigator.clipboard.writeText(E.map(T=>T.public_url).join(`
`)),F(`Copied ${E.length} link${E.length===1?"":"s"}`+(_?` (${_} skipped, private)`:""))}catch{F("Couldn't copy links to clipboard.")}}async function ne(){let h=Array.from(p);f(!1);try{let w=await L("/api/v1/clips/bulk-delete",{method:"POST",body:{ids:h}});b(new Set),$(),F(`Deleted ${w.affected} clip${w.affected===1?"":"s"}.`)}catch(w){F(w.message)}}if(d)return l`<main class="page">
      <${Y} name="alert" title="Couldn't load your library" body=${d.message} />
    </main>`;let q=s?.clips,ie=xo(n),oe=!!(n.q||n.game)||ie>0,Q=Co(q||[]),ae=(q||[]).reduce((h,w)=>h+(w.file_size_bytes||0),0),se=l`<div class="popover-fields">
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
      <button type="button" class="btn" onClick=${O}>Clear filters</button>
    </div>
  </div>`;return l`<main class="page">
    <div class="lib-header">
      <div>
        <h1>Library</h1>
        <p>${(q||[]).length} clip${(q||[]).length===1?"":"s"} · ${$e(ae)} used</p>
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
        value=${r} onInput=${S} />
      <select class="input" aria-label="Sort" value=${n.sort} onChange=${h=>j(h.target.value)}>
        ${go.map(([h,w])=>l`<option value=${h}>${w}</option>`)}
      </select>
      <${xn}
        label="Filters"
        panelClass="popover-filters"
        trigger=${({open:h,toggle:w})=>l`<button type="button" class="btn" aria-haspopup="dialog"
          aria-expanded=${h} onClick=${w}>
          ${U("sliders",{size:14})} Filters
          ${ie>0&&l`<span class="filter-badge">${ie}</span>`}
        </button>`}
        content=${se} />
    </div>

    ${Q.length>0&&l`<div class="lib-chips">
      <button type="button" class=${`chip ${n.game?"":"chip-on"}`} aria-pressed=${!n.game}
        onClick=${()=>K("")}>All</button>
      ${Q.map(h=>l`<button type="button" class=${`chip ${n.game===h.game?"chip-on":""}`}
        aria-pressed=${n.game===h.game} onClick=${()=>K(h.game)}>${h.game}</button>`)}
    </div>`}

    ${q==null?l`<${To} />`:q.length===0?oe?l`<${Y} name="film" title="No clips match this view"
            body="Try a different search, game, or clear your filters."
            action=${l`<button type="button" class="btn" onClick=${()=>{o(Xe),a("")}}>Clear filters</button>`} />`:l`<${Y} name="upload" title="Connect the Clipline desktop app to start uploading"
            body="New clips uploaded from the desktop app will show up here."
            action=${l`<a class="btn" href="/about">Learn more</a>`} />`:e==="grid"?l`<div class=${`card-grid ${p.size>0?"selecting":""}`}>
          ${q.map(h=>l`<${We} key=${h.id}
            clip=${{...h,thumbnail_url:ye(h),media_url:Ke(h)}}
            href=${`/clip/${encodeURIComponent(h.id)}`}
            selectable selected=${p.has(h.id)} onToggleSelect=${W} showVisibility />`)}
        </div>`:l`<${So} clips=${q} query=${n} onSort=${j} />`}

    <${Cn} count=${p.size}
      onPublic=${()=>Z("public")}
      onPrivate=${()=>Z("private")}
      onCopyLinks=${te}
      onDelete=${()=>f(!0)}
      onClear=${()=>b(new Set)} />

    <${_e} open=${i}
      title=${`Delete ${p.size} clip${p.size===1?"":"s"}?`}
      body="Public links stop working immediately."
      confirmLabel="Delete" danger
      onConfirm=${ne}
      onCancel=${()=>f(!1)} />
  </main>`}function je(e,[t,n]){let o=e.sort===t?"ascending":e.sort===n?"descending":"none",r=e.sort===n?t:n;return{ariaSort:o,next:r}}function So({clips:e,query:t,onSort:n}){let o=je(t,qe.title),r=je(t,qe.size),a=je(t,qe.duration),s=je(t,qe.uploaded);return l`<table class="lib-table">
    <thead>
      <tr>
        <th></th>
        <th aria-sort=${o.ariaSort}><button type="button" class="sort-btn" onClick=${()=>n(o.next)}>Title</button></th>
        <th>Game</th>
        <th>Visibility</th>
        <th aria-sort=${r.ariaSort}><button type="button" class="sort-btn" onClick=${()=>n(r.next)}>Size</button></th>
        <th aria-sort=${a.ariaSort}><button type="button" class="sort-btn" onClick=${()=>n(a.next)}>Duration</button></th>
        <th aria-sort=${s.ariaSort}><button type="button" class="sort-btn" onClick=${()=>n(s.next)}>Uploaded</button></th>
      </tr>
    </thead>
    <tbody>
      ${e.map(u=>l`<tr key=${u.id}>
        <td><img class="row-thumb" src=${ye(u)} alt="" width="64" height="36" loading="lazy" /></td>
        <td><a href=${`/clip/${encodeURIComponent(u.id)}`}>${u.title}</a></td>
        <td>${u.game_name||"\u2014"}</td>
        <td><span class=${`badge badge-${u.visibility}`}>${u.visibility}</span></td>
        <td>${$e(u.file_size_bytes)}</td>
        <td>${ue(u.duration_ms)}</td>
        <td>${fe(u.uploaded_at)}</td>
      </tr>`)}
    </tbody>
  </table>`}function To({count:e=8}){return l`<div class="card-grid">
    ${Array.from({length:e},(t,n)=>l`<div class="clip-card" key=${n}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`}ce();var Po={ChampionKill:"kill",FirstBlood:"kill",Multikill:"spree",Ace:"spree",DragonKill:"objective",HeraldKill:"objective",BaronKill:"objective",TurretKilled:"structure",InhibKilled:"structure",FirstBrick:"structure"};function En(e){let t=Number(e);return Number.isFinite(t)&&t>0?t/1e3:0}function Rn(e,t){let n=Number.isFinite(e)?e:0,o=t>0?t:Number.MAX_SAFE_INTEGER;return Math.max(0,Math.min(o,n))}function Ye(e,t){return t>0?Math.max(0,Math.min(100,e/t*100)):0}function ht(e){if(!Number.isFinite(e))return"0:00";let t=Math.max(0,Math.round(e)),n=Math.floor(t/60),o=t-n*60;return`${n}:${String(o).padStart(2,"0")}`}function Pn(e){if(!Number.isFinite(e))return"0:00.0";let t=Math.max(0,Math.round(e*10)),n=Math.floor(t/600),o=t-n*600,r=Math.floor(o/10);return`${n}:${String(r).padStart(2,"0")}.${o%10}`}function Dn(e,t){return`${Pn(e)} / ${t>0?Pn(t):"0:00.0"}`}function Eo(e){return Po[e]||"info"}function In(e,t){return(e||[]).map((n,o)=>{let r=Number(n.timestamp_ms);if(!Number.isFinite(r))return null;let a=r/1e3;return a<0||t>0&&a>t?null:{index:o,time:a,kind:String(n.kind||"Marker"),label:String(n.label||n.kind||"Marker"),category:Eo(n.kind)}}).filter(Boolean).sort((n,o)=>n.time-o.time)}function Ln(e,t){if(!e.length)return null;for(let n of e)if(n.time>t+.05)return n;return e[0]}function Un(e,t){if(!e.length)return null;for(let n=e.length-1;n>=0;n-=1)if(e[n].time<t-.05)return e[n];return e[e.length-1]}function Nn(e,t){switch(e){case"Space":case"KeyK":return{kind:"toggle-play"};case"ArrowLeft":return{kind:"seek-by",seconds:t?-1:-5};case"ArrowRight":return{kind:"seek-by",seconds:t?1:5};case"KeyJ":return{kind:"seek-by",seconds:-10};case"KeyL":return{kind:"seek-by",seconds:10};case"Comma":return{kind:"seek-by",seconds:-.1};case"Period":return{kind:"seek-by",seconds:.1};case"KeyM":return{kind:t?"previous-marker":"next-marker"};case"Home":return{kind:"seek-to",seconds:0};case"End":return{kind:"seek-to-end"};case"KeyF":return{kind:"fullscreen"};case"KeyT":return{kind:"theater"};default:return null}}var Fn="clipline.playerVolume",zn="clipline.clipTheaterMode",Ro=2e3,Do=[.25,.5,.75,1,1.25,1.5,2];function Io(e,t){switch(e){case"KeyM":return{kind:"toggle-mute"};case"KeyF":return{kind:"theater"};case"Escape":return{kind:"exit-theater"};default:return Nn(e,t)}}function Lo(e){return e instanceof Element?!!e.closest("input, textarea, select, button, a, [contenteditable='true'], [contenteditable='']"):!1}function Uo(){try{let e=window.localStorage.getItem(Fn);if(e==null)return 1;let t=Number(e);return Number.isFinite(t)?Math.max(0,Math.min(1,t)):1}catch{return 1}}function An(e){try{window.localStorage.setItem(Fn,String(Math.max(0,Math.min(1,e))))}catch{}}function No(){try{return window.localStorage.getItem(zn)==="true"}catch{return!1}}function Ao(e){try{window.localStorage.setItem(zn,String(e))}catch{}}function Hn({src:e,poster:t,durationMs:n,markers:o}){let r=A(null),a=A(null),s=A(null),u=A(!1),d=A(!1),c=En(n),[p,b]=v(!1),[i,f]=v(0),[g,y]=v(c),[k,x]=v(0),[$,S]=v(Uo),[D,O]=v(!1),[K,j]=v(1),[W,G]=v(!1),[N,Z]=v(No),[he,te]=v(!0),[ne,q]=v(null),[ie,oe]=v(""),Q=In(o,g);function ae(){te(!0),window.clearTimeout(s.current),s.current=window.setTimeout(()=>{let m=r.current;m&&!m.paused&&!m.ended&&te(!1)},Ro)}M(()=>{p||(window.clearTimeout(s.current),te(!0))},[p]),M(()=>{let m=r.current;if(!m)return;let R=()=>Number.isFinite(m.duration)&&m.duration>0?m.duration:c,z=()=>y(R()),bt=()=>y(R()),$t=()=>{u.current||f(m.currentTime||0)},yt=()=>{let Mt=R();if(!(Mt>0)||!m.buffered?.length){x(0);return}let St=m.currentTime||0,ke=0;for(let xe=0;xe<m.buffered.length;xe+=1){let qn=m.buffered.start(xe),Qe=m.buffered.end(xe);if(St>=qn&&St<=Qe){ke=Qe;break}ke=Math.max(ke,Qe)}x(Ye(ke,Mt))},gt=()=>{b(!0),oe(""),ae()},wt=()=>b(!1),kt=()=>b(!1),xt=()=>{S(m.volume),O(m.muted||m.volume===0)},Ct=()=>oe("Playback unavailable");return m.addEventListener("loadedmetadata",z),m.addEventListener("durationchange",bt),m.addEventListener("timeupdate",$t),m.addEventListener("progress",yt),m.addEventListener("play",gt),m.addEventListener("pause",wt),m.addEventListener("ended",kt),m.addEventListener("volumechange",xt),m.addEventListener("error",Ct),()=>{m.removeEventListener("loadedmetadata",z),m.removeEventListener("durationchange",bt),m.removeEventListener("timeupdate",$t),m.removeEventListener("progress",yt),m.removeEventListener("play",gt),m.removeEventListener("pause",wt),m.removeEventListener("ended",kt),m.removeEventListener("volumechange",xt),m.removeEventListener("error",Ct)}},[e,c]),M(()=>{r.current&&(r.current.volume=$)},[$]),M(()=>{r.current&&(r.current.muted=D)},[D]),M(()=>{r.current&&(r.current.playbackRate=K)},[K]),M(()=>{if(document.documentElement.classList.toggle("clipline-theater",N),N){let m=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=m}}},[N]),M(()=>()=>document.documentElement.classList.remove("clipline-theater"),[]);function se(m){Z(m),Ao(m)}function h(m){let R=r.current;if(!R)return;let z=g>0?Rn(m,g):Math.max(0,m);R.currentTime=z,f(z)}function w(m){h((r.current?.currentTime||0)+m)}async function P(){let m=r.current;if(m)if(m.paused||m.ended)try{await m.play()}catch(R){oe(R?.message||"Playback failed")}else m.pause()}function E(){let m=r.current;m&&(m.muted||m.volume===0?(m.muted=!1,m.volume===0&&(m.volume=1,S(1),An(1)),O(!1)):(m.muted=!0,O(!0)))}function _(m){let R=Number(m.target.value);S(R),O(R===0),An(R);let z=r.current;z&&(z.volume=R,z.muted=R===0)}async function T(){try{document.fullscreenElement?await document.exitFullscreen():await a.current?.requestFullscreen?.()}catch(m){oe(m?.message||"Fullscreen unavailable")}}function C(m){let R=r.current?.currentTime||0,z=m>0?Ln(Q,R):Un(Q,R);z&&h(z.time)}function V(){u.current=!0,d.current=p,p&&r.current?.pause()}function ge(m){let R=Number(m.target.value);f(R),h(R)}function we(){u.current&&(u.current=!1,d.current&&(d.current=!1,r.current?.play().catch(()=>{})))}function Gn(m){let R=m.currentTarget.getBoundingClientRect();if(!(R.width>0))return;let z=Math.max(0,Math.min(1,(m.clientX-R.left)/R.width));q({pct:z*100,time:z*(g||0)})}function Wn(){q(null)}return M(()=>{function m(R){if(R.defaultPrevented||Lo(R.target))return;let z=Io(R.code,R.shiftKey);if(z&&!(z.kind==="exit-theater"&&!N))switch(R.preventDefault(),ae(),z.kind){case"toggle-play":P();break;case"seek-by":w(z.seconds);break;case"seek-to":h(z.seconds);break;case"seek-to-end":h(g);break;case"next-marker":C(1);break;case"previous-marker":C(-1);break;case"toggle-mute":E();break;case"theater":se(!N);break;case"exit-theater":se(!1);break;case"fullscreen":T();break;default:break}}return document.addEventListener("keydown",m),()=>document.removeEventListener("keydown",m)},[g,N,p]),l`<div class=${`player ${he?"":"chrome-hidden"}`} ref=${a}
      onPointerMove=${ae} onPointerEnter=${ae}
      onPointerLeave=${()=>{let m=r.current;m&&!m.paused&&te(!1)}}
      onFocusIn=${()=>te(!0)}>
    <video ref=${r} class="player-video" src=${e} poster=${t||void 0}
      preload="metadata" playsinline onClick=${P}></video>
    ${ie&&l`<div class="player-note">${ie}</div>`}
    <div class="player-overlay">
      <div class="player-timeline" onPointerMove=${Gn} onPointerLeave=${Wn}>
        <div class="player-buffered" style=${`width:${k}%`}></div>
        <div class="player-progress" style=${`width:${Ye(i,g)}%`}></div>
        ${Q.map(m=>l`<span class="player-marker-tick" key=${m.index}
            style=${`left:${Ye(m.time,g)}%`} title=${`${m.label} @ ${ht(m.time)}`}></span>`)}
        <input class="player-scrubber" type="range" min="0" max=${g>0?g:0} step="0.01"
          value=${i} disabled=${!(g>0)} aria-label="Seek"
          onPointerDown=${V} onInput=${ge} onChange=${we}
          onPointerUp=${we} onPointerCancel=${we} onLostPointerCapture=${we} />
        ${ne&&l`<div class="player-hover-time" style=${`left:${ne.pct}%`}>${ht(ne.time)}</div>`}
      </div>
      <div class="player-controls">
        ${Q.length>0&&l`<div class="player-cluster">
          <button type="button" class="player-btn" title="Previous marker" aria-label="Previous marker"
            onClick=${()=>C(-1)}>${U("skipBack",{size:14})}</button>
          <button type="button" class="player-btn" title="Next marker" aria-label="Next marker"
            onClick=${()=>C(1)}>${U("skipForward",{size:14})}</button>
        </div>`}
        <button type="button" class="player-btn player-play" aria-label=${p?"Pause":"Play"} onClick=${P}>
          ${U(p?"pause":"play",{size:16})}
        </button>
        <span class="player-time">${Dn(i,g)}</span>
        <div class="player-spacer"></div>
        <div class="player-speed-wrap">
          <button type="button" class="player-btn player-speed" aria-haspopup="menu" aria-expanded=${W}
            onClick=${()=>G(m=>!m)}>${K}×</button>
          ${W&&l`<div class="player-speed-menu" role="menu">
            ${Do.map(m=>l`<button type="button" role="menuitem" key=${m}
                class=${`player-speed-item ${m===K?"is-active":""}`}
                onClick=${()=>{j(m),G(!1)}}>${m}×</button>`)}
          </div>`}
        </div>
        <button type="button" class="player-btn" aria-label=${D?"Unmute":"Mute"} onClick=${E}>
          ${U(D?"volumeX":"volume2",{size:14})}
        </button>
        <input class="player-volume" type="range" min="0" max="1" step="0.01" value=${D?0:$}
          aria-label="Volume" onInput=${_} />
        <button type="button" class="player-btn" aria-label=${N?"Exit theater mode":"Theater mode"}
          aria-pressed=${N} onClick=${()=>se(!N)}>${U("theater",{size:14})}</button>
        <button type="button" class="player-btn" aria-label="Fullscreen" onClick=${T}>
          ${U("fullscreen",{size:14})}
        </button>
      </div>
    </div>
  </div>`}ce();function Fo(e){let t=new Map(e.map(a=>[a.id,a])),n=new Map,o=[],r=0;return e.forEach(a=>{let s=a.parent_comment_id||"";s&&t.has(s)?(n.has(s)||n.set(s,[]),n.get(s).push(a),r+=1):s||(o.push(a),r+=1)}),{roots:o,repliesByParent:n,count:r}}function zo(e){return(e||"?").trim().slice(0,1).toUpperCase()||"?"}function Ho(e){let t=e.author_avatar_url;return typeof t=="string"&&t.startsWith("/")?l`<img class="comment-avatar" src=${t} alt="" />`:l`<div class="comment-avatar">${zo(e.author_name)}</div>`}function Vn({shareId:e}){let{user:t}=J(X),[n,o]=v(null),[r,a]=v(""),[s,u]=v(null),[d,c]=v(""),[p,b]=v(null);function i(){L(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`).then($=>o($.comments||[])).catch(()=>o([]))}M(()=>{let $=!0;return o(null),L(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`).then(S=>$&&o(S.comments||[])).catch(()=>$&&o([])),()=>{$=!1}},[e]);async function f($,S){let D=$.trim();if(D)try{await L(`/api/v1/public/clips/${encodeURIComponent(e)}/comments`,{method:"POST",body:S?{body:D,parent_comment_id:S}:{body:D}}),i()}catch(O){F(O.message)}}async function g($){$.preventDefault(),await f(r),a("")}async function y($,S){$.preventDefault(),await f(d,S),c(""),u(null)}async function k(){let $=p;b(null);try{await L(`/api/v1/public/clips/${encodeURIComponent(e)}/comments/${encodeURIComponent($)}`,{method:"DELETE"}),i()}catch(S){F(S.message)}}let x=Fo(n||[]);return l`<section class="comments">
    <div class="comments-header"><h2>Comments</h2><span class="muted">${x.count}</span></div>
    ${t?l`<form class="comment-form" onSubmit=${g}>
          <textarea rows="3" maxlength="2000" placeholder="Add a comment" value=${r}
            onInput=${$=>a($.target.value)}></textarea>
          <div class="comment-form-actions">
            <button type="submit" class="btn btn-primary">${U("message",{size:14})} Post comment</button>
          </div>
        </form>`:l`<p class="comment-signin"><a href="/login">Sign in</a> to comment.</p>`}
    ${n==null?"":x.count===0?l`<p class="comment-signin">No comments yet.</p>`:l`<div class="comment-list">
          ${x.roots.map($=>Bn($,{depth:0,repliesByParent:x.repliesByParent,user:t,replyOpenId:s,setReplyOpenId:u,replyDraft:d,setReplyDraft:c,submitReply:y,onDelete:b}))}
        </div>`}
    <${_e} open=${p!=null} title="Delete this comment?"
      body="This removes the comment from the public clip page." confirmLabel="Delete" danger
      onConfirm=${k} onCancel=${()=>b(null)} />
  </section>`}function Bn(e,t){let{depth:n,repliesByParent:o,user:r,replyOpenId:a,setReplyOpenId:s,replyDraft:u,setReplyDraft:d,submitReply:c,onDelete:p}=t,b=o.get(e.id)||[];return l`<article class="comment" key=${e.id}>
    ${Ho(e)}
    <div class="comment-body">
      <div class="comment-head">
        ${e.author_username?l`<a href=${`/u/${encodeURIComponent(e.author_username)}`}>${e.author_name}</a>`:l`<strong>${e.author_name}</strong>`}
        ${e.is_uploader&&l`<span class="comment-badge">Uploader</span>`}
        <span>${Oe(e.created_at)}</span>
        <div class="comment-actions">
          ${r&&n===0&&l`<button type="button" class="comment-action"
            onClick=${()=>s(a===e.id?null:e.id)}>
            ${U("message",{size:12})} Reply</button>`}
          ${e.viewer_can_delete&&l`<button type="button" class="comment-delete" aria-label="Delete comment"
            title="Delete comment" onClick=${()=>p(e.id)}>${U("trash",{size:12})}</button>`}
        </div>
      </div>
      <p class="comment-text">${e.body}</p>
      ${r&&n===0&&a===e.id&&l`<form class="comment-reply-form"
        onSubmit=${i=>c(i,e.id)}>
        <textarea rows="2" maxlength="2000" placeholder="Write a reply" value=${u}
          onInput=${i=>d(i.target.value)}></textarea>
        <div class="comment-form-actions">
          <button type="submit" class="btn btn-primary">${U("message",{size:14})} Post reply</button>
        </div>
      </form>`}
      ${b.length>0&&l`<div class="comment-replies">
        ${b.map(i=>Bn(i,{...t,depth:n+1}))}
      </div>`}
    </div>
  </article>`}var Vo=["private","public","unlisted"];function Bo(e,t){return e==="clip"?!0:!!t?.viewer_can_edit}function Oo(e,t,n){return e==="public"?t.shareId:n?.public_share_id||null}function Ko(e,t,n){return e==="clip"?t.clipId:n?.viewer_clip_id||null}function Go(e,t,n){if(e)try{return`${t}${new URL(e).pathname}`}catch{}return n?`${t}/c/${encodeURIComponent(n)}`:null}function Wo(e){let t=e?.height!=null?e.height:"",n=Math.round(e?.fps||0)||"";return`${t}p${n}`}function qo(e,t,n=8){return(e||[]).filter(o=>o.share_id!==t).slice(0,n)}function vt({route:e}){let{user:t}=J(X),[n,o]=v(null),[r,a]=v(null),[s,u]=v([]),[d,c]=v(!1),[p,b]=v(""),[i,f]=v(!1),[g,y]=v(""),[k,x]=v(!1),[$,S]=v(!1),[D,O]=v(!1),K=e.name==="clip"?`clip:${e.clipId}`:`public:${e.shareId}`;if(M(()=>{let _=!0;o(null),a(null),c(!1),f(!1),O(!1),x(!1);let T=e.name==="clip"?`/api/v1/clips/${encodeURIComponent(e.clipId)}`:`/api/v1/public/clips/${encodeURIComponent(e.shareId)}`;return L(T).then(C=>{_&&(o(C),e.name==="public"&&L(`/api/v1/public/clips/${encodeURIComponent(e.shareId)}/view`,{method:"POST",body:{}}).then(V=>_&&o(ge=>ge&&{...ge,view_count:V.view_count})).catch(()=>{}))}).catch(C=>_&&a(C)),()=>{_=!1}},[K]),M(()=>{let _=!0;return L("/api/v1/public/clips").then(T=>_&&u(T.clips||[])).catch(()=>{}),()=>{_=!1}},[K]),r)return l`<main class="page"><${Y} name="alert" title="Couldn't load this clip" body=${r.message} /></main>`;if(!n)return l`<main class="page watch"><div><div class="skeleton-thumb"></div></div><aside class="upnext"></aside></main>`;let j=Bo(e.name,n),W=Oo(e.name,e,n),G=Ko(e.name,e,n),N=e.name==="clip"?Ke({id:n.id}):$n({share_id:e.shareId}),Z=e.name==="clip"?ye({id:n.id}):pe({share_id:e.shareId}),he=e.name==="clip"?t?.display_name||t?.username||"You":n.author_name||"Unknown creator",te=n.public_url??n.share_url??null,ne=Go(te,window.location.origin,W),q=e.name==="clip";function ie(){b(n.title),c(!0)}async function oe(_){_?.preventDefault?.();let T=p.trim();if(!T||T===n.title){c(!1);return}try{await L(`/api/v1/clips/${encodeURIComponent(G)}`,{method:"PATCH",body:{title:T}}),o(C=>({...C,title:T})),c(!1),F("Title saved.")}catch(C){F(C.message)}}function Q(){y(n.description||""),f(!0)}async function ae(){let _=g.trim();try{await L(`/api/v1/clips/${encodeURIComponent(G)}`,{method:"PATCH",body:{description:_||null}}),o(T=>({...T,description:_||null})),f(!1),F("Description saved.")}catch(T){F(T.message)}}async function se(_){let T=n.visibility;if(T!==_){o(C=>({...C,visibility:_}));try{let C=await L(`/api/v1/clips/${encodeURIComponent(G)}/visibility`,{method:"POST",body:{visibility:_}});o(V=>({...V,visibility:C.visibility,public_url:C.public_url,public_share_id:C.public_share_id})),F(`Visibility set to ${_}.`,{actionLabel:"Undo",onAction:()=>se(T)})}catch(C){o(V=>({...V,visibility:T})),F(C.message)}}}async function h(){if(ne)try{await navigator.clipboard.writeText(ne),F("Link copied.")}catch{F("Couldn't copy the link.")}}async function w(){S(!1);try{await L(`/api/v1/clips/${encodeURIComponent(G)}`,{method:"DELETE"}),F("Clip deleted."),ee("/library")}catch(_){F(_.message)}}let P=[n.game_name&&l`<a class="chip chip-on" href=${`/game/${encodeURIComponent(n.game_name)}`}>${n.game_name}</a>`,de(n.view_count),`Recorded ${fe(n.recorded_at)}`,`by ${he}`].filter(Boolean),E=qo(s,W,8);return l`<main class="page watch">
    <div>
      <${Hn} src=${N} poster=${Z} durationMs=${n.duration_ms} markers=${n.markers} />
      <div class="watch-titlerow">
        ${d?l`<input class="input watch-title-input" value=${p} autofocus
              onInput=${_=>b(_.target.value)} onBlur=${oe}
              onKeyDown=${_=>{_.key==="Enter"&&oe(_),_.key==="Escape"&&c(!1)}} />`:l`<h1>${n.title}
              ${j&&l`<button type="button" class="edit-pencil" aria-label="Edit title" onClick=${ie}
                >${U("edit",{size:14})}</button>`}</h1>`}
      </div>
      <p class="watch-meta">${P.map((_,T)=>l`${T>0?" \xB7 ":""}${_}`)}</p>

      ${j&&l`<div class="watch-actions">
        <div class="seg" role="radiogroup" aria-label="Visibility">
          ${Vo.map(_=>l`<button type="button" role="radio" key=${_} aria-checked=${n.visibility===_}
              class=${`seg-item ${n.visibility===_?"seg-on":""}`} onClick=${()=>se(_)}
              >${_[0].toUpperCase()+_.slice(1)}</button>`)}
        </div>
        <button type="button" class="btn btn-primary" disabled=${!ne} onClick=${h}>
          ${U("copy",{size:14})} Copy share link</button>
        <div class="watch-more">
          <button type="button" class="btn" aria-haspopup="menu" aria-expanded=${k}
            onClick=${()=>x(_=>!_)}>⋯</button>
          ${k&&l`<div class="menu" role="menu">
            <button type="button" class="menu-danger" role="menuitem"
              onClick=${()=>{x(!1),S(!0)}}>${U("trash",{size:14})} Delete clip</button>
          </div>`}
        </div>
      </div>`}

      <div class="watch-desc">
        ${i?l`<textarea class="input" rows="5" value=${g} autofocus
              onInput=${_=>y(_.target.value)} onBlur=${ae}
              onKeyDown=${_=>{_.key==="Enter"&&(_.ctrlKey||_.metaKey)&&ae(),_.key==="Escape"&&f(!1)}}></textarea>`:n.description?l`<p>${n.description}
              ${j&&l`<button type="button" class="edit-pencil" aria-label="Edit description" onClick=${Q}
                >${U("edit",{size:12})}</button>`}</p>`:j?l`<button type="button" class="watch-desc-add" onClick=${Q}>+ Add a description</button>`:""}
      </div>

      ${q&&l`<button type="button" class="details-strip" aria-expanded=${D}
        onClick=${()=>O(_=>!_)}>
        <span><b>${ue(n.duration_ms)}</b> length</span>
        <span><b>${$e(n.file_size_bytes)}</b></span>
        <span><b>${Wo(n)}</b></span>
        <span><b>${n.video_codec}/${n.audio_codec}</b> ${n.container}</span>
        <span class="details-chev">${D?"\u25B4 less":"\u25BE more"}</span>
      </button>`}
      ${q&&D&&l`<dl class="details-full">
        <div><dt>Recorded</dt><dd>${fe(n.recorded_at)}</dd></div>
        <div><dt>Uploaded</dt><dd>${fe(n.uploaded_at)}</dd></div>
        <div><dt>Dimensions</dt><dd>${n.width&&n.height?`${n.width} x ${n.height}`:"Unknown"}</dd></div>
        <div><dt>FPS</dt><dd>${n.fps??"Unknown"}</dd></div>
        <div><dt>Container</dt><dd>${n.container||"Unknown"}</dd></div>
        <div><dt>Video codec</dt><dd>${n.video_codec||"Unknown"}</dd></div>
        <div><dt>Audio codec</dt><dd>${n.audio_codec||"Unknown"}</dd></div>
        <div><dt>Source</dt><dd>${n.source_type||"Unknown"}</dd></div>
        <div><dt>Checksum</dt><dd>${n.checksum_sha256||"Unknown"}</dd></div>
      </dl>`}

      ${W&&l`<${Vn} shareId=${W} />`}
    </div>
    <aside class="upnext">
      <h4 class="kicker">Up next</h4>
      ${E.map(_=>l`<a class="upnext-row" key=${_.share_id} href=${`/c/${encodeURIComponent(_.share_id)}`}>
          <img src=${pe(_)} alt="" loading="lazy" />
          <span><b>${_.title}</b><small>${_.author_name} · ${_.game_name||"No game"} · ${de(_.view_count)}</small></span>
        </a>`)}
    </aside>

    <${_e} open=${$} title="Delete this clip?" body="Public links stop working immediately."
      confirmLabel="Delete" danger onConfirm=${w} onCancel=${()=>S(!1)} />
  </main>`}var Zo={publicLibrary:_t,publicGame:_t,games:kn,library:Tn,clip:vt,public:vt},On={publicLibrary:"feed",publicGame:"feed",games:"games",library:"library",clip:"library",admin:"admin",profile:"profile"},Kn=pn(Be());function jo({route:e}){return l`<main class="page"><p class="kicker">Not ported yet</p>
    <p>Route <code>${e.name}</code> still renders in the legacy app — open it from
    <a href="/">the served site</a>.</p></main>`}function Xo(){let e=mn();Kn=e.name;let{ready:t}=J(X);if(!t)return l`<div class="boot">Loading…</div>`;let n=Zo[e.name]||jo,o=e.name==="login"||e.name==="resetPassword";return l`<div class="ui" onClick=${fn}>
    ${!o&&l`<${hn} active=${On[e.name]||""} />`}
    <${n} route=${e} />
    ${!o&&l`<${vn} active=${On[e.name]||""} />`}
    <${bn} />
  </div>`}window.addEventListener("clipline:unauthorized",()=>{X.set({user:null,csrfToken:null,ready:!0}),un(Kn)||ee("/login")});(async()=>{try{let e=await L("/api/v1/auth/me");st(e.csrf_token),X.set({user:e.user,csrfToken:e.csrf_token,ready:!0})}catch{X.set({user:null,csrfToken:null,ready:!0})}Ot(l`<${Xo} />`,document.querySelector("#app"))})();
