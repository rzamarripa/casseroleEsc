angular
  .module('casserole')
  .controller('DashboardCtrl', DashboardCtrl);
 
function DashboardCtrl($scope, $meteor, $reactive, $state, toastr) {
	let rc = $reactive(this).attach($scope);
	window.rc = rc;
	
	this.alumnos_id = [];

  this.subscribe("inscripciones",()=>{
		return [{estatus : 1, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	this.subscribe('campus',()=>{
		return [{_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	this.subscribe('pagosPorSemana',()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "", semanaPago : moment().isoWeek(), pagada : 1}]
	});
	
	this.subscribe('alumnos', () => {		
		return [{_id : { $in : this.getCollectionReactively('alumnos_id')}}]
	});

  this.helpers({
	  inscripcionesActivas : () => {
		  return Inscripciones.find().count();
	  },
	  campus : () => {
		  return Campus.findOne();
	  },
	  semanales : () => {
		  return Inscripciones.find({"planPagos.colegiatura.tipoColegiatura" : "Semanal"}).count();
	  },
	  quincenales : () => {
		  return Inscripciones.find({"planPagos.colegiatura.tipoColegiatura" : "Quincenal"}).count();
	  },
	  mensuales : () => {
		  return Inscripciones.find({"planPagos.colegiatura.tipoColegiatura" : "Mensual"}).count();
	  },
	  pagosPorSemana : () => {
		  var pagos = PlanPagos.find({campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "", semanaPago : moment().isoWeek(), pagada : 1}).fetch();		  
		  var arreglo = {};
		  if(pagos){
			  _.each(pagos, function(pago){
				  rc.alumnos_id.push(pago.alumno_id);
			  });
			  
				_.each(pagos, function(pago){
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
		  console.log("arreglo", _.toArray( arreglo));
		  return arreglo;
	  }
  });
}

//XFSrD4ZL34Dn8nG2Q