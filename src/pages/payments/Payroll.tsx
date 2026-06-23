import { useEffect, useState } from "react";
import { Building2, Plus, Users } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { PayrollService } from "@/lib/services";
import { toast } from "sonner";

const Payroll = () => {
  const [emps, setEmps] = useState<any[]>([]);
  const [name, setName] = useState(""); const [role, setRole] = useState(""); const [salary, setSalary] = useState("");
  const load = () => PayrollService.employees().then(setEmps);
  useEffect(() => { load(); }, []);
  const add = async () => {
    if (!name || !salary) return;
    try { await PayrollService.addEmployee({ employee_name: name, role, salary: Number(salary) }); toast.success("Added"); setName(""); setRole(""); setSalary(""); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  const run = async () => {
    try { await PayrollService.run(new Date().toISOString().slice(0,7)); toast.success("Payroll executed"); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  const total = emps.reduce((a,e)=>a+Number(e.salary),0);
  return (
    <WealthPageShell title="Payroll" subtitle="Bulk salary disbursement" Icon={Building2} back="/dashboard">
      <div className="glass-card p-5 mb-4 border-primary/10">
        <p className="text-xs text-muted-foreground">Pending payroll</p>
        <p className="text-2xl font-bold font-display">ꠄ {total.toLocaleString()}</p>
        <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1"><Users className="w-3 h-3"/>{emps.length} employees</p>
      </div>
      <div className="glass-card p-4 mb-4 space-y-2">
        <p className="text-sm font-semibold flex items-center gap-2"><Plus className="w-4 h-4"/>Add employee</p>
        <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
        <input placeholder="Role" value={role} onChange={e=>setRole(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
        <input type="number" placeholder="Salary" value={salary} onChange={e=>setSalary(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-sm"/>
        <button onClick={add} className="w-full py-2 rounded-lg bg-secondary/60 text-sm">Add</button>
      </div>
      <div className="space-y-1 mb-4">
        {emps.map(e => (
          <div key={e.id} className="flex justify-between px-3 py-2 rounded-lg bg-secondary/40">
            <div><p className="text-sm font-semibold">{e.employee_name}</p><p className="text-[10px] text-muted-foreground">{e.role}</p></div>
            <p className="text-sm font-bold text-primary">ꠄ{Number(e.salary)}</p>
          </div>
        ))}
      </div>
      {emps.length>0 && <button onClick={run} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm">Run Payroll</button>}
    </WealthPageShell>
  );
};
export default Payroll;
