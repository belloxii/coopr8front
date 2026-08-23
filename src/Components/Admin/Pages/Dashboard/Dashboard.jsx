import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllSavings } from '../../../../Store/Saving/Action';
import { getAllRepays } from '../../../../Store/Repay/Action';
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import OverviewCard from '../../../../Utils/OverviewCard';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { auth, saving, repay } = useSelector((store) => store);
  const user = auth?.user?.user;

  useEffect(() => {
    if (user?.id) {
      dispatch(getAllSavings());
      dispatch(getAllRepays());
    }
  }, [dispatch, user?.id]);

  const currency = (amount) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount || 0);

  // Calculate stats
  const totalSavings = saving?.savings?.reduce((sum, s) => sum + (s.amount || 0), 0);
  const totalRepay = repay?.repays?.reduce((sum, r) => sum + (r.amount || 0), 0);
  const pendingTransactions = [...(saving?.savings || []), ...(repay?.repays || [])]
    .filter(t => t.status?.toLowerCase() === 'pending').length;

  // Chart data
  const getMonthlyData = (entries) => {
    const monthlyData = Array(12).fill(0);
    entries?.forEach(entry => {
      const month = new Date(entry.createdAt).getMonth();
      monthlyData[month] += entry.amount || 0;
    });
    return monthlyData;
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const lineChartData = {
    labels: months,
    datasets: [
      {
        label: 'Savings',
        data: getMonthlyData(saving?.savings),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Repayments',
        data: getMonthlyData(repay?.repays),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.3,
        fill: true,
      }
    ]
  };

  const pieChartData = {
    labels: ['Savings', 'Repayments'],
    datasets: [
      {
        data: [totalSavings, totalRepay],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)'
        ],
        borderWidth: 1,
      }
    ]
  };

  // OverviewCard items
  const overviewItems = [
    {label: "Total Savings",value: currency(totalSavings),nav: "/admin/savings",},
    {label: "Total Repayments",value: currency(totalRepay),nav: "/admin/loans",},
    {label: "Pending Transactions",value: pendingTransactions,nav: "/admin/transactions",},
    {label: "Pending Transactions",value: pendingTransactions,nav: "/admin/transactions",}
  ];


  return (
    <div className="text-left bg-card z-40 m-3">
      <div className="p-3 border rounded-xl shadow-xl bg-card">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground text-left">Dashboard</h1>
          <p className="text-muted-foreground w-full">Welcome back, {`${user?.firstName || ''} ${user?.lastName || ''}`}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="relative">
            <select className="appearance-none bg-input border-0 rounded-xl py-2 pl-4 pr-8 text-foreground outline-none transition focus:ring-2 focus:ring-green-600/50">
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>This year</option>
              <option>Last year</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-foreground">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

  <OverviewCard title="" items={overviewItems} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-card p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-foreground">Financial Overview</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg">Savings</button>
              <button className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded-lg">Repayments</button>
            </div>
          </div>
          <div className="h-80">
            <Line 
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: value => currency(value).replace('NGN', '₦')
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-foreground mb-6">Transaction Distribution</h2>
          <div className="h-80">
            <Pie 
              data={pieChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                }
              }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-muted-foreground">Savings</span>
            </div>
            <div className="text-sm font-medium text-right">{currency(totalSavings)}</div>
            
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-muted-foreground">Repayments</span>
            </div>
            <div className="text-sm font-medium text-right">{currency(totalRepay)}</div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AdminDashboard;