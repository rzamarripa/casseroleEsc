Meteor.publish("grupos",function(options){
 	return Grupos.find(options);
});

Meteor.publish("grupo",function(options){
  return Grupos.find(options);
});