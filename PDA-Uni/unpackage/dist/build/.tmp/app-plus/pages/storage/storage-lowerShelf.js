(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/storage/storage-lowerShelf"],{"1a71":function(e,t,o){"use strict";(function(e){Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var a=l(o("2e17")),s=l(o("f2a9")),n=l(o("409c"));function l(e){return e&&e.__esModule?e:{default:e}}var i=function(){return o.e("components/barcode-input/barcode-input").then(o.bind(null,"d7ce"))},r={components:{barcodeInput:i},data:function(){return{details:[],old:{scrollTop:0},scrollTop:0,scrollHeight:0}},onReady:function(){n.default.getListHeight(this)},onBackPress:function(e){return n.default.backPress(e,this.details.length>0)},methods:{onPartScaned:function(t){var o=this;e.showLoading({title:"加载中...",mask:!0}),a.default.OpenMes_mesqrcodeinout({data:{qrCode:t},success:function(s){for(var l=0;l<o.details.length;l++){var i=o.details[l];if(i.qrCode==t){o.onScrollTop(l);var r=o;return void e.showModal({title:"提示",content:"该标签已扫描,是否要删除",success:function(e){e.confirm?r.details.splice(l,1):e.cancel}})}}s.binWhNo!=s.reservelocus?a.default.storage_Transfer({data:{inoutFlag:"2",tagId:s.tagId},success:function(e){o.details.push({model:s,qrCode:t}),n.default.showScanedAudio()},failure:function(e){n.default.showAudio()},complete:function(t,o,a){n.default.tryCatchApi({status:t,message:o}),e.hideLoading()}}):e.showToast({title:"当前物料已下架",icon:"none"})},failure:function(e){n.default.showAudio()},complete:function(t,a,s){o.$refs.input_part.setFocus(),n.default.tryCatchApi({status:t,message:a}),e.hideLoading()}})},save:function(){var t=this;if(0==this.details.length)return e.showToast({title:"请先扫描下架物料",icon:"none"}),void this.$refs.input_part.setFocus();var o=this,l=[];console.log(n.default.outputLog(o.details)," at pages\\storage\\storage-lowerShelf.vue:149"),console.log(o.details.length," at pages\\storage\\storage-lowerShelf.vue:150");for(var i=0;i<o.details.length;i++){var r=o.details[i];if(r.model.tagDetails>0)r.model.tagDetails.forEach(function(e){var t={};t.sheetType=e.sheetType,t.sheetNo=e.sheetNo,t.sheetLot=e.sheetLot,t.partNo=e.partNo,t.purLot=e.poMoSoLot,t.proLot=e.proLot,t.sheetQty=e.sheetQty,t.inLot=e.inLot,t.proDate=e.proDate,t.tagId=e.tagId,t.boxTagId=e.boxTagId,t.custTagId=e.custTagId,t.ordLot=e.ordLot,t.custNo=e.custNo,t.qrCode=r.qrCode,o.isStorageBin?(t.binNo=e.binNo,t.binWhNo=e.binWhNo):(t.binNo=e.binWhNo,t.binWhNo=e.binWhNo),t.reservelocus=e.reservelocus,t.inoutFlag="2",t.entityState=s.default.entityState.added,l.push(t),console.log(t," at pages\\storage\\storage-lowerShelf.vue:182")});else{var d={};d.sheetType=r.model.sheetType,d.sheetNo=r.model.sheetNo,d.sheetLot=r.model.sheetLot,d.partNo=r.model.partNo,d.purLot=r.model.poMoSoLot,d.proLot=r.model.proLot,d.sheetQty=r.model.sheetQty,d.inLot=r.model.inLot,d.proDate=r.model.proDate,d.tagId=r.model.tagId,d.boxTagId=r.model.boxTagId,d.custTagId=r.model.custTagId,d.ordLot=r.model.ordLot,d.custNo=r.model.custNo,d.qrCode=r.qrCode,o.isStorageBin?(d.binNo=r.model.binNo,d.binWhNo=r.model.binWhNo):(d.binNo=r.model.binWhNo,d.binWhNo=r.model.binWhNo),d.reservelocus=r.model.reservelocus,d.inoutFlag="2",d.entityState=s.default.entityState.added,l.push(d),console.log(d," at pages\\storage\\storage-lowerShelf.vue:212")}}return console.log(n.default.outputLog(l)," at pages\\storage\\storage-lowerShelf.vue:215"),e.showLoading({title:"加载中",mask:!0}),a.default.stroage_TransferInoutFag({data:l,success:function(o){e.showToast({title:"保存成功"}),n.default.dataInit(t),t.$refs.input_part.setFocus()},failure:function(e){n.default.showAudio()},complete:function(t,o,a){n.default.tryCatchApi({status:t,message:o}),e.hideLoading()}}),l},onSelectedItem:function(e){for(var t=0;t<this.details.length;t++){var o=this.details[t];o.selectItemClass=t==e?"uni-list-cell-selected":""}},scroll:function(e){this.old.scrollTop=e.detail.scrollTop},onScrollTop:function(t){var o=this;this.onSelectedItem(t);var a=e.createSelectorQuery().in(this).select(".scroll-view-item");a.boundingClientRect(function(e){o.scrollTop=o.old.scrollTop,o.$nextTick(function(){this.scrollTop=e.height*t})}).exec()}}};t.default=r}).call(this,o("6e42")["default"])},7537:function(e,t,o){"use strict";var a=function(){var e=this,t=e.$createElement;e._self._c},s=[];o.d(t,"a",function(){return a}),o.d(t,"b",function(){return s})},"7fc0":function(e,t,o){"use strict";o.r(t);var a=o("7537"),s=o("d5d5");for(var n in s)"default"!==n&&function(e){o.d(t,e,function(){return s[e]})}(n);var l=o("2877"),i=Object(l["a"])(s["default"],a["a"],a["b"],!1,null,null,null);t["default"]=i.exports},d5d5:function(e,t,o){"use strict";o.r(t);var a=o("1a71"),s=o.n(a);for(var n in a)"default"!==n&&function(e){o.d(t,e,function(){return a[e]})}(n);t["default"]=s.a}},[["e5fc","common/runtime","common/vendor"]]]);