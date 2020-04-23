<!--生产退库-明细 -->
<template>
	<view>
		<view id="viewHeader">
			<!-- 头表信息 -->
			<!-- 检查过不启用储位情况 -->
			<barcode-input ref="input_store" @onScaned="onScanStorage" v-if="isStorageBin" focus="true" :clearScan="false"
			 :placeholder="placeholder_store"></barcode-input>
			<barcode-input ref="input_part" @onScaned="onPartScaned" :focus="isStorageBin == false" placeholder="请扫描料号"></barcode-input>

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
							<view class="uni-triplex-right">
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">单位:{{item.unitName}}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">已扫描数量:{{item.scanQty}}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">未扫描数量:{{item.lastScanQty}}</text>
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

	import apis from '../../common/apiService.js'; //系统api
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js'; //常用功能
	import { mapMutations } from 'vuex';
	export default {
		components: {
			barcodeInput
		},
		data() {
			return {
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				placeholder_store: '',
				isStorageBin: null, //是否启用储位，否改储位
				binNo: '',
				binWhNo: '',
				orderItemSelected: {},
				details: []
			}
		},
		onLoad(option) {

			this.details.push(JSON.parse(option.detail));
			console.log(this.details)
			this.details.forEach(function(item) { //只有一条
				item.scanQty = 0;
				item.lastScanQty = item.sheetQty;
			});
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
								console.log(this.binNo + '----' + this.binWhNo);
								this.$refs.input_part.setFocus();
								util.showScanedAudio();
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
				var _self = this;
				apis.OpenMes_mesqrcodeinout({
					data: {
						qrCode: e
					},
					success: (res) => {
						//console.log("res: " + JSON.stringify(res));
						let isexist = false;
						for (var i = 0; i < this.details.length; i++) {
							let item = this.details[i];
							if (item.tagId == res.tagId) {
								_self.onScrollTop(i);
								uni.showModal({
									title: '提示',
									content: '该标签已扫描,是否要删除',
									success: function(res_mod) {
										if (res_mod.confirm) {
											_self.details.splice(i, 1);
											_self.updateScanList(-item.sheetQty);
										} else if (res_mod.cancel) {}
									}
								});
								util.showAudio();
								return;

							}
							if (item.partItemNo == res.partItemNo || item.purLot == res.poMoSoLot) {
								if (item.sheetQty - item.scanQty < res.sheetQty) {
									//判断是否超出应退数量
									uni.showToast({
										title: '超出应收数量',
										icon: 'none'
									});
									util.showAudio();
									_self.onScrollTop(i);
									_self.$refs.input_part.setFocus();
									return;
								}
								isexist = true;
								_self.onScrollTop(i);

								if (res.tagDetails) { //取箱，卡，混  第二层
									res.tagDetails.forEach(function(item_tag) {
										if (_self.isStorageBin) {
											item_tag.binNo = _self.binNo;
											item_tag.binWhNo = _self.binWhNo;
										} else {
											item_tag.binNo = item.whNo;
											item_tag.binWhNo = item.whNo;
										}
										item_tag.sheetQty = Number(res.sheetQty);
										item_tag.scan_qrCode = e;
										item.tagDetails = item.tagDetails || [];
										item.tagDetails.push(item_tag);
									})
								} else { //内包装
									if (_self.isStorageBin) {
										res.binNo = _self.binNo;
										res.binWhNo = _self.binWhNo;
									} else {
										res.binNo = item.whNo;
										res.binWhNo = item.whNo;
									}
									res.sheetQty = Number(res.sheetQty);
									res.scan_qrCode = e;
									item.tagDetails = item.tagDetails || [];
									item.tagDetails.push(res);
								}
								uni.showToast({
									title: '扫描成功'
								});

								console.log(util.outputLog(_self.details))
								_self.updateScanList();
								this.$refs.input_part.clear();
								util.showScanedAudio();
								util.automateSave(_self.details, 'lastScanQty', 0, _self.onSave);
								break;
							}
						}
						if (!isexist) {
							uni.showToast({
								title: '当前上架物料错误！！',
								icon: 'none'
							});
							util.showAudio();
						}
						// if (res.fullInspectionSw != 1) {
						// 	//未全检
						// 	uni.showToast({
						// 		title: '请先进行全检',
						// 		icon: 'none'
						// 	});
						// 	util.showAudio();
						// 	this.onScrollTop(index);
						// 	return;
						// }
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
				var _self = this;
				for (var i = 0; i < this.details.length; i++) {
					var item = this.details[i];
					if (item.lastScanQty > 0) {
						uni.showToast({
							title: '还有未上架的物料',
							icon: 'none'
						});
						return;
					}
				}
				var list = [];
				for (var i = 0; i < this.details.length; i++) {
					var item = this.details[i];
					item.tagDetails = item.tagDetails || [];
					if (item.tagDetails.length > 0) {
						for (let j = 0; j < item.tagDetails.length; j++) {
							let childItem = item.tagDetails[j];
							childItem.sheetLot = item.sheetLot;
							childItem.sheetDate = item.sheetDate;
							childItem.sheetNo = item.sheetNo;
							childItem.partSpec = item.partSpec;
							childItem.partAttr = item.partAttr;
							childItem.purLot = item.purLot;
							childItem.proLot = item.proLot;
							childItem.inoutFlag = "1"; //上架
							childItem.entityState = consts.entityState.added;
							list.push(childItem);
						}
					}
				}
				uni.showLoading({
					title: '加载中',
					mask: true
				});
				apis.acceptreturn_Save({
					data: list,
					success: (res) => {
						uni.showToast({
							title: '保存成功'
						});
						_self.pageIO_true();
						util.showScanedAudio();
						setTimeout(function() {
							uni.navigateBack();
						}, 600)
						if (_self.isStorageBin) {
							_self.placeholder_store = '扫描储位';
						} else {
							_self.placeholder_store = '扫描仓库';
						}

					},
					failure: (message) => {
						util.showAudio();
						//this.$refs.input_store.setFocus();
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
			updateScanList() {
				//更新列表结果
				var scanQty = 0;
				if (this.orderItemSelected.tagDetails) {
					for (var i = 0; i < this.orderItemSelected.tagDetails.length; i++) {
						scanQty = util.floatObj.add(scanQty, this.orderItemSelected.tagDetails[i].sheetQty);
					}
				}
				this.orderItemSelected.scanQty = scanQty;
				this.orderItemSelected.lastScanQty = util.floatObj.subtract(this.orderItemSelected.sheetQty, scanQty); //单个赋值有时数据源不会更新视图
				var ItemSelected = util.clone(this.orderItemSelected); //所以先复制一份，（搞绝一点，赋值不要直接引用赋值）
				this.orderItemSelected = ItemSelected; //重新给他赋值就更新好了
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
