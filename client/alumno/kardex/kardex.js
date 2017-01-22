angular
	.module('casserole')
	.controller('AlumnoKardexCtrl', AlumnoKardexCtrl);
 
function AlumnoKardexCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
	rc = $reactive(this).attach($scope);
	
	this.planEstudios_id = [];
	
	this.subscribe("curriculas",()=>{
		return [{
			estatus:true, 
			alumno_id : Meteor.userId(), 
			planEstudios_id : { $in : this.getCollectionReactively("planEstudios_id")}}]
	});
	
	this.subscribe('inscripciones', () => {
		return [{
			alumno_id : Meteor.userId(),
			campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
		}];
	});
	
	this.helpers({
		inscripciones : () =>{
			var inscripciones = Inscripciones.find({
				alumno_id : Meteor.userId(),
				campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
			});
			if(inscripciones){
				return inscripciones;
			}
		},
		curriculas : () => {
			return Curriculas.find();
		},
		planEstudios_id : () => {
			if(this.getReactively("inscripciones")){
				planEstudios_ids = [];
				_.each(rc.inscripciones, function(inscripcion){
					planEstudios_ids.push(inscripcion.planEstudios_id);
				})
			}
			return planEstudios_ids;
		}
	});
}