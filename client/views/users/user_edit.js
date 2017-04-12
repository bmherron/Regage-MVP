Template[getTemplate('user_edit')].helpers({
  profileIncomplete : function() {
    return this && !this.loading && !userProfileComplete(this);
  },
  userName: function(){
    return getUserName(this);
  },
  userEmail : function(){
    return getEmail(this);
  },
  getTwitter: function(){
    return getTwitterName(this) || "";
  },
  getGitHub: function(){
    return getGitHubName(this) || "";
  },
  profileUrl: function(){
    return Meteor.absoluteUrl()+"users/"+this.slug;
  },
  hasNotificationsUsers : function(){
    return getUserSetting('notifications.users', '', this) ? 'checked' : '';
  },
  hasNotificationsPosts : function(){
    return getUserSetting('notifications.posts', '', this) ? 'checked' : '';
  },
  hasNotificationsComments : function(){
    return getUserSetting('notifications.comments', '', this) ? 'checked' : '';
  },
  hasNotificationsReplies : function(){
    return getUserSetting('notifications.replies', '', this) ? 'checked' : '';
  },
  hasPassword: function () {
    return hasPassword(Meteor.user());
  },
  citystate: function () {
    return this.profile.city + ', ' + this.profile.state;
  },
  photoLink: function(){
    return !!this.profile.fileName ? "" + this.profile.fileName : "/img/avatar.png";
  },
});

Template[getTemplate('user_edit')].events({
  'submit #account-form': function(e){
    e.preventDefault();

    clearSeenErrors();
    if(!Meteor.user())
      throwError(i18n.t('You must be logged in.'));

    var $target=$(e.target);
    var name = $target.find('[name=name]').val();
    //var email = $target.find('[name=email]').val();
    var zip = $target.find('[name=zip]').val();
    var user = this;
    
    
    
    
    var update = {
      "profile.name": name,
      "profile.slug": slugify(name),
      "profile.bio": $target.find('[name=bio]').val(),
      //"profile.zip": zip,
      //"profile.email": email,
      //"profile.twitter": $target.find('[name=twitter]').val(),
      //"profile.github": $target.find('[name=github]').val(),
      //"profile.site": $target.find('[name=site]').val(),
      "profile.notifications.users": $('input[name=notifications_users]:checked').length, // only actually used for admins
      "profile.notifications.posts": $('input[name=notifications_posts]:checked').length,
      "profile.notifications.comments": $('input[name=notifications_comments]:checked').length,
      "profile.notifications.replies": $('input[name=notifications_replies]:checked').length
    };

  
    var fileInput = document.getElementById('fileinput');
    var files = fileInput.files; // FileList object
    var fileObj
    var fileName
    //console.log('filecount ' + files.length);
    //console.log(update);
    if (files.length > 0){
      file = files[0];
	    fileObj =  Images.insert(file, function (err, fileObj) {
		    //Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
	      });
	    //var fileName = 'images-' + fileObj._id + '-' + fileObj.name();
	    fileName = fileObj.getFileRecord().url();
    }   
    
    var old_password = $target.find('[name=old_password]').val();
    var new_password = $target.find('[name=new_password]').val();

    if(old_password && new_password){
   		Accounts.changePassword(old_password, new_password, function(error){
        // TODO: interrupt update if there's an error at this point
        if(error)
          throwError(error.reason);
      });
    }
  
  //handle potential zip code change
  var zipobj = {};
  var ziptext = "";
  if (zip !== user.profile.zip){
     Session.set('zipStatus',0)
     Meteor.call('zipCheckActiveList', zip, function(error, zipobj1) {
         zipobj = zipobj1;
         //console.log(zipobj)
         if(zipobj){
               Session.set('zipStatus',1)
               zipUpdate(zipobj,user)
         }else{
               Meteor.call('zipCheckFullList', zip, function(error, zipobj1) {
                  zipobj = zipobj1;
                  //console.log(zipobj)
                  if(zipobj){
                     Session.set('zipStatus',1)
                     Meteor.call('zipSaveToActiveList', zipobj)
                     zipUpdate(zipobj,user)
                  }else{
                     Session.set('zipStatus',2)
                     throwError('Invalid zip code');
                  }

                  });
         }
         });
  }
    
    
    
   if (files.length > 0){
     if (fileName === null){
      setTimeout(updateRecord, 3000,  update, fileObj, user, 1);
      return;
     }
   }

      if (fileName !== null) 
         update = _.extend(update, {'profile.fileName':  fileName})
      //console.log(update);     
     
      Meteor.users.update(user._id, {
        $set: update
      }, function(error){
        if(error){
          throwError(error.reason);
        } else {
          throwError(i18n.t('Profile updated'));
        }
        Deps.afterFlush(function() {
          var element = $('.grid > .error');
          $('html, body').animate({scrollTop: element.offset().top});
        });
      });

    
    
    

    //Meteor.call('changeEmail', email);

  }

});

updateRecord = function (update, fileObj, user, iteration) {


    var fileName = fileObj.getFileRecord().url();

    if (fileName !== null) 
      update = _.extend(update, {'profile.fileName':  fileName})
      //console.log(update);     

   //console.log('222')	 
   if (fileName === null){
      if (iteration < 5){
       setTimeout(updateRecord, 2000,  update, fileObj, user, iteration+1);        
      }
      //console.log('333')
      return;
   }
  
  console.log('444')
  if (update) {
    //console.log('555')      
    //console.log(update)      

    Meteor.users.update(user._id, {
      $set: update
    }, function(error){
      if(error){
        throwError(error.reason);
      } else {
        throwError(i18n.t('Profile updated'));
      }
      Deps.afterFlush(function() {
        var element = $('.grid > .error');
        $('html, body').animate({scrollTop: element.offset().top});
      });
    }); 
  }

}

zipUpdate = function (zipobj, user) {

    var update = {
      "profile.zip": zipobj.zipcode,
      "profile.city": zipobj.primary_city,
      "profile.state": zipobj.state,
      "profile.county": zipobj.county,
       "profile.defaultCommName": zipobj.county + ' Region',
       "profile.defaultCommKey": 'group/countiesregion/US/'+zipobj.state+'/'+zipobj.county

    };

   //console.log(update); 

  if (update) {


    Meteor.users.update(user._id, {
      $set: update
    }, function(error){
      if(error){
        throwError(error.reason);
      } else {
        throwError(i18n.t('Location updated'));
      }
      Deps.afterFlush(function() {
        var element = $('.grid > .error');
        $('html, body').animate({scrollTop: element.offset().top});
      });
    }); 
  }
 

}