<!-- 工单上线
 1.关于本地设置的判断
   1.如果有本地设置，则扫描设备的时候进行匹配，如果不一致则给出提示
   2.如果一致，则带出工序，且工序不允许扫描
   3.如果没有本地配置，则验证扫描的设备、工序是否正确
 2.扫描制单，返回当前制单的所有设备 & 工序
   1.扫描设备判断 沿用第1点，但是设备要属于当前工单，如果不属于则提示修改配置，或取消配置
 3.对于工装的判断
   1.如果当前工序在工艺路线中设置了工装，且下表也设置了工装，那么则显示扫描工装，且扫描的第一条数据必须为上表的工装，且工装个数必须与设置的一致，上表工装扫描完后，在扫描下表的工装，逻辑与上表一致；
 4.上线保存 需验证所有的输入项是否已输入；
 -->
<template>
	<view>
		<view id="viewHeader">
			<process-scanOrder ref="input_order" @onGetOrder="onGetOrder" v-model="order"></process-scanOrder> 
			<view v-show="allowScanMould">
				<barcode-input ref="input_mould" @onScaned="onMouldScaned" placeholder="请扫描工装" :clearScan="true"></barcode-input>
				<view class="mouldTips">
				    <text>还需扫描 {{calcProMouldQty}} 个工装</text>
				</view>
			</view>
			
			<view v-show="allowScanGBMould">
				<view class="uni-title">
				    <text>工步扫描</text>
				</view>
				<!-- that.calcProMouldQty1 如果没有扫描完，不允许改变 -->
				<barcode-input ref="input_pro1" @onScaned="onProScaned1" placeholder="请扫描工序" :disabled="!allowScanGBPro" :isShowScan="allowScanGBPro" :value="gbCurPro.proName" ></barcode-input>
				<barcode-input ref="input_mould1" @onScaned="onMouldScaned1" :value="gbMould" placeholder="请扫描工装" :clearScan="true"></barcode-input>
				<view class="mouldTips">
				    <text>还需扫描 {{calcProMouldQty1}} 个工装</text>
				</view>
			</view>
			 
		</view>
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)" v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">类别:{{item.mouldType == 1 ? '上线工序工装':'工步工装'}}</text>
								<text class="uni-title">工序:{{item.proName}}</text>
								<text class="uni-title">工装号:{{item.mouldNo}}</text> 
								<text class="uni-title">工装版号:{{item.mouldVer}}</text>
							</view>
							<view class="uni-triplex-right" style="min-width: 220upx;"> 
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<button type="primary" @click="onSave">上线</button>
		</page-foot>
	</view>
</template>

<script>
	import barcodeInput from '../../components/barcode-input/barcode-input.vue'; //扫码组件
	import processScanOrder from '../../components/process-scanOrder/process-scanOrder.vue'; //扫码组件

	import apis from '../../common/apiService.js'; //系统api
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js'; //常用功能
	let oriScrollHeight = 0;//滚动区域原始高度
	export default {
		components: {
			barcodeInput,
			processScanOrder
		},
		data() {
			return {
				progNo: '', //页面ID  
				allowScanMould: false,//是否允许扫描工装
				allowScanGBMould: false,//是否允许扫描工步工序
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				details: [],//扫描的工装集合 
				order: null,//选择的当前工艺路线中的那条记录 
				mouldItemSource:[],//允许的工装列表 
				gbCurPro: null,//工步工序
				gbMould: '',//工步 工装
				gbMouldItemsSource: []//工步工装列表
			}
		},
		computed:{
			calcProMouldQty() { 
				let that = this;
				//返回当前工序应扫描工装个数
				if (that.order != null && that.order.mouldVer.length > 0){
					let count = 0;
					for (var i = 0; i < that.details.length; i++) {
						if(that.details[i].mouldType == 1){
							count++;
						}
					}
					return that.order.mouldQty - count;
				}
				return 0;
			}, 
			calcProMouldQty1() { 
				let that = this;
				//返回工步工序应扫描工装个数
				if (that.gbCurPro != null && that.gbCurPro.mouldVer.length > 0){
					let count = 0;
					for (var i = 0; i < that.details.length; i++) {
						if(that.details[i].mouldType == 2 && that.gbCurPro.mouldVer == that.details[i].mouldVer){
							count++;
						}
					}
					return that.gbCurPro.mouldQty - count;
				}
				return 0;
			},
			allowScanGBPro(){
				//是否允许工步工序扫描
				let that = this;
				if(that.gbCurPro == null) return true;
				return that.calcProMouldQty1 == 0;
			}
		},
		onLoad(option) {
			this.progNo = option.progNo;
		},
		onReady() {
			util.getListHeight(this);
		},
		onBackPress(options) {
			return util.backPress(options, this.details.length > 0);
		},
		methods: {
			/**
			 * @description 获得工单信息 
			 */
			onGetOrder(e){
				let that = this;  
				that.order = e;
				let rowHeight = 34;
				if (oriScrollHeight == 0){
					oriScrollHeight = that.scrollHeight;
				}
				if (Number(that.order.mouldQty) > 0){
					var tmpHeight = Number(that.scrollHeight.toString().replace('px', ''));
					if (!that.allowScanMould && that.order.mouldVer.length > 0){
						that.allowScanMould = true;
						tmpHeight -= rowHeight;
					}
					if (!that.allowScanGBMould && (
					(that.order.mouldVer.length > 0 && that.order.moulds.length > 1) ||
					(that.order.mouldVer.length == 0 && that.order.moulds.length > 0)
					)){
						that.allowScanGBMould = true;
						tmpHeight -= rowHeight * 3;
					}							
					that.scrollHeight = tmpHeight + 'px';
				}  
				if (that.allowScanMould){
					that.$refs.input_mould.setFocus();
				}
			},
			
			/**
			 * @description 扫描工装
			 * @param {Object} e
			 */
			onMouldScaned(e) {
				//判断扫描的工装号，是否在 mouldItemSource 中
				//且第一笔必须为上表的工装
				let that = this; 
				
				for (var i = 0; i < that.details.length; i++) {
					if(that.details[i].deviceNo == e){
						this.onScrollTop(i);
						uni.showModal({
							title: '提示',
							content: '当前工装已扫描,是否要删除？',
							success: function(res_mod) {
								if (res_mod.confirm) {
									that.details.splice(i, 1);
									that.updateScanList();
								} else if (res_mod.cancel) {}
								that.$refs.input_mould.setFocus();
							}
						});
						util.showAudio();
						return;
					}
				}
				
				//不能超过工装数量
				//判断上表工装是否已扫描完成
				if (that.calcProMouldQty == 0){
					uni.showToast({
						title: '只能扫描'+ that.order.mouldQty +'个工装！',
						icon: 'none'
					});
					util.showAudio(); 
					this.$refs.input_mould.setFocus();
					return;
				}
				
				uni.showLoading({
					mask: true
				});
				apis.shopWB_GetMould({
					data: {
						mouldVer: that.order.mouldVer
					},
					success: (res) => {
						//判断当前扫描的内容是否在该返回列表中
						let tmpDevice = null;
						for (var i = 0; i < res.length; i++) {
							if(res[i].deviceNo == e){
								tmpDevice = res[i];
								break;
							}
						}
						if (tmpDevice == null){
							uni.showToast({
								title: '工装扫描错误！',
								icon: 'none'
							});
							util.showAudio(); 
							that.$refs.input_mould.setFocus();
							that.$refs.input_mould.clear();
							return;
						}
						
						let tmpItem = null;
						for (var i = 0; i < that.order.moulds.length; i++) { 
							if(that.order.moulds[i].proItemNo == that.order.itemNo){
								tmpItem = that.order.moulds[i];
								break;
							}
						}
						
						
						let newDevice = {};
						newDevice.mouldType = 1;//标识为上线工序工装
						newDevice.moLot = that.order.moLot;
						newDevice.proNo = tmpItem.proNo;
						newDevice.proItemNo = tmpItem.proItemNo;
						newDevice.proName = tmpItem.proName;
						newDevice.deviceNo = that.order.deviceNo;//上线设备
						newDevice.deviceName = that.order.deviceName;//上线设备
						newDevice.mouldVer = tmpDevice.mouldVer;
						newDevice.mouldNo = tmpDevice.deviceNo;
						newDevice.mouldUnitRate = tmpItem.mouldUnitRate;
						newDevice.entityState = consts.entityState.added;					
						
						that.details.push(newDevice);
						if (that.calcProMouldQty == 0){
							uni.showToast({
								title: '该上线工序工装数量已扫描完！',
								icon: 'none'
							});
							that.$refs.input_pro1.setFocus();
						}
						util.showScanedAudio();
					},
					failure: (message) => {
						this.$refs.input_mould.setFocus();
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
			 * @description 工步工序扫描
			 */
			onProScaned1(e){
				let that = this;
				if (that.allowScanMould){
					//判断上表工装是否已扫描完成 
					if (that.calcProMouldQty > 0){
						uni.showToast({
							title: '必须扫描'+ that.order.mouldQty +'个工装！',
							icon: 'none'
						});
						util.showAudio(); 
						this.$refs.input_mould.setFocus();
						return;
					}
				}				
				let tmpItem = null;
				for (var i = 0; i < that.order.moulds.length; i++) { 
					if(that.order.moulds[i].proItemNo == e){
						tmpItem = that.order.moulds[i];	
					}
				}
				if (tmpItem == null){
					uni.showToast({
						title: '工步工序扫描错误！',
						icon: 'none'
					});
					util.showAudio(); 
					this.$refs.input_pro1.setFocus();
					this.$refs.input_pro1.clear();
				}
				else{
					uni.showLoading({
						mask: true
					});
					apis.shopWB_GetMould({
						data: {
							mouldVer: tmpItem.mouldVer
						},
						success: (res) => {
							that.gbMouldItemsSource = res;
							that.gbCurPro = tmpItem;
							this.$refs.input_mould1.setFocus();
							util.showScanedAudio();
						},
						failure: (message) => {
							this.$refs.input_pro1.setFocus();
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
				}
			},
			/**
			 * @description 工步工装扫描
			 */
			onMouldScaned1(e){
				let that = this;
				
				for (var i = 0; i < that.details.length; i++) {
					if(that.details[i].deviceNo == e){
						this.onScrollTop(i);
						uni.showModal({
							title: '提示',
							content: '当前工装已扫描,是否要删除？',
							success: function(res_mod) {
								if (res_mod.confirm) {
									that.details.splice(i, 1);
									that.updateScanList();
								} else if (res_mod.cancel) {}
								that.$refs.input_mould1.setFocus();
							}
						});
						util.showAudio();
						return;
					}
				}
				
				//不能超过工装数量
				//判断上表工装是否已扫描完成
				if (that.calcProMouldQty1 == 0){
					uni.showToast({
						title: '只能扫描'+ that.gbCurPro.mouldQty +'个工装！',
						icon: 'none'
					});
					util.showAudio(); 
					this.$refs.input_mould1.setFocus();
					return;
				}
				
				
				let tmpDevice = null;
				for (var i = 0; i < that.gbMouldItemsSource.length; i++) {
					if(that.gbMouldItemsSource[i].deviceNo == e){
						tmpDevice = that.gbMouldItemsSource[i];
						break;
					}
				}
				if (tmpDevice == null){
					uni.showToast({
						title: '工装扫描错误！',
						icon: 'none'
					});
					util.showAudio(); 
					that.$refs.input_mould1.setFocus();
					that.$refs.input_mould1.clear();
					return;
				}				
				
				let newDevice = {};
				newDevice.mouldType = 2;//标识为工步工序工装
				newDevice.moLot = that.order.moLot;
				newDevice.proNo = that.gbCurPro.proNo;
				newDevice.proItemNo = that.gbCurPro.proItemNo;
				newDevice.proName = that.gbCurPro.proName;
				newDevice.mouldUnitRate = that.gbCurPro.mouldUnitRate;
				newDevice.deviceNo = that.order.deviceNo;//上线设备
				newDevice.deviceName = that.order.deviceName;//上线设备
				newDevice.mouldVer = tmpDevice.mouldVer;
				newDevice.mouldNo = tmpDevice.deviceNo;
				newDevice.entityState = consts.entityState.added;					
				
				that.details.push(newDevice);  
				if (that.validMouldIsFinish(false)){
					that.gbMouldItemsSource = [];
					that.gbCurPro = null;
					
					that.$refs.input_pro1.setFocus();
					that.$refs.input_pro1.clear();
					that.$refs.input_mould1.clear();
					util.showScanedAudio();
					uni.showModal({
						title: '提示',
						content: '所有工装都已扫描完成，是否上线？',
						success: function(res) {
							if (res.confirm) { 
								that.onSave();
							} else if (res.cancel) {}
						}
					});
				}else{
					if (that.calcProMouldQty1== 0){
						uni.showToast({
							title: '该工装工序工装数量已扫描完！',
							icon: 'none'
						});
						that.gbMouldItemsSource = [];
						that.gbCurPro = null;
						
						that.$refs.input_pro1.setFocus();
						that.$refs.input_pro1.clear();
						that.$refs.input_mould1.clear();
					}else{
						that.$refs.input_mould1.setFocus();
					}
					util.showScanedAudio();
				}
			},
			onSave() {
				let that = this;
				
				if (!that.$refs.input_order.validInputFinish()){
					return;
				}
				if (that.calcProMouldQty > 0){
					//判断扫描工装的个数
					uni.showToast({
						title: '该上线工序必须扫描'+ that.order.mouldQty +'个工装！',
						icon: 'none'
					});
					util.showAudio(); 
					this.$refs.input_mould.setFocus();
					return;
				} 
				
				if (!that.validMouldIsFinish(true)){
					return;
				}
				
				let data = {};
				data.moLot = that.order.moLot;
				data.proNo = that.order.custNo;
				data.proItemNo = that.order.itemNo;
				data.deviceNo = that.order.deviceNo;
				data.partNo = that.order.partNo;
				data.partItemNo = that.order.partItemNo;
				data.mouldVer = that.order.mouldVer;
				let mouldNo = '';
				for (var i = 0; i < that.details.length; i++) {
					if(that.details[i].mouldType == 1){
						mouldNo += that.details[i].mouldNo + ',';
					}
				}
				if (mouldNo.length > 0){
					mouldNo = mouldNo.substring(0, mouldNo.length - 1);
				}
				data.mouldNo = mouldNo;
				data.workSta = 1;//生产状态 1：开工 2：暂停 3:下线 4：完工
				
				data.proMouldDetails  = that.details;				
				data.entityState = consts.entityState.added;
				//调用保存的接口
				uni.showLoading({
					mask: true
				});
				apis.shopWB_post({
					data: data,
					success: (res) => {
						uni.showToast({
							title: '保存成功！' 
						});
						util.dataInit(this);
						that.scrollHeight = oriScrollHeight;
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
			 * @description 判断所有工装是否已扫描完成
			 */
			validMouldIsFinish(showTips){
				showTips = showTips == undefined ? true : showTips;
				let that = this;
				let isFinish = true;
				for (var i = 0; i < that.order.moulds.length; i++) {
					let count = 0;
					for (var j = 0; j < that.details.length; j++) {
						if(that.order.moulds[i].mouldVer == that.details[j].mouldVer){
							count++;
						}
					}
					if(count != Number(that.order.moulds[i].mouldQty)){
						isFinish = false;
						if (showTips){
							uni.showToast({
								title: '该工步工序 '+that.order.moulds[i].proName+' ,应扫:'+ that.order.moulds[i].mouldQty +', 已扫:' + count + ', 待扫:' + (Number(that.order.moulds[i].mouldQty) - count),
								icon: 'none',
								duration: 5000
							});
							util.showAudio(); 
							this.$refs.input_pro1.setFocus();
						}						
						break;
					}
				}
				return isFinish;
			}, 
			/* 选中的方法 */
			onSelectedItem(e) {
				let items = util.clone(this.details);
				for (var i = 0; i < items.length; i++) {
					var item = items[i];
					if (i == e) {
						item.selectItemClass = 'uni-list-cell-selected';
					} else {
						item.selectItemClass = '';
					}
				}
				this.details = items;
			},
			scroll(e) { //滚动
				this.old.scrollTop = e.detail.scrollTop;
			},
			onScrollTop(index) {
				//滚动定位
				this.onSelectedItem(index);
				let view = uni.createSelectorQuery().in(this).select(".scroll-view-item");
				view.boundingClientRect(data => {
					this.scrollTop = this.old.scrollTop
					this.$nextTick(function() {
						if (data == null) return;
						this.scrollTop = data.height * index;
					});
				}).exec();
			}
		}
	}
</script>

<style>
	.mouldTips{
		color: #2C405A;
		padding-left: 10px;
		border-bottom: 1upx dashed #ccc; 
	}
</style>
