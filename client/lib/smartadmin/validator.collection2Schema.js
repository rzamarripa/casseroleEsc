/*
SimpleSchema.messages({
  required: "[label] es requerido",
  minString: "[label] debe contener al menos [min] caracteres",
  maxString: "[label] no debe de exceder los [max] caracteres",
  minNumber: "[label] debe ser al menos [min]",
  maxNumber: "[label] no debe de exceder [max]",
  minDate: "[label] debe ser [min] o posterior",
  maxDate: "[label] no puede ser despues [max]",
  badDate: "[label] no es una fecha valida",
  minCount: "You must specify at least [minCount] values",
  maxCount: "You cannot specify more than [maxCount] values",
  noDecimal: "[label] must be an integer",
  notAllowed: "[value] is not an allowed value",
  expectedString: "[label] must be a string",
  expectedNumber: "[label] must be a number",
  expectedBoolean: "[label] must be a boolean",
  expectedArray: "[label] must be an array",
  expectedObject: "[label] must be an object",
  expectedConstructor: "[label] must be a [type]",
  regEx: [
    {msg: "[label] failed regular expression validation"},
    {exp: SimpleSchema.RegEx.Email, msg: "[label] must be a valid e-mail address"},
    {exp: SimpleSchema.RegEx.WeakEmail, msg: "[label] must be a valid e-mail address"},
    {exp: SimpleSchema.RegEx.Domain, msg: "[label] must be a valid domain"},
    {exp: SimpleSchema.RegEx.WeakDomain, msg: "[label] must be a valid domain"},
    {exp: SimpleSchema.RegEx.IP, msg: "[label] must be a valid IPv4 or IPv6 address"},
    {exp: SimpleSchema.RegEx.IPv4, msg: "[label] must be a valid IPv4 address"},
    {exp: SimpleSchema.RegEx.IPv6, msg: "[label] must be a valid IPv6 address"},
    {exp: SimpleSchema.RegEx.Url, msg: "[label] must be a valid URL"},
    {exp: SimpleSchema.RegEx.Id, msg: "[label] must be a valid alphanumeric ID"}
  ],
  keyNotInSchema: "[key] is not allowed by the schema"
});

angular.module('smartadmin').directive('collection2Schema', ['$rootScope', function ($rootScope) {
  return {
    restrict: "A",
    
    compile:  function(element, attributes){
      if ('undefined' != typeof  element.prop("schema")) {
          return ;
      }
      var modelName=element.data('collection2-schema');
      var schema=eval(modelName+".simpleSchema()");
      //console.log(schema);
      element.attr("name","form"+modelName);
      element.prop("schema",schema);
        
      /*$.listen('parsley:field:error', function (fieldInstance) {
          console.log(fieldInstance);
          arrErrorMsg = ParsleyUI.getErrorsMessages(fieldInstance);
          errorMsg = arrErrorMsg.join(';');

          fieldInstance.$element
              .popover('destroy')
              .popover({

                  placement: 'top',
                  delay: { "show": 500, "hide": 100 },
                  
                  content: errorMsg
              })
              .popover('show');

      });

      $.listen('parsley:field:success', function (fieldInstance) {
          fieldInstance.$element.popover('destroy');
      });

    }
  };
}]);
*/