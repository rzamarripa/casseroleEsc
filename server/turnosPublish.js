Meteor.publish("turnos", function(options){
	return Turnos.find(options);
});