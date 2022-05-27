const { format } = require('date-fns')
const _ = require('lodash')
const name_day = ['Minggu','Senin','Selasa','Rabu','Kamis','Jum\'at','Sabtu','Minggu'];
const name_month = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

String.prototype.stringReplace = function(findArray, replaceArray){
    var i, regex = [], map = {}, str = this; 
    for( i=0; i<findArray.length; i++ ){ 
      regex.push( findArray[i].replace(/([-[\]{}()*+?.\\^$|#,])/g,'\\$1') );
      map[findArray[i]] = replaceArray[i]; 
    }
    regex = regex.join('|');
    str = str.replace( new RegExp( regex, 'g' ), function(matched){
      return map[matched];
    });
    return str;
}

Date.prototype.formatter = function(format='d, D-M-Y h:i:s') {
  var addZero = (item) => item < 9 ? "0" + item: item,
  
  find = ['d','m','D','M','Y','h','i','s'],
  replace = [
      name_day[this.getDay()],
      name_month[this.getMonth()],
      addZero(this.getDate()),
      addZero(this.getMonth()),
      this.getFullYear(),
      addZero(this.getHours()),
      addZero(this.getMinutes()),
      addZero(this.getSeconds())
  ];
  return format.stringReplace(find,replace);
}

/**
 * Find duplicate key from array
 * @returns {Array} - List of duplicate key
 */
Array.prototype.findDuplicate = function(){
  const filter = Object.entries(_.countBy(this)).filter(item => item[1] > 1)
  return filter.length > 0 ? filter.map(item => ({[item[0]]: item[1]})) : false
}

const dateToISOString = date => {
  try {
    const getDate = new Date(date)
    return getDate.toISOString()
  } catch (error) {
    return false
  }
}

const rupiahFormatting = (value) => {
  if (typeof value !== 'number') return false
  const format = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
  })

  return format.format(value)
}

const dateToSQLDate = date => {
  try {
    return format(new Date(date), 'yyyy-MM-dd HH:mm:ss')
  } catch (error) {
    console.error(error);
    return false
  }
}

module.exports = {
  dateToISOString,
  dateToSQLDate,
  rupiahFormatting
}