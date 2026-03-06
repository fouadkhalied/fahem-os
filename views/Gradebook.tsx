import React, { useState } from 'react';
import { Language, UserRole, GradebookConfig, GradeEntry, AssessmentCategory, GradingTerm, GradingScaleRule, Assessment } from '../types';
import { MOCK_GRADEBOOK, STUDENTS, CLASSES } from '../services/mockData';
import { Button } from '../components/Button';
import { 
  FileSpreadsheet, 
  Settings, 
  Plus, 
  Lock, 
  Unlock, 
  Save, 
  Calculator, 
  Users, 
  CalendarRange, 
  AlertCircle, 
  CheckCircle2,
  FileText,
  PieChart as LucidePieChart,
  Trash2,
  PlusCircle,
  X as XIcon,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  ArrowRight,
  School,
  BookOpen,
  Filter,
  ArrowUpDown,
  Search,
  ArrowLeft
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface GradebookProps {
  role: UserRole;
  language: Language;
}

export const Gradebook: React.FC<GradebookProps> = ({ role, language }) => {
  const [config, setConfig] = useState<GradebookConfig>(MOCK_GRADEBOOK);
  const [activeTab, setActiveTab] = useState<'admin' | 'teacher'>(role === UserRole.ADMIN ? 'admin' : 'teacher');
  const [adminStep, setAdminStep] = useState(1);
  const [activeTermId, setActiveTermId] = useState('t1');
  const [editedEntries, setEditedEntries] = useState<Record<string, number | null>>({});
  const [isAddingAssessment, setIsAddingAssessment] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    category: 'Quiz' as AssessmentCategory,
    maxScore: 100,
    date: new Date().toISOString().split('T')[0]
  });

  // New Context State
  const [selectedCurriculum, setSelectedCurriculum] = useState('National');
  const [selectedGrade, setSelectedGrade] = useState('Grade 10');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2023-2024');

  // Class Selection State
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [classFilters, setClassFilters] = useState({
    grade: 'All',
    curriculum: 'All',
    year: 'All',
    subject: 'All',
    search: ''
  });
  const [classSort, setClassSort] = useState<'name' | 'grade' | 'year'>('name');

  // Admin Customization States
  const [useDefaultTerms, setUseDefaultTerms] = useState(true);
  const [useDefaultPolicy, setUseDefaultPolicy] = useState(true);
  const [useDefaultWeights, setUseDefaultWeights] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');

  const isRTL = language === Language.AR;
  const currentTerm = config.terms.find(t => t.id === activeTermId);
  const termAssessments = config.assessments.filter(a => a.termId === activeTermId);

  // --- Helper Functions ---

  const getStudentScore = (studentId: string, assessmentId: string) => {
    // Check if being edited currently
    const editKey = `${studentId}-${assessmentId}`;
    if (editedEntries.hasOwnProperty(editKey)) {
      return editedEntries[editKey];
    }
    const entry = config.entries.find(e => e.studentId === studentId && e.assessmentId === assessmentId);
    return entry ? entry.score : null;
  };

  const getEntryStatus = (studentId: string, assessmentId: string) => {
    const entry = config.entries.find(e => e.studentId === studentId && e.assessmentId === assessmentId);
    return entry ? entry.status : 'Graded';
  };

  const calculateFinalGrade = (studentId: string): number => {
    let totalWeightedScore = 0;
    let totalWeightUsed = 0;

    // Group by category
    const catScores: Record<string, { total: number, max: number }> = {};

    termAssessments.forEach(assessment => {
      const score = getStudentScore(studentId, assessment.id);
      const status = getEntryStatus(studentId, assessment.id);
      
      if (score !== null && status !== 'Excused') {
        if (!catScores[assessment.category]) {
          catScores[assessment.category] = { total: 0, max: 0 };
        }
        catScores[assessment.category].total += score;
        catScores[assessment.category].max += assessment.maxScore;
      } else if (status === 'Missing') {
         if (!catScores[assessment.category]) {
          catScores[assessment.category] = { total: 0, max: 0 };
        }
        // Missing counts as 0
        catScores[assessment.category].total += 0;
        catScores[assessment.category].max += assessment.maxScore;
      }
    });

    Object.keys(catScores).forEach(cat => {
      const weight = config.categoryWeights[cat] || 0;
      const data = catScores[cat];
      if (data.max > 0) {
        const percentage = (data.total / data.max) * 100;
        totalWeightedScore += (percentage * (weight / 100));
        totalWeightUsed += weight;
      }
    });

    // Normalize if not all categories have assessments yet
    if (totalWeightUsed === 0) return 0;
    return Math.round((totalWeightedScore / totalWeightUsed) * 100);
  };

  const handleScoreChange = (studentId: string, assessmentId: string, val: string) => {
    const num = val === '' ? null : Number(val);
    setEditedEntries(prev => ({
      ...prev,
      [`${studentId}-${assessmentId}`]: num
    }));
  };

  const handleSaveGrades = () => {
    // Merge edited entries into config
    const newEntries = [...config.entries];
    Object.keys(editedEntries).forEach(key => {
      const [sid, aid] = key.split('-');
      const index = newEntries.findIndex(e => e.studentId === sid && e.assessmentId === aid);
      if (index >= 0) {
        newEntries[index].score = editedEntries[key];
      } else {
        newEntries.push({
          studentId: sid,
          assessmentId: aid,
          score: editedEntries[key],
          status: 'Graded' // Default
        });
      }
    });
    setConfig({...config, entries: newEntries});
    setEditedEntries({});
  };

  const handleCreateAssessment = () => {
    if (!newAssessment.title) return;
    
    const assessment: Assessment = {
      id: `a-${Date.now()}`,
      title: newAssessment.title,
      category: newAssessment.category,
      maxScore: newAssessment.maxScore,
      date: newAssessment.date,
      termId: activeTermId
    };
    
    setConfig({
      ...config,
      assessments: [...config.assessments, assessment]
    });
    
    setIsAddingAssessment(false);
    setNewAssessment({
      title: '',
      category: 'Quiz',
      maxScore: 100,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const filteredClasses = CLASSES.filter(cls => {
    const matchesGrade = classFilters.grade === 'All' || cls.gradeLevel === classFilters.grade;
    const matchesCurriculum = classFilters.curriculum === 'All' || cls.curriculumSystem === classFilters.curriculum;
    const matchesYear = classFilters.year === 'All' || cls.academicYear === classFilters.year;
    const matchesSearch = cls.name.toLowerCase().includes(classFilters.search.toLowerCase());
    
    // Check if any period matches the subject filter
    const matchesSubject = classFilters.subject === 'All' || cls.schedule.some(day => 
      day.periods.some(p => p.subject === classFilters.subject)
    );

    return matchesGrade && matchesCurriculum && matchesYear && matchesSearch && matchesSubject;
  }).sort((a, b) => {
    if (classSort === 'name') return a.name.localeCompare(b.name);
    if (classSort === 'grade') return a.gradeLevel.localeCompare(b.gradeLevel);
    if (classSort === 'year') return a.academicYear.localeCompare(b.academicYear);
    return 0;
  });

  // --- Components ---

  const ClassSelector = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search classes..."
              value={classFilters.search}
              onChange={(e) => setClassFilters({...classFilters, search: e.target.value})}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <select 
              value={classFilters.grade}
              onChange={(e) => setClassFilters({...classFilters, grade: e.target.value})}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="All">All Grades</option>
              {Array.from(new Set(CLASSES.map(c => c.gradeLevel))).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select 
              value={classFilters.curriculum}
              onChange={(e) => setClassFilters({...classFilters, curriculum: e.target.value})}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="All">All Curriculums</option>
              <option value="National">National</option>
              <option value="IG">IG</option>
              <option value="IB">IB</option>
              <option value="American">American</option>
            </select>
            <select 
              value={classFilters.year}
              onChange={(e) => setClassFilters({...classFilters, year: e.target.value})}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="All">All Years</option>
              {Array.from(new Set(CLASSES.map(c => c.academicYear))).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select 
              value={classFilters.subject}
              onChange={(e) => setClassFilters({...classFilters, subject: e.target.value})}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="All">All Subjects</option>
              {Array.from(new Set(CLASSES.flatMap(c => c.schedule.flatMap(d => d.periods.map(p => p.subject))))).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select 
              value={classSort}
              onChange={(e) => setClassSort(e.target.value as any)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="name">Sort by Name</option>
              <option value="grade">Sort by Grade</option>
              <option value="year">Sort by Year</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map(cls => (
          <div 
            key={cls.id}
            onClick={() => setSelectedClassId(cls.id)}
            className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 group-hover:bg-primary-100 transition-colors">
                <School size={24} />
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-gray-100 text-gray-500 uppercase">{cls.curriculumSystem}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{cls.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{cls.gradeLevel} • {cls.academicYear}</p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Users size={14} /> {cls.students.length} Students
              </div>
              <ArrowRight size={18} className="text-primary-500 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </div>
          </div>
        ))}
        {filteredClasses.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-500">No classes found matching your filters.</p>
            <button onClick={() => setClassFilters({grade: 'All', curriculum: 'All', year: 'All', subject: 'All', search: ''})} className="text-primary-600 font-bold mt-2 hover:underline">Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  );

  const AdminJourney = () => {
    const steps = [
      { id: 1, label: 'Context', icon: <School size={18} /> },
      { id: 2, label: 'Terms', icon: <CalendarRange size={18} /> },
      { id: 3, label: 'Policy', icon: <Settings size={18} /> },
      { id: 4, label: 'Weights', icon: <LucidePieChart size={18} /> },
      { id: 5, label: 'Publish', icon: <CheckCircle2 size={18} /> },
    ];

    // -- Custom Step Handlers --
    const handleAddTerm = () => {
      const newId = `t${config.terms.length + 1}`;
      const newTerm: GradingTerm = { 
        id: newId, 
        name: `Term ${config.terms.length + 1}`, 
        startDate: '', 
        endDate: '', 
        status: 'Active' 
      };
      setConfig({...config, terms: [...config.terms, newTerm]});
    };

    const handleUpdateTerm = (id: string, field: keyof GradingTerm, value: string) => {
      const updated = config.terms.map(t => t.id === id ? { ...t, [field]: value } : t);
      setConfig({...config, terms: updated});
    };

    const handleRemoveTerm = (id: string) => {
      setConfig({...config, terms: config.terms.filter(t => t.id !== id)});
    };

    const handleAddCategory = () => {
      if (!newCategoryName || config.categoryWeights[newCategoryName]) return;
      setConfig({
        ...config,
        categoryWeights: { ...config.categoryWeights, [newCategoryName]: 0 }
      });
      setNewCategoryName('');
    };

    const handleRemoveCategory = (key: string) => {
      const newWeights = { ...config.categoryWeights };
      delete newWeights[key];
      setConfig({ ...config, categoryWeights: newWeights });
    };

    const handleUpdateWeight = (key: string, value: number) => {
      setConfig({
        ...config,
        categoryWeights: { ...config.categoryWeights, [key]: value }
      });
    };
    
    // -- Grading Policy Handlers --
    const handleUpdateGradingRule = (index: number, field: keyof GradingScaleRule, value: string | number) => {
      const newScale = [...config.gradingScale];
      newScale[index] = { ...newScale[index], [field]: value };
      setConfig({ ...config, gradingScale: newScale });
    };

    const handleRemoveGradingRule = (index: number) => {
      const newScale = config.gradingScale.filter((_, i) => i !== index);
      setConfig({ ...config, gradingScale: newScale });
    };

    const handleAddGradingRule = () => {
      setConfig({
        ...config,
        gradingScale: [
          ...config.gradingScale,
          { grade: '?', min: 0, max: 0, color: 'text-gray-600' }
        ]
      });
    };

    const totalWeight = (Object.values(config.categoryWeights) as number[]).reduce((a, b) => a + b, 0);

    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-180px)]">
        {/* Wizard Header */}
        <div className="bg-gray-50 border-b border-gray-100 p-6">
           <div className="flex justify-between items-center mb-6">
             <div>
               <h2 className="text-2xl font-bold text-gray-900">Gradebook Configuration</h2>
               <p className="text-sm text-gray-500">
                  {adminStep === 1 ? 'Select target class context' : `Setup for ${selectedGrade} • ${selectedCurriculum}`}
               </p>
             </div>
             <div className="flex gap-2">
                <Button variant="secondary" disabled={adminStep === 1} onClick={() => setAdminStep(s => s - 1)}>Previous</Button>
                <Button variant="primary" onClick={() => setAdminStep(s => Math.min(5, s + 1))}>
                   {adminStep === 5 ? 'Finish & Publish' : 'Next Step'}
                </Button>
             </div>
           </div>
           
           <div className="flex items-center gap-4 relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-0"></div>
              {steps.map(step => (
                <div 
                  key={step.id} 
                  onClick={() => setAdminStep(step.id)}
                  className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all border-2 ${adminStep === step.id ? 'bg-primary-600 border-primary-600 text-white' : adminStep > step.id ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-400'}`}
                >
                  {adminStep > step.id ? <CheckCircle2 size={16} /> : step.icon}
                  <span className="text-sm font-bold whitespace-nowrap hidden lg:inline">{step.label}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Wizard Content */}
        <div className="flex-1 p-8 overflow-y-auto">

           {adminStep === 1 && (
             <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
               <div className="text-center mb-8">
                 <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <School size={32} />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900">Initial Setup</h3>
                 <p className="text-gray-500">Define the academic scope for this gradebook.</p>
               </div>

               <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Curriculum System</label>
                    <div className="relative">
                      <select 
                        value={selectedCurriculum}
                        onChange={(e) => setSelectedCurriculum(e.target.value)}
                        className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 appearance-none font-medium text-gray-900"
                      >
                        <option value="National">National Curriculum</option>
                        <option value="IG">British (IGCSE)</option>
                        <option value="IB">International Baccalaureate (IB)</option>
                        <option value="American">American Diploma</option>
                      </select>
                      <BookOpen size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Grade Level</label>
                      <select 
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-medium text-gray-900"
                      >
                        {[...Array(12)].map((_, i) => (
                           <option key={i} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Academic Year</label>
                      <select 
                        value={selectedAcademicYear}
                        onChange={(e) => setSelectedAcademicYear(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-medium text-gray-900"
                      >
                        <option value="2023-2024">2023 - 2024</option>
                        <option value="2024-2025">2024 - 2025</option>
                        <option value="2025-2026">2025 - 2026</option>
                      </select>
                    </div>
                 </div>
               </div>

               <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-700 text-sm border border-blue-100">
                  <AlertCircle size={20} className="flex-shrink-0" />
                  <p>Changing the curriculum system later may reset grading weights and term structures.</p>
               </div>
             </div>
           )}

           {adminStep === 2 && (
             <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-xl font-bold text-gray-900">Academic Terms</h3>
                   <div className="flex items-center bg-gray-100 rounded-full p-1">
                      <button 
                        onClick={() => setUseDefaultTerms(true)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${useDefaultTerms ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                      >
                        Default (Trimesters)
                      </button>
                      <button 
                         onClick={() => setUseDefaultTerms(false)}
                         className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!useDefaultTerms ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                      >
                        Custom Schema
                      </button>
                   </div>
                </div>

                <div className="space-y-4">
                  {config.terms.map(term => (
                    <div key={term.id} className="flex flex-col md:flex-row gap-4 p-4 border border-gray-200 rounded-2xl items-end md:items-center bg-gray-50/50 transition-all hover:border-gray-300">
                       <div className="flex-1 w-full">
                         <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Term Name</label>
                         <input 
                            type="text" 
                            value={term.name} 
                            readOnly={useDefaultTerms}
                            onChange={(e) => handleUpdateTerm(term.id, 'name', e.target.value)}
                            className={`w-full p-2 rounded-lg border ${useDefaultTerms ? 'bg-gray-100 border-transparent' : 'bg-white border-gray-300 focus:ring-2 focus:ring-primary-500'} outline-none`} 
                         />
                       </div>
                       <div className="w-full md:w-40">
                          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Start Date</label>
                          <input 
                            type="date" 
                            value={term.startDate} 
                            readOnly={useDefaultTerms}
                            onChange={(e) => handleUpdateTerm(term.id, 'startDate', e.target.value)}
                            className={`w-full p-2 rounded-lg border ${useDefaultTerms ? 'bg-gray-100 border-transparent' : 'bg-white border-gray-300 focus:ring-2 focus:ring-primary-500'} outline-none`}
                          />
                       </div>
                       <div className="w-full md:w-40">
                          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">End Date</label>
                          <input 
                            type="date" 
                            value={term.endDate} 
                            readOnly={useDefaultTerms}
                            onChange={(e) => handleUpdateTerm(term.id, 'endDate', e.target.value)}
                            className={`w-full p-2 rounded-lg border ${useDefaultTerms ? 'bg-gray-100 border-transparent' : 'bg-white border-gray-300 focus:ring-2 focus:ring-primary-500'} outline-none`}
                          />
                       </div>
                       
                       {!useDefaultTerms && (
                          <button onClick={() => handleRemoveTerm(term.id)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                             <Trash2 size={18} />
                          </button>
                       )}
                    </div>
                  ))}
                  
                  {!useDefaultTerms && (
                     <Button variant="secondary" onClick={handleAddTerm} className="w-full border-dashed border-2 py-4 text-gray-400 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50">
                        <PlusCircle size={20} /> Add Another Term
                     </Button>
                  )}
                </div>
             </div>
           )}

           {adminStep === 3 && (
             <div className="max-w-3xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                   <h3 className="text-xl font-bold text-gray-900">Grading Policy</h3>
                   <div className="flex items-center bg-gray-100 rounded-full p-1">
                      <button 
                        onClick={() => setUseDefaultPolicy(true)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${useDefaultPolicy ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                      >
                        Standard Scale
                      </button>
                      <button 
                         onClick={() => setUseDefaultPolicy(false)}
                         className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!useDefaultPolicy ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                      >
                        Custom Schema
                      </button>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="p-6 border border-gray-200 rounded-2xl bg-white space-y-6">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-primary-600" /> Passing Criteria
                      </h4>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Minimum Passing Percentage</label>
                        <div className="flex items-center gap-3">
                           <input 
                             type="range" 
                             min="40" 
                             max="80" 
                             disabled={useDefaultPolicy}
                             value={config.passingScore} 
                             onChange={(e) => setConfig({...config, passingScore: Number(e.target.value)})}
                             className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer ${useDefaultPolicy ? 'bg-gray-200' : 'bg-primary-100 accent-primary-600'}`} 
                           />
                           <span className="w-16 text-center font-mono font-bold text-xl border border-gray-200 p-2 rounded-lg">{config.passingScore}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <input type="checkbox" checked disabled={useDefaultPolicy} className="w-5 h-5 accent-primary-600 rounded" />
                         <span className="text-sm text-gray-700">Auto-lock grades 5 days after term end</span>
                      </div>
                   </div>

                   <div>
                      <div className="flex justify-between items-center mb-4">
                         <h4 className="font-bold text-gray-900">Grade Boundaries</h4>
                         {!useDefaultPolicy && (
                            <Button variant="secondary" onClick={handleAddGradingRule} className="text-xs py-1.5 h-8">
                               <Plus size={14} /> Add Grade
                            </Button>
                         )}
                      </div>
                      
                      <div className="space-y-3">
                          {config.gradingScale.map((rule, idx) => (
                             <div key={idx} className={`p-4 rounded-xl border flex flex-col md:flex-row items-center gap-4 ${useDefaultPolicy ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 shadow-sm'}`}>
                                
                                {/* Grade Label & Color */}
                                <div className="flex-1 flex items-center gap-4 w-full">
                                   <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl ${rule.color.replace('text-', 'bg-').replace('600', '100')} ${rule.color}`}>
                                      {useDefaultPolicy ? rule.grade : (
                                          <input 
                                            type="text" 
                                            value={rule.grade}
                                            onChange={(e) => handleUpdateGradingRule(idx, 'grade', e.target.value)}
                                            className="bg-transparent text-center w-full h-full outline-none"
                                          />
                                      )}
                                   </div>
                                   
                                   {!useDefaultPolicy && (
                                      <select 
                                        value={rule.color}
                                        onChange={(e) => handleUpdateGradingRule(idx, 'color', e.target.value)}
                                        className="text-xs p-1 border rounded bg-gray-50 text-gray-600 outline-none"
                                      >
                                         <option value="text-green-600">Green</option>
                                         <option value="text-blue-600">Blue</option>
                                         <option value="text-yellow-600">Yellow</option>
                                         <option value="text-orange-600">Orange</option>
                                         <option value="text-red-600">Red</option>
                                         <option value="text-purple-600">Purple</option>
                                         <option value="text-gray-600">Gray</option>
                                      </select>
                                   )}
                                </div>

                                {/* Range Inputs */}
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                   <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                                      <span className="text-xs font-bold text-gray-400 pl-2">Min</span>
                                      <input 
                                        type="number" 
                                        value={rule.min} 
                                        readOnly={useDefaultPolicy}
                                        onChange={(e) => handleUpdateGradingRule(idx, 'min', Number(e.target.value))}
                                        className="w-12 p-1 text-center bg-transparent outline-none font-bold text-gray-700" 
                                      />
                                      <span className="text-gray-300">|</span>
                                      <span className="text-xs font-bold text-gray-400">Max</span>
                                      <input 
                                        type="number" 
                                        value={rule.max} 
                                        readOnly={useDefaultPolicy}
                                        onChange={(e) => handleUpdateGradingRule(idx, 'max', Number(e.target.value))}
                                        className="w-12 p-1 text-center bg-transparent outline-none font-bold text-gray-700" 
                                      />
                                      <span className="text-gray-400 pr-2">%</span>
                                   </div>
                                   
                                   {!useDefaultPolicy && (
                                      <button 
                                        onClick={() => handleRemoveGradingRule(idx)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                         <Trash2 size={18} />
                                      </button>
                                   )}
                                </div>
                             </div>
                          ))}
                          
                          {config.gradingScale.length === 0 && !useDefaultPolicy && (
                              <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl">
                                 <p className="text-gray-500 mb-2">No grade boundaries defined</p>
                                 <Button variant="secondary" onClick={handleAddGradingRule}>Create First Grade</Button>
                              </div>
                          )}
                      </div>
                   </div>
                </div>
             </div>
           )}

           {adminStep === 4 && (
             <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-bold text-gray-900">Category Weights</h3>
                   <div className="flex items-center bg-gray-100 rounded-full p-1">
                      <button 
                        onClick={() => setUseDefaultWeights(true)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${useDefaultWeights ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                      >
                        Standard Weights
                      </button>
                      <button 
                         onClick={() => setUseDefaultWeights(false)}
                         className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!useDefaultWeights ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                      >
                        Custom Schema
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      {(Object.entries(config.categoryWeights) as [string, number][]).map(([cat, weight]) => (
                        <div key={cat} className="flex items-center gap-4 animate-fadeIn">
                           <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <label className="text-sm font-bold text-gray-700">{cat}</label>
                                {!useDefaultWeights && (
                                  <button onClick={() => handleRemoveCategory(cat)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                                )}
                              </div>
                              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                 <div className={`h-full ${totalWeight > 100 ? 'bg-red-500' : 'bg-primary-500'}`} style={{ width: `${Math.min(100, weight)}%` }}></div>
                              </div>
                           </div>
                           <div className="w-20">
                              <input 
                                type="number" 
                                value={weight} 
                                readOnly={useDefaultWeights}
                                onChange={(e) => handleUpdateWeight(cat, Number(e.target.value))}
                                className={`w-full p-2 border rounded-lg text-center font-bold ${useDefaultWeights ? 'bg-gray-50 border-gray-200' : 'bg-white border-primary-200 focus:ring-2 focus:ring-primary-500'} outline-none`} 
                              />
                           </div>
                           <span className="text-gray-400">%</span>
                        </div>
                      ))}
                      
                      {!useDefaultWeights && (
                        <div className="flex gap-2 pt-2">
                           <input 
                              type="text" 
                              placeholder="New Category Name..." 
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-primary-500"
                           />
                           <Button variant="secondary" onClick={handleAddCategory} disabled={!newCategoryName} className="py-2 px-3">
                              <Plus size={16} />
                           </Button>
                        </div>
                      )}

                      {totalWeight !== 100 && (
                         <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2 border border-red-100">
                            <AlertCircle size={16} />
                            <span>Total weight must equal 100% (Current: {totalWeight}%)</span>
                         </div>
                      )}
                   </div>
                   
                   <div className="bg-gray-50 rounded-3xl p-8 flex items-center justify-center relative">
                      <div className="w-64 h-64">
                         <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                <Pie data={(Object.entries(config.categoryWeights) as [string, number][]).map(([name, value]) => ({ name, value }))} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                               {Object.entries(config.categoryWeights).map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={['#ea580c', '#fb923c', '#fdba74', '#fed7aa', '#94a3b8'][index % 5]} />
                               ))}
                                </Pie>
                             </PieChart>
                         </ResponsiveContainer>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <span className={`text-3xl font-bold ${totalWeight === 100 ? 'text-primary-800' : 'text-red-500'}`}>{totalWeight}%</span>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {adminStep === 5 && (
             <div className="max-w-5xl mx-auto py-4">
                <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">Ready to Publish</h3>
                  <p className="text-gray-500">Review your gradebook configuration before finalizing.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                   {/* Summary: Terms */}
                   <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:border-primary-100 transition-colors">
                      <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                      <div className="flex justify-between items-start mb-4">
                         <h4 className="font-bold text-gray-900 flex items-center gap-2"><CalendarRange size={18} className="text-blue-500" /> Terms</h4>
                         <button onClick={() => setAdminStep(2)} className="text-gray-400 hover:text-blue-600"><Settings size={14} /></button>
                      </div>
                      <div className="space-y-3">
                         {config.terms.map(t => (
                            <div key={t.id} className="flex justify-between text-sm">
                               <span className="text-gray-600">{t.name}</span>
                               <span className="font-mono text-gray-400 text-xs bg-gray-50 px-2 py-0.5 rounded">{t.startDate || 'N/A'}</span>
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* Summary: Policy */}
                   <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:border-primary-100 transition-colors">
                      <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
                      <div className="flex justify-between items-start mb-4">
                         <h4 className="font-bold text-gray-900 flex items-center gap-2"><Settings size={18} className="text-purple-500" /> Policy</h4>
                         <button onClick={() => setAdminStep(3)} className="text-gray-400 hover:text-purple-600"><Settings size={14} /></button>
                      </div>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center bg-purple-50 p-3 rounded-xl">
                            <span className="text-sm font-bold text-purple-900">Passing Score</span>
                            <span className="text-xl font-bold text-purple-600">{config.passingScore}%</span>
                         </div>
                         <div className="flex gap-1 flex-wrap">
                            {config.gradingScale.map(g => (
                               <span key={g.grade} className="text-xs border border-gray-200 px-2 py-1 rounded bg-gray-50">{g.grade}</span>
                            ))}
                         </div>
                      </div>
                   </div>

                   {/* Summary: Weights */}
                   <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:border-primary-100 transition-colors">
                      <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
                      <div className="flex justify-between items-start mb-4">
                         <h4 className="font-bold text-gray-900 flex items-center gap-2"><LucidePieChart size={18} className="text-orange-500" /> Weights</h4>
                         <button onClick={() => setAdminStep(4)} className="text-gray-400 hover:text-orange-600"><Settings size={14} /></button>
                      </div>
                      <div className="space-y-2">
                         {(Object.entries(config.categoryWeights) as [string, number][]).map(([cat, w]) => (
                            <div key={cat} className="relative pt-1">
                               <div className="flex justify-between text-xs mb-1">
                                  <span className="font-bold text-gray-700">{cat}</span>
                                  <span className="text-gray-500">{w}%</span>
                               </div>
                               <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-orange-500" style={{ width: `${w}%` }}></div>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="flex justify-center gap-4">
                   <Button variant="secondary" className="px-6">Save Draft</Button>
                   <Button variant="primary" className="px-10 py-3 text-lg shadow-xl shadow-primary-200" disabled={totalWeight !== 100}>
                      Publish Gradebook <ArrowRight size={20} />
                   </Button>
                </div>
             </div>
           )}
        </div>
      </div>
    );
  };

  const TeacherView = () => {
    const selectedClass = CLASSES.find(c => c.id === selectedClassId);
    
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-180px)]">
         {/* Toolbar */}
         <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gray-50/30">
            <div className="flex items-center gap-4">
               <button 
                 onClick={() => setSelectedClassId(null)}
                 className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
               >
                 <ArrowLeft size={20} />
               </button>
               <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedClass?.name || config.subjectName}</h2>
                  <p className="text-xs text-gray-500">{selectedClass?.gradeLevel} • {selectedClass?.students.length || 0} Students</p>
               </div>
               <div className="h-8 w-px bg-gray-200 hidden lg:block"></div>
               <div className="flex gap-2">
                 {config.terms.map(t => (
                   <button 
                     key={t.id} 
                     onClick={() => setActiveTermId(t.id)}
                     className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${activeTermId === t.id ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}`}
                   >
                     {t.name}
                   </button>
                 ))}
               </div>
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto">
               {Object.keys(editedEntries).length > 0 && (
                  <Button variant="primary" onClick={handleSaveGrades} className="text-xs">
                     <Save size={16} /> Save Changes
                  </Button>
               )}
               <Button variant="secondary" className="text-xs">
                  <FileText size={16} /> Export
               </Button>
               <Button variant="tonal" className="text-xs" onClick={() => setIsAddingAssessment(true)}>
                  <Plus size={16} /> Add Assessment
               </Button>
            </div>
         </div>
         
         {/* Add Assessment Modal */}
         {isAddingAssessment && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h3 className="text-xl font-bold text-gray-900">New Assessment</h3>
                 <button onClick={() => setIsAddingAssessment(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                   <XIcon size={20} />
                 </button>
               </div>
               <div className="p-6 space-y-4">
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                   <input 
                     type="text" 
                     placeholder="e.g. Midterm Quiz"
                     value={newAssessment.title}
                     onChange={(e) => setNewAssessment({...newAssessment, title: e.target.value})}
                     className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                     <select 
                       value={newAssessment.category}
                       onChange={(e) => setNewAssessment({...newAssessment, category: e.target.value as AssessmentCategory})}
                       className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                     >
                       {Object.keys(config.categoryWeights).map(cat => (
                         <option key={cat} value={cat}>{cat}</option>
                       ))}
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">Max Score</label>
                     <input 
                       type="number" 
                       value={newAssessment.maxScore}
                       onChange={(e) => setNewAssessment({...newAssessment, maxScore: Number(e.target.value)})}
                       className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                     />
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Due Date</label>
                   <input 
                     type="date" 
                     value={newAssessment.date}
                     onChange={(e) => setNewAssessment({...newAssessment, date: e.target.value})}
                     className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                   />
                 </div>
               </div>
               <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                 <Button variant="secondary" className="flex-1" onClick={() => setIsAddingAssessment(false)}>Cancel</Button>
                 <Button variant="primary" className="flex-1" onClick={handleCreateAssessment} disabled={!newAssessment.title}>Create</Button>
               </div>
             </div>
           </div>
         )}
         
         {/* Status Legend */}
         <div className="px-4 py-2 flex flex-wrap gap-4 text-[10px] font-bold text-gray-400 uppercase border-b border-gray-100 bg-white">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> Graded</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Submitted</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> Missing</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Late</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-300"></div> Excused</div>
         </div>
         
         {/* Data Grid */}
         <div className="flex-1 overflow-auto relative">
           <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50 text-gray-500 font-semibold sticky top-0 z-20 shadow-sm">
                 <tr>
                    <th className="sticky left-0 z-20 bg-gray-50 px-4 py-3 text-left w-[200px] border-b border-r border-gray-200">Student Name</th>
                    {termAssessments.map(ass => (
                      <th key={ass.id} className="px-4 py-3 text-center min-w-[120px] border-b border-gray-200">
                         <div className="flex flex-col items-center">
                            <span className="text-gray-900">{ass.title}</span>
                            <span className="text-[10px] font-normal uppercase bg-gray-200 px-1.5 rounded mt-1">{ass.category} • {ass.maxScore} pts</span>
                         </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center w-[100px] border-b border-l border-gray-200 bg-gray-50 sticky right-0 z-20">Final Grade</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {STUDENTS.slice(0, 10).map((student) => {
                    const finalGrade = calculateFinalGrade(student.id);
                    return (
                       <tr key={student.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="sticky left-0 bg-white group-hover:bg-blue-50/30 px-4 py-3 border-r border-gray-200 font-medium text-gray-900 flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">{student.name.charAt(0)}</div>
                             {student.name}
                          </td>
                          {termAssessments.map(ass => {
                             const score = getStudentScore(student.id, ass.id);
                             const status = getEntryStatus(student.id, ass.id);
                             const isEditing = editedEntries.hasOwnProperty(`${student.id}-${ass.id}`);

                             return (
                               <td key={ass.id} className="px-2 py-2 text-center border-r border-gray-50 relative">
                                  <input 
                                    type="number" 
                                    min="0"
                                    max={ass.maxScore}
                                    placeholder="-"
                                    value={score ?? ''} 
                                    onChange={(e) => handleScoreChange(student.id, ass.id, e.target.value)}
                                    className={`w-16 text-center p-1.5 rounded-lg border outline-none transition-all focus:ring-2 focus:ring-primary-500 ${
                                       status === 'Missing' ? 'bg-red-50 border-red-200 text-red-600' :
                                       status === 'Late' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                       status === 'Submitted' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                       status === 'Excused' ? 'bg-gray-100 border-gray-200 text-gray-400 italic' :
                                       isEditing ? 'bg-white border-primary-300 shadow-sm' :
                                       'bg-transparent border-transparent hover:border-gray-200'
                                    }`}
                                  />
                                  {status === 'Missing' && <div className="absolute top-1 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" title="Missing"></div>}
                                  {status === 'Submitted' && <div className="absolute top-1 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full" title="Submitted"></div>}
                                  {status === 'Late' && <div className="absolute top-1 right-2 w-1.5 h-1.5 bg-yellow-500 rounded-full" title="Late"></div>}
                                  {status === 'Graded' && score !== null && <div className="absolute top-1 right-2 w-1.5 h-1.5 bg-green-500 rounded-full" title="Graded"></div>}
                               </td>
                             );
                          })}
                          <td className="sticky right-0 bg-gray-50/50 group-hover:bg-blue-50/30 px-4 py-3 border-l border-gray-200 text-center">
                             <span className={`font-bold ${finalGrade < config.passingScore ? 'text-red-600' : 'text-gray-900'}`}>
                                {finalGrade}%
                             </span>
                          </td>
                       </tr>
                    );
                 })}
              </tbody>
           </table>
         </div>
      </div>
    );
  };

  return (
    <div className="animate-fadeIn">
       <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            {selectedClassId && (
              <button 
                onClick={() => setSelectedClassId(null)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Gradebook</h1>
          </div>
          
          {role === UserRole.ADMIN && (
             <div className="bg-white p-1 rounded-full border border-gray-200 shadow-sm flex">
                <button 
                  onClick={() => setActiveTab('admin')}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'admin' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Admin Setup
                </button>
                <button 
                  onClick={() => setActiveTab('teacher')}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'teacher' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Teacher View
                </button>
             </div>
          )}
       </div>

       {!selectedClassId && activeTab === 'teacher' ? (
         <ClassSelector />
       ) : (
         activeTab === 'admin' ? <AdminJourney /> : <TeacherView />
       )}
    </div>
  );
};