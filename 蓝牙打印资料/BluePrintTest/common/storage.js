'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
	return typeof obj;
} : function(obj) {
	return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" :
		typeof obj;
};

var evenStorage = function evenStorage() {};

var isJSON = function isJSON(obj) {
	return (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && Object.prototype.toString.call(obj).toLowerCase() ===
		'[object object]' && !obj.length;
};

var isFunction = function isFunction(value) {
	return {}.toString.call(value) === '[object Function]';
};

var serialize = function serialize(value) {
	return value === undefined || typeof value === 'function' ? value + '' : JSON.stringify(value);
};

var deserialize = function deserialize(value) {
	if (typeof value !== 'string') {
		return undefined;
	}
	try {
		return JSON.parse(value);
	} catch (e) {
		return value || undefined;
	}
};

var storage = {
	set: function set(key, value) {
		evenStorage('set', key, value); 
		if (key && !isJSON(key)) { 
			uni.setStorage({
				key: key,
				data: serialize(value)
			}); 
		} else if (key && isJSON(key) && !value) { 
			for (var k in key) {
				this.set(k, key[k]);
			} 
		}
		return this;
	},

	get: function get(key) {
		if (!key) {
			var result = {};
			this.forEach(function(key, value) {
				result[key] = value;
			});
			return result;
		}
		var result1 = {};
		uni.getStorage({
			key: key,
			success: function(res) {
				result1 = deserialize(res.data);
			},
			fail: function(res) {
				result1 = undefined;
			}
		});
		return result1;
	},

	clear: function clear() {
		this.forEach(function(key, value) {
			evenStorage('clear', key, value);
		});
		uni.clearStorage();
		return this;
	},

	remove: function remove(key) {
		var value = this.get(key);
		uni.removeStorage({
			key: key,
			success: function(res) {
				console.log('success');
			}
		});
		evenStorage('remove', key, value);

		return value;
	},

	has: function has(key) {
		uni.getStorageInfo({
			success: function(res) {
				return res.keys.indexOf(key) > -1;
			}
		});
	},

	keys: function keys() {
		var result = [];

		this.forEach(function(key, list) {
			result.push(key);
		});

		return result;
	},

	size: function size() {
		/* uni.getStorageInfo({
			success: function(res) {
				console.log(res.keys);
				console.log(res.currentSize);
				console.log(res.limitSize);
			}
		}); */
		return this.keys().length;
	},

	forEach: function forEach(callback) {
		uni.getStorageInfo({
			success: function(res) {
				for (let key in res.keys) {
					if (callback(key, this.get(key)) === false) {
						break;
					}
				}
			}
		});
		return this;
	},

	search: function search(str) {
		var keys = this.keys(),
			result = [];

		for (var i = 0; i < keys.length; i++) {
			if (keys[i].indexOf(str) > -1) {
				result.push(this.get(keys[i]));
			}
		}

		return result;
	},

	onStorage: function onStorage(callback) {
		if (callback && isFunction(callback)) {
			evenStorage = callback;
		}

		return this;
	}
};

module.exports = storage;
