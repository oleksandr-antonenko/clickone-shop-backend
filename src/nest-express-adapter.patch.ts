(function patchNestExpressAdapter() {
  const express = require('express');
  const originalGet = express.application.get;
  
  express.application.get = function(name: any) {
    if (name === 'router') {
      return undefined;
    }
    return originalGet.call(this, name);
  };
})();
