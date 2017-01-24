angular
.module("casserole")
.controller("VendedoresCtrl", VendedoresCtrl);
function VendedoresCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;  
  this.cantidadVendedores = 0;
  	
	this.subscribe('campus', ()=>{
		return [{estatus:true, _id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}]
	});	
	
	this.subscribe('vendedoresGerentes', ()=>{
		return [{"profile.campus_id" : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "", roles : { $in : ["vendedor", "gerenteVenta"]}}]
	});	
 
  this.helpers({
	  vendedores : () => {
		  return Meteor.users.find({roles : ["vendedor"], "profile.campus_id" : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""});
	  },
	  campus : () => {
			return Campus.findOne();
		},
	  gerentesVenta : () => {
		  return Meteor.users.find({roles : ["gerenteVenta"], "profile.campus_id" : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""});	  
	  }
  });  
  
  this.nuevoVendedor = function()
  {
		this.action = true;
    this.nuevo = !this.nuevo;
    this.vendedor = {}; 
    this.vendedor.profile = {};
  };
 
	this.guardar = function(vendedor,form)
	{		
		if(form.$invalid){
      toastr.error('Error al guardar los datos.');
      return;
    }
    
    vendedor.profile.estatus = true;
		vendedor.profile.campus_id = Meteor.user().profile.campus_id;
		vendedor.profile.seccion_id = Meteor.user().profile.seccion_id;
		vendedor.profile.usuarioInserto = Meteor.userId();
		Meteor.call('generarUsuario', "v", vendedor, 'vendedor', function(error, result){
			if(error){
				toastr.error('Error al guardar los datos.');
				console.log(error);
			}else{
				toastr.success('Guardado correctamente.');
				rc.nuevo = true;
				rc.vendedor = {};
				$('.collapse').collapse('hide');
				form.$setPristine();
				form.$setUntouched();	
			}
		});
		
	};
	
	this.editar = function(id)
	{
    this.vendedor = Meteor.users.findOne({_id:id});
    this.action = false;
    $('.collapse').collapse('show');
    this.nuevo = false;
    this.usernameSeleccionado = this.vendedor.username;
    this.validaUsuario = true;
	};
	
	this.actualizar = function(vendedor,form)
	{
		if(form.$invalid){
      toastr.error('Error al actualizar los datos.');
      return;
	  }
		
		Meteor.call('modificarUsuario', vendedor, 'vendedor');
		toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
		form.$setUntouched();
	};
		
	this.tomarFoto = function(){
		$meteor.getPicture({width:200, height: 200, quality: 50}).then(function(data){
			rc.vendedor.profile.fotografia = data;
		});
	};
	
	this.getGerenteVenta = function(gerente_id){
		var gerente = Meteor.users.findOne({_id: gerente_id});
		if(gerente){
			return gerente.profile.nombre + " " + gerente.profile.apPaterno+ " " + gerente.profile.apMaterno;
		}
			
	}
	
};