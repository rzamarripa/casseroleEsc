angular
.module("casserole")
.controller("UsuariosAdminCtrl", UsuariosAdminCtrl);
	function UsuariosAdminCtrl($scope, $meteor, $reactive , $state, $stateParams, toastr){
	let rc = $reactive(this).attach($scope);
	
	this.campus_id = "";
	this.rolSeleccionado = {};
	this.usuario = {};
	this.usuario.profile = {};
	this.usuario.profile.nombre = "";
	this.usuario.profile.apPaterno = "";
	this.roles = [
		{_id : "d",	nombre : "director", rol : "Director"},
		{_id : "c",	nombre : "coordinadorAcademico", rol : "Coordinador Académico"},
		{_id : "c",	nombre : "coordinadorFinanciero", rol : "Coordinador Financiero"},
		{_id : "v",	nombre : "vendedor", rol : "Vendedor"},
		{_id : "g",	nombre : "gerenteVentas", rol : "Gerente de Ventas"},
		{_id : "r",	nombre : "recepcionista", rol : "Recepcionista"},
	]
		
	window.rc = rc;
	
	this.subscribe("campus", () => {
		return [{estatus : true}];
	});
	
	this.subscribe("secciones", () => {
		return [{estatus : true}];
	});
	
	this.helpers({
		campus : () => {
			return Campus.find();
		},
		secciones : () => {
			return Secciones.find({campus_id : this.getReactively("campus_id")});
		}
	});
	
	this.getSecciones = function(campus_id){
		rc.campus_id = campus_id;
	}
	
	this.generarUsuario = function(){
		rc.rolSeleccionado = JSON.parse(rc.rolSeleccionado);
		console.log(this.usuario, this.rolSeleccionado);
		Meteor.call('generarUsuario', this.rolSeleccionado.rol, this.usuario, this.rolSeleccionado.nombre, function(error, result){
			if(error){
				toastr.error('Error al guardar los datos.');
				console.log(error);
			}else{
				toastr.success('Guardado correctamente.');
				rc.nuevo = true;
				rc.usuario = {};
				$('.collapse').collapse('hide');
			}
		});
	}

};