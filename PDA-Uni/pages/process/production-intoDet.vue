<!--生产入库-入库单明细 -->
<template>
	<view>
		<view id="viewHeader">
			<!-- 头表信息 -->
			<view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						入库单号:
					</view>
					<view class="uni-list-cell-db">
						{{order.purLot}}
					</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						入库日期:
					</view>
					<view class="uni-list-cell-db">
						{{order.defineDate}}
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
						仓库:
					</view>
					<view class="uni-list-cell-db">
						{{order.whName}}
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
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						数量:
					</view>
					<view class="uni-list-cell-db">
						{{order.sheetQty}}
					</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						已扫描数量:
					</view>
					<view class="uni-list-cell-db">
						{{order.scanQty}}
					</view>
					<view class="uni-list-cell-left">
						未扫描数量:
					</view>
					<view class="uni-list-cell-db">
						{{order.lastScanQty}}
					</view>
				</view>
				<!-- 检查过不启用储位情况 -->
				<barcode-input ref="input_store" @onScaned="onScanStorage" v-if="isStorageBin" focus="true" :clearScan="false"
				 :placeholder="placeholder_store"></barcode-input>
				<barcode-input ref="input_part" @onScaned="onPartScaned" :focus="isStorageBin == false" placeholder="请扫描料号"></barcode-input>
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
								<text class="uni-title">料号:{{item.partItemNo}}</text>
								<text class="uni-title">料品名称:{{item.partName}}</text>
								<text class="uni-title">数量: {{item.sheetQty}}</text>
								<text class="uni-title">上架货架: {{isStorageBin? item.binNo:item.binWhNo}}</text>
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
				erpInterfaceType:null,
				placeholder_store: '',
				isStorageBin: null, //是否启用储位，否改储位
				binNo: '',
				binWhNo: '',
				order: {
					purLot: '',
					partItemNo: '',
					whName: '',
					sheetQty: 0,
					scanQty: 0,
					lastScanQty: 0,
					tagDetails: [],
					binNostr: '',
					defineDate: '' //入库日期
				},
				details: []
			}
		},
		onLoad(option) {
			console.log("option: " + JSON.stringify(option));
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
				apis.acceptin_Storage_GetDetails({
					data: {
						sheetLot: e
					},
					success: (res) => {
						//console.log(JSON.stringify(res))
						res.sheetQty = Number(res.sheetQty);
						res.scanQty = 0;
						res.lastScanQty = res.sheetQty;
						res.tagDetails = res.tagDetails || [];
						res.binNos = res.binNos || [];
						res.defineDate = new Date(res.defineDate).format('yyyy/MM/dd')||new Date().format('yyyy/MM/dd');
						res.binNostr = '';
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
				}
				//  else {
				// 	console.log(e);
				// 	apis.bas_wh({
				// 		data: {
				// 			filter: 'whNo = "' + e + '"'
				// 		},
				// 		success: (res) => {
				// 			console.log(util.outputLog(res));
				// 			if (res.length <= 0) {
				// 				uni.showToast({
				// 					title: '仓库不存在!',
				// 					icon: "none"
				// 				});
				// 				this.$refs.input_store.clear();
				// 				util.showAudio();
				// 			} else {
				// 				this.binWhNo = res[0].whNo;
				// 				console.log(this.binNo + '----' + this.binWhNo);
				// 				this.$refs.input_part.setFocus();
				// 				util.showScanedAudio();
				// 			}
				// 		},
				// 		complete: (status, message, content) => {
				// 			util.tryCatchApi({
				// 				status: status,
				// 				message: message
				// 			});
				// 			uni.hideLoading();
				// 		}
				// 	})
				// }

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
				//  else {
				// 	if (this.binWhNo.trim() == '') {
				// 		uni.showToast({
				// 			title: '请扫描库位',
				// 			icon: 'none'
				// 		})
				// 		this.$refs.input_store.setFocus();
				// 		return;
				// 	}
				// }

				var _self = this;
				apis.OpenMes_mesqrcodeinout({
					data: {
						qrCode: e
					},
					success: (res) => {
						//console.log("res: " + JSON.stringify(res));
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
											_self.updateScanList(-item.sheetQty);
										} else if (res_mod.cancel) {}
									}
								});
								util.showAudio();
								return;
							}
						}
						if (_self.order.partItemNo != res.partItemNo || _self.order.purLot != res.poMoSoLot) {
							uni.showToast({
								title: '标签扫描错误',
								icon: "none"
							});
							util.showAudio();
							return;
						}
						if (_self.order.sheetQty - _self.order.scanQty < res.sheetQty) {
							uni.showToast({
								title: '超出应上架数量',
								icon: 'none'
							});
							util.showAudio();
							return;
						}
						_self.erpInterfaceType = storage.get(consts.storageKeys.erpInterfaceType);
						if (_self.erpInterfaceType == consts.erpInterfaceType.sanwei) {
							if (res.fullInspectionSw != 1) {/* 朱永军，吴鹏都不需要 ，李艮要三维*/
								//未全检
								uni.showToast({
									title: '请先进行全检',
									icon: 'none'
								});
								util.showAudio();
								this.onScrollTop(index);
								return;
							}
						} 
						uni.showToast({
							title: '扫描成功'
						});

						if (res.tagDetails) {
							res.tagDetails.forEach(function(item) {
								if (_self.isStorageBin) {
									item.binNo = _self.binNo;
									item.binWhNo = _self.binWhNo;
								} else {
									item.binNo = _self.order.whNo;
									item.binWhNo = _self.order.whNo;
								}
								item.sheetQty = Number(res.sheetQty);
							})
						} else {
							if (_self.isStorageBin) {
								res.binNo = _self.binNo;
								res.binWhNo = _self.binWhNo;
							} else {
								res.binNo = _self.order.whNo;
								res.binWhNo = _self.order.whNo;
							}
							res.sheetQty = Number(res.sheetQty);
						}
						res.qrCode = e;
						this.details.push(res);
						this.updateScanList(res.sheetQty);
						this.onScrollTop(this.details.length - 1);
						this.$refs.input_part.clear();
						util.showScanedAudio();
						if (this.order.lastScanQty == 0){
							uni.showModal({
								title: '提示',
								content: '扫描完成是否要保存',
								success: function(res_mod) {
									if (res_mod.confirm) {
										_self.onSave(); 
									} else if (res_mod.cancel) {}
								}
							});
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
				});
			},
			updateScanList(val) {
				this.order.scanQty = util.floatObj.add(this.order.scanQty, val);
				this.order.lastScanQty = util.floatObj.subtract(this.order.sheetQty, this.order.scanQty);
			},
			onSave() {
				//保存
				var _self = this;
				if (this.order.lastScanQty > 0) {
					uni.showToast({
						title: '还有未上架的物料',
						icon: 'none'
					});
					return;
				}
				var list = [];
				for (var i = 0; i < this.details.length; i++) {
					var item = this.details[i];
					item.tagDetails = item.tagDetails || [];
					if (item.tagDetails.length > 0) {
						//扫描的是箱标签
						for (let j = 0; j < item.tagDetails.length; j++) {
							let childItem = item.tagDetails[j];
							var data = {}; //上架数据
							data.sheetType = this.order.sheetType;
							data.sheetNo = this.order.sheetNo;
							data.sheetLot = this.order.sheetLot;
							data.partNo = childItem.partNo;
							data.purLot = childItem.purLot; //采购批号
							data.proLot = childItem.proLot; //供应商生产批号
							data.sheetQty = Number(childItem.sheetQty); //数量
							data.inLot = childItem.inLot; //批次号
							data.proDate = childItem.proDate; //日期
							data.tagId = childItem.tagId; //标签ID
							data.boxTagId = childItem.boxTagId; //箱号标签ID
							data.custTagId = childItem.custTagId; //客户标签ID
							data.ordLot = childItem.ordLot; //订单批号
							data.custNo = childItem.custNo; //供应商内码
							if (this.isStorageBin) {
								data.binNo = this.binNo; //储位
								data.binWhNo = this.binWhNo; //
							} else {
								data.binNo = this.order.whNo;
								data.binWhNo = this.order.whNo;
							}
							data.qrCode = childItem.qrCode; //标签内容
							data.inoutFlag = "1"; //上架
							data.partDefine1=childItem.partDefine1||childItem.partDefine1;
							data.partDefine2=childItem.partDefine2||childItem.partDefine2;
							data.partDefine3=childItem.partDefine3||childItem.partDefine3;
							data.partDefine4=childItem.partDefine4||childItem.partDefine4;
							data.partDefine5=childItem.partDefine5||childItem.partDefine5;
							data.partDefine6=childItem.partDefine3||childItem.partDefine6;
							data.partDefine7=childItem.partDefine7||childItem.partDefine7;
							data.partDefine8=childItem.partDefine8||childItem.partDefine8;
							data.partDefine9=childItem.partDefine9||childItem.partDefine9;
							data.partDefine10=childItem.partDefine10||childItem.partDefine10;
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
						data.sheetQty = Number(item.sheetQty); //数量
						data.inLot = item.inLot; //批次号
						data.proDate = item.proDate; //日期
						data.tagId = item.tagId; //标签ID
						data.boxTagId = item.boxTagId; //箱号标签ID
						data.custTagId = item.custTagId; //客户标签ID
						data.ordLot = item.ordLot; //订单批号
						data.custNo = item.custNo; //供应商内码
						
						if (this.isStorageBin) {
							data.binNo = this.binNo; //储位
							data.binWhNo = this.binWhNo; //
						} else {
							data.binNo = this.order.whNo;
							data.binWhNo = this.order.whNo;
						}
						data.qrCode = item.qrCode; //标签内容
						data.inoutFlag = "1"; //上架
						data.partDefine1=item.partDefine1;
						data.partDefine2=item.partDefine2;
						data.partDefine3=item.partDefine3;
						data.partDefine4=item.partDefine4;
						data.partDefine5=item.partDefine5;
						data.partDefine6=item.partDefine3;
						data.partDefine7=item.partDefine7;
						data.partDefine8=item.partDefine8;
						data.partDefine9=item.partDefine9;
						data.partDefine10=item.partDefine10;
						data.entityState = consts.entityState.added;
						list.push(data);
					}
				}
				uni.showLoading({
					title: '加载中',
					mask: true
				});
				apis.acceptin_Storage_Save({
					data: list,
					success: (res) => {
						uni.showToast({
							title: '保存成功'
						});
						_self.pageIO_true();
						if (_self.isStorageBin) {
							_self.placeholder_store = '扫描储位';
						} else {
							_self.placeholder_store = '扫描仓库';
						}
						util.showScanedAudio();
						setTimeout(function(){
							uni.navigateBack();
						},600)
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
