import Vue from 'vue'
import App from './App'
import store from './store'
// --------------导入js的原生扩展方法----------------
import storage from './common/storage.js';
import consts from './common/consts.js';
import apis from './common/apiService.js';

// 可以通过 增加windows的对象，实现全局使用，eg:dateEx
import arrayEx from './common/arrayEx.js';
import dateEx from './common/dateEx.js';
import otherEx from './common/otherEx.js';
// --------------导入js的原生扩展方法---------------- 

import vueEx from './common/vueEx.js';

import pageFoot from './components/page-foot/page-foot.vue'
Vue.component('page-foot', pageFoot)



// 系统错误捕获
const errorHandler = (err, vm, info) => {
	// handle error
	// `info` 是 Vue 特定的错误信息，比如错误所在的生命周期钩子
	// 只在 2.2.0+ 可用 

	// console.error('抛出全局异常');  

	let uuid = ''
	// #ifdef APP-PLUS
	uuid = plus.device.uuid;
	// #endif
	
	var message = '', title = ''
	if (!err.message){
		title = ''
		message = err;
	}else{
		title = err.message
		message = err.stack;
	}
	console.error("message: " + title);
	console.error("stack: " + message);
		

	let userInfo = storage.get(consts.storageKeys.login);
	var log = {
		userID: userInfo.userID,
		createTime: new Date().format('yyyy/MM/dd HH:mm:ss'),
		title: title,
		message: message,
		uuid: uuid
	}
	var arr = storage.get('errlog');
	if (!arr) { 
		arr = [];
	}
	if (arr.length >= 10){//只保留最近10笔
		arr.removeAt(0)
	}
	arr.push(log)
	// console.log(log);
	storage.set('errlog', arr)
	apis.system_UpgradePdaErrLog({
		data: {
			userID: log.userID,
			createTime:log.createTime,
			title: log.title,
			message: log.message,
			uuid: log.uuid
		},
		success: (res) => {
			 //默认上传不处理
		},
		failure: (message) => {
			
		},
		complete: (status, message, content) => {
			
		}
	})
	
}

Vue.config.errorHandler = errorHandler;
Vue.prototype.$throw = (error) => errorHandler(error, this);


Vue.config.productionTip = false


Vue.prototype.$store = store
// Vue.prototype.$apis = apis;
App.mpType = 'app'

const app = new Vue({
	store,
	...App
})
app.$mount()
