import React, { useState, useEffect } from 'react';
import { UserRole, Language, User, ClassSection, AttendanceSession, AttendanceStatus, CurriculumSystem } from '../types';
import { CLASSES, STUDENTS, MOCK_ATTENDANCE_SESSION } from '../services/mockData';
import { Button } from '../components/Button';
import { 
  Users, 
  Plus, 
  Settings, 
  Calendar, 
  MapPin, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MoreVertical,
  ArrowRight,
  BookOpen,
  Scan,
  Smartphone,
  WifiOff,
  History,
  AlertTriangle,
  RotateCw,
  UserPlus,
  Eye,
  EyeOff,
  SlidersHorizontal,
  ChevronDown,
  FileText,
  Save,
  ArrowLeft,
  List,
  Upload,
  Download,
  Info,
  X,
  FileSpreadsheet
} from 'lucide-react';

interface ClassManagementProps {
  role: UserRole;
  language: Language;
  user: User;
}

export const ClassManagement: React.FC<ClassManagementProps> = ({ role, language, user }) => {
  // Navigation State
  const [viewState, setViewState] = useState<'list' | 'create' | 'class-detail' | 'scanner'>('list');
  const [activeClass, setActiveClass] = useState<ClassSection | null>(null);
  const [classes, setClasses] = useState<ClassSection[]>(CLASSES);
  const [sortBy, setSortBy] = useState<'name' | 'attendance'>('name');
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Update activeClass when classes state changes
  useEffect(() => {
    if (activeClass) {
      const updated = classes.find(c => c.id === activeClass.id);
      if (updated) setActiveClass(updated);
    }
  }, [classes]);

  // --- Shared Components ---

  const ClassDetail = ({ role, classData }: { role: UserRole, classData: ClassSection }) => {
    const [qrActive, setQrActive] = useState(false);
    const [qrCode, setQrCode] = useState('INIT_TOKEN');
    const [timer, setTimer] = useState(7);
    const [scannedStudents, setScannedStudents] = useState<string[]>([]);
    const [manualAttendance, setManualAttendance] = useState<Record<string, AttendanceStatus>>({});

    const enrolledStudents = STUDENTS.filter(s => classData.students.includes(s.id));
    
    const sortedStudents = [...enrolledStudents].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'attendance') return b.attendance - a.attendance;
      return 0;
    });

    const markAllPresent = () => {
       const updates: Record<string, AttendanceStatus> = {};
       enrolledStudents.forEach(s => {
          updates[s.id] = 'Present';
       });
       setManualAttendance(updates);
       setScannedStudents(enrolledStudents.map(s => s.id));
    };

    const toggleStatus = (studentId: string) => {
       const current = manualAttendance[studentId] || 'Absent';
       const states: AttendanceStatus[] = ['Present', 'Absent', 'Late', 'Excused'];
       const next = states[(states.indexOf(current) + 1) % states.length];
       setManualAttendance(prev => ({ ...prev, [studentId]: next }));
       if (next === 'Present' || next === 'Late') {
         if (!scannedStudents.includes(studentId)) setScannedStudents(prev => [...prev, studentId]);
       } else {
         setScannedStudents(prev => prev.filter(id => id !== studentId));
       }
    };

    const removeStudent = (studentId: string) => {
      if (confirm('Are you sure you want to remove this student from the roster?')) {
        setClasses(prev => prev.map(c => 
          c.id === classData.id 
            ? { ...c, students: c.students.filter(id => id !== studentId) } 
            : c
        ));
      }
    };

    const addStudent = (studentId: string) => {
      setClasses(prev => prev.map(c => 
        c.id === classData.id 
          ? { ...c, students: [...c.students, studentId] } 
          : c
      ));
      setIsAddStudentModalOpen(false);
    };

    useEffect(() => {
      if (qrActive) {
        const interval = setInterval(() => {
           setTimer((prev) => {
             if (prev <= 1) {
                setQrCode(`TOKEN_${Date.now()}`); 
                return 7;
             }
             return prev - 1;
           });
        }, 1000);
        return () => clearInterval(interval);
      }
    }, [qrActive]);

    useEffect(() => {
       if (qrActive) {
          const randomScan = setInterval(() => {
             const available = enrolledStudents.filter(s => !scannedStudents.includes(s.id));
             if (available.length > 0 && Math.random() > 0.6) {
                const luckyStudent = available[0];
                setScannedStudents(prev => [...prev, luckyStudent.id]);
                setManualAttendance(prev => ({...prev, [luckyStudent.id]: 'Present'}));
             }
          }, 2000);
          return () => clearInterval(randomScan);
       }
    }, [qrActive, scannedStudents, enrolledStudents]);

    const todaysLesson = {
      title: 'Quadratic Equations',
      objectives: ['Understand standard form', 'Solve by factoring', 'Identify coefficients'],
      materials: ['Graphing Calculator', 'Workbook Pg 45'],
      outline: [
         { duration: '10 min', activity: 'Introduction', description: 'Review of linear equations vs quadratic.' },
         { duration: '20 min', activity: 'Core Concept', description: 'Standard form ax^2 + bx + c = 0 explanation.' },
         { duration: '15 min', activity: 'Practice', description: 'Solving simple examples on whiteboard.' }
      ]
    };

    const presentCount = Object.values(manualAttendance).filter(s => s === 'Present').length + Object.values(manualAttendance).filter(s => s === 'Late').length;

    return (
      <div className="flex flex-col h-[calc(100vh-140px)] animate-fadeIn gap-6">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <button onClick={() => setViewState('list')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <ArrowLeft size={24} className="text-gray-600" />
               </button>
               <div>
                  <h2 className="text-2xl font-bold text-gray-900">{classData.name}</h2>
                  <p className="text-sm text-gray-500">{classData.gradeLevel} • Room {classData.room}</p>
               </div>
            </div>
            <div className="flex gap-3">
               {role === UserRole.ADMIN && (
                 <Button variant="primary" className="gap-2" onClick={() => setIsAddStudentModalOpen(true)}>
                    <UserPlus size={18} /> Add Student
                 </Button>
               )}
               {role === UserRole.TEACHER && (
                 <Button variant={qrActive ? "danger" : "primary"} onClick={() => setQrActive(!qrActive)}>
                    <QrCode size={18} /> {qrActive ? 'Stop QR Session' : 'Start QR Session'}
                 </Button>
               )}
            </div>
         </div>

         {/* QR Overlay (Conditional) */}
         {qrActive && role === UserRole.TEACHER && (
            <div className="bg-gray-900 text-white p-6 rounded-3xl flex items-center justify-between relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-gray-800 to-gray-900 z-0"></div>
               <div className="relative z-10 flex items-center gap-8">
                  <div className="bg-white p-2 rounded-2xl">
                     <QrCode size={120} className="text-black" />
                  </div>
                  <div>
                     <h3 className="text-2xl font-bold mb-1">Scan to Check-In</h3>
                     <p className="text-gray-400 text-sm mb-4">Token refreshes in {timer}s</p>
                     <div className="flex items-center gap-2 text-xs bg-white/10 px-3 py-1 rounded-full w-fit">
                        <MapPin size={12} /> Geo-fencing Active
                     </div>
                  </div>
               </div>
               <div className="relative z-10 text-right">
                  <p className="text-4xl font-bold font-mono">{presentCount}/{enrolledStudents.length}</p>
                  <p className="text-gray-400 text-sm uppercase font-bold">Students Present</p>
               </div>
            </div>
         )}

         <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
            {/* Left Col: Roster & Attendance */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
               <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                       <Users size={18} /> Student Roster
                    </h3>
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1">
                       <SlidersHorizontal size={14} className="text-gray-400" />
                       <span className="text-xs text-gray-500">Sort by:</span>
                       <select 
                         value={sortBy} 
                         onChange={(e) => setSortBy(e.target.value as any)}
                         className="text-xs font-bold text-gray-900 outline-none bg-transparent"
                       >
                          <option value="name">Name</option>
                          <option value="attendance">Attendance</option>
                       </select>
                    </div>
                  </div>
                  {role === UserRole.TEACHER && (
                    <Button variant="secondary" className="text-xs h-8" onClick={markAllPresent}>
                       <CheckCircle2 size={14} /> Mark All Present
                    </Button>
                  )}
               </div>
               <div className="flex-1 overflow-y-auto p-2">
                  <table className="w-full text-left border-collapse">
                     <thead className="bg-white text-xs text-gray-500 uppercase sticky top-0 z-10">
                        <tr>
                           <th className="p-3 border-b border-gray-100">Student</th>
                           <th className="p-3 border-b border-gray-100">{role === UserRole.TEACHER ? 'Status' : 'Attendance'}</th>
                           <th className="p-3 border-b border-gray-100 text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody className="text-sm">
                        {sortedStudents.map(student => {
                           const status = manualAttendance[student.id];
                           return (
                              <tr key={student.id} className="hover:bg-gray-50 transition-colors group border-b border-gray-50 last:border-0">
                                 <td className="p-3">
                                    <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-600">
                                          {student.name.charAt(0)}
                                       </div>
                                       <div>
                                          <p className="font-bold text-gray-900">{student.name}</p>
                                          <p className="text-[10px] text-gray-400">{student.id}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="p-3">
                                    {role === UserRole.TEACHER ? (
                                      <span 
                                         onClick={() => toggleStatus(student.id)}
                                         className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer select-none transition-all ${
                                            status === 'Present' ? 'bg-green-100 text-green-700' :
                                            status === 'Late' ? 'bg-yellow-100 text-yellow-700' :
                                            status === 'Excused' ? 'bg-blue-100 text-blue-700' :
                                            'bg-red-50 text-red-600'
                                         }`}
                                      >
                                         {status || 'Absent'}
                                      </span>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                         <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[60px]">
                                            <div className="h-full bg-primary-500" style={{ width: `${student.attendance}%` }}></div>
                                         </div>
                                         <span className="font-bold text-gray-700">{student.attendance}%</span>
                                      </div>
                                    )}
                                 </td>
                                 <td className="p-3 text-right">
                                    {role === UserRole.ADMIN ? (
                                      <button 
                                        onClick={() => removeStudent(student.id)}
                                        className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                                        title="Remove from roster"
                                      >
                                         <XCircle size={18} />
                                      </button>
                                    ) : (
                                      <button className="text-gray-400 hover:text-primary-600 p-2 rounded-full hover:bg-primary-50">
                                         <MoreVertical size={16} />
                                      </button>
                                    )}
                                 </td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Right Col: Class Info & Lesson Plan */}
            <div className="space-y-6 flex flex-col">
               <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex-1 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <BookOpen size={18} className="text-primary-600" /> Today's Lesson
                     </h3>
                     <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded font-bold">Week 4</span>
                  </div>
                  <div className="mb-6">
                     <h4 className="text-lg font-bold text-gray-900 mb-1">{todaysLesson.title}</h4>
                     <p className="text-xs text-gray-500">Mathematics • 45 mins</p>
                  </div>
                  <div className="space-y-4">
                     <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Learning Objectives</p>
                        <ul className="space-y-2">
                           {todaysLesson.objectives.map((obj, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                 <CheckCircle2 size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                                 <span>{obj}</span>
                              </li>
                           ))}
                        </ul>
                     </div>
                     <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><List size={12}/> Lesson Content</p>
                        <div className="space-y-3">
                           {todaysLesson.outline.map((item, i) => (
                              <div key={i} className="flex gap-3 items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                 <span className="text-[10px] font-bold bg-primary-50 text-primary-700 px-2 py-0.5 rounded border border-primary-100 whitespace-nowrap">{item.duration}</span>
                                 <div>
                                    <p className="text-xs font-bold text-gray-800">{item.activity}</p>
                                    <p className="text-[10px] text-gray-500 leading-snug">{item.description}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
               <div className="bg-primary-50 rounded-3xl p-6 border border-primary-100">
                  <h4 className="font-bold text-primary-900 mb-2">Class Performance</h4>
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-3xl font-bold text-primary-700">84%</p>
                        <p className="text-xs text-primary-600">Avg. Quiz Score</p>
                     </div>
                     <div className="h-8 w-px bg-primary-200"></div>
                     <div>
                        <p className="text-3xl font-bold text-primary-700">92%</p>
                        <p className="text-xs text-primary-600">Attendance Rate</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Add Student Modal */}
         {isAddStudentModalOpen && (
           <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
             <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h3 className="text-xl font-bold text-gray-900">Add Student to Roster</h3>
                 <button onClick={() => setIsAddStudentModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                   <X size={20} />
                 </button>
               </div>
               <div className="p-6 space-y-4">
                 <div className="relative">
                   <input 
                     type="text" 
                     placeholder="Search students by name or ID..." 
                     className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                   />
                   <Users className="absolute left-3 top-3.5 text-gray-400" size={18} />
                 </div>
                 <div className="max-h-60 overflow-y-auto space-y-2">
                   {STUDENTS.filter(s => 
                     !classData.students.includes(s.id) && 
                     (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase()))
                   ).map(student => (
                     <div key={student.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-100 transition-all">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-xs">
                           {student.name.charAt(0)}
                         </div>
                         <div>
                           <p className="font-bold text-gray-900 text-sm">{student.name}</p>
                           <p className="text-[10px] text-gray-500">{student.id} • {student.grade}</p>
                         </div>
                       </div>
                       <Button variant="secondary" className="text-xs h-8 px-3" onClick={() => addStudent(student.id)}>
                         Add
                       </Button>
                     </div>
                   ))}
                 </div>
               </div>
               <div className="p-6 bg-gray-50 border-t border-gray-100">
                 <Button variant="secondary" className="w-full" onClick={() => setIsAddStudentModalOpen(false)}>Close</Button>
               </div>
             </div>
           </div>
         )}
      </div>
    );
  };

  // --- Components based on Persona ---

  // 1. ADMIN: Class Wizard & List
  const AdminView = () => {
    const [step, setStep] = useState(1);
    const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
      year: '2023-2024',
      grade: 'Grade 10',
      curriculum: 'National' as CurriculumSystem,
      name: '',
      room: '',
      // New Attendance Config
      attendance: {
        mode: 'Period' as 'Daily' | 'Period',
        lateThreshold: 15, // minutes
        statuses: [
          { id: 'present', label: 'Present', color: 'bg-green-500', visibleToParent: true },
          { id: 'absent', label: 'Absent', color: 'bg-red-500', visibleToParent: true },
          { id: 'late', label: 'Late', color: 'bg-yellow-500', visibleToParent: true },
          { id: 'excused', label: 'Excused', color: 'bg-blue-500', visibleToParent: false },
          { id: 'left_early', label: 'Left Early', color: 'bg-orange-500', visibleToParent: true },
        ]
      }
    });

    const toggleStatusVisibility = (index: number) => {
      const newStatuses = [...formData.attendance.statuses];
      newStatuses[index].visibleToParent = !newStatuses[index].visibleToParent;
      setFormData({
        ...formData,
        attendance: { ...formData.attendance, statuses: newStatuses }
      });
    };

    if (viewState === 'class-detail' && activeClass) {
      return <ClassDetail role={role} classData={activeClass} />;
    }

    if (viewState === 'create') {
      return (
        <div className="max-w-5xl mx-auto animate-fadeIn pb-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Create New Class</h2>
              <p className="text-gray-500">Define curriculum context, attendance rules, and staff.</p>
            </div>
            <Button variant="secondary" onClick={() => setViewState('list')}>Cancel</Button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Stepper */}
            <div className="bg-gray-50 p-6 border-b border-gray-100 flex items-center justify-between overflow-x-auto">
               {[1, 2, 3, 4, 5].map(s => (
                 <div key={s} className={`flex items-center gap-2 ${s <= step ? 'text-primary-600' : 'text-gray-400'} flex-shrink-0`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${s === step ? 'bg-primary-600 text-white' : s < step ? 'bg-primary-100 text-primary-600' : 'bg-gray-200'}`}>
                       {s < step ? <CheckCircle2 size={16} /> : s}
                    </div>
                    <span className="text-sm font-medium hidden md:block">
                      {s === 1 ? 'Context' : s === 2 ? 'Structure' : s === 3 ? 'Staffing' : s === 4 ? 'Attendance' : 'Review'}
                    </span>
                 </div>
               ))}
            </div>

            <div className="p-8 min-h-[400px]">
               {step === 1 && (
                 <div className="space-y-6 max-w-lg mx-auto">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Academic Context</h3>
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Academic Year</label>
                       <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>
                          <option>2023-2024</option>
                          <option>2024-2025</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Grade Level</label>
                       <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}>
                          {['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(g => <option key={g}>{g}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Curriculum Framework</label>
                       <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" value={formData.curriculum} onChange={e => setFormData({...formData, curriculum: e.target.value as any})}>
                          <option value="National">National Curriculum</option>
                          <option value="American">American Diploma</option>
                          <option value="IG">British (IGCSE)</option>
                       </select>
                    </div>
                 </div>
               )}

               {step === 2 && (
                 <div className="space-y-6 max-w-lg mx-auto">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Class Details</h3>
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Section Name</label>
                       <input 
                          type="text" 
                          placeholder="e.g. 10-A" 
                          className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Room Number</label>
                       <input 
                          type="text" 
                          placeholder="e.g. 102" 
                          className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                          value={formData.room}
                          onChange={e => setFormData({...formData, room: e.target.value})}
                       />
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-700 border border-blue-100">
                       <p>Subjects will be automatically populated based on the <strong>{formData.curriculum}</strong> curriculum for <strong>{formData.grade}</strong>.</p>
                    </div>
                 </div>
               )}

               {step === 3 && (
                 <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Assign Teachers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {['Mathematics', 'Physics', 'English', 'Arabic'].map((subj) => (
                          <div key={subj} className="p-4 border border-gray-200 rounded-xl flex items-center justify-between">
                             <div>
                                <p className="font-bold text-gray-900">{subj}</p>
                                <p className="text-xs text-gray-500">Required • 4 hrs/week</p>
                             </div>
                             <Button variant="secondary" className="text-xs py-1.5 h-8">Select Teacher</Button>
                          </div>
                       ))}
                    </div>
                 </div>
               )}

               {/* NEW STEP: Attendance Configuration */}
               {step === 4 && (
                 <div className="max-w-2xl mx-auto space-y-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Attendance Rules</h3>
                    
                    {/* Mode Selection */}
                    <div className="grid grid-cols-2 gap-4">
                       <div 
                         onClick={() => setFormData({...formData, attendance: {...formData.attendance, mode: 'Period'}})}
                         className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.attendance.mode === 'Period' ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200'}`}
                       >
                          <Clock size={24} className={`mb-3 ${formData.attendance.mode === 'Period' ? 'text-primary-600' : 'text-gray-400'}`} />
                          <h4 className="font-bold text-gray-900">Per Period</h4>
                          <p className="text-xs text-gray-500 mt-1">Attendance taken at start of every subject session.</p>
                       </div>
                       <div 
                         onClick={() => setFormData({...formData, attendance: {...formData.attendance, mode: 'Daily'}})}
                         className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.attendance.mode === 'Daily' ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200'}`}
                       >
                          <Calendar size={24} className={`mb-3 ${formData.attendance.mode === 'Daily' ? 'text-primary-600' : 'text-gray-400'}`} />
                          <h4 className="font-bold text-gray-900">Daily (Homeroom)</h4>
                          <p className="text-xs text-gray-500 mt-1">Attendance taken once per day during homeroom.</p>
                       </div>
                    </div>

                    {/* Thresholds */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                       <label className="flex justify-between text-sm font-bold text-gray-700 mb-4">
                          <span>Late Threshold</span>
                          <span className="text-primary-600">{formData.attendance.lateThreshold} minutes</span>
                       </label>
                       <input 
                         type="range" 
                         min="5" 
                         max="60" 
                         step="5"
                         value={formData.attendance.lateThreshold}
                         onChange={(e) => setFormData({...formData, attendance: {...formData.attendance, lateThreshold: Number(e.target.value)}})}
                         className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                       />
                       <p className="text-xs text-gray-500 mt-2">Students checking in after {formData.attendance.lateThreshold} mins will be marked 'Late' automatically.</p>
                    </div>

                    {/* Status Visibility */}
                    <div>
                       <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <SlidersHorizontal size={18} /> Status Configuration
                       </h4>
                       <div className="space-y-3">
                          {formData.attendance.statuses.map((status, idx) => (
                             <div key={status.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-white">
                                <div className="flex items-center gap-3">
                                   <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                                   <span className="font-medium text-gray-900">{status.label}</span>
                                </div>
                                <button 
                                  onClick={() => toggleStatusVisibility(idx)}
                                  className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${status.visibleToParent ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                                >
                                   {status.visibleToParent ? <Eye size={14} /> : <EyeOff size={14} />}
                                   {status.visibleToParent ? 'Visible to Parent' : 'Hidden from Parent'}
                                </button>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
               )}

               {step === 5 && (
                 <div className="text-center py-10">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                       <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Activate</h3>
                    <div className="bg-gray-50 p-6 rounded-2xl max-w-md mx-auto mb-8 text-left space-y-2">
                       <div className="flex justify-between text-sm"><span className="text-gray-500">Class</span><span className="font-bold">{formData.name}</span></div>
                       <div className="flex justify-between text-sm"><span className="text-gray-500">Curriculum</span><span className="font-bold">{formData.curriculum}</span></div>
                       <div className="flex justify-between text-sm"><span className="text-gray-500">Attendance Mode</span><span className="font-bold text-primary-600">{formData.attendance.mode}</span></div>
                       <div className="flex justify-between text-sm"><span className="text-gray-500">Late Policy</span><span className="font-bold">{formData.attendance.lateThreshold} mins</span></div>
                    </div>
                    <Button onClick={() => setViewState('list')} className="w-full max-w-xs mx-auto text-lg py-3">
                       Activate Class
                    </Button>
                 </div>
               )}
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between">
               <Button variant="ghost" disabled={step === 1} onClick={() => setStep(s => s - 1)}>Back</Button>
               {step < 5 && <Button onClick={() => setStep(s => s + 1)}>Next Step <ArrowRight size={16} /></Button>}
            </div>
          </div>
        </div>
      );
    }

    if (viewState === 'class-detail' && activeClass) {
      return <ClassDetail role={role} classData={activeClass} />;
    }

    return (
      <div className="animate-fadeIn space-y-8">
         <div className="flex justify-between items-center">
            <div>
               <h2 className="text-3xl font-bold text-gray-900">Class Directory</h2>
               <p className="text-gray-500">Manage sections, enrollments and staff assignments.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setIsBulkImportModalOpen(true)}>
                 <FileSpreadsheet size={20} /> Bulk Import
              </Button>
              <Button onClick={() => setViewState('create')}>
                 <Plus size={20} /> Create Class
              </Button>
            </div>
         </div>

         {/* Bulk Import Modal */}
         {isBulkImportModalOpen && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
             <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100">
               <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center">
                     <FileSpreadsheet size={24} />
                   </div>
                   <div>
                     <h3 className="text-2xl font-bold text-gray-900">Bulk Import Classes</h3>
                     <p className="text-sm text-gray-500">Upload a CSV file to create multiple classes at once.</p>
                   </div>
                 </div>
                 <button onClick={() => setIsBulkImportModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                   <X size={20} />
                 </button>
               </div>

               <div className="p-8 space-y-8">
                 {/* Instructions */}
                 <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-4">
                   <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex-shrink-0 flex items-center justify-center">
                     <Info size={20} />
                   </div>
                   <div className="space-y-2">
                     <h4 className="font-bold text-blue-900 text-sm">Instructions</h4>
                     <ul className="text-xs text-blue-700 space-y-1 list-disc ml-4">
                       <li>Ensure your CSV follows the template structure exactly.</li>
                       <li>Required columns: <strong>Name, Grade, Room, Curriculum, Year</strong>.</li>
                       <li>Curriculum must be one of: <strong>National, American, IG</strong>.</li>
                       <li>Maximum 100 rows per upload.</li>
                     </ul>
                   </div>
                 </div>

                 {/* Template Download */}
                 <div className="flex items-center justify-between p-6 border border-gray-100 rounded-3xl bg-gray-50/50">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-600">
                       <FileSpreadsheet size={24} />
                     </div>
                     <div>
                       <p className="font-bold text-gray-900">CSV Template</p>
                       <p className="text-xs text-gray-500">Download the pre-formatted template</p>
                     </div>
                   </div>
                   <Button variant="secondary" className="gap-2">
                     <Download size={16} /> Download Template
                   </Button>
                 </div>

                 {/* Upload Area */}
                 <div 
                   onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                   onDragLeave={() => setIsDragging(false)}
                   onDrop={(e) => { e.preventDefault(); setIsDragging(false); /* Handle file */ }}
                   className={`border-2 border-dashed rounded-[2rem] p-12 text-center transition-all ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-gray-50/30 hover:border-primary-300 hover:bg-gray-50'}`}
                 >
                   <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 text-primary-600 group-hover:scale-110 transition-transform">
                     <Upload size={32} />
                   </div>
                   <h4 className="text-xl font-bold text-gray-900 mb-2">Upload your CSV file</h4>
                   <p className="text-sm text-gray-500 mb-8">Drag and drop your file here, or click to browse</p>
                   <input type="file" className="hidden" id="csv-upload" accept=".csv" />
                   <label htmlFor="csv-upload">
                     <Button className="px-8 cursor-pointer">Select File</Button>
                   </label>
                 </div>
               </div>

               <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-3">
                 <Button variant="secondary" className="flex-1" onClick={() => setIsBulkImportModalOpen(false)}>Cancel</Button>
                 <Button className="flex-1" disabled>Start Import</Button>
               </div>
             </div>
           </div>
         )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
               <div key={cls.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-primary-600"></div>
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <h3 className="text-2xl font-bold text-gray-900">{cls.name}</h3>
                        <p className="text-sm text-gray-500">{cls.gradeLevel}</p>
                     </div>
                     <span className="bg-primary-50 text-primary-700 text-xs font-bold px-2 py-1 rounded border border-primary-100">{cls.curriculumSystem}</span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                     <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users size={16} className="text-gray-400" />
                        <span>{cls.students.length} Students Enrolled</span>
                     </div>
                     <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} className="text-gray-400" />
                        <span>Room {cls.room}</span>
                     </div>
                     <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={16} className="text-gray-400" />
                        <span>Period Attendance</span>
                     </div>
                  </div>

                  <div className="flex gap-2">
                     <Button 
                       variant="secondary" 
                       className="flex-1 text-xs"
                       onClick={() => {
                         setActiveClass(cls);
                         setViewState('class-detail');
                       }}
                     >
                       Manage Roster
                     </Button>
                     <Button variant="secondary" className="text-xs px-3"><Settings size={16} /></Button>
                  </div>
               </div>
            ))}
          </div>
      </div>
    );
  };

  // 2. TEACHER: My Classes & Detailed Dashboard
  const TeacherView = () => {
    if (viewState === 'class-detail' && activeClass) {
      return <ClassDetail role={role} classData={activeClass} />;
    }

    // Default List View
    return (
      <div className="animate-fadeIn space-y-8">
         <div className="flex justify-between items-center">
            <div>
               <h2 className="text-3xl font-bold text-gray-900">My Classes</h2>
               <p className="text-gray-500">Manage your daily schedule and sessions.</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
               <div 
                 key={cls.id} 
                 onClick={() => {
                    setActiveClass(cls);
                    setViewState('class-detail');
                 }}
                 className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer"
               >
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                        <BookOpen size={24} />
                     </div>
                     <button className="text-gray-400 hover:text-gray-900"><MoreVertical size={20} /></button>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{cls.name}</h3>
                  <p className="text-sm text-gray-500 mb-6">{cls.gradeLevel} • Room {cls.room}</p>
                  
                  <div className="bg-gray-50 rounded-xl p-4 mb-6 flex justify-between items-center">
                     <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Next Session</p>
                        <p className="font-bold text-gray-900">Mathematics</p>
                     </div>
                     <div className="text-right">
                        <p className="text-xs font-bold text-gray-500 uppercase">Time</p>
                        <p className="font-bold text-primary-600">08:00 AM</p>
                     </div>
                  </div>

                  <div className="flex gap-2">
                     <Button 
                       className="flex-1 shadow-primary-200" 
                       onClick={(e) => {
                          e.stopPropagation();
                          setActiveClass(cls);
                          setViewState('class-detail');
                       }}
                     >
                        View Dashboard
                     </Button>
                  </div>
               </div>
            ))}
         </div>
      </div>
    );
  };

  // 3. STUDENT: Scanner Simulation
  const StudentView = () => {
    const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');

    const handleSimulateScan = () => {
       setScanState('scanning');
       setTimeout(() => {
          setScanState('success');
       }, 2000);
    };

    if (viewState === 'scanner') {
       return (
          <div className="max-w-md mx-auto bg-black min-h-[600px] rounded-[3rem] overflow-hidden relative shadow-2xl border-8 border-gray-800 animate-fadeIn">
             {/* Camera Viewfinder UI */}
             {scanState === 'scanning' || scanState === 'idle' ? (
                <>
                   <div className="absolute inset-0 bg-gray-800 z-0">
                      <p className="text-white text-center mt-64 opacity-50">Camera Feed Simulation</p>
                   </div>
                   
                   {/* Overlays */}
                   <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
                      <button onClick={() => setViewState('list')} className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                         <XCircle size={24} />
                      </button>
                      <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium">
                         Scan QR Code
                      </div>
                      <div className="w-10"></div>
                   </div>

                   {/* Scanner Frame */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white/50 rounded-3xl z-10 flex flex-col justify-between p-4">
                      <div className="flex justify-between">
                         <div className="w-4 h-4 border-l-4 border-t-4 border-primary-500 rounded-tl-lg"></div>
                         <div className="w-4 h-4 border-r-4 border-t-4 border-primary-500 rounded-tr-lg"></div>
                      </div>
                      {scanState === 'scanning' && (
                         <div className="w-full h-1 bg-primary-500 shadow-[0_0_15px_rgba(249,115,22,0.8)] animate-[scan_2s_infinite]"></div>
                      )}
                      <div className="flex justify-between">
                         <div className="w-4 h-4 border-l-4 border-b-4 border-primary-500 rounded-bl-lg"></div>
                         <div className="w-4 h-4 border-r-4 border-b-4 border-primary-500 rounded-br-lg"></div>
                      </div>
                   </div>
                   
                   {/* Trigger (since we can't really scan) */}
                   <div className="absolute bottom-10 left-0 w-full flex justify-center z-20">
                      {scanState === 'idle' && (
                         <button 
                           onClick={handleSimulateScan}
                           className="bg-white text-black px-6 py-3 rounded-full font-bold shadow-lg active:scale-95 transition-transform"
                         >
                           Simulate Scan
                         </button>
                      )}
                      {scanState === 'scanning' && <p className="text-white font-mono animate-pulse">Detecting...</p>}
                   </div>
                </>
             ) : (
                <div className="absolute inset-0 bg-green-500 flex flex-col items-center justify-center text-white p-8 text-center animate-fadeIn">
                   <div className="w-24 h-24 bg-white text-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl">
                      <CheckCircle2 size={48} strokeWidth={3} />
                   </div>
                   <h2 className="text-3xl font-bold mb-2">Checked In!</h2>
                   <p className="text-green-100 text-lg mb-8">Mathematics • Grade 10-A</p>
                   <div className="bg-white/20 rounded-xl p-4 w-full backdrop-blur-sm mb-8">
                      <div className="flex justify-between text-sm mb-1">
                         <span className="opacity-80">Time</span>
                         <span className="font-bold">08:02 AM</span>
                      </div>
                      <div className="flex justify-between text-sm">
                         <span className="opacity-80">Status</span>
                         <span className="font-bold">Present</span>
                      </div>
                   </div>
                   <button onClick={() => setViewState('list')} className="bg-white text-green-600 w-full py-3 rounded-xl font-bold">Done</button>
                </div>
             )}
          </div>
       );
    }

    return (
       <div className="animate-fadeIn max-w-md mx-auto">
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-3xl p-6 shadow-xl mb-6">
             <div className="flex items-center gap-4 mb-6">
                <img src={user.avatar} className="w-12 h-12 rounded-full border-2 border-white/30" alt="Profile" />
                <div>
                   <h3 className="font-bold text-lg">Hello, Layla!</h3>
                   <p className="text-primary-100 text-sm">Grade 10 • ID: ST-2023-001</p>
                </div>
             </div>
             
             <div className="bg-white/10 rounded-2xl p-4 flex justify-between items-center backdrop-blur-sm">
                <div>
                   <p className="text-primary-100 text-xs font-bold uppercase mb-1">Attendance Rate</p>
                   <p className="text-3xl font-bold">98%</p>
                </div>
                <div className="h-10 w-px bg-white/20"></div>
                <div>
                   <p className="text-primary-100 text-xs font-bold uppercase mb-1">Classes</p>
                   <p className="text-3xl font-bold">12</p>
                </div>
             </div>
          </div>

          <div className="space-y-4">
             <button 
               onClick={() => setViewState('scanner')}
               className="w-full bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group active:scale-95 transition-all"
             >
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                      <Scan size={24} />
                   </div>
                   <div className="text-left">
                      <h4 className="font-bold text-gray-900 text-lg">Check-In</h4>
                      <p className="text-gray-500 text-sm">Scan QR Code for Attendance</p>
                   </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                   <ArrowRight size={16} />
                </div>
             </button>

             <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><History size={18} /> Recent Activity</h4>
                <div className="space-y-4">
                   {[
                      { sub: 'Mathematics', status: 'Present', time: 'Today, 08:02 AM' },
                      { sub: 'Science', status: 'Present', time: 'Yesterday, 09:00 AM' },
                      { sub: 'English', status: 'Late', time: 'Yesterday, 10:15 AM' }
                   ].map((rec, i) => (
                      <div key={i} className="flex justify-between items-center">
                         <div>
                            <p className="font-bold text-gray-900 text-sm">{rec.sub}</p>
                            <p className="text-xs text-gray-500">{rec.time}</p>
                         </div>
                         <span className={`text-xs font-bold px-2 py-1 rounded ${rec.status === 'Present' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                            {rec.status}
                         </span>
                      </div>
                   ))}
                </div>
             </div>
          </div>
       </div>
    );
  };

  return role === UserRole.ADMIN ? <AdminView /> : role === UserRole.STUDENT ? <StudentView /> : <TeacherView />;
};