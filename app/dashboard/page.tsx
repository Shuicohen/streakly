"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Flame, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  Calendar 
} from "lucide-react";
import { format, subDays, isToday } from "date-fns";
import { toast } from "sonner";
import type { Habit, HabitCompletion } from "@/types";

interface HabitWithCompletions extends Habit {
  completions: HabitCompletion[];
  currentStreak: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [habits, setHabits] = useState<HabitWithCompletions[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitDesc, setNewHabitDesc] = useState("");
  const [newHabitColor, setNewHabitColor] = useState("#3b82f6");
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const router = useRouter();
  const supabase = createClient();

  // Calculate current streak for a habit
  const calculateStreak = (completions: HabitCompletion[]): number => {
    if (!completions.length) return 0;

    const sorted = [...completions].sort((a, b) => 
      new Date(b.completed_on).getTime() - new Date(a.completed_on).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const hasCompletion = sorted.some(c => c.completed_on === dateStr);

      if (hasCompletion) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        // If today is not completed, streak is 0 or from yesterday
        if (i === 0) {
          // Check yesterday
          const yesterdayStr = format(subDays(currentDate, 1), "yyyy-MM-dd");
          const hasYesterday = sorted.some(c => c.completed_on === yesterdayStr);
          if (hasYesterday) {
            streak = 1;
            currentDate = subDays(currentDate, 2);
            continue;
          }
        }
        break;
      }
    }
    return streak;
  };

  // Get last 7 days completion status
  const getLast7Days = (completions: HabitCompletion[]) => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "yyyy-MM-dd");
      const completed = completions.some(c => c.completed_on === dateStr);
      days.push({ date: dateStr, completed, label: format(date, "EEE") });
    }
    return days;
  };

  // Fetch habits and completions
  const fetchHabits = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      // Fetch habits
      const { data: habitsData, error: habitsError } = await supabase
        .from("habits")
        .select("*")
        .order("created_at", { ascending: false });

      if (habitsError) throw habitsError;

      // Fetch all completions for these habits (last 90 days for performance)
      const habitIds = habitsData?.map(h => h.id) || [];
      let completionsData: HabitCompletion[] = [];

      if (habitIds.length > 0) {
        const ninetyDaysAgo = format(subDays(new Date(), 90), "yyyy-MM-dd");
        const { data: comps, error: compError } = await supabase
          .from("habit_completions")
          .select("*")
          .in("habit_id", habitIds)
          .gte("completed_on", ninetyDaysAgo);

        if (compError) throw compError;
        completionsData = comps || [];
      }

      // Merge
      const habitsWithData: HabitWithCompletions[] = (habitsData || []).map(habit => {
        const habitCompletions = completionsData.filter(c => c.habit_id === habit.id);
        return {
          ...habit,
          completions: habitCompletions,
          currentStreak: calculateStreak(habitCompletions),
        };
      });

      setHabits(habitsWithData);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to load habits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  // Toggle completion for today
  const toggleCompletion = async (habit: HabitWithCompletions) => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const existing = habit.completions.find(c => c.completed_on === todayStr);

    try {
      if (existing) {
        // Remove completion
        const { error } = await supabase
          .from("habit_completions")
          .delete()
          .eq("id", existing.id);

        if (error) throw error;

        // Optimistic update
        setHabits(prev =>
          prev.map(h =>
            h.id === habit.id
              ? {
                  ...h,
                  completions: h.completions.filter(c => c.id !== existing.id),
                  currentStreak: calculateStreak(h.completions.filter(c => c.id !== existing.id)),
                }
              : h
          )
        );
        toast.info(`Unchecked "${habit.name}"`);
      } else {
        // Add completion
        const { data: newCompletion, error } = await supabase
          .from("habit_completions")
          .insert({
            habit_id: habit.id,
            user_id: user.id,
            completed_on: todayStr,
          })
          .select()
          .single();

        if (error) throw error;

        const updatedCompletions = [...habit.completions, newCompletion];
        setHabits(prev =>
          prev.map(h =>
            h.id === habit.id
              ? {
                  ...h,
                  completions: updatedCompletions,
                  currentStreak: calculateStreak(updatedCompletions),
                }
              : h
          )
        );
        toast.success(`Great job on "${habit.name}"!`, {
          description: `You're on a ${calculateStreak(updatedCompletions)}-day streak`,
        });
      }
    } catch (error: any) {
      toast.error("Failed to update habit");
      // Refetch on error
      fetchHabits();
    }
  };

  // Add new habit
  const addHabit = async () => {
    if (!newHabitName.trim()) {
      toast.error("Habit name is required");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("habits")
        .insert({
          user_id: user.id,
          name: newHabitName.trim(),
          description: newHabitDesc.trim() || null,
          color: newHabitColor,
        })
        .select()
        .single();

      if (error) throw error;

      const newHabitWithData: HabitWithCompletions = {
        ...data,
        completions: [],
        currentStreak: 0,
      };

      setHabits(prev => [newHabitWithData, ...prev]);
      setIsAddOpen(false);
      setNewHabitName("");
      setNewHabitDesc("");
      setNewHabitColor("#3b82f6");

      toast.success("Habit created!", {
        description: "Start tracking it today.",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create habit");
    }
  };

  // Delete habit
  const deleteHabit = async (habitId: string) => {
    if (!confirm("Delete this habit permanently?")) return;

    try {
      const { error } = await supabase.from("habits").delete().eq("id", habitId);
      if (error) throw error;

      setHabits(prev => prev.filter(h => h.id !== habitId));
      toast.success("Habit deleted");
    } catch (error) {
      toast.error("Failed to delete habit");
    }
  };

  // Start editing
  const startEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setEditName(habit.name);
    setEditDesc(habit.description || "");
  };

  // Save edit
  const saveEdit = async () => {
    if (!editingHabit || !editName.trim()) return;

    try {
      const { error } = await supabase
        .from("habits")
        .update({
          name: editName.trim(),
          description: editDesc.trim() || null,
        })
        .eq("id", editingHabit.id);

      if (error) throw error;

      setHabits(prev =>
        prev.map(h =>
          h.id === editingHabit.id
            ? { ...h, name: editName.trim(), description: editDesc.trim() || null }
            : h
        )
      );

      setEditingHabit(null);
      toast.success("Habit updated");
    } catch (error) {
      toast.error("Failed to update habit");
    }
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  // Today's habits (all for simplicity, or filter)
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todaysHabits = habits; // All habits shown for today

  // Stats
  const totalHabits = habits.length;
  const completedToday = habits.filter(h => 
    h.completions.some(c => c.completed_on === todayStr)
  ).length;
  const avgStreak = habits.length > 0 
    ? Math.round(habits.reduce((sum, h) => sum + h.currentStreak, 0) / habits.length) 
    : 0;
  const longestStreak = habits.length > 0 
    ? Math.max(...habits.map(h => h.currentStreak)) 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading your habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <Flame className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-xl tracking-tight">Streakly</span>
            </Link>
            <div className="ml-3 text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">DASHBOARD</div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              {user?.email}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Good morning{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(" ")[0]}` : ""}.</h1>
            <p className="text-muted-foreground mt-1">Let's keep those streaks alive today.</p>
          </div>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 h-11 px-5 shadow-sm">
                <Plus className="w-4 h-4" /> New Habit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new habit</DialogTitle>
                <DialogDescription>Start tracking something meaningful.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="habit-name">Habit name</Label>
                  <Input 
                    id="habit-name" 
                    value={newHabitName} 
                    onChange={(e) => setNewHabitName(e.target.value)} 
                    placeholder="e.g. Morning walk" 
                    className="mt-1.5" 
                  />
                </div>
                <div>
                  <Label htmlFor="habit-desc">Description (optional)</Label>
                  <Input 
                    id="habit-desc" 
                    value={newHabitDesc} 
                    onChange={(e) => setNewHabitDesc(e.target.value)} 
                    placeholder="Why this habit matters to you" 
                    className="mt-1.5" 
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="flex gap-2 mt-2">
                    {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"].map(color => (
                      <button
                        key={color}
                        onClick={() => setNewHabitColor(color)}
                        className={`w-9 h-9 rounded-full border-2 transition-all ${newHabitColor === color ? 'border-foreground scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={addHabit}>Create Habit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Habits</p>
                  <p className="text-4xl font-semibold tabular-nums tracking-tighter mt-1">{totalHabits}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-2xl"><Calendar className="w-6 h-6 text-primary" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                  <p className="text-4xl font-semibold tabular-nums tracking-tighter mt-1">{completedToday}<span className="text-2xl text-muted-foreground">/{totalHabits}</span></p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-2xl"><CheckCircle2 className="w-6 h-6 text-emerald-600" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Streak</p>
                  <p className="text-4xl font-semibold tabular-nums tracking-tighter mt-1">{avgStreak}</p>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-2xl"><Flame className="w-6 h-6 text-orange-600" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Longest Streak</p>
                  <p className="text-4xl font-semibold tabular-nums tracking-tighter mt-1">{longestStreak}</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-2xl"><Flame className="w-6 h-6 text-amber-600" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Habits */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Today's Habits</h2>
              <p className="text-sm text-muted-foreground">Mark them complete to keep your streaks going</p>
            </div>
            <div className="text-sm px-3 py-1 bg-background rounded-full border text-muted-foreground">
              {format(new Date(), "EEEE, MMMM d")}
            </div>
          </div>

          {habits.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Flame className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-xl mb-2">No habits yet</h3>
              <p className="text-muted-foreground mb-6 max-w-xs mx-auto">Create your first habit to start building consistency.</p>
              <Button onClick={() => setIsAddOpen(true)}>Create your first habit</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todaysHabits.map((habit) => {
                const isCompletedToday = habit.completions.some(c => c.completed_on === todayStr);
                const last7 = getLast7Days(habit.completions);

                return (
                  <Card key={habit.id} className="habit-card overflow-hidden group">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleCompletion(habit)}
                            className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all active:scale-95 ${isCompletedToday ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30 hover:border-primary/60'}`}
                          >
                            {isCompletedToday && <CheckCircle2 className="w-5 h-5" />}
                          </button>
                          <div>
                            <div className="font-semibold text-lg tracking-tight pr-2">{habit.name}</div>
                            {habit.description && (
                              <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{habit.description}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(habit)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteHabit(habit.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Streak + Mini calendar */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-sm font-medium">
                            <Flame className={`w-4 h-4 ${habit.currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                            <span>{habit.currentStreak} day streak</span>
                          </div>
                        </div>

                        {/* Last 7 days dots */}
                        <div className="flex gap-1">
                          {last7.map((day, idx) => (
                            <div 
                              key={idx} 
                              className={`w-2.5 h-2.5 rounded-full border ${day.completed ? 'bg-primary border-primary' : 'bg-muted border-muted-foreground/20'}`} 
                              title={day.date}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* All Habits List (more detailed) */}
        {habits.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">All Habits</h2>
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="divide-y">
                {habits.map((habit) => {
                  const last7 = getLast7Days(habit.completions);
                  const isCompletedToday = habit.completions.some(c => c.completed_on === todayStr);

                  return (
                    <div key={habit.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 hover:bg-muted/50 transition-colors group">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <button 
                          onClick={() => toggleCompletion(habit)}
                          className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition ${isCompletedToday ? 'bg-primary border-primary text-white' : 'border-muted-foreground/40 hover:border-primary'}`}
                        >
                          {isCompletedToday && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        
                        <div className="min-w-0 flex-1">
                          <div className="font-medium flex items-center gap-2">
                            {habit.name}
                            <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: habit.color }} />
                          </div>
                          {habit.description && <div className="text-xs text-muted-foreground truncate">{habit.description}</div>}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm pl-11 sm:pl-0">
                        <div className="flex items-center gap-4 text-muted-foreground">
                          {/* Mini streak history */}
                          <div className="flex items-center gap-px">
                            {last7.map((d, i) => (
                              <div key={i} className={`w-[13px] h-3.5 rounded-sm ${d.completed ? 'bg-primary' : 'bg-muted'}`} />
                            ))}
                          </div>

                          <div className="flex items-center gap-1 font-medium text-foreground tabular-nums w-16">
                            <Flame className="w-3.5 h-3.5 text-orange-500" /> {habit.currentStreak}d
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => startEdit(habit)}>
                            <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive hover:text-destructive" onClick={() => deleteHabit(habit.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingHabit} onOpenChange={(open) => !open && setEditingHabit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit habit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Habit name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingHabit(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}