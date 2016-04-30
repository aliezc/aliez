'use strict';

module.exports = {
	/*
	 * 识别headers里的range
	 * @param {string} range字符串
	 * @returns {object} 识别出的对象，包含start和end
	 */
	parseRange : function(str){
		var arr = str.split('-');
		var res = {};
		res.start = arr[0] == '' ? 0 : +arr[0];
		if(arr[1] != '') res.end = +arr[1];
		return res;
	}
}