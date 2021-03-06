angular
.module("casserole")
.controller("CobranzaCtrl", CobranzaCtrl);
function CobranzaCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
  this.semanaActual = moment().isoWeek();
  this.anioActual = moment().get("year");
  this.fechaInicial = new Date();
  this.fechaFinal = new Date();
  this.fechaInicial = new Date(this.fechaInicial.setHours(0,0,0));
  this.fechaFinal = new Date(this.fechaFinal.setHours(23,59,59))
  this.otrosCobros = [];
  this.totales = 0.00;
  this.modulo = "todos";
  this.cargaTerminada = true;
  
  this.subscribe('todosUsuarios',()=>{
		return [{seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }]
	});
	
	this.subscribe('cuentas',()=>{
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
		},
		cuentas : () => {
			return Cuentas.find();
		}
	});
	
	this.calcularCobros = function(fechaInicial, fechaFinal, usuario_id, cuenta_id, form){
		console.log(fechaInicial);
		console.log(fechaFinal);
		NProgress.set(0.5);
		rc.cargaTerminada = false;
		if(form.$invalid){
			toastr.error('Error al enviar los datos, por favor llene todos los campos.');
			NProgress.set(1);
			return;
    }
		this.totales = 0.00;
		Meteor.apply('historialCobranza', [this.fechaInicial, this.fechaFinal, Meteor.user().profile.seccion_id, usuario_id, cuenta_id, this.modulo], function(error, result){
			if(result){
				_.each(result, function(cobro){
				  rc.totales += cobro.pago;
			  })
			  console.log(result);
			  rc.otrosCobros = result;
			  NProgress.set(1);
			  rc.cargaTerminada = true;
		    $scope.$apply();
			}		  
	  });
	}
	
	this.calcularSemana = function(w, y) {
    var simple = new Date(y, 0, 1 + (w - 1) * 7);
    rc.fechaInicial = new Date(simple);
    rc.fechaFinal = new Date(moment(simple).add(7,"days"));
	}
	
	this.cancelarPago = function(planPago){
		Meteor.apply('cancelarPago', [planPago], function(error, result){
		  if(result){
			  toastr.success("Se canceló correctamente");
		  }
		  NProgress.set(1);
	    $scope.$apply();
	  });
		
	}
};