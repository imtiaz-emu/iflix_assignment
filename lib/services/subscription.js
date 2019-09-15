const moment = require('moment');
const constants = require('../common/constants');

function _getOffersForSimilarPartner(user, partner) {
  return user.offers.filter(offer => offer.partner === partner);
}

function _isOverlapping(offerToCheckWithin, offerToCheck) {
  const anotherOfferDate = moment(offerToCheck.startDate);
  return anotherOfferDate.isSameOrAfter(offerToCheckWithin.startDate)
    && anotherOfferDate.isSameOrBefore(offerToCheckWithin.endDate);
}

function assignOffer(user, offer) {
  switch (offer.type) {
    case 'grant':
      _performGrant(user, offer);
      break;
    case 'revocation':
      _performRevoke(user, offer);
      break;
  }
}

function _performGrant(user, offer) {
  const lastOffer = user.offers[user.offers.length - 1];
  let isOfferWithinLast = false;
  let isLastFromSamePartner = false;

  // We assumed grant/revocation everything is offer
  // so, whenever an offer comes, if it doesn't contain end date
  // just skip the offer 
  if (!offer.endDate) {
    return;
  }

  // if user currently occupies an offer from a Partner
  // then check if newly incoming offer is coming from the same partner
  if (lastOffer) {
    isOfferWithinLast = _isOverlapping(lastOffer, offer);
    isLastFromSamePartner = lastOffer.partner === offer.partner;
  }

  
  // If user don't have any offer right now
  // or, if new offer is not conflicting with the current offer
  // then, just add the offer to user 
  if (!user.offers.length || !isOfferWithinLast) {
    user.offers.push(offer);
    return;
  }

  // If user have an offer from any partner and the newly coming offer 
  // from the same partner falls between user's current offer
  // then, extend the offer
  if (isLastFromSamePartner && isOfferWithinLast) {
    const diff = moment(offer.endDate).diff(moment(offer.startDate), 'months');
    lastOffer.endDate = moment(lastOffer.endDate)
      .add(diff, 'months').format(constants.DATE_FORMAT);
    return;
  }
}


// If there is a revoke request, then check user holds any offer from the same partner similar to revoking offer partner 
// then, update the holding offer's end date to revoke offer's start date  
function _performRevoke(user, offer) {
  const offersFromSamePartner = _getOffersForSimilarPartner(user, offer.partner);
  const offersContainingRevocationDate = offersFromSamePartner.filter(o => _isOverlapping(o, offer));

  if (offersContainingRevocationDate.length) {
    const offerToUpdate = offersContainingRevocationDate[0];
    offerToUpdate.endDate = offer.startDate;
    return;
  }

}

module.exports = {
  assignOffer
};
