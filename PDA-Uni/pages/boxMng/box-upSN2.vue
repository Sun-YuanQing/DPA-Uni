<!--装箱 (序列号) 不打印外箱-->
<template>
	<view>
		<view id="viewHeader">
			<barcode-input ref="input_order" :focus="true" @onScaned="onScaned" placeholder="扫描工单"></barcode-input>
			<barcode-input ref="input_sn" @onScaned="onSNScaned" placeholder="扫描序列号"></barcode-input>
			<view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						工单号:
					</view>
					<view class="uni-list-cell-db">
						{{order.purLot}}
					</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						料号:
					</view>
					<view class="uni-list-cell-db">
						{{order.partItemNo}}
					</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						物料名称:
					</view>
					<view class="uni-list-cell-db">
						{{ order.partName }}
					</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						批次*:
					</view>
					<view class="uni-list-cell-db">
						<input ref="input_inLot" :focus="boxinLotFocus" v-model="boxinLot" type="text" />
					</view>
				</view>
			</view>
		</view>
		<!-- 显示入库单明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">订单批号:{{item.ordLot}}</text>
								<text class="uni-title">料品编码:{{item.partNo}}</text>
								<text class="uni-title">料品名称:{{item.partName}}</text>
								<text class="uni-title">标签ID:{{item.tagId}}</text>
							</view>
							<view class="uni-triplex-right">
								<text class="uni-h5">料品规格:{{item.partSpec}}</text>
								<text class="uni-h5" style="min-width: 220upx;margin-left: -300upx;">数量:{{item.sheetQty}}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<button type="primary" @click="onSave">封箱</button>
		</page-foot>
		<!-- 扫描校验 -->
		<uni-popup-modal :show="showScanTag" title="扫描外箱标签" :showBtmBtn="false">
			<barcode-input ref="input_scan" @onScaned="onTagScaned" placeholder="请扫描外箱标签"></barcode-input>
		</uni-popup-modal>
	</view>
</template>

<script>
	import uniPopupModal from '../../components/uni-popup-modal/uni-popup-modal.vue'
	import printButton from "../../components/label-print/print-button.vue"
	import uniPopup from '../../components/uni-popup/uni-popup.vue';
	import barcodeInput from '../../components/barcode-input/barcode-input.vue'; //扫码组件

	import apis from '../../common/apiService.js'; //系统api
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js'; //常用功能
	export default {
		components: {
			barcodeInput,
			uniPopup,
			uniPopupModal,
			printButton
		},
		data() {
			return {
				reportModel: {
					progNo: '', //页面ID
					showReport: false,
					isMultiPrint: true,
					dataSource: [],
					isNeedValidTag: true //是否需要校验标签
				},
				boxinLot: '',
				boxinLotFocus: false,
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				order: {
					purLot: '',
					partItemNo: '',
					partName: '',
				}, //工单
				details: [],
				showScanTag: false
			}
		},
		onLoad(option) {
			this.reportModel.progNo = option.progNo;
		},
		onReady() {
			util.getListHeight(this);
		},
		onBackPress(options) {
			return util.backPress(options, this.details.length > 0);
		},
		methods: {
			onScaned(e) {
				//扫描工单批号
				uni.showLoading({
					mask: true
				});
				apis.boxfqc_getDetail({
					data: {
						moLot: e
					},
					success: (res) => {
						console.log(res); //打印日志
						this.order = res;
						uni.showToast({
							title: '扫描成功',
							icon: 'none'
						})
						util.showScanedAudio();
						this.$refs.input_sn.setFocus();
					},
					failure: (message) => {
						util.showAudio();
						this.$refs.input_order.setFocus();
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
			onSNScaned(e) {
				//料品信息标签扫描完成
				uni.showLoading({
					mask: true
				});
				apis.Pda_pdaserialinboxvaild({
					data: {
						qrCode: e
					},
					success: (res) => {
						//校验批次、料号和数量是否正确
						//校验是否重复扫描
						console.log(res);
						if (res.inBoxNo.trim().length > 0) {
							uni.showToast({
								title: '该标签已在 ' + res.inBoxNo + ' 箱中！',
								icon: "none"
							});
							return;
						}
						var _self = this;
						for (var i = 0; i < this.details.length; i++) {
							let item = this.details[i];
							if (item.tagId == res.tagId) {
								_self.onScrollTop(i);
								uni.showModal({
									title: '提示',
									content: '该标签已扫描,是否要删除',
									success: function(res_mod) {
										if (res_mod.confirm) {
											_self.details.splice(i, 1);
										} else if (res_mod.cancel) {}
									}
								});
								util.showAudio();
								return;
							}
							if (item.poMoSoLot != res.poMoSoLot) {
								uni.showToast({
									title: '工单号不一致',
									icon: "none"
								});
								util.showAudio();
								return;
							}
							if (item.binWhNo != res.binWhNo) {
								uni.showToast({
									title: '所在仓库不一致',
									icon: "none"
								});
								util.showAudio();
								return;
							}
						}
						this.order.totalQty = this.order.totalQty || 0; //已扫数量
						if (this.order.boxPackingQty == 0 || this.order.boxPackingQty >= util.floatObj.add(this.order.totalQty, res.sheetQty)) {
							res.qrCode = e;
							this.details.push(res);
							this.onScrollTop(this.details.length - 1);
							this.order.totalQty = util.floatObj.add(res.sheetQty, this.order.totalQty);
							uni.showToast({
								title: '校验成功'
							});
						} else {
							uni.showToast({
								title: '超出装箱数量',
								icon: "none"
							});
							util.showAudio();
							return;
						}
						util.showScanedAudio();
					},
					failure: (message) => {
						util.showAudio();
					},
					complete: (status, message, content) => {
						this.$refs.input_sn.setFocus();
						util.tryCatchApi({
							status: status,
							message: message
						});
						uni.hideLoading();
					}
				})
			},
			/* 保存 */
			onSave() {
				let _self = this;
				if (!_self.order) { //工单
					uni.showToast({
						title: '请扫描工单',
						icon: "none"
					});
					util.showAudio();
					_self.$refs.input_order.setFocus();
					return;
				}
				if (_self.details.length == 0) {
					uni.showToast({
						title: '请扫描内包装',
						icon: "none"
					});
					_self.$refs.input_sn.setFocus();
					return;
				}
				if (_self.boxinLot.trim().length <= 0) {
					uni.showToast({
						title: '请输入批号',
						icon: "none"
					});
					util.showAudio();
					this.boxinLotFocus = true;
					return;
				}
				/* if (Number(_self.order.boxPackingQty) > Number(_self.order.totalQty) || Number(_self.order.minPackingQty) > Number(
						_self.order.totalQty)) {
					uni.showToast({
						title: '包装数量为' + _self.order.minPackingQty + '到' + _self.order.boxPackingQty,
						icon: "none"
					});
					_self.$refs.input_sn.setFocus();
					return;
				} */
				this.showScanTag = true;
				this.$refs.input_scan.setFocus();
			},
			/**
			 * @param {Object} 
			 */
			onBoxScanSave(scanBoxTagModel) {
				var _self = this;
				//扫描箱号保存 
				console.log("scanBoxTagModel: " + JSON.stringify(scanBoxTagModel));
				scanBoxTagModel.bzType = 1 //包装类别 0、内箱( 默认) 1、外箱 2、卡板
				scanBoxTagModel.purLot = this.order.purLot;
				scanBoxTagModel.inLot = this.boxinLot; 
				scanBoxTagModel.entityState = consts.entityState.added;
				scanBoxTagModel.tagDetails = scanBoxTagModel.tagDetails || [];


				for (let i = 0; i < this.details.length; i++) {
					let item = this.details[i];
					item.boxTagId = scanBoxTagModel.tagId;
					item.sheetLot = scanBoxTagModel.tagId;
					item.purLot = this.order.purLot;
					item.cuNo = scanBoxTagModel.cuNo;
					item.cuItemNo = scanBoxTagModel.cuItemNo;
					item.cuName = scanBoxTagModel.cuName;
					item.cuOrdNo = scanBoxTagModel.cuOrdNo;
					item.suPartNo = scanBoxTagModel.suPartNo;
					item.entityState = consts.entityState.added;
					scanBoxTagModel.tagDetails.push(item);
				} 
				console.log(util.outputLog(scanBoxTagModel));
				// return;
				uni.showLoading({
					mask: true
				});
				apis.Pda_pdaaddboxbarcodeserial({
					data: scanBoxTagModel,
					success: (res) => {
						uni.showToast({
							title: '保存成功!'
						});
						util.dataInit(this);
						util.showScanedAudio();
						this.$refs.input_order.setFocus();
					},
					failure: (message) => {
						util.showAudio();
						this.$refs.input_sn.setFocus();
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
			onTagScaned(e) {
				var that = this;
				//扫描箱标签
				uni.showLoading({
					mask: true
				});
				apis.basic_QRCodeAnalysis({
					data: {
						qrCode: e
					},
					success: (res) => {
						//判断物料&制造单号&数量是否一致
						/* if (that.order.purLot != res.poMoSoLot) {
							uni.showToast({
								title: '工单号不一致',
								icon: "none"
							});
							util.showAudio();
							return;
						}
						if (that.order.binWhNo != res.binWhNo) {
							uni.showToast({
								title: '所在仓库不一致',
								icon: "none"
							});
							util.showAudio();
							return;
						} */
						if (res.sheetQty != that.order.totalQty) {
							uni.showToast({
								title: '箱子数量与扫描数量不一致',
								icon: "none"
							});
							util.showAudio();
							return;
						}
						that.onBoxScanSave(res);
					},
					failure: (message) => {
						util.showAudio();
					},
					complete: (status, message, content) => {
						that.$refs.input_scan.setFocus();
						util.tryCatchApi({
							status: status,
							message: message
						});
						uni.hideLoading();
					}
				})
			},
			/* 选中的方法 */
			onSelectedItem(e) {
				let items = util.clone(this.details);
				for (var i = 0; i < items.length; i++) {
					var item = items[i];
					if (i == e) {
						item.selectItemClass = 'uni-list-cell-selected';
					} else {
						item.selectItemClass = '';
					}
				}
				this.details = items;
			},
			scroll(e) { //滚动
				this.old.scrollTop = e.detail.scrollTop;
			},
			onScrollTop(index) {
				//滚动定位
				this.onSelectedItem(index);
				let view = uni.createSelectorQuery().in(this).select(".scroll-view-item");
				view.boundingClientRect(data => {
					this.scrollTop = this.old.scrollTop
					this.$nextTick(function() {
						if (data == null) return;
						this.scrollTop = data.height * index;
					});
				}).exec();
			}
		}
	}
</script>

<style>
</style>
