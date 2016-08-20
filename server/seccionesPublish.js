Meteor.publish("secciones",function(params){
  	return Secciones.find(params);
});

