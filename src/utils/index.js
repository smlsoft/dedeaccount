import Numeral from "numeral";

// import * as dayjs from "dayjs";
// import buddhistEra from "dayjs/plugin/buddhistEra";
// dayjs.extend(buddhistEra);

const checkSpecialString = (string) => {
  var format = /[`!@#$%^&_+\=\[\]{};':"\\|,.<>?]/;

  if (format.test(string)) {
    return true;
  } else {
    return false;
  }
};

const newGuid = (head) => {
  return (
    head +
    "xxxxxxxxxxxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 8) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    })
  );
};

const captcha = () => {
  return "xxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 8) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const formatNumber = (val, digit = 0) => {
  if (val == 0) {
    return "0.00";
  } else if (val < 0) {
    return Numeral(val).format("(0,0.00)");
  } else {
    return Numeral(val).format("0,0.00");
  }
};
const formatNumberforamount = (val, digit = 0) => {
  if (val == 0) {
    return "0.00";
  } else if (val < 0) {
    return Numeral(val).format("(0,0.00)");
  } else if (val > 0) {
    return Numeral(val).format("0,0.00");
  }
};
const formatNumberReport = (val, digit = 0) => {
  if (val == 0) {
    return "0.00";
  } else {
    return Numeral(val).format("0,0.00");
  }
};

const formatNumberforExcel = (val, digit = 0) => {
  if (val == 0) {
    return "0.00";
  } else if (val < 0) {
    return Numeral(val).format("0,0.00");
  } else {
    return Numeral(val).format("0,0.00");
  }
};
const uuidv4 = () => {
  return "xxxxxx"
    .replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    })
    .toUpperCase();
};

const getFormatDateTime = (format) => {

  var d = new Date(format);
  if (process.env.VUE_APP_DATE == "th") {

    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var localISOTime = (new Date(d - tzoffset)).toISOString();

    // console.log(localISOTime)

  }

  return localISOTime;
};

const remove_duplicates_array = (arr) => {
  var obj = {};
  var ret_arr = [];
  for (var i = 0; i < arr.length; i++) {
    obj[arr[i]] = true;
  }
  for (var key in obj) {
    ret_arr.push(key);
  }
  return ret_arr;
};

const getDocNoDate = (format) => {
  var d = new Date(),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return format + "-" + [year, month, day].join("") + uuidv4();
};

const getBatchID = () => {
  var d = new Date(),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("") + uuidv4();
};

const getYear = () => {
  var d = new Date(),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return year;
};
const getDateFromYear = (date) => {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

const getDateFormatDMY = (date) => {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (process.env.VUE_APP_DATE == "th") {
    year += 543;
  }
  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  return [day, month, year].join("/");
  // return dayjs(d).format("DD/MM/BBBB");
};

const getDateFormatDMYHM = (date) => {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear(),
    hour = d.getHours(),
    minute = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();



  if (process.env.VUE_APP_DATE == "th") {
    year += 543;
  }
  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  return [day, month, year].join("/") + " " + [hour, minute].join(":");
};

const getDateTimeFormatStandard = (date) => {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();
  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

const getDateTimeFormat = (date) => {
  var date = new Date(date);
  var showDate =
    date.getDate() +
    "/" +
    (date.getMonth() + 1) +
    "/" +
    date.getFullYear() +
    " " +
    (date.getHours() < 10 ? "0" : "") +
    date.getHours() +
    ":" +
    (date.getMinutes() < 10 ? "0" : "") +
    date.getMinutes();

  return showDate;
};
const getDateTimeFromDate = (date) => {
  var d = new Date(date);
  if (process.env.VUE_APP_DATE == "th") {
    d.setFullYear(d.getFullYear());
  }
  return d;
};

const getDateShowText = (date) => {
  var datesplit = date.split("/");
  var month = "";
  var en = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  var th = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฏาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  if (process.env.VUE_APP_DATE == "th") {
    month = th[parseInt(datesplit[1]) - 1];
  } else {
    month = en[parseInt(datesplit[1]) - 1];
  }
  return datesplit[0] + " " + month + " " + datesplit[2];
};

const getYearBuddhist = (date) => {
  var date = new Date(date);
  var showDate =
    date.getDate() +
    "/" +
    (date.getMonth() + 1) +
    "/" +
    (date.getFullYear() + 543);

  return showDate;
};

const getYearDC = (date) => {
  var date = new Date(date);
  var showDate =
    date.getDate() +
    "-" +
    (date.getMonth() + 1) +
    "-" +
    (date.getFullYear() - 543);

  return showDate;
};

const getDateDisplayFromDate = (date) => {
  var d = new Date(date);
  var showDate =
    date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
  return showDate;
};
const getDateTime = () => {
  var d = new Date();

  return d;
};

const isEmpty = (value) => {
  return value != undefined &&
    value != null &&
    value.toString().trim().length > 0
    ? true
    : false;
};

const formatCurrency = (value) => {
  var data = "";
  if (value == null || value == 0) {
    return 0;
  }
  data = Numeral(value).format("(0,0.00)");

  return data.toLocaleString();
};

const isImage = (file) => {
  return /^image\//.test(file.type);
};

const generateRandomNumber = () => {
  const min = 1000;
  const max = 9999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/// check type file image from String name
const checkTypeImage = (filename) => {
  var ext = filename.split(".").pop();
  if (
    ext == "jpg" ||
    ext == "jpeg" ||
    ext == "png" ||
    ext == "gif" ||
    ext == "bmp"
  ) {
    return true;
  } else {
    return false;
  }
};


/// check type file pdf from String name
const checkTypePDF = (filename) => {
  var ext = filename.split(".").pop();
  if (ext == "pdf") {
    return true;
  } else {
    return false;
  }
};


export default {
  newGuid,
  isEmpty,
  formatNumber,
  formatNumberforExcel,
  captcha,
  uuidv4,
  getDocNoDate,
  getDateTime,
  getYear,
  getFormatDateTime,
  getDateFromYear,
  getDateTimeFromDate,
  getDateDisplayFromDate,
  getDateTimeFormatStandard,
  getDateTimeFormat,
  formatCurrency,
  remove_duplicates_array,
  getDateFormatDMY,
  getDateFormatDMYHM,
  isImage,
  getYearBuddhist,
  checkSpecialString,
  getDateShowText,
  formatNumberReport,
  getYearDC,
  formatNumberforamount,
  generateRandomNumber,
  getBatchID,
  checkTypeImage,
  checkTypePDF

};
