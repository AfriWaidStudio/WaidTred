import { GraduationCap, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import MiniAppContainer from "@/components/hub/MiniAppContainer";
import { supabase } from "@/integrations/supabase/client";
import { AkademiProgressService } from "@/lib/services";
import { toast } from "sonner";

const WaidesAkademi = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const load = async () => {
    const { data: c } = await supabase.from("courses").select("*").eq("is_active", true);
    setCourses(c ?? []);
    setEnrollments(await AkademiProgressService.myEnrollments());
  };
  useEffect(() => { load(); }, []);

  const enroll = async (id: string) => { try { await AkademiProgressService.enroll(id); toast.success("Enrolled"); load(); } catch (e: any) { toast.error(e.message); } };

  return (
    <MiniAppContainer title="Waides Akademi" subtitle="Financial Literacy">
      <div className="glass-card p-4 mb-4 border-primary/10">
        <p className="text-xs font-semibold mb-1">My Progress</p>
        <p className="text-[10px] text-muted-foreground">{enrollments.length} courses enrolled · {enrollments.filter(e => e.completed_at).length} completed</p>
      </div>
      <h3 className="text-sm font-display font-semibold text-foreground mb-3">Courses</h3>
      <div className="space-y-2.5">
        {courses.map(c => {
          const enr = enrollments.find(e => e.course_id === c.id);
          return (
            <div key={c.id} className="glass-card p-4">
              <div className="flex items-start gap-2 mb-2"><BookOpen className="w-4 h-4 text-primary mt-0.5" /><div><p className="text-xs font-semibold">{c.title}</p><p className="text-[10px] text-muted-foreground">{c.level}</p></div></div>
              {enr ? (
                <div><div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden"><div className="h-full gradient-primary" style={{ width: `${enr.progress_pct}%` }} /></div><p className="text-[10px] mt-1 text-muted-foreground">{enr.progress_pct}% complete</p></div>
              ) : (
                <button onClick={() => enroll(c.id)} className="w-full py-1.5 rounded-lg gradient-primary text-primary-foreground text-[11px] font-semibold">Enroll</button>
              )}
            </div>
          );
        })}
        {!courses.length && <p className="text-xs text-muted-foreground text-center py-8">No courses available yet</p>}
      </div>
    </MiniAppContainer>
  );
};

export default WaidesAkademi;
