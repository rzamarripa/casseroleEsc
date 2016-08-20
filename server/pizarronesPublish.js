Meteor.publish("pizarrones", function(options){
	return Pizarrones.find(options);
});