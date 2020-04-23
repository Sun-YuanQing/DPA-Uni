<!--生产入库-入库单明细 有拆分标签 （可以扫箱，除非不用拆）-->
<template>
	<view>
		<view id="viewHeader">
			<!-- 头表信息 -->
			<!-- 检查过不启用储位情况 -->
			<barcode-input ref="input_store" @onScaned="onStorScaned" v-if="isStorageBin == true" :focus="true" :clearScan="false"
			 :placeholder="placeholder_store"></barcode-input>
			<barcode-input ref="input_part" @onScaned="onPartScaned" :focus="isStorageBin == false" placeholder="请扫描料号"></barcode-input>
		</view>
		<!-- 显示入库单明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item, index) in order.details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">单号:{{ item.sheetNo }}</text>
								<text class="uni-title">料号:{{ item.partItemNo }}</text>
								<text class="uni-title">料品名称:{{ item.partName }}</text>
								<text class="uni-title">批次号:{{ item.inLot ? item.inLot : '' }}</text>
								<text class="uni-title">仓库:{{ item.whName }}{{'('+item.whNo+')' }}</text>
								<text class="uni-title" v-if="isStorageBin">货架:{{ item.binName?item.binName:'' }}{{ item.binNo?'('+item.binNo+')':'' }}</text>
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
		<page-foot ref="viewBtm">
			<print-button ref="printBtn" style="padding: 0upx; width: 48%; margin-right: 10px; float: left;" :reportModel="reportModel"
			 @click="onShowPrint(true)" @printComplete="printComplete" @tagValid="tagValid" @printCancel="onprintCancel"></print-button>
			<button type="primary" style="display: block;width: 48%; float: none;" @click="onSave">保存</button>
		</page-foot>
		<!-- 打印弹出框  录入打印信息-->
		<uni-popup-modal id="popup-modal" :show="showPrint" title="录入打印信息" @hidePopup="onShowPrint(false)" @save="onSubmitPrint">
			<!-- 料号 -->
			<view class="uni-list-cell">
				<view class="uni-list-cell-left">批次录入:</view>
				<view class="uni-list-cell-db"><input type="text" v-model="orderItemSelected.inLot" /></view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">数量:</view>
				<view class="uni-list-cell-db">{{ orderItemSelected.sheetQty }}</view>
			</view>
		</uni-popup-modal>
	</view>
</template>

<script>
	import barcodeInput from '../../components/barcode-input/barcode-input.vue'; //扫码组件
	import printButton from '../../components/label-print/print-button.vue';
	import uniPopupModal from '../../components/uni-popup-modal/uni-popup-modal.vue'; //自定义弹出框
	import mpvuePicker from '../../components/mpvue-picker/mpvuePicker.vue'; /* 日期*/
	import apis from '../../common/apiService.js'; //系统api
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js'; //常用功能
	import {
		mapState,
		mapMutations
	} from 'vuex';
	export default {
		components: {
			barcodeInput,
			printButton,
			uniPopupModal,
			mpvuePicker
		},
		data() {
			var date = new Date();
			return {
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				reportModel: {
					progNo: '', //页面ID
					showReport: false,
					isMultiPrint: false,
					dataSource: [],
					isNeedValidTag: false //是否需要校验标签
				},
				orderItemSelected: {},
				isStorageBin: null, //是否启用储位，否改储位
				placeholder_store: '',
				binNo: '',
				binWhNo: '',
				order: {},
				scan_qrCode: [], //防止重扫
				//显示隐藏批次
				showPrint: false //打印
			};
		},
		onLoad(option) {
			this.reportModel.progNo = option.progNo;
			this.order = this.urldata;
			this.isStorageBin = storage.get(consts.storageKeys.IsStorageBin);
			if (this.isStorageBin) {
				this.placeholder_store = '扫描储位';
			} else {
				this.placeholder_store = '扫描仓库';
			}
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
			onStorScaned(e) {
				if (e.length <= 0) {
					uni.showToast({
						title: '不能输入空值!',
						icon: 'none'
					});
					return;
				}
				uni.showLoading({
					mask: true
				});
				if (this.isStorageBin) {
					apis.bas_storagebin({
						data: {
							binNo: e
						},
						success: res => {
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
								this.$refs.input_part.setFocus();
								util.showScanedAudio();
							}
						},
						failure: message => {
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
					});
				}
			},
			onPartScaned(e) {
				uni.showLoading({
					mask: true
				});
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
				apis.OpenMes_mesqrcodeinout({
					data: {
						qrCode: e
					},
					success: res => {
						console.log(res);
						var _self = this;
						var m_partItemNo = false;
						var m_isqrCode = false;
						var m_ismax = false;

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
						var sheetLot_max = parseInt(arrs[arrs.length - 1]) + 1; //最大批号后缀+1
						/* 扫描两次轮询判断数量 ,合适校验,第一次询相等,第二次处理大于小于,最后大于的话提示*/
						for (var i = 0; i < this.order.details.length; i++) {
							var item = this.order.details[i];
							if (item.m_isScan) { /* 校验过不用校验 */
								continue;
							} else {
								item.tagDetails = item.tagDetails || [];
								item.m_isScan = false;
							}
							if (res.tagDetails) {
								//两层
								if (res.tagDetails.length > 1) {
									//长度判断///不能一次拆多个标签
									uni.showToast({
										title: '请扫箱标签^_^',
										icon: 'none'
									});
									util.showAudio();
									return;
								}
								for (var j = 0; j < res.tagDetails.length; j++) {
									var tag = res.tagDetails[j];
									tag.qrCode = e;
									if (item.partItemNo != tag.partItemNo) {
										//物料相等
										m_partItemNo = false; //没扫到物料
										continue;
									}
									m_partItemNo = true;
									if (_self.isStorageBin) {
										/* 一体化启用储位 */
										tag.binNo = _self.binNo;
										tag.binWhNo = _self.binWhNo;
									} else {
										tag.binNo = item.whNo;
										tag.binWhNo = item.whNo;
									}
									if (item.inLot) {
										if (item.inLot != tag.inLot) {
											/* 朱勇军2019-09-02 */
											/* 第一次判断了，下面二次轮询就不用判断了 */
											uni.showToast({
												title: '不是同一批次!',
												icon: 'none'
											});
											util.showAudio();
											_self.$refs.input_part.setFocus();
											return;
										}
									}
									//插入标签的状态都是added
									tag.entityState = consts.entityState.added;
									if (item.sheetQty == tag.sheetQty) {
										console.log(item.sheetQty + '---' + tag.sheetQty);
										this.onScrollTop(i);
										item.m_isScan = true;

										tag.inoutFlag = 1; //上架
										item.tagDetails.push(tag);
										item.inLot = tag.inLot; //标签的批次号给明细
										item.proDate = new Date(tag.proDate).format('yyyy/MM/dd') || new Date().format('yyyy/MM/dd');
										m_ismax = false;

										util.showScanedAudio();
										break;
									}
								}
							} else {
								//一层
								if (item.partItemNo != res.partItemNo) {
									//物料相等
									m_partItemNo = false; //没扫到物料
									continue;
								}
								m_partItemNo = true;
								res.qrCode = e;
								if (_self.isStorageBin) {
									/* 一体化启用储位 */
									res.binNo = _self.binNo;
									res.binWhNo = _self.binWhNo;
								} else {
									res.binNo = item.whNo;
									res.binWhNo = item.whNo;
								}
								if (item.inLot) {
									if (item.inLot != res.inLot) {
										/* 朱勇军2019-09-02 */
										/* 第一次判断了，下面二次轮询就不用判断了 */
										uni.showToast({
											title: '不是同一批次!',
											icon: 'none'
										});
										util.showAudio();
										_self.$refs.input_part.setFocus();
										return;
									}
								}
								res.entityState = consts.entityState.added;
								if (item.sheetQty == res.sheetQty) {
									console.log(item.sheetQty + '---' + res.sheetQty);
									this.onScrollTop(i);
									item.m_isScan = true;

									res.inoutFlag = 1; //上架
									item.tagDetails.push(res);
									item.inLot = res.inLot; //标签的批次号给明细
									item.proDate = new Date(res.proDate).format('yyyy/MM/dd') || new Date().format('yyyy/MM/dd');
									m_ismax = false;
									util.showScanedAudio();
									break;
								}
							}
						}
						//第二次轮询 比较大小
						for (var i = 0; i < this.order.details.length; i++) {
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
								for (var j = 0; j < res.tagDetails.length; j++) {
									var tag = res.tagDetails[j];

									if (item.partItemNo != tag.partItemNo) {
										//物料相等
										m_partItemNo = false; //没扫到物料
										continue;
									}
									m_partItemNo = true;
									if (_self.isStorageBin) {
										/* 一体化启用储位 */
										tag.binNo = _self.binNo;
										tag.binWhNo = _self.binWhNo;
									} else {
										tag.binNo = item.whNo;
										tag.binWhNo = item.whNo;
									}
									//插入标签的状态都是added
									tag.entityState = consts.entityState.added;

									if (item.sheetQty < tag.sheetQty) {
										//拆分
										console.log(item.sheetQty + '---' + tag.sheetQty);
										this.onScrollTop(i);
										m_ismax = true;
										continue;
									} else if (item.sheetQty > tag.sheetQty) {
										//标签数量比入库数量少
										console.log(item.sheetQty + '---' + tag.sheetQty);
										this.onScrollTop(i);
										var qty = util.floatObj.subtract(item.sheetQty, tag.sheetQty);
										item.sheetQty = Number(tag.sheetQty);
										var new_item = util.clone(item); //先克隆new_item.m_isScan=false;，再改变原来的值item.m_isScan = true;
										item.m_isScan = true;
										//----------
										tag.inoutFlag = 1; //上架
										item.tagDetails.push(tag);
										item.inLot = tag.inLot; //标签的批次号给明细
										item.proDate = new Date(tag.proDate).format('yyyy/MM/dd') || new Date().format('yyyy/MM/dd');
										//-----------
										new_item.m_isclone = true; //是克隆的，状态是新增，保存时统一改
										new_item.sheetLot = new_item.sheetLot.split('_')[0] + '_' + util.getSuffix(3, sheetLot_max); //新的批号
										new_item.sheetQty = qty;
										this.order.details.push(new_item);
										m_ismax = false;
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
								if (_self.isStorageBin) {
									/* 一体化启用储位 */
									res.binNo = _self.binNo;
									res.binWhNo = _self.binWhNo;
								} else {
									res.binNo = item.whNo;
									res.binWhNo = item.whNo;
								}
								res.entityState = consts.entityState.added;
								if (item.sheetQty < res.sheetQty) {
									//拆分
									console.log(item.sheetQty + '---' + res.sheetQty);
									this.onScrollTop(i);
									m_ismax = true;
									/* 扫的数量大于第一个入库数量，不代表处理，先记下，循环完就知道后面的合适不合适 */
									continue;
								} else if (item.sheetQty > res.sheetQty) {
									//标签数量比入库数量少
									console.log(item.sheetQty + '---' + res.sheetQty);
									this.onScrollTop(i);
									var qty = util.floatObj.subtract(item.sheetQty, res.sheetQty);
									item.sheetQty = Number(res.sheetQty);
									var new_item = util.clone(item); //先克隆new_item.m_isScan=false;，再改变原来的值item.m_isScan = true;
									item.m_isScan = true;

									res.inoutFlag = 1; //上架
									item.tagDetails.push(res);
									item.inLot = res.inLot; //标签的批次号给明细
									item.proDate = new Date(res.proDate).format('yyyy/MM/dd') || new Date().format('yyyy/MM/dd');

									new_item.m_isclone = true; //是克隆的，状态是新增，保存时统一改
									new_item.sheetLot = new_item.sheetLot.split('_')[0] + '_' + util.getSuffix(3, sheetLot_max); //新的批号
									new_item.sheetQty = qty;
									this.order.details.push(new_item);
									m_ismax = false;
									util.showScanedAudio();
									break;
								}
							}
						}
						if (m_ismax) {
							util.showAudio();
							uni.showModal({
								title: '提示',
								content: '数量不能大于入库数量!!!',
								showCancel: false,
								success: function(res_mod) {
									if (res_mod.confirm) {} else if (res_mod.cancel) {}
								}
							});
							_self.$refs.input_part.setFocus();
							return;
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
			onSave() {
				var _self = this;
				for (var i = 0; i < this.order.details.length; i++) {
					var item = this.order.details[i];
					if (!item.m_isScan) {
						util.showAudio();
						uni.showToast({
							icon: 'none',
							title: '请较对入库物料!'
						});
						return;
					}
					if (!item.m_isclone) {
						//不是克隆
						item.entityState = consts.entityState.modified;
					} else {
						item.entityState = consts.entityState.added;
					}
					item.sheetSta = 2; /* 过账 */
				}

				this.order.entityState = consts.entityState.modified;
				this.order.sheetSta = 2; /* 过账 */
				console.log(_self.order);
				uni.showLoading({
					mask: true
				});
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
						if (_self.isStorageBin) {
							_self.placeholder_store = '扫描储位';
						} else {
							_self.placeholder_store = '扫描仓库';
						}
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
			printComplete() {
				console.log('printComplete');
				this.showPrint = false;
			},
			onprintCancel() {
				console.log('onprintCancel');
				//取消打印（打印会话）
				this.showPrint = false;
				this.reportModel.dataSource = [];
			},
			tagValid() {
				console.log('tagValid');
			},
			onShowPrint(e) {
				/* 弹出框 显示/取消 */
				console.log('弹出框 显示/取消');
				if (!this.order.details) {
					uni.showToast({
						title: '请先扫描单号',
						icon: 'none'
					});
					util.showAudio();
					return;
				}
				if (!this.orderItemSelected.selectItemClass) {
					uni.showToast({
						title: '请选择打印对象！！！',
						icon: 'none'
					});
					util.showAudio();
					this.$refs.input_part.setFocus();
					return;
				}
				if (!e) {
					/* 取消按钮*/
					this.showPrint = e;
				}
				if (!this.orderItemSelected.inLot || this.orderItemSelected.inLot == '') {
					/* 打印入库单有批次号直接打印*/
					//扫描客户标签显示打印
					this.showPrint = e;
				} else {
					this.onSubmitPrint();
				}
			},
			onSubmitPrint(e) {
				console.log('弹出框 确定');
				console.log(this.orderItemSelected);
				var _self = this;
				var index = 1; //_001
				var prefix = new Date().format('yyMMddHHmmssfff'); //123

				var model = {};
				model.proDate = new Date(_self.orderItemSelected.proDate).format('yyyy/MM/dd') || new Date().format('yyyy/MM/dd');
				model.partNo = this.orderItemSelected.partNo;
				model.partItemNo = this.orderItemSelected.partItemNo;
				model.partName = this.orderItemSelected.partName;
				model.partSpec = this.orderItemSelected.partSpec;
				model.serialNo = '';
				model.tagFlag = '';
				model.boxTagId = '';
				model.purLot = this.orderItemSelected.purLot;
				model.poMoSoLot = this.orderItemSelected.purLot;

				model.sheetQty = this.orderItemSelected.sheetQty;
				model.tagId = `${prefix}-${util.getSuffix(3, index)}`;

				model.linkBoardQty = '';
				model.inLot = this.orderItemSelected.inLot;

				model.citemNo = this.order.citemNo;
				model.custNo = this.order.custNo;
				model.custName = this.order.custName;
				model.ordLot = '';
				model.custTagId = '';
				model.reservelocus = this.orderItemSelected.reservelocus;
				model.proItemNo = '';
				model.proName = '';
				model.toProItemNo = '';
				model.toProName = '';
				model.dayId = '';
				model.spcSta = '';
				model.printType = '';
				model.deviceNo = '';
				model.deviceName = '';

				this.reportModel.dataSource.push(model);
				this.$refs.printBtn.execPrint();
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
