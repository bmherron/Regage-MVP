Template[getTemplate('post_submit')].helpers({
  categoriesEnabled: function(){
    console.log(Meteor.user())
   
    
    return Categories.find().count();
  },
  postTypeIn: function(){
    return this.postTypeIn ? this.postTypeIn : 1;
  },
  
  isProject: function() {
 return this.postTypeIn == 2;     
  },
  
  isIssue: function() {
 return this.postTypeIn == 1;     
  },
  
  postTypeInChecked: function(val){
    if ((this.postTypeIn ? this.postTypeIn : 1) == val){
      return 'checked';
    }else{
      return '';
    }
  }, 
  postTypeInLabel: function(){
    if ((this.postTypeIn ? this.postTypeIn : 1) == 1){
      return i18n.t('Issue');
    }
    if ((this.postTypeIn ? this.postTypeIn : 1) == 2){
      return i18n.t('Project');
    }
    return 'Post';
  },  
  fundingHidden: function(){
    if ((this.postTypeIn ? this.postTypeIn : 1) == 2){
      return '';
    }else{
      return 'hidden';
    }
  },
  postIdIn: function(){
    return this.parentPostId ? this.parentPostId : '';
  },
  categories: function(){
    return Categories.find();
  },
  users: function(){
    return Meteor.users.find({}, {sort: {'profile.name': 1}});
  },
  userName: function(){
    return getDisplayName(this);
  },
  isSelected: function(user){
    return user._id == Meteor.userId() ? "selected" : "";
  },
  showPostedAt: function () {
    if(Session.get('currentPostStatus') == STATUS_APPROVED){
      return 'visible'
    }else{
      return 'hidden'
    }
    // return (Session.get('currentPostStatus') || STATUS_APPROVED) == STATUS_APPROVED; // default to approved
  }
});

Template[getTemplate('post_submit')].rendered = function(){
  this.$('.datepicker').datepicker();
  // run all post submit rendered callbacks
  var instance = this;
  postSubmitRenderedCallbacks.forEach(function(callback) {
    callback(instance);
  });

  Session.set('currentPostStatus', STATUS_APPROVED);
  Session.set('selectedPostId', null);
  if(!this.editor && $('#editor').exists())
    this.editor= new EpicEditor(EpicEditorOptions).load();

  $('#postedAtDate').datepicker();

  // $("#postUser").selectToAutocomplete(); // XXX

};

Template[getTemplate('post_submit')].events({
  'change input[name=status]': function (e, i) {
    Session.set('currentPostStatus', e.currentTarget.value);
  },
  'change input[name=postType]': function (e, i) {
    if(e.currentTarget.value==2){
        $('#fundingGoalGroup').show();
        $('#fundingGoal').val('0');
        $('#fundingDurationGroup').show();
        $('#fundingDuration').val('30');
    }else{
        $('#fundingGoalGroup').hide();
        $('#fundingGoal').val('0');
        $('#fundingDurationGroup').hide();
        $('#fundingDuration').val('30');
    }
  },
  'click input[type=submit]': function(e, instance){
    e.preventDefault();
 
    
    $(e.target).addClass('disabled');

    // ------------------------------ Checks ------------------------------ //

    if(!Meteor.user()){
      throwError(i18n.t('You must be logged in.'));
      return false;
    }

    // ------------------------------ Properties ------------------------------ //

    // Basic Properties

    var properties = {
      
      title: $('#title').val(),
      body: $('#body').val(),
      bodyWho: $('#bodyWho').val(),
      bodyWhere: $('#what').val(),
      bodyWhat: $('#story').val(),
      commList: ['city/US/'+Meteor.user().profile.state+'/'+Meteor.user().profile.city,'county/US/'+Meteor.user().profile.state+'/'+Meteor.user().profile.county, 'state/US/'+Meteor.user().profile.state],
      tagLine: $('#tagLine').val(),
      nonProfit: $('#nonProfit').is(':checked'),
      nonProfitApproved: $('#nonProfitApproved').is(':checked'),
      sticky: $('#sticky').is(':checked'),
      userId: $('#postUser').val(),
      status: parseInt($('input[name=status]:checked').val())
    };
    
    
    
    var postType = $('#postType').val();
    properties.postType = postType;
    properties.parentPostId = this.parentPostId;

    var fundingGoal = $('#fundingGoal').val();
    var fundingDuration = $('#fundingDuration').val();
    if (fundingGoal != '0'){
      properties.fundingFlag = true;
      properties.fundingTotal = 0;
      properties.fundingCount = 0;
      properties.fundingAt = "";
      properties.fundingStatus = "active";
      properties.fundingAccount = "";
      properties.fundingGoal = fundingGoal;
      properties.fundingDuration = fundingDuration;
    }else{
      properties.fundingFlag = false;
    }
    //console.log (properties);
    
    // PostedAt

    var $postedAtDate = $('#postedAtDate');
    var $postedAtTime = $('#postedAtTime');
    var setPostedAt = false;
    var postedAt = new Date(); // default to current browser date and time
    var postedAtDate = $postedAtDate.datepicker('getDate');
    var postedAtTime = $postedAtTime.val();

    if ($postedAtDate.exists() && postedAtDate != "Invalid Date"){ // if custom date is set, use it
      postedAt = postedAtDate;
      setPostedAt = true;
    }

    if ($postedAtTime.exists() && postedAtTime.split(':').length==2){ // if custom time is set, use it
      var hours = postedAtTime.split(':')[0];
      var minutes = postedAtTime.split(':')[1];
      postedAt = moment(postedAt).hour(hours).minute(minutes).toDate();
      setPostedAt = true;
    }

    if(setPostedAt) // if either custom date or time has been set, pass result to properties
      properties.postedAt = postedAt;


    // URL

    var url = $('#url').val();
    if(!!url){
      var cleanUrl = (url.substring(0, 7) == "http://" || url.substring(0, 8) == "https://") ? url : "http://"+url;
      properties.url = cleanUrl;
    }

    // ------------------------------ Callbacks ------------------------------ //

    // run all post submit client callbacks on properties object successively
    properties = postSubmitClientCallbacks.reduce(function(result, currentFunction) {
        return currentFunction(result);
    }, properties);

    
 // -------------------------------- Photo -------------------------------- //
    var fileInput = document.getElementById('fileinput');
    var files = fileInput.files; // FileList object
    var fileObj
    //console.log('filecount ' + files.length);
    if (files.length > 0){
        file = files[0];
        fileObj =  Images.insert(file, function (err, fileObj) {
          //Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
          });
	      //var fileName = 'images-' + fileObj._id + '-' + fileObj.name();
	      var fileName = fileObj.getFileRecord().url();
	      properties.fileName = fileName
    }else{
	      properties.fileName = '';
    }
    // console.log(properties)

    // -------------------------------- NonProfit Doc -------------------------------- //
    var npFileInput = document.getElementById('npfileinput');
    var npFiles = npFileInput.files; // FileList object
    var npFileObj
    //console.log('filecount ' + npFiles.length);
    if (npFiles.length > 0){
        npFile = npFiles[0];
        npFileObj =  Images.insert(npFile, function (err, npFileObj) {
          //Inserted new doc with ID npFileObj._id, and kicked off the data upload using HTTP
          });
	      //var fileName = 'images-' + fileObj._id + '-' + fileObj.name();
	      var npFileName = npFileObj.getFileRecord().url();
	      properties.nonProfitDoc = npFileName
    }else{
	      properties.nonProfitDoc = '';
    }
    // console.log(properties)    
    
    
    // ------------------------------ Insert ------------------------------ //
    //insertRecord(properties, e, fileObj)
    setTimeout(insertRecord, 3000,  properties, e, fileObj, npFileObj);

  },
  'click .get-title-link': function(e){
    e.preventDefault();
    var url=$("#url").val();
    var $getTitleLink = $(".get-title-link");
    $getTitleLink.addClass("loading");
    //if(url){
      $.get(url, function(response){
          if ((suggestedTitle=((/<title>(.*?)<\/title>/m).exec(response.responseText))) != null){
              $("#title").val(suggestedTitle[1]);
          }else{
              alert("Sorry, couldn't find a title...");
          }
          $getTitleLink.removeClass("loading");
       });
    //}else{
    //  alert("Please fill in an URL first!");
    //  $getTitleLink.removeClass("loading");
    //}
  }

});



var insertRecord = function (properties, e, fileObj, npFileObj) {
   console.log(properties)
   if (properties.fileName == null){
	   var fileName = fileObj.getFileRecord().url();
	   properties.fileName = fileName;
   }
   if (properties.nonProfitDoc == null){
	   var npFileName = npFileObj.getFileRecord().url();
	   properties.nonProfitDoc = npFileName;
   }
	 
   if (properties.fileName === null || properties.nonProfitDoc === null){
      setTimeout(insertRecord, 2000,  properties, e, fileObj, npFileObj);

   }else{
	   if (properties) {
	      Meteor.call('post', properties, function(error, post) {
		if(error){
		  throwError(error.reason);
		  clearSeenErrors();
		  $(e.target).removeClass('disabled');
		  if(error.error == 603)
		    Router.go('/posts/'+error.details);
		}else{
		  trackEvent("new post", {'postId': post._id});
		  if(post.status === STATUS_PENDING)
		    throwError('Thanks, your post is awaiting approval.');
      console.log('postid ' + post._id)
      console.log('properties.parentPostId ' + properties.parentPostId)
      
      var shareHtml = '    <a class="mt-facebook mt-share-inline-square-sm" '
      shareHtml = shareHtml + 'href="https://www.facebook.com/sharer/sharer.php?u=' +   getSiteUrl() + "posts/" + post._id + '" target="_blank"><img src="//mojotech-static.s3.amazonaws.com/facebook@2x.png"></a>'
    shareHtml = shareHtml + '<a class="mt-twitter mt-share-inline-square-sm" href="//twitter.com/intent/tweet?text=' + post.title + '&url=' +   getSiteUrl() + "posts/" + post._id + '&" target="_blank"><img src="//mojotech-static.s3.amazonaws.com/twitter@2x.png"></a>'
    shareHtml = shareHtml + '<a class="mt-linkedin mt-share-inline-square-sm" href="//www.linkedin.com/shareArticle?mini=true&url=' +   getSiteUrl() + "posts/" + post._id + '&amp;summary=' + post.title + '" target="_blank"><img src="//mojotech-static.s3.amazonaws.com/linkedin@2x.png"></a>'
    shareHtml = shareHtml + '<a class="mt-google mt-share-inline-square-sm" href="https://plus.google.com/share?url=' +   getSiteUrl() + "posts/" + post._id + '" target="_blank"><img src="//mojotech-static.s3.amazonaws.com/google@2x.png"></a>'
      
      
		  if (properties.parentPostId){
        console.log('properties.parentPostId ' + properties.parentPostId)
        Posts.update(properties.parentPostId, {$inc: {related2Count: 1}})
        bootbox.alert( '<img src="/img/re-beta.svg" id="bootbox_regage" style="height:150px; margin-left:auto; margin-right:auto; display:block"> <span style="float:right; text-align:center; font-size:18px"> Congrats! Be sure to share your project and click OK to continue.</span> <br/><br/>' + shareHtml)
        Router.go('/posts/'+properties.parentPostId+'/posttype/2');
      }else{
        console.log('postid ' + post._id)
        bootbox.alert( '<img src="/img/re-beta.svg" id="bootbox_regage" style="height:150px; margin-left:auto; margin-right:auto; display:block"> <span style="float:right; text-align:center; font-size:18px"> Congrats! Be sure to share your project and click OK to continue.</span> <br/><br/>' + shareHtml)
        Router.go('/posts/'+post._id);        
      }
		}
	      });
	    } else {
	      $(e.target).removeClass('disabled');      
	    }
    }


};

