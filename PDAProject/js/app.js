/**
 * @description 获取焦点
 * @param {String} objId 对象ID
 */
function setTxtFocus(objId) {
	objId = objId || 'txtBarcode';
	setTimeout(function() {
		document.getElementById(objId).focus();
	}, 300);
}

/**
 * @description 失去焦点
 * @param {String} objId 对象ID
 */
function setTxtBlur(objId) {
	objId = objId || 'txtBarcode';
	document.getElementById(objId).blur();
}

/**
 * @description 滚动到指定位置
 * @param {Object} scrollObj 滚动条对象
 * @example $('.mui-scroll-wrapper')
 * @param {Number} rowIndex 行索引
 * @param {Number} itemHeight item的高度
 */
function scrollToPosition(scrollObj, rowIndex, itemHeight) {
	scrollObj.scroll().reLayout();
	//判断 滚动条是否到底的问题
	scrollObj.scroll().scrollToBottom();
	var maxY = scrollObj.scroll().y;
	scrollObj.scroll().scrollTo(0, -rowIndex * itemHeight);
	var curY = scrollObj.scroll().y;
	if(curY < maxY)
		scrollObj.scroll().scrollToBottom();
}

/**
 * @description 播放音乐
 * 
 * @param {Boolen} isOk 
 */
function playAudio(isOk) {
	isOk = isOk || false;
	var url = "";
	if(isOk) {

	} else {
		plus.device.beep();
	}
//	var p = plus.audio.createPlayer(url);
//	p.play(function() {
//		//播放完成
//	}, function(e) {
//		//播放失败
//		//							outLine('播放音频文件"' + url + '"失败：' + e.message);
//	})
}

/**
 * @description 判断是否启用扫描
 * @param {String} objName 对象名称
 */
function EnableScan(objName) {
	objName = objName || "imgScan";
	var settings = app.getSettings();
	document.getElementById(objName).style.display = settings.EnableScan ? "inline" : "none";
}

// 注册一个全局自定义指令 v-focus
Vue.directive('focus', {
	// 当绑定元素插入到 DOM 中。
	inserted: function(el) {
		// 聚焦元素
		el.focus()
	}
});

(function($, owner) {

	/**
	 * 获取当前状态
	 */
	owner.getState = function() {
		var stateText = common.myStorage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	}

	/**
	 * 设置当前状态
	 */
	owner.setState = function(state) {
		state = state || {};
		common.myStorage.setItem('$state', JSON.stringify(state));
	}

	/**
	 * 设置应用本地配置
	 */
	owner.setSettings = function(settings) {
		settings = settings || {};
		common.myStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 获取应用本地配置
	 */
	owner.getSettings = function() {
		var settingsText = common.myStorage.getItem('$settings') || "{}";
		return JSON.parse(settingsText);
	}

	/**
	 * @description 获取最近的使用的菜单
	 */
	owner.getUsedMenus = function() {
		var menus = common.myStorage.getItem('$usedMenus') || "[]";
		return JSON.parse(menus);
	}

	/**
	 * @description 清除最近的使用的菜单记录
	 */
	owner.clearUsedMenus = function() {
		common.myStorage.setItem('$usedMenus', '');
	}

	/**
	 * @description 添加最近的使用菜单
	 */
	owner.setUsedMenus = function(menuInfo) {
		var menus = owner.getUsedMenus();

		var index = -1;
		for(var i = 0; i < menus.length; i++) {
			if(menus[i].id == menuInfo.id || menus[i].name == menuInfo.name) {
				index = i;
				break;
			}
		}
		if(index == -1) {
			if(menus.length >= 4) {
				menus.splice(0, 1);
			}
		} else {
			menus.splice(index, index + 1);
		}
		menus.push(menuInfo);
		common.myStorage.setItem('$usedMenus', JSON.stringify(menus));
	}

	/**
	 * @description 设置心跳链接循环 的ID
	 */
	owner.setPingCode = function(code) {
		code = code || {};
		common.myStorage.setItem('$pingCode', JSON.stringify(code));
	}

	/**
	 * @description 获取心跳链接循环 的ID
	 * @return 心跳链接循环 的ID， 默认为空
	 */
	owner.getPingCode = function() {
		var code = common.myStorage.getItem('$pingCode') || "";
		return JSON.parse(code);
	}

}(mui, window.app = {}));