
var privatePages = [
  '/auth/register-success',
  '/cart',
  '/checkout',
  '/angies-story'
];

var publicPages = [
  '/auth/register',
  '/auth/activate',
  '/auth/login'
];


/*
  custom webflow bridge between webflow designer & the firebase, stripe SDKs
*/

var FlowFi = {
  register_redirect_url: '/auth/register-success',
  login_redirect_url: '/angies-story'
};




// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();




f = firebase.auth();
f.onAuthStateChanged(function(user) {
  console.info('[firebase]', 'onAuthStateChanged');
  // [todo] firebasesdk register vs signin events
  var currentPath = window.location.pathname;
  
  if (user) {
    // User is signed in.
    if (publicPages.includes(currentPath)) {
      window.location.replace(FlowFi.login_redirect_url);
    
    } else {
      console.log('User is logged in..');
      console.info('[litbox.onAuthStateChanged]', 'firebase user:', user);
      
      console.info('Email: ' + user.email);
      console.info('UID: ' + user.uid);


      // show all elements flagged for authenticated user
      var elements = document.getElementsByClassName('auth-inline-block');
      elements.forEach(function(element, index) {
        element.style.display = 'inline-block';
      });

      // hide all elements flagged for anonymous user
      var elements = document.getElementsByClassName('anon-inline-block');
      elements.forEach(function(element, index) {
        element.style.display = 'none';
      });

    }

  } else {
    // User is signed out.
    if (privatePages.includes(currentPath)) {
      window.location.replace('/');
    
    } else {
      console.info('No user is logged in..');
      
      // hide all elements flagged for authenticated user
      var elements = document.getElementsByClassName('auth-inline-block');
      elements.forEach(function(element, index) {
        element.style.display = 'none';
      });

      // show all elements flagged for anonymous user
      var elements = document.getElementsByClassName('anon-inline-block');
      elements.forEach(function(element, index) {
        element.style.display = 'inline-block';
      });

    }

  }
});






/*
 * LOGOUT
 *
 */
var elements = document.getElementsByClassName('js-logout');
elements.forEach(function(element, index) {
  element.addEventListener('click', function(event) {
    event.preventDefault();
    firebase.auth().signOut();
  }, true);
  
  //element.addEventListener('click', FlowFi.logout, {
  //  capture: true,
  //  passive: false
  //});
});

// [todo] revisit implementation
// FlowFi.logout = function (event)  {
//   event.preventDefault();
//   firebase.auth().signOut();
// };






/*
 * LOGIN
 *
 */
var elements = document.getElementsByClassName('js-login-form-submit-btn');
elements.forEach(function(element, index) {
  element.addEventListener('click', function(event) {
    event.preventDefault();

    var $form = $('#wf-form-loginForm');
    var $loginError = $('#loginError');
    var $loginButton = $('#loginButton');
    var formData = $form.serialize();
    console.info('formData:', formData);

    // reset ui-state to hide previous errors/feedback
    loginButton.style.display = 'none';
    $loginError.hide();

    var email = loginEmail.value;
    var password = loginPassword.value;

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then (function () {
        console.info('[firebase-sdk]', 'signin success callback');
        
        alert('continue?');

        window.location.replace(FlowFi.login_redirect_url);
      })
      .catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        
        console.warn('FlowFi][firebase][login-callback]', 'login failed.');
        console.warn('- error object:', error);
        console.warn('- error code:', errorCode);
        console.warn('- error message:', errorMessage);

        loginButton.style.display = 'block';
        $(loginError).innerText = errorMessage;
        loginError.style.display = 'block'
    });

  });
});

function loginSubmitHandler () {
  loginButton.style.display = 'none';
  loginError.style.display = 'none';

  var email = loginEmail.value;
  var password = loginPassword.value;

  firebase.auth().signInWithEmailAndPassword(email, password)
      .then (function () {
          window.location.replace('./shop');
  })
  .catch(function(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log('Error code: ' + errorCode);
    console.log('Error message: ' + errorMessage);
    loginButton.style.display = 'block';
    loginError.innerText = errorMessage;
    loginError.style.display = 'block'
  });
}





/*
 * REGISTER
 *
 * - create user account in firebase-sdk
 */

     
/*
  register form - submit event handler 
  */
var elements = document.getElementsByClassName('js-register-form-submit-btn');
elements.forEach(function(element, index) {
  element.addEventListener('click', function(event) {
    event.preventDefault();
    
    // firebase sdk: create user
    signupButton.style.display = 'none';
    signupError.style.display = 'none';
    var email = signupEmail.value;
    var password = signupPassword.value;

    firebase.auth().createUserWithEmailAndPassword(email, password).then (function () {
      window.location.replace(FlowFi.register_redirect_url);
    }).catch(function (error) {
      // debug logging
      var errorCode = error.code;
      var errorMessage = error.message;
      
      console.warn('[FlowFi][firebase][create-user-callback]', 'create account failed.', 'error return object:', error);
      console.warn('- error code:', errorCode);
      console.warn('- error message:', errorMessage);
      

      // update ui for user feedback
      signupButton.style.display = 'block';
      signupError.innerText = errorMessage;
      signupError.style.display = 'block'
    });

  }, true);
});




/*
 * WEBFLOW FORM HOOKS TO FIREBASE API
 *
 * [break webflow forms] custom form handling
 * to use: from webflow editor, on the form symbol/element, add the custom-data attribute: `data-customform (value: true)`
 *
 */
var Webflow = Webflow || [];
Webflow.push(function() {  
  // unbind webflow form handling
  $(document).off('submit');
  // new form handling
  $('[data-customform]').each(function (form) {
    $(form).submit(function (event) {
      console.warn('FlowFi]', 'preventing webflow form..');
      event.preventDefault();
    });
  })
});
