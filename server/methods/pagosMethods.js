Meteor.methods({
	imprimirTicket: function (seccion_id, folioActual, alumno_id) {
		var arreglo = [
						Secciones.findOne({_id : seccion_id}), 
						Pagos.find({ seccion_id : seccion_id, folioActual : parseInt(folioActual)}).fetch(),
						Meteor.users.findOne({_id : alumno_id})]
		return arreglo;
	},
	
	
});