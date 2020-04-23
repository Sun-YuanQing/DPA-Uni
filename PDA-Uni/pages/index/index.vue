<!-- 首页 -->
<template>
	<view class="uni-padding-wrap uni-common-pb">
		<view class="uni-card" v-for="(list,index) in lists" :key="index">
			<view class="uni-list">
				<view class="uni-list-cell uni-collapse">
					<view class="uni-list-cell-navigate uni-navigate-bottom" hover-class="uni-list-cell-hover" :class="list.open ? 'uni-active' : ''"
					 @click="triggerCollapse(index)">
						{{list.name}}
					</view>
					<view class="uni-list uni-collapse" :class="list.open ? 'uni-active' : ''">
						<view style="display: block; position: relative; float: left; ">
							<button v-bind:id="item.id" type="button" class="mui-btn" style=" font-size: 33upx;padding: 0px;" v-for="(item,key) in list.pages"
							 :key="key" @click="goDetailPage(item)">{{ item.name ? item.name : item }}</button>
						</view>
						<!-- <view class="uni-list-cell" hover-class="uni-list-cell-hover" v-for="(item,key) in list.pages" :key="key" @click="goDetailPage(item)">
							<view class="uni-list-cell-navigate uni-navigate-right"> {{item.name ? item.name : item}} </view> 
						</view>-->
					</view>
				</view>
			</view>
		</view>
		<index-menus :show="showMenus" :menus="rightMenus" @click="rightMenuClick" @hide="rightMenuHide" />
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex';

	import indexMenus from '../../components/index-menus/index-menus.vue';

	import consts from '../../common/consts.js';
	import storage from '../../common/storage.js';
	import apis from '../../common/apiService.js';
	import util from '../../common/util.js';

	/**
	 * @description 菜单对象 
	 */
	function menuInfo(obj) {
		this.id = obj.id || '';
		this.name = obj.name || '';
		this.progNo = obj.progNo || '';
		this.open = obj.open || false;
		this.pages = obj.pages || [];
	};

	export default {
		components: {
			indexMenus
		},
		data() {
			return {
				lists: [],
				showMenus: false,
				rightMenus: []
			}
		},
		computed: mapState(['hasLogin']),
		onNavigationBarButtonTap(e) {
			// console.log(JSON.stringify(e))
			this.showMenus = true;
		},
		onLoad() {
			this.rightMenus = [{
					icon: 'gear',
					name: '远程设置'
				},
				{
					icon: 'gear',
					name: '工作中心设置'
				},
				{
					icon: 'gear',
					name: '错误日志'
				},
				{
					icon: 'gear',
					name: '蓝牙打印设置'
				},
				{
					icon: 'gear',
					name: '其它功能'
				},
				{
					icon: 'bars',
					name: '退出'
				}
			];


			/**
			 * 判断 本地是否有Session缓存
			 *  有：判断Sid是否还有效，有效，跳转到首页，跳转到首页，后台自动登录
			 *  无：跳转到登录页面
			 * 登录：是否自动登录
			 *  是，记住用户名&密码&Sid，身份验证失败后自动登录
			 *  否，记住用户名，身份验证失败后跳转到登录页，登录后跳转到上一页relanch
			 * 退出：清空Sid，自动登录为false
			 */

			let userInfo = storage.get(consts.storageKeys.login);
			if (!this.hasLogin && (!userInfo || !userInfo.autologin)) {
				//跳转到登录
				uni.reLaunch({
					url: '/pages/login/login',
				})
				return;
			}
			apis.OpenMes_ErpReturnSet({
				success: (res) => {
					storage.set(consts.storageKeys.ErpReturnSet, res);
					storage.set(consts.storageKeys.IsStorageBin, res.isStorageBin); //是否启用储位
					storage.set(consts.storageKeys.erpInterfaceType, res.erpInterfaceType); //一体化默认
					storage.set(consts.storageKeys.mesInLotType, res.mesInLotType); //成品批次号(inLot)产生规则
				},
				complete: (status, message, content) => {}
			})
			// #ifdef APP-PLUS 
			// 判断升级
			var _self = this;
			plus.runtime.getProperty(plus.runtime.appid, function(inf) {
				apis.upgrade({
					data: {
						ver: inf.version,
						custVer: ''
					},
					retry: 3, //重试
					success: (res) => {
						if (res == 1) { //需要升级
							uni.reLaunch({
								url: '/pages/login/login'
							});
							return;
						} else {
							_self.getSysMenus();
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
		onShow() {
			let userInfo = storage.get(consts.storageKeys.login);
			console.log('方便查看你登陆的数据库userInfo注意下面的输出156行');
			console.log(userInfo);
		},
		methods: {
			...mapMutations(['login', 'logout']),
			getSysMenus() {
				uni.showLoading();
				apis.getMenus({
					data: {
						allMenu: 0
					},
					retry: 2, //重试
					success: (res) => {
						storage.set(consts.storageKeys.menu, res);
						var menus = [];
						var menu = new menuInfo({
							name: '常用功能'
						});
						let userMenus = storage.get(consts.storageKeys.usedMenus);
						// console.log(JSON.stringify(userMenus))
						if (userMenus) {
							menu.pages = userMenus || [];
						}

						// let tmpmenu = new menuInfo({
						// 	id: 'boxMng/box-packBarcodeBind', //菜单名称
						// 	name: '*装箱客户条码绑定',
						// 	progNo: ''
						// }); 
						// menu.pages.push(tmpmenu);

						// let tmpmenu = new menuInfo({
						// 	id: 'picking/pickingOrder-out', //菜单名称
						// 	name: '*物控领料',
						// 	progNo: ''
						// }); 
						// menu.pages.push(tmpmenu);


						menus.push(menu);
						for (var i = 0; i < res.length; i++) {
							if (res[i].parentNo == "" && res[i].powerBrowse == "1") {
								//{"progNo":"OAPP00002","progName":"收货管理","progDesc":"收货管理","winName":"","parentNo":"","progType":"T1","sequence":10,"progLevel":3,"powerBrowse":"1","powerNew":"1","powerDelete":"1","powerModify":"1","powerPrint":"1","powerCheck":"1","powerDevelop":"1","powerData":"1","powerAmt":"1"}
								menu = new menuInfo({
									id: res[i].winName, //菜单名称
									name: res[i].progName,
									progNo: res[i].progNo
								});
								//顶级菜单
								var subMenus = this.getSubMenus(res, res[i].progNo);
								menu.pages = subMenus;
								menus.push(menu);
							}
						}

						this.lists = menus;
						// 防止因sid没有失效，直接登录，没有更新登录状态的问题
						let userInfo = storage.get(consts.storageKeys.login);
						this.login(userInfo);
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
			triggerCollapse(e) {
				for (var i = 0; i < this.lists.length; ++i) {
					if (e === i) {
						this.lists[i].open = !this.lists[e].open;
					} else {
						this.lists[i].open = false;
					}
				}
			},
			goDetailPage(e) {
				let userMenus = storage.get(consts.storageKeys.usedMenus);
				userMenus = userMenus == undefined ? [] : userMenus;
				var index = -1;
				for (var i = 0; i < userMenus.length; i++) {
					if (userMenus[i].id == e.id) {
						index = i;
						break;
					}
				}
				if (index == -1) {
					if (userMenus.length >= 4) {
						userMenus.splice(0, 1);
					}
				} else {
					userMenus.splice(index, index + 1);
				}
				userMenus.push(e);
				storage.set(consts.storageKeys.usedMenus, userMenus);
				uni.navigateTo({
					url: '/pages/' + e.id + '?progNo=' + e.progNo
				});
			},
			getSubMenus(allMenu, parentId) {
				var menus = [];
				for (var i = 0; i < allMenu.length; i++) {
					if (allMenu[i].parentNo == parentId && allMenu[i].powerBrowse == "1") {
						var menu = new menuInfo({
							id: allMenu[i].winName,
							name: allMenu[i].progName,
							progNo: allMenu[i].progNo
						});
						menus.push(menu);
					}
				}
				return menus;
			},
			userlogout() {
				//退出
				apis.logout();
				this.logout();
				let userInfo = storage.get(consts.storageKeys.login);
				userInfo.sessionId = '';
				userInfo.autologin = false;
				storage.set(consts.storageKeys.login, userInfo);
				uni.reLaunch({
					url: '/pages/login/login',
				})
			},
			setAppconfig() {
				//配置服务器地址
				uni.navigateTo({
					url: '/pages/appconfig/appconfig',
				})
			},
			setWorkCenter() {
				//配置服务器地址
				uni.navigateTo({
					url: '/pages/appconfig/set-workcenter',
				})
			},
			rightMenuClick(index) {
				switch (index) {
					case 0: //远程设置
						this.setAppconfig();
						break;
					case 1: //工作中心设置
						this.setWorkCenter();
						break;
					case 2: //错误日志
						uni.navigateTo({
							url: '/pages/log/log',
						})
						break;
					case 3: //打印机设置
						uni.navigateTo({
							url: '/pages/appconfig/set-bluetooth',
						})
						break;
					case 4: //其它功能
						uni.navigateTo({
							url: '/pages/appconfig/otherconfig',
						})
						break;
					case 5: //退出
						this.userlogout();
						break;
					default:
						break;
				}
				this.showMenus = false;
			},
			rightMenuHide() {
				this.showMenus = false;
			}
		}
	}
</script>

<style>
	@charset "UTF-8";

	/*page uni-padding-wrap优化菜单少还有滚动条的情况 */
	page {
		padding: 0px;
		margin: 0px;
		overflow: hidden;
		overflow-y: scroll;
		background: #BDCEDE;

	}

	.uni-padding-wrap {
		padding: 0px;
		margin: 0px auto;
		height: 100%;
		overflow: hidden;
		overflow-y: scroll;
	}

	.uni-card {
		box-shadow: none;
	}

	.uni-list:after {
		height: 0;
	}

	.uni-list:before {
		height: 0;
	}

	.uni-list .mui-btn {
		margin: 20upx;
		width: calc(100% / 2 - 40upx);
		background-color: #ffffff;
		border: 1upx solid #e1e2e4;
		color: black;
		position: relative;
		float: left;
		word-break: normal;
		/* line-height: 80upx;padding-top: 5px; */
		vertical-align: middle;
		align-items: center;
		min-height: 100upx;

	}

	.uni-list .mui-btn:active {
		background-color: #d5e3f0;
		color: black;
		border: 1upx solid #bdcede;
	}

	.uni-list .mui-btn:disabled {
		background-color: #CCCCCC;
		color: gray;
		border: 1upx solid #bdcede;
	}
</style>
