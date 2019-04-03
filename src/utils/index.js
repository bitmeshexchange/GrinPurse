'use strict';
import Long from 'long';
import BN from 'bignumber.js';
import moment from 'moment';
const location = window.location;

export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) {
    return date;
  }
  if (typeof date === 'string') {
    if (/^\d+$/.test(date)) {
      date = parseInt(date);
    }
    // date = new Date(date.date());
  }
  return moment(date).format(format);
}

export function stripDecimal(number) {
  if (number === 0 || number === '0') {
    return 0;
  }

  if (!number) {
    return number;
  }

  if (typeof number === 'number') {
    number = number.toFixed(11);
  } else {
    number = number.toString();
  }

  if (number.indexOf('.') === -1) {
    return number;
  }

  const t = number.split('.');
  if (t[1]) {
    t[1] = t[1].slice(0, 8).replace(/0+$/g, '');
    if (t[1]) {
      return t.join('.');
    }
  }
  return t[0];
}

export function formatAmount(amount, n = 8) {
  if (typeof amount === 'undefined') {
    return;
  }

  if (!amount) {
    return 0;
  }

  amount = stripDecimal(amount).toString();
  const index = amount.indexOf('.');
  if (index > -1) {
    return amount.substring(0, index + n + 1);
  }
  return amount;
}


export function formatAmountAll(amount) {
  if (!amount) {
    return 0;
  }
  amount = (amount).toString();
  const index = amount.indexOf('.');
  if (index > -1) {
    return amount.substring(0, index + 10 + 1).replace(/0+$/, '');
  }
  return amount
}


export function hasClass(elements, cName) {
  return !!elements.className.match(new RegExp("(\\s|^)" + cName + "(\\s|$)"));
};

export function addClass(elements, cName) {
  if (!hasClass(elements, cName)) {
    elements.className += " " + cName;
  };
};

export function removeClass(elements, cName) {
  if (hasClass(elements, cName)) {
    elements.className = elements.className.replace(new RegExp("(\\s|^)" + cName + "(\\s|$)"), " ");
  };
};

export function getRandom() {
  return Math.random().toString(32).slice(5);
}

export function noop() { }

export function getParameterFromUrl(name) {
  let url = location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export function toThousands(num) {
  if (!num) {
    return num;
  }

  if (!parseFloat(num)) {
    return 0;
  }

  let result = '', counter = 0;
  num = (num || 0).toString();
  const t = num.split('.');
  const intpart = t[0];
  for (let i = intpart.length - 1; i >= 0; i--) {
    counter++;
    result = intpart.charAt(i) + result;
    if (!(counter % 3) && i != 0) { result = ',' + result; }
  }

  if (t.length === 1) {
    return result;
  }
  return result + '.' + t[1];
}

// 将时间戳转换成日期格式
export function formatTime(time, fmt = 'yyyy-MM-dd hh:mm:ss') {
  let date = time;
  if (typeof time === 'number') {
    date = new Date(time);
  } else if (typeof time === 'string') {
    date = new Date(+time);
  }
  var o = {
    "y+": date.getFullYear(),
    "M+": date.getMonth() + 1,                 //月份
    "d+": date.getDate(),                    //日
    "h+": date.getHours(),                   //小时
    "m+": date.getMinutes(),                 //分
    "s+": date.getSeconds(),                 //秒
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度
    "S+": date.getMilliseconds()             //毫秒
  };
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      if (k == "y+") {
        fmt = fmt.replace(RegExp.$1, ("" + o[k]).substr(4 - RegExp.$1.length));
      }
      else if (k == "S+") {
        var lens = RegExp.$1.length;
        lens = lens == 1 ? 3 : lens;
        fmt = fmt.replace(RegExp.$1, ("00" + o[k]).substr(("" + o[k]).length - 1, lens));
      }
      else {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      }
    }
  }
  return fmt;
}

export function fillZero(num) {
  return num < 10 ? '0' + num : num;
}

export function formatHourPerf(time) {
  return new Date(time).toString().split(' ')[4];
}


export function serialize(obj) {
  let ret = [];
  Object.keys(obj).forEach(item => {
    ret.push(`${item}=${obj[item]}`)
  })
  return ret.join('&')
}

export function upperCase(str) {
  return str && str.toUpperCase();
}

export function printNum(num, prec) {
  if (typeof num === 'undefined') {
    return '-';
  }

  if (prec) {
    return formatAmount(num, prec);
  }
  return num;
}


export function formatNumber(num, n=8) {
  if (num) {
    let str = num.toString().replace(/\.$/, '');
    const t = str.split('.');
    if (t.length === 1) {
      return t[0];
    }
    return [t[0], t[1].slice(0, n).replace(/0+$/, '')].join('.');
  }
  return 0
}

// join ClassName
export function jc() {
  return [...arguments].join(' ')
}

export function removeE(number) {
  if (!number) return number;
  if (number.toString().indexOf('e-') > -1) {
    let arr = number.toString().split('e-');
    let before = '0.' + '0'.repeat(+arr[1] - 1);
    let after = arr[0].replace('.', '');
    return before + after;
  }
  return number;
}
