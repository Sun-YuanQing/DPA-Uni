(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/sale/sale-outDet"],{"055f":function(t,e,o){"use strict";(function(t){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var a=u(o("2e17")),s=u(o("f2a9")),l=u(o("00e0")),n=u(o("409c")),i=o("2f62");function u(t){return t&&t.__esModule?t:{default:t}}function r(t){for(var e=1;e<arguments.length;e++){var o=null!=arguments[e]?arguments[e]:{},a=Object.keys(o);"function"===typeof Object.getOwnPropertySymbols&&(a=a.concat(Object.getOwnPropertySymbols(o).filter(function(t){return Object.getOwnPropertyDescriptor(o,t).enumerable}))),a.forEach(function(e){c(t,e,o[e])})}return t}function c(t,e,o){return e in t?Object.defineProperty(t,e,{value:o,enumerable:!0,configurable:!0,writable:!0}):t[e]=o,t}var d=function(){return o.e("components/barcode-input/barcode-input").then(o.bind(null,"d7ce"))},f=function(){return o.e("components/authorize-input/authorize-input").then(o.bind(null,"d9d3"))},h=function(){return Promise.all([o.e("common/vendor"),o.e("components/lotunpack/lotunpack")]).then(o.bind(null,"acb4"))},p={components:{barcodeInput:d,authorizeInput:f,lotunpack:h},data:function(){new Date;return{progNo:"",sheetLot:"",old:{scrollTop:0},scrollTop:0,scrollHeight:0,showLotUnpack:!1,printMode:{},printDetail:[],isStorageBin:null,details:[],orderItemSelected:{},scan_qrCode:"",resultNote:{},showAuth:!1,lockModel:{lockType:s.default.lockType.sale_out,sourceId:"",description:""}}},onLoad:function(t){console.log(n.default.outputLog(t)," at pages\\sale\\sale-outDet.vue:107"),this.progNo=t.progNo,this.isStorageBin=l.default.get(s.default.storageKeys.IsStorageBin),this.sheetLot=t.sheetLot},onReady:function(){var e=this;n.default.getListHeight(this);var o=this;t.showLoading({mask:!0}),a.default.sale_getDetails({data:{sheetLot:o.sheetLot},success:function(t){e.details=[],t.scanQty=0,t.lastScanQty=t.sheetQty,e.details.push(t),setTimeout(function(){o.details.forEach(function(t,e){o.onScrollTop(e),o.updateScanList()})},200)},failure:function(t){JSON.stringify(t);n.default.showAudio()},complete:function(o,a,s){e.$refs.input_part.setFocus(),n.default.tryCatchApi({status:o,message:a}),t.hideLoading()}})},onBackPress:function(t){return n.default.backPress(t,this.details.length>0)},methods:r({},(0,i.mapMutations)(["pageIO_true"]),{onScaned:function(e){var o=this;t.showLoading({mask:!0});var l=this;l.scan_qrCode=e,a.default.sale_lockScreen_valid({data:{sheetLot:this.sheetLot,qrCode:e},success:function(t){l.resultNote={},l.resultNote=JSON.parse(t.resultNote);for(var e=0,a=l.details.length;e<a;e++){var i=l.details[e];if(i.partNo===l.resultNote.partNo){l.onScrollTop(e),i.tagDetails=i.tagDetails||[],i.locklogDetails=i.locklogDetails||[];var u=i.tagDetails.length,r=Math.round(u/2),c=l.item_radius(i,r,u,l);if(c||l.item_radius(i,0,r,l),n.default.floatObj.add(i.scanQty,l.resultNote.sheetQty)>Number(i.sheetQty))return o.onScrollTop(e),n.default.showScanedAudio(),void o.tag_split(l.resultNote,i.lastScanQty)}}if(-11==t.resultCode)return o.lockModel={lockType:s.default.lockType.sale_out,sourceId:"",description:""},o.lockModel.description=t.resultText,o.lockModel.sourceId=o.sheetLot,o.lockModel.lockType=s.default.lockType.sale_out,o.showAuth=!0,void n.default.showAudio();l.resultNote_ifTagDet(),n.default.showScanedAudio(),n.default.automateSave(l.details,"lastScanQty",0,l.onSave)},failure:function(t){n.default.showAudio()},complete:function(e,a,s){o.$refs.input_part.setFocus(),n.default.tryCatchApi({status:e,message:a}),t.hideLoading()}})},item_radius:function(e,o,a,s){for(a;o<a;o++){var l=e.tagDetails[o];if(l.tagId==s.resultNote.tagId)return n.default.showAudio(),t.showModal({title:"提示",content:"该标签已扫描,是否要删除",success:function(t){t.confirm?(e.tagDetails.splice(o,1),s.updateScanList()):t.cancel}}),1}},authClick:function(t){this.showAuth=!1;for(var e=this,o=t,a=0,l=this.details.length;a<l;a++){var n=this.details[a];if(n.partItemNo==this.resultNote.partItemNo){n.locklogDetails.push(o),n.locklogDetails.entityState=s.default.entityState.added;break}}1==t.resultSta&&e.resultNote_ifTagDet(),this.$refs.input_part.setFocus()},resultNote_ifTagDet:function(){for(var e=this,o=0,a=e.details.length;o<a;o++){var l=e.details[o];if(l.sheetSta=2,l.entityState=s.default.entityState.modified,e.resultNote.tagDetails){for(var i=0,u=e.resultNote.tagDetails.length;i<u;i++){var r=e.resultNote.tagDetails[i];l.partNo==r.partNo&&(r.id=null,r.inoutFlag=2,r.sheetLot=e.sheetLot,r.sheetNo=l.sheetNo,r.whNo=l.whNo,r.whName=l.whName,r.unitNo=l.salUnit,r.unitName=l.unitName,r.sheetSta=2,r.qrCode=r.qrCode||e.scan_qrCode,r.entityState=s.default.entityState.added,l.tagDetails.push(r))}t.showToast({title:"扫描成功"}),e.resultNote=null,e.updateScanList()}else l.partNo==e.resultNote.partNo&&(e.resultNote.id=null,e.resultNote.inoutFlag=2,e.resultNote.sheetLot=e.sheetLot,e.resultNote.sheetNo=l.sheetNo,e.resultNote.whNo=l.whNo,e.resultNote.whName=l.whName,e.resultNote.unitNo=l.salUnit,e.resultNote.unitName=l.unitName,e.resultNote.purLot=e.resultNote.poMoSoLot,e.resultNote.sheetSta=2,e.resultNote.qrCode=e.resultNote.qrCode||e.scan_qrCode,e.resultNote.entityState=s.default.entityState.added,l.tagDetails.push(e.resultNote),e.resultNote=null,e.updateScanList(),t.showToast({title:"扫描成功"}))}n.default.automateSave(e.details,"lastScanQty",0,e.onSave)},onSave:function(){var e=this;if(0!=this.details.length){for(var o=this,s=0,l=this.details.length;s<l;s++){var i=this.details[s];if(Number(i.scanQty)!=Number(i.sheetQty))return n.default.showAudio(),void t.showToast({icon:"none",title:"扫描数量不足出货数量！"})}console.log(n.default.outputLog(o.details)," at pages\\sale\\sale-outDet.vue:361"),a.default.sale_save_put({data:o.details,success:function(e){console.log(JSON.stringify(e)," at pages\\sale\\sale-outDet.vue:365"),t.showToast({title:"保存成功."}),n.default.dataInit(o),o.pageIO_true(),setTimeout(function(){t.navigateBack()},500)},failure:function(t){n.default.showAudio()},complete:function(o,a,s){e.$refs.input_part.setFocus(),n.default.tryCatchApi({status:o,message:a}),t.hideLoading()}})}},scroll:function(t){this.old.scrollTop=t.detail.scrollTop},onScrollTop:function(e){var o=this;this.onSelectedItem(e);var a=t.createSelectorQuery().in(this).select(".scroll-view-item");a.boundingClientRect(function(t){o.scrollTop=o.old.scrollTop,o.$nextTick(function(){this.scrollTop=t.height*e})}).exec()},tag_split:function(t,e){var o=[];o.push({num:1,numQty:e}),o.push({num:1,numQty:n.default.floatObj.subtract(t.sheetQty,e)}),this.printMode=t,this.printDetail=o,this.showLotUnpack=!0},lotupackCancel:function(){this.printDetail=[],this.showLotUnpack=!1,this.$refs.input_part.setFocus()},printComplete:function(){this.printDetail=[],this.$refs.input_part.setFocus()},printCancel:function(){this.printDetail=[],this.showLotUnpack=!1,this.$refs.input_part.setFocus()},onSelectedItem:function(t){for(var e=0;e<this.details.length;e++){var o=this.details[e];e==t?(o.selectItemClass="uni-list-cell-selected",this.orderItemSelected=o):o.selectItemClass=""}},updateScanList:function(){var t=0;if(this.orderItemSelected.tagDetails)for(var e=0;e<this.orderItemSelected.tagDetails.length;e++)t=n.default.floatObj.add(t,this.orderItemSelected.tagDetails[e].sheetQty);this.orderItemSelected.scanQty=t,this.orderItemSelected.lastScanQty=n.default.floatObj.subtract(this.orderItemSelected.sheetQty,t);var o=n.default.clone(this.orderItemSelected);this.orderItemSelected=o}})};e.default=p}).call(this,o("6e42")["default"])},"0ae3":function(t,e,o){"use strict";var a=function(){var t=this,e=t.$createElement;t._self._c},s=[];o.d(e,"a",function(){return a}),o.d(e,"b",function(){return s})},"4fe7":function(t,e,o){"use strict";o.r(e);var a=o("055f"),s=o.n(a);for(var l in a)"default"!==l&&function(t){o.d(e,t,function(){return a[t]})}(l);e["default"]=s.a},"9ae8":function(t,e,o){"use strict";o.r(e);var a=o("0ae3"),s=o("4fe7");for(var l in s)"default"!==l&&function(t){o.d(e,t,function(){return s[t]})}(l);var n=o("2877"),i=Object(n["a"])(s["default"],a["a"],a["b"],!1,null,null,null);e["default"]=i.exports}},[["9676","common/runtime","common/vendor"]]]);