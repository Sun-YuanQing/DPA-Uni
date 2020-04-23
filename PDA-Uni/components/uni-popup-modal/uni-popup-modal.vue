<template>
	<view class="uni-modal-view" v-show="curShow" :style="{'z-index' : zIndex}">
		<view class="uni-mask" :style="{ top: offsetTop + 'px', 'z-index' : zIndex }" @touchmove.stop.prevent="moveHandle"></view>
		<view class="uni-modal" :style="{'z-index' : zIndex + 1}">
			<view class="uni-modal__hd" v-if="showTitile"><strong class="uni-modal__title">{{title}}</strong></view>
			<view class="uni-modal__bd">
				<slot></slot>
			</view>
			<view class="uni-modal__ft" v-if="showBtmBtn">
				<view class="uni-modal__btn uni-modal__btn_default" v-if="showCancel" style="color: rgb(0, 0, 0);" @click="hide">取消</view>
				<view class="uni-modal__btn uni-modal__btn_primary" style="color: rgb(0, 122, 255);" @tap="onSave">确定</view>
			</view>
		</view>
	</view>
</template>

<script>
	import util from '../../common/util.js';
	export default {
		name: 'uni-popup-modal',
		props: {
			/**
			 * 页面显示
			 */
			show: {
				type: Boolean,
				default: false
			},
			/**
			 * 额外信息
			 */
			title: {
				type: String,
				default: ''
			},
			showCancel: {
				type: Boolean,
				default: true
			},
			/**
			 * @description 是否显示底部按钮
			 */
			showBtmBtn:{
				type: Boolean,
				default: true
			},
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
				offsetTop: offsetTop,
				curShow: false,
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
			show: {
				immediate: true,
				handler: function(newVal) {
					this.curShow = newVal
					if(newVal)
						this.zIndex = util.getMaxZIndex()
				}
			} 
		},
		computed: {
			showTitile() {
				return this.title.length > 0
			}
		},
		methods: {
			hide: function() {
				this.curShow = false;
				this.$emit('hidePopup');
			},
			closeMask() {
				this.$emit('hidePopup');
			},
			moveHandle() {},
			onSave() {
				this.$emit('save'); 
			}
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

	.uni-modal-view {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 999;
		display: block;
		box-sizing: border-box;
	}

	.uni-modal-view .uni-modal {
		position: absolute; 
		z-index: 999;
		width: 90%;
		/* max-width: 300px; */
		top: 50%;
		left: 50%;
		-webkit-transform: translate(-50%, -50%);
		transform: translate(-50%, -50%);
		background-color: #fff;
		border-radius: 3px;
		overflow: hidden;
		text-align: center;
	}

	.uni-modal-view .uni-modal * {
		box-sizing: border-box
	}

	.uni-modal-view .uni-modal__hd {
		padding: 1em .8em .3em;
		border-bottom: 1px solid #d5d5d6;
	}

	.uni-modal-view .uni-modal__title {
		font-weight: 400;
		font-size: 18px;
		word-wrap: break-word;
		word-break: break-all;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.uni-modal-view .uni-modal__bd {
		padding: 1.3em;
		padding-left: 0.3em;
		min-height: 40px;
		font-size: 15px;
		line-height: 1.4;
		word-wrap: break-word;
		word-break: break-all;
		/* color: #999; 
		max-height: 400px;*/
		overflow-y: auto;
		text-align: left;
	}

	.uni-modal-view .uni-modal__ft {
		position: relative;
		line-height: 48px;
		height: 48px;
		display: -webkit-box;
		display: -webkit-flex;
		display: flex;
	}

	.uni-modal-view .uni-modal__ft:after {
		content: " ";
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		height: 1px;
		border-top: 1px solid #d5d5d6;
		color: #d5d5d6;
		-webkit-transform-origin: 0 0;
		transform-origin: 0 0;
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5)
	}

	.uni-modal-view .uni-modal__btn {
		display: block;
		-webkit-box-flex: 1;
		-webkit-flex: 1;
		flex: 1;
		color: #3cc51f;
		text-decoration: none;
		-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
		position: relative;
		padding-top: 2%;
		font-size: 18px !important;
		-webkit-box-orient: vertical;
	}

	.uni-modal-view .uni-modal__btn:active {
		background-color: #eee
	}

	.uni-modal-view .uni-modal__btn:after {
		content: " ";
		position: absolute;
		left: 0;
		top: 0;
		width: 1px;
		bottom: 0;
		border-left: 1px solid #d5d5d6;
		color: #d5d5d6;
		-webkit-transform-origin: 0 0;
		transform-origin: 0 0;
		-webkit-transform: scaleX(.5);
		transform: scaleX(.5);
	}

	.uni-modal-view .uni-modal__btn:first-child:after {
		display: none
	}

	.uni-modal-view .uni-modal__btn_default {
		color: #353535
	}

	.uni-modal-view .uni-modal__btn_primary {
		color: #007aff
	}
</style>
