import React, { useState } from 'react';
import { Student, Language, ReportCard } from '../types';
import { Button } from '../components/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  ArrowLeft, 
  MessageSquare, 
  Edit, 
  CalendarDays, 
  Award, 
  FileText, 
  Plus, 
  X 
} from 'lucide-react';

interface StudentProfileProps {
  student: Student;
  language: Language;
  onBack: () => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ student, language, onBack }) => {
  const isRTL = language === Language.AR;
  
  const [reports, setReports] = useState<ReportCard[]>(student.reportCards || []);
  const [viewingDocument, setViewingDocument] = useState<ReportCard | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [newDocData, setNewDocData] = useState({
    title: '',
    type: 'Certificate' as ReportCard['type'],
    gradeAverage: '',
    academicYear: '2023-2024'
  });

  const handleAssign = () => {
    if (!newDocData.title || !newDocData.gradeAverage) return;
    const newDoc: ReportCard = {
      id: Date.now().toString(),
      title: newDocData.title,
      type: newDocData.type,
      gradeAverage: newDocData.gradeAverage,
      academicYear: newDocData.academicYear,
      issueDate: new Date().toISOString().split('T')[0]
    };
    setReports([newDoc, ...reports]);
    setIsAssigning(false);
    setNewDocData({ title: '', type: 'Certificate', gradeAverage: '', academicYear: '2023-2024' });
  };

  const labels = {
    back: isRTL ? 'رجوع' : 'Back',
    overview: {
      gpa: isRTL ? 'المعدل التراكمي' : 'GPA',
      attendance: isRTL ? 'نسبة الحضور' : 'Attendance',
      behavior: isRTL ? 'نقاط السلوك' : 'Behavior Pts'
    }
  };

  const totalFees = student.fees.reduce((sum, f) => sum + f.amount, 0);
  const paidFees = student.fees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);

  const performanceData = [
    { subject: 'Math', student: student.performance, average: 78 },
    { subject: 'Science', student: Math.min(100, student.performance + 5), average: 80 },
    { subject: 'Arabic', student: Math.max(50, student.performance - 5), average: 82 },
    { subject: 'English', student: student.performance, average: 75 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      
      {/* Assign Modal */}
      {isAssigning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn p-6">
            <h3 className="font-bold text-xl mb-4 text-gray-900">Issue New Document</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary-500"
                  value={newDocData.type}
                  onChange={(e) => setNewDocData({...newDocData, type: e.target.value as any})}
                >
                  <option value="Certificate">Certificate</option>
                  <option value="Report Card">Report Card</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                <input 
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Science Fair Winner"
                  value={newDocData.title}
                  onChange={(e) => setNewDocData({...newDocData, title: e.target.value})}
                />
              </div>
              <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Grade / Score</label>
                <input 
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 95%"
                  value={newDocData.gradeAverage}
                  onChange={(e) => setNewDocData({...newDocData, gradeAverage: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="secondary" onClick={() => setIsAssigning(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleAssign}>Issue</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl relative">
             <button onClick={() => setViewingDocument(null)} className="absolute -top-12 right-0 text-white font-bold flex items-center gap-2">
               <X size={24} /> CLOSE
             </button>
             {viewingDocument.type === 'Certificate' ? (
               <div className="bg-[#fffdf5] p-12 rounded-lg shadow-2xl border-[16px] border-double border-[#b45309] text-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-50"></div>
                 <h1 className="text-5xl font-serif text-[#78350f] mb-4">Certificate of Achievement</h1>
                 <p className="font-serif text-lg text-[#92400e] italic mb-8">Proudly Presented To</p>
                 <h2 className="text-4xl font-bold text-gray-900 border-b-2 border-[#d97706] inline-block pb-2 mb-8 px-10">{student.name}</h2>
                 <p className="text-gray-600 mb-2">For outstanding performance in</p>
                 <h3 className="text-2xl font-bold text-[#b45309]">{viewingDocument.title}</h3>
                 <div className="mt-12 flex justify-between px-10">
                    <div className="text-center"><div className="border-t border-[#78350f] w-32 pt-2">Principal</div></div>
                    <div className="text-center"><div className="border-t border-[#78350f] w-32 pt-2">{viewingDocument.issueDate}</div></div>
                 </div>
               </div>
             ) : (
               <div className="bg-white rounded-lg shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
                 <div className="bg-gray-900 text-white p-6 flex justify-between">
                   <h2 className="text-2xl font-bold">Faheem Academy</h2>
                   <div className="text-right"><p className="text-sm opacity-70">Official Report</p><p>{viewingDocument.academicYear}</p></div>
                 </div>
                 <div className="p-8 flex-1">
                    <h3 className="text-xl font-bold mb-4">{student.name} <span className="text-gray-400 text-sm font-normal">| {student.grade}</span></h3>
                    <table className="w-full text-left mb-6">
                      <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500">
                        <tr><th className="p-3">Subject</th><th className="p-3">Grade</th><th className="p-3">Remarks</th></tr>
                      </thead>
                      <tbody>
                        <tr><td className="p-3 font-bold">Mathematics</td><td className="p-3">A</td><td className="p-3 text-sm text-gray-500">Excellent</td></tr>
                        <tr><td className="p-3 font-bold">Science</td><td className="p-3">A-</td><td className="p-3 text-sm text-gray-500">Very Good</td></tr>
                        <tr><td className="p-3 font-bold">History</td><td className="p-3">B+</td><td className="p-3 text-sm text-gray-500">Good</td></tr>
                      </tbody>
                    </table>
                 </div>
                 <div className="bg-gray-50 p-6 flex justify-between items-center border-t border-gray-200">
                   <span className="font-bold text-gray-500 uppercase text-xs">Overall GPA</span>
                   <span className="text-3xl font-bold text-primary-600">{viewingDocument.gradeAverage}</span>
                 </div>
               </div>
             )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-primary-600 font-bold transition-colors">
        <ArrowLeft size={20} /> {labels.back}
      </button>

      {/* Main Profile Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="relative">
           <img 
              src={`https://ui-avatars.com/api/?name=${student.name}&background=ea580c&color=fff&size=128`} 
              alt={student.name}
              className="w-32 h-32 rounded-full ring-4 ring-primary-50"
           />
           <span className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white ${student.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
        </div>
        <div className="flex-1 text-center md:text-left space-y-2">
           <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{student.name}</h1>
           <p className="text-lg text-gray-500 font-medium">{student.id} • {student.grade}</p>
           <div className="flex gap-2 justify-center md:justify-start mt-4">
             <Button variant="secondary" className="px-4 py-1.5 text-xs">
               <MessageSquare size={16} /> Message
             </Button>
             <Button variant="secondary" className="px-4 py-1.5 text-xs">
               <Edit size={16} /> Edit Profile
             </Button>
           </div>
        </div>
        <div className="flex gap-8">
           <div className="text-center">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1">
               <CalendarDays size={14} /> {labels.overview.attendance}
             </p>
             <p className="text-3xl font-black text-gray-900">{student.attendance}%</p>
           </div>
           <div className="text-center">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1">
               <Award size={14} /> {labels.overview.gpa}
             </p>
             <p className="text-3xl font-black text-primary-600">{(student.performance / 25).toFixed(2)}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Academic Chart */}
         <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 lg:col-span-2">
            <h3 className="font-bold text-lg text-gray-900 mb-6">Academic Performance</h3>
            <div className="h-[300px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} barGap={12}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                  <Tooltip cursor={{fill: '#fff7ed'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Legend />
                  <Bar name="Student" dataKey="student" fill="#ea580c" radius={[6, 6, 0, 0]} barSize={32} />
                  <Bar name="Average" dataKey="average" fill="#e5e7eb" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Documents */}
         <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-lg text-gray-900">Documents</h3>
               <button onClick={() => setIsAssigning(true)} className="text-primary-600 hover:bg-primary-50 p-2 rounded-full transition-colors">
                 <Plus size={20} />
               </button>
            </div>
            <div className="space-y-4">
               {reports.map(r => (
                 <div key={r.id} className="group flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md hover:scale-[1.02] transition-all border border-transparent hover:border-gray-100 cursor-pointer" onClick={() => setViewingDocument(r)}>
                    <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                       {r.type === 'Certificate' ? <Award size={24} /> : <FileText size={24} />}
                    </div>
                    <div>
                       <p className="font-bold text-gray-900 text-sm">{r.title}</p>
                       <p className="text-xs text-gray-500">{r.issueDate}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* Fees */}
      <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-xl overflow-hidden relative">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
         <div className="flex justify-between items-end mb-8 relative z-10">
            <div>
               <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">Financial Status</p>
               <h3 className="text-3xl font-bold">Tuition & Fees</h3>
            </div>
            <div className="text-right">
               <p className="text-gray-400 text-xs uppercase mb-1">Outstanding</p>
               <p className="text-3xl font-mono font-bold text-orange-400">
                  {new Intl.NumberFormat(isRTL ? 'ar-EG' : 'en-EG', { style: 'currency', currency: 'EGP' }).format(totalFees - paidFees)}
               </p>
            </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            {student.installmentPlans?.[0]?.installments.map((ins, i) => (
               <div key={i} className={`p-4 rounded-2xl border ${ins.status === 'Paid' ? 'border-green-500/30 bg-green-500/10' : 'border-gray-700 bg-gray-800'}`}>
                  <div className="flex justify-between text-sm mb-2">
                     <span className="text-gray-400">Inst. {i+1}</span>
                     <span className={ins.status === 'Paid' ? 'text-green-400' : 'text-orange-400'}>{ins.status}</span>
                  </div>
                  <p className="font-mono font-bold">{new Intl.NumberFormat('en-EG', {style: 'currency', currency: 'EGP'}).format(ins.amount)}</p>
                  <p className="text-xs text-gray-500 mt-1">{ins.dueDate}</p>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};