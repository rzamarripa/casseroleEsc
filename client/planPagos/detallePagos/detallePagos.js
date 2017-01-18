angular
.module("casserole")
.controller("DetallePagosCtrl", DetallePagosCtrl);
function DetallePagosCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	let rc = $reactive(this).attach($scope);
	window.rc = rc;

	this.semanas = [];
	for(var i = 1; i <= 52; i++){
		this.semanas.push(i);
	}
	
	this.alumnos_id = [];
	this.semanaActual = moment(new Date()).isoWeek();
	this.anio = moment().get('year');
	this.totalPagos = 0.00;
	
	this.subscribe('pagosPorSemana',()=>{
		var query = {campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "", semanaPago : parseInt(this.getReactively("semanaActual")), estatus : 1, anioPago : parseInt(this.getReactively("anio"))};
		return [query]
	});
	  
  this.subscribe('grupos', () => {
		return [{estatus : true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""}];
	});

  this.helpers({
	  pagosPorSemana : () => {
		  var pagos = PlanPagos.find().fetch();
		  var pagosPorGrupo = {};
		  var arreglo = {};
		  if(pagos){
			  _.each(pagos, function(pago){
				  rc.alumnos_id.push(pago.alumno_id);
			  });
			  
				_.each(pagos, function(pago){
					//Listado de Pagos realizados
					if(undefined == arreglo[pago.alumno_id]){
						arreglo[pago.alumno_id] = {};
						arreglo[pago.alumno_id].semanasPagadas = [];
						arreglo[pago.alumno_id].alumno = Meteor.users.findOne({_id : pago.alumno_id});
						arreglo[pago.alumno_id].semanasPagadas.push(pago.semana);
						arreglo[pago.alumno_id].tipoPlan = pago.tipoPlan;
						arreglo[pago.alumno_id].fechaPago = pago.fechaPago;
					}else{
						arreglo[pago.alumno_id].semanasPagadas.push(pago.semana);
					}
				});

		  }

		  return arreglo;
	  },
  });
  
 
}

//XFSrD4ZL34Dn8nG2Q