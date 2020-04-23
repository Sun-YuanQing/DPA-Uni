<!--装箱(已打外箱，不打印，只保存数据) -->
<template>
	<view>
		<view id="viewHeader">
			<barcode-input ref="input_part" :focus="true" @onScaned="onPartScaned" placeholder="扫描内包装"></barcode-input>
			<barcode-input ref="input_box" @onScaned="onBoxScaned" placeholder="扫描外箱"></barcode-input>
			<view>
				<!-- <view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						工单号:
					</view>
					<view class="uni-list-cell-db">
						{{scanBoxTagModel.purLot}}
					</view>
				</view> -->
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">料号:</view>
					<view class="uni-list-cell-db">{{ scanBoxTagModel.partItemNo }}</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">物料名称:</view>
					<view class="uni-list-cell-db">{{ scanBoxTagModel.partName }}</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">外箱数量:</view>
					<view class="uni-list-cell-db">{{ scanBoxTagModel.sheetQty ? scanBoxTagModel.sheetQty : '' }}</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">每箱数量:</view>
					<view class="uni-list-cell-db">{{ scanBoxTagModel.boxPackingQty }}</view>
					<view class="uni-list-cell-left">已扫描数量:</view>
					<view class="uni-list-cell-db">{{ scanBoxTagModel.totalQty }}</view>
				</view>
			</view>
		</view>
		<!-- 显示入库单明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item, index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)" v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">标签ID:{{ item.tagId }}</text>
							</view>
							<view class="uni-triplex-right">
								<text class="uni-h5" style="margin-left: -300upx;">单位:{{ item.unitName }}</text>
								<text class="uni-h5" style="margin-left: -300upx;">数量:{{ item.sheetQty }}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm"><button type="primary" @click="onSave">封箱</button></page-foot>
	</view>
</template>

<script>
import barcodeInput from '../../components/barcode-input/barcode-input.vue'; //扫码组件

import apis from '../../common/apiService.js'; //系统api
import consts from '../../common/consts.js';
import storage from '../../common/storage.js';
import util from '../../common/util.js'; //常用功能

let tmpHeight = 0;
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
			details: [],
			erpInterfaceType: null, //一体个性化
			scanBoxTagModel: {
				//purLot:'',
				partItemNo: '',
				partName: '',
				boxPackingQty: '',
				totalQty: 0,
				sheetQty: 0
			} //扫描的外箱
		};
	},
	onLoad(option) {
		this.erpInterfaceType = storage.get(consts.storageKeys.erpInterfaceType);
		console.log(this.erpInterfaceType);
	},
	onReady() {
		util.getListHeight(this);
	},
	onBackPress(options) {
		return util.backPress(options, this.details.partItemNo != undefined);
	},
	methods: {
		onBoxScaned(e) {
			//料品信息标签扫描完成
			var _sefl = this;
			uni.showLoading({
				mask: true
			});
			apis.base_scanBox({
				data: {
					qrCode: e
				},
				success: res => {
					var totalQty = _sefl.scanBoxTagModel.totalQty || 0;
					if (res.tagDetails.length > 0) {
						uni.showToast({
							title: '已装箱，不可再装！（mes有拆箱）',
							icon: 'none'
						});
						util.showAudio();
						return;
					}
					/* 已扫 */
					if (this.details.length > 0) {
						console.log(this.erpInterfaceType + '------' + consts.erpInterfaceType.anfeinuo);
						if (this.erpInterfaceType == consts.erpInterfaceType.anfeinuo) {
							console.log(this.details[0].poMoSoLot + '工单号不一致' + res.poMoSoLot);
							if (this.details[0].poMoSoLot != res.poMoSoLot) {
								uni.showToast({
									title: '工单号不一致',
									icon: 'none'
								});
								util.showAudio();
								return;
							}
							console.log(this.details[0].inLot + '批次号不一致' + res.inLot);
							if (this.details[0].inLot != res.inLot) {
								uni.showToast({
									title: '批次号不一致！',
									icon: 'none'
								});
								util.showAudio();
								return;
							}
							console.log(this.details[0].partItemNo + '物料编码不一致' + res.partItemNo);
							if (this.details[0].partItemNo != res.partItemNo) {
								uni.showToast({
									title: '物料编码不一致！',
									icon: 'none'
								});
								util.showAudio();
								return;
							}
							console.log(this.details[0].proLot + '年周不一致' + res.proLot);
							if (this.details[0].proLot != res.proLot) {
								//朱勇军
								uni.showToast({
									title: '年周不一致',
									icon: 'none'
								});
								util.showAudio();
								return;
							}
							console.log(this.details[0].suPartNo + '客户料号不一致' + res.suPartNo);
							if (this.details[0].suPartNo != res.suPartNo) {
								//朱勇军
								uni.showToast({
									title: '客户料号不一致',
									icon: 'none'
								});
								util.showAudio();
								return;
							}
						}
					}

					res.qrCode = e;
					_sefl.scanBoxTagModel = res;
					_sefl.scanBoxTagModel.totalQty = totalQty;
					if (_sefl.scanBoxTagModel.totalQty > _sefl.scanBoxTagModel.sheetQty) {
						uni.showToast({
							title: '与外箱数量不一致',
							icon: 'none'
						});
						util.showAudio();
						return;
					}
					util.showScanedAudio();
					console.log(_sefl.scanBoxTagModel);
				},
				failure: message => {
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
		onPartScaned(e) {
			//料品信息标签扫描完成

			uni.showLoading({
				mask: true
			});
			apis.basic_QRCodeAnalysis({
				data: {
					qrCode: e
				},
				success: res => {
					//校验批次、料号和数量是否正确
					//校验是否重复扫描
					console.log(res.boxTagId);
					if (res.boxTagId != '') {
						uni.showToast({
							title: '请扫内标签',
							icon: 'none'
						});
						util.showAudio();
						return;
					}
					if (res.inBoxNo.trim().length > 0) {
						uni.showToast({
							title: '该标签已在 ' + res.inBoxNo + ' 箱中！',
							icon: 'none'
						});
						util.showAudio();
						return;
					}
					/* 	if(this.scanBoxTagModel.boxTagId !=''|| this.scanBoxTagModel.boxTagId ){
								if (this.scanBoxTagModel.totalQty > this.scanBoxTagModel.sheetQty) {
									uni.showToast({
										title: '与外箱数量不一致',
										icon: "none"
									});
									util.showAudio();
									return;
								}
							} */

					res.qrCode = e;
					if (this.details.length > 0) {
						console.log(this.details[0].inLot + '批次号不一致' + res.inLot);
						if (this.details[0].inLot != res.inLot) {
							uni.showToast({
								title: '批次号不一致！',
								icon: 'none'
							});
							util.showAudio();
							return;
						}
						console.log(this.details[0].partItemNo + '物料编码不一致' + res.partItemNo);
						if (this.details[0].partItemNo != res.partItemNo) {
							uni.showToast({
								title: '物料编码不一致！',
								icon: 'none'
							});
							util.showAudio();
							return;
						}
						console.log(this.erpInterfaceType + '------' + consts.erpInterfaceType.anfeinuo);
						if (this.erpInterfaceType == consts.erpInterfaceType.anfeinuo) {
							console.log(this.details[0].proLot + '年周不一致' + res.proLot);
							if (this.details[0].proLot != res.proLot) {
								//朱勇军
								uni.showToast({
									title: '年周不一致',
									icon: 'none'
								});
								util.showAudio();
								return;
							}
							if (this.details[0].suPartNo != res.suPartNo) {
								//朱勇军
								uni.showToast({
									title: '客户料号不一致',
									icon: 'none'
								});
								util.showAudio();
								return;
							}
						}
					}
					for (var i = 0; i < this.details.length; i++) {
						let item = this.details[i];
						if (item.tagId == res.tagId) {
							var _self = this;
							var _scan = res;
							_self.onScrollTop(i);
							uni.showModal({
								title: '提示',
								content: '该标签已扫描,是否要删除',
								success: function(res_mod) {
									if (res_mod.confirm) {
										_self.details.splice(i, 1);
										_self.scanBoxTagModel.totalQty = util.floatObj.subtract(_self.scanBoxTagModel.totalQty, _scan.sheetQty);
									} else if (res_mod.cancel) {
									}
								}
							});
							util.showAudio();
							return;
						}
						console.log(this.details[0].poMoSoLot + '工单号不一致' + res.poMoSoLot);
						if (item.poMoSoLot != res.poMoSoLot) {
							uni.showToast({
								title: '工单号不一致',
								icon: 'none'
							});
							util.showAudio();
							return;
						}
						console.log(this.details[0].binWhNo + '所在仓库不一致' + res.binWhNo);
						if (item.binWhNo != res.binWhNo) {
							uni.showToast({
								title: '所在仓库不一致',
								icon: 'none'
							});
							util.showAudio();
							return;
						}
					}

					if (Number(this.scanBoxTagModel.boxPackingQty) == 0 || this.scanBoxTagModel.boxPackingQty >= util.floatObj.add(this.scanBoxTagModel.totalQty, res.sheetQty)) {
						res.sheetQty = Number(res.sheetQty);
						res.qrCode = e;
						this.details.push(res);
						this.onScrollTop(this.details.length - 1);
						this.scanBoxTagModel.totalQty = util.floatObj.add(res.sheetQty, this.scanBoxTagModel.totalQty);
						uni.showToast({
							title: '校验成功'
						});
						util.showScanedAudio();
					} else {
						uni.showToast({
							title: '超出装箱数量',
							icon: 'none'
						});
						util.showAudio();
						return;
					}
				},
				failure: message => {
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
		/* 保存 */
		onSave() {
			/* 克隆保存前数据，万一保存不成功对原数据没影响 */
			var scanBoxTagModel = util.clone(this.scanBoxTagModel);
			if (this.details.length <= 0) {
				uni.showToast({
					title: '未添加内包装!',
					icon: 'none'
				});
				util.showAudio();
				return;
			} else {
				if (this.details[0].partItemNo != this.scanBoxTagModel.partItemNo) {
					uni.showToast({
						title: '物料编码不一致！',
						//title: '批次号不一致！',
						icon: 'none'
					});
					util.showAudio();
					return;
				}
				if (this.details[0].inLot != this.scanBoxTagModel.inLot) {
					uni.showToast({
						title: '批次号不一致！',
						icon: 'none'
					});
					util.showAudio();
					return;
				}
				/* 如果是安费诺 */
				if (this.erpInterfaceType == consts.erpInterfaceType.anfeinuo) {
					/* 外箱有deiCode */
					if (scanBoxTagModel.proLot.length > 0) {
						if (this.details[0].proLot != scanBoxTagModel.proLot) {
							//朱勇军
							uni.showToast({
								title: '年周不一致',
								icon: 'none'
							});
							util.showAudio();
							return;
						}
					}
					/* else {
						scanBoxTagModel.proLot = this.details[0].proLot;
					} */
					if (scanBoxTagModel.suPartNo > 0) {
						if (this.details[0].suPartNo != scanBoxTagModel.suPartNo) {
							//朱勇军
							uni.showToast({
								title: '客户料号不一致',
								icon: 'none'
							});
							util.showAudio();
							return;
						}
					} else {
						scanBoxTagModel.suPartNo = this.details[0].suPartNo;
					}
				}
			}
			if (this.scanBoxTagModel.partItemNo == '') {
				uni.showToast({
					title: '未添加外箱!',
					icon: 'none'
				});
				util.showAudio();
				return;
			}

			if (scanBoxTagModel.totalQty > scanBoxTagModel.sheetQty) {
				uni.showToast({
					title: '与外箱数量不一致',
					icon: 'none'
				});
				util.showAudio();
				return;
			}
			//console.log(util.outputLog(model));
			scanBoxTagModel.bzType = 1; //包装类别 0、内箱( 默认) 1、外箱 2、卡板
			scanBoxTagModel.purLot = this.scanBoxTagModel.poMoSoLot;
			scanBoxTagModel.ordLot = this.details[0].ordLot; //订单号
			scanBoxTagModel.custNo = this.details[0].custNo; //客户
			scanBoxTagModel.entityState = consts.entityState.added;
			var sum = 0;
			for (var i = 0; i < this.details.length; i++) {
				var item = this.details[i];
				item.boxTagId = scanBoxTagModel.tagId;
				item.sheetLot = scanBoxTagModel.tagId;
				item.purLot = this.scanBoxTagModel.poMoSoLot;
				item.entityState = consts.entityState.added;
				sum += item.sheetQty;
				scanBoxTagModel.tagDetails = scanBoxTagModel.tagDetails || [];
				scanBoxTagModel.tagDetails.push(item);
			}
			if (sum > scanBoxTagModel.boxPackingQty && scanBoxTagModel.boxPackingQty > 0) {
				uni.showToast({
					title: '内包装数量,不能超过外箱最大包装数量!',
					icon: 'none'
				});
				util.showAudio();
				return;
			}
			console.log(scanBoxTagModel);
			//return;
			uni.showLoading({
				mask: true
			});

			apis.boxIO_post({
				data: scanBoxTagModel,
				success: res => {
					uni.showToast({
						title: '保存成功!'
					});
					util.dataInit(this);
				},
				failure: message => {
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
		scroll(e) {
			//滚动
			this.old.scrollTop = e.detail.scrollTop;
		},
		onScrollTop(index) {
			//滚动定位
			this.onSelectedItem(index);
			let view = uni
				.createSelectorQuery()
				.in(this)
				.select('.scroll-view-item');
			view.boundingClientRect(data => {
				this.scrollTop = this.old.scrollTop;
				this.$nextTick(function() {
					if (data == null) return;
					this.scrollTop = data.height * index;
				});
			}).exec();
		}
	}
};
</script>

<style></style>
