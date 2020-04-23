/**
	 * @description 格式化时间 03:01
	 */
	Date.prototype.formatTime = function(time) {
		if (typeof time !== 'number' || time < 0) {
			return time
		}

		var hour = parseInt(time / 3600)
		time = time % 3600
		var minute = parseInt(time / 60)
		time = time % 60
		var second = time

		return ([hour, minute, second]).map(function(n) {
			n = n.toString()
			return n[1] ? n : '0' + n
		}).join(':')
	}

	/**
	 * @description 时间格式化
	 */
	Date.prototype.format = function(fmt) {
		fmt = fmt || 'yyyy-MM-dd';
		var o = {
			"M+": this.getMonth() + 1, //月份 
			"d+": this.getDate(), //日 
			"H+": this.getHours(), //小时
			"h+": this.getHours(), //小时 
			"m+": this.getMinutes(), //分 
			"s+": this.getSeconds(), //秒 
			"f+": this.getMilliseconds(), //毫秒
			"q+": Math.floor((this.getMonth() + 3) / 3), //季度  
		}; 
		if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		for (var k in o){
			if (new RegExp("(" + k + ")").test(fmt)){
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(-RegExp.$1.length)));
			} 
		} 
		return fmt;
	}

	/**
	 * @description 根据时间戳转化格式化的时间
	 * @param {Object} timestamp 时间戳
	 * @param {String} format 时间格式
	 */
	Date.prototype.getDateByTimestamp = function(timestamp, format) {
		format = format || 'yyyy/MM/dd hh:mm:ss';
		var d = new Date(timestamp);
		return d.format(format);
	}

	/**
	 * @description 获取当前的时间戳
	 */
	Date.prototype.getTimestamp = function() {
		return new Date().getTime();
	}
