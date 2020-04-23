<!-- 端口配置页面 -->
<template>
	<view>
		<view class="uni-title uni-common-pl">请输入服务器地址</view>
		<view class="uni-textarea">
			<textarea focus placeholder="请输入服务器地址" v-model="url" />
			</view>
		<view style="color: #cccccc; margin-left: 20upx; margin-top: 20upx;">示例: http://192.168.0.226:8888</view>
		<view class="btn-row">
			<button type="primary" class="primary" @tap="save">保存</button>
		</view>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex'; 
	import storage from '../../common/storage.js';
	import consts from '../../common/consts.js';
	import util from '../../common/util.js';
	
	export default {
		data() {
			return { 
				url: ''
			}
		},
		onLoad() {
			var serverUrl = storage.get(consts.storageKeys.serverPrefixUrl); 
			if (!serverUrl){
				//192.168.73.162:8003  安费诺
				// http://192.168.0.12:8003     /api/ //金大智能
				// http://192.168.1.18:8003     /api/ //索源 
				//'http://192.168.0.226:8888'; 
				//'http://opensoft.vicp.net:8888';
				//192.168.0.160:8888
				this.url = 'http://192.168.0.226:8888'; 
			}else{
				this.url = serverUrl;
			}
		},
		methods: {
			save: function (e) {
				if (!this.url.trim()){
					uni.showToast({
						title:'请输入服务器地址', 
						icon: 'none'
					});
					return;
				} 
				storage.set(consts.storageKeys.serverPrefixUrl, this.url); 
				//判断是否已 / 结尾
				if (this.url.substring(this.url.length-1, this.url.length) != '/')
				{
					this.url += '/';
				}
				var fullUrl = this.url + 'api/'; 
				storage.set(consts.storageKeys.serverUrl, fullUrl);  
				uni.reLaunch({
					url: '/pages/login/login'
				});
			}
		}
	}
</script>

<style>
	.btn-row {
		margin-top: 30upx;
		padding: 20upx;
	}
</style>
