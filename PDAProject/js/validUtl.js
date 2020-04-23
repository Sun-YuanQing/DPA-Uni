(function(owner) {
	
	/**
	 * @description 验证IP
	 * @param {Object} ip ip地址
	 */
	owner.isValidIP = function(ip) {
		var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
		return reg.test(ip);
	}
	
	/**
	 * @description 验证ip 端口
	 */
	owner.isValidIPPort = function (port) {
		var reg = /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/;
		return reg.test(port)
	}
	
}(window.validUtl = {}));