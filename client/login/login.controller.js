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
		console.log(this.credentials);
	    $meteor.loginWithPassword(this.credentials.username, this.credentials.password).then(
	      function () {
		      toastr.success("Bienvenido al Sistema");
	        $state.go('root.home');        
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
	  
	  
  }
  

	
}