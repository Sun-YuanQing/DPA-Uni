<!-- 生产退库-->
<template>
	<view>
		<view id="viewHeader">
			<!-- 单号 扫描 -->
			<barcode-input ref="input_order" @onScaned="onScaned" focus="true" placeholder="请扫描制造单批号"></barcode-input>

		</view>

		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title uni-ellipsis">退库单号:{{item.sheetNo}}</text>
								<text class="uni-title uni-ellipsis">制造单批号:{{item.purLot}}</text>
								<text class="uni-title">料号:{{item.partItemNo}}</text>
								<text class="uni-title">料品名称:{{item.partName}}</text>
							</view>
							<view class="uni-triplex-right" style="min-width: 220upx;">
								<text class="uni-h5">退置仓库:{{item.whNo}}</text>
								<text class="uni-h5">单位:{{item.unitName}}</text>
								<text class="uni-h5">数量: {{item.sheetQty}}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>


	</view>
</template>

<script>
	import uniPopupModal from '../../components/uni-popup-modal/uni-popup-modal.vue'
	import barcodeInput from '../../components/barcode-input/barcode-input.vue'
	import apis from '../../common/apiService.js';
	import consts from '../../common/consts.js';
	import util from '../../common/util.js';
	import { mapState, mapMutations } from 'vuex';
	export default {
		components: {
			barcodeInput,
			uniPopupModal
		},
		data() {
			return {
				//显示录入批次信息
				showInLot: false,
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				details: [],
				orderItemSelected: {}, //当前选中项
				orderItemSelected_input: {
					inLot: '' //批次号
				} //弹出输入项
			}
		},
		onReady() {
			util.getListHeight(this);
		},
		onBackPress(options) {
			return util.backPress(options, this.details.length > 0);
		},
		onShow() {
			if (this.pageIO_submit) {
				for (var i = 0, len = this.details.length; i < len; i++) {
					if (this.details[i].m_isSelected) {
						this.details.splice(i, 1);
					}
				}
				this.pageIO_false(); /* 恢复到没有从子页的跳转标识 */
			}
		},
		computed: mapState(['pageIO_submit']),
		methods: {
			...mapMutations(['pageIO_false']),
			onScaned(e) {
				/* 解析入库信息 */
				uni.showLoading({
					mask: true
				});
				apis.Pda_acceptreturndetailbypurlot({
					data: {
						purLot: e
					},
					success: (res) => {
						this.details = res;
						util.showScanedAudio();
					},
					failure: (message) => {
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
				})
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
				for (var i = 0; i < this.details.length; i++) {
					var order = this.details[i];
					order.m_isSelected=false;
				}
				var _self = this;
				if(!util.validOrderMonth(_self.details[e])){ 	
					return;		
				}			
				_self.details[e].m_isSelected=true;
				uni.navigateTo({
					url: "production-returnDet?detail=" + JSON.stringify(_self.details[e])
				})
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
			}
		}
	}
</script>

<style>
</style>
