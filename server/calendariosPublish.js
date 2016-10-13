Meteor.publish("calendarios",function(options){
  return Calendarios.find(options);
});