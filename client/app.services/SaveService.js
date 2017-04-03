angular.module('casserole').service('SaveService', function ($meteor) {
	this.save = function(collectionName, object, callback){
		if(!collectionName || !object || !callback){
			throw new Error('No estás mandando todos los parametros');
		}
		if(!eval(collectionName)){
			throw new Error('La colleccion "'+collectionName+'" no existe');
		}
		NProgress.set(0.3);
		$("body").css("cursor", "progress");
		Meteor.call('save', collectionName, object, function(err, res){
			if(!res.error){
				callback(undefined, res.result);
			}else{
				callback(err, 'Error al Guardar');
			}
			$("body").css("cursor", "default");
			NProgress.set(1.0);
		});
	};

	this.saveUser = function(collectionName, object, rol, callback){
		if(!collectionName || !object || !rol || !callback){
			throw new Error('No estás mandando todos los parametros');
		}
		if(!Mongo.Collection.get(collectionName)){
			throw new Error('La colleccion "'+collectionName+'" no existe');
		}
		NProgress.set(0.3);
		$("body").css("cursor", "progress");
		collection = Mongo.Collection.get(collectionName);
		collection.insert(object, function(err, res){
			if(!err){
				if(collectionName === 'maestros')
					object.maestro_id = res;
				Meteor.call('createUsuario', object, 'maestro', function(err, res){
					if(err){
						collection.remove(res);
						callback(err.reason, 'Error al Guardar');
					}else{
						callback(undefined, 'Guardado Correctamente');
					}
				});
			}else{
				callback(err.reason, 'Error al Guardar');
			}
			$("body").css("cursor", "default");
			NProgress.set(1.0);
		});
	};
});