import { Send } from 'lucide-react'

const InputSection = ({ value, onChange, onAnalyze, loading }) => {
    return (
        <div className="glass-panel">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <span className="text-indigo-400">📌</span> VOC Input
                </h2>
            </div>

            <div className="relative">
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Example: 'Checkout keeps failing and UI feels confusing...'"
                    disabled={loading}
                    className="w-full min-h-[120px] bg-slate-900/50 border border-white/10 rounded-lg p-4 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-y"
                />
                <div className="absolute bottom-3 right-3 text-xs text-slate-600 pointer-events-none">
                    {value.length} chars
                </div>
            </div>

            <div className="mt-6">
                <button
                    onClick={onAnalyze}
                    disabled={loading || !value.trim()}
                    className={`w-full py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-3
                        ${loading || !value.trim()
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-[0.99]'
                        }`}
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Running Pipeline...
                        </>
                    ) : (
                        <>
                            <Send size={20} />
                            Run Pipeline
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

export default InputSection
