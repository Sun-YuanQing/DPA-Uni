(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/storage/storage-transfer"],{7496:function(t,e,o){"use strict";(function(t){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var s=l(o("2e17")),n=l(o("f2a9")),i=l(o("00e0")),a=l(o("409c"));function l(t){return t&&t.__esModule?t:{default:t}}var r=function(){return o.e("components/barcode-input/barcode-input").then(o.bind(null,"d7ce"))},u={components:{barcodeInput:r},data:function(){return{details:[],old:{scrollTop:0},scrollTop:0,scrollHeight:0,placeholder_store:"",isStorageBin:null,binNo:"",binWhNo:""}},onLoad:function(t){var e=this;this.isStorageBin=i.default.get(n.default.storageKeys.IsStorageBin),this.isStorageBin?e.placeholder_store="扫描储位":e.placeholder_store="扫描仓库"},onReady:function(){a.default.getListHeight(this)},onBackPress:function(t){return a.default.backPress(t,this.details.length>0)},methods:{onPartScaned:function(e){var o=this,n=e,i=this;t.showLoading({title:"加载中",mask:!0}),s.default.OpenMes_mesqrcodeinout({data:{qrCode:e},success:function(l){for(var r=function(){var s=o.details[u];if(s.tagDetails){for(console.log(1," at pages\\storage\\storage-transfer.vue:97"),d=0;d<s.tagDetails.length;d++)if(item_tag.qrCode==e)return i.onScrollTop(u),t.showModal({title:"提示",content:"该标签已扫描,是否要删除",success:function(t){if(t.confirm)for(var e=0;e<s.tagDetails.length;e++)i.details.splice(e,1);else t.cancel}}),{v:void 0}}else if(s.qrCode==e)return o.onScrollTop(u),t.showModal({title:"提示",content:"该标签已扫描,是否要删除",success:function(t){t.confirm?i.details.splice(u,1):t.cancel}}),{v:void 0}},u=0;u<o.details.length;u++){var d,c=r();if("object"===typeof c)return c.v}s.default.storage_Transfer({data:{inoutFlag:"2",tagId:l.tagId},success:function(t){console.log(a.default.outputLog(l)," at pages\\storage\\storage-transfer.vue:141"),l.tagDetails?l.tagDetails.forEach(function(t){t.state="1",t.stateName="已下架",console.log(t," at pages\\storage\\storage-transfer.vue:146"),i.details.push({model:t,qrCode:n})}):(l.state="1",l.stateName="已下架",i.details.push({model:l,qrCode:e})),a.default.showScanedAudio()},failure:function(t){a.default.showAudio()},complete:function(e,o,s){i.$refs.input_part.setFocus(),a.default.tryCatchApi({status:e,message:o}),t.hideLoading()}})},failure:function(t){o.$refs.input_part.setFocus(),a.default.showAudio()},complete:function(e,o,s){a.default.tryCatchApi({status:e,message:o}),t.hideLoading()}})},onScanStorage:function(e){var o=this;if(e.length<=0)t.showToast({title:"不能输入空值!",icon:"none"});else{if(0==this.details.length)return t.showToast({title:"请先扫描下架物料",icon:"none"}),this.$refs.input_part.setFocus(),void a.default.showAudio();if(e.toLowerCase()==this.details[0].model.reservelocus.toLowerCase())return t.showToast({title:"上架下架不能是同一个货架",icon:"none"}),a.default.showAudio(),void this.$refs.input_store.clear();t.showLoading({title:"加载中",mask:!0}),this.isStorageBin?s.default.bas_storagebin({data:{binNo:e},success:function(e){e.length<=0?(t.showToast({title:"货架不存在!",icon:"none"}),o.$refs.input_store.clear(),a.default.showAudio()):(o.binNo=e[0].binNo,o.binWhNo=e[0].whNo,o.$refs.input_part2.setFocus(),a.default.showScanedAudio())},failure:function(t){o.$refs.input_store.setFocus(),a.default.showAudio()},complete:function(e,o,s){a.default.tryCatchApi({status:e,message:o}),t.hideLoading()}}):(console.log(e," at pages\\storage\\storage-transfer.vue:257"),s.default.bas_wh({data:{filter:'whNo = "'+e+'"'},success:function(e){console.log(a.default.outputLog(e)," at pages\\storage\\storage-transfer.vue:263"),e.length<=0?(t.showToast({title:"仓库不存在!",icon:"none"}),o.$refs.input_store.clear(),o.$refs.input_store.setFocus(),a.default.showAudio()):(o.binWhNo=e[0].whNo,console.log(o.binNo+"----"+o.binWhNo," at pages\\storage\\storage-transfer.vue:274"),o.$refs.input_part.setFocus())},complete:function(e,o,s){a.default.tryCatchApi({status:e,message:o}),t.hideLoading()}}))}},onPartScaned2:function(e){var o=this;if(0==o.details.length)return t.showToast({title:"请先扫描下架物料",icon:"none"}),o.$refs.input_part.setFocus(),void a.default.showAudio();if(this.isStorageBin){if(""==o.binNo.trim())return t.showToast({title:"请先扫描上架货架",icon:"none"}),a.default.showAudio(),void o.$refs.input_store.setFocus()}else if(""==o.binWhNo.trim())return t.showToast({title:"请先扫描仓库",icon:"none"}),a.default.showAudio(),void o.$refs.input_store.setFocus();t.showLoading({title:"加载中",mask:!0}),s.default.OpenMes_mesqrcodeinout({data:{qrCode:e},success:function(s){for(var n=!1,i=0;i<o.details.length;i++){var l=o.details[i];if(l.qrCode==e)return n=!0,void("1"==l.model.state?(l.model.state="2",l.model.stateName="已上架",l.model.binNo_Up=o.binNo,l.model.binWhNo_Up=o.binWhNo,o.onSelectedItem(i),a.default.showScanedAudio()):(t.showToast({title:"该物料已上架",icon:"none"}),a.default.showAudio()))}if(!n)return t.showToast({title:"该标签未下架！"}),void a.default.showAudio();a.default.showScanedAudio()},failure:function(t){a.default.showAudio()},complete:function(e,o,s){a.default.tryCatchApi({status:e,message:o}),t.hideLoading()}})},save:function(){var e=this,o=this;if(0==this.details.length)return t.showToast({title:"请先扫描下架物料",icon:"none"}),void this.$refs.input_part.setFocus();for(var i=0;i<this.details.length;i++){var l=this.details[i].model;if("1"==l.state)return t.showToast({title:"当前货架还有物料未上架",icon:"none"}),void onSelectedItem(i)}var r=[];for(i=0;i<this.details.length;i++){var u=this.details[i],d={};d.sheetType=u.model.sheetType,d.sheetNo=u.model.sheetNo,d.sheetLot=u.model.sheetLot,d.partNo=u.model.partNo,d.purLot=u.model.poMoSoLot,d.proLot=u.model.proLot,d.sheetQty=u.model.sheetQty,d.inLot=u.model.inLot,d.proDate=u.model.proDate,d.tagId=u.model.tagId,d.boxTagId=u.model.boxTagId,d.custTagId=u.model.custTagId,d.ordLot=u.model.ordLot,d.custNo=u.model.custNo,o.isStorageBin?(d.binNo=u.model.binNo,d.binWhNo=u.model.binWhNo):(d.binNo=u.model.binWhNo,d.binWhNo=u.model.binWhNo),d.qrCode=u.qrCode,d.inoutFlag="2",d.entityState=n.default.entityState.added,r.push(d);var c=a.default.clone(d);c.inoutFlag="1",o.isStorageBin?(c.binNo=u.model.binNo_Up,c.binWhNo=u.model.binWhNo_Up):(c.binNo=u.model.binWhNo_Up,c.binWhNo=u.model.binWhNo_Up),r.push(c)}return t.showLoading({title:"加载中",mask:!0}),s.default.storage_TransferCount({data:r,success:function(s){t.showToast({title:"保存成功"}),a.default.dataInit(e),e.$refs.input_store.clear(),e.$refs.input_store.setFocus(),o.isStorageBin?o.placeholder_store="扫描储位":o.placeholder_store="扫描仓库"},failure:function(t){a.default.showAudio()},complete:function(e,o,s){a.default.tryCatchApi({status:e,message:o}),t.hideLoading()}}),r},onSelectedItem:function(t){for(var e=0;e<this.details.length;e++){var o=this.details[e];o.selectItemClass=e==t?"uni-list-cell-selected":""}},scroll:function(t){this.old.scrollTop=t.detail.scrollTop},onScrollTop:function(e){var o=this,s=t.createSelectorQuery().in(this).select(".scroll-view-item");s.boundingClientRect(function(t){o.scrollTop=o.old.scrollTop,o.$nextTick(function(){this.scrollTop=t.height*e})}).exec()}}};e.default=u}).call(this,o("6e42")["default"])},"7b27":function(t,e,o){"use strict";o.r(e);var s=o("a3ab"),n=o("89d2");for(var i in n)"default"!==i&&function(t){o.d(e,t,function(){return n[t]})}(i);var a=o("2877"),l=Object(a["a"])(n["default"],s["a"],s["b"],!1,null,null,null);e["default"]=l.exports},"89d2":function(t,e,o){"use strict";o.r(e);var s=o("7496"),n=o.n(s);for(var i in s)"default"!==i&&function(t){o.d(e,t,function(){return s[t]})}(i);e["default"]=n.a},a3ab:function(t,e,o){"use strict";var s=function(){var t=this,e=t.$createElement;t._self._c},n=[];o.d(e,"a",function(){return s}),o.d(e,"b",function(){return n})}},[["2f57","common/runtime","common/vendor"]]]);