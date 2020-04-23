<!--序列号打印-->
<template>
	<view>
		<view id="viewHeader">
			<barcode-input ref="input_order" @onScaned="onScaned" :focus="true" placeholder="工单号"></barcode-input>
			<!-- <view class="uni-list-cell input-row" >
				<view class="uni-list-cell-left">
					生产批号:
				</view>
				<view class="uni-list-cell-db">
					<input type="text" v-model="order.inLot" placeholder="输入批号" />
				</view>
			</view> -->
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">
					生产日期:
				</view>
				<view class="uni-list-cell-db">
					<view @click="showDatePicker">{{order.proDate}}</view>
				</view>
			</view>
			<view class="uni-list-cell input-row" v-if="showProLot">
				<view class="uni-list-cell-left">
					年周:
				</view>
				<view class="uni-list-cell-db">
					<input type="text" v-model="order.proLot" placeholder="年周" />
				</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">
					来源批号:
				</view>
				<view class="uni-list-cell-db">
					{{order.poMoSoLot}}
				</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">
					客户编码:
				</view>
				<view class="uni-list-cell-db">
					{{order.citemNo}}
				</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">
					客户料号:
				</view>
				<view class="uni-list-cell-db">
					{{order.suPartNo}}
				</view>
			</view>

			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">
					物料编码:
				</view>
				<view class="uni-list-cell-db">
					{{order.partItemNo}}
				</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">
					工单数量:
				</view>
				<view class="uni-list-cell-db">
					{{order.sheetQty}}
				</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">
					已产生数量:
				</view>
				<view class="uni-list-cell-db">
					{{order.createTagQty}}
				</view>
				<view class="uni-list-cell-left">
					未产生数量:
				</view>
				<view class="uni-list-cell-db">
					{{order.lastTagQty}}
				</view>
			</view>
			<view class="uni-list-cell input-row">
				<!--个数  -->
				<view class="uni-list-cell-left">
					个数:
				</view>
				<view class="uni-list-cell-db">
					<input ref="input_num" :focus="num_focus" type="number" v-model="num" />
				</view>
				<view class="uni-list-cell-left">
					<button type="default" style="padding: 0; height: 25px; width: 25px; line-height: 1.3;" @click="onNumAdd">
						<span style="text-align: center;">+</span></button>
				</view>
			</view>
			<view class="uni-list-cell" style="height: 30px;">
				<view class="flex-item">
					<strong>数量</strong>
				</view>
				<view class="flex-item">
					<strong>个数</strong>
				</view>
			</view>
		</view>

		<!-- 显示入库单明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in details" :key="index">
					<uni-swipe-action :options="options_delet" :key="index" :det_id="item.det_id" @click="bindClick">
						<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover">

							<view class="uni-triplex-row">
								<view class="uni-triplex-left">
									<view class="uni-list-cell">
										<view class="flex-item">{{item.numQty}}</view>
										<view class="flex-item" style="margin-left: 20upx;">{{item.num}}</view>
									</view>
								</view>
							</view>

						</view>
					</uni-swipe-action>
				</block>
			</view>
		</scroll-view>

		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<print-button ref='printBtn' :reportModel="reportModel" @click="onSave" @printComplete="printComplete" @tagValid="tagValid"></print-button>
		</page-foot>
		<mpvue-picker ref="mpvuePicker" mode="dateSelector" :pickerValueDefault="order.proDate" @onConfirm="onPickerConfirm"></mpvue-picker>
	</view>

</template>

<script>
	import barcodeInput from '../../components/barcode-input/barcode-input.vue'; //扫码组件
	import mpvuePicker from '../../components/mpvue-picker/mpvuePicker.vue'
	import uniSwipeAction from '../../components/uni-swipe-action/uni-swipe-action.vue'
	import printButton from "../../components/label-print/print-button.vue"

	import apis from '../../common/apiService.js'; //系统api
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js'; //常用功能

	let erpInterfaceType = null;
	export default {
		components: {
			barcodeInput,
			mpvuePicker,
			uniSwipeAction,
			printButton
		},
		data() {
			return {
				reportModel: {
					progNo: '', //页面ID
					showReport: false,
					isMultiPrint: false,
					dataSource: [],
					isNeedValidTag: false //是否需要校验标签
				},
				//个数
				num: 0,
				//包装数量
				numQty: 1,
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				order: {
					inLot: '', //批次号
					poMoSoLot: '',
					proDate: ' ',
					citemNo: '',
					suPartNo: '',
					sheetQty: 0,
					createTagQty: 0,
					lastTagQty: 0,
					partItemNo: ''
				},
				details: [],
				det_id: 0,
				showProLot: false,
				options_delet: [{
					text: '删除',
					style: {
						backgroundColor: 'rgb(255,58,49)'
					}
				}],
				mesInLotType:null
			}
		},
		onLoad(option) {
			this.reportModel.progNo = option.progNo;
			this.erpInterfaceType = storage.get(consts.storageKeys.erpInterfaceType);
			this.mesInLotType = storage.get(consts.storageKeys.mesInLotType);
			this.showProLot = this.erpInterfaceType == consts.erpInterfaceType.anfeinuo;
		},
		onReady() {
			util.getListHeight(this);
			var _self = this;
			setTimeout(function() {
				var val = _self.scrollHeight;
				if (val != 0) val = _self.scrollHeight.replace('px', '')
				console.log(val);
				if (eval(200 - val) > 0) {
					_self.scrollHeight = '200px';
					console.log(_self.scrollHeight);
				}
			}, 1500);
		},
		onBackPress(options) {
			return util.backPress(options, this.details.length > 0);
		},
		methods: {
			onScaned(e) {
				uni.showLoading({
					mask: true
				})
				apis.acceptLotPur_MK_GetModel({
					data: {
						moLot: e,
						type: 2 //0 所有 1 批次 2序列号
					},
					success: res => {
						console.log(JSON.stringify(res))
						res.poMoSoLot = res.purLot;
						if (this.erpInterfaceType == consts.erpInterfaceType.anfeinuo) {
							res.inLot = res.purLot;
							res.proLot = this.getYearWeek();
						} else if (this.mesInLotType == consts.mesInLotType.MoLotYMD) {
							//索源 内包装打印  批次号 默认 为 制单+年月日（6位)
							res.inLot = res.purLot + new Date(res.proDate).format('yyMMdd');
						}
						res.proDate = new Date(res.proDate).format('yyyy/MM/dd') || new Date().format('yyyy/MM/dd');
						res.citemNo = res.citemNo || '';
						res.lastTagQty = util.floatObj.subtract(res.sheetQty, res.createTagQty);
						if (res.lastTagQty > res.minPackingQty) {
							this.num = res.minPackingQty;
						} else {
							this.num = res.lastTagQty;
						}
						this.order = res;
						util.showScanedAudio();
					},
					failure: message => {
						this.$refs.input_order.setFocus();
						util.showAudio();
					},
					complete: (status, message, content) => {
						util.tryCatchApi({
							status: status,
							message: message
						})
						uni.hideLoading();
					}
				})
			},
			onNumAdd(e) {
				var _sefl = this;
				//拆包
				if (this.numQty <= 0) {
					//数量必须大于0
					uni.showToast({
						title: "数量必须要大于0",
						icon: 'none'
					});
					return;
				}
				if (this.num <= 0) {
					//包数必须大于0
					uni.showToast({
						title: "包数必须要大于0",
						icon: 'none'
					});
					return;
				}
				/* 总数量 */
				var totalQty = 0;
				for (var i = 0; i < this.details.length; i++) {
					totalQty = util.floatObj.add(totalQty, util.floatObj.multiply(this.details[i].num, this.details[i].numQty));
				}
				if (totalQty > this.order.lastTagQty) {
					uni.showToast({
						title: "生产数量 不可超过 未生产数量！！！！",
						icon: 'none'
					});
					return;
				}
				/* 剩余数量=单据剩余数量-上次录入的数量+录入包数*录入数量 */
				var lastQty = this.order.lastTagQty - (totalQty + this.numQty * this.num);

				if (lastQty < 0) {
					//数量录入错误
					uni.showToast({
						title: "数量录入有误",
						icon: 'none'
					});
					return;
				}

				/* 将包数和数量添加到集合中 */
				this.details.push({
					det_id: this.det_id,
					num: this.num,
					numQty: this.numQty
				});
				this.det_id = this.det_id + 1;


				//判断剩余数量是否为零	
				console.log("剩余数量---" + lastQty);
				if (lastQty > this.order.minPackingQty) {
					this.num = this.order.minPackingQty;
				} else {
					this.num = lastQty;
					if (this.num <= 0) {
						this.num = 0;
						this.numQty = 0;
					}
				}

			},
			onSave() {
				if (this.details.length == 0) {
					uni.showToast({
						title: '请输入要打印的数据',
						icon: "none"
					});
					return;
				}
				if (this.order.lastTagQty == 0) {
					uni.showToast({
						title: '标签产生完成，不需要再次打印',
						icon: "none"
					});
					return;
				}
				//产生标签，并打印
				let list = [];
				var prefix = new Date().format("yyMMddHHmmssfff");
				var index = 0;
				let totalQty = 0;
				for (var i = 0; i < this.details.length; i++) {
					var item = this.details[i];
					totalQty = util.floatObj.add(totalQty, util.floatObj.multiply(item.num, item.numQty));
					for (var j = 0; j < item.num; j++) {
						index++;
						var data = util.clone(this.order);
						data.sheetQty = item.numQty;
						// 服务器生成
						// data.tagId = `${prefix}-${util.getSuffix(3, index)}`;
						data.entityState = consts.entityState.added;
						list.push(data);
					}
				}
				/* 保存 */
				uni.showLoading({
					mask: true
				});
				apis.OpenMes_scmreqbarcodeserial({
					data: list,
					success: (res) => {
						this.order.createTagQty += totalQty;
						this.order.lastTagQty = util.floatObj.subtract(this.order.sheetQty, this.order.createTagQty);
						this.details = [];
						for (var i = 0; i < res.length; i++) {
							var item = res[i];
							item.proDate = new Date(item.proDate).format("yyyy/MM/dd") || new Date().format("yyyy/MM/dd");
							item.createDate = new Date(item.createDate).format("yyyy/MM/dd hh:mm:ss") || new Date().format(
								"yyyy/MM/dd hh:mm:ss");
						}
						this.reportModel.dataSource = res;
						this.$refs.printBtn.execPrint();
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
			printComplete() {
				util.dataInit(this);
				this.$refs.input_order.setFocus();
			},
			/**
			 * @param {Object} scanTagModelList 扫描的标签结果集
			 */
			tagValid(scanTagModelList) {
				util.dataInit(this);
				this.$refs.input_order.setFocus();
			},
			scroll(e) { //滚动
				this.old.scrollTop = e.detail.scrollTop
			},
			/**
			 * @description  gun dong ding wei 
			 */
			onScrollTop(index) {
				//滚动定位
				this.onSelectedItem(index);
				let view = uni.createSelectorQuery().in(this).select(".scroll-view-item");
				view.boundingClientRect(data => {
					this.scrollTop = this.old.scrollTop;
					if (data == null) return;
					this.$nextTick(function() {
						this.scrollTop = data.height * index;
					})
				}).exec();

			},
			/* 选中的方法 参数e是第几项 selectItemClass更改样式uni-list-cell-selected*/
			onSelectedItem(e) {
				for (var i = 0; i < this.details.length; i++) {
					var item = this.details[i];
					if (i == e) {
						item.selectItemClass = "uni-list-cell-selected";
					} else {
						item.selectItemClass = '';
					}
				}
			},
			/**
			 * @description 获取年周
			 */
			getYearWeek() {
				var today = new Date();
				var firstDay = new Date(today.getFullYear(), 0, 1);
				var dayOfWeek = firstDay.getDay();
				var spendDay = 1;
				if (dayOfWeek != 0) {
					spendDay = 7 - dayOfWeek + 1;
				}
				firstDay = new Date(today.getFullYear(), 0, 1 + spendDay);
				var d = Math.ceil((today.valueOf() - firstDay.valueOf()) / 86400000);
				var result = Math.ceil(d / 7) + 1;
				var year = today.getFullYear() + '';
				return year.substr(2, 2) + util.getSuffix(2, result);
			},
			showDatePicker() {
				this.$refs.mpvuePicker.show();
			},
			onPickerConfirm(e) {
				this.order.proDate = new Date(e.label).format('yyyy/MM/dd') || new Date().format('yyyy/MM/dd');
			},
			bindClick(value) {
				//删除当前行 更新numQty的数量
				var totalQty = 0;
				var _sefl = this;
				for (var i = 0; i < this.details.length; i++) {
					var item = this.details[i];
					if (item.det_id == value.det_id) {
						_sefl.details.splice(i, 1);
						break;
					}
				}
				//删除了现在总数
				for (var i = 0; i < this.details.length; i++) {
					totalQty += this.details[i].num * this.details[i].numQty;
				}

				/* 删除后剩余数量是可以按最小包装继续包？ */
				if ((this.order.lastTagQty - totalQty) > this.order.minPackingQty) {
					this.num = this.order.minPackingQty;
				} else {
					/* 显示尾数 */
					this.num = this.order.lastTagQty - totalQty;
					this.numQty = 1;
				}
			}
		}
	}
</script>

<style>
	.flex-item {
		width: 35%;
		float: left;
		text-align: center;
	}

	.center-box {
		max-height: 800upx;
	}
</style>
