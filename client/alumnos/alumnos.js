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
	
	this.subscribe('alumnos',()=>{
		return [{"roles" : ["alumno"], "profile.campus_id" : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}, {sort: {"profile.fechaCreacion":-1}}]
	});
	
/*
	this.subscribe('buscarAlumnos', () => {
    return [{
	    options : { limit: 10 },
	    where : { nombre : this.getReactively('buscar.nombre'), 
 		    seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""  }
    }] ;
  });
*/
  
/*
  this.subscribe('buscarUsuario', () => {
    return [{
	    where : { nombreUsuario : this.getReactively('alumno.nombreUsuario')}
    }] ;
  });
*/
  
  this.subscribe('ocupaciones',()=>{
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""}]
	});
	
	this.subscribe('campus',()=>{
		return [{_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
  
	this.helpers({
		alumnos : () => {
			return Meteor.users.find({roles : ["alumno"]});
		},
	  ocupaciones : () => {
		  return Ocupaciones.find();
	  },
	  cantidad : () => {
		  return Meteor.users.find({roles : ["alumno"]}).count();
	  },
	  matricula : () => {
		  if(Meteor.user()){
			  var matriculaAnterior = 0;
			  anio = '' + new Date().getFullYear();
			  anio = anio.substring(2,4);
			  console.log(rc.cantidad);
			  if(this.getReactively("cantidad") > 0){
				  var ultimoAlumno = Meteor.users.findOne({roles : ["alumno"]}, {sort: {fechaCreacion:-1}});
				  console.log("ultimo",ultimoAlumno)
				  if(ultimoAlumno != undefined){
					  console.log("entré aquí");
					  identificador = ultimoAlumno.profile.matricula.substring(1, ultimoAlumno.profile.matricula.length);
					  console.log(identificador);
					  matriculaAnterior = parseInt(identificador) + 1;
					  matriculaAnterior = 'e' + matriculaAnterior;
					  rc.alumno.username = matriculaAnterior;
				  	rc.alumno.profile.matricula = matriculaAnterior;
				  }
			  }else{
				  console.log("entré acá");
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
		console.log(alumno);
		Meteor.call('createGerenteVenta', rc.alumno, 'alumno');
		toastr.success('Guardado correctamente.');
		$state.go('root.alumnos');			
		this.nuevo = true;
		form.$setPristine();
    form.$setUntouched();
	};
  	
	this.cambiarEstatus = function (id) {
			var alumno = Alumnos.findOne({_id:id});
	    this.alumno.estatus = !alumno.estatus;
			this.alumno.save();
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