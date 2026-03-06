import React, { useState } from 'react';
import { generateLessonPlan } from '../services/geminiService';
import { LessonPlan, Language } from '../types';
import { Button } from '../components/Button';
import { 
  Sparkles, 
  Download, 
  Target, 
  FlaskConical, 
  Clock, 
  HelpCircle, 
  FileQuestion,
  Pencil
} from 'lucide-react';

interface LessonPlannerProps {
  language: Language;
}

export const LessonPlanner: React.FC<LessonPlannerProps> = ({ language }) => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  
  // Form State
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('Grade 5');
  const [subject, setSubject] = useState('Science');

  const isRTL = language === Language.AR;

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    const result = await generateLessonPlan(topic, grade, subject, language);
    setPlan(result);
    setLoading(false);
  };

  const labels = {
    title: isRTL ? 'مخطط الدروس الذكي' : 'AI Lesson Planner',
    subtitle: isRTL ? 'قم بإنشاء خطط دروس شاملة، واختبارات، وأنشطة في ثوانٍ.' : 'Generate comprehensive lesson plans, quizzes, and activities in seconds.',
    topic: isRTL ? 'عنوان الدرس' : 'Lesson Topic',
    grade: isRTL ? 'الصف الدراسي' : 'Grade Level',
    subject: isRTL ? 'المادة' : 'Subject',
    generate: isRTL ? 'إنشاء الدرس' : 'Generate Lesson',
    generating: isRTL ? 'جارٍ الإنشاء...' : 'Generating...',
    objectives: isRTL ? 'الأهداف التعليمية' : 'Learning Objectives',
    materials: isRTL ? 'المواد المطلوبة' : 'Materials Needed',
    outline: isRTL ? 'مخطط الدرس' : 'Lesson Outline',
    quiz: isRTL ? 'اختبار قصير' : 'Quick Quiz'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <Sparkles className="absolute top-4 right-4 text-white opacity-20" size={120} />
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
             <Sparkles size={28} /> {labels.title}
          </h2>
          <p className="text-teal-50 opacity-90 max-w-xl">{labels.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 md:col-span-1 h-fit sticky top-24">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.subject}</label>
              <select 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border-gray-200 border p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50 outline-none transition-all"
              >
                <option>Science</option>
                <option>Mathematics</option>
                <option>History</option>
                <option>Language Arts</option>
                <option>Computer Science</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.grade}</label>
              <select 
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full rounded-xl border-gray-200 border p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50 outline-none transition-all"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labels.topic}</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={isRTL ? "مثال: البناء الضوئي" : "e.g., Photosynthesis"}
                className="w-full rounded-xl border-gray-200 border p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50 outline-none transition-all min-h-[100px] resize-none"
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              isLoading={loading} 
              disabled={!topic}
              className="w-full bg-teal-600 hover:bg-teal-700 shadow-teal-200"
            >
              {loading ? labels.generating : labels.generate}
            </Button>
          </div>
        </div>

        {/* Results Display */}
        <div className="md:col-span-2 space-y-6">
          {plan ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Header */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{plan.topic}</h3>
                    <p className="text-gray-500">{plan.subject} • {plan.gradeLevel}</p>
                  </div>
                  <Button variant="secondary" className="text-sm h-10 w-10 p-0 rounded-full flex items-center justify-center">
                    <Download size={18} />
                  </Button>
                </div>
              </div>

              {/* Objectives & Materials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <h4 className="font-bold text-teal-700 mb-3 flex items-center gap-2">
                    <Target size={20} /> {labels.objectives}
                  </h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    {plan.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-teal-500 mt-1">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <h4 className="font-bold text-teal-700 mb-3 flex items-center gap-2">
                    <FlaskConical size={20} /> {labels.materials}
                  </h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    {plan.materials.map((mat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-teal-500 mt-1">•</span>
                        <span>{mat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h4 className="font-bold text-teal-700 mb-4 flex items-center gap-2">
                  <Clock size={20} /> {labels.outline}
                </h4>
                <div className="space-y-4">
                  {plan.outline.map((section, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="w-16 h-10 flex-shrink-0 flex items-center justify-center bg-white rounded-lg border border-gray-200 text-xs font-bold text-gray-600 shadow-sm">
                        {section.duration}
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-800 text-sm">{section.activity}</h5>
                        <p className="text-gray-600 text-sm mt-1">{section.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

               {/* Quiz */}
               <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h4 className="font-bold text-teal-700 mb-4 flex items-center gap-2">
                  <FileQuestion size={20} /> {labels.quiz}
                </h4>
                <div className="space-y-6">
                  {plan.quiz.map((q, idx) => (
                    <div key={idx} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <p className="font-medium text-gray-800 mb-3 flex items-start gap-2">
                        <span className="text-teal-600 font-bold">{idx + 1}.</span>
                        {q.question}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className={`text-sm px-4 py-3 rounded-xl border transition-colors ${opt === q.correctAnswer ? 'bg-green-50 border-green-200 text-green-700 font-medium' : 'bg-white border-gray-200 text-gray-600'}`}>
                            {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 min-h-[400px] border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
              <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                 <Pencil size={32} className="text-teal-400" />
              </div>
              <p className="text-lg font-medium text-gray-600">{isRTL ? 'جاهز لإنشاء شيء رائع؟' : 'Ready to create something amazing?'}</p>
              <p className="text-sm">{isRTL ? 'أدخل التفاصيل على اليمين للبدء.' : 'Enter details to get started.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};