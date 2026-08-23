import { useSelector } from 'react-redux';

const Orders = () => {
  const { auth } = useSelector(store => store);

  
  return (
    <div className="text-left bg-card z-40 m-3">
      <div className="p-3 border rounded-xl shadow-xl bg-card">
            <p className='text-4xl p-3'>Orders</p>
            <p className='text-2xl text-center p-3'>Welcome, {`${auth?.user?.user?.firstName} ${auth?.user?.user?.lastName} ${auth?.user?.user?.middleName}`}</p>

        </div>


    </div>
  )
}

export default Orders