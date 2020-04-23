<!-- 仓内序列号拆箱合并 -->
<template>
	<view>
		<view id="viewHeader">
			<barcode-input ref="input_part" :focus="true" @onScaned="onPartScaned" placeholder="请扫描序列号"></barcode-input>
			<view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						料号:
					</view>
					<view class="uni-list-cell-db">
						{{orderHeader.partItemNo}}
					</view> 
				</view>
				<view class="uni-list-cell input-row"> 
					<view class="uni-list-cell-left">
						预装数量:
					</view>
					<view class="uni-list-cell-db">
						{{orderHeader.boxPackingQty}}
					</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						箱内标签总个数:
					</view>
					<view class="uni-list-cell-db">
						{{orderHeader.boxTotalTag}}
					</view>
					<view class="uni-list-cell-left">
						新增标签(个):
					</view>
					<view class="uni-list-cell-db">
						{{otherProDetails.length}}
					</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						已处理(个):
					</view>
					<view class="uni-list-cell-db">
						{{orderHeader.scanTag}}
					</view>
					<view class="uni-list-cell-left">
						待处理(个):
					</view>
					<view class="uni-list-cell-db">
						{{lastTag}}
					</view> 
				</view> 
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						已封箱(箱):
					</view>
					<view class="uni-list-cell-db">
						{{boxUpDetails.length}}
					</view>
					<view class="uni-list-cell-left">
						标签总个数:
					</view>
					<view class="uni-list-cell-db">
						{{orderHeader.boxTotalTag + otherProDetails.length}}
					</view>
				</view>
				
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						当前扫描(个):
					</view>
					<view class="uni-list-cell-db">
						{{details.length}}
					</view> 
					<view class="uni-list-cell-left">
						已扫描数量:
					</view>
					<view class="uni-list-cell-db">
						{{curScanQty}}
					</view> 
				</view>  
			</view>
		</view>
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">标签ID:{{item.tagId}}</text> 
							</view> 
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm"> 
			<print-button ref='printBtn' buttonText="封箱" :reportModel="reportModel" style="width: 49%; margin-right: 10px; float: left; " @click="onPrintBox" @tagValid="onBoxScanSave"></print-button>
			<button type="primary" style="display: block; float: none;" @click="onSave">保存</button>
		</page-foot>
	</view>
</template>

<script>
	import barcodeInput from '../../components/barcode-input/barcode-input.vue'; //扫码组件
	import printButton from "../../components/label-print/print-button.vue"

	import apis from '../../common/apiService.js'; //系统api
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js'; //常用功能

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
				boxDetails:[],//所有扫描的箱
				otherProDetails:[],//箱外的标签,新增标签
				details: [],
				boxUpDetails:[],//封箱的数据
				reportModel: {
					progNo: '', //页面ID
					showReport: false,
					isMultiPrint: true,
					dataSource: [],
					isNeedValidTag: true //是否需要校验标签
				},
				orderHeader:{
					boxTotalTag:0,//箱内标签总个数
					scanTag:0,//已处理标签个数 
					partItemNo: '',
					partName: '',
					boxPackingQty: 0,//装箱数量
					poMoSoLot:''
				}
			}
		},
		computed:{
			curScanQty: function(){
				let tmpQty = 0;
				for (var i = 0; i < this.details.length; i++) {
					tmpQty = util.floatObj.add(tmpQty, this.details[i].sheetQty);
				}
				return tmpQty;
			},
			lastTag: function(){
				return this.orderHeader.boxTotalTag + this.otherProDetails.length - this.orderHeader.scanTag ;
			}
		},
		onLoad(option) {
			this.reportModel.progNo = option.progNo || 'OPDA00046';  
			this.boxDetails = JSON.parse(option.data);
			
			let tmpTotal = 0;
			for (var i = 0; i < this.boxDetails.length; i++) {
				tmpTotal = util.floatObj.add(tmpTotal, this.boxDetails[i].tagDetails.length);
			}
			this.orderHeader.boxTotalTag = tmpTotal;
			this.orderHeader.boxPackingQty = this.boxDetails[0].tagDetails[0].boxPackingQty;
			this.orderHeader.partItemNo = this.boxDetails[0].tagDetails[0].partItemNo;
			this.orderHeader.partName = this.boxDetails[0].tagDetails[0].partName;
			// console.log(util.outputLog(this.boxDetails));
		},
		onReady() {
			util.getListHeight(this);
		},
		onBackPress(options) {
			return util.backPress(options, this.details.length > 0);
		},
		methods: {
			onPartScaned(e) {
				//料品信息标签扫描完成
				var that = this;
				uni.showLoading({
					mask: true
				});
				apis.Pda_pdaserialinboxvaild({
					data: {
						qrCode: e
					},
					success: (res) => {
						//判断是否在当前集合中，不是则提示 是否添加到当前集合中
						//如果在，判断是否已处理过
						//判断是否在同一个仓库
						//判断是否超出默认
						//避免重复对一个标签多次处理
						//要判断 是否重复扫描箱外标签  
						let findTagItem = that.getInBoxTagItem(res);
						if(findTagItem == null){
							//外来标签
							if (that.boxDetails[0].binWhNo == undefined){
								uni.showToast({
									title: '改标签还未入库',
									icon: "none"
								});
								util.showAudio();
								return;
							}
							if(that.boxDetails[0].binWhNo != res.binWhNo){
								uni.showToast({
									title: '所在仓库不一致',
									icon: "none"
								});
								util.showAudio();
								return;
							}else if(that.boxDetails[0].partItemNo != res.partItemNo){
								uni.showToast({
									title: '料号不一致',
									icon: "none"
								});
								util.showAudio(); 
								return;
							}else if(that.boxDetails[0].inLot != res.inLot){
								uni.showToast({
									title: '批次号不一致',
									icon: "none"
								});
								util.showAudio(); 
								return;
							}
						}
						res.sheetQty = Number(res.sheetQty);
						res.qrCode = e;
						for (var i = 0; i < that.details.length; i++) {
							let item = that.details[i];
							if (item.tagId == res.tagId) {
								that.onScrollTop(i);
								uni.showModal({
									title: '提示',
									content: '该标签已扫描,是否要删除',
									success: function(res_mod) {
										if (res_mod.confirm) {
											if(item.myFlag == 1){
												//表示来自箱外的数据
												that.otherProDetails.remove(item);
											}else{
												//还原是否已封箱状态 
												if (findTagItem != null){
													findTagItem.isFX = undefined;
												}
											}
											that.details.splice(i, 1);
											that.orderHeader.scanTag -= 1;
										} else if (res_mod.cancel) {}
									}
								});
								util.showAudio();
								return;
							}
						}
						if (that.details.length > 0 && that.orderHeader.boxPackingQty > 0 && that.orderHeader.boxPackingQty < util.floatObj.add(that.curScanQty, res.sheetQty)) {
							uni.showToast({
								title: '超出装箱数量',
								icon: "none"
							});
							util.showAudio();
							return;
						}
						if (that.details.length == 0){
							that.orderHeader.poMoSoLot = res.poMoSoLot;
						}else if(that.orderHeader.poMoSoLot != res.poMoSoLot){
							//如果当前不是同一个制单的
							that.orderHeader.poMoSoLot = '';
						}
						if (findTagItem == null){
							//判断 是否已经扫描过
							for (var i = 0; i < that.otherProDetails.length; i++) {
								if(that.otherProDetails[i].tagId == res.tagId){
									uni.showToast({
										title: '该标签已扫描过，且已封箱！',
										icon: "none"
									});
									util.showAudio();
									return;
								}
							}
							
							uni.showModal({
								title: '提示',
								content: '当前标签不在箱子内，是否要添加到当前箱中？',
								success: function(res_mod) {
									if (res_mod.confirm) {
										res.myFlag = 1;//表示来自箱外的数据
										that.addScanItem(res);
										that.otherProDetails.push(res); 
									} else if (res_mod.cancel) {}
								}
							});
							util.showAudio();
							return;
						}else if(findTagItem.isFX == undefined){
							//找到内标签,判断是否已封箱 
							findTagItem.isFX = true;
						}else{
							uni.showToast({
								title: '该标签已扫描过，且已封箱！',
								icon: "none"
							});
							util.showAudio();
							return;
						}
						that.addScanItem(res);
						
						if(that.lastTag == 0){
							that.onPrintBox();
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
			/**
			 * @description 添加扫描的结果
			 * @param {Object} res 扫描的结果
			 */
			addScanItem(res){
				var that = this;
				that.details.push(res);
				that.onScrollTop(that.details.length - 1);
				util.showScanedAudio();
				that.orderHeader.scanTag += 1;
			},
			/**
			 * @description 打印标签
			 */
			onPrintBox(){
				let that = this;
				uni.showModal({
					title: '提示',
					content: '是否要封箱？',
					success: function(res_mod) {
						if (res_mod.confirm) {
							var dataSource = [];
							var prefix = new Date().format("yyMMddHHmmssfff");
							var model = {};
							model.partNo = that.details[0].partNo;
							model.partItemNo = that.details[0].partItemNo;
							model.partName = that.details[0].partName;
							model.partSpec = that.details[0].partSpec;
							model.inLot = that.details[0].inLot;
							model.serialNo = '';
							model.TagFlag = '';
							model.poMoSoLot = that.orderHeader.poMoSoLot;
				
							model.sheetQty = that.curScanQty;
							model.tagId = `${prefix}-${util.getSuffix(3, 1)}`;
							model.boxTagId = model.tagId;
				
							model.linkBoardQty = '';
							model.proLot = that.details[0].proLot;
							model.proDate = new Date(that.details[0].proDate).format("yyyy/MM/dd") || new Date().format("yyyy/MM/dd");
							model.citemNo = that.details[0].citemNo;
							model.custNo = that.details[0].custNo;
							model.custName = that.details[0].custName;
							model.custTagId = '';
							model.reservelocus = that.details[0].reservelocus;
				
							model.ordLot = that.details[0].ordLot; //订单
							model.custNo = that.details[0].custNo; //客户
							model.purLot = that.orderHeader.poMoSoLot;
				
							model.proItemNo = '';
							model.proName = '';
							model.toProItemNo = '';
							model.toProName = '';
							model.dayId = '';
							model.spcSta = '';
							model.printType = '';
							model.deviceNo = '';
							model.deviceName = '';
							console.log(util.outputLog(model));
				
							dataSource.push(model);
							that.reportModel.dataSource = dataSource; //这个方法的作用根据取内箱信息字段，生成外箱数据
							that.$refs.printBtn.execPrint(); //调起打印的显示方法
						} else if (res_mod.cancel) {}
					}
				});
			},
			/**
			 * @description 校验标签
			 */
			onBoxScanSave(scanBoxTagModelList){
				let that = this;
				//扫描箱号保存
				//console.log(util.outputLog(model));
				let scanBoxTagModel = scanBoxTagModelList[0]
				scanBoxTagModel.binWhNo = that.boxDetails[0].binWhNo;
				scanBoxTagModel.binNo = that.boxDetails[0].binWhNo;
				scanBoxTagModel.bzType = 1 //包装类别 0、内箱( 默认) 1、外箱 2、卡板
				scanBoxTagModel.purLot = this.orderHeader.poMoSoLot;
				scanBoxTagModel.ordLot = this.details[0].ordLot; //订单号
				scanBoxTagModel.custNo = this.details[0].custNo; //客户
				scanBoxTagModel.entityState = consts.entityState.added;
				for (let i = 0; i < this.details.length; i++) {
					let item = this.details[i];
					item.boxTagId = scanBoxTagModel.tagId;
					item.sheetLot = scanBoxTagModel.tagId;
					item.entityState = consts.entityState.added;
					scanBoxTagModel.tagDetails.push(item);
				}
				this.boxUpDetails.push(scanBoxTagModel);
				this.details = [];
				uni.showToast({
					title: '校验成功!'
				});
				this.$refs.input_part.setFocus();
				if(that.lastTag == 0){ 
					uni.showModal({
						title: '提示',
						content: '完成是否保存?',
						success: function(res_mod) {
							if (res_mod.confirm) {
								that.onSave();
							} else if (res_mod.cancel) {
							}
						}
					});
				}
			},
			onSave() {
				var that = this;
				if(that.lastTag > 0){
					uni.showToast({
						title: '还有'+that.lastTag+'待处理的序列号，请处理完后再保存',
						icon: "none"
					});
					util.showAudio();
					this.$refs.input_part.setFocus();
					return;
				}
				else if(that.lastTag == 0 && that.details.length > 0){
					that.onPrintBox();
					return;
				}
				//上个页面的箱数据 + 箱外的数据 + 新封箱的数据
				let datas = [];
				datas = datas.concat(that.boxDetails);
				datas.forEach(function(item){
					item.entityState = consts.entityState.deleted;
				})
				datas = datas.concat(that.otherProDetails);
				datas = datas.concat(that.boxUpDetails); 
				uni.showLoading({
					mask: true
				});
				apis.boxMerge_Save({
					data: datas,
					success: (res) => {
						uni.showToast({
							title: '保存成功', 
						});
						uni.navigateBack();
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
			
			
			/**
			 * @description 判断标签是否在箱子内，返回箱内记录
			 * @param {Object} res 扫描的结果
			 */
			getInBoxTagItem(res){
				var that = this;
				let findTagItem = null;
				for (var i = 0; i < that.boxDetails.length; i++) {
					let item = that.boxDetails[i];
					for (var j = 0; j < item.tagDetails.length; j++) {
						if(item.tagDetails[j].tagId == res.tagId){
							findTagItem = item.tagDetails[j];
							break;
						}
					}
				}
				return findTagItem;
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
</style>
