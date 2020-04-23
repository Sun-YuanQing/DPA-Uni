<!-- 仿微信右上角菜单 -->
<template>
	<view class="index-menus-view" v-show="show">
		<view class="uni-mask" :style="{ top: offsetTop + 'px' }" @tap="hide"></view>
		<view class="uni-list" :style="{ top: offsetTop + 'px' }">
			<block v-for="(item,index) in menus" :key="index">
				<view class="uni-list-cell" hover-class="uni-list-cell-hover">
					<view class="uni-triplex-row" @click="onSave(index)">
						<view class="flex-item">
							<uni-icon size="20" :type="item.icon"></uni-icon> 
						</view>
						<view class="flex-item">{{item.name}}</view>
						<!-- <view class="uni-triplex-left">
		                    <text class="uni-title">{{item.name}}</text> 
		                </view> -->
					</view>
				</view>
			</block>
		</view>
	</view>
</template>

<script>
	import uniIcon from '../uni-icon/uni-icon.vue'
	export default {
		name: 'uni-popup-modal',
		components: {
			uniIcon
		},
		props: {
			/**
			 * 页面显示
			 */
			show: {
				type: Boolean,
				default: false
			},
			menus: {
				type: Array,
				default () {
					return []
				}
			}, //菜单
			/**
			 * h5遮罩是否到顶
			 */
			h5Top: {
				type: Boolean,
				default: false
			}
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
				offsetTop: offsetTop
			};
		},
		watch: {
			h5Top(newVal) {
				console.log(newVal);
				if (newVal) {
					this.offsetTop = 44;
				} else {
					this.offsetTop = 0;
				}
			}
		},
		computed: {},
		methods: {
			hide: function() { 
				this.$emit('hide');
			},
			moveHandle() {},
			onSave(index) {
				this.$emit('click', index); 
			}
		}
	};
</script>
<style>
	.index-menus-view {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 999;
		display: block;
		box-sizing: border-box;
	}

	.index-menus-view .uni-mask {
		position: fixed;
		z-index: 998;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background-color: rgba(0, 0, 0, 0);
	}

	.index-menus-view .uni-list { 
		position: absolute;
		z-index: 999;
		width: auto;
		right: 0; 
		background-color: #fff;
		border-radius: 3px;
		border: 1upx solid #c8c7cc;
		box-shadow: 1upx 2upx 4upx rgba(0, 0, 0, .3);
		overflow: hidden;
		text-align: center;
	}
	.flex-item {  
		text-align: center; 
		margin-left: 5px;
	}
</style>
