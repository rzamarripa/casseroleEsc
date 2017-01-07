Meteor.publish("mediosPublicidad",function(params){
  	return MediosPublicidad.find(params);
});

