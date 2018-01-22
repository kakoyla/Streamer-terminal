const axios = require('axios'); //https://www.npmjs.com/package/axios
const Moment = require("moment"); //http://momentjs.com/
const sfx = require("sfx");  //https://www.npmjs.com/package/sfx
const fs = require('fs');  //https://www.npmjs.com/package/fs-
Websocket = require('ws')  //https://www.npmjs.com/package/ws
const formatNum = require('format-num') //https://www.npmjs.com/package/format-num
const chalk = require('chalk');//https://www.npmjs.com/package/chalk



//websocket = new Websocket('ws:127.0.0.1:6006') //rippled server = local machine RippleD
websocket = new Websocket('wss://s1.ripple.com') //rippled server = Public Server
//websocket = new Websocket('wss://s.altnet.rippletest.net:51233') //rippled server = TestNet




//connect to websocket tx stream
websocket.on('open', function(){
  console.log('Connected to Ripple Payment Network')
  websocket.send('{"command":"subscribe","streams":["transactions"]}')
})

websocket.on('message', function(message) //when message is received from websocket
{
  try {



        var message = JSON.parse(message)
        var engine_result = message.engine_result
        var transaction = message.transaction
        var now = Moment().format('MMMM Do YYYY, h:mm:ss a'); //local time


if(message.transaction){

        if (!(transaction.TransactionType === 'OfferCreate'||transaction.TransactionType === 'OfferCancel'||engine_result != 'tesSUCCESS')){        //filters out OfferCancel, OfferCreate, AccountSet, TrustSet and unsuccessful txs

            if (!(transaction.TransactionType === 'Payment')) { //takes filtered results and filters out payment txs, leaving escrow, paychan, setregular key and signer list related txs
              console.log(' ')
              console.log(chalk.yellow.bgRgb(31, 39, 57)('*!*!*!*--------------------------------------------NEW ',transaction.TransactionType,'-------------------------------------------!*!*!*!'))
              console.log(chalk.yellow.bgRgb(31, 39, 57)('*!*!*!*--------------------------------------------NEW ',transaction.TransactionType,'-------------------------------------------!*!*!*!'))
              console.log(chalk.yellow.bgRgb(31, 39, 57)('*!*!*!*--------------------------------------------NEW ',transaction.TransactionType,'-------------------------------------------!*!*!*!'))
              console.log(' ')
              sfx.ping(); //plays exagerated sound for tx that is not payment (unusual)
              console.log('account: ',transaction.Account)
              console.log('amount: ',formatNum(transaction.Amount/1000000))



              //write non payments or offers to file
              let txout = '\n*!*!*!*---------------------------------------NEW '+transaction.TransactionType+'-------------------------------!*!*!*!\n' +
                          'Account: ' + transaction.Account +
                          '\nAmount ' + formatNum(transaction.Amount/1000000) +
                          '\nTime: ' + now +
                          '\nTX Hash: ' + transaction.hash +
                          '\nhttps://xrpcharts.ripple.com/#/transactions/' + transaction.hash +
                          '\n------------------------------------------------------------------------------------------------------------------------\n\n'



            ;
              fs.appendFile('txlog.txt',txout, (err) => {
                    if (err) throw err;
                    console.log('The txlog updated!');
                });

            }
            else{ //should only be payments left



    var AffectedNodes = message.meta.AffectedNodes //just to make it easier for me -shorter


//set final balance after tx for both accounts involved in payment (sendBal and recvBal)
var sendBal
var recvBal
var aNodescount = AffectedNodes.length //counts how many AffectedNodes there are

//the following checks the payment details to see how many AffectedNodes there are, if there are 2 its a direct payment, if paths were set there will be more

  /*  if(aNodescount){   //if direct payment i.e. account 1 to account 2

          if(AffectedNodes[0].CreatedNode){ //if one account is activated during this tx i.e. balance was zero before tx
            recvBal=formatNum(AffectedNodes[0].CreatedNode.NewFields.Balance/1000000)
            sendBal=formatNum(AffectedNodes[1].ModifiedNode.FinalFields.Balance/1000000)
            }

              else {
                    if(AffectedNodes[1].CreatedNode){ //if one account is activated during this tx
                      recvBal=formatNum(AffectedNodes[1].CreatedNode.NewFields.Balance/1000000)
                      sendBal=formatNum(AffectedNodes[0].ModifiedNode.FinalFields.Balance/1000000)
                    }

                    else{ //both accounts already existed before tx
                          if(AffectedNodes[1].ModifiedNode.FinalFields.Account=transaction.Account){
                            sendBal = formatNum(AffectedNodes[1].ModifiedNode.FinalFields.Balance/1000000)
                            recvBal = formatNum(AffectedNodes[0].ModifiedNode.FinalFields.Balance/1000000)
                          }
                            else{
                                  if(AffectedNodes[0].ModifiedNode.FinalFields.Account=transaction.Account){
                                    sendBal = formatNum(AffectedNodes[0].ModifiedNode.FinalFields.Balance/1000000)
                                    recvBal = formatNum(AffectedNodes[1].ModifiedNode.FinalFields.Balance/1000000)
                                  }
                                }
                        }
                      }
                    }
                    else{ //if more than one acct used in payment ie paths taken
*/
                      for (var i = 0; i < aNodescount; i++) { //loops through the AffectedNodes looking for a match to sending and destination accts

                      if( AffectedNodes[i].ModifiedNode && AffectedNodes[i].ModifiedNode.FinalFields && AffectedNodes[i].ModifiedNode.FinalFields.Account && transaction.Amount && (AffectedNodes[i].ModifiedNode.LedgerEntryType==='AccountRoot')){ //checks to make sure its an AccountRoot entry ALSO NEED TO CHECK FOR FinalFields see tx 30252B4E5A75283014A0AE486C0CF91170491C4D78D9A36B9A31F0AE54FF6D94

                          if(AffectedNodes[i].ModifiedNode.FinalFields.Account===transaction.Destination){ // looks to see if account matches destination acct
                            recvBal = formatNum(AffectedNodes[i].ModifiedNode.FinalFields.Balance/1000000)
                            }

                         else{
                              if(AffectedNodes[i].ModifiedNode.FinalFields.Account===transaction.Account){ // looks to see if account matches sending acct
                                sendBal = formatNum(AffectedNodes[i].ModifiedNode.FinalFields.Balance/1000000)
                                }
                              }
                            }
                      else{
                          if(AffectedNodes[i].CreatedNode && AffectedNodes[i].CreatedNode.NewFields && AffectedNodes[i].CreatedNode.NewFields.Balance && (AffectedNodes[i].CreatedNode.LedgerEntryType==='AccountRoot')){ // looks to see if a new account was activated by tx
                          //going out on a limb and assuming the CreatedNode is the destination acct
                          recvBal = formatNum(AffectedNodes[i].CreatedNode.NewFields.Balance/1000000)
                          }
                        }
                      }






var sender = transaction.Account
var destination = transaction.Destination

switch (sender) {
  case 'rPVMhWBsfF9iMXYj3aAzJVkPDTFNSyWdKy': sender = 'Bittrex                       ';
    break;
  case 'rDsbeomae4FXwgQTJp9Rs64Qg9vDiTCdBv': sender = 'Bitstamp                      ';
    break;
  case 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B': sender = 'Bitstamp                       ';
    break;
  case 'rLHzPsX6oXkzU2qL12kHCH8G8cnZv1rBJh': sender = 'Kraken                        ';
    break;
  case 'rDCgaaSBAWYfsxUYhCk1n26Na7x8PQGmkq': sender = 'Poloniex                      ';
    break;
  case 'rpNqAwVKdyWxZoHerUzDfgEEobNQPnQgPU': sender = 'Coincheck                     ';
    break;
  case 'rwfGzgd4bUStS9gA5xUhCmg1J86TMtmGMo': sender = 'ShapeShift                    ';
    break;
  case 'rsG1sNifXJxGS2nDQ9zHyoe1S5APrtwpjV': sender = 'Bithumb                       ';
    break;
  case 'rHZaDC6tsGN2JWGeXhjKL6664RNCq5hu4B': sender = 'Bitso                         ';
    break;
  case 'rG6FZ31hDHN1K5Dkbma3PSB5uVCuVVRzfn': sender = 'Bitso                         ';
    break;
  case 'rLW9gnQo7BQhU6igk5keqYnH3TVrCxGRzm': sender = 'Bitfinex                      ';
    break;
  case 'rLW9gnQo7BQhU6igk5keqYnH3TVrCxGRzm': sender = 'Bitfinex                      ';
    break;
  case 'raBDVR7JFq3Yho2jf7mcx36sjTwpRJJrGU': sender = 'Bluezelle                     ';
    break;
  case 'rp45V3Su8qLSXmvKLJLUoFRDPB7RQNwp9u': sender = 'Bluezelle                     ';
    break;
  case 'rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq': sender = 'GateHub                       ';
    break;
  case 'rhotcWYdfn6qxhVMbPKGDF3XCKqwXar5J4': sender = 'GateHub                       ';
    break;

  default: //no need because if not an exchange we just want to leave as is
}

switch (destination) {
  case 'rPVMhWBsfF9iMXYj3aAzJVkPDTFNSyWdKy': destination = 'Bittrex                  ';
    break;
  case 'rDsbeomae4FXwgQTJp9Rs64Qg9vDiTCdBv': destination = 'Bitstamp                 ';
    break;
  case 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B': destination = 'Bitstamp                  ';
    break;
  case 'rLHzPsX6oXkzU2qL12kHCH8G8cnZv1rBJh': destination = 'Kraken                    ';
    break;
  case 'rDCgaaSBAWYfsxUYhCk1n26Na7x8PQGmkq': destination = 'Poloniex                  ';
    break;
  case 'rpNqAwVKdyWxZoHerUzDfgEEobNQPnQgPU': destination = 'Coincheck                 ';
    break;
  case 'rwfGzgd4bUStS9gA5xUhCmg1J86TMtmGMo': destination = 'ShapeShift                 ';
    break;
  case 'rsG1sNifXJxGS2nDQ9zHyoe1S5APrtwpjV': destination = 'Bithumb                    ';
    break;
  case 'rHZaDC6tsGN2JWGeXhjKL6664RNCq5hu4B': destination = 'Bitso                      ';
    break;
  case 'rG6FZ31hDHN1K5Dkbma3PSB5uVCuVVRzfn': destination = 'Bitso                      ';
    break;
  case 'rLW9gnQo7BQhU6igk5keqYnH3TVrCxGRzm': destination = 'Bitfinex                   ';
    break;
  case 'rLW9gnQo7BQhU6igk5keqYnH3TVrCxGRzm': destination = 'Bitfinex                   ';
    break;
  case 'raBDVR7JFq3Yho2jf7mcx36sjTwpRJJrGU': destination = 'Bluezelle                  ';
    break;
  case 'rp45V3Su8qLSXmvKLJLUoFRDPB7RQNwp9u': destination = 'Bluezelle                  ';
    break;
  case 'rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq': destination = 'GateHub                    ';
    break;
  case 'rhotcWYdfn6qxhVMbPKGDF3XCKqwXar5J4': destination = 'GateHub                    ';
    break;

    default: //no need because if not an exchange we just want to leave as is

}

  console.log(' ')
  console.log(chalk.cyan.bgRgb(31, 39, 57)('-------PAYMENT-------PAYMENT-------PAYMENT-------PAYMENT-------PAYMENT-------PAYMENT-------PAYMENT-------PAYMENT--------'))
  console.log(' ')
      if(!(isNaN(transaction.Amount))){
        console.log('Amount: ',formatNum(transaction.Amount/1000000),' XRP','                ','Fee: ',formatNum(transaction.Fee),'(',transaction.Fee/1000000,'XRP)')
        console.log(' ')
        console.log('Sender:              ',sender)
        console.log('Sender Balance:      ',sendBal)
        console.log('Destination:         ',destination)
        console.log('Destination Balance: ',recvBal)
        console.log()
      }
      else {
        var value = formatNum(transaction.Amount.value)
        var currency = transaction.Amount.currency
        var issuer = transaction.Amount.issuer

        switch (issuer) {
          case '(razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA': issuer = 'RippleChina';
            break;
          case 'rG6FZ31hDHN1K5Dkbma3PSB5uVCuVVRzfn': issuer = 'Bitso';
            break;
          case 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B': issuer = 'Bitstamp';
            break;
          case 'raBDVR7JFq3Yho2jf7mcx36sjTwpRJJrGU': issuer = 'Bluzelle';
            break;
          case 'rcoef87SYMJ58NAFx7fNM5frVknmvHsvJ': issuer = 'BPG';
            break;
          case 'rJRi8WW24gt9X85PHAxfWNPCizMMhqUQwg': issuer = 'Digital Gate JP';
            break;
          case 'rfYv1TXnwgDDK4WQNbFALykYuEBnrR4pDX': issuer = 'Dividend Rippler';
            break;
          case 'rPxU6acYni7FcXzPCMeaPSwKcuS2GTtNVN': issuer = 'eXRP';
            break;
          case 'rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq': issuer = 'GateHub';
            break;
          case 'rchGBxcD1A1C2tdxF6papQYZ8kjRKMYcL': issuer = 'Gatehub Fifth';
            break;
          case 'rDAN8tzydyNfnNf2bfUQY6iR96UbpvNsze': issuer = 'Gatehub Fifth';
            break;
          case 'rcA8X3TVMST1n3CJeAdGk1RdRCHii7N2h': issuer = 'Gatehub Fifth';
            break;
          case 'rckzVpTnKpP4TJ1puQe827bV3X4oYtdTP': issuer = 'Gatehub Fifth';
            break;
          case 'rB3gZey7VWHYRqJHLoHDEJXJ2pEPNieKiS': issuer = 'Mr Ripple';
            break;
          case 'rNPRNzBB92BVpAhhZr4iXDTveCgV5Pofm9': issuer = 'PayRoutes';
            break;
          case 'rfNZPxoZ5Uaamdp339U9dCLWz2T73nZJZH': issuer = 'Rippex';
            break;
          case 'rKxKhXZCeSDsbkyB8DVgxpjy5AHubFkMFe': issuer = 'Rippex';
            break;
          case 'rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK': issuer = 'RippleCN';
            break;
          case 'r9ZFPSb1TFdnJwbTMYHvVwFK1bQPUCVNfJ': issuer = 'Ripple Exchange Tokyo';
            break;
          case 'rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y': issuer = 'RippleFox';
            break;
          case 'rMAz5ZnK73nyNUL4foAvaxdreczCkG3vA6': issuer = 'Ripple Trade Japan';
            break;
          case 'r3ADD8kXSUKHd6zTCKfnKT3zV9EZHjzp1S': issuer = 'Ripple Union';
            break;
          case 'rBycsjqxD8RVZP5zrrndiVtJwht7Z457A8': issuer = 'Ripula';
            break;
          case 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q': issuer = 'Snap Swap';
            break;
          case 'rLEsXccBGNR3UPuPu2hUXPjziKC3qKSBun': issuer = 'The Rock';
            break;
          case 'r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN': issuer = 'Tokyo JPY';
            break;

          default: //no need because if not an exchange we just want to leave as is

        }



        console.log('Amount: ',value,' ',currency,'                             Fee:',formatNum(transaction.Fee),'(',transaction.Fee/1000000,'XRP)')
        console.log(' ')
        console.log('Currency Issuer: ',issuer)
        console.log(' ')
        console.log('Sender:          ',sender)
        console.log('Destination:     ',destination)
      //  console.log('Sender Balance: ',message.meta.AffectedNodes[0].ModifiedNode.FinalFields.Account,'Destination Balance: ',message.meta.AffectedNodes.ModifiedNode[0].FinalFields.Account)
      //  console.log('Sender Balance: ',formatNum(message.meta.AffectedNodes[0].ModifiedNode.FinalFields.Balance/1000000),'Destination Balance: ',formatNum(message.meta.AffectedNodes.ModifiedNode[0].FinalFields.Balance/1000000))

        console.log()

        }






  //Flag payment as Large if 100K XRP Plus
  if(transaction.Amount>99999999999){

    sfx.purr(); //plays different sound for large tx

    //check if acct is ripple trade Account !*!*! THIS IS NOT enabled, was taking too long with limited benefit, plus i don't have promises down yet

    var sendName
    var recName
    var sendAddress = 'https://id.ripple.com/v1/user/'+transaction.Account;
    var recAddress = 'https://id.ripple.com/v1/user/'+transaction.Destination;




    function setNames(ac1,ac2) {
        let exist1 = (ac1.data.exists);
        let exist2 = (ac2.data.exists);

      if (exist1 === true){
        sendName = (ac1.data.username)
        }
      else {
            sendName = 'n/a'

          };




      if (exist2 === true){
        recName = (ac2.data.username);
        return recName;
        }
      else {
        recName = 'n/a';
        return recName;
        }
    printLgTx(sendName,recName)
      };








    function printLgTx(sendName, recName){

      //write large payments to file
      let txout = '\n*!*!*!*---------------------------------------NEW '+transaction.TransactionType+'-------------------------------!*!*!*!\n' +
                  'Account: ' + sender +
                  '\nAccount Name: ' + sendName +
                  '\nAmount: ' + formatNum(transaction.Amount/1000000) +
                  '\nDestination: ' + destination +
                  '\nAccount Name: ' + recName +
                  '\nTime: ' + now +
                  '\nTX Hash: ' + transaction.hash +
                  '\nhttps://xrpcharts.ripple.com/#/transactions/' + transaction.hash +
                  '\n------------------------------------------------------------------------------------------------------------------------\n\n'



      ;
      fs.appendFile('lgPymtlog.txt',txout, (err) => {
            if (err) throw err;

        })};





    function getNames(){            //function to pull ripple trade names and push it to log file if possible
          function getAcct1() {
            return axios.get(recAddress);
          }

          function getAcct2() {
            return axios.get(sendAddress);
          }

          axios.all([getAcct1(), getAcct2()])
            .then(axios.spread(function (ac1, ac2){
              setNames(ac1,ac2)
              printLgTx(sendName,recName)

          }))
                .catch(error => {
                  console.log('ID Lookup Service Unavailable',error);

          });
          }
        //  getNames()

  console.log(chalk.greenBright.bgBlack('LARGE AMOUNT $$$$$$$$ LARGE AMOUNT $$$$$$$$ LARGE AMOUNT $$$$$$$$ LARGE AMOUNT $$$$$$$$ LARGE AMOUNT $$$$$$$$ LARGE AMT'))
  console.log(chalk.greenBright.bgBlack('$$$$$$$$ LARGE AMOUNT $$$$$$$$ LARGE AMOUNT $$$$$$$$ LARGE AMOUNT $$$$$$$$ LARGE AMOUNT $$$$$$$$ LARGE AMOUNT $$$$$$$$$'))
  console.log('')
  }


//plays sound for each new payment
  sfx.tink();




  console.log('TX Hash: ',transaction.hash)
  console.log(chalk.blueBright.underline('https://xrpcharts.ripple.com/#/transactions/'+transaction.hash))
  //console.log(chalk.blueBright.bgBlack('------------------------------------------------------------------------------------------------------------------------'))
  console.log('')
  console.log(chalk.cyan('************************************************************************************************************************'))
  //console.log('------------------------------------------------------------------------------------------------------------------------')


}

}}}
catch(e){console.log(e,message)}})  //always an error in the begining because first response isnt a tx still need to clean up
