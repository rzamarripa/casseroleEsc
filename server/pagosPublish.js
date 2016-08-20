Meteor.publish("pagos", function(params){
	return Pagos.find(params);
});

Meteor.publish("pagosAlumno",function(options){
  return Pagos.find({alumno_id: options.alumno_id});
});

Meteor.publish("pagosTotales", function(options){
	return Pagos.aggregate([{$group:{_id:{alumno_id: options.alumno_id}, total:{$sum:"$importe"},pagos:{$sum:1}}}]);
});

Meteor.publish("pago",function(options){
  return Alumnos.find(options.id);
});