<!-- 销售退货 -->
<template>
	<view>
		<view id="viewHeader"><barcode-input ref="input_order" @onScaned="onScaned" :focus="true" placeholder="客户订单号"></barcode-input></view>
		<!-- 显示入库单明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item, index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)" v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">单号:{{ item.sheetNo }}</text>
								<text class="uni-title" style="margin-right: -300upx;">出货客户:{{ item.cuNo }}</text>
								<text class="uni-title" style="margin-right: -300upx;">客户订单号:{{ item.cuOrdNo }}</text>
								<text class="uni-title" style="margin-right: -300upx;">料品名称:{{ item.partName }}</text>
							</view>
							<view class="uni-triplex-right" style="min-width: 260upx;">
								<text class="uni-h5">单位名称:{{ item.unitName }}</text>
								<text class="uni-h5">数量:{{ item.sheetQty }}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import barcodeInput from '../../components/barcode-input/barcode-input.vue'; //扫码组件

import apis from '../../common/apiService.js'; //系统api
import consts from '../../common/consts.js';
import storage from '../../common/storage.js';
import util from '../../common/util.js'; //常用功能
import { mapState, mapMutations } from 'vuex';
export default {
	components: {
		barcodeInput
	},
	data() {
		return {
			progNo: '', //页面ID
			old: {
				scrollTop: 0
			},
			scrollTop: 0,
			scrollHeight: 0,
			details: []
		};
	},
	onLoad(option) {
		this.progNo = option.progNo;
	},
	onReady() {
		util.getListHeight(this);
		this.init('');
	},
	onBackPress(options) {
		return util.backPress(options, this.details.length > 0);
	},
	onShow() {
		if (this.pageIO_submit) {
			for (var i = 0, len = this.details.length; i < len; i++) {
				if (this.details[i].m_isclick) {
					this.details.splice(i, 1);
				}
			}
			this.pageIO_false(); /* 恢复到没有从子页的跳转标识*/
		}
	},
	computed: mapState(['pageIO_submit']),
	methods: {
		...mapMutations(['pageIO_false']),
		init(e) {
			uni.showLoading({
				mask: true
			});
			apis.sale_return_GetList({
				data: {
					cuOrdNo: e
				},
				success: res => {
					console.log(JSON.stringify(res));
					this.details = res;
					if (e != '') {
						util.showScanedAudio();
					}
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
		onScaned: function(e) {
			this.init(e);
		},
		/* 选中的方法 */
		onSelectedItem(e) {
			//点击列表
			for (var l = 0; l < this.details.length; l++) {
				this.details[l].m_isclick = false;
			}
			var item = this.details[e];
			if (!util.validOrderMonth(item)) {
				return;
			}
			item.m_isclick = true;
			uni.navigateTo({
				url: '/pages/sale/sale-returnDet?sheetLot=' + item.sheetLot
			});
		},
		scroll(e) {
			//滚动
			this.old.scrollTop = e.detail.scrollTop;
		}
	}
};
</script>

<style></style>
