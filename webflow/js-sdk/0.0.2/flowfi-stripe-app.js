(function() {
  // TODO: read this value from the .flowfi-stripe-checkout-btn container as a list..
  var stripe_api_id = document.body.getAttribute('data-flowfi_stripe_api_id');
  var stripe_test_api_id = document.body.getAttribute('data-flowfi_stripe_test_api_id');
  var stripe;
  var stripe_is_test = false;
  var stripe_is_processing = false;  // to prevent double-submit..

// in order to be able to work with the test dev domain, as well as the live prod domain
  var url = window.location.protocol + '//' + window.location.hostname;

  if (url.indexOf('webflow') > 1) {
    stripe = Stripe(stripe_test_api_id);
    stripe_is_test = true;
  } else {
    stripe = Stripe(stripe_api_id);
  }

  // TODO: change this query to getElementsByClassName('flowfi-stripe-checkout-btn')[0]
  var stripeButtons = document.querySelectorAll('.flowfi-stripe-checkout-btn');

  stripeButtons.forEach(function(btn) {

    /*
     * When the user clicks on the element (button),
     * redirect to Checkout.
     */
    btn.addEventListener('click', function (e) {
      e.preventDefault && e.preventDefault();
      e.stopPropagation && e.stopPropagation();
      if (stripe_is_processing) return;

      // TODO: make this selector find nearest associated sibling element
      var displayError = document.getElementById('flowfi-stripe-error-message');
      displayError.style.display = 'none';

      // TODO: set processing state in ux
      // - also add a window.onLeave handler, to avoid user from refreshing &/no navigating away..
      // - add overlay element to cover page (in theory, disable user input events)..
      // - add indicator element for ux..
      // TODO: flow for error handling, in event of timeout or any client browser issue..

      // read the callback url values from the checkout button element custom attribute values
      var successUrlPath = btn.getAttribute('data-success_url');
      var cancelUrlPath = btn.getAttribute('data-cancel_url');

      // TODO: need to query for test price_api_id value..
      var priceApiId;

      if (stripe_is_test) {
        priceApiId = btn.getAttribute('data-price_api_id_test');
      } else {
        priceApiId = btn.getAttribute('data-price_api_id');
      }

      // TODO: this is good enough for v0..
      var lineItems = [{ price: priceApiId, quantity: 1 }];

      stripe.redirectToCheckout({
        lineItems: lineItems,
        mode: 'payment',
        /*
         * Do not rely on the redirect to the successUrl for fulfilling
         * purchases, customers may not always reach the successUrl after
         * a successful payment.
         * Instead use one of the strategies described in
         * https://stripe.com/docs/payments/checkout/fulfill-orders
         */
        successUrl: url + successUrlPath,
        cancelUrl: url + cancelUrlPath,
      })
        .then(function (result) {
          console.info('[flowfi-stripe]', 'result:', result);
          stripe_is_processing = false;
          if (result.error) {
            console.error('[flowfi-stripe]', 'result:', result.error);
            /*
             * If `redirectToCheckout` fails due to a browser or network
             * error, display the localized error message to your customer.
             */
            displayError.style.display = 'block';
            displayError.textContent = result.error.message;
          }
        });
    });
  });

})();
