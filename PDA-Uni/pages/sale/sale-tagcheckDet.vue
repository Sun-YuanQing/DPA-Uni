<!-- 标签检验 明细 -->
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
			<barcode-input ref="input_part" @onScaned="onPartScaned" :focus="true" placeholder="请扫描出货单料号"></barcode-input>
			<barcode-input ref="input_cuspart" @onScaned="onCusPartScaned" placeholder="请扫描客户料号"></barcode-input>
		</view>
		<!-- 显示入库单明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in order.details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">条码:{{item.partItemNo}}</text>
							</view>
							<view class="uni-triplex-right" style="min-width: 220upx;">
								<text class="uni-h5">单位:{{item.unitName}}</text>
								
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>


		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<button type="primary" style="display: block; float: none;" @click="onSave">合格</button>
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
				progNo: '',
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				order: {
					"sheetNo": "",
					"partItemNo": ""
				},
				partScan: null
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
			return util.backPress(options, this.order.sheetNo.length > 0);
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
				apis.OpenMes_mesqrcodeinout({
					data: {
						qrCode: e
					},
					success: (res) => {
						if (res.partItemNo != this.order.partItemNo) {
							uni.showToast({
								title: '标签扫描错误，料号不同！',
								icon: 'none'
							});
							this.$refs.input_part.setFocus();
						} else {
							this.partScan = res;
							this.$refs.input_cuspart.setFocus();
							util.showScanedAudio();
						}
					},
					failure: (message) => {
						this.$refs.input_cuspart.setFocus();
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
			onCusPartScaned(e) {				
				//扫描客户料号
				if (e != this.order.partItemNo) {
					uni.showToast({
						title: '标签扫描错误，料号不同！',
						icon: 'none'
					});
					util.showAudio();
					this.$refs.input_cuspart.setFocus();
				} else {
					uni.showToast({
						title: '校验成功！'
					});
					this.$refs.input_part.setFocus();
					this.$refs.input_part.clear();
					this.$refs.input_cuspart.clear();
					util.showScanedAudio();
				}
			},
			onSave() {
				if (this.partScan == null) {
					uni.showToast({
						title: '请先扫描校验！'
					});
					this.$refs.input_part.setFocus();
					return;
				}
				//保存
				let userInfo = storage.get(consts.storageKeys.login);
				this.order.tagCheckSw = "1";
				this.order.tagCheckEmp = userInfo.userID;
				this.order.entityState = consts.entityState.modified;
				this.order.outLotDetails = null;
				this.order.tagDetails = null;
				this.order.locklogDetails = null;
				uni.showLoading({
					title: '加载中',
					mask: true
				});
				apis.sale_save_put({
					data: this.order,
					success: (res) => {
						uni.showToast({
							title: '操作成功'
						});
						util.dataInit(this);
						this.pageIO_true();
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
