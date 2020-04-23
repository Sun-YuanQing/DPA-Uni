<script>
	import storage from 'common/storage.js';
	import consts from 'common/consts.js';
	import apis from 'common/apiService.js';
	import store from 'store/index';
	import {
		mapState,
		mapMutations
	} from 'vuex';

	export default {
		data: {
			pingCode: ''
		},
		onLaunch() {
			console.log('App Launch')
			// 锁定屏幕方向
			plus.screen.lockOrientation('portrait-primary');
		},
		onShow() {
			//初始化全局变量
			let bluetoothPrinterSet = storage.get(consts.storageKeys.bluetoothPrinterSet);
			if (bluetoothPrinterSet == undefined) {
				bluetoothPrinterSet = {
					enableBluetooth: false,
					bluetoothType: 0,
					deviceId: '',
					deviceName: '',
					delayConnTime: 0,//连接延时
					portrait:true//不转向
				}
			}
			console.log('App Show')
			if (store.state.hasLogin) {
				console.log('App Show:Start');
				apis.ping({
					success: (res) => {
						console.log('App Show:End');
					}
				});
			}
			this.pingCode = setInterval(function() {
				// console.log(`Ping:${store.state.hasLogin}`);
				if (store.state.hasLogin) {
					apis.ping({
						success: (res) => {
							// console.log('Ping:OK');
						}
					});
				}
			}, 60000);
		},
		onHide() {
			console.log('App Hide')
			clearInterval(this.pingCode)
		},
		onError: function(err) {
			// 这里只能捕获方法内的异常，不能捕获生命周期中的逻辑异常
			
			 var json = JSON.stringify(err);
			// console.log(err);
			var arr = json.split("\\n"); 
			var log = {
				message : arr[1],
				stack: err
			}  
			this.$throw(log) 
		}
	}
</script>

<style>
	/*每个页面公共css */
	/* uni.css - 通用组件、模板样式库，可以当作一套ui库应用 */
	/* uni-app默认全局使用flex布局。因为flex布局有利于跨更多平台，尤其是采用原生渲染的平台。如不了解flex布局，请参考http://www.w3.org/TR/css3-flexbox/。如不使用flex布局，请删除或注释掉本行。*/
	@import './common/uni.css';
	@import './common/table.css';

	/* 以下样式用于 hello uni-app 演示所需 */
	page {
		background: #F0F0F0; /* #BDCEDE; */
		height: 100%;
		font-size: 30upx;
		line-height: 1.8;
	}

	.uni-header-logo {
		padding: 30upx;
		text-align: center;
		margin-top: 10upx;
	}

	.uni-header-logo image {
		width: 140upx;
		height: 140upx;
	}

	.uni-hello-text {
		color: #7A7E83;
	}

	.uni-hello-addfile {
		text-align: center;
		line-height: 300upx;
		background: #FFF;
		padding: 50upx;
		margin-top: 10px;
		font-size: 38upx;
		color: #808080;
	}

	.input-group {
		background-color: #ffffff;
		margin-top: 40upx;
		position: relative;
	}

	.input-group::before {
		/* position: absolute;
		right: 0;
		top: 0;
		left: 0;
		z-index: 3;
		height: 1upx;
		content: '';
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5);
		background-color: #c8c7cc; */
	}

	.input-group::after {
		/* position: absolute;
		right: 0;
		bottom: 0;
		left: 0;
		height: 1upx;
		content: '';
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5);
		background-color: #c8c7cc; */
	}

	.input-row {
		height: 70upx;
		min-height: 70upx;
		line-height: 70upx;
	}

	.uni-list-cell-selected {
		background: #CCCCCC;
	}

	.uni-list:after {
		height: 0px !important;
	}

	.uni-list::before {
		height: 0px !important;
	}
	
	.showBorder {
		border: solid 1px #007AFF;
	}

	.scroll-view-item {}
</style>
