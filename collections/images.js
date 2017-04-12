Images = new FS.Collection("images", {
  
  //Change for MUP DEPLOY//
  
  stores: [new FS.Store.FileSystem("images", {path: "~/uploads"})]
});

Deps.autorun(function () {
    Meteor.subscribe('myImages');
});

Images.allow({
  insert: canPostById,
  update: canEditById,
  remove: canEditById,
  download: function() {
      return true;
      }
});


