<template>
	<view :style="{'z-index' : zIndex}">
		<view class="uni-mask" v-show="show" :style="{ top: offsetTop + 'px', 'z-index' : zIndex }" @click="hide" @touchmove.stop.prevent="moveHandle"></view>
		<view class="uni-popup" :class="['uni-popup-' + position, 'uni-popup-' + mode]" :style="{'z-index' : zIndex + 1}" v-show="show">
			{{ msg }}
			<slot></slot>
			<view v-if="position === 'middle' && mode === 'insert'" class=" uni-icon uni-icon-close" :class="{
					'uni-close-bottom': buttonMode === 'bottom',
					'uni-close-right': buttonMode === 'right'
				}"
			 @click="closeMask"></view>
		</view>
	</view>
</template>

<script>
	import util from '../../common/util.js';
	export default {
		name: 'uni-popup',
		props: {
			/**
			 * 页面显示
			 */
			show: {
				type: Boolean,
				default: false
			},
			/**
			 * 对齐方式
			 */
			position: {
				type: String,
				//top - 顶部， middle - 居中, bottom - 底部
				default: 'middle'
			},
			/**
			 * 显示模式
			 */
			mode: {
				type: String,
				default: 'insert'
			},
			/**
			 * 额外信息
			 */
			msg: {
				type: String,
				default: ''
			},
			/**
			 * h5遮罩是否到顶
			 */
			h5Top: {
				type: Boolean,
				default: false
			},
			buttonMode: {
				type: String,
				default: 'bottom'
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
				offsetTop: offsetTop,
				zIndex: util.getMaxZIndex()
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
			},
			show(newVal){
				if (newVal){ 
					this.zIndex = util.getMaxZIndex()
				}
			}
		}, 
		methods: {
			hide: function() {
				if (this.mode === 'insert' && this.position === 'middle') return;
				this.$emit('hidePopup');
			},
			closeMask() {
				if (this.mode === 'insert') {
					this.$emit('hidePopup');
				}
			},
			moveHandle() {}
		}
	};
</script>
<style>
	.uni-mask {
		position: fixed;
		z-index: 998;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background-color: rgba(0, 0, 0, 0.3);
	}

	.uni-popup {
		position: absolute;
		z-index: 999;
		background-color: #ffffff;
	}

	.uni-popup-middle {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 80%;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.uni-popup-middle.uni-popup-insert {
		min-width: 380upx;
		min-height: 380upx;
		max-width: 100%;
		max-height: 80%;
		transform: translate(-50%, -65%);
		background: none;
		box-shadow: none;
	}

	.uni-popup-middle.uni-popup-fixed {
		border-radius: 10upx;
		padding: 30upx;
	}

	.uni-close-bottom,
	.uni-close-right {
		position: absolute;
		bottom: -180upx;
		text-align: center;
		border-radius: 50%;
		color: #f5f5f5;
		font-size: 60upx;
		font-weight: bold;
		opacity: 0.8;
		z-index: -1;
	}

	.uni-close-right {
		right: -60upx;
		top: -80upx;
	}

	.uni-close-bottom:after {
		content: '';
		position: absolute;
		width: 0px;
		border: 1px #f5f5f5 solid;
		top: -200upx;
		bottom: 56upx;
		left: 50%;
		transform: translate(-50%, -0%);
		opacity: 0.8;
	}

	.uni-popup-top {
		top: 0;
		left: 0;
		width: 100%;
		height: 100upx;
		line-height: 100upx;
		text-align: center;
	}

	.uni-popup-bottom {
		left: 0;
		bottom: 0;
		width: 100%;
		min-height: 100upx;
		line-height: 100upx;
		text-align: center;
	}
</style>
