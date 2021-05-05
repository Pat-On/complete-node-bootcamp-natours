/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  `pk_test_51InSzmKdSVjalotrKGVyz3t0akT0Th5gnljVcolYRvdk5OFjZzObTHdLqG43cKJ2zI3vyREN0DP1Zf2bvZqJ1m4Q00pxb48knX`
);

export const bookTour = async (tourId) => {
  try {
    //we are going to get tour Id from the index.js and index from the dom
    // 1) Get checkout session from API / endpoint
    const session = await axios(`/api/v1/booking/checkout-session/${tourId}`);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
