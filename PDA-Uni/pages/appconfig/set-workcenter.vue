<!-- 设置工作中心 -->
<template>
	<view>
		<view id="viewHeader">
			<view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">工作中心(可选)：</view>
					<view class="uni-list-cell-db">
						<picker @change="bindPickerChange" :value="wcIndex" :range="workcenterList">
							<view>{{ workcenterList[wcIndex] }}</view>
						</picker>
					</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">设备：</view>
					<view class="uni-list-cell-db" style="min-height: 50upx;" @tap="getDeviceList">
						<view class="uni-list-cell-db">
							<view>{{ deviceInfo.deviceName }}</view>
						</view>
					</view>
					<view class="uni-list-cell-pd" v-if="deviceInfo.deviceName"><view class="uni-icon uni-icon-clear" @click="clearDevice"></view></view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">工序：</view>
					<view class="uni-list-cell-db" style="min-height: 50upx;" @tap="getProcessList">
						<view class="uni-list-cell-db">
							<view>{{ processInfo.proName }}</view>
						</view>
					</view>
					<view class="uni-list-cell-pd" v-if="processInfo.proName"><view class="uni-icon uni-icon-clear" @click="clearProcess"></view></view>
				</view>
			</view>
		</view>

		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll"></scroll-view>
		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<button type="primary" style="display: block; width: 48%;float: left;" @tap="onAbolishSave">取消工作中心</button>
			<button type="primary" style="display: block; width: 48%;float: none;" @tap="onSave">保存</button>
		</page-foot>
	</view>
</template>

<script>
let workcenterSource = null;

import storage from '../../common/storage.js';
import apis from '../../common/apiService.js';
import consts from '../../common/consts.js';
import util from '../../common/util.js';
export default {
	components: {},
	data() {
		return {
			wcIndex: 0,
			workcenterList: [],
			processInfo: {}, //工序信息
			deviceInfo: {}, //设备信息
			scrollTop: 0, //中间滚动参数
			scrollHeight: 0, //中间滚动高度
			header: null
		}
	},
	onShow() {
		let navBackData_searchDeivce = storage.get(consts.storageKeys.navBackData_searchDeivce);
		if (navBackData_searchDeivce) {
			this.deviceInfo = navBackData_searchDeivce;
			storage.set(consts.storageKeys.navBackData_searchDeivce, null);
		}
		let navBackData_searchProcess = storage.get(consts.storageKeys.navBackData_searchProcess);
		if (navBackData_searchProcess) {
			this.processInfo = navBackData_searchProcess;
			this.processInfo.proName = this.processInfo.custName1;
			this.processInfo.proItemNo = this.processInfo.itemNo;
			storage.set(consts.storageKeys.navBackData_searchProcess, null);
		}
	},
	onLoad(e) {
		this.getWorkCenters();
	},
	onReady() {
		
		util.getListHeight(this);
	},
	methods: {
		getWorkCenters() {
			//获取工作中心
			uni.showLoading({
				title: '加载中..',
				mask: true
			});
			apis.basic_workCenterList({
				data: {},
				success: (res) => {
					this.workcenterSource = res;
					this.workcenterSource.insert(0, {
						"wcNo": "-1",
						"wcName": "无"
					});
					for (let i = 0; i < this.workcenterSource.length; i++) {
						this.workcenterList.push(this.workcenterSource[i].wcName);
					}

					this.getWCSet();
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
		getWCSet() {
			//获取之前的设置
			apis.messhopconfig_Get({
				success: (res) => {
					this.header = res;
					if (res.id) {
						for (let i = 0; i < this.workcenterSource.length; i++) {
							if (this.workcenterSource[i].wcNo == res.configWorkCenter) {
								this.wcIndex = i;
								break;
							}
						}
						this.processInfo.proName = res.proName || '';
						this.processInfo.proItemNo = res.proItemNo;
						this.processInfo.custNo = res.configPro;
						this.deviceInfo.deviceNo = res.configDevice;
						this.deviceInfo.deviceName = res.deviceName || '';
					}
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
		bindPickerChange(e) {
			this.wcIndex = e.target.value;
		},
		getProcessList() {
			//获取工序列表
			uni.navigateTo({
				url: '/pages/common/search-processList',
			})
		},
		getDeviceList() {
			//获取设备列表
			uni.navigateTo({
				url: '/pages/common/search-deviceList',
			})
		},
		onAbolishSave(){
			this.clearDevice();
			this.clearProcess();
			let userInfo = storage.get(consts.storageKeys.login)
			if (!this.header.id) {
				this.header = {};
				this.header.id = plus.device.uuid;
				this.header.createDate = new Date().format("yyyy/MM/dd");
				this.header.entityState = consts.entityState.added;
			} else {
				this.header.entityState = consts.entityState.modified;
			}
			console.log("this.processInfo: " + JSON.stringify(this.processInfo));
			console.log("this.deviceInfo: " + JSON.stringify(this.deviceInfo));
			this.header.userNo = userInfo.userID;
			this.header.configPro = '';
			this.header.proItemNo = '';
			this.header.proName =  '';
			this.header.configDevice = '';
			this.header.deviceName = '';
			this.header.configWorkCenter ="";
			this.header.wcName =  "" ;
			console.log("this.header: " + JSON.stringify(this.header));
			uni.showLoading({
				title: '加载中..',
				mask: true
			});
			apis.messhopconfig_Save({
				data: this.header,
				success: (res) => {
					uni.showToast({
						title: '保存成功',
						icon: 'none'
					});
					storage.set(consts.storageKeys.padBinding, null);
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
		onSave() {
			if (!this.processInfo.custNo) {
				uni.showToast({
					title: '请录入工序',
					icon: 'none'
				});
				return;
			}
			if (!this.deviceInfo.deviceNo) {
				uni.showToast({
					title: '请录入设备',
					icon: 'none'
				});
				return;
			}
			let userInfo = storage.get(consts.storageKeys.login)
			if (!this.header.id) {
				this.header = {};
				this.header.id = plus.device.uuid;
				this.header.createDate = new Date();
				this.header.entityState = consts.entityState.added;
			} else {
				this.header.entityState = consts.entityState.modified;
			}
			console.log("this.processInfo: " + JSON.stringify(this.processInfo));
			console.log("this.deviceInfo: " + JSON.stringify(this.deviceInfo));
			this.header.userNo = userInfo.userID;
			this.header.configPro = this.processInfo.custNo || '';
			this.header.proItemNo = this.processInfo.proItemNo || '';
			this.header.proName = this.processInfo.proName || '';
			this.header.configDevice = this.deviceInfo.deviceNo || '';
			this.header.deviceName = this.deviceInfo.deviceName || '';
			this.header.configWorkCenter = this.wcIndex == 0 ? "" : this.workcenterSource[this.wcIndex].wcNo;
			this.header.wcName = this.wcIndex == 0 ? "" : this.workcenterSource[this.wcIndex].wcName;
			console.log("this.header: " + JSON.stringify(this.header));
			uni.showLoading({
				title: '加载中..',
				mask: true
			});
			apis.messhopconfig_Save({
				data: this.header,
				success: (res) => {
					uni.showToast({
						title: '保存成功',
						icon: 'none'
					});
					storage.set(consts.storageKeys.padBinding, this.header);
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
		clearProcess() {
			//删除工序
			this.processInfo = {};
		},
		clearDevice() {
			//删除设备
			this.deviceInfo = {};
		}
	}
}
</script>

<style></style>
