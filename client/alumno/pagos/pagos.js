angular.module("casserole")
.controller("AlumnoPagosCtrl",AlumnoPagosCtrl)
function AlumnoPagosCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
  let rc = $reactive(this).attach($scope);
	
	this.subscribe('inscripciones', () => {
		return [{
			alumno_id : Meteor.userId(),
			campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
		}];
	});
	
	this.subscribe("grupos",() => {
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }];
	});
	
	this.subscribe("planPagos",()=>{
		return [{alumno_id : Meteor.userId()}]
	});
	
	this.subscribe('pagosAlumno', () => {
		return [{
			alumno_id : Meteor.userId()
		}];
	});
	
	this.helpers({
		misPagos : () => {
			return PlanPagos.find();
		},
		inscripciones : () =>{
			var ins = Inscripciones.find({
				alumno_id : Meteor.userId(),
				campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
			}).fetch();
			
			if(ins != undefined){
				_.each(ins, function(inscripcion){
					inscripcion.pagos = PlanPagos.find({inscripcion_id : inscripcion._id}).fetch();
				})
			}
			return ins;
		}
	});
	
	this.obtenerEstatus = function(cobro, plan){	
		var i = cobro.numeroPago - 1;
		var fechaActual = new Date();
		var fechaCobro = new Date(cobro.fecha);
		var diasRecargo = Math.floor((fechaActual-fechaCobro) / (1000 * 60 * 60 * 24)); 
		var diasDescuento = Math.floor((fechaCobro-fechaActual) / (1000 * 60 * 60 * 24));
		var concepto = plan.colegiatura[cobro.tipoPlan]; 
		
		if(cobro.pagada == 1){
			return "bg-color-green txt-color-white";
		}
		else if(cobro.pagada == 2){
			return "bg-color-blue txt-color-white";
		}
		else if(cobro.pagada == 5){
			return "bg-color-blueDark txt-color-white";
		}
		else if(cobro.pagada == 6){
			return "bg-color-greenLight txt-color-white";
		}
		else if(diasRecargo > concepto.diasRecargo){
			return "bg-color-orange txt-color-white";
		}
		return "";
	}
		
	this.grupo = function (grupoId){
		var _grupo = Grupos.findOne(grupoId);
		return _grupo;
	}
};