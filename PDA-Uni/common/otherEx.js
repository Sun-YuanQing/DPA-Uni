// ------------- 字符串去空格 -------------  
/**
 * @description 去左右空格 
 */
String.prototype.trim = function() {
	return this.replace(/(^\s*)|(\s*$)/g, "");
}
/**
 * @description 去左空格 
 */
String.prototype.ltrim = function() {
	return this.replace(/(^\s*)/g, "");
}
/**
 * @description 去右空格 
 */
String.prototype.rtrim = function() {
	return this.replace(/(\s*$)/g, "");
}
// ------------- 字符串去空格 -------------

/** 
 * @param {String} errorMessage  错误信息 
 * @param {String} scriptURI   出错的文件 
 * @param {Long}  lineNumber   出错代码的行号 
 * @param {Long}  columnNumber  出错代码的列号 
 * @param {Object} errorObj    错误的详细信息，Anything 
 */
// window.onerror = function(errorMessage, scriptURI, lineNumber, columnNumber, errorObj) {
// 	console.log("错误信息：", errorMessage);
// 	console.log("出错文件：", scriptURI);
// 	console.log("出错行号：", lineNumber);
// 	console.log("出错列号：", columnNumber);
// 	console.log("错误详情：", errorObj);
// }
