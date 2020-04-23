<!-- 储位库存查询   打印借鉴生产退料， 特殊处理时间-->
<template>
	<view>
		<!-- 顶部 -->
		<view id="viewHeader">
			<barcode-input ref="input_PartItemNos" @onScaned="onPartItemNosScaned" :focus="true" placeholder="扫描物料"></barcode-input>
			<barcode-input ref="input_BinNos" @onScaned="onBinNosScaned" placeholder="扫描储位"></barcode-input>
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
								<text class="uni-title">{{ item.boxTagId ? '外箱标签:' + item.boxTagId : '内标签：' + item.tagId }}</text>
								<text class="uni-title">数量: {{ item.sheetQty }}</text>
							</view>
							<view class="uni-triplex-right" style="min-width: 220upx;">
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">入库批次:{{ item.inLot }}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">单位:{{ item.unitName }}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">
									仓库:{{ item.whName ? item.whName : '' }}{{ item.whNo ? '(' + item.whNo + ')' : '' }}
								</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">
									货架:{{ item.binName ? item.binName : '' }}{{ item.binNo ? '(' + item.binNo + ')' : '' }}
								</text>
								
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
				style="padding: 0upx; width: 100%; margin-right: 10px; float: left;"
				:reportModel="reportModel"
				@click="onShowPrint(true)"
				@printComplete="printComplete"
				@tagValid="tagValid"
				@printCancel="onprintCancel"
			></print-button>
		</page-foot>
	</view>
</template>

<script>
import barcodeInput from '../../components/barcode-input/barcode-input.vue';
import printButton from '../../components/label-print/print-button.vue';

import apis from '../../common/apiService.js';
import consts from '../../common/consts.js';
import storage from '../../common/storage.js';
import util from '../../common/util.js';
export default {
	components: {
		barcodeInput,
		printButton
	},
	data() {
		return {
			old: {
				scrollTop: 0
			},
			scrollTop: 0,
			scrollHeight: 0,
			isStorageBin: null, //是否启用储位，否改储位
			details: [], //存放数据的数据
			partItemNos: '',
			tagIds: '',
			binNos: '',

			reportModel: {
				progNo: '', //页面ID
				showReport: false,
				isMultiPrint: false,
				dataSource: [],
				isNeedValidTag: false //是否需要校验标签
			},
			//显示隐藏批次(直接打印，不填数据，没有用弹出框，无用)
			showPrint: false //打印
		};
	},
	onLoad(option) {
		this.reportModel.progNo = option.progNo;
		this.isStorageBin = storage.get(consts.storageKeys.IsStorageBin);
	},
	/* 设置下拉列表的滚动 */
	onReady() {
		util.getListHeight(this);
	},
	/* 设置返回上一页 */
	onBackPress(options) {
		return util.backPress(options, this.details);
	},
	methods: {
		/* 扫描物料 */
		onPartItemNosScaned(e) {
			uni.showLoading({
				mask: true
			});
			var _self = this;
			apis.boxfqc_QRCodeAnalysis({
				data: {
					qrCode: e,
					enumBarCode: 2 //无 : 0, 料品内码 : 1, 料品编码 : 2, 储位 : 3, 储位所属仓库 : 4, 批次号 : 5, 序列号 : 6, 标签ID : 7, 箱号标签ID : 8, 客户标签ID : 9, 采购批号 : 10, 厂家生产批次 : 11, 订单批号 : 12, 报工ID : 13, 工序内码 : 14, 工序编码 : 15, 设备编码 : 16, 客户订单号 : 17, 客户料号 : 18, 客户箱标签 : 19
				},
				success: res => {
					_self.partItemNos = res.partItemNo;
					_self.init(_self.partItemNos, _self.tagIds, _self.binNos);
					_self.$refs.input_BinNos.setFocus();
					//console.log(util.outputLog(res));
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
		},
		/* 扫描储位 */
		onBinNosScaned(e) {
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
							this.$refs.input_BinNos.clear();
							util.showAudio();
						} else {
							this.binNos = res[0].binNo;
							// this.binNo = res[0].binNo;
							// this.binWhNo = res[0].whNo;
							//console.log(this.binNo + '----' + this.binWhNo);
							this.$refs.input_PartItemNos.setFocus();
							util.showScanedAudio();
						}
						this.init(this.partItemNos, this.tagIds, this.binNos);
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
							this.$refs.input_BinNos.clear();
							util.showAudio();
						} else {
							this.binNos = res[0].whNo;
							//this.binWhNo = res[0].whNo;
							//console.log(this.binNo + '----' + this.binWhNo);
							this.$refs.input_PartItemNos.setFocus();
							util.showScanedAudio();
						}
						this.init(this.partItemNos, this.tagIds, this.binNos);
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
		init(partItemNos, tagIds, binNos) {
			if (partItemNos == '' && tagIds == '' && binNos == '') {
				uni.showToast({
					title: '请指定条件！',
					icon: 'none'
				});
				util.showAudio();
				return;
			}
			apis.OpenMes_binmateriallistbyparm({
				data: {
					binNos,
					tagIds,
					partItemNos
				},
				success: res => {
					this.details = res;
					util.showScanedAudio();
				},
				failure: message => {
					util.showAudio();
				},
				complete: (status, message, content) => {
					this.$refs.input_PartItemNos.setFocus();
					util.tryCatchApi({
						status: status,
						message: message
					});
					uni.hideLoading();
				}
			});
		},
		onShowPrint(e) {
			this.showPrint = true;
			this.onPartPrint();
		},
		onPartPrint(e) {
			console.log(this.orderItemSelected);
			var model = {};
			model.proDate = this.orderItemSelected.proDate ? this.orderItemSelected.proDate.slice(0, 10).replace(/-/g, '/') : new Date().format('yyyy/MM/dd');
			model.partNo = this.orderItemSelected.partNo;
			model.partItemNo = this.orderItemSelected.partItemNo;
			model.partName = this.orderItemSelected.partName;
			model.partSpec = this.orderItemSelected.partSpec;
			model.serialNo = '';
			model.tagFlag = '';
			model.boxTagId = this.orderItemSelected.boxTagId || '';
			model.purLot = this.orderItemSelected.purLot;
			model.poMoSoLot = this.orderItemSelected.purLot;

			model.sheetQty = this.orderItemSelected.sheetQty;
			model.tagId = this.orderItemSelected.tagId;
			model.proLot =  this.orderItemSelected.proLot;  //安费诺需要年周
			model.cuPartNo = this.orderItemSelected.cuPartNo;  //客户料号
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
			this.reportModel.dataSource = [];
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
		scroll(e) {
			//滚动
			this.old.scrollTop = e.detail.scrollTop;
		},
		/* 选中的方法 */
		onSelectedItem(e) {
			/* 完美解决选中颜色不变的问题（提前克隆就可以了） */
			var details = util.clone(this.details);
			for (var i = 0; i < details.length; i++) {
				var item = details[i];
				if (i == e) {
					item.selectItemClass = 'uni-list-cell-selected';
					this.orderItemSelected = item;
				} else {
					item.selectItemClass = '';
				}
			}
			this.details = details;
		}
	}
};
</script>

<style></style>
