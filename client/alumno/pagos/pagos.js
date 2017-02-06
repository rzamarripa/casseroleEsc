angular.module("casserole")
.controller("AlumnoPagosCtrl",AlumnoPagosCtrl)
function AlumnoPagosCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
  let rc = $reactive(this).attach($scope);
  
	this.cantPendientes = 0;
	this.cantCondonadas = 0;
	this.cantCanceladas = 0;
	this.cantAtrasadas 	= 0;
	this.cantPagadas 		= 0;

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
			this.cantPagadas 		= PlanPagos.find({estatus : 1}).count();
			this.cantPendientes = PlanPagos.find({estatus : 0}).count();
			this.cantCondonadas = PlanPagos.find({estatus : 3}).count();
			this.cantAbonados = PlanPagos.find({estatus : 6}).count();
			this.cantCanceladas = PlanPagos.find({estatus : 2}).count();
			this.cantAtrasadas 	= PlanPagos.find({$and : [ {estatus : 0}, { $or : [{anio : {$lt : this.anioActual}}, 
																										 { $and : [{ semana : { $lt : this.semanaPago}}, { anio : this.anioActual}]}]}]}).count();
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
		if(cobro.estatus == 1){
			return "bg-color-green txt-color-white";
		}			
		if(cobro.estatus == 5 || cobro.tmpestatus==5)
			return "bg-color-blue txt-color-white";
		else if(cobro.estatus == 0 && (cobro.semana >= this.semanaPago && cobro.anio >= this.anioActual)){
		}
		else if(cobro.estatus == 3){
			return "bg-color-blueDark txt-color-white";	
		}
		else if(cobro.estatus == 2){
			return "bg-color-red txt-color-white";
		}
		else if(cobro.estatus == 6){
			return "bg-color-greenLight txt-color-white";
		}
		else if(cobro.tiempoPago == 1 || cobro.anio < this.anioActual || (cobro.semana < this.semanaPago && cobro.anio == this.anioActual)){
			return "bg-color-orange txt-color-white";
		}
	}
		
	this.grupo = function (grupoId){
		var _grupo = Grupos.findOne(grupoId);
		return _grupo;
	}
};