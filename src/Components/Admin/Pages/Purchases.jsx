import { useSelector } from 'react-redux';
import OverviewCard from '../../../Utils/OverviewCard';

const Purchases = () => {
  const { auth } = useSelector(store => store);

  
  return (
    <div className="text-left bg-card z-40 m-3">
      <div className="p-3 border rounded-xl shadow-xl bg-card">
            <p className='text-4xl p-3'>Purchases</p>
            <p className='text-2xl text-center p-3'>Welcome, {`${auth?.user?.user?.firstName} ${auth?.user?.user?.lastName} ${auth?.user?.user?.middleName}`}</p>

            <div>
                <OverviewCard/>
            </div>


        </div>

    </div>
  )
}
export default Purchases