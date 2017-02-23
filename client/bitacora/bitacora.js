angular
  .module('casserole')
  .controller('BitacoraCtrl', BitacoraCtrl);
 
function BitacoraCtrl($scope, $meteor, $reactive, $state, toastr) {
	$reactive(this).attach($scope);
	var self = this;

	self.perPage = 10;
  self.page = 1;
  self.sort = {
    fecha: -1
  };

	self.subscribe('bitacora',()=>{
		return [
		{
      limit: parseInt(self.getReactively('perPage')),
      skip: parseInt((self.getReactively('page') - 1) * self.perPage),
      sort: self.getReactively('sort')
    },
		{
			seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : undefined,
			usuario : self.getReactively("usuario_id")? self.getReactively("usuario_id"):{$ne:null}
		}]
	});
   
	this.subscribe("usuarios",() => {
  	return [{}]
  });
  
	self.helpers({
		bitacoras : () => {
	  	return Bitacora.find({},{sort:self.getReactively('sort')});
  	},
  	bitacoraCount: () => {
			return Counts.get('numberOfBitacora');
    },
    secciones : () => {
      return Secciones.find();
    },
    usuarios : () => {
      return Meteor.users.find();
    }
	});
	
	self.pageChanged = (newPage) => {
		self.page = newPage;
  };
  
  self.hora = function(fecha){
  	var ahora = new Date();
  	var minuto = 60 * 1000;
  	var hora = minuto * 60;
  	var dia = hora * 24;
  	var anio = dia * 365;
  	var diferencia = ahora-fecha;
  	if(diferencia<minuto)
  		return "Hace menos de un minuto"
  	else if(diferencia<hora)
  		return "Hace "+Math.round(diferencia/minuto)+" minutos"
  	else if(diferencia<dia)
  		return "Hace "+Math.round(diferencia/hora)+" horas"
  	else if(diferencia<anio)
  		return "Hace "+Math.round(diferencia/dia)+" dias"
  	else
  		return "Hace mucho tiempo"
  }
  
  self.tipoAccion=function(registro){
    var usuario_a = Meteor.users.findOne(registro.usuario);
    var usuario = registro.isServer? 'Server':(usuario_a? usuario_a.username:"Cliente");
    switch(registro.accion){
      case 'insert':
        return '('+usuario+'): Crear '+registro.coleccion;
      case 'update':
        return '('+usuario+'): Actualizar '+registro.coleccion;
      case 'remove':
        return '('+usuario+'): Eliminar '+registro.coleccion;
      break;
    }
  }
  
  self.loadMore=function(){
		self.perPage +=10; 
  }
  
  self.tieneFoto = function(usuario_id){
	  var usuarioEncontrado = Meteor.users.findOne(usuario_id);
	  if(usuarioEncontrado){
		  if(usuarioEncontrado.profile.fotografia === null || usuarioEncontrado.profile.fotografia === undefined){
			  if(usuarioEncontrado.profile.sexo === "masculino")
				  return "img/badmenprofile.png";
				else if(usuarioEncontrado.profile.sexo === "femenino"){
					return "img/badgirlprofile.png";
				}else{
					return "img/badprofile.png";
				}
				  
		  }else{
			  return usuarioEncontrado.profile.fotografia;
		  }
	  }
  };

};