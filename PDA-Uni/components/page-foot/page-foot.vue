<!-- 页面底部 -->
<template>
	<view class="pagefoot" v-bind:style="{ position: footerStyle}">
		<slot></slot>
	</view>
</template>

<script>
	let footHeight = 0;
	export default {
		name: "page-foot",
		data() {
			return {
				footerStyle: 'fixed'
			}
		},
		props: {},
		onReady() {},
		methods: {
			getContentHeight(options) {
				let _self = this;
				if (this.footHeight > 0) {
					options.success.call(options.scope || _self, this.footHeight);
				} else {
					var query = uni.createSelectorQuery().in(this);
					query.select('.pagefoot').boundingClientRect();
					query.exec(function(res) {
						_self.footHeight = res[0].height;
						options.success.call(options.scope || _self, res[0].height);
					});
				}
			},
			setPosition() {
				if (this.footerStyle != 'static')
					this.footerStyle = 'static';
			}
		}
	}
</script>

<style>
	.pagefoot {
		position: fixed;
		border-top: 1px solid #ccc;
		padding: 5px;
		min-height: 90upx;
		width: 97%;
		left: 0;
		bottom: 0;
		overflow: hidden;
	}
</style>
