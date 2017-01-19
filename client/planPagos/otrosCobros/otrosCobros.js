angular
.module("casserole")
.controller("OtrosCobrosCtrl", OtrosCobrosCtrl);
function OtrosCobrosCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
  this.semanaActual = moment().isoWeek();
  this.anioActual = moment().get("year");
  this.fechaInicial = new Date();
  this.fechaFinal = new Date();
  this.otrosCobros = [];
  this.totales = 0.00;
  
  this.subscribe('todosUsuarios',()=>{
		return [{seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }]
	});
	
	this.helpers({
		usuarios : () => {
			var usuarios = Meteor.users.find().fetch();
			if(usuarios != undefined){
				_.each(usuarios, function(usuario, index){
					if(usuario.profile.seccion_id != Meteor.user().profile.seccion_id){
						usuarios.splice(index, 1);
					}
				})
			}
			return usuarios;			
		}
	});
	
	this.calcularCobros = function(fechaInicial, fechaFinal, usuario_id, form){
		if(form.$invalid){
			toastr.error('Error al enviar los datos, por favor llene todos los campos.');
			return;
    }
		this.totales = 0.00;
		Meteor.apply('historialOtrosCobros', [this.fechaInicial, this.fechaFinal, Meteor.user().profile.seccion_id, usuario_id], function(error, result){
		  _.each(result, function(cobro){
			  rc.totales += cobro.importe;
		  })
		  rc.otrosCobros = result;
	    $scope.$apply();
	  });
	}
	
	this.calcularSemana = function(w, y) {
    var simple = new Date(y, 0, 1 + (w - 1) * 7);
    rc.fechaInicial = new Date(simple);
    rc.fechaFinal = new Date(moment(simple).add(7,"days"));
	}
};