Meteor.publish("titulos",function(params){
  	return Titulos.find(params);
});

