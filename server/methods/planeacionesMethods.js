Meteor.methods({
	meGustaPlaneacion : function(planeacion, alumno_id){
		planeacion.meGusta++;
		planeacion.quienMeGusta.push(alumno_id);
		planeacion.estatus = 7;
		
		var idTemp = planeacion._id;
		Planeaciones.update({_id : idTemp}, { $set : planeacion});
		return true;
	},
	meGustaPlaneacion : function(planeacion, alumno_id){
		planeacion.noMeGusta++;
		planeacion.quienNoMeGusta.push(alumno_id);
		planeacion.estatus = 7;
		
		var idTemp = planeacion._id;
		Planeaciones.update({_id : idTemp}, { $set : planeacion});
		return true;
	}
});