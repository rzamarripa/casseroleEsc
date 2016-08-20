angular
.module("casserole")
.controller("TrabajadoresCtrl", TrabajadoresCtrl);
function TrabajadoresCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
//$reactive(this).attach($scope);
let rc = $reactive(this).attach($scope);

  this.action = true;
	this.subscribe('trabajadores',()=>{
		return [{seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }]
	 });
	//this.subscribe('deptosAcademicos');
 
  this.helpers({
	  trabajadores : () => {
		  return Trabajadores.find();
	  },
	 //  deptosAcademicos : () => {
		//  return DeptosAcademicos.find();
	  //},
  });
  
  this.nuevo = true;  
  this.nuevoTrabajador = function()
  {
			this.action = true;
		  this.nuevo = !this.nuevo;
		  this.trabajador = {}; 
  };
 
	this.guardar = function(trabajador,form)
	{
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
	
		
			Accounts.createUser({
				username: this.trabajador.nombreUsuario,
				password: this.trabajador.contrasena,
				profile: {
					 nombre: this.trabajador.nombre,
					 apellidos: this.trabajador.apPaterno + " " + this.trabajador.apMaterno,
					 tipoUsuario: "Trabajador"
				},function(err) {
					if (err)
					   console.log(err);
					  else
					    console.log('success!');
					}
			});
			trabajador.estatus = true;
			trabajador.campus_id = Meteor.user().profile.campus_id;
			trabajador.seccion_id = Meteor.user().profile.seccion_id;
			trabajador.usuarioInserto = Meteor.userId();
			Trabajadores.insert(this.trabajador);
			toastr.success('Guardado correctamente.');
			this.trabajador = {};
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
			$state.go('root.trabajadores');
		
	};
	
	this.editar = function(id)
	{
	    this.trabajador = Trabajadores.findOne({_id:id});
			this.action = false;
			$('.collapse').collapse('show');
			this.nuevo = false;
	};
	
	this.actualizar = function(trabajador,form)
	{
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		    }
			
			var idTemp = trabajador._id;
			delete trabajador._id;		
			trabajador.usuarioActualizo = Meteor.userId(); 
			Trabajadores.update({_id:idTemp},{$set:trabajador});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	        form.$setUntouched();
	};
		
	this.cambiarEstatus = function(id)
	{
			var trabajador = Trabajadores.findOne({_id:id});
			if(trabajador.estatus == true)
				trabajador.estatus = false;
			else
				trabajador.estatus = true;
			
			Trabajadores.update({_id:id}, {$set : {estatus : trabajador.estatus}});
	};

	this.tomarFoto = function(){
			$meteor.getPicture().then(function(data){
			rc.trabajador.fotografia = data;
		});
	};

/*
  this.tieneFoto = function(trabajador){
		if (typeof trabajador.fotografia !== "undefined")
			return true;
		else
			return false;
	}	
*/
};