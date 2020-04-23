<!-- 盘点管理 -->
<template>
	<view>
		<!-- 顶部 -->
		<view id="viewHeader">
			<!-- 请扫描盘点单 -->
			<barcode-input ref="input_part" @onScaned="onPartScaned" placeholder="请扫描盘点单"></barcode-input>
			<barcode-input ref="stroga_part" @onScaned="onStrogaScaned" :placeholder="placeholder_store"></barcode-input>
			<barcode-input ref="input_partNo" @onScaned="onPartNoScaned" placeholder="请扫描物料"></barcode-input>
		</view>
		<!-- 显示盘点管理的信息 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">料号:{{item.mode.partItemNo}}</text>
								<text class="uni-title">批次:{{item.mode.inLot}}</text>
								<text class="uni-title">数量: {{item.mode.sheetQty}}</text>
							</view>
							<view class="uni-triplex-right" style="min-width: 220upx;">
								<text class="uni-h5">状态:{{item.mode.stateName}}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
		<!-- 底部 -->
		<page-foot ref="viewBtm">
			<button type="primary" @click="save">保存</button>
		</page-foot>
	</view>
</template>

<script>
	import barcodeInput from '../../components/barcode-input/barcode-input.vue'
	import apis from '../../common/apiService.js';
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js';
	export default {
		components: {
			barcodeInput
		},
		data() {
			return {
				details: [], //存放数据的数据
				order: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				placeholder_store: '',
				isStorageBin: null, //是否启用储位，否改储位
				binNo: '',
				binWhNo: '',
				whNo: '', //仓库
				partItemNo: '' //物料
			}
		},
		onLoad(option) {
			var _self = this;
			this.isStorageBin = storage.get(consts.storageKeys.IsStorageBin);
			if (this.isStorageBin) {
				_self.placeholder_store = '扫描储位';
			} else {
				_self.placeholder_store = '扫描仓库';
			}
		},
		/* 设置下拉列表的滚动 */
		onReady() {
			util.getListHeight(this);
		},
		/* 设置返回上一页 */
		onBackPress(options) {
			return util.backPress(options, this.order.details);
		},
		methods: {
			/* 扫描盘点单 产生物料盘点单 */
			onPartScaned: function(e) {
				uni.showLoading({
					title: '加载中..',
					mask: true
				});
				/* 调用产生物料盘点的api */
				apis.inventory_management({
					data: {
						whNo: this.whNo,
						partItemNo: this.partItemNo
					},
					success: (res) => {
						console.log("盘点日志打印: " + JSON.stringify(res));
						if (!res) {
							uni.uni.showToast({
								title: '该盘点单不存在'
							});
							return;
							this.$refs.input_part.setFoust();
						}

						/* 如果存在的话就调用查询api */
						apis.inventory_managementList({
							data: {
								sheetId: 0
							},
							success: (res) => {
								console.log("提交更新数据:" + res)
								this.details.push({
									mode: res
								})
								this.$refs.stroga_part.setFoust();
								util.showScanedAudio();
							}
						})

					},
					failure: (message) => {
						util.showAudio();
						this.$refs.input_part.setFoust();
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
			/* 扫描货架 */
			onStrogaScaned: function(e) {
				if (e.length <= 0) {
					uni.showToast({
						title: '不能输入空值!',
						icon: "none"
					});
					return;
				}
				uni.showToast({
					title: '加载中...',
					mask: true
				});
				/* 检查货架是否存在 */
				if (this.isStorageBin) {
					apis.bas_storagebin({
						data: {
							binNo: e
						},
						success: (res) => {
							console.log(util.outputLog(res));
							if (res.length <= 0) {
								uni.showToast({
									title: '货架不存在!',
									icon: "none"
								});
								util.showAudio();
								this.$refs.stroga_part.setFoust();
								return;
							} else {
								this.binNo = res[0].binNo;
								this.binWhNo = res[0].whNo;
								this.$refs.input_partNo.setFoust();
								util.showScanedAudio();
							}
						},
						failure: (message) => {
							this.$refs.input_store.setFocus();
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
				} else {
					console.log(e);
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
								this.$refs.input_store.clear();
								util.showAudio();
							} else {
								this.binWhNo = res[0].whNo;
								this.$refs.input_part.setFocus();
								util.showScanedAudio();
							}
						},
						failure: (message) => {
							this.$refs.input_store.setFocus();
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
				}
			},
			/* 扫描物料 */
			onPartNoScaned: function(e) {
				uni.showToast({
					title: '加载中..',
					mask: true
				});
				apis.OpenMes_mesqrcodeinout({
					data: {
						qrCode: e
					},
					success: (res) => {
						console.log("扫描物料:" + res)
						var isExiest = false;
						for (var i = 0; i < this.details.length; i++) {
							let item = this.details[i];
							if (item.qrCode == e) {
								isExiest = true;
								uni.showModal({
									title: '提示',
									cancelText: '该物料已盘点过,是否删除',
									success: (res_mod) => {
										if (res_mod.confirm) {
											item.tagDetails.splice(j, 1);
										} else if (res_mod.cancel) {

										}
									}
								})
								return;
							}
						}
						if (isExiest) {
							uni.showToast({
								title: '该物料不属于该盘点盒'
							})
							return;
						}
						this.details.push({
							mode: res,
							qrCode: e
						});
						util.showScanedAudio();
					},
					failure: (message) => {
						util.showAudio();
					},
					complete: (status, message, content) => {
						this.$refs.input_partNo.setFoust();
						util.tryCatchApi({
							status: status,
							message: message
						});
						uni.hideLoading();
					}
				})
			},
			/* 提交更新数据 */
			save: function() {
			    var  _self=this;
				var list = [];
				for (var i = 0; i < this.details.length; i++) {
					let item = this.details[i].mode;
					if (item.model.tagDetails) {
						item.model.tagDetails.forEach(function(item_tag) {
							var data = {};
							data.sheetType = item_tag.sheetType;
							data.sheetNo = item_tag.sheetNo;
							data.sheetLot = item_tag.sheetLot;
							data.partNo = item_tag.partNo;
							data.purLot = item_tag.poMoSoLot; //采购批号
							data.proLot = item_tag.proLot; //供应商生产批号
							data.sheetQty = item_tag.sheetQty; //数量
							data.inLot = item_tag.inLot; //批次号
							data.proDate = item_tag.proDate; //日期
							data.tagId = item_tag.tagId; //标签ID
							data.boxTagId = item_tag.boxTagId; //箱号标签ID
							data.custTagId = item_tag.custTagId; //客户标签ID
							data.ordLot = item_tag.ordLot; //订单批号
							data.custNo = item_tag.custNo; //供应商内码
							if (_self.isStorageBin) {
								data.binNo = item_tagl.binNo; //储位
								data.binWhNo = item_tagl.binWhNo; //仓库
							} else {
								data.binNo = item_tagl.binWhNo; //储位
								data.binWhNo = item_tagl.binWhNo; //仓库	
							}
							data.qrCode = item.qrCode; //标签内容
							data.sourceType = "1"; //来源类型 1.盘点
							data.inoutFlag = "1"; //上架
							data.entityState = consts.entityState.added;
							list.push(data);
						})
					} else {
						var data = {};
						data.sheetType = item.mode.sheetType;
						data.sheetNo = item.mode.sheetNo;
						data.sheetLot = item.mode.sheetLot;
						data.partNo = item.mode.partNo;
						data.purLot = item.mode.poMoSoLot; //采购批号
						data.proLot = item.mode.proLot; //供应商生产批号
						data.sheetQty = item.mode.sheetQty; //数量
						data.inLot = item.mode.inLot; //批次号
						data.proDate = item.mode.proDate; //日期
						data.tagId = item.mode.tagId; //标签ID
						data.boxTagId = item.mode.boxTagId; //箱号标签ID
						data.custTagId = item.mode.custTagId; //客户标签ID
						data.ordLot = item.mode.ordLot; //订单批号
						data.custNo = item.mode.custNo; //供应商内码
						if (_self.isStorageBin) {
							data.binNo = item.model.binNo; //储位
							data.binWhNo = item.model.binWhNo; //仓库
						} else {
							data.binNo = item.model.binWhNo; //储位
							data.binWhNo = item.model.binWhNo; //仓库	
						}
						data.qrCode = item.qrCode; //标签内容
						data.sourceType = "1"; //来源类型 1.盘点
						data.inoutFlag = "1"; //上架
						data.entityState = consts.entityState.added;
						list.push(data);
					}
				}
				uni.showLoading({
					title: '加载中..',
					mask: true
				});
				apis.inventory_managementUpdata({
					data: list,
					success: (res) => {
						console.log("提交更新数据:" + res)
                         if (_self.isStorageBin) {
                         	_self.placeholder_store = '扫描储位';
                         } else {
                         	_self.placeholder_store = '扫描仓库';
                         }
					}
				})
				util.dataInit(this);
			},
			/* 当选中列表时的背景颜色 */
			/* 选择单条盘点数据 */
			onSelectedItem(e) {
				for (var i = 0; i < this.details.length; i++) {
					let item = this.details[i];
					if (i == e) {
						item.selectItemClass = "uni-list-cell-selected";
					} else {
						item.selectItemClass = ""
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
