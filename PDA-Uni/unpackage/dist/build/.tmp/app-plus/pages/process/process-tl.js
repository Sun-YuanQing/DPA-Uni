(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/process/process-tl"],{"2bfd":function(t,e,o){"use strict";o.r(e);var n=o("b0f1"),r=o("ffc5");for(var s in r)"default"!==s&&function(t){o.d(e,t,function(){return r[t]})}(s);var i=o("2877"),a=Object(i["a"])(r["default"],n["a"],n["b"],!1,null,null,null);e["default"]=a.exports},b0f1:function(t,e,o){"use strict";var n=function(){var t=this,e=t.$createElement;t._self._c},r=[];o.d(e,"a",function(){return n}),o.d(e,"b",function(){return r})},c0c5:function(t,e,o){"use strict";(function(t){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var n=i(o("2e17")),r=i(o("f2a9")),s=(i(o("00e0")),i(o("409c")));function i(t){return t&&t.__esModule?t:{default:t}}var a=function(){return o.e("components/barcode-input/barcode-input").then(o.bind(null,"d7ce"))},c=function(){return o.e("components/process-scanOrder/process-scanOrder").then(o.bind(null,"4567"))},u={components:{barcodeInput:a,processScanOrder:c},data:function(){return{old:{scrollTop:0},scrollTop:0,scrollHeight:0,details:[],order:null}},onLoad:function(t){this.progNo=t.progNo},onReady:function(){s.default.getListHeight(this)},onBackPress:function(t){return s.default.backPress(t,this.details.length>0)},methods:{onGetOrder:function(t){var e=this;e.order=t,this.$refs.input_part.setFocus()},onPartScaned:function(e){var o=this,r=this;t.showLoading({mask:!0}),n.default.pro_TL_PartScan({data:{moLot:r.order.moLot,proItemNo:r.order.proItemNo,deviceNo:r.order.deviceNo,qrCode:e},success:function(n){console.log(s.default.outputLog(n)," at pages\\process\\process-tl.vue:94");for(var r=function(e){var r=o.details[e];if(r.tagId==n.tagId)return a=o,a.onScrollTop(e),t.showModal({title:"提示",content:"该标签已扫描,是否要删除",success:function(t){t.confirm?a.details.splice(e,1):t.cancel}}),s.default.showAudio(),{v:void 0}},i=0;i<o.details.length;i++){var a,c=r(i);if("object"===typeof c)return c.v}n.qrCode=e,o.details.push(n),o.onScrollTop(o.details.length-1),o.$refs.input_part.setFocus(),s.default.showScanedAudio()},failure:function(t){s.default.showAudio(),o.$refs.input_part.setFocus()},complete:function(e,o,n){s.default.tryCatchApi({status:e,message:o}),t.hideLoading()}})},onSave:function(){var e=this,o=this;if(o.$refs.input_order.validInputFinish()){if(0==this.details.length)return t.showToast({title:"请扫描要投入的物料",icon:"none"}),void this.$refs.input_part.setFocus();var r=this.convert2ScmMesDayInputModel();t.showLoading({mask:!0}),n.default.pro_TL_Save({data:r,success:function(o){t.showToast({title:"保存成功!"}),s.default.dataInit(e),e.$refs.input_order.setOrderFocus()},failure:function(t){s.default.showAudio()},complete:function(e,o,n){s.default.tryCatchApi({status:e,message:o}),t.hideLoading()}})}},convert2ScmMesDayInputModel:function(){for(var t=[],e=0;e<this.details.length;e++){var o=this.details[e],n={};n.sheetDate=new Date,n.moLot=this.order.moLot,n.proNo=this.order.custNo,n.proItemNo=this.order.itemNo,n.deviceNo=this.order.deviceNo,n.unitNo=o.unitNo,n.partNo=o.partNo,n.sheetQty=Number(o.sheetQty),n.inLot=o.inLot,n.proDate=o.proDate,n.updateTime=new Date,n.tagId=o.tagId,n.qrCode=o.qrCode,n.inputType=1,n.entityState=r.default.entityState.added,t.push(n)}return t},onSelectedItem:function(t){for(var e=s.default.clone(this.details),o=0;o<e.length;o++){var n=e[o];n.selectItemClass=o==t?"uni-list-cell-selected":""}this.details=e},scroll:function(t){this.old.scrollTop=t.detail.scrollTop},onScrollTop:function(e){var o=this;this.onSelectedItem(e);var n=t.createSelectorQuery().select(".scroll-view-item");n.boundingClientRect(function(t){o.scrollTop=o.old.scrollTop,o.$nextTick(function(){null!=t&&(this.scrollTop=t.height*e)})}).exec()}}};e.default=u}).call(this,o("6e42")["default"])},ffc5:function(t,e,o){"use strict";o.r(e);var n=o("c0c5"),r=o.n(n);for(var s in n)"default"!==s&&function(t){o.d(e,t,function(){return n[t]})}(s);e["default"]=r.a}},[["17e0","common/runtime","common/vendor"]]]);