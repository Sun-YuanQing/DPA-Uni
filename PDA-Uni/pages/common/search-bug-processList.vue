<!-- 工序查询 -->
<template>
	<view>
		<view class="input-view">
			<view class="uni-icon uni-icon-search"></view>
			<input confirm-type="search" v-model="keyword" @confirm="confirm" class="input" type="text" placeholder="输入搜索关键词" />
		</view>
		<view class="uni-padding-wrap uni-common-mt">
			<view class="text" v-for="item in data">
				<view class="uni-list-cell input-row" @click="navigateBack(item)">
					<view class="uni-list-cell-left">
						{{item.bugName}}
					</view>
				</view>

			</view>
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
				proNo:'',
				bugName:'',
				bugNo:'',
				data: []
 
			}
		},
		onLoad(e) {
		    this.proNo=e;
			this.initData(); //调用第一页数据
		},
		//页面卸载
		onUnload() {
			//storage.set(consts.storageKeys.navBackData_searchProcess, null);
		},
		methods: {
			initData() {
				var _sefl=this;
				uni.showLoading({
					title: '加载中..',
					mask: true
				});
				apis.basic_bug_ProcessList({
					data: {
						proNo:this.proNo
					},
					success: (res) => {
						console.log(JSON.stringify(res));
						_sefl.data=res;
					},
					complete: (status, message, content) => {
						util.tryCatchApi({
							status: status,
							message: message
						});
						uni.hideLoading();
					}
				})
			},
			navigateBack(e) {
				console.log('search_processList:' + JSON.stringify(e));
				storage.set(consts.storageKeys.navBackData_bug_Process, e);
				uni.navigateBack();
			}
		}
	}
</script>

<style>
	.input-view {
		width: 92%;
		display: flex;
		background-color: #e7e7e7;
		height: 30px;
		border-radius: 15px;
		padding: 0 4%;
		flex-wrap: nowrap;
		margin: 7px 0;
		line-height: 30px;
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
