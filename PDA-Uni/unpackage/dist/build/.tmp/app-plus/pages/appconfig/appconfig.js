(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/appconfig/appconfig"],{"19bc":function(t,e,n){"use strict";var r=n("ad75"),u=n.n(r);u.a},"3e41":function(t,e,n){"use strict";var r=function(){var t=this,e=t.$createElement;t._self._c},u=[];n.d(e,"a",function(){return r}),n.d(e,"b",function(){return u})},4158:function(t,e,n){"use strict";(function(t){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;n("2f62");var r=a(n("00e0")),u=a(n("f2a9"));a(n("409c"));function a(t){return t&&t.__esModule?t:{default:t}}var l={data:function(){return{url:""}},onLoad:function(){var t=r.default.get(u.default.storageKeys.serverPrefixUrl);this.url=t||"http://192.168.73.162:8003"},methods:{save:function(e){if(this.url.trim()){r.default.set(u.default.storageKeys.serverPrefixUrl,this.url),"/"!=this.url.substring(this.url.length-1,this.url.length)&&(this.url+="/");var n=this.url+"api/";r.default.set(u.default.storageKeys.serverUrl,n),t.reLaunch({url:"/pages/login/login"})}else t.showToast({title:"请输入服务器地址",icon:"none"})}}};e.default=l}).call(this,n("6e42")["default"])},"76ea":function(t,e,n){"use strict";n.r(e);var r=n("4158"),u=n.n(r);for(var a in r)"default"!==a&&function(t){n.d(e,t,function(){return r[t]})}(a);e["default"]=u.a},ad75:function(t,e,n){},cb92:function(t,e,n){"use strict";n.r(e);var r=n("3e41"),u=n("76ea");for(var a in u)"default"!==a&&function(t){n.d(e,t,function(){return u[t]})}(a);n("19bc");var l=n("2877"),i=Object(l["a"])(u["default"],r["a"],r["b"],!1,null,null,null);e["default"]=i.exports}},[["2c19","common/runtime","common/vendor"]]]);