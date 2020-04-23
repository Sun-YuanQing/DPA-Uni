<!-- 按物控领料出库  -->
<!-- 
 1.先扫描仓库 & 工单 返回工单列表
 2.点击领料按钮，跳转到明细页面，传递仓库+工单号集合
 扫描仓库： apis.bas_wh
 扫描工单：[HttpGet("mk/{sheetNo}", Name = "GetMk")] 只需校验工单号是否正确
 -->
<template>
	<view>
		<view id="viewHeader">
			<barcode-input ref="input_store" @onScaned="onStorageScaned" v-model="whNo" :focus="true" :clearScan="false"
			 placeholder="请扫描仓库"></barcode-input>
			<barcode-input ref="input_order" @onScaned="onOrderScaned" placeholder="请扫描制单"></barcode-input>
		</view>
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">制造单号:{{item.purLot}}</text>
								<text class="uni-title">料号:{{item.partItemNo}}</text>
							</view>
							<view class="uni-triplex-right" style="min-width: 220upx;">
								<text class="uni-h5">{{item.sheetDate | dateFormat}}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<button type="primary" @click="onSave">领料</button>
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
				whNo: '',
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
				let that = this;
				uni.showLoading({
					mask: true
				});
				apis.bas_wh({
					data: {
						filter: 'whNo = "' + e + '"'
					},
					success: (res) => {
						console.log(util.outputLog(res));
						if (res.length <= 0) {
							uni.showToast({
								title: '仓库不存在!',
								icon: "none"
							});
							that.$refs.input_store.clear();
							that.$refs.input_store.setFocus();
							util.showAudio();
						} else {
							that.whNo = e;
							that.$refs.input_order.setFocus();
							util.showScanedAudio();
						}
					},
					failure: (message) => {
						util.showAudio();
						that.$refs.input_store.setFocus();
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
			onOrderScaned(e) {
				let that = this;
				uni.showLoading({
					mask: true
				});
				apis.pickingOrder_out_GetList({
					data: {
						moLot: e
					},
					success: (res) => {
						console.log(util.outputLog(res));
						for (var i = 0; i < that.details.length; i++) {
							if (that.details[i].purLot == res.purLot) {
								uni.showToast({
									title: '该工单已扫描!',
									icon: "none"
								});
								util.showAudio();
								that.onScrollTop(i)
								return;
							}
						}

						if (res.controlDetails.length == 0) {
							uni.showToast({
								title: '该工单没有物控档!',
								icon: "none"
							});
							util.showAudio();
						} else if (that.details.length > 0 && that.details[0].citemNo != res.citemNo){
							uni.showToast({
								title: '部门不一样不允许合并发料!',
								icon: "none"
							});
							util.showAudio();
						} else {
							that.details.push(res)
							that.onScrollTop(that.details.length - 1)
							util.showScanedAudio();
						}
					},
					failure: (message) => {
						util.showAudio();
					},
					complete: (status, message, content) => {
						that.$refs.input_order.setFocus();
						util.tryCatchApi({
							status: status,
							message: message
						});
						uni.hideLoading();
					}
				})
			},
			onSave() {
				let that = this;
				if (that.whNo.trim().length == 0) {
					uni.showToast({
						title: '请扫描仓库!',
						icon: "none"
					});
					that.$refs.input_store.setFocus();
					return;
				}
				if (that.details.length == 0) {
					uni.showToast({
						title: '请扫描要领料的工单!',
						icon: "none"
					});
					that.$refs.input_order.setFocus();
					return;
				}
				let orders = ''
				for (var i = 0; i < that.details.length; i++) {
					orders += that.details[i].purLot + ','
				}
				orders = orders.substring(0, orders.length - 1)
				uni.navigateTo({
					url: '/pages/picking/pickingOrder-outDet?progNo='+that.progNo+'&whNo=' + that.whNo + '&orders=' + orders
				});
				/* uni.navigateTo({
					url: '/pages/picking/pickingOrder-outDet'
				}); */
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
