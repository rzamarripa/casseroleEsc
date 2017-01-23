Bitacora 						= new Mongo.Collection("bitacora");
Bitacora.allow({
  insert: function (userId, doc) { return !Roles.userIsInRole(userId, 'alumno'); },
  update: function (userId, doc) { return !Roles.userIsInRole(userId, 'alumno'); },
  remove: function (userId, doc) { return !Roles.userIsInRole(userId, 'alumno'); }
});


function wrapCallback(callback, convertResult) {
  if (!callback) {
    return;
  }

  // If no convert function was passed in, just use a "blank function"
  convertResult = convertResult || _.identity;

  return (error, result) => {
    callback(error, ! error && convertResult(result));
  };
}
var quitarhk=function(obj){
	if(Array.isArray(obj)){
		for (var i = 0; i < obj.length; i++) {
			obj[i] =quitarhk(obj[i]);
		}
	}
	else if(obj !== null && typeof obj === 'object')
	{
		delete obj.$$hashKey;
		for (var name in obj) {
  			obj[name] = quitarhk(obj[name]);
		}

	}
	return obj;
}


Mongo.Collection.prototype.insert = function insert(doc, callback) {
  // Make sure we were passed a document to insert
  //console.log("Insertar",this._name);
  try{
    doc = quitarhk(doc);
    if(this._name!='bitacora'){
      var _usuario = null;
      if (Meteor.isClient) {
          _usuario =Meteor.userId()
      }
      var doctoBitacora ={
        fecha: new Date(),
        usuario: _usuario,
        accion: 'insert',
        isClient: Meteor.isClient,
        isServer: Meteor.isServer,
        coleccion: this._name,
        documentoNuevo: doc,
        documentoAnterior: {}
      };
      //console.log(doctoBitacora);
      Bitacora.insert(doctoBitacora);
    }
  }catch(e){}
  
  

  
  if (!doc) {
    throw new Error("insert requires an argument");
  }

  // Shallow-copy the document and possibly generate an ID
  doc = _.extend({}, doc);

  if ('_id' in doc) {
    if (!doc._id || !(typeof doc._id === 'string'
          || doc._id instanceof Mongo.ObjectID)) {
      throw new Error("Meteor requires document _id fields to be non-empty strings or ObjectIDs");
    }
  } else {
    let generateId = true;

    // Don't generate the id if we're the client and the 'outermost' call
    // This optimization saves us passing both the randomSeed and the id
    // Passing both is redundant.
    if (this._isRemoteCollection()) {
      const enclosing = DDP._CurrentInvocation.get();
      if (!enclosing) {
        generateId = false;
      }
    }

    if (generateId) {
      doc._id = this._makeNewID();
    }
  }

  // On inserts, always return the id that we generated; on all other
  // operations, just return the result from the collection.
  var chooseReturnValueFromCollectionResult = function (result) {
    if (doc._id) {
      return doc._id;
    }

    // XXX what is this for??
    // It's some iteraction between the callback to _callMutatorMethod and
    // the return value conversion
    doc._id = result;

    return result;
  };

  const wrappedCallback = wrapCallback(
    callback, chooseReturnValueFromCollectionResult);

  if (this._isRemoteCollection()) {
    const result = this._callMutatorMethod("insert", [doc], wrappedCallback);
    return chooseReturnValueFromCollectionResult(result);
  }

  // it's my collection.  descend into the collection object
  // and propagate any exception.
  try {
    // If the user provided a callback and the collection implements this
    // operation asynchronously, then queryRet will be undefined, and the
    // result will be returned through the callback instead.
    

    const result = this._collection.insert(doc, wrappedCallback);
    return chooseReturnValueFromCollectionResult(result);
  } catch (e) {
    if (callback) {
      callback(e);
      return null;
    }
    throw e;
  }
}


Mongo.Collection.prototype.update = function update(selector, modifier, ...optionsAndCallback) {
    
  //console.log("update",this._name);
	//console.log(selector,modifier);
  if(this._name=='bitacora') return false;

  try{
    selector = quitarhk(selector);
    modifier = quitarhk(modifier);
  	var docset = modifier["$set"]? modifier["$set"]:{};
    var docunset = modifier["$unset"]? modifier["$unset"]:{};
    var docaddToSet = modifier["$addToSet"]? modifier["$addToSet"]:{};
    var doctoNuevo=undefined;
    var doctoAnterior=undefined;
    
  	if(this._name!='bitacora'){
  		var _usuario = null;
  	  	if (Meteor.isClient) {
  	        _usuario =Meteor.userId()
  	    }
  	   
  	    var opciones = _.clone(optionsAndCallback[0]) || {};
  	    
  	    if(opciones.multi){
  	    	
  	    	doctoNuevo = this._collection.find(selector).fetch();
  	    	for(var i in doctoNuevo)
  	    	{
            try{
    	    		for(var j in docset){
    	    			doctoNuevo[i][j]=docset[j];
    	    		}
            }
            catch(e){}
            try{
              for(var j in docunset){
                if(docunset[j])
                  doctoNuevo[i][j]=null;
              }
            }
            catch(e){}
            try{
              for(var j in docaddToSet){
                if(!doctoNuevo[i][j])
                  doctoNuevo[i][j]=[]
                doctoNuevo[i][j].push(docset[j]);
              }
            }
            catch(e){}	
  	    		
  	    	}
  	    	doctoAnterior = this._collection.find(selector).fetch();

  	    }
  	    else{
  	    	//console.log(this._collection);
  	    	
  	    	doctoNuevo = this._collection.findOne(selector);
          try{
            for(var j in docset){
              doctoNuevo[j]=docset[j];
            }
          }
          catch(e){} 
          try{
            for(var j in docunset){
              if(docunset[j])
                doctoNuevo[j]=null;
            }
          }
          catch(e){} 
          try{
            for(var j in docaddToSet){
              if(!doctoNuevo[i][j])
                doctoNuevo[i][j]=[];
              doctoNuevo[i][j].push(docset[j]);
            }
          }
          catch(e){} 
  	    	doctoAnterior = this._collection.findOne(selector);
  	    }

  	    var doctoBitacora ={
  			fecha: new Date(),
  			usuario: _usuario,
  			accion: 'update',
  			isClient: Meteor.isClient,
  			isServer: Meteor.isServer,
  			selector: JSON.stringify(selector),
  			coleccion: this._name,
  			documentoNuevo: doctoNuevo,
  			documentoAnterior: doctoAnterior
  		};
  		//console.log(doctoBitacora);
    		Bitacora.insert(doctoBitacora);
  	}
  }
  catch(e){ 
  }
  const callback = popCallbackFromArgs(optionsAndCallback);

  selector = Mongo.Collection._rewriteSelector(selector);


  // We've already popped off the callback, so we are left with an array
  // of one or zero items
  const options = _.clone(optionsAndCallback[0]) || {};
  if (options && options.upsert) {
    // set `insertedId` if absent.  `insertedId` is a Meteor extension.
    if (options.insertedId) {
      if (!(typeof options.insertedId === 'string'
            || options.insertedId instanceof Mongo.ObjectID))
        throw new Error("insertedId must be string or ObjectID");
    } else if (! selector._id) {
      options.insertedId = this._makeNewID();
    }
  }

  const wrappedCallback = wrapCallback(callback);

  if (this._isRemoteCollection()) {
    const args = [
      selector,
      modifier,
      options
    ];

    return this._callMutatorMethod("update", args, wrappedCallback);
  }

  // it's my collection.  descend into the collection object
  // and propagate any exception.
  try {
    // If the user provided a callback and the collection implements this
    // operation asynchronously, then queryRet will be undefined, and the
    // result will be returned through the callback instead.


    return this._collection.update(
      selector, modifier, options, wrappedCallback);
  } catch (e) {
    if (callback) {
      callback(e);
      return null;
    }
    throw e;
  }
}


Mongo.Collection.prototype.remove = function remove(selector, callback) {
  
  if(this._name=='bitacora') return false;
  try{
    if(this._name!='bitacora'){
  	    var doctoAnterior = this._collection.find(selector).fetch();
  	    
      	var _usuario = null;
  	  	if (Meteor.isClient) {
  	        _usuario =Meteor.userId()
  	    }
  	  	var doctoBitacora ={
  			fecha: new Date(),
  			usuario: _usuario,
  			accion: 'remove',
  			isClient: Meteor.isClient,
  			isServer: Meteor.isServer,
  			coleccion: this._name,
  			documentoNuevo: null,
  			documentoAnterior: doctoAnterior
  		};
  		//console.log(doctoBitacora);
  	  Bitacora.insert(doctoBitacora);
    }
  }catch(e){}
  selector = Mongo.Collection._rewriteSelector(selector);

  const wrappedCallback = wrapCallback(callback);
  if (this._isRemoteCollection()) {
    return this._callMutatorMethod("remove", [selector], wrappedCallback);
  }

  // it's my collection.  descend into the collection object
  // and propagate any exception.
  try {
    // If the user provided a callback and the collection implements this
    // operation asynchronously, then queryRet will be undefined, and the
    // result will be returned through the callback instead.
    
    return this._collection.remove(selector, wrappedCallback);
  } catch (e) {
    if (callback) {
      callback(e);
      return null;
    }
    throw e;
  }
};

function popCallbackFromArgs(args) {
  // Pull off any callback (or perhaps a 'callback' variable that was passed
  // in undefined, like how 'upsert' does it).
  if (args.length &&
      (args[args.length - 1] === undefined ||
       args[args.length - 1] instanceof Function)) {
    return args.pop();
  }
}