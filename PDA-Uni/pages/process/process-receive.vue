<!--工序交接 -->
<template>
	<view>
		<view id="viewHeader">
			<process-scanOrder ref="input_order" @onGetOrder="onGetOrder" v-model="order"></process-scanOrder> 
			<barcode-input ref="input_SendUser" @onScaned="onScan_SendUser" :value="SendUser.empName" placeholder="送达人"></barcode-input>
			<barcode-input ref="input_receiveUser" @onScaned="onScan_receiveUser" :value="receiveUser.empName" placeholder="接收人"></barcode-input>
			<barcode-input ref="input_part" @onScaned="onScan_part" :value="value_part" placeholder="扫描物料"></barcode-input>
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
								<text class="uni-title">检验结果:{{item.joinSpcSta==1?'合格':'不合格'}}</text>
							</view>
							<view class="uni-triplex-right">
								<text class="uni-h5" style="min-width: 120upx;margin-left: -500upx;">单位:{{item.unitName}}</text>
								<text class="uni-h5" style="min-width: 120upx;margin-left: -500upx;">数量:{{item.sheetQty}}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>


		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<button type="primary" @click="onSave()">保存</button>
		</page-foot>
		<!-- 锁屏 -->
		<authorize-input :show="showAuth" :lockModel="lockModel" @onClick="authClick"></authorize-input>
	</view>
</template>

<script>
	import barcodeInput from '../../components/barcode-input/barcode-input.vue' //扫码组件
	import authorizeInput from '../../components/authorize-input/authorize-input.vue';
	import processScanOrder from '../../components/process-scanOrder/process-scanOrder.vue'; 
	
	var date = new Date();
	import apis from '../../common/apiService.js'; //系统api
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js'; //常用功能
	export default {
		components: {
			barcodeInput,
			authorizeInput,
			processScanOrder
		},
		data() {
			return {
				order: {}, //工单对象 一般是空的没什么作用
				MesDayModel: {}, //扫描物料
				resultNote: {},
				SendUser: {
					empName: ''
				}, //送达人
				receiveUser: {
					empName: ''
				}, //接收人
				userInfo: {},
				showAuth: false,
				lockModel: {},
				progNo: '', //页面ID
				process: '', //工序	
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				details: [],
				orderItemSelected: {}, //当前选中项
			}
		},
		onLoad(option) { //页面id
			this.progNo = option.progNo || 'OPDA00010';
			console.log(this.progNo)
			this.userInfo = storage.get(consts.storageKeys.login);
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
				this.$refs.input_SendUser.setFocus();
			},
			onScan_SendUser(e) {
				uni.showLoading({
					mask: true
				});
				apis.emp_a({
					data: {
						empNo: e
					},
					success: (res) => {
						this.SendUser = res;
						console.log(JSON.stringify(this.SendUser))
						this.$refs.input_receiveUser.setFocus();
						util.showScanedAudio();
					},
					failure: (message) => {
						uni.hideLoading();
						this.$refs.input_SendUser.setFocus();
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
			onScan_receiveUser(e) {
				uni.showLoading({
					mask: true
				});
				apis.emp_a({
					data: {
						empNo: e
					},
					success: (res) => {
						console.log(JSON.stringify(res))
						this.receiveUser = res;
						this.$refs.input_part.setFocus();
						util.showScanedAudio();
					},
					failure: (message) => {
						uni.hideLoading();
						this.$refs.input_receiveUser.setFocus();
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
			onScan_part(e) {
				var that = this;
				uni.showLoading({
					mask: true
				});
				apis.Pda_pdamesdaylistbyjoincode({
					data: {
						qrCode: e
					},
					success: (res) => {
						that.MesDayModel.resultCode = res.resultCode;
						that.resultNote = JSON.parse(res.resultNote);
						that.MesDayModel.resultText = res.resultText || '';
						if (that.order.moLot != that.resultNote.moLot) {
							uni.showToast({
								title: '该物料不属于当前制造单',
								icon: 'none'
							});
							util.showAudio();
							return;
						}
						if (that.order.partItemNo != that.resultNote.partItemNo) {
							uni.showToast({
								title: '物料不一致',
								icon: 'none'
							});
							util.showAudio();
							return;
						}
						if (that.order.itemNo != that.resultNote.toProItemNo) {
							uni.showToast({
								title: '该物料TO工序不属于当前工序',
								icon: 'none'
							});
							util.showAudio();
							return;
						}

						//准备提交扫描数据的集合,提交扫描数据的集合不能重复
						for (var j = 0; j < that.details.length; j++) { //循环检查提交扫描数据的集合
							var item = that.details[j];
							if (item.tagId === that.resultNote.tagId) { //提交扫描数据的集合不能重复
								util.showAudio();
								uni.showToast({
									icon: 'none',
									title: '这张已经扫过了！！'
								})
								return;
							}
						}

						//console.log(JSON.stringify(that.MesDayModel))
						//console.log(JSON.stringify(that.resultNote))
						var model = {};
						//2.1.不是最早批次resultCode ==-11弹出授权窗体
						if (res.resultCode == -11) { //锁屏判断
							//需要授权
							this.lockModel = {
								lockType: consts.lockType.process_receive, // 锁屏类别  
								sourceId: '', //来源ID或单号批号
								description: '' //提示内容
							};
							//console.log(JSON.stringify(this.lockModel))
							this.lockModel.description = that.MesDayModel.resultText; //锁屏提示内容
							this.lockModel.sourceId = this.order.moLot; //锁屏单号
							this.lockModel.lockType = consts.lockType.process_receive; //锁屏类型
							//console.log(JSON.stringify(this.lockModel))
							that.showAuth = true;
							console.log(that.showAuth)
							util.showAudio();
							return;
						} else {
							//上工序：和同意逻辑一样
							console.log('上工序')
							var model = {
								sheetDate: date.format('yyyy/MM/dd hh:mm:ss'),
								dayId: that.resultNote.id,
								// 		spcId: 0,
								tagId: that.resultNote.tagId,
								planLot: that.resultNote.planLot,
								dispathLot: that.resultNote.dispathLot,
								moLot: that.order.moLot,
								difFlag: that.resultNote.difFlag,
								partNo: that.resultNote.partNo,
								partItemNo: that.resultNote.partItemNo,
								partName: that.resultNote.partName,
								partSpec: that.resultNote.partSpec,
								unitNo: that.resultNote.unitNo,
								unitName: that.resultNote.unitName,
								unitRate: that.resultNote.unitRate,
								proNo: that.resultNote.proNo,
								proItemNo: that.resultNote.proItemNo,
								proName: that.resultNote.proName,
								deviceNo: that.resultNote.deviceNo,
								deviceName: that.resultNote.deviceName,
								toProNo: that.resultNote.toProNo,
								toProItemNo: that.resultNote.toProItemNo,
								toProName: that.resultNote.toProName,
								sheetQty: that.resultNote.sheetQty, //数量
								empNo: that.SendUser.empNo,
								toEmpNo: that.receiveUser.empNo,
								joinSpcSta: that.resultNote.spcSta == 0 ? 2 : 1, //合格和不合格交接
								userNo: that.userInfo.userID,
								createDate: date.format('yyyy/MM/dd hh:mm:ss'),
								// 		rem: string,
								entityState: consts.entityState.added
							}
							console.log(JSON.stringify(model));
							that.details.push(model);
							model = {};
							util.showScanedAudio();
						}
					},
					failure: (message) => {
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
				})
			},
			authClick(e) {
				this.showAuth = false;
				let that = this;
				let item_e = e;
				//非上工序同意和授权
				var model = {};
				model.locklogDetails.push(item_e);
				if (e.resultSta == 1) {
					console.log(JSON.stringify(item_e));
					var model = {
						sheetDate: date.format('yyyy/MM/dd hh:mm:ss'),
						dayId: that.resultNote.id,
						// 		spcId: 0,
						tagId: that.resultNote.tagId,
						planLot: that.resultNote.planLot,
						dispathLot: that.resultNote.dispathLot,
						moLot: that.order.moLot,
						difFlag: that.resultNote.difFlag,
						partNo: that.resultNote.partNo,
						partItemNo: that.resultNote.partItemNo,
						partName: that.resultNote.partName,
						partSpec: that.resultNote.partSpec,
						unitNo: that.resultNote.unitNo,
						unitName: that.resultNote.unitName,
						unitRate: that.resultNote.unitRate,
						proNo: that.resultNote.proNo,
						proItemNo: that.resultNote.proItemNo,
						proName: that.resultNote.proName,
						deviceNo: that.resultNote.deviceNo,
						deviceName: that.resultNote.deviceName,
						toProNo: that.resultNote.toProNo,
						toProItemNo: that.resultNote.toProItemNo,
						toProName: that.resultNote.toProName,
						sheetQty: that.resultNote.sheetQty, //数量
						empNo: that.SendUser.empNo,
						toEmpNo: that.receiveUser.empNo,
						joinSpcSta: that.resultNote.spcSta === 0 ? 2 : 1, //合格和不合格交接
						userNo: that.userInfo.userID,
						createDate: date.format('yyyy/MM/dd hh:mm:ss'),
						// 		rem: string,
						entityState: consts.entityState.added,
						locklogDetails: []
					}
					//console.log(JSON.stringify(model));
					that.details.push(model);
					model = {};
				}

				this.$refs.input_part.setFocus();
			},
			/* 保存 */
			onSave() {
				var that = this;
				if (!that.$refs.input_order.validInputFinish()){
					return;
				}
				if (that.details.length <= 0) {
					uni.showToast({
						title: '请扫描交接物料！',
						icon: 'none',
						mask: true
					})
					util.showAudio();
					this.$refs.input_part.setFocus();
					return;
				}
				//console.log(this.details)
				//console.log(JSON.stringify(this.details))
				uni.showLoading({
					mask: true
				});
				apis.Pda_pdamesdayjoin({
					data: that.details,
					success: (res) => {
						console.log(JSON.stringify(res))
						uni.showToast({
							title: '保存成功',
							icon: 'none',
							mask: true
						})
						util.dataInit(this);
						this.$refs.input_order.setOrderFocus();
					},
					failure: (message) => {
						uni.hideLoading();
						uni.showToast({
							title: '保存失败',
							icon: 'none',
							mask: true
						})
						util.showAudio();
						this.$refs.input_part.setFocus();
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

			scroll(e) { //滚动
				this.old.scrollTop = e.detail.scrollTop
			},
			onScrollTop(index) {
				//滚动定位
				this.onSelectedItem(index)
				let view = uni.createSelectorQuery().in(this).select(".scroll-view-item");
				view.boundingClientRect(data => {
					this.scrollTop = this.old.scrollTop
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
