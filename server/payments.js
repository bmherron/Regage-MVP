
var stripeSecretAPIKey = 'sk_test_MO5hB8d1uro1yrYgEPrA9ktQ'
var stripeConnectAppClientId = 'ca_5QNgvnLLJlTRNHGLai5Os0tdo1AfVEyT'
var Stripe = StripeSync(stripeSecretAPIKey);
//var Stripe = StripeAPI(stripeSecretAPIKey);
var stripeConnectAccessToken = ""
//console.log(Stripe);

Meteor.methods({
  payAccountToken: function (stripeConnectAuthCode, postId) {
    //console.log('payAccountToken');
    
  try{
    //var account = Stripe.account.retrieve(function(err,res){
    //  console.log(1)
    //  console.log(err);
    //  console.log(2)
    //  console.log(res);
    //  console.log(3)
    //});


      this.unblock();
      var result = HTTP.call("POST", "https://connect.stripe.com/oauth/token",
          {params: {grant_type: "authorization_code",
          client_id: stripeConnectAppClientId,
          code: stripeConnectAuthCode,
          scope: "read_write",
          client_secret: stripeSecretAPIKey}})
      //console.log(result.data.access_token)
      stripeConnectAccessToken = result.data.access_token
      Posts.update(postId,{$set:{payAuthToken: stripeConnectAccessToken, payAuthTokenExists: true}});
      return "success"
  } catch (error) {
    // Got a network error, time-out or HTTP error in the 400 or 500 range.
    //console.log('failed')
    //console.log(error.response.data.error_description)
    return error.response.data.error_description
  }   
  },


  payStripeConnectAppClientId: function () {
    return stripeConnectAppClientId; 
  },
  
///////////////////////////////////////////////////  


  addPledge: function(req){
    //console.log('inside addPledge function')
    //console.log(req)

      Stripe.customers.create(
        { email: req.token.email,
          card: req.token.id
        },
        function(err, customer) {
          if(err){
            console.log(err)
          }
          else {
            //Set customer ID as as the user's stripe ID here
             var userId = Meteor.user()._id; 
            //console.log('customerid=' + customer.id)
            //console.log(req)
            var now = new Date();
            Posts.update(req.postId, {$inc: {fundingTotal: req.amount, fundingCount: 1, baseScore: 2}, 
                                      $set: {fundingAt: now  },
                                      $addToSet: {payPledgeList: {amount: Number(req.amount), status: 'wait', userId: userId ,custId: customer.id}}
                                     });  //end Posts.update

            return true;
          }  
        }  //end callback
      );  //end Strip.customers.create

  },
  
  // 
  pledgeCollect: function(postId){
    var post = Posts.findOne(postId);
    var success = false;
    var errorMsg = '';
    var payCollectedAmt = 0;
    var payRejectedAmt = 0;
    var payCollectedNowAmt = 0;
    var appFee = 0;
    var procFee = 0;
    var feePctMax = .08
    var appfeepertran = 30
    var feePctProc = .029
    var feePerTran = 30
    var nonProfit = post.nonProfitApproved ? post.nonProfitApproved : false;
    var payAuthToken = post.payAuthToken;
    post.payPledgeList.forEach(function(pledge){
      if(pledge.status !== 'done'){
       try {
          if(nonProfit){
            appFee = 0;
            procFee = ((100 * pledge.amount) * feePctProc) + feePerTran;
          }else{
            procFee = ((100 * pledge.amount) * feePctProc) + feePerTran;
            appFee = ((100 * pledge.amount) * feePctMax ) + appfeepertran - procFee;  
          }
            
          Stripe.charges.create({
               amount: 100 * pledge.amount,
               currency: "usd",
               customer: pledge.custId,
               application_fee: appFee,
               description: "Charge for Regage pledge: " + post.title},
                payAuthToken); 
          success = true;
          //console.log('success')
       } catch (error) {
          success = false;
          //console.log('fail')
          //console.log(error.type)
          //console.log(error.message)
          errorMsg = error.message
          //console.log(post.payPledgeList)
          //console.log(pledge)
          //throw new Meteor.Error(1001, error.message);
          
        }
        
        if(success){
             //console.log('charge applied ' + pledge.amount)
             Posts.update({_id: postId, 'payPledgeList.custId' : pledge.custId}, 
                         {$set: {'payPledgeList.$.status': 'done', 'payPledgeList.$.error': ''},
                          $inc: {payProcFee: procFee/100, payAppFee: appFee/100}
                         })
             payCollectedAmt = payCollectedAmt + pledge.amount;
             payCollectedNowAmt = payCollectedNowAmt + pledge.amount;
            
          
        }else{
            //console.log('failed to post ' + pledge.amount)
            Posts.update({_id: postId, 'payPledgeList.custId' : pledge.custId}, 
                       {$set: {'payPledgeList.$.status': 'fail', 'payPledgeList.$.error': errorMsg}});          
            payRejectedAmt = payRejectedAmt + pledge.amount;
       } 
      
      }else{ // pledge.status == 'done'
        //console.log('already posted')
        payCollectedAmt = payCollectedAmt + pledge.amount;
      }
    });  //forEach
    //console.log(payRejectedAmt)
    //console.log(payCollectedNowAmt)
    //console.log(payCollectedAmt)
    Posts.update({_id: postId}, {$set: {payRejectedAmt: payRejectedAmt, payCollectedAmt: payCollectedAmt}}) ;  
    //console.log(post.payPledgeList)
        
    return {payRejectedAmt: payRejectedAmt, payCollectedNowAmt: payCollectedNowAmt, payCollectedAmt: payCollectedAmt};
  },  
    



  
  
  
  
  
})