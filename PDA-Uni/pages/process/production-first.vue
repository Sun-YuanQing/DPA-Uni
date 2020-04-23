<!-- 首件确认 用了vuex代替url传值（它类似于设备本地sql存储，解决url传值的缺陷）[setUrldata]，也通过它做子页面返回删除主页其中的列表[pageIO_submit]-->
<template>
	<view>
		<view id="viewHeader">
			<!-- 头表信息 -->
			<barcode-input ref="input_order" @onScaned="onOrderScaned" :focus="true" :clearScan="true" placeholder="请扫描工单号"></barcode-input>
			<view class="uni-list-cell input-row">
				<view class="uni-list-cell-left">单号:</view>
				<view class="uni-list-cell-db">{{ order_moLot }}</view>
			</view>
		</view>
		<!-- 显示入库单明显 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" v-bind:style="{ height: scrollHeight }" @scroll="scroll">
			<view class="uni-list">
				<block v-for="(item, index) in orderlist" :key="index">
					<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)" v-bind:class="item.selectItemClass">
						<view class="uni-triplex-row">
							<view class="uni-triplex-left">
								<text class="uni-title">料号:{{ item.partItemNo }}</text>
								<text class="uni-title">料品名称:{{ item.partName }}</text>
								<text class="uni-title">数量: {{ item.sheetQty }}</text>
							</view>
							<view class="uni-triplex-right" style="min-width: 220upx;">
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">设备:{{ item.deviceNo }}</text>
								<text class="uni-h5" style="min-width: 200upx;margin-left: -300upx;">工序:{{ item.proItemNo }}</text>
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
			order_moLot: '',
			scrollTop: 0,
			scrollHeight: 0,
			orderlist: []
		};
	},
	onLoad(option) {},
	onReady() {
		util.getListHeight(this);
	},
	onBackPress(options) {
		return util.backPress(options, this.orderlist.length > 0);
	},
	onShow() {
		/* 子页完成单据返回的动作：pageIO_submit它要删除列表的其中一个单，但它需要列表中已经定义true的变量,变量在跳转子页的地方赋值的(找一下)*/
		if (this.pageIO_submit) {
			for (var i = 0, len = this.orderlist.length; i < len; i++) {
				/* 找到列表中要删除的单 */
				if (this.orderlist[i].m_isSelected) {
					/* 删除 */
					this.orderlist.splice(i, 1);
				}
			}
			/* 恢复到没有从子页的跳转标识 */
			this.pageIO_false();
		}
	},
	/* computed:mapState(['pageIO_submit']),这句话理解为 pageIO_submit是在Data中的,可以this,它就是一个变量*/
	computed: mapState(['pageIO_submit']),
	methods: {
		/* 一个是改变没有从子页的跳转标识方法（改变pageIO_submit的值）.另一个是代替url传值方法 ,它两就是改变vuex中变量值的方法*/
		...mapMutations(['pageIO_false', 'setUrldata']),
		onOrderScaned(e) {
			uni.showLoading({
				mask: true
			});
			this.order_moLot = e;
			apis.OpenMes_mesdaylistbyspccheck({
				data: {
					moLot: e,
					proItemNo: '',
					deviceNo: ''
				},
				success: res => {
					this.orderlist = res;
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
				}
			});
		},
		/* 选中的方法 */
		onSelectedItem(e) {
			for (var i = 0; i < this.orderlist.length; i++) {
				var item = this.orderlist[i];
				item.m_isSelected = false;  //1.先清空
				if (i == e) {
					item.selectItemClass = 'uni-list-cell-selected';
					item.m_isSelected = true;  //2.再标识
					this.orderItemSelected = item;
				} else {
					item.selectItemClass = '';
				}
			}

			var _self = this;
			//不用判断首件跨越
			/* if(!util.validOrderMonth(_self.details[e])){ 	
			return;		
			} */
			this.setUrldata(this.orderItemSelected);
			uni.navigateTo({
				url: '/pages/process/production-firstDet'
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
				if (data == null) return;
				this.$nextTick(function() {
					this.scrollTop = data.height * index;
				});
			}).exec();
		}
	}
};
</script>

<style></style>
