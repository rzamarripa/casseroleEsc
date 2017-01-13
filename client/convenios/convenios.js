angular
.module("casserole")
.controller("ConveniosCtrl", ConveniosCtrl);
function ConveniosCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
	this.nuevo = true;
	this.action = true;
	this.fechaActual = moment();
  
  this.subscribe('alumno', () => {
		return [{
			id : $stateParams.alumno_id,
			campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
		}];
	});
	
  this.subscribe("planPagos",()=>{
		return [{alumno_id : $stateParams.alumno_id, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	this.helpers({
		alumno : () => {
			var al = Meteor.users.findOne({_id : $stateParams.alumno_id});
			if(al){
				this.ocupacion_id = al.profile.ocupacion_id;
				return al;
			}			
		},
		planPagos : () => {
			 return PlanPagos.find().fetch();
/*
			 _.each(planes, function(p){
				 PlanPagos.update({_id : p._id}, { $set : { importe : 500}})
			 })
*/
		}
	});
	
	this.editar = function(pago)
	{
	    this.pago = pago;
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.actualizar = function(pago,form)
	{
			if(form.$invalid){
        toastr.error('Error al actualizar los datos.');
        return;
		  }
			var idTemp = pago._id;
			delete pago._id;		
			pago.usuarioActualizo = Meteor.userId(); 
			pago.convenio = 1;
			PlanPagos.update({_id:idTemp},{$set:pago});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
	};
	
	this.tieneFoto = function(sexo, foto){
		if(foto === undefined){
			if(sexo === "masculino")
				return "img/badmenprofile.jpeg";
			else if(sexo === "femenino"){
				return "img/badgirlprofile.jpeg";
			}else{
				return "img/badprofile.jpeg";
			}
		}else{
			return foto;
		}
	}
};