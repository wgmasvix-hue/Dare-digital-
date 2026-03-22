import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ClipboardCheck, 
  Library, 
  GraduationCap, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Users,
  BookOpen,
  FileText,
  Sparkles,
  Search
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { geminiService } from "../services/geminiService";
import ReactMarkdown from "react-markdown";
import { ALL_ADDITIONAL_OER } from "../lib/oerCatalog";
import { OPENSTAX_CURATED, transformBook } from "../lib/transformBook";
import BookCard from "../components/library/BookCard";

const COLORS = {
  forest: "#1B4332",
  forestLight: "#2D6A4F",
  forestMid: "#40916C",
  sage: "#95D5B2",
  sagePale: "#D8F3DC",
  cream: "#FEFCE8",
  amber: "#D97706",
  amberLight: "#FCD34D",
  charcoal: "#1C1917",
  stone: "#57534E",
  parchment: "#FFFBEB",
  white: "#FFFFFF",
};

const FEATURES = [
  {
    id: "resources",
    icon: <BookOpen size={24} />,
    label: "Resource Library",
    tag: "OER Catalog",
    title: "Teacher Education Resource Library",
    description:
      "Access a curated collection of Open Educational Resources (OERs), textbooks, and research papers specifically selected for teacher training in Zimbabwe.",
    bullets: [
      "Foundations of Education textbooks",
      "Curriculum & Instruction guides",
      "Educational Psychology & Lifespan Development",
      "Classroom Management manuals",
      "ZIMSEC-aligned teaching resources",
    ],
    accent: COLORS.forestMid,
  },
  {
    id: "lesson",
    icon: <ClipboardCheck size={24} />,
    label: "Lesson Planner",
    tag: "Most Requested",
    title: "MoPSE-Aligned Lesson Plan Generator",
    description:
      "Generate complete, curriculum-accurate lesson plans in minutes. DARA knows Zimbabwe's primary and secondary syllabi, knows rural classroom constraints, and structures every plan to ZIMSEC standards.",
    bullets: [
      "Specific objectives written to ZTC behavioural standards",
      "Teacher activity & pupil activity columns auto-structured",
      "Accommodation for mixed-ability classes built in",
      "ZIMSEC syllabus reference codes included",
      "Locally available resources only — no projectors assumed",
    ],
    accent: COLORS.amber,
  },
  {
    id: "tp",
    icon: <GraduationCap size={24} />,
    label: "TP Companion",
    tag: "Field-Ready",
    title: "Teaching Practice Field Companion",
    description:
      "Student-teachers on attachment are isolated from campus resources. DARA travels with them — offline-capable, reflective, and ready at 10pm before a 7am lesson.",
    bullets: [
      "Structured observation journal with DARA reflection prompts",
      "Supervisor visit preparation — mock observation questioning",
      "Post-visit feedback analysis and improvement planning",
      "Offline-first PWA — works through load-shedding",
      "MoPSE compliance documentation auto-generated",
    ],
    accent: COLORS.forestMid,
  },
  {
    id: "curriculum",
    icon: <Library size={24} />,
    label: "Curriculum Engine",
    tag: "Zimbabwe-First",
    title: "Zimbabwe Curriculum Intelligence Engine",
    description:
      "Every Grade 1–6 primary topic, every ZJC and O-Level syllabus objective, every A-Level content requirement — queryable, explained, and mapped to teaching strategies by DARA.",
    bullets: [
      "Full ZJC/O-Level/A-Level syllabus database",
      "DARA explains what each objective means practically",
      "Past ZIMSEC exam pattern analysis per topic",
      "Suggested teaching sequences per term",
      "Cross-subject integration maps",
    ],
    accent: "#7C3AED",
  },
  {
    id: "portfolio",
    icon: <FileText size={24} />,
    label: "ZTC Portfolio",
    tag: "Accreditation Ready",
    title: "ZTC Professional Registration Portfolio",
    description:
      "Every lesson plan, TP report, micro-teaching video, and reflective journal accumulates automatically into a ZTC-ready professional portfolio. Graduation day, it's already done.",
    bullets: [
      "Auto-built from all Dare activity across training",
      "ZTC registration evidence categories pre-mapped",
      "ZIMCHE accreditation dashboard for institutions",
      "CPD points tracker for in-service teachers",
      "Exportable PDF portfolio at graduation",
    ],
    accent: "#DC2626",
  },
];

const STATS = [
  { value: "40+", label: "Hours saved per student per TP block", icon: <TrendingUp size={20} /> },
  { value: "100%", label: "MoPSE syllabus coverage", icon: <CheckCircle2 size={20} /> },
  { value: "ZTC", label: "Registration-ready portfolio output", icon: <FileText size={20} /> },
  { value: "0", label: "Extra cost to teachers", icon: <Users size={20} /> },
];

const TEACHERS_COLLEGES = [
  { id: 'mkoba', name: 'Mkoba Teachers College', level: 'Primary/Secondary' },
  { id: 'belvedere', name: 'Belvedere Technical Teachers College', level: 'Secondary/Technical' },
  { id: 'morgan', name: 'Morgan Zintec College', level: 'Primary' },
  { id: 'uce', name: 'United College of Education (UCE)', level: 'Primary' },
  { id: 'hillside', name: 'Hillside Teachers College', level: 'Secondary' },
  { id: 'marymount', name: 'Marymount Teachers College', level: 'Primary/Secondary' },
  { id: 'masvingo', name: 'Masvingo Teachers College', level: 'Primary' },
  { id: 'bondolfi', name: 'Bondolfi Teachers College', level: 'Primary' },
  { id: 'morgenster', name: 'Morgenster Teachers College', level: 'Primary' },
  { id: 'nyadire', name: 'Nyadire Teachers College', level: 'Primary' },
  { id: 'madziwa', name: 'Madziwa Teachers College', level: 'Primary' },
  { id: 'seke', name: 'Seke Teachers College', level: 'Primary' },
];

const SUBJECTS = [
  "Mathematics", "English Language", "Shona", "Ndebele",
  "Science", "Social Studies", "Religious & Moral Education",
  "Physical Education", "Agriculture", "History",
  "Commerce", "Geography", "Biology", "Chemistry", "Physics",
];

const LEVELS = [
  "ECD A/B", "Grade 1", "Grade 2", "Grade 3", "Grade 4",
  "Grade 5", "Grade 6", "Grade 7", "Form 1", "Form 2",
  "Form 3", "Form 4", "Lower Sixth", "Upper Sixth",
];

const DURATIONS = ["35 minutes", "40 minutes", "45 minutes", "70 minutes (double)"];

function CurriculumEngine() {
  const [level, setLevel] = useState("Grade 5");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const responseRef = useRef(null);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const result = await geminiService.generateCurriculumGuidance({
        level,
        topic
      });
      setResponse(result);
      setTimeout(() => responseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      setError("DARA couldn't analyze the curriculum. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectStyle = {
    padding: "12px 16px", borderRadius: "10px",
    border: `1.5px solid ${COLORS.sagePale}`,
    background: COLORS.white, color: COLORS.charcoal,
    fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
    outline: "none", cursor: "pointer", width: "100%",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%231B4332' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
    paddingRight: "32px",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
    letterSpacing: "0.08em", color: COLORS.stone,
    fontFamily: "'DM Sans', sans-serif", marginBottom: "8px", display: "block",
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, #7C3AED, #4F46E5)`,
        padding: "24px 32px",
      }}>
        <div style={{
          fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.7)",
          marginBottom: "6px",
        }}>
          📚 Curriculum Engine
        </div>
        <div style={{
          fontSize: "20px", fontWeight: 700, color: COLORS.white,
          fontFamily: "'Playfair Display', serif",
        }}>
          Zimbabwe Curriculum Intelligence
        </div>
      </div>

      {/* Form */}
      <div style={{ background: COLORS.parchment, padding: "32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px", marginBottom: "20px" }}>
          <div>
            <label style={labelStyle}>Level / Class</label>
            <select style={selectStyle} value={level} onChange={e => setLevel(e.target.value)}>
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Syllabus Topic</label>
            <input 
              type="text" 
              style={{...selectStyle, backgroundImage: "none", paddingRight: "16px"}} 
              value={topic} 
              onChange={e => setTopic(e.target.value)} 
              placeholder="e.g. Photosynthesis, Fractions, Liberation War"
              onKeyDown={e => e.key === "Enter" && generate()}
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={generate}
          disabled={loading || !topic.trim()}
          style={{
            width: "100%", padding: "16px",
            background: loading || !topic.trim() ? COLORS.sagePale : "#7C3AED",
            color: COLORS.white,
            border: "none", borderRadius: "12px", fontSize: "16px",
            fontWeight: 700, cursor: loading || !topic.trim() ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
          }}
        >
          {loading ? "DARA is analyzing..." : "Analyze Topic Objectives"}
        </motion.button>
      </div>

      {/* Output */}
      <AnimatePresence>
        {error && (
          <div style={{ background: "#FEF2F2", padding: "16px 32px", color: "#DC2626", fontSize: "14px" }}>
            {error}
          </div>
        )}
        {response && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            ref={responseRef}
            style={{ background: COLORS.white, borderTop: "1px solid #E5E7EB", padding: "40px 32px" }}
          >
            <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ background: "#F5F3FF", color: "#7C3AED", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 }}>
                CURRICULUM ANALYSIS
              </span>
              <button
                onClick={() => {
                  const blob = new Blob([response], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `curriculum-analysis-${topic}.txt`;
                  a.click();
                }}
                style={{ padding: "8px 16px", borderRadius: "10px", background: "#7C3AED", color: COLORS.white, border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
              >
                Download Analysis
              </button>
            </div>
            <div className="markdown-body">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TPCompanion() {
  const [activeTab, setActiveTab] = useState("reflection");
  const [subject, setSubject] = useState("Mathematics");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("Grade 5");
  const [experience, setExperience] = useState("");
  const [challenges, setChallenges] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const responseRef = useRef(null);

  const generate = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const details = {
        subject,
        topic,
        level,
        experience,
        challenges,
        feedback
      };
      const result = await geminiService.generateTPCompanionResponse({
        type: activeTab,
        details
      });
      setResponse(result);
      setTimeout(() => responseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      setError("DARA couldn't process your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectStyle = {
    padding: "12px 16px", borderRadius: "10px",
    border: `1.5px solid ${COLORS.sagePale}`,
    background: COLORS.white, color: COLORS.charcoal,
    fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
    outline: "none", cursor: "pointer", width: "100%",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%231B4332' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
    paddingRight: "32px",
    transition: "border-color 0.2s",
  };

  const textareaStyle = {
    ...selectStyle,
    backgroundImage: "none",
    paddingRight: "16px",
    minHeight: "100px",
    resize: "vertical"
  };

  const labelStyle = {
    fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
    letterSpacing: "0.08em", color: COLORS.stone,
    fontFamily: "'DM Sans', sans-serif", marginBottom: "8px", display: "block",
  };

  const tabButtonStyle = (id) => ({
    padding: "10px 20px",
    borderRadius: "12px",
    border: "none",
    background: activeTab === id ? COLORS.forest : "transparent",
    color: activeTab === id ? COLORS.white : COLORS.stone,
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  });

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.forestMid}, ${COLORS.forestLight})`,
        padding: "24px 32px",
      }}>
        <div style={{
          fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", color: COLORS.sagePale,
          marginBottom: "6px",
        }}>
          🎓 TP Companion
        </div>
        <div style={{
          fontSize: "20px", fontWeight: 700, color: COLORS.white,
          fontFamily: "'Playfair Display', serif",
        }}>
          Your Digital Teaching Practice Mentor
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: COLORS.parchment,
        padding: "16px 32px",
        display: "flex",
        gap: "12px",
        borderBottom: `1px solid ${COLORS.sagePale}`
      }}>
        <button onClick={() => setActiveTab("reflection")} style={tabButtonStyle("reflection")}>
          <FileText size={16} /> Reflection Journal
        </button>
        <button onClick={() => setActiveTab("supervisor_prep")} style={tabButtonStyle("supervisor_prep")}>
          <Users size={16} /> Supervisor Prep
        </button>
        <button onClick={() => setActiveTab("feedback_analysis")} style={tabButtonStyle("feedback_analysis")}>
          <TrendingUp size={16} /> Feedback Analysis
        </button>
      </div>

      {/* Form Area */}
      <div style={{ background: COLORS.parchment, padding: "32px" }}>
        {activeTab === "reflection" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Subject</label>
                <select style={selectStyle} value={subject} onChange={e => setSubject(e.target.value)}>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Topic</label>
                <input type="text" style={{...selectStyle, backgroundImage: "none", paddingRight: "16px"}} value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Photosynthesis" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>What happened in the lesson?</label>
              <textarea style={textareaStyle} value={experience} onChange={e => setExperience(e.target.value)} placeholder="Describe the lesson flow, student engagement, etc." />
            </div>
            <div>
              <label style={labelStyle}>Specific challenges faced?</label>
              <textarea style={textareaStyle} value={challenges} onChange={e => setChallenges(e.target.value)} placeholder="e.g. Classroom management, resource shortage..." />
            </div>
          </div>
        )}

        {activeTab === "supervisor_prep" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Subject</label>
                <select style={selectStyle} value={subject} onChange={e => setSubject(e.target.value)}>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Level</label>
                <select style={selectStyle} value={level} onChange={e => setLevel(e.target.value)}>
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Lesson Topic</label>
              <input type="text" style={{...selectStyle, backgroundImage: "none", paddingRight: "16px"}} value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Soil erosion" />
            </div>
          </div>
        )}

        {activeTab === "feedback_analysis" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={labelStyle}>Paste Supervisor Feedback</label>
              <textarea style={textareaStyle} value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Paste the comments or feedback from your supervisor here..." />
            </div>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={generate}
          disabled={loading}
          style={{
            width: "100%", padding: "16px", marginTop: "24px",
            background: loading ? COLORS.sagePale : COLORS.forest,
            color: COLORS.white,
            border: "none", borderRadius: "12px", fontSize: "16px",
            fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
          }}
        >
          {loading ? "DARA is analyzing..." : "Get DARA's Guidance"}
        </motion.button>
      </div>

      {/* Output */}
      <AnimatePresence>
        {error && (
          <div style={{ background: "#FEF2F2", padding: "16px 32px", color: "#DC2626", fontSize: "14px" }}>
            {error}
          </div>
        )}
        {response && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            ref={responseRef}
            style={{ background: COLORS.white, borderTop: `1px solid ${COLORS.sagePale}`, padding: "40px 32px" }}
          >
            <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ background: COLORS.sagePale, color: COLORS.forest, padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 }}>
                DARA MENTORSHIP
              </span>
              <button
                onClick={() => {
                  const blob = new Blob([response], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `tp-companion-${activeTab}.txt`;
                  a.click();
                }}
                style={{ padding: "8px 16px", borderRadius: "10px", background: COLORS.forest, color: COLORS.white, border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
              >
                Download Guide
              </button>
            </div>
            <div className="markdown-body">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FeatureCard({ feature, isActive, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: "16px",
        padding: "16px 20px", borderRadius: "16px", border: "none",
        cursor: "pointer", textAlign: "left", width: "100%",
        background: isActive
          ? `linear-gradient(135deg, ${feature.accent}15, ${feature.accent}08)`
          : COLORS.white,
        boxShadow: isActive ? `0 4px 20px ${feature.accent}15` : "0 2px 10px rgba(0,0,0,0.03)",
        borderLeft: isActive ? `4px solid ${feature.accent}` : "4px solid transparent",
        transition: "all 0.3s ease",
        marginBottom: "12px"
      }}
    >
      <div style={{ 
        color: isActive ? feature.accent : COLORS.stone,
        background: isActive ? `${feature.accent}10` : "transparent",
        padding: "10px",
        borderRadius: "12px"
      }}>
        {feature.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: "14px", fontWeight: 700, color: isActive ? COLORS.charcoal : COLORS.stone,
          fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.01em",
        }}>
          {feature.label}
        </div>
        {feature.tag && (
          <div style={{
            fontSize: "10px", fontWeight: 600,
            color: isActive ? feature.accent : COLORS.stone,
            textTransform: "uppercase", letterSpacing: "0.08em",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {feature.tag}
          </div>
        )}
      </div>
      {isActive && (
        <motion.div 
          layoutId="activeIndicator"
          style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: feature.accent, flexShrink: 0,
          }} 
        />
      )}
    </motion.button>
  );
}

function LiveDemo() {
  const [subject, setSubject] = useState("Mathematics");
  const [level, setLevel] = useState("Grade 5");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("40 minutes");
  const [resources, setResources] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);
  const planRef = useRef(null);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setPlan(null);
    setError(null);

    try {
      const result = await geminiService.generateLessonPlan({
        subject,
        level,
        topic,
        duration,
        resources
      });
      setPlan(result);
      setTimeout(() => planRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      setError("DARA couldn't generate the plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectStyle = {
    padding: "12px 16px", borderRadius: "10px",
    border: `1.5px solid ${COLORS.sagePale}`,
    background: COLORS.white, color: COLORS.charcoal,
    fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
    outline: "none", cursor: "pointer", width: "100%",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%231B4332' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
    paddingRight: "32px",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
    letterSpacing: "0.08em", color: COLORS.stone,
    fontFamily: "'DM Sans', sans-serif", marginBottom: "8px", display: "block",
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
      {/* Demo header */}
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.forest}, ${COLORS.forestLight})`,
        padding: "24px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{
            fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: COLORS.amberLight,
            marginBottom: "6px",
          }}>
            ⚡ Live DARA Demo
          </div>
          <div style={{
            fontSize: "20px", fontWeight: 700, color: COLORS.white,
            fontFamily: "'Playfair Display', serif",
          }}>
            Generate a Real Lesson Plan Now
          </div>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.1)", borderRadius: "12px",
          padding: "10px 18px", fontSize: "12px", color: COLORS.sagePale, fontWeight: 600,
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          MoPSE Aligned
        </div>
      </div>

      {/* Form */}
      <div style={{
        background: COLORS.parchment, padding: "32px",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <div>
            <label style={labelStyle}>Subject</label>
            <select style={selectStyle} value={subject} onChange={e => setSubject(e.target.value)}>
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Level / Class</label>
            <select style={selectStyle} value={level} onChange={e => setLevel(e.target.value)}>
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>Lesson Topic *</label>
          <input
            type="text"
            placeholder="e.g. Addition of fractions with unlike denominators"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === "Enter" && generate()}
            style={{
              ...selectStyle, appearance: "none",
              backgroundImage: "none", paddingRight: "16px",
              width: "100%", boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
          <div>
            <label style={labelStyle}>Duration</label>
            <select style={selectStyle} value={duration} onChange={e => setDuration(e.target.value)}>
              {DURATIONS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Available Resources (optional)</label>
            <input
              type="text"
              placeholder="e.g. bottle caps, string, charts"
              value={resources}
              onChange={e => setResources(e.target.value)}
              style={{
                ...selectStyle, appearance: "none",
                backgroundImage: "none", paddingRight: "16px",
                width: "100%", boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={generate}
          disabled={loading || !topic.trim()}
          style={{
            width: "100%", padding: "16px",
            background: loading || !topic.trim()
              ? COLORS.sagePale
              : `linear-gradient(135deg, ${COLORS.forest}, ${COLORS.forestMid})`,
            color: loading || !topic.trim() ? COLORS.stone : COLORS.white,
            border: "none", borderRadius: "12px", fontSize: "16px",
            fontWeight: 700, cursor: loading || !topic.trim() ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em",
            transition: "all 0.2s ease",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            boxShadow: loading || !topic.trim() ? "none" : `0 4px 15px ${COLORS.forest}30`
          }}
        >
          {loading ? (
            <>
              <motion.span 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                style={{
                  width: "20px", height: "20px", border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: COLORS.white, borderRadius: "50%",
                  display: "inline-block",
                }} 
              />
              DARA is writing your lesson plan...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Generate Lesson Plan with DARA
            </>
          )}
        </motion.button>
      </div>

      {/* Output */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "#FEF2F2", border: "1.5px solid #FECACA",
              padding: "16px 32px",
              color: "#DC2626", fontSize: "14px",
              display: "flex", alignItems: "center", gap: "8px"
            }}
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {plan && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          ref={planRef} 
          style={{
            background: COLORS.white, borderTop: `1.5px solid ${COLORS.sagePale}`,
            padding: "40px 32px",
          }}
        >
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: "24px", paddingBottom: "20px",
            borderBottom: `2px solid ${COLORS.sagePale}`,
          }}>
            <div style={{
              fontSize: "13px", fontWeight: 700, color: COLORS.forest,
              fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", gap: "12px",
            }}>
              <span style={{
                background: COLORS.sagePale, color: COLORS.forest,
                padding: "4px 12px", borderRadius: "20px", fontSize: "11px",
                display: "flex", alignItems: "center", gap: "4px"
              }}>
                <CheckCircle2 size={12} /> MoPSE Aligned
              </span>
              <span style={{
                background: "#FEF9C3", color: COLORS.amber,
                padding: "4px 12px", borderRadius: "20px", fontSize: "11px",
              }}>
                DARA Generated
              </span>
            </div>
            <button
              onClick={() => {
                const blob = new Blob([plan], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `lesson-plan-${subject}-${level}-${topic.substring(0, 20)}.txt`;
                a.click();
              }}
              style={{
                padding: "8px 16px", borderRadius: "10px",
                background: COLORS.forest, color: COLORS.white,
                border: "none", fontSize: "13px", fontWeight: 600,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", gap: "6px"
              }}
            >
              <Download size={16} /> Download
            </button>
          </div>
          <div className="markdown-body" style={{
            fontSize: "15px", lineHeight: "1.8", color: COLORS.charcoal,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <ReactMarkdown>{plan}</ReactMarkdown>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ResourceLibrary({ selectedLevel, selectedInstitution }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [useSemanticSearch, setUseSemanticSearch] = useState(false);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      let dbResources = [];
      
      if (useSemanticSearch && searchQuery.trim()) {
        const results = await geminiService.semanticSearch(searchQuery);
        // Filter for education related results
        dbResources = results.filter(r => 
          r.subject?.toLowerCase().includes("education") || 
          r.title?.toLowerCase().includes("education") ||
          r.description?.toLowerCase().includes("education")
        );
      } else {
        // Keyword search or initial load
        let query = supabase
          .from('books')
          .select('*')
          .ilike('subject', '%education%');

        if (searchQuery.trim()) {
          query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,author_names.ilike.%${searchQuery}%`);
        }

        if (selectedInstitution) {
          query = query.eq('institution_id', selectedInstitution);
        }

        if (selectedLevel && selectedLevel !== 'All Levels') {
          query = query.or(`description.ilike.%${selectedLevel}%,title.ilike.%${selectedLevel}%`);
        }

        const { data, error } = await query.limit(20);
        if (error) throw error;
        dbResources = data || [];
      }

      // Combine with local OERs
      const allLocal = [...OPENSTAX_CURATED, ...ALL_ADDITIONAL_OER].map(transformBook);
      const educationLocal = allLocal.filter(r => {
        const isEducation = r.faculty?.toLowerCase().includes("education") || 
                            r.subject?.toLowerCase().includes("education") ||
                            r.domain === "D1" || r.domain === "D2" || r.domain === "D3";
        
        if (!isEducation) return false;

        // Filter by Level if selected
        if (selectedLevel && selectedLevel !== 'All Levels') {
          const hasLevel = r.metadata?.levels?.includes(selectedLevel) || 
                           r.description?.toLowerCase().includes(selectedLevel.toLowerCase()) ||
                           r.title?.toLowerCase().includes(selectedLevel.toLowerCase());
          if (!hasLevel) return false;
        }

        if (searchQuery && !useSemanticSearch) {
          const q = searchQuery.toLowerCase();
          return r.title.toLowerCase().includes(q) || 
                 r.author_names?.toLowerCase().includes(q) ||
                 r.description?.toLowerCase().includes(q);
        }
        return true;
      });

      // Merge and deduplicate
      const combined = [...dbResources, ...educationLocal];
      const unique = Array.from(new Map(combined.map(item => [item.title, item])).values());
      
      setResources(unique);
    } catch (err) {
      console.error("Error fetching resources:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, useSemanticSearch, selectedLevel, selectedInstitution]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResources();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchResources]);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ 
        marginBottom: "32px",
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }}>
        <div style={{ position: "relative", maxWidth: "500px" }}>
          <Search 
            size={18} 
            style={{ 
              position: "absolute", 
              left: "16px", 
              top: "50%", 
              transform: "translateY(-50%)",
              color: COLORS.stone
            }} 
          />
          <input 
            type="text" 
            placeholder={useSemanticSearch ? "Describe what you want to teach..." : "Search teacher education resources..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 16px 14px 48px",
              borderRadius: "12px",
              border: `1.5px solid ${COLORS.sagePale}`,
              background: COLORS.white,
              color: COLORS.charcoal,
              fontSize: "14px",
              outline: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              transition: "border-color 0.2s"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={() => setUseSemanticSearch(false)}
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 600,
              background: !useSemanticSearch ? COLORS.forest : COLORS.sagePale,
              color: !useSemanticSearch ? COLORS.white : COLORS.forest,
              border: "none",
              cursor: "pointer"
            }}
          >
            Keyword
          </button>
          <button
            onClick={() => setUseSemanticSearch(true)}
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 600,
              background: useSemanticSearch ? COLORS.forest : COLORS.sagePale,
              color: useSemanticSearch ? COLORS.white : COLORS.forest,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <Sparkles size={12} /> Semantic (AI)
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ 
            width: "32px", 
            height: "32px", 
            border: `3px solid ${COLORS.sagePale}`, 
            borderTopColor: COLORS.forest, 
            borderRadius: "50%", 
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px"
          }}></div>
          <p style={{ color: COLORS.stone }}>Finding relevant resources...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "24px"
        }}>
          {resources.length > 0 ? (
            resources.map((res, i) => (
              <BookCard key={res.id || i} publication={res} />
            ))
          ) : (
            <div style={{ 
              gridColumn: "1 / -1", 
              textAlign: "center", 
              padding: "60px 20px",
              background: COLORS.parchment,
              borderRadius: "20px",
              border: `1px dashed ${COLORS.sage}`
            }}>
              <BookOpen size={48} style={{ color: COLORS.sage, marginBottom: "16px", opacity: 0.5 }} />
              <p style={{ color: COLORS.stone, fontSize: "16px" }}>No matching resources found in the library.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ZTCPortfolio() {
  const [collegeName, setCollegeName] = useState("Mkoba Teachers College");
  const [department, setDepartment] = useState("Mathematics");
  const [focusArea, setFocusArea] = useState("Teaching Practice");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const responseRef = useRef(null);

  const generate = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const result = await geminiService.generatePortfolioStructure({
        collegeName,
        department,
        focusArea
      });
      setResponse(result);
      setTimeout(() => responseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      setError("DARA couldn't generate the portfolio structure. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectStyle = {
    padding: "12px 16px", borderRadius: "10px",
    border: `1.5px solid ${COLORS.sagePale}`,
    background: COLORS.white, color: COLORS.charcoal,
    fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
    outline: "none", cursor: "pointer", width: "100%",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%231B4332' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
    paddingRight: "32px",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
    letterSpacing: "0.08em", color: COLORS.stone,
    fontFamily: "'DM Sans', sans-serif", marginBottom: "8px", display: "block",
  };

  const metrics = [
    { label: "Unique titles accessible", value: "847", change: "+124 this term", icon: <BookOpen size={20} /> },
    { label: "Active student users", value: "312", change: "87% of cohort", icon: <Users size={20} /> },
    { label: "Lesson plans generated", value: "2,341", change: "This semester", icon: <ClipboardCheck size={20} /> },
    { label: "DARA study sessions", value: "4,847", change: "Avg 34 min each", icon: <Sparkles size={20} /> },
    { label: "O-Level syllabus coverage", value: "100%", change: "All 8 subjects", icon: <CheckCircle2 size={20} /> },
    { label: "TP journals submitted", value: "156", change: "via Dare", icon: <FileText size={20} /> },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, #1E3A5F, #1B4332)`,
        borderRadius: "20px", padding: "32px", marginBottom: "24px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
      }}>
        <div style={{
          fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", color: COLORS.amberLight, marginBottom: "8px",
        }}>
          ZIMCHE Accreditation & Portfolio Builder
        </div>
        <div style={{
          fontSize: "28px", fontWeight: 700, color: COLORS.white,
          fontFamily: "'Playfair Display', serif", marginBottom: "8px",
        }}>
          {collegeName}
        </div>
        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>
          January 2026 — June 2026 · Generated by Dare Digital Library
        </div>
        <div style={{
          marginTop: "20px", padding: "12px 20px",
          background: "rgba(149, 213, 178, 0.15)",
          borderRadius: "12px", border: "1px solid rgba(149, 213, 178, 0.3)",
          display: "inline-flex", alignItems: "center", gap: "10px",
        }}>
          <CheckCircle2 size={18} style={{ color: COLORS.sage }} />
          <span style={{ color: COLORS.sagePale, fontSize: "14px", fontWeight: 600 }}>
            ZIMCHE Resource Adequacy Standard: EXCEEDED
          </span>
        </div>
      </div>

      {/* Metrics grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px", marginBottom: "32px",
      }}>
        {metrics.map((m, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              background: COLORS.white, border: `1.5px solid ${COLORS.sagePale}`,
              borderRadius: "16px", padding: "20px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.02)"
            }}
          >
            <div style={{ color: COLORS.forestMid, marginBottom: "12px" }}>{m.icon}</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: COLORS.charcoal, marginBottom: "4px" }}>{m.value}</div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: COLORS.stone, marginBottom: "8px" }}>{m.label}</div>
            <div style={{ fontSize: "11px", color: COLORS.forestLight, fontWeight: 700 }}>{m.change}</div>
          </motion.div>
        ))}
      </div>

      {/* Portfolio Builder Form */}
      <div style={{ background: COLORS.parchment, padding: "32px", borderRadius: "20px", border: `1px solid ${COLORS.sagePale}` }}>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: COLORS.charcoal, marginBottom: "20px", fontFamily: "'Playfair Display', serif" }}>
          Build Your ZTC Portfolio Structure
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <div>
            <label style={labelStyle}>College Name</label>
            <input type="text" style={{...selectStyle, backgroundImage: "none", paddingRight: "16px"}} value={collegeName} onChange={e => setCollegeName(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Department</label>
            <input type="text" style={{...selectStyle, backgroundImage: "none", paddingRight: "16px"}} value={department} onChange={e => setDepartment(e.target.value)} />
          </div>
        </div>
        <div style={{ marginBottom: "24px" }}>
          <label style={labelStyle}>Focus Area</label>
          <select style={selectStyle} value={focusArea} onChange={e => setFocusArea(e.target.value)}>
            <option>Teaching Practice</option>
            <option>Professional Studies</option>
            <option>Subject Specialization</option>
            <option>Research & Innovation</option>
            <option>Community Engagement</option>
          </select>
        </div>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={generate}
          disabled={loading}
          style={{
            width: "100%", padding: "16px",
            background: loading ? COLORS.sagePale : COLORS.forest,
            color: COLORS.white,
            border: "none", borderRadius: "12px", fontSize: "16px",
            fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
          }}
        >
          {loading ? "DARA is building..." : "Generate Portfolio Structure"}
        </motion.button>
      </div>

      {/* Output */}
      <AnimatePresence>
        {error && (
          <div style={{ background: "#FEF2F2", padding: "16px 32px", color: "#DC2626", fontSize: "14px", marginTop: "20px", borderRadius: "12px" }}>
            {error}
          </div>
        )}
        {response && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            ref={responseRef}
            style={{ background: COLORS.white, border: `1px solid ${COLORS.sagePale}`, padding: "40px 32px", marginTop: "24px", borderRadius: "20px" }}
          >
            <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ background: COLORS.sagePale, color: COLORS.forest, padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 }}>
                ZTC PORTFOLIO GUIDE
              </span>
              <button
                onClick={() => {
                  const blob = new Blob([response], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `ztc-portfolio-${focusArea}.txt`;
                  a.click();
                }}
                style={{ padding: "8px 16px", borderRadius: "10px", background: COLORS.forest, color: COLORS.white, border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
              >
                Download Portfolio Guide
              </button>
            </div>
            <div className="markdown-body">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TeachersColleges() {
  const [activeFeature, setActiveFeature] = useState(FEATURES[0]);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: COLORS.white,
      paddingTop: "180px",
      paddingBottom: "80px"
    }}>
      {/* Hero Section */}
      <div style={{
        maxWidth: "1200px", margin: "0 auto", padding: "0 24px",
        marginBottom: "60px", textAlign: "center"
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span style={{
            background: `${COLORS.amber}15`, color: COLORS.amber,
            padding: "6px 16px", borderRadius: "30px", fontSize: "12px",
            fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em",
            marginBottom: "20px", display: "inline-block"
          }}>
            Teacher Training Excellence
          </span>
          <h1 style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 800,
            color: COLORS.charcoal, fontFamily: "'Playfair Display', serif",
            lineHeight: 1.1, marginBottom: "24px"
          }}>
            Empowering Zimbabwe's <br />
            <span style={{ color: COLORS.forest }}>Future Educators</span>
          </h1>
          <p style={{
            fontSize: "18px", color: COLORS.stone, maxWidth: "700px",
            margin: "0 auto 40px", lineHeight: 1.6
          }}>
            Dare Digital Library provides specialized tools for Teachers Colleges, 
            bridging the gap between theory and teaching practice with MoPSE-aligned AI.
          </p>
        </motion.div>

        {/* Stats */}
        <div style={{
          display: "flex", justifyContent: "center", gap: "40px", flexWrap: "wrap"
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "32px", fontWeight: 800, color: COLORS.forest }}>{s.value}</div>
              <div style={{ fontSize: "12px", color: COLORS.stone, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{
        maxWidth: "1200px", margin: "0 auto", padding: "0 24px",
        display: "flex", flexDirection: isMobile ? "column" : "row", gap: "40px"
      }}>
        {/* Sidebar */}
        <div style={{ 
          width: isMobile ? "100%" : "350px",
          display: "flex", flexDirection: "column", gap: "32px",
          flexShrink: 0,
          background: "rgba(255, 255, 255, 0.9)",
          padding: isMobile ? "24px" : "32px",
          borderRadius: "32px",
          border: `1px solid ${COLORS.sagePale}`,
          backdropFilter: "blur(10px)",
          position: isMobile ? "static" : "sticky",
          top: "180px",
          height: isMobile ? "auto" : "calc(100vh - 220px)",
          overflowY: isMobile ? "visible" : "auto",
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          marginBottom: isMobile ? "40px" : "0"
        }}>
          {isMobile && (
            <div style={{ 
              padding: "16px 20px", 
              background: COLORS.forest, 
              color: COLORS.white, 
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              fontWeight: "700",
              fontSize: "0.9rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "24px"
            }}>
              <Menu size={18} />
              Institutional Menu & Filters
            </div>
          )}
          {/* Instructions Box */}
          <div style={{
            padding: "24px", borderRadius: "20px",
            background: COLORS.forest, color: COLORS.white,
            boxShadow: "0 10px 20px rgba(27, 67, 50, 0.15)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <Sparkles size={20} style={{ color: COLORS.amberLight }} />
              <h4 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Quick Instructions
              </h4>
            </div>
            <p style={{ fontSize: "13px", lineHeight: 1.6, opacity: 0.9 }}>
              Select your institution below to see specialized resources. Use the level filter to find content relevant to your teaching track.
            </p>
          </div>

          {/* Institutions Menu */}
          <div>
            <h3 style={{
              fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.1em", color: COLORS.stone, marginBottom: "16px",
              paddingLeft: "8px"
            }}>
              Partner Institutions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                onClick={() => setSelectedInstitution(null)}
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  textAlign: "left",
                  fontSize: "14px",
                  fontWeight: 600,
                  transition: "all 0.2s",
                  background: selectedInstitution === null ? COLORS.sagePale : "transparent",
                  color: selectedInstitution === null ? COLORS.forest : COLORS.stone,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}
              >
                <Library size={18} />
                All Institutions
              </button>
              {TEACHERS_COLLEGES.map(inst => (
                <button
                  key={inst.id}
                  onClick={() => {
                    setSelectedInstitution(inst.id);
                    if (inst.level.includes('Primary') && !inst.level.includes('Secondary')) {
                      setSelectedLevel('Primary');
                    } else if (inst.level.includes('Secondary') && !inst.level.includes('Primary')) {
                      setSelectedLevel('Secondary');
                    } else {
                      setSelectedLevel('All Levels');
                    }
                  }}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "12px",
                    textAlign: "left",
                    fontSize: "14px",
                    fontWeight: 600,
                    transition: "all 0.2s",
                    background: selectedInstitution === inst.id ? COLORS.sagePale : "transparent",
                    color: selectedInstitution === inst.id ? COLORS.forest : COLORS.stone,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px"
                  }}
                >
                  <span>{inst.name}</span>
                  <span style={{ fontSize: "10px", opacity: 0.7, fontWeight: 500 }}>{inst.level} Focus</span>
                </button>
              ))}
            </div>
          </div>

          {/* Specialized Tools */}
          <div>
            <h3 style={{
              fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.1em", color: COLORS.stone, marginBottom: "16px",
              paddingLeft: "8px"
            }}>
              Specialized Tools
            </h3>
            {FEATURES.map(f => (
              <FeatureCard 
                key={f.id}
                feature={f}
                isActive={activeFeature.id === f.id}
                onClick={() => setActiveFeature(f)}
              />
            ))}
          </div>

          {/* Level Filter (Only visible when resources is active) */}
          {activeFeature.id === "resources" && (
            <div>
              <h3 style={{
                fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.1em", color: COLORS.stone, marginBottom: "16px",
                paddingLeft: "8px"
              }}>
                Filter by Level
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {['All Levels', ...LEVELS].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 600,
                      background: selectedLevel === lvl ? COLORS.forest : COLORS.sagePale,
                      color: selectedLevel === lvl ? COLORS.white : COLORS.forest,
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div style={{
            padding: "24px", borderRadius: "20px",
            background: COLORS.parchment, border: `1.5px solid ${COLORS.sagePale}`
          }}>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: COLORS.forest, marginBottom: "12px" }}>
              Institutional Support
            </h4>
            <p style={{ fontSize: "13px", color: COLORS.stone, lineHeight: 1.5, marginBottom: "16px" }}>
              Are you a college administrator? Get a custom ZIMCHE compliance report for your institution.
            </p>
            <button style={{
              width: "100%", padding: "12px", borderRadius: "10px",
              background: COLORS.forest, color: COLORS.white,
              border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer"
            }}>
              Contact Support
            </button>
          </div>
          {isMobile && (
            <button
              onClick={() => {
                const content = document.getElementById('main-content');
                if (content) content.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                width: "100%",
                padding: "16px",
                background: COLORS.forest,
                color: COLORS.white,
                border: "none",
                borderRadius: "12px",
                fontWeight: "700",
                marginTop: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px"
              }}
            >
              View Resources <ChevronDown size={18} />
            </button>
          )}
        </div>

        {/* Dynamic Content Area */}
        <div id="main-content" style={{ flex: 1, minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Feature Header */}
              <div style={{ marginBottom: "40px" }}>
                <h2 style={{
                  fontSize: "32px", fontWeight: 700, color: COLORS.charcoal,
                  fontFamily: "'Playfair Display', serif", marginBottom: "16px"
                }}>
                  {activeFeature.title}
                </h2>
                <p style={{ fontSize: "16px", color: COLORS.stone, lineHeight: 1.6, marginBottom: "24px" }}>
                  {activeFeature.description}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {activeFeature.bullets.map((b, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", fontSize: "13px", color: COLORS.charcoal }}>
                      <CheckCircle2 size={16} style={{ color: activeFeature.accent, flexShrink: 0 }} />
                      {b}
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Tool Area */}
              {activeFeature.id === "resources" && (
                <ResourceLibrary 
                  selectedLevel={selectedLevel} 
                  selectedInstitution={selectedInstitution} 
                />
              )}
              {activeFeature.id === "lesson" && <LiveDemo />}
              {activeFeature.id === "tp" && <TPCompanion />}
              {activeFeature.id === "portfolio" && <ZTCPortfolio />}
              {activeFeature.id === "curriculum" && <CurriculumEngine />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
