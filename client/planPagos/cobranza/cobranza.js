angular
.module("casserole")
.controller("CobranzaCtrl", CobranzaCtrl);
function CobranzaCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
  this.semanaActual = moment().isoWeek();
  this.anioActual = moment().get("year");
  this.fechaInicial = new Date();
  this.fechaFinal = new Date();
  this.otrosCobros = [];
  this.totales = 0.00;
  this.modulo = "todos";
  
  this.subscribe('todosUsuarios',()=>{
		return [{seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }]
	});
	
	this.helpers({
		usuarios : () => {
			return Meteor.users.find().fetch();
		},
		usuariosSeccion : () => {
			var usuariosDeAqui = [];
			if(this.getReactively("usuarios") != undefined){
				_.each(rc.getReactively("usuarios"), function(usuario, index){
					if(usuario.profile.seccion_id == Meteor.user().profile.seccion_id){
						usuariosDeAqui.push(usuario);
					}
				})
			}
			return usuariosDeAqui;
		}
	});
	
	this.calcularCobros = function(fechaInicial, fechaFinal, usuario_id, form){
		NProgress.set(0.5);
		if(form.$invalid){
			toastr.error('Error al enviar los datos, por favor llene todos los campos.');
			NProgress.set(1);
			return;
    }
		this.totales = 0.00;
		Meteor.apply('historialCobranza', [this.fechaInicial, this.fechaFinal, Meteor.user().profile.seccion_id, usuario_id, this.modulo], function(error, result){
		  _.each(result, function(cobro){
			  rc.totales += cobro.importe;
		  })
		  rc.otrosCobros = result;
		  NProgress.set(1);
	    $scope.$apply();
	  });
	}
	
	this.calcularSemana = function(w, y) {
    var simple = new Date(y, 0, 1 + (w - 1) * 7);
    rc.fechaInicial = new Date(simple);
    rc.fechaFinal = new Date(moment(simple).add(7,"days"));
	}
};