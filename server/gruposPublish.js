Meteor.publish("grupos",function(options){
<<<<<<< HEAD
	console.log('123qwe',options)
=======
	console.log("grupos", options);
>>>>>>> d96f279402a8e45e229f54ce0aeb91c87cfd8416
 	return Grupos.find(options);
});

Meteor.publish("gruposResumen",function(options){
 	return Grupos.find(options.where, options.fields);
});

Meteor.publish("grupo",function(options){
	console.log('123qwe',options)
  return Grupos.find(options);
});