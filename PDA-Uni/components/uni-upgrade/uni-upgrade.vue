<!-- 升级页面 -->
<template>
	<view class="uni-upgrade-view" v-show="show">
		<view class="uni-mask" :style="{ top: offsetTop + 'px' }" @touchmove.stop.prevent="moveHandle"></view>
		<view class="uni-modal">
			<view class="uni-modal__hd">
				<image style="width: 50px; height: 50px;" src="../../static/imgs/auto_updater.png"></image>
			</view>
			<view class="uni-modal__bd">
				<scroll-view scroll-y="true" style="max-height: 200px;" scroll-with-animation="true">
					<text style="font-size: 14px;color:#2f2f2f; text-align: left;">{{releaseNotes}}</text>
				</scroll-view>
				<progress :percent="progressPercent" show-info stroke-width="3" />
			</view>
			<view class="uni-modal__ft">
				<view class="uni-modal__btn uni-modal__btn_primary" v-bind:style="{ color: confirmColor, fontSize: '20px' }" @tap="onSave">{{confirmText}}</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'uni-upgrade',
		props: {
			show: {
				type: Boolean,
				default: false
			},
			releaseNotes: {
				type: String,
				default: '系统升级'
			},
			packageUrl: {
				type: String,
				default: ''
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
				confirmText: "升级",
				confirmColor: "#ff6666",
				progressPercent: 0
			}
		},
		watch: {
			h5Top(newVal) {
				// console.log(newVal);
				if (newVal) {
					this.offsetTop = 44;
				} else {
					this.offsetTop = 0;
				}
			}
		},
		methods: {
			moveHandle() {},
			onSave(e) {
				if (this.confirmText == "正在下载...") {
					return;
				}
				this.confirmText = "正在下载..."
				const downloadTask = uni.downloadFile({
					url: this.packageUrl,
					success: function(a) {
						if (200 === a.statusCode) {
							var b = a.tempFilePath;
							uni.saveFile({
								tempFilePath: b,
								success: function(a) {
									/* plus.runtime.install(a.savedFilePath, {
										force: !0
									}); */
									plus.runtime.install(a.savedFilePath, {
										force: !0
									}, function(wgtinfo) {
										this.show = false;
										plus.runtime.restart();
									}, function(error) {
										this.show = false;
										console.log(JSON.stringify(error));
										uni.showToast({
											title: error.message,
											icon: 'none'
										})
										setTimeout(function() {
											plus.runtime.restart();
										}, 1000);
									});
								}
							})
						}
					}
				});
				downloadTask.onProgressUpdate((res) => {
					// console.log(JSON.stringify(res))
					this.progressPercent = res.progress;
				});
			},
		}
	}
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

	.uni-upgrade-view {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 999;
		display: block;
		box-sizing: border-box;
	}

	.uni-upgrade-view .uni-modal {
		position: absolute;
		z-index: 999;
		width: 90%;
		max-width: 300px;
		top: 50%;
		left: 50%;
		-webkit-transform: translate(-50%, -50%);
		transform: translate(-50%, -50%);
		background-color: #fff;
		border-radius: 3px;
		overflow: hidden;
		text-align: center;
	}

	.uni-upgrade-view .uni-modal * {
		box-sizing: border-box
	}

	.uni-upgrade-view .uni-modal__hd {
		padding: 1em .8em .3em;
		border-bottom: 1px solid #d5d5d6;
	}

	.uni-upgrade-view .uni-modal__title {
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

	.uni-upgrade-view .uni-modal__bd {
		padding: 1em 1.3em;
		min-height: 40px;
		font-size: 15px;
		line-height: 1.4;
		word-wrap: break-word;
		word-break: break-all;
		color: #999;
		max-height: 400px;
		overflow-y: auto;
		text-align: left;
	}

	.uni-upgrade-view .uni-modal__ft {
		position: relative;
		line-height: 48px;
		height: 48px;
		display: -webkit-box;
		display: -webkit-flex;
		display: flex;
	}

	.uni-upgrade-view .uni-modal__ft:after {
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

	.uni-upgrade-view .uni-modal__btn {
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

	.uni-upgrade-view .uni-modal__btn:active {
		background-color: #eee
	}

	.uni-upgrade-view .uni-modal__btn:after {
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

	.uni-upgrade-view .uni-modal__btn:first-child:after {
		display: none
	}

	.uni-upgrade-view .uni-modal__btn_default {
		color: #353535
	}

	.uni-upgrade-view .uni-modal__btn_primary {
		color: #007aff
	}
</style>
