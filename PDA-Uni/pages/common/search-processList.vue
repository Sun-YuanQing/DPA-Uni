<!-- 工序不良现象查询 -->
<template>
	<view>
		<view id="viewHeader">
			<view class="input-view">
				<view class="uni-icon uni-icon-search"></view>
				<input confirm-type="search" v-model="keyword" @confirm="confirm" class="input" type="text" placeholder="输入搜索关键词" />
			</view>
		</view>
		<!-- 显示明细 -->
		<view class="uni-padding-wrap uni-common-mt">
			<view class="text" v-for="(item, index) in data" :key="index">
				<view class="uni-list-cell scroll-view-item" hover-class="uni-list-cell-hover" @click="onSelectedItem(index)" v-bind:class="item.selectItemClass">
					<view class="uni-triplex-row" @click="navigateBack(item)">
						<view class="uni-triplex-left">
							<text class="uni-title">名称:{{ item.custName1 }}</text>
						</view>
						<view class="uni-triplex-right">
							<text class="uni-h5" style="margin-left: -300px;">编码:{{ item.itemNo }}</text>
						</view>
					</view>
				</view>
			</view>
			<view class="uni-loadmore" v-if="showLoadMore">{{ loadMoreText }}</view>
		</view>
	</view>
</template>

<script>
import storage from '../../common/storage.js';
import apis from '../../common/apiService.js';
import consts from '../../common/consts.js';
import util from '../../common/util.js';
export default {
	components: {},
	data() {
		return {
			old: {
				scrollTop: 0
			},
			scrollTop: 0,
			scrollHeight: 0,
			offset: 1, //当前页
			keyword: '',
			limit: 10, //条数
			data: [],
			loadMoreText: '加载中...',
			showLoadMore: false,
			max: 0
		};
	},
	onLoad() {
		this.initData(); //调用第一页数据
	},
	//下拉
	onPullDownRefresh() {
		console.log('onReachBottom');
		this.keyword = ''; //清空搜索
		this.initData();
	},
	//上拉
	onReachBottom() {
		console.log('onReachBottom');
		this.offset += 1;
		this.setDate();
	},
	onReady() {
		//util.getListHeight(this);
	},
	//页面卸载
	onUnload() {
		(this.max = 0), (this.offset = 1), (this.keyword = ''), (this.data = []), (this.loadMoreText = '--加载更多--'), (this.showLoadMore = false);
	},
	methods: {
		initData() {
			this.offset = 1;
			this.max = 0;
			this.data = [];
			uni.showLoading({
				title: '加载中..',
				mask: true
			});
			apis.basic_ProcessList({
				data: {
					offset: this.offset - 1,
					limit: this.limit,
					keyword: this.keyword
				},
				success: res => {
					this.max = res.total;
					this.data = res.rows;
					//数据加载完了，判断还有没有加载更多
					if (this.max <= this.data.length) {
						//返回的条数和数据源的条数
						this.loadMoreText = '--没有更多数据了!['+this.data.length+'/'+this.max+']--';
						this.showLoadMore = true;
						return true;
					} else {
						this.loadMoreText = '--加载更多['+this.data.length+'/'+this.max+']--';
						this.showLoadMore = true;
					}
					uni.stopPullDownRefresh();
				},
				complete: (status, message, content) => {
					uni.hideLoading();
				}
			});
		},
		setDate() {
			uni.showLoading({
				title: '加载中..',
				mask: true
			});
			apis.basic_ProcessList({
				data: {
					offset: this.offset - 1,
					limit: this.limit,
					keyword: this.keyword
				},
				success: res => {
					this.max = res.total;
					this.data = this.data.concat(res.rows);
					//数据加载完了，判断还有没有加载更多
					if (this.max <= this.data.length) {
						//返回的条数和数据源的条数
						this.loadMoreText = '--没有更多数据了!['+this.data.length+'/'+this.max+']--';
						this.showLoadMore = true;
						return true;
					} else {
						this.loadMoreText = '--加载更多['+this.data.length+'/'+this.max+']--';
						this.showLoadMore = true;
					}
				},
				complete: (status, message, content) => {
					uni.hideLoading();
				}
			});
		},
		confirm() {
			console.log(this.keyword);
			this.initData();
		},
		navigateBack(e) {
			console.log('search_processList:' + JSON.stringify(e));

			storage.set(consts.storageKeys.navBackData_searchProcess, e);
			uni.navigateBack();
		},
		/* 选中的方法 */
		onSelectedItem(e) {
			for (var i = 0; i < this.data.length; i++) {
				var item = this.data[i];
				if (i == e) {
					item.selectItemClass = 'uni-list-cell-selected';
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

<style>
#viewHeader {
	width: 100%;
	position: fixed;
	top: 0px;
	z-index: 5;
	float: left;
	background: #bdcede;
}
.uni-padding-wrap {
	margin-top: 35px;
}
.input-view {
	width: 92%;
	display: flex;
	background-color: #f0f0f0;
	height: 30px;
	border-radius: 15px;
	padding: 0 4%;
	flex-wrap: 1;
	margin: 7px 0;
	line-height: 30px;
	justify-content: center;
}

.input-view .uni-icon {
	line-height: 30px !important;
}

.input-view .input {
	height: 30px;
	line-height: 30px;
	width: 94%;
	padding: 0 3%;
}
</style>
