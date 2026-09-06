import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, UploadCloud } from 'lucide-react';

const AddProperty = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const stepTitles = [
    "Basic Information",
    "Location",
    "Rental Information",
    "Amenities",
    "Property Images",
    "Review & Publish"
  ];

  return (
    <div className="space-y-6 fade-in pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/landlord/properties" className="p-2 text-text-muted hover:bg-white rounded-lg border border-transparent hover:border-border transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">List a New Property</h1>
          <p className="text-text-muted mt-1">Fill in the details to list your property on SmartLease AI.</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-border -z-10 -translate-y-1/2"></div>
          <div 
            className="absolute left-0 top-1/2 h-0.5 bg-lease-600 -z-10 -translate-y-1/2 transition-all duration-300"
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>
          
          {[...Array(totalSteps)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 bg-white px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step > i + 1 ? 'bg-lease-600 text-white' : 
                step === i + 1 ? 'bg-lease-600 text-white ring-4 ring-lease-100' : 
                'bg-paper text-text-muted border border-border'
              }`}>
                {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${step === i + 1 ? 'text-ink' : 'text-text-muted'}`}>
                {stepTitles[i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl shadow-sm border border-border p-6 sm:p-8 min-h-[400px]">
        <h2 className="text-xl font-semibold text-ink mb-6">{stepTitles[step - 1]}</h2>
        
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Property Name <span className="text-bad-500">*</span></label>
              <input type="text" placeholder="e.g. Sunset Apartments 4B" className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Property Type <span className="text-bad-500">*</span></label>
                <select className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500">
                  <option>Apartment</option>
                  <option>Independent House</option>
                  <option>Villa</option>
                  <option>Studio</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">BHK Configuration <span className="text-bad-500">*</span></label>
                <select className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500">
                  <option>1 RK</option>
                  <option>1 BHK</option>
                  <option>2 BHK</option>
                  <option>3 BHK</option>
                  <option>4+ BHK</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Built-up Area (sq.ft) <span className="text-bad-500">*</span></label>
              <input type="number" placeholder="e.g. 1200" className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Description</label>
              <textarea rows={4} placeholder="Describe the property..." className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500 resize-none"></textarea>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Full Address <span className="text-bad-500">*</span></label>
              <textarea rows={2} placeholder="Building, Street, Area..." className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500 focus:ring-1 focus:ring-lease-500 resize-none"></textarea>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">City <span className="text-bad-500">*</span></label>
                <input type="text" placeholder="e.g. Bangalore" className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">State <span className="text-bad-500">*</span></label>
                <input type="text" placeholder="e.g. Karnataka" className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Pincode <span className="text-bad-500">*</span></label>
                <input type="text" placeholder="e.g. 560034" className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Landmark</label>
                <input type="text" placeholder="e.g. Near Metro Station" className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
            <div className="p-4 bg-lease-50 border border-lease-200 rounded-lg mb-6">
              <p className="text-sm text-lease-800">
                <strong>Important:</strong> The rent specified here is the <strong>Listed Rent</strong> used for display on the platform. The actual contractual rent will be extracted automatically from the uploaded rental agreement during AI analysis.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Listed Monthly Rent (₹) <span className="text-bad-500">*</span></label>
                <input type="number" placeholder="e.g. 45000" className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Security Deposit (₹) <span className="text-bad-500">*</span></label>
                <input type="number" placeholder="e.g. 200000" className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Available From <span className="text-bad-500">*</span></label>
                <input type="date" className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Furnishing Status <span className="text-bad-500">*</span></label>
                <select className="w-full px-4 py-2 bg-paper border border-border rounded-lg focus:outline-none focus:border-lease-500">
                  <option>Fully Furnished</option>
                  <option>Semi Furnished</option>
                  <option>Unfurnished</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <p className="text-sm text-text-muted mb-4">Select all amenities available in the property.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {['Parking', 'Wi-Fi', 'AC', 'Lift', 'Security 24x7', 'Balcony', 'Gym', 'Swimming Pool', 'Power Backup', 'Water Supply'].map((amenity, idx) => (
                <label key={idx} className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-paper transition-colors">
                  <input type="checkbox" className="w-4 h-4 text-lease-600 rounded border-border focus:ring-lease-500" />
                  <span className="text-sm font-medium text-ink">{amenity}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="border-2 border-dashed border-border rounded-xl p-12 text-center bg-paper hover:bg-border/30 transition-colors cursor-pointer">
              <UploadCloud className="w-12 h-12 text-text-faint mx-auto mb-4" />
              <h3 className="text-lg font-medium text-ink">Drag & Drop Images</h3>
              <p className="text-sm text-text-muted mt-1">or click to browse from your computer</p>
              <button className="mt-4 px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium shadow-sm hover:bg-paper transition-colors">
                Select Files
              </button>
            </div>
            <p className="text-xs text-text-muted mt-4 text-center">Supports JPG, PNG up to 5MB each. Minimum 3 images recommended.</p>
          </div>
        )}

        {step === 6 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
            <div className="bg-paper border border-border rounded-xl p-6 text-center">
              <Check className="w-16 h-16 text-good-500 mx-auto mb-4 bg-good-50 rounded-full p-2" />
              <h3 className="text-xl font-bold text-ink">Property Ready to Publish</h3>
              <p className="text-text-muted mt-2 max-w-md mx-auto">
                Your property listing looks great! Review the details before publishing. It will be visible to potential tenants immediately.
              </p>
            </div>
            
            <div className="p-4 border border-border rounded-lg bg-white">
               <h4 className="font-semibold text-ink mb-2">Summary</h4>
               <ul className="text-sm text-text-muted space-y-2">
                 <li><strong className="text-ink">Type:</strong> 2 BHK Apartment, Fully Furnished</li>
                 <li><strong className="text-ink">Listed Rent:</strong> ₹45,000/month</li>
                 <li><strong className="text-ink">Location:</strong> Bangalore, Karnataka</li>
               </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button 
          onClick={prevStep}
          disabled={step === 1}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${step === 1 ? 'opacity-0 cursor-default' : 'bg-paper border border-border text-ink hover:bg-border/50'}`}
        >
          Back
        </button>
        
        {step < totalSteps ? (
          <button 
            onClick={nextStep}
            className="px-6 py-2.5 bg-lease-600 text-white rounded-lg text-sm font-medium hover:bg-lease-700 transition-colors shadow-sm"
          >
            Continue
          </button>
        ) : (
          <div className="flex gap-3">
            <button className="px-6 py-2.5 bg-paper border border-border text-ink rounded-lg text-sm font-medium hover:bg-border/50 transition-colors">
              Save Draft
            </button>
            <Link to="/landlord/properties" className="px-6 py-2.5 bg-lease-600 text-white rounded-lg text-sm font-medium hover:bg-lease-700 transition-colors shadow-sm text-center">
              Publish Property
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};

export default AddProperty;
