<!-- 其他设置 -->
<template>
	<view class="">
		<view class="input-group">			
			<view class="uni-list-cell">
				<view class="uni-list-cell-left">
					启用蓝牙:
				</view>
				<view class="uni-list-cell-pd">
					<switch :checked="bluetoothPrinterSet.enableBluetooth" @change="enableBluetoothChange" />
				</view>
			</view>
			<view class="uni-list-cell">
				<view class="uni-list-cell-left">
					蓝牙打印机类型：
				</view>
				<view class="uni-list-cell-db">
					<picker @change="bindPickerChange" :value="bluetoothPrinterSet.bluetoothType" :range="bluetoothType">
						<view class="uni-input">{{bluetoothType[bluetoothPrinterSet.bluetoothType]}}</view>
					</picker>
				</view>
			</view>
			<view class="uni-list-cell">
				<view class="uni-list-cell-left">
					打印方向：
				</view>
				<view class="uni-list-cell-db">
					<picker @change="bindRotationChange" :value="bluetoothPrinterSet.portraitIndex" :range="rotations">
						<view class="uni-input">{{rotations[bluetoothPrinterSet.portraitIndex]}}</view>
					</picker>
				</view>
			</view>
			<view class="uni-list-cell">
				<view class="uni-list-cell-left">
					蓝牙打印机：
				</view>
				<view class="uni-list-cell-db">
					<view class="uni-input" @click="showPrinter" style="font-size: 10px;">{{selPrinterName}}</view>
				</view>
				<view class="uni-icon uni-icon-clear" v-show="showClearIcon" style="margin-right: 3upx;" @click="clearBluetooth"></view>
			</view>
			<!-- <view class="uni-list-cell">
				<view class="uni-list-cell-left">
					蓝牙连接延时：
				</view>
				<view class="uni-list-cell-db">
					<input class="uni-input" type="number" v-model="bluetoothPrinterSet.delayConnTime" placeholder="延时1000~2000(单位:毫秒)" @input="delayConnTimeChanged" maxlength="4"/> 
				</view> 
			</view> -->
		</view>

		<uni-popup :show="showPrinterList" position="middle" mode="fixed" @hidePopup="togglePopup">
			<h1 class="uni-title">请选择打印机</h1>
			<view class="uni-icon uni-icon-refresh" style="display: block; position:fixed; top: 20upx; right: 5upx; padding: 20upx;"
			 @click="refreshPrinter"></view>
			<scroll-view class="center-box" scroll-y="true" style="max-height: 300px;">
				<view class="uni-list">
					<block v-for="(item,index) in printerList" :key="index">
						<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onPrinterSelected(index)">
							<view class="uni-triplex-row">
								<view class="uni-triplex-left">
									<text class="uni-title">蓝牙:{{ item.name}}</text>
									<text class="uni-title">设备:{{ item.deviceId}}</text>
								</view>
							</view>
						</view>
					</block>
				</view>
			</scroll-view>
		</uni-popup>
	</view>
</template>

<script>
	import uniPopup from '../../components/uni-popup/uni-popup.vue';
	
	import storage from '../../common/storage.js';
	import apis from '../../common/apiService.js';
	import consts from '../../common/consts.js';
	import util from '../../common/util.js';
	import bluetoothPrint from '../../common/print/bluetoothPrint.js'
	

	export default {
		components: {
			uniPopup
		},
		data() {
			return {
				showClearIcon: false,
				//面单模式 = 0,  标签模式= 1, 票据 = 2，博思得 = 3
				bluetoothType: ['面单模式', '标签模式'],//, '票据', '博思得'
				//记得改 app.vue里面的默认配置
				bluetoothPrinterSet: {
					enableBluetooth: false,
					bluetoothType: 0,
					deviceId: '',
					deviceName: '',
					delayConnTime: 0,//连接延时
					portrait:true,//转向
					portraitIndex: 0
				},
				rotations:['纵向', '横向'],//打印方向
				selPrinterName: '',
				showPrinterList: false,
				printerList: []
			}
		},
		onShow() {

		},
		onLoad(e) {
			let bluetoothSet = storage.get(consts.storageKeys.bluetoothPrinterSet)
			if (bluetoothSet != undefined) {
				this.bluetoothPrinterSet = bluetoothSet; 
				this.bluetoothPrinterSet.portraitIndex = this.bluetoothPrinterSet.portraitIndex || 0;
				if (bluetoothSet.deviceId.length > 0){
					this.selPrinterName = bluetoothSet.deviceName + ' | ' + bluetoothSet.deviceId
				}
				this.showClearIcon = bluetoothSet.deviceId.length > 0;
			}
		},
		onReady() {},
		methods: {
			bindPickerChange(e) {
				this.bluetoothPrinterSet.bluetoothType = e.target.value
				storage.set(consts.storageKeys.bluetoothPrinterSet, this.bluetoothPrinterSet);
			},
			bindRotationChange(e){
				this.bluetoothPrinterSet.portraitIndex = e.target.value
				this.bluetoothPrinterSet.portrait = e.target.value == 0;
				storage.set(consts.storageKeys.bluetoothPrinterSet, this.bluetoothPrinterSet);
			},
			enableBluetoothChange(e) {
				this.bluetoothPrinterSet.enableBluetooth = e.target.value; 
				storage.set(consts.storageKeys.bluetoothPrinterSet, this.bluetoothPrinterSet);
			},
			showPrinter() {
				this.showPrinterList = true;
				this.refreshPrinter() 
			},
			refreshPrinter() {
				var that = this;
				that.printerList = [];
				bluetoothPrint.searchPrinter({
					success: function(res) {
						that.printerList = that.printerList.concat(res);
					}
				})
			},
			clearBluetooth() {
				if (this.selPrinterName.length > 0) {
					this.showClearIcon = false;
					this.selPrinterName = ''
					this.bluetoothPrinterSet.deviceName = '';
					this.bluetoothPrinterSet.deviceId = '';
					storage.set(consts.storageKeys.bluetoothPrinterSet, this.bluetoothPrinterSet);
				}
			},
			onPrinterSelected(e) {
				let that = this;
				//打印机选中
				var printer = this.printerList[e];
				this.selPrinterName = printer.name + ' | ' + printer.deviceId
				this.showClearIcon = true;
				this.bluetoothPrinterSet.deviceName = printer.name;
				this.bluetoothPrinterSet.deviceId = printer.deviceId;
				storage.set(consts.storageKeys.bluetoothPrinterSet, this.bluetoothPrinterSet);
				this.showPrinterList = false;
				bluetoothPrint.stopSearchPrinter();
			},
			togglePopup() {
				this.showPrinterList = false;
				bluetoothPrint.stopSearchPrinter();
			},
			delayConnTimeChanged(){
				setTimeout(() => {
					storage.set(consts.storageKeys.bluetoothPrinterSet, this.bluetoothPrinterSet);
				}, 0)
			}
		}
	}
</script>

<style>
</style>
