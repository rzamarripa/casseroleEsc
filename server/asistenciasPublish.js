Meteor.publish("asistencias", function(options){
	return Asistencias.find(options);
});

Meteor.publish("asistencia", function(){
	return Asistencias.find();
});