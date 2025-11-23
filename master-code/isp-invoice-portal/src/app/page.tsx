import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="bg-[#fafbfc] min-h-screen pb-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 bg-white rounded-xl shadow p-8 mt-8">
        {/* Left: Text */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-4">Manage Your Internet Service Bills with Ease</h1>
          <p className="mb-6 text-gray-700 max-w-lg">Access your invoices, download statements, and manage your account all in one place with our secure self-service portal.</p>
          <div className="flex gap-4">
            <Link href="/login?role=customer">
              <button className="bg-blue-600 text-white px-5 py-2 rounded font-semibold shadow hover:bg-blue-700">Customer Login</button>
            </Link>
            <Link href="/login?role=staff">
              <button className="border border-blue-600 text-blue-700 px-5 py-2 rounded font-semibold hover:bg-blue-50">Staff Login</button>
            </Link>
          </div>
        </div>
        {/* Right: Illustration */}
        <div className="flex-1 flex justify-center">
          <div className="bg-blue-600 rounded-xl shadow-lg flex items-center justify-center w-90 h-60">
            {/* Provided illustration */}
            <Image src="/illustration.png" alt="Portal Illustration" width={1000} height={1000} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto mt-16">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Portal Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <Image src="/file.svg" alt="Invoices" width={40} height={40} className="mb-3" />
            <h3 className="font-semibold text-lg mb-2 text-gray-900">View & Download Invoices</h3>
            <p className="text-gray-700 text-center">Access your complete billing history and download PDF invoices for your records anytime.</p>
          </div>
          {/* Feature 2 */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <Image src="/globe.svg" alt="Billing Inquiries" width={40} height={40} className="mb-3" />
            <h3 className="font-semibold text-lg mb-2 text-gray-900">Submit Billing Inquiries</h3>
            <p className="text-gray-700 text-center">Have questions about your bill? Submit a dispute or inquiry directly through the portal.</p>
          </div>
          {/* Feature 3 */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <Image src="/window.svg" alt="Notifications" width={40} height={40} className="mb-3" />
            <h3 className="font-semibold text-lg mb-2 text-gray-900">Receive Notifications</h3>
            <p className="text-gray-700 text-center">Get email alerts when new invoices are available or when there are updates to your account.</p>
          </div>
        </div>
      </section>
    </main>
  );
}