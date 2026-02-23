export default function Footer() {
    return (
        <footer className="bg-secondary-900 text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div>
                        <h3 className="text-2xl font-serif mb-4 text-primary-500">Meraki Coffee</h3>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                            Crafting moments of joy through perfectly roasted beans and artisanal brewing techniques.
                            Experience the soul of coffee in every cup.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-lg font-medium mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><a href="/menu" className="hover:text-primary-500 transition-colors">Our Menu</a></li>
                            <li><a href="/review" className="hover:text-primary-500 transition-colors">Customer Reviews</a></li>
                            <li><a href="/contact" className="hover:text-primary-500 transition-colors">Contact Us</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-medium mb-4">Visit Us</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li>123 Coffee Lane, Brew District</li>
                            <li>New York, NY 10001</li>
                            <li className="pt-2 text-primary-500">hello@merakicoffee.com</li>
                            <li>(555) 123-4567</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Meraki Coffee House. All rights reserved.</p>
                    <div className="space-x-4 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
