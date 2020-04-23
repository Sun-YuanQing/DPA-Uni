<!-- 采购退货 -->
<template>
	<view>
		<view id="viewHeader">
			<!-- 单号 扫描 -->
			<barcode-input ref="input_order" @onScaned="onScaned" focus="true" :placeholder="placeholder_order"></barcode-input>
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
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">供应商：</view>
					<view class="uni-list-cell-db">{{ order.custName1 }}</view>
				</view>
			</view>
		</view>

		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item, index) in order.details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)" v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title uni-ellipsis">批次号:{{ item.inLot }}</text>
								<text class="uni-title">料号:{{ item.partItemNo }}</text>
								<text class="uni-title">料品名称:{{ item.partName }}</text>
								<text class="uni-title">仓库:{{ item.whName }}</text>
								<text class="uni-title">数量: {{ item.sheetQty }}</text>
							</view>
							<view class="uni-triplex-right" style="min-width: 220upx;">
								<text class="uni-h5">单位:{{ item.unitName }}</text>
								<text class="uni-h5">已扫描数量:{{ item.scanQty }}</text>
								<text class="uni-h5">未扫描数量:{{ item.lastScanQty }}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm"><button type="primary" style="display: block; float: none;" @click="onSave">保存</button></page-foot>
		<lotunpack
			:show="showLotUnpack"
			:model="printMode"
			:printDetail="printDetail"
			:progNo="progNo"
			@cancel="lotupackCancel"
			@printComplete="printComplete"
			@printCancel="printCancel"
		></lotunpack>
	</view>
</template>

<script>
import barcodeInput from '../../components/barcode-input/barcode-input.vue'; //扫码组件
import lotunpack from '../../components/lotunpack/lotunpack.vue';

import apis from '../../common/apiService.js'; //系统api
import consts from '../../common/consts.js';
import storage from '../../common/storage.js';
import util from '../../common/util.js'; //常用功能
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
			showLotUnpack: false, //是否显示拆分打印
			printMode: {}, //需拆分的标签对象
			printDetail: [], //拆分结果
			order: {
				sheetNo: '',
				sheetDate: '',
				custName1: ''
			},
			placeholder_order: '',
			orderItemSelected: {} //当前选中项
		};
	},

	onLoad(option) {
		this.progNo = option.progNo;
	},
	onReady() {
		var _self = this;
		util.getListHeight(this);
		_self.erpInterfaceType = storage.get(consts.storageKeys.erpInterfaceType);
		if (_self.erpInterfaceType == consts.erpInterfaceType.anfeinuo) {
			_self.placeholder_order = '扫描暂收单号';
		} else {
			_self.placeholder_order = '扫描暂收入库单号';
		}
	},
	onBackPress(options) {
		return util.backPress(options, this.order.details);
	},
	methods: {
		onScaned(e) {
			/* 解析入库信息 */
			uni.showLoading({
				mask: true
			});
			var _self=this;
			apis.acceptreturn_getDetails({
				data: {
					sheetNo: e,
					fileSta: '',
					sheetSta: '0'
				},
				success: res => {
					if(!util.validOrderMonth(res)){
						this.$refs.input_order.setFocus();
						return;
					}
					this.order = res;
					setTimeout(function(){
						for (let i = 0; i < _self.order.details.length; i++) {
							let item = _self.order.details[i];
							item.scanQty = 0;
							item.inLot = item.inLot || '';
							item.lastScanQty = item.sheetQty;
							_self.onScrollTop(i); 
							_self.updateScanList(); 
						}
						_self.order.sheetDate = new Date(res.sheetDate).format('yyyy/MM/dd');
						_self.onSelectedItem(0);
					},100);
					this.$refs.input_part.setFocus();
					util.showScanedAudio();
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
		onPartScaned(e) {
			var _self = this;
			if (!this.order.details) {
				uni.showToast({
					title: '请先扫描单号',
					icon: 'none'
				});
				util.showAudio();
				this.$refs.input_order.setFocus();
				return;
			}
			//料品信息标签扫描完成||请扫描料号
			uni.showLoading({
				mask: true
			});
			apis.basic_QRCodeAnalysis({
				data: {
					qrCode: e
				},
				success: res => {
					//校验批次、料号是否正确
					//校验是否重复扫描
					let isexist = false;
					for (var i = 0; i < _self.order.details.length; i++) {
						let item = _self.order.details[i];
						item.tagDetails = item.tagDetails || [];
						for (var j = 0; j < item.tagDetails.length; j++) {
							let tag = item.tagDetails[j];
							if (tag.m_qrCode == e) {
								_self.onScrollTop(i);
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
						/* if ((!item.inLot || item.inLot == "") && item.partItemNo == res.partItemNo) { //朱永辉取消，文总在场2019/08/21 
								this.onScrollTop(i);
								this.onShowInLot(true);
								uni.showToast({
									title: '请先输入批次号',
									icon: "none"
								});
								util.showAudio();
								return;
							} else */
						if (item.partItemNo == res.partItemNo) {
							// && item.inLot.toLowerCase() == res.inLot.toLowerCase()
							if (item.sheetQty - item.scanQty < res.sheetQty) {
								//判断是否超出应退数量
								_self.tag_split(res, item.lastScanQty);
								_self.onScrollTop(i);
								return;
							}
							isexist = true;
							uni.showToast({
								title: '扫描成功'
							});
							item.tagDetails = item.tagDetails || [];
							res.m_qrCode = e;
							res.qrCode = item.qrCode || item.m_qrCode;
							item.tagDetails.push(res);
							_self.onScrollTop(i);
							_self.updateScanList();
							break;
						}
					}
					if (!isexist) {
						uni.showToast({
							title: '扫描错误，当前标签不属于该单据',
							icon: 'none'
						});
						util.showAudio();
					} else {
						util.showScanedAudio();
					}
					util.automateSave(_self.order.details, 'lastScanQty', 0, _self.onSave);
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
			//保存
			var _self = this;
			//判断是否所有的都已扫描完成
			for (let i = 0; i < _self.order.details.length; i++) {
				let item = _self.order.details[i];
				if (item.lastScanQty > 0) {
					uni.showToast({ 
						title: '当前项,还有未扫描的数据!',
						icon: 'none'
					});
					_self.onScrollTop(i);
					return;
				}
			}
			var list = _self.convert2ScmInoutBarcodeModel(_self.order);
			uni.showLoading({
				mask: true
			});
			apis.acceptreturn_Save({
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
		 * @param {String} binNo 储位
		 */
		convert2ScmInoutBarcodeModel(order) {
			var list = [];
			for (let i = 0; i < order.details.length; i++) {
				var item = order.details[i];
				for (var j = 0; j < item.tagDetails.length; j++) {
					var tag = item.tagDetails[j];
					var data = util.clone(tag);
					data.sheetType = order.sheetType;
					data.sheetNo = order.sheetNo;
					data.sheetLot = item.sheetLot;
					data.partNo = item.partNo;
					data.purLot = tag.poMoSoLot;
					data.proDate = new Date(tag.proDate).format('yyyy/MM/dd') || new Date().format('yyyy/MM/dd');
					data.inoutFlag = '2'; //上下架标记  1、上架；2、下架
					data.qrCode = item.tagDetails[j].qrCode || item.tagDetails[j].m_qrCode;
					data.entityState = consts.entityState.added;
					list.push(data);
				}
			}
			return list;
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
		lotupackCancel() {
			/* 取消事件 */
			this.printDetail = []; /* 清空原有数据*/
			//隐藏拆分
			this.showLotUnpack = false;
			this.$refs.input_part.setFocus();
		},
		printComplete() {
			this.printDetail = []; /* 清空原有数据*/
			this.$refs.input_part.setFocus();
		},
		printCancel() {
			this.printDetail = []; /* 清空原有数据*/
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
				this.$nextTick(function() {
					this.scrollTop = data.height * index;
				});
			}).exec();
		},
		updateScanList() {
			//更新列表结果 
			var scanQty = 0;
			if(this.orderItemSelected.tagDetails){
				for (var i = 0,len=this.orderItemSelected.tagDetails.length; i < len; i++) {
					scanQty = util.floatObj.add(scanQty, this.orderItemSelected.tagDetails[i].sheetQty);
				}
				this.orderItemSelected.scanQty = scanQty;
				this.orderItemSelected.lastScanQty = util.floatObj.subtract(this.orderItemSelected.sheetQty, scanQty);
			}
			var that_order = util.clone(this.order); //所以先复制一份，（赋值不要直接引用赋值,最好是克隆根对象） 
			this.order = that_order; //重新给他赋值，就更新好了
		}
	}
};
</script>

<style></style>
