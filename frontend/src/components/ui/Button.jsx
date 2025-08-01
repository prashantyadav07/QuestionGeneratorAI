// frontend/src/components/ui/Button.jsx

import { motion } from 'framer-motion';
import { LoaderCircle } from 'lucide-react';

// Naya prop 'countdown' add kiya hai
const Button = ({ children, isLoading = false, disabled = false, className = '', type = 'button', countdown = null, ...props }) => {
    const isDisabled = isLoading || disabled;

    return (
        <motion.button
            type={type}
            disabled={isDisabled}
            className={`flex items-center justify-center gap-2 w-full py-3 px-6 rounded-lg font-semibold text-white bg-violet-600 hover:bg-violet-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-violet-500/40 ${className}`}
            whileHover={!isDisabled ? { scale: 1.03 } : {}}
            whileTap={!isDisabled ? { scale: 0.98 } : {}}
            {...props}
        >
            {isLoading ? (
                <>
                    <LoaderCircle className="animate-spin" size={20} />
                    {/* Agar countdown hai, to use dikhao, warna 'Processing...' dikhao */}
                    <span>{countdown !== null ? `Generating... (${countdown}s)` : 'Processing...'}</span>
                </>
            ) : (
                children
            )}
        </motion.button>
    );
};

export default Button;