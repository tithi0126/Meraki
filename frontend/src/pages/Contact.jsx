import { motion } from 'framer-motion';

export default function Contact() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[80vh] flex flex-col items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-8 md:p-12 rounded-2xl shadow-xl w-full max-w-2xl border border-gray-100"
            >
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-secondary-900 mb-2 text-center">Get in <span className="text-primary-500 italic">Touch</span></h1>
                <p className="text-gray-600 text-center mb-8">We would love to hear from you. Drop us a line.</p>

                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" placeholder="Your Name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" placeholder="your@email.com" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea rows="4" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none" placeholder="How can we help you?"></textarea>
                    </div>
                    <button type="button" className="w-full py-4 bg-secondary-900 hover:bg-black text-white rounded-lg font-medium transition-colors shadow-md text-lg mt-4">
                        Send Message
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
