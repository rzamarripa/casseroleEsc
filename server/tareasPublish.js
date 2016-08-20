Meteor.publish("tareas", function(options){
	return Tareas.find(options);
});