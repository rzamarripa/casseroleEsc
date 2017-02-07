angular
  .module('casserole')
  .controller('LoginCtrl', LoginCtrl);
 
function LoginCtrl($scope, $meteor, $reactive, $state, toastr) {
	let rc = $reactive(this).attach($scope);
	
	this.subscribe("usuarios",()=>{
		return [{ "profile.estatus":true }];
	});
	
  this.credentials = {
    username: '',
    password: ''
  };

  this.login = function () {
	  Meteor.apply('usuarioActivo', [this.credentials.username], function(error, result){
		  console.log(result);
		  if(result == true){
			  $meteor.loginWithPassword(rc.credentials.username, rc.credentials.password).then(
		      function () {
			      toastr.success("Bienvenido al Sistema");
			      if(Meteor.user().roles[0] == "alumno"){
				      $state.go('root.alumnoMuro',{campus_id : Meteor.user().profile.campus_id});
			      }else{
				      $state.go('root.home');
			      }
		        
		      },
		      function (error) {
			      if(error.reason == "Match failed"){
				      toastr.error("Escriba su usuario y contraseña para iniciar");
			      }else if(error.reason == "User not found"){
				      toastr.error("Usuario no encontrado");
			      }else if(error.reason == "Incorrect password"){
				      toastr.error("Contraseña incorrecta");
			      }        
		      }
		    )
		  }else{
			  toastr.error("Su usuario ya no está autorizado para entrar.");
		  }
	    $scope.$apply();
	  });
	    
	  
	  
  }
  

	
}