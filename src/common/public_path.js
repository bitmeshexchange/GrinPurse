import getCurrAbsPath from './getCurrAbsPath';
let publicPath = window.publicPath || getCurrAbsPath().split('/').slice(0, -1).join('/');

if (publicPath) {
  if (startsWith(publicPath, '//')) {
    publicPath = window.location.protocol + publicPath;
  }

  if (!endsWith(publicPath, '/')) {
    publicPath = publicPath + '/';
  }
  __webpack_public_path__ = publicPath; // eslint-disable-line
}

function startsWith(str1, str2) {
  if (!(str1 && str2)) {
    return false;
  }

  if (str1.indexOf(str2) === 0) {
    return true;
  }

  return false;
}

function endsWith(str1, str2) {
  if (!(str1 && str2)) {
    return false;
  }

  const endIndex = str1.length - 1;

  if (str1.indexOf(str2) === endIndex) {
    return true;
  }

  return false;
}
