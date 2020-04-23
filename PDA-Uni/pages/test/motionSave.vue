<template>
	<view class="" @click="onclick">校验公共方法</view>
</template>

<script>
import util from '../../common/util.js';
export default {
	data() {
		return {
			list: [{ lastScanQty: 0, qc: true }, { lastScanQty: 0, qc: 1 }, { lastScanQty: 0, qc: 1 }, { lastScanQty: 0, qc: 1 }]
		};
	},
	methods: {
		onSave() {
			console.log('测试 this是否指==向全局:'+JSON.stringify(this.list)); 
			console.log('保存成功');
			
		},
		onCancel() {
			console.log('取消了校验');
		},
		onclick() {
			var _self = this;
			var name = 'qc';
			var key = true;
			util.automateSave(_self.list, "qc", 1, _self.onSave,_self.onCancel); /* 这里可以不传onCancel */
		}
	}
};
</script>

<style></style>
