import { motion } from 'framer-motion'

const ProgressBar = ({ progress, status }) => {
    return (
        <div className="w-full space-y-2 mb-8">
            <div className="flex justify-between text-sm font-medium text-slate-300">
                <span>{status || 'Processing Status'}</span>
                <span>{progress}%</span>
            </div>
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-white/5 relative">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #4f46e5 10px, #4f46e5 20px)' }}
                />

                {/* Active progress bar */}
                <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        </div>
    )
}

export default ProgressBar
