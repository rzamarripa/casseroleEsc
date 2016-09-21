Meteor.publish("grupos",function(options){
 	return Grupos.find(options);
});

Meteor.publish("gruposResumen",function(options){
 	return Grupos.find(options.where, options.fields);
});

Meteor.publish("grupo",function(options){
	console.log('123qwe',options)
  return Grupos.find(options);
});