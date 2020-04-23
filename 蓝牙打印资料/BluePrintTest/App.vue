<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')

			let bleInfo = {
				BLEInformation: {
					platform: "",
					deviceId: "",
					writeCharaterId: "",
					writeServiceId: "",
					notifyCharaterId: "",
					notifyServiceId: "",
					readCharaterId: "",
					readServiceId: ""
				}
			}
			uni.setStorageSync('bleInfo', bleInfo);
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
