Meteor.publish("escuelas",function(params){
  	return Escuelas.find(params);
});