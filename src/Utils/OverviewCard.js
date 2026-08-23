// import { useNavigate } from "react-router-dom";

const colorClasses = [
  {bgColor: "bg-blue-50 dark:bg-blue-950/40",borderColor: "border-l-4 border-blue-400",textColor: "text-blue-800 dark:text-blue-300",},
  {bgColor: "bg-green-50 dark:bg-green-950/40",borderColor: "border-l-4 border-green-400",textColor: "text-green-800 dark:text-green-300",},
  {bgColor: "bg-yellow-50 dark:bg-yellow-950/40",borderColor: "border-l-4 border-yellow-400",textColor: "text-yellow-800 dark:text-yellow-300",},
  {bgColor: "bg-red-50 dark:bg-red-950/40",borderColor: "border-l-4 border-red-400",textColor: "text-red-800 dark:text-red-300",},];

const OverviewCard = ({ title, items, nav = [] }) => {
  // const navigate = useNavigate();

  return (
    <div className="w-full bg-card text-card-foreground shadow-lg rounded-lg p-5 mb-5 pb-3">
      {title && <h2 className="text-xl font-bold mb-4 text-foreground">{title}</h2>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {items.map((item, index) => {
          const color = colorClasses[index % colorClasses.length];

          return (
            <div
              key={index}
              // onClick={() => navigate(`${item.nav}`)}
              className={`p-4 rounded-xl shadow-sm cursor-pointer transition hover:scale-[1.01] ${color.bgColor} ${color.borderColor}`}>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className={`text-xl font-bold ${color.textColor}`}>{item.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OverviewCard;
