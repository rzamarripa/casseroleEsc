Meteor.publish("horarios", function(options){
	return Horarios.find(options);
});