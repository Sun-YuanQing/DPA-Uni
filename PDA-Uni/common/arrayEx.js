/******************************数组扩展***************************************/
/**
 * @description 添加单个 
 */
Array.prototype.add = function(item) {
	this.push(item);
}
/**
 * @description 添加集合 
 */
Array.prototype.addRange = function(items) {
	var length = items.length;

	if (length != 0) {
		for (var index = 0; index < length; index++) {
			this.push(items[index]);
		}
	}
}
/**
 * @description 清空 
 */
Array.prototype.clear = function() {
	if (this.length > 0) {
		this.splice(0, this.length);
	}
}
/**
 * @description 判断是否是空数组 
 */
Array.prototype.isEmpty = function() {
	if (this.length == 0)
		return true;
	else
		return false;
}
/**
 * @description 复制 
 */
Array.prototype.clone = function() {
	var clonedArray = [];
	var length = this.length;

	for (var index = 0; index < length; index++) {
		clonedArray[index] = this[index];
	}

	return clonedArray;
}
/**
 * @description 是否包含某个元素 
 */
Array.prototype.contains = function(item) {
	var index = this.indexOf(item);
	return (index >= 0);
}

/**
 * @description 查询返回索引 
 */
Array.prototype.indexOf = function(item) {
	var length = this.length;

	if (length != 0) {
		for (var index = 0; index < length; index++) {
			if (this[index] == item) {
				return index;
			}
		}
	}

	return -1;
}
/**
 * @description 插入 
 */
Array.prototype.insert = function(index, item) {
	this.splice(index, 0, item);
}
/**
 * @description 每个元素后添加字符 
 */
Array.prototype.joinstr = function(str) {
	var new_arr = new Array(this.length);
	for (var i = 0; i < this.length; i++) {
		new_arr[i] = this[i] + str
	}
	return new_arr;
}
/**
 * @description 删除指定项 
 */
Array.prototype.remove = function(item) {
	var index = this.indexOf(item);

	if (index >= 0) {
		this.splice(index, 1);
	}
}

/**
 * @description 根据索引删除指定项 
 */
Array.prototype.removeAt = function(index) {
	this.splice(index, 1);
}
/******************************数组扩展***************************************/
