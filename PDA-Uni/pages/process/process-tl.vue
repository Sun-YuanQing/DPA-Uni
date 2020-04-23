<!--工序投料-->
<template>
	<view>
		<view id="viewHeader">
			<process-scanOrder ref="input_order" @onGetOrder="onGetOrder" v-model="order"></process-scanOrder> 
			<barcode-input ref="input_part" @onScaned="onPartScaned" placeholder="扫描物料"></barcode-input>
		</view>
		<!-- 显示入库单明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">料号:{{item.partItemNo}}</text>
								<text class="uni-title">料品名称:{{item.partName}}</text>
								<text class="uni-title">数量: {{item.sheetQty}}</text>
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
			<button type="primary" @click="onSave">保存</button>
		</page-foot>
	</view>
</template>

<script>
	import barcodeInput from '../../components/barcode-input/barcode-input.vue' //扫码组件
	import processScanOrder from '../../components/process-scanOrder/process-scanOrder.vue'; 

	import apis from '../../common/apiService.js'; //系统api
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js'; //常用功能
	export default {
		components: {
			barcodeInput,
			processScanOrder
		},
		data() {
			return {
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				details: [],
				order: null,//选择的单据 
			}
		},
		onLoad(option) { //页面id
			this.progNo = option.progNo;
		},
		onReady() {
			util.getListHeight(this);
		},
		onBackPress(options) {
			return util.backPress(options, this.details.length > 0);
		},
		methods: {
			/**
			 * @@description 获取选择的单据
			 */
			onGetOrder(e){
				let that = this;  
				that.order = e;
				this.$refs.input_part.setFocus();
			},
			onPartScaned(e) {
				let that = this;
				//扫描物料
				//判断物料是否扫描重复
				uni.showLoading({
					mask: true
				});
				apis.pro_TL_PartScan({
					data: {
						moLot: that.order.moLot,
						proItemNo: that.order.proItemNo,
						deviceNo: that.order.deviceNo,
						qrCode: e
					},
					success: (res) => {
						console.log(util.outputLog(res));
						//校验是否重复扫描 
						for (let i = 0; i < this.details.length; i++) {
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
							//判断是否要校验批次
						}
						res.qrCode = e;
						this.details.push(res);
						this.onScrollTop(this.details.length - 1);
						this.$refs.input_part.setFocus();
						util.showScanedAudio();
					},
					failure: (message) => {
						
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
				})
			},
			onSave() {
				/* 保存 */
				let that = this; 
				
				if (!that.$refs.input_order.validInputFinish()){
					return;
				}
				if (this.details.length == 0) {
					uni.showToast({
						title: '请扫描要投入的物料',
						icon: 'none'
					});
					this.$refs.input_part.setFocus();
					return;
				}
				let datas = this.convert2ScmMesDayInputModel();
				uni.showLoading({
					mask: true
				});
				apis.pro_TL_Save({
					data: datas,
					success: (res) => {
						uni.showToast({
							title: '保存成功!'
						});
						util.dataInit(this);
						this.$refs.input_order.setOrderFocus();
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
			/**
			 * @description 要提交的对象
			 */
			convert2ScmMesDayInputModel() {
				var list = [];
				for (let i = 0; i < this.details.length; i++) {
					var item = this.details[i];
					var data = {};
					data.sheetDate = new Date();
					data.moLot = this.order.moLot;
					data.proNo = this.order.custNo;
					data.proItemNo = this.order.itemNo;
					data.deviceNo = this.order.deviceNo;
					data.unitNo = item.unitNo;
					data.partNo = item.partNo;
					data.sheetQty =Number(item.sheetQty);
					data.inLot = item.inLot;
					data.proDate = item.proDate;
					data.updateTime = new Date();
					data.tagId = item.tagId;
					data.qrCode = item.qrCode;
					data.inputType = 1; //1、物料投入；2、工序转入
					data.entityState = consts.entityState.added;
					list.push(data);
				}
				//console.log("list: " + JSON.stringify(list));
				return list;
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
				this.old.scrollTop = e.detail.scrollTop
			},
			onScrollTop(index) {
				//滚动定位
				this.onSelectedItem(index);
				let view = uni.createSelectorQuery().select(".scroll-view-item");
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
