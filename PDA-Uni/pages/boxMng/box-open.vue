<!--拆箱登记-->
<template>
	<view>
		<view id="viewHeader">
			<barcode-input ref="input_box" @onScaned="onBoxScaned" :focus="true" placeholder="请扫描外箱包装"></barcode-input>
		</view>
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">标签ID:{{item.tagId}}</text>
								<text class="uni-title">料品编码:{{item.partItemNo}}</text>
								<text class="uni-title">料品名称:{{item.partName}}</text>
							</view>
							<view class="uni-triplex-right" style="min-width: 220upx;">
								<text class="uni-h5">单位:{{item.unitName}}</text>
								<text class="uni-h5">数量:{{item.sheetQty}}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>

		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<button type="primary" @click="onSave">拆箱</button>
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
				details: []
			}
		},
		onReady() {
			util.getListHeight(this);
		},
		onBackPress(options) {
			return util.backPress(options, this.details.length > 0);
		},
		methods: {
			onBoxScaned(e) {
				//料品信息标签扫描完成
				uni.showLoading({
					mask: true
				});
				apis.base_scanreqBox({
					data: {
						boxQrCode: e
					},
					success: (res) => {
						console.log(util.outputLog(res));
						for (var i = 0; i < this.details.length; i++) {
							let item = this.details[i];
							if (item.tagId == res.tagId) {
								var _self = this;
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
						}
						this.details.push(res)
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
			onSave() {
				if (this.details.length == 0) {
					uni.showToast({
						title: '请扫描外箱',
						icon: 'none'
					})
					this.$refs.input_box.setFocus();
					return;
				}
				let boxTagIds = '';
				for (let i = 0; i < this.details.length; i++) {
					boxTagIds += this.details[i].tagId + ','
				}
				boxTagIds = boxTagIds.substring(0, boxTagIds.length - 1);
				uni.showLoading({
					mask: true
				});
				apis.boxOpen_post({
					data: {
						boxTagIds: boxTagIds,
						boxSw: 1 //0.封箱 1.开箱
					},
					success: (res) => {
						uni.showToast({
							title: '操作完成',
							icon: 'none',
							mask: true
						})
						util.dataInit(this);
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
