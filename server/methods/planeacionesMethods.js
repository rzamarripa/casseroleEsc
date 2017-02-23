Meteor.methods({
	meGustaPlaneacion : function(planeacion, alumno_id){
		var planeacion = Planeaciones.findOne({_id : planeacion._id});
		
		//verificar si no me había gustado
		_.each(planeacion.quienNoMeGusta, function(quien, index){
			if(quien == alumno_id){
				planeacion.quienNoMeGusta.splice(index, 1);
				planeacion.noMeGusta--;
			}
		})
		
		planeacion.meGusta++;
		planeacion.quienMeGusta.push(alumno_id);
		planeacion.estatus = 7;
		
		var idTemp = planeacion._id;
		Planeaciones.update({_id : idTemp}, { $set : planeacion});
		return true;
	},
	noMeGustaPlaneacion : function(planeacion, alumno_id){
		var planeacion = Planeaciones.findOne({_id : planeacion._id});
		
		//verificar si ya me había gustado
		_.each(planeacion.quienMeGusta, function(quien, index){
			if(quien == alumno_id){
				planeacion.quienMeGusta.splice(index, 1);
				planeacion.meGusta--;
			}
		})
		planeacion.noMeGusta++;
		planeacion.quienNoMeGusta.push(alumno_id);
		planeacion.estatus = 7;
		
		var idTemp = planeacion._id;
		Planeaciones.update({_id : idTemp}, { $set : planeacion});
		return true;
	}
});