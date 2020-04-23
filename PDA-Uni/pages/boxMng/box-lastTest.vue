<!-- 尾箱核查 -->
<template>
	<view>
		<view id="viewHeader">
			<barcode-input ref="input_box" @onScaned="onBoxScaned" :focus="true" placeholder="请扫描外箱包装"></barcode-input>
			<barcode-input ref="input_part" @onScaned="onPartScaned" placeholder="请扫描料号"></barcode-input>
		</view>
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in order.tagDetails" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">料品编码:{{item.partItemNo}}</text>
								<text class="uni-title">料品名称:{{item.partName}}</text>
								<text class="uni-title">数量:{{item.sheetQty}}</text>
							</view>
							<view class="uni-triplex-right" style="min-width: 220upx;">
								<text class="uni-h5">已核查:{{item.isScaned | convertVal}}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<button type="primary" @click="onSave">保存</button>
		</page-foot>
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
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				order: {
					tagDetails: []
				}
			}
		},
		filters: {
			convertVal: function(value) {
				return value ? '✔' : '否'
			}
		},
		onReady() {
			util.getListHeight(this);
		},
		onBackPress(options) {
			return util.backPress(options, this.order.tagDetails.length > 0);
		},
		methods: {
			onBoxScaned(e) {
				//料品信息标签扫描完成
				uni.showLoading({
					mask: true
				});
				apis.boxfqc_boxScan({
					data: {
						boxQrCode: e
					},
					success: (res) => {
						let _self = this;
						console.log(util.outputLog(res));
						for (let i = 0; i < res.tagDetails.length; i++) {
							res.tagDetails[i].isScaned = false;
						}
						this.order = res;
						util.showScanedAudio();
						this.$refs.input_part.setFocus();
					},
					failure: (message) => {
						util.showAudio();
						this.$refs.input_box.setFocus();
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
			onPartScaned(e) {
				let _self = this;
				//料品信息标签扫描完成
				uni.showLoading({
					mask: true
				});
				apis.boxfqc_QRCodeAnalysis({
					data: {
						qrCode: e,
						enumBarCode: 5 //无 : 0, 料品内码 : 1, 料品编码 : 2, 储位 : 3, 储位所属仓库 : 4, 批次号 : 5, 序列号 : 6, 标签ID : 7, 箱号标签ID : 8, 客户标签ID : 9, 采购批号 : 10, 厂家生产批次 : 11, 订单批号 : 12, 报工ID : 13, 工序内码 : 14, 工序编码 : 15, 设备编码 : 16, 客户订单号 : 17, 客户料号 : 18, 客户箱标签 : 19
					},
					success: (res) => {
						console.log(util.outputLog(res));
						let index = -1;
						for (let i = 0; i < this.order.tagDetails.length; i++) {
							let item = this.order.tagDetails[i];
							if (item.tagId == res.tagId) {
								this.onScrollTop(i);
								if (item.isScaned) {
									uni.showToast({
										title: '当前标签已校验过了',
										icon: 'none'
									});
									util.showAudio();
									this.$refs.input_part.setFocus();
									return;
								}
								index = i;
								break;
							}
						}
						if (index == -1) {
							uni.showToast({
								title: '标签扫描错误，该标签不在箱子中',
								icon: 'none'
							});
							util.showAudio();
							_self.$refs.input_part.setFocus();
							return;
						} else {
							uni.showToast({
								title: '校验成功',
							});
							util.showScanedAudio();
							this.order.tagDetails[index].isScaned = true;
						}
					},
					failure: (message) => {
						util.showAudio();
					},
					complete: (status, message, content) => {
						this.$refs.input_part.setFocus();
						util.tryCatchApi({
							status: status,
							message: message
						});
						uni.hideLoading();
					}
				})
			},
			onSave() {
				if (this.order.tagDetails.length == 0) {
					uni.showToast({
						title: '请扫描外箱',
						icon: 'none'
					})
					util.showAudio();
					this.$refs.input_box.setFocus();
					return;
				}
				let index = -1;
				for (let i = 0; i < this.order.tagDetails.length; i++) {
					let item = this.order.tagDetails[i]
					if (!item.isScaned) {
						index = i;
						break;
					}
				}
				if (index != -1) {
					this.onScrollTop(index);
					uni.showModal({
						title: '提示',
						content: '还有物料没有扫描,是否继续操作？',
						success: function(res_mod) {
							if (res_mod.confirm) {} else if (res_mod.cancel) {
								this.onSave(1)
							}
						}
					});
					util.showAudio();
					this.$refs.input_box.setFocus();
				} else {
					this.onSave1(0)
				}
			},
			onSave1(boxSw) {
				uni.showLoading({
					mask: true
				});
				apis.boxOpen_post({
					data: {
						boxTagIds: this.order.tagId,
						boxSw: boxSw //0.封箱 1.开箱
					},
					success: (res) => {
						uni.showToast({
							title: '操作完成',
							icon: 'none',
							mask: true
						})
						util.dataInit(this);
						util.showScanedAudio();
						this.$refs.input_box.setFocus();
					},
					failure: (message) => {
						util.showAudio();
					},
					complete: (status, message, content) => {
						this.$refs.input_box.setFocus();
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
				let items = util.clone(this.order.tagDetails);
				for (var i = 0; i < items.length; i++) {
					var item = items[i];
					if (i == e) {
						item.selectItemClass = 'uni-list-cell-selected';
					} else {
						item.selectItemClass = '';
					}
				}
				this.order.tagDetails = items;
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
