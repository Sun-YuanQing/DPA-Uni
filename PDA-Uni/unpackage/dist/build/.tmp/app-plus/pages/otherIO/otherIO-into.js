(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/otherIO/otherIO-into"],{"1eee":function(t,e,o){"use strict";o.r(e);var n=o("7416"),r=o("fdde");for(var i in r)"default"!==i&&function(t){o.d(e,t,function(){return r[t]})}(i);var s=o("2877"),a=Object(s["a"])(r["default"],n["a"],n["b"],!1,null,null,null);e["default"]=a.exports},7416:function(t,e,o){"use strict";var n=function(){var t=this,e=t.$createElement;t._self._c},r=[];o.d(e,"a",function(){return n}),o.d(e,"b",function(){return r})},fc25:function(t,e,o){"use strict";(function(t){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var n=o("2f62"),r=s(o("2e17")),i=(s(o("f2a9")),s(o("00e0")),s(o("409c")));function s(t){return t&&t.__esModule?t:{default:t}}function a(t){for(var e=1;e<arguments.length;e++){var o=null!=arguments[e]?arguments[e]:{},n=Object.keys(o);"function"===typeof Object.getOwnPropertySymbols&&(n=n.concat(Object.getOwnPropertySymbols(o).filter(function(t){return Object.getOwnPropertyDescriptor(o,t).enumerable}))),n.forEach(function(e){l(t,e,o[e])})}return t}function l(t,e,o){return e in t?Object.defineProperty(t,e,{value:o,enumerable:!0,configurable:!0,writable:!0}):t[e]=o,t}var c=function(){return o.e("components/barcode-input/barcode-input").then(o.bind(null,"d7ce"))},u={components:{barcodeInput:c},data:function(){return{progNo:"",old:{scrollTop:0},scrollTop:0,scrollHeight:0,orderItemSelected:{},sheetNo:"",partItemNo:"",order_list:[]}},onLoad:function(t){this.progNo=t.progNo,this.init(!0)},onReady:function(){i.default.getListHeight(this)},onBackPress:function(t){return i.default.backPress(t,this.order_list.length>0)},onShow:function(){if(this.pageIO_submit){for(var t=0,e=this.order_list.length;t<e;t++)this.order_list[t].m_isSelected&&this.order_list.splice(t,1);this.pageIO_false()}},computed:(0,n.mapState)(["pageIO_submit"]),methods:a({},(0,n.mapMutations)(["pageIO_false","setUrldata"]),{init:function(e){var o=this,n=this,s=e;t.showLoading({mask:!0}),r.default.Pda_scmotherinbysheetnopartno({data:{sheetNo:n.sheetNo,partItemNo:n.partItemNo},success:function(e){e.length>0?(o.order_list=e,s||i.default.showScanedAudio(),o.$refs.input_part.setFocus()):(t.showToast({title:"未找到相关信息！！!",icon:"none"}),i.default.showAudio(),o.$refs.input_order.setFocus())},complete:function(e,o,n){i.default.tryCatchApi({status:e,message:o}),t.hideLoading()}})},onOrderScaned:function(t){var e=this;this.sheetNo=t,e.init(!1),e.$refs.input_part.setFocus()},onPartScaned:function(e){var o=this;t.showLoading({mask:!0}),r.default.boxfqc_QRCodeAnalysis({data:{qrCode:e,enumBarCode:2},success:function(t){o.partItemNo=t.partItemNo,o.init(!1)},complete:function(e,n,r){o.$refs.input_part.setFocus(),i.default.tryCatchApi({status:e,message:n}),t.hideLoading()}})},scroll:function(t){this.old.scrollTop=t.detail.scrollTop},onScrollTop:function(e){var o=this;this.onSelectedItem(e);var n=t.createSelectorQuery().in(this).select(".scroll-view-item");n.boundingClientRect(function(t){o.scrollTop=o.old.scrollTop,o.$nextTick(function(){this.scrollTop=t.height*e})}).exec()},updateScanList:function(){for(var t=0,e=0;e<this.orderItemSelected.tagDetails.length;e++)t=i.default.floatObj.add(t,this.orderItemSelected.tagDetails[e].model.sheetQty);this.orderItemSelected.scanQty=t,this.orderItemSelected.lastScanQty=i.default.floatObj.subtract(this.orderItemSelected.sheetQty,t)},onSelectedItem:function(e){for(var o=0;o<this.order_list.length;o++){var n=this.order_list[o];n.m_isSelected=!1}var r=this;i.default.validOrderMonth(r.order_list[e])&&(r.order_list[e].m_isSelected=!0,console.log(e," at pages\\otherIO\\otherIO-into.vue:195"),this.setUrldata(r.order_list[e]),t.navigateTo({url:"otherIO-intoDet?progNo="+r.progNo}))}})};e.default=u}).call(this,o("6e42")["default"])},fdde:function(t,e,o){"use strict";o.r(e);var n=o("fc25"),r=o.n(n);for(var i in n)"default"!==i&&function(t){o.d(e,t,function(){return n[t]})}(i);e["default"]=r.a}},[["187f","common/runtime","common/vendor"]]]);