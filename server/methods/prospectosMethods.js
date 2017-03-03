Meteor.methods({
	buscarProspectosGerente : function(options){
		if(options.where.nombreCompleto.length > 0){			
			let selector = {
		  	"profile.nombreCompleto": { '$regex' : '.*' + options.where.nombreCompleto || '' + '.*', '$options' : 'i' },
		  	"profile.campus_id": options.where.campus_id
			}
			
			var prospectos = Prospectos.find(selector, options.options).fetch();	
			_.each(prospectos, function(prospecto){
				prospecto.profile.ocupacion = Ocupaciones.findOne(prospecto.profile.ocupacion_id);
				prospecto.profile.vendedor = Meteor.users.findOne(prospecto.profile.vendedor_id);
				prospecto.profile.etapaVenta = EtapasVenta.findOne(prospecto.profile.etapaVenta_id);
			});
			
			return prospectos;
		}
	}
});