
angular
  .module('casserole')
  .controller('AlumnosCtrl', AlumnosCtrl);
 
function AlumnosCtrl($scope, $meteor, $reactive, $state, toastr) {
	let rc = $reactive(this).attach($scope);
	window.rc = rc;
  this.action = true;
  this.alumno = {};
  this.alumno.profile = {};
  this.alumno.profile.matricula = "";
  this.buscar = {};
  this.buscar.nombre = '';
	this.validation = false;
	this.validaUsuario = false;
  this.validaContrasena = false;
	
	this.subscribe('buscarAlumnos', () => {
    return [{
	    options : { limit: 51 },
	    where : { 
				nombreCompleto : this.getReactively('buscar.nombre'), 
				seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "",
				campus_id :  Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
			} 		   
    }];
  });
  
  this.subscribe('ocupaciones',()=>{
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}]
	});
	
	this.subscribe('campus',()=>{
		return [{_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
  
	this.helpers({
		alumnos : () => {
			return Meteor.users.find({
		  	"profile.nombreCompleto": { '$regex' : '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options' : 'i' },
		  	"profile.seccion_id": Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "",
		  	roles : ["alumno"]
			}, { sort : {"profile.nombreCompleto" : 1 }});
		},
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
			  return "img/badmenprofile.jpeg";
			else if(sexo === "femenino"){
				return "img/badgirlprofile.jpeg";
			}else{
				return "img/badprofile.jpeg";
			}
			  
	  }else{
		  return foto;
	  }
  }  
}