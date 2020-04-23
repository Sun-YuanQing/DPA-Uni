<!-- 仓内序列号拆箱合并 -->
<template>
	<view>
		<view id="viewHeader">
			<barcode-input ref="input_storage" :focus="true" @onScaned="onStorageScaned" placeholder="请扫描外箱"></barcode-input>
		</view>
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">标签ID:{{item.tagId}}</text>
								<text class="uni-title">料号:{{item.partItemNo}}</text>
								<text class="uni-title">序列号个数:{{item.tagDetails.length}}</text>
							</view>
							<view class="uni-triplex-right" style="min-width: 220upx;"> 
								<text class="uni-h5">箱数量:{{item.sheetQty}}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<button type="primary" @click="onSave">合并</button>
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
				progNo: '', //页面ID 
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				details: []
			}
		},
		onLoad(option) {
			this.progNo = option.progNo;
		},
		onReady() {
			util.getListHeight(this);
		},
		onBackPress(options) {
			return util.backPress(options, this.details.length > 0);
		},
		methods: {
			onStorageScaned(e) {
				var that = this;
				//料品信息标签扫描完成
				uni.showLoading({
					mask: true
				});
				apis.OpenMes_scmboxbyqrcode({
					data: {
						qrCode: e
					},
					success: (res) => {
						for (var i = 0; i < that.details.length; i++) {
							let item = that.details[i];
							if (item.tagId == res.tagId) {
								that.onScrollTop(i);
								uni.showModal({
									title: '提示',
									content: '该标签已扫描,是否要删除',
									success: function(res_mod) {
										if (res_mod.confirm) {
											that.details.splice(i, 1);
										} else if (res_mod.cancel) {}
									}
								});
								util.showAudio();
								return;
							}
						}
						if (that.details.length > 0 && that.details[0].binWhNo != res.binWhNo) {
							uni.showToast({
								title: '所在仓库不一致',
								icon: "none"
							});
							util.showAudio();
							return;
						}
						if (that.details.length > 0 && that.details[0].partItemNo != res.partItemNo) {
							uni.showToast({
								title: '料号不一致',
								icon: "none"
							});
							util.showAudio(); 
							return;
						}
						if (that.details.length > 0 && that.details[0].inLot != res.inLot) {
							uni.showToast({
								title: '批次号不一致',
								icon: 'none'
							});
							util.showAudio(); 
							return;
						}
						that.details.push(res);
						that.onScrollTop(that.details.length - 1);
						util.showScanedAudio();
					},
					failure: (message) => {
						util.showAudio();
					},
					complete: (status, message, content) => {
						this.$refs.input_storage.setFocus();
						util.tryCatchApi({
							status: status,
							message: message
						});
						uni.hideLoading();
					}
				})
			},
			onSave() {
				var that = this;
				if (that.details.length == 0) {
					uni.showToast({
						title: '请扫描外箱',
						icon: "none"
					});
					that.$refs.input_storage.setFocus();
					util.showAudio();
					return;
				}
				uni.navigateTo({
					url: 'storage-mergeSNDet?progNo='+this.progNo+'&data=' + JSON.stringify(that.details)
				});
				util.dataInit(this);
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
