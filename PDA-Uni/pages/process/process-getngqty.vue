<!--工序报工 不良数量-->
<template>
	<view>
		<view id="viewHeader">
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">
					工序：
				</view>
				<view class="uni-list-cell-db">
					<picker @change="bindPickerChange" :value="accIndex" :range="accList">
						<view>{{accList[accIndex]}}</view>
					</picker>
				</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">
					现象:
				</view>
				<view class="uni-list-cell-db " style="line-height: 65upx; color: #8F8F94; min-height: 65upx;" @click="to_bugName">
					{{head.bugName}}
				</view>
			</view>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">
					数量:
				</view>
				<view class="uni-list-cell-db">
					<input type="number" style="height: 100%;" v-model="head.sheetQty" />
				</view>
			</view>
			<!-- 数量 填-->
			<view class="uni-list-cell">
				<button type="default" style="width: 100%; height:90%; margin: 10upx 0 10upx 30upx; font-size: 30upx;" @click="onNumAdd">添加</button>
			</view>

			<view class="uni-list-cell input-row">
				<view class="flex-item">
					工序
				</view>
				<view class="flex-item">
					现象
				</view>
				<view class="flex-item">
					数量
				</view>
			</view>
		</view>

		<!-- 显示入库单明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in head.det" :key="index">
					<!-- 给选择项添加样式 -->
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<view class="uni-list-cell">
									<view class="flex-item">{{item.custName1 }}</view>
									<view class="flex-item">{{item.bugName}}</view>
									<view class="flex-item">{{item.sheetQty}}</view>
								</view>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>

		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<button type="primary" @click="onprint_to">下一步</button>
		</page-foot>
	</view>

</template>

<script>
	import barcodeInput from '../../components/barcode-input/barcode-input.vue' //扫码组件

	import apis from '../../common/apiService.js'; //系统api
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js'; //常用功能
	export default {
		components: {
			barcodeInput
		},
		data() {
			return {
				progNo: '', //页面ID
				numder: 0, //数量
				ngobject: 'ngobject', //不良现象
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				processInfo: [], //有用
				head: { //+单据信息  之后会请求新赋值多个数据例如details
					bugNo: '',
					bugName: '填写不良现象',
					sheetQty: '',
					custNo: '',
					itemNo: '',
					custName1: '填写制造工序',
					det: [],
				},
				orderItemSelected: {
					scanQty: 0, //已扫描
					lastScanQty: 70, //未扫
					qualifiedQty: 70 //v
				}, //当前选中项
				hesd: { //==当前所有的输入项对象

					details: [], //录入的包数集合
				}, //==弹出打印的对象 
				proItemNo: '' ,//要过滤此工序 
				accIndex: 0,
				accList: [],
				moulds:[]//工步工序
			}
		},
		onLoad(option) {
			this.moulds = JSON.parse(option.moulds);
			for (var i = 0; i < this.moulds.length; i++) {
				this.accList.push(this.moulds[i].proName);
			} 
			this.bindPickerChang1(0);
		},
		onShow(e) {
			//获取工序不良现象缓存
			let navBackData_bug_Process = storage.get(consts.storageKeys.navBackData_bug_Process);
			if (navBackData_bug_Process) {
				this.processInfo = navBackData_bug_Process;
				this.head.bugNo = this.processInfo.bugNo;
				this.head.bugName = this.processInfo.bugName;
				storage.set(consts.storageKeys.navBackData_bug_Process, null);
			}
		},
		onReady() {
			util.getListHeight(this);
		},
		onUnload() {
			storage.set(consts.storageKeys.navBackData_searchProcess, null);
		},
		onBackPress(options) {
			return util.backPress(options, this.head.det.length > 0);
		},
		methods: {
			bindPickerChange(e) {
				this.accIndex = e.target.value;
				this.bindPickerChang1(this.accIndex);
			},
			bindPickerChang1(index){
				this.head.custName1 = this.moulds[index].proName;
				this.head.itemNo = this.moulds[index].proItemNo;
				this.head.custNo = this.moulds[index].proNo;
			},
			scroll(e) { //滚动
				this.old.scrollTop = e.detail.scrollTop
			},
			/**
			 * @description  gun dong ding wei 
			 */
			onScrollTop(index) {
				//滚动定位
				this.onSelectedItem(index)
				let view = uni.createSelectorQuery().in(this).select(".scroll-view-item");
				view.boundingClientRect(data => {
					this.scrollTop = this.old.scrollTop;
					this.$nextTick(function() {
						this.scrollTop = data.height * index;
					})
				}).exec();

			},
			/* 选中的方法 参数e是第几项 selectItemClass更改样式uni-list-cell-selected*/
			onSelectedItem(e) {
				for (var i = 0; i < this.order.details.length; i++) {
					var item = this.order.details[i];
					if (i == e) {
						item.selectItemClass = "uni-list-cell-selected";
						this.orderItemSelected = item;
					} else {
						item.selectItemClass = '';
					}
				}
			},
			onSave() {
				//保存
				for (var i = 0; i < this.order.details.length; i++) { //保存之前是否扫描 完毕lastScanQty=0
					let item = this.order.details[i];
					if (item.lastScanQty > 0) { //未扫不能大于0
						uni.showToast({
							title: '该条信息未扫描',
							icon: "none"
						});
						this.onSelectedItem(i); //选中
						return;
					}
					if (item.lastScanQty < 0) { //未扫不能小于0
						uni.showToast({
							title: '该条信息未扫不能小于0',
							icon: "none",
						});
						this.onSelectedItem(i); //选中
						return;
					}
					if ((item.lastScanQty + item.ScanQty) === item.qualifiedQty) { //未扫不能小于0
						uni.showToast({
							title: '该条信息未扫或已扫数据有误.',
							icon: "none",
						});
						this.onSelectedItem(i); //选中
						return;
					}
				}
				/* 保存 */
				uni.showLoading({
					mask: true
				});
				apis.acceptin_Save({
					data: {
						sheetNo: this.order.sheetNo
					},
					success: (res) => {
						uni.showToast({
							title: '保存成功'
						});
						this.order = {}; //保存完毕清空
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
			onNumAdd() {
				if (this.head.custName1 == '填写制造工序') {
					uni.showToast({
						title: "填写制造工序",
						icon: 'none'
					});
					util.showAudio();
					return true;
				}
				if (this.head.bugName === '填写不良现象' || this.head.bugName.length == 0) {
					uni.showToast({
						title: "请填写不良现象",
						icon: 'none'
					});
					util.showAudio();
					return true;
				}
				if (this.head.sheetQty <= 0) {
					uni.showToast({
						title: "不良数量必须要大于0",
						icon: 'none'
					});
					util.showAudio();
					return true;
				}
				for (let i = 0; i < this.head.det.length; i++) {
					if (this.head.det[i].itemNo == this.head.itemNo) {
						uni.showToast({
							title: "该工序已录入过不良信息",
							icon: 'none'
						});
						return;
					}
				}

				/* 将包数和数量添加到集合中 */
				this.head.det.push({
					sheetQty: Number(this.head.sheetQty),
					custName1: this.head.custName1,
					custNo: this.head.custNo,
					itemNo: this.head.itemNo, //工序编码
					proName: this.head.custName1,
					proItemNo: this.head.itemNo,
					proNo: this.head.custNo,
					bugNo: this.head.bugNo,
					bugName: this.head.bugName
				});
				this.head.sheetQty = 0;
				this.processInfo = '';
				this.head.bugNo = '';
				this.head.bugName = '';
			},
			to_custName1() {
				uni.navigateTo({
					url: '../common/search-processList'
				})
			},
			to_bugName() {
				//工序编码S
				uni.navigateTo({
					url: '/pages/common/search-bug-processList?proNo=' + this.head.itemNo
				})
			},
			onprint_to() {
				if (this.head.det.length == 0) {
					uni.showToast({
						title: "请录入不良数据",
						icon: 'none'
					});
					return;
				}
				storage.set(consts.storageKeys.navBackData_bug_data, this.head.det); //将填写的数据集作为缓存，在工序报工获取，清除
				//初始化数据，（软件盘）
				util.dataInit(this);
				uni.navigateBack();
			}
		}
	}
</script>

<style>
	.input-row {
		padding: 11upx 0upx;
	}
	.flex-item {
		width: 35%;
		float: left;
		text-align: center;
	}

	.center-box {
		max-height: 800upx;
	}
</style>
