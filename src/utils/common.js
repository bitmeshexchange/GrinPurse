import moment from 'moment';

export const capitalizeString = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const stripDecimal = (number) => {
  if (number === 0 || number === '0') {
    return 0;
  }

  if (!number) {
    return number;
  }
  number = number.toString();
  if (number.indexOf('.') === -1) {
    return number;
  }
  number = number.replace(/0+$/g, '');
  if (number.slice(-1) === '.') {
    return number.slice(0, -1);
  }
  return number;
}

export const formatAmount = (amount, n = 8) => {
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

export const formatDateTime = (date, format = 'YYYY-MM-DD hh:mm:ss') => {
  if (!date) {
    return date;
  }
  if (typeof date === 'string') {
    if (/^\d+$/.test(date)) {
      date = parseInt(date);
    }
    date = moment(date);
  }
  return date.format(format);
}
