
angular.module('casserole').directive('valida', validador);
	function validador () {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
    	element.carga = false
			input = element.find('.form-control');
    	var formName = element.parents('form').attr('name');
    	scope.$watch(formName + '.' + input[0].name + '.$invalid', function (val) {
    		if(element.carga){
          if(val)
          	element.addClass('has-error');
          else
          	element.removeClass('has-error');
        }else{
          element.carga = true
        }
      });
    }
  };
}

angular.module('casserole').directive('validaForm', validaForm);
	function validaForm () {
  return {
    restrict: 'A',
      scope:{
          formulario:"="
      },
     link: function(scope, element, attrs) {
			element.on("click", function () {
        errorsType = scope.formulario.$error;
        if(errorsType != undefined){
          angular.forEach(errorsType, function(errors){
            errors.forEach(function(error){
              if(error.$invalid == true){
                var elem = document.getElementsByName(error.$name)[0].parentElement;
                elem.className += " has-error";
              }
            })
          });
        }else{
          setTimeout(function() {$("div").removeClass("has-error");}, 10);  
        }
      });
		}
  }
}