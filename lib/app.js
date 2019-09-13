var fs = require("fs")
var path = require("path")
var async = require('async');

const appPath = path.resolve(__dirname, "..")
var accounts, partners = [];

// console.log(appPath);

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
      console.log(`Yo, I Read data from files perfectly`);
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

  offers.sort(function (i, j) {
    let date_i = new Date(i.date).getTime();
    let date_j = new Date(j.date).getTime();
    return date_i > date_j;
  });

  return offers;
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

  if(account['offers'].length > 0){
    var activePartner = '';
    var partnerSubscriptions = new Map(partners.map(partner => [partner.name, 0]))
    // console.log(`Account - ${accountNumber} has ${account['offers'].length} offers\n-------\n`);
    
  }

}

function get_offers_subscriptions(){
  accounts.users.sort(function (i, j) {
    return j.name.localeCompare(i.name);
  });

  subscriptions = {}
  accounts.users.forEach( account =>  {
    subscriptions[account.name] = subscription_by_user(account);
  })

}



prepare_data();

