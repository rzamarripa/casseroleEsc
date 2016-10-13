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
	
	this.purgarEventos = function(calendario_id){
		var c = confirm("Está seguro de querer eliminar los eventos pasados.");
		if(c){
			var calendario = Calendarios.findOne(calendario_id);
			var eliminados = 0;
			var now = new Date();
			for(var i = 0; i < calendario.eventos.length; i++){
				var end = new Date(calendario.eventos[i].end);				
				if(end < now){
					eliminados++;
					calendario.eventos.splice(i,1);
					i--;
				}
			}
			
			Calendarios.update(calendario._id,{ $set : {"eventos" : calendario.eventos}});
			toastr.success("Se purgaron " + eliminados + " eventos.")
		}else{
			toastr.error("Se canceló la operación");
		}
		
	}
};