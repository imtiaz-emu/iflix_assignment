const moment = require('moment')
const User = require('../../lib/models/user');
const Offer = require('../../lib/models/offer')
const subscriptionService = require('../../lib/services/subscription');

const chai = require('chai');
const expect = chai.expect;
const beforeEach = require('mocha').beforeEach;


describe('#getSubscriptionInfo()', function() {

  beforeEach(function() {
    this.user = new User("Kumar", "57145334512");
    this.offers = [
      new Offer('wondertel', 'grant', "2015-02-21T01:34:10+00:00", 3),
      new Offer('wondertel', 'grant', "2015-09-14T16:24:24+00:00", null),
      new Offer('amazecom', 'revocation', "2015-10-14T16:24:24+00:00", null)
    ];
  });
  
  context('when user has grants only', function() {
    it('should return user offer days', function() {
      subscriptionService.assignOffer(this.user, this.offers[0]);
      expect(this.user.getSubscriptionInfo()).to.eql({ 'wondertel': 89 });
    })
  })

  context('when user has grants and revocations', function() {
    it('should return user offer days', function() {
      this.offers.sort((a, b) => {
        return moment(a.startDate).diff(moment(b.startDate));
      });
      this.offers.forEach(offer => {
        subscriptionService.assignOffer(this.user, offer);
      })
      expect(this.user.getSubscriptionInfo()).to.eql({ 'wondertel': 89 });
    })
  })
  
  context('when user has grants and revocations from multiple partners', function() {
    it('should return user offer days of multiple partner', function() {
      this.offers.push(new Offer('amazecom', 'grant', "2015-09-21T16:24:24+00:00", 1))
      this.offers.sort((a, b) => {
        return moment(a.startDate).diff(moment(b.startDate));
      });
      this.offers.forEach(offer => {
        subscriptionService.assignOffer(this.user, offer);
      })
      expect(this.user.getSubscriptionInfo()).to.eql({ 'wondertel': 89, 'amazecom': 23 });
    })
  })

  context('when user has grants from a partner with extension', function() {
    it('should return user offer days of a partner with extension', function() {
      this.offers.push(new Offer('wondertel', 'grant', "2015-04-21T16:24:24+00:00", 3))
      this.offers.sort((a, b) => {
        return moment(a.startDate).diff(moment(b.startDate));
      });
      this.offers.forEach(offer => {
        subscriptionService.assignOffer(this.user, offer);
      })
      expect(this.user.getSubscriptionInfo()).to.eql({ 'wondertel': 181 });
    })
  })

})