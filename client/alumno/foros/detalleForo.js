angular.module("casserole")
.controller("DetalleForoCtrl",DetalleForoCtrl)
function DetalleForoCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
  let rc = $reactive(this).attach($scope);
	
	this.action = true;

	this.subscribe('foros',()=>{
		return [{ estatus:true, grupo_id : $stateParams.grupo_id, _id : $stateParams.foro_id }];
	});
	
	this.subscribe('categoriasForos',()=>{
		return [{ estatus:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }];
	});
	
	rc.helpers({
		foro : () => {
			return Foros.findOne();
		},
		categoriasForos : () => {
			return CategoriasForos.find();
		}
  });
  
  this.nuevo = true;
  this.nuevoForo = function()
  {
		this.action = true;
		this.nuevo = !this.nuevo;
		this.foro = {};    
  };

	this.guardar = function(foro,form)
	{
		if(form.$invalid){
      toastr.error('Error al guardar los datos.');
      return;
	  }
		foro.estatus = true;
		foro.campus_id = Meteor.user().profile.campus_id;
		foro.seccion_id = Meteor.user().profile.seccion_id;
		foro.grupo_id = $stateParams.grupo_id;
		foro.usuarioInserto = Meteor.userId();
		Foros.insert(this.foro);
		toastr.success('Guardado correctamente.');
		this.foro = {};
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
    form.$setUntouched();
	};
	
	this.editar = function(id)
	{
    this.foro = Foros.findOne({_id:id});
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
  
};