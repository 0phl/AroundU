import { Link, useLocation } from 'react-router-dom';
import { MapIcon, StarIcon, CalendarIcon, BellIcon } from '@heroicons/react/24/outline';

const navigationButtons = [
  { to: "/map", icon: MapIcon, label: "Map" },
  { to: "/top-rated", icon: StarIcon, label: "Top Rated" },
  { to: "/events", icon: CalendarIcon, label: "Events" },
  { to: "/alerts", icon: BellIcon, label: "Alerts" },
];

export default function NavigationButtons() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
      <div className="grid grid-cols-4 gap-4 px-4 py-2 max-w-xl mx-auto">
        {navigationButtons.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center"
          >
            <Icon className={`w-6 h-6 ${
              location.pathname === to 
                ? 'text-blue-600' 
                : 'text-gray-600'
            }`} />
            <span className={`mt-1 text-xs ${
              location.pathname === to 
                ? 'text-blue-600' 
                : 'text-gray-600'
            }`}>
              {label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}