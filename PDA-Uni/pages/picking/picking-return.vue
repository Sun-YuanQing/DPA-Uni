<!-- 生产退料 打印的代码拿的其它入库 -->
<template>
	<view>
		<view id="viewHeader">
			<!-- 单号 扫描 -->
			<barcode-input ref="input_order" @onScaned="onScaned" :focus="true" :clearScan="false" placeholder="请扫描工单号"></barcode-input>
			<!-- 检查过不启用储位 -->
			<barcode-input ref="input_store" @onScaned="onScanStorage" v-if="isStorageBin" :clearScan="false" :placeholder="placeholder_store"></barcode-input>
			<barcode-input ref="input_part" @onScaned="onPartScaned" placeholder="请扫描料号"></barcode-input>
		</view>

		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item, index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)" v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title uni-ellipsis">退料单号:{{ item.sheetNo }}</text>
								<text class="uni-title">料号:{{ item.partItemNo }}</text>
								<text class="uni-title">料品名称:{{ item.partName }}</text>
								<text class="uni-title">仓库:{{ item.whName }}</text>
								<text class="uni-title">数量: {{ item.neetQty }}</text>
								<text class="uni-title" v-if="isStorageBin">推荐货架:{{ item.binNostr }}</text>
							</view>
							<view class="uni-triplex-right" style="min-width: 220upx;">
								<text class="uni-h5">单位:{{ item.unitName }}</text>
								<text class="uni-h5">已退数量:{{ item.sheetQty }}</text>
								<text class="uni-h5">待退数量:{{ item.lastScanQty }}</text>
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
			<button type="primary" style="display: block;width: 48%; float: none;" @click="onSave">过账</button>
		</page-foot>
		<authorize-input :show="showAuth" :lockModel="lockModel" @onClick="authClick"></authorize-input>
		<uni-popup-modal id="popup-modal" :show="showPrint" title="录入打印信息" @hidePopup="onShowPrint(false)" @save="onSubmitPrint">
			<!-- 料号 -->
			<view class="uni-list-cell">
				<view class="uni-list-cell-left">批次录入:</view>
				<view class="uni-list-cell-db"><input type="text" v-model="orderItemSelected.inLot" /></view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">数量:</view>
				<view class="uni-list-cell-db">{{ orderItemSelected.neetQty }}</view>
			</view>
		</uni-popup-modal>
	</view>
</template>

<script>
import authorizeInput from '../../components/authorize-input/authorize-input.vue';
import barcodeInput from '../../components/barcode-input/barcode-input.vue'; //扫码组件
import printButton from '../../components/label-print/print-button.vue';
import uniPopupModal from '../../components/uni-popup-modal/uni-popup-modal.vue'; //自定义弹出框

import apis from '../../common/apiService.js';
import consts from '../../common/consts.js';
import storage from '../../common/storage.js';
import util from '../../common/util.js';
export default {
	components: {
		barcodeInput,
		authorizeInput,
		printButton,
		uniPopupModal
	},
	data() {
		return {
			progNo: '',
			sheetNo: '',
			old: {
				scrollTop: 0
			},
			scrollTop: 0,
			scrollHeight: 0,
			details: [],
			placeholder_store: '',
			isStorageBin: null, //是否启用储位，否改储位
			binNo: '',
			binWhNo: '',
			showAuth: false, //是否显示授权
			curScanPartModel: {}, //当前扫描物料对象
			lockModel: {
				lockType: 2, //锁屏类别 0.报工 1.生产退料 2.生产领料
				sourceId: '', //来源ID或单号批号
				description: ''
			},
			orderItemSelected: {}, //当前选中项

			reportModel: {
				progNo: '', //页面ID
				showReport: false,
				isMultiPrint: false,
				dataSource: [],
				isNeedValidTag: false //是否需要校验标签
			},
			//显示隐藏批次
			showPrint: false //打印
		};
	},
	onLoad(option) {
		this.progNo = option.progNo;
		this.reportModel.progNo = option.progNo;
		var _self = this;
		_self.isStorageBin = storage.get(consts.storageKeys.IsStorageBin);
		if (_self.isStorageBin) {
			_self.placeholder_store = '扫描储位';
		} else {
			_self.placeholder_store = '扫描仓库';
		}
		console.log(_self.isStorageBin);
	},
	onReady() {
		util.getListHeight(this);
	},
	onBackPress(options) {
		return util.backPress(options, this.details.length > 0);
	},
	methods: {
		onScaned(e) {
			/* 解析入库信息 */
			uni.showLoading({
				mask: true
			});
			apis.picking_return({
				data: {
					purLot: e
				},
				success: res => {
					if (res.length == 0) {
						uni.showToast({
							title: '该单据没有数据',
							icon: 'none'
						});
						util.showAudio();
						this.$refs.input_order.setFocus();
						return;
					}
					this.sheetNo = e;
					console.log(JSON.stringify(res));
					for (var i = 0; i < res.length; i++) {
						var item = res[i];
						item.isOutReturn = false; //领退料标签（Pda 前台写入)  true:领 false: 退
						item.tagDetails = item.tagDetails || [];
						item.binNostr = '';
						item.binNos = item.binNos || [];
						for (var j = 0; j < item.binNos.length; j++) {
							if (j == 0) {
								item.binNostr = item.binNos[j];
							} else {
								item.binNostr = ',' + item.binNos[j];
							}
						}
						item.lastScanQty = util.floatObj.subtract(item.neetQty, item.sheetQty);
						if (!util.validOrderMonth(item, false)) {
							this.$refs.input_order.setFocus();
							continue;
						}
						this.details.push(item);
					}
					if (this.details.length == 0) {
						uni.showToast({
							title: '当前单据不在本月，请联系管理员！',
							icon: 'none'
						});
						this.$refs.input_order.setFocus();
						showAudio();
						return;
					}
					if (this.isStorageBin) {
						this.$refs.input_store.setFocus();
					} else {
						this.$refs.input_part.setFocus();
					}
					util.showScanedAudio();
				},
				failure: message => {
					//this.$refs.input_order.clear();
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
		onScanStorage(e) {
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
						console.log(JSON.stringify(res));
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
			} else {
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
			var _self = this;
			if (this.sheetNo.trim().length == 0) {
				uni.showToast({
					title: '请先扫描单号',
					icon: 'none'
				});
				util.showAudio();
				this.$refs.input_order.setFocus();
				return;
			}

			if (this.isStorageBin) {
				if (this.binNo.trim() == '') {
					uni.showToast({
						title: '请扫描货架',
						icon: 'none'
					});
					this.$refs.input_store.setFocus();
					return;
				}
			}
			//  else {/* 不启用储位拿单据上的不需要判断 */
			// 	if (this.binWhNo.trim() == '') {
			// 		uni.showToast({
			// 			title: '请扫描库位',
			// 			icon: 'none'
			// 		})
			// 		this.$refs.input_store.setFocus();
			// 		return;
			// 	}
			// }

			uni.showLoading({
				mask: true
			});
			//超出待退数量对象
			var m_max = {
				/* 列表中有没有超出的 */
				max: false,
				/* 列表中有超出的下标 */
				index: -1
			};
			apis.basic_QRCodeAnalysis({
				data: {
					qrCode: e
				},
				success: res => {
					res.qrCode = e;
					this.curScanPartModel = util.clone(res);
					let isexist = false;
					// 查找删除标签
					for (var i = 0; i < this.details.length; i++) {
						let item = this.details[i];
						item.tagDetails = item.tagDetails || [];
						for (var j = 0; j < item.tagDetails.length; j++) {
							let tag = item.tagDetails[j];
							if (tag.tagId == res.tagId) {
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
					}
					//列表中有超出待退数量，可不可以再扫？
					var _return=false;
					for (var i = 0; i < this.details.length; i++) {
						var item = this.details[i];
						if (item.partItemNo == res.partItemNo) {
							if (Number(res.sheetQty) > Number(item.lastScanQty)) {
								m_max.max = true;
								m_max.index = i;
							} else {
								m_max.max = false;
								m_max.index = i;
								//先处理一次相等的情况
								console.log(Number(res.sheetQty)+'---'+Number(item.lastScanQty))
								if (Number(res.sheetQty) == Number(item.lastScanQty)) {
									isexist=this.for_details(_self,item,res,isexist,i);
									if (!isexist) {
										uni.showToast({
											title: '扫描错误，当前标签不属于该单据',
											icon: 'none'
										});
										util.showAudio();
									} else {
										util.showScanedAudio();
										util.automateSave(_self.details, 'lastScanQty', 0, _self.onSave);
									}
									_return=true;
									break;
								}
							}
						}
					}
					if(_return){
						return;
					}
					if (m_max.max) {
						uni.showToast({
							title: '超出待退数量',
							icon: 'none'
						});
						util.showAudio();
						this.onScrollTop(m_max.index);
						return;
					}
					for (var i = 0; i < _self.details.length; i++) {
						let item = _self.details[i];
						console.log(Number(res.sheetQty)+'---'+Number(item.lastScanQty))
						if (item.sheetQty < item.lastScanQty) {
							isexist=this.for_details(_self,item,res,isexist,i);
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
						util.automateSave(_self.details, 'lastScanQty', 0, _self.onSave);
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
		for_details (_self,item,res,isexist,i) {
			if (item.partItemNo == res.partItemNo) {
				if (res.tagDetails) {
					res.tagDetails.forEach(function(item_tag) {
						if (_self.isStorageBin) {
							item_tag.binNo = _self.binNo;
							item_tag.binWhNo = _self.binWhNo;
						} else {
							res.binNo = item.whNo1;
							res.binWhNo = item.whNo1;
						}
						item_tag.sheetQty = Number(res.sheetQty);
					});
				} else {
					if (_self.isStorageBin) {
						res.binNo = _self.binNo;
						res.binWhNo = _self.binWhNo;
					} else {
						res.binNo = item.whNo1;
						res.binWhNo = item.whNo1;
					}
					res.sheetQty = Number(res.sheetQty);
				}
				isexist = true;
				uni.showToast({
					title: '扫描成功'
				});
				let rltData = _self.convert2ScmInoutBarcodeModel(item, res, _self);
				rltData.forEach(function(dItem) {
					item.tagDetails.push(dItem);
				});
		
				item.entityState = consts.entityState.modified;
				item.sheetSta = '2'; //过账状态
				_self.onScrollTop(i);
				_self.updateScanList();
			}
			return isexist;
		},
		updateScanList() {
			//更新列表结果
			var scanQty = 0;
			for (var i = 0; i < this.orderItemSelected.tagDetails.length; i++) {
				scanQty = util.floatObj.add(scanQty, this.orderItemSelected.tagDetails[i].sheetQty);
			}
			this.orderItemSelected.sheetQty = scanQty;
			this.orderItemSelected.lastScanQty = util.floatObj.subtract(this.orderItemSelected.neetQty, scanQty);
		},
		onSave() {
			//保存
			if (this.details.length == 0) {
				uni.showToast({
					title: '请扫描单号！',
					icon: 'none'
				});
				this.$refs.input_order.setFocus();
				return;
			}

			//判断是否所有的都已扫描完成
			let isFinish = true;
			let isScaned = false;
			for (let i = 0; i < this.details.length; i++) {
				let item = this.details[i];
				/**
				 * 1.直接过账
				 * 2.扫描完成过账
				 */
				if (!isScaned && item.sheetQty > 0) {
					isScaned = true;
				}
				if (isScaned && item.lastScanQty > 0) {
					isFinish = false;
					this.onScrollTop(i);
					break;
				}
			}
			if (!isFinish) {
				uni.showToast({
					title: '退料未完成不能过账！',
					icon: 'none'
				});
				this.$refs.input_part.setFocus();
				return;
			}
			if (!isScaned) {
				//需要授权
				this.lockModel.description = '请授权过账';
				this.lockModel.sourceId = this.sheetNo;
				this.showAuth = true;
				return;
			}
			var _self = this;
			//保存
			var list = util.clone(this.details);
			console.log(': ' + JSON.stringify(list));
			uni.showLoading({
				mask: true
			});
			apis.picking_out_save({
				data: list,
				success: res => {
					uni.showToast({
						title: '过账成功'
					});
					util.dataInit(_self);
					if (_self.isStorageBin) {
						_self.$refs.input_store.clear();
					}
					_self.$refs.input_order.clear();
					_self.$refs.input_order.setFocus();

					if (_self.isStorageBin) {
						_self.placeholder_store = '扫描储位';
					} else {
						_self.placeholder_store = '扫描仓库';
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
		 */
		convert2ScmInoutBarcodeModel(selectedItem, scanModel, _self) {
			var datas = [];
			if (scanModel.tagDetails) {
				for (var i = 0; i < scanModel.tagDetails.length; i++) {
					var scan_tag = scanModel.tagDetails[i];
					var data = {}; //上架数据
					data.sheetType = selectedItem.sheetType;
					data.sheetNo = selectedItem.sheetNo;
					data.sheetLot = selectedItem.sheetLot;
					data.partNo = scan_tag.partNo;
					data.purLot = scan_tag.poMoSoLot; //采购批号
					data.proLot = scan_tag.proLot; //供应商生产批号
					data.sheetQty = scan_tag.sheetQty; //数量
					data.inLot = scan_tag.inLot; //批次号
					data.proDate = scan_tag.proDate; //日期
					data.tagId = scan_tag.tagId; //标签ID
					data.boxTagId = scan_tag.boxTagId; //箱号标签ID
					data.custTagId = scan_tag.custTagId; //客户标签ID
					data.ordLot = scan_tag.ordLot; //订单批号
					data.custNo = scan_tag.custNo; //供应商内码
					if (_self.isStorageBin) {
						data.binNo = _self.binNo; //储位
						data.binWhNo = _self.binWhNo; //
					} else {
						data.binNo = scan_tag.whNo;
						data.binWhNo = scan_tag.whNo;
					}
					data.qrCode = scan_tag.qrCode; //标签内容
					data.inoutFlag = '1'; //上架
					data.entityState = consts.entityState.added;
					datas.push(data);
					return datas;
				}
			} else {
				var data = {}; //上架数据
				data.sheetType = selectedItem.sheetType;
				data.sheetNo = selectedItem.sheetNo;
				data.sheetLot = selectedItem.sheetLot;
				data.partNo = scanModel.partNo;
				data.purLot = scanModel.poMoSoLot; //采购批号
				data.proLot = scanModel.proLot; //供应商生产批号
				data.sheetQty = scanModel.sheetQty; //数量
				data.inLot = scanModel.inLot; //批次号
				data.proDate = scanModel.proDate; //日期
				data.tagId = scanModel.tagId; //标签ID
				data.boxTagId = scanModel.boxTagId; //箱号标签ID
				data.custTagId = scanModel.custTagId; //客户标签ID
				data.ordLot = scanModel.ordLot; //订单批号
				data.custNo = scanModel.custNo; //供应商内码
				if (_self.isStorageBin) {
					data.binNo = _self.binNo; //储位
					data.binWhNo = _self.binWhNo; //
				} else {
					data.binNo = scanModel.whNo;
					data.binWhNo = scanModel.whNo;
				}
				data.qrCode = scanModel.qrCode; //标签内容
				data.inoutFlag = '1'; //上架
				data.entityState = consts.entityState.added;
				datas.push(data);
				return datas;
			}
		},
		onShowPrint(e) {
			/* 弹出框 显示/取消 */
			console.log('弹出框 显示/取消');
			if (!this.details) {
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
			if (this.orderItemSelected.inLot == '') {
				uni.showToast({
					title: '请录入入库的批次',
					icon: 'none'
				});
				util.showAudio();
				return;
			}
			var index = 1; //_001
			var prefix = new Date().format('yyMMddHHmmssfff'); //123

			var model = {};
			model.proDate = this.orderItemSelected.proDate ? new Date(this.orderItemSelected.proDate).format('yyyy/MM/dd') : new Date().format('yyyy/MM/dd');
			model.partNo = this.orderItemSelected.partNo;
			model.partItemNo = this.orderItemSelected.partItemNo;
			model.partName = this.orderItemSelected.partName;
			model.partSpec = this.orderItemSelected.partSpec;
			model.serialNo = '';
			model.tagFlag = '';
			model.boxTagId = '';
			model.purLot = this.orderItemSelected.purLot;
			model.poMoSoLot = this.orderItemSelected.purLot;

			model.sheetQty = this.orderItemSelected.neetQty;
			model.tagId = `${prefix}-${util.getSuffix(3, index)}`;

			model.linkBoardQty = '';
			model.inLot = this.orderItemSelected.inLot;

			model.citemNo = this.orderItemSelected.citemNo;
			model.custNo = this.orderItemSelected.custNo;
			model.custName = this.orderItemSelected.custName;
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
			console.log(model);
			this.reportModel.dataSource.push(model);
			this.$refs.printBtn.execPrint();
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
		/* 选中的方法 */
		onSelectedItem(e) {
			for (var i = 0; i < this.details.length; i++) {
				var item = this.details[i];
				if (i == e) {
					item.selectItemClass = 'uni-list-cell-selected';
					this.orderItemSelected = item;
					console.log(this.orderItemSelected);
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
		authClick(e) {
			this.showAuth = false;
			uni.showLoading({
				mask: true
			});
			apis.picking_return_lockScreen_post({
				data: {
					mesLockscreen: e,
					sheetNo: this.sheetNo
				},
				success: res => {
					uni.showToast({
						title: '过账成功'
					});
					this.$refs.input_store.clear();
					this.$refs.input_order.clear();
					this.$refs.input_order.setFocus();
					this.details = []; //清空页面
				},
				complete: (status, message, content) => {
					this.$refs.input_order.setFocus();
					util.tryCatchApi({
						status: status,
						message: message
					});
					uni.hideLoading();
				}
			});
		}
	}
};
</script>

<style></style>
