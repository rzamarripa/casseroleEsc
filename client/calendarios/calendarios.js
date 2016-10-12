angular
  .module('casserole')
  .controller('CalendariosCtrl', CalendariosCtrl);
 
function CalendariosCtrl($scope, $meteor, $reactive, $state, toastr) {
	$reactive(this).attach($scope);
	
	this.subscribe("calendarios",()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});

	this.helpers({
		calendarios : () => {
			return Calendarios.find();
		}		
	});
};