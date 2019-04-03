/**
 * 从url里获取参数
 * @param {String} name key
 * @param {String} url ?key=1 
 */
export function getParameterFromUrl(name) {
  let url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// 
export function openBrowser(url) {
	const global = window.global;
  if (typeof global !== 'undefined') {
    try {
      global.electron.shell.openExternal(url);
    } catch(err) {
      window.location.href = url
    }
  }
}

export function keepDecimal(number, length = 4) {
  if (!number) return '-'
  return (+number).toFixed(length)
} 
