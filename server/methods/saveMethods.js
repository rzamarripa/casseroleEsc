Meteor.methods({
  save: function (collectionName, object) {
  	var result;
  	if(!object._id){
  		result = Meteor.sync(function(callback){
	    	eval(collectionName).insert(object, function(err, res){
					if(!err){
						callback(undefined, {_id: res, message: 'Guardado Correctamente'});
					}else{
						callback(error, 'Error al Guardar');
					}
				});
	    })
  	}else{
  		result = Meteor.sync(function(callback){
  			var idTemp = object._id;
				delete object._id;
	    	eval(collectionName).update({_id:idTemp},{$set:object}, function(err, res){
					if(!err){
						callback(undefined, {affected: res, message: 'Guardado Correctamente'});
					}else{
						callback(error, 'Error al Guardar');
					}
				});
	    })
  	}
  	return result;
  }
});