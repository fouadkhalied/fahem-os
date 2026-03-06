import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { UserRole, Language } from '../types';
import { STUDENTS } from '../services/mockData';
import { Button } from '../components/Button';
import { 
  Download, 
  AlertTriangle, 
  Users, 
  Calendar, 
  FileText, 
  ChevronDown, 
  ArrowUpRight,
  ArrowDownRight,
  GraduationCap,
  Clock,
  CheckCircle2,
  Printer
} from 'lucide-react';

interface AnalyticsProps {
  role: UserRole;
  language: Language;
}

// --- Mock Analytic Datasets ---

const ATTENDANCE_TREND_DATA = [
  { date: 'Sep 1', rate: 98 }, { date: 'Sep 5', rate: 97 }, { date: 'Sep 10', rate: 96 },
  { date: 'Sep 15', rate: 98 }, { date: 'Sep 20', rate: 94 }, { date: 'Sep 25', rate: 95 },
  { date: 'Oct 1', rate: 96 }, { date: 'Oct 5', rate: 92 }, { date: 'Oct 10', rate: 93 },
  { date: 'Oct 15', rate: 95 }, { date: 'Oct 20', rate: 91 }, { date: 'Oct 25', rate: 94 },
  { date: 'Nov 1', rate: 89 }, { date: 'Nov 5', rate: 92 }, { date: 'Nov 10', rate: 93 }
];

const GRADE_DISTRIBUTION_DATA = [
  { name: 'A (90-100)', value: 35, color: '#22c55e' },
  { name: 'B (80-89)', value: 42, color: '#3b82f6' },
  { name: 'C (70-79)', value: 15, color: '#eab308' },
  { name: 'D (60-69)', value: 5, color: '#f97316' },
  { name: 'F (<60)', value: 3, color: '#ef4444' },
];

const CHRONIC_ABSENTEEISM_BY_GRADE = [
  { name: 'Grade 9', value: 4 },
  { name: 'Grade 10', value: 8 },
  { name: 'Grade 11', value: 5 },
  { name: 'Grade 12', value: 12 },
];

const SUBJECT_PERFORMANCE_DATA = [
  { subject: 'Math', A: 120, B: 110, C: 40, D: 10, F: 5 },
  { subject: 'Science', A: 90, B: 130, C: 50, D: 15, F: 2 },
  { subject: 'English', A: 140, B: 100, C: 30, D: 5, F: 0 },
  { subject: 'Arabic', A: 150, B: 90, C: 20, D: 10, F: 5 },
  { subject: 'Physics', A: 80, B: 90, C: 60, D: 30, F: 15 },
];

const REPORTS_LIST = [
  { id: 1, title: 'Daily Attendance Log', category: 'Attendance', format: 'CSV' },
  { id: 2, title: 'Chronic Absenteeism Report', category: 'Attendance', format: 'PDF' },
  { id: 3, title: 'Term Grade Summary', category: 'Grades', format: 'PDF' },
  { id: 4, title: 'Failure & At-Risk List', category: 'Grades', format: 'Excel' },
  { id: 5, title: 'Student Enrollment Roster', category: 'Admin', format: 'CSV' },
  { id: 6, title: 'Teacher Gradebook Audit', category: 'Admin', format: 'PDF' },
];

export const Analytics: React.FC<AnalyticsProps> = ({ role, language }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'grades' | 'reports'>('overview');
  const [timeRange, setTimeRange] = useState('This Term');
  
  const isRTL = language === Language.AR;

  // --- Derived Data ---
  const atRiskStudents = STUDENTS.filter(s => s.attendance < 85 || s.performance < 65);
  const avgAttendance = Math.round(STUDENTS.reduce((acc, s) => acc + s.attendance, 0) / STUDENTS.length);
  const avgPerformance = Math.round(STUDENTS.reduce((acc, s) => acc + s.performance, 0) / STUDENTS.length);

  // --- Sub-Components ---

  const StatCard = ({ label, value, trend, trendDir, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start justify-between">
       <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
          <h3 className="text-3xl font-extrabold text-gray-900">{value}</h3>
          <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${trendDir === 'up' ? 'text-green-600' : 'text-red-600'}`}>
             {trendDir === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
             <span>{trend} vs last month</span>
          </div>
       </div>
       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${color}`}>
          <Icon size={24} />
       </div>
    </div>
  );

  // 1. OVERVIEW TAB
  const OverviewView = () => (
    <div className="space-y-6 animate-fadeIn">
       {/* Key Metrics */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Avg Attendance" value={`${avgAttendance}%`} trend="2.1%" trendDir="up" icon={Clock} color="bg-blue-500" />
          <StatCard label="Avg Performance" value={`${avgPerformance}%`} trend="0.5%" trendDir="down" icon={GraduationCap} color="bg-purple-500" />
          <StatCard label="At-Risk Students" value={atRiskStudents.length} trend="12%" trendDir="up" icon={AlertTriangle} color="bg-red-500" />
          <StatCard label="Total Enrollment" value="1,250" trend="5%" trendDir="up" icon={Users} color="bg-orange-500" />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Enrollment Trend */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Attendance Trends</h3>
                <select className="bg-gray-50 border border-gray-200 rounded-lg text-xs p-2 outline-none">
                   <option>This Term</option>
                   <option>Last Month</option>
                </select>
             </div>
             <div className="h-[300px] w-full" style={{ minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={ATTENDANCE_TREND_DATA}>
                      <defs>
                         <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
                      <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                      <Area type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Early Warning System */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                   <AlertTriangle size={20} className="text-red-500" /> Early Warning
                </h3>
                <span className="bg-red-50 text-red-700 text-xs font-bold px-2 py-1 rounded-full">{atRiskStudents.length} Students</span>
             </div>
             <p className="text-sm text-gray-500 mb-4">Students flagged for low attendance (&lt;85%) or poor grades (&lt;65%).</p>
             
             <div className="flex-1 overflow-y-auto space-y-3 pr-2" style={{ maxHeight: '300px' }}>
                {atRiskStudents.map(student => (
                   <div key={student.id} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-gray-700 text-xs border border-gray-200">
                         {student.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                         <p className="text-sm font-bold text-gray-900">{student.name}</p>
                         <div className="flex gap-2 text-[10px] font-bold mt-1">
                            {student.attendance < 85 && <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Att: {student.attendance}%</span>}
                            {student.performance < 65 && <span className="bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">Grd: {student.performance}%</span>}
                         </div>
                      </div>
                      <button className="text-gray-400 hover:text-blue-600">
                         <ChevronDown size={16} />
                      </button>
                   </div>
                ))}
                {atRiskStudents.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <CheckCircle2 size={48} className="mb-2 text-green-500" />
                      <p>No students at risk!</p>
                   </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );

  // 2. ATTENDANCE TAB
  const AttendanceView = () => (
     <div className="space-y-6 animate-fadeIn">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Chronic Absenteeism Chart */}
           <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Chronic Absenteeism by Grade</h3>
              <div className="h-[300px] w-full" style={{ minHeight: '300px' }}>
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={CHRONIC_ABSENTEEISM_BY_GRADE} barSize={40}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                       <Tooltip cursor={{fill: '#fef2f2'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                       <Bar dataKey="value" fill="#ef4444" radius={[6, 6, 0, 0]} name="Students" />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Stats Breakdown */}
           <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                 <h3 className="font-bold text-gray-900 mb-4">Absence Reasons</h3>
                 <div className="space-y-4">
                    {[
                       { label: 'Medical / Illness', val: 45, color: 'bg-blue-500' },
                       { label: 'Family Emergency', val: 20, color: 'bg-orange-500' },
                       { label: 'Unexcused', val: 35, color: 'bg-red-500' },
                    ].map((reason, i) => (
                       <div key={i}>
                          <div className="flex justify-between text-xs font-bold mb-1">
                             <span>{reason.label}</span>
                             <span>{reason.val}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                             <div className={`h-full ${reason.color}`} style={{ width: `${reason.val}%` }}></div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                 <h4 className="font-bold text-blue-900 mb-2">Did you know?</h4>
                 <p className="text-sm text-blue-700">Grade 12 has the highest attendance rate on Tuesdays (98%), but lowest on Thursdays (89%).</p>
              </div>
           </div>
        </div>
     </div>
  );

  // 3. GRADES TAB
  const GradesView = () => (
     <div className="space-y-6 animate-fadeIn">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           
           {/* Grade Distribution */}
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Grade Distribution</h3>
              <p className="text-sm text-gray-500 mb-6">Distribution across all subjects for current term.</p>
              <div className="h-[300px] w-full flex items-center justify-center" style={{ minHeight: '300px' }}>
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie 
                          data={GRADE_DISTRIBUTION_DATA} 
                          innerRadius={80} 
                          outerRadius={100} 
                          paddingAngle={5} 
                          dataKey="value"
                       >
                          {GRADE_DISTRIBUTION_DATA.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                       </Pie>
                       <Tooltip />
                       <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Subject Performance Stacked Bar */}
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Subject Performance</h3>
              <div className="h-[300px] w-full" style={{ minHeight: '300px' }}>
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SUBJECT_PERFORMANCE_DATA} layout="vertical" barSize={20}>
                       <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                       <XAxis type="number" hide />
                       <YAxis dataKey="subject" type="category" axisLine={false} tickLine={false} width={80} tick={{fontSize: 12, fontWeight: 600, fill: '#374151'}} />
                       <Tooltip cursor={{fill: 'transparent'}} />
                       <Legend />
                       <Bar dataKey="A" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                       <Bar dataKey="B" stackId="a" fill="#3b82f6" />
                       <Bar dataKey="C" stackId="a" fill="#eab308" />
                       <Bar dataKey="D" stackId="a" fill="#f97316" />
                       <Bar dataKey="F" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>
     </div>
  );

  // 4. REPORTS TAB
  const ReportsView = () => (
     <div className="animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {REPORTS_LIST.map(report => (
              <div key={report.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                 <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${report.category === 'Attendance' ? 'bg-blue-500' : report.category === 'Grades' ? 'bg-orange-500' : 'bg-gray-700'}`}>
                       <FileText size={24} />
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-gray-50 text-gray-500 px-2 py-1 rounded">{report.format}</span>
                 </div>
                 <h3 className="font-bold text-gray-900 mb-1">{report.title}</h3>
                 <p className="text-xs text-gray-500 mb-6">{report.category} Module</p>
                 <div className="flex gap-2">
                    <Button variant="secondary" className="flex-1 text-xs h-9">Preview</Button>
                    <Button variant="primary" className="flex-1 text-xs h-9">
                       <Download size={14} /> Download
                    </Button>
                 </div>
              </div>
           ))}
        </div>
     </div>
  );

  return (
    <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
             <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Analytics & Reports</h1>
             <p className="text-gray-500">Data-driven insights for school performance.</p>
          </div>
          
          <div className="flex gap-3">
             <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700">
                <Calendar size={16} className="text-gray-400" />
                <span>{timeRange}</span>
                <ChevronDown size={14} className="text-gray-400" />
             </div>
             <Button variant="secondary" className="rounded-full">
                <Printer size={16} /> Print View
             </Button>
          </div>
       </div>

       {/* Tabs */}
       <div className="bg-white p-1 rounded-full border border-gray-200 shadow-sm flex w-fit">
          {['overview', 'attendance', 'grades', 'reports'].map((tab) => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={`px-6 py-2.5 rounded-full text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
             >
                {tab}
             </button>
          ))}
       </div>

       {/* Content */}
       {activeTab === 'overview' && <OverviewView />}
       {activeTab === 'attendance' && <AttendanceView />}
       {activeTab === 'grades' && <GradesView />}
       {activeTab === 'reports' && <ReportsView />}
    </div>
  );
};