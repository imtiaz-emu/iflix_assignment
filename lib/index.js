const Offer = require('./models/offer');
const dataService = require('./services/data');


function createAndAssignOffer(users, offerDetails, type) {
    console.log(`offer: ${offerDetails}`);
    // TODO: Assign offers to users 
}


function run() {
  const partnerData = dataService.preparePartnerData();
  const users = dataService.prepareUsers();

  partnerData.offers.forEach((offerDetails) => {
    if (offerDetails.period) {
      createAndAssignOffer(users, offerDetails, 'grant');
    } else {
      createAndAssignOffer(users, offerDetails, 'revocation');
    }
  });
}

run();

module.exports = {
  run
};

