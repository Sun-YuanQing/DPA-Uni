<!-- 分拆处理 -->
<template>
	<view>
		<!-- 顶部 -->
		<view id="viewHeader">
			<barcode-input ref="input_order" @onScaned="onScaned" :focus="true" :clearScan="false" placeholder="请扫描标签"></barcode-input>
			<barcode-input ref="input_part" @onScaned="onPartScaned" placeholder="请扫描新标签"></barcode-input>
		</view>
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">料号:{{item.partItemNo}}</text>
								<text class="uni-title">料品名称:{{item.partName}}</text>
								<text class="uni-title">{{isStorageBin?'货架:'+item.binNo:'库位:'+item.binWhNo}}</text>
								<text class="uni-title">数量: {{item.sheetQty}}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>


		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<button type="default" style="width: 160px; margin-right: 10px; float: left;" @click="onShowPrint">分拆</button>
			<button type="primary" style="display: block; float: none;" @click="onSave">保存</button>
		</page-foot>
		<lotunpack :show="showLotUnpack" :model="printMode" :progNo="progNo" :isSaveSplit="false" @cancel="lotupackCancel"></lotunpack>
	</view>
</template>

<script>
	let hasBinNo = false; //是否有库存

	import barcodeInput from '../../components/barcode-input/barcode-input.vue';
	import lotunpack from '../../components/lotunpack/lotunpack.vue';

	import apis from '../../common/apiService.js';
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js';
	export default {
		components: {
			barcodeInput,
			lotunpack
		},
		data() {
			return {
				progNo: '', //页面ID 
				details: [], //存放数据的数据
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				isStorageBin: null, //是否启用储位，否改储位
				showLotUnpack: false, //是否显示拆分打印
				printMode: {} //需拆分的标签对象 
			}
		},
		onLoad(option) {
			this.progNo = option.progNo || 'OPDA00014';
			console.log(this.progNo)
			this.isStorageBin = storage.get(consts.storageKeys.IsStorageBin);
		},
		onReady() {
			util.getListHeight(this);
		},
		onBackPress(options) {
			return util.backPress(options, this.details.length > 0);
		},
		methods: {
			onScaned(e) {
				//扫描原标签
				uni.showLoading({
					mask: true
				});
				apis.basic_QRCodeAnalysis({
					data: {
						qrCode: e
					},
					success: (res) => {
						if (this.isStorageBin) {
							this.hasBinNo = res.binNo.trim().length != 0
						} else {
							if (res.binWhNo.trim().length == 0) {
								this.hasBinNo = false;

							} else {
								this.hasBinNo = true;
							}
						}
						this.printMode = res;
						this.printMode.qrCode = e;
						this.showLotUnpack = true;
						console.log("this.showLotUnpack: " + JSON.stringify(this.showLotUnpack));
						this.$refs.input_part.setFocus();
						util.showScanedAudio();
					},
					failure: (message) => {
						this.$refs.input_order.clear();
						this.$refs.input_order.setFocus();
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
			onPartScaned(e) {
				uni.showLoading({
					mask: true
				});
				apis.basic_QRCodeAnalysis({
					data: {
						qrCode: e
					},
					success: (res) => {
						console.log(JSON.stringify(res))
						for (let i = 0; i < this.details.length; i++) {
							if (this.details[i].tagId == res.tagId) {
								this.onScrollTop(i);
								var _self = this;
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
						if (this.printMode.partItemNo == res.partItemNo && this.printMode.inLot == res.inLot) {
							var clone = util.clone(this.printMode);
							clone.tagId = res.tagId;
							clone.sheetQty = Number(res.sheetQty);
							clone.qrCode = e;
							clone.inoutFlag = "1";
							this.details.push(clone);
							util.showScanedAudio();
						} else {
							uni.showToast({
								title: "扫描的新标签与原标签不一致",
								icon: 'none'
							});
							util.showAudio();
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
			/* 拆分打印 */
			onShowPrint() {
				if (!this.printMode.qrCode || this.printMode.qrCode.trim().length == 0) {
					uni.showToast({
						title: "请扫描标签",
						icon: 'none'
					});
					this.$refs.input_order.setFocus();
					return;
				}
				this.showLotUnpack = true;
			},
			onSave(e) {
				if (this.details.length == 0) {
					uni.showToast({
						title: "请扫描新标签",
						icon: 'none'
					});
					return;
				}
				let totalQty = 0;
				for (let i = 0; i < this.details.length; i++) {
					totalQty = util.floatObj.add(this.details[i].sheetQty, totalQty);
				}
				if (Number(this.printMode.sheetQty) != Number(totalQty)) {
					uni.showToast({
						title: "分拆的标签没有扫完",
						icon: 'none'
					});
					return;
				}
				var list = util.clone(this.details);
				var clone = util.clone(this.printMode);
				clone.inoutFlag = "2"; //上下架标记 1、上架；2、下架
				//增加原始的记录 
				list.insert(0, clone);
				console.log("list: " + JSON.stringify(list));
				if (!this.hasBinNo) {
					uni.showToast({
						title: "保存成功",
						icon: 'none'
					});
					this.details = [];
					util.dataInit(this);
					this.$refs.input_order.clear();
					this.$refs.input_order.setFocus();
					return;
				}
				//保存拆分结果
				uni.showLoading({
					mask: true
				});
				apis.binno_split({
					data: list,
					success: (res) => {
						uni.showToast({
							title: "保存成功",
							icon: 'none'
						});
						this.details = [];
						util.dataInit(this);
						this.$refs.input_order.clear();
						this.$refs.input_order.setFocus();
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
				for (var i = 0; i < this.details.length; i++) {
					var item = this.details[i];
					if (i == e) {
						item.selectItemClass = 'uni-list-cell-selected';
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
			},
			lotupackCancel() {
				//隐藏拆分
				this.showLotUnpack = false;
				this.$refs.input_part.setFocus();
			}
		}
	}
</script>

<style>
</style>
