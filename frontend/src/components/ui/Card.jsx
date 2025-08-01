// src/components/ui/Card.jsx
import { motion } from 'framer-motion';

const Card = ({ children, className }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`bg-white rounded-xl shadow-lg p-6 md:p-8 ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default Card;