import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, Upload, CheckCircle, Clock, Camera, FileText, User, Loader2, Mail, Phone, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { KycService } from "@/lib/services";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const steps = ["Personal Info", "ID Document", "Selfie", "Review"];

const KYC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ firstName: "", lastName: "", dob: "", country: "", address: "", idType: "passport", idNumber: "" });
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [existing, setExisting] = useState<any[]>([]);
  const [identity, setIdentity] = useState({ email_verified: false, phone_verified: false, kyc_tier: 0 });
  const [phone, setPhone] = useState(user?.phone || "");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneBusy, setPhoneBusy] = useState(false);

  const refreshIdentity = async () => {
    await supabase.rpc("sync_identity_verification");
    const { data } = await supabase.from("profiles").select("email_verified,phone_verified,kyc_tier,phone").maybeSingle();
    if (data) {
      setIdentity(data);
      if (data.phone) setPhone(data.phone);
    }
  };

  useEffect(() => {
    KycService.listMine().then(({ data }) => setExisting(data));
    void refreshIdentity();
  }, [step]);

  const sendPhoneOtp = async () => {
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) return toast({ title: "Use international format", description: "Example: +233241234567", variant: "destructive" });
    setPhoneBusy(true);
    const { error } = await supabase.auth.updateUser({ phone });
    setPhoneBusy(false);
    if (error) return toast({ title: "Could not send code", description: error.message, variant: "destructive" });
    setOtpSent(true);
    toast({ title: "Verification code sent" });
  };

  const verifyPhoneOtp = async () => {
    if (!/^\d{6}$/.test(otp)) return toast({ title: "Enter the 6-digit code", variant: "destructive" });
    setPhoneBusy(true);
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "phone_change" });
    if (!error) await refreshIdentity();
    setPhoneBusy(false);
    if (error) return toast({ title: "Verification failed", description: error.message, variant: "destructive" });
    toast({ title: "Phone verified", description: "Tier 1 unlocked." });
    setOtpSent(false);
  };

  const submit = async () => {
    if (!idFile || !selfieFile) {
      return toast({ title: "Evidence required", description: "Upload an ID document and a selfie.", variant: "destructive" });
    }
    setSubmitting(true);
    const documentUpload = await KycService.uploadEvidence(idFile, "document");
    if (documentUpload.error || !documentUpload.data) {
      setSubmitting(false);
      return toast({ title: "ID upload failed", description: documentUpload.error?.message, variant: "destructive" });
    }
    const selfieUpload = await KycService.uploadEvidence(selfieFile, "selfie");
    if (selfieUpload.error || !selfieUpload.data) {
      setSubmitting(false);
      return toast({ title: "Selfie upload failed", description: selfieUpload.error?.message, variant: "destructive" });
    }
    const { error } = await KycService.submit({
      document_type: form.idType,
      document_number: form.idNumber,
      full_name: `${form.firstName} ${form.lastName}`.trim(),
      date_of_birth: form.dob || undefined,
      address: form.address,
      country: form.country,
      document_url: documentUpload.data,
      selfie_url: selfieUpload.data,
    });
    setSubmitting(false);
    if (error) return toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    toast({ title: "KYC submitted", description: "Review takes 24–48 hours" });
    setStep(3);
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto p-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>
        <h1 className="font-display text-xl font-bold mb-2">Identity Verification</h1>
        <p className="text-xs text-muted-foreground mb-6">Complete KYC to unlock full features</p>

        <div className="glass-card rounded-2xl p-4 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" />Verification tier</p>
            <span className="text-xs font-bold text-primary">Tier {identity.kyc_tier}</span>
          </div>
          <div className="flex items-center gap-2 text-xs"><Mail className="w-3.5 h-3.5" /><span className="flex-1">Email</span><span className={identity.email_verified ? "text-primary" : "text-accent"}>{identity.email_verified ? "Verified" : "Pending"}</span></div>
          <div className="flex items-center gap-2 text-xs"><Phone className="w-3.5 h-3.5" /><span className="flex-1">Phone</span><span className={identity.phone_verified ? "text-primary" : "text-accent"}>{identity.phone_verified ? "Verified" : "Required"}</span></div>
          {!identity.phone_verified && (
            <div className="flex gap-2 pt-1">
              <input value={otpSent ? otp : phone} onChange={e => otpSent ? setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)) : setPhone(e.target.value.trim())} placeholder={otpSent ? "6-digit code" : "+233241234567"} className="min-w-0 flex-1 px-3 py-2 bg-secondary/50 border border-border rounded-xl text-sm" />
              <button onClick={otpSent ? verifyPhoneOtp : sendPhoneOtp} disabled={phoneBusy} className="px-3 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold disabled:opacity-50">{phoneBusy ? "Please wait" : otpSent ? "Verify" : "Send code"}</button>
            </div>
          )}
        </div>

        {existing.length > 0 && step < 3 && (
          <div className="glass-card rounded-2xl p-4 mb-4">
            <p className="text-xs text-muted-foreground mb-2">Previous submissions</p>
            {existing.map(e => (
              <div key={e.id} className="flex justify-between text-xs py-1">
                <span>{e.document_type} · {new Date(e.created_at).toLocaleDateString()}</span>
                <span className={`px-2 py-0.5 rounded ${e.status === "approved" ? "bg-primary/10 text-primary" : e.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"}`}>{e.status}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= step ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{i + 1}</div>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-5">
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Personal Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="First Name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm" />
                <input placeholder="Last Name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm" />
              </div>
              <input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm" />
              <input placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm" />
              <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm">
                <option value="">Select Country</option>
                <option value="GH">Ghana</option><option value="NG">Nigeria</option><option value="KE">Kenya</option><option value="DE">Germany</option><option value="US">United States</option>
              </select>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> ID Document</h3>
              <select value={form.idType} onChange={e => setForm({ ...form, idType: e.target.value })} className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm">
                <option value="passport">Passport</option><option value="national_id">National ID</option><option value="drivers_license">Driver's License</option><option value="proof_of_address">Proof of Address (Tier 3)</option>
              </select>
              <input placeholder="ID Number" value={form.idNumber} onChange={e => setForm({ ...form, idNumber: e.target.value })} className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm" />
              <label className={`w-full py-10 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 cursor-pointer ${idFile ? "border-primary bg-primary/5" : "border-border"}`}>
                {idFile ? <CheckCircle className="w-8 h-8 text-primary" /> : <Upload className="w-8 h-8 text-muted-foreground" />}
                <span className="text-xs text-muted-foreground">{idFile?.name || "Upload front of ID"}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={e => setIdFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-center">
              <h3 className="font-semibold text-sm flex items-center justify-center gap-2"><Camera className="w-4 h-4 text-primary" /> Take a Selfie</h3>
              <label className={`w-full py-16 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 cursor-pointer ${selfieFile ? "border-primary bg-primary/5" : "border-border"}`}>
                {selfieFile ? <CheckCircle className="w-10 h-10 text-primary" /> : <Camera className="w-10 h-10 text-muted-foreground" />}
                <span className="text-xs text-muted-foreground">{selfieFile?.name || "Capture or upload selfie"}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" capture="user" className="sr-only" onChange={e => setSelfieFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-center py-6">
              <Clock className="w-12 h-12 text-accent mx-auto" />
              <h3 className="font-semibold">Under Review</h3>
              <p className="text-xs text-muted-foreground">Your documents have been submitted. Verification usually takes 24–48 hours.</p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 0 && step < 3 && <button onClick={() => setStep(step - 1)} className="flex-1 py-2.5 rounded-xl border border-border text-sm">Back</button>}
            {step < 2 && <button onClick={() => setStep(step + 1)} className="flex-1 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Continue</button>}
            {step === 2 && (
              <button onClick={submit} disabled={submitting} className="flex-1 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Submit
              </button>
            )}
            {step === 3 && <button onClick={() => navigate("/dashboard")} className="flex-1 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Back to Dashboard</button>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default KYC;
