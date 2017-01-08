angular
  .module('casserole')
  .controller('DashboardCtrl', DashboardCtrl);
 
function DashboardCtrl($scope, $meteor, $reactive, $state, toastr) {
	let rc = $reactive(this).attach($scope);
	window.rc = rc;

  this.subscribe("inscripciones",()=>{
		return [{estatus : 1, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	this.subscribe('campus',()=>{
		return [{_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	this.subscribe('pagosPorSemana',()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "", semanaPago : moment().isoWeek(), pagada : 1 }]
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
		  return Pagos.find();
	  }
  });
}

//XFSrD4ZL34Dn8nG2Q