<!-- 捕获的错误日志 -->
<template>
	<view>
		<view id="viewHeader">
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">
					UUID:
				</view>
				<view class="uni-list-cell-db">
					{{uuid}}
				</view>
			</view>
		</view>
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in details" :key="index">
					<uni-card :title="item.title" :note="item.createTime" style='margin-bottom: 5upx;'>
						{{item.message}}
					</uni-card>
				</block>
			</view>
		</scroll-view>
		<!-- 底部按钮模块 -->
		<page-foot ref="viewBtm">
			<button type="primary" @click="onSave">清空</button>
		</page-foot>
	</view>
</template>

<script>
	import uniCard from '@/components/uni-card/uni-card.vue'

	import apis from '../../common/apiService.js'; //系统api
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js'; //常用功能

	export default {
		components: {
			uniCard
		},
		data() {
			return {
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				details: [],
				uuid: ''
			}
		},
		onLoad() {
			// #ifdef APP-PLUS
			this.uuid = plus.device.uuid;
			// #endif
			var arr = storage.get('errlog');
			this.details = arr.reverse();
		},
		onReady() {
			util.getListHeight(this);
		},
		methods: {
			onSave() {
				//上传
				storage.set('errlog', [])
				this.details = [];
			},
			scroll(e) { //滚动
				this.old.scrollTop = e.detail.scrollTop;
			},
			onScrollTop(index) {
				//滚动定位
				this.onSelectedItem(index);
				let view = uni.createSelectorQuery().in(this).select(".scroll-view-item");
				view.boundingClientRect(data => {
					this.scrollTop = this.old.scrollTop
					this.$nextTick(function() {
						if (data == null) return;
						this.scrollTop = data.height * index;
					});
				}).exec();
			}
		}
	}
</script>

<style>
</style>
