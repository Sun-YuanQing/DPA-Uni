'use strict';
// Vue 的扩展方法
import Vue from 'vue'
//  Start 过滤器*************************************************
Vue.filter('capitalize', function(value) {
	if (!value) return ''
	value = value.toString()
	return value.charAt(0).toUpperCase() + value.slice(1)
})

Vue.filter('dateFormat', function(value) {  
	if (!value) return '';
	return (new Date(value)).format('yyyy-MM-dd');
})
// End 过滤器 *************************************************


//  Start 自定义指令*************************************************
// 注册一个全局自定义指令 v-focus
Vue.directive('focus', {
	// 当绑定元素插入到 DOM 中。
	inserted: function(el) {
		// 聚焦元素
		el.focus();
	}
})
//  End 自定义指令*************************************************