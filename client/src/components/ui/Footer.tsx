import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Logo + Email subscribe */}
          <div className="flex flex-col items-center md:items-start">
            <span className="text-2xl font-black italic text-white mb-4">TicketHub</span>
            <form className="w-full flex flex-col items-center md:items-start">
              <label htmlFor="footer-email" className="sr-only">Subscribe Email</label>
              <div className="flex w-full">
                <input
                  id="footer-email"
                  type="email"
                  placeholder="Your email..."
                  className="rounded-l px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r font-semibold"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>

          {/* Help & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Need help?</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-gray-400 hover:text-white">How to buy tickets?</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white">Where are my tickets?</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white">How to use e-ticket?</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white">Help Center</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Support</h3>
            <div className="mt-4 text-gray-400 text-sm">
              <div>support@ticketmelon.com</div>
              <div>@ticketmelon</div>
              <div>Ticketmelon</div>
            </div>
            <div className="text-gray-400 mt-4 mb-2">+(66) 2 026 3068</div>
            <div className="text-gray-400 text-sm">Monday - Friday, 10.30-18.00 (UTC+7)</div>
          </div>

          {/* For Event Organizers */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Event Organizers</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-gray-400 hover:text-white">Our Solutions</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white">Pricing</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-gray-400 hover:text-white">Terms</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white">Policy</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white">Security</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} TicketHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer 