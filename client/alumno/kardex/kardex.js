angular
	.module('casserole')
	.controller('AlumnoKardexCtrl', AlumnoKardexCtrl);
 
function AlumnoKardexCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
	rc = $reactive(this).attach($scope);
	window.rc = rc;
	
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
			return Inscripciones.find({
				alumno_id : Meteor.userId(),
				campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
			});
		},
		curriculas : () => {
			if(this.getReactively("inscripciones")){
				console.log("entre");
				_.each(rc.inscripciones, function(inscripcion){
					rc.planEstudios_id.push(inscripcion.planEstudios_id);
				})
				console.log("plan", rc.planEstudios_id);
				return Curriculas.find();
			}			
		}
	});
}