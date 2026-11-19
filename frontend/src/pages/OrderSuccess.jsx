import { Link, useLocation, useParams } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { inr } from '../utils/format';
import { useTitle } from '../components/ui';

export default function OrderSuccess() {
  useTitle('Order placed');
  const { orderNumber } = useParams();
  const order = useLocation().state?.order;
  return (
    <div className="container-x flex min-h-[60vh] items-center justify-center py-16">
      <div className="card w-full max-w-lg p-8 text-center animate-fadeUp sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500"><FiCheckCircle size={44} /></div>
        <h1 className="mt-6 text-2xl font-extrabold sm:text-3xl">Thank you! Order placed 🎉</h1>
        <p className="mt-2 text-slate-500">We have received your order and will confirm it shortly.</p>
        <div className="mt-6 rounded-2xl bg-rose-50 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">Order number</p>
          <p className="mt-1 text-2xl font-extrabold tracking-wide text-rose-600">{orderNumber}</p>
          {order && <p className="mt-2 text-sm text-slate-600">Amount payable on delivery: <b>{inr(order.total)}</b></p>}
        </div>
        <p className="mt-4 text-xs text-slate-500">Save your order number and mobile number to track your order anytime.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to={`/track-order?orderNumber=${orderNumber}`} className="btn-navy">Track Order</Link>
          <Link to="/shop" className="btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
