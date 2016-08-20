Meteor.publish("llamadas", function(options){
	return Llamadas.find(options);
});