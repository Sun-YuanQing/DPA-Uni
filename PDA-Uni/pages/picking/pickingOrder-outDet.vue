<!-- 按物控领料出库明细 -->
<!-- 
1.根据仓库+工单号集合 Pda/scmcontroldetaildto 按领料仓、制造批号(多笔以，分隔）获取物控应发物料及其存货列表
  返回 ID、多发料仓库、原材料仓库、主料料号、工单号、料号、主/替 欠料数量、多发料仓数量  多发料领用量、替代料领用量、应发数量、扫描数量、多发料仓剩余可用量、是否领完

2.扫描物料后
  1.查找并提示是否为替料，按替料发货
  2.选中并计算
	1.如果是替料：计算欠料数量 = 计算主料应发 * 转换率
	2.更新当前记录实时多发料仓数量，从多发料仓实时库存表中读取 按 仓库 + 物料
	3.计算多发料领用量 = 用欠料数量 > 多发料仓数量 ? 多发料仓数量 : 用欠料数量 （如果是替代料，则更新主料的替代料领用量字段&应发数量）
	4.计算出 应发数量 = 主料欠料数量 - 多发仓领用量 - 替代料领用量 - 主料扫描数量
  3.标签与应发数量比对
	判断标签是否重扫，只提示，不删除
	一个标签只能用在一个工序上
	应 ≥ 扫 => 应 = 原应 - 扫  => 1.应 = 0 标识已领完 2.如果是替代料: 更新主料上的 替代料领用量 扫 / 转换率
	应 < 扫 => 
	  1.扫 = 应；
	  2.应 = 0；标识已领完
	  3.如果是替代料: 更新主料上的替代料领用量 应 / 转换率
	  4.继续往下查找是否有符合的物料，按工序 + 物料查找，找到，重复第一步
	  5.如果没有找到，有剩余，则在最后一笔匹配的信息上记录（多发料仓剩余可用量）
	  6.更新多发料
		1.多发料仓本身有剩余，实时更新列表的多发料仓数量 字段
		2.剩余扫描数量
	  
 3.数据如何提交
	1.一条物料会对应多个标签信息 
	2.一个标签会对应多个物料信息
	  将当前标签复制一份，数量=应发数量
	 
  提交接口：addcontroltoproout  按物料档转领料单
  
  操作要求：
  1.可自动分配多发料仓数据
  2.可多次提交，标签不允许重复扫描，扫描后不允许删除
  3.保存后，清空数据，按 仓库+工单号集合 重新请求数据
  4.如果多发料仓足够所有料使用，则提示该标签不需要领料
  
  发料，发了一半，保存，获取的数据该如何处理
 -->
<template>
	<view>
		<view id="viewHeader">
			<barcode-input ref="input_part" :focus="true" @onScaned="onPartScaned" placeholder="请扫描内包装"></barcode-input>
		</view>
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in details" :key="index">
					<uni-card :title="item.partItemNo | partName" is-shadow="true" note="true" :extra="getCardTitle(item)" class="scroll-view-item"
					 @click="onSelectedItem(index)" v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">制造批号:{{item.sheetNo}}</text>
								<block v-if="item.bomType != 0">
									<text class="uni-title">主料料号:{{item.mitemNo}}</text>
									<text class="uni-title">主料欠料:{{item.zlQLQty}}</text>
									<text class="uni-title">主料应发:{{item.zlLastScanQty}}</text>
								</block>
								<text class="uni-title" v-else>欠料数量:{{item.qlQty}}</text>
								<block v-if="item.whNo5.length > 0">
									<text class="uni-title">多发仓可用数量:{{item.totalFactQty5}}</text>
									<text class="uni-title" style="border-top: 1px solid #CCCCCC;">多发料领用量:{{item.outPreQty5}}</text>
								</block>
								<text class="uni-title" v-if="item.bomType == 0">替代料领用量:{{item.childScanQty}}</text>
								<text class="uni-title">扫描数量:{{item.scanQty}}</text>
								<text class="uni-title">应发数量:{{item.lastScanQty}}</text>
							</view>

							<view class="uni-triplex-right" style="min-width: 220upx;">
								<text class="uni-h5">仓库:{{item.whName}}</text>
								<text class="uni-h5">单位用量:{{item.unitQty}}</text>
							</view>
						</view>

						<view class="uni-triplex-row" v-if="item.binLots.length > 0 && item.showLotStor">
							<view class="div-table fixed-thead">
								<view class="thead">
									<view class="th">
										<view class="td" style="width:20%">库位</view>
										<view class="td" style="width:60%">批次</view>
										<view class="td" style="width:20%">数量</view>
									</view>
								</view>
								<view class="tbody">
									<block v-for="(lotItem,lotIndex) in item.binLots" :key="lotIndex">
										<view class="tr" v-if="lotIndex == 0">
											<view class="td" style="width:20%;font-weight: bold; font-size: 14px;">{{isStorageBin?lotItem.binNo:lotItem.whNo}}</view>
											<view class="td" style="width:60%;font-weight: bold; font-size: 14px; word-break: break-all;">{{lotItem.inLot}}</view>
											<view class="td" style="width:20%;font-weight: bold; font-size: 14px;">{{lotItem.sheetQty}}</view>
										</view>
										<view class="tr" v-else>
											<view class="td" style="width:20%">{{isStorageBin?lotItem.binNo:lotItem.whNo}}</view>
											<view class="td" style="width:60%">{{lotItem.inLot}}</view>
											<view class="td" style="width:20%">{{lotItem.sheetQty}}</view>
										</view>
									</block>
								</view>
							</view>
						</view> 
						<template v-slot:footer>
							<view class="footer-box">
								<!-- <view class="footer-box__item" @click.stop="footerClick(item)" v-if="item.bomType != 0"><text> 查看主料信息</text></view> -->
								<view class="footer-box__item" @click.stop="showHideStor(item)"><text> {{item.binLots.length > 0 && item.showLotStor ? '隐藏' : '显示'}}库存</text></view>
								<view class="footer-box__item" @click.stop="footerClick(item)"><text> 按多发料仓发料</text></view>
							</view>
						</template>
					</uni-card>
				</block>
			</view>
		</scroll-view>
		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<button type="primary" @click="onSave">保存</button>
		</page-foot>
		
		<lotunpack :show="showLotUnpack" :model="printMode" :printDetail="printDetail" :progNo="progNo" @cancel="lotupackCancel"></lotunpack>
	</view>
</template>

<script>
	import barcodeInput from '../../components/barcode-input/barcode-input.vue'; //扫码组件
	import uniCard from '@/components/uni-card/uni-card.vue'
	import lotunpack from '../../components/lotunpack/lotunpack.vue';


	import apis from '../../common/apiService.js'; //系统api
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js'; //常用功能

	let whNo = '', orders = ''
	export default {
		components: {
			barcodeInput,
			uniCard,
			lotunpack
		},
		data() {
			return {
				progNo: '',
				showLotUnpack: false, //是否显示拆分打印
				printMode: {}, //需拆分的标签对象
				printDetail: [], //拆分结果 
				
				isChanged : false,//是否修改
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				details: [],
				isStorageBin: null, //是否启用储位，否改储位
			}
		},
		filters: {
			partName: function(value) {
				return '料号:' + value;
			}
		},
		onLoad(option) {
			this.isStorageBin = storage.get(consts.storageKeys.IsStorageBin); 
			// console.log("option: " + JSON.stringify(option));
			this.progNo = option.progNo || 'OPDA00045'; 
			this.whNo = option.whNo || '';
			this.orders = option.orders || '';
			
			// this.whNo = "WH03" //option.whNo || '';
			// this.orders = "PA2019082801_001" //option.orders || '';

			this.onInit(this.whNo, this.orders);
		},
		onReady() {
			util.getListHeight(this);
		},
		onBackPress(options) {
			return util.backPress(options, this.details.length > 0);
		},
		methods: {
			onInit(whNo, orders) {
				let that = this;
				uni.showLoading({
					mask: true
				});
				apis.pickingOrder_out_GetDetail({
					data: {
						whNo: whNo,
						moLots: orders
					},
					success: (res) => {  
						that.dataInit(res);
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
			 * @description 数据初始化
			 * @param {Object} res
			 */
			dataInit(res){
				let that = this;
				for (var i = 0; i < res.length; i++) {
					let item = res[i];
					//默认不显示批次库存
					item.showLotStor = false;
					//替代料领用量
					item.childScanQty = 0;
					//应发数量 
					item.lastScanQty = item.qlQty;
					// 是否完成
					item.isFinish = false;
					//增加主料欠料数量、主料应发字段 这2个字段给替代料使用的
					item.zlQLQty = item.qlQty;
					//主料应发字段 
					item.zlLastScanQty = item.lastScanQty;
					if (item.bomType != 0){//替代料
						//找到主料						
						let parentItem = null; 
						for (var j = i - 1; j >=0; j--) { 
							if (res[j].partItemNo == item.mitemNo && res[j].sheetNo == item.sheetNo && res[j].bomType == 0) {
								parentItem = res[j];
								break;
							}
						} 
						item.zlQLQty = parentItem.qlQty;
						item.zlLastScanQty = parentItem.lastScanQty;
						//主料应发 转 替代料的应发数量
						//得到产品数量
						let a = util.floatObj.divide(item.zlLastScanQty, parentItem.unitQty);
						//计算BOM用量
						item.lastScanQty = util.floatObj.multiply(a, item.unitQty);
					}
					that.details.push(item)
				}
			},
			onPartScaned(e) {
				var that = this;
				that.isChanged = true;
				//料品信息标签扫描完成
				uni.showLoading({
					mask: true
				});
				apis.basic_QRCodeAnalysis({
					data: {
						qrCode: e
					},
					success: (res) => {
						res.qrCode = e;
						// console.log(util.outputLog(res));						
						//判断标签是否重扫，只提示，不删除		
						let index = -1;
						for (var i = 0; i < that.details.length; i++) {
							var item = that.details[i];
							item.tagDetails = item.tagDetails || [];
							for (var j = 0; j < item.tagDetails.length; j++) {
								let tag = item.tagDetails[j];
								if (tag.tagId == res.tagId){
									uni.showToast({
										title: '改标签已扫描！',
										icon: 'none'
									})
									that.onScrollTop(i);
									util.showAudio(); 
									return;
								}
							}
							//物料相同，且未领完料
							if (index == -1 && item.partItemNo == res.partItemNo && !item.isFinish){
								index = i;
								//选中
								that.onScrollTop(i);
							}
						}
						if (index == -1){
							uni.showToast({
								title: '找不到该物料或该物料已完成领料！',
								icon: 'none'
							})
							util.showAudio(); 
							return;
						}
						//标签剩余数量
						let tmpLastQty = that.isItemUnPack(res);
						if(tmpLastQty > 0){
							let unpackArr = [];
							unpackArr.push({
								num: 1,
								numQty: tmpLastQty
							});
							//拆分
							unpackArr.push({
								num: 1,
								numQty: util.floatObj.subtract(res.sheetQty, tmpLastQty)
							}); 
							that.printDetail = unpackArr;
							that.printMode = res;
							that.showLotUnpack = true;
							//需要拆包
							return;
						}
						
						res.sheetQty = Number(res.sheetQty);
						res.inoutFlag = 2;//下架
						let selectedItem = that.details[index];
						if (selectedItem.bomType != 0){//
							uni.showModal({
								title: '提示',
								content: '当前物料为替代料，是否领料？',
								success: function(res_mod) {
									if (res_mod.confirm) { 
										that.calcScaned(res, selectedItem);
										util.showScanedAudio();
									} else if (res_mod.cancel) {
										return;
									} 
								}
							});
							util.showAudio(); 
						}else{
							that.calcScaned(res, selectedItem);
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
			showHideStor(item){
				//显示隐藏库存
				item.showLotStor = !item.showLotStor;
			},
			/**
			 * @description 按多发料仓发料
			 */
			footerClick(item) {
				let that = this;
				if (item.totalFactQty5 == 0) {
					uni.showToast({
						title: '多发料仓无该物料！',
						icon: 'none'
					})
					return;
				}
				uni.showModal({
					title: '提示',
					content: '确定按多发料仓发料？',
					success: function(res) {
						if (res.confirm) {
							that.isChanged = true;
							item.scanSw = true;
							that.calcDF(item);
						} else if (res.cancel) {}
					}
				});
			},
			onSave() {
				let that = this;
				console.log(util.outputLog(that.details)); 
				if (that.details.length == 0){
					uni.showModal({
						title: '提示',
						content: '领料完成，返回上一级页面',
						showCancel: false,
						success: function(res) {
							if (res.confirm) { 
								uni.navigateBack();
							} else if (res.cancel) {}
						}
					}); 
					return;
				}
				if (!that.isChanged){
					uni.showToast({ 
						title: '数据没有改动，无需保存！',
						icon: 'none'
					})
					return;
				}
				
				
				var data = that.details;
				uni.showLoading({
					mask: true
				});
				apis.pickingOrder_out_save({
					data: data,
					success: (res) => { 
						//刷新页面
						util.dataInit(this); 
						that.onInit(that.whNo, that.orders);
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
			lotupackCancel() {
				//隐藏拆分
				this.printDetail = [];
				this.showLotUnpack = false;
				this.$refs.input_part.setFocus();
			},
			/**
			 * @description 获取卡片的标题
			 */
			getCardTitle(item) {
				let title = item.bomType == 0 ? '主' : '替';
				title = title + " | " + (item.isFinish ? '完成' : '未完成');
				return title
			},
			/**
			 * @description 计算替代料的欠料数量
			 * @param {Object} item 替代料
			 */
			calcChildQLQty(item) {
				//1.通过主料料号，在detiail中查找
				//2.替料：计算欠料数量 = 计算主料应发 * 转换率 
				let parentItem = this.getParentItem(item)
				
				//得到产品数量
				let a = util.floatObj.divide(parentItem.lastScanQty, parentItem.unitQty);
				//计算BOM用量
				item.qlQty = util.floatObj.multiply(a, item.unitQty); 
			},
			/**
			 * @description 获取主料，从下往上找
			 * @param {Object} item 替代料
			 */
			getParentItem(item) { 
				let parentItem = null;
				let childIndex = this.details.indexOf(item) - 1;
				for (var i = childIndex; i >=0; i--) { 
					if (this.details[i].partItemNo == item.mitemNo && this.details[i].sheetNo == item.sheetNo && this.details[i].bomType == 0) {
						parentItem = this.details[i];
						break;
					}
				} 
				return parentItem;
			}, 
			/**
			 * @description 计算主料上的替代料领用量字段 & 主料应发
			 * @param {Object} item 替代料
			 * @param {Boolen} isCalcDF 是否在计算多发
			 */
			calcParentChildScanQtyAndLastScanQty(item, isCalcDF){
				let parentItem = this.getParentItem(item);
				// 替代料 转 主料：（（多发料仓领用数量 + 扫描数量） / 转换率 ） * 主料转换率
				//因在多发的时候已算过，这里只计算扫描数量
				let a1 = item.scanQty;
				if (isCalcDF){
					// 多料仓数量 + 扫描数量
					a1 = util.floatObj.add(item.outPreQty5, item.scanQty);
				}
				 
				//得到BOM用量
				let rateQty = util.floatObj.divide(a1, item.unitQty);				
				//得到产品数量
				let a = util.floatObj.multiply(rateQty, parentItem.unitQty); 
				
				parentItem.childScanQty = util.floatObj.add(parentItem.childScanQty, a);
				
				//主料应发
				this.calcParentLastScanQty(parentItem)
			},
			/**
			 * @description 计算主料的 应发 & 替代料的 zlLastScanQty & 应发
			 * @param {Object} item 主料
			 */
			calcParentLastScanQty(item){
				//主料应发 = 主料欠料数量 - 多发仓领用量 - 替代料领用量 - 主料扫描数量
				let a = util.floatObj.subtract(item.qlQty, item.outPreQty5);
				let b = util.floatObj.subtract(a, item.childScanQty);
				let c = util.floatObj.subtract(b, item.scanQty);
				item.lastScanQty = c;
				item.zlLastScanQty = c; 				
				
				//主料应发 转 替代料的应发数量
				//得到产品数量
				let tmpProQty = util.floatObj.divide(item.zlLastScanQty, item.unitQty);
				 
				let index = this.details.indexOf(item) + 1; 
				//从上往下找 包含index
				for (var i = index; i < this.details.length; i++) {
					if(this.details[i].mitemNo == item.mitemNo && this.details[i].sheetNo == item.sheetNo){
						this.details[i].zlLastScanQty = item.zlLastScanQty;
						//计算BOM用量
						this.details[i].lastScanQty = util.floatObj.multiply(tmpProQty, this.details[i].unitQty); 
					}else{
						break;
					}
				}
			},
			/**
			 * @description 根据主料料号，更新物料已领完
			 * @param {Object} item 主料或替代料
			 */
			setPartItemFinish(item){
				//该组物料已领完
				if (item.lastScanQty > 0){
					return;
				}
				let index = this.details.indexOf(item);
				//从上往下找 包含index
				for (var i = index; i < this.details.length; i++) {
					if(this.details[i].mitemNo == item.mitemNo && this.details[i].sheetNo == item.sheetNo){
						this.details[i].isFinish = true;
					}else{
						break;
					}
				}
				//从下往上找
				for (var i = index - 1; i >= 0; i++) {
					if(this.details[i].mitemNo == item.mitemNo && this.details[i].sheetNo == item.sheetNo){
						this.details[i].isFinish = true;
					}else{
						break;
					}
				}				
			},
			/**
			 * @description 计算扫描结果
			 * @param {Object} tagItem 扫描的标签
			 * @param {Object} item 当前选中项
			 */
			calcScaned(tagItem, item){ 
				/* 
				3.标签与应发数量比对
				应 ≥ 扫 => 应 = 原应 - 扫  => 1.应 = 0 标识已领完 2.如果是替代料: 更新主料上的 替代料领用量 扫 / 转换率
				应 < 扫 => 
				  1.扫 = 应；
				  2.应 = 0；标识已领完
				  3.如果是替代料: 更新主料上的替代料领用量 应 / 转换率
				  4.继续往下查找是否有符合的物料，按工序 + 物料查找，找到，重复第一步
				  5.如果没有找到，有剩余，则在最后一笔匹配的信息上记录（多发料仓剩余可用量）
				  6.更新多发料仓实时库存 按 仓库 + 物料 =
					1.多发料仓本身有剩余，实时更新列表的多发料仓数量 字段
					2.剩余扫描数量 */
				let that = this;
				item.scanSw = true;
				that.calcDF(item)
				if (item.isFinish){
					//继续往下查找是否有符合的物料，按工序 + 物料查找，找到，重复第一步
					//继续往下查找是否有符合的物料，按工序 + 物料查找，找到，重复第一步
					let itemIndex = that.details.indexOf(item); 
					let isFind = false;
					for (var i = itemIndex + 1; i < that.details.length; i++) {
						if(that.details[i].partItemNo == item.partItemNo && that.details[i].proItemNo == item.proItemNo && !that.details[i].isFinish){ 
							isFind = true;
							that.calcScaned(tagItem, that.details[i]); 
							break;
						}
					}
					// 全部用的多发料
					if (!isFind && that.details[itemIndex].totalFactQty5 > 0){
						//多发仓剩余数量
						that.details[itemIndex].surplusQty5 = that.details[itemIndex].totalFactQty5;
						uni.showToast({
							title: '该物料已全部用多发料仓领料，该标签无需扫描！',
							icon: 'none',
							duration: 5000
						})
						util.showAudio()
					}
				}else if(item.lastScanQty >= tagItem.sheetQty){ //应 ≥ 扫
					item.lastScanQty = util.floatObj.subtract(item.lastScanQty, tagItem.sheetQty);
					item.scanQty = util.floatObj.add(item.scanQty, tagItem.sheetQty);					
					
					if (item.bomType == 0){//主料
						//计算主料的 应发 & 替代料的 zlLastScanQty & 应发
						that.calcParentLastScanQty(item);					
					}else{//替代料
						//计算主料上的 替代料领用量字段 & 应发  & 替代料的 zlLastScanQty & 应发
						that.calcParentChildScanQtyAndLastScanQty(item, false);
					}
					//该组物料已领完
					that.setPartItemFinish(item);
					
					//插入标签表数据
					let cloneTag = util.clone(tagItem); 
					cloneTag.binNo = cloneTag.binNo.length > 0 ? cloneTag.binNo : item.whNo;
					cloneTag.binWhNo = cloneTag.binWhNo.length > 0 ? cloneTag.binWhNo : item.whNo;
					cloneTag.poMoSoLot = item.sheetNo;					
					cloneTag.entityState = consts.entityState.added;
					item.tagDetails.push(cloneTag);
					
				}else{//应 < 扫
					item.scanQty = util.floatObj.add(item.scanQty, item.lastScanQty);
					item.lastScanQty = 0;
					if (item.bomType == 0){//主料
						//计算主料的 应发 & 替代料的 zlLastScanQty & 应发
						that.calcParentLastScanQty(item);					
					}else{//替代料
						//计算主料上的 替代料领用量字段 & 应发  & 替代料的 zlLastScanQty & 应发
						that.calcParentChildScanQtyAndLastScanQty(item, false);
					}
					//该组物料已领完
					that.setPartItemFinish(item);
					
					//剩余标签数量
					tagItem.sheetQty = util.floatObj.subtract(tagItem.sheetQty, item.scanQty);
					//插入标签表数据
					let cloneTag = util.clone(tagItem);
					cloneTag.binNo = cloneTag.binNo.length > 0 ? cloneTag.binNo : item.whNo;
					cloneTag.binWhNo = cloneTag.binWhNo.length > 0 ? cloneTag.binWhNo : item.whNo;
					cloneTag.poMoSoLot = item.sheetNo;
					cloneTag.sheetQty = item.scanQty;
					cloneTag.entityState = consts.entityState.added;
					item.tagDetails.push(cloneTag);
					
					//继续往下查找是否有符合的物料，按工序 + 物料查找，找到，重复第一步
					let itemIndex = that.details.indexOf(item); 
					let isFind = false;
					for (var i = itemIndex + 1; i < that.details.length; i++) {
						if(that.details[i].partItemNo == item.partItemNo && that.details[i].proItemNo == item.proItemNo && !that.details[i].isFinish){ 
							isFind = true;
							that.calcScaned(tagItem, that.details[i]); 
							break;
						}
					}
					if (!isFind && tagItem.sheetQty > 0){
						//多发仓剩余数量
						that.details[itemIndex].tagDetails[that.details[itemIndex].tagDetails.length - 1].surplusQty5 = tagItem.sheetQty;
						that.details[itemIndex].surplusQty5 = tagItem.sheetQty;
					}
				}
				
				let autoSubmit = true;
				for (var i = 0; i < that.details.length; i++) {
					if(!that.details[i].isFinish){
						autoSubmit = false;
						break;
					}
				}
				if (autoSubmit){
					uni.showModal({
						title: '提示',
						content: '领料完成是否保存？',
						success: function(res) {
							if (res.confirm) { 
								that.onSave();
							} else if (res.cancel) {}
						}
					});
				}
			},
			/**
			 * @description 计算按多发料发货
			 * @param {Object} item 当前选中项
			 */
			calcDF(item){
				let that = this;
				//无多发料仓数量
				if (item.totalFactQty5 == 0) return;
				
				//TODO:判断 主料 & 替料的情况
				if (item.bomType == 0){//主料
				}else{//替代料
					//计算替代料的欠料数量
					that.calcChildQLQty(item); 
				}							
				
				//计算多发料领用量 = 用欠料数量 > 多发料仓数量 ? 多发料仓数量 : 用欠料数量 （如果是替代料，则更新主料的替代料领用量字段&应发数量）
				let tmpQty = util.floatObj.subtract(item.qlQty, item.totalFactQty5);
				//多发料领用量 
				item.outPreQty5 = tmpQty > 0 ? item.totalFactQty5 : item.qlQty;
				//多发料仓数量 
				item.totalFactQty5 = tmpQty > 0 ? 0 : Math.abs(tmpQty);
				
				//更新列表的 多发料仓数量 按仓库 + 物料
				that.details.forEach(function(v) {
					if (v.whNo5 == item.whNo5 && v.partItemNo == item.partItemNo) {
						v.totalFactQty5 = item.totalFactQty5;
					}
				})
				
				if (item.bomType == 0){//主料
					//计算主料的 应发
					that.calcParentLastScanQty(item);					
				}else{//替代料								
					//计算应发 = 欠料数量 - 多发仓领用量 - 主料扫描数量
					item.lastScanQty = item.qlQty - item.outPreQty5 - item.scanQty;
					//计算主料上的 替代料领用量字段 & 应发
					that.calcParentChildScanQtyAndLastScanQty(item, true);
				}							
				//该组物料已领完
				that.setPartItemFinish(item);
			},
			/**
			 * @description 判断物料是否需要拆包
			 * @param {Object} res 扫描的标签
			 */
			isItemUnPack(res){
				let that = this; 
				let proItemNo = '';
				let index = -1;
				for (var i = 0; i < that.details.length; i++) {
					if(that.details[i].partItemNo == res.partItemNo && !that.details[i].isFinish){ 
						proItemNo = that.details[i].proItemNo;
						index = i;
						break;
					}
				}
				// 测试用
				// that.details[index].isStkLimitSw = true;
				//限额发料（拆包)
				if (index == -1 || !that.details[index].isStkLimitSw)return 0;
				
				//应发总数量 = 应发总数量 - 多发料仓数量
				let qlQtyTotal = - that.details[index].totalFactQty5;
				for (var i = index; i < that.details.length; i++) {
					if(that.details[i].partItemNo == res.partItemNo && that.details[i].proItemNo == proItemNo && !that.details[i].isFinish){
						qlQtyTotal = util.floatObj.add(qlQtyTotal, that.details[i].lastScanQty)
					}
				}
				//拆分 true，否则 false
				return res.sheetQty - qlQtyTotal;
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
	
	.footer-box {
		display: flex;
		justify-content: space-between;
		width: 100%;
	}

	.footer-box__item {
		width: 100%;
		display: flex;
		align-items: center;
	}

	.footer-box__item:nth-child(2) {
		justify-content: center;
	}

	.footer-box__item:last-child {
		justify-content: flex-end;
	}
</style>
