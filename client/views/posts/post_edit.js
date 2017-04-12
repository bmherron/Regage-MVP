Template[getTemplate('post_edit')].helpers({
  isProject: function() {
     return (this.postType ? this.postType : 1) == '2';     
  }, 
  photoLink: function(){
    return !!this.fileName ? "" + this.fileName : "/img/placeholder.jpeg";
  },
  nonProfitDocLink: function(){
    return !!this.nonProfitDoc ? "" + this.nonProfitDoc : "#";
  },
  nonProfitDocLabel: function(){
    return (!!this.nonProfitDoc ? "" + this.nonProfitDoc : "#") == "#" ? "" : "download";
  },
  isNonProfit: function(){
    return this.nonProfit ? 'checked' : '';
  },
  isNonProfitApproved: function(){
    return this.nonProfitApproved ? 'checked' : '';
  },
  postTypeInLabel: function(){
    if ((this.postType ? this.postType : 1) == 1){
      return ('Engage');
    }
    if ((this.postType ? this.postType : 1) == 2){
      return ('Project');
    }
    return 'Post';
  },  
  created: function(){
    return moment(this.createdAt).format("MMMM Do, h:mm:ss a");
  },
  categories: function(){
    var post = this;
    return Categories.find({}, {sort: {order: 1, name: 1}}).map(function(category) {
      category.checked = _.contains(_.pluck(post.categories, '_id'), category._id) ? 'checked' : '';
      return category;
    });
  },
  categoriesEnabled: function(){
    return Categories.find().count();
  },
  showPostedAt: function () {
    if((Session.get('currentPostStatus') || this.status) == STATUS_APPROVED){
      return 'visible'
    }else{
      return 'hidden'
    }
  },
  isSticky: function(){
    return this.sticky ? 'checked' : '';
  },
  isSelected: function(parentPost){
    return parentPost && this._id == parentPost.userId ? 'selected' : '';
  },
  postedAtDate: function(){
    return !!this.postedAt ? moment(this.postedAt).format("MM/DD/YYYY") : null;
  },
  postedAtTime: function(){
    return !!this.postedAt ? moment(this.postedAt).format("HH:mm") : null;
  },
  users: function(){
    return Meteor.users.find({}, {sort: {'profile.name': 1}});
  },
  userName: function(){
    return getDisplayName(this);
  },
  hasStatusPending: function(){
    return this.status == STATUS_PENDING ? 'checked' : '';
  },
  hasStatusApproved: function(){
    return this.status == STATUS_APPROVED ? 'checked' : '';
  },
  hasStatusRejected: function(){
    return this.status == STATUS_REJECTED ? 'checked' : '';
  },
  shorten: function(){
    return !!getSetting('bitlyToken');
  },
  hasFundingGoal: function(){
    return this.fundingGoal != '0';
  },
  fundingHidden: function(){
    if ((this.postType ? this.postType : 1) == 2){
      return '';
    }else{
      return 'hidden';
    }
  },
  fundingStatusHidden: function(){
    if ((this.postType ? this.postType : 1) == 2){
      return this.fundingGoal == '0' ? 'hidden' : '';
    }else{
      return 'hidden';
    }
  },
  isFundingStatusActive: function(){
    return this.fundingStatus == 'active' ? 'checked' : '';
  },

});

Template[getTemplate('post_edit')].rendered = function(){
  // run all post edit rendered callbacks
  var instance = this;
  postEditRenderedCallbacks.forEach(function(callback) {
    callback(instance);
  });

  Session.set('currentPostStatus', this.status);

  var post = this.data.post;
  //if(post && !this.editor){
   // this.editor= new EpicEditor(EpicEditorOptions).load();
   // this.editor.importFile('editor', post.body);

    $('#postedAtDate').datepicker();

 // }


  // $("#postUser").selectToAutocomplete(); // XXX

};

Template[getTemplate('post_edit')].events({
  'change input[name=status]': function (e, i) {
    Session.set('currentPostStatus', e.currentTarget.value);
  },
  'click input[type=submit]': function(e, instance){
    var post = this;

    e.preventDefault();

    $(e.target).addClass('disabled');

    if(!Meteor.user()){
      throwError('You must be logged in.');
      return false;
    }

    // ------------------------------ Properties ------------------------------ //

    // Basic Properties

    var body = $('#body').val();
    var tagLine = $('#tagLine').val();

    var properties = {
      title: $('#title').val(),
      body: $('#body').val(),
      bodyWho: $('#bodyWho').val(),
      bodyWhere: $('#bodyWhere').val(),
      bodyWhat: $('#bodyWhat').val(),
      tagLine: $('#tagLine').val(),
      nonProfit: $('#nonProfit').is(':checked')
    };
    
    
    var fundingGoalUpdate = $('#fundingGoal').val();
    var fundingDurationUpdate = $('#fundingDuration').val();

    var fundingStatusUpdate = $('#fundingStatus').is(':checked') ? 'active' : 'inactive';
    if (post.fundingGoal == '0' && fundingGoalUpdate != 0){
      fundingStatusUpdate = 'active';
    }
    
    if (fundingGoalUpdate != '0'){
      properties.fundingFlag = true;
      properties.fundingStatus = fundingStatusUpdate;
      properties.fundingGoal = fundingGoalUpdate;
      properties.fundingDuration = fundingDurationUpdate;
    }else{
      properties.fundingFlag = false;
      properties.fundingGoal = '0';
      properties.fundingDuration = '30';
      properties.fundingTotal = 0;
      properties.fundingCount = 0;
      properties.fundingAt = "";
      properties.fundingStatus = "inactive";
      properties.fundingAccount = "";
    }

    
    // URL

    var url = $('#url').val();
    if(!!url){
      properties.url = (url.substring(0, 7) == "http://" || url.substring(0, 8) == "https://") ? url : "http://"+url;
    }

    // ShortURL

    var shortUrl = $('#short-url').val();
    if(!!shortUrl)
        properties.shortUrl = shortUrl;

    // ------------------------------ Admin Properties ------------------------------ //


    if(isAdmin(Meteor.user())){

      // Basic Properties

      adminProperties = {
        sticky:     $('#sticky').is(':checked'),
        userId:     $('#postUser').val(),
        nonProfitApproved: $('#nonProfitApproved').is(':checked')
      };

      // Status

      adminProperties.status = parseInt($('input[name=status]:checked').val());

      properties = _.extend(properties, adminProperties);

      // PostedAt

      if(adminProperties.status == STATUS_APPROVED){  

        var $postedAtDate = $('#postedAtDate');
        var $postedAtTime = $('#postedAtTime');
        var setPostedAt = false;
        var postedAt = new Date(); // default to current browser date and time
        var postedAtDate = $postedAtDate.datepicker('getDate');
        var postedAtTime = $postedAtTime.val();

        if($postedAtDate.exists() && postedAtDate != "Invalid Date"){ // if custom date is set, use it
          postedAt = postedAtDate;
          setPostedAt = true;
        }

        if($postedAtTime.exists() && postedAtTime.split(':').length==2){ // if custom time is set, use it
          var hours = postedAtTime.split(':')[0];
          var minutes = postedAtTime.split(':')[1];
          postedAt = moment(postedAt).hour(hours).minute(minutes).toDate();
          setPostedAt = true;
        }

        if(setPostedAt){ // if either custom date or time has been set, pass result to method
          Meteor.call('setPostedAt', post, postedAt); // use a method to guarantee timestamp integrity
        }else{
          Meteor.call('setPostedAt', post);
        }
      }
    }

    // ------------------------------ Callbacks ------------------------------ //

    // run all post edit client callbacks on properties object successively
    properties = postEditClientCallbacks.reduce(function(result, currentFunction) {
        return currentFunction(result);
    }, properties);

    // console.log(properties)

    
    
   
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
	      properties.fileName = post.fileName ? post.fileName: "";
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
        properties.nonProfitDoc = post.nonProfitDoc ? post.nonProfitDoc: "";
    }
    // console.log(properties)    
    
    // ------------------------------ Insert ------------------------------ //
    //insertRecord(properties, e, fileObj)
    setTimeout(updateRecord, 3000,  post, properties, e, fileObj, npFileObj);
    
    
    // ------------------------------ Update ------------------------------ //



  },
  'click .delete-link': function(e){
    var post = this;

    e.preventDefault();
    
    if(confirm("Are you sure?")){
      Router.go("/");
      Meteor.call("deletePostById", post._id, function(error) {
        if (error) {
          console.log(error);
          throwError(error.reason);
        } else {
          throwError('Your post has been deleted.');
        }
      });
    }
  }
});


var updateRecord = function (post, properties, e, fileObj, npFileObj) {
 
   if (properties.fileName == null){
	   var fileName = fileObj.getFileRecord().url();
	   properties.fileName = fileName;
   }
   if (properties.nonProfitDoc == null){
	   var npFileName = npFileObj.getFileRecord().url();
	   properties.nonProfitDoc = npFileName;
   }
	 
   if (properties.fileName === null || properties.nonProfitDoc === null){
      setTimeout(updateRecord, 2000,  post, properties, e, fileObj, npFileObj);

   }else{
      if (properties) {      
      Posts.update(post._id,{
        $set: properties
          }, function(error){
            if(error){
              console.log(error);
              throwError(error.reason);
              clearSeenErrors();
              $(e.target).removeClass('disabled');
            }else{
              trackEvent("edit post", {'postId': post._id});
              Router.go("/posts/"+post._id);
            }
          });
      } else {
        $(e.target).removeClass('disabled');
      }
    }



};


