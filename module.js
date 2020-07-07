// Allows you to make signed requests by wrapping your original request object
// inside the Signer() function, then simply passing the return value to $.ajax.
// 
// @note Depends on the CryptoJS library being present
// 

var credentials = [];

credentials.region = <region>;
credentials.accessKeyId = <access key>;
credentials.secretAccessKey = <secret key>;


// @param [credentials.region] <string> the AWS region. ie. us-east-1
// @param [credentials.accessKeyId] <string> a valid AWS IAM Access Key ID
// @param [credentials.secretAccessKey] <string> a valid AWS IAM Secret Access Key
// @param [credentials.token] <string> OPTIONAL: a temporary cognito identity token
// @param [request] <object> a standard jQuery request object
var Signer = (function() {
    var sign = {

      toUrl: function(url) {
        var a = document.createElement('a'); a.href = url;
        return a;
      },

      execute: function(credentials, request) {
        var date = new Date();
        var url = this.toUrl(request.url);
        credentials.host = url.host;
        request.route = url.pathname;

        // console.log("Req Body " + request.body);

        var canonical = this.canonicalRequest(credentials, request, date);
        // console.log("canonical : " + canonical)
        var toSign = this.requestToSign(canonical, credentials, date);
        // console.log("toSign : " + toSign)
        var signature = this.signature(toSign, credentials, date);

        return {
          'x-amz-date': this.amzLongDate(date),
          'Authorization': 'AWS4-HMAC-SHA256 Credential=' + credentials.accessKeyId + '/' + this.amzShortDate(date) + '/' + credentials.region + '/execute-api/aws4_request, ' + ('SignedHeaders=content-type;host;x-amz-date;' + (credentials.token ? 'x-amz-security-token' : '') + ', Signature=' + signature),
          'x-amz-security-token': credentials.token || undefined
        };
      },

      canonicalRequest: function(credentials, request, date) {
        return request.method.toUpperCase() + '\n' + (request.route.charAt(0) !== '/' ? '/' + request.route : request.route) + '\n' + this.queryParameters(request.query) + '\ncontent-type:application/json\nhost:' + credentials.host + '\n' + ('x-amz-date:' + this.amzLongDate(date) + '\n' + (credentials.token ? 'x-amz-security-token:' + credentials.token + '\n' : '') + '\n') + ('content-type;host;x-amz-date' + (credentials.token ? 'x-amz-security-token' : '') + '\n') + this.hashString(request.body);
      },

      requestToSign: function(cRequest, credentials, date) {
        return 'AWS4-HMAC-SHA256\n' + this.amzLongDate(date) + '\n' + this.amzShortDate(date) + '/' + credentials.region + '/execute-api/aws4_request\n' + this.hashString(cRequest);
      },

      signature: function(toSign, credentials, date) {
        return this.hmac(this.hmac(this.hmac(this.hmac(this.hmac('AWS4' + credentials.secretAccessKey, this.amzShortDate(date)), credentials.region), 'execute-api'), 'aws4_request'), toSign).toString();
      },

      queryParameters: function(queryParameterObj) {
        var pieces = [];
        if (queryParameterObj) {
          Object.keys(queryParameterObj).sort().forEach(function (k) {
            return pieces.push(k + '=' + encodeURIComponent(queryParameterObj[k]));
          });
        }
        return pieces.length > 0 ? pieces.join('&') : '';
      },

      hashString: function(str) {
        return CryptoJS.SHA256(str).toString();
      },

      hmac: function(key, data) {
        return CryptoJS.HmacSHA256(data, key);
      },

      amzShortDate: function(date) {
        return this.amzLongDate(date).substr(0, 8);
      },

      amzLongDate: function(date) {
        return date.toISOString().replace(/[:\-]|\.\d{3}/g, '').substr(0, 17);
      }

    };
    
    return function(credentials, request) {
      var method = request.type || 'GET';
      return _.extend(request, {
        data: (!method.match(/get/i) ? JSON.stringify(request.data) : ''),
        headers: _.extend((request.headers || {}), sign.execute(credentials, {
          // date: new Date(),
          url: request.url,
          method: method,
          query: (method.match(/get/i) ? request.data : {}),
          body: (!method.match(/get/i) ? JSON.stringify(request.data) : '')
        }))
      });
    }
  })();

/**
 * Sample Example for GET AJAX Call using authorization 
 */

 var settings = {
    async: true,
    crossDomain: true,
    contentType: 'application/json',
    url: <AWS API LINK>',    
    method: "GET"
}

$.ajax(Signer(credentials,settings)).done(function (response) { 

  document.getElementById('output').innerHTML = "GET :<br> " + JSON.stringify(response);

});

/**
 * Sample Example for POST AJAX Call using authorization 
 */

 var settings2 = {
    async: true,
    crossDomain: true,
    contentType: 'application/json',
    url: <AWS API LINK>',
    data: {
        "foo" : "foobar"
    },
    type: "POST"
}

$.ajax(Signer(credentials,settings2)).done(function (response) { 

  document.getElementById('output2').innerHTML = "<br>POST : <br>" + JSON.stringify(response);

});
