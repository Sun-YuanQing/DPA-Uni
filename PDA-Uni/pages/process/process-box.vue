<!-- 外箱打印 -->
<template>
	<view>
		<view id="viewHeader">
			<barcode-input ref="input_order" :focus="true" @onScaned="onScaned" placeholder="扫描工单号"></barcode-input>
			<view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">批次号:</view>
					<view class="uni-list-cell-db">{{ order.inLot }}</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">生产日期:</view>
					<view class="uni-list-cell-db">
						<view @click="showDatePicker">{{ order.proDate }}</view>
					</view>
				</view>
				<view class="uni-list-cell input-row" v-if="showProLot">
					<view class="uni-list-cell-left">年周:</view>
					<view class="uni-list-cell-db"><input type="text" v-model="order.proLot" placeholder="年周" /></view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">来源批号:</view>
					<view class="uni-list-cell-db">{{ order.poMoSoLot }}</view>
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
					<view class="uni-list-cell-left">客户编码:</view>
					<view class="uni-list-cell-db">{{ order.citemNo }}</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">客户料号:</view>
					<view class="uni-list-cell-db">{{ order.suPartNo }}</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">外箱已生成总数:</view>
					<view class="uni-list-cell-db">{{ order.printBoxBarcodeQty }}</view>
					<view class="uni-list-cell-left">单据数量:</view>
					<view class="uni-list-cell-db">{{ order.sheetQty }}</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">每箱数量:</view>
					<view class="uni-list-cell-db">{{ order.boxPackingQty }}</view>
					<view class="uni-list-cell-left">最小内包装:</view>
					<view class="uni-list-cell-db">{{ order.minPackingQty ? order.minPackingQty : '' }}</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">每箱数量:</view>
					<view class="uni-list-cell-db"><input type="number" style="height: 100%;" v-model="numQty" /></view>
					<view class="uni-list-cell-left">箱数:</view>
					<view class="uni-list-cell-db"><input type="number" style="height: 100%;" v-model="num" /></view>
					<view class="uni-list-cell-left">
						<button type="default" style="height: 100%;width: 80upx;  line-height: 1.3; " @click="onNumAdd">
							<span style="text-align: center;font-size: 50upx;">+</span>
						</button>
					</view>
				</view>
			</view>
		</view>

		<!-- 显示入库单明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item, index) in details" :key="index">
					<uni-swipe-action :options="options_delet" :key="index" :det_id="item.det_id" @click="bindClick">
						<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)" v-bind:class="item.selectItemClass">
							<view class="uni-triplex-row">
								<view class="uni-triplex-left">
									<text class="uni-title">料号:{{ order.partItemNo }}</text>
									<text class="uni-title">物料名称:{{ order.partName }}</text>
								</view>
								<view class="uni-triplex-right">
									<text class="uni-h5" style="min-width: 220upx;margin-left: -300upx;">数量:{{ item.numQty }}</text>
									<text class="uni-h5" style="min-width: 220upx;margin-left: -300upx;">箱数:{{ item.num }}</text>
								</view>
							</view>
						</view>
					</uni-swipe-action>
				</block>
			</view>
		</scroll-view>

		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<print-button ref="printBtn" :reportModel="reportModel" @click="onPrint" buttonText="外箱打印" @tagValid="tagValid" @printComplete="printComplete"></print-button>
		</page-foot>
		<mpvue-picker ref="mpvuePicker" mode="dateSelector" :pickerValueDefault="order.proDate" @onConfirm="onPickerConfirm"></mpvue-picker>
	</view>
</template>

<script>
import uniPopupModal from '../../components/uni-popup-modal/uni-popup-modal.vue';
import uniPopup from '../../components/uni-popup/uni-popup.vue';
import barcodeInput from '../../components/barcode-input/barcode-input.vue'; //扫码组件
import uniSwipeAction from '../../components/uni-swipe-action/uni-swipe-action.vue'; //删除
import printButton from '../../components/label-print/print-button.vue'; //打印
import mpvuePicker from '../../components/mpvue-picker/mpvuePicker.vue';

import apis from '../../common/apiService.js'; //系统api
import consts from '../../common/consts.js';
import storage from '../../common/storage.js';
import util from '../../common/util.js'; //常用功能

//扫描的箱标签对象
let scanBoxTagModel = null;
let curBoxTagId = ''; //产生的箱标签
let tmpHeight = 0;
let erpInterfaceType = null;
let mesInLotType = null;
export default {
	components: {
		barcodeInput,
		uniPopup,
		uniPopupModal,
		uniSwipeAction,
		printButton,
		mpvuePicker
	},
	data() {
		return {
			progNo: '', //页面ID
			//显示隐藏扫描功能

			old: {
				scrollTop: 0
			},
			scrollTop: 0,
			scrollHeight: 0,
			purLot: '',
			det_id: 0,
			options_delet: [
				{
					text: '删除',
					style: {
						backgroundColor: 'rgb(255,58,49)'
					}
				}
			],
			order: {
				inLot: '', //批次号
				poMoSoLot: '',
				proLot: '',
				proDate: '',
				citemNo: '',
				suPartNo: '',
				sheetQty: 0,
				createTagQty: 0,
				lastTagQty: 0,
				boxPackingQty: '',
				minPackingQty: '',
				partItemNo: '',
				partName: ''
			},
			numQty: 0,
			num: 1,
			details: [],
			showProLot: false,
			reportModel: {
				progNo: '', //页面ID
				showReport: false,
				isMultiPrint: false,
				dataSource: [],
				isNeedValidTag: false //是否需要校验标签
			},
			showScanBoxTag: false, //扫描箱号标签
			the_totalQty: 0 /* 本次提交总数量 */,
			menu: [],
			menu_dele: false
		};
	},
	onLoad(option) {
		this.progNo = option.progNo;
		this.reportModel.progNo = option.progNo;
		this.erpInterfaceType = storage.get(consts.storageKeys.erpInterfaceType);
		this.mesInLotType = storage.get(consts.storageKeys.mesInLotType);
		this.showProLot = this.erpInterfaceType == consts.erpInterfaceType.anfeinuo;

		this.menu = storage.get(consts.storageKeys.menu);
		this.menu_dele = false; //删除权限
		for (var m = 0; m < this.menu.length; m++) {
			//取菜单
			var item_m = this.menu[m];
			if (item_m.progNo == this.reportModel.progNo) {
				//取相同菜单
				if (item_m.powerDelete == 1) {
					//取删除权限
					this.menu_dele = true;
				}
			}
		}
	},
	onReady() {
		util.getListHeight(this);
	},
	onBackPress(options) {
		return util.backPress(options, this.details.length > 0);
	},
	methods: {
		onScaned(e) {
			this.init(e);
		},
		init(e) {
			//扫描工单批号
			this.purLot = e;
			console.log('--------------1-------------------' + this.purLot);
			uni.showLoading({
				mask: true
			});
			apis.acceptLotPur_MK_GetModel({
				data: {
					moLot: e,
					type: 0 //0 所有 1 批次 2序列号
				},
				success: res => {
					console.log(res); //打印日志
					res.poMoSoLot = res.purLot;
					if (this.erpInterfaceType == consts.erpInterfaceType.anfeinuo) {
						res.proLot = this.getYearWeek();
					}
					if (this.mesInLotType == consts.mesInLotType.MoLot) {
						res.inLot = res.purLot;
					} else if (this.mesInLotType == consts.mesInLotType.OrdMoLot) {
						res.inLot = res.ordLot == null || '' ? res.purLot : res.ordLot;
					} else if (this.mesInLotType == consts.mesInLotType.MoLotYearWeek) {
						res.inLot = res.purLot + this.getYearWeek();
					} else if (this.mesInLotType == consts.mesInLotType.MoLotYMD) {
						//索源 内包装打印  批次号 默认 为 制单+年月日（6位)
						res.inLot = res.purLot + new Date(res.proDate).format('yyMMdd');
					}
					res.proDate = new Date(res.proDate).format('yyyy/MM/dd') || new Date().format('yyyy/MM/dd');
					res.citemNo = res.citemNo || '';
					res.lastTagQty = util.floatObj.subtract(res.sheetQty, res.createTagQty);

					this.num = 1;
					this.order = res;
					this.numQty = this.order.boxPackingQty;
					uni.showToast({
						title: '扫描成功',
						icon: 'none'
					});
					util.showScanedAudio();
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
		onNumAdd(e) {
			if (this.order.purLot == '' || !this.order.purLot) {
				uni.showToast({
					title: '请扫描工单号！！！',
					icon: 'none'
				});
				util.showAudio();
				return;
			}
			if (this.num <= 0 || this.num == '') {
				this.num = 1;
				uni.showToast({
					title: '箱数必须大于0！！！',
					icon: 'none'
				});
				util.showAudio();
				return;
			}
			if (this.numQty <= 0 || this.numQty == '') {
				this.num = 1;
				uni.showToast({
					title: '箱数必须大于0！！！',
					icon: 'none'
				});
				util.showAudio();
				return;
			}
			var _self = this;
			_self.the_totalQty = 0;
			if (!_self.menu_dele) {
				if (_self.details) {
					/* 计算本次外箱总数不超过，工单数量 */
					for (var i = 0, len = _self.details.length; i < len; i++) {
						var item = _self.details[i];
						_self.the_totalQty = util.floatObj.add(_self.the_totalQty, util.floatObj.multiply(item.num, item.numQty));
					}
					console.log(_self.order.printBoxBarcodeQty, _self.the_totalQty + '>' + _self.order.sheetQty);
					if (util.floatObj.add(_self.numQty, util.floatObj.add(_self.order.printBoxBarcodeQty, _self.the_totalQty)) > _self.order.sheetQty) {
						uni.showToast({
							title: '生成的装箱数量不能大于，工单数量！！！',
							icon: 'none'
						});
						util.showAudio();
						return;
					}
				}
			}

			if (_self.numQty <= 0 || _self.numQty == '') {
				_self.numQty = _self.order.minPackingQty;
			}
			/* 将包数和数量添加到集合中 */
			_self.details.push({
				det_id: _self.det_id,
				num: _self.num,
				numQty: _self.numQty
			});
			_self.numQty = 0;
			_self.det_id = _self.det_id + 1;
		},
		onPrint(e) {
			if (this.details.length == 0) {
				uni.showToast({
					title: '请添加生成外箱！！！',
					icon: 'none'
				});
				util.showAudio();
				this.$refs.input_order.setFocus();
				return;
			}
			var _self = this;
			var dataSource = [];
			var index = 0;
			_self.details.forEach(function(item) {
				for (var i = 0; i < item.num; i++) {
					++index;
					var prefix = new Date().format('yyMMddHHmmssfff');
					var model = {};
					model.partNo = _self.order.partNo;
					model.partItemNo = _self.order.partItemNo;
					model.partName = _self.order.partName;
					model.partSpec = _self.order.partSpec;
					model.suPartNo = _self.order.suPartNo;  //客户料号

					model.inLot = _self.order.inLot;
					model.serialNo = '';
					model.TagFlag = '';
					model.poMoSoLot = _self.order.poMoSoLot || _self.purLot;

					model.sheetQty = item.numQty;
					model.tagId = `${prefix}-${util.getSuffix(3, index)}`;
					model.boxTagId = model.tagId;
					model.boxPackingQty = _self.order.boxPackingQty;
					model.minPackingQty = _self.order.minPackingQty;

					model.linkBoardQty = '';
					model.proLot = _self.order.proLot;   //年周
					model.proDate = new Date(_self.order.proDate).format('yyyy/MM/dd') || new Date().format('yyyy/MM/dd');
					model.citemNo = _self.order.citemNo;
					model.custNo = _self.order.custNo;
					model.custName = _self.order.custName;
					model.custTagId = '';
					model.reservelocus = _self.order.reservelocus;

					model.ordLot = _self.order.ordLot; //订单
					model.custNo = _self.order.custNo; //客户
					model.purLot = _self.purLot;

					model.proItemNo = '';
					model.proName = '';
					model.toProItemNo = '';
					model.toProName = '';
					model.dayId = '';
					model.spcSta = '';
					model.printType = '';
					model.deviceNo = '';
					model.deviceName = '';
					model.partSpecEn = _self.order.partSpecEn;
					console.log('_self.order.define1朱永军说要--->>>>>>>>>>>>>>>>>>>>>>>>>>>' + _self.order.partDefine1);
					/* @AK PC和PDA的入库，内包装，外包装等地方都要核查加的字段有没有值（如DEFINE1--DEFINE10）,苏州也需要这些字段。
                           实施部-朱勇军 2019/8/8 10:06:06	
	                       目前PC的采购入库define没有值	
                         */
					model.partDefine1 = _self.order.partDefine1;
					model.partDefine2 = _self.order.partDefine2;
					model.partDefine3 = _self.order.partDefine3;
					model.partDefine4 = _self.order.partDefine4;
					model.partDefine5 = _self.order.partDefine5;
					model.partDefine3 = _self.order.partDefine3;
					model.partDefine7 = _self.order.partDefine7;
					model.partDefine8 = _self.order.partDefine8;
					model.partDefine9 = _self.order.partDefine9;
					model.partDefine10 = _self.order.partDefine10;

					dataSource.push(model); //打印标签个数
				}
			});
			_self.reportModel.dataSource = dataSource;
			/* 数量-已装箱数量 */
			if (index >= 999) {
				uni.showModal({
					title: '提示',
					content: '外相个数不能超过999个.',
					showCancel: false,
					success: function(res_mod) {
						if (res_mod.confirm) {
						} else if (res_mod.cancel) {
						}
					}
				});
			}

			/* 计算本次外箱总数不超过，工单数量 */
			_self.the_totalQty = 0;
			for (var i = 0, len = _self.details.length; i < len; i++) {
				var item = _self.details[i];
				_self.the_totalQty = util.floatObj.add(_self.the_totalQty, util.floatObj.multiply(item.num, item.numQty));
			}
			/* 检查 */
			var m_isprint = false;
			if (util.floatObj.add(_self.order.printBoxBarcodeQty, _self.the_totalQty) > _self.order.sheetQty) {
				m_isprint = true;
			}
			console.log(_self.the_totalQty);
			/* 没有权限 */
			if (!_self.menu_dele) {
				if (m_isprint) {
					uni.showToast({
						title: '外箱总数数量不能超过，未产生数量！！！',
						icon: 'none'
					});
					util.showAudio();
					return;
				}
			}
			/* 检查超出不更新数量 */
			if (!m_isprint) {
				if (_self.the_totalQty <= 0) {
					uni.showToast({
						title: '外箱更新数量失败！！！',
						icon: 'none'
					});
					util.showAudio();
					return;
				}
				uni.showLoading({
					mask: true
				});
				apis.OpenMes_uppurprintbarocdeqty({
					data: {
						moLot: _self.purLot,
						qty: _self.the_totalQty.toString()
					},
					success: res => {
						_self.the_totalQty = 0;
						console.log('更新数量成功！！！');
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
			}
			_self.$refs.printBtn.execPrint();
		},
		bindClick(value) {
			//删除当前行 更新numQty的数量
			var _self = this;
			for (var i = 0; i < _self.details.length; i++) {
				var item = _self.details[i];
				if (item.det_id == value.det_id) {
					_self.the_totalQty = util.floatObj.subtract(_self.the_totalQty, item.numQty);
					_self.details.splice(i, 1);
					break;
				}
			}
		},
		/**
		 * @param {Object} scanTagModelList 扫描的标签结果集
		 */
		tagValid(scanTagModelList) {
			//console.log(util.outputLog(scanTagModelList));
			util.dataInit(this);
		},
		//日期
		showDatePicker() {
			this.$refs.mpvuePicker.show();
		},
		onPickerConfirm(e) {
			this.order.proDate = new Date(e.label).format('yyyy/MM/dd') || new Date().format('yyyy/MM/dd');
		},
		/**
		 * @description 获取年周
		 */
		getYearWeek() {
			var today = new Date();
			var firstDay = new Date(today.getFullYear(), 0, 1);
			var dayOfWeek = firstDay.getDay();
			var spendDay = 1;
			if (dayOfWeek != 0) {
				spendDay = 7 - dayOfWeek + 1;
			}
			firstDay = new Date(today.getFullYear(), 0, 1 + spendDay);
			var d = Math.ceil((today.valueOf() - firstDay.valueOf()) / 86400000);
			var result = Math.ceil(d / 7) + 1;
			var year = today.getFullYear() + '';
			return year.substr(2, 2) + util.getSuffix(2, result);
		},
		printComplete() {
			var e = this.purLot;
			this.init(e);
			this.details = [];
		},
		scroll(e) {
			//滚动
			this.old.scrollTop = e.detail.scrollTop;
		},
		onSelectedItem(e) {
			for (var i = 0; i < this.details.length; i++) {
				var item = this.details[i];
				if (i == e) {
					item.selectItemClass = 'uni-list-cell-selected';
				} else {
					item.selectItemClass = '';
				}
			}
		}
	}
};
</script>

<style></style>
