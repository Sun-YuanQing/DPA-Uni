<!-- 制程管理，扫描工单、设备、工序 -->
<template>
	<view>
		<barcode-input ref="input_order" @onScaned="onScaned" :value="curOrder.moLot" :focus="true" :clearScan="false" placeholder="扫描工单"></barcode-input>
		<barcode-input ref="input_device" @onScaned="onDeviceScaned" :value="curOrder.deviceNo" placeholder="请扫描设备"></barcode-input>
		<barcode-input ref="input_pro" @onScaned="onProScaned" :value="curOrder.custName1" placeholder="请扫描工序" :disabled="!allowScanPro" :isShowScan="allowScanPro"></barcode-input>
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
				allowScanPro: true,//是否允许扫描工序
				proList: null,//工艺路线的工序集合
				curOrder: {},//当前选中单据 
				padBinding: {
					proName: '',
					deviceName: ''
				} //设备绑定信息
			}
		},
		props:{
			value:Object
		},
		model: {
			prop: 'value',
			event: 'onGetOrder'
		},
		watch:{
			value: {
				immediate: true,
				handler: function(newVal) {
					this.curOrder = newVal; 
				}
			}
		},
		methods: {
			onScaned(e) {
				let that = this;
				/* 解析入库信息 */
				uni.showLoading({
					mask: true
				});
				apis.base_scanOrder({
					data: {
						moLot: e
					},
					success: (res) => {
						console.log(JSON.stringify(res))
						if (res.length == 0) {
							uni.showToast({
								icon: "none",
								title: "当前单据不存在！"
							}) 
							this.$refs.input_order.setFocus();
							return;
						}
						that.proList = res;
						that.curOrder = {};
						this.$refs.input_device.setFocus();
						util.showScanedAudio();
					},
					failure: (message) => {
						this.$refs.input_order.setFocus();
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
			},
			onDeviceScaned(e) {
				let that = this;				
				util.getPadBinding({
					data: {
						deviceNo: e,
						showTips: false
					},
					success: (res) => {
						that.padBinding = res;
						that.allowScanPro = res == null;
						if (res == null){
							//判断设备是否正确
							//判断当前 设备是否属于当前工单
							let tmpDevice = that.validDeviceInOrder(e);
							if(tmpDevice == null) return;
							that.curOrder.deviceName = tmpDevice.deviceName;
							that.curOrder.deviceNo = e;
							that.padBinding = {};
							that.padBinding.configDevice = e; 
							that.padBinding.deviceName = tmpDevice.deviceName;
							that.$refs.input_pro.setFocus();
						}else{							
							//判断当前 设备是否属于当前工单
							let tmpDevice = that.validDeviceInOrder(that.padBinding.configDevice);
							if(tmpDevice == null) return;
							that.curOrder.deviceName = that.padBinding.deviceName;
							that.curOrder.deviceNo = that.padBinding.configDevice;
							//判断工序是否属于当前工单
							let isPass = that.onProAutoScaned(that.padBinding.configDevice, that.padBinding.proItemNo);
							if(!isPass) return;
						}
						util.showScanedAudio();
					},
					failure: () => {
						that.padBinding = null;
						that.$refs.input_device.clear();
					}
				})
			},
			/**
			 * @description 扫描工序
			 * @param {Object} e 
			 */
			onProScaned(e){
				let that = this;
				if (that.proList == null){
					uni.showToast({
						title: '请先扫描制单！',
						icon: 'none'
					});
					util.showAudio(); 
					this.$refs.input_order.setFocus();
					return;
				}
				//判断工序是否正确 & 工序是否属于当前工单
				//判断当前 设备是否属于当前工单
				that.onProAutoScaned(that.padBinding.configDevice, e);
			},
			/**
			 * @description 扫描工序后验证
			 * @param {Object} deviceNo
			 * @param {Object} proItemNo
			 */
			onProAutoScaned(deviceNo, proItemNo){
				let that = this;
				//判断工序是否正确 & 工序是否属于当前工单
				//判断当前 设备是否属于当前工单
				that.curOrder = that.validProInOrder(deviceNo, proItemNo);
				if(that.curOrder == null) return false;
				
				//字段名统一
				that.curOrder.proNo = that.curOrder.custNo;
				that.curOrder.proItemNo = that.curOrder.itemNo;
				that.curOrder.proName = that.curOrder.custName1;
				
				that.curOrder.deviceName = that.padBinding.deviceName;
				that.curOrder.deviceNo = that.padBinding.configDevice;
				util.showScanedAudio(); 
				this.$emit('onGetOrder', that.curOrder);
				return true;
			},
			/**
			 * @description 判断设备是否属于当前工单
			 * @param {Object} deviceNo
			 */
			validDeviceInOrder(deviceNo){
				let that = this;
				let tmpItem = null;
				
				for (var i = 0; i < that.proList.length; i++) {
					for (var j = 0; j < that.proList[i].devices.length; j++) {
						if(that.proList[i].devices[j].deviceNo == deviceNo){
							tmpItem = that.proList[i].devices[j];
							break;
						}
					} 
				} 
				if (tmpItem == null){
					uni.showToast({
						title: '当前设备不属于该工单！',
						icon: 'none'
					});
					util.showAudio(); 
					that.$refs.input_device.setFocus();
					that.$refs.input_device.clear();
				}
				return tmpItem;
			},
			/**
			 * @description 判断工序是否属于当前工单
			 * @param {Object} proItemNo
			 */
			validProInOrder(deviceNo, proItemNo){
				let that = this;
				let curPro = null; 
				
				for (var i = 0; i < that.proList.length; i++) {
					if (that.proList[i].itemNo == proItemNo){
						for (var j = 0; j < that.proList[i].devices.length; j++) {
							if(that.proList[i].devices[j].deviceNo == deviceNo){
								curPro = that.proList[i];
								break;
							}
						} 
					}
				}
				if (curPro == null){
					uni.showToast({
						title: '当前工序不属于该工单！',
						icon: 'none'
					});
					util.showAudio(); 
					that.$refs.input_pro.setFocus();
					that.$refs.input_pro.clear(); 
					return false;
				}
				return curPro;
			},
			/**
			 * @description 验证是否输入完成
			 */
			validInputFinish(){
				let that = this;
				if (that.proList == null){
					uni.showToast({
						title: '请先扫描制单！',
						icon: 'none'
					});
					util.showAudio(); 
					this.$refs.input_order.setFocus();
					return false;
				}
				if (that.curOrder == null || that.curOrder.deviceNo.length == 0){
					uni.showToast({
						title: '请先扫描设备！',
						icon: 'none'
					});
					util.showAudio(); 
					this.$refs.input_device.setFocus();
					return false;
				}
				if (that.curOrder == null || that.curOrder.custName1.length == 0){
					uni.showToast({
						title: '请先扫描工序！',
						icon: 'none'
					});
					util.showAudio(); 
					this.$refs.input_pro.setFocus();
					return false;
				}
				return true;
			},
			getCurOrder(){
				if (!this.validInputFinish()){
					return null;
				}
				return this.order;
			},
			setOrderFocus(){
				this.$refs.input_order.setFocus();
			}
		}
	}
</script>

<style>
</style>
