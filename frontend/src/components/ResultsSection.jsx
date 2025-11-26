import { motion, AnimatePresence } from 'framer-motion'
import { Target, FileText, Lightbulb, FileOutput, CheckSquare, ChevronDown, Download, Copy, Check, Star } from 'lucide-react'
import { useState } from 'react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import ReactMarkdown from 'react-markdown'

const extractJson = (str) => {
    if (!str) return null;
    try {
        // Try parsing directly first
        return JSON.parse(str);
    } catch (e) {
        // If that fails, try to find the first '{' and the last '}'
        const firstOpen = str.indexOf('{');
        const lastClose = str.lastIndexOf('}');
        if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
            const potentialJson = str.substring(firstOpen, lastClose + 1);
            try {
                return JSON.parse(potentialJson);
            } catch (e2) {
                console.error("Failed to extract JSON:", e2);
                return null;
            }
        }
        return null;
    }
};

const ResultCard = ({ title, icon: Icon, children, isOpen, onToggle, status }) => (
    <div className="glass-panel overflow-hidden transition-all duration-300">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    <Icon size={20} />
                </div>
                <h3 className="text-lg font-semibold text-left">{title}</h3>
            </div>
            <div className="flex items-center gap-3">
                {status === 'completed' && <Check size={18} className="text-green-400" />}
                <ChevronDown
                    size={20}
                    className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </div>
        </button>

        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="p-6 pt-0 border-t border-white/5">
                        <div className="mt-4 text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {children}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
)

const ReportVisualizer = ({ markdownString }) => {
    if (!markdownString) return <p className="text-slate-500 italic">No report available.</p>;

    return (
        <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{markdownString}</ReactMarkdown>
        </div>
    )
}

const EvaluationVisualizer = ({ jsonString }) => {
    const data = extractJson(jsonString);

    if (!data) {
        return (
            <pre className="bg-slate-900/50 p-4 rounded-md font-mono text-sm border border-white/5 overflow-x-auto text-red-300">
                Error parsing JSON. Raw Output:
                {'\n' + (jsonString || 'null')}
            </pre>
        );
    }

    const { score, rubric_breakdown, feedback } = data;
    const safeScore = typeof score === 'number' ? score : 0;

    // Transform rubric data for Recharts
    const chartData = rubric_breakdown ? Object.entries(rubric_breakdown).map(([key, value]) => ({
        subject: key.charAt(0).toUpperCase() + key.slice(1),
        A: value,
        fullMark: 5,
    })) : [];

    return (
        <div className="space-y-6">
            {/* Overall Score */}
            <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-white/5">
                <div className="flex-1">
                    <div className="text-sm text-slate-400 mb-1">Overall Quality Score</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-white">{safeScore}</span>
                        <span className="text-slate-500">/ 5</span>
                    </div>
                </div>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            size={24}
                            className={`${star <= Math.round(safeScore) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Rubric Radar Chart */}
            <div className="h-64 w-full bg-slate-800/30 rounded-xl border border-white/5 p-4 relative">
                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider absolute top-4 left-4">Rubric Analysis</h4>
                <div className="w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                            <Radar
                                name="Score"
                                dataKey="A"
                                stroke="#818cf8"
                                strokeWidth={2}
                                fill="#818cf8"
                                fillOpacity={0.3}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Feedback */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-indigo-300 mb-2 flex items-center gap-2">
                    <Lightbulb size={16} />
                    AI Feedback
                </h4>
                <p className="text-slate-300 italic">"{feedback || "No feedback available."}"</p>
            </div>
        </div>
    )
}

const ResultsSection = ({ results }) => {
    const [openStep, setOpenStep] = useState(null)
    const [copied, setCopied] = useState(false)

    if (!results) return null

    const handleCopy = () => {
        const text = `
Research Goal: ${results.step1}
Summary: ${results.step2}
Insight: ${results.step3}
Report: ${results.step4}
Evaluation: ${results.step5}
        `.trim()
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDownload = () => {
        const text = `Step,Content\nGoal,"${results.step1}"\nSummary,"${results.step2}"\nInsight,"${results.step3}"\nReport,"${results.step4}"\nEvaluation,"${results.step5}"`
        const blob = new Blob([text], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'research-ops-results.csv'
        a.click()
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-400">📍 Pipeline Output</h3>
            </div>

            <ResultCard
                title="Step 1: Planner Agent"
                icon={Target}
                isOpen={openStep === 1}
                onToggle={() => setOpenStep(openStep === 1 ? null : 1)}
                status="completed"
            >
                {results.step1}
            </ResultCard>

            <ResultCard
                title="Step 2: Summarizer Agent"
                icon={FileText}
                isOpen={openStep === 2}
                onToggle={() => setOpenStep(openStep === 2 ? null : 2)}
                status="completed"
            >
                {results.step2}
            </ResultCard>

            <ResultCard
                title="Step 3: Insight Agent"
                icon={Lightbulb}
                isOpen={openStep === 3}
                onToggle={() => setOpenStep(openStep === 3 ? null : 3)}
                status="completed"
            >
                {results.step3}
            </ResultCard>

            <ResultCard
                title="Step 4: Report Agent"
                icon={FileOutput}
                isOpen={openStep === 4}
                onToggle={() => setOpenStep(openStep === 4 ? null : 4)}
                status="completed"
            >
                <ReportVisualizer markdownString={results.step4} />
            </ResultCard>

            <ResultCard
                title="Step 5: Evaluation Agent"
                icon={CheckSquare}
                isOpen={openStep === 5}
                onToggle={() => setOpenStep(openStep === 5 ? null : 5)}
                status="completed"
            >
                <EvaluationVisualizer jsonString={results.step5} />
            </ResultCard>

            <div className="flex gap-3 mt-8 pt-4 border-t border-white/10">
                <button
                    onClick={handleDownload}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                    <Download size={18} />
                    Download CSV
                </button>
                <button
                    onClick={handleCopy}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                    {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                    {copied ? 'Copied!' : 'Copy Report'}
                </button>
            </div>
        </div>
    )
}

export default ResultsSection
