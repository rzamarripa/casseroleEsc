Meteor.publish("grupos",function(options){
 	return Grupos.find(options);
});

Meteor.publish("gruposResumen",function(options){
 	return Grupos.find(options.where, options.fields);
});

Meteor.publish("grupo",function(options){
  return Grupos.find(options);
});