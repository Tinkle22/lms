/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md fixed w-full z-50 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="https://placehold.co/400x400/2563eb/FFFFFF?text=S"
              alt="SchoolMS Logo"
              width={40}
              height={40}
              className="mr-2 rounded-lg"
            />
            <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              SchoolMS
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <Link 
              href="/login" 
              className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              Login
            </Link>
            <Link
              href="/register/school"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
            >
              Register School
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 bg-gradient-to-b from-blue-50 via-white to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-left space-y-8">
                <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight">
                  Transform Your
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    School Management
                  </span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl">
                  Streamline your administrative tasks, enhance student learning experience, and build stronger educational communities with our comprehensive management system.
                </p>
                <div className="flex gap-4 pt-4">
                  <Link
                    href="/register/school"
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="#features"
                    className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-full text-lg font-semibold hover:bg-blue-50 transition-all duration-300"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              <div className="relative h-[600px] hidden lg:block">
                <Image
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
                  alt="School Management System"
                  fill
                  className="object-contain"
                  priority
                />
                <div className="absolute -z-10 top-1/2 right-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
              <p className="text-xl text-gray-600">Everything you need to manage your school effectively</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-gradient-to-b from-blue-50 to-white border border-blue-100 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <Image 
                    src="https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" 
                    alt="Student Management" 
                    width={28} 
                    height={28} 
                    className="text-white rounded-lg" 
                  />
                </div>
                <h3 className="text-xl font-semibold mb-3">Student Management</h3>
                <p className="text-gray-600">
                  Comprehensive student profiles, attendance tracking, and progress monitoring in one place.
                </p>
              </div>
              <div className="p-8 rounded-2xl bg-gradient-to-b from-indigo-50 to-white border border-indigo-100 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center mb-6">
                  <Image 
                    src="https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" 
                    alt="Academic Records" 
                    width={28} 
                    height={28}
                    className="rounded-lg"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-3">Academic Records</h3>
                <p className="text-gray-600">
                  Effortlessly manage grades, generate reports, and track academic performance.
                </p>
              </div>
              <div className="p-8 rounded-2xl bg-gradient-to-b from-purple-50 to-white border border-purple-100 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <Image 
                    src="https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" 
                    alt="User Roles" 
                    width={28} 
                    height={28}
                    className="rounded-lg"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-3">Smart Access Control</h3>
                <p className="text-gray-600">
                  Role-based access ensuring secure and appropriate system usage for all users.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-gradient-to-b from-white to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-16">Why Schools Choose Us</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Image 
                      src="https://images.unsplash.com/photo-1633613286991-611fe299c4be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" 
                      alt="Check" 
                      width={24} 
                      height={24}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Efficient Management</h3>
                    <p className="text-gray-600">Streamline administrative tasks and save valuable time with our automated systems.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Image 
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" 
                      alt="Reports" 
                      width={24} 
                      height={24}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Comprehensive Reports</h3>
                    <p className="text-gray-600">Generate detailed insights and analytics to make informed decisions.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Image 
                      src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" 
                      alt="Security" 
                      width={24} 
                      height={24}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Enhanced Security</h3>
                    <p className="text-gray-600">Keep your school's data safe with our advanced security measures.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Image 
                      src="https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" 
                      alt="Support" 
                      width={24} 
                      height={24}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                    <p className="text-gray-600">Get help whenever you need it with our dedicated support team.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">SchoolMS</h3>
              <p className="text-gray-400">Transforming education management for the digital age.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="#testimonials" className="hover:text-white">Testimonials</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2024 SchoolMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
