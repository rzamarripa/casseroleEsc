
angular
  .module('casserole')
  .controller('AlumnosCtrl', AlumnosCtrl);
 
function AlumnosCtrl($scope, $meteor, $reactive, $state, toastr) {
	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.alumno = {};
  this.alumno.profile = {};
  this.alumno.profile.matricula = "";
  this.buscar = {};
  this.buscar.nombre = '';
	this.validation = false;
	this.validaUsuario = false;
  this.validaContrasena = false;
  this.alumnos = [];
  
  window.rc = rc;
	
/*
	this.subscribe('buscarAlumnos', () => {
		if(this.getReactively("buscar.nombre").length > 3){
			return [{
		    options : { limit: 51 },
		    where : { 
					nombreCompleto : this.getReactively('buscar.nombre'), 
					//seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "",
					campus_id :  Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
				} 		   
	    }];
		}
  });
*/
  
  this.subscribe('ocupaciones',()=>{
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}]
	});
	
	this.subscribe('campus',()=>{
		return [{_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
  
	this.helpers({
	  ocupaciones : () => {
		  return Ocupaciones.find({estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""});
	  },
	  cantidad : () => {
			 var x = Counts.get('number-alumnos');
			 return x;
	  },
	  matricula : () => {
		  if(Meteor.user()){
			  var matriculaAnterior = 0;
			  anio = '' + new Date().getFullYear();
			  anio = anio.substring(2,4);
			  if(this.getReactively("cantidad") > 0){
			  	var matriculaOriginal = anio + Meteor.user().profile.campus_clave+"0000";
			  	var matriculaOriginalN = parseInt(matriculaOriginal);
			  	var matriculaNueva = matriculaOriginalN+this.cantidad+1;
			  	matriculaNueva = 'e'+matriculaNueva
					rc.alumno.username = matriculaNueva;
				  rc.alumno.profile.matricula = matriculaNueva;
				  
			  }else{
				  rc.alumno.username = "e" + anio + Meteor.user().profile.campus_clave + "0001";
				  rc.alumno.profile.matricula = "e" + anio + Meteor.user().profile.campus_clave + "0001";
			  }
		  }
	  }
  });
  
  this.guardar = function (alumno,form) {
		if(form.$invalid){
			this.validation = true;
      toastr.error('Error al guardar los datos.');
      return;
    }
    
    delete alumno.profile.repeatPassword;
		alumno.profile.estatus = true;
		var nombre = alumno.profile.nombre != undefined ? alumno.profile.nombre + " " : "";
		var apPaterno = alumno.profile.apPaterno != undefined ? alumno.profile.apPaterno + " " : "";
		var apMaterno = alumno.profile.apMaterno != undefined ? alumno.profile.apMaterno : "";
		alumno.profile.nombreCompleto = nombre + apPaterno + apMaterno;
		alumno.profile.fechaCreacion = new Date();
		alumno.profile.campus_id = Meteor.user().profile.campus_id;
		alumno.profile.seccion_id = Meteor.user().profile.seccion_id;
		alumno.profile.usuarioInserto = Meteor.userId();
		Meteor.call('createGerenteVenta', rc.alumno, 'alumno');
		toastr.success('Guardado correctamente.');
		$state.go('root.alumnos');			
		this.nuevo = true;
		form.$setPristine();
    form.$setUntouched();
	};
	
	this.tomarFoto = function () {
		$meteor.getPicture({width:200, height: 200, quality: 50}).then(function(data){			
			rc.alumno.fotografia = data;
		})
	};
	
	this.tieneFoto = function(sexo, foto){
	  if(foto === undefined){
		  if(sexo === "masculino")
			  return "img/badmenprofile.png";
			else if(sexo === "femenino"){
				return "img/badgirlprofile.png";
			}else{
				return "img/badprofile.jpeg";
			}
			  
	  }else{
		  return foto;
	  }
  };
  
  this.buscarAlumnos = function(){
	  if(this.buscar.nombre.length > 0 ){
		  Meteor.apply('buscarAlumnos', [{
			    options : { limit: 51 },
			    where : { 
						nombreCompleto : this.getReactively('buscar.nombre'), 
						//seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "",
						campus_id :  Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
					} 		   
		    }], function(error, result){
			  if(result){
				  rc.alumnos = result;
				  NProgress.set(1);
			  }
		
		    $scope.$apply();
		  });
	  }else{
		  rc.alumnos = [];
	  }
  }
  
  this.getFocus = function(){
	  document.getElementById('buscar').focus();
  };  
  
  this.obtenerColorEstatus = function(estatus){
	  if(estatus == 1){ //Registrado
		  return "bg-color-blue txt-white";
	  }else if(estatus == 2){
		  return "bg-color-purple txt-white"
	  }else if(estatus == 3){
		  return "bg-color-yellow txt-white"
	  }else if(estatus == 4){
		  return "bg-color-blueLight txt-white"
	  }else if(estatus == 5){
		  return "bg-color-greenLight txt-white"
	  }else if(estatus == 6){
		  return "bg-color-red txt-white"
	  }else if(estatus == 7){
		  return "bg-color-blueDark txt-white"
	  }else if(estatus == 8){
		  return "label-primary txt-white"
	  }
  }
  
  this.obtenerNombreEstatus = function(estatus){
	  if(estatus == 1){ //Registrado
		  return "Registrado";
	  }else if(estatus == 2){
		  return "Inicio"
	  }else if(estatus == 3){
		  return "Pospuesto"
	  }else if(estatus == 4){
		  return "Fantasma"
	  }else if(estatus == 5){
		  return "Activo"
	  }else if(estatus == 6){
		  return "Baja"
	  }else if(estatus == 7){
		  return "Term.Pago"
	  }else if(estatus == 8){
		  return "Egresado"
	  }
  }
}