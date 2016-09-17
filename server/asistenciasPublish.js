Meteor.publish("asistencias", function(options){
	return Asistencias.find(options);
});

Meteor.publish("asistencia", function(){
	return Asistencias.find();
});

Meteor.publish("asistenciasr", function(options,pr){
	return Asistencias.find(options,pr);
});
