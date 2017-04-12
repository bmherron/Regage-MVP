Template[getTemplate('register_modal')].events({
  'submit form': function (e, i) {
    e.preventDefault();
//    var status = zipobj.state == "NC" ? 1 : 0;
    if(Session.get('zipStatus')==1){
       var profile = {
         name: $('#firstname').val() + " " + $('#lastname').val(),
         zip: data.zipcode,
         city: zipobj.primary_city,
         state: zipobj.state,
//         status: status,
         county: zipobj.county,
         defaultCommName: zipobj.county + ' Region',
         defaultCommKey: 'group/countiesregion/US/'+zipobj.state+'/'+zipobj.county
       }
       Accounts._options.forbidClientAccountCreation = false;
       Session.set('zipStatus',3)
       Accounts.createUser(
         {username: data.email,
          email: data.email,
          password: $('#password').val(),
          profile: profile
         },
                 
         function(error) {
           console.log('callback on createUser')
           if(error){
             console.log(error)
             errorText = error.reason;
             Session.set('zipStatus',5)
             
             }else{
               
                window.top.location.href = "/topfirsttime"; 
               
         //       bootbox.alert( '<img src="/img/re-beta.svg" id="bootbox_regage" style="height:150px; margin-left:auto; margin-right:auto; display:block"> <span style="float:right; text-align:center;           //        font-size:18px"> Thank you for signing up for the Regage newsletter. Be on the look out for our upcoming launch!</span>' , function() {
          //      $('.bootbox-close-button', window.parent.document).click(); 
          //      }); 
           }
  
          });     
       
    
    }else{
       $('.bootbox-close-button', window.parent.document).click();  
    }

  }, 
})
             
             
             

         
    
  

var zipobj = {};
var errorText = "";
     
Template[getTemplate('register_modal')].created = function () {
  //console.log('created!! ' + errorText)
  data=this.data;
  if (errorText === ''){
     Session.set('zipStatus',0)
     Meteor.call('zipCheckActiveList', data.zipcode, function(error, zipobj1) {
         zipobj = zipobj1;
         //console.log(zipobj)
         if(zipobj){
               Session.set('zipStatus',1)
         }else{
               Meteor.call('zipCheckFullList', data.zipcode, function(error, zipobj1) {
                  zipobj = zipobj1;
                  //console.log(zipobj)
                  if(zipobj){
                     Session.set('zipStatus',1)
                     Meteor.call('zipSaveToActiveList', zipobj)
                  }else{
                     Session.set('zipStatus',2)
                  }

                  });
         }
         });
  }

};

Template[getTemplate('register_modal')].helpers({
  primaryCity: function(){
    return zipobj.primary_city;
  },
    county: function(){       
      //if(Session.get('zipStatus')==1){
        return zipobj.county;
     // }else{
     //   return 'loading'       
      //}
  },
    state: function(){       
    return zipobj.state;
  },
  zipReturned: function(){       
    return Session.get('zipStatus')==1;
  },
  zipWaiting: function(){       
    return Session.get('zipStatus')==0;
  },
  zipError: function(){       
    return Session.get('zipStatus')==2;
  },
  zipAccountWaiting: function(){       
    return Session.get('zipStatus')==3;
  },
  zipAccountReturned: function(){       
    return Session.get('zipStatus')==4;
  },
  zipAccountError: function(){       
    return Session.get('zipStatus')==5;
  },
  errorText: function(){       
    return errorText;
  },
  
})

