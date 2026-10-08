import React, {
  useEffect,
  useState
} from 'react';

import {
  useNavigate,
  useParams
} from 'react-router-dom';

import {
  ArrowLeft,
  MapPin,
  Calendar,
  Home,
  User,
  CreditCard,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  Mail,
  Download
} from 'lucide-react';

import api from '../services/api';


const PropertyDetails = () => {

  const {
    id
  } = useParams();

  const navigate =
    useNavigate();


  // ============================================================
  // PROPERTY
  // ============================================================

  const [
    property,
    setProperty
  ] = useState(null);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState('');


  // ============================================================
  // RENTAL
  // ============================================================

  const [
    rental,
    setRental
  ] = useState(null);

  const [
    rentalLoading,
    setRentalLoading
  ] = useState(true);


  // ============================================================
  // BOOKING
  // ============================================================

  const [
    booking,
    setBooking
  ] = useState(false);

  const [
    bookingMessage,
    setBookingMessage
  ] = useState('');


  // ============================================================
  // PAYMENT
  // ============================================================

  const [
    payment,
    setPayment
  ] = useState(null);

  const [
    paymentLoading,
    setPaymentLoading
  ] = useState(false);

  const [
    showPaymentModal,
    setShowPaymentModal
  ] = useState(false);

  const [
    paymentMethod,
    setPaymentMethod
  ] = useState('mock_card');

  const [
    paymentMessage,
    setPaymentMessage
  ] = useState('');

  const [
    paymentResult,
    setPaymentResult
  ] = useState('');


  // ============================================================
  // INVOICE
  // ============================================================

  const [
    invoiceMessage,
    setInvoiceMessage
  ] = useState('');

  const [
    invoiceEmailSent,
    setInvoiceEmailSent
  ] = useState(false);


  // ============================================================
  // RENTAL DATES
  // ============================================================

  const [
    startDate,
    setStartDate
  ] = useState('');

  const [
    endDate,
    setEndDate
  ] = useState('');


  // ============================================================
  // TODAY
  // ============================================================

  const today =
    new Date()
      .toISOString()
      .split('T')[0];


  // ============================================================
  // FETCH PROPERTY
  // ============================================================

  useEffect(() => {

    const fetchProperty =
      async () => {

        try {

          setLoading(true);
          setError('');

          const response =
            await api.get(
              `/properties/${id}`
            );

          setProperty(
            response.data
          );

        } catch (err) {

          console.error(
            'Property details error:',
            err
          );

          setError(
            err.response?.data?.message ||
            'Failed to load property details.'
          );

        } finally {

          setLoading(false);

        }
      };


    if (id) {
      fetchProperty();
    }

  }, [id]);


  // ============================================================
  // FETCH TENANT RENTAL + PAYMENT
  // ============================================================

  useEffect(() => {

    const fetchRental =
      async () => {

        try {

          setRentalLoading(true);

          const response =
            await api.get(
              '/rentals/my-rentals'
            );

          const rentals =
            response.data?.rentals ||
            response.data ||
            [];


          if (!Array.isArray(rentals)) {

            setRental(null);
            setPayment(null);

            return;
          }


          // ----------------------------------------------------
          // FIND RENTAL FOR THIS PROPERTY
          // ----------------------------------------------------

          const propertyRental =
            rentals.find(
              (item) => {

                const propertyId =
                  typeof item.property === 'object'
                    ? item.property?._id
                    : item.property;

                return (
                  propertyId?.toString() ===
                  id?.toString()
                );

              }
            );


          setRental(
            propertyRental || null
          );


          // ----------------------------------------------------
          // PAYMENT STATUS
          // ----------------------------------------------------

          if (
            propertyRental &&
            propertyRental.status === 'active'
          ) {

            try {

              const paymentResponse =
                await api.get(
                  `/payments/status/${propertyRental._id}`
                );


              if (
                paymentResponse.data?.hasPayment &&
                paymentResponse.data?.payment
              ) {

                const paymentData =
                  paymentResponse.data.payment;

                setPayment(
                  paymentData
                );


                // ------------------------------------------------
                // INVOICE STATUS
                // ------------------------------------------------

                setInvoiceEmailSent(
                  Boolean(
                    paymentData.invoiceEmailSent ||
                    paymentData.invoiceEmailSentAt
                  )
                );

              } else {

                setPayment(null);
                setInvoiceEmailSent(false);

              }

            } catch (paymentError) {

              console.error(
                'Payment status error:',
                paymentError
              );

              setPayment(null);
              setInvoiceEmailSent(false);

            }

          } else {

            setPayment(null);
            setInvoiceEmailSent(false);

          }

        } catch (err) {

          console.error(
            'Rental status error:',
            err
          );

          setRental(null);
          setPayment(null);
          setInvoiceEmailSent(false);

        } finally {

          setRentalLoading(false);

        }

      };


    if (id) {
      fetchRental();
    }

  }, [id]);


  // ============================================================
  // BOOK PROPERTY
  // ============================================================

  const handleBookProperty =
    async () => {

      setBookingMessage('');


      // --------------------------------------------------------
      // DATE VALIDATION
      // --------------------------------------------------------

      if (!startDate) {

        setBookingMessage(
          'Please select a rental start date.'
        );

        return;
      }


      if (!endDate) {

        setBookingMessage(
          'Please select a rental end date.'
        );

        return;
      }


      const start =
        new Date(startDate);

      const end =
        new Date(endDate);


      if (
        Number.isNaN(
          start.getTime()
        ) ||
        Number.isNaN(
          end.getTime()
        )
      ) {

        setBookingMessage(
          'Please select valid rental dates.'
        );

        return;
      }


      if (end <= start) {

        setBookingMessage(
          'Rental end date must be after the start date.'
        );

        return;
      }


      try {

        setBooking(true);


        const response =
          await api.post(
            '/rentals/book',
            {
              propertyId:
                property._id,

              startDate,

              endDate
            }
          );


        setBookingMessage(
          response.data?.message ||
          'Rental request sent successfully.'
        );


        // ------------------------------------------------------
        // REFRESH RENTAL
        // ------------------------------------------------------

        const rentalsResponse =
          await api.get(
            '/rentals/my-rentals'
          );

        const rentals =
          rentalsResponse.data?.rentals ||
          rentalsResponse.data ||
          [];


        const latestRental =
          rentals.find(
            (item) => {

              const propertyId =
                typeof item.property === 'object'
                  ? item.property?._id
                  : item.property;

              return (
                propertyId?.toString() ===
                id?.toString()
              );

            }
          );


        setRental(
          latestRental || null
        );


        // ------------------------------------------------------
        // GO TO MY RENTALS
        // ------------------------------------------------------

        setTimeout(() => {

          navigate('/rentals');

        }, 1200);

      } catch (err) {

        console.error(
          'Booking error:',
          err
        );

        setBookingMessage(
          err.response?.data?.message ||
          'Failed to send rental request.'
        );

      } finally {

        setBooking(false);

      }

    };


  // ============================================================
  // CREATE MOCK PAYMENT ORDER
  // ============================================================

  const handleStartPayment =
    async () => {

      setPaymentMessage('');
      setPaymentResult('');
      setInvoiceMessage('');


      if (!rental) {

        setPaymentMessage(
          'Rental request not found.'
        );

        return;
      }


      // --------------------------------------------------------
      // PAYMENT ONLY AFTER APPROVAL
      // --------------------------------------------------------

      if (
        rental.status !== 'agreement_accepted'
      ) {

        setPaymentMessage(
          'Payment is available only after you accept the agreement.'
        );

        return;
      }


      // --------------------------------------------------------
      // ALREADY PAID
      // --------------------------------------------------------

      if (
        payment?.paymentStatus === 'paid'
      ) {

        setPaymentMessage(
          'Payment has already been completed.'
        );

        return;
      }


      try {

        setPaymentLoading(true);


        const response =
          await api.post(
            '/payments/create-order',
            {
              rentalId:
                rental._id
            }
          );


        const order =
          response.data?.order;


        if (!order) {

          throw new Error(
            'Payment order was not created.'
          );

        }


        // ------------------------------------------------------
        // SAVE PAYMENT ORDER
        // ------------------------------------------------------

        setPayment({

          ...order,

          paymentId:
            order.paymentId,

          paymentStatus:
            'created'

        });


        setPaymentMessage('');
        setPaymentResult('');
        setInvoiceMessage('');


        // ------------------------------------------------------
        // OPEN MOCK RAZORPAY
        // ------------------------------------------------------

        setShowPaymentModal(
          true
        );

      } catch (err) {

        console.error(
          'Payment order error:',
          err
        );

        setPaymentMessage(
          err.response?.data?.message ||
          'Unable to start payment.'
        );

      } finally {

        setPaymentLoading(false);

      }

    };


  // ============================================================
  // PROCESS MOCK PAYMENT
  // ============================================================

  const handleMockPayment =
    async (result) => {

      setPaymentMessage('');
      setPaymentResult('');
      setInvoiceMessage('');


      // --------------------------------------------------------
      // PAYMENT ID CHECK
      // --------------------------------------------------------

      if (!payment?.paymentId) {

        setPaymentMessage(
          'Payment order is missing. Please click Pay Now again.'
        );

        return;
      }


      try {

        setPaymentLoading(true);


        const response =
          await api.post(
            '/payments/process',
            {

              paymentId:
                payment.paymentId,

              paymentMethod,

              result

            }
          );


        // ------------------------------------------------------
        // SUCCESS
        // ------------------------------------------------------

        if (
          result === 'success'
        ) {

          const paidPayment =
            response.data?.payment;


          if (!paidPayment) {

            throw new Error(
              'Payment response was not received.'
            );

          }


          // ----------------------------------------------------
          // SAVE PAYMENT
          // ----------------------------------------------------

          setPayment({

            ...paidPayment,

            paymentId:
              paidPayment.paymentId ||
              paidPayment._id,

            paymentStatus:
              'paid'

          });


          // ----------------------------------------------------
          // PAYMENT SUCCESS
          // ----------------------------------------------------

          setPaymentResult(
            'success'
          );


          setPaymentMessage(
            response.data?.message ||
            'Payment successful! Your initial rent and security deposit have been paid.'
          );


          // ----------------------------------------------------
          // INVOICE INFORMATION
          // ----------------------------------------------------

          const invoiceGenerated =
            Boolean(
              paidPayment.invoiceGenerated ||
              paidPayment.invoiceNumber
            );


          const emailSent =
            Boolean(
              paidPayment.invoiceEmailSent ||
              paidPayment.invoiceEmailSentAt
            );


          setInvoiceEmailSent(
            emailSent
          );


          if (invoiceGenerated) {

            if (emailSent) {

              setInvoiceMessage(
                `Invoice ${paidPayment.invoiceNumber || ''} generated and sent to your registered email successfully.`
              );

            } else {

              setInvoiceMessage(
                `Invoice ${paidPayment.invoiceNumber || ''} generated successfully. Email delivery could not be confirmed.`
              );

            }

          } else {

            setInvoiceMessage(
              'Payment completed, but invoice generation could not be confirmed.'
            );

          }


          // ----------------------------------------------------
          // CLOSE MODAL
          // ----------------------------------------------------

          setTimeout(() => {

            setShowPaymentModal(
              false
            );

          }, 2500);

        }

      } catch (err) {

        console.error(
          'Mock payment error:',
          err
        );


        setPaymentResult(
          'failed'
        );


        setPaymentMessage(
          err.response?.data?.message ||
          'Mock payment failed.'
        );

      } finally {

        setPaymentLoading(false);

      }

    };


  // ============================================================
  // CLOSE PAYMENT MODAL
  // ============================================================

  const closePaymentModal =
    () => {

      if (paymentLoading) {
        return;
      }


      setShowPaymentModal(
        false
      );

      setPaymentMessage('');
      setPaymentResult('');

    };


  // ============================================================
  // DOWNLOAD INVOICE
  // ============================================================

  const handleDownloadInvoice =
    async () => {

      if (
        !payment?.invoiceNumber
      ) {

        setInvoiceMessage(
          'Invoice is not available yet.'
        );

        return;
      }


      try {

        setPaymentLoading(true);


        /*
         * The backend should expose an invoice download route
         * if you want browser download from this button.
         *
         * Example:
         * GET /payments/invoice/:paymentId
         */

        const response =
          await api.get(
            `/payments/invoice/${payment.paymentId}`,
            {
              responseType: 'blob'
            }
          );


        const blob =
          new Blob(
            [response.data],
            {
              type: 'application/pdf'
            }
          );


        const url =
          window.URL.createObjectURL(
            blob
          );


        const link =
          document.createElement('a');

        link.href = url;

        link.download =
          `${payment.invoiceNumber}.pdf`;

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        window.URL.revokeObjectURL(
          url
        );

      } catch (err) {

        console.error(
          'Invoice download error:',
          err
        );

        setInvoiceMessage(
          err.response?.data?.message ||
          'Invoice download is not available yet.'
        );

      } finally {

        setPaymentLoading(false);

      }

    };


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (

      <div className="min-h-screen bg-paper flex items-center justify-center">

        <p className="text-ink-muted">

          Loading property...

        </p>

      </div>

    );

  }


  // ============================================================
  // ERROR
  // ============================================================

  if (
    error ||
    !property
  ) {

    return (

      <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6">

        <h2 className="text-2xl font-semibold text-ink mb-2">

          Property Not Found

        </h2>


        <p className="text-ink-muted mb-6">

          {error ||
            'The requested property could not be found.'}

        </p>


        <button
          onClick={() =>
            navigate('/properties')
          }
          className="px-5 py-2.5 bg-ink text-white rounded-lg"
        >

          Back to Properties

        </button>

      </div>

    );

  }


  // ============================================================
  // PAYMENT AMOUNT
  // ============================================================

  const monthlyRent =
    Number(
      rental?.monthlyRent ??
      property.monthlyRent ??
      0
    );


  const securityDeposit =
    Number(
      rental?.securityDeposit ??
      property.securityDeposit ??
      0
    );


  const initialPayment =
    monthlyRent +
    securityDeposit;


  // ============================================================
  // IMAGE
  // ============================================================

  const imageUrl =
    property.images &&
    property.images.length > 0
      ? property.images[0].startsWith(
          'http'
        )
        ? property.images[0]
        : `http://localhost:5000${property.images[0]}`
      : null;


  // ============================================================
  // PAGE
  // ============================================================

  return (

    <div className="min-h-screen bg-paper px-6 py-8">

      <div className="max-w-6xl mx-auto">


        {/* BACK */}

        <button
          onClick={() =>
            navigate('/properties')
          }
          className="flex items-center gap-2 text-ink-muted hover:text-ink mb-6"
        >

          <ArrowLeft size={18} />

          Back to Properties

        </button>


        {/* PROPERTY IMAGE */}

        <div className="bg-white rounded-2xl overflow-hidden mb-8">

          <div className="h-[380px] bg-gray-100 flex items-center justify-center">

            {imageUrl ? (

              <img
                src={imageUrl}
                alt={property.title}
                className="w-full h-full object-cover"
              />

            ) : (

              <div className="text-center text-ink-muted">

                <Home
                  size={48}
                  className="mx-auto mb-3"
                />

                <p>
                  No property image available
                </p>

              </div>

            )}

          </div>

        </div>


        {/* MAIN */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">


          {/* LEFT */}

          <div className="lg:col-span-2">


            {/* BASIC INFORMATION */}

            <div className="bg-white rounded-2xl p-7 mb-6">

              <div className="flex items-start justify-between gap-4 mb-4">

                <div>

                  <h1 className="text-3xl font-semibold text-ink">

                    {property.title}

                  </h1>


                  <div className="flex items-center gap-2 text-ink-muted mt-2">

                    <MapPin size={17} />

                    <span>

                      {property.address}

                      {property.city
                        ? `, ${property.city}`
                        : ''}

                      {property.state
                        ? `, ${property.state}`
                        : ''}

                    </span>

                  </div>

                </div>


                <span
                  className={`px-3 py-1.5 rounded-full text-sm ${
                    property.status === 'available'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >

                  {property.status}

                </span>

              </div>


              <p className="text-ink-muted leading-7">

                {property.description ||
                  'No description available.'}

              </p>

            </div>


            {/* PROPERTY DETAILS */}

            <div className="bg-white rounded-2xl p-7 mb-6">

              <h2 className="text-xl font-semibold text-ink mb-5">

                Property Details

              </h2>


              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">


                <div>

                  <p className="text-sm text-ink-muted">
                    Property Type
                  </p>

                  <p className="font-medium capitalize">
                    {property.propertyType}
                  </p>

                </div>


                <div>

                  <p className="text-sm text-ink-muted">
                    Bedrooms
                  </p>

                  <p className="font-medium">
                    {property.bedrooms}
                  </p>

                </div>


                <div>

                  <p className="text-sm text-ink-muted">
                    Bathrooms
                  </p>

                  <p className="font-medium">
                    {property.bathrooms}
                  </p>

                </div>


                <div>

                  <p className="text-sm text-ink-muted">
                    Area
                  </p>

                  <p className="font-medium">
                    {property.area} sq.ft.
                  </p>

                </div>


                <div>

                  <p className="text-sm text-ink-muted">
                    Furnishing
                  </p>

                  <p className="font-medium capitalize">

                    {property.furnishing
                      ? property.furnishing.replace(
                          '_',
                          ' '
                        )
                      : 'Not specified'}

                  </p>

                </div>


                <div>

                  <p className="text-sm text-ink-muted">
                    Pincode
                  </p>

                  <p className="font-medium">
                    {property.pincode}
                  </p>

                </div>


              </div>

            </div>


            {/* LANDLORD */}

            <div className="bg-white rounded-2xl p-7">

              <h2 className="text-xl font-semibold text-ink mb-5">

                Landlord

              </h2>


              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">

                  <User size={22} />

                </div>


                <div>

                  <p className="font-medium text-ink">

                    {property.landlord?.name ||
                      'Landlord'}

                  </p>


                  <p className="text-sm text-ink-muted">

                    {property.landlord?.email ||
                      ''}

                  </p>


                  {property.landlord?.phone && (

                    <p className="text-sm text-ink-muted">

                      {property.landlord.phone}

                    </p>

                  )}

                </div>

              </div>

            </div>


          </div>


          {/* RIGHT */}

          <div>

            <div className="bg-white rounded-2xl p-7 sticky top-6">


              {/* RENT */}

              <p className="text-sm text-ink-muted mb-1">

                Monthly Rent

              </p>


              <p className="text-3xl font-semibold text-ink mb-6">

                ₹
                {Number(
                  property.monthlyRent || 0
                ).toLocaleString(
                  'en-IN'
                )}

              </p>


              <div className="border-t border-gray-200 pt-5 mb-5">


                {/* SECURITY */}

                <div className="flex justify-between mb-4">

                  <span className="text-ink-muted">

                    Security Deposit

                  </span>


                  <span className="font-medium">

                    ₹
                    {Number(
                      property.securityDeposit || 0
                    ).toLocaleString(
                      'en-IN'
                    )}

                  </span>

                </div>


                {/* PROPERTY STATUS */}

                <div className="flex justify-between mb-4">

                  <span className="text-ink-muted">

                    Property Status

                  </span>


                  <span className="font-medium capitalize">

                    {property.status}

                  </span>

                </div>


                {/* RENTAL STATUS */}

                {rental && (

                  <div className="flex justify-between">

                    <span className="text-ink-muted">

                      Rental Request

                    </span>


                    <span className="font-medium capitalize">

                      {rental.status}

                    </span>

                  </div>

                )}

              </div>


              {/* =================================================
                  PENDING REQUEST
              ================================================== */}

              {!rentalLoading &&
                rental?.status === 'pending' && (

                  <div className="mb-5 p-4 rounded-xl bg-yellow-50 border border-yellow-200">

                    <div className="flex items-center gap-2 text-yellow-700 font-semibold mb-1">

                      <Calendar size={17} />

                      Request Pending

                    </div>


                    <p className="text-sm text-yellow-700">

                      Your rental request has been sent
                      to the landlord. Payment will be
                      available after approval.

                    </p>

                  </div>

                )}


              {/* =================================================
                  ACCEPTED RENTAL
              ================================================== */}

              {!rentalLoading &&
                rental?.status === 'active' &&
                payment?.paymentStatus !== 'paid' && (

                  <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200">

                    <div className="flex items-center gap-2 text-green-700 font-semibold mb-1">

                      <CheckCircle size={17} />

                      Rental Accepted

                    </div>


                    <p className="text-sm text-green-700">

                      Landlord has accepted your request.
                      You can now complete the initial payment.

                    </p>

                  </div>

                )}


              {/* =================================================
                  PAYMENT SUCCESS
              ================================================== */}

              {payment?.paymentStatus === 'paid' && (

                <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200">

                  <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">

                    <CheckCircle size={18} />

                    Payment Successful

                  </div>


                  <p className="text-sm text-green-700 mb-2">

                    Initial rent and security deposit
                    payment completed.

                  </p>


                  <p className="text-xs text-green-600 mb-1">

                    Transaction:
                    {' '}
                    {payment.transactionId}

                  </p>


                  {/* INVOICE */}

                  {payment.invoiceNumber && (

                    <div className="mt-3 pt-3 border-t border-green-200">

                      <div className="flex items-center gap-2 text-green-700 text-sm font-medium">

                        <FileText size={16} />

                        Invoice:
                        {' '}
                        {payment.invoiceNumber}

                      </div>


                      {invoiceEmailSent && (

                        <div className="flex items-center gap-2 text-xs text-green-600 mt-2">

                          <Mail size={14} />

                          Invoice sent to your registered email.

                        </div>

                      )}


                      {/* DOWNLOAD */}

                      <button
                        type="button"
                        onClick={
                          handleDownloadInvoice
                        }
                        disabled={
                          paymentLoading
                        }
                        className="mt-3 w-full py-2.5 rounded-lg border border-green-300 text-green-700 hover:bg-green-100 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                      >

                        {paymentLoading ? (

                          <>

                            <Loader2
                              size={16}
                              className="animate-spin"
                            />

                            Preparing Invoice...

                          </>

                        ) : (

                          <>

                            <Download size={16} />

                            Download Invoice

                          </>

                        )}

                      </button>

                    </div>

                  )}

                </div>

              )}


              {/* =================================================
                  INVOICE MESSAGE
              ================================================== */}

              {invoiceMessage && (

                <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">

                  <div className="flex items-start gap-2 text-blue-700 text-sm">

                    <Mail
                      size={16}
                      className="mt-0.5 shrink-0"
                    />

                    <span>
                      {invoiceMessage}
                    </span>

                  </div>

                </div>

              )}


              {/* =================================================
                  RENTAL DATES
              ================================================== */}

              {property.status === 'available' &&
                !rentalLoading &&
                !rental && (

                  <div className="border-t border-gray-200 pt-5 mb-5">

                    <h3 className="text-sm font-semibold text-ink mb-4">

                      Rental Period

                    </h3>


                    {/* START */}

                    <div className="mb-4">

                      <label
                        htmlFor="startDate"
                        className="flex items-center gap-2 text-sm text-ink-muted mb-2"
                      >

                        <Calendar size={15} />

                        Start Date

                      </label>


                      <input
                        id="startDate"
                        type="date"
                        value={startDate}
                        min={today}
                        onChange={(e) =>
                          setStartDate(
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-ink outline-none focus:border-lease-600 focus:ring-1 focus:ring-lease-600"
                      />

                    </div>


                    {/* END */}

                    <div>

                      <label
                        htmlFor="endDate"
                        className="flex items-center gap-2 text-sm text-ink-muted mb-2"
                      >

                        <Calendar size={15} />

                        End Date

                      </label>


                      <input
                        id="endDate"
                        type="date"
                        value={endDate}
                        min={
                          startDate ||
                          today
                        }
                        onChange={(e) =>
                          setEndDate(
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-ink outline-none focus:border-lease-600 focus:ring-1 focus:ring-lease-600"
                      />

                    </div>

                  </div>

                )}


              {/* BOOKING MESSAGE */}

              {bookingMessage && (

                <div className="mb-4 p-3 rounded-lg bg-gray-100 text-sm text-ink">

                  {bookingMessage}

                </div>

              )}


              {/* PAYMENT MESSAGE */}

              {paymentMessage &&
                !showPaymentModal && (

                  <div className="mb-4 p-3 rounded-lg bg-gray-100 text-sm text-ink">

                    {paymentMessage}

                  </div>

                )}


              {/* =================================================
                  MAIN ACTION BUTTON
              ================================================== */}

              {rentalLoading ? (

                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-gray-400 text-white flex items-center justify-center gap-2"
                >

                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Checking rental status...

                </button>

              ) : rental?.status === 'pending' ? (

                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-yellow-500 text-white disabled:opacity-80"
                >

                  Request Pending

                </button>

              ) : rental?.status === 'active' &&
                payment?.paymentStatus !== 'paid' ? (

                <button
                  onClick={
                    handleStartPayment
                  }
                  disabled={
                    paymentLoading
                  }
                  className="w-full py-3 rounded-xl bg-ink text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >

                  {paymentLoading ? (

                    <>

                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Preparing Payment...

                    </>

                  ) : (

                    <>

                      <CreditCard
                        size={18}
                      />

                      Pay Now ₹
                      {initialPayment.toLocaleString(
                        'en-IN'
                      )}

                    </>

                  )}

                </button>

              ) : rental?.status === 'active' &&
                payment?.paymentStatus === 'paid' ? (

                <button
                  onClick={() =>
                    navigate('/agreements')
                  }
                  className="w-full py-3 rounded-xl bg-green-600 text-white flex items-center justify-center gap-2"
                >

                  <CheckCircle
                    size={18}
                  />

                  Continue to Agreement

                </button>

              ) : property.status === 'available' ? (

                <button
                  onClick={
                    handleBookProperty
                  }
                  disabled={booking}
                  className="w-full py-3 rounded-xl bg-ink text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >

                  {booking
                    ? 'Sending Request...'
                    : 'Book Property'}

                </button>

              ) : (

                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-gray-400 text-white disabled:opacity-70"
                >

                  Property Not Available

                </button>

              )}


              <p className="text-xs text-ink-muted text-center mt-4">

                {rental?.status === 'active'
                  ? 'Payment is required after landlord approval.'
                  : 'Your request will be sent to the landlord for approval. Payment is available only after approval.'}

              </p>


            </div>

          </div>

        </div>

      </div>


      {/* ========================================================
          MOCK RAZORPAY MODAL
      ========================================================= */}

      {showPaymentModal && (

        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">

          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">


            {/* HEADER */}

            <div className="bg-ink text-white px-6 py-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs uppercase tracking-wider text-gray-300">

                    SmartLease AI

                  </p>


                  <h2 className="text-xl font-semibold mt-1">

                    Mock Razorpay Checkout

                  </h2>

                </div>


                <button
                  onClick={
                    closePaymentModal
                  }
                  disabled={
                    paymentLoading
                  }
                  className="text-gray-300 hover:text-white text-xl"
                >

                  ×

                </button>

              </div>

            </div>


            {/* BODY */}

            <div className="p-6">


              {/* AMOUNT */}

              <div className="bg-gray-50 rounded-xl p-4 mb-5">

                <p className="text-sm text-gray-500">

                  Amount to Pay

                </p>


                <p className="text-3xl font-semibold text-ink mt-1">

                  ₹
                  {Number(
                    payment?.amount ||
                    initialPayment
                  ).toLocaleString(
                    'en-IN'
                  )}

                </p>


                <div className="border-t border-gray-200 mt-4 pt-3 text-sm">

                  <div className="flex justify-between mb-2">

                    <span className="text-gray-500">

                      First Month Rent

                    </span>


                    <span>

                      ₹
                      {monthlyRent.toLocaleString(
                        'en-IN'
                      )}

                    </span>

                  </div>


                  <div className="flex justify-between">

                    <span className="text-gray-500">

                      Security Deposit

                    </span>


                    <span>

                      ₹
                      {securityDeposit.toLocaleString(
                        'en-IN'
                      )}

                    </span>

                  </div>

                </div>

              </div>


              {/* DEMO NOTICE */}

              <div className="mb-5 p-3 rounded-lg bg-blue-50 border border-blue-200">

                <p className="text-xs text-blue-700">

                  <strong>Demo Payment:</strong>{' '}

                  This is a college-project mock
                  Razorpay checkout. No real money,
                  card, UPI or bank transaction is used.

                </p>

              </div>


              {/* PAYMENT METHOD */}

              <p className="text-sm font-semibold text-ink mb-3">

                Select Payment Method

              </p>


              <div className="grid grid-cols-3 gap-2 mb-5">


                {/* CARD */}

                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod(
                      'mock_card'
                    )
                  }
                  className={`p-3 rounded-lg border text-sm ${
                    paymentMethod === 'mock_card'
                      ? 'border-ink bg-gray-100'
                      : 'border-gray-200'
                  }`}
                >

                  Card

                </button>


                {/* UPI */}

                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod(
                      'mock_upi'
                    )
                  }
                  className={`p-3 rounded-lg border text-sm ${
                    paymentMethod === 'mock_upi'
                      ? 'border-ink bg-gray-100'
                      : 'border-gray-200'
                  }`}
                >

                  UPI

                </button>


                {/* NET BANKING */}

                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod(
                      'mock_netbanking'
                    )
                  }
                  className={`p-3 rounded-lg border text-sm ${
                    paymentMethod === 'mock_netbanking'
                      ? 'border-ink bg-gray-100'
                      : 'border-gray-200'
                  }`}
                >

                  Net Banking

                </button>

              </div>


              {/* SUCCESS */}

              {paymentResult === 'success' && (

                <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200">

                  <div className="flex items-center gap-2 text-green-700 font-semibold">

                    <CheckCircle
                      size={19}
                    />

                    Payment Successful

                  </div>


                  <p className="text-xs text-green-700 mt-2">

                    Transaction ID:
                    {' '}
                    {payment?.transactionId}

                  </p>


                  {/* INVOICE SUCCESS */}

                  {payment?.invoiceNumber && (

                    <div className="mt-3 pt-3 border-t border-green-200">

                      <div className="flex items-center gap-2 text-green-700 text-sm font-medium">

                        <FileText size={16} />

                        Invoice Generated

                      </div>


                      <p className="text-xs text-green-700 mt-1">

                        {payment.invoiceNumber}

                      </p>


                      {invoiceEmailSent && (

                        <div className="flex items-center gap-2 text-xs text-green-600 mt-2">

                          <Mail size={14} />

                          Invoice sent to your email.

                        </div>

                      )}

                    </div>

                  )}

                </div>

              )}


              {/* FAILURE */}

              {paymentResult === 'failed' && (

                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200">

                  <div className="flex items-center gap-2 text-red-700 font-semibold">

                    <XCircle
                      size={19}
                    />

                    Payment Failed

                  </div>

                </div>

              )}


              {/* PAYMENT MESSAGE */}

              {paymentMessage && (

                <div className="mb-4 text-sm text-gray-700">

                  {paymentMessage}

                </div>

              )}


              {/* PAYMENT BUTTONS */}

              {paymentResult !== 'success' && (

                <div className="space-y-2">


                  {/* SUCCESS PAYMENT */}

                  <button
                    type="button"
                    onClick={() =>
                      handleMockPayment(
                        'success'
                      )
                    }
                    disabled={
                      paymentLoading
                    }
                    className="w-full py-3 rounded-xl bg-ink text-white disabled:opacity-50 flex items-center justify-center gap-2"
                  >

                    {paymentLoading ? (

                      <>

                        <Loader2
                          size={18}
                          className="animate-spin"
                        />

                        Processing...

                      </>

                    ) : (

                      <>

                        <CreditCard
                          size={18}
                        />

                        Pay ₹
                        {Number(
                          payment?.amount ||
                          initialPayment
                        ).toLocaleString(
                          'en-IN'
                        )}

                      </>

                    )}

                  </button>


                  {/* FAILED PAYMENT */}

                  <button
                    type="button"
                    onClick={() =>
                      handleMockPayment(
                        'failed'
                      )
                    }
                    disabled={
                      paymentLoading
                    }
                    className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >

                    Test Failed Payment

                  </button>

                </div>

              )}


              {/* DEMO TRANSACTION */}

              <p className="text-[11px] text-center text-gray-400 mt-5">

                Demo transaction • No real payment gateway

              </p>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};


export default PropertyDetails;