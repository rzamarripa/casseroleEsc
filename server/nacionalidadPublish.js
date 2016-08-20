Meteor.publish("nacionalidades",function(params){
  	return Nacionalidades.find(params);
});

