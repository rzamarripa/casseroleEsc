angular
  .module('casserole')
  .controller('HorariosCtrl', HorariosCtrl);
 
function HorariosCtrl($scope, $meteor, $reactive, $state, toastr) {
	$reactive(this).attach($scope);
	
	this.subscribe("horarios",()=>{
		return [{seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }]
	});

	this.helpers({
		horarios : () => {
			return Horarios.find();
		}		
	});
	
};