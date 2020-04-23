<!-- 销售出货-->
<template>
	<view>
		<view id="viewHeader"><barcode-input ref="input_order" @onScaned="onScaned" :focus="true" placeholder="客户订单号"></barcode-input></view>
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item, index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)" v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">发货单号:{{ item.sheetNo }}</text>
								<!-- <text class="uni-title" style="min-width: 500upx;">出货客户:{{item.cuNo}}</text> -->
								<text class="uni-title" style="min-width: 500upx;">客户订单号:{{ item.cuOrdNo }}</text>
								<text class="uni-title" style="min-width: 500upx;">料品编码:{{ item.partItemNo }}</text>
								<text class="uni-title" style="min-width: 500upx;">料品名称:{{ item.partName }}</text>
							</view>
							<view class="uni-triplex-right">
								<text class="uni-h5" style="min-width: 200upx;margin-left: -500upx;">数量:{{ item.sheetQty }}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -500upx;">单位名称:{{ item.unitName }}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
	</view>
</template>

<script>
let scrollHeight = 0;
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
		var date = new Date();
		return {
			progNo: '', //页面ID
			old: {
				scrollTop: 0
			},
			tagId: {},
			scrollTop: 0,
			details: []
		};
	},
	onLoad(option) {
		this.progNo = option.progNo;
		console.log(this.progNo);
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
				url: 'sale-outDet?sheetLot=' + _self.details[e].sheetLot + '&progNo=' + _self.progNo
			});
		},
		scroll(e) {
			//滚动
			this.old.scrollTop = e.detail.scrollTop;
		},
		onScrollTop(index) {
			//滚动定位
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
		onScaned: function(e) {
			console.log(e);
			apis.sale_out_getList({
				data: {
					cuOrdNo: e
				},
				success: res => {
					console.log(JSON.stringify(res));
					this.details = res;
					util.showScanedAudio();
				},
				failure: message => {
					var mege = JSON.stringify(message);
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
		}
	}
};
</script>

<style></style>
