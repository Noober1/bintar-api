const { format } = require('date-fns')
const _ = require('lodash')

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
  dateToSQLDate
}