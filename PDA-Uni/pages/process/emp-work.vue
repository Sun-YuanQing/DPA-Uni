<!--人员上岗-->
<template>
	<view>
		<view id="viewHeader">
			<barcode-input ref="input_device" @onScaned="onScanDevice" focus :value="padBinding.configDevice" placeholder="扫描设备"></barcode-input>
			<barcode-input
				ref="input_pro"
				@onScaned="onProScaned"
				:value="padBinding.proName"
				placeholder="请扫描工序"
				:disabled="!allowScanPro"
				:isShowScan="allowScanPro"
			></barcode-input>
			<barcode-input ref="input_emp" @onScaned="onScanstaff" :value="ScanstaffValue" placeholder="扫描人员"></barcode-input>

			<!-- 头表信息 -->
			<view>
				<view class="uni-list-cell input-row">
					<view style="width: 100%;height: 70upx; display: block;border: 1upx solid #0077AA;">
						<view
							style="float: right; display: block;width: 100upx;height:100%;line-height:100%; text-align: center; font-size: 70upx;"
							class="uni-icon uni-icon-quanxuan"
							@click="onall"
						></view>
						<view
							style="float: right; display: block;width: 100upx;height:100%;line-height:100%; text-align: center; font-size: 70upx;"
							class="uni-icon uni-icon-fanxuan"
							@click="onnooff"
						></view>
					</view>
				</view>
			</view>
		</view>

		<!-- 显示人员 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view
				v-for="(item, index) in order.details"
				:key="index"
				style="float: left;padding: 20upx 10upx 0upx 10upx; width: 25%;height: 160upx;"
				class="uni-triplex-row  scroll-view-item"
				hover-class="uni-list-cell-hover"
			>
				<view
					style="width: 100%; border:1px solid #000000;position: relative;  "
					hover-class="uni-list-cell-hover"
					@click="onSelectedItem(index)"
					v-bind:class="item.selectItemClass"
				>
					{{ item.empName }}
					<checkbox style="min-width: 40upx; position: absolute;top: 0upx; right: 0upx;margin-right: 0upx; margin-top: 0upx;" :checked="item.checked" />
				</view>
			</view>
		</scroll-view>

		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<button type="default" style="padding: 0upx; width: 48%; margin-right: 10px; float: left;" @click="ondelete_user">删除</button>
			<button type="primary" style="padding: 0upx; float: none;" @click="onSave">保存</button>
		</page-foot>
	</view>
</template>

<script>
let workcenterSource = null;
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
			ScanstaffValue: '', //扫描人员
			ScanDeviceValue: '', //扫描设备
			allowScanPro: true, //是否允许扫描工序
			progNo: '', //页面ID
			proName: 'string', //工序
			backchecked: true, //返回的标识
			deviceNo: '',
			deviceName: '',
			proNo: '',
			proItemNo: '',
			old: {
				scrollTop: 0
			},
			scrollTop: 0, //中间滚动参数
			scrollHeight: 0, //中间滚动高度
			order: {
				//+单据信息  之后会请求新赋值多个数据例如details
				orgNo: '0',
				details: [],
				details_delete: [],
				entityState: 0
			},
			orderItemSelected: {
				empNo: ''
			}, //当前选中项

			padBinding: {
				configDevice: '',
				deviceName: '',
				proName: ''
			} //设备信息  //工序信息
		};
	},
	onShow() {},
	onLoad(option) {
		this.progNo = option.progNo || 'OPDA00009';
		console.log(this.progNo + '-----------' + date.format('yyyy/MM/dd hh:mm:ss'));
	},
	onReady() {
		util.getListHeight(this);
		/*
			var pda_padBinding = storage.get(consts.storageKeys.padBinding);
				if (!pda_padBinding) {
					uni.showModal({
						title: '提示',
						content: '未设置工作中心,前往设置？',
						success: function(res_mod) {
							if (res_mod.confirm) {
								uni.navigateTo({
									url: '../appconfig/set-workcenter'
								});
							}
						}
					});
				}
			*/
	},
	onBackPress(options) {
		/* 按下的是返回 */
		if (options.from === 'navigateBack') {
			return false;
		}
		//console.log(this.backchecked);
		var bool = false;
		for (var i = 0; i < this.order.details.length; i++) {
			var item = this.order.details[i];
			if (item.checked) {
				//有选中的
				//设置可以返回上一页
				bool = true;
			} else {
				this.backchecked = true;
			}

			item.checked = false; //有选中的设为不选中
		}
		if (this.backchecked && bool === false) {
			//console.log(this.backchecked);
			uni.navigateBack();
			return true;
		} else {
			return true;
		}
	},
	methods: {
		/* 选中的方法 */
		onSelectedItem(e) {
			//console.log(e)
			this.backchecked = false; //有按钮选中不能返回
			//console.log(this.backchecked)
			var bool,
				value = '';
			var items = this.order.details;
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				if (item.checked == undefined) {
					item.checked = false;
				}
				if (i == e) {
					bool = i;
					item.selectItemClass = 'uni-list-cell-selected';
					this.orderItemSelected = item;
					item.checked = !item.checked;
				} else {
					item.selectItemClass = '';
				}
			}
			this.order.details = [];
			this.order.details = items;
		},

		scroll(e) {
			//滚动
			this.old.scrollTop = e.detail.scrollTop;
		},
		onScrollTop(index) {
			//滚动定位
			//console.log('节点行' + (index / 4) + "%" + (index % 4));
			index = index - 1; //[0,1,2,3,4,5,6,7,8,9] 个数下标

			//if ((index / 4).toString().indexOf('.') >= 0) {
			//console.log('节点行' + (index / 4) + "%" + (index % 4));
			index = parseInt(index / 4);
			//console.log('行数下标' + index);
			//} else {
			//index = (index / 4); // 行数下标
			//console.log('行数下标' + index);
			//}
			//console.log('节点行' + index);
			let view = uni
				.createSelectorQuery()
				.in(this)
				.select('.scroll-view-item');
			view.boundingClientRect(data => {
				//console.log("得到布局位置信息" + JSON.stringify(data));
				//console.log("节点离页面顶部的距离为" + data.top);
				//console.log("节点离页面顶部的距离*index:" + index);

				this.scrollTop = this.old.scrollTop;
				this.$nextTick(function() {
					this.scrollTop = data.height * index; //hover-class="uni-list-cell-hover"
				});
			}).exec();
		},
		ondelete_user() {
			let _self = this;
			var details = [];
			for (var i = 0; i < this.order.details.length; i++) {
				var item = this.order.details[i];
				if (item.checked === true) {
					//删除放到另一个对象
					console.log('删除前---' + JSON.stringify(item));
					item.entityState_new = item.entityState;
					item.entityState = consts.entityState.deleted;
					_self.order.details_delete.push(item);
					console.log('删除---' + JSON.stringify(item));
				} else {
					details.push(item);
				}
			}
			this.order.details = [];
			this.order.details = details;
			console.log('this.order---' + JSON.stringify(this.order));
		},
		onall() {
			var items = this.order.details;
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				item.checked = true;
			}
			this.order.details = [];
			this.order.details = items;
		},
		onnooff() {
			var items = this.order.details;
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				item.checked = !item.checked;
			}
			this.order.details = [];
			this.order.details = items;
		},
		onScanstaff(e) {
			var _self = this;
			console.log(JSON.stringify(e));
			apis.emp_a({
				data: {
					empNo: e
				},
				success: res => {
					if (res.empNo) {
						let userInfo = storage.get(consts.storageKeys.login);
						var bool = false; //判断new_item是否不存在
						var new_item = {
							deviceNo: this.padBinding.configDevice,
							deviceName: this.padBinding.deviceName,
							proNo: this.padBinding.configPro,
							proItemNo: this.padBinding.proItemNo,
							proName: this.padBinding.proName,
							checked: false,
							//show: true,
							empNo: res.empNo,
							empName: res.empName,
							clockInTime: date.format('yyyy/MM/dd hh:mm:ss'),
							userNo: userInfo.userID,
							createDate: date.format('yyyy/MM/dd hh:mm:ss') || new Date().format('yyyy/MM/dd hh:mm:ss'),
							entityState: consts.entityState.added
						};
						for (var i = 0; i < this.order.details.length; i++) {
							var item = this.order.details[i];
							item.tagDetails = item.tagDetails || [];
							for (var j = 0; j < item.tagDetails.length; j++) {
								// 检查上次tagDetails
								let tag = item.tagDetails[j];
								if (tag.qrCode == e) {
									this.onScrollTop(i);
									uni.showModal({
										title: '提示',
										content: '人员已存在,是否要删除？',
										success: function(res_mod) {
											if (res_mod.confirm) {
												for (var i = 0; i < _self.order.details_delete.length; i++) {
													//删除中不能有重复的人员项，保存不准确数据
													var item_delete = _self.order.details_delete[i];
													if (item.empNo != item_delete.empNo && item.init === true) {
														item.entityState_new = item.entityState;
														item.entityState = consts.entityState.deleted;
														_self.order.details_delete.push(item);
													}
												}
												_self.order.details.splice(i, 1); //删除显示的人员
											} else if (res_mod.cancel) {
											}
										}
									});
									util.showAudio();
									return;
								}
							}
							if (item.empNo === new_item.empNo) {
								bool = true; //存在人员
								uni.showToast({
									title: '扫描成功'
								});
								item.tagDetails.push({
									//添加选中
									model: res,
									qrCode: e
								});
								this.onSelectedItem(i);
								this.onScrollTop(i);
								util.showScanedAudio();
								break;
							}
							for (var j = 0; j < _self.order.details_delete.length; j++) {
								//删除的数据集里存在扫描人员
								var det_item = _self.order.details_delete[j];
								if (det_item.empNo === new_item.empNo) {
									bool = true; //存在人员
									det_item.entityState = det_item.entityState_new;
									_self.order.details.push(det_item); //恢复
									_self.order.details_delete.splice(j, 1); // //删除删除
									uni.showToast({
										title: '扫描成功'
									});
									util.showScanedAudio();
									break;
								}
							}
						}
						if (this.order.details.length === 0 || bool === false) {
							//不存在人员列表中
							this.order.details.push(new_item);
							console.log(JSON.stringify(JSON.stringify(new_item)));
							uni.showToast({
								title: '扫描成功'
							});
							util.showScanedAudio();
						}
					} else {
						uni.showToast({
							title: '不存在！',
							icon: 'none'
						});
						util.showAudio();
					}
					console.log(JSON.stringify(JSON.stringify(this.order)));
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
		onScanDevice(e) {
			uni.showLoading({
				mask: true
			});
			var _self = this;
			apis.device_user_query({
				data: {
					//toLowerCase
					deviceNo: e.toLocaleString(),
					proItemNo: _self.padBinding.proItemNo
				},
				success: res1 => {
					//返回[空人员]取缓存设备工序，[值{}{}{}]绑定order.details显示人员设备工序
					console.log(util.outputLog(res1));
					if (res1.length == 0) {
						util.getPadBinding({
							data: {
								deviceNo: e,
								showTips: false
							},
							success: res2 => {
								console.log(util.outputLog(res2));
								_self.allowScanPro = res2 == null ? true : false; //是否允许扫描工序
								if (res2 == null) {
									apis.basic_DeviceGetModel({
										data: {
											deviceNo: e
										},
										success: res3 => {
											console.log(util.outputLog(res3));
											//判断当前 设备是否属于当前工单
											_self.padBinding.configDevice = res3.deviceNo;
											_self.padBinding.deviceName = res3.deviceName;
											_self.$refs.input_pro.setFocus();
										},
										failure: message => {
											_self.$refs.input_device.setFocus();
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
								} else {
									_self.padBinding = res2;
									util.showScanedAudio();
								}
							},
							failure: () => {
								util.showAudio();
								_self.padBinding = {
									proName: ''
								};
								_self.$refs.input_device.clear();
							}
						});
					} else {
						_self.allowScanPro = false; //是否允许扫描工序
						_self.order.details = [];
						for (var i = 0; i < res1.length; i++) {
							var item = res1[i];
							item.init = true;
							//console.log('res1扫描设备--' + JSON.stringify(item));
							_self.order.details.push(item);
						}
						_self.padBinding.configDevice = _self.order.details[0].deviceNo;
						_self.padBinding.deviceName = _self.order.details[0].deviceName;
						_self.padBinding.configPro = _self.order.details[0].proNo;
						_self.padBinding.proItemNo = _self.order.details[0].proItemNo;
						_self.padBinding.proName = _self.order.details[0].proName;
						util.showScanedAudio();
						_self.$refs.input_emp.setFocus();
					}
				},
				failure: message => {
					_self.$refs.input_device.setFocus();
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
		/**
		 * @description 扫描工序
		 * @param {Object} e
		 */
		onProScaned(e) {
			uni.showLoading({
				mask: true
			});
			var _self = this;
			apis.basic_ProcessModel({
				data: {
					proNo: e
				},
				success: res1 => {
					console.log(util.outputLog(res1));
					this.padBinding.configPro = res1.custNo;
					this.padBinding.proItemNo = res1.itemNo;
					this.padBinding.proName = res1.custName;
					if (this.padBinding.proName) {
						apis.device_user_query({
							data: {
								//toLowerCase
								deviceNo: _self.padBinding.configDevice,
								proItemNo: _self.padBinding.proItemNo
							},
							success: res2 => {
								_self.order.details = [];
								for (var i = 0; i < res2.length; i++) {
									var item = res2[i];
									item.init = true;
									_self.order.details.push(item);
								}
								if (res2.length > 0) {
									_self.padBinding.configDevice = _self.order.details[0].deviceNo;
									_self.padBinding.deviceName = _self.order.details[0].deviceName;
									_self.padBinding.configPro = _self.order.details[0].proNo;
									_self.padBinding.proItemNo = _self.order.details[0].proItemNo;
									_self.padBinding.proName = _self.order.details[0].proName;
									util.showScanedAudio();
									_self.$refs.input_emp.setFocus();
								}
							},
							failure: message => {
								this.$refs.input_pro.setFocus();
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
					}
				},
				failure: message => {
					this.$refs.input_pro.setFocus();
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
		onSave() {
			//校验统一上岗人员的设备和工序
			var details = this.order.details;
			var details_delete = this.order.details_delete;
			for (var i = 0; i < details.length; i++) {
				details[i].deviceNo = this.padBinding.configDevice;
				details[i].deviceName = this.padBinding.deviceName;
				details[i].proNo = this.padBinding.configPro;
				details[i].proItemNo = this.padBinding.proItemNo;
				details[i].proName = this.padBinding.proName;
				details[i].checked = false;
			}
			for (var i = 0; i < details_delete.length; i++) {
				var item = details_delete[i]; //应为不能将对象[]添加到对象[]会使数据解析不完整,这里用item，push加追已删除的数据。
				console.log('删除的数据' + JSON.stringify(item));
				if (item.init === true) {
					item.deviceNo = this.padBinding.configDevice;
					item.deviceName = this.padBinding.deviceName;
					item.proNo = this.padBinding.configPro;
					item.proItemNo = this.padBinding.proItemNo;
					item.proName = this.padBinding.proName;
					item.checked = false;
					details.push(item);
				}
			}
			this.order.details = [];
			this.order.details = details;
			console.log('res保存this.order.details--' + JSON.stringify(this.order.details));
			if (this.order.details.length <= 0) {
				uni.showToast({
					title: '请添加人员！！',
					icon: 'none'
				});
				return;
			}
			var _self = this;
			console.log(_self.order.details);
			uni.showLoading({
				mask: true
			});
			apis.device_user_edit({
				data: _self.order.details,
				success: res => {
					uni.showToast({
						title: '保存成功'
					});
					//初始化数据，（软件盘）
					util.dataInit(this);
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
		}
	}
};
</script>

<style></style>
