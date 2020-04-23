<!--   销售出库 -出库明细   -->
<template>
	<view>
		<view id="viewHeader"><barcode-input ref="input_part" @onScaned="onScaned" :focus="true" placeholder="扫描物料条码"></barcode-input></view>
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item, index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)" v-bind:class="item.selectItemClass">
						<view class="uni-flex uni-column" style="width: 100%;">
							<view class="uni-triplex-row">
								<view class="uni-triplex-left">
									<text class="uni-title">单号:{{ item.sheetLot }}</text>
									<text class="uni-title" style="min-width: 500upx;">料品编码:{{ item.partItemNo }}</text>
									<text class="uni-title" style="min-width: 500upx;">料品名称:{{ item.partName }}</text>
									<text class="uni-title" style="min-width: 500upx;">数量:{{ item.sheetQty }}</text>
								</view>
								<view class="uni-triplex-right">
									<text class="uni-h5" style="margin-left: -500upx;">单位:{{ item.unitName }}</text>
									<text class="uni-h5" style="min-width: 120upx;margin-left: -500upx;">已扫描数量:{{ item.scanQty }}</text>
									<text class="uni-h5" style="min-width: 120upx;margin-left: -500upx;">未扫描数量:{{ item.lastScanQty }}</text>
								</view>
							</view>
							<view class="uni-triplex-row" v-if="item.binLots.length > 0">
								<view class="div-table fixed-thead">
									<view class="thead">
										<view class="th">
											<view class="td" style="width:20%">订单号</view>
											<view class="td" style="width:20%">货架</view>
											<view class="td" style="width:40%">批次</view>
											<view class="td" style="width:20%">数量</view>
										</view>
									</view>
									<view class="tbody">
										<block v-for="(item, index) in item.binLots" :key="index">
											<view class="tr" v-if="index == 0">
												<view class="td" style="width:20%;font-weight: bold; font-size: 14px;">{{ item.cuOrdNo }}</view>
												<view class="td" style="width:20%;font-weight: bold; font-size: 14px;">{{ item.binNo || item.binWhNo }}</view>
												<view class="td" style="width:40%;font-weight: bold; font-size: 14px;overflow: hidden;overflow-x: scroll;">{{ item.inLot }}</view>
												<view class="td" style="width:20%;font-weight: bold; font-size: 14px;">{{ item.sheetQty }}</view>
											</view>
											<view class="tr" v-else>
												<view class="td" style="width:20%">{{ item.cuOrdNo }}</view>
												<view class="td" style="width:20%">{{ item.binNo || item.binWhNo }}</view>
												<view class="td" style="width:40%;overflow: hidden;overflow-x: scroll;">{{ item.inLot }}</view>
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
		<!-- 锁屏 -->
		<authorize-input :show="showAuth" :lockModel="lockModel" @onClick="authClick"></authorize-input>
		<lotunpack :show="showLotUnpack" :model="printMode" :printDetail="printDetail" :progNo="progNo" @cancel="lotupackCancel" @printComplete="printComplete" @printCancel="printCancel"></lotunpack>
	</view>
</template>

<script>
import barcodeInput from '../../components/barcode-input/barcode-input.vue'; //扫码组件
import authorizeInput from '../../components/authorize-input/authorize-input.vue';
import lotunpack from '../../components/lotunpack/lotunpack.vue';
import apis from '../../common/apiService.js'; //系统api
import consts from '../../common/consts.js';
import storage from '../../common/storage.js';
import util from '../../common/util.js'; //常用功能
import { mapMutations } from 'vuex';
export default {
	components: {
		barcodeInput,
		authorizeInput,
		lotunpack
	},
	data() {
		var date = new Date();
		return {
			progNo: '', //页面ID
			sheetLot: '',
			old: {
				scrollTop: 0
			},
			scrollTop: 0,
			scrollHeight: 0,
			showLotUnpack: false, //是否显示拆分打印
			printMode: {}, //需拆分的标签对象
			printDetail: [], //拆分结果
			isStorageBin: null, //是否启用储位，否改储位
			details: [],
			orderItemSelected: {}, //当前选中项
			scan_qrCode: '',
			resultNote: {}, //物料扫描返回的对象之一resultNote
			showAuth: false, //锁屏显示
			lockModel: {
				lockType: consts.lockType.sale_out, // 锁屏类别  0.报工  1.生产退料  2.生产领料  3.工序接收  4.工序投入 5.销售出货
				sourceId: '', //来源ID或单号批号
				description: '' //提示内容
			}
		};
	},
	onLoad(e) {
		console.log(util.outputLog(e));
		this.progNo = e.progNo;
		this.isStorageBin = storage.get(consts.storageKeys.IsStorageBin);
		this.sheetLot = e.sheetLot;
	},
	onReady() {
		util.getListHeight(this);
		var _self = this;

		uni.showLoading({
			mask: true
		});
		apis.sale_getDetails({
			data: {
				sheetLot: _self.sheetLot
			},
			success: res => {
				this.details = [];
				res.scanQty = 0;
				res.lastScanQty = res.sheetQty;
				this.details.push(res); //理论只有一条
				//视图需要一定时间才能渲染完成，延时定位才能不报错。
				setTimeout(function() {
					_self.details.forEach(function(item, i) {
						_self.onScrollTop(i);
						_self.updateScanList();
					});
				}, 200);
				/* for(var i=0;i<1000;i++){
					var item={};
					_self.details.push(item);
				} */
			},
			failure: message => {
				var mege = JSON.stringify(message);
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
	onBackPress(options) {
		return util.backPress(options, this.details.length > 0);
	},
	methods: {
		...mapMutations(['pageIO_true']),
		onScaned: function(e) {
			uni.showLoading({
				mask: true
			});

			let _self = this;
			//扫描后弹出保存
			_self.scan_qrCode = e;
			apis.sale_lockScreen_valid({
				data: {
					sheetLot: this.sheetLot,
					qrCode: e
				},
				success: res => {
					//var startDate = new Date();
					_self.resultNote = {};
					_self.resultNote = JSON.parse(res.resultNote);
					//1.校验料号，数量，是否一致
					for (var i = 0, len = _self.details.length; i < len; i++) {
						var item = _self.details[i];
						if (item.partNo === _self.resultNote.partNo) {
							//扫描的物料是否是出货的物料
							_self.onScrollTop(i);
							item.tagDetails = item.tagDetails || []; //扫描集合
							item.locklogDetails = item.locklogDetails || []; //授权记录
							//准备提交扫描数据的集合,提交扫描数据的集合不能重复
							var to_len = item.tagDetails.length;
							var radius = Math.round(to_len / 2);
							var tag_bool = _self.item_radius(item, radius, to_len, _self);
							if (!tag_bool) {
								/* 没找到从头找一半 */
								_self.item_radius(item, 0, radius, _self);
							}
							//扫描数量不能大于出货数量
							if (util.floatObj.add(item.scanQty, _self.resultNote.sheetQty) > Number(item.sheetQty)) {
								this.onScrollTop(i);
								util.showScanedAudio();
								this.tag_split(_self.resultNote, item.lastScanQty);
								return;
							}
						}
					}
					//2.1.不是最早批次resultCode ==-11弹出授权窗体
					if (res.resultCode == -11) {
						//锁屏判断
						//需要授权
						this.lockModel = {
							lockType: consts.lockType.sale_out, // 锁屏类别  :5.销售出货
							sourceId: '', //来源ID或单号批号
							description: '' //提示内容
						};
						this.lockModel.description = res.resultText; //锁屏提示内容
						this.lockModel.sourceId = this.sheetLot; //锁屏单号
						this.lockModel.lockType = consts.lockType.sale_out; //锁屏类型
						this.showAuth = true;
						util.showAudio();
						return;
					} else {
						//2.2是最早批次：和同意逻辑一样
						//console.log('最早批次')
						_self.resultNote_ifTagDet();
						util.showScanedAudio();
					}
					//console.log(new Date().getTime() - startDate); /* 用了多长时间*/
					util.automateSave(_self.details, 'lastScanQty', 0, _self.onSave);
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
		item_radius(item, to_i, to_len, _that) {
			for (to_len; to_i < to_len; to_i++) {
				//循环检查提交扫描数据的集合
				var item_tag = item.tagDetails[to_i];
				if (item_tag.tagId == _that.resultNote.tagId) {
					//提交扫描数据的集合不能重复
					util.showAudio();
					uni.showModal({
						title: '提示',
						content: '该标签已扫描,是否要删除',
						success: function(res_mod) {
							if (res_mod.confirm) {
								item.tagDetails.splice(to_i, 1); //删除一张扫描的条码标签（
								_that.updateScanList();
							} else if (res_mod.cancel) {
							}
						}
					});
					return 1;
				}
			}
		},
		authClick(e) {
			this.showAuth = false;
			let _self = this;
			let item_e = e;
			// 授权记录
			for (var i = 0, len = this.details.length; i < len; i++) {
				let item = this.details[i];
				if (item.partItemNo == this.resultNote.partItemNo) {
					item.locklogDetails.push(item_e);
					//修改状态
					item.locklogDetails.entityState = consts.entityState.added;
					break;
				}
			}
			//同意
			if (e.resultSta == 1) {
				_self.resultNote_ifTagDet();
			}
			this.$refs.input_part.setFocus();
		},
		resultNote_ifTagDet() {
			//外箱,内箱  逻辑

			let _self = this;
			for (var i = 0, len = _self.details.length; i < len; i++) {
				var item = _self.details[i];
				item.sheetSta = 2;
				item.entityState = consts.entityState.modified; //修改状态   details
				//判断是否是外箱还是内箱      明细改来源原单号  sheelot
				if (_self.resultNote.tagDetails) {
					//外箱有两层，的tagDetails
					for (var t = 0, tag_len = _self.resultNote.tagDetails.length; t < tag_len; t++) {
						var tag = _self.resultNote.tagDetails[t];
						if (item.partNo == tag.partNo) {
							//扫描的物料是否是出货的物料
							tag.id = null;
							tag.inoutFlag = 2; //修改下架
							tag.sheetLot = _self.sheetLot; //更改来源批次号
							tag.sheetNo = item.sheetNo; //修改内箱的来源单号，为该头表的单号
							tag.whNo = item.whNo; //仓库编码
							tag.whName = item.whName; //仓库名称
							tag.unitNo = item.salUnit; //单位
							tag.unitName = item.unitName; //单位名称
							tag.sheetSta = 2; //状态
							tag.qrCode = tag.qrCode || _self.scan_qrCode; //条码
							tag.entityState = consts.entityState.added; //修改状态为添加 tagDetails
							item.tagDetails.push(tag); //1.1.数量相等添加到集合  （将内箱循环添加）
						}
					}
					//console.log('授权同意-外标签的内标签：' + JSON.stringify(item.tagDetails));
					uni.showToast({
						title: '扫描成功'
					});
					_self.resultNote = null;
					_self.updateScanList();
				} else {
					if (item.partNo == _self.resultNote.partNo) {
						//内箱  //扫描的物料是否是出货的物料
						_self.resultNote.id = null;
						_self.resultNote.inoutFlag = 2; //修改下架
						_self.resultNote.sheetLot = _self.sheetLot; //更改来源批次号
						_self.resultNote.sheetNo = item.sheetNo; //修改内箱的来源单号，为该头表的单号
						_self.resultNote.whNo = item.whNo; //仓库编码
						_self.resultNote.whName = item.whName; //仓库名称
						_self.resultNote.unitNo = item.salUnit; //单位
						_self.resultNote.unitName = item.unitName; //单位名称
						_self.resultNote.purLot = _self.resultNote.poMoSoLot;
						_self.resultNote.sheetSta = 2; //状态
						_self.resultNote.qrCode = _self.resultNote.qrCode || _self.scan_qrCode; //条码
						_self.resultNote.entityState = consts.entityState.added; //修改状态为添加 tagDetails
						item.tagDetails.push(_self.resultNote); //1.1.数量相等添加到集合
						//console.log('最早批-内标签：' + JSON.stringify(_self.resultNote));
						_self.resultNote = null;
						_self.updateScanList();
						uni.showToast({
							title: '扫描成功'
						});
					}
				}
			}
			//2019-07-31新增扫描后自动提示保存 2019-09-02加util
			util.automateSave(_self.details,"lastScanQty",0,_self.onSave);
		},
		onSave() {
			if (this.details.length == 0) {
				return;
			}
			var _self = this;
			for (var i = 0, len = this.details.length; i < len; i++) {
				var item = this.details[i];
				//details校验全部扫描数量=出货数量，修改状态
				if (Number(item.scanQty) != Number(item.sheetQty)) {
					//已扫描数量==出货数量？
					util.showAudio();
					uni.showToast({
						icon: 'none',
						title: '扫描数量不足出货数量！'
					});
					return; //break
				}
			}
			console.log(util.outputLog(_self.details));
			apis.sale_save_put({
				data: _self.details,
				success: res => {
					console.log(JSON.stringify(res));
					uni.showToast({
						title: '保存成功.'
					});
					util.dataInit(_self);
					_self.pageIO_true();
					setTimeout(function() {
						uni.navigateBack();
					}, 500);
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
			/* 取消事件 */
			this.printDetail = []; /* 清空原有数据*/
			this.showLotUnpack = false;
			this.$refs.input_part.setFocus();
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
		updateScanList() {
			//更新列表结果
			var scanQty = 0;
			if (this.orderItemSelected.tagDetails) {
				for (var i = 0; i < this.orderItemSelected.tagDetails.length; i++) {
					scanQty = util.floatObj.add(scanQty, this.orderItemSelected.tagDetails[i].sheetQty);
				}
			}
			this.orderItemSelected.scanQty = scanQty;
			this.orderItemSelected.lastScanQty = util.floatObj.subtract(this.orderItemSelected.sheetQty, scanQty); //单个赋值有时数据源不会更新视图
			var ItemSelected = util.clone(this.orderItemSelected); //所以先复制一份，（搞绝一点，赋值不要直接引用赋值）
			this.orderItemSelected = ItemSelected; //重新给他赋值就更新好了
		}
	}
};
</script>

<style></style>
