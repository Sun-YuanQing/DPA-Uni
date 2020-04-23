<!--工单下线 列表  特殊处理时间-->
<!-- select start_date,* from osfc_mesdayworktime where id = 209  数据表 -->
<template>
	<view>
		<view id="viewHeader">
			<!-- 头表信息 -->
			<barcode-input ref="input_order" @onScaned="onOrderScaned" :focus="true" :clearScan="true" placeholder="扫制造单号"></barcode-input>
		</view>
		<!-- 显示入库单明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item, index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">料号:{{ item.partItemNo ? item.partItemNo : '未知' }}</text>
								<text class="uni-title">
									状态:{{ item.workSta == 1 ? '开工' : item.workSta == 2 ? '暂停' : item.workSta == 3 ? '下线' : item.workSta == 4 ? '完工' : '未知' }}
								</text>
								<text class="uni-title">上线时间:{{ item.sheetDate }}</text>
							</view>
							<view class="uni-triplex-right">
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">设备:{{ item.deviceNo }}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">工序:{{ item.proName }}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>

		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm"><button type="primary" @click="onSave">下线</button></page-foot>
		<!-- 弹出框  -->
		<uni-popup-modal id="popup-modal" :show="showPrint" title="下线日期" @hidePopup="onShowPrint(false)" @save="onSubmitPrint">
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">下线日期:</view>
				<view class="uni-list-cell-db">
					<view @click="showDatePicker">{{ m_endDate }}</view>
				</view>
			</view>
		</uni-popup-modal>
		<mpvue-picker ref="mpvuePicker" mode="dateSelector" :pickerValueDefault="m_endDate" @onConfirm="onPickerConfirm"></mpvue-picker>
	</view>
</template>

<script>
	import barcodeInput from '../../components/barcode-input/barcode-input.vue'; //扫码组件
	import mpvuePicker from '../../components/mpvue-picker/mpvuePicker.vue'; //时间控件
	import uniPopupModal from '../../components/uni-popup-modal/uni-popup-modal.vue'; //弹出框
	import apis from '../../common/apiService.js'; //系统api
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js'; //常用功能
	export default {
		components: {
			barcodeInput,
			mpvuePicker,
			uniPopupModal
		},
		data() {
			return {
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				m_endDate: new Date().format('yyyy/MM/dd'),
				orderItemSelected: { 
				},
				showPrint: false,
				details: []
			};
		},
		onLoad(option) {},
		onReady() {
			util.getListHeight(this);
			/* 做好上线就注释 */
			/* uni.showToast({
				title: '未准备好，暂不开放！！',
				icon: 'none'
			});
			uni.navigateBack(); */
		},
		onBackPress(options) {
			return util.backPress(options, this.details.length > 0);
		},
		methods: {
			onOrderScaned(e) {
				var that = this;
				uni.showLoading({
					mask: true
				});
				apis.OpenMes_mesdayworktimelistbymolot({
					data: {
						moLot: e
					},
					success: res => {
						that.details = res;
						for (var i = 0, len = that.details.length; i < len; i++) { 
							that.details[i].sheetDate = new Date(that.details[i].sheetDate).format('yyyy/MM/dd HH:mm:ss');
						}
						if (that.details.length > 0){
							that.onScrollTop(0);
						}
					},
					failure: message => {
						util.showAudio();
					},
					complete: (status, message, content) => {
						this.$refs.input_order.setFocus();
						util.tryCatchApi({
							status: status,
							message: message
						});
						uni.hideLoading();
					}
				});
			},
			showDatePicker() {
				this.$refs.mpvuePicker.show();
			},
			onPickerConfirm(e) { 
				this.m_endDate = new Date(e.label).format('yyyy/MM/dd');
			},
			/*
			   弹出框取消/显示
			 */
			onShowPrint(e) {
				//显示填表信息
				this.showPrint = e;
			},
			/*
			   弹出框确定
			 */
			onSubmitPrint(e) { 
				let offDate = '';
				let sheetDate = new Date(this.orderItemSelected.sheetDate).format('yyyy/MM/dd');
				if (this.m_endDate == sheetDate && sheetDate != new Date().format('yyyy/MM/dd')) {
					offDate = this.m_endDate + ' 23:59:00';
				}
				if (this.m_endDate == sheetDate && sheetDate == new Date().format('yyyy/MM/dd')) {
					offDate = this.m_endDate + ' ' + new Date().format('hh:mm:ss');
				}
				if (this.m_endDate != sheetDate) { 
					uni.showToast({
						title: '上下线时间不是同一天！！！',
						icon: 'none'
					});
					util.showAudio(); 
					return;
				} 
				this.showPrint = false;
				apis.Pda_pdamesdayworktimefinish({
					data: {
						id: this.orderItemSelected.id,
						endDate: offDate
					},
					success: res => {
						uni.showToast({
							title: '保存成功'
						});
						//初始化数据，（软件盘）
						util.dataInit(this);
						this.$refs.input_order.setFocus();
					},
					failure: message => {
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
			onSave() {
				if (this.details.length == 0){
					uni.showToast({
						title: '请先扫描制造单号',
						icon: 'none'
					});
					util.showAudio();
					this.$refs.input_order.setFocus();
					return;
				}
				this.showPrint = true;
			},
			scroll(e) {
				//滚动
				this.old.scrollTop = e.detail.scrollTop;
			},
			onScrollTop(index) {
				//滚动定位
				this.onSelectedItem(index);
				let view = uni
					.createSelectorQuery()
					.in(this)
					.select('.scroll-view-item');
				view.boundingClientRect(data => {
					this.scrollTop = this.old.scrollTop;
					this.$nextTick(function() {
						this.scrollTop = data.height * index;
					});
				}).exec();
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
			}
		}
	};
</script>

<style></style>
