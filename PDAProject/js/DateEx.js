/*
时间扩展的方法
http://blog.csdn.net/kongjiea/article/details/46829023
http://blog.csdn.net/qq415734794/article/details/7895496
http://www.cnblogs.com/kissdodog/p/3386480.html
*/

(function() {
	window.DateExt = window.DateExt || {
		_now: new Date(),
		_nowDayOfWeek: new Date().getDay(), //今天本周的第几天   
		_nowDay: new Date().getDate(), //当前日   
		_nowMonth: new Date().getMonth(), //当前月   
		NowYear: function() {
			var year = this._now.getYear();
			return year += (year < 2000) ? 1900 : 0;
		},
		_dateFmt: "yyyy-MM-dd",
		//获得某月的天数   
		GetMonthDays: function(myMonth) {
			var monthStartDate = new Date(this.NowYear(), myMonth, 1);
			var monthEndDate = new Date(this.NowYear(), myMonth + 1, 1);
			var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
			return days;
		},
		//获得本季度的开端月份 
		GetQuarterStartMonth: function() {
			var quarterStartMonth = 0;
			if(this._nowMonth < 3) {
				quarterStartMonth = 0;
			}
			if(2 < this._nowMonth && this._nowMonth < 6) {
				quarterStartMonth = 3;
			}
			if(5 < this._nowMonth && this._nowMonth < 9) {
				quarterStartMonth = 6;
			}
			if(this._nowMonth > 8) {
				quarterStartMonth = 9;
			}
			return quarterStartMonth;
		},
		//今日
		GetTodayDate: function() {
			var today = new Date();
			return today.Format(this._dateFmt);
		},
		//昨日
		GetYesterdayDate: function() {
			var yesterday = new Date(this.NowYear(), this._nowMonth, this._nowDay - 1);
			return yesterday.Format(this._dateFmt);
		},
		//获取本周开始时间
		GetWeekStartDate: function() {
			var weekStartDate = new Date(this.NowYear(), this._nowMonth, this._nowDay - this._nowDayOfWeek);
			return weekStartDate.Format(this._dateFmt);
		},
		//获取本周结束时间
		GetWeekEndDate: function getWeekEndDate() {
			var weekEndDate = new Date(this.NowYear(), this._nowMonth, this._nowDay + (6 - this._nowDayOfWeek));
			return weekEndDate.Format(this._dateFmt);
		},
		//获取上周开始时间
		GetLastWeekStartDate: function() {
			var weekStartDate = new Date(this.NowYear(), this._nowMonth, this._nowDay - this._nowDayOfWeek - 7);
			return weekStartDate.Format(this._dateFmt);
		},
		//获取上周结束时间
		GetLastWeekEndDate: function getWeekEndDate() {
			var weekStartDate = new Date(this.NowYear(), this._nowMonth, this._nowDay - this._nowDayOfWeek - 1);
			return weekStartDate.Format(this._dateFmt);
		},
		//获取本月开始时间
		GetMonthStartDate: function() {
			var monthStartDate = new Date(this.NowYear(), this._nowMonth, 1);
			return monthStartDate.Format(this._dateFmt);
		},
		//获取本月结束时间
		GetMonthEndDate: function() {
			var monthEndDate = new Date(this.NowYear(), this._nowMonth, this.GetMonthDays(this._nowMonth));
			return monthEndDate.Format(this._dateFmt);
		},
		//获取上月开始时间
		GetLastMonthStartDate: function() {
			var monthStartDate = new Date(this.NowYear(), this._nowMonth - 1, 1);
			return monthStartDate.Format(this._dateFmt);
		},
		//获取上月结束时间
		GetLastMonthEndDate: function() {
			var monthEndDate = new Date(this.NowYear(), this._nowMonth - 1, this.GetMonthDays(this._nowMonth));
			return monthEndDate.Format(this._dateFmt);
		},
		GetStartDateByMonth: function(month) {
			var monthStartDate = new Date(this.NowYear(), month - 1, 1);
			return monthStartDate.Format(this._dateFmt);
		},
		GetEndDateByMonth: function(month) {
			var monthEndDate = new Date(this.NowYear(), month - 1, this.GetMonthDays(month - 1));
			return monthEndDate.Format(this._dateFmt);
		},
		GetYearStartDate: function() {
			var monthStartDate = new Date(this.NowYear(), 0, 1);
			return monthStartDate.Format(this._dateFmt);
		},
		//获取本月结束时间
		GetYearEndDate: function() {
			var monthEndDate = new Date(this.NowYear(), 11, 31);
			return monthEndDate.Format(this._dateFmt);
		},
		GetLastYearStartDate: function() {
			var monthStartDate = new Date(this.NowYear() - 1, 0, 1);
			return monthStartDate.Format(this._dateFmt);
		},
		//获取本月结束时间
		GetLastYearEndDate: function() {
			var monthEndDate = new Date(this.NowYear() - 1, 11, 31);
			return monthEndDate.Format(this._dateFmt);
		},
		//获取本季度开始时间
		GetQuarterStartDate: function() {
			var quarterStartDate = new Date(this.NowYear(), this.GetQuarterStartMonth(), 1);
			return quarterStartDate.Format(this._dateFmt);
		},
		//获取本季度结束时间
		GetQuarterEndDate: function() {
			var quarterEndMonth = this.GetQuarterStartMonth() + 2;
			var quarterStartDate = new Date(this.NowYear(), quarterEndMonth, this.GetMonthDays(quarterEndMonth));
			return quarterStartDate.Format(this._dateFmt);
		}
	};
})();