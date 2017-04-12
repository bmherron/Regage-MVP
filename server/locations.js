ZipActive = new Meteor.Collection("zipactive");


// Publish the current user commGroup
Meteor.publish('currentUserCommGroup', function() {
   //console.log('//-------- currentUserCommGroup Subscription Parameters:');
   var user = Meteor.users.findOne({_id: this.userId});
   if (!user)
     return [];
   if (user.profile.defaultCommKey)
     var commKey = user.profile.defaultCommKey;
   //console.log('commKey=' + commKey);
  if (commKey){
    if (commKey.substring(0,5)=='group'){
      var group = commGroups.find({commKey: commKey});
      //console.log('Found '+group.fetch().length+ ' groups');
      return group;
    }else{
      return [];
    }  
  }else{
    return [];
  }

});

Meteor.methods({

zipCheckFullList: function (zip) {   
   //console.log('zipCheckFullList');
   //console.log(zip);
   //console.log(111);
   var ziplookupService  = Meteor.npmRequire('zipcodelookup');
   //console.log(222);
   ziplookupService.initConfig('/zip_code_file.csv');
   //console.log(333);
   // or leave empty if you have already placed it as in the path above.
   var response = ziplookupService.zipCodeLookup(zip, 'US');  
   //console.log(444);
   return JSON.parse(response)
},

zipCheckActiveList: function (zip) {   
   //console.log('zipCheckActiveList');
   //console.log(zip);
   var response = ZipActive.findOne({zipcode: zip});
   //console.log(response);
   return response;
},
  
zipSaveToActiveList: function (zipObj) {   
   //console.log('zipSaveToActiveList');
   //console.log(zipObj);
   ZipActive.insert(zipObj)
   
},

 

  
});

