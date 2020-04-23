<!-- 调拨 -->
<template>
	<view>
		<view id="viewHeader"><barcode-input ref="input_part" @onScaned="onPartScaned" :focus="true" placeholder="请扫描料号"></barcode-input></view>
		<!-- 显示入库单明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item, index) in order" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)" v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row" @click="head_click(index)">
							<view class="uni-triplex-left">
								<text class="uni-title">调拨单号:{{ item.sheetNo }}</text>
								<text class="uni-title">单据日期:{{ item.sheetDate }}</text>
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
			order: [],
			orderItemSelected: {} //当前选中项
		};
	},
	onLoad(option) {
		this.progNo = option.progNo || 'OPDA00017';
		console.log(this.progNo);
	},
	onReady() {
		util.getListHeight(this);
		this.init('');
	},
	onShow() {
		if (this.pageIO_submit) {
			for (var i = 0, len = this.order.length; i < len; i++) {
				if (this.order[i].m_isSelected) {
					this.order.splice(i, 1);
				}
			}
			this.pageIO_false(); /* 恢复到没有从子页的跳转标识 */
		}
	},
	computed: mapState(['pageIO_submit']),
	methods: {
		...mapMutations(['pageIO_false']),
		init(e) {
			uni.showLoading({
				mask: true
			});
			console.log(e);
			apis.scmdb_getDetails_qrCode({
				data: {
					qrCode: e
				},
				success: res => {
					this.order = res;
					this.$refs.input_part.setFocus();
					util.showScanedAudio();
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
					this.$refs.input_part.setFocus();
				}
			});
		},
		onPartScaned(e) {
			this.init(e);
		},
		head_click(e) {
			for (var i = 0; i < this.order.length; i++) {
				var order = this.order[i];
				order.m_isSelected = false;
			}
			var _self = this;
			if (!util.validOrderMonth(_self.order[e])) {
				return;
			}
			_self.order[e].m_isSelected = true;
			uni.navigateTo({
				url: 'purchase-allotDet?order=' + JSON.stringify(_self.order[e])
			});
		},
		/* 选中的方法 */
		onSelectedItem(e) {
			for (var i = 0; i < this.order.length; i++) {
				var item = this.order[i];
				if (i == e) {
					item.selectItemClass = 'uni-list-cell-selected';
					this.orderItemSelected = item;
				} else {
					item.selectItemClass = '';
				}
			}
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
		}
	}
};
</script>

<style></style>
