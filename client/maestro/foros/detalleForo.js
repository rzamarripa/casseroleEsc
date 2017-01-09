angular.module("casserole")
.controller("DetalleForoCtrl",DetalleForoCtrl)
function DetalleForoCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
  let rc = $reactive(this).attach($scope);
	
	this.action = true;
	this.comentario = {};
	this.alumnos_id = [];
	
	window.rc = rc;
	
	$(document).ready(function() {
	  $('#summernote').summernote({
		  height : 250
	  });
	});
	
	this.subscribe('alumnos',()=>{
		return [{ "_id" : { $in : this.getReactively("alumnos_id") } }];
	});

	this.subscribe('foros',()=>{
		return [{ estatus:true, grupo_id : $stateParams.grupo_id, _id : $stateParams.foro_id }];
	});
	
	this.subscribe('categoriasForos',()=>{
		return [{ estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }];
	});
	
	rc.helpers({
		foro : () => {
			return Foros.findOne();
		},
		categoriasForos : () => {
			return CategoriasForos.find();
		},
		alumnos_id : () => {
			ids = [];
			if(this.getReactively("foro") && this.getReactively("alumnos")){
				_.each(rc.foro.comentarios, function(comentario){					
					ids.push(comentario.usuario_id);
				})
			}
			return ids;
		},
		alumnos : () => {
			var usuarios = Meteor.users.find().fetch()
			if(this.getReactively("foro")){
				_.each(rc.foro.comentarios, function(comentario){					
					comentario.usuario = Meteor.users.findOne(comentario.usuario_id);
				})
			}
			return Meteor.users.find();
		}
  });
  
  this.nuevo = true;
  this.nuevoComentario = function()
  {
		this.action = true;
		this.nuevo = !this.nuevo;
		this.comentario = {};
  };

	this.comentar = function(form)
	{
		if(form.$invalid){
      toastr.error('Error al guardar los datos.');
      return;
	  }

		this.comentario.estatus = true;
		this.comentario.descripcion = $("#summernote").summernote("code");
		this.comentario.grupo_id = $stateParams.grupo_id;
		this.comentario.foro_id = $stateParams.foro_id;
		this.comentario.usuario_id = Meteor.userId();
		this.comentario.fecha = new Date();
		
		Foros.update({_id : $stateParams.foro_id}, { $set : {ultimoPost : new Date(), 
			nombreUsuarioUltimoPost : Meteor.user().profile.nombreCompleto}, $push : {"comentarios" : this.comentario}});
		toastr.success('Guardado correctamente.');
		this.comentario = {};
		$('.collapse').collapse('hide');
		this.nuevo = true;
		$("#summernote").summernote("reset");
		form.$setPristine();
    form.$setUntouched();
	};
	
	this.editar = function(id)
	{
    this.comentario = Foros.findOne({_id:id});
    this.action = false;
    $('.collapse').collapse('show');
    this.nuevo = false;
	};
	
	this.actualizar = function(foro,form)
	{
		if(form.$invalid){
      toastr.error('Error al actualizar los datos.');
      return;
	  }
		var idTemp = foro._id;
		delete foro._id;		
		foro.usuarioActualizo = Meteor.userId(); 
		Foros.update({_id:idTemp},{$set:foro});
		toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
    form.$setUntouched();	
	};
		
	this.cambiarEstatus = function(id)
	{
		var foro = Foros.findOne({_id:id});
		if(foro.estatus == true)
			foro.estatus = false;
		else
			foro.estatus = true;
		
		Foros.update({_id:id}, {$set : {estatus : foro.estatus}});

	};
	
	this.getCategoria = function(categoria_id){
		var categoria = CategoriasForos.findOne(categoria_id);
		if(categoria){
			return categoria.nombre;
		}
	}
	
	this.tieneFoto = function(foto, sexo){
	  if(foto === undefined || foto === null){
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
};