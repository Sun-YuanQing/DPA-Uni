<!--装箱 (序列号)-->
<template>
	<view>
		<view id="viewHeader">
			<barcode-input ref="input_order" :focus="true" @onScaned="onScaned" placeholder="扫描工单"></barcode-input>
			<barcode-input ref="input_sn" @onScaned="onSNScaned" placeholder="扫描序列号"></barcode-input>
			<view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">工单号:</view>
					<view class="uni-list-cell-db">{{ order.purLot }}</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">料号:</view>
					<view class="uni-list-cell-db">{{ order.partItemNo }}</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">物料名称:</view>
					<view class="uni-list-cell-db">{{ order.partName }}</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">批次*:</view>
					<view class="uni-list-cell-db"><input ref="input_inLot" :focus="boxinLotFocus" v-model="boxinLot" type="text" /></view>
				</view>
			</view>
		</view>
		<!-- 显示入库单明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item, index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">订单批号:{{ item.ordLot }}</text>
								<text class="uni-title">料品编码:{{ item.partNo }}</text>
								<text class="uni-title">料品名称:{{ item.partName }}</text>
								<text class="uni-title">标签ID:{{ item.tagId }}</text>
							</view>
							<view class="uni-triplex-right">
								<text class="uni-h5">料品规格:{{ item.partSpec }}</text>
								<text class="uni-h5" style="min-width: 220upx;margin-left: -300upx;">数量:{{ item.sheetQty }}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<print-button ref="printBtn" buttonText="封箱" :reportModel="reportModel" @click="onSave" @tagValid="onBoxScanSave"></print-button>
			<!-- <button type="primary" @click="onSave">封箱</button> -->
		</page-foot>
	</view>
</template>

<script>
	import uniPopupModal from '../../components/uni-popup-modal/uni-popup-modal.vue';
	import printButton from '../../components/label-print/print-button.vue';
	import uniPopup from '../../components/uni-popup/uni-popup.vue';
	import barcodeInput from '../../components/barcode-input/barcode-input.vue'; //扫码组件

	import apis from '../../common/apiService.js'; //系统api
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js'; //常用功能

	let curBoxTagId = ''; //产生的箱标签
	export default {
		components: {
			barcodeInput,
			uniPopup,
			uniPopupModal,
			printButton
		},
		data() {
			return {
				reportModel: {
					progNo: '', //页面ID
					showReport: false,
					isMultiPrint: true,
					dataSource: [],
					isNeedValidTag: true //是否需要校验标签
				},
				boxinLot: '',
				boxinLotFocus: false,
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				order: {
					purLot: '',
					partItemNo: '',
					partName: ''
				}, //工单
				details: []
			};
		},
		onLoad(option) {
			this.reportModel.progNo = option.progNo;
		},
		onReady() {
			util.getListHeight(this);
		},
		onBackPress(options) {
			return util.backPress(options, this.details.length > 0);
		},
		methods: {
			onScaned(e) {
				//扫描工单批号
				uni.showLoading({
					mask: true
				});
				apis.boxfqc_getDetail({
					data: {
						moLot: e
					},
					success: res => {
						console.log(res); //打印日志
						this.order = res;
						uni.showToast({
							title: '扫描成功',
							icon: 'none'
						});
						util.showScanedAudio();
						this.$refs.input_sn.setFocus();
					},
					failure: message => {
						util.showAudio();
						this.$refs.input_order.setFocus();
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
			onSNScaned(e) {
				//料品信息标签扫描完成
				uni.showLoading({
					mask: true
				});
				apis.Pda_pdaserialinboxvaild({
					data: {
						qrCode: e
					},
					success: res => {
						//校验批次、料号和数量是否正确
						//校验是否重复扫描
						console.log(res);
						if (res.inBoxNo.trim().length > 0) {
							uni.showToast({
								title: '该标签已在 ' + res.inBoxNo + ' 箱中！',
								icon: 'none'
							});
							return;
						}
						var _self = this;
						if (_self.order.purLot != res.poMoSoLot) {
							uni.showToast({
								title: '工单号不一致',
								icon: 'none'
							});
							util.showAudio();
							return;
						}
						this.order.totalQty = this.order.totalQty || 0; //已扫数量,外箱数量
						for (var i = 0; i < this.details.length; i++) {
							let item = this.details[i];
							if (item.tagId == res.tagId) {
								_self.onScrollTop(i);
								uni.showModal({
									title: '提示',
									content: '该标签已扫描,是否要删除',
									success: function(res_mod) {
										if (res_mod.confirm) {
											_self.order.totalQty = util.floatObj.subtract(_self.order.totalQty, item.sheetQty);
											_self.details.splice(i, 1);
										} else if (res_mod.cancel) {}
									}
								});
								util.showAudio();
								return;
							}
							if (item.binWhNo != res.binWhNo) {
								uni.showToast({
									title: '所在仓库不一致',
									icon: 'none'
								});
								util.showAudio();
								return;
							}
						}

						if (this.order.boxPackingQty == 0 || this.order.boxPackingQty >= util.floatObj.add(this.order.totalQty, res.sheetQty)) {
							res.qrCode = e;
							this.details.push(res);
							this.onScrollTop(this.details.length - 1);
							this.order.totalQty = util.floatObj.add(res.sheetQty, this.order.totalQty);
							uni.showToast({
								title: '校验成功'
							});
						} else {
							uni.showToast({
								title: '超出装箱数量',
								icon: 'none'
							});
							util.showAudio();
							return;
						}
						util.showScanedAudio();
					},
					failure: message => {
						util.showAudio();
					},
					complete: (status, message, content) => {
						this.$refs.input_sn.setFocus();
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
				let _self = this;
				if (!_self.order) {
					//工单
					uni.showToast({
						title: '请扫描工单',
						icon: 'none'
					});
					util.showAudio();
					_self.$refs.input_order.setFocus();
					return;
				}
				if (_self.details.length == 0) {
					uni.showToast({
						title: '请扫描内包装',
						icon: 'none'
					});
					_self.$refs.input_sn.setFocus();
					return;
				}
				if (_self.boxinLot.trim().length <= 0) {
					uni.showToast({
						title: '请输入批号',
						icon: 'none'
					});
					util.showAudio();
					this.boxinLotFocus = true;
					return;
				}
				if (Number(_self.order.totalQty) > Number(_self.order.boxPackingQty) || Number(_self.order.totalQty) < Number(_self
						.order.minPackingQty)) {
					uni.showToast({
						title: '包装数量为' + _self.order.minPackingQty + '到' + _self.order.boxPackingQty,
						icon: 'none'
					});
					_self.$refs.input_sn.setFocus();
					return;
				} else if (Number(_self.order.totalQty) <= Number(_self.order.boxPackingQty) && Number(_self.order.totalQty) >=
					Number(_self.order.minPackingQty)) {
					uni.showModal({
						title: '是否确定封箱?',
						content: '包装数量为' + _self.order.minPackingQty + '到' + _self.order.boxPackingQty,
						success: function(res_mod) {
							if (res_mod.confirm) {} else if (res_mod.cancel) {
								return;
							}
						}
					});
					_self.$refs.input_sn.setFocus();
				}
				uni.showModal({
					title: '提示',
					content: '是否确定封箱',
					success: function(res_mod) {
						if (res_mod.confirm) {
							var dataSource = [];
							var prefix = new Date().format('yyMMddHHmmssfff');
							console.log(JSON.stringify(_self.details));
							var model = {};
							model.partNo = _self.details[0].partNo;
							model.partItemNo = _self.details[0].partItemNo;
							model.partName = _self.details[0].partName;
							model.partSpec = _self.details[0].partSpec;
							model.purLot = _self.details[0].purLot;
							model.inLot = _self.boxinLot;
							model.serialNo = '';
							model.tagFlag = '';
							model.poMoSoLot = _self.details[0].poMoSoLot;
							console.log(util.outputLog(_self.order));
							model.sheetQty = _self.order.totalQty;
							model.tagId = `${prefix}-${util.getSuffix(3, 1)}`;
							model.boxTagId = model.tagId;
							curBoxTagId = model.tagId;
							model.LinkBoardQty = '';
							model.proLot = _self.details[0].proLot;
							model.proDate = new Date().format('yyyy/MM/dd');
							model.citemNo = _self.details[0].citemNo;
							model.custNo = _self.details[0].custNo;
							model.custName = _self.details[0].custName;
							model.ordLot = _self.order.ordLot;
							model.custTagId = '';
							model.reservelocus = _self.details[0].reservelocus;
							model.proItemNo = '';
							model.proName = '';
							model.toProItemNo = '';
							model.toProName = '';
							model.dayId = '';
							model.spcSta = '';
							model.printType = '';
							model.deviceNo = '';
							model.deviceName = '';
							model.rountNo = _self.order.rountNo;
							model.partSpecEn = _self.order.partSpecEn;
							dataSource.push(model);
							console.log(model);
							_self.reportModel.dataSource = dataSource;
							_self.$refs.printBtn.execPrint();
						} else if (res_mod.cancel) {}
					}
				});
			},
			/**
			 * @param {Object} scanBoxTagModelList 返回扫描的结果集
			 */
			onBoxScanSave(scanBoxTagModelList) {
				var _self = this;
				let scanBoxTagModel = scanBoxTagModelList[0];
				//扫描箱号保存
				console.log('scanBoxTagModel: ' + JSON.stringify(scanBoxTagModel));
				scanBoxTagModel.bzType = 1; //包装类别 0、内箱( 默认) 1、外箱 2、卡板
				scanBoxTagModel.purLot = _self.order.purLot;
				scanBoxTagModel.inLot = _self.boxinLot;
				scanBoxTagModel.boxTagId = curBoxTagId;
				scanBoxTagModel.custNo = _self.details[0].custNo;
				scanBoxTagModel.citemNo = _self.details[0].citemNo;
				scanBoxTagModel.custName = _self.details[0].custName;
				scanBoxTagModel.ordLot = _self.details[0].ordLot;
				scanBoxTagModel.entityState = consts.entityState.added;
				scanBoxTagModel.tagDetails = scanBoxTagModel.tagDetails || [];

				for (let i = 0; i < _self.details.length; i++) {
					let item = _self.details[i];
					item.boxTagId = scanBoxTagModel.tagId;
					item.sheetLot = scanBoxTagModel.tagId;
					item.purLot = _self.order.purLot;
					item.cuNo = scanBoxTagModel.cuNo;
					item.cuItemNo = scanBoxTagModel.cuItemNo;
					item.cuName = scanBoxTagModel.cuName;
					item.cuOrdNo = scanBoxTagModel.cuOrdNo;
					item.suPartNo = scanBoxTagModel.suPartNo;
					item.entityState = consts.entityState.added;
					scanBoxTagModel.tagDetails.push(item);
				}
				_self.details = [];
				console.log(util.outputLog(scanBoxTagModel));
				// return;
				uni.showLoading({
					mask: true
				});
				apis.Pda_pdaaddboxbarcodeserial({
					data: scanBoxTagModel,
					success: res => {
						uni.showToast({
							title: '保存成功!'
						});
						util.dataInit(this);
						_self.$refs.input_order.setFocus();
					},
					failure: message => {
						util.showAudio();
						_self.$refs.input_sn.setFocus();
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
