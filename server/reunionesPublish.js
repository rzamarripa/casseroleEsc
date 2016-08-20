Meteor.publish("reuniones", function(options){
	return Reuniones.find(options);
});