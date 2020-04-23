<!-- 仓内下架-->
<template>
	<view>
		<!-- 顶部 -->
		<view id="viewHeader">
			<!-- 扫描下架物料 -->
			<barcode-input ref="input_part" @onScaned="onPartScaned" focus="true" placeholder="请扫描下架料号"></barcode-input>
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
								<text class="uni-title">下架货架: {{item.model.reservelocus}}</text>
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
				scrollHeight: 0
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
			/* 扫描下架货物 */
			onPartScaned(e) {
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
								return;
							}
						}
						if (res.binWhNo == res.reservelocus) {
							uni.showToast({
								title: '当前物料已下架',
								icon: 'none'
							})
							return;
						}

						/* 校验储位(货架)是否存在 */
						apis.storage_Transfer({
							data: {
								inoutFlag: '2', //下架
								tagId: res.tagId
							},
							success: (res2) => {
								this.details.push({
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
				if (this.details.length == 0) {
					uni.showToast({
						title: '请先扫描下架物料',
						icon: 'none'
					})
					this.$refs.input_part.setFocus();
					return;
				}
				var _self = this;
				/* 缓存数据 */
				var list = [];
				console.log(util.outputLog(_self.details));
				console.log(_self.details.length);
				for (var i = 0; i < _self.details.length; i++) {
					var item = _self.details[i];
					if (item.model.tagDetails > 0) {
						item.model.tagDetails.forEach(function(item_tag) {
							var data = {}; //下架数据 
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
							data.qrCode = item.qrCode; //标签内容
							if (_self.isStorageBin) {
								data.binNo = item_tag.binNo; //储位
								data.binWhNo = item_tag.binWhNo; //仓库
							} else {
								data.binNo = item_tag.binWhNo; //储位
								data.binWhNo = item_tag.binWhNo; //仓库	
							}
							data.reservelocus = item_tag.reservelocus;
							data.inoutFlag = "2"; //下架
							data.entityState = consts.entityState.added;
							list.push(data);
							console.log(data);
						})
					} else {
						var data = {}; //下架数据 
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
						data.qrCode = item.qrCode; //标签内容
						if (_self.isStorageBin) {
							data.binNo = item.model.binNo; //储位
							data.binWhNo = item.model.binWhNo; //仓库
						} else {
							data.binNo = item.model.binWhNo; //储位
							data.binWhNo = item.model.binWhNo; //仓库	
						}
						data.reservelocus = item.model.reservelocus;
						data.inoutFlag = "2"; //下架
						data.entityState = consts.entityState.added;
						list.push(data);
						console.log(data);
					}
				}
				console.log(util.outputLog(list));

				uni.showLoading({
					title: '加载中',
					mask: true
				});
				apis.stroage_TransferInoutFag({
					data: list,
					success: (res) => {
						uni.showToast({
							title: '保存成功'
						})
						util.dataInit(this);
						this.$refs.input_part.setFocus();
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
