const Offer = require('./models/offer');
const dataService = require('./services/data');
const subscriptionService = require('./services/subscription');

function findUserByPhoneNum(users, phoneNum) {
  const found = users.filter(u => u.phoneNumber === phoneNum);
  return found.length ? found[0] : null;
}

function createAndAssignOffer(users, offerDetails) {
  const offer = new Offer(
    offerDetails.partnerName,
    offerDetails.type,
    offerDetails.date,
    offerDetails.period ? offerDetails.period : null
  );
  const user = findUserByPhoneNum(users, offerDetails.number);
  if (user) {
    subscriptionService.assignOffer(user, offer);
  }
}


function run() {
  const partnerData = dataService.preparePartnerData();
  const users = dataService.prepareUsers();

  partnerData.offers.forEach((offerDetails) => {
    createAndAssignOffer(users, offerDetails);
  });
}

run();

module.exports = {
  run
};

