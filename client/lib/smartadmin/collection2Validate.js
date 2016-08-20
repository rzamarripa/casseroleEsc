angular.module('smartadmin').directive('collection2Validate', ['$rootScope', function ($rootScope) {
  
  return {
    require: 'ngModel',
    restrict: 'A',
    link: function(scope, element, attributes, ctrl) {
      var inputForm = element.closest("form");
      var formName= inputForm.attr("name");
     
      var schema = inputForm.prop("schema");
      var modelName = inputForm.data('collection2-schema');
      var ngModelName = attributes.ngModel.split(".")[attributes.ngModel.split(".").length-1];
      var methodValidation = (modelName+ngModelName+"Validation").toLowerCase();
      //console.log(ctrl);
      //console.log(scope);

      //console.log(ctrl);
      if ('undefined' != typeof  element.attr(methodValidation)) {
          return 
      }

      if ('undefined' != typeof  scope.submitted) {
          scope.submitted == false;
      }

      if("undefined" == typeof scope.validationMessages)
        scope.validationMessages={};

      if("undefined" == typeof scope.validationMessages[methodValidation])
        scope.validationMessages[methodValidation]="";


      var label = schema.schema()[ngModelName].label? schema.schema()[ngModelName].label:ngModelName;

      element.attr("name",ngModelName);
      
      if("undefined" == typeof element.attr("placeholder"))
        element.attr("placeholder",label);

      if(element.parent().find($("label")).length==0)
        element.parent().prepend('<label for="'+ngModelName+'">'+label+'</label>');

      //element.parent().append("<div class='alert  collection2ValidateMessage' role='alert'></div>");
      //element.parent().find(".collection2ValidateMessage").html("uno dos tres por mi");
      //console.log(element.parent().find(".collection2ValidateMessage"));
      ctrl.$validators[methodValidation] = function(modelValue, viewValue) {
        //console.log(modelValue);
        //console.log(ctrl.viewValue);

        var tmpModel={};
        switch(schema.schema()[ngModelName].type){
          case Number:
            tmpModel[ngModelName]=("undefined"==typeof modelValue || modelValue.length==0)? null:parseFloat(modelValue);  
            break;
          case Boolean:
            tmpModel[ngModelName]=("undefined"==typeof modelValue || modelValue.length==0)? null:Boolean(modelValue);  
              break;
          case Date:
            //tmpModel[ngModelName]=("undefined"==typeof modelValue || modelValue.length==0)? null:Date(modelValue);  
            tmpModel[ngModelName]=("undefined"==typeof modelValue || modelValue.length==0)? null:(new Date(("string"== typeof modelValue)? modelValue.replace(" ","T"):modelValue));
            break;
          case String:
            tmpModel[ngModelName]=("undefined"==typeof modelValue || modelValue.length==0)? null:modelValue;  
            break;
          default:
            tmpModel[ngModelName]=("undefined"==typeof modelValue || modelValue.length==0)? null:modelValue;  
        }

        var ssContext1 = schema.newContext();
        if( (!('undefined' === typeof modelValue)  || 
              !schema.schema()[ngModelName].optional) && 
              !ssContext1.validateOne(tmpModel,ngModelName)){
          var ik = ssContext1.invalidKeys();
          ik = _.map(ik, function (o) {
              return _.extend({message: ssContext1.keyErrorMessage(o.name)}, o);
            });
          //console.log(methodValidation,ik[0].message);
          scope.validationMessages[methodValidation]=ik[0].message;
          //console.log($scope[formName][ngModelName]);
          scope.$watch('submitted', function(submitted){

              element.parent().find(".collection2ValidateMessage").remove();
              if(submitted || ctrl.$dirty)
                element.parent().append("<div ng-show='submitted' class='text-danger collection2ValidateMessage' role='alert'>"+"<span class='glyphicon glyphicon-exclamation-sign' aria-hidden='true'></span><span class='sr-only' >Error:</span>"+scope.validationMessages[methodValidation]+"</div>");
           });
          //console.log("si estoy validando");
          scope.validForm =_.reduce(scope.validationMessages,function(memo, num){ 
            //console.log(num);
            return memo && num==""; 
          }, true);
          //console.log(scope.validForm);
            
          return false;
        }
        scope.validationMessages[methodValidation]="";
        //console.log("si estoy validando");
        scope.validForm =_.reduce(scope.validationMessages,function(memo, num){ 
          //console.log(num);
          return memo && num==""; 
        }, true);
        //console.log(scope.validForm);
        element.parent().find(".collection2ValidateMessage").remove();
        return true;
      };
    }
  };
}]);
