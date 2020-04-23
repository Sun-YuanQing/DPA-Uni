<!--生产入库 -->
<template>
	<view>
		<view id="viewHeader">
			<barcode-input ref="input_order" @onScaned="onScaned" :focus="true" placeholder="请扫描制造批号"></barcode-input>
		</view>
		<!-- 显示入库单明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item,index) in details" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)"
					 v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">单号:{{item.sheetNo}}</text>
								<text class="uni-title">入库单号:{{item.purLot}}</text>
								<text class="uni-title">入库日期:{{item.defineDate}}</text>
								<text class="uni-title">料号:{{item.partItemNo}}</text>
								<text class="uni-title">料品名称:{{item.partName}}</text>
								<text class="uni-title">数量:{{item.sheetQty}}</text>
								<text class="uni-title">仓库:{{item.whName}}</text>
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import barcodeInput from '../../components/barcode-input/barcode-input.vue' //扫码组件

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
			}
		},
		onLoad(option) {
			this.progNo = option.progNo ;
			console.log(this.progNo)
		},
		onReady() {
			util.getListHeight(this);
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
				uni.showLoading({
					mask: true
				});
				apis.acceptin_Storage_list({
					data: {
						purLot: e
					},
					success: (res) => {
						this.details = res;
						if(this.details.length>0){
							util.showScanedAudio();
						}else{
							uni.showToast({
								title: '单据不存在!',
								icon: "none"
							});
							util.showAudio();
							return;
						}
					},
					failure: (message) => {
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
				})
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
					url: '/pages/process/production-intoDet?sheetLot=' + _self.details[e].sheetLot
				})
			},
			scroll(e) { //滚动
				this.old.scrollTop = e.detail.scrollTop
			},
			onScrollTop(index) {
				//滚动定位
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
