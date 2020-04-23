<!-- 外箱&客户条码绑定 -->
<template>
	<view>
		<view id="viewHeader">
			<barcode-input ref="input_box" :focus="true" @onScaned="onBoxScaned" :clearScan="true" placeholder="请扫描外箱"></barcode-input>
			<barcode-input ref="input_custBarcode" @onScaned="onCustBoxScaned" :disabled="btnDisabled" :isShowScan="!btnDisabled" v-model="order.custBoxTagId" :clearScan="false" placeholder="请扫描客户条码"></barcode-input>
			
		</view>
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in order.tagDetails" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">标签ID:{{item.tagId}}</text>
								<text class="uni-title">料品编码:{{ item.partNo }}</text>
								<text class="uni-title">料品名称:{{ item.partName }}</text>
							</view>
							<view class="uni-triplex-right" style="min-width: 220upx;"> 
								<text class="uni-h5">数量:{{item.sheetQty}}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<button style="width: 49%; margin-right: 10px; float: left; " :disabled="!btnDisabled" @click="onSave(false)">解绑</button>
			<button type="primary" style="display: block; float: none;" :disabled="btnDisabled" @click="onSave(true)">绑定</button>
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
				order: null,
				btnDisabled: false
			}
		},
		onReady() {
			util.getListHeight(this);
		},
		onBackPress(options) {
			return util.backPress(options, this.order != null);
		},
		methods: {
			onBoxScaned(e) {
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
						that.order = res;
						that.btnDisabled = that.order.custBoxTagId.length > 0; 
						util.showScanedAudio();
						this.$refs.input_custBarcode.setFocus();
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
			onCustBoxScaned(e){
				if (that.order == null){
					uni.showToast({
						title: '请扫描外箱！',
						icon: "none"
					});
					util.showAudio();
					this.$refs.input_box.setFocus();
					return;
				}
			},
			onSave(e) {
				let that = this;
				if (that.order == null){
					uni.showToast({
						title: '请扫描外箱！',
						icon: "none"
					});
					util.showAudio();
					this.$refs.input_box.setFocus();
					return;
				}
				if (e && that.order.custBoxTagId.length == 0){
					uni.showToast({
						title: '请扫描客户条码！',
						icon: "none"
					});
					util.showAudio();
					this.$refs.input_custBarcode.setFocus();
					return;
				}
				if(!e){
					//解绑
					that.order.custBoxTagId = '';
				}
				that.order.entityState = consts.entityState.modified;
				uni.showLoading({
					mask: true
				});
				apis.OpenMes_boxesn({
					data: that.order,
					success: (res) => {
						uni.showToast({
							title: '保存成功!'
						});
						util.dataInit(this);
						this.$refs.input_box.setFocus();
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
