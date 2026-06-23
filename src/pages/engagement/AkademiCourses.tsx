import { GraduationCap, PlayCircle, Award } from "lucide-react";
import { useEffect, useState } from "react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { CourseService } from "@/lib/services";
import { toast } from "sonner";

const AkademiCourses = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const load = () => CourseService.list().then(setCourses);
  useEffect(() => { load(); }, []);

  const enroll = async (id: string) => {
    try { await CourseService.enroll(id); toast.success("Enrolled"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <WealthPageShell title="Akademi Courses" subtitle="Learn. Earn. Get certified." Icon={GraduationCap} back="/dashboard/hub/akademi">
      <div className="space-y-3">
        {courses.map(c => {
          const enrolled = c.enrolled?.[0];
          const pct = enrolled?.progress_pct || 0;
          return (
            <div key={c.id} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-1">
                {enrolled?.completed_at ? <Award className="w-4 h-4 text-primary" /> : <PlayCircle className="w-4 h-4 text-accent" />}
                <p className="text-sm font-semibold flex-1">{c.title}</p>
                <span className="text-[10px] text-muted-foreground">{c.lessons?.[0]?.count || 0} lessons</span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2">{c.description}</p>
              {enrolled ? (
                <>
                  <div className="w-full h-1 bg-secondary rounded-full overflow-hidden mb-1"><div className="h-full gradient-primary" style={{ width: `${pct}%` }} /></div>
                  <p className="text-[10px] text-primary">{pct}% complete</p>
                </>
              ) : (
                <button onClick={() => enroll(c.id)} className="text-[11px] px-3 py-1 rounded-lg gradient-primary text-primary-foreground">Enroll</button>
              )}
            </div>
          );
        })}
        {courses.length === 0 && <p className="text-center text-xs text-muted-foreground py-8">No courses yet</p>}
      </div>
    </WealthPageShell>
  );
};
export default AkademiCourses;
