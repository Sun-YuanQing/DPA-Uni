<!-- OQC检验明细 -->
<template>
	<view>
		<view id="viewHeader">
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">
					出货单号:
				</view>
				<view class="uni-list-cell-db">
					{{order.sheetNo}}
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
			<barcode-input ref="input_scanBox" @onScaned="onScanBox" focus placeholder="请扫描外箱条码"></barcode-input>
			<barcode-input ref="input_part" @onScaned="onPartScaned" placeholder="请扫描料号"></barcode-input>
		</view>
		<!-- 显示入库单明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in scanBoxModel.tagDetails" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">标签ID:{{item.tagId}}</text>
							</view>
							<view class="uni-triplex-right" style="min-width: 220upx;">
								<text class="uni-h5">数量:{{item.sheetQty}}</text>
								<text class="uni-h5">已扫描:{{item.isScan}}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>

		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<button type="primary" style="display: block; float: none;" @click="onCloseBox">封箱</button>
			<view style="border-top: 1px solid #ccc; padding: 5px;" id="viewBtm">
				<button type="default" style="width: 160px; margin-right: 10px; float: left;" @click="onAgree(true)">合格</button>
				<button type="default" style="display: block; float: none;" @click="onAgree(false)">不合格</button>
			</view>
		</page-foot>
	</view>
</template>

<script>
	import barcodeInput from '../../components/barcode-input/barcode-input.vue' //扫码组件

	import apis from '../../common/apiService.js'; //系统api
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js'; //常用功能
	import { mapMutations } from 'vuex';
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
					"sheetNo": "",
					"sheetTypeName": "",
					"sheetDate": "",
					"citemNo": "",
					"custName1": "",
					"details": [],
					"entityState": 0
				},
				scanBoxModel: null
			}
		},
		onLoad(option) {
			let sheetLot = option.sheetLot || '';
			this.init(sheetLot);
		},
		onReady() {
			util.getListHeight(this); 
		},
		onBackPress(options) {
			return util.backPress(options, this.details.length > 0);
		},
		methods: {
			...mapMutations(['pageIO_true']),
			init(e) {
				uni.showLoading({
					mask: true
				})
				apis.sale_getDetails({
					data: {
						sheetLot: e
					},
					success: (res) => {
						console.log(JSON.stringify(res))
						this.order = res;
					},
					complete: (status, message, content) => {
						this.$refs.input_scanBox.setFocus();
						util.tryCatchApi({
							status: status,
							message: message
						});
						uni.hideLoading();
					}
				})
			},
			onScanBox(e) {
				uni.showLoading({
					mask: true
				})
				apis.boxfqc_boxScan({
					data: {
						boxQrCode: e
					},
					success: (res) => {
						this.scanBoxModel = res;
						for (var i = 0; i < this.scanBoxModel.tagDetails.length; i++) {
							this.scanBoxModel.tagDetails[i].isScan = false;
							this.scanBoxModel.tagDetails[i].isScanName = "否";
						}
						util.showScanedAudio();
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
			onPartScaned(e) {
				uni.showLoading({
					mask: true
				});
				//料品信息标签扫描完成
				if (this.scanBoxModel == null) {
					uni.showToast({
						title: '请先扫描外箱标签',
						icon: 'none'
					});
					this.$refs.input_scanBox.setFocus();
					return;
				}
				apis.basic_QRCodeAnalysis({
					data: {
						qrCode: e
					},
					success: (res) => {
						let index = -1;
						for (var i = 0; i < this.scanBoxModel.tagDetails.length; i++) {
							let item = this.scanBoxModel.tagDetails[i];
							if (item.tagId == res.tagId) {
								if (item.isScan) {
									uni.showToast({
										title: '标签已扫描',
										icon: "none"
									});
									this.onScrollTop(i);
								}
								index = i;
								break;
							}
						}
						if (index == -1) {
							uni.showToast({
								title: '标签扫描错误',
								icon: "none"
							});
							util.showAudio();
						} else {
							let item = this.scanBoxModel.tagDetails[index];
							this.scanBoxModel.tagDetails[i].isScan = true;
							this.scanBoxModel.tagDetails[i].isScanName = "是";
							this.onScrollTop(index);
							util.showScanedAudio();
						}
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
				});
			},
			onCloseBox() {
				//封箱
				//更新this.order tagDetails 明细的状态
				for (let i = 0; i < this.scanBoxModel.tagDetails.length; i++) {
					if (!this.scanBoxModel.tagDetails[i].isScan) {
						this.onScrollTop(i);
						uni.showToast({
							title: '还有未校验的物料',
							icon: 'none'
						});
						return;
					}

					//标签 销售出货单 标签状态为已校验
					for (let j = 0; j < this.order.tagDetails.length; j++) {
						if (this.order.tagDetails[i].tagId == this.scanBoxModel.tagDetails[i].tagId) {
							this.order.tagDetails[i].isScan = true;
						}
					}
				}
				uni.showToast({
					title: '封箱成功，请校验下一箱！'
				});
				this.scanBoxModel = null;
				this.$refs.input_scanBox.setFocus();
			},

			onAgree(e) {
				if (this.scanBoxModel != null) {
					uni.showToast({
						title: '请先封箱',
						icon: 'none'
					});
					return;
				}
				//保存
				for (let i = 0; i < this.order.tagDetails.length; i++) {
					if (!this.order.tagDetails[i].isScan) {
						uni.showToast({
							title: '还有未校验的物料',
							icon: 'none'
						});
						this.$refs.input_scanBox.setFocus();
						return;
					}
				}
				let userInfo = storage.get(consts.storageKeys.login);
				this.order.oqcSpcSw = e ? 1 : 0; //合格1 不合格0
				this.order.oqcSpcEmp = userInfo.userID;
				this.order.entityState = consts.entityState.modified;
				uni.showLoading({
					title: '加载中',
					mask: true
				});
				var _self=this;
				apis.sale_save_put({
					data: this.order,
					success: (res) => {
						uni.showToast({
							title: '保存成功'
						});
						util.dataInit(this);
						_self.pageIO_true();
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
			scroll(e) { //滚动
				this.old.scrollTop = e.detail.scrollTop
			},
			onScrollTop(index) {
				//滚动定位
				this.onSelectedItem(index);
				let view = uni.createSelectorQuery().in(this).select(".scroll-view-item");
				view.boundingClientRect(data => {
					this.scrollTop = this.old.scrollTop
					this.$nextTick(function() {
						this.scrollTop = data.height * index;
					});
				}).exec();
			}
		}
	}
</script>

<style>
</style>
