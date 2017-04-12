Template[getTemplate('contactform')].events({
  'click #submitButton': function(e){
    e.preventDefault();
  console.log( $('#name').val() + '<br/>' + $('#email').val() + '<br/>' + $('#message').val())
  Meteor.call('sendEmailCall','ben@regage.co', 'Contact from Regage', $('#name').val() + '<br/>' + $('#email').val() + '<br/>' + $('#message').val());
    
   bootbox.alert('Thank you for your message!',
                function() {
                    $('.bootbox-close-button', window.parent.document).click(); 
                     }
                );     
    
    

    
//  $('.bootbox-close-button', window.parent.document).click();  
  }
});