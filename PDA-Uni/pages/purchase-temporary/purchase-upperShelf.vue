<!-- 采购入库上架 -->
<template>
	<view>
		<view id="viewHeader">
			<!-- 单号 扫描 -->
			<barcode-input ref="input_order" @onScaned="onScaned" :focus="true" :placeholder="placeholder_order"></barcode-input>
			<!-- 检查过不启用储位情况 -->
			<barcode-input ref="input_store" @onScaned="onStoreScaned" v-if="isStorageBin" :clearScan="false" :placeholder="placeholder_store"></barcode-input>
			<barcode-input ref="input_part" @onScaned="onPartScaned" placeholder="请扫描料号"></barcode-input>
			<view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">单号：</view>
					<view class="uni-list-cell-db">{{ order.sheetNo }}</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">单据日期：</view>
					<view class="uni-list-cell-db">{{ order.sheetDate }}</view>
				</view>
			</view>
		</view>

		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item, index) in order.details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)" v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title uni-ellipsis">料号:{{ item.partItemNo }}</text>
								<text class="uni-title">料品名称:{{ item.partName }}</text>
								<text class="uni-title">采购批号:{{ item.purLot }}</text>
								<text class="uni-title">批次号: {{ item.inLot }}</text>
								<text class="uni-title">数量: {{ item.sheetQty }}</text>
								<text class="uni-title" style="overflow: hidden;overflow-x: scroll;" v-if="isStorageBin">推荐货架:{{ item.binNostr }}</text>
							</view>
							<view class="uni-triplex-right" style="min-width: 220upx;">
								<text class="uni-h5">单位:{{ item.unitName }}</text>
								<text class="uni-h5">仓库:{{ item.whName }}</text>
								<text class="uni-h5">已扫描数量:{{ item.scanQty }}</text>
								<text class="uni-h5">未扫描数量:{{ item.lastScanQty }}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<print-button
				ref="printBtn"
				style="padding: 0upx; width: 48%; margin-right: 10px; float: left;"
				:reportModel="reportModel"
				@click="onShowPrint(true)"
				@printComplete="printComplete"
				@tagValid="tagValid"
				@printCancel="onprintCancel"
			></print-button>
			<button type="primary" style="display: block; width: 48%; float: none;" @click="onSave">过账</button>
		</page-foot>
		<!-- 打印弹出框  录入打印信息-->
		<!-- 打印弹出框  录入打印信息-->
		<uni-popup-modal id="popup-modal" :show="showPrint" title="录入打印信息" @hidePopup="onShowPrint(false)" @save="onSubmitPrint">
			<!-- 料号 -->
			<view class="uni-list-cell">
				<view class="uni-list-cell-left">料号:</view>
				<view class="uni-list-cell-db">{{ orderItemSelected.partItemNo }}</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">合格数量:</view>
				<view class="uni-list-cell-db">{{ orderItemSelected.sheetQty }}</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">生产日期:</view>
				<view class="uni-list-cell-db">
					<view @click="showDatePicker">{{ orderItemSelected_input.proDate }}</view>
				</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">批次号:</view>
				<view class="uni-list-cell-db"><input type="text" v-model="orderItemSelected_input.inLot" /></view>
			</view>
			<!-- 数量 -->
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">每包数量:</view>
				<view class="uni-list-cell-db"><input type="number" v-model="orderItemSelected_input.numQty" /></view>

				<view class="uni-list-cell-left">
					<button type="default" style="padding: 0; height: 25px; width: 25px; line-height: 1.3;" @click="onNumAdd"><span style="text-align: center;">+</span></button>
				</view>
			</view>
			<view class="uni-list-cell">
				<view class="flex-item">数量</view>
				<view class="flex-item">包数</view>
				<view class="flex-item"><!-- 占位 --></view>
			</view>
			<scroll-view :scroll-top="scrollTop" scroll-y="true" @scroll="scroll">
				<view class="uni-list" style="height: 200upx;">
					<block v-for="(item, index) in orderItemSelected_input.details" :key="index">
						<!-- 给选择项添加样式 -->
						<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover">
							<view class="uni-triplex-row" style="height:115upx; ">
								<view class="flex-item">{{ item.numQty }}</view>
								<view class="flex-item" style="">{{ item.num }}</view>
								<uni-number-box
									:min="0"
									:max="item.change.max_num"
									:disabled_input="disabled_input"
									:value="item.change.num"
									:det_id="item.det_id"
									@change="num_change"
								/>
							</view>
						</view>
					</block>
				</view>
			</scroll-view>
		</uni-popup-modal>
		<mpvue-picker ref="mpvuePicker" mode="dateSelector" :pickerValueDefault="pickerValueDefault" @onConfirm="onPickerConfirm"></mpvue-picker>
	</view>
</template>

<script>
import uniPopupModal from '../../components/uni-popup-modal/uni-popup-modal.vue';
import uniPopup from '../../components/uni-popup/uni-popup.vue';
import barcodeInput from '../../components/barcode-input/barcode-input.vue';
import mpvuePicker from '../../components/mpvue-picker/mpvuePicker.vue';
import printButton from '../../components/label-print/print-button.vue';
import uniNumberBox from '@/components/uni-number-box/uni-number-box.vue';

import apis from '../../common/apiService.js';
import consts from '../../common/consts.js';
import storage from '../../common/storage.js';
import util from '../../common/util.js';
let erpInterfaceType = null;
export default {
	components: {
		barcodeInput,
		uniPopup,
		uniPopupModal,
		mpvuePicker,
		printButton,
		uniNumberBox
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
			placeholder_store: '',
			placeholder_order: '',
			erpInterfaceType: null,
			isStorageBin: null, //是否启用储位，否改储位
			binNo: '',
			binWhNo: '',
			order: {
				sheetNo: '',
				sheetDate: ''
			},
			det_id: 0,
			orderItemSelected: {}, //当前选中项
			orderItemSelected_input: {
				//当前所有的输入项对象
				num: '', //包数
				numQty: '', //没包数量
				proDate: date, //生产日期
				inLot: '', //生产批次
				details: [
					{
						numQty: 45,
						num: 2
					},
					{
						numQty: 5,
						num: 1
					}
				] //录入的包数集合
			}, //弹出打印的对象
			pickerValueDefault: date,
			showPrint: ''
		};
	},
	onLoad(option) {
		this.reportModel.progNo = option.progNo;
		var _self = this;
		this.isStorageBin = storage.get(consts.storageKeys.IsStorageBin);
		this.erpInterfaceType = storage.get(consts.storageKeys.erpInterfaceType);
		if (this.isStorageBin) {
			_self.placeholder_store = '扫描储位';
		} else {
			_self.placeholder_store = '扫描仓库';
		}

		if (this.erpInterfaceType == consts.erpInterfaceType.anfeinuo) {
			_self.placeholder_order = '扫描暂收单号';
		} else {
			_self.placeholder_order = '扫描采购入库单号';
		}
	},
	onReady() {
		util.getListHeight(this);
	},
	onBackPress(options) {
		return util.backPress(options, this.order.details);
	},
	methods: {
		onScaned(e) {
			var _self = this;
			/* 解析入库信息 */
			uni.showLoading({
				mask: true
			});
			apis.acceptin_getDetails({
				data: {
					sheetNo: e,
					sheetSta: '0'
				},
				success: res => {
					if (!util.validOrderMonth(res)) {
						this.$refs.input_order.setFocus();
						return;
					}
					console.log(JSON.stringify(res));
					for (let i = 0; i < res.details.length; i++) {
						let item = res.details[i];
						item.binNos = item.binNos || [];
						item.scanQty = 0;
						item.binNostr = '';
						item.binNos = item.binNos || [];
						item.tagDetails = [];
						for (var j = 0; j < item.binNos.length; j++) {
							if (j == 0) {
								item.binNostr = item.binNos[j];
							} else {
								item.binNostr += ',' + item.binNos[j];
							}
						}
						item.lastScanQty = item.sheetQty;
					}
					res.sheetDate = new Date(res.sheetDate).format('yyyy/MM/dd');
					_self.order = res;
					_self.onSelectedItem(0);
					console.log(util.outputLog(_self.order));
					util.showScanedAudio();
					if (_self.isStorageBin) {
						_self.$refs.input_store.setFocus();
					} else {
						_self.$refs.input_part.setFocus();
					}
				},
				failure: message => {
					this.$refs.input_order.setFocus();
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
		onStoreScaned(e) {
			if (!this.order.details) {
				uni.showToast({
					title: '请先扫描单号',
					icon: 'none'
				});
				util.showAudio();
				this.$refs.input_order.setFocus();
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
			if (!this.order.details) {
				uni.showToast({
					title: '请先扫描单号',
					icon: 'none'
				});
				util.showAudio();
				this.$refs.input_order.setFocus();
				return;
			}
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
			// else {
			// if (this.binWhNo.trim() == '') {
			// 	uni.showToast({
			// 		title: '请扫描库位',
			// 		icon: 'none'
			// 	})
			// 	this.$refs.input_store.setFocus();
			// 	return;
			// }
			//}
			uni.showLoading({
				mask: true
			});
			var _self = this;
			apis.OpenMes_mesqrcodeincheck({
				data: {
					qrCode: e
				},
				success: res => {
					//console.log(JSON.stringify(res))
					if (res.bztype > 1) {
						//0内箱，1外箱
						uni.showToast({
							title: '不支持卡板，混装！',
							icon: 'none'
						});
						util.showAudio();
						this.$refs.input_part.setFocus();
						return;
					}
					//校验批次、料号和数量是否正确
					//校验是否重复扫描
					let m_isexist = false;
					for (var i = 0; i < this.order.details.length; i++) {
						let item = this.order.details[i];
						item.tagDetails = item.tagDetails || [];
						for (var j = 0; j < item.tagDetails.length; j++) {
							let tag = item.tagDetails[j];
							if (tag.m_qrCode == e) {
								this.onScrollTop(i);
								uni.showModal({
									title: '提示',
									content: '该标签已扫描,是否要删除',
									success: function(res_mod) {
										if (res_mod.confirm) {
											item.tagDetails.splice(j, 1);
											_self.updateScanList();
										} else if (res_mod.cancel) {
										}
									}
								});
								util.showAudio();
								return;
							}
						}
						if (item.partItemNo == res.partItemNo) {
							if (item.lastScanQty == 0) {
								continue;
							}
							if (util.floatObj.subtract(item.sheetQty, item.scanQty) < res.sheetQty) {
								//判断是否超出应退数量
								uni.showToast({
									title: '超出应上架数量',
									icon: 'none'
								});
								util.showAudio();
								_self.onScrollTop(i);
								return;
							}
							if (item.purLot) {
								//console.log(item.purLot , res.poMoSoLot)
								if (item.purLot == res.poMoSoLot || item.purLot == res.purLot) {
									if (item.inLot) {
										if (item.inLot != res.inLot) {
											/* 朱勇军2019-09-02 */
											uni.showToast({
												title: '不是同一批次!',
												icon: 'none'
											});
											util.showAudio();
											_self.$refs.input_part.setFocus();
											return;
										}
									}
								} else {
									continue;
								}
							}

							m_isexist = true;
							if (_self.isStorageBin) {
								/* 一体化启用储位 */
								res.binNo = _self.binNo;
								res.binWhNo = _self.binWhNo;
							} else {
								res.binNo = item.whNo;
								res.binWhNo = item.whNo;
							}
							res.sheetQty = Number(res.sheetQty);
							res.m_qrCode = e;
							res.qrCode = e;
							item.tagDetails.push(res);
							_self.onScrollTop(i);
							_self.updateScanList();
						}
					}
					if (!m_isexist) {
						uni.showToast({
							title: '扫描错误，当前标签不属于该单据',
							icon: 'none'
						});
						util.showAudio();
					} else {
						uni.showToast({
							title: '扫描成功'
						});
						util.showScanedAudio();
					}
					util.automateSave(_self.order.details, 'lastScanQty', 0, _self.onSave);
				},
				failure: message => {
					uni.showToast({
						title: message,
						icon: 'none'
					});
					util.showAudio();
				},
				complete: (status, message, content) => {
					this.$refs.input_part.setFocus();
					uni.hideLoading();
				}
			});
		},
		updateScanList() {
			//更新列表结果
			var scanQty = 0;
			for (var i = 0; i < this.orderItemSelected.tagDetails.length; i++) {
				console.log(this.orderItemSelected);
				scanQty = util.floatObj.add(scanQty, this.orderItemSelected.tagDetails[i].sheetQty);
			}
			this.orderItemSelected.scanQty = scanQty;
			this.orderItemSelected.lastScanQty = util.floatObj.subtract(this.orderItemSelected.sheetQty, scanQty);
		},
		onSave() {
			//保存
			//	storage.set(consts.storageKeys.erpInterfaceType , 6);
			if (!this.order.details) {
				uni.showToast({
					title: '当前项,还有未扫描的数据!',
					icon: 'none'
				});
				util.showAudio();
				this.$refs.input_order.setFocus();
				return;
			}
			//判断是否所有的都已扫描完成
			var _self = this;
			for (let i = 0; i < this.order.details.length; i++) {
				let item = this.order.details[i];
				if (item.lastScanQty > 0) {
					uni.showToast({
						title: '当前项,还有未扫描的数据!',
						icon: 'none'
					});
					_self.onScrollTop(i);
					_self.$refs.input_part.setFocus();
					return;
				}
			}
			var list = this.convert2ScmInoutBarcodeModel(this.order, _self);
			console.log(util.outputLog(list));
			uni.showLoading();
			apis.acceptin_Storage_Save({
				data: list,
				success: res => {
					uni.showToast({
						title: '保存成功!'
					});
					util.dataInit(this);

					_self.erpInterfaceType = storage.get(consts.storageKeys.erpInterfaceType);
					if (_self.erpInterfaceType == consts.erpInterfaceType.anfeinuo) {
						_self.placeholder_order = '扫描暂收单号';
					} else {
						_self.placeholder_order = '扫描暂收入库单号';
					}
					_self.isStorageBin = storage.get(consts.storageKeys.IsStorageBin);

					if (_self.isStorageBin) {
						_self.placeholder_store = '扫描储位';
						_self.$refs.input_store.clear();
					} else {
						_self.placeholder_store = '扫描仓库';
					}
					_self.$refs.input_order.setFocus();
				},
				failure: message => {
					_self.$refs.input_part.clear();
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
		/**
		 * @description 将扫描的对象转为标签表对象
		 * @param {Object} order 单据对象
		 */
		convert2ScmInoutBarcodeModel(order, _self) {
			var list = [];
			for (let i = 0; i < order.details.length; i++) {
				var item = order.details[i];
				for (var j = 0; j < item.tagDetails.length; j++) {
					var tag = item.tagDetails[j];
					if (tag.tagDetails) {
						for (var t = 0; t < tag.tagDetails.length; t++) {
							var tag_det = item.tagDetails[t];
							var data = {};
							data.sheetType = order.sheetType;
							data.sheetNo = order.sheetNo;
							data.sheetLot = item.sheetLot;
							data.partNo = item.partNo;
							data.purLot = tag_det.poMoSoLot;
							data.proLot = tag_det.proLot;
							data.sheetQty = tag_det.sheetQty;
							data.inLot = tag_det.inLot;
							data.proDate = tag_det.proDate;
							data.tagId = tag_det.tagId;
							data.boxTagId = tag_det.boxTagId;
							data.custTagId = tag_det.custTagId;
							data.ordLot = tag_det.ordLot;
							data.custNo = tag_det.custNo;
							if (_self.isStorageBin) {
								data.binNo = _self.binNo; //储位
								data.binWhNo = _self.binWhNo; //
							} else {
								data.binNo = item.whNo;
								data.binWhNo = item.whNo;
							}
							//data.binWhNo = item.whNo;
							data.inoutFlag = '1'; //上下架标记  1、上架；2、下架
							data.qrCode = item.tag_det[t].m_qrCode;
							/* 标签没有define1就取单据物料明细的partDefine1*/
							data.partDefine1 = tag_det.partDefine1 || item.partDefine1;
							data.partDefine2 = tag_det.partDefine2 || item.partDefine2;
							data.partDefine3 = tag_det.partDefine3 || item.partDefine3;
							data.partDefine4 = tag_det.partDefine4 || item.partDefine4;
							data.partDefine5 = tag_det.partDefine5 || item.partDefine5;
							data.partDefine6 = tag_det.partDefine3 || item.partDefine6;
							data.partDefine7 = tag_det.partDefine7 || item.partDefine7;
							data.partDefine8 = tag_det.partDefine8 || item.partDefine8;
							data.partDefine9 = tag_det.partDefine9 || item.partDefine9;
							data.partDefine10 = tag_det.partDefine10 || item.partDefine10;
							data.entityState = consts.entityState.added;
							list.push(data);
							console.log(data);
						}
					} else {
						var data = {};
						data.sheetType = order.sheetType;
						data.sheetNo = order.sheetNo;
						data.sheetLot = item.sheetLot;
						data.partNo = item.partNo;
						data.purLot = tag.poMoSoLot;
						data.proLot = tag.proLot;
						data.sheetQty = tag.sheetQty;
						data.inLot = tag.inLot;
						data.proDate = tag.proDate;
						data.tagId = tag.tagId;
						data.boxTagId = tag.boxTagId;
						data.custTagId = tag.custTagId;
						data.ordLot = tag.ordLot;
						data.custNo = tag.custNo;

						if (_self.isStorageBin) {
							data.binNo = _self.binNo; //储位
							data.binWhNo = _self.binWhNo; //
						} else {
							data.binNo = item.whNo;
							data.binWhNo = item.whNo;
						}
						//data.binWhNo = item.whNo;
						data.inoutFlag = '1'; //上下架标记  1、上架；2、下架
						data.qrCode = item.tagDetails[j].m_qrCode;
						/* 标签没有define1就取单据物料明细的partDefine1*/
						data.partDefine1 = tag.partDefine1 || item.partDefine1;
						data.partDefine2 = tag.partDefine2 || item.partDefine2;
						data.partDefine3 = tag.partDefine3 || item.partDefine3;
						data.partDefine4 = tag.partDefine4 || item.partDefine4;
						data.partDefine5 = tag.partDefine5 || item.partDefine5;
						data.partDefine6 = tag.partDefine3 || item.partDefine6;
						data.partDefine7 = tag.partDefine7 || item.partDefine7;
						data.partDefine8 = tag.partDefine8 || item.partDefine8;
						data.partDefine9 = tag.partDefine9 || item.partDefine9;
						data.partDefine10 = tag.partDefine10 || item.partDefine10;
						data.entityState = consts.entityState.added;
						console.log(data);
						list.push(data);
					}
				}
			}
			return list;
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
			this.showPrint = e;
			if (e) {
				this.orderItemSelected_input = this.orderItemSelected;
				this.orderItemSelected_input.details = [];
				this.orderItemSelected_input.num = 1;
				this.orderItemSelected_input.numQty = this.orderItemSelected.sheetQty;
				this.orderItemSelected_input.lastQty = this.orderItemSelected.sheetQty;
				this.orderItemSelected_input.proDate = new Date().format('yyyy/MM/dd');
			}
			this.$refs.input_part.setFocus();
			console.log(this.orderItemSelected_input);
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
				this.$nextTick(function() {
					this.scrollTop = data.height * index;
				});
			}).exec();
		},

		onNumAdd(e) {
			var _self = this;
			//拆包
			if (this.orderItemSelected_input.numQty <= 0) {
				//数量必须大于0
				uni.showToast({
					title: '数量必须要大于0',
					icon: 'none'
				});
				return;
			}
			var numder = util.floatObj.divide(this.orderItemSelected_input.lastQty, this.orderItemSelected_input.numQty);
			var int_num = Math.floor(numder); //商
			//var int_float = Math.ceil(numder); //余
			console.log(numder + '=' + this.orderItemSelected_input.lastQty + '/' + this.orderItemSelected_input.numQty);
			this.orderItemSelected_input.num = int_num;
			if (this.orderItemSelected_input.num <= 0) {
				//包数必须大于0
				uni.showToast({
					title: '包数必须要大于0',
					icon: 'none'
				});
				return;
			}
			/* 总数量 */
			var totalQty = 0;

			for (let i = 0; i < this.orderItemSelected_input.details.length; i++) {
				let item = this.orderItemSelected_input.details[i];
				totalQty = util.floatObj.add(totalQty, util.floatObj.multiply(item.num, item.numQty));
			}
			console.log(this.orderItemSelected_input.lastQty + '=(' + totalQty + '+' + this.orderItemSelected_input.numQty + '*' + this.orderItemSelected_input.num + ')');

			console.log(this.orderItemSelected_input.lastQty + '=(' + totalQty + '+' + this.orderItemSelected_input.numQty * this.orderItemSelected_input.num + ')');
			var lastQty = 0;
			console.log(this.orderItemSelected_input.lastQty + '==' + this.orderItemSelected.sheetQty);
			if (this.orderItemSelected_input.lastQty == this.orderItemSelected.sheetQty) {
				/* 剩余数量=总数量-上次录入的数量+录入包数*录入数量 */
				lastQty = util.floatObj.subtract(this.orderItemSelected_input.lastQty, totalQty + this.orderItemSelected_input.numQty * this.orderItemSelected_input.num);

				if (lastQty < 0) {
					//数量录入错误
					uni.showToast({
						title: '数量录入有误',
						icon: 'none'
					});
					this.orderItemSelected_input.num = 1;
					return;
				} else if (lastQty > 0) {
					/* 将包数和数量添加到集合中 */
					this.orderItemSelected_input.details.push({
						det_id: _self.det_id,
						num: _self.orderItemSelected_input.num,
						numQty: _self.orderItemSelected_input.numQty,
						change: {
							num: _self.orderItemSelected_input.num,
							max_num: _self.orderItemSelected_input.num
						}
					});
					_self.det_id = _self.det_id + 1;

					this.orderItemSelected_input.details.push({
						det_id: _self.det_id,
						num: 1,
						numQty: lastQty,
						change: {
							num: 1,
							max_num: 1
						}
					});
					_self.det_id = _self.det_id + 1;
					lastQty = 0;
				} else {
					/* 将包数和数量添加到集合中 */
					this.orderItemSelected_input.details.push({
						det_id: _self.det_id,
						num: _self.orderItemSelected_input.num,
						numQty: _self.orderItemSelected_input.numQty,
						change: {
							num: _self.orderItemSelected_input.num,
							max_num: _self.orderItemSelected_input.num
						}
					});
					_self.det_id = _self.det_id + 1;
				}
			} else {
				lastQty = util.floatObj.subtract(this.orderItemSelected_input.lastQty, this.orderItemSelected_input.numQty * this.orderItemSelected_input.num);
				if (lastQty < 0) {
					//数量录入错误
					uni.showToast({
						title: '数量录入有误',
						icon: 'none'
					});
					this.orderItemSelected_input.num = 1;
					return;
				} else if (lastQty > 0) {
					this.orderItemSelected_input.details.push({
						det_id: _self.det_id,
						num: 1,
						numQty: lastQty,
						change: {
							num: 1,
							max_num: 1
						}
					});
					_self.det_id = _self.det_id + 1;
					lastQty = 0;
				}
				/* 将包数和数量添加到集合中 */
				this.orderItemSelected_input.details.push({
					det_id: _self.det_id,
					num: _self.orderItemSelected_input.num,
					numQty: _self.orderItemSelected_input.numQty,
					change: {
						num: _self.orderItemSelected_input.num,
						max_num: _self.orderItemSelected_input.num
					}
				});
				_self.det_id = _self.det_id + 1;
			}

			/* 剩余数量 */
			this.orderItemSelected_input.numQty = lastQty;
			this.orderItemSelected_input.lastQty = Number(lastQty);
			//判断剩余数量是否为零
			if (lastQty == 0) {
				this.orderItemSelected_input.num = 0;
			} else {
				this.orderItemSelected_input.num = 1;
			}
		},
		onSubmitPrint(e) {
			if (!this.orderItemSelected_input.proDate) {
				uni.showToast({
					title: '请输入生产日期',
					icon: 'none'
				});
				return;
			}
			if (!this.orderItemSelected_input.inLot || this.orderItemSelected_input.inLot == '') {
				uni.showToast({
					title: '请输入生产批次',
					icon: 'none'
				});
				return;
			}
			if (this.orderItemSelected_input.details.length == 0) {
				uni.showToast({
					title: '请录入包装信息',
					icon: 'none'
				});
				return;
			}
			var _self = this;
			var totalQty = 0;
			for (let i = 0; i < this.orderItemSelected_input.details.length; i++) {
				let item = this.orderItemSelected_input.details[i];
				totalQty = util.floatObj.add(totalQty, util.floatObj.multiply(item.num, item.numQty));
			}
			if (totalQty != this.orderItemSelected.sheetQty) {
				uni.showToast({
					title: '请录入剩余包装数量',
					icon: 'none'
				});
				return;
			}
			this.orderItemSelected.inLot = this.orderItemSelected_input.inLot;
			this.orderItemSelected.proDate = this.orderItemSelected_input.proDate;
			this.reportDataSource = [];

			var index = 0;
			var prefix = new Date().format('yyMMddHHmmssfff'); //123
			for (let i = 0; i < this.orderItemSelected_input.details.length; i++) {
				let item = this.orderItemSelected_input.details[i];
				for (var j = 0; j < item.num; j++) {
					index++;
					var model = {};
					model.partNo = this.orderItemSelected.partNo;
					model.partItemNo = this.orderItemSelected.partItemNo;
					model.partName = this.orderItemSelected.partName;
					model.partSpec = this.orderItemSelected.partSpec;
					model.serialNo = '';
					model.tagFlag = '';
					model.boxTagId = '';
					model.purLot = this.orderItemSelected.purLot;
					model.poMoSoLot = this.orderItemSelected.purLot;

					model.sheetQty = item.numQty;
					model.tagId = `${prefix}-${util.getSuffix(3, index)}`;

					model.linkBoardQty = '';
					model.inLot = this.orderItemSelected.inLot;
					model.proDate = new Date(_self.orderItemSelected.proDate).format('yyyy/MM/dd') || new Date().format('yyyy/MM/dd');
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
					model.partDefine1 = item.partDefine1;
					model.partDefine2 = item.partDefine2;
					model.partDefine3 = item.partDefine3;
					model.partDefine4 = item.partDefine4;
					model.partDefine5 = item.partDefine5;
					model.partDefine6 = item.partDefine3;
					model.partDefine7 = item.partDefine7;
					model.partDefine8 = item.partDefine8;
					model.partDefine9 = item.partDefine9;
					model.partDefine10 = item.partDefine10;
					this.reportDataSource.push(model);
				}
			}
			this.reportModel.dataSource = this.reportDataSource;
			this.$refs.printBtn.execPrint();
		},
		showDatePicker() {
			this.$refs.mpvuePicker.show();
		},
		onPickerConfirm(e) {
			this.orderItemSelected_input.proDate = new Date(e.label).format('yyyy/MM/dd') || new Date().format('yyyy/MM/dd');
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
		num_change(value) {
			if (value.newVal > 0) {
				var len = this.orderItemSelected_input.details.length;
				for (var i = 0; i < len; i++) {
					var item = this.orderItemSelected_input.details[i];
					if (item.det_id == value.det_id) {
						item.num = value.newVal;
						break;
					}
				}
				/* 总数量 */
				var totalQty = 0;
				for (let i = 0; i < this.orderItemSelected_input.details.length; i++) {
					let item = this.orderItemSelected_input.details[i];
					totalQty = util.floatObj.add(totalQty, util.floatObj.multiply(item.num, item.numQty));
				}
				/* 剩余数量=总数量-上次录入的数量+录入包数*录入数量 */
				var lastQty = util.floatObj.subtract(this.orderItemSelected.sheetQty, totalQty);

				console.log(lastQty);
				if (lastQty >= 0) {
					this.orderItemSelected_input.numQty = lastQty;
					this.orderItemSelected_input.lastQty = Number(lastQty);
					this.orderItemSelected_input.num = 1;
				} else {
					uni.showToast({
						title: '不允许超出总数！！',
						icon: 'none'
					});
					var len = this.orderItemSelected_input.details.length;
					for (var i = 0; i < len; i++) {
						var item = this.orderItemSelected_input.details[i];
						if (item.det_id == value.det_id) {
							// 								if (item.num) {
							//
							// 								}
							item.num -= 1;
							item.change.num = item.num;
							item.change.max_num = item.num;
							break;
						}
					}

					this.orderItemSelected_input.numQty = 0;
					this.orderItemSelected_input.lastQty = 0;
					this.orderItemSelected_input.num = 0;
					return;
				}

				var dd = util.clone(this.orderItemSelected_input);
				this.orderItemSelected_input = dd;
			} else {
				var len = this.orderItemSelected_input.details.length;
				for (var i = 0; i < len; i++) {
					var item = this.orderItemSelected_input.details[i];
					console.log(item.det_id + '--' + value.det_id);
					if (item.det_id == value.det_id) {
						if (len == 2) {
							if (i == 0 && item.num <= 0) {
								this.orderItemSelected_input.details = [];
								break;
							} else {
								this.orderItemSelected_input.details.splice(i, 1);
							}
						} else {
							this.orderItemSelected_input.details.splice(i, 1);
						}
						break;
					}
				}

				/* 总数量 */
				var totalQty = 0;
				for (let i = 0; i < this.orderItemSelected_input.details.length; i++) {
					let item = this.orderItemSelected_input.details[i];
					totalQty = util.floatObj.add(totalQty, util.floatObj.multiply(item.num, item.numQty));
				}
				/* 剩余数量=总数量-上次录入的数量+录入包数*录入数量 */
				var lastQty = this.orderItemSelected.sheetQty - totalQty;
				console.log(lastQty);
				if (lastQty >= 0) {
					this.orderItemSelected_input.numQty = lastQty;
					this.orderItemSelected_input.lastQty = Number(lastQty);
					this.orderItemSelected_input.num = 1;
				} else {
					this.orderItemSelected_input.numQty = 0;
					this.orderItemSelected_input.lastQty = 0;
					this.orderItemSelected_input.num = 0;
				}
				var dd = util.clone(this.orderItemSelected_input);
				this.orderItemSelected_input = dd;
			}
		}
	}
};
</script>

<style>
.flex-item {
	width: 33.3%;

	text-align: center;
	margin: auto;
}

.center-box {
	max-height: 800upx;
}
</style>
