<!--货架初始化上架  -->
<template>
	<view>
		<view id="viewHeader">
			<barcode-input ref="input_store" @onScaned="onScanStorage" focus="true" :clearScan="true" :placeholder="placeholder_store"></barcode-input>
			<barcode-input ref="input_part" @onScaned="onPartScaned" placeholder="请扫描料号"></barcode-input>
			<view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						存放位置:
					</view>
					<view class="uni-list-cell-db">
						{{binNo||binWhNo}}
					</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						扫描数量:
					</view>
					<view class="uni-list-cell-db">
						{{totalQty}}
					</view>
					<view class="uni-list-cell-left">
						扫描个数:
					</view>
					<view class="uni-list-cell-db">
						{{details.length}}
					</view>
				</view>
			</view>
		</view>
		<!-- 显示货架上架明细 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">料号:{{item.model.partItemNo}}</text>
								<text class="uni-title">批次:{{item.model.inLot}}</text>
								<text class="uni-title">{{isStorageBin?'货架:'+binNo:'上架库位:'+binWhNo}} </text>
								<text class="uni-title">数量: {{item.model.sheetQty}}</text>
								<text class="uni-title">标签: {{item.model.tagId}}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
		<!-- 底部按钮 -->
		<page-foot ref="viewBtm">
			<button type="primary" @click="onSave">保存</button>
		</page-foot>
	</view>
</template>

<script>
	import barcodeInput from '../../components/barcode-input/barcode-input.vue'
	import storage from '../../common/storage.js';
	import apis from '../../common/apiService.js';
	import consts from '../../common/consts.js';
	import util from '../../common/util.js';
	export default {
		components: {
			barcodeInput
		},
		data() {
			return {
				old: {
					scrollTop: 0
				},
				tagId: {},
				scrollTop: 0,
				scrollHeight: 0,
				placeholder_store: '',
				isStorageBin: null, //是否启用储位，否改储位
				binNo: '',
				binWhNo: '',
				totalQty: 0,
				details: [],
				orderItemSelected: {} //当前选中项
			}
		},
		onReady() {
			util.getListHeight(this);
			var _self = this;
			this.isStorageBin = storage.get(consts.storageKeys.IsStorageBin);
			if (this.isStorageBin) {
				_self.placeholder_store = '扫描储位';
			} else {
				_self.placeholder_store = '扫描仓库';
			}
		},
		onBackPress(options) {
			return util.backPress(options, this.details.length > 0);
		},
		methods: {
			onScanStorage(e) {
				if (e.length <= 0) {
					uni.showToast({
						title: '不能输入空值!',
						icon: "none"
					});
					return;
				}
				uni.showLoading({
					mask: true
				})
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
								this.$refs.input_store.clear();
								util.showAudio();
							} else {
								this.binNo = res[0].binNo;
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
			onPartScaned(e) {
				var _sefl = this;
				//料品信息标签扫描完成
				if (this.isStorageBin) {
					if (this.binNo.trim() == '') {
						uni.showToast({
							title: '请先扫描货架',
							icon: 'none'
						});
						this.$refs.input_store.setFocus();
						util.showAudio();
						return;
					}
				} else {
					if (this.binWhNo.trim() == '') {
						uni.showToast({
							title: '请扫描库位',
							icon: 'none'
						})
						this.$refs.input_store.setFocus();
						return;
					}
				}
				// //排除(B)后面的内容
				// let matchRlt = e.match(/\(B\)(\S*)\|\|/);
				// if (matchRlt != null && matchRlt.length > 1){
				// 	e = e.replace(matchRlt[1], '')
				// }
				uni.showLoading({
					mask: true
				});
				apis.base_scanBox({ //OpenMes_mesqrcodeinout  老提示
					data: {
						qrCode: e
					},
					success: (res) => {
						//排除(B)后面的内容
						// if (matchRlt != null && matchRlt.length > 1){
						// 	res.proLot = '条码特殊处理';
						// }
						if (res.sheetQty <= 0) {
							uni.showToast({
								title: '数量不能为负数！',
								icon: 'none'
							})
							util.showAudio();
							return;
						}
						for (var i = 0; i < this.details.length; i++) {
							let item = this.details[i];
							if (item.qrCode == e) {
								this.onScrollTop(i);
								var _self = this;
								uni.showModal({
									title: '提示',
									content: '该标签已扫描,是否要删除',
									success: function(res_mod) {
										if (res_mod.confirm) {
											_self.totalQty = util.floatObj.subtract(_self.totalQty, _self.details[i].totalQty);
											if (_self.totalQty == null || isNaN(_self.totalQty)) {
												_self.totalQty = 0;
											}
											_self.details.splice(i, 1);
										} else if (res_mod.cancel) {}
									}
								});
								util.showAudio();
								return;
							}
						}

						/* 检验货架是否存在 */
						apis.storage_RasCun({
							data: {
								tagId: res.tagId
							},
							success: (res1) => {
								if (_sefl.details.length > 0) {
									if (_sefl.details[0].model.partItemNo != res.partItemNo) {
										uni.showToast({
											title: '与第一次物料不相同!!!',
											icon: 'none'
										});

										util.showAudio();
										_sefl.$refs.input_part.setFocus();
										return;
									} else {
										this.details.push({
											model: res,
											qrCode: e
										});
									}
								} else {
									this.details.push({
										model: res,
										qrCode: e
									});
								}
								_sefl.totalQty = util.floatObj.add(_sefl.totalQty, res.sheetQty);
								util.showScanedAudio();
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
				});
			},
			/* 保存 */
			onSave() {
				if (this.details.length == 0) {
					uni.showToast({
						title: '没有提交的数据！！',
						icon: 'none'
					});
					return;
				}
				var _self = this;
				for (var i = 0; i < this.details.length; i++) {
					var item = this.details[i];
					if (item.model.tagDetails) {
						item.model.tagDetails.forEach(function(item_tag) {
							item.sheetType = item_tag.sheetType;
							item.sheetNo = item_tag.sheetNo;
							item.sheetLot = item_tag.sheetLot;
							item.partNo = item_tag.partNo;
							item.purLot = item_tag.poMoSoLot; //采购批号
							item.proLot = item_tag.proLot; //供应商生产批号
							item.sheetQty = item_tag.sheetQty; //数量
							item.inLot = item_tag.inLot; //批次号
							item.proDate = item_tag.proDate; //日期
							item.tagId = item_tag.tagId; //标签ID
							item.boxTagId = item_tag.boxTagId; //箱号标签ID
							item.custTagId = item_tag.custTagId; //客户标签ID
							item.ordLot = item_tag.ordLot; //订单批号
							item.custNo = item_tag.custNo; //供应商内码
							if (_self.isStorageBin) {
								item.binNo = _self.binNo; //储位
								item.binWhNo = _self.binWhNo; //仓库
							} else {
								item.binNo = _self.binWhNo; //仓库
								item.binWhNo = _self.binWhNo; //仓库
							}
							item.qrCode = item.qrCode; //标签内容
							item.inoutFlag = "1"; //上下架标记 1、上架；2、下架
							item.sourceType = "1"; //来源类型 1.盘点
							item.entityState = consts.entityState.added;
						})
					} else {
						item.sheetType = item.model.sheetType;
						item.sheetNo = item.model.sheetNo;
						item.sheetLot = item.model.sheetLot;
						item.partNo = item.model.partNo;
						item.purLot = item.model.poMoSoLot; //采购批号
						item.proLot = item.model.proLot; //供应商生产批号
						item.sheetQty = item.model.sheetQty; //数量
						item.inLot = item.model.inLot; //批次号
						item.proDate = item.model.proDate; //日期
						item.tagId = item.model.tagId; //标签ID
						item.boxTagId = item.model.boxTagId; //箱号标签ID
						item.custTagId = item.model.custTagId; //客户标签ID
						item.ordLot = item.model.ordLot; //订单批号
						item.custNo = item.model.custNo; //供应商内码
						if (this.isStorageBin) {
							item.binNo = this.binNo; //储位
							item.binWhNo = this.binWhNo; //仓库
						} else {
							item.binNo = this.binWhNo; //仓库
							item.binWhNo = this.binWhNo; //仓库
						}
						item.qrCode = item.qrCode; //标签内容
						item.inoutFlag = "1"; //上下架标记 1、上架；2、下架
						item.sourceType = "1"; //来源类型 1.盘点
						item.entityState = consts.entityState.added;
					}
				}
				uni.showLoading({
					mask: true
				});
				apis.storage_Ras({
					data: this.details,
					success: (res) => {
						uni.showToast({
							title: '保存成功'
						});
						util.dataInit(this);
						//恢复扫描储位控件信息
						_self.isStorageBin = storage.get(consts.storageKeys.IsStorageBin);
						if (_self.isStorageBin) {
							_self.placeholder_store = '扫描储位';
						} else {
							_self.placeholder_store = '扫描仓库';
						}
						this.$refs.input_store.setFocus();
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
