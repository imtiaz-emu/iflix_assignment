const moment = require('moment');
const userData = require('../../data/accounts.json').users;
const User = require('../models/user');
let partnerNames = ['amazecom', 'wondertel'];

function prepareUsers() {
  return userData.map(data => new User(data.name, data.number));
}

function preparePartnerData() {
  let data = {
    offers: []
  };
  partnerNames.forEach(function (partnerName) {
    const partnerData = require('../../data/' + partnerName + '.json');
    data.offers = data.offers.concat(partnerData.grants
      .map(grant => Object.assign({}, grant, { partnerName, type: 'grant' }))
    ).concat(partnerData.revocations
      .map(revocation => Object.assign({}, revocation, { partnerName, type: 'revocation' }))
    );
  });

  

  data.offers.sort((a, b) => {
    return moment(a.date).diff(moment(b.date));
  });

  return data;
}

module.exports = {
  preparePartnerData,
  prepareUsers
};