(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/process/process-online"],{"37c5":function(o,e,t){"use strict";var r=function(){var o=this,e=o.$createElement;o._self._c},u=[];t.d(e,"a",function(){return r}),t.d(e,"b",function(){return u})},"64ce":function(o,e,t){"use strict";t.r(e);var r=t("9f5e"),u=t.n(r);for(var l in r)"default"!==l&&function(o){t.d(e,o,function(){return r[o]})}(l);e["default"]=u.a},"75ac":function(o,e,t){"use strict";var r=t("8645"),u=t.n(r);u.a},8645:function(o,e,t){},"9f5e":function(o,e,t){"use strict";(function(o){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var r=d(t("2e17")),u=d(t("f2a9")),l=(d(t("00e0")),d(t("409c")));function d(o){return o&&o.__esModule?o:{default:o}}var n=function(){return t.e("components/barcode-input/barcode-input").then(t.bind(null,"d7ce"))},s=function(){return t.e("components/process-scanOrder/process-scanOrder").then(t.bind(null,"4567"))},i=0,a={components:{barcodeInput:n,processScanOrder:s},data:function(){return{progNo:"",allowScanMould:!1,allowScanGBMould:!1,old:{scrollTop:0},scrollTop:0,scrollHeight:0,details:[],order:null,mouldItemSource:[],gbCurPro:null,gbMould:"",gbMouldItemsSource:[]}},computed:{calcProMouldQty:function(){var o=this;if(null!=o.order&&o.order.mouldVer.length>0){for(var e=0,t=0;t<o.details.length;t++)1==o.details[t].mouldType&&e++;return o.order.mouldQty-e}return 0},calcProMouldQty1:function(){var o=this;if(null!=o.gbCurPro&&o.gbCurPro.mouldVer.length>0){for(var e=0,t=0;t<o.details.length;t++)2==o.details[t].mouldType&&o.gbCurPro.mouldVer==o.details[t].mouldVer&&e++;return o.gbCurPro.mouldQty-e}return 0},allowScanGBPro:function(){var o=this;return null==o.gbCurPro||0==o.calcProMouldQty1}},onLoad:function(o){this.progNo=o.progNo},onReady:function(){l.default.getListHeight(this)},onBackPress:function(o){return l.default.backPress(o,this.details.length>0)},methods:{onGetOrder:function(o){var e=this;e.order=o;var t=34;if(0==i&&(i=e.scrollHeight),Number(e.order.mouldQty)>0){var r=Number(e.scrollHeight.toString().replace("px",""));!e.allowScanMould&&e.order.mouldVer.length>0&&(e.allowScanMould=!0,r-=t),!e.allowScanGBMould&&(e.order.mouldVer.length>0&&e.order.moulds.length>1||0==e.order.mouldVer.length&&e.order.moulds.length>0)&&(e.allowScanGBMould=!0,r-=3*t),e.scrollHeight=r+"px"}e.allowScanMould&&e.$refs.input_mould.setFocus()},onMouldScaned:function(e){for(var t=this,d=this,n=0;n<d.details.length;n++)if(d.details[n].deviceNo==e)return this.onScrollTop(n),o.showModal({title:"提示",content:"当前工装已扫描,是否要删除？",success:function(o){o.confirm?(d.details.splice(n,1),d.updateScanList()):o.cancel,d.$refs.input_mould.setFocus()}}),void l.default.showAudio();if(0==d.calcProMouldQty)return o.showToast({title:"只能扫描"+d.order.mouldQty+"个工装！",icon:"none"}),l.default.showAudio(),void this.$refs.input_mould.setFocus();o.showLoading({mask:!0}),r.default.shopWB_GetMould({data:{mouldVer:d.order.mouldVer},success:function(t){for(var r=null,n=0;n<t.length;n++)if(t[n].deviceNo==e){r=t[n];break}if(null==r)return o.showToast({title:"工装扫描错误！",icon:"none"}),l.default.showAudio(),d.$refs.input_mould.setFocus(),void d.$refs.input_mould.clear();var s=null;for(n=0;n<d.order.moulds.length;n++)if(d.order.moulds[n].proItemNo==d.order.itemNo){s=d.order.moulds[n];break}var i={mouldType:1};i.moLot=d.order.moLot,i.proNo=s.proNo,i.proItemNo=s.proItemNo,i.proName=s.proName,i.deviceNo=d.order.deviceNo,i.deviceName=d.order.deviceName,i.mouldVer=r.mouldVer,i.mouldNo=r.deviceNo,i.mouldUnitRate=s.mouldUnitRate,i.entityState=u.default.entityState.added,d.details.push(i),0==d.calcProMouldQty&&(o.showToast({title:"该上线工序工装数量已扫描完！",icon:"none"}),d.$refs.input_pro1.setFocus()),l.default.showScanedAudio()},failure:function(o){t.$refs.input_mould.setFocus(),l.default.showAudio()},complete:function(e,t,r){l.default.tryCatchApi({status:e,message:t}),o.hideLoading()}})},onProScaned1:function(e){var t=this,u=this;if(u.allowScanMould&&u.calcProMouldQty>0)return o.showToast({title:"必须扫描"+u.order.mouldQty+"个工装！",icon:"none"}),l.default.showAudio(),void this.$refs.input_mould.setFocus();for(var d=null,n=0;n<u.order.moulds.length;n++)u.order.moulds[n].proItemNo==e&&(d=u.order.moulds[n]);null==d?(o.showToast({title:"工步工序扫描错误！",icon:"none"}),l.default.showAudio(),this.$refs.input_pro1.setFocus(),this.$refs.input_pro1.clear()):(o.showLoading({mask:!0}),r.default.shopWB_GetMould({data:{mouldVer:d.mouldVer},success:function(o){u.gbMouldItemsSource=o,u.gbCurPro=d,t.$refs.input_mould1.setFocus(),l.default.showScanedAudio()},failure:function(o){t.$refs.input_pro1.setFocus(),l.default.showAudio()},complete:function(e,t,r){l.default.tryCatchApi({status:e,message:t}),o.hideLoading()}}))},onMouldScaned1:function(e){for(var t=this,r=0;r<t.details.length;r++)if(t.details[r].deviceNo==e)return this.onScrollTop(r),o.showModal({title:"提示",content:"当前工装已扫描,是否要删除？",success:function(o){o.confirm?(t.details.splice(r,1),t.updateScanList()):o.cancel,t.$refs.input_mould1.setFocus()}}),void l.default.showAudio();if(0==t.calcProMouldQty1)return o.showToast({title:"只能扫描"+t.gbCurPro.mouldQty+"个工装！",icon:"none"}),l.default.showAudio(),void this.$refs.input_mould1.setFocus();var d=null;for(r=0;r<t.gbMouldItemsSource.length;r++)if(t.gbMouldItemsSource[r].deviceNo==e){d=t.gbMouldItemsSource[r];break}if(null==d)return o.showToast({title:"工装扫描错误！",icon:"none"}),l.default.showAudio(),t.$refs.input_mould1.setFocus(),void t.$refs.input_mould1.clear();var n={mouldType:2};n.moLot=t.order.moLot,n.proNo=t.gbCurPro.proNo,n.proItemNo=t.gbCurPro.proItemNo,n.proName=t.gbCurPro.proName,n.mouldUnitRate=t.gbCurPro.mouldUnitRate,n.deviceNo=t.order.deviceNo,n.deviceName=t.order.deviceName,n.mouldVer=d.mouldVer,n.mouldNo=d.deviceNo,n.entityState=u.default.entityState.added,t.details.push(n),t.validMouldIsFinish(!1)?(t.gbMouldItemsSource=[],t.gbCurPro=null,t.$refs.input_pro1.setFocus(),t.$refs.input_pro1.clear(),t.$refs.input_mould1.clear(),l.default.showScanedAudio(),o.showModal({title:"提示",content:"所有工装都已扫描完成，是否上线？",success:function(o){o.confirm?t.onSave():o.cancel}})):(0==t.calcProMouldQty1?(o.showToast({title:"该工装工序工装数量已扫描完！",icon:"none"}),t.gbMouldItemsSource=[],t.gbCurPro=null,t.$refs.input_pro1.setFocus(),t.$refs.input_pro1.clear(),t.$refs.input_mould1.clear()):t.$refs.input_mould1.setFocus(),l.default.showScanedAudio())},onSave:function(){var e=this,t=this;if(t.$refs.input_order.validInputFinish()){if(t.calcProMouldQty>0)return o.showToast({title:"该上线工序必须扫描"+t.order.mouldQty+"个工装！",icon:"none"}),l.default.showAudio(),void this.$refs.input_mould.setFocus();if(t.validMouldIsFinish(!0)){var d={};d.moLot=t.order.moLot,d.proNo=t.order.custNo,d.proItemNo=t.order.itemNo,d.deviceNo=t.order.deviceNo,d.partNo=t.order.partNo,d.partItemNo=t.order.partItemNo,d.mouldVer=t.order.mouldVer;for(var n="",s=0;s<t.details.length;s++)1==t.details[s].mouldType&&(n+=t.details[s].mouldNo+",");n.length>0&&(n=n.substring(0,n.length-1)),d.mouldNo=n,d.workSta=1,d.proMouldDetails=t.details,d.entityState=u.default.entityState.added,o.showLoading({mask:!0}),r.default.shopWB_post({data:d,success:function(r){o.showToast({title:"保存成功！"}),l.default.dataInit(e),t.scrollHeight=i,e.$refs.input_order.setOrderFocus()},failure:function(o){l.default.showAudio()},complete:function(e,t,r){l.default.tryCatchApi({status:e,message:t}),o.hideLoading()}})}}},validMouldIsFinish:function(e){e=void 0==e||e;for(var t=this,r=!0,u=0;u<t.order.moulds.length;u++){for(var d=0,n=0;n<t.details.length;n++)t.order.moulds[u].mouldVer==t.details[n].mouldVer&&d++;if(d!=Number(t.order.moulds[u].mouldQty)){r=!1,e&&(o.showToast({title:"该工步工序 "+t.order.moulds[u].proName+" ,应扫:"+t.order.moulds[u].mouldQty+", 已扫:"+d+", 待扫:"+(Number(t.order.moulds[u].mouldQty)-d),icon:"none",duration:5e3}),l.default.showAudio(),this.$refs.input_pro1.setFocus());break}}return r},onSelectedItem:function(o){for(var e=l.default.clone(this.details),t=0;t<e.length;t++){var r=e[t];r.selectItemClass=t==o?"uni-list-cell-selected":""}this.details=e},scroll:function(o){this.old.scrollTop=o.detail.scrollTop},onScrollTop:function(e){var t=this;this.onSelectedItem(e);var r=o.createSelectorQuery().in(this).select(".scroll-view-item");r.boundingClientRect(function(o){t.scrollTop=t.old.scrollTop,t.$nextTick(function(){null!=o&&(this.scrollTop=o.height*e)})}).exec()}}};e.default=a}).call(this,t("6e42")["default"])},b460:function(o,e,t){"use strict";t.r(e);var r=t("37c5"),u=t("64ce");for(var l in u)"default"!==l&&function(o){t.d(e,o,function(){return u[o]})}(l);t("75ac");var d=t("2877"),n=Object(d["a"])(u["default"],r["a"],r["b"],!1,null,null,null);e["default"]=n.exports}},[["91e2","common/runtime","common/vendor"]]]);