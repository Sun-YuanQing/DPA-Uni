<!-- 其它入库（注：erp有此菜单） 手动选择其中一条-->
<template>
	<view>
		<view id="viewHeader">
			<!-- 头表信息 -->
			<barcode-input ref="input_order" @onScaned="onOrderScaned" focus="true" placeholder="扫描入库单号"></barcode-input>
			<barcode-input ref="input_part" @onScaned="onPartScaned" placeholder="扫描料号"></barcode-input>
		</view>
		<!-- 显示入库单明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(order, i) in order_list" :key="i">
					<view class="uni-list-cell scroll-view-item" v-for="(item, index) in order.details" :key="index" hover-class="uni-list-cell-hover"
					 @click="onSelectedItem(i)" v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">单号:{{ item.sheetNo }}</text>
								<text class="uni-title">单据时间:{{ item.sheetDate }}</text>
								<text class="uni-title">料号:{{ item.partItemNo }}</text>
								<text class="uni-title">料品名称:{{ item.partName }}</text>
								<text class="uni-title">仓库:{{ item.whName }}{{'('+item.whNo+')'}}</text>
							</view>
							<view class="uni-triplex-right">
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">单位:{{ item.unitName }}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">数量:{{ item.sheetQty }}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">入库批次:{{ item.inLot ?item.inLot:''}}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">批号:{{ item.sheetLot }}</text>
								
							</view>
						</view>
					</view>
				</block>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex';
	import barcodeInput from '../../components/barcode-input/barcode-input.vue'; //扫码组件

	import apis from '../../common/apiService.js'; //系统api
	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import util from '../../common/util.js'; //常用功能

	export default {
		components: {
			barcodeInput
		},
		data() {
			return {
				progNo: '',
				old: {
					scrollTop: 0
				},
				scrollTop: 0,
				scrollHeight: 0,
				orderItemSelected: {},
				sheetNo: '', //方便传参
				partItemNo: '', //方便传参
				order_list: []
			};
		},
		onLoad(option) {
			this.progNo = option.progNo;
			this.init(true);
		},
		onReady() {
			util.getListHeight(this);
		},
		onBackPress(options) {
			return util.backPress(options, this.order_list.length > 0);
		},

		onShow() {
			if (this.pageIO_submit) {
				for (var i = 0, len = this.order_list.length; i < len; i++) {
					if (this.order_list[i].m_isSelected) {
						this.order_list.splice(i, 1);
					}
				}
				this.pageIO_false(); /* 恢复到没有从子页的跳转标识*/
			}
		},
		computed: mapState(['pageIO_submit']),
		methods: {
			...mapMutations(['pageIO_false', 'setUrldata']),
			init(isinit) {
				var _self = this;
				var m_isinit = isinit;
				uni.showLoading({
					mask: true
				});
				apis.Pda_scmotherinbysheetnopartno({
					data: {
						sheetNo: _self.sheetNo,
						partItemNo: _self.partItemNo
					},
					success: res => {
						if (res.length > 0) {
							this.order_list = res;
							if (!m_isinit) {
								util.showScanedAudio();
							}
							this.$refs.input_part.setFocus();
						} else {
							uni.showToast({
								title: '未找到相关信息！！!',
								icon: 'none'
							});
							util.showAudio();
							this.$refs.input_order.setFocus();
						}
					},
					complete: (status, message, content) => {
						util.tryCatchApi({
							status: status,
							message: message
						});
						uni.hideLoading();
					}
				});
			},
			onOrderScaned(e) {
				var _self = this;
				this.sheetNo = e;
				_self.init(false);
				_self.$refs.input_part.setFocus();
			},
			onPartScaned(e) {
				var _self = this;
				uni.showLoading({
					mask: true
				});
				apis.boxfqc_QRCodeAnalysis({
					data: {
						qrCode: e,
						enumBarCode: 2
					},
					success: res => {
						_self.partItemNo = res.partItemNo;
						_self.init(false);
					},
					complete: (status, message, content) => {
						_self.$refs.input_part.setFocus();
						util.tryCatchApi({
							status: status,
							message: message
						});
						uni.hideLoading();
					}
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
						this.scrollTop = data.height * index;
					});
				}).exec();
			},
			updateScanList() {
				//更新列表结果
				var scanQty = 0;
				for (var i = 0; i < this.orderItemSelected.tagDetails.length; i++) {
					scanQty = util.floatObj.add(scanQty, this.orderItemSelected.tagDetails[i].model.sheetQty);
				}
				this.orderItemSelected.scanQty = scanQty;
				this.orderItemSelected.lastScanQty = util.floatObj.subtract(this.orderItemSelected.sheetQty, scanQty);
			},
			/* 选中的方法 */
			onSelectedItem(e) {
				for (var i = 0; i < this.order_list.length; i++) {
					var order = this.order_list[i];
					order.m_isSelected = false;
				}
				var _self = this;
				if (!util.validOrderMonth(_self.order_list[e])) {
					return;
				}
				_self.order_list[e].m_isSelected = true;
				console.log(e) 
				this.setUrldata(_self.order_list[e]);
				uni.navigateTo({
					url: 'otherIO-intoDet?progNo=' + _self.progNo
				});
			}
		}
	};
</script>

<style></style>
