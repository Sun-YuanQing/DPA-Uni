<!-- 拆箱全检-->
<template>
	<view>
		<view id="viewHeader">
			<barcode-input ref="input_box" @onScaned="onBoxScaned" :focus="true" placeholder="请扫描外箱包装"></barcode-input>
			<barcode-input ref="input_part" @onScaned="onPartScaned" placeholder="请扫描内包装"></barcode-input>
		</view>
		<!-- 显示入库单明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in order.tagDetails" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">标签ID:{{item.tagId}}</text>
								<text class="uni-title">料品编码:{{item.partItemNo}}</text>
								<text class="uni-title">料品名称:{{item.partName}}</text>
							</view>
							<view class="uni-triplex-right">
								<text class="uni-h5" style="min-width: 120upx;margin-left: -500upx;">检验:{{item.fullInspectionSw?'是':'否'}}
								</text>
								<text class="uni-h5" style="min-width: 120upx;margin-left: -500upx;">数量:{{item.sheetQty}}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>

		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<button type="primary" style="display: block; float: none;" @click="onSave">封箱</button>
		</page-foot>
	</view>
</template>

<script>
	import barcodeInput from '../../components/barcode-input/barcode-input.vue' //扫码组件

	import apis from '../../common/apiService.js'; //系统api
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js'; //常用功能
	export default {
		components: {
			barcodeInput
		},
		data() {
			var date = new Date();
			return {
				progNo: '', //页面ID
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				order: { //+单据信息  之后会请求新赋值多个数据例如details
					tagDetails: []
				},
				orderItemSelected: {} //当前选中项

			}
		},
		onLoad(option) { //页面id
			this.progNo = option.progNo || 'OPDA00016';
			console.log(this.progNo)
		},
		onReady() {
			util.getListHeight(this);
		},
		onBackPress(options) {
			return util.backPress(options, this.order.tagDetails.length > 0);
		},
		methods: {
			onBoxScaned: function(e) {
				apis.pda_pdaboxbarcodedetail({
					data: {
						boxqrCode: e
					},
					success: (res) => {
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
				var _self=this;
				apis.basic_QRCodeAnalysis({
					data: {
						qrCode: e
					},
					success: (res) => {
						//如果一致，1.定位当前行，2.更改全检状态 
						let isexist = false; //是否存在扫描信息标识
						//标签ID一致，改全检状态1
						for (var i = 0; i < this.order.tagDetails.length; i++) {
							let item = this.order.tagDetails[i];
							if (item.tagId == res.tagId) {
								item.fullInspectionSw = 1;
								item.entityState = consts.entityState.modified;
								isexist = true;
								uni.showToast({
									title: '扫描成功'
								});
								util.showScanedAudio();
								this.onScrollTop(i);
								break;
							}
						}
						//重新赋值改变视图2
						if (!isexist) {
							uni.showToast({
								title: '扫描错误，当前标签不属于该单据',
								icon: 'none'
							});
							util.showAudio();
						}
						util.automateSave(_self.order.tagDetails,"fullInspectionSw",1,_self.onSave);
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
			/* 保存 */
			onSave() {
				if (this.order.tagDetails.length <= 0) { //有没有数据集做全检 
					uni.showToast({
						title: '请扫描外箱',
						icon: 'none'
					})
					this.$refs.input_box.setFocus();
					return;
				}
				var index = -1; //记录下标
				for (var i = 0; i < this.order.tagDetails.length; i++) {
					let item = this.order.tagDetails[i];
					if (item.fullInspectionSw != 1) { //0未检验 1  已检验
						index = i; //未检验 的下标  
						break;
					}
				}
				if (index >= 0) { //i的下标存在， 全检未完成
					util.showAudio();
					this.onScrollTop(index);
					uni.showToast({
						title: '全检未完成',
						icon: 'none'
					})
					return;
				}
				//以上校验完成
				apis.boxIO_put({
					data: this.order,
					success: (res) => {
						uni.showToast({
							title: '封箱完成',
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
						util.tryCatchApi({
							status: status,
							message: message
						});
						uni.hideLoading();
					},
				})
			},
			/* 选中的方法 */
			onSelectedItem(e) {
				for (var i = 0; i < this.order.tagDetails.length; i++) {
					var item = this.order.tagDetails[i];
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
