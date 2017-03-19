Meteor.methods({
	buscarProspectosGerente : function(options){
		if(options.where.nombreCompleto.length > 0){			
			result = [];
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
			
			result[0] = prospectos;
			result[1] = EtapasVenta.find({estatus : true, campus_id : options.where.campus_id}).fetch();
			result[2] = Meteor.users.find({roles : ["vendedor"], "profile.campus_id" : options.where.campus_id},{ fields : {"profile.nombre" : 1, "profile.apPaterno" : 1}}).fetch();
			return result;
		}
	}
});