<!--装箱 -->
<template>
	<view>
		<view id="viewHeader">
			<barcode-input ref="input_part" :focus="true" @onScaned="onPartScaned" placeholder="请扫描内包装"></barcode-input>
			<view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						工单号:
					</view>
					<view class="uni-list-cell-db">
						{{orderHeader.poMoSoLot}}
					</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						料号:
					</view>
					<view class="uni-list-cell-db">
						{{orderHeader.partItemNo}}
					</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						物料名称:
					</view>
					<view class="uni-list-cell-db">
						{{ orderHeader.partName }}
					</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						每箱箱数:
					</view>
					<view class="uni-list-cell-db">
						{{ orderHeader.boxPackingQty }}
					</view>
					<view class="uni-list-cell-left">
						已扫描数量:
					</view>
					<view class="uni-list-cell-db">
						{{ orderHeader.totalQty }}
					</view>
				</view>
			</view>
		</view>
		<!-- 显示入库单明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">标签ID:{{item.tagId}}</text>
							</view>
							<view class="uni-triplex-right">
								<text class="uni-h5">单位:{{item.unitName}}</text>
								<text class="uni-h5" style="min-width: 220upx;margin-left: -300upx;">数量:{{item.sheetQty}}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<print-button ref='printBtn' buttonText="封箱" :reportModel="reportModel" @click="onSave" @tagValid="onBoxScanSave"></print-button>
		</page-foot>
	</view>
</template>

<script>
	import barcodeInput from '../../components/barcode-input/barcode-input.vue'; //扫码组件
	import printButton from "../../components/label-print/print-button.vue"

	import apis from '../../common/apiService.js'; //系统api
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js'; //常用功能

	let tmpHeight = 0;
	export default {
		components: {
			barcodeInput,
			printButton
		},
		data() {
			return {
				reportModel: {
					progNo: '', //页面ID
					showReport: false,
					isMultiPrint: true,
					dataSource: [],
					isNeedValidTag: true //是否需要校验标签
				},
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				details: [],
				orderHeader: {
					poMoSoLot: '',
					partItemNo: '',
					partName: '',
					boxPackingQty: 0,
					totalQty: 0
				}
			}
		},
		onLoad(option) {
			this.reportModel.progNo = option.progNo;
		},
		onReady() {
			util.getListHeight(this);
		},
		onBackPress(options) {
			return util.backPress(options, this.details.length > 0);
		},
		methods: {
			onPartScaned(e) {
				//料品信息标签扫描完成
				uni.showLoading({
					mask: true
				});

				var _self = this;
				apis.basic_QRCodeAnalysis({
					data: {
						qrCode: e
					},
					success: (res) => {
						//校验批次、料号和数量是否正确
						//校验是否重复扫描
						if (res.inBoxNo.trim().length > 0) {
							uni.showToast({
								title: '该标签已在 ' + res.inBoxNo + ' 箱中！',
								icon: "none"
							});
							util.showAudio();
							return;
						}
						for (var i = 0; i < this.details.length; i++) {
							let item = this.details[i];
							if (item.tagId == res.tagId) {
								var _scan = res;
								_self.onScrollTop(i);
								uni.showModal({
									title: '提示',
									content: '该标签已扫描,是否要删除',
									success: function(res_mod) {
										if (res_mod.confirm) {
											_self.details.splice(i, 1);
											_self.orderHeader.totalQty = util.floatObj.subtract(_self.orderHeader.totalQty, _scan.sheetQty);
										} else if (res_mod.cancel) {}
									}
								});
								util.showAudio();
								return;
							}
							if (item.poMoSoLot != res.poMoSoLot) {
								uni.showToast({
									title: '工单号不一致',
									icon: "none"
								});
								util.showAudio();
								this.$refs.input_part.setFocus();
								return;
							}
							if (item.binWhNo != res.binWhNo) {
								uni.showToast({
									title: '所在仓库不一致',
									icon: "none"
								});
								util.showAudio();
								this.$refs.input_part.setFocus();
								return;
							}
						}
						if (this.details.length == 0) {
							this.orderHeader.boxPackingQty = res.boxPackingQty;
							this.orderHeader.partItemNo = res.partItemNo;
							this.orderHeader.partName = res.partName;
							this.orderHeader.poMoSoLot = res.poMoSoLot;
						}
						if (Number(this.orderHeader.boxPackingQty) == 0 || this.orderHeader.boxPackingQty >= util.floatObj.add(this.orderHeader.totalQty, res.sheetQty)) {
							res.sheetQty = Number(res.sheetQty);
							res.qrCode = e;
							this.details.push(res);
							this.onScrollTop(this.details.length - 1);
							this.orderHeader.totalQty = util.floatObj.add(res.sheetQty, this.orderHeader.totalQty);
							uni.showToast({
								title: '校验成功'
							});
							util.showScanedAudio();
							this.$refs.input_part.setFocus();
						} else {
							uni.showToast({
								title: '超出装箱数量',
								icon: "none"
							});
							util.showAudio();
							return;
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
			/* 保存 */
			onSave() {
				if (this.details.length == 0) {
					uni.showToast({
						title: '请扫描内包装',
						icon: "none"
					});
					util.showAudio();
					this.$refs.input_part.setFocus();
					return;
				}
				let that = this;
				uni.showModal({
					title: '提示',
					content: '是否确定封箱',
					success: function(res_mod) {
						if (res_mod.confirm) {
							var dataSource = [];
							var prefix = new Date().format("yyMMddHHmmssfff");
							var model = {};
							model.partNo = that.details[0].partNo;
							model.partItemNo = that.details[0].partItemNo;
							model.partName = that.details[0].partName;
							model.partSpec = that.details[0].partSpec;
							model.inLot = that.details[0].inLot;
							model.serialNo = '';
							model.TagFlag = '';
							model.poMoSoLot = that.details[0].poMoSoLot;

							model.sheetQty = that.orderHeader.totalQty;
							model.tagId = `${prefix}-${util.getSuffix(3, 1)}`;
							model.boxTagId = model.tagId;

							model.linkBoardQty = '';
							model.proLot = that.details[0].proLot;
							model.proDate = new Date(that.details[0].proDate).format("yyyy/MM/dd") || new Date().format("yyyy/MM/dd");
							model.citemNo = that.details[0].citemNo;
							model.custNo = that.details[0].custNo;
							model.custName = that.details[0].custName;
							model.custTagId = '';
							model.reservelocus = that.details[0].reservelocus;

							model.ordLot = that.details[0].ordLot; //订单
							model.custNo = that.details[0].custNo; //客户
							model.purLot = that.orderHeader.poMoSoLot;

							model.proItemNo = '';
							model.proName = '';
							model.toProItemNo = '';
							model.toProName = '';
							model.dayId = '';
							model.spcSta = '';
							model.printType = '';
							model.deviceNo = '';
							model.deviceName = '';
							console.log(util.outputLog(model));

							dataSource.push(model);
							that.reportModel.dataSource = dataSource; //这个方法的作用根据取内箱信息字段，生成外箱数据
							that.$refs.printBtn.execPrint(); //调起打印的显示方法
						} else if (res_mod.cancel) {}
					}
				});
			},
			onBoxScanSave(scanBoxTagModelList) {
				//扫描箱号保存 
				//console.log(util.outputLog(model));
				let scanBoxTagModel = scanBoxTagModelList[0]
				scanBoxTagModel.bzType = 1 //包装类别 0、内箱( 默认) 1、外箱 2、卡板
				scanBoxTagModel.purLot = this.orderHeader.poMoSoLot;
				scanBoxTagModel.ordLot = this.details[0].ordLot; //订单号
				scanBoxTagModel.custNo = this.details[0].custNo; //客户
				scanBoxTagModel.entityState = consts.entityState.added;
				for (let i = 0; i < this.details.length; i++) {
					let item = this.details[i];
					item.boxTagId = scanBoxTagModel.tagId;
					item.sheetLot = scanBoxTagModel.tagId;
					item.purLot = this.orderHeader.poMoSoLot;
					item.entityState = consts.entityState.added;
					scanBoxTagModel.tagDetails.push(item);
				}
				uni.showLoading({
					mask: true
				});
				apis.boxIO_post({
					data: scanBoxTagModel,
					success: (res) => {
						uni.showToast({
							title: '保存成功!'
						});
						util.dataInit(this);
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
