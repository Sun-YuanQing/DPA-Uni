<!-- 采购暂收 -->
<template>
	<view>
		<view id="viewHeader">
			<!-- 输入入库单号 扫描 -->
			<barcode-input ref="input_order" @onScaned="onScaned" :focus="true" placeholder="请扫描单号"></barcode-input>
			<barcode-input ref="input_part" @onScaned="onPartScaned" placeholder="请扫描料号"></barcode-input>
			<view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						单号:
					</view>
					<view class="uni-list-cell-db">
						{{ order.sheetNo }}
					</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						单据日期:
					</view>
					<view class="uni-list-cell-db">
						{{ order.sheetDate }}
					</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						供应商:
					</view>
					<view class="uni-list-cell-db">
						{{ order.custName1 }}
					</view>
				</view>
			</view>
		</view>
		<!-- 显示入库单明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in order.details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">料号:{{item.partItemNo}}</text>
								<text class="uni-title">料品名称:{{item.partName}}</text>
								<text class="uni-title">仓库:{{item.whName}}</text>
								<text class="uni-title">数量: {{item.sheetQty}}</text>
								<!-- <text class="uni-title">采购批号: {{item.poMoSoLot}}</text> -->
								<text class="uni-title">采购批号: {{item.purLot}}</text>
							</view>
							<view class="uni-triplex-right" style="min-width: 220upx;">
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">单位:{{item.unitName}}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">已扫描数量:{{item.scanQty}}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">未扫描数量:{{item.lastScanQty}}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>

		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<print-button ref='printBtn' :reportModel="reportModel" style="width: 49%; margin-right: 10px; float: left; " @click="onShowPrint(true)"
			 @printComplete="printComplete"></print-button>
			<button type="primary" style="display: block; float: none;" @click="onSave">保存</button>
		</page-foot>
		<!-- 打印弹出框  录入打印信息-->
		<uni-popup-modal id="popup-modal" :show="showPrint" title="录入打印信息" @hidePopup="onShowPrint(false)" @save="onSubmitPrint">
			<!-- 料号 -->
			<view class="uni-list-cell">
				<view class="uni-list-cell-left">
					料号:
				</view>
				<view class="uni-list-cell-db">
					{{orderItemSelected.partItemNo}}
				</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">
					合格数量:
				</view>
				<view class="uni-list-cell-db">
					{{orderItemSelected.sheetQty}}
				</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">
					生产日期:
				</view>
				<view class="uni-list-cell-db">
					<view @click="showDatePicker">{{orderItemSelected_input.proDate}}</view>
				</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">
					批次号:
				</view>
				<view class="uni-list-cell-db">
					<input type="text" v-model="orderItemSelected_input.inLot" />
				</view>
			</view>
			<!-- 数量 -->
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">
					每包数量:
				</view>
				<view class="uni-list-cell-db">
					<input type="number" v-model="orderItemSelected_input.numQty" />
				</view>

				<view class="uni-list-cell-left">
					<button type="default" style="padding: 0; height: 25px; width: 25px; line-height: 1.3;" @click="onNumAdd">
						<span style="text-align: center;">+</span></button>
				</view>
			</view>
			<view class="uni-list-cell">
				<view class="flex-item">
					数量
				</view>
				<view class="flex-item">
					包数
				</view>
				<view class="flex-item">
					<!-- 占位 -->
				</view>
			</view>
			<scroll-view :scroll-top="scrollTop" scroll-y="true" @scroll="scroll">
				<view class="uni-list" style="height: 200upx;">
					<block v-for="(item,index) in orderItemSelected_input.details" :key="index">
						<!-- 给选择项添加样式 -->
						<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover">
							<view class="uni-triplex-row" style="height:115upx; ">
								<view class="flex-item">{{item.numQty}}</view>
								<view class="flex-item" style="">{{item.num}}</view>
								<uni-number-box :min="0" :max="item.change.max_num" :disabled_input="disabled_input" :value="item.change.num"
								 :det_id="item.det_id" @change="num_change" />
							</view>
						</view>
					</block>
				</view>
			</scroll-view>
		</uni-popup-modal>
		<mpvue-picker ref="mpvuePicker" mode="dateSelector" :pickerValueDefault="pickerValueDefault" @onConfirm="onPickerConfirm"></mpvue-picker>
	</view>
</template>

<script>
	import uniPopupModal from '../../components/uni-popup-modal/uni-popup-modal.vue'
	import uniPopup from '../../components/uni-popup/uni-popup.vue'
	import barcodeInput from '../../components/barcode-input/barcode-input.vue'
	import mpvuePicker from '../../components/mpvue-picker/mpvuePicker.vue'
	import printButton from "../../components/label-print/print-button.vue"
	import uniNumberBox from '@/components/uni-number-box/uni-number-box.vue'

	import apis from '../../common/apiService.js';
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js';
	export default {
		components: {
			barcodeInput,
			uniPopup,
			uniPopupModal,
			mpvuePicker,
			printButton,
			uniNumberBox
		},
		data() {
			var date = new Date();
			return {
				reportModel: {
					progNo: '', //页面ID
					showReport: false,
					isMultiPrint: false,
					dataSource: [],
					isNeedValidTag: false //是否需要校验标签
				},
				//显示隐藏扫描功能
				showPrint: false, //打印

				disabled_input: true,
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				order: {
					"sheetNo": "",
					"sheetDate": "",
					"custName1": ""
				},
				det_id: 0,
				orderItemSelected: {}, //当前选中项
				orderItemSelected_input: { //当前所有的输入项对象
					num: '', //包数
					numQty: '', //没包数量
					proDate: date, //生产日期
					inLot: '', //生产批次
					details: [{
							numQty: 45,
							num: 2
						},
						{
							numQty: 5,
							num: 1
						}
					] //录入的包数集合
				}, //弹出打印的对象
				pickerValueDefault: date,
				erpInterfaceType: null //一体个性化
			}
		},
		onLoad(option) {
			this.reportModel.progNo = option.progNo || 'OPDA00001';
			this.erpInterfaceType = storage.get(consts.storageKeys.erpInterfaceType);
		},
		onReady() {
			util.getListHeight(this);
		},
		onBackPress(options) {
			return util.backPress(options, this.order.details);
		},
		methods: {
			onScaned(e) {
				var that = this;
				uni.showLoading({
					mask: true
				});
				apis.accepttempin_getDetails({
					data: {
						sheetNo: e
					},
					success: (res) => {
						console.log(JSON.stringify(res.details[0]))
						for (let i = 0; i < res.details.length; i++) {
							let item = res.details[i];
							item.scanQty = 0;
							item.lastScanQty = item.sheetQty;
						}
						res.sheetDate = new Date(res.sheetDate).format('yyyy/MM/dd');
						if(!util.validOrderMonth(res)){
							this.$refs.input_order.setFocus();
							return;
						}
						that.order = res;
						that.onSelectedItem(0);
						util.showScanedAudio();
						that.$refs.input_part.setFocus();
					},
					failure: (message) => {
						that.$refs.input_order.setFocus();
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
			onShowPrint(e) {
				if (!this.order.details) {
					uni.showToast({
						title: '请先扫描单号',
						icon: 'none'
					});
					util.showAudio();
					this.$refs.input_order.setFocus();
					return;
				}
				//扫描客户标签显示打印
				this.showPrint = e;
				if (e) {
					this.orderItemSelected_input = this.orderItemSelected;
					this.orderItemSelected_input.details = [];
					this.orderItemSelected_input.num = 1;
					this.orderItemSelected_input.numQty = this.orderItemSelected.sheetQty;
					this.orderItemSelected_input.lastQty = this.orderItemSelected.sheetQty;
					this.orderItemSelected_input.proDate = new Date().format("yyyy/MM/dd");
					this.orderItemSelected_input.inLot =  this.orderItemSelected.inLot;
				}
				this.$refs.input_part.setFocus();
			},
			onPartScaned(e) {
				//console.log('e----------' + e);
				if (!this.order.details) {
					uni.showToast({
						title: '请先扫描单号',
						icon: 'none'
					});
					util.showAudio();
					this.$refs.input_order.setFocus();
					return;
				}
				var that = this;
				//扫描料号
				uni.showLoading({
					mask: true
				});
				apis.basic_QRCodeAnalysis({
					data: {
						qrCode: e
					},
					success: (res) => {
						/* 检验货架是否存在 */
						that.$refs.input_part.setFocus();
						apis.storage_RasCun({
							data: {
								tagId: res.tagId
							},
							success: (res1) => {},
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
						});
						console.log(JSON.stringify(res));
						//校验料号、采购单号、数量等信息是否一致
						//如果一致，1.定位当前行，2.更改行状态 
						let isexist = false;
						for (var i = 0; i < that.order.details.length; i++) {
							let item = that.order.details[i];
							item.tagDetails = item.tagDetails || [];
							for (var j = 0; j < item.tagDetails.length; j++) {
								let tag = item.tagDetails[j];
								if (tag.qrCode == e) {
									that.onScrollTop(i);
									uni.showModal({
										title: '提示',
										content: '该标签已扫描,是否要删除',
										success: function(res_mod) {
											if (res_mod.confirm) {
												item.tagDetails.splice(j, 1);
												that.updateScanList();
											} else if (res_mod.cancel) {}
											that.$refs.input_part.setFocus();
										}
									});
									util.showAudio();
									that.$refs.input_part.setFocus();
									return;
								}
							}

							if (item.partItemNo == res.partItemNo) {
								//console.log(item.purLot+'----PO不相同---采购批号---'+ res.poMoSoLot+'---'+res.purLot)
								if (item.purLot != res.poMoSoLot) {
									//判断po是否相等
									po=false;
									continue;
								}else{
									if (util.floatObj.subtract(item.sheetQty, item.scanQty) < res.sheetQty) {
										//判断是否超出应退数量
										uni.showToast({
											title: '超出应收数量',
											icon: 'none'
										});
										util.showAudio();
										that.onScrollTop(i);
										that.$refs.input_part.setFocus();
										return;
									}
									isexist = true;
									item.tagDetails.push({
										model: res,
										qrCode: e
									});
									that.onScrollTop(i);
									that.updateScanList();
									uni.showToast({
										title: '扫描成功'
									});
									break;
								}
								
							}
						}
						var po=true;
						if (!isexist) {
							uni.showToast({
								title: '扫描错误，当前标签不属于该单据',
								icon: 'none'
							});
							util.showAudio();
						} else {
							if(!po){
								uni.showToast({
									title: 'PO不相同',
									icon: 'none'
								});
								util.showAudio();
								that.onScrollTop(i);
								that.$refs.input_part.setFocus();
							}
							util.showScanedAudio();
							
						}
						util.automateSave(that.order.details, 'lastScanQty', 0, that.onSave);
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
				});
			},

			/* 保存的方法 */
			onSave() {
				var that = this;
				if (this.order.details == undefined || this.order.details.length == 0) {
					return;
				}
				for (var i = 0; i < this.order.details.length; i++) {
					var item = this.order.details[i];
					if (item.lastScanQty > 0) {
						uni.showToast({
							title: '该条信息未扫描'
						});
						this.onSelectedItem(i);
						util.showAudio();
						that.$refs.input_part.setFocus();
						return;
					}
				}
				if (this.erpInterfaceType != consts.erpInterfaceType.anfeinuo) {
					that.order.sheetSta = 1;//审核状态 0.未过帐 1 审核 2.已过帐
					that.order.entityState = consts.entityState.modified;
					that.order.details.forEach(function(item){
						item.sheetSta = that.order.sheetSta;
						item.entityState = that.order.entityState;
					})
					uni.showLoading({
						mask: true
					});
					apis.accepttempin_put_save({
						data: that.order,
						success: (res) => {
							util.dataInit(this);
							uni.showToast({
								title: '保存成功'
							});
							that.$refs.input_order.setFocus();
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
				}else{
					//没有请求
					util.dataInit(this);
					uni.showToast({
						title: '保存成功'
					});
					that.$refs.input_order.setFocus();
				}
			},
			onNumAdd(e) {
				var that = this;
				//拆包
				if (this.orderItemSelected_input.numQty <= 0) {
					//数量必须大于0
					uni.showToast({
						title: "数量必须要大于0",
						icon: 'none'
					});
					return;
				}
				var numder = util.floatObj.divide(this.orderItemSelected_input.lastQty, this.orderItemSelected_input.numQty);
				var int_num = Math.floor(numder); //商
				//var int_float = Math.ceil(numder); //余
				console.log(numder + "=" + this.orderItemSelected_input.lastQty + "/" + this.orderItemSelected_input.numQty);
				this.orderItemSelected_input.num = int_num;
				if (this.orderItemSelected_input.num <= 0) {
					//包数必须大于0
					uni.showToast({
						title: "包数必须要大于0",
						icon: 'none'
					});
					return;
				}
				/* 总数量 */
				var totalQty = 0;

				for (let i = 0; i < this.orderItemSelected_input.details.length; i++) {
					let item = this.orderItemSelected_input.details[i];
					totalQty = util.floatObj.add(totalQty, util.floatObj.multiply(item.num, item.numQty));
				}
				console.log(this.orderItemSelected_input.lastQty + "=(" + totalQty + "+" + this.orderItemSelected_input.numQty +
					"*" +
					this.orderItemSelected_input.num + ")");

				console.log(this.orderItemSelected_input.lastQty + "=(" + totalQty + "+" + this.orderItemSelected_input.numQty *
					this.orderItemSelected_input.num + ")");
				var lastQty = 0;
				console.log(this.orderItemSelected_input.lastQty + "==" + this.orderItemSelected.sheetQty);
				if (this.orderItemSelected_input.lastQty == this.orderItemSelected.sheetQty) {
					/* 剩余数量=总数量-上次录入的数量+录入包数*录入数量 */
					lastQty = util.floatObj.subtract(this.orderItemSelected_input.lastQty, (totalQty + (this.orderItemSelected_input.numQty *
						this.orderItemSelected_input.num)));

					if (lastQty < 0) {
						//数量录入错误
						uni.showToast({
							title: "数量录入有误",
							icon: 'none'
						});
						this.orderItemSelected_input.num = 1;
						return;
					} else if (lastQty > 0) {
						/* 将包数和数量添加到集合中 */
						this.orderItemSelected_input.details.push({
							det_id: that.det_id,
							num: that.orderItemSelected_input.num,
							numQty: that.orderItemSelected_input.numQty,
							change: {
								num: that.orderItemSelected_input.num,
								max_num: that.orderItemSelected_input.num
							}
						});
						that.det_id = that.det_id + 1;


						this.orderItemSelected_input.details.push({
							det_id: that.det_id,
							num: 1,
							numQty: lastQty,
							change: {
								num: 1,
								max_num: 1
							}
						});
						that.det_id = that.det_id + 1;
						lastQty = 0;

					} else {
						/* 将包数和数量添加到集合中 */
						this.orderItemSelected_input.details.push({
							det_id: that.det_id,
							num: that.orderItemSelected_input.num,
							numQty: that.orderItemSelected_input.numQty,
							change: {
								num: that.orderItemSelected_input.num,
								max_num: that.orderItemSelected_input.num
							}
						});
						that.det_id = that.det_id + 1;
					}
				} else {
					lastQty = util.floatObj.subtract(this.orderItemSelected_input.lastQty, (this.orderItemSelected_input.numQty *
						this.orderItemSelected_input.num));
					if (lastQty < 0) {
						//数量录入错误
						uni.showToast({
							title: "数量录入有误",
							icon: 'none'
						});
						this.orderItemSelected_input.num = 1;
						return;
					} else if (lastQty > 0) {

						this.orderItemSelected_input.details.push({
							det_id: that.det_id,
							num: 1,
							numQty: lastQty,
							change: {
								num: 1,
								max_num: 1
							}
						});
						that.det_id = that.det_id + 1;
						lastQty = 0;

					}
					/* 将包数和数量添加到集合中 */
					this.orderItemSelected_input.details.push({
						det_id: that.det_id,
						num: that.orderItemSelected_input.num,
						numQty: that.orderItemSelected_input.numQty,
						change: {
							num: that.orderItemSelected_input.num,
							max_num: that.orderItemSelected_input.num
						}
					});
					that.det_id = that.det_id + 1;

				}


				/* 剩余数量 */
				this.orderItemSelected_input.numQty = lastQty;
				this.orderItemSelected_input.lastQty = Number(lastQty);
				//判断剩余数量是否为零
				if (lastQty == 0) {
					this.orderItemSelected_input.num = 0;
				} else {
					this.orderItemSelected_input.num = 1;
				}
			},
			onSubmitPrint(e) {
				if (!this.orderItemSelected_input.proDate) {
					uni.showToast({
						title: '请输入生产日期',
						icon: 'none'
					});
					return;
				}
				if (!this.orderItemSelected_input.inLot || this.orderItemSelected_input.inLot == '') {
					uni.showToast({
						title: '请输入生产批次',
						icon: 'none'
					});
					return;
				}
				if (this.orderItemSelected_input.details.length == 0) {
					uni.showToast({
						title: '请录入包装信息',
						icon: 'none'
					});
					return;
				}
				var that=this;
				var totalQty = 0;
				for (let i = 0; i < this.orderItemSelected_input.details.length; i++) {
					let item = this.orderItemSelected_input.details[i];
					totalQty = util.floatObj.add(totalQty, util.floatObj.multiply(item.num, item.numQty));
				}
				if (totalQty != this.orderItemSelected.sheetQty) {
					uni.showToast({
						title: '请录入剩余包装数量',
						icon: 'none'
					});
					return;
				}
				this.orderItemSelected.inLot = this.orderItemSelected_input.inLot;
				this.orderItemSelected.proDate = this.orderItemSelected_input.proDate;
				this.reportDataSource = [];

				var index = 0;
				var prefix = new Date().format("yyMMddHHmmssfff"); //123
				for (let i = 0; i < this.orderItemSelected_input.details.length; i++) {
					let item = this.orderItemSelected_input.details[i];
					for (var j = 0; j < item.num; j++) {
						index++;
						var model = {};
						model.partNo = this.orderItemSelected.partNo;
						model.partItemNo = this.orderItemSelected.partItemNo;
						model.partName = this.orderItemSelected.partName;
						model.partSpec = this.orderItemSelected.partSpec;
						model.serialNo = '';
						model.tagFlag = '';
						model.boxTagId = '';
						model.purLot = this.orderItemSelected.purLot;
						model.poMoSoLot = this.orderItemSelected.purLot;

						model.sheetQty = item.numQty;
						model.tagId = `${prefix}-${util.getSuffix(3, index)}`;

						model.linkBoardQty = '';
						model.inLot = this.orderItemSelected.inLot;
						model.proDate =new Date(that.orderItemSelected.proDate).format('yyyy/MM/dd') || new Date().format('yyyy/MM/dd');
						model.citemNo = this.order.citemNo;
						model.custNo = this.order.custNo;
						model.custName = this.order.custName;
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
						model.partDefine1 = item.partDefine1;
						model.partDefine2 = item.partDefine2;
						model.partDefine3 = item.partDefine3;
						model.partDefine4 = item.partDefine4;
						model.partDefine5 = item.partDefine5;
						model.partDefine6 = item.partDefine3;
						model.partDefine7 = item.partDefine7;
						model.partDefine8 = item.partDefine8;
						model.partDefine9 = item.partDefine9;
						model.partDefine10 = item.partDefine10;
						console.log(model);
						this.reportDataSource.push(model);
					}
				}
				this.reportModel.dataSource = this.reportDataSource;
				this.$refs.printBtn.execPrint();
			},
			printComplete() {
				//打印成功
				this.showPrint = false;
			},
			scroll(e) { //滚动
				this.old.scrollTop = e.detail.scrollTop
			},
			onScrollTop(index) {
				//滚动定位
				this.onSelectedItem(index);
				let view = uni.createSelectorQuery().in(this).select(".scroll-view-item");
				view.boundingClientRect(data => {
					this.scrollTop = this.old.scrollTop
					this.$nextTick(function() {
						this.scrollTop = data.height * index;
					});
				}).exec();
			},
			updateScanList() {
				//更新列表结果
				var scanQty = 0;
				for (var i = 0; i < this.orderItemSelected.tagDetails.length; i++) {
					scanQty = util.floatObj.add(scanQty, this.orderItemSelected.tagDetails[i].model.sheetQty);
				}
				this.orderItemSelected.scanQty = scanQty;
				this.orderItemSelected.lastScanQty = util.floatObj.subtract(this.orderItemSelected.sheetQty, scanQty);
			},
			/* 选中的方法 */
			onSelectedItem(e) {
				for (var i = 0; i < this.order.details.length; i++) {
					var item = this.order.details[i];
					if (i == e) {
						item.selectItemClass = 'uni-list-cell-selected';
						this.orderItemSelected = item;
					} else {
						item.selectItemClass = '';
					}
				}
			},
			showDatePicker() {
				this.$refs.mpvuePicker.show();
			},
			onPickerConfirm(e) {
				this.orderItemSelected_input.proDate = new Date(e.label).format('yyyy/MM/dd') || new Date().format('yyyy/MM/dd');
			},
			num_change(value) { /* 数字输入框值改变时 */


				if (value.newVal > 0) {
					var len = this.orderItemSelected_input.details.length;
					for (var i = 0; i < len; i++) {
						var item = this.orderItemSelected_input.details[i];
						if (item.det_id == value.det_id) {
							item.num = value.newVal;
							break;
						}
					}
					/* 总数量 */
					var totalQty = 0;
					for (let i = 0; i < this.orderItemSelected_input.details.length; i++) {
						let item = this.orderItemSelected_input.details[i];
						totalQty = util.floatObj.add(totalQty, util.floatObj.multiply(item.num, item.numQty));
					}
					/* 剩余数量=总数量-上次录入的数量+录入包数*录入数量 */
					var lastQty = util.floatObj.subtract(this.orderItemSelected.sheetQty, totalQty);

					console.log(lastQty)
					if (lastQty >= 0) {
						this.orderItemSelected_input.numQty = lastQty;
						this.orderItemSelected_input.lastQty = Number(lastQty);
						this.orderItemSelected_input.num = 1
					} else {

						uni.showToast({
							title: '不允许超出总数！！',
							icon: 'none'
						});
						var len = this.orderItemSelected_input.details.length;
						for (var i = 0; i < len; i++) {
							var item = this.orderItemSelected_input.details[i];
							if (item.det_id == value.det_id) {
								// 								if (item.num) {
								// 
								// 								}
								item.num -= 1;
								item.change.num = item.num;
								item.change.max_num = item.num;
								break;
							}
						}

						this.orderItemSelected_input.numQty = 0;
						this.orderItemSelected_input.lastQty = 0;
						this.orderItemSelected_input.num = 0;
						return;
					}

					var dd = util.clone(this.orderItemSelected_input);
					this.orderItemSelected_input = dd;
				} else {
					var len = this.orderItemSelected_input.details.length;
					for (var i = 0; i < len; i++) {
						var item = this.orderItemSelected_input.details[i];
						console.log(item.det_id + "--" + value.det_id);
						if (item.det_id == value.det_id) {
							if (len == 2) {
								if (i == 0 && item.num <= 0) {
									this.orderItemSelected_input.details = [];
									break;
								} else {
									this.orderItemSelected_input.details.splice(i, 1);
								}
							} else {
								this.orderItemSelected_input.details.splice(i, 1);
							}
							break;
						}
					}

					/* 总数量 */
					var totalQty = 0;
					for (let i = 0; i < this.orderItemSelected_input.details.length; i++) {
						let item = this.orderItemSelected_input.details[i];
						totalQty = util.floatObj.add(totalQty, util.floatObj.multiply(item.num, item.numQty));
					}
					/* 剩余数量=总数量-上次录入的数量+录入包数*录入数量 */
					var lastQty = this.orderItemSelected.sheetQty - totalQty;
					console.log(lastQty)
					if (lastQty >= 0) {
						this.orderItemSelected_input.numQty = lastQty;
						this.orderItemSelected_input.lastQty = Number(lastQty);
						this.orderItemSelected_input.num = 1
					} else {
						this.orderItemSelected_input.numQty = 0;
						this.orderItemSelected_input.lastQty = 0;
						this.orderItemSelected_input.num = 0
					}
					var dd = util.clone(this.orderItemSelected_input);
					this.orderItemSelected_input = dd;
				}
			}
		}
	}
</script>

<style>
	.flex-item {
		width: 33.3%;

		text-align: center;
		margin: auto;
	}

	.center-box {
		max-height: 800upx;
	}
</style>
