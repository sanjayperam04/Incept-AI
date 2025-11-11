import { ArrowRight, Zap, BarChart3, Users, Clock, CheckCircle, Sparkles } from 'lucide-react'

export default function LandingPage({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 animate-fade-in">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">Incept AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">How it Works</a>
              <button 
                onClick={onGetStarted}
                className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all hover:scale-105"
              >
                Try Now
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Viewport */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2 mb-6 animate-slide-up">
              <Zap className="w-4 h-4 text-gray-700" />
              <span className="text-sm text-gray-700">AI-Powered Project Planning</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-slide-up-delay-1">
              Transform Ideas into
              <span className="block mt-2">Actionable Plans</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed animate-slide-up-delay-2">
              Incept AI converts your project descriptions into detailed timelines with tasks, 
              dependencies, and resource allocation in seconds.
            </p>
            <div className="animate-slide-up-delay-3">
              <button 
                onClick={onGetStarted}
                className="px-8 py-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl mx-auto hover:scale-105"
              >
                Try It Out Now
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Full Viewport */}
      <section id="features" className="min-h-screen flex items-center justify-center py-24 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need to plan</h2>
            <p className="text-xl text-gray-600">Powerful features to streamline your project management</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Natural Language to Project Plan</h3>
              <p className="text-gray-600">
                Converts plain English descriptions into structured project plans with tasks, dependencies, and timelines.
              </p>
            </div>

            <div className="p-8 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Dynamic Replanning</h3>
              <p className="text-gray-600">
                Modify existing plans using natural language without recreating from scratch.
              </p>
            </div>

            <div className="p-8 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Visual Feedback</h3>
              <p className="text-gray-600">
                Green ring pulse and update badge showing exactly what changed in your plan.
              </p>
            </div>

            <div className="p-8 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Dependency Detection</h3>
              <p className="text-gray-600">
                Automatically infers logical task dependencies like Design → Development → Testing.
              </p>
            </div>

            <div className="p-8 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Resource Allocation</h3>
              <p className="text-gray-600">
                Automatically assigns appropriate roles based on task type and project needs.
              </p>
            </div>

            <div className="p-8 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Conversational Modifications</h3>
              <p className="text-gray-600">
                Shows detailed change summaries with emojis indicating duration increases and decreases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - Full Viewport */}
      <section id="how-it-works" className="min-h-screen flex items-center justify-center py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-xl text-gray-600">Three simple steps to your perfect project plan</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Describe Your Project</h3>
              <p className="text-gray-600">
                Tell us about your project goals, timeline, and key requirements in plain English.
              </p>
            </div>

            <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Generates Plan</h3>
              <p className="text-gray-600">
                Our AI analyzes your input and creates a structured plan with tasks and timelines.
              </p>
            </div>

            <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Review & Export</h3>
              <p className="text-gray-600">
                View your Gantt chart, adjust as needed, and export to your favorite tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Full Viewport */}
      <section className="min-h-screen flex items-center justify-center py-24 px-6 bg-gray-50">
        <div className="container mx-auto max-w-4xl text-center animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to streamline your planning?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join thousands of teams using Incept AI to plan better and faster.
          </p>
          <button 
            onClick={onGetStarted}
            className="px-10 py-5 bg-black text-white text-lg font-medium rounded-lg hover:bg-gray-800 transition-all flex items-center gap-3 mx-auto shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Try Incept AI Now
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-center items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">Incept AI</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }

        .animate-slide-up-delay-1 {
          animation: slide-up 0.6s ease-out 0.1s both;
        }

        .animate-slide-up-delay-2 {
          animation: slide-up 0.6s ease-out 0.2s both;
        }

        .animate-slide-up-delay-3 {
          animation: slide-up 0.6s ease-out 0.3s both;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out both;
        }
      `}</style>
    </div>
  )
}
