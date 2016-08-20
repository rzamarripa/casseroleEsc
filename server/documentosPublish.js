Meteor.publish("documentos",function(params){
  	return Documentos.find(params);
});