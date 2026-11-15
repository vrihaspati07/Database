import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EnterpriseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnterpriseModal: React.FC<EnterpriseModalProps> = ({
  isOpen,
  onClose
}) => {
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [clusterSize, setClusterSize] = useState('100GB Dedicated Cluster (8 vCPU, 32GB RAM)');
  const [region, setRegion] = useState('Mumbai (Primary DC-01 - ap-south-1 Sovereign)');
  const [requirements, setRequirements] = useState<string[]>([
    'DPDP Act 2026 Sovereign Audit Report',
    'Custom pgvector & AI GPU Acceleration'
  ]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState('');

  if (!isOpen) return null;

  const toggleReq = (req: string) => {
    setRequirements((prev) =>
      prev.includes(req) ? prev.filter((r) => r !== req) : [...prev, req]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      const generatedRef = 'HIND_ENT_' + Math.floor(100000 + Math.random() * 900000);
      setRefId(generatedRef);

      confetti({
        particleCount: 90,
        spread: 80,
        origin: { x: 0.75, y: 0.5 },
        colors: ['#0F172A', '#8B5CF6', '#3B82F6', '#1E3A8A']
      });
    }, 900);
  };

  const handleClose = () => {
    setSubmitted(false);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl rounded-3xl bg-white border border-[#E2E8F0] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-[#0F172A]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-[#F1F5F9] bg-gradient-to-r from-slate-50 via-white to-purple-50/40 relative">
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/80 hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-900 text-xs font-bold w-fit mb-3 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
            <span>ENTERPRISE SOVEREIGN VPC • 99.99% SLA</span>
          </div>

          <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Dedicated Enterprise Architecture
          </h3>
          <p className="text-sm text-[#475569] mt-1">
            Custom high-throughput clusters, dedicated VPC peering, DPDP Act compliance audit, and 24/7 on-call engineers.
          </p>
        </div>

        {/* Modal Body */}
        {submitted ? (
          /* Submission Success State */
          <div className="p-8 sm:p-10 text-center space-y-5 overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-purple-50 border-2 border-purple-300 text-purple-700 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold font-mono">
                REQUEST LOGGED SUCCESSFULLY
              </span>
              <h4 className="text-2xl font-black text-[#0F172A] mt-2">
                Thank You, {fullName || 'Valued Partner'}!
              </h4>
              <p className="text-sm text-[#475569] mt-1 max-w-md mx-auto">
                Your Enterprise Sovereign Deployment inquiry has been assigned to our Lead Solutions Architect.
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Case Reference:</span>
                <span className="font-mono font-bold text-[#0F172A]">{refId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Organization:</span>
                <span className="font-semibold text-[#0F172A]">{companyName || 'Enterprise Customer'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Target Cluster:</span>
                <span className="text-[#1E3A8A] font-semibold">{clusterSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Sovereign Region:</span>
                <span className="text-emerald-700 font-medium">{region}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Response SLA:</span>
                <span className="text-purple-700 font-bold">Within 2 Hours (IST Business Hours)</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#1E3A8A] hover:bg-[#172554] text-white text-xs font-bold shadow-md shadow-blue-900/10 cursor-pointer"
              >
                Back to Pricing
              </button>
            </div>
          </div>
        ) : (
          /* Enterprise Inquiry Form */
          <form onSubmit={handleSubmit} className="p-6 sm:p-7 overflow-y-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] bg-white outline-none focus:border-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Work Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={workEmail}
                  onChange={(e) => setWorkEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] bg-white outline-none focus:border-[#1E3A8A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Company / Organization <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BharatFin Technologies"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] bg-white outline-none focus:border-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Phone / WhatsApp (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] bg-white outline-none focus:border-[#1E3A8A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Dedicated Cluster Sizing
                </label>
                <select
                  value={clusterSize}
                  onChange={(e) => setClusterSize(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] bg-white outline-none focus:border-[#1E3A8A]"
                >
                  <option value="100GB Dedicated Cluster (8 vCPU, 32GB RAM)">100GB Dedicated Cluster (8 vCPU, 32GB RAM)</option>
                  <option value="500GB High-Performance VPC (16 vCPU, 64GB RAM)">500GB High-Performance VPC (16 vCPU, 64GB RAM)</option>
                  <option value="1TB+ Clustered Multi-Region (32 vCPU, 128GB RAM)">1TB+ Clustered Multi-Region (32 vCPU, 128GB RAM)</option>
                  <option value="Custom Petabyte / Multi-Tenant Cloud">Custom Petabyte / Multi-Tenant Cloud</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Indian Sovereign Region
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] bg-white outline-none focus:border-[#1E3A8A]"
                >
                  <option value="Mumbai (Primary DC-01 - ap-south-1 Sovereign)">Mumbai (Primary DC-01 - ap-south-1)</option>
                  <option value="Delhi NCR (Secondary DC-02 - ap-north-1)">Delhi NCR (Secondary DC-02 - ap-north-1)</option>
                  <option value="Bengaluru (Tech Core DC-03 - ap-south-2)">Bengaluru (Tech Core DC-03 - ap-south-2)</option>
                  <option value="Hyderabad (Disaster Recovery DC-04)">Hyderabad (Disaster Recovery DC-04)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-2">
                Special Requirements & Compliance:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  'DPDP Act 2026 Sovereign Audit Report',
                  'Custom pgvector & AI GPU Acceleration',
                  'Dedicated BAA & Custom Enterprise MSA',
                  '24/7 Phone, WhatsApp & Dedicated Slack Channel'
                ].map((req) => (
                  <label key={req} className="flex items-center gap-2 p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={requirements.includes(req)}
                      onChange={() => toggleReq(req)}
                      className="rounded text-[#1E3A8A] focus:ring-[#1E3A8A]"
                    />
                    <span className="text-[11px] font-medium text-[#334155]">{req}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Architecture Notes / Custom Questions
              </label>
              <textarea
                rows={2}
                placeholder="Mention current database, queries/sec, migration timelines or security needs..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white outline-none focus:border-[#1E3A8A] resize-none"
              />
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#F1F5F9]">
              <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span>2-Hour Response Guaranteed • NDAs Available</span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-1/2 sm:w-auto px-4 py-2.5 rounded-full border border-[#CBD5E1] text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 sm:w-auto px-6 py-2.5 rounded-full bg-[#1E3A8A] hover:bg-[#172554] text-white text-xs font-bold shadow-md shadow-blue-900/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Request Enterprise Architecture</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
