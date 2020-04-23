<!--  华为标签检验 明细 -->

<template>
	<view>
		<view id="viewHeader">
			<!--扫描 -->
			<barcode-input ref="input_part" @onScaned="onPartScaned" :focus="true" placeholder="扫内部标签"></barcode-input>
			<barcode-input ref="input_ASN" @onScaned="onhwPartScaned" placeholder="扫华为标签"></barcode-input>
		</view>
		<!-- 显示明细 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view style="text-align: center;height: 35upx;border-bottom: #0FAEFF dotted 1upx;line-height: 35upx; font-size: 22upx;">内部物料</view>
			<view class="uni-list-cell" style="text-align: center;height: 35upx;line-height: 35upx; font-size: 22upx;">
				<view class="flex-item">总数:{{ order_sum.details.sum }}</view>
				<view class="flex-item">已扫:{{ order_sum.details.scanQty }}</view>
				<view class="flex-item">未扫:{{ order_sum.details.lastScanQty }}</view>
			</view>

			<view class="uni-list">
				<block v-for="(item, index) in order.details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)" v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">料号:{{ item.partItemNo }}</text>
								<text class="uni-title">料品名称:{{ item.partName }}</text>
								<text class="uni-title">客户料号:{{ item.cuPartNo }}</text>
								<text class="uni-title">数量: {{ item.sheetQty }}</text>
							</view>
							<view class="uni-triplex-right">
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">单位:{{ item.unitName }}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">已扫数量:{{ item.scanQty }}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">未扫数量:{{ item.lastScanQty }}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
			<view style="text-align: center;height: 35upx;border-bottom: #0FAEFF dotted 1upx;line-height: 35upx; font-size: 22upx;">ASN</view>
			<view style="text-align: center;height: 35upx;line-height: 35upx; font-size: 22upx;">
				<view class="uni-list-cell" style="text-align: center;height: 35upx;line-height: 35upx; font-size: 22upx;">
					<view class="flex-item">总数:{{ order_sum.hwASN.sum }}</view>
					<view class="flex-item">已扫:{{ order_sum.hwASN.scanQty }}</view>
					<view class="flex-item">未扫:{{ order_sum.hwASN.lastScanQty }}</view>
				</view>
			</view>
			<view class="uni-list">
				<block v-for="(item, index) in order.hwASN" :key="index">
					<view class="uni-list-cell scroll-view-item1" hover-class="uni-list-cell-hover">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">pkgId:{{ item.pkgId }}</text>
								<text class="uni-title">料号:{{ item.pn }}</text>
								<text class="uni-title">数量:{{ item.qty }}</text>
							</view>
							<view class="uni-triplex-right">
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">单位:{{ item.unitNo }}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">华为校验:{{ item.m_ishwASN ? '已验' : '未验' }}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm"><button type="primary" style="display: block; float: none;" @click="onnavigateBack()">校验完成</button></page-foot>
	</view>
</template>

<script>
import barcodeInput from '../../components/barcode-input/barcode-input.vue';
import apis from '../../common/apiService.js';
import consts from '../../common/consts.js';
import storage from '../../common/storage.js';
import util from '../../common/util.js';
import { mapState } from 'vuex';
export default {
	components: {
		barcodeInput
	},
	data() {
		return {
			progNo: '', //页面ID
			old: {
				scrollTop: 0
			},
			scrollTop: 0,
			scrollHeight: 0,
			order: {},
			hwtagscan: {},
			orderItemSelected: {}, //当前选中项
			order_sum: {/* 内部总和，ASN总和*/
				details: {
					sum: 0,
					scanQty: 0,
					lastScanQty: 0
				},
				hwASN: {
					sum: 0,
					scanQty: 0,
					lastScanQty: 0
				}
			},
			scan_qrCode: []
		};
	},
	onLoad(option) {
		this.progNo = option.progNo;
		
		this.order = this.urldata; /* data.details; data.hwASN;data_hwtagscan */
		this.hwtagscan =this.urldata.data_hwtagscan; //传递扫描的数据
		var _self=this;
		console.log(util.outputLog(_self.urldata))
	},
	onReady() {
		util.getListHeight(this);
		if (typeof this.hwtagscan == 'object') {
			this.arr_split(this.order.details, this.hwtagscan);
		}
		for (var i = 0; i < this.order.details.length; i++) {
			//定位更新位置
			this.onScrollTop(i);
			this.updateScanList();
		}
		if (this.order_sum.details.lastScanQty == 0 ) {
			/* 内部标签扫完了 */
			this.$refs.input_ASN.setFocus();
		}
	},
	onBackPress(options) {
		return util.backPress(options, this.order_sum.details.lastScanQty != this.order_sum.hwASN.lastScanQty);
	},
	computed: mapState(['urldata']),
	methods: {
		onPartScaned(e) {
			var _self = this;
			var m_isqrCode = false;
			for (var i = 0; i < this.scan_qrCode.length; i++) {
				var qrCode = this.scan_qrCode[i];
				if (qrCode == e) {
					m_isqrCode = true;
				}
			}
			if (m_isqrCode) {
				uni.showToast({
					title: '该标签已扫!!!',
					icon: 'none'
				});
				util.showAudio();
				return;
			} else {
				this.scan_qrCode.push(e);
			}

			uni.showLoading({
				mask: true
			});
			apis.OpenMes_mesqrcodeinout({
				data: {
					qrCode: e
				},
				success: res => {
					var sum = this.order_sum.details.sum;
					if (res.tagDetails) {
						//有外箱是两种情况
						res.tagDetails.forEach(function(item) {
							if (Number(item.sheetQty) > sum) {
								//可能是外箱标签和内箱标签
								//外箱标签拆分到pc操作
								//内箱标签拆分到pda拆分处理
								if (sum == 0) {
									uni.showToast({
										title: '(内部)已扫描完毕!!!',
										icon: 'none'
									});
									util.showAudio();
									return;
								}
								uni.showToast({
									title: '(内部)数量较大剩余:' + util.floatObj.subtract(Number(item.sheetQty), sum) + '请拆分处理.',
									icon: 'none'
								});
								util.showAudio();
								return;
							}
							if (_self.order.details[0].scantagDetails.length > 0) {
								//长度大于0校验客户料号一致，否则是第一次不校验
								for (var i = 0; i < _self.order.details.length; i++) {
									var detail = _self.order.details[i];
									if (detail.scantagDetails[0].partItemNo == item.partItemNo) {
										//扫描的物料是校验的物料
										if (detail.lastScanQty <= 0) {
											continue;
										}
										if (detail.scantagDetails[0].suPartNo != item.suPartNo) {
											//客户料号不一致
											util.showAudio();
											uni.showToast({
												icon: 'none',
												title: '客户料号不一致!!!'
											});
											return;
										}
										_self.arr_split(_self.order.details, item);

										util.showScanedAudio();
									} else {
										util.showAudio();
										uni.showToast({
											icon: 'none',
											title: '扫描的不是校验的物料!!!'
										});
										return;
									}
									//定位更新位置
									_self.onScrollTop(i);
									_self.updateScanList();
								}
							} else {
								//第一次不校验客户料号
								if (item.suPartNo != '') {
									_self.arr_split(_self.order.details, item);
									/* for (var i = 0; i < _self.order.details.length; i++) {
										//定位更新位置
										_self.onScrollTop(i);
										_self.updateScanList();
									} */
									util.showScanedAudio();
								} else {
									util.showAudio();
									uni.showToast({
										icon: 'none',
										title: '扫描的物料没有客户料号!!!'
									});
									return;
								}
							}
						});
					} else {
						if (Number(res.sheetQty) > sum) {
							//可能是外箱标签和内箱标签
							//外箱标签拆分到pc操作
							//内箱标签拆分到pda拆分处理
							if (sum == 0) {
								uni.showToast({
									title: '(内部)已扫描完毕!!!',
									icon: 'none'
								});
								util.showAudio();
								return;
							}
							uni.showToast({
								title: '(内部)数量较大剩余:' + util.floatObj.subtract(Number(res.sheetQty), sum) + '请拆分处理.',
								icon: 'none'
							});
							util.showAudio();
							return;
						}
						if (_self.order.details[0].scantagDetails.length > 0) {
							//长度大于0校验客户料号一致，否则是第一次不校验
							for (var i = 0; i < _self.order.details.length; i++) {
								var detail = _self.order.details[i];
								if (detail.scantagDetails[0].partItemNo == res.partItemNo) {
									//扫描的物料是校验的物料
									if (detail.lastScanQty <= 0) {
										continue;
									}
									if (detail.scantagDetails[0].suPartNo != res.suPartNo) {
										//客户料号不一致
										util.showAudio();
										uni.showToast({
											icon: 'none',
											title: '客户料号不一致!!!'
										});
										return;
									}
									_self.arr_split(_self.order.details, res);

									util.showScanedAudio();
								} else {
									util.showAudio();
									uni.showToast({
										icon: 'none',
										title: '扫描的不是校验的物料!!!'
									});
									return;
								}
								//定位更新位置
								_self.onScrollTop(i);
								_self.updateScanList();
							}
						} else {
							//第一次不校验客户料号
							if (res.suPartNo != '') {
								_self.arr_split(_self.order.details, res);

								util.showScanedAudio();
							} else {
								util.showAudio();
								uni.showToast({
									icon: 'none',
									title: '扫描的物料没有客户料号!!!'
								});
								return;
							}
						}
					}
				},
				failure: message => {
					util.showAudio();
					this.$refs.input_part.setFocus();
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
		onhwPartScaned(e) {
			var _self = this;
			console.log(_self.order);
			var m_isqrCode = false;
			for (var i = 0; i < this.scan_qrCode.length; i++) {
				var qrCode = this.scan_qrCode[i];
				if (qrCode == e) {
					m_isqrCode = true;
				}
			}
			if (m_isqrCode) {
				uni.showToast({
					title: '该标签已扫!!!',
					icon: 'none'
				});
				util.showAudio();
				return;
			} else {
				this.scan_qrCode.push(e);
			}
			var sum = _self.order_sum.details.sum;
			var pkgId_bool = false;
			for (var i = 0; i < _self.order.hwASN.length; i++) {
				var item = _self.order.hwASN[i];
				console.log(item.pkgId + '====' + e);
				if (item.pkgId == e) {
					console.log(item.qty + '===' + sum);
					if (item.qty <= sum) {
						//上线要取消注释
						uni.showToast({
							icon: 'none',
							title: '扫描成功'
						});
						item.m_ishwASN = true;
						util.showScanedAudio();
						_self.updateScanList();
						break;
					} else {
						uni.showToast({
							icon: 'none',
							title: '未达到客户需求数量！'
						});
						util.showAudio();
						break;
					}
					pkgId_bool = false;
				} else {
					pkgId_bool = true;
				}
			}
			if (pkgId_bool) {
				uni.showToast({
					icon: 'none',
					title: '没有对应的pkgId！'
				});
				util.showAudio();
			}
		},
		arr_split(arr, scan) {
			var _self = this;
			if (scan.tagDetails) {
				//有两种情况
				for (var j = 0; j < scan.tagDetails.length; j++) {
					var item = scan.tagDetails[j];
					var last = item.sheetQty;
					/* 先取标签数量是相等的 */
					for (var i = 0; i < arr.length; i++) {
						console.log('先取标签数量是相等的==========' + arr[i].lastScanQty == last);
						if (arr[i].lastScanQty == last) {
							var new_scan = util.clone(item);
							 new_scan.entityState = consts.entityState.added;
							_self.scantagDetails_push(new_scan, i);
							last = 0;
							break;
						}
					}
					/* 多个 */
					for (var i = 0; i < arr.length; i++) {
						var new_scan = util.clone(item);
                        new_scan.entityState = consts.entityState.added;
						if (arr[i].lastScanQty >= last && last != 0) {
							console.log('多个====arr[i].lastScanQty >= last=================');
							new_scan.sheetQty = last;
							_self.scantagDetails_push(new_scan, i);
							last = 0;
							break;
						} else if (last > arr[i].lastScanQty) {
							console.log('多个=====last > arr[i].lastScanQty========');
							last = last - arr[i].lastScanQty;
							new_scan.sheetQty = arr[i].lastScanQty;
							_self.scantagDetails_push(new_scan, i);
						}
					}
				}
			} else {
				var last = Number(scan.sheetQty);
				/* 先取标签数量是相等的 */
				for (var i = 0; i < arr.length; i++) {
					console.log('先取标签数量是相等的==========');
					if (arr[i].lastScanQty == last) {
						var new_scan = util.clone(scan);
						 new_scan.entityState = consts.entityState.added;
						_self.scantagDetails_push(new_scan, i);
						last = 0;
						break;
					}
				}
				/* 多个 */
				for (var i = 0; i < arr.length; i++) {
					var new_scan = util.clone(scan);
                    new_scan.entityState = consts.entityState.added;
					if (arr[i].lastScanQty >last && last != 0) {
						console.log('多个====arr[i].lastScanQty >= last=================');
						new_scan.sheetQty = last;
						_self.scantagDetails_push(new_scan, i);
						last = 0;
						break;
					} else if (last > arr[i].lastScanQty) {
						console.log('多个=====last > arr[i].lastScanQty========');
						last = last - arr[i].lastScanQty;
						new_scan.sheetQty = arr[i].lastScanQty;
						_self.scantagDetails_push(new_scan, i);
					}
				}
			}
		},
		scantagDetails_push(new_scan, i) {
			new_scan.qrCode = this.qrCode;
			this.order.details[i].scantagDetails = this.order.details[i].scantagDetails || [];
			this.order.details[i].scantagDetails.push(new_scan);
			this.order.details[i].entityState = consts.entityState.modified;
			//定位更新位置
			this.onScrollTop(i);
			this.updateScanList();
		},
		onnavigateBack() {
			var _self = this;
			if (_self.order_sum.details.lastScanQty != 0 || _self.order_sum.hwASN.lastScanQty != 0) {
				uni.showModal({
					title: '该标签未扫完',
					content: '是否返回?',
					success: function(res_mod) {
						if (res_mod.confirm) {
							storage.set(consts.storageKeys.hwDetails, _self.order);
							uni.navigateBack();
						} else if (res_mod.cancel) {
							return;
						}
					}
				});
				util.showAudio();
			} else {
				_self.order.details.forEach(function(item) {
					if (item.lastScanQty > 0) {
						item.tagCheckSw = 0;
					} else if (item.lastScanQty == 0) {  /* 校验完成*/
						item.tagCheckSw = 1;
					}else if (item.lastScanQty < 0){ /* 保证不会出现负数*/
						uni.showModal({
							title: '警告',
							content: '单据异常请联系管理员',
							showCancel:false,
							success: function(res_mod) {
								if (res_mod.confirm) {
								
								} else if (res_mod.cancel) {
								
								}
							}
						});
					}
				});
		
				storage.set(consts.storageKeys.hwDetails, _self.order);
				uni.navigateBack();
			}
		},
		updateScanList() {
			//更新列表结果
			var _self = this;
			var scanQty = 0;
			this.orderItemSelected.scantagDetails.forEach(function(item1, i) {
				scanQty = util.floatObj.add(scanQty, item1.sheetQty);
			});
			this.orderItemSelected.scanQty = scanQty;
			this.orderItemSelected.lastScanQty = util.floatObj.subtract(this.orderItemSelected.sheetQty, scanQty);
			var hwselected = util.clone(this.details); //所以先复制一份，（搞绝一点，赋值不要直接引用赋值,最好是克隆根对象）
			this.details = hwselected; //重新给他赋值，就更新好了
			_self.order_sum.details = {
				sum: 0,
				scanQty: 0,
				lastScanQty: 0
			};
			this.order.details.forEach(function(item, index) {
				_self.order_sum.details.sum = util.floatObj.add(_self.order_sum.details.sum, item.sheetQty);
				_self.order_sum.details.scanQty = util.floatObj.add(_self.order_sum.details.scanQty, item.scanQty);
				_self.order_sum.details.lastScanQty = util.floatObj.add(_self.order_sum.details.lastScanQty, item.lastScanQty);
			});
			_self.order_sum.hwASN = {
				sum: 0,
				scanQty: 0,
				lastScanQty: 0
			};
			this.order.hwASN.forEach(function(item, index) {
				_self.order_sum.hwASN.sum = util.floatObj.add(_self.order_sum.hwASN.sum, item.qty);
				if (item.m_ishwASN) {
					_self.order_sum.hwASN.scanQty = util.floatObj.add(_self.order_sum.hwASN.scanQty, item.qty);
				} else {
					_self.order_sum.hwASN.lastScanQty = util.floatObj.add(_self.order_sum.hwASN.lastScanQty, item.qty);
				}
			});
			var order_sum = util.clone(_self.order_sum);
			_self.order_sum = order_sum;
		},
		/* 选中的方法 */
		onSelectedItem(e) {
			for (var i = 0; i < this.order.details.length; i++) {
				var item = this.order.details[i];
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
				this.$nextTick(function() {
					this.scrollTop = data.height * index;
				});
			}).exec();
		}
	}
};
</script>

<style></style>
