const moment = require('moment');

module.exports = function (name, phoneNumber) {
  this.name = name;
  this.phoneNumber = phoneNumber;
  this.offers = [];

  this.getSubscriptionInfo = function () {
    let subscriptionInfo = {};
    let partners = new Set();
    this.offers.forEach(offer => partners.add(offer.partner));
    partners.forEach(partner => {
      const offerDays = this.offers.filter(offer => offer.partner === partner)
        .reduce((sum, offer) => {
          return sum += Math.abs(moment(offer.endDate).diff(moment(offer.startDate), 'days'));
        }, 0);
      subscriptionInfo[partner] = offerDays;
    });

    return subscriptionInfo;
  }
}