(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/process/production-FQCintoDet"],{"2f625":function(t,e,o){"use strict";o.r(e);var n=o("ecc9"),s=o("4090");for(var i in s)"default"!==i&&function(t){o.d(e,t,function(){return s[t]})}(i);var a=o("2877"),r=Object(a["a"])(s["default"],n["a"],n["b"],!1,null,null,null);e["default"]=r.exports},4090:function(t,e,o){"use strict";o.r(e);var n=o("c8f0"),s=o.n(n);for(var i in n)"default"!==i&&function(t){o.d(e,t,function(){return n[t]})}(i);e["default"]=s.a},c8f0:function(t,e,o){"use strict";(function(t){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var n=c(o("2e17")),s=c(o("f2a9")),i=c(o("00e0")),a=c(o("409c")),r=o("2f62");function c(t){return t&&t.__esModule?t:{default:t}}function l(t){for(var e=1;e<arguments.length;e++){var o=null!=arguments[e]?arguments[e]:{},n=Object.keys(o);"function"===typeof Object.getOwnPropertySymbols&&(n=n.concat(Object.getOwnPropertySymbols(o).filter(function(t){return Object.getOwnPropertyDescriptor(o,t).enumerable}))),n.forEach(function(e){u(t,e,o[e])})}return t}function u(t,e,o){return e in t?Object.defineProperty(t,e,{value:o,enumerable:!0,configurable:!0,writable:!0}):t[e]=o,t}var d=function(){return o.e("components/barcode-input/barcode-input").then(o.bind(null,"d7ce"))},f={components:{barcodeInput:d},data:function(){return{old:{scrollTop:0},scrollTop:0,scrollHeight:0,isStorageBin:"",placeholder_store:"",binNo:"",binWhNo:"",order:{purLot:"",sheetNo:"",partItemNo:"",partName:"",sheetQty:0,scanQty:0,lastScanQty:0,tagDetails:[],binNostr:""},details:[]}},onLoad:function(t){this.isStorageBin=i.default.get(s.default.storageKeys.IsStorageBin),this.order=this.urldata,this.order.scanQty=0,this.order.lastScanQty=this.order.sheetQty;var e=this;e.isStorageBin?e.placeholder_store="扫描储位":e.placeholder_store="扫描仓库"},onReady:function(){a.default.getListHeight(this)},onBackPress:function(t){return a.default.backPress(t,this.details.length>0)},computed:(0,r.mapState)(["urldata"]),methods:l({},(0,r.mapMutations)(["pageIO_true"]),{onScanStorage:function(e){var o=this;t.showLoading({mask:!0}),this.isStorageBin?n.default.bas_storagebin({data:{binNo:e},success:function(e){console.log(a.default.outputLog(e)," at pages\\process\\production-FQCintoDet.vue:135"),e.length<=0?(t.showToast({title:"货架不存在!",icon:"none"}),o.$refs.input_store.clear(),a.default.showAudio()):(o.binNo=e[0].binNo,o.binWhNo=e[0].whNo,console.log(o.binNo+"----"+o.binWhNo," at pages\\process\\production-FQCintoDet.vue:146"),o.$refs.input_part.setFocus(),a.default.showScanedAudio())},complete:function(e,o,n){a.default.tryCatchApi({status:e,message:o}),t.hideLoading()}}):(console.log(e," at pages\\process\\production-FQCintoDet.vue:160"),n.default.bas_wh({data:{filter:'whNo = "'+e+'"'},success:function(e){console.log(a.default.outputLog(e)," at pages\\process\\production-FQCintoDet.vue:166"),e.length<=0?(t.showToast({title:"仓库不存在!",icon:"none"}),o.$refs.input_store.clear(),a.default.showAudio()):(o.binWhNo=e[0].whNo,console.log(o.binNo+"----"+o.binWhNo," at pages\\process\\production-FQCintoDet.vue:176"),o.$refs.input_part.setFocus(),a.default.showScanedAudio())},complete:function(e,o,n){a.default.tryCatchApi({status:e,message:o}),t.hideLoading()}}))},onPartScaned:function(e){var o=this;if(t.showLoading({mask:!0}),""==this.binWhNo.trim())return t.showToast({title:"请先扫描货架",icon:"none"}),this.$refs.input_store.setFocus(),void a.default.showAudio();var i=this;n.default.OpenMes_mesqrcodeinout({data:{qrCode:e},success:function(n){if(console.log(a.default.outputLog(n)," at pages\\process\\production-FQCintoDet.vue:211"),0!=n.boxSw)return a.default.showAudio(),void t.showToast({title:"不是封箱状态不能校验 ",icon:"none"});for(var r=function(){var e=o.details[c];if(e.tagId==n.tagId)return o.onScrollTop(c),t.showModal({title:"提示",content:"该标签已扫描,是否要删除",success:function(t){t.confirm?(i.details.splice(c,1),i.updateScanList(-e.sheetQty),console.log("_self.details: "+JSON.stringify(i.details)," at pages\\process\\production-FQCintoDet.vue:231")):t.cancel}}),a.default.showAudio(),{v:void 0}},c=0;c<o.details.length;c++){var l=r();if("object"===typeof l)return l.v}if(i.order.partItemNo==n.partItemNo&&i.order.sheetNo==n.PoMoSoLot&&(t.showToast({title:"标签不属于该单据",icon:"none"}),a.default.showAudio()),i.order.sheetQty-i.order.scanQty<n.sheetQty)return t.showToast({title:"超出应上架数量",icon:"none"}),a.default.showAudio(),void i.onScrollTop(index);t.showToast({title:"扫描成功"}),n.tagDetails?n.tagDetails.forEach(function(t,o){t.sourceNo=i.order.sheetNo,i.isStorageBin?(t.binNo=i.binNo,t.binWhNo=i.binWhNo):(t.binNo=i.binWhNo,t.binWhNo=i.binWhNo),t.purLot=i.order.purLot,t.inoutFlag="1",t.qrCode=e,t.entityState=s.default.entityState.added}):(n.sourceNo=i.order.sheetNo,i.isStorageBin?(n.binNo=i.binNo,n.binWhNo=i.binWhNo):(n.binNo=i.binWhNo,n.binWhNo=i.binWhNo),n.purLot=i.order.purLot,n.inoutFlag="1",n.qrCode=e,n.entityState=s.default.entityState.added),o.details.push(n),console.log("this.details:----- "+JSON.stringify(o.details)," at pages\\process\\production-FQCintoDet.vue:291"),o.updateScanList(n.sheetQty),o.onScrollTop(o.details.length-1),a.default.showScanedAudio(),o.$refs.input_part.setFocus(),0==i.order.lastScanQty&&t.showModal({title:"提示",content:"完成是否保存?",success:function(t){t.confirm?i.onSave():t.cancel&&console.log("保存没有取消方法，取消了校验"," at pages\\process\\production-FQCintoDet.vue:304")}})},failure:function(t){a.default.showAudio(),o.$refs.input_part.setFocus()},complete:function(e,o,n){a.default.tryCatchApi({status:e,message:o}),t.hideLoading()}})},updateScanList:function(t){this.order.scanQty=a.default.floatObj.add(this.order.scanQty,t),this.order.lastScanQty=a.default.floatObj.subtract(this.order.sheetQty,this.order.scanQty),this.order=this.order},onSave:function(){var e=this;if(this.order.lastScanQty>0)t.showToast({title:"还有未上架的物料",icon:"none"});else{for(var o=[],s=0;s<this.details.length;s++){var i=this.details[s];if(i.tagDetails=i.tagDetails||[],i.tagDetails.length>0)for(var r=0;r<i.tagDetails.length;r++){var c=i.tagDetails[r];o.push(c)}else o.push(i)}t.showLoading({title:"加载中",mask:!0}),n.default.Pda_pdaaddacceptinbyfqcspcquality({data:o,success:function(o){t.showToast({title:"保存成功"}),a.default.dataInit(e),e.pageIO_true(),e.isStorageBin?e.placeholder_store="扫描储位":e.placeholder_store="扫描仓库",e.$refs.input_store.clear(),e.$refs.input_store.setFocus()},failure:function(t){a.default.showAudio(),e.$refs.input_store.setFocus()},complete:function(e,o,n){a.default.tryCatchApi({status:e,message:o}),t.hideLoading()}})}},onSelectedItem:function(t){for(var e=0;e<this.details.length;e++){var o=this.details[e];e==t?(o.selectItemClass="uni-list-cell-selected",this.orderItemSelected=o):o.selectItemClass=""}},scroll:function(t){this.old.scrollTop=t.detail.scrollTop},onScrollTop:function(e){var o=this;this.onSelectedItem(e);var n=t.createSelectorQuery().in(this).select(".scroll-view-item");n.boundingClientRect(function(t){o.scrollTop=o.old.scrollTop,null!=t&&o.$nextTick(function(){this.scrollTop=t.height*e})}).exec()}})};e.default=f}).call(this,o("6e42")["default"])},ecc9:function(t,e,o){"use strict";var n=function(){var t=this,e=t.$createElement;t._self._c},s=[];o.d(e,"a",function(){return n}),o.d(e,"b",function(){return s})}},[["45db","common/runtime","common/vendor"]]]);