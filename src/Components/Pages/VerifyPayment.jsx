import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { verifyPay } from '../../Store/PaystackPay/Action';

const VerifyPayment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const hasVerified = useRef(false);

  const reference = searchParams.get('reference') || searchParams.get('trxref');


  useEffect(() => {
    const getLoanIdFromPath = () => {
      const parts = location.pathname.split('/');
      const repayIndex = parts.indexOf('repay');
      return repayIndex !== -1 ? parts[repayIndex + 1] : null;
    };

    const loanId = getLoanIdFromPath();

    const verify = async () => {
      if (!reference) {
        console.error('No transaction reference found in URL');
        navigate('/dashboard');
        return;
      }

      try {
        const res = await dispatch(verifyPay(reference));
        const payload = res?.payload;

        if (payload?.status && payload?.data?.status === 'success') {
          if (location.pathname.includes('repay') && loanId) {
            navigate(`/loans/${loanId}`);
          } else if (location.pathname.includes('addshare')) {
            navigate('/shares');
          } else if (location.pathname.includes('save')) {
            navigate('/savings');
          } else {
            navigate('/dashboard');
          }
        } else {
          console.warn('Payment verification failed:', payload);
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Verification error:', error);
        navigate('/dashboard');
      }
    };

    if (!hasVerified.current) {
      hasVerified.current = true;
      verify();
    }
  }, [reference, dispatch, navigate, location]);

  return (
    <div className="p-10 text-center text-lg">
      Verifying your payment...
    </div>
  );
};

export default VerifyPayment;
