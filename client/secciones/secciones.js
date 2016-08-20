angular
  .module('casserole')
  .controller('SeccionesCtrl', SeccionesCtrl);
 
function SeccionesCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
	let rc = $reactive(this).attach($scope);
	this.parametros = $stateParams;
	this.action = true;  
  this.nuevo = true;
	
  this.subscribe('campus', function(){
		return [{
			_id : this.getReactively("parametros.campus_id")
		}]
	});
	
	this.subscribe('secciones', function(){
		return [{campus_id : this.getReactively("parametros.campus_id")
		}]
	});
	
  this.subscribe("deptosAcademicos",()=>{
		return [{estatus:true, campus_id : this.getReactively("parametros.campus_id") }]
	});
  this.subscribe("turnos",()=>{
		return [{estatus:true, campus_id : this.getReactively("parametros.campus_id") }]
	});
	
  this.helpers({
	  secciones : () => {
		  return Secciones.find();
	  },
	   deptosAcademicos : () => {
		  return DeptosAcademicos.find();
	  },
	   turnos : () => {
		  return Turnos.find();
	  },
	   campus : () => {		   
		  return Campus.findOne();
	  }
  });
 
  this.getDeptoAcademico = function(id)
  { 
	  if(id){
		 var depto = DeptosAcademicos.findOne(id);
		 return depto.descripcionCorta;  
	  }else{
		  return "Sin Departamento";
	  }
  	
  }; 
  
  this.getCampus = function(id)
  { 
	  if(id){
	  	var campus = Campus.findOne(id);
	  	return campus.nombre; 
  	}
  }; 
	
  this.nuevoSeccion = function()
  {
    this.action = true;
    this.nuevo = !this.nuevo;
    this.seccion = {}; 
  };
  
  this.guardar = function(seccion,form)
	{
		if(form.$invalid){
	      toastr.error('Error al guardar los datos.');
	      return;
		}
		seccion.estatus = true;
		seccion.campus_id = $stateParams.campus_id;
		seccion.usuarioInserto = Meteor.userId();
		
		seccion_id = Secciones.insert(this.seccion);
		var nombre = seccion.nombre != undefined ? seccion.nombre + " " : "";
		var apPaterno = seccion.apPaterno != undefined ? seccion.apPaterno + " " : "";
		var apMaterno = seccion.apMaterno != undefined ? seccion.apMaterno : ""
		seccion.nombreCompleto = nombre + apPaterno + apMaterno;
		var usuario = {
			username : seccion.username,
			password : seccion.password,
			profile : {
				nombre : seccion.nombre,
				apPaterno : seccion.apPaterno,
				apMaterno : seccion.apMaterno,
				nombreCompleto : nombre + apPaterno + apMaterno,
				campus_id : $stateParams.campus_id,
				campus_clave : rc.campus.clave,
				seccion_id : seccion_id,
				estatus : true
			}
		}
		
		delete seccion.password;

		Meteor.call('createGerenteVenta', usuario, 'director');
		toastr.success('Guardado correctamente.');
		this.seccion = {};
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
    form.$setUntouched();
	};
	
	this.editar = function(id)
	{
			this.seccion = Secciones.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
		
	};
	
	this.actualizar = function(seccion,form)
	{
			if(form.$invalid){
	      toastr.error('Error al actualizar los datos.');
	      return;
		  }
			var idTemp = seccion._id;
			delete seccion._id;		
			Secciones.update({_id:idTemp},{$set:seccion});
			var nombre = seccion.nombre != undefined ? seccion.nombre + " " : "";
			var apPaterno = seccion.apPaterno != undefined ? seccion.apPaterno + " " : "";
			var apMaterno = seccion.apMaterno != undefined ? seccion.apMaterno : ""
			seccion.nombreCompleto = nombre + apPaterno + apMaterno;
			var usuario = {
				username : seccion.username,
				password : seccion.password,
				profile : {
					nombre : seccion.nombre,
					apPaterno : seccion.apPaterno,
					apMaterno : seccion.apMaterno,
					nombreCompleto : nombre + apPaterno + apMaterno,
					campus_id : $stateParams.campus_id,
					campus_clave : rc.campus.clave,
					seccion_id : idTemp,
					estatus : true
				}
			}
			Meteor.call('updateGerenteVenta', usuario, 'director');
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
		
	};

	this.cambiarEstatus = function(id)
	{
			var seccion = Secciones.findOne({_id:id});
			if(seccion.estatus == true)
				seccion.estatus = false;
			else
				seccion.estatus = true;
			
			Secciones.update({_id:id}, {$set : {estatus : seccion.estatus}});	
	};
	
	this.seleccionarLogo = function(logo){
		rc.seccion.logo = logo;
	}
		
}