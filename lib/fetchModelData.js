var Promise = require("Promise");

/**
  * FetchModel - Fetch a model from the web server.
  *     url - string - The URL to issue the GET request.
  * Returns: a Promise that should be filled
  * with the response of the GET request parsed
  * as a JSON object and returned in the property
  * named "data" of an object.
  * If the requests has an error the promise should be
  * rejected with an object contain the properties:
  *    status:  The HTTP response status
  *    statusText:  The statusText from the xhr request
  *
*/

// Promises deal with asynch functions
// this network request is asynch, since you don't know how long it'll take
// can attach handlers to promise
// p1.then(funcOnResolve, funcOnReject)
// UserList:
// fetchModel(user/list).then( 
//    function(response) { setState { userList = response } }),
//    function(response) { console.log('error')}

// Remember:
// Called in this order: 1) Constructor 2) Render 3) componentDidMount()

function fetchModel(url) {
  return new Promise(function(resolve, reject) {
      // setTimeout(() => reject({status: 501, statusText: "Not Implemented"}),0);
      // On Success return:
      // resolve({data: getResponseObject});

      function getResponseObject() {
        if (this.readyState !== 4) { // operation is not DONE
          return;
        }
        if (this.status !== 200) {
          // Handle error
          reject({ status: xhr.status, statusText: xhr.statusText });
          return;
        }

        // operation is DONE, and the status is 200 which is good

        // what we want is stored in xhr.responseText
        var obj = JSON.parse(this.responseText);
        resolve({ data: obj }); // data gets passed
        // return obj;
      }

      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = getResponseObject;
      xhr.open("GET", url);
      xhr.send();

  });
}

export default fetchModel;
