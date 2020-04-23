<!-- 标签拆包打印 -->
<template>
	<view class="unpack-view" v-show="showView">
		<view class="uni-mask" :style="{ top: offsetTop + 'px' }"></view>
		<view class="uni-modal">
			<view class="uni-modal__hd"><strong class="uni-modal__title">{{title}}</strong></view>
			<view class="uni-modal__bd">
				<view class="uni-list-cell">
					<view class="uni-list-cell-left">
						料号:
					</view>
					<view class="uni-list-cell-db">
						{{model.partItemNo}}
					</view>
				</view>
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						数量:
					</view>
					<view class="uni-list-cell-db">
						{{model.sheetQty}}
					</view>
				</view>
				<view class="uni-list-cell input-row">
					<!-- 生产批次 -->
					<view class="uni-list-cell-left">
						批次:
					</view>
					<view class="uni-list-cell-db">
						{{model.inLot}}
					</view>
				</view>
				<!-- 数量 -->
				<view class="uni-list-cell input-row">
					<view class="uni-list-cell-left">
						数量:
					</view>
					<view class="uni-list-cell-db">
						<input type="number" v-model="numQty" />
					</view>
					<!--包数  -->
					<view class="uni-list-cell-left">
						包数:
					</view>
					<view class="uni-list-cell-db">
						<input type="number" v-model="num" />
					</view>
					<view class="uni-list-cell-left">
						<button type="default" style="padding: 0; height: 25px; width: 25px; line-height: 1.3;" @click="onNumAdd"><span
							 style="text-align: center;">+</span></button>
					</view>
				</view>
				<view class="uni-list-cell" style="height: 30px;">
					<view class="flex-item">
						<strong>数量</strong>
					</view>
					<view class="flex-item">
						<strong>包数</strong>
					</view>
				</view>
				<scroll-view scroll-y="true" style="height: 350upx;">
					<view class="uni-list">
						<block v-for="(item,index) in details" :key="index">
							<!-- <view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover">
								<view class="uni-triplex-row">
									<view class="uni-flex uni-row" style="width: 100%;">
										<view class="flex-item">{{item.numQty}}</view>
										<view class="flex-item">{{item.num}}</view>
									</view>
								</view>
							</view> -->
							<uni-swipe-action :options="options1" :det_id="item.det_id" @click="bindClick">
								<uni-list-item :show-arrow="false">
									<view class="uni-flex uni-row">
										<view class="flex-item">{{item.numQty}}</view>
										<view class="flex-item">{{item.num}}</view>
									</view>
								</uni-list-item>
							</uni-swipe-action>
						</block>
					</view>
				</scroll-view>
				<view style="border-top: 1upx solid #ccc;margin-left: 20upx; padding-top: 10upx;" v-if="isShowSaveSelected">
					<label class="checkbox" @click="cbxChange">
						<checkbox :checked="isSaveSelected" />下次不再选择
					</label>
				</view>
			</view>
			<view class="uni-modal__ft">
				<view class="uni-modal__btn uni-modal__btn_default" style="color: rgb(0, 0, 0);" @tap="hide">取消</view>
				<view class="uni-modal__btn uni-modal__btn_primary" style="color: rgb(0, 122, 255);" @tap="onSubmitPrint">打印</view>
			</view>
		</view>

		<label-print ref="labPri" :progNo="progNo" :showReport="showReport" :reportModel="reportModel" @printCancel="printCancel"
		 @printComplete="printComplete"></label-print>
	</view>
</template>
<script>
	import labelPrint from '../../components/label-print/label-print.vue'
	import uniSwipeAction from '@/components/uni-swipe-action/uni-swipe-action.vue'
	import uniList from '@/components/uni-list/uni-list.vue'
	import uniListItem from '@/components/uni-list-item/uni-list-item.vue'

	import apis from '../../common/apiService.js';
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js';
    import regexp from '../../common/regexp.js';
	
	export default {
		name: 'lotunpack',
		components: {
			uniSwipeAction,
			uniList,
			uniListItem,
			labelPrint
		},
		data() {
			let offsetTop = 0;
			//#ifdef H5
			if (!this.h5Top) {
				offsetTop = 44;
			} else {
				offsetTop = 0;
			}
			//#endif
			return {
				isShowSaveSelected: false,
				isSaveSelected: false,
				showReport: false,
				reportModel: {
					isMultiPrint: false,
					dataSource: [],
					isNeedValidTag: false //是否需要校验标签
				},
				showView: false,
				details: [],
				det_id: 0,
				//包数
				num: '',
				//包装数量
				numQty: '', //获取报表
				options1: [{
					text: '删除',
					style: {
						backgroundColor: 'rgb(255,58,49)'
					}
				}],
				offsetTop: offsetTop
			};
		},
		props: {
			/**
			 * 页面显示
			 */
			show: {
				type: Boolean,
				default: false
			},
			/**
			 * 额外信息
			 */
			title: {
				type: String,
				default: '标签打印'
			},
			/**
			 * h5遮罩是否到顶
			 */
			h5Top: {
				type: Boolean,
				default: false
			},
			//标签对象
			model: {
				type: Object,
				required: true
			},
			//打印列表
			printDetail: {
				type: Array,
				default: () => {
					return [];
				}
			},
			progNo: {
				type: String,
				required: true,
			},
			//打印的时候是否保存标签
			isSaveSplit: {
				type: Boolean,
				default: true
			}
		},
		watch: {
			h5Top(newVal) {
				if (newVal) {
					this.offsetTop = 44;
				} else {
					this.offsetTop = 0;
				}
			},
			printDetail: {
				immediate: true,
				handler: function(newVal) {
					console.log(newVal)
					if (newVal.length == 0) return;
					console.log(JSON.stringify(newVal))
					var totalQty = 0;
					for (var i = 0; i < newVal.length; i++) {
						var item = newVal[i];
						let a = util.floatObj.multiply(item.num, item.numQty);
						totalQty = util.floatObj.add(totalQty, a);
					}
					if (this.model.sheetQty != totalQty) {
						uni.showToast({
							title: '拆包的数据中，数量拆分后总数不对',
							icon: 'none'
						});
						throw '拆包的数据中，数量拆分后总数不对';
					}
					this.details = util.clone(newVal);
				}
			},
			show: {
				immediate: true,
				handler: function(newVal) {
					this.showView = newVal;
					if (this.printDetail.length == 0) {
						this.num = 1;
						// this.numQty = this.model.sheetQty;
					}
				}
			}
		},
		computed: {},
		onReady() {
			uni.hideKeyboard();
			this.checkUseDefaultPrint();
		},
		methods: {
			checkUseDefaultPrint() {
				var find = this.$refs.labPri.checkUseDefaultPrint();
				this.isSaveSelected = find;
				this.isShowSaveSelected = find;
			},
			/**
			 * 是否作为默认
			 */
			cbxChange() {
				this.isSaveSelected = !this.isSaveSelected
			},
			bindClick(value) {
				//删除当前行 更新numQty的数量
				var totalQty = 0;
				var _sefl = this;
				for (var i = 0; i < this.details.length; i++) {
					var item=this.details[i];
					if (item.det_id == value.det_id) {
						_sefl.details.splice(i, 1);
						break;
					}
				}
				for (var i = 0; i < this.details.length; i++) {
					totalQty += util.floatObj.multiply(this.details[i].num, this.details[i].numQty);
				}
				this.num = 1;
				this.numQty = util.floatObj.subtract(this.model.sheetQty, totalQty);
			},
			onNumAdd(e) {
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
					let a = util.floatObj.multiply(this.details[i].num, this.details[i].numQty);
					totalQty = util.floatObj.add(totalQty, a);
				}
				/* 剩余数量=总数量-上次录入的数量+录入包数*录入数量 */
				let a = util.floatObj.multiply(this.numQty, this.num);
				let b = util.floatObj.add(totalQty, a);
				let c = util.floatObj.subtract(this.model.sheetQty, b);
				var lastQty = c;//this.model.sheetQty - (totalQty + this.numQty * this.num);
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
				this.det_id += 1;
				/* 剩余数量 */
				this.numQty = lastQty;
				//判断剩余数量是否为零
				if (lastQty == 0) {
					this.num = 0;
				} else {
					this.num = 1;
				}
			},
			onSubmitPrint(e) {
				if (this.details.length == 0) {
					uni.showToast({
						title: '请录入包装信息',
						icon: 'none'
					});
					return;
				}
				var totalQty = 0;
				for (var i = 0; i < this.details.length; i++) {
					let a = util.floatObj.multiply(this.details[i].num, this.details[i].numQty);
					totalQty = util.floatObj.add(totalQty, a);
				}
				if (totalQty != this.model.sheetQty) {
					uni.showToast({
						title: '请录入剩余包装数量',
						icon: 'none'
					});
					return;
				}
				if (this.details.length == 1 && this.details[0].num == 1) {
					uni.showToast({
						title: '请拆包打印',
						icon: 'none'
					});
					return;
				}

				var dataSource = [];
				var index = 0;
				let tagId = this.model.tagId;
				for (var i = 0; i < this.details.length; i++) {
					var item = this.details[i];
					for (var j = 0; j < item.num; j++) {
						index++;
						var data = util.clone(this.model);
						data.sheetQty = item.numQty;
												
						let newVal = `${tagId}-${index}`;
						if (newVal.length >= 46){
							let tmpIndex = tagId.lastIndexOf('-');
							let lastNum = Number(tagId.substring(tagId.length - 3));
							if(tmpIndex == tagId.length - 4 && regexp.isNumber(lastNum)){
								let suffix = lastNum + 1;
								data.tagId = `${tagId.substring(0, tagId.length - 4)}-${util.getSuffix(3, suffix)}`;
							}
							else
							{
								data.tagId = `${tagId}-001`;
							}
							tagId = data.tagId;
						}else{
							data.tagId = newVal;
						}
						
						data.inoutFlag = "1"; //上下架标记 1、上架；2、下架
						dataSource.push(data);
					}
				}
				this.reportModel.dataSource = dataSource;
				console.log(this.isSaveSelected);
				if (this.isSaveSelected) {
					this.$refs.labPri.userDefaultPrint()
				} else {
					this.showReport = true;
				}
			},
			/* 打印完成 */
			printComplete() {
				if (this.isSaveSplit) {
					this.saveSplit(this.reportModel.dataSource);
				}
				this.showReport = false;
				this.details = [];
				this.showView = false;
				this.checkUseDefaultPrint()
				this.$emit('printComplete');
			},
			printCancel() {
				this.details = [];
				this.showReport = false;
				this.$emit('printCancel');
			},
			saveSplit(dataSource) {
				var list = util.clone(dataSource);
				var clone = util.clone(this.model);
				clone.inoutFlag = "2"; //上下架标记 1、上架；2、下架
				//增加原始的记录
				list.insert(0, clone);
				console.log("提交拆分的数据list: ");
				console.log(util.outputLog(list));
				//保存拆分结果
				uni.showLoading({
					mask: true
				});
				apis.binno_split({
					data: list,
					success: (res) => {
						this.hide();
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
			hide() {
				this.details = [];
				this.showView = false;
				this.$emit('cancel');
			}
		}
	};
</script>

<style>
	.uni-mask {
		position: fixed;
		z-index: 998;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background-color: rgba(0, 0, 0, 0.3);
	}

	.unpack-view {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 999;
		display: block;
		box-sizing: border-box;
	}

	.unpack-view .uni-modal {
		position: absolute;
		z-index: 999;
		width: 90%;
		/* max-width: 300px; */
		top: 50%;
		left: 50%;
		-webkit-transform: translate(-50%, -50%);
		transform: translate(-50%, -50%);
		background-color: #fff;
		border-radius: 3px;
		overflow: hidden;
		text-align: center;
	}

	.unpack-view .uni-modal * {
		box-sizing: border-box
	}

	.unpack-view .uni-modal__hd {
		padding: 1em .8em .3em;
		border-bottom: 1px solid #d5d5d6;
	}

	.unpack-view .uni-modal__title {
		font-weight: 400;
		font-size: 18px;
		word-wrap: break-word;
		word-break: break-all;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.unpack-view .uni-modal__bd {
		padding: 1.3em;
		padding-left: 0.3em;
		min-height: 40px;
		font-size: 15px;
		line-height: 1.4;
		word-wrap: break-word;
		word-break: break-all;
		/* color: #999; 
		max-height: 400px;*/
		overflow-y: auto;
		text-align: left;
	}

	.unpack-view .uni-modal__ft {
		position: relative;
		line-height: 48px;
		height: 48px;
		display: -webkit-box;
		display: -webkit-flex;
		display: flex;
	}

	.unpack-view .uni-modal__ft:after {
		content: " ";
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		height: 1px;
		border-top: 1px solid #d5d5d6;
		color: #d5d5d6;
		-webkit-transform-origin: 0 0;
		transform-origin: 0 0;
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5)
	}

	.unpack-view .uni-modal__btn {
		display: block;
		-webkit-box-flex: 1;
		-webkit-flex: 1;
		flex: 1;
		color: #3cc51f;
		text-decoration: none;
		-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
		position: relative;
		padding-top: 2%;
		font-size: 18px !important;
		-webkit-box-orient: vertical;
	}

	.unpack-view .uni-modal__btn:active {
		background-color: #eee
	}

	.unpack-view .uni-modal__btn:after {
		content: " ";
		position: absolute;
		left: 0;
		top: 0;
		width: 1px;
		bottom: 0;
		border-left: 1px solid #d5d5d6;
		color: #d5d5d6;
		-webkit-transform-origin: 0 0;
		transform-origin: 0 0;
		-webkit-transform: scaleX(.5);
		transform: scaleX(.5);
	}

	.unpack-view .uni-modal__btn:first-child:after {
		display: none
	}

	.unpack-view .uni-modal__btn_default {
		color: #353535
	}

	.unpack-view .uni-modal__btn_primary {
		color: #007aff
	}

	.flex-item {
		width: 50%;
		text-align: center;
	}

	.cont {
		height: 90upx;
		line-height: 90upx;
		padding: 0 30upx;
		position: relative;
	}
</style>
