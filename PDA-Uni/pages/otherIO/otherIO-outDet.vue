<!--生产出库-出库单明细 （可以扫箱，除非不用拆）-->
<template>
	<view>
		<view id="viewHeader">
			<!-- 头表信息 -->
			<!-- 检查过不启用储位情况 -->
			<barcode-input ref="input_part" @onScaned="onPartScaned" :focus="true" placeholder="请扫描料号"></barcode-input>
		</view>
		<!-- 显示出库单明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item, index) in order.details" :key="index"> 
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)" v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">单号:{{ item.sheetNo }}</text>
								<text class="uni-title">单据时间:{{ item.sheetDate }}</text>
								<text class="uni-title">料号:{{ item.partItemNo }}</text>
								<text class="uni-title">料品名称:{{ item.partName }}</text>
								<text class="uni-title">仓库:{{ item.whName ? item.whName : '' }}{{ item.whNo ? '(' + item.whNo + ')' : '' }}</text>
								<text class="uni-title" v-if="isStorageBin">货架:{{ item.binName ? item.binName : '' }}{{ item.binNo ? '(' + item.binNo + ')' : '' }}</text>
							</view>
							<view class="uni-triplex-right">
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">批号:{{ item.sheetLot }}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">单位:{{ item.unitName }}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">数量:{{ item.sheetQty }}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">条码:{{ item.m_isScan ? '已较对' : '未较对' }}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>

		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm"><button type="primary" @click="onSave">保存</button></page-foot>
		<lotunpack :show="showLotUnpack" :model="printMode" :printDetail="printDetail" :progNo="progNo" @cancel="lotupackCancel"></lotunpack>
	</view>
</template>

<script>
import barcodeInput from '../../components/barcode-input/barcode-input.vue'; //扫码组件
import lotunpack from '../../components/lotunpack/lotunpack.vue';

import apis from '../../common/apiService.js'; //系统api
import consts from '../../common/consts.js';
import storage from '../../common/storage.js';
import util from '../../common/util.js'; //常用功能
import { mapState, mapMutations } from 'vuex';
export default {
	components: {
		barcodeInput,
		lotunpack
	},
	data() {
		return {
			progNo: '',
			old: {
				scrollTop: 0
			},
			scrollTop: 0,
			scrollHeight: 0,
			isStorageBin: null, //是否启用储位，否改储位
			binNo: '',
			binWhNo: '',
			showLotUnpack: false, //是否显示拆分打印
			printMode: {}, //需拆分的标签对象
			printDetail: [], //拆分结果
			orderItemSelected: {},
			order: {},
			scan_qrCode: [] //防止重扫
		};
	},
	onLoad(option) {
		this.progNo = option.progNo;
		this.order = this.urldata;
		this.isStorageBin = storage.get(consts.storageKeys.IsStorageBin);
	},
	onReady() {
		util.getListHeight(this);
	},
	onBackPress(options) {
		return util.backPress(options, this.order.details);
	},
	computed: mapState(['urldata']),
	methods: {
		...mapMutations(['pageIO_true']),
		onPartScaned(e) {
			var _self = this;
			uni.showLoading({
				mask: true
			});
			apis.OpenMes_mesqrcodeinout({
				data: {
					qrCode: e
				},
				success: res => {
					console.log(res);
					var res_sheetQty = 0;
					var m_partItemNo = false;
					var m_isqrCode = false;
					for (var i = 0; i < this.scan_qrCode.length; i++) {
						var qrCode = this.scan_qrCode[i];
						if (qrCode == e) {
							m_isqrCode = true;
						}
					}
					if (m_isqrCode) {
						uni.showToast({
							title: '该标签已扫!!!',
							icon: 'none'
						});
						util.showAudio();
						return;
					} else {
						this.scan_qrCode.push(e);
					}
					/* 求最大批号后缀*/
					var arrs = [];
					var reg = /\d+/g;
					this.order.details.forEach(function(item) {
						var sheetlot = item.sheetLot.match(reg);
						arrs.push(sheetlot[2]);
					});
					arrs.sort(function(a, b) {
						return a - b;
					});
					console.log(arrs);
					var sheetLot_max = parseInt(arrs[arrs.length - 1]) + 1; //最大批号后缀+1
					console.log(sheetLot_max);
					/* 扫描两次轮询判断数量 ,合适校验,第一次询相等,第二次处理大于小于,最后大于的话拆分*/
					for (var i = 0, len_details = this.order.details.length; i < len_details; i++) {
						var item = this.order.details[i];
						if (item.m_isScan) {
							continue;
						} else {
							item.tagDetails = item.tagDetails || [];
							item.m_isScan = false;
						}
						if (res.tagDetails) {
							if (res.tagDetails.length > 1) {
								//长度判断///不能一次拆多个标签
								uni.showToast({
									title: '请扫箱标签^_^',
									icon: 'none'
								});
								util.showAudio();
								return;
							}
							for (var j = 0, len = res.tagDetails.length; j < len; j++) {
								var tag = res.tagDetails[j];
								tag.qrCode = e;
								if (item.partItemNo != tag.partItemNo) {
									//物料相等
									m_partItemNo = false; //没扫到物料
									continue;
								}
								m_partItemNo = true;
								if (_self.isStorageBin) {
									//标签是在库存里的无论怎样都有值
									/* 一体化启用储位 有值*/
									// tag.binNo =tag.binNo;// _self.binNo;
									//tag.binWhNo = tag.binWhNo;//_self.binWhNo;
								} else {
									tag.binWhNo = tag.binWhNo || tag.binNo;
								}
								//插入标签的状态都是added
								tag.entityState = consts.entityState.added;
								if (item.sheetQty == tag.sheetQty) {
									console.log(item.sheetQty + '---' + tag.sheetQty);
									this.onScrollTop(i);
									item.m_isScan = true;

									tag.inoutFlag = 2; //下架
									item.tagDetails.push(tag);
									item.inLot = tag.inLot; //标签的批次号给明细
									item.proDate = new Date(tag.proDate).format('yyyy/MM/dd') || new Date().format('yyyy/MM/dd');
									util.showScanedAudio();
									break;
								}
							}
						} else {
							if (item.partItemNo != res.partItemNo) {
								//物料相等
								m_partItemNo = false; //没扫到物料
								continue;
							}
							m_partItemNo = true;
							res.qrCode = e;
							if (_self.isStorageBin) {
								//标签是在库存里的无论怎样都有值
								/* 一体化启用储位 有值*/
								// tag.binNo =tag.binNo;// _self.binNo;
								//tag.binWhNo = tag.binWhNo;//_self.binWhNo;
							} else {
								res.binWhNo = res.binWhNo || res.binNo;
							}
							res.entityState = consts.entityState.added;
							if (item.sheetQty == res.sheetQty) {
								console.log(item.sheetQty + '---' + res.sheetQty);
								this.onScrollTop(i);
								item.m_isScan = true;

								res.inoutFlag = 2; //下架
								item.tagDetails.push(res);
								item.inLot = res.inLot; //标签的批次号给明细
								item.proDate = new Date(res.proDate).format('yyyy/MM/dd') || new Date().format('yyyy/MM/dd');
								util.showScanedAudio();
								break;
							}
						}
					}
					/* 第二次轮询 比较大小，大就拆分 */
					console.log('第二次轮询 比较大小，大就拆分');
					for (var i = 0, len_details = this.order.details.length; i < len_details; i++) {
						console.log('第二次轮询 比较大小，大就拆分');
						var item = this.order.details[i];
						if (item.m_isScan) {
							continue;
						} else {
							item.tagDetails = item.tagDetails || [];
							item.m_isScan = false;
						}

						if (res.tagDetails) {
							if (res.tagDetails.length > 1) {
								//长度判断///不能一次拆多个标签
								uni.showToast({
									title: '请扫箱标签^_^',
									icon: 'none'
								});
								util.showAudio();
								return;
							}
							console.log('第二次轮询 比较大小，大就拆分');
							for (var j = 0, len = res.tagDetails.length; j < len; j++) {
								var tag = res.tagDetails[j];
								if (item.partItemNo != tag.partItemNo) {
									//物料相等
									m_partItemNo = false;
									continue;
								}
								m_partItemNo = true;
								if (_self.isStorageBin) {
									//标签是在库存里的无论怎样都有值
									/* 一体化启用储位 有值*/
									// tag.binNo =tag.binNo;// _self.binNo;
									//tag.binWhNo = tag.binWhNo;//_self.binWhNo;
								} else {
									tag.binWhNo = tag.binWhNo || tag.binNo;
								}
								//插出标签的状态都是added
								tag.entityState = consts.entityState.added;
								console.log(len);
								if (item.sheetQty < tag.sheetQty) {
									//拆分
									console.log(item.sheetQty + '---' + tag.sheetQty);
									this.onScrollTop(i);
									util.showAudio();
									uni.showModal({
										title: '提示',
										content: '外箱数量不能大于入库数量!!!',
										showCancel: false,
										success: function(res_mod) {
											if (res_mod.confirm) {
											} else if (res_mod.cancel) {
											}
										}
									});
									_self.$refs.input_part.setFocus();
									return;
								} else if (item.sheetQty > tag.sheetQty) {
									//标签数量比出库数量少
									console.log(item.sheetQty + '---' + tag.sheetQty);
									this.onScrollTop(i);
									var qty = util.floatObj.subtract(item.sheetQty, tag.sheetQty);
									item.sheetQty = Number(tag.sheetQty);
									var new_item = util.clone(item); //先克隆new_item.m_isScan=false;，再改变原来的值item.m_isScan = true;
									item.m_isScan = true;
									//----------
									tag.inoutFlag = 2; //下架
									item.tagDetails.push(tag);
									item.inLot = tag.inLot; //标签的批次号给明细
									item.proDate = new Date(tag.proDate).format('yyyy/MM/dd') || new Date().format('yyyy/MM/dd');
									//-----------
									new_item.m_isclone = true; //是克隆的，状态是新增，保存时统一改
									new_item.sheetLot = new_item.sheetLot.split('_')[0] + '_' + util.getSuffix(3, sheetLot_max); //新的批号
									new_item.sheetQty = qty;
									this.order.details.push(new_item);
									util.showScanedAudio();
									break;
								}
							}
						} else {
							if (item.partItemNo != res.partItemNo) {
								//物料相等
								m_partItemNo = false;
								continue;
							}
							m_partItemNo = true;
							if (_self.isStorageBin) {
								//标签是在库存里的无论怎样都有值
								/* 一体化启用储位 有值*/
								// tag.binNo =tag.binNo;// _self.binNo;
								//tag.binWhNo = tag.binWhNo;//_self.binWhNo;
							} else {
								res.binWhNo = res.binWhNo || res.binNo;
							}
							res.entityState = consts.entityState.added;
							if (item.sheetQty > res.sheetQty) {
								//标签数量比出库数量少
								console.log(item.sheetQty + '---' + res.sheetQty);
								this.onScrollTop(i);
								var qty = util.floatObj.subtract(item.sheetQty, res.sheetQty);
								item.sheetQty = Number(res.sheetQty);
								var new_item = util.clone(item); //先克隆new_item.m_isScan=false;，再改变原来的值item.m_isScan = true;
								item.m_isScan = true;

								res.inoutFlag = 2; //下架
								item.tagDetails.push(res);
								item.inLot = res.inLot; //标签的批次号给明细
								item.proDate = new Date(res.proDate).format('yyyy/MM/dd') || new Date().format('yyyy/MM/dd');

								new_item.m_isclone = true; //是克隆的，状态是新增，保存时统一改
								new_item.sheetLot = new_item.sheetLot.split('_')[0] + '_' + util.getSuffix(3, sheetLot_max); //新的批号
								new_item.sheetQty = qty;
								this.order.details.push(new_item);
								util.showScanedAudio();
								break;
							} else if (item.sheetQty < res.sheetQty) {
								//标签数量大于出库数量拆分
								console.log(item.sheetQty + '---' + res.sheetQty);
								this.onScrollTop(i);
								util.showScanedAudio();
								this.tag_split(res, item.sheetQty);
								return;
							}
						}
					}
					util.automateSave(_self.order.details, 'm_isScan', 1, _self.onSave);
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
		tag_split(tag, qty) {
			let unpackArr = [];
			unpackArr.push({
				num: 1,
				numQty: qty
			});
			//拆分
			unpackArr.push({
				num: 1,
				numQty: util.floatObj.subtract(tag.sheetQty, qty)
			});
			this.printMode = tag;
			this.printDetail = unpackArr;
			this.showLotUnpack = true;
		},
		onSave() {
			var _self = this;
			for (var i = 0; i < this.order.details.length; i++) {
				var item = this.order.details[i];
				if (!item.m_isScan) {
					util.showAudio();
					uni.showToast({
						icon: 'none',
						title: '请较对出库物料!'
					});
					return;
				}
				if (!item.m_isclone) {
					//不是克隆
					item.entityState = consts.entityState.modified;
				} else {
					//克隆是新增
					item.entityState = consts.entityState.added;
				}
				item.sheetSta = 2; /* 过账 */
			}
			this.order.entityState = consts.entityState.modified;
			this.order.sheetSta = 2; /* 过账 */
			console.log(_self.order);
			apis.OpenMes_other({
				data: _self.order,
				success: res => {
					uni.showToast({
						title: '保存成功!',
						icon: 'none'
					});
					util.dataInit(this);
					_self.pageIO_true();
					_self.isStorageBin = storage.get(consts.storageKeys.IsStorageBin);

					util.showScanedAudio();
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
		lotupackCancel() {
			/* 取消事件 */
			this.printDetail = []; /* 清空原有数据*/
			var len = this.scan_qrCode.length;
			this.scan_qrCode.splice(len - 1, 1);
			//隐藏拆分
			this.showLotUnpack = false;
			this.$refs.input_part.setFocus();
		},
		/* 选中的方法 */
		onSelectedItem(e) {
			for (var i = 0; i < this.order.details.length; i++) {
				var item = this.order.details[i];
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
