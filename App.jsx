import React, { useState, useEffect } from 'react';

// IMPORTANT: Replace this with your deployed Google Apps Script Web App URL
const API_URL = 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL';

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ isOpen: false, job: null });
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle | loading | success | error

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      // Filter only Open jobs directly on the client
      const openJobs = data.filter(job => job.Status === 'Open');
      setJobs(openJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (job) => {
    setModalState({ isOpen: true, job });
    setSubmitStatus('idle');
    setFormData({ name: '', phone: '' });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, job: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('loading');

    const payload = {
      name: formData.name,
      phone: formData.phone,
      jobId: modalState.job.ID,
      jobTitle: modalState.job['Job Title']
    };

    try {
      // Using text/plain avoids the CORS preflight check on Google Apps Script
      await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload)
      });
      setSubmitStatus('success');
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmitStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#FF0000] selection:text-white">
      {/* Header */}
      <header className="border-b-4 border-black py-8 px-4 md:px-8 mb-12">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
            Clip<span className="text-[#FF0000]">Reach</span> Careers
          </h1>
          <span className="hidden sm:inline-block bg-black text-white font-bold px-4 py-2 uppercase text-sm">
            Hiring Now
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 pb-20">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-8 border-b-8 border-black"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center text-2xl font-bold">No open positions at the moment.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {jobs.map((job, index) => (
              <div key={index} className="border-4 border-black p-6 md:p-8 flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-3xl font-black uppercase leading-none max-w-[70%]">{job['Job Title']}</h2>
                    <span className="bg-[#FF0000] text-white font-bold text-sm px-3 py-1 uppercase whitespace-nowrap">
                      🔥 Only {job.Vacancies} left!
                    </span>
                  </div>
                  
                  <p className="text-lg font-bold text-gray-800 uppercase mb-2 border-b-2 border-black pb-2 inline-block">
                    📍 {job.Location}
                  </p>
                  
                  <div className="my-6">
                    <p className="font-bold uppercase text-xs text-gray-500 mb-1">Compensation</p>
                    <p className="text-4xl font-black text-[#FF0000] tracking-tighter">{job.Salary}</p>
                    {job.Perks && <p className="font-bold mt-1 text-sm">{job.Perks}</p>}
                  </div>

                  <div className="mb-8">
                    <p className="font-black uppercase text-sm border-b-2 border-black pb-1 mb-3">Requirements</p>
                    <ul className="list-disc pl-5 space-y-1 font-bold text-gray-800">
                      {job.Requirements.split('|').map((req, i) => (
                        <li key={i}>{req.trim()}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button 
                  onClick={() => handleApplyClick(job)}
                  className="w-full bg-black text-white font-black text-2xl uppercase py-4 border-2 border-black hover:bg-[#FF0000] hover:border-[#FF0000] transition-colors"
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Application Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white border-4 border-black p-8 md:p-12 w-full max-w-lg shadow-[12px_12px_0px_0px_rgba(255,0,0,1)] relative">
            
            <button onClick={closeModal} className="absolute top-4 right-4 text-3xl font-black hover:text-[#FF0000]">
              &times;
            </button>

            {submitStatus === 'idle' || submitStatus === 'loading' ? (
              <>
                <h3 className="text-3xl font-black uppercase mb-2 text-black leading-tight">
                  Apply for {modalState.job['Job Title']}
                </h3>
                <p className="font-bold text-gray-600 mb-8 border-b-2 border-black pb-4">
                  Enter your details below to secure your spot.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block font-black uppercase text-sm mb-2">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full border-4 border-black p-4 font-bold text-lg focus:outline-none focus:border-[#FF0000] transition-colors"
                      placeholder="JOHN DOE"
                    />
                  </div>
                  <div>
                    <label className="block font-black uppercase text-sm mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full border-4 border-black p-4 font-bold text-lg focus:outline-none focus:border-[#FF0000] transition-colors"
                      placeholder="+91 00000 00000"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitStatus === 'loading'}
                    className="w-full bg-[#FF0000] text-white font-black text-2xl uppercase py-5 border-4 border-black hover:bg-red-700 transition-colors disabled:opacity-70 flex justify-center items-center"
                  >
                    {submitStatus === 'loading' ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-white"></div>
                    ) : 'Submit Application'}
                  </button>
                </form>
              </>
            ) : submitStatus === 'success' ? (
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-black text-[#FF0000] rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-[#FF0000]">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-4xl font-black uppercase mb-4 text-black">Application Received!</h3>
                <p className="text-xl font-bold text-[#FF0000] uppercase mb-8">Step 2: Call us now to confirm.</p>
                
                <a 
                  href="tel:+916002413305" 
                  className="block w-full bg-[#FF0000] text-white text-center font-black text-4xl py-6 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all mb-4"
                >
                  CALL NOW
                </a>
                <p className="font-bold text-gray-500 uppercase">Please call between 10 AM and 5 PM.</p>
              </div>
            ) : (
              <div className="text-center py-10">
                <h3 className="text-3xl font-black uppercase mb-4 text-[#FF0000]">Error!</h3>
                <p className="font-bold mb-6">Something went wrong. Please try again.</p>
                <button onClick={() => setSubmitStatus('idle')} className="bg-black text-white font-bold px-6 py-3 uppercase">Try Again</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
