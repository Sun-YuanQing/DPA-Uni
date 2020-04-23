<!-- 登录 -->

<template>
	<view>
		<view id="viewHeader">
			<view class="input-group">
				<view class="uni-list-cell">
					<view class="uni-list-cell-left">帐套：</view>
					<view class="uni-list-cell-db input-row">
						<picker @change="bindPickerChange" :value="accIndex" :range="accList">
							<view class="uni-input">{{ accList[accIndex] }}</view>
						</picker>
					</view>
				</view>
				<view class="uni-list-cell">
					<view class="uni-list-cell-left">账号：</view>
					<view class="uni-list-cell-db input-row"><input class="uni-input" type="text" v-model="userID" :focus="user_focus" placeholder="请输入账号" /></view>
				</view>
				<view class="uni-list-cell">
					<view class="uni-list-cell-left">密码：</view>
					<view class="uni-list-cell-db input-row"><input class="uni-input" type="password" v-model="userPass" placeholder="请输入密码" /></view>
				</view>
				<view class="uni-list-cell">
					<view class="uni-list-cell-left">自动登录</view>
					<view class="uni-list-cell-pd"><switch :checked="autologin" @change="autoLoginChange" /></view>
				</view>
			</view>
		</view>
		<view v-bind:style="{ height: scrollHeight }" class="">
			<view class="btn-row"><button type="primary" @tap="bindLogin">登录</button></view>
		</view>
		<view id="viewBtm" class="uni-center " style="position:fixed; bottom: 10upx; text-align: center;width: 100%;" v-bind:style="{ position: copyRightPosition }">
			<view>Version: {{ appVer }}</view>
			<view>©深圳市傲鹏伟业软件科技有限公司版权所有</view>
		</view>
		<uni-upgrade :show="isUpgrade" :packageUrl="packageUrl"></uni-upgrade>
	</view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import uniUpgrade from '../../components/uni-upgrade/uni-upgrade.vue';
import consts from '../../common/consts.js';
import storage from '../../common/storage.js';
import apis from '../../common/apiService.js';
import util from '../../common/util.js';

export default {
	components: {
		uniUpgrade
	},
	data() {
		return {
			userID: '',
			userPass: '',
			autologin: true,
			accIndex: null,
			accList: [],
			isUpgrade: false,
			packageUrl: '',
			sessionLost: false, //会话丢失
			appVer: '',
			user_focus: false,
			copyRightPosition: 'fixed',
			scrollHeight: 0
		};
	},
	onNavigationBarButtonTap(e) {
		uni.navigateTo({
			url: '/pages/appconfig/appconfig'
		});
	},
	onLoad(option) {
		this.sessionLost = option.sessionLost || false;
		// this.copyRightPosition = 'static'
	},
	onReady(e) {
		let _self = this;
		let headerHeight = 0,
			btmHeight = 0;
		let view = uni
			.createSelectorQuery()
			.in(this)
			.select('#viewHeader');
		view.boundingClientRect(data => {
			if (data == null) return;
			headerHeight = data.height;
		}).exec();
		view = uni
			.createSelectorQuery()
			.in(this)
			.select('#viewBtm');
		view.boundingClientRect(data => {
			if (data == null) return;
			btmHeight = data.height;
		}).exec(function() {
			uni.getSystemInfo({
				success: res => {
					var tmpHeight = res.windowHeight - headerHeight - btmHeight - 40;

					_self.scrollHeight = tmpHeight + 'px';
					_self.copyRightPosition = 'static';
					// console.log(headerHeight + ' | ' + btmHeight+ ' | ' + tmpHeight);
				}
			});
		});

		var serverPrefixUrl = storage.get(consts.storageKeys.serverPrefixUrl);
		var serverUrl = storage.get(consts.storageKeys.serverUrl);

		if (!serverPrefixUrl) {
			uni.showToast({
				title: '请先配置服务器地址',
				icon: 'none'
			});
			uni.navigateTo({
				url: '/pages/appconfig/appconfig'
			});
			return;
		}
		// #ifdef APP-PLUS
		// 判断升级
		plus.runtime.getProperty(plus.runtime.appid, function(inf) {
			uni.showLoading();
			_self.appVer = inf.version;
			apis.upgrade({
				data: {
					ver: inf.version,
					custVer: ''
				},
				retry: 3, //重试
				success: res => {
					if (res == 1) {
						_self.packageUrl = serverUrl + 'pda/upgrade/download?ver=' + inf.version;
						//检查是否升级
						_self.isUpgrade = true;
					} else {
						_self.getdbmap();
						_self.user_focus = true;
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
		});
		// #endif
	},
	methods: {
		...mapMutations(['login']),
		getdbmap() {
			uni.showLoading();
			apis.getdbmap({
				retry: 3, //重试
				success: res => {
					this.accList = res;
					this.accIndex = 0;
					let userInfo = storage.get(consts.storageKeys.login);
					if (userInfo != undefined) {
						this.autologin = userInfo.autologin;
						if (userInfo.autologin) {
							this.accIndex = this.accList.indexOf(userInfo.dbMap);
							this.userPass = userInfo.userPass;
							this.bindLogin();
						} else {
							this.userID = userInfo.userID;
						}
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
		bindPickerChange(e) {
			this.accIndex = e.target.value;
		},
		autoLoginChange(e) {
			this.autologin = e.target.value;
		},
		bindLogin(e) {
			if (this.accIndex < 0) {
				uni.showToast({
					title: '请输入账套',
					icon: 'none'
				});
				return;
			}
			if (!this.userID.trim()) {
				uni.showToast({
					title: '请输入账号',
					icon: 'none'
				});
				return;
			}
			uni.showLoading();
			var userInfo = {
				dbMap: this.accList[this.accIndex],
				userID: this.userID,
				userPass: this.userPass,
				computerName: this.getDeviceInfo()
			};
			console.log('userInfo: ' + JSON.stringify(userInfo));
			apis.login({
				data: userInfo,
				success: res => {
					console.log(JSON.stringify(res));
					userInfo.sessionId = res.sessionId;
					userInfo.userName = res.userName;
					userInfo.autologin = this.autologin;
					userInfo.loginDatetime = res.loginDatetime;
					storage.set(consts.storageKeys.login, userInfo);
					this.login(userInfo);
					// console.log(res.sessionId)
					//判断是否从别的页面跳转过来的，身份验证失败
					if (this.sessionLost) {
						//会话丢失 返回上一个页面
						uni.navigateBack({
							delta: 1,
							animationType: 'pop-out',
							animationDuration: 200
						});
					} else {
						uni.reLaunch({
							url: '/pages/index/index'
						});
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
		getDeviceInfo() {
			//获取设备信息
			var str = '';
			// #ifdef APP-PLUS
			str = plus.device.uuid;
			// str += "设备型号：" + plus.device.model + "\n";
			// str += "设备厂商：" + plus.device.vendor + "\n";
			// str += "IMEI：" + plus.device.imei + "\n";
			// str += "UUID：" + plus.device.uuid + "\n";
			// str += "屏幕分辨率：" + plus.screen.resolutionWidth * plus.screen.scale + " x " + plus.screen.resolutionHeight * plus.screen.scale + "\n";
			// str += "DPI：" + plus.screen.dpiX + " x " + plus.screen.dpiY;
			// #endif
			console.log(str);
			return str;
		}
	}
};
</script>

<style>
#viewHeader {
	overflow-y: hidden;
}
.input-group {
	overflow-y: hidden;
}
.input-row {
	padding: 16upx 0upx;
}

.btn-row {
	margin-top: 30upx;
	padding: 20upx;
}

button.primary {
	background-color: #0faeff;
}
</style>
