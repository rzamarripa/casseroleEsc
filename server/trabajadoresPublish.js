Meteor.publish("trabajadores",function(params){
  	return Trabajadores.find(params);
});