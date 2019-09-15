const moment = require('moment');
const constants = require('../common/constants');

module.exports = function (partnerName, type, startDate, period) {
  this.partner = partnerName;
  this.type = type || 'grant';
  this.startDate = startDate;
  if (period) {
    this.endDate = moment(startDate)
      .add(period, 'months').format(constants.DATE_FORMAT);
  }
}