<!--设备检点-->
<template>
	<view>
		<view id="viewHeader">
			<barcode-input ref="input_device" @onScaned="onDeviceScaned" focus :value="padBinding.deviceName" placeholder="扫描设备"></barcode-input>
			<barcode-input ref="input_emp" @onScaned="onEmpScaned" :value="input.empName" placeholder="扫描人员"></barcode-input>
		</view>

		<!-- 明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item, index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)" v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">设备编码:{{ item.deviceNo }}</text>
								<text class="uni-title">设备名称:{{ item.deviceName }}</text>
								<text class="uni-title">设备点检周期: {{ item.plantCheckTime }}</text>
								<text class="uni-title">建立日期:{{ item.createDate }}</text>
								<view>
									<span style="float: left;">备注:</span>
									<input style="float: left;display:inline-block;vertical-align : middle;" type="text" v-model="item.rem" placeholder="备注" />
								</view>
							</view>
							<view class="uni-triplex-right">
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">检点人员:{{ item.empNo }}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">点检时间:{{ item.checkTime }}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>

		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm"><button type="primary" @click="onSave">保存</button></page-foot>
	</view>
</template>

<script>
var date = new Date();
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
			//数据注意引号单引号，双引号

			old: {
				scrollTop: 0
			},
			scrollTop: 0, //中间滚动参数
			scrollHeight: 0, //中间滚动高度
			input: {
				empNo: '',
				empName: ''
			},
			details: [],
			orderItemSelected: {} //当前选中项
		};
	},
	onReady() {
		util.getListHeight(this);
		/* 做好上线就注释 */
		// uni.showToast({
		// 	title: '未准备好，暂不开放！！',
		// 	icon: 'none'
		// });
		// uni.navigateBack();
	},
	onBackPress(options) {
		return util.backPress(options, this.details.length > 0);
	},
	methods: {
		onDeviceScaned(e) {
			var _self = this;
			//console.log(JSON.stringify(e));
			uni.showLoading({
				mask: true
			});
			apis.basic_DeviceGetModel({
				data: {
					//toLowerCase
					deviceNo: e.toLocaleString()
				},
				success: res => {
					var item = {
						id: res.id,
						groundId: '',
						deviceNo: res.deviceNo,
						deviceName: res.deviceName,
						plantCheckTime: res.plantCheckTime,
						checkTime: new Date().format('yyyy/MM/dd hh:mm:ss'),
						rem: '',
						userNo: '',
						empNo: _self.input.empNo || '',
						createDate: new Date().format('yyyy/MM/dd hh:mm:ss'),
						entityState: consts.entityState.added
					};
					_self.details.push(item);
					console.log(util.outputLog(_self.details));
					_self.onScrollTop(_self.details.length - 1);
					util.showScanedAudio();
					this.$refs.input_emp.setFocus();
				},
				failure: message => {
					this.$refs.input_device.setFocus();
					util.showAudio();
				},
				complete: (status, message, content) => {
					util.tryCatchApi({
						status: status,
						message: message
					});
					uni.hideLoading();
				}
			});
		},
		onEmpScaned(e) {
			uni.showLoading({
				mask: true
			});
			apis.emp_a1({
				data: {
					empNo: e
				},
				success: res => {
					console.log(util.outputLog(res));
					this.input.empName = res[0].empName;
					this.input.empNo = res[0].empNo;
					console.log(this.input.empNo);
					this.orderItemSelected.empNo = this.input.empNo || '';
					console.log(this.orderItemSelected);
					this.$refs.input_emp.setFocus();
				},
				failure: message => {
					this.$refs.input_emp.setFocus();
					util.showAudio();
					return false;
				},
				complete: (status, message, content) => {
					util.tryCatchApi({
						status: status,
						message: message
					});
					uni.hideLoading();
				}
			});
			this.$refs.input_emp.setFocus();
		},
		onSave() {
			//校验统一上岗人员的设备和工序
			for (var i = 0, len = this.details.length; i < len; i++) {
				var item = this.details[i];
				console.log(item);
				if (!item.empNo) {
					uni.showToast({
						title: '请添加人员！！',
						icon: 'none'
					});
					return;
				}
				if (!item.deviceNo) {
					uni.showToast({
						title: '请扫设备！！',
						icon: 'none'
					});
					return;
				}
			}
			console.log(util.outputLog(this.details));
			var _self = this;
			uni.showLoading({
				mask: true
			});
			apis.OpenMes_plantcheck({
				data: _self.details,
				success: res => {
					uni.showToast({
						title: '保存成功'
					});
					//初始化数据，（软件盘）
					util.dataInit(this);
					this.$refs.input_device.setFocus();
				},
				failure: message => {
					util.showAudio();
				},
				complete: (status, message, content) => {
					util.tryCatchApi({
						status: status,
						message: message
					});
					uni.hideLoading();
				}
			});
		},
		/* 选中的方法 */
		onSelectedItem(e) {
			for (var i = 0; i < this.details.length; i++) {
				var item = this.details[i];
				if (i == e) {
					item.selectItemClass = 'uni-list-cell-selected';
					this.orderItemSelected = item;
				} else {
					item.selectItemClass = '';
				}
			}
		},
		scroll(e) {
			//滚动
			this.old.scrollTop = e.detail.scrollTop;
		},
		onScrollTop(index) {
			//滚动定位
			this.onSelectedItem(index);
			let view = uni
				.createSelectorQuery()
				.in(this)
				.select('.scroll-view-item');
			view.boundingClientRect(data => {
				this.scrollTop = this.old.scrollTop;
				if (data == null) return;
				this.$nextTick(function() {
					this.scrollTop = data.height * index;
				});
			}).exec();
		}
	}
};
</script>

<style></style>
