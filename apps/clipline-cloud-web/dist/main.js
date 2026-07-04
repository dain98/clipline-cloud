var cn=Object.defineProperty;var un=(e,t)=>()=>(e&&(t=e(e=0)),t);var pn=(e,t)=>{for(var n in t)cn(e,n,{get:t[n],enumerable:!0})};var ht={};pn(ht,{ApiError:()=>fe,api:()=>N,getCsrfToken:()=>yn,setCsrfToken:()=>Ie});function Ie(e){me=e}function yn(){return me}async function N(e,t={}){let n=(t.method||"GET").toUpperCase(),o=new Headers(t.headers||{});o.set("Accept","application/json");let r=t.body;r&&typeof r!="string"&&(o.set("Content-Type","application/json"),r=JSON.stringify(r)),!["GET","HEAD","OPTIONS"].includes(n)&&me&&o.set("X-CSRF-Token",me);let a=await fetch(e,{...t,body:r,credentials:"same-origin",headers:o,method:n}),c=(a.headers.get("content-type")||"").includes("application/json")?await a.json():await a.text();if(!a.ok){a.status===401&&window.dispatchEvent(new CustomEvent("clipline:unauthorized"));let p=typeof c=="object"&&c?.error?c.error:a.statusText;throw new fe(p||"Request failed",a.status)}return c}var me,fe,Y=un(()=>{me=null;fe=class extends Error{constructor(t,n){super(t),this.status=n}}});var pe,k,tt,dn,G,Xe,nt,ot,Ee,re,ne,at,Ne,Ue,Le,_n,le={},ce=[],mn=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,de=Array.isArray;function V(e,t){for(var n in t)e[n]=t[n];return e}function De(e){e&&e.parentNode&&e.parentNode.removeChild(e)}function Ae(e,t,n){var o,r,a,s={};for(a in t)a=="key"?o=t[a]:a=="ref"?r=t[a]:s[a]=t[a];if(arguments.length>2&&(s.children=arguments.length>3?pe.call(arguments,2):n),typeof e=="function"&&e.defaultProps!=null)for(a in e.defaultProps)s[a]===void 0&&(s[a]=e.defaultProps[a]);return ie(e,s,o,r,null)}function ie(e,t,n,o,r){var a={type:e,props:t,key:n,ref:o,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:r??++tt,__i:-1,__u:0};return r==null&&k.vnode!=null&&k.vnode(a),a}function _e(e){return e.children}function se(e,t){this.props=e,this.context=t}function X(e,t){if(t==null)return e.__?X(e.__,e.__i+1):null;for(var n;t<e.__k.length;t++)if((n=e.__k[t])!=null&&n.__e!=null)return n.__e;return typeof e.type=="function"?X(e):null}function fn(e){if(e.__P&&e.__d){var t=e.__v,n=t.__e,o=[],r=[],a=V({},t);a.__v=t.__v+1,k.vnode&&k.vnode(a),He(e.__P,a,t,e.__n,e.__P.namespaceURI,32&t.__u?[n]:null,o,n??X(t),!!(32&t.__u),r),a.__v=t.__v,a.__.__k[a.__i]=a,ct(o,a,r),t.__e=t.__=null,a.__e!=n&&rt(a)}}function rt(e){if((e=e.__)!=null&&e.__c!=null)return e.__e=e.__c.base=null,e.__k.some(function(t){if(t!=null&&t.__e!=null)return e.__e=e.__c.base=t.__e}),rt(e)}function Ye(e){(!e.__d&&(e.__d=!0)&&G.push(e)&&!ue.__r++||Xe!=k.debounceRendering)&&((Xe=k.debounceRendering)||nt)(ue)}function ue(){try{for(var e,t=1;G.length;)G.length>t&&G.sort(ot),e=G.shift(),t=G.length,fn(e)}finally{G.length=ue.__r=0}}function it(e,t,n,o,r,a,s,c,p,l,d){var v,i,_,y,f,b,w,g=o&&o.__k||ce,R=t.length;for(p=hn(n,t,g,p,R),v=0;v<R;v++)(_=n.__k[v])!=null&&(i=_.__i!=-1&&g[_.__i]||le,_.__i=v,b=He(e,_,i,r,a,s,c,p,l,d),y=_.__e,_.ref&&i.ref!=_.ref&&(i.ref&&ze(i.ref,null,_),d.push(_.ref,_.__c||y,_)),f==null&&y!=null&&(f=y),(w=!!(4&_.__u))||i.__k===_.__k?(p=st(_,p,e,w),w&&i.__e&&(i.__e=null)):typeof _.type=="function"&&b!==void 0?p=b:y&&(p=y.nextSibling),_.__u&=-7);return n.__e=f,p}function hn(e,t,n,o,r){var a,s,c,p,l,d=n.length,v=d,i=0;for(e.__k=new Array(r),a=0;a<r;a++)(s=t[a])!=null&&typeof s!="boolean"&&typeof s!="function"?(typeof s=="string"||typeof s=="number"||typeof s=="bigint"||s.constructor==String?s=e.__k[a]=ie(null,s,null,null,null):de(s)?s=e.__k[a]=ie(_e,{children:s},null,null,null):s.constructor===void 0&&s.__b>0?s=e.__k[a]=ie(s.type,s.props,s.key,s.ref?s.ref:null,s.__v):e.__k[a]=s,p=a+i,s.__=e,s.__b=e.__b+1,c=null,(l=s.__i=vn(s,n,p,v))!=-1&&(v--,(c=n[l])&&(c.__u|=2)),c==null||c.__v==null?(l==-1&&(r>d?i--:r<d&&i++),typeof s.type!="function"&&(s.__u|=4)):l!=p&&(l==p-1?i--:l==p+1?i++:(l>p?i--:i++,s.__u|=4))):e.__k[a]=null;if(v)for(a=0;a<d;a++)(c=n[a])!=null&&(2&c.__u)==0&&(c.__e==o&&(o=X(c)),pt(c,c));return o}function st(e,t,n,o){var r,a;if(typeof e.type=="function"){for(r=e.__k,a=0;r&&a<r.length;a++)r[a]&&(r[a].__=e,t=st(r[a],t,n,o));return t}e.__e!=t&&(o&&(t&&e.type&&!t.parentNode&&(t=X(e)),n.insertBefore(e.__e,t||null)),t=e.__e);do t=t&&t.nextSibling;while(t!=null&&t.nodeType==8);return t}function vn(e,t,n,o){var r,a,s,c=e.key,p=e.type,l=t[n],d=l!=null&&(2&l.__u)==0;if(l===null&&c==null||d&&c==l.key&&p==l.type)return n;if(o>(d?1:0)){for(r=n-1,a=n+1;r>=0||a<t.length;)if((l=t[s=r>=0?r--:a++])!=null&&(2&l.__u)==0&&c==l.key&&p==l.type)return s}return-1}function Je(e,t,n){t[0]=="-"?e.setProperty(t,n??""):e[t]=n==null?"":typeof n!="number"||mn.test(t)?n:n+"px"}function ae(e,t,n,o,r){var a,s;e:if(t=="style")if(typeof n=="string")e.style.cssText=n;else{if(typeof o=="string"&&(e.style.cssText=o=""),o)for(t in o)n&&t in n||Je(e.style,t,"");if(n)for(t in n)o&&n[t]==o[t]||Je(e.style,t,n[t])}else if(t[0]=="o"&&t[1]=="n")a=t!=(t=t.replace(at,"$1")),s=t.toLowerCase(),t=s in e||t=="onFocusOut"||t=="onFocusIn"?s.slice(2):t.slice(2),e.l||(e.l={}),e.l[t+a]=n,n?o?n[ne]=o[ne]:(n[ne]=Ne,e.addEventListener(t,a?Le:Ue,a)):e.removeEventListener(t,a?Le:Ue,a);else{if(r=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&t[4]!="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&n==1?"":n))}}function et(e){return function(t){if(this.l){var n=this.l[t.type+e];if(t[re]==null)t[re]=Ne++;else if(t[re]<n[ne])return;return n(k.event?k.event(t):t)}}}function He(e,t,n,o,r,a,s,c,p,l){var d,v,i,_,y,f,b,w,g,R,E,I,B,te,Q,K,D=t.type;if(t.constructor!==void 0)return null;128&n.__u&&(p=!!(32&n.__u),a=[c=t.__e=n.__e]),(d=k.__b)&&d(t);e:if(typeof D=="function"){v=s.length;try{if(g=t.props,R=D.prototype&&D.prototype.render,E=(d=D.contextType)&&o[d.__c],I=d?E?E.props.value:d.__:o,n.__c?w=(i=t.__c=n.__c).__=i.__E:(R?t.__c=i=new D(g,I):(t.__c=i=new se(g,I),i.constructor=D,i.render=gn),E&&E.sub(i),i.state||(i.state={}),i.__n=o,_=i.__d=!0,i.__h=[],i._sb=[]),R&&i.__s==null&&(i.__s=i.state),R&&D.getDerivedStateFromProps!=null&&(i.__s==i.state&&(i.__s=V({},i.__s)),V(i.__s,D.getDerivedStateFromProps(g,i.__s))),y=i.props,f=i.state,i.__v=t,_)R&&D.getDerivedStateFromProps==null&&i.componentWillMount!=null&&i.componentWillMount(),R&&i.componentDidMount!=null&&i.__h.push(i.componentDidMount);else{if(R&&D.getDerivedStateFromProps==null&&g!==y&&i.componentWillReceiveProps!=null&&i.componentWillReceiveProps(g,I),t.__v==n.__v||!i.__e&&i.shouldComponentUpdate!=null&&i.shouldComponentUpdate(g,i.__s,I)===!1){t.__v!=n.__v&&(i.props=g,i.state=i.__s,i.__d=!1),t.__e=n.__e,t.__k=n.__k,t.__k.some(function(F){F&&(F.__=t)}),ce.push.apply(i.__h,i._sb),i._sb=[],i.__h.length&&s.push(i);break e}i.componentWillUpdate!=null&&i.componentWillUpdate(g,i.__s,I),R&&i.componentDidUpdate!=null&&i.__h.push(function(){i.componentDidUpdate(y,f,b)})}if(i.context=I,i.props=g,i.__P=e,i.__e=!1,B=k.__r,te=0,R)i.state=i.__s,i.__d=!1,B&&B(t),d=i.render(i.props,i.state,i.context),ce.push.apply(i.__h,i._sb),i._sb=[];else do i.__d=!1,B&&B(t),d=i.render(i.props,i.state,i.context),i.state=i.__s;while(i.__d&&++te<25);i.state=i.__s,i.getChildContext!=null&&(o=V(V({},o),i.getChildContext())),R&&!_&&i.getSnapshotBeforeUpdate!=null&&(b=i.getSnapshotBeforeUpdate(y,f)),Q=d!=null&&d.type===_e&&d.key==null?ut(d.props.children):d,c=it(e,de(Q)?Q:[Q],t,n,o,r,a,s,c,p,l),i.base=t.__e,t.__u&=-161,i.__h.length&&s.push(i),w&&(i.__E=i.__=null)}catch(F){if(s.length=v,t.__v=null,p||a!=null){if(F.then){for(t.__u|=p?160:128;c&&c.nodeType==8&&c.nextSibling;)c=c.nextSibling;a!=null&&(a[a.indexOf(c)]=null),t.__e=c}else if(a!=null)for(K=a.length;K--;)De(a[K])}else t.__e=n.__e;t.__k==null&&(t.__k=n.__k||[]),F.then||lt(t),k.__e(F,t,n)}}else a==null&&t.__v==n.__v?(t.__k=n.__k,t.__e=n.__e):c=t.__e=bn(n.__e,t,n,o,r,a,s,p,l);return(d=k.diffed)&&d(t),128&t.__u?void 0:c}function lt(e){e&&(e.__c&&(e.__c.__e=!0),e.__k&&e.__k.some(lt))}function ct(e,t,n){for(var o=0;o<n.length;o++)ze(n[o],n[++o],n[++o]);k.__c&&k.__c(t,e),e.some(function(r){try{e=r.__h,r.__h=[],e.some(function(a){a.call(r)})}catch(a){k.__e(a,r.__v)}})}function ut(e){return typeof e!="object"||e==null||e.__b>0?e:de(e)?e.map(ut):e.constructor!==void 0?null:V({},e)}function bn(e,t,n,o,r,a,s,c,p){var l,d,v,i,_,y,f,b=n.props||le,w=t.props,g=t.type;if(g=="svg"?r="http://www.w3.org/2000/svg":g=="math"?r="http://www.w3.org/1998/Math/MathML":r||(r="http://www.w3.org/1999/xhtml"),a!=null){for(l=0;l<a.length;l++)if((_=a[l])&&"setAttribute"in _==!!g&&(g?_.localName==g:_.nodeType==3)){e=_,a[l]=null;break}}if(e==null){if(g==null)return document.createTextNode(w);e=document.createElementNS(r,g,w.is&&w),c&&(k.__m&&k.__m(t,a),c=!1),a=null}if(g==null)b===w||c&&e.data==w||(e.data=w);else{if(a=g=="textarea"&&w.defaultValue!=null?null:a&&pe.call(e.childNodes),!c&&a!=null)for(b={},l=0;l<e.attributes.length;l++)b[(_=e.attributes[l]).name]=_.value;for(l in b)_=b[l],l=="dangerouslySetInnerHTML"?v=_:l=="children"||l in w||l=="value"&&"defaultValue"in w||l=="checked"&&"defaultChecked"in w||ae(e,l,null,_,r);for(l in w)_=w[l],l=="children"?i=_:l=="dangerouslySetInnerHTML"?d=_:l=="value"?y=_:l=="checked"?f=_:c&&typeof _!="function"||b[l]===_||ae(e,l,_,b[l],r);if(d)c||v&&(d.__html==v.__html||d.__html==e.innerHTML)||(e.innerHTML=d.__html),t.__k=[];else if(v&&(e.innerHTML=""),it(t.type=="template"?e.content:e,de(i)?i:[i],t,n,o,g=="foreignObject"?"http://www.w3.org/1999/xhtml":r,a,s,a?a[0]:n.__k&&X(n,0),c,p),a!=null)for(l=a.length;l--;)De(a[l]);c&&g!="textarea"||(l="value",g=="progress"&&y==null?e.removeAttribute("value"):y!=null&&(y!==e[l]||g=="progress"&&!y||g=="option"&&y!=b[l])&&ae(e,l,y,b[l],r),l="checked",f!=null&&f!=e[l]&&ae(e,l,f,b[l],r))}return e}function ze(e,t,n){try{if(typeof e=="function"){var o=typeof e.__u=="function";o&&e.__u(),o&&t==null||(e.__u=e(t))}else e.current=t}catch(r){k.__e(r,n)}}function pt(e,t,n){var o,r;if(k.unmount&&k.unmount(e),(o=e.ref)&&(o.current&&o.current!=e.__e||ze(o,null,t)),(o=e.__c)!=null){if(o.componentWillUnmount)try{o.componentWillUnmount()}catch(a){k.__e(a,t)}o.base=o.__P=o.__n=null}if(o=e.__k)for(r=0;r<o.length;r++)o[r]&&pt(o[r],t,n||typeof e.type!="function");n||De(e.__e),e.__c=e.__=e.__e=void 0}function gn(e,t,n){return this.constructor(e,n)}function dt(e,t,n){var o,r,a,s;t==document&&(t=document.documentElement),k.__&&k.__(e,t),r=(o=typeof n=="function")?null:n&&n.__k||t.__k,a=[],s=[],He(t,e=(!o&&n||t).__k=Ae(_e,null,[e]),r||le,le,t.namespaceURI,!o&&n?[n]:r?null:t.firstChild?pe.call(t.childNodes):null,a,!o&&n?n:r?r.__e:t.firstChild,o,s),ct(a,e,s),e.props.children=null}pe=ce.slice,k={__e:function(e,t,n,o){for(var r,a,s;t=t.__;)if((r=t.__c)&&!r.__)try{if((a=r.constructor)&&a.getDerivedStateFromError!=null&&(r.setState(a.getDerivedStateFromError(e)),s=r.__d),r.componentDidCatch!=null&&(r.componentDidCatch(e,o||{}),s=r.__d),s)return r.__E=r}catch(c){e=c}throw e}},tt=0,dn=function(e){return e!=null&&e.constructor===void 0},se.prototype.setState=function(e,t){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=V({},this.state),typeof e=="function"&&(e=e(V({},n),this.props)),e&&V(n,e),e!=null&&this.__v&&(t&&this._sb.push(t),Ye(this))},se.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),Ye(this))},se.prototype.render=_e,G=[],nt=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,ot=function(e,t){return e.__v.__b-t.__v.__b},ue.__r=0,Ee=Math.random().toString(8),re="__d"+Ee,ne="__a"+Ee,at=/(PointerCapture)$|Capture$/i,Ne=0,Ue=et(!1),Le=et(!0),_n=0;var mt=function(e,t,n,o){var r;t[0]=0;for(var a=1;a<t.length;a++){var s=t[a++],c=t[a]?(t[0]|=s?1:2,n[t[a++]]):t[++a];s===3?o[0]=c:s===4?o[1]=Object.assign(o[1]||{},c):s===5?(o[1]=o[1]||{})[t[++a]]=c:s===6?o[1][t[++a]]+=c+"":s?(r=e.apply(c,mt(e,c,n,["",null])),o.push(r),c[0]?t[0]|=2:(t[a-2]=0,t[a]=r)):o.push(c)}return o},_t=new Map;function ft(e){var t=_t.get(this);return t||(t=new Map,_t.set(this,t)),(t=mt(this,t.get(e)||(t.set(e,t=(function(n){for(var o,r,a=1,s="",c="",p=[0],l=function(i){a===1&&(i||(s=s.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?p.push(0,i,s):a===3&&(i||s)?(p.push(3,i,s),a=2):a===2&&s==="..."&&i?p.push(4,i,0):a===2&&s&&!i?p.push(5,0,!0,s):a>=5&&((s||!i&&a===5)&&(p.push(a,0,s,r),a=6),i&&(p.push(a,i,0,r),a=6)),s=""},d=0;d<n.length;d++){d&&(a===1&&l(),l(d));for(var v=0;v<n[d].length;v++)o=n[d][v],a===1?o==="<"?(l(),p=[p],a=3):s+=o:a===4?s==="--"&&o===">"?(a=1,s=""):s=o+s[0]:c?o===c?c="":s+=o:o==='"'||o==="'"?c=o:o===">"?(l(),a=1):a&&(o==="="?(a=5,r=s,s=""):o==="/"&&(a<5||n[d][v+1]===">")?(l(),a===3&&(p=p[0]),a=p,(p=p[0]).push(2,0,a),a=0):o===" "||o==="	"||o===`
`||o==="\r"?(l(),a=2):s+=o),a===3&&s==="!--"&&(a=4,p=p[0])}return l(),p})(e)),t),arguments,[])).length>1?t:t[0]}var u=ft.bind(Ae);Y();var oe,C,Fe,vt,he=0,Ct=[],S=k,bt=S.__b,gt=S.__r,yt=S.diffed,$t=S.__c,wt=S.unmount,kt=S.__;function Be(e,t){S.__h&&S.__h(C,e,he||t),he=0;var n=C.__H||(C.__H={__:[],__h:[]});return e>=n.__.length&&n.__.push({}),n.__[e]}function $(e){return he=1,$n(Pt,e)}function $n(e,t,n){var o=Be(oe++,2);if(o.t=e,!o.__c&&(o.__=[n?n(t):Pt(void 0,t),function(c){var p=o.__N?o.__N[0]:o.__[0],l=o.t(p,c);p!==l&&(o.__N=[l,o.__[1]],o.__c.setState({}))}],o.__c=C,!C.__f)){var r=function(c,p,l){if(!o.__c.__H)return!0;var d=!1,v=o.__c.props!==c;if(o.__c.__H.__.some(function(_){if(_.__N){d=!0;var y=_.__[0];_.__=_.__N,_.__N=void 0,y!==_.__[0]&&(v=!0)}}),a){var i=a.call(this,c,p,l);return d?i||v:i}return!d||v};C.__f=!0;var a=C.shouldComponentUpdate,s=C.componentWillUpdate;C.componentWillUpdate=function(c,p,l){if(this.__e){var d=a;a=void 0,r(c,p,l),a=d}s&&s.call(this,c,p,l)},C.shouldComponentUpdate=r}return o.__N||o.__}function T(e,t){var n=Be(oe++,3);!S.__s&&Tt(n.__H,t)&&(n.__=e,n.u=t,C.__H.__h.push(n))}function P(e){return he=5,wn(function(){return{current:e}},[])}function wn(e,t){var n=Be(oe++,7);return Tt(n.__H,t)&&(n.__=e(),n.__H=t,n.__h=e),n.__}function xt(){for(var e;e=Ct.shift();){var t=e.__H;if(e.__P&&t)try{t.__h.some(Ve),t.__h.some(St),t.__h=[]}catch(n){t.__h=[],S.__e(n,e.__v)}}}S.__b=function(e){C=null,bt&&bt(e)},S.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),kt&&kt(e,t)},S.__r=function(e){gt&&gt(e),oe=0;var t=(C=e.__c).__H;t&&(Fe===C?(t.__h=[],C.__h=[],t.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(t.__h.length&&xt(),oe=0)),Fe=C},S.diffed=function(e){yt&&yt(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(Ct.push(t)!==1&&vt===S.requestAnimationFrame||((vt=S.requestAnimationFrame)||kn)(xt)),t.__H.__.some(function(n){n.u&&(n.__H=n.u,n.u=void 0)})),Fe=C=null},S.__c=function(e,t){t.some(function(n){try{n.__h.some(Ve),n.__h=n.__h.filter(function(o){return!o.__||St(o)})}catch(o){t.some(function(r){r.__h&&(r.__h=[])}),t=[],S.__e(o,n.__v)}}),$t&&$t(e,t)},S.unmount=function(e){wt&&wt(e);var t,n=e.__c;n&&n.__H&&(n.__H.__.some(function(o){try{Ve(o)}catch(r){t=r}}),n.__H=void 0,t&&S.__e(t,n.__v))};var Mt=typeof requestAnimationFrame=="function";function kn(e){var t,n=function(){clearTimeout(o),Mt&&cancelAnimationFrame(t),setTimeout(e)},o=setTimeout(n,35);Mt&&(t=requestAnimationFrame(n))}function Ve(e){var t=C,n=e.__c;typeof n=="function"&&(e.__c=void 0,n()),C=t}function St(e){var t=C;e.__c=e.__(),C=t}function Tt(e,t){return!e||e.length!==t.length||t.some(function(n,o){return n!==e[o]})}function Pt(e,t){return typeof t=="function"?t(e):t}function Rt(e){let t=e,n=new Set;return{get:()=>t,set(o){t=o,n.forEach(r=>r(t))},update(o){this.set(o(t))},subscribe(o){return n.add(o),()=>n.delete(o)}}}function J(e){let[t,n]=$(e.get());return T(()=>e.subscribe(n),[e]),t}var Z=Rt({user:null,csrfToken:null,ready:!1}),ve=Rt([]),xn=0;function q(e,{actionLabel:t,onAction:n,timeoutMs:o=5e3}={}){let r=++xn;return ve.update(a=>[...a,{id:r,message:e,actionLabel:t,onAction:n}]),o&&setTimeout(()=>be(r),o),r}function be(e){ve.update(t=>t.filter(n=>n.id!==e))}function ge(e){try{return decodeURIComponent(e)}catch{return e}}function Et(e){let t=Number(e.get("page")||1);return{sort:e.get("sort")||"uploaded_at_desc",game:e.get("game")||"",q:e.get("q")||"",page:Number.isFinite(t)?Math.max(1,t):1}}var Mn=["login","resetPassword","public","publicLibrary","publicGame","publicUser","about","games"];function Ut(e){return Mn.includes(e)}function ye(e,t){let n=new URLSearchParams(t||""),o=e;return o.startsWith("/c/")?{name:"public",shareId:ge(o.slice(3))}:o==="/"||o==="/public"||o==="/search"?{name:"publicLibrary",query:Et(n)}:o.startsWith("/game/")?{name:"publicGame",game:ge(o.slice(6)),query:Et(n)}:o==="/about"?{name:"about"}:o==="/games"?{name:"games"}:o.startsWith("/u/")?{name:"publicUser",username:ge(o.slice(3))}:o==="/library"?{name:"library"}:o.startsWith("/clip/")?{name:"clip",clipId:ge(o.slice(6))}:o==="/admin"?{name:"admin",tab:n.get("tab")||"overview"}:o==="/account"?{name:"account"}:o==="/profile"?{name:"profile"}:o==="/login"?{name:"login"}:o==="/reset-password"?{name:"resetPassword",token:n.get("token")||"",invite:n.get("invite")==="1"}:{name:"publicLibrary"}}var Lt=()=>window.location.pathname==="/preview.html";function Cn(e){let t=e.slice(1)||"/",[n,o=""]=t.split("?");return{pathname:n,search:o?`?${o}`:""}}function $e(){return Lt()?Cn(window.location.hash):{pathname:window.location.pathname,search:window.location.search}}function Nt(e){return ye(e.pathname,e.search).name}var Oe=new Set;function W(e){Lt()?window.location.hash=e:window.history.pushState({},"",e),Ge()}function Ge(){let{pathname:e,search:t}=$e(),n=ye(e,t);Oe.forEach(o=>o(n))}window.addEventListener("popstate",Ge);window.addEventListener("hashchange",Ge);function Dt(){let{pathname:e,search:t}=$e(),[n,o]=$(()=>ye(e,t));return T(()=>(Oe.add(o),()=>Oe.delete(o)),[]),n}function At(e){let t=e.target.closest("a[href^='/']");!t||t.target||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||(e.preventDefault(),W(t.getAttribute("href")))}var Ht={alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',clipboard:'<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',copy:'<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',external:'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',fastForward:'<path d="m13 19 9-7-9-7v14Z"/><path d="m2 19 9-7-9-7v14Z"/>',film:'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 8h4"/><path d="M3 16h4"/><path d="M17 8h4"/><path d="M17 16h4"/>',fullscreen:'<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/><path d="M12 2a15.3 15.3 0 0 0 0 20"/>',home:'<path d="m3 10 9-7 9 7"/><path d="M5 8.5V20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5"/><path d="M9 22V12h6v10"/>',info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',library:'<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',lock:'<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',logOut:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',menu:'<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',message:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>',notepad:'<path d="M8 2v4"/><path d="M16 2v4"/><path d="M3 10h18"/><path d="M6 4h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/><path d="M8 14h8"/><path d="M8 18h5"/>',pause:'<path d="M8 5v14"/><path d="M16 5v14"/>',play:'<path d="m8 5 11 7-11 7V5Z"/>',plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',check:'<path d="M20 6 9 17l-5-5"/>',refresh:'<path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/><path d="M3 12A9 9 0 0 1 18.5 5.7L21 8"/><path d="M21 3v5h-5"/>',rewind:'<path d="m11 19-9-7 9-7v14Z"/><path d="m22 19-9-7 9-7v14Z"/>',save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',server:'<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',skipBack:'<path d="M19 20 9 12l10-8v16Z"/><path d="M5 19V5"/>',skipForward:'<path d="m5 4 10 8-10 8V4Z"/><path d="M19 5v14"/>',shield:'<path d="M20 13c0 5-3.5 7.5-7.7 8.8a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V5l8-3 8 3v8Z"/>',sliders:'<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>',theater:'<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M6 9h12"/><path d="M6 15h12"/>',trash:'<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',volume2:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9 9 0 0 1 0 14"/>',volumeX:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>',x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'};function j(e,{size:t=18}={}){return u`<svg viewBox="0 0 24 24" width=${t} height=${t} fill="none"
    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" dangerouslySetInnerHTML=${{__html:Ht[e]||""}} />`}function zt({active:e}){let{user:t}=J(Z),[n,o]=$(!1),r=P(null),a=t?.role==="admin";T(()=>{if(!n)return;let p=d=>{r.current?.contains(d.target)||o(!1)},l=d=>{d.key==="Escape"&&o(!1)};return document.addEventListener("pointerdown",p),document.addEventListener("keydown",l),()=>{document.removeEventListener("pointerdown",p),document.removeEventListener("keydown",l)}},[n]);let s=[["feed","/","Feed"],["library","/library","Library",!!t],["games","/games","Games"],["admin","/admin","Admin",a]].filter(([,,,p])=>p!==!1),c=p=>{p.preventDefault();let l=new FormData(p.target).get("q")?.toString().trim();W(l?`/search?q=${encodeURIComponent(l)}`:"/search")};return u`<header class="topbar">
    <a class="wordmark" href="/" aria-label="Clipline home">
      <img src="/clipline-icon.svg" alt="" width="24" height="24" />
      CLIP<b>LINE</b>
    </a>
    <nav class="topnav" aria-label="Primary">
      ${s.map(([p,l,d])=>u`
        <a class=${p===e?"topnav-on":""} href=${l}>${d}</a>`)}
    </nav>
    <form class="topsearch" role="search" onSubmit=${c}>
      <input class="input" name="q" placeholder="Search clips, games, players…" aria-label="Search" />
    </form>
    ${t?u`<div class="avatar-wrap" ref=${r}>
          <button class="avatar-btn" aria-haspopup="menu" aria-expanded=${n}
            onClick=${()=>o(!n)}>
            <span class="avatar">${(t.display_name||t.username)[0].toUpperCase()}</span>
          </button>
          ${n&&u`<div class="menu" role="menu" onClick=${()=>o(!1)}>
            <a role="menuitem" href="/profile">Profile</a>
            <a role="menuitem" href="/account">Account</a>
            ${a&&u`<a role="menuitem" href="/admin">Admin</a>`}
            <button role="menuitem" class="menu-danger" onClick=${Sn}>Sign out</button>
          </div>`}
        </div>`:u`<a class="btn" href="/login">${j("lock",{size:14})} Sign in</a>`}
  </header>`}async function Sn(){let{api:e}=await Promise.resolve().then(()=>(Y(),ht));try{await e("/api/v1/auth/logout",{method:"POST"})}catch{}Z.set({user:null,csrfToken:null,ready:!0}),W("/login")}function It({active:e}){return u`<nav class="tabbar" aria-label="Primary">
    ${[["feed","/","home","Feed"],["library","/library","library","Library"],["search","/search","search","Search"],["profile","/profile","user","Profile"]].map(([n,o,r,a])=>u`
      <a class=${n===e?"tab-on":""} href=${o}>${j(r)}<span>${a}</span></a>`)}
  </nav>`}function Ft(){let e=J(ve);return u`<div class="toasts" role="status" aria-live="polite">
    ${e.map(t=>u`<div class="toast" key=${t.id}>
      <span>${t.message}</span>
      ${t.actionLabel&&u`<button class="toast-action"
        onClick=${()=>{t.onAction?.(),be(t.id)}}>${t.actionLabel}</button>`}
      <button class="toast-x" aria-label="Dismiss" onClick=${()=>be(t.id)}>✕</button>
    </div>`)}
  </div>`}Y();function Vt(e){if(!e)return"Unknown";let t=new Date(e);return Number.isNaN(t.getTime())?"Unknown":new Intl.DateTimeFormat(void 0,{dateStyle:"medium",timeStyle:"short"}).format(t)}function ee(e){if(e==null)return"Unknown";let t=Math.max(0,Math.round(Number(e)/1e3)),n=Math.floor(t/60),o=t%60;return`${n}:${String(o).padStart(2,"0")}`}function Bt(e){if(!e)return"Unknown";let t=new Date(e);if(Number.isNaN(t.getTime()))return"Unknown";let n=Math.min(0,t.getTime()-Date.now()),o=[["year",365*24*60*60*1e3],["month",720*60*60*1e3],["week",10080*60*1e3],["day",1440*60*1e3],["hour",3600*1e3],["minute",60*1e3],["second",1e3]],[r,a]=o.find(([,c])=>Math.abs(n)>=c)||o[o.length-1],s=Math.round(n/a);return new Intl.RelativeTimeFormat(void 0,{numeric:"always"}).format(s,r)}function Ze(e){if(e==null)return"Unknown";let t=Number(e);if(!Number.isFinite(t))return"Unknown";let n=["B","KiB","MiB","GiB","TiB"],o=t,r=0;for(;o>=1024&&r<n.length-1;)o/=1024,r+=1;return`${o.toFixed(r===0?0:1)} ${n[r]}`}function we(e){let t=Number(e||0),n=Number.isFinite(t)&&t>0?Math.floor(t):0;return`${new Intl.NumberFormat(void 0,{notation:n>=1e4?"compact":"standard"}).format(n)} view${n===1?"":"s"}`}function ke(e){return`/api/v1/public/clips/${encodeURIComponent(e.share_id)}/thumbnail`}function qe(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/thumbnail`}function Ot(e){return`/api/v1/clips/${encodeURIComponent(e.id)}/media`}var xe=null;function Gt(e){xe?.(),xe=e}function Zt(e){xe===e&&(xe=null)}var Tn=()=>window.matchMedia("(pointer: fine)").matches&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches&&!navigator.connection?.saveData;function qt({src:e,poster:t,alt:n=""}){let[o,r]=$(!1),[a,s]=$(0),c=P(null),p=P(null),l=P(!0),d=P(),v=()=>{l.current&&(clearTimeout(c.current),r(!1),s(0))};d.current=v;let i=()=>{!e||!Tn()||(c.current=setTimeout(()=>{l.current&&(Gt(d.current),r(!0))},300))},_=y=>{let f=y.target;f.duration&&s(f.currentTime/f.duration)};return T(()=>()=>{l.current=!1,clearTimeout(c.current),Zt(d.current)},[]),u`<span class="hover-preview" onPointerEnter=${i} onPointerLeave=${v}>
    ${o?u`<video ref=${p} src=${e} poster=${t} muted loop autoplay
          playsinline preload="none" onTimeUpdate=${_} />`:u`<img src=${t} alt=${n} loading="lazy" />`}
    ${o&&u`<span class="preview-scrub"><span style=${`width:${a*100}%`} /></span>`}
  </span>`}function We(e){return e.owner?.display_name||e.owner?.username||e.owner_username||e.author_name||e.author_username||null}function Me({clip:e,href:t,selectable:n=!1,selected:o=!1,onToggleSelect:r,showVisibility:a=!1,showAuthor:s=!1}){let c=We(e),p=[e.game_name&&u`<em>${e.game_name}</em>`,s&&c,e.view_count!=null&&we(e.view_count),e.uploaded_at&&Bt(e.uploaded_at)].filter(Boolean);return u`<article class=${`clip-card ${o?"is-selected":""} ${n?"is-selectable":""}`}>
    <a class="card-thumb" href=${t} tabindex="-1" aria-hidden="true">
      <${qt} src=${e.media_url} poster=${e.thumbnail_url} />
      ${e.duration_ms!=null&&u`<span class="dur-pill">${ee(e.duration_ms)}</span>`}
      ${a&&u`<span class=${`badge badge-${e.visibility} card-vis`}>${e.visibility}</span>`}
    </a>
    ${n&&u`<label class="card-check">
      <input type="checkbox" checked=${o} aria-label=${`Select ${e.title}`}
        onChange=${()=>r?.(e.id)} />
    </label>`}
    <h3 class="card-title"><a href=${t}>${e.title}</a></h3>
    <p class="card-meta">${p.map((l,d)=>u`${d>0&&" \xB7 "}${l}`)}</p>
  </article>`}function z({name:e="film",title:t,body:n,action:o}){return u`<div class="empty">
    <div class="empty-icon">${j(e,{size:28})}</div>
    <h3>${t}</h3>
    ${n&&u`<p>${n}</p>`}
    ${o}
  </div>`}var Pn=[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]],Rn=6;function Ke({route:e}){let t={sort:"uploaded_at_desc",page:1,q:"",...e.query,game:e.name==="publicGame"?e.game:e.query?.game||""},[n,o]=$(null),[r,a]=$([]),[s,c]=$(null);T(()=>{let f=!0;o(null),c(null);let b=new URLSearchParams;return t.sort!=="uploaded_at_desc"&&b.set("sort",t.sort),t.game&&b.set("game",t.game),t.q&&b.set("q",t.q),Number(t.page)>1&&b.set("page",String(t.page)),N(`/api/v1/public/clips${b.size?`?${b}`:""}`).then(w=>f&&o(w)).catch(w=>f&&c(w)),()=>{f=!1}},[e.name,t.sort,t.game,t.q,t.page]),T(()=>{let f=!0;return N("/api/v1/public/games").then(b=>f&&a(b.games||[])).catch(()=>{}),()=>{f=!1}},[]);let p=f=>W(Ln({...t,page:1,...f}));if(s)return u`<main class="page">
      <${z} name="alert" title="Couldn't load the feed" body=${s.message} />
    </main>`;let l=n?.clips,d=!!(t.game||t.q)||Number(t.page)>1,v=!d,i=[...r].sort((f,b)=>(b.clip_count||0)-(f.clip_count||0)),_=i.slice(0,Rn),y=i.length-_.length;return u`<main class="page">
    ${l==null?u`<${Un} />`:l.length===0?u`<${z} name="film"
          title=${d?"No clips match this filter":"No public clips yet"}
          body=${d?"Try a different game, search, or clear your filters.":"Clips shared as public from a library will show up here."}
          action=${d&&u`<a class="btn" href="/">Clear filters</a>`} />`:u`
        ${v?En(l):""}
        <div class="feed-toolbar">
          <h2>Latest uploads</h2>
          <select class="input" value=${t.sort} onChange=${f=>p({sort:f.target.value})}>
            ${Pn.map(([f,b])=>u`<option value=${f}>${b}</option>`)}
          </select>
          <div class="chips">
            <button class=${`chip ${t.game?"":"chip-on"}`} onClick=${()=>p({game:""})}>All</button>
            ${_.map(f=>u`<button
              class=${`chip ${t.game===f.game?"chip-on":""}`}
              onClick=${()=>p({game:f.game})}>${f.game}</button>`)}
            ${y>0&&u`<a class="chip" href="/games">+${y}</a>`}
          </div>
        </div>
        <div class="card-grid">
          ${(v?l.slice(4):l).map(f=>u`<${Me} clip=${{...f,thumbnail_url:ke(f)}}
              href=${je(f)} showAuthor />`)}
        </div>
        ${Nn(n,t,p)}
      `}
  </main>`}function En(e){let[t,...n]=e,o=n.slice(0,3);return u`<p class="kicker">Now playing on this server</p>
    <section class="hero">
      <a class="hero-main" href=${je(t)}>
        <img src=${ke(t)} alt="" loading="lazy" />
        <span class="hero-caption">▶ ${t.title} — ${t.game_name} · ${ee(t.duration_ms)}</span>
      </a>
      <div class="hero-side">
        ${o.map(r=>u`<a class="hero-row" href=${je(r)}>
            <img src=${ke(r)} alt="" loading="lazy" />
            <span><b>${r.title}</b>
              <small>${We(r)} · ${r.game_name} · ${we(r.view_count)}</small></span>
          </a>`)}
      </div>
    </section>`}function Un({count:e=8}){return u`<div class="card-grid">
    ${Array.from({length:e},(t,n)=>u`<div class="clip-card" key=${n}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`}function je(e){return`/c/${encodeURIComponent(e.share_id)}`}function Ln({sort:e="uploaded_at_desc",game:t="",q:n="",page:o=1}={}){let r=new URLSearchParams,a=e||"uploaded_at_desc",s=String(t||"").trim(),c=String(n||"").trim(),p=Math.max(1,Number(o||1));if(a!=="uploaded_at_desc"&&r.set("sort",a),p>1&&r.set("page",String(p)),c)return r.set("q",c),s&&r.set("game",s),`/search?${r.toString()}`;if(s){let d=r.toString();return`/game/${encodeURIComponent(s)}${d?`?${d}`:""}`}let l=r.toString();return l?`/search?${l}`:"/"}function Nn(e,t,n){let o=Math.max(1,Number(t.page||1)),r=!!e?.has_more;return o<=1&&!r?"":u`<nav class="pager" aria-label="Public clip pages">
    <button class="btn" type="button" disabled=${o<=1}
      onClick=${()=>n({page:o-1})}>Previous</button>
    <span class="muted">Page ${o}</span>
    <button class="btn" type="button" disabled=${!r}
      onClick=${()=>n({page:o+1})}>Next</button>
  </nav>`}Y();function Wt(){let[e,t]=$(null),[n,o]=$(null);return T(()=>{let r=!0;return N("/api/v1/public/games").then(a=>r&&t(a.games||[])).catch(a=>r&&o(a)),()=>{r=!1}},[]),n?u`<main class="page">
      <${z} name="alert" title="Couldn't load games" body=${n.message} />
    </main>`:u`<main class="page">
    <p class="kicker">Browse by game</p>
    ${e==null?u`<div class="game-grid">
          ${Array.from({length:6},(r,a)=>u`<div class="game-tile is-loading" key=${a}>
            <div class="skeleton-thumb"></div>
          </div>`)}
        </div>`:e.length===0?u`<${z} name="film" title="No games yet"
          body="Once clips are shared as public, their games will show up here." />`:u`<div class="game-grid">
          ${e.map(r=>u`<a class="game-tile" href=${`/game/${encodeURIComponent(r.game)}`}>
            ${r.thumbnail_url?u`<img src=${r.thumbnail_url} alt="" loading="lazy" />`:u`<div class="game-tile-fallback">${(r.game||"?")[0].toUpperCase()}</div>`}
            <div class="game-tile-body">
              <b>${r.game}</b>
              <small>${r.clip_count} clip${r.clip_count===1?"":"s"}</small>
            </div>
          </a>`)}
        </div>`}
  </main>`}Y();function jt({trigger:e,content:t,onClose:n,label:o,panelClass:r=""}){let[a,s]=$(!1),c=P(null),p=P(null),l=P(null),d=()=>{s(!1),n?.()},v=()=>{if(a){d();return}l.current=document.activeElement,s(!0)};return T(()=>{if(!a)return;let i=f=>{c.current?.contains(f.target)||d()},_=f=>{f.key==="Escape"&&d()};return document.addEventListener("pointerdown",i),document.addEventListener("keydown",_),p.current?.querySelector("input, select, textarea, button, a[href], [tabindex]")?.focus(),()=>{document.removeEventListener("pointerdown",i),document.removeEventListener("keydown",_),l.current?.focus?.()}},[a]),u`<div class="popover-wrap" ref=${c}>
    ${e({open:a,toggle:v})}
    ${a&&u`<div class=${`popover ${r}`} ref=${p} role="dialog" aria-label=${o||"Filters"}>
      ${t}
    </div>`}
  </div>`}function Kt({count:e,onPublic:t,onPrivate:n,onCopyLinks:o,onDelete:r,onClear:a}){return e?u`<div class="bulkbar" role="toolbar" aria-label="Bulk actions">
    <b>${e} selected</b>
    <button class="btn" onClick=${t}>Make public</button>
    <button class="btn" onClick=${n}>Make private</button>
    <button class="btn" onClick=${o}>Copy links</button>
    <button class="btn btn-danger" onClick=${r}>Delete</button>
    <button class="btn bulk-x" aria-label="Clear selection" onClick=${a}>✕</button>
  </div>`:null}function Qt({open:e,title:t,body:n,confirmLabel:o="Confirm",onConfirm:r,onCancel:a,danger:s=!1}){let c=P(null),p=P(null);return T(()=>{let l=c.current;l&&(e&&!l.open?(l.showModal(),p.current?.focus()):!e&&l.open&&l.close())},[e]),u`<dialog ref=${c} class="confirm-dialog" aria-labelledby="confirm-dialog-title"
    onCancel=${l=>{l.preventDefault(),a?.()}}
    onClose=${()=>e&&a?.()}>
    ${e&&u`<div class="confirm-dialog-body">
      <h2 id="confirm-dialog-title">${t}</h2>
      ${n&&u`<p>${n}</p>`}
      <div class="confirm-dialog-actions">
        <button type="button" class="btn" onClick=${a}>Cancel</button>
        <button type="button" ref=${p} class=${`btn ${s?"btn-danger":"btn-primary"}`}
          onClick=${r}>${o}</button>
      </div>
    </div>`}
  </dialog>`}var Yt="clipline.libraryView",Dn=[["uploaded_at_desc","Uploaded newest"],["uploaded_at_asc","Uploaded oldest"],["recorded_at_desc","Recorded newest"],["recorded_at_asc","Recorded oldest"],["updated_at_desc","Updated newest"],["updated_at_asc","Updated oldest"],["created_at_desc","Created newest"],["created_at_asc","Created oldest"],["duration_desc","Duration longest"],["duration_asc","Duration shortest"],["size_desc","Size largest"],["size_asc","Size smallest"],["title_asc","Title A-Z"],["title_desc","Title Z-A"]],Ce={title:["title_asc","title_desc"],size:["size_asc","size_desc"],duration:["duration_asc","duration_desc"],uploaded:["uploaded_at_asc","uploaded_at_desc"]},An=["visibility","status","source_type","from","to","min_duration_seconds","max_duration_seconds","min_size_mib","max_size_mib"],Pe={sort:"uploaded_at_desc",game:"",source_type:"",visibility:"",status:"",q:"",from:"",to:"",min_duration_seconds:"",max_duration_seconds:"",min_size_mib:"",max_size_mib:""};function Se(e){if(e===""||e==null)return null;let t=Number(e);return Number.isFinite(t)?t:null}function Hn(e){let t=new URLSearchParams;t.set("sort",e.sort||Pe.sort),t.set("page_size","100");for(let s of["game","source_type","visibility","status","q"])e[s]&&t.set(s,e[s]);e.from&&t.set("from",`${e.from}T00:00:00Z`),e.to&&t.set("to",`${e.to}T23:59:59Z`);let n=Se(e.min_duration_seconds);n!=null&&t.set("min_duration_ms",String(Math.round(n*1e3)));let o=Se(e.max_duration_seconds);o!=null&&t.set("max_duration_ms",String(Math.round(o*1e3)));let r=Se(e.min_size_mib);r!=null&&t.set("min_size_bytes",String(Math.round(r*1024*1024)));let a=Se(e.max_size_mib);return a!=null&&t.set("max_size_bytes",String(Math.round(a*1024*1024))),t}function zn(e){return An.reduce((t,n)=>t+(e[n]?1:0),0)}function In(e,t=6){let n=new Map;for(let o of e){let r=o.game_name;r&&n.set(r,(n.get(r)||0)+1)}return Array.from(n,([o,r])=>({game:o,count:r})).sort((o,r)=>r.count-o.count||o.game.localeCompare(r.game)).slice(0,t)}async function Xt(e,t,n){let o=0;async function r(){let a=o++;if(!(a>=e.length))return await n(e[a]),r()}await Promise.all(Array.from({length:Math.min(t,e.length)},r))}function Fn(){try{return localStorage.getItem(Yt)==="rows"?"rows":"grid"}catch{return"grid"}}function Jt(){let[e,t]=$(Fn),[n,o]=$(Pe),[r,a]=$(Pe.q),[s,c]=$(null),[p,l]=$(null),[d,v]=$(new Set),[i,_]=$(!1),[y,f]=$(0),b=P(null);T(()=>()=>clearTimeout(b.current),[]),T(()=>{let m=!0;return c(null),l(null),N(`/api/v1/clips?${Hn(n)}`).then(h=>{m&&(c(h),v(new Set))}).catch(h=>m&&l(h)),()=>{m=!1}},[JSON.stringify(n),y]);let w=m=>{t(m);try{localStorage.setItem(Yt,m)}catch{}},g=()=>f(m=>m+1),R=m=>{let h=m.target.value;a(h),clearTimeout(b.current),b.current=setTimeout(()=>{o(x=>({...x,q:h}))},300)},E=m=>h=>{let x=h.target.value;o(M=>({...M,[m]:x}))},I=()=>{o(m=>({...m,visibility:"",status:"",source_type:"",from:"",to:"",min_duration_seconds:"",max_duration_seconds:"",min_size_mib:"",max_size_mib:""}))},B=m=>o(h=>({...h,game:h.game===m?"":m})),te=m=>o(h=>({...h,sort:m})),Q=m=>{v(h=>{let x=new Set(h);return x.has(m)?x.delete(m):x.add(m),x})};function K(m,h){c(x=>x&&{...x,clips:x.clips.map(M=>M.id===m?{...M,...h}:M)})}function D(m,h){let x=new Set(m);c(M=>M&&{...M,clips:M.clips.map(U=>x.has(U.id)?{...U,...h}:U)})}async function F(m){let h=Array.from(d);if(!h.length)return;let x=s?.clips||[],M=new Map(h.map(L=>[L,x.find(A=>A.id===L)]));D(h,{visibility:m});let U=[];if(await Xt(h,4,async L=>{try{let A=await N(`/api/v1/clips/${encodeURIComponent(L)}/visibility`,{method:"POST",body:{visibility:m}});K(L,{visibility:A.visibility,public_url:A.public_url})}catch(A){U.push({id:L,message:A.message})}}),U.length){for(let{id:L}of U){let A=M.get(L);A&&K(L,{visibility:A.visibility,public_url:A.public_url})}q(U.length===h.length?U[0].message||"Couldn't update visibility.":`Couldn't update ${U.length} of ${h.length} clips.`)}let H=h.filter(L=>!U.some(A=>A.id===L));H.length&&(v(new Set),q(`Made ${H.length} clip${H.length===1?"":"s"} ${m}`,{actionLabel:"Undo",onAction:()=>nn(H,M)}))}async function nn(m,h){for(let x of m){let M=h.get(x);M&&K(x,{visibility:M.visibility,public_url:M.public_url})}await Xt(m,4,async x=>{let M=h.get(x);if(M)try{await N(`/api/v1/clips/${encodeURIComponent(x)}/visibility`,{method:"POST",body:{visibility:M.visibility}})}catch{}})}async function on(){let m=Array.from(d),h=s?.clips||[],x=m.map(H=>h.find(L=>L.id===H)).filter(Boolean),M=x.filter(H=>H.public_url),U=x.length-M.length;if(!M.length){q("No links to copy \u2014 selected clips are private.");return}try{await navigator.clipboard.writeText(M.map(H=>H.public_url).join(`
`)),q(`Copied ${M.length} link${M.length===1?"":"s"}`+(U?` (${U} skipped, private)`:""))}catch{q("Couldn't copy links to clipboard.")}}async function an(){let m=Array.from(d);_(!1);try{let h=await N("/api/v1/clips/bulk-delete",{method:"POST",body:{ids:m}});v(new Set),g(),q(`Deleted ${h.affected} clip${h.affected===1?"":"s"}.`)}catch(h){q(h.message)}}if(p)return u`<main class="page">
      <${z} name="alert" title="Couldn't load your library" body=${p.message} />
    </main>`;let O=s?.clips,Re=zn(n),rn=!!(n.q||n.game)||Re>0,Qe=In(O||[]),sn=(O||[]).reduce((m,h)=>m+(h.file_size_bytes||0),0),ln=u`<div class="popover-fields">
    <label class="field"><span>Visibility</span>
      <select class="input" value=${n.visibility} onChange=${E("visibility")}>
        <option value="">Any</option>
        <option value="private">Private</option>
        <option value="public">Public</option>
        <option value="unlisted">Unlisted</option>
      </select>
    </label>
    <label class="field"><span>Status</span>
      <select class="input" value=${n.status} onChange=${E("status")}>
        <option value="">Any</option>
        <option value="created">Created</option>
        <option value="uploading">Uploading</option>
        <option value="processing">Processing</option>
        <option value="ready">Ready</option>
        <option value="failed">Failed</option>
      </select>
    </label>
    <label class="field"><span>Source</span>
      <input class="input" type="text" value=${n.source_type} onInput=${E("source_type")} placeholder="Source type" />
    </label>
    <label class="field"><span>From</span>
      <input class="input" type="date" value=${n.from} onInput=${E("from")} />
    </label>
    <label class="field"><span>To</span>
      <input class="input" type="date" value=${n.to} onInput=${E("to")} />
    </label>
    <label class="field"><span>Min duration (s)</span>
      <input class="input" type="number" min="0" value=${n.min_duration_seconds} onInput=${E("min_duration_seconds")} />
    </label>
    <label class="field"><span>Max duration (s)</span>
      <input class="input" type="number" min="0" value=${n.max_duration_seconds} onInput=${E("max_duration_seconds")} />
    </label>
    <label class="field"><span>Min size (MiB)</span>
      <input class="input" type="number" min="0" step="0.1" value=${n.min_size_mib} onInput=${E("min_size_mib")} />
    </label>
    <label class="field"><span>Max size (MiB)</span>
      <input class="input" type="number" min="0" step="0.1" value=${n.max_size_mib} onInput=${E("max_size_mib")} />
    </label>
    <div class="popover-actions">
      <button type="button" class="btn" onClick=${I}>Clear filters</button>
    </div>
  </div>`;return u`<main class="page">
    <div class="lib-header">
      <div>
        <h1>Library</h1>
        <p>${(O||[]).length} clip${(O||[]).length===1?"":"s"} · ${Ze(sn)} used</p>
      </div>
      <div class="seg" role="group" aria-label="View">
        <button type="button" class=${`seg-item ${e==="grid"?"seg-on":""}`}
          aria-pressed=${e==="grid"} onClick=${()=>w("grid")}>Grid</button>
        <button type="button" class=${`seg-item ${e==="rows"?"seg-on":""}`}
          aria-pressed=${e==="rows"} onClick=${()=>w("rows")}>Rows</button>
      </div>
    </div>

    <div class="lib-toolbar">
      <input class="input" type="search" aria-label="Search clips" placeholder="Search title or game"
        value=${r} onInput=${R} />
      <select class="input" aria-label="Sort" value=${n.sort} onChange=${m=>te(m.target.value)}>
        ${Dn.map(([m,h])=>u`<option value=${m}>${h}</option>`)}
      </select>
      <${jt}
        label="Filters"
        panelClass="popover-filters"
        trigger=${({open:m,toggle:h})=>u`<button type="button" class="btn" aria-haspopup="dialog"
          aria-expanded=${m} onClick=${h}>
          ${j("sliders",{size:14})} Filters
          ${Re>0&&u`<span class="filter-badge">${Re}</span>`}
        </button>`}
        content=${ln} />
    </div>

    ${Qe.length>0&&u`<div class="lib-chips">
      <button type="button" class=${`chip ${n.game?"":"chip-on"}`} aria-pressed=${!n.game}
        onClick=${()=>B("")}>All</button>
      ${Qe.map(m=>u`<button type="button" class=${`chip ${n.game===m.game?"chip-on":""}`}
        aria-pressed=${n.game===m.game} onClick=${()=>B(m.game)}>${m.game}</button>`)}
    </div>`}

    ${O==null?u`<${Bn} />`:O.length===0?rn?u`<${z} name="film" title="No clips match this view"
            body="Try a different search, game, or clear your filters."
            action=${u`<button type="button" class="btn" onClick=${()=>{o(Pe),a("")}}>Clear filters</button>`} />`:u`<${z} name="upload" title="Connect the Clipline desktop app to start uploading"
            body="New clips uploaded from the desktop app will show up here."
            action=${u`<a class="btn" href="/about">Learn more</a>`} />`:e==="grid"?u`<div class=${`card-grid ${d.size>0?"selecting":""}`}>
          ${O.map(m=>u`<${Me} key=${m.id}
            clip=${{...m,thumbnail_url:qe(m),media_url:Ot(m)}}
            href=${`/clip/${encodeURIComponent(m.id)}`}
            selectable selected=${d.has(m.id)} onToggleSelect=${Q} showVisibility />`)}
        </div>`:u`<${Vn} clips=${O} query=${n} onSort=${te} />`}

    <${Kt} count=${d.size}
      onPublic=${()=>F("public")}
      onPrivate=${()=>F("private")}
      onCopyLinks=${on}
      onDelete=${()=>_(!0)}
      onClear=${()=>v(new Set)} />

    <${Qt} open=${i}
      title=${`Delete ${d.size} clip${d.size===1?"":"s"}?`}
      body="Public links stop working immediately."
      confirmLabel="Delete" danger
      onConfirm=${an}
      onCancel=${()=>_(!1)} />
  </main>`}function Te(e,[t,n]){let o=e.sort===t?"ascending":e.sort===n?"descending":"none",r=e.sort===n?t:n;return{ariaSort:o,next:r}}function Vn({clips:e,query:t,onSort:n}){let o=Te(t,Ce.title),r=Te(t,Ce.size),a=Te(t,Ce.duration),s=Te(t,Ce.uploaded);return u`<table class="lib-table">
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
      ${e.map(c=>u`<tr key=${c.id}>
        <td><img class="row-thumb" src=${qe(c)} alt="" width="64" height="36" loading="lazy" /></td>
        <td><a href=${`/clip/${encodeURIComponent(c.id)}`}>${c.title}</a></td>
        <td>${c.game_name||"\u2014"}</td>
        <td><span class=${`badge badge-${c.visibility}`}>${c.visibility}</span></td>
        <td>${Ze(c.file_size_bytes)}</td>
        <td>${ee(c.duration_ms)}</td>
        <td>${Vt(c.uploaded_at)}</td>
      </tr>`)}
    </tbody>
  </table>`}function Bn({count:e=8}){return u`<div class="card-grid">
    ${Array.from({length:e},(t,n)=>u`<div class="clip-card" key=${n}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`}var On={publicLibrary:Ke,publicGame:Ke,games:Wt,library:Jt},en={publicLibrary:"feed",publicGame:"feed",games:"games",library:"library",clip:"library",admin:"admin",profile:"profile"},tn=Nt($e());function Gn({route:e}){return u`<main class="page"><p class="kicker">Not ported yet</p>
    <p>Route <code>${e.name}</code> still renders in the legacy app — open it from
    <a href="/">the served site</a>.</p></main>`}function Zn(){let e=Dt();tn=e.name;let{ready:t}=J(Z);if(!t)return u`<div class="boot">Loading…</div>`;let n=On[e.name]||Gn,o=e.name==="login"||e.name==="resetPassword";return u`<div class="ui" onClick=${At}>
    ${!o&&u`<${zt} active=${en[e.name]||""} />`}
    <${n} route=${e} />
    ${!o&&u`<${It} active=${en[e.name]||""} />`}
    <${Ft} />
  </div>`}window.addEventListener("clipline:unauthorized",()=>{Z.set({user:null,csrfToken:null,ready:!0}),Ut(tn)||W("/login")});(async()=>{try{let e=await N("/api/v1/auth/me");Ie(e.csrf_token),Z.set({user:e.user,csrfToken:e.csrf_token,ready:!0})}catch{Z.set({user:null,csrfToken:null,ready:!0})}dt(u`<${Zn} />`,document.querySelector("#app"))})();
