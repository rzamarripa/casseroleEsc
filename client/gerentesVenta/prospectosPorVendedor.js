angular
.module("casserole")
.controller("prospectosPorVendedorCtrl", prospectosPorVendedorCtrl);
function prospectosPorVendedorCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
  let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;
  this.vendedor_id = "";
  this.buscar = {};
  this.buscar.fechaInicial = new Date();
  this.buscar.fechaFinal = new Date();
  this.vendeores_id = [];
  this.fechaInicial = new Date();
  this.fechaFinal = new Date();
  this.mensajeNuevo = true;
  this.mensaje = {};
	
	this.subscribe('vendedores',()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});

	this.subscribe('etapasVenta',()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "", estatus : true}]
	});
	
	this.subscribe('inscripciones',()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	this.subscribe('prospectosPorVendedor',()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "", fecha : { $gte : this.getReactively("fechaInicial"), $lt: this.getReactively("fechaFinal"), vendedor_id : this.getCollectionReactively("vendedores_id")}}]
	});
 
  this.helpers({
	  vendedores : () => {
		  if(Meteor.user()){
			  var usuarios = Meteor.users.find().fetch();
			  var vendedoresDelGerente = [];
			  _.each(usuarios, function(usuario){
				  if(usuario.roles[0] == "vendedor"){					  
					  vendedoresDelGerente.push(usuario);
				  }
			  });
			  vendedores_id = _.pluck(vendedoresDelGerente, "_id");
			  return vendedoresDelGerente;
		  }
	  },
	  ultimosProspectos : () => {
		  return Prospectos.find({vendedor_id : this.getReactively("vendedor_id")}).fetch();
	  },
	  etapasVenta : () => {
		  return EtapasVenta.find();
	  }
  });
  
  this.tieneFoto = function(sexo, foto){
	  if(foto === undefined){
		  if(sexo === "masculino")
			  return "img/badmenprofile.png";
			else if(sexo === "femenino"){
				return "img/badgirlprofile.png";
			}else{
				return "img/badprofile.png";
			}
	  }else{
		  return foto;
	  }
  };
  
  this.getCantidadProspectos = function(vendedor_id){
	  rc.vendedor_id = vendedor_id;
	  return Prospectos.find({vendedor_id : this.getReactively("vendedor_id"), fecha : { $gte : this.getReactively("fechaInicial"), $lt: this.getReactively("fechaFinal")}}).count();
  };
  
  this.getInscritos = function(vendedor_id){
	  return Inscripciones.find({vendedor_id : vendedor_id, fechaInscripcion : { $gte : this.getReactively("fechaInicial"), $lt: this.getReactively("fechaFinal")}}).count();
  }
  
  this.getCantidadTotalDeProspectosPorVendedor = function(vendedor_id){
	  return Prospectos.find({vendedor_id : vendedor_id}).count();
  }
  
  this.getProspectos = function(vendedor_id){
	  return Prospectos.find({vendedor_id : vendedor_id}).fetch();
  }
  
  this.getProspectosPorEtapa = function(etapaVenta_id){
	  return Prospectos.find({etapaVenta_id : etapaVenta_id}).count();
  }
  
  this.getCantidadProspectosPorEtapaVenta = function(vendedor_id, etapaVenta_id){
	  return Prospectos.find({vendedor_id : vendedor_id, etapaVenta_id : etapaVenta_id, fecha : { $gte : this.getReactively("fechaInicial"), $lt: this.getReactively("fechaFinal")}}).count();
  };
  
  this.buscarProspectos = function(buscar){
	  rc.fechaInicial = buscar.fechaInicial;
	  rc.fechaFinal = buscar.fechaFinal;
  }
  
  this.nuevoMensaje = function(vendedor_id){
	  rc.mensaje.destinatario_id = vendedor_id;
  }
  
  this.enviarMensaje = function(mensaje,form){
	  if(form.$invalid){
      toastr.error('Error al guardar los datos.');
      return;
	  }
	  
	  mensaje.estatus = true;
		mensaje.campus_id = Meteor.user().profile.campus_id;
		mensaje.usuarioInserto = Meteor.userId();
		MensajesVendedores.insert(mensaje);
		toastr.success('Enviado correctamente.');
		this.mensaje = {};
		$('.collapse').collapse('hide');
		this.mensajeNuevo = true;
  }
};
