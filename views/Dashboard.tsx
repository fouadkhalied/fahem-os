import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ADMIN_KPIS, TEACHER_KPIS, PERFORMANCE_DATA } from '../services/mockData';
import { UserRole, Language } from '../types';
import { StatCard } from '../components/StatCard';
import { 
  Megaphone, 
  CheckCircle2, 
  BookOpenCheck, 
  CreditCard, 
  AlertTriangle 
} from 'lucide-react';

interface DashboardProps {
  role: UserRole;
  language: Language;
}

export const Dashboard: React.FC<DashboardProps> = ({ role, language }) => {
  const kpis = role === UserRole.ADMIN ? ADMIN_KPIS : TEACHER_KPIS;
  const isRTL = language === Language.AR;

  const labels = {
    overview: isRTL ? 'نظرة عامة' : 'Performance Overview',
    recent: isRTL ? 'النشاط الأخير' : 'Recent Activity',
    alerts: isRTL ? 'تنبيهات' : 'System Alerts',
    chartTitle: isRTL ? 'تحليل الأداء الأكاديمي' : 'Academic Trends',
  };

  return (
    <div className="space-y-8 pb-10 animate-fadeIn">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <StatCard key={index} kpi={kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-gray-900">{labels.chartTitle}</h3>
            <div className="flex gap-2">
               <button className="px-3 py-1 text-xs font-semibold rounded-full bg-primary-50 text-primary-700">Daily</button>
               <button className="px-3 py-1 text-xs font-semibold rounded-full text-gray-500 hover:bg-gray-50">Weekly</button>
            </div>
          </div>
          <div className="h-[320px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PERFORMANCE_DATA}>
                <defs>
                  <linearGradient id="colorMath" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSci" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)'}}
                />
                <Area type="monotone" dataKey="math" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorMath)" />
                <Area type="monotone" dataKey="science" stroke="#d97706" strokeWidth={3} fillOpacity={1} fill="url(#colorSci)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-bold text-gray-900 mb-6">{labels.recent}</h3>
            <div className="relative pl-4 border-l-2 border-gray-100 space-y-8">
              {[
                { title: 'Report Cards Published', time: '2 hrs ago', icon: <Megaphone size={16} />, color: 'bg-blue-100 text-blue-600 border-blue-200' },
                { title: 'Grade 10 Attendance Verified', time: '4 hrs ago', icon: <CheckCircle2 size={16} />, color: 'bg-green-100 text-green-600 border-green-200' },
                { title: 'New Curriculum Added: Science', time: 'Yesterday', icon: <BookOpenCheck size={16} />, color: 'bg-orange-100 text-orange-600 border-orange-200' },
                { title: 'Tuition Reminder Sent', time: 'Yesterday', icon: <CreditCard size={16} />, color: 'bg-purple-100 text-purple-600 border-purple-200' },
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-[25px] w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${item.color} shadow-sm`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500 font-medium">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100">
               <h3 className="text-sm font-bold text-gray-900 mb-3">{labels.alerts}</h3>
               <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3 items-center">
                 <div className="text-red-500">
                    <AlertTriangle size={24} />
                 </div>
                 <div>
                   <p className="text-sm text-red-900 font-bold">3 Students At Risk</p>
                   <p className="text-xs text-red-700 mt-0.5">Performance below threshold in Math</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};