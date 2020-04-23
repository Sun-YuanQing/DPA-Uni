(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["components/page-foot/page-foot"],{"228f":function(t,e,n){},"3e1e":function(t,e,n){"use strict";n.r(e);var o=n("8483"),i=n("8732");for(var c in i)"default"!==c&&function(t){n.d(e,t,function(){return i[t]})}(c);n("a61c");var f=n("2877"),u=Object(f["a"])(i["default"],o["a"],o["b"],!1,null,null,null);e["default"]=u.exports},"46df":function(t,e,n){"use strict";(function(t){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var n={name:"page-foot",data:function(){return{footerStyle:"fixed"}},props:{},onReady:function(){},methods:{getContentHeight:function(e){var n=this;if(this.footHeight>0)e.success.call(e.scope||n,this.footHeight);else{var o=t.createSelectorQuery().in(this);o.select(".pagefoot").boundingClientRect(),o.exec(function(t){n.footHeight=t[0].height,e.success.call(e.scope||n,t[0].height)})}},setPosition:function(){"static"!=this.footerStyle&&(this.footerStyle="static")}}};e.default=n}).call(this,n("6e42")["default"])},8483:function(t,e,n){"use strict";var o=function(){var t=this,e=t.$createElement;t._self._c},i=[];n.d(e,"a",function(){return o}),n.d(e,"b",function(){return i})},8732:function(t,e,n){"use strict";n.r(e);var o=n("46df"),i=n.n(o);for(var c in o)"default"!==c&&function(t){n.d(e,t,function(){return o[t]})}(c);e["default"]=i.a},a61c:function(t,e,n){"use strict";var o=n("228f"),i=n.n(o);i.a}}]);
;(global["webpackJsonp"] = global["webpackJsonp"] || []).push([
    'components/page-foot/page-foot-create-component',
    {
        'components/page-foot/page-foot-create-component':(function(module, exports, __webpack_require__){
            __webpack_require__('6e42')['createComponent'](__webpack_require__("3e1e"))
        })
    },
    [['components/page-foot/page-foot-create-component']]
]);                
