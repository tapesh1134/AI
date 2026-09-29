import React from 'react';
import { 
  User, 
  Cpu, 
  Globe, 
  ShieldCheck, 
  Layers, 
  Server, 
  Code2, 
  Rocket,
  CheckCircle2
} from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-12 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HERO SECTION --- */}
        <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-200 shadow-sm mb-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 mb-6">
              <Rocket size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Version 1.0.0 Launched</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
              The Future of <span className="text-indigo-600">Recruitment</span> <br /> 
              is Distributed.
            </h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-3xl mx-auto">
              JobPortal is a comprehensive microservices-based ecosystem engineered to connect 
              ambitious talent with global opportunities through a high-availability cloud architecture.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          
          {/* --- THE ARCHITECT (Tapesh Sharma) --- */}
          <div className="lg:col-span-1 bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <User size={32} />
              </div>
              <h2 className="text-2xl font-black mb-2">Tapesh Sharma</h2>
              <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest mb-6">Lead Architect & Developer</p>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Tapesh Sharma envisioned and engineered this platform to solve the complexities of modern job marketplaces. 
                By implementing a modular microservices approach, he ensured that JobPortal remains scalable, 
                secure, and developer-friendly.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs font-bold">
                  <CheckCircle2 size={14} className="text-indigo-500" /> Full Stack Engineering
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <CheckCircle2 size={14} className="text-indigo-500" /> Distributed Systems
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <CheckCircle2 size={14} className="text-indigo-500" /> Cloud Orchestration
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-10 -mb-10 blur-2xl" />
          </div>

          {/* --- TECHNICAL CORE --- */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <TechCard 
              icon={<Cpu className="text-indigo-600" />}
              title="Microservices Architecture"
              desc="Built with Spring Cloud, utilizing individual services for Auth, Jobs, Profiles, and Analytics to prevent single-point failures."
            />
            <TechCard 
              icon={<ShieldCheck className="text-emerald-600" />}
              title="Identity & Security"
              desc="Centralized Auth-Service using JWT (JSON Web Tokens) and Spring Security to manage role-based access for Candidates and Recruiters."
            />
            <TechCard 
              icon={<Layers className="text-amber-600" />}
              title="Service Discovery"
              desc="Powered by Netflix Eureka, enabling dynamic service registration and seamless inter-service communication through an API Gateway."
            />
            <TechCard 
              icon={<Server className="text-rose-600" />}
              title="DevOps & Deployment"
              desc="Containerized with Docker and automated via Jenkins CI/CD pipelines to ensure rapid, consistent, and reliable production releases."
            />
          </div>
        </div>

        {/* --- THE STACK SECTION --- */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight uppercase">Platform DNA</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Our technology stack is chosen for performance. From the reactive API Gateway to the independent MySQL databases per service, every component is optimized for the modern web.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
              <StackBadge label="Spring Boot" />
              <StackBadge label="React.js" />
              <StackBadge label="MySQL" />
              <StackBadge label="Docker" />
              <StackBadge label="Eureka" />
              <StackBadge label="Jenkins" />
              <StackBadge label="Tailwind" />
              <StackBadge label="Redux" />
            </div>
          </div>
        </div>

        {/* --- FOOTER CREDIT --- */}
        <div className="mt-12 text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">
                Project Engineered by Tapesh Sharma © 2026
            </p>
        </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const TechCard = ({ icon, title, desc }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
      {icon}
    </div>
    <h3 className="text-lg font-black text-slate-900 mb-3">{title}</h3>
    <p className="text-sm text-slate-500 font-medium leading-relaxed">
      {desc}
    </p>
  </div>
);

const StackBadge = ({ label }) => (
  <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{label}</span>
  </div>
);

export default AboutUs;