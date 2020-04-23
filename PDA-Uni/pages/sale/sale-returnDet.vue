<!-- 销售退货明细 -->
<template>
	<view>
		<view id="viewHeader">
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">
					单号:
				</view>
				<view class="uni-list-cell-db">
					{{order.sheetNo}}
				</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">
					仓库:
				</view>
				<view class="uni-list-cell-db">
					{{order.whName}}
				</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">
					料号:
				</view>
				<view class="uni-list-cell-db">
					{{order.partItemNo}}
				</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">
					退货数量:
				</view>
				<view class="uni-list-cell-db">
					{{order.sheetQty}}
				</view>

				<view class="uni-list-cell-left">
					已扫描数量:
				</view>
				<view class="uni-list-cell-db">
					{{scanTotalQty}}
				</view>
			</view>
			<view class="uni-list-cell input-row" v-if="isStorageBin">
				<view class="uni-list-cell-left">
					推荐货架:
				</view>
				<view class="uni-list-cell-db">
					{{order.binNostr}}
				</view>
			</view>
			<!-- 检查过不启用储位情况 -->
			<barcode-input ref="input_store" @onScaned="onScanStorage" v-if="isStorageBin" focus="true" :clearScan="false"
			 :placeholder="placeholder_store"></barcode-input>
			<barcode-input ref="input_part" @onScaned="onPartScaned"  :focus="isStorageBin == false" placeholder="请扫描料号"></barcode-input>
			<!-- 头表信息 -->
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
								<text class="uni-title">{{isStorageBin?'货架:'+item.binNo:'库位:'+item.binWhNo}}</text>
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
			<button type="primary" style="display: block; float: none;" @click="onSave">保存</button>
		</page-foot>
	</view>
</template>

<script>
	import barcodeInput from '../../components/barcode-input/barcode-input.vue' //扫码组件

	import apis from '../../common/apiService.js'; //系统api
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js'; //常用功能
	import { mapState, mapMutations } from 'vuex';
	export default {
		components: {
			barcodeInput
		},
		data() {
			return {
				progNo: '',
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				placeholder_store: '',
				isStorageBin: null, //是否启用储位，否改储位
				binNo: '',
				binWhNo: '',
				order: {
					"sheetNo": "",
					"partItemNo": "",
					"sheetQty": "",
					binNostr: '',
					whName: ''
				},
				details: [],
				scanTotalQty: 0
			}
		},
		onLoad(option) {
			let sheetLot = option.sheetLot || '';
			this.init(sheetLot);
			var _self = this;
			this.isStorageBin = storage.get(consts.storageKeys.IsStorageBin);
			if (this.isStorageBin) {
				_self.placeholder_store = '扫描储位';
			} else {
				_self.placeholder_store = '扫描仓库';
			}
		},
		onReady() {
			util.getListHeight(this);
		},
		onBackPress(options) {
			return util.backPress(options, this.details.length > 0);
		},
		methods: {
			...mapMutations(['pageIO_true']),
			init(e) {
				uni.showLoading({
					mask: true
				})
				apis.sale_getDetails({
					data: {
						sheetLot: e
					},
					success: (res) => {
						console.log(JSON.stringify(res))
						res.binNostr = ''
						res.binNos = res.binNos || [];
						for (var j = 0; j < res.binNos.length; j++) {
							if (j == 0) {
								res.binNostr = res.binNos[j];
							} else {
								res.binNostr = ',' + res.binNos[j];
							}
						}
						this.order = res;
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
				}
			},
			onPartScaned(e) {
				uni.showLoading({
					mask: true
				});
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
				}
				let _self = this;
				apis.OpenMes_mesqrcodeinout({
					data: {
						qrCode: e
					},
					success: (res) => {
						if (this.order.partItemNo != res.partItemNo) {
							uni.showToast({
								title: '标签扫描错误',
								icon: "none"
							});
							util.showAudio();
							return;
						}
						for (var i = 0; i < this.details.length; i++) {
							let item = this.details[i];
							if (item.tagId == res.tagId) {
								this.onScrollTop(i);
								uni.showModal({
									title: '提示',
									content: '该标签已扫描,是否要删除',
									success: function(res_mod) {
										if (res_mod.confirm) {
											_self.details.splice(i, 1);
											_self.scanTotalQty = util.floatObj.subtract(_self.scanTotalQty, res.sheetQty)
										} else if (res_mod.cancel) {}
									}
								});
								util.showAudio();
								return;
							}
						}
						if (util.floatObj.add(_self.scanTotalQty, res.sheetQty) > _self.order.sheetQty) {
							uni.showToast({
								title: '超出退货数量',
								icon: 'none'
							});
							util.showAudio();
							return;
						}
						uni.showToast({
							title: '扫描成功'
						});

						if (res.tagDetails) {
							res.tagDetails.forEach(function(item) {
								item.qrCode = e;
								if (_self.isStorageBin) {
									item.binNo = _self.binNo;
									item.binWhNo = _self.binWhNo;
								} else {
									item.binNo = _self.order.whNo;
									item.binWhNo = _self.order.whNo;
								}
							})
						} else {
							res.qrCode = e;
							if (_self.isStorageBin) {
								res.binNo = _self.binNo;
								res.binWhNo = _self.binWhNo;
							} else {
								res.binNo = _self.order.whNo;
								res.binWhNo = _self.order.whNo;
							}
						}
						_self.details.push(res)
						_self.scanTotalQty = util.floatObj.add(_self.scanTotalQty, res.sheetQty)
						this.onScrollTop(_self.details.length - 1);
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
				});
			},
			onSave() {
				//保存
				if (this.order.sheetQty != this.scanTotalQty) {
					uni.showToast({
						title: '还有未上架的物料',
						icon: 'none'
					});
					return;
				}
				var _self = this;
				var list = [];
				for (var i = 0; i < this.details.length; i++) {
					var item = this.details[i];
					if (item.tagDetails) {
						var len = item.tagDetails.length;
						for (var j = 0; j < len; j++) {
							var item_tag = item.tagDetails[j]
							var data = {}; //上架数据
							data.sheetType = this.order.sheetType;
							data.sheetNo = this.order.sheetNo;
							data.sheetLot = this.order.sheetLot;
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
							data.binNo = item_tag.binNo; //已处理
							data.binWhNo = item_tag.binWhNo; //已处理
							data.qrCode = item_tag.qrCode; //标签内容
							data.inoutFlag = "1"; //上架
							data.entityState = consts.entityState.added;
							list.push(data);
						}

					} else {
						var data = {}; //上架数据
						data.sheetType = this.order.sheetType;
						data.sheetNo = this.order.sheetNo;
						data.sheetLot = this.order.sheetLot;
						data.partNo = item.partNo;
						data.purLot = item.poMoSoLot; //采购批号
						data.proLot = item.proLot; //供应商生产批号
						data.sheetQty = item.sheetQty; //数量
						data.inLot = item.inLot; //批次号
						data.proDate = item.proDate; //日期
						data.tagId = item.tagId; //标签ID
						data.boxTagId = item.boxTagId; //箱号标签ID
						data.custTagId = item.custTagId; //客户标签ID
						data.ordLot = item.ordLot; //订单批号
						data.custNo = item.custNo; //供应商内码
						data.binNo = item.binNo; //已处理
						data.binWhNo = item.binWhNo; //已处理
						data.qrCode = item.qrCode; //标签内容
						data.inoutFlag = "1"; //上架
						data.entityState = consts.entityState.added;
						list.push(data);
					}
				}

				this.order.tagDetails = list;
				this.order.sheetSta = 2;
				this.order.entityState = consts.entityState.modified;
				let datas = [];
				datas.push(this.order);
				console.log(util.outputLog(datas));
				uni.showLoading({
					title: '加载中',
					mask: true
				});
				apis.sale_save_put({
					data: datas,
					success: (res) => {
						uni.showToast({
							title: '保存成功'
						});
						_self.pageIO_true();
						util.dataInit(this);
						if (_self.isStorageBin) {
							_self.placeholder_store = '扫描储位';
						} else {
							_self.placeholder_store = '扫描仓库';
						}
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
					if (data == null) return;
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
