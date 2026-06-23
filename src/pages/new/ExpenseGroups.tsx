import { useEffect, useState } from "react";
import { Users, Plus } from "lucide-react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { ExpenseGroupsService } from "@/lib/services";
import { toast } from "sonner";

const ExpenseGroups = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  const load = () => ExpenseGroupsService.myGroups().then(setGroups);
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!active) return;
    ExpenseGroupsService.entries(active).then(setEntries);
    ExpenseGroupsService.members(active).then(setMembers);
  }, [active]);

  const create = async () => {
    const name = prompt("Group name?"); if (!name) return;
    try { const g = await ExpenseGroupsService.create(name); toast.success("Created"); load(); if (g) setActive(g.id); }
    catch (e: any) { toast.error(e.message); }
  };
  const addMember = async () => {
    if (!active) return;
    const uid = prompt("User id to add?"); if (!uid) return;
    try { await ExpenseGroupsService.addMember(active, uid); toast.success("Added"); ExpenseGroupsService.members(active).then(setMembers); }
    catch (e: any) { toast.error(e.message); }
  };
  const addEntry = async () => {
    if (!active) return;
    const desc = prompt("Description?"); if (!desc) return;
    const amt = Number(prompt("Amount?", "10") || 0); if (!amt) return;
    const ids = members.map(m => m.user_id);
    try { await ExpenseGroupsService.addEntry(active, amt, desc, ids); toast.success("Added"); ExpenseGroupsService.entries(active).then(setEntries); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <WealthPageShell title="Expense Groups" subtitle="Shared ledger for households & trips" Icon={Users}>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-2">
          <button onClick={create} className="w-full px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-xs flex items-center justify-center gap-1.5"><Plus className="w-3.5 h-3.5"/> New group</button>
          {groups.map(g => (
            <button key={g.id} onClick={()=>setActive(g.id)} className={`glass-card p-3 w-full text-left ${active===g.id?"border-primary/40":""}`}>
              <p className="text-sm text-foreground">{g.name}</p>
            </button>
          ))}
          {!groups.length && <p className="text-xs text-muted-foreground text-center py-4">No groups yet</p>}
        </div>
        <div className="lg:col-span-2">
          {!active ? <p className="text-xs text-muted-foreground text-center py-6">Select or create a group</p> : (
            <>
              <div className="flex gap-2 mb-3">
                <button onClick={addMember} className="px-3 py-1.5 rounded-lg bg-secondary text-xs text-foreground">+ member</button>
                <button onClick={addEntry} className="px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground text-xs">+ entry</button>
                <span className="text-[11px] text-muted-foreground self-center">{members.length} member(s)</span>
              </div>
              <div className="space-y-2">
                {entries.map(e => (
                  <div key={e.id} className="glass-card p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">{e.description}</p>
                      <p className="text-[10px] text-muted-foreground">Split {e.split_among.length} ways · {new Date(e.created_at).toLocaleDateString()}</p>
                    </div>
                    <p className="text-sm font-bold text-primary">◈{Number(e.amount)}</p>
                  </div>
                ))}
                {!entries.length && <p className="text-xs text-muted-foreground text-center py-6">No entries</p>}
              </div>
            </>
          )}
        </div>
      </div>
    </WealthPageShell>
  );
};
export default ExpenseGroups;
