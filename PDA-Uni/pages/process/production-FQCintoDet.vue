<!--FQC合格入库-入库单明细 -->
<template>
	<view>
		<view id="viewHeader">
			<!-- 头表信息 -->
			<view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">检验单号:</view>
					<view class="uni-list-cell-db">{{ order.sheetNo }}</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">料号:</view>
					<view class="uni-list-cell-db">{{ order.partItemNo }}</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">料品名称:</view>
					<view class="uni-list-cell-db">{{ order.partName }}</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">数量:</view>
					<view class="uni-list-cell-db">{{ order.sheetQty }}</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">已扫描数量:</view>
					<view class="uni-list-cell-db">{{ order.scanQty }}</view>
					<view class="uni-list-cell-left">未扫描数量:</view>
					<view class="uni-list-cell-db">{{ order.lastScanQty }}</view>
				</view>
				<view class="uni-list-cell input-row " style="height: 100%;">
					<view class="uni-list-cell-left">存放位置:</view>
					<view class="uni-list-cell-db">{{ isStorageBin ? binNo : binWhNo }}</view>
					<view style="width: 50%;">
						<barcode-input ref="input_store" @onScaned="onScanStorage" focus="true" :clearScan="false" :placeholder="placeholder_store"></barcode-input>
					</view>
				</view>
				<barcode-input ref="input_part" @onScaned="onPartScaned" placeholder="请扫描料号"></barcode-input>
			</view>
		</view>
		<!-- 显示入库单明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item, index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)" v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">料号:{{ item.partItemNo }}</text>
								<text class="uni-title">料品名称:{{ item.partName }}</text>
								<text class="uni-title">数量: {{ item.sheetQty }}</text>
								<text class="uni-title">
									放置位置: {{ item.binNo }}
									<text v-if="item.binNo.length <= 0" style="font-size:28upx ;color: #000000;">{{ item.binWhNo }}</text>
								</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>

		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm"><button type="primary" @click="onSave">保存</button></page-foot>
	</view>
</template>

<script>
import barcodeInput from '../../components/barcode-input/barcode-input.vue'; //扫码组件

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
			old: {
				scrollTop: 0
			},
			scrollTop: 0,
			scrollHeight: 0,
			isStorageBin: '', //启用储位
			placeholder_store: '', //扫描储位/仓库
			binNo: '',
			binWhNo: '',
			order: {
				purLot: '',
				sheetNo: '',
				partItemNo: '',
				partName: '',
				sheetQty: 0,
				scanQty: 0,
				lastScanQty: 0,
				tagDetails: [],
				binNostr: ''
			},
			details: []
		};
	},
	onLoad(option) {
		//获取是否启用储位缓存

		this.isStorageBin = storage.get(consts.storageKeys.IsStorageBin);
	this.order=this.urldata;
		this.order.scanQty = 0;
		this.order.lastScanQty = this.order.sheetQty;
		var _self = this;
		if (_self.isStorageBin) {
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
	computed: mapState(['urldata']),
	methods: {
		...mapMutations(['pageIO_true']),
		onScanStorage(e) {
			uni.showLoading({
				mask: true
			});
			if (this.isStorageBin) {
				apis.bas_storagebin({
					data: {
						binNo: e
					},
					success: res => {
						console.log(util.outputLog(res));
						if (res.length <= 0) {
							uni.showToast({
								title: '货架不存在!',
								icon: 'none'
							});
							this.$refs.input_store.clear();
							util.showAudio();
						} else {
							this.binNo = res[0].binNo;
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
				});
			} else {
				console.log(e);
				apis.bas_wh({
					data: {
						filter: 'whNo = "' + e + '"'
					},
					success: res => {
						console.log(util.outputLog(res));
						if (res.length <= 0) {
							uni.showToast({
								title: '仓库不存在!',
								icon: 'none'
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
				});
			}
		},
		onPartScaned(e) {
			uni.showLoading({
				mask: true
			});
			//料品信息标签扫描完成
			if (this.binWhNo.trim() == '') {
				uni.showToast({
					title: '请先扫描货架',
					icon: 'none'
				});
				this.$refs.input_store.setFocus();
				util.showAudio();
				return;
			}
			var _self = this;
			apis.OpenMes_mesqrcodeinout({
				data: {
					qrCode: e
				},
				success: res => {
					console.log(util.outputLog(res));
					if (res.boxSw != 0) {
						util.showAudio();
						uni.showToast({
							title: '不是封箱状态不能校验 ',
							icon: 'none'
						});
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
										_self.updateScanList(-item.sheetQty);
										console.log('_self.details: ' + JSON.stringify(_self.details));
									} else if (res_mod.cancel) {
									}
								}
							});
							util.showAudio();
							return;
						}
					}
					if (_self.order.partItemNo == res.partItemNo && _self.order.sheetNo == res.PoMoSoLot) {
						uni.showToast({
							title: '标签不属于该单据',
							icon: 'none'
						});
						util.showAudio();
					}
					if (_self.order.sheetQty - _self.order.scanQty < res.sheetQty) {
						uni.showToast({
							title: '超出应上架数量',
							icon: 'none'
						});
						util.showAudio();
						_self.onScrollTop(index);
						return;
					}

					uni.showToast({
						title: '扫描成功'
					});

					if (res.tagDetails) {
						res.tagDetails.forEach(function(item, i) {
							item.sourceNo = _self.order.sheetNo; //来源单号（检验单）
							if (_self.isStorageBin) {
								item.binNo = _self.binNo; //储位
								item.binWhNo = _self.binWhNo; //仓库
							} else {
								item.binNo = _self.binWhNo; //仓库
								item.binWhNo = _self.binWhNo; //仓库
							}
							item.purLot = _self.order.purLot; //采购批号
							item.inoutFlag = '1'; //上架
							item.qrCode = e;
							item.entityState = consts.entityState.added;
						});
					} else {
						res.sourceNo = _self.order.sheetNo; //来源单号（检验单）
						if (_self.isStorageBin) {
							res.binNo = _self.binNo; //储位
							res.binWhNo = _self.binWhNo; //仓库
						} else {
							res.binNo = _self.binWhNo; //仓库
							res.binWhNo = _self.binWhNo; //仓库
						}
						res.purLot = _self.order.purLot; //采购批号
						res.inoutFlag = '1'; //上架
						res.qrCode = e;
						res.entityState = consts.entityState.added;
					}
					this.details.push(res);
					console.log('this.details:----- ' + JSON.stringify(this.details));
					this.updateScanList(res.sheetQty);
					this.onScrollTop(this.details.length - 1);
					util.showScanedAudio();
					this.$refs.input_part.setFocus();
					if (_self.order.lastScanQty == 0) {
						uni.showModal({
							title: '提示',
							content: '完成是否保存?',
							success: function(res_mod) {
								if (res_mod.confirm) {
									_self.onSave();
								} else if (res_mod.cancel) {
									console.log('保存没有取消方法，取消了校验');
								}
							}
						});
					}
				},
				failure: message => {
					util.showAudio();
					this.$refs.input_part.setFocus();
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
		updateScanList(val) {
			this.order.scanQty = util.floatObj.add(this.order.scanQty, val);
			this.order.lastScanQty = util.floatObj.subtract(this.order.sheetQty, this.order.scanQty);
			this.order = this.order;
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

						list.push(childItem);
					}
				} else {
					list.push(item);
				}
			}
			uni.showLoading({
				title: '加载中',
				mask: true
			});
			apis.Pda_pdaaddacceptinbyfqcspcquality({
				data: list,
				success: res => {
					uni.showToast({
						title: '保存成功'
					});
					util.dataInit(_self);
					_self.pageIO_true();
					if (_self.isStorageBin) {
						_self.placeholder_store = '扫描储位';
					} else {
						_self.placeholder_store = '扫描仓库';
					}
					_self.$refs.input_store.clear();
					_self.$refs.input_store.setFocus();
				},
				failure: message => {
					util.showAudio();
					_self.$refs.input_store.setFocus();
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
				if (data == null) return;
				this.$nextTick(function() {
					this.scrollTop = data.height * index;
				});
			}).exec();
		}
	}
};
</script>

<style></style>
