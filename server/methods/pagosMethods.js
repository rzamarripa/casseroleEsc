Meteor.methods({
	imprimirTicket: function (seccion_id, folioActual, alumno_id) {
		var secciones = Secciones.findOne({_id : seccion_id});
		var pagos = Pagos.find({ seccion_id : seccion_id, folioActual : parseInt(folioActual)}).fetch();
		var alumno = Meteor.users.findOne({_id : alumno_id});
		var planPagos = PlanPagos.find({seccion_id : seccion_id, pago_id : { $in : _.pluck(pagos, "_id")}}).fetch();
		var arreglo = [
						secciones, 
						pagos,
						alumno,
						_.pluck(planPagos, "semana")
						]
		return arreglo;
	},
	
	
});