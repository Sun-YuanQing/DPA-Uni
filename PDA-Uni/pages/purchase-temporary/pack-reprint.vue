<!-- 来料标签重打 (标签重复改其中一个tagId)-->
<template>
	<view>
		<view id="viewHeader">
			<barcode-input ref="input_part" @onScaned="onPartScaned" placeholder="请扫描内包装"></barcode-input>
		</view>
		<!-- 显示入库单明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">标签tagId:{{item.scan_tagId}}</text>
								<text class="uni-title">重置tagId:{{item.tagId==item.scan_tagId?'':item.tagId}}</text>
								<text class="uni-title">料号:{{item.partItemNo}}</text>
								<text class="uni-title">料品名称:{{item.partName}}</text>
								<text class="uni-title">客户料号:{{item.suPartNo}}</text>
							</view>
							<view class="uni-triplex-right">
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">单位:{{item.unitName}}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">规格:{{item.partSpec}}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">数量:{{item.sheetQty}}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<print-button ref='printBtn' :reportModel="reportModel" buttonText="重写标签" @click="Proint" @printComplete="printComplete"
			 @tagValid="tagValid" @printCancel="onprintCancel"></print-button>
		</page-foot>

	</view>
</template>

<script>
	import barcodeInput from '../../components/barcode-input/barcode-input.vue'; //扫码组件
	import printButton from "../../components/label-print/print-button.vue"

	import apis from '../../common/apiService.js';
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js';
	export default {
		components: {
			barcodeInput,
			printButton
		},
		data() {
			var date = new Date();
			return {
				reportModel: {
					progNo: '', //页面ID
					showReport: false,
					isMultiPrint: false,
					dataSource: [],
					isNeedValidTag: false //是否需要校验标签
				},
				//显示隐藏扫描功能
				showPrint: false, //打印
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				tagId: null,
				details: [],
				orderItemSelected: {}, //当前选中项
				pickerValueDefault: date
			}
		},
		onLoad(option) {
			this.reportModel.progNo = option.progNo || 'OPDA00001';
		},
		onReady() {
			util.getListHeight(this);
		},
		onBackPress(options) {
			return util.backPress(options, this.details > 0);
		},
		methods: {
			onPartScaned(e) {
				var _self = this;

				uni.showLoading({
					mask: true
				});
				apis.basic_QRCodeAnalysis({
					data: {
						qrCode: e
					},
					success: (res) => {
						console.log(JSON.stringify(res))
						if (res.bztype > 1) { //0内箱，1外箱
							uni.showToast({
								title: '不支持卡板，混装！',
								icon: 'none'
							});
							util.showAudio();
							_self.$refs.input_part.setFocus();
							return;
						}
						res.scan_tagId = res.tagId
						let isexist = false;
						if (_self.orderItemSelected.partItemNo) {
							for (var i = 0; i < _self.details.length; i++) {
								let item = _self.details[i];
								if (item.tagId != res.tagId) {
									uni.showToast({
										title: "请扫描相同标签！！！",
										icon: 'none'
									});
									util.showAudio();
									return;
								} else {
									_self.details.push(res)
									_self.onSelectedItem(((_self.details.length) - 1));
									break;
								}
							}
						} else { //第一次
							_self.details.push(res)
							_self.onSelectedItem(0);

						}
						uni.showToast({
							title: '扫描成功'
						});
						util.showScanedAudio();
					},
					failure: (message) => {
						util.showAudio();
					},
					complete: (status, message, content) => {
						_self.$refs.input_part.setFocus();
						util.tryCatchApi({
							status: status,
							message: message
						});
						uni.hideLoading();
					}
				})
			},
			Proint() {
				console.log(1)
				var _self = this;
				var index = 1;
				var prefix = new Date().format("yyMMddHHmmssfff");
				var item_bool = 0; //相同的条数
				if (this.details.length < 2) {
					return;
				} else {
					var item_tagId = "";
					this.details.forEach(function(item, i) {
						if (item.tagId == _self.orderItemSelected.tagId) {
							item_bool += 1;
						}
					})
				}
				if (item_bool > 1) {
					if (this.orderItemSelected.partItemNo) {
						var orderItemSelected = util.clone(_self.orderItemSelected);
						this.tagId = `${prefix}-${util.getSuffix(3, index)}`;
						orderItemSelected.tagId = this.tagId;

						_self.reportModel.dataSource.push(orderItemSelected);
						this.$refs.printBtn.execPrint();
					} else {
						uni.showToast({
							title: "请选择标签！！！",
							icon: 'none'
						});
						util.showAudio();
						this.$refs.input_part.setFocus();
						return;
					}
				} else {
					uni.showToast({
						title: "没有两个标签相同！！！",
						icon: 'none'
					});
					util.showAudio();
					this.$refs.input_part.setFocus();
					return;
				}

			},
			printComplete() {
				console.log(1)
				if (this.tagId != null) {
					this.orderItemSelected.tagId = this.tagId;
					uni.showToast({
						title: "已重置一张标签^_^"
					});
				} else {
					this.orderItemSelected.tagId = "未知错误！！！"
					uni.showToast({
						title: "",
						icon: "none"
					});
					util.showAudio();
				}


				this.$refs.input_part.setFocus();
			},
			tagValid(scanTagModelList) {
				console.log(2)
				console.log(util.outputLog(scanTagModelList))
				util.dataInit(this);
				this.$refs.input_part.setFocus();
			},
			onprintCancel() {
				console.log(3)
				util.dataInit(this);
				this.$refs.input_part.setFocus();
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
			/* 选中的方法 */
			onSelectedItem(e) {
				for (var i = 0; i < this.details.length; i++) {
					var item = this.details[i];
					if (i == e) {
						item.selectItemClass = 'uni-list-cell-selected';
						this.orderItemSelected = item;
					} else {
						item.selectItemClass = '';
					}
				}
			}

		}
	}
</script>

<style>
</style>
