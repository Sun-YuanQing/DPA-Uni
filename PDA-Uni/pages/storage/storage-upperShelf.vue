<!-- 仓内上架 -->
<template>
	<view>
		<!-- 顶部 -->
		<view id="viewHeader">
			<!-- 扫描货架 -->
			<barcode-input ref="input_store" @onScaned="onScanStorage" focus="true" :clearScan="false" :placeholder="placeholder_store"></barcode-input>
			<!-- 扫描上架物料 -->
			<barcode-input ref="input_part" @onScaned="onPartScaned" placeholder="请扫描上架料号"></barcode-input>
		</view>
		<!-- 显示仓内下架的信息 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">料号:{{item.model.partItemNo}}</text>
								<text class="uni-title">批次:{{item.model.inLot}}</text>
								<text class="uni-title">数量: {{item.model.sheetQty}}</text>
								<text class="uni-title">{{isStorageBin?'上架货架:'+(binNo||''):'上架库位:'+(binWhNo||'')}}</text>
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
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				placeholder_store: '',
				isStorageBin: null, //是否启用储位，否改储位
				binNo: '',
				binWhNo: ''
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
		onReady() {
			util.getListHeight(this);

		},
		/* 设置返回上一页 */
		onBackPress(options) {
			return util.backPress(options, this.details.length > 0);
		},
		methods: {
			onScanStorage(e) {
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
								this.$refs.input_store.setFocus();
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
								this.$refs.input_store.setFocus();
								util.showAudio();
							} else {
								this.binWhNo = res[0].whNo;
								this.$refs.input_part.setFocus();
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
			/* 扫描上架货物 */
			onPartScaned(e) {
				var _self = this;
				uni.showLoading({
					title: '加载中...',
					mask: true
				});
				/*调用下架货物标签 */
				apis.OpenMes_mesqrcodeinout({
					data: {
						qrCode: e
					},
					success: (res) => {
						for (var i = 0; i < this.details.length; i++) {
							let item = this.details[i];
							if (item.qrCode == e) {
								this.onScrollTop(i);
								uni.showModal({
									title: '提示',
									content: '该标签已扫描,是否要删除',
									success: function(res_mod) {
										if (res_mod.confirm) {
											_self.details.splice(i, 1);
										} else if (res_mod.cancel) {}
									}
								});
								return;
							}
						}
						/* 校验储位(货架)是否存在 */
						apis.storage_Transfer({
							data: {
								inoutFlag: '1', //上架
								tagId: res.tagId,
								binNo: _self.binNo || _self.binWhNo
							},
							success: (res2) => {
								if (res.tagDetails) {
									res.tagDetails.forEach(function(item_tag) {
										item_tag.binNo_Up = _self.binNo || _self.binWhNo
										item_tag.binWhNo_Up = _self.binWhNo;
									})
								} else {
									res.binNo_Up = _self.binNo || _self.binWhNo
									res.binWhNo_Up = _self.binWhNo;
								}

								_self.details.push({ //扫的自带qrCode
									model: res,
									qrCode: e
								})
								util.showScanedAudio();
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
			/* 提交方法 */
			save: function() {

				if (this.isStorageBin) {
					if (this.binNo.trim() == '') {
						uni.showToast({
							title: '请扫描货架',
							icon: 'none'
						})
						this.$refs.input_store.setFocus();
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
				if (this.details.length == 0) {
					uni.showToast({
						title: '请先扫描上架物料',
						icon: 'none'
					})
					this.$refs.input_part.setFocus();
					return;
				}
				var _self = this;
				/* 缓存数据 */
				var list = [];
				for (var i = 0; i < this.details.length; i++) {
					var item = this.details[i];
					if (item.model.tagDetails) {
						item.model.tagDetails.forEach(function(item_tag) {
							var data = {}; //上架数据 
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
								data.binNo = _self.binNo; //储位
								data.binWhNo = _self.binWhNo; //
							} else {
								data.binNo = _self.binWhNo; //储位
								data.binWhNo = _self.binWhNo; //
							}
							data.qrCode = item.qrCode; //标签内容
							data.sourceType = "1"; //来源类型 1.盘点
							data.inoutFlag = "1"; //上架
							data.entityState = consts.entityState.added;
							list.push(data);
							console.log('箱---------')
						})
					} else {
						var data = {}; //上架数据 
						data.sheetType = item.model.sheetType;
						data.sheetNo = item.model.sheetNo;
						data.sheetLot = item.model.sheetLot;
						data.partNo = item.model.partNo;
						data.purLot = item.model.poMoSoLot; //采购批号
						data.proLot = item.model.proLot; //供应商生产批号
						data.sheetQty = item.model.sheetQty; //数量
						data.inLot = item.model.inLot; //批次号
						data.proDate = item.model.proDate; //日期
						data.tagId = item.model.tagId; //标签ID
						data.boxTagId = item.model.boxTagId; //箱号标签ID
						data.custTagId = item.model.custTagId; //客户标签ID
						data.ordLot = item.model.ordLot; //订单批号
						data.custNo = item.model.custNo; //供应商内码
						if (this.isStorageBin) {
							data.binNo = this.binNo; //储位
							data.binWhNo = this.binWhNo; //
						} else {
							data.binNo = this.binWhNo; //储位
							data.binWhNo = this.binWhNo; //
						}
						data.qrCode = item.qrCode; //标签内容
						data.sourceType = "1"; //来源类型 1.盘点
						data.inoutFlag = "1"; //上架
						data.entityState = consts.entityState.added;
						list.push(data);
						console.log('内---------')
					}
				}
				console.log(util.outputLog(list));

				uni.showLoading({
					title: '加载中',
					mask: true
				});
				apis.stroage_TransferSide({
					data: list,
					success: (res) => {
						uni.showToast({
							title: '保存成功'
						})
						util.dataInit(this);
						if (_self.isStorageBin) {
							_self.placeholder_store = '扫描储位';
						} else {
							_self.placeholder_store = '扫描仓库';
						}
						this.$refs.input_store.setFocus();
						this.$refs.input_store.clear();
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
				return list;
			},
			/* 当选中列表时的背景颜色 */
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
