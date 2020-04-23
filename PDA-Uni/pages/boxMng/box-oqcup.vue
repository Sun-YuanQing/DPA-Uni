<!-- OQC检验装箱列表 -->
<template>
	<view>
		<view id="viewHeader"><barcode-input ref="input_order" @onScaned="onScaned" :focus="true" placeholder="请扫描出货通知单号"></barcode-input></view>
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item, index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)" v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">单号批号:{{ item.sheetLot }}</text>
								<text class="uni-title">料品编码:{{ item.partItemNo }}</text>
								<text class="uni-title">料品名称:{{ item.partName }}</text>
							</view>
							<view class="uni-triplex-right" style="min-width: 220upx;">
								<text class="uni-h5">单位:{{ item.unitName }}</text>
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
			old: {
				scrollTop: 0
			},
			scrollTop: 0,
			scrollHeight: 0,
			details: []
		};
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
		...mapMutations(['pageIO_false','setUrldata']),
		onScaned(e) {
			//料品信息标签扫描完成
			uni.showLoading({
				mask: true
			});
			apis.boxoqc_getList({
				data: {
					sheetNo: e
				},
				success: res => {
					if (!util.validOrderMonth(res)) {
						return;
					}
					console.log(util.outputLog(res));
					this.details = res.details;
					util.showScanedAudio();
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
		/* 选中的方法 */
		onSelectedItem(e) {
			for (var i = 0; i < this.details.length; i++) {
				var item = this.details[i];
				item.m_isSelected = false;
			} 
			var _self = this;
			if (!util.validOrderMonth(_self.details[e])) {
				return;
			}
			_self.details[e].m_isSelected = true;
			this.setUrldata(_self.details[e]);
			uni.navigateTo({
				url: 'box-oqcupDet'
			});
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
					if (data == null) return;
					this.scrollTop = data.height * index;
				});
			}).exec();
		}
	}
};
</script>

<style></style>
