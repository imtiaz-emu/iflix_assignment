const Offer = require('./models/offer');
const dataService = require('./services/data');
const subscriptionService = require('./services/subscription');
const fs = require('fs');

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

function writeSubscriptionInfo(users) {
  let result = {
    subscriptions: {}
  };
  users.forEach(user => {
    let userSubscriptions = user.getSubscriptionInfo();
    if(userSubscriptions && Object.keys(userSubscriptions).length){
      result.subscriptions[user.name] = userSubscriptions;
    }
  });

  result = JSON.stringify(result, null, 2) + '\n';
  const resultFile = __dirname + '/../output/result.json';
    
  fs.writeFileSync(resultFile, result);

  console.log('Generated output file\n');
}


function run() {
  const partnerData = dataService.preparePartnerData();
  const users = dataService.prepareUsers();

  partnerData.offers.forEach((offerDetails) => {
    createAndAssignOffer(users, offerDetails);
  });

  writeSubscriptionInfo(users);
}

run();

module.exports = {
  run
};

