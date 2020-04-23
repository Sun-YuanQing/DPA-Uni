<!--内包装打印 生成标签基本信息给后端，返回标签打印-->
<template>
	<view>
		<view id="viewHeader">
			<barcode-input ref="input_order" @onScaned="onScaned" :focus="true" placeholder="工单号"></barcode-input>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">
					<span style="color: red;">*</span>
					批次号:
				</view>
				<view class="uni-list-cell-db"><input type="text" v-model="order.inLot" placeholder="批次号" /></view>
			</view>
			<view v-show="m_defineShow">
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						LotNo批次:
					</view>
					<view class="uni-list-cell-db"><input type="text" v-model="part.define1" placeholder="批次" /></view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						platingNo电镀编号:
					</view>
					<view class="uni-list-cell-db"><input type="text" v-model="part.define2" placeholder="电镀编号" /></view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						Joint接头:
					</view>
					<view class="uni-list-cell-db"><input type="text" v-model="part.define3" placeholder="接头" /></view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						NG Q'ty不合格数:
					</view>
					<view class="uni-list-cell-db"><input type="text" v-model="part.define4" placeholder="不合格数" /></view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						woc线别:
					</view>
					<view class="uni-list-cell-db"><input type="text" v-model="part.define5" placeholder="线别" /></view>
				</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">生产日期:</view>
				<view class="uni-list-cell-db">
					<view @click="showDatePicker">{{ order.proDate }}</view>
				</view>
			</view>
			<view class="uni-list-cell input-row" v-if="showProLot">
				<view class="uni-list-cell-left">年周:</view>
				<view class="uni-list-cell-db"><input type="text" v-model="order.proLot" placeholder="年周" /></view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">来源批号:</view>
				<view class="uni-list-cell-db">{{ order.poMoSoLot }}</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">物料编码:</view>
				<view class="uni-list-cell-db">{{ order.partItemNo }}</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">客户编码:</view>
				<view class="uni-list-cell-db">{{ order.citemNo }}</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">客户料号:</view>
				<view class="uni-list-cell-db">{{ order.suPartNo }}</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">工单数量:</view>
				<view class="uni-list-cell-db">{{ order.sheetQty }}</view>
			</view>

			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">已产生数量:</view>
				<view class="uni-list-cell-db">{{ order.createTagQty }}</view>
				<view class="uni-list-cell-left">未产生数量:</view>
				<view class="uni-list-cell-db">{{ order.lastTagQty }}</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">数量:</view>
				<view class="uni-list-cell-db"><input ref="input_numQty" :focus="numQty_focus" type="number" v-model="numQty" /></view>
				<!--包数  -->
				<view class="uni-list-cell-left">包数:</view>
				<view class="uni-list-cell-db"><input ref="input_num" :focus="num_focus" type="number" v-model="num" /></view>
				<view class="uni-list-cell-left">
					<button type="default" style="padding: 0; height: 25px; width: 25px; line-height: 1.3;" @click="onNumAdd"><span
						 style="text-align: center;">+</span></button>
				</view>
			</view>
			<view class="uni-list-cell" style="height: 30px;">
				<view class="flex-item"><strong>数量</strong></view>
				<view class="flex-item"><strong>包数</strong></view>
			</view>
		</view>

		<!-- 显示明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item, index) in details" :key="index">
					<uni-swipe-action :options="options_delet" :key="index" :det_id="item.det_id" @click="bindClick">
						<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover">
							<view class="uni-triplex-row">
								<view class="uni-triplex-left">
									<view class="uni-list-cell">
										<view class="flex-item">{{ item.numQty }}</view>
										<view class="flex-item" style="margin-left: 20upx;">{{ item.num }}</view>
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
			<print-button ref="printBtn" style="padding: 0upx; width: 48%; margin-right: 10px; float: left;" :reportModel="reportModel"
			 @click="onSave" @printComplete="printComplete" @tagValid="tagValid"></print-button>
			<button type="primary" style="padding: 0upx; float: none;" @click="onnavigateTo">标签列表</button>
		</page-foot>
		<mpvue-picker ref="mpvuePicker" mode="dateSelector" :pickerValueDefault="order.proDate" @onConfirm="onPickerConfirm"></mpvue-picker>
	</view>
</template>

<script>
	import barcodeInput from '../../components/barcode-input/barcode-input.vue'; //扫码组件
	import mpvuePicker from '../../components/mpvue-picker/mpvuePicker.vue';
	import uniSwipeAction from '../../components/uni-swipe-action/uni-swipe-action.vue';
	import printButton from '../../components/label-print/print-button.vue';

	import apis from '../../common/apiService.js'; //系统api
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js'; //常用功能
	import {
		mapState,
		mapMutations
	} from 'vuex';

	let erpInterfaceType = null;
	let mesInLotType = null;
	export default {
		components: {
			barcodeInput,
			mpvuePicker,
			uniSwipeAction,
			printButton
		},
		data() {
			return {
				progNo: '',
				reportModel: {
					progNo: '', //页面ID
					showReport: false,
					isMultiPrint: false,
					dataSource: [],
					isNeedValidTag: true //是否需要校验标签
				},
				numQty_focus: false,
				num_focus: false,
				//包数
				num: 0,
				//包装数量
				numQty: 0,

				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				m_defineShow: false,
				/* 针对安费咯 define1-5*/
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
				part: {
					define1: '',
					define2: '',
					define3: '',
					define4: '',
					define5: ''
				}
			};
		},
		onLoad(option) {
			this.reportModel.progNo = option.progNo;
			this.progNo = option.progNo;
			this.erpInterfaceType = storage.get(consts.storageKeys.erpInterfaceType);
			this.mesInLotType = storage.get(consts.storageKeys.mesInLotType);
			this.showProLot = this.erpInterfaceType == consts.erpInterfaceType.anfeinuo;
			/* 控制显示 */
			this.m_defineShow = this.erpInterfaceType == consts.erpInterfaceType.anfeinuo || this.erpInterfaceType == consts.erpInterfaceType.changtong;
			
			console.log(this.m_defineShow+'----------m_defineShow-------------'+this.erpInterfaceType)
		},
		onReady() {
			util.getListHeight(this);
			var _self = this;
			setTimeout(function() {
				var val = _self.scrollHeight;
				if (val != 0) val = _self.scrollHeight.replace('px', '');
				console.log(val);
				if (eval(200 - val) > 0) {
					_self.scrollHeight = '200px';
					console.log(_self.scrollHeight);
				}
			}, 1500);
			_self.$refs.input_order.setFocus();
		},
		onBackPress(options) {
			return util.backPress(options, this.details.length > 0);
		},
		onShow() {
			var _self = this;
			if (_self.pageIO_submit) {
				_self.pageIO_false(); /* 恢复到没有从子页的跳转标识 */
				_self.onScaned(_self.order.poMoSoLot);
			}
		},
		computed: mapState(['pageIO_submit']),
		methods: {
			...mapMutations(['pageIO_false', 'setUrldata']),
			onScaned(e) {
				uni.showLoading({
					mask: true
				});
				apis.acceptLotPur_MK_GetModel({
					data: {
						moLot: e,
						type: 0 //0 所有 1 批次 2序列号
					},
					success: res => {
						res.poMoSoLot = res.purLot;
						if (this.erpInterfaceType == consts.erpInterfaceType.anfeinuo) {
							res.proLot = this.getYearWeek();
						}
						if (this.mesInLotType == consts.mesInLotType.MoLot) {
							res.inLot = res.purLot;
						} else if (this.mesInLotType == consts.mesInLotType.OrdMoLot) {
							res.inLot = res.ordLot == null || '' ? res.purLot : res.ordLot;
						} else if (this.mesInLotType == consts.mesInLotType.MoLotYearWeek) {
							res.inLot = res.purLot + this.getYearWeek();
						} else if (this.mesInLotType == consts.mesInLotType.MoLotYMD) {
							//索源 内包装打印  批次号 默认 为 制单+年月日（6位)
							res.inLot = res.purLot + new Date(res.proDate).format('yyMMdd');
						}
						res.proDate = new Date(res.proDate).format('yyyy/MM/dd') || new Date().format('yyyy/MM/dd');
						res.citemNo = res.citemNo || '';
						res.lastTagQty = util.floatObj.subtract(res.sheetQty, res.createTagQty);
						if (res.lastTagQty > res.minPackingQty) {
							this.numQty = res.minPackingQty;
						} else {
							this.numQty = res.lastTagQty;
						}
						this.num = 1;
						this.order = res;
						this.numQty_focus = true;
						util.showScanedAudio();
						console.log(JSON.stringify(res));
					},
					failure: message => {
						this.$refs.input_order.setFocus();
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
			onNumAdd(e) {
				var _sefl = this;
				//拆包
				if (this.numQty <= 0) {
					//数量必须大于0
					uni.showToast({
						title: '数量必须要大于0',
						icon: 'none'
					});
					return;
				}
				if (this.num <= 0) {
					//包数必须大于0
					uni.showToast({
						title: '包数必须要大于0',
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
						title: '生产数量 不可超过 未生产数量！！！！',
						icon: 'none'
					});
					return;
				}
				/* 剩余数量=单据剩余数量-上次录入的数量+录入包数*录入数量 */
				var lastQty = this.order.lastTagQty - (totalQty + this.numQty * this.num);
				if (lastQty < 0) {
					//数量录入错误
					uni.showToast({
						title: '数量录入有误',
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
				console.log('剩余数量---' + lastQty);
				if (lastQty > this.order.minPackingQty) {
					this.numQty = this.order.minPackingQty;
				} else {
					this.numQty = lastQty;
					this.num = 1;
					if (this.numQty <= 0) {
						this.num = 0;
						this.numQty = 0;
					}
				}
			},
			onSave() {
				if (this.details.length == 0) {
					uni.showToast({
						title: '请输入要打印的数据',
						icon: 'none'
					});
					return;
				}
				if (this.order.lastTagQty == 0) {
					uni.showToast({
						title: '标签产生完成，不需要再次打印',
						icon: 'none'
					});
					return;
				}
				var that = this;
				/* 1-5非必填，朱永军 */
				/* if (this.m_defineShow) {
					for (var name in that.part) {
						if (!that.part[name]) {
							uni.showToast({
								title: '请填写必要字段',
								icon: 'none'
							});
							return;
						}
					}
				} */
				//产生标签，并打印
				let list = [];
				var prefix = new Date().format('yyMMddHHmmssfff');
				var index = 0;
				let totalQty = 0;
				for (var i = 0; i < that.details.length; i++) {
					var item = that.details[i];
					totalQty = util.floatObj.add(totalQty, util.floatObj.multiply(item.num, item.numQty));
					for (var j = 0; j < item.num; j++) {
						index++;
						var model = util.clone(that.order);
						console.log(util.outputLog(new Date(that.order.proDate).format('yyyy/MM/dd')));
						model.sheetQty = item.numQty;
						model.tagId = `${prefix}-${util.getSuffix(3, index)}`;
						/* model.partDefine1 = that.order.partDefine1;
							model.partDefine2 = that.order.partDefine2;
							model.partDefine3 = that.order.partDefine3;
							model.partDefine4 = that.order.partDefine4;
							model.partDefine5 = that.order.partDefine5;
							model.partDefine3 = that.order.partDefine3;
							model.partDefine7 = that.order.partDefine7;
							model.partDefine8 = that.order.partDefine8;
							model.partDefine9 = that.order.partDefine9;
							model.partDefine10 = that.order.partDefine10; */
						model.proDate = new Date(that.order.proDate).format('yyyy/MM/dd') || new Date().format('yyyy/MM/dd');
						model.createDate = new Date(that.order.createDate).format('yyyy/MM/dd hh:mm:ss') || new Date().format(
							'yyyy/MM/dd hh:mm:ss');
						model.define1 = that.part.define1;
						model.define2 = that.part.define2;
						model.define3 = that.part.define3;
						model.define4 = that.part.define4;
						model.define5 = that.part.define5;
						model.entityState = consts.entityState.added;
						list.push(model);
					}
				}
				/* 保存 */
				uni.showLoading({
					mask: true
				});
				apis.acceptLotPur_Print_Post({
					data: list,
					success: res => {
						this.order.createTagQty += totalQty;
						this.order.lastTagQty = util.floatObj.subtract(this.order.sheetQty, this.order.createTagQty);
						this.details = [];
						for (var i = 0; i < res.length; i++) {
							var item = res[i];
							item.proDate = new Date(item.proDate).format('yyyy/MM/dd') || new Date().format('yyyy/MM/dd');
							item.createDate = new Date(item.createDate).format('yyyy/MM/dd hh:mm:ss') || new Date().format(
								'yyyy/MM/dd hh:mm:ss');
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
				});
			},
			printComplete() {
				util.dataInit(this);
				/* 控制显示 */
				
				this.$refs.input_order.setFocus();
			},
			/**
			 * @param {Object} scanTagModelList 扫描的标签结果集
			 */
			tagValid(scanTagModelList) {
				util.dataInit(this);
				
				this.$refs.input_order.setFocus();
			},
			scroll(e) {
				//滚动
				this.old.scrollTop = e.detail.scrollTop;
			},
			/**
			 * @description  gun dong ding wei
			 */
			onScrollTop(index) {
				//滚动定位
				this.onSelectedItem(index);
				let view = uni
					.createSelectorQuery()
					.in(this)
					.select('.scroll-view-item');
				view.boundingClientRect(data => {
					this.scrollTop = this.old.scrollTop;
					if (data == null) return;
					this.$nextTick(function() {
						this.scrollTop = data.height * index;
					});
				}).exec();
			},
			/* 选中的方法 参数e是第几项 selectItemClass更改样式uni-list-cell-selected*/
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
				for (var i = 0; i < this.details.length; i++) {
					totalQty += this.details[i].num * this.details[i].numQty;
				}

				/* 删除后剩余数量是可以按最小包装继续包？ */
				if (this.order.lastTagQty - totalQty > this.order.minPackingQty) {
					this.numQty = this.order.minPackingQty;
				} else {
					/* 显示尾数 */
					this.numQty = this.order.lastTagQty - totalQty;
					this.num = 1;
				}
			},
			onnavigateTo() {
				var _self = this;
				//跳转带参
				if (this.order.poMoSoLot == '') {
					uni.showToast({
						title: '请扫描制造批号！',
						icon: 'none'
					});
					util.showAudio();
					this.$refs.input_order.setFocus();
					return;
				}
				this.setUrldata(_self.order);
				uni.navigateTo({
					url: 'production-printDet?progNo=' + _self.progNo
				});
			}
		}
	};
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
