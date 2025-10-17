import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { DollarSign, CalendarCheck, Users, Clock, LineChart as LineChartIcon } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DoctorDashboard = () => {
  const { dashData, setDashData, getDashData, dToken } = useContext(DoctorContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (dToken) {
        await getDashData();
        setLoading(false);
      }
    };
    fetchData();
  }, [dToken]);

  if (loading)
    return <p className="text-center text-gray-500 py-10">Loading dashboard...</p>;

  if (!dashData)
    return <p className="text-center text-gray-500 py-10">No data available</p>;

  const Card = ({ children, className = "" }) => (
    <div className={`rounded-2xl bg-white shadow-md border border-gray-100 ${className}`}>
      {children}
    </div>
  );
  const CardContent = ({ children, className = "" }) => (
    <div className={`p-5 ${className}`}>{children}</div>
  );

  // === Sample mock data for chart ===
  const chartData =
    dashData?.earningsTrend || [
      { date: "Mon", earnings: 200 },
      { date: "Tue", earnings: 300 },
      { date: "Wed", earnings: 250 },
      { date: "Thu", earnings: 400 },
      { date: "Fri", earnings: 150 },
      { date: "Sat", earnings: 380 },
      { date: "Sun", earnings: 500 },
    ];

  return (
    <div className="w-full max-w-6xl mx-auto p-5">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Doctor Dashboard</h2>

      {/* === Stats Cards === */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <Card className="bg-green-50 hover:shadow-lg transition">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <h3 className="text-2xl font-bold text-gray-800">${dashData.earnings}</h3>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </CardContent>
        </Card>

        <Card className="bg-blue-50 hover:shadow-lg transition">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Appointments</p>
              <h3 className="text-2xl font-bold text-gray-800">{dashData.appointments}</h3>
            </div>
            <CalendarCheck className="w-8 h-8 text-blue-600" />
          </CardContent>
        </Card>

        <Card className="bg-purple-50 hover:shadow-lg transition">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Patients</p>
              <h3 className="text-2xl font-bold text-gray-800">{dashData.patients}</h3>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </CardContent>
        </Card>
      </div>

      {/* === Earnings Chart === */}
      <Card className="mb-8">
        <div className="bg-gray-50 px-6 py-3 border-b text-gray-700 font-medium flex items-center gap-2">
          <LineChartIcon className="w-5 h-5 text-gray-500" /> Earnings Over Time
        </div>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "0.75rem",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#10b981" }}
                  activeDot={{ r: 6, fill: "#047857" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* === Latest Appointments === */}
      <div className="bg-white shadow-md rounded-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b text-gray-700 font-medium flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-500" /> Latest Appointments
        </div>

        {dashData.latestAppointments.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No recent appointments</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {dashData.latestAppointments.map((appt) => (
              <div
                key={appt._id}
                className="flex items-center justify-between px-6 py-4 text-sm hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-medium text-gray-800">{appt.userData?.name || "Unknown"}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(appt.slotDate).toLocaleDateString("en-GB")} • {appt.slotTime}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    appt.cancelled
                      ? "bg-red-100 text-red-600"
                      : appt.isCompleted
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {appt.cancelled
                    ? "Cancelled"
                    : appt.isCompleted
                    ? "Completed"
                    : "Upcoming"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
