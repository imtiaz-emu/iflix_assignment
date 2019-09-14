var fs = require("fs")
var path = require("path")
var async = require('async');

const appPath = path.resolve(__dirname, "..")
var accounts, partners = [];


function prepare_data(){
    var dataPath = appPath + '/data';
    var dataFiles = [];
    fs.readdirSync(dataPath).forEach(file => {
      dataFiles.push(file);
    });

    read_data_from_files(dataPath, dataFiles);
}

function read_data_from_files(folder, files){
  
  async.eachSeries(
    files,
    function(filename, cb) {
      fs.readFile(folder + "/" + filename, function(err, content) {
        if (!err) {
          if(filename === "accounts.json" ){
            accounts = JSON.parse(content);
          }else{
            partners.push({name: filename.split(".")[0], data: JSON.parse(content)})
          }
        }

        cb(err);
      });
    },
    
    function(err) {
      get_offers_subscriptions()
    }
  );
}

function partner_offers(accountNumber, partner){
  var offers = [];
  // Get partner offers (revocations) for a specific user account
  if(typeof partner.data.revocations && partner.data.revocations.length > 0){
    partner.data.revocations.forEach(revocation => {
      if(revocation.number === accountNumber){
        offers.push({
          type: 'revoke',
          partner: partner.name,
          start: revocation.date  
        })
      }
    })
  }

  // Get partner offers (grants) for a specific user account
  if(typeof partner.data.grants && partner.data.grants.length > 0){
    partner.data.grants.forEach(grant => {
      if(grant.number === accountNumber && typeof grant.period && grant.period > 0){
        offers.push({
          type: 'grant',
          partner: partner.name,
          period: grant.period,
          start: grant.date  
        })
      }
    })
  }

  return offers;
}

function dateFromISO8601(isostr) {
  try {
    var parts = isostr.match(/\d+/g);
    return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
  }catch(e){
    console.log(`Date conversion error: ${e.stack}`);
  }
}

function subscription_by_user(account){
  accountNumber = account.number;
  accountName = account.name;
  account['offers'] = []

  try{
    partners.forEach( partner => {
      account['offers'] = account['offers'].concat(partner_offers(accountNumber, partner))
    })
  }catch(e){
    console.log(`Error occurred: ${e.stack}`)
  }

  account['offers'].sort(function (i, j) {
    let date_i = new Date(i.date).getTime();
    let date_j = new Date(j.date).getTime();
    return date_i > date_j;
  });

  var activePartner = '', partnerOfferStarts, partnerOfferEnds, output;
  var partnerSubscriptions = {}; 
  partners.map(partner => partnerSubscriptions[partner.name] = 0);
  
  if(account['offers'].length > 0){
    
    account['offers'].forEach(offer => {
      let offerStarts = dateFromISO8601(offer.start);
      let offerEnds = dateFromISO8601(offer.start);
      if (offer.type == "grant"){
        offerEnds.setMonth(offerEnds.getMonth() + offer.period);
      }
      
      if(offerStarts >= offerEnds){
        [offerStarts, offerEnds] = [offerEnds, offerStarts];
      }  

      let offerDurationInDays = Math.floor((offerEnds - offerStarts)/(1000*3600*24));
      // console.log(`offer Date: ${offerStarts}, period: ${offer.period}, converted: ${offerEnds}, days remain: ${offerDurationInDays}\n----\n`);
      

      if(offer.type == "grant" && activePartner == ""){
        activePartner = offer.partner;
        partnerSubscriptions[activePartner] += offerDurationInDays;
        partnerOfferStarts = new Date(offerStarts);
        partnerOfferEnds = new Date(offerEnds);
      }
      else if(offer.type == "grant" && activePartner == offer.partner){
        partnerSubscriptions[activePartner] += offerDurationInDays;
      }
      else if(offer.type == "revoke" && activePartner == offer.partner){
        activePartner = '';
        partnerOfferEnds = new Date(offer.start);
        if(partnerOfferStarts > partnerOfferEnds){
          [partnerOfferStarts, partnerOfferEnds] = [partnerOfferEnds, partnerOfferStarts];
        }        
        offerDurationInDays = Math.floor((partnerOfferEnds - partnerOfferStarts)/(1000*3600*24));
        partnerSubscriptions[activePartner] = offerDurationInDays;
      }

    })

    // console.log(partnerSubscriptions);
    Object.keys(partnerSubscriptions).filter(subscription =>{
      if (partnerSubscriptions[subscription] <= 0){
         delete partnerSubscriptions[subscription] 
      }
    })

  }

  return partnerSubscriptions;

}

function get_offers_subscriptions(){
  accounts.users.sort(function (i, j) {
    return j.name.localeCompare(i.name);
  });

  subscriptions = {}
  accounts.users.forEach( account =>  {
    subscriptions[account.name] = subscription_by_user(account);
  })
  
  Object.keys(subscriptions).forEach((user) => {
    if(Object.keys(subscriptions[user]).every((partner) => subscriptions[user][partner] == 0)){
      delete subscriptions[user]
    }
  })

  var output = {
    subscriptions: subscriptions
  }

  var result = JSON.stringify(output, null, 2) + '\n';
  var resultFile = appPath + '/output/result.json';
    
  fs.writeFile(resultFile, result, function(err) {
      if (err) {
        return console.log(err);
      }  
  });

}



prepare_data();

