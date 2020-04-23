<!--工序投入-->
<template>
	<view>
		<view id="viewHeader">
			<process-scanOrder ref="input_order" @onGetOrder="onGetOrder" v-model="order"></process-scanOrder> 
			<barcode-input ref="input_part" @onScaned="onPartScaned" placeholder="扫描物料"></barcode-input>
		</view>
		<!-- 显示入库单明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">料号:{{item.partItemNo}}</text>
								<text class="uni-title">料品名称:{{item.partName}}</text>
								<text class="uni-title">From工序:{{item.proName}}</text>
								<text class="uni-title">数量: {{item.sheetQty}}</text>
							</view>
							<view class="uni-triplex-right" style="min-width: 220upx;">
								<text class="uni-h5">单位:{{item.unitName}}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>

		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<button type="primary" @click="onSave">保存</button>
		</page-foot>
	</view>
</template>

<script>
	var date = new Date();
	import barcodeInput from '../../components/barcode-input/barcode-input.vue' //扫码组件
	import processScanOrder from '../../components/process-scanOrder/process-scanOrder.vue'; 

	import apis from '../../common/apiService.js'; //系统api
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js'; //常用功能
	export default {
		components: {
			barcodeInput,
			processScanOrder
		},
		data() {
			return {
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				userInfo: [],
				details: [], 
				curScanPartModel: {}, //当前扫描物料对象
				order: null,//选择的单据 
			}
		},
		onLoad(option) { //页面id
			this.progNo = option.progNo;
			this.userInfo = storage.get(consts.storageKeys.login)
		},
		onReady() {
			util.getListHeight(this);
		},
		onBackPress(options) {
			return util.backPress(options, this.details.length > 0);
		},
		methods: {
			/**
			 * @@description 获取选择的单据
			 */
			onGetOrder(e){
				let that = this;  
				that.order = e;
				that.$refs.input_part.setFocus();
			},
			onPartScaned(e) {
				let that = this;
				//扫描物料
				//判断物料是否扫描重复
				uni.showLoading({
					mask: true
				});
				apis.pro_TR_PartScan({
					data: {
						moLot: that.order.moLot,
						proItemNo: that.order.proItemNo,
						deviceNo: that.order.deviceNo,
						qrCode: e
					},
					success: (res) => {
						let scanPartModel = JSON.parse(res.resultNote);
						scanPartModel.qrCode = e;
						that.curScanPartModel = util.clone(scanPartModel);
						let lockObj = null;
						if (res.resultCode == "-11") {
							lockObj = res.resultText;
						}
						that.scanAdd(that.curScanPartModel, lockObj);
						util.showScanedAudio();
					},
					failure: (message) => {
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
				})
			},
			/**
			 * 添加扫描的结果
			 * @param lockObj 锁屏对象
			 */
			scanAdd(scanPartModel, lockObj) {
				var that = this;
				//判断标签是否扫描重复
				//判断 制造单号、料号、to工序==本工序
				for (let i = 0; i < that.details.length; i++) {
					let item = that.details[i];
					if (item.tagId == scanPartModel.tagId) {
						uni.showModal({
							title: '提示',
							content: '该标签已扫描,是否要删除',
							success: function(res_mod) {
								if (res_mod.confirm) {
									that.details.splice(i, 1);
								} else if (res_mod.cancel) {}
							}
						});
						util.showAudio();
						return;
					}
				}
				if (that.order.moLot != scanPartModel.poMoSoLot) {
					uni.showToast({
						title: '该物料不属于当前制造单',
						icon: 'none'
					});
					util.showAudio();
					return;
				}
				if (that.order.partItemNo != scanPartModel.partItemNo) {
					uni.showToast({
						title: '物料不一致',
						icon: 'none'
					});
					util.showAudio();
					return;
				}
				if (that.order.itemNo != scanPartModel.toProItemNo) {
					uni.showToast({
						title: '该物料TO工序不属于当前工序',
						icon: 'none'
					});
					util.showAudio();
					return;
				}
				if (lockObj && lockObj.length > 0) {
					//需要授权
					let sheetLot = ''; //批号,主键
					for (var i = 0; i < that.details.length; i++) {
						let item = that.details[i];
						if (item.partItemNo == scanPartModel.partItemNo) {
							sheetLot = item.sheetLot;
							break;
						}
					}
					that.lockModel.description = lockObj;
					that.lockModel.sourceId = sheetLot;
					that.showAuth = true;
					return;
				} else {
					that.details.push(scanPartModel);
					that.onScrollTop(that.details.length - 1);
				}
			},
			authClick(e) {
				this.showAuth = false;
				// 授权
				// 将授权结果保存到服务器 
				for (var i = 0; i < this.details.length; i++) {
					let item = this.details[i];
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
				}
				this.$refs.input_part.setFocus();
			},
			onSave() {
				/* 保存 */
				let that = this; 
				if (!that.$refs.input_order.validInputFinish()){
					return;
				}
				if (this.details.length == 0) {
					uni.showToast({
						title: '请扫描要投入的物料',
						icon: 'none'
					});
					this.$refs.input_part.setFocus();
					return;
				}
				let datas = this.convert2ScmMesDayInputModel();
				//console.log("datas:----- " + JSON.stringify(datas));
				uni.showLoading({
					mask: true
				});

				apis.Pda_pdamesdayproinput({
					data: datas,
					success: (res) => {
						uni.showToast({
							title: '保存成功!'
						});
						//初始化数据，（软件盘）
						util.dataInit(this);
						this.$refs.input_order.setOrderFocus();
					},
					failure: (message) => {
						util.showAudio();
					},
					complete: (status, message, content) => {
						util.tryCatchApi({
							status: status,
							message: message
						});
						uni.hideLoading();
					}
				})
			},
			/**
			 * @description 要提交的对象
			 */

			convert2ScmMesDayInputModel() {
				var list = [];
				var date = new Date();
				for (let i = 0; i < this.details.length; i++) {
					var item = this.details[i];
					//console.log("item:----- " + JSON.stringify(item));
					var data = {};
					data.sheetDate = date.format('yyyy/MM/dd hh:mm:ss');
					data.moLot = this.order.moLot;
					data.proNo = this.order.custNo;
					data.proItemNo = this.order.itemNo;
					data.deviceNo = this.order.deviceNo;
					data.partNo = item.partNo;
					data.partItemNo = item.partItemNo;
					data.partName = item.partName;
					data.partSpec = item.partSpec;
					data.unitNo = item.unitNo;
					data.unitName = item.unitName;
					data.inLot = item.inLot;
					data.sheetQty = item.sheetQty;
					data.esnNo = item.esnNo;
					data.updateTime = date.format('yyyy/MM/dd hh:mm:ss');
					data.userNo = this.userInfo.userID;
					data.createDate = date.format('yyyy/MM/dd hh:mm:ss')||new Date().format('yyyy/MM/dd hh:mm:ss');
					data.dayId = item.dayId;
					data.tagId = item.tagId;
					data.qrCode = item.qrCode;
					data.inputType = 2; //1、物料投入；2、工序转入
					data.sourceSpcSta = 1; //合格
					data.sourceCustNo = item.proNo; //转入工序
					data.locklogDetails = item.locklogDetails;
					data.entityState = consts.entityState.added;
					list.push(data);
				}
				return list;
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
			scroll(e) { //滚动
				this.old.scrollTop = e.detail.scrollTop
			},
			onScrollTop(index) {
				//滚动定位
				this.onSelectedItem(index);
				let view = uni.createSelectorQuery().select(".scroll-view-item");
				view.boundingClientRect(data => {
					this.scrollTop = this.old.scrollTop 
					if (data == null) return;
					this.$nextTick(function() {
						this.scrollTop = data.height * index;
					});
				}).exec();
			}
		}
	}
</script>

<style>
</style>
