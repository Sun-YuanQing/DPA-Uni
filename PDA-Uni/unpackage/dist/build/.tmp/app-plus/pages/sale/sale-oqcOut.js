(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/sale/sale-oqcOut"],{"279c":function(t,e,a){"use strict";var o=function(){var t=this,e=t.$createElement;t._self._c},s=[];a.d(e,"a",function(){return o}),a.d(e,"b",function(){return s})},"66d2":function(t,e,a){"use strict";a.r(e);var o=a("ff25"),s=a.n(o);for(var l in o)"default"!==l&&function(t){a.d(e,t,function(){return o[t]})}(l);e["default"]=s.a},a6bf:function(t,e,a){"use strict";a.r(e);var o=a("279c"),s=a("66d2");for(var l in s)"default"!==l&&function(t){a.d(e,t,function(){return s[t]})}(l);var n=a("2877"),i=Object(n["a"])(s["default"],o["a"],o["b"],!1,null,null,null);e["default"]=i.exports},ff25:function(t,e,a){"use strict";(function(t){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var o=n(a("2e17")),s=n(a("f2a9")),l=n(a("409c"));function n(t){return t&&t.__esModule?t:{default:t}}var i=function(){return a.e("components/barcode-input/barcode-input").then(a.bind(null,"d7ce"))},c=function(){return a.e("components/authorize-input/authorize-input").then(a.bind(null,"d9d3"))},r=function(){return Promise.all([a.e("common/vendor"),a.e("components/lotunpack/lotunpack")]).then(a.bind(null,"acb4"))},d={components:{barcodeInput:i,authorizeInput:c,lotunpack:r},data:function(){return{progNo:"",old:{scrollTop:0},scrollTop:0,scrollHeight:0,details:[],showAuth:!1,scanPartModel:{},details_list:[],lockModel:{lockType:s.default.lockType.sale_oqcOut,sourceId:"",description:""},dataModel:{scmInoutBars:[],mesLockscreenLogs:[],noticeNo:""},qrCode:""}},onLoad:function(t){this.progNo=t.progNo,console.log(this.progNo," at pages\\sale\\sale-oqcOut.vue:80")},onReady:function(){l.default.getListHeight(this)},onBackPress:function(t){return l.default.backPress(t,this.details.length>0)},methods:{onScaned:function(e){var a=this,s=this;t.showLoading({mask:!0}),s.dataModel.noticeNo=e,o.default.Pda_pdaoqcspcquality1bynotice({data:{noticeNo:e},success:function(e){if(0==e.length)return t.showToast({title:"该工单没有数据",icon:"none"}),l.default.showAudio(),void a.$refs.input_order.setFocus();if(e.details)for(var o=0;o<e.details.length;o++){var n=e.details[o];n.scanQty=0,n.lastScanQty=n.sheetQty,n.neetQty=n.sheetQty,l.default.validOrderMonth(n)&&s.details.push(n)}else for(o=0;o<e.length;o++){n=e[o];n.scanQty=0,n.lastScanQty=n.sheetQty,n.neetQty=n.sheetQty,l.default.validOrderMonth(n)&&s.details.push(n)}if(0==s.details.length)return t.showToast({title:"当前单据不在本月，请联系管理员！",icon:"none"}),l.default.showAudio(),void a.$refs.input_order.setFocus();a.$refs.input_part.setFocus(),l.default.showScanedAudio()},failure:function(t){a.$refs.input_order.clear(),a.$refs.input_order.setFocus(),l.default.showAudio()},complete:function(e,a,o){l.default.tryCatchApi({status:e,message:a}),t.hideLoading()}})},onPartScaned:function(e){var a=this,s=this;if(s.qrCode=e,0==this.dataModel.noticeNo.trim().length)return t.showToast({title:"请先扫描通知单号",icon:"none"}),l.default.showAudio(),void this.$refs.input_order.setFocus();t.showLoading({mask:!0}),console.log(e," at pages\\sale\\sale-oqcOut.vue:175"),o.default.Pda_pdasalnoticebyscanoqcvaild({data:{noticeNo:this.dataModel.noticeNo,qrCode:e},success:function(e){a.scanPartModel=l.default.clone(JSON.parse(e.resultNote)),console.log(a.scanPartModel," at pages\\sale\\sale-oqcOut.vue:183");var o=0;s.details_list=[];for(var n=0;n<a.details.length;n++){var i=a.details[n];i.scantagDetails=i.scantagDetails||[];for(var c=0;c<i.scantagDetails.length;c++){var r=i.scantagDetails[c];if(s.scanPartModel.tagDetails)for(var d=s.scanPartModel.tagDetails.length,u=0;u<d;u++){var h=s.scanPartModel.tagDetails[u];if(r.tagId==h.tagId)return t.showModal({title:"提示",content:"该标签已扫描,是否要删除",success:function(t){if(t.confirm)for(var e=0;e<s.details.length;e++)for(var a=s.details[e],o=0;o<a.scantagDetails.length;o++){var l=a.scantagDetails[o];if(s.scanPartModel.tagDetails)for(var n=s.scanPartModel.tagDetails.length,i=0;i<n;i++){var c=s.scanPartModel.tagDetails[i];l.tagId==c.tagId&&l.tagId==s.scanPartModel.tagId&&(a.scantagDetails.splice(o,1),s.onScrollTop(e),s.updateScanList())}}else t.cancel}}),void l.default.showAudio()}else{h=s.scanPartModel;if(r.tagId==h.tagId)return t.showModal({title:"提示",content:"该标签已扫描,是否要删除",success:function(t){if(t.confirm)for(var e=0;e<s.details.length;e++)for(var a=s.details[e],o=0;o<a.scantagDetails.length;o++){var l=a.scantagDetails[o];l.tagId==s.scanPartModel.tagId&&(a.scantagDetails.splice(o,1),s.onScrollTop(e),s.updateScanList())}else t.cancel}}),void l.default.showAudio()}}if(console.log(s.scanPartModel," at pages\\sale\\sale-oqcOut.vue:268"),s.scanPartModel.tagDetails){for(d=s.scanPartModel.tagDetails.length,u=0;u<d;u++){h=s.scanPartModel.tagDetails[u];if(console.log(i.whNo.trim()+"!="+s.scanPartModel.binWhNo.trim()," at pages\\sale\\sale-oqcOut.vue:276"),console.log(i.whNo.trim()+"!="+h.binWhNo.trim()," at pages\\sale\\sale-oqcOut.vue:277"),i.whNo.trim()!=h.binWhNo.trim())return t.showToast({title:"检验单仓库:"+i.whNo.trim()+"与物料仓库："+h.binWhNo.trim()+"不一致",icon:"none"}),void l.default.showAudio();i.partItemNo.trim()==h.partItemNo.trim()&&i.lastScanQty>0&&(i.for_index=n,s.details_list.push(i),o=l.default.floatObj.add(o,i.lastScanQty))}console.log(l.default.outputLog(s.details_list)," at pages\\sale\\sale-oqcOut.vue:296")}else{if(console.log(i.whNo.trim()+"!="+s.scanPartModel.binWhNo.trim()," at pages\\sale\\sale-oqcOut.vue:300"),i.whNo.trim()!=s.scanPartModel.binWhNo.trim())return t.showToast({title:"检验单仓库:"+i.whNo.trim()+"与物料仓库："+s.scanPartModel.binWhNo.trim()+"不一致",icon:"none"}),void l.default.showAudio();i.partItemNo.trim()==s.scanPartModel.partItemNo.trim()&&i.lastScanQty>0&&(i.for_index=n,s.details_list.push(i),o=l.default.floatObj.add(o,i.lastScanQty))}}if(o<=0)return t.showToast({title:"物料与单据上的不一致",icon:"none"}),void l.default.showAudio();if(s.scanPartModel.tagDetails){var f=0;for(d=s.scanPartModel.tagDetails.length,u=0;u<d;u++){h=s.scanPartModel.tagDetails[u];f=l.default.floatObj.add(f,h.sheetQty)}if(Number(f)>o)return t.showToast({title:"数量"+o+"与发货标签数量不一致:请拆分处理.",icon:"none"}),void l.default.showAudio()}else if(Number(s.scanPartModel.sheetQty)>Number(o))return t.showToast({title:"总数量"+o+"与发货标签数量不一致:请拆分处理.",icon:"none"}),void l.default.showAudio();var g=null;if("-11"==e.resultCode?g=e.resultText:(s.arr_split(s.details_list,s.scanPartModel),console.log(s.scanPartModel," at pages\\sale\\sale-oqcOut.vue:365")),g&&g.length>0){for(n=0;n<a.details.length;n++){var p=a.details[n];if(p.partItemNo==s.scanPartModel.partItemNo){s.onScrollTop(n);break}}return a.lockModel.description=g,a.lockModel.sourceId=s.scanPartModel.inLot,a.showAuth=!0,void l.default.showAudio()}l.default.showScanedAudio()},failure:function(t){l.default.showAudio()},complete:function(e,o,s){a.$refs.input_part.setFocus(),l.default.tryCatchApi({status:e,message:o}),t.hideLoading()}})},onSave:function(){var e=this,a=this,s=!0;if(a.dataModel.scmInoutBars=[],!(this.details.length>0))return l.default.showAudio(),void t.showToast({title:"请扫描通知单",icon:"none"});for(var n=0;n<this.details.length;n++){var i=this.details[n];if(i.lastScanQty>0){s=!1;break}a.dataModel.scmInoutBars.push(i.scantagDetails[n])}return console.log(l.default.outputLog(this.dataModel)," at pages\\sale\\sale-oqcOut.vue:422"),s?this.dataModel.scmInoutBars.length<0?(l.default.showAudio(),void t.showToast({title:"提交的数据有误",icon:"none"})):(console.log(l.default.outputLog(a.dataModel)," at pages\\sale\\sale-oqcOut.vue:440"),t.showLoading({mask:!0}),void o.default.Pda_pdaaddsaloutbyoqcspcquality({data:a.dataModel,success:function(a){t.showToast({title:"保存成功"}),l.default.dataInit(e),e.$refs.input_order.setFocus()},failure:function(t){e.$refs.input_part.setFocus(),l.default.showAudio()},complete:function(e,a,o){l.default.tryCatchApi({status:e,message:a}),t.hideLoading()}})):(l.default.showAudio(),void t.showToast({title:"扫描未完成",icon:"none"}))},updateScanList:function(){var t=0;console.log(this.orderItemSelected," at pages\\sale\\sale-oqcOut.vue:471");for(var e=0;e<this.orderItemSelected.scantagDetails.length;e++)t=l.default.floatObj.add(t,this.orderItemSelected.scantagDetails[e].sheetQty);this.orderItemSelected.scanQty=t,this.orderItemSelected.lastScanQty=l.default.floatObj.subtract(this.orderItemSelected.sheetQty,t);var a=l.default.clone(this.details);this.details=a},onSelectedItem:function(t){for(var e=0;e<this.details.length;e++){var a=this.details[e];e==t?(a.selectItemClass="uni-list-cell-selected",this.orderItemSelected=a):a.selectItemClass=""}},scroll:function(t){this.old.scrollTop=t.detail.scrollTop},onScrollTop:function(e){var a=this;this.onSelectedItem(e);var o=t.createSelectorQuery().in(this).select(".scroll-view-item");o.boundingClientRect(function(t){a.scrollTop=a.old.scrollTop,a.$nextTick(function(){this.scrollTop=t.height*e})}).exec()},authClick:function(t){var e=this;this.showAuth=!1;for(var a=0;a<this.details.length;a++){var o=this.details[a];if(o.partItemNo==e.scanPartModel.partItemNo){e.dataModel.mesLockscreenLogs.push(t);break}}if(1==t.resultSta){e.arr_split(e.details_list,e.scanPartModel),console.log(e.scanPartModel," at pages\\sale\\sale-oqcOut.vue:526");for(a=0;a<e.details_list.length;a++)e.onScrollTop(e.details_list[a].for_index),e.updateScanList()}this.$refs.input_part.setFocus()},arr_split:function(t,e){var a=this;if(console.log(e," at pages\\sale\\sale-oqcOut.vue:538"),e.tagDetails)for(var o=0;o<e.tagDetails.length;o++){var s=e.tagDetails[o];console.log(s," at pages\\sale\\sale-oqcOut.vue:543");for(var n=s.sheetQty,i=0;i<t.length;i++)if(console.log(t[i].lastScanQty==n&&0!=n," at pages\\sale\\sale-oqcOut.vue:548"),t[i].lastScanQty==n){var c=l.default.clone(s);a.scantagDetails_push(c,t,i),n=0;break}for(i=0;i<t.length;i++){c=l.default.clone(s);if(t[i].lastScanQty>=n&&0!=n){c.sheetQty=n,a.scantagDetails_push(c,t,i),n=0;break}n>t[i].lastScanQty&&(n-=t[i].lastScanQty,c.sheetQty=t[i].lastScanQty,a.scantagDetails_push(c,t,i))}}else{console.log(e," at pages\\sale\\sale-oqcOut.vue:572");for(n=e.sheetQty,i=0;i<t.length;i++)if(console.log(t[i].lastScanQty==n&&0!=n," at pages\\sale\\sale-oqcOut.vue:576"),t[i].lastScanQty==n){c=l.default.clone(e);a.scantagDetails_push(c,t,i),n=0;break}for(i=0;i<t.length;i++){c=l.default.clone(e);if(t[i].lastScanQty>=n&&0!=n){c.sheetQty=n,a.scantagDetails_push(c,t,i),n=0;break}n>t[i].lastScanQty&&(n-=t[i].lastScanQty,c.sheetQty=t[i].lastScanQty,a.scantagDetails_push(c,t,i))}}},scantagDetails_push:function(t,e,a){console.log("======================================================="," at pages\\sale\\sale-oqcOut.vue:601"),console.log(e[a]," at pages\\sale\\sale-oqcOut.vue:603"),console.log(t," at pages\\sale\\sale-oqcOut.vue:604"),t.sheetType=e[a].sheetType,t.sheetNo=e[a].sheetNo,t.sheetLot=e[a].sheetLot,t.printDate=t.printDate||(new Date).format("yyyy/MM/dd"),t.createDate=t.createDate||(new Date).format("yyyy/MM/dd"),t.serialSw=t.serialSw||null,t.inoutFlag=2,t.purLot=t.poMoSoLot,t.sourceNo=e[a].sheetNo,t.entityState=s.default.entityState.added,t.qrCode=this.qrCode,this.details[e[a].for_index].scantagDetails=this.details[e[a].for_index].scantagDetails||[],console.log(t," at pages\\sale\\sale-oqcOut.vue:632"),this.details[e[a].for_index].scantagDetails.push(t),this.onScrollTop(a),this.updateScanList(),l.default.automateSave(this.details,"lastScanQty",0,this.onSave)}}};e.default=d}).call(this,a("6e42")["default"])}},[["d715","common/runtime","common/vendor"]]]);