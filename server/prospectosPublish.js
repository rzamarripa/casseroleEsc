Meteor.publish("prospecto", function(options){
	return Prospectos.find(options);
});
//TODO no he podido hacer que filtre por etapa de venta
Meteor.publish("prospectos",function(options){
	let selector = {
  	nombre: { '$regex' : '.*' + options.where.nombre || '' + '.*', '$options' : 'i' },
  	etapaVenta_id : options.where.etapaVenta_id,
  	vendedor_id: options.where.vendedor_id
	}	
	return Prospectos.find(selector, options.options); 
});

Meteor.publish("prospectosStaff",function(options){
	let selector = {
  	nombre: { '$regex' : '.*' + options.where.nombre || '' + '.*', '$options' : 'i' },
  	estatus: options.where.estatus,
  	empleado_id: options.where.empleado_id
	}	
	return Prospectos.find(selector, options.options);
});

Meteor.publish("prospectosSeguimiento",function(options){
	let selector = {
  	nombre: { '$regex' : '.*' + options.where.nombre || '' + '.*', '$options' : 'i' }
	}	
	return Prospectos.find(selector, options.options);
});

Meteor.publish("prospectosPorVendedor",function(options){
	return Prospectos.find(options); 
});

Meteor.publish("prospectosPorInscribir",function(options){
	return Prospectos.find(options); 
});