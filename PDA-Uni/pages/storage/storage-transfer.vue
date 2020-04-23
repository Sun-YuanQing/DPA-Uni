<!-- 储位转移 -->
<template>
	<view>
		<!-- 顶部文件 -->
		<view id="viewHeader">
			<barcode-input ref="input_part" @onScaned="onPartScaned" focus="true" placeholder="请扫描下架料号"></barcode-input>
			<barcode-input ref="input_store" @onScaned="onScanStorage" :placeholder="placeholder_store" :clearScan="false"></barcode-input>
			<barcode-input ref="input_part2" @onScaned="onPartScaned2" placeholder="请扫描上架料号"></barcode-input>
		</view>
		<!-- 下拉列表 -->
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
								<text class="uni-title">下架库位: {{item.model.reservelocus}}</text>
								<text class="uni-title">上架库位:{{isStorageBin?(item.model.binNo_Up?item.model.binNo_Up:''):(item.model.binWhNo_Up ? item.model.binWhNo_Up: '')}}</text>
							</view>
							<view class="uni-triplex-right" style="min-width: 220upx;">
								<text class="uni-h5">状态:{{item.model.stateName}}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
		<!-- 底部文件 -->
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
				binWhNo: '',
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
			return util.backPress(options, this.details.length > 0);
		},
		methods: {
			/*扫描下架物料  */
			onPartScaned(e) {
				var scan_e = e;
				var _self = this;
				uni.showLoading({
					title: '加载中',
					mask: true
				});
				apis.OpenMes_mesqrcodeinout({
					data: {
						qrCode: e
					},
					success: (res) => {
						for (var i = 0; i < this.details.length; i++) {
							let item = this.details[i];
							if (item.tagDetails) {
								console.log(1)
								for (var j = 0; j < item.tagDetails.length; j++) {
									/* 校验成功 */
									if (item_tag.qrCode == e) {
										_self.onScrollTop(i);
										uni.showModal({
											title: '提示',
											content: '该标签已扫描,是否要删除',
											success: function(res_mod) {
												if (res_mod.confirm) {
													for (var t = 0; t < item.tagDetails.length; t++) {
														_self.details.splice(t, 1);
													}
												} else if (res_mod.cancel) {}
											}
										});
										return;
									}
								}
							} else {
								/* 校验成功 */
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

						}
						/* 校验货架是否存在校验 */
						apis.storage_Transfer({
							data: {
								inoutFlag: '2', //下架
								tagId: res.tagId
							},
							success: (res1) => {
								console.log(util.outputLog(res))
								if (res.tagDetails) {
									res.tagDetails.forEach(function(item_tag) {
										item_tag.state = '1'; //自定义已下架状态，上架要改
										item_tag.stateName = "已下架";
										console.log(item_tag)
										_self.details.push({
											model: item_tag,
											qrCode: scan_e
										})
									})
								} else {
									res.state = '1'; //自定义已下架状态，上架要改
									res.stateName = "已下架";
									_self.details.push({
										model: res,
										qrCode: e
									})
								}

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
					failure: (message) => {
						this.$refs.input_part.setFocus();
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
			/* 扫描上架货架 */
			onScanStorage(e) {
				if (e.length <= 0) {
					uni.showToast({
						title: '不能输入空值!',
						icon: "none"
					});
					return;
				}
				if (this.details.length == 0) {
					uni.showToast({
						title: '请先扫描下架物料',
						icon: 'none'
					})
					this.$refs.input_part.setFocus();
					util.showAudio();
					return;
				}
				/* 如果上架下架储位相同的情况 */
				if (e.toLowerCase() == this.details[0].model.reservelocus.toLowerCase()) {
					uni.showToast({
						title: '上架下架不能是同一个货架',
						icon: 'none'
					})
					util.showAudio();
					this.$refs.input_store.clear();
					return;
				}
				uni.showLoading({
					title: '加载中',
					mask: true
				});

				/* 检查货架是否存在 */
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
								this.$refs.input_part2.setFocus();
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
								this.$refs.input_store.setFocus();
								util.showAudio();
							} else {
								this.binWhNo = res[0].whNo;
								console.log(this.binNo + '----' + this.binWhNo);
								this.$refs.input_part.setFocus();
							}
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
			/* 扫描放入物料 */
			onPartScaned2(e) {
				var that = this;
				if (that.details.length == 0) {
					uni.showToast({
						title: '请先扫描下架物料',
						icon: 'none'
					})
					that.$refs.input_part.setFocus();
					util.showAudio();
					return;
				}
				//料品信息标签扫描完成
				if (this.isStorageBin) {
					if (that.binNo.trim() == '') {
						uni.showToast({
							title: '请先扫描上架货架',
							icon: 'none'
						});
						util.showAudio();
						that.$refs.input_store.setFocus();
						return;
					}
				} else {
					if (that.binWhNo.trim() == '') {
						uni.showToast({
							title: '请先扫描仓库',
							icon: 'none'
						});
						util.showAudio();
						that.$refs.input_store.setFocus();
						return;
					}
				}

				uni.showLoading({
					title: '加载中',
					mask: true
				});
				apis.OpenMes_mesqrcodeinout({
					data: {
						qrCode: e
					},
					success: (res) => {
						var isExist = false;
						for (var i = 0; i < that.details.length; i++) {
							let item = that.details[i];
							if (item.qrCode == e) {
								isExist = true;
								if (item.model.state == '1') {
									//未处理
									item.model.state = '2';
									item.model.stateName = '已上架';
									item.model.binNo_Up = that.binNo; //记录上架货架
									item.model.binWhNo_Up = that.binWhNo; //记录上架仓库
									that.onSelectedItem(i);
									util.showScanedAudio();
								} else {
									uni.showToast({
										title: '该物料已上架',
										icon: 'none'
									});
									util.showAudio();
								}
								return;
							}
						}
						if (!isExist) {
							uni.showToast({
								title: '该标签未下架！'
							})
							util.showAudio();
							return;
						} else {
							util.showScanedAudio();
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
			/* 所有下架货物都已扫描就保存 */
			save() {
				var _self = this;
				if (this.details.length == 0) {
					uni.showToast({
						title: '请先扫描下架物料',
						icon: 'none'
					})
					this.$refs.input_part.setFocus();
					return;
				}
				for (var i = 0; i < this.details.length; i++) {
					let item = this.details[i].model;
					if (item.state == '1') {
						uni.showToast({
							title: '当前货架还有物料未上架',
							icon: 'none'
						})
						onSelectedItem(i);
						return;
					}
				}

				/* 缓存数据 */
				var list = [];
				for (var i = 0; i < this.details.length; i++) {
					var item = this.details[i];
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
					if (_self.isStorageBin) {
						data.binNo = item.model.binNo; //储位
						data.binWhNo = item.model.binWhNo; //仓库
					} else {
						data.binNo = item.model.binWhNo; //储位
						data.binWhNo = item.model.binWhNo; //仓库	
					}
					data.qrCode = item.qrCode; //标签内容
					data.inoutFlag = "2"; //下架数据
					data.entityState = consts.entityState.added;
					list.push(data);  //下架数据

					var data2 = util.clone(data); //上架数据(拿下架改值)
					data2.inoutFlag = "1"; //上架
					if (_self.isStorageBin) {
						data2.binNo = item.model.binNo_Up; //上架储位
						data2.binWhNo = item.model.binWhNo_Up; //上架仓库
					} else {
						data2.binNo = item.model.binWhNo_Up; //上架储位
						data2.binWhNo = item.model.binWhNo_Up; //上架仓库
					}
					list.push(data2);//上架数据
				}
				uni.showLoading({
					title: '加载中',
					mask: true
				});
				apis.storage_TransferCount({
					data: list,
					success: (res) => {
						uni.showToast({
							title: '保存成功'
						});

						util.dataInit(this);
						this.$refs.input_store.clear();
						this.$refs.input_store.setFocus();
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
				return list;
			},
			/* 下拉列表选中时的背景颜色 */
			onSelectedItem(e) {
				for (var i = 0; i < this.details.length; i++) {
					let item = this.details[i];
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
