Meteor.publish("aulas",function(options){
  	return Aulas.find(options);
});