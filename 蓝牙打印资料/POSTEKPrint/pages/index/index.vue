<template>
	<view class="content">
		<view>
			<button @tap="openBluetooth" class="button">开始搜索</button>
			<button @tap="closeBluetooth" class="button">关闭蓝牙适配器</button>
			<button @tap="POSTEKPrint" class="button">POSTEK</button> 
		</view>
		<view v-for="item in list" :key="item.deviceId" @tap="connectTO(item)">
			<view class="item">
				<view class="deviceId block">设备ID:{{item.deviceId}}</view>
				<view class="name block">设备名称:{{item.name}}</view>
				<text class="status block">连接状态:{{connectedDeviceId == item.deviceId?"已连接":"未连接"}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	let bluetoothPrint = require("../../common/print/bluetoothPrint.js")
	export default {
		data() {
			return {
				list: [],
				connectedDeviceId: '', 
			}
		},
		onLoad() {

		},
		methods: {
			openBluetooth: function() {
				var that = this;
				that.list = [];
				bluetoothPrint.searchPrinter({
					success: function(res) {
						that.list = that.list.concat(res);
					}
				})
			},
			// 关闭蓝牙模块
			closeBluetooth: function() {
				bluetoothPrint.disconnect()
				this.list = []
				this.connectedDeviceId = ''
			},
			connectTO: function(e) {
				let that = this;
				bluetoothPrint.connect({
					data: {
						deviceId: e.deviceId
					},
					success: function() {
						that.connectedDeviceId = e.deviceId
					}
				})
			},
			POSTEKPrint(){
				bluetoothPrint.addPagePrint(); 
			}
		}
	}
</script>

<style>
	.btn {
		margin-top: 50rpx;
		height: 40px;
		width: 600rpx;
		line-height: 40px;
	}

	.item {
		display: block;
		font-family: Arial, Helvetica, sans-serif;
		font-size: 14px;
		margin: 0 30px;
		margin-top: 10px;
		background-color: #FFA850;
		border-radius: 5px;
		border-bottom: 2px solid #68BAEA;
	}

	.block {
		display: block;
		color: #ffffff;
		padding: 5px;
	}
</style>
