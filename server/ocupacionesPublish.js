Meteor.publish("ocupaciones", function(params){
	return Ocupaciones.find(params);
});