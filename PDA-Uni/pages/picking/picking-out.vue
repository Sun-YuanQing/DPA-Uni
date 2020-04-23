<!-- 领料出库 -->
<template>
	<view>
		<view id="viewHeader">
			<!-- 单号 扫描 -->
			<barcode-input ref="input_order" @onScaned="onScaned" :focus="true" :clearScan="false" placeholder="请扫描工单号"></barcode-input>
			<barcode-input ref="input_part" @onScaned="onPartScaned" placeholder="请扫描料号"></barcode-input>
		</view>

		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item, index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" v-bind:class="item.selectItemClass">
						<view class="uni-flex uni-column" style="width: 100%;">
							<view class="uni-triplex-row">
								<view class="uni-triplex-left">
									<text class="uni-title">料号:{{ item.partItemNo }}</text>
									<text class="uni-title">应领数量: {{ item.neetQty }}</text>
								</view>
								<view class="uni-triplex-right" style="min-width: 220upx;">
									<text class="uni-h5">实领数量:{{ item.sheetQty }}</text>
									<text class="uni-h5">待领数量:{{ item.lastScanQty }}</text>
								</view>
							</view>
							<view class="uni-triplex-row" v-if="item.binLots.length > 0">
								<view class="div-table fixed-thead">
									<view class="thead">
										<view class="th">
											<view class="td" style="width:20%">库位</view>
											<view class="td" style="width:60%">批次</view>
											<view class="td" style="width:20%">数量</view>
										</view>
									</view>
									<view class="tbody">
										<block v-for="(item, index) in item.binLots" :key="index">
											<view class="tr" v-if="index == 0">
												<view class="td" style="width:20%;font-weight: bold; font-size: 14px;">{{ isStorageBin ? item.binNo : item.whNo }}</view>
												<view class="td" style="width:60%;font-weight: bold; font-size: 14px;">{{ item.inLot }}</view>
												<view class="td" style="width:20%;font-weight: bold; font-size: 14px;">{{ item.sheetQty }}</view>
											</view>
											<view class="tr" v-else>
												<view class="td" style="width:20%">{{ isStorageBin ? item.binNo : item.whNo }}</view>
												<view class="td" style="width:60%">{{ item.inLot }}</view>
												<view class="td" style="width:20%">{{ item.sheetQty }}</view>
											</view>
										</block>
									</view>
								</view>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm"><button type="primary" style="display: block; float: none;" @click="onSave">保存</button></page-foot>

		<authorize-input :show="showAuth" :lockModel="lockModel" @onClick="authClick"></authorize-input>
		<lotunpack :show="showLotUnpack" :model="printMode" :printDetail="printDetail" :progNo="progNo" @cancel="lotupackCancel"></lotunpack>
	</view>
</template>

<script>
import barcodeInput from '../../components/barcode-input/barcode-input.vue';
import authorizeInput from '../../components/authorize-input/authorize-input.vue';
import lotunpack from '../../components/lotunpack/lotunpack.vue';

import apis from '../../common/apiService.js';
import consts from '../../common/consts.js';
import storage from '../../common/storage.js';
import util from '../../common/util.js';
export default {
	components: {
		barcodeInput,
		authorizeInput,
		lotunpack
	},
	data() {
		return {
			progNo: '',
			purLot: '',
			old: {
				scrollTop: 0
			},
			scrollTop: 0,
			scrollHeight: 0,
			isStorageBin: null, //是否启用储位，否改储位
			details: [], //显示统计结果
			proOutDetails: [], //出库明细
			showAuth: false, //是否显示授权
			showLotUnpack: false, //是否显示拆分打印
			printMode: {}, //需拆分的标签对象
			printDetail: [], //拆分结果
			curScanPartModel: {}, //当前扫描物料对象
			lockModel: {
				lockType: 2, //锁屏类别 0.报工 1.生产退料 2.生产领料
				sourceId: '', //来源ID或单号批号
				description: ''
			}
		};
	},
	onLoad(option) {
		this.progNo = option.progNo || 'OPDA00012';
		this.isStorageBin = storage.get(consts.storageKeys.IsStorageBin);
		console.log(this.progNo);
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
			apis.picking_out({
				data: {
					purLot: e
				},
				success: res => {
					if (res.length == 0) {
						uni.showToast({
							title: '该工单没有数据',
							icon: 'none'
						});
						util.showAudio();
						return;
					}
					this.purLot = e;
					console.log(util.outputLog(res));
					for (var i = 0; i < res.proOut2Models.length; i++) {
						var item = res.proOut2Models[i];
						item.isOutReturn = true; //领退料标签（Pda 前台写入)  true:领 false: 退
						item.tagDetails = item.tagDetails || [];
					}

					for (var i = 0; i < res.prooutsumByPart.length; i++) {
						var item = res.prooutsumByPart[i];
						item.sheetQty = 0;
						console.log(JSON.stringify(item));
						item.lastScanQty = util.floatObj.subtract(item.neetQty, item.sheetQty);
					}
					this.details = res.prooutsumByPart;
					this.proOutDetails = res.proOut2Models;
					this.$refs.input_part.setFocus();
					util.showScanedAudio();
				},
				failure: message => {
					this.$refs.input_order.clear();
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
			let that = this;
			if (this.purLot.trim().length == 0) {
				uni.showToast({
					title: '请先扫描工单号',
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
			apis.picking_lockScreen_valid({
				data: {
					purLot: that.purLot,
					qrCode: e
				},
				success: res => {
					let scanPartModel = JSON.parse(res.resultNote);
					scanPartModel.qrCode = e;
					that.curScanPartModel = util.clone(scanPartModel);
					//先判断是否需要授权
					let lockObj = null;
					if (res.resultCode == '-11') {
						lockObj = res.resultText;
					}
					that.scanAdd(that.curScanPartModel, lockObj);
					util.showScanedAudio();
				},
				failure: message => {
					util.showAudio();
				},
				complete: (status, message, content) => {
					that.$refs.input_part.setFocus();
					util.tryCatchApi({
						status: status,
						message: message
					});
					uni.hideLoading();
				}
			});
		},
		/**
		 * 添加扫描的结果
		 * @param lockObj 锁屏对象
		 */
		scanAdd(scanPartModel, lockObj) {
			var _self = this;
			let findPartArr = []; //匹配到的物料数据
			let findTagArr = []; //记录重复的标签
			//校验批次、料号是否正确
			//校验是否重复扫描
			//判断是否需要拆包
			for (var i = 0; i < this.proOutDetails.length; i++) {
				let item = this.proOutDetails[i];
				for (var j = 0; j < item.tagDetails.length; j++) {
					let tag = item.tagDetails[j];
					if (tag.tagId == scanPartModel.tagId && tag.entityState != consts.entityState.deleted) {
						findTagArr.push(item);
					}
				}

				/**
				 * 首先根据 料号过滤出数据
				 * 然后按顺序分配扫描到的数量，
				 * 如果有多余则要弹出拆分界面，并分配好拆分结果
				 */
				if (item.partItemNo == scanPartModel.partItemNo) {
					findPartArr.push(item);
				}
			}
			if (findTagArr.length > 0) {
				let parentItemIndex = this.getParentItem(findTagArr[0].partNo);
				this.onScrollTop(parentItemIndex);

				uni.showModal({
					title: '提示',
					content: '该标签已扫描,是否要删除',
					success: function(res_mod) {
						if (res_mod.confirm) {
							//删除 所有标签ID相同的
							//更新 实领数量
							let parentItem = _self.details[parentItemIndex];
							for (let i = 0; i < findTagArr.length; i++) {
								let item = findTagArr[i];
								for (var j = 0; j < item.tagDetails.length; j++) {
									let tag = item.tagDetails[j];
									if (tag.tagId == scanPartModel.tagId) {
										//console.log("tag: " + JSON.stringify(tag));
										item.sheetQty = util.floatObj.subtract(item.sheetQty, tag.sheetQty);
										parentItem.sheetQty = util.floatObj.subtract(parentItem.sheetQty, tag.sheetQty);
										parentItem.lastScanQty = util.floatObj.subtract(parentItem.neetQty, parentItem.sheetQty);
										if (tag.id > 0) {
											tag.entityState = consts.entityState.deleted;
										} else {
											//只删除本地刚添加的
											item.tagDetails.splice(j, 1);
										}
									}
								}
							}
						} else if (res_mod.cancel) {
						}
					}
				});
				util.showAudio();
				return;
			}
			if (findPartArr.length == 0) {
				uni.showToast({
					title: '扫描错误，当前标签不属于该单据',
					icon: 'none'
				});
				util.showAudio();
				return;
			}

			let parentItemIndex = this.getParentItem(findPartArr[0].partNo);
			this.onScrollTop(parentItemIndex);
			let parentItem = this.details[parentItemIndex];
			let totalNeetQty = util.floatObj.subtract(parentItem.neetQty, parentItem.sheetQty);

			if (totalNeetQty == 0) {
				//都已分配好，必须要在分配
				uni.showToast({
					title: '该物料已领完，不需要再领！',
					icon: 'none'
				});
				util.showAudio();
				return;
			}
			let lastNeetQty = Number(scanPartModel.sheetQty);
			if (lastNeetQty > totalNeetQty) {
				let unpackArr = [];
				unpackArr.push({
					num: 1,
					numQty: totalNeetQty
				});
				//拆分
				unpackArr.push({
					num: 1,
					numQty: util.floatObj.subtract(lastNeetQty, totalNeetQty)
				});
				this.printMode = scanPartModel;
				this.printDetail = unpackArr;
				this.showLotUnpack = true;
				return;
			}
			console.log(lockObj);
			//锁屏判断
			if (lockObj && lockObj.length > 0) {
				//需要授权
				let sheetLot = ''; //批号,主键
				for (var i = 0; i < this.proOutDetails.length; i++) {
					let item = this.proOutDetails[i];
					if (item.partItemNo == scanPartModel.partItemNo) {
						sheetLot = item.sheetLot;
						break;
					}
				}
				this.lockModel.description = lockObj;
				this.lockModel.sourceId = sheetLot;
				this.showAuth = true;
				return;
			}

			for (let i = 0; i < findPartArr.length; i++) {
				let item = findPartArr[i];
				//console.log(`lastNeetQty${lastNeetQty} |neetQty${item.neetQty} | sheetQty${item.sheetQty} | lastScanQty${item.lastScanQty}`);
				let tmpLastNeetQty = util.floatObj.subtract(item.neetQty, item.sheetQty);
				if (lastNeetQty > 0 && tmpLastNeetQty > 0) {
					let cloneModel = util.clone(scanPartModel);
					if (lastNeetQty >= tmpLastNeetQty) {
						//够分配
						item.sheetQty = util.floatObj.add(item.sheetQty, tmpLastNeetQty);
						parentItem.sheetQty = util.floatObj.add(parentItem.sheetQty, tmpLastNeetQty);
						lastNeetQty = util.floatObj.subtract(lastNeetQty, tmpLastNeetQty);
						cloneModel.sheetQty = tmpLastNeetQty;
					} else {
						//不够分配
						cloneModel.sheetQty = Number(lastNeetQty);
						item.sheetQty = util.floatObj.add(item.sheetQty, lastNeetQty);
						parentItem.sheetQty = util.floatObj.add(parentItem.sheetQty, lastNeetQty);
						lastNeetQty = 0;
					}

					parentItem.lastScanQty = util.floatObj.subtract(parentItem.neetQty, parentItem.sheetQty);
					cloneModel.entityState = consts.entityState.added;
					item.tagDetails.push(this.convert2ScmInoutBarcodeModel(item, cloneModel, _self));
					item.sheetSta = 2;
					item.entityState = consts.entityState.modified;
				}
			}
		},
		/**
		 * @param {Object} partNo 料品内码
		 * @return {String} 返回索引行
		 */
		getParentItem(partNo) {
			let parentItemIndex = -1;
			for (var i = 0; i < this.details.length; i++) {
				if (this.details[i].partNo == partNo) {
					parentItemIndex = i;
					break;
				}
			}
			return parentItemIndex;
		},
		onSave() {
			let that = this;
			//保存
			//判断是否所有的都已扫描完成
			let isFinish = true;
			for (let i = 0; i < this.details.length; i++) {
				let item = this.details[i];
				if (item.lastScanQty > 0) {
					isFinish = false;
					break;
				}
			}
			console.log(isFinish);
			if (!isFinish) {
				uni.showModal({
					title: '提示',
					content: '当前项，还有未扫描的数据，是否保存？',
					success: function(res_mod) {
						if (res_mod.confirm) {
							that.onSave1();
						} else if (res_mod.cancel) {
							return;
						}
					}
				});
			} else {
				that.onSave1();
			}
		},
		/**
		 * 保存
		 * @param refresh 0 清空 1刷新 2不刷新
		 */
		onSave1(successTips, refresh) {
			successTips = successTips || '保存成功';
			refresh = refresh || 0;
			//保存
			var cloneModel = util.clone(this.proOutDetails);
			uni.showLoading({
				mask: true
			});
			apis.picking_out_save({
				data: cloneModel,
				success: res => {
					uni.showToast({
						title: successTips
					});
					switch (refresh) {
						case 0:
							this.$refs.input_order.setFocus();
							util.dataInit(this);
							break;
						case 1:
							this.onScaned(this.purLot); //清空页面
							break;
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
			var data = {};
			data.sheetType = selectedItem.sheetType;
			data.sheetNo = selectedItem.sheetNo;
			data.sheetLot = selectedItem.sheetLot;
			data.partNo = scanModel.partNo;
			data.purLot = scanModel.poMoSoLot;
			data.proLot = scanModel.proLot;
			data.sheetQty = scanModel.sheetQty;
			data.inLot = scanModel.inLot;
			data.proDate = scanModel.proDate;
			data.tagId = scanModel.tagId;
			data.ordLot = scanModel.ordLot;
			data.custNo = scanModel.custNo;
			if (_self.isStorageBin) {
				data.binNo = scanModel.binNo;
				data.binWhNo = scanModel.binWhNo;
			} else {
				data.binNo = scanModel.binWhNo;
				data.binWhNo = scanModel.binWhNo;
			}

			data.inoutFlag = '2'; //上下架标记  1、上架；2、下架
			data.qrCode = scanModel.qrCode;
			data.entityState = consts.entityState.added;
			return data;
		},
		/* 选中的方法 */
		onSelectedItem(e) {
			for (var i = 0; i < this.details.length; i++) {
				var item = this.details[i];
				if (i == e) {
					item.selectItemClass = 'uni-list-cell-selected';
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
		lotupackCancel() {
			//隐藏拆分
			this.showLotUnpack = false;
			this.$refs.input_part.setFocus();
		},
		authClick(e) {
			this.showAuth = false;
			// 授权
			// 将授权结果保存到服务器
			for (var i = 0; i < this.proOutDetails.length; i++) {
				let item = this.proOutDetails[i];
				if (item.partItemNo == this.curScanPartModel.partItemNo) {
					item.locklogDetails = [e];
					break;
				}
			}
			if (e.resultSta == 1) {
				//同意
				//将扫描结果保存到下表中并提交
				//将 授权结果保存到下表中
				this.scanAdd(this.curScanPartModel);
				this.onSave1('提交成功', 1);
			} else {
				//不同意
				//将 授权结果保存到下表中
				this.onSave1('提交成功', 2);
			}
			this.$refs.input_part.setFocus();
		}
	}
};
</script>

<style></style>
