<!-- 工序报工 -->
<template>
	<view>
		<view id="viewHeader">
			<process-scanOrder ref="input_order" @onGetOrder="onGetOrder" v-model="order"></process-scanOrder> 
			<view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						报工方式：
					</view>
					<view class="uni-list-cell-db">
						<picker @change="bindPickerChange" :value="accIndex" :range="accList">
							<view>{{accList[accIndex]}}</view>
						</picker>
					</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						生产数量:
					</view>
					<view class="uni-list-cell-db">
						<input type="number" v-model="numQty" @input="calcBadQty" />
					</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						合格数量:
					</view>
					<view class="uni-list-cell-db">
						<input type="number" v-model="goodQty" @input="calcBadQty" />
					</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						不良数量：
					</view>
					<view class="uni-list-cell-db">
						<input type="number" v-model="badQty" disabled="disabled" />
					</view>
					<view class="uni-list-cell-pd">
						<view class="uni-icon uni-icon-plus" @click="getngqty"></view>
					</view>
				</view>
			</view>
		</view>
		<!-- 显示入库单明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in bugDetails" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">工序:{{item.proName}}</text>
								<text class="uni-title">不良现象:{{item.bugName}}</text>
							</view>
							<view class="uni-triplex-right" style="min-width: 220upx;">
								<text class="uni-h5">不良数量:{{item.sheetQty}}</text>
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
		<authorize-input :show="showAuth" :lockModel="lockModel" @onClick="authClick"></authorize-input>
		<label-print ref="labPri" :showReport="showReport" :progNo="reportModel.progNo" :reportModel="reportModel" @printComplete="printComplete"></label-print>
	</view>
</template>

<script>
	import barcodeInput from '../../components/barcode-input/barcode-input.vue' //扫码组件
	import authorizeInput from '../../components/authorize-input/authorize-input.vue';
	import labelPrint from '../../components/label-print/label-print.vue'
	import processScanOrder from '../../components/process-scanOrder/process-scanOrder.vue'; 

	import apis from '../../common/apiService.js'; //系统api
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js'; //常用功能

	export default {
		components: {
			barcodeInput,
			authorizeInput,
			labelPrint,
			processScanOrder
		},
		data() {
			return {
				accIndex: 0, //报工类型 0.正常报工 1.首检报工 2.返工报工 默认为0
				accList: ['正常报工', '首件报工'],
				showReport: false,
				reportModel: {
					progNo: '', //页面ID
					isMultiPrint: false,
					dataSource: [],
					isNeedValidTag: false, //是否需要校验标签
				},
				numQty: '',
				goodQty: '',
				badQty: '',
				bugDetails: [],
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0, 
				showAuth: false, //是否显示授权 
				lockModel: {
					lockType: 2, //锁屏类别 0.报工 1.生产退料 2.生产领料
					sourceId: '', //来源ID或单号批号
					description: ''
				},
				order: null,//选择的单据 
			}
		},
		onLoad(e) {
			this.reportModel.progNo = e.progNo || 'OPDA00013';
		},
		onShow(e) {
			//获取不良数据缓存
			let navBackData_bug_data = storage.get(consts.storageKeys.navBackData_bug_data);
			if (navBackData_bug_data != null) {
				this.bugDetails = navBackData_bug_data; //不良记录
				storage.set(consts.storageKeys.navBackData_bug_data, null);
			}
		},
		onReady() {
			util.getListHeight(this);
		},
		onBackPress(options) {
			return util.backPress(options, this.order != null);
		},
		methods: {
			/**
			 * @@description 获取选择的单据
			 */
			onGetOrder(e){
				let that = this;  
				that.order = e;
			},
			bindPickerChange(e) {
				this.accIndex = e.target.value
			},
			getngqty() {
				//添加其他工序的不良数量
				let that = this;
				if (!that.$refs.input_order.validInputFinish()){
					return;
				}
				let datas = [];
				for (var i = 0; i < that.order.moulds.length; i++) {
					if(that.order.itemNo != that.order.moulds[i].proItemNo){
						datas.push(that.order.moulds[i]);
					}
				}
				if (datas.length == 0){
					uni.showToast({
						title: '请先在PC工艺路线下表中设置工步工序！',
						icon: 'none'
					});
					util.showAudio();  
					return;
				}
				uni.navigateTo({
					url: 'process-getngqty?moulds=' + JSON.stringify(datas),
					animationType: 'slide-in-bottom',
					animationDuration: 200
				})
			},
			/* 保存 */
			onSave() {
				let that = this;
				//保存完后打印标签，根据TagValidSta判断是否需要校验标签
				if (!that.$refs.input_order.validInputFinish()){
					return;
				}
				if (util.floatObj.subtract(this.numQty, this.goodQty) != this.badQty) {
					uni.showToast({
						icon: "none",
						title: "生产数量 - 合格数量 ≠ 不良数量"
					})
					return;
				}

				uni.showLoading({
					mask: true
				});
				apis.workReport_post({
					data: this.convert2MesDayModel(),
					success: (res) => {
						//console.log(JSON.stringify(res))
						let rltModel = JSON.parse(res.resultNote);
						if (res.resultCode == "-11") {
							this.showAuth = true;
						} else {
							uni.showToast({
								title: '保存成功'
							});
							this.reportModel.dataSource = this.convert2ScmInoutBarCodeModel(rltModel);
							this.printLable();
						}
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
			convert2ScmInoutBarCodeModel(item) {
				//将返回的结果转为打印对象
				let list = [];
				var data = {}; //上架数据  
				data.partItemNo = item.partItemNo;
				data.poMoSoLot = item.moLot;
				data.proDate = item.sheetDate;
				data.deviceNo = item.deviceNo;
				data.deviceName = item.deviceName;
				data.proName = item.proName;
				data.proItemNo = item.proItemNo;
				data.reservelocus = item.reservelocus;
				data.toProItemNo = item.toProItemNo;
				data.toProName = item.toProName;
				data.id = item.id; //数量
				let bghgQty = util.floatObj.subtract(item.planQty, item.dayBadQty);

				var prefix = new Date().format("yyMMddHHmmssfff");
				if (bghgQty > 0) { //合格数量
					let cloneModel = util.clone(data);
					cloneModel.sheetQty = bghgQty;
					cloneModel.printType = "1";
					cloneModel.spcSta = "PASS";
					cloneModel.tagId = `${prefix}-${util.getSuffix(3, 1)}`;
					list.push(cloneModel);
				}
				if (item.badQty > 0) {
					let cloneModel = util.clone(data);
					cloneModel.sheetQty = item.badQty;
					cloneModel.printType = "0";
					cloneModel.spcSta = "NG";
					cloneModel.tagId = `${prefix}-${util.getSuffix(3, 2)}`;
					list.push(cloneModel);
				}
				console.log(util.outputLog(list)); 
				return list;
			},
			/**
			 * @description 要提交的对象
			 */
			convert2MesDayModel() {
				let that = this;
				let userInfo = storage.get(consts.storageKeys.login);
				var data = {};
				data.sheetDate = new Date();
				data.moLot = this.order.moLot;
				data.partNo = this.order.partNo;
				data.partItemNo = this.order.partItemNo;
				data.unitNo = this.order.unitNo;
				data.unitRate = this.order.unitRate;
				data.proNo = that.order.custNo;
				data.proItemNo = that.order.itemNo;
				data.deviceNo = that.order.deviceNo;
				data.planQty = Number(this.numQty);
				data.sheetQty = Number(this.goodQty);
				data.badQty = Number(this.badQty);
				data.dayBadQty = Number(this.badQty);
				data.sheetDate = new Date();
				data.empNo = userInfo.userID;
				data.workType = this.accIndex; //报工类型 0.正常报工 1.首检报工 2.返工报工 默认为0
				data.bugDetails = this.bugDetails || [];
				for (let i = 0; i < data.bugDetails.length; i++) {
					data.bugDetails[i].entityState = consts.entityState.added;
				}
				data.entityState = consts.entityState.added;
				return data;
			},
			authClick(e) {
				var that = this;
				this.showAuth = false;
				let datas = this.convert2MesDayModel();
				datas.locklogDetails = [e];
				uni.showLoading({
					mask: true
				});
				apis.workReport_post({
					data: datas,
					success: (res) => {
						console.log(JSON.stringify(res))
						uni.showToast({
							title: '保存成功'
						});
						//打印标签
						that.reportModel.dataSource = res;
						that.printLable();
					},
					failure: (message) => {
						util.showAudio();
					},
					complete: (status, message, content) => {
						this.$refs.input_order.setOrderFocus();
						util.tryCatchApi({
							status: status,
							message: message
						});
						uni.hideLoading();
					}
				})
			},
			calcBadQty() {
				//计算不良数量 
				if (this.numQty >= 0 && this.goodQty >= 0 && util.floatObj.subtract(this.numQty, this.goodQty) >= 0) {
					this.badQty = util.floatObj.subtract(this.numQty, this.goodQty);
				}
			},
			printLable() {
				//打印标签
				var isUseDefault = this.$refs.labPri.checkUseDefaultPrint();
				if (isUseDefault) { 
					this.$refs.labPri.userDefaultPrint();
				} else {
					this.showReport = true;
				}
			},
			printComplete() {
				util.dataInit(this);
			},
			scroll(e) { //滚动
				this.old.scrollTop = e.detail.scrollTop
			}
		}
	}
</script>

<style>
	.input-row {
		padding: 11upx 0upx;
	}

	.btn-row {
		margin-top: 30upx;
		padding: 20upx;
	}

	button.primary {
		background-color: #0faeff;
	}
</style>
