<!--  -->
<template>
	<view>
		<button @click="onPartSync">料号同步</button>
	</view>
</template>

<script>
	import barcodeInput from '../../components/barcode-input/barcode-input.vue'; //扫码组件

	import apis from '../../common/apiService.js'; //系统api
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js'; //常用功能

	export default {
		components: {
			barcodeInput
		},
		data() {
			return { 
			}
		}, 
		onReady() { 
		},
		onBackPress(options) { 
		},
		methods: {
			onPartSync(e) {
				//料品信息标签扫描完成
				uni.showLoading({
					mask: true
				});
				apis.pdadatacreatepart({
					data: {
						parameter: 'all'
					},
					success: (res) => {
						uni.showToast({
							title:'同步成功'
						});
					},
					failure: (message) => {
						util.showAudio();
					},
					complete: (status, message, content) => { 
						util.tryCatchApi({
							status: status,
							message: message
						});
						uni.hideLoading();
					}
				})
			}
		}
	}
</script>

<style>
</style>
