import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import {
  Award,
  BarChart3,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  Flame,
  Home,
  ListChecks,
  Loader2,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Plus,
  Save,
  Trash2,
  Edit3,
  Trophy,
  UserRound,
  X,
} from 'lucide-react';
import { authApi } from './api/auth';
import { attemptsApi } from './api/attempts';
import { leaderboardApi } from './api/leaderboard';
import { quizzesApi } from './api/quizzes';
import { adminApi } from './api/admin';
import { tokenStore } from './api/client';
import type { AnswerChoice, AttemptHistoryItem, AttemptReview, Difficulty, LeaderboardEntry, Question, Quiz, SubmitAnswer, User } from './types';

type Tone = 'slate' | 'green' | 'amber' | 'rose' | 'violet';
type AdminQuestion = Question & { explanation?: string | null; answers: Array<AnswerChoice & { isCorrect: boolean }> };
type AdminQuiz = Omit<Quiz, 'questions'> & { questions?: AdminQuestion[] };
type ToastTone = 'success' | 'error';
type ToastMessage = { id: number; tone: ToastTone; message: string };

interface AuthValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);
const ToastContext = createContext<((tone: ToastTone, message: string) => void) | null>(null);

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('Auth context unavailable');
  return ctx;
}

function useToast() {
  const notify = useContext(ToastContext);
  if (!notify) throw new Error('Toast context unavailable');
  return {
    success: (message: string) => notify('success', message),
    error: (message: string) => notify('error', message),
  };
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const notify = (tone: ToastTone, message: string) => {
    const id = Date.now();
    setToasts((items) => [...items, { id, tone, message }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3600);
  };

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="fixed right-4 top-4 z-[60] grid gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} className={clsx('rounded-xl border px-4 py-3 text-sm font-bold shadow-lg', toast.tone === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800')}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('quiz_user');
    return raw ? (JSON.parse(raw) as User) : null;
  });
  const [loading, setLoading] = useState(Boolean(tokenStore.get()));

  const logout = () => {
    tokenStore.clear();
    localStorage.removeItem('quiz_user');
    setUser(null);
  };

  useEffect(() => {
    const restore = async () => {
      if (!tokenStore.get()) {
        setLoading(false);
        return;
      }
      try {
        const me = await authApi.me();
        const normalized = { ...me, id: me.id ?? me.userId ?? 0 };
        setUser(normalized);
        localStorage.setItem('quiz_user', JSON.stringify(normalized));
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    void restore();
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      login: async (email, password) => {
        const response = await authApi.login({ email, password });
        tokenStore.set(response.access_token);
        setUser(response.user);
        localStorage.setItem('quiz_user', JSON.stringify(response.user));
      },
      signup: async (name, email, password) => {
        await authApi.signup({ name, email, password });
        const response = await authApi.login({ email, password });
        tokenStore.set(response.access_token);
        setUser(response.user);
        localStorage.setItem('quiz_user', JSON.stringify(response.user));
      },
      logout,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function Button({
  className,
  loading,
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' && 'bg-violet-600 text-white shadow-sm shadow-violet-200 hover:bg-violet-700',
        variant === 'secondary' && 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
        variant === 'ghost' && 'text-slate-700 hover:bg-slate-100',
        variant === 'danger' && 'bg-rose-600 text-white hover:bg-rose-700',
        className,
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {props.children}
    </button>
  );
}

function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={clsx('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm', className)} />;
}

function Input({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        {...props}
        className={clsx(
          'w-full rounded-xl border bg-white px-3.5 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100',
          error ? 'border-rose-300' : 'border-slate-200',
        )}
      />
      {error ? <span className="mt-1.5 block text-xs font-medium text-rose-600">{error}</span> : null}
    </label>
  );
}

function Badge({ children, tone = 'slate' }: { children: React.ReactNode; tone?: Tone }) {
  const tones: Record<Tone, string> = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-800',
    rose: 'bg-rose-100 text-rose-700',
    violet: 'bg-violet-100 text-violet-700',
  };
  return <span className={clsx('inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize', tones[tone])}>{children}</span>;
}

function ProgressBar({ value, tone = 'violet' }: { value: number; tone?: 'violet' | 'emerald' | 'amber' | 'rose' }) {
  const tones = { violet: 'bg-violet-600', emerald: 'bg-emerald-500', amber: 'bg-amber-500', rose: 'bg-rose-500' };
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div className={clsx('h-full rounded-full transition-all', tones[tone])} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

function StateBlock({ title, message, action }: { title: string; message?: string; action?: React.ReactNode }) {
  return (
    <Card className="flex min-h-48 flex-col items-center justify-center text-center">
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      {message ? <p className="mt-2 max-w-md text-sm text-slate-500">{message}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse rounded-xl bg-slate-200/80', className)} />;
}

function useLoad<T>(loader: () => Promise<T>, deps: React.DependencyList = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await loader());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load data.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void run();
  }, deps);
  return { data, loading, error, refetch: run };
}

const pct = (value?: number | null) => `${Math.round(value ?? 0)}%`;
const formatDate = (value?: string | null) => (value ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : 'In progress');
const formatTime = (seconds: number) => `${Math.floor(Math.max(0, seconds) / 60)}:${(Math.max(0, seconds) % 60).toString().padStart(2, '0')}`;
const formatDuration = (start?: string | null, end?: string | null) => {
  if (!start || !end) return 'Unavailable';
  return formatTime(Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000)));
};
const difficultyTone = (difficulty?: Difficulty | 'mixed'): Tone => (difficulty === 'easy' ? 'green' : difficulty === 'medium' ? 'amber' : difficulty === 'hard' ? 'rose' : 'violet');
const quizDifficulty = (quiz: Quiz): Difficulty | 'mixed' => {
  const values = new Set(quiz.questions?.map((question) => question.difficulty) ?? []);
  return values.size === 1 ? ([...values][0] as Difficulty) : 'mixed';
};
const bestScoreForQuiz = (history: AttemptHistoryItem[], quizId: number) => {
  const scores = history.filter((item) => item.quiz.id === quizId && item.completedAt).map((item) => item.percentage);
  return scores.length ? Math.max(...scores) : null;
};

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullLoader />;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminProtected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'admin' ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullLoader />;
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

function FullLoader() {
  return <div className="grid min-h-screen place-items-center bg-stone-50 text-violet-600"><Loader2 className="h-8 w-8 animate-spin" /></div>;
}

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/quizzes', label: 'Quizzes', icon: BookOpen },
  { to: '/history', label: 'History', icon: ListChecks },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

const adminNav = { to: '/admin', label: 'Admin', icon: Settings };

function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const doLogout = () => {
    logout();
    navigate('/');
  };
  return (
    <div className="min-h-screen bg-stone-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white/90 px-4 py-5 lg:block">
        <Brand />
        <nav className="mt-8 space-y-1">
          {nav.map((item) => <NavItem key={item.to} {...item} />)}
          {user?.role === 'admin' ? <NavItem {...adminNav} /> : null}
        </nav>
      </aside>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-stone-50/90 px-4 py-3 backdrop-blur lg:ml-72">
        <div className="flex items-center justify-between">
          <button className="rounded-xl p-2 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
          <div className="hidden lg:block"><p className="text-sm text-slate-500">Signed in as</p><p className="font-bold">{user?.name || user?.email}</p></div>
          <Button variant="secondary" onClick={doLogout}><LogOut className="h-4 w-4" />Logout</Button>
        </div>
      </header>
      {open ? (
        <div className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden" onClick={() => setOpen(false)}>
          <div className="h-full w-80 bg-white p-5" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between"><Brand /><button onClick={() => setOpen(false)} aria-label="Close navigation"><X /></button></div>
            <nav className="mt-8 space-y-1">{nav.map((item) => <NavItem key={item.to} {...item} onClick={() => setOpen(false)} />)}{user?.role === 'admin' ? <NavItem {...adminNav} onClick={() => setOpen(false)} /> : null}</nav>
          </div>
        </div>
      ) : null}
      <main className="px-4 py-6 lg:ml-72 lg:px-8">{children}</main>
    </div>
  );
}

function Brand() {
  return <Link to="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-600 text-white"><ShieldCheck /></span><span className="text-xl font-black">QuizForge</span></Link>;
}

function NavItem({ to, label, icon: Icon, onClick }: { to: string; label: string; icon: typeof Home; onClick?: () => void }) {
  return (
    <NavLink to={to} onClick={onClick} className={({ isActive }) => clsx('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition', isActive ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50')}>
      <Icon className="h-4 w-4" />{label}
    </NavLink>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-950">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5"><Brand /><div className="flex gap-2"><Link to="/login"><Button variant="secondary">Log in</Button></Link><Link to="/signup"><Button>Start Testing</Button></Link></div></header>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <Badge tone="violet">Modern quiz platform</Badge>
          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-tight tracking-tight text-slate-950 md:text-7xl">Test your knowledge. Track your progress. Climb the leaderboard.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">A polished testing workspace connected directly to your NestJS backend, with timed quizzes, scored submissions, attempt history, and ranked performance.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link to="/signup"><Button className="px-5 py-3">Start Testing</Button></Link><Link to="/quizzes"><Button variant="secondary" className="px-5 py-3">Browse Quizzes</Button></Link></div>
        </div>
        <div className="relative">
          <Card className="overflow-hidden p-0">
            <div className="bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between"><span className="font-bold">Live Test</span><Badge tone="amber">Medium</Badge></div>
              <p className="mt-8 text-2xl font-black">Which CSS utility centers a block horizontally?</p>
            </div>
            <div className="space-y-3 p-5">{['align-items', 'justify-content', 'justify-items'].map((item, index) => <div key={item} className={clsx('rounded-xl border p-4 font-semibold', index === 1 ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-200')}>{item}</div>)}</div>
          </Card>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-20 md:grid-cols-4">{['Real backend APIs', 'Timed attempts', 'Progress tracking', 'Global ranking'].map((item) => <Card key={item}><p className="text-2xl font-black text-violet-600">✓</p><p className="mt-2 font-bold">{item}</p></Card>)}</section>
    </div>
  );
}

function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const strength = Math.min(100, password.length * 11 + (/[A-Z]/.test(password) ? 15 : 0) + (/\d/.test(password) ? 15 : 0));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (mode === 'signup' && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signup') await signup(name, email, password);
      else await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-stone-50 px-4 py-10">
      <Card className="w-full max-w-md p-7">
        <Brand />
        <h1 className="mt-8 text-3xl font-black">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
        <p className="mt-2 text-sm text-slate-500">{mode === 'signup' ? 'Start taking quizzes and tracking every score.' : 'Log in to continue your quiz progress.'}</p>
        <form className="mt-7 space-y-4" onSubmit={submit}>
          {mode === 'signup' ? <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} required /> : null}
          <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <div className="relative">
            <Input label="Password" type={show ? 'text' : 'password'} value={password} minLength={mode === 'signup' ? 6 : undefined} onChange={(event) => setPassword(event.target.value)} required />
            <button type="button" className="absolute right-3 top-10 text-slate-500" onClick={() => setShow(!show)} aria-label="Toggle password visibility">{show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
          </div>
          {mode === 'signup' ? (
            <>
              <ProgressBar value={strength} tone={strength > 70 ? 'emerald' : strength > 40 ? 'amber' : 'rose'} />
              <Input label="Confirm password" type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} required error={confirm && confirm !== password ? 'Passwords do not match.' : undefined} />
            </>
          ) : null}
          {error ? <div className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div> : null}
          <Button loading={loading} className="w-full py-3">{mode === 'signup' ? 'Create account' : 'Log in'}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">{mode === 'signup' ? 'Already have an account?' : 'Need an account?'} <Link className="font-bold text-violet-700" to={mode === 'signup' ? '/login' : '/signup'}>{mode === 'signup' ? 'Log in' : 'Sign up'}</Link></p>
      </Card>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const history = useLoad(() => attemptsApi.history(), []);
  const leaderboard = useLoad(() => leaderboardApi.list(), []);
  const quizzes = useLoad(async () => Promise.all((await quizzesApi.list()).slice(0, 3).map((quiz) => quizzesApi.detail(quiz.id))), []);
  const completed = history.data?.filter((item) => item.completedAt) ?? [];
  const avg = completed.length ? completed.reduce((sum, item) => sum + item.percentage, 0) / completed.length : 0;
  const best = completed.length ? Math.max(...completed.map((item) => item.percentage)) : 0;
  const rank = leaderboard.data?.find((entry) => entry.userId === user?.id)?.rank;
  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-6">
        <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-600">Dashboard</p><h1 className="mt-2 text-3xl font-black">Welcome back, {user?.name || 'tester'}</h1></div>
        <div className="grid gap-4 md:grid-cols-4"><Stat label="Total quizzes taken" value={completed.length} icon={ListChecks} /><Stat label="Average score" value={pct(avg)} icon={BarChart3} /><Stat label="Best score" value={pct(best)} icon={Award} /><Stat label="Current rank" value={rank ? `#${rank}` : 'Unranked'} icon={Trophy} /></div>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <Card><h2 className="text-xl font-black">Recommended Quizzes</h2><div className="mt-4 grid gap-4 md:grid-cols-3">{quizzes.loading ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />) : quizzes.data?.map((quiz) => <QuizMini key={quiz.id} quiz={quiz} />)}</div></Card>
          <Card><h2 className="text-xl font-black">Leaderboard Preview</h2><div className="mt-4 space-y-3">{(leaderboard.data ?? []).slice(0, 5).map((entry) => <RankRow key={entry.userId} entry={entry} active={entry.userId === user?.id} />)}{!leaderboard.loading && !leaderboard.data?.length ? <p className="text-sm text-slate-500">No completed attempts yet.</p> : null}</div></Card>
        </div>
        <Card><h2 className="text-xl font-black">Recent Attempts</h2><AttemptList loading={history.loading} attempts={(history.data ?? []).slice(0, 5)} /></Card>
      </div>
    </Shell>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon: typeof Home }) {
  return <Card><div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-500">{label}</p><Icon className="h-5 w-5 text-violet-600" /></div><p className="mt-4 text-3xl font-black">{value}</p></Card>;
}

function QuizMini({ quiz }: { quiz: Quiz }) {
  const diff = quizDifficulty(quiz);
  return <Link to={`/quizzes/${quiz.id}`} className="rounded-2xl border border-slate-200 p-4 transition hover:border-violet-200 hover:bg-violet-50/40"><Badge tone={difficultyTone(diff)}>{diff}</Badge><h3 className="mt-3 font-black">{quiz.title}</h3><p className="mt-2 line-clamp-2 text-sm text-slate-500">{quiz.description || 'No description provided.'}</p></Link>;
}

function Quizzes() {
  const { data: list, loading, error } = useLoad(async () => Promise.all((await quizzesApi.list()).map((quiz) => quizzesApi.detail(quiz.id))), []);
  const history = useLoad(() => attemptsApi.history(), []);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState<'all' | Difficulty | 'mixed'>('all');
  const [sort, setSort] = useState('newest');
  const categories = Array.from(new Set((list ?? []).map((quiz) => quiz.category).filter(Boolean) as string[])).sort();
  const filtered = (list ?? [])
    .filter((quiz) => `${quiz.title} ${quiz.description} ${quiz.category}`.toLowerCase().includes(search.toLowerCase()))
    .filter((quiz) => category === 'all' || quiz.category === category)
    .filter((quiz) => difficulty === 'all' || (quiz.difficulty ?? quizDifficulty(quiz)) === difficulty)
    .sort((a, b) => {
      if (sort === 'questions') return (b.questions?.length ?? 0) - (a.questions?.length ?? 0);
      if (sort === 'difficulty') return ['easy', 'medium', 'hard', 'mixed'].indexOf(String(a.difficulty ?? quizDifficulty(a))) - ['easy', 'medium', 'hard', 'mixed'].indexOf(String(b.difficulty ?? quizDifficulty(b)));
      if (sort === 'newest') return b.id - a.id;
      return a.title.localeCompare(b.title);
    });
  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-6">
        <div><h1 className="text-3xl font-black">Available quizzes</h1><p className="mt-2 text-slate-500">Search, filter, and start tests from the backend quiz catalog.</p></div>
        <Card className="grid gap-3 lg:grid-cols-[1fr_190px_170px_180px]"><div className="relative"><Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" /><input className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 outline-none focus:ring-4 focus:ring-violet-100" placeholder="Search quizzes" value={search} onChange={(event) => setSearch(event.target.value)} /></div><select className="rounded-xl border border-slate-200 px-3 py-3" value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All topics</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select><select className="rounded-xl border border-slate-200 px-3 py-3" value={difficulty} onChange={(event) => setDifficulty(event.target.value as 'all' | Difficulty | 'mixed')}><option value="all">All difficulty</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option><option value="mixed">Mixed</option></select><select className="rounded-xl border border-slate-200 px-3 py-3" value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest</option><option value="title">Title</option><option value="difficulty">Difficulty</option><option value="questions">Most questions</option></select></Card>
        {loading ? <div className="grid gap-4 md:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-56" />)}</div> : error ? <StateBlock title="Unable to load quizzes" message={error} /> : !filtered.length ? <StateBlock title="No quizzes found" message="Try a different search or filter." /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} bestScore={bestScoreForQuiz(history.data ?? [], quiz.id)} />)}</div>}
      </div>
    </Shell>
  );
}

function QuizCard({ quiz, bestScore }: { quiz: Quiz; bestScore: number | null }) {
  const diff = quiz.difficulty ?? quizDifficulty(quiz);
  return <Card className="flex flex-col"><div className="flex items-center justify-between"><Badge tone={difficultyTone(diff)}>{diff}</Badge><span className="text-sm font-semibold text-slate-500">{quiz.timeLimit ? `${quiz.timeLimit} min` : 'Untimed'}</span></div><h2 className="mt-4 text-xl font-black">{quiz.title}</h2><p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{quiz.description || 'No description provided.'}</p><div className="mt-5 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-500">Questions</p><p className="font-black">{quiz.questions?.length ?? 0}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-500">Best score</p><p className="font-black">{bestScore === null ? 'New' : pct(bestScore)}</p></div></div><Link to={`/quizzes/${quiz.id}`} className="mt-5"><Button className="w-full">View quiz</Button></Link></Card>;
}

function QuizDetails() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const { data: quiz, loading, error } = useLoad(() => quizzesApi.detail(id), [id]);
  const [starting, setStarting] = useState(false);
  const start = async () => {
    setStarting(true);
    try {
      const attempt = await attemptsApi.start(id);
      navigate(`/quiz/${id}/take?attempt=${attempt.id}`);
    } finally {
      setStarting(false);
    }
  };
  if (loading) return <Shell><Skeleton className="h-96" /></Shell>;
  if (error || !quiz) return <Shell><StateBlock title="Quiz not found" message={error || 'This quiz is unavailable.'} /></Shell>;
  const diff = quiz.difficulty ?? quizDifficulty(quiz);
  return <Shell><div className="mx-auto max-w-4xl"><Card className="p-8"><div className="flex flex-wrap gap-2"><Badge tone={difficultyTone(diff)}>{diff}</Badge>{quiz.category ? <Badge tone="violet">{quiz.category}</Badge> : null}</div><h1 className="mt-4 text-4xl font-black">{quiz.title}</h1><p className="mt-3 text-lg leading-8 text-slate-600">{quiz.description || 'No instructions were provided for this quiz.'}</p><div className="mt-8 grid gap-4 md:grid-cols-3"><Stat label="Questions" value={quiz.questions?.length ?? 0} icon={BookOpen} /><Stat label="Time limit" value={quiz.timeLimit ? `${quiz.timeLimit}m` : 'None'} icon={Clock} /><Stat label="Total points" value={(quiz.questions ?? []).reduce((sum, q) => sum + q.points, 0)} icon={Award} /></div><div className="mt-8 rounded-2xl bg-violet-50 p-5"><h2 className="font-black">Are you ready?</h2><p className="mt-2 text-sm leading-6 text-slate-600">Answer every question before submitting. Correct answers are only shown after the backend scores your attempt.</p></div><Button loading={starting} onClick={start} className="mt-6 px-6 py-3">Start Quiz</Button></Card></div></Shell>;
}

function TakeQuiz() {
  const quizId = Number(useParams().id);
  const attemptId = Number(new URLSearchParams(location.search).get('attempt'));
  const navigate = useNavigate();
  const toast = useToast();
  const { data: quiz, loading, error } = useLoad(() => quizzesApi.detail(quizId), [quizId]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const startedAt = useRef(Date.now());
  const submittedRef = useRef(false);
  const questions = quiz?.questions ?? [];
  const answeredCount = Object.keys(answers).length;
  const current = questions[index];

  useEffect(() => {
    if (!quiz?.timeLimit) return;
    const total = quiz.timeLimit * 60;
    setRemaining(total);
    const interval = window.setInterval(() => {
      const next = total - Math.floor((Date.now() - startedAt.current) / 1000);
      setRemaining(Math.max(0, next));
      if (next <= 0) window.clearInterval(interval);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [quiz?.timeLimit]);

  const submit = async (skipConfirmation = false) => {
    if (submittedRef.current) return;
    setSubmitError('');
    if (!skipConfirmation) {
      setConfirmOpen(true);
      return;
    }
    submittedRef.current = true;
    setSubmitting(true);
    try {
      const payload: SubmitAnswer[] = questions
        .filter((question) => answers[question.id])
        .map((question) => ({ questionId: question.id, answerId: answers[question.id] }));
      const result = await attemptsApi.submit(attemptId, payload);
      toast.success('Quiz submitted successfully.');
      navigate(`/results/${result.attemptId}`);
    } catch (err) {
      submittedRef.current = false;
      const message = err instanceof Error ? err.message : 'Unable to submit quiz. Please try again.';
      setSubmitError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  };

  useEffect(() => {
    if (remaining !== null && remaining <= 0 && questions.length) {
      setTimedOut(true);
      void submit(true);
    }
  }, [remaining]);

  if (!attemptId) return <Navigate to={`/quizzes/${quizId}`} replace />;
  if (loading) return <Shell><Skeleton className="h-96" /></Shell>;
  if (error || !quiz || !current) return <Shell><StateBlock title="Unable to load quiz" message={error || 'This quiz has no questions yet.'} /></Shell>;
  const progress = ((index + 1) / questions.length) * 100;
  return <Shell><div className="mx-auto max-w-5xl space-y-5"><Card><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-black">{quiz.title}</h1><p className="text-sm text-slate-500">Question {index + 1} of {questions.length} · {answeredCount} answered</p></div>{remaining !== null ? <div className={clsx('rounded-xl px-4 py-2 font-black', remaining < 60 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700')}><Clock className="mr-2 inline h-4 w-4" />{formatTime(remaining)} remaining</div> : null}</div><div className="mt-4"><ProgressBar value={progress} /></div>{timedOut || submitting ? <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">{timedOut ? 'Time is up. Submitting your quiz now...' : 'Submitting quiz...'}</p> : null}</Card><Card className="p-6 md:p-8"><div className="flex items-start justify-between gap-4"><h2 className="text-2xl font-black leading-9">{current.questionText}</h2><Badge tone={difficultyTone(current.difficulty)}>{current.difficulty}</Badge></div><div className="mt-6 grid gap-3">{current.answers.map((answer, answerIndex) => <button key={answer.id} disabled={submitting} onClick={() => setAnswers((prev) => ({ ...prev, [current.id]: answer.id }))} className={clsx('rounded-2xl border p-4 text-left font-semibold transition focus:outline-none focus:ring-4 focus:ring-violet-100 disabled:opacity-60', answers[current.id] === answer.id ? 'border-violet-400 bg-violet-50 text-violet-800' : 'border-slate-200 bg-white hover:border-violet-200 hover:bg-slate-50')}><span className="mr-3 inline-grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-sm">{String.fromCharCode(65 + answerIndex)}</span>{answer.answerText}</button>)}</div></Card><Card><div className="flex flex-wrap gap-2">{questions.map((question, qIndex) => <button key={question.id} disabled={submitting} onClick={() => setIndex(qIndex)} className={clsx('h-10 w-10 rounded-xl text-sm font-black transition', qIndex === index ? 'bg-violet-600 text-white' : answers[question.id] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500')}>{qIndex + 1}</button>)}</div><div className="mt-5 flex flex-wrap justify-between gap-3"><Button variant="secondary" disabled={index === 0 || submitting} onClick={() => setIndex(index - 1)}><ChevronLeft className="h-4 w-4" />Previous</Button>{index === questions.length - 1 ? <Button loading={submitting} onClick={() => void submit(false)}>Submit Quiz</Button> : <Button disabled={submitting} onClick={() => setIndex(index + 1)}>Next<ChevronRight className="h-4 w-4" /></Button>}</div>{submitError ? <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{submitError}</p> : null}</Card>{confirmOpen ? <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"><Card className="w-full max-w-md p-6"><h2 className="text-xl font-black">{answeredCount === questions.length ? 'Are you sure you want to submit this quiz?' : `You have ${questions.length - answeredCount} unanswered questions. Submit anyway?`}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{answeredCount === questions.length ? 'Your answers will be scored now.' : 'Unanswered questions will be counted separately in your result.'}</p><div className="mt-6 flex justify-end gap-3"><Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button><Button loading={submitting} onClick={() => void submit(true)}>Submit Quiz</Button></div></Card></div> : null}</div></Shell>;
}

function Results() {
  const attemptId = Number(useParams().attemptId);
  const { data, loading, error } = useLoad(() => attemptsApi.result(attemptId), [attemptId]);
  if (loading) return <Shell><Skeleton className="h-96" /></Shell>;
  if (error || !data) return <Shell><StateBlock title="Unable to load results" message={error || 'Result unavailable.'} /></Shell>;
  return <Shell><ResultView data={data} /></Shell>;
}

function ResultView({ data }: { data: AttemptReview }) {
  const tone: Tone = data.percentage >= 80 ? 'green' : data.percentage >= 50 ? 'amber' : 'rose';
  const message = data.percentage >= 90 ? 'Excellent' : data.percentage >= 75 ? 'Great job' : data.percentage >= 50 ? 'Good effort' : 'Keep practicing';
  const totalQuestions = data.totalQuestions || data.answers.length || data.correctAnswers + data.wrongAnswers;
  const incorrectAnswers = data.incorrectAnswers ?? data.wrongAnswers;
  const unansweredQuestions = data.unansweredQuestions ?? Math.max(0, totalQuestions - data.answers.filter((answer) => answer.selectedAnswer.id).length);
  const answeredQuestions = data.answeredQuestions ?? totalQuestions - unansweredQuestions;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Card className="grid gap-6 p-8 md:grid-cols-[220px_1fr]">
        <div className="grid aspect-square place-items-center rounded-full border-[14px] border-violet-100 bg-white">
          <div className="text-center">
            <p className="text-5xl font-black text-violet-700">{pct(data.percentage)}</p>
            <p className="mt-1 font-bold text-slate-500">{message}</p>
          </div>
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={tone}>{data.correctAnswers} / {totalQuestions}</Badge>
            {data.quiz.difficulty ? <Badge tone={difficultyTone(data.quiz.difficulty)}>{data.quiz.difficulty}</Badge> : null}
            {data.quiz.category ? <Badge tone="violet">{data.quiz.category}</Badge> : null}
          </div>
          <h1 className="mt-4 text-3xl font-black">Quiz complete: {data.quiz.title}</h1>
          <p className="mt-3 text-slate-600">{data.correctAnswers} / {totalQuestions} correct, {answeredQuestions} / {totalQuestions} answered, {data.score} / {data.totalPoints} points.</p>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <Stat label="Correct" value={data.correctAnswers} icon={Check} />
            <Stat label="Incorrect" value={incorrectAnswers} icon={X} />
            <Stat label="Unanswered" value={unansweredQuestions} icon={ListChecks} />
            <Stat label="Time taken" value={formatDuration(data.startedAt, data.completedAt)} icon={Clock} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="#review"><Button variant="secondary">Review Answers</Button></a>
            <Link to={`/quizzes/${data.quiz.id}`}><Button variant="secondary">Try Again</Button></Link>
            <Link to="/quizzes"><Button>Back to Quizzes</Button></Link>
          </div>
        </div>
      </Card>
      <Card id="review">
        <h2 className="text-xl font-black">Question review</h2>
        <div className="mt-5 space-y-4">{data.answers.map((answer) => <div key={`${answer.questionId}-${answer.id}`} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start gap-3">{answer.isCorrect ? <Check className="mt-1 h-5 w-5 text-emerald-600" /> : <X className="mt-1 h-5 w-5 text-rose-600" />}<div><p className="font-black">{answer.questionText}</p><p className="mt-2 text-sm text-slate-600">Your answer: <span className="font-semibold">{answer.selectedAnswer.answerText}</span></p>{!answer.isCorrect ? <p className="mt-1 text-sm text-emerald-700">Correct answer: <span className="font-semibold">{answer.correctAnswer?.answerText || 'Unavailable'}</span></p> : null}{answer.explanation ? <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">Explanation: {answer.explanation}</p> : null}</div></div></div>)}</div>
      </Card>
    </div>
  );
}

function History() {
  const { data, loading, error } = useLoad(() => attemptsApi.history(), []);
  return <Shell><div className="mx-auto max-w-7xl space-y-6"><h1 className="text-3xl font-black">Attempt history</h1>{error ? <StateBlock title="Unable to load history" message={error} /> : <Card><AttemptList loading={loading} attempts={data ?? []} /></Card>}</div></Shell>;
}

function AttemptList({ loading, attempts }: { loading: boolean; attempts: AttemptHistoryItem[] }) {
  if (loading) return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>;
  if (!attempts.length) return <StateBlock title="You haven't taken any quizzes yet." message="Start a quiz to build your history and statistics." action={<Link to="/quizzes"><Button>Browse quizzes</Button></Link>} />;
  return <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="py-3">Quiz</th><th>Date</th><th>Score</th><th>Correct</th><th>Answered</th><th>Missed</th><th>Time</th><th></th></tr></thead><tbody>{attempts.map((attempt) => { const total = attempt.totalQuestions || attempt.correctAnswers + attempt.wrongAnswers; const unanswered = attempt.unansweredQuestions ?? Math.max(0, total - (attempt.answeredQuestions ?? total)); return <tr key={attempt.id} className="border-b last:border-0"><td className="py-4 font-bold">{attempt.quiz.title}</td><td>{formatDate(attempt.completedAt || attempt.startedAt)}</td><td>{pct(attempt.percentage)}</td><td>{attempt.correctAnswers} / {total}</td><td>{attempt.answeredQuestions ?? total - unanswered} / {total}</td><td>{attempt.incorrectAnswers ?? attempt.wrongAnswers} incorrect, {unanswered} unanswered</td><td>{formatDuration(attempt.startedAt, attempt.completedAt)}</td><td>{attempt.completedAt ? <Link className="font-bold text-violet-700" to={`/results/${attempt.id}`}>Review</Link> : <Badge tone="amber">In progress</Badge>}</td></tr>; })}</tbody></table></div>;
}

function Leaderboard() {
  const { user } = useAuth();
  const { data, loading, error } = useLoad(() => leaderboardApi.list(), []);
  return <Shell><div className="mx-auto max-w-7xl space-y-6"><h1 className="text-3xl font-black">Leaderboard</h1>{loading ? <Skeleton className="h-96" /> : error ? <StateBlock title="Unable to load leaderboard" message={error} /> : !data?.length ? <StateBlock title="No leaderboard yet" message="Completed attempts will appear here." /> : <Card><div className="grid gap-4 md:grid-cols-3">{data.slice(0, 3).map((entry) => <Card key={entry.userId} className={clsx('border-2', entry.rank === 1 ? 'border-amber-300 bg-amber-50' : 'border-slate-200')}><p className="text-3xl font-black">#{entry.rank}</p><h2 className="mt-3 text-xl font-black">{entry.name}</h2><p className="mt-2 text-4xl font-black text-violet-700">{pct(entry.bestScore)}</p><p className="text-sm text-slate-500">{entry.testsTaken} tests taken</p></Card>)}</div><div className="mt-6 space-y-2">{data.map((entry) => <RankRow key={entry.userId} entry={entry} active={entry.userId === user?.id} />)}</div></Card>}</div></Shell>;
}

function RankRow({ entry, active }: { entry: LeaderboardEntry; active?: boolean }) {
  return <div className={clsx('grid grid-cols-[60px_1fr_90px_90px_90px] items-center gap-3 rounded-2xl px-4 py-3 text-sm', active ? 'bg-violet-50 text-violet-800 ring-1 ring-violet-200' : 'bg-slate-50')}><span className="font-black">#{entry.rank}</span><span className="font-bold">{entry.name}{active ? ' (you)' : ''}</span><span>{pct(entry.bestScore)}</span><span>{pct(entry.averageScore)}</span><span>{entry.testsTaken} tests</span></div>;
}

function Profile() {
  const { user } = useAuth();
  const history = useLoad(() => attemptsApi.history(), []);
  const leaderboard = useLoad(() => leaderboardApi.list(), []);
  const completed = history.data?.filter((item) => item.completedAt) ?? [];
  const avg = completed.length ? completed.reduce((sum, item) => sum + item.percentage, 0) / completed.length : 0;
  const best = completed.length ? Math.max(...completed.map((item) => item.percentage)) : 0;
  const rank = leaderboard.data?.find((entry) => entry.userId === user?.id)?.rank;
  return <Shell><div className="mx-auto max-w-5xl space-y-6"><Card className="p-8"><div className="flex items-center gap-5"><div className="grid h-20 w-20 place-items-center rounded-3xl bg-violet-100 text-3xl font-black text-violet-700">{(user?.name || user?.email || '?').slice(0, 1).toUpperCase()}</div><div><h1 className="text-3xl font-black">{user?.name || 'Quiz user'}</h1><p className="text-slate-500">{user?.email}</p></div></div></Card><div className="grid gap-4 md:grid-cols-4"><Stat label="Total tests" value={completed.length} icon={ListChecks} /><Stat label="Average score" value={pct(avg)} icon={BarChart3} /><Stat label="Best score" value={pct(best)} icon={Award} /><Stat label="Current rank" value={rank ? `#${rank}` : 'Unranked'} icon={Trophy} /></div><Card><h2 className="text-xl font-black">Recent activity</h2><AttemptList loading={history.loading} attempts={(history.data ?? []).slice(0, 5)} /></Card></div></Shell>;
}

const emptyAdminQuiz: AdminQuiz = { id: 0, title: '', description: '', category: '', difficulty: 'easy', timeLimit: 20, questions: [] };
const emptyQuestion = (): AdminQuestion => ({ id: 0, questionText: '', difficulty: 'easy', points: 1, explanation: '', answers: [
  { id: 0, answerText: '', isCorrect: true },
  { id: 0, answerText: '', isCorrect: false },
  { id: 0, answerText: '', isCorrect: false },
  { id: 0, answerText: '', isCorrect: false },
] });

function AdminDashboard() {
  const { data, loading, error, refetch } = useLoad(() => adminApi.quizzes() as Promise<AdminQuiz[]>, []);
  const attempts = useLoad(() => attemptsApi.history(), []);
  const [selectedId, setSelectedId] = useState<number | 'new'>('new');
  const selected = selectedId === 'new' ? emptyAdminQuiz : data?.find((quiz) => quiz.id === selectedId) ?? emptyAdminQuiz;
  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-600">Admin</p><h1 className="mt-2 text-3xl font-black">Content management</h1><p className="mt-2 text-slate-500">Create and manage quizzes, questions, answers, explanations, categories, and difficulty.</p></div>
          <Button onClick={() => setSelectedId('new')}><Plus className="h-4 w-4" />New Quiz</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-4"><Stat label="Quizzes" value={data?.length ?? 0} icon={BookOpen} /><Stat label="Questions" value={(data ?? []).reduce((sum, quiz) => sum + (quiz.questions?.length ?? 0), 0)} icon={ListChecks} /><Stat label="Answers" value={(data ?? []).reduce((sum, quiz) => sum + (quiz.questions ?? []).reduce((inner, question) => inner + question.answers.length, 0), 0)} icon={Check} /><Stat label="Visible attempts" value={attempts.data?.length ?? 0} icon={BarChart3} /></div>
        {error ? <StateBlock title="Admin data unavailable" message={error} /> : null}
        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <Card className="h-fit">
            <h2 className="text-lg font-black">Quiz library</h2>
            <div className="mt-4 space-y-2">
              {loading ? [1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-16" />) : (data ?? []).map((quiz) => (
                <button key={quiz.id} onClick={() => setSelectedId(quiz.id)} className={clsx('w-full rounded-2xl border p-3 text-left transition', selectedId === quiz.id ? 'border-violet-300 bg-violet-50' : 'border-slate-200 hover:bg-slate-50')}>
                  <div className="flex items-center justify-between gap-3"><span className="font-bold">{quiz.title}</span><Badge tone={difficultyTone(quiz.difficulty ?? 'mixed')}>{quiz.difficulty ?? 'mixed'}</Badge></div>
                  <p className="mt-1 text-xs text-slate-500">{quiz.category || 'Uncategorized'} · {quiz.questions?.length ?? 0} questions</p>
                </button>
              ))}
            </div>
          </Card>
          <AdminQuizEditor key={selectedId} quiz={selected} isNew={selectedId === 'new'} onSaved={async (quizId) => { await refetch(); setSelectedId(quizId); }} onDeleted={async () => { await refetch(); setSelectedId('new'); }} />
        </div>
      </div>
    </Shell>
  );
}

function AdminQuizEditor({ quiz, isNew, onSaved, onDeleted }: { quiz: AdminQuiz; isNew: boolean; onSaved: (quizId: number) => Promise<void>; onDeleted: () => Promise<void> }) {
  const [draft, setDraft] = useState<AdminQuiz>({ ...quiz, questions: quiz.questions ?? [] });
  const [questionDraft, setQuestionDraft] = useState<AdminQuestion>(emptyQuestion());
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const saveQuiz = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = { title: draft.title, description: draft.description || undefined, category: draft.category || undefined, difficulty: draft.difficulty || undefined, timeLimit: Number(draft.timeLimit) || undefined };
      const saved = isNew ? await adminApi.createQuiz(payload) : await adminApi.updateQuiz(draft.id, payload);
      setMessage('Quiz saved.');
      await onSaved(saved.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save quiz.');
    } finally {
      setSaving(false);
    }
  };

  const removeQuiz = async () => {
    if (!draft.id || !window.confirm('Delete this quiz and all related questions, answers, and attempts?')) return;
    setSaving(true);
    try {
      await adminApi.deleteQuiz(draft.id);
      await onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete quiz.');
    } finally {
      setSaving(false);
    }
  };

  const saveQuestion = async () => {
    if (!draft.id) {
      setError('Save the quiz before adding questions.');
      return;
    }
    if (!questionDraft.questionText.trim() || questionDraft.answers.some((answer) => !answer.answerText.trim())) {
      setError('Question and all answers are required.');
      return;
    }
    if (questionDraft.answers.filter((answer) => answer.isCorrect).length !== 1) {
      setError('Select exactly one correct answer.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const questionPayload = { questionText: questionDraft.questionText, difficulty: questionDraft.difficulty, points: Number(questionDraft.points) || 1, explanation: questionDraft.explanation || undefined };
      const savedQuestion = editingQuestionId ? await adminApi.updateQuestion(editingQuestionId, questionPayload) : await adminApi.createQuestion(draft.id, questionPayload);
      const questionId = editingQuestionId ?? Number((savedQuestion as { id: number }).id);
      for (const answer of [...questionDraft.answers].sort((a, b) => Number(b.isCorrect) - Number(a.isCorrect))) {
        if (answer.id) await adminApi.updateAnswer(answer.id, { answerText: answer.answerText, isCorrect: answer.isCorrect });
        else await adminApi.createAnswer(questionId, { answerText: answer.answerText, isCorrect: answer.isCorrect });
      }
      setQuestionDraft(emptyQuestion());
      setEditingQuestionId(null);
      setMessage('Question saved.');
      await onSaved(draft.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save question.');
    } finally {
      setSaving(false);
    }
  };

  const editQuestion = (question: AdminQuestion) => {
    setEditingQuestionId(question.id);
    setQuestionDraft({ ...question, answers: question.answers.length ? question.answers : emptyQuestion().answers });
  };

  const deleteQuestion = async (questionId: number) => {
    if (!window.confirm('Delete this question and its answers?')) return;
    setSaving(true);
    try {
      await adminApi.deleteQuestion(questionId);
      await onSaved(draft.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete question.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">{isNew ? 'Create quiz' : 'Edit quiz'}</h2>{!isNew ? <Button variant="danger" onClick={removeQuiz}><Trash2 className="h-4 w-4" />Delete</Button> : null}</div>
        <div className="mt-5 grid gap-4 md:grid-cols-2"><Input label="Quiz title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /><Input label="Category/topic" value={draft.category ?? ''} onChange={(event) => setDraft({ ...draft, category: event.target.value })} /><label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Difficulty</span><select className="w-full rounded-xl border border-slate-200 px-3.5 py-3" value={draft.difficulty ?? 'easy'} onChange={(event) => setDraft({ ...draft, difficulty: event.target.value as Difficulty })}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label><Input label="Time limit minutes" type="number" min={1} value={draft.timeLimit ?? 20} onChange={(event) => setDraft({ ...draft, timeLimit: Number(event.target.value) })} /></div>
        <label className="mt-4 block"><span className="mb-2 block text-sm font-semibold text-slate-700">Description</span><textarea className="min-h-24 w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-4 focus:ring-violet-100" value={draft.description ?? ''} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
        <div className="mt-5 flex flex-wrap items-center gap-3"><Button loading={saving} onClick={saveQuiz}><Save className="h-4 w-4" />Save Quiz</Button>{message ? <span className="text-sm font-bold text-emerald-700">{message}</span> : null}{error ? <span className="text-sm font-bold text-rose-700">{error}</span> : null}</div>
      </Card>
      <Card>
        <h2 className="text-xl font-black">{editingQuestionId ? 'Edit question' : 'Add question'}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_160px_120px]"><Input label="Question" value={questionDraft.questionText} onChange={(event) => setQuestionDraft({ ...questionDraft, questionText: event.target.value })} /><label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Difficulty</span><select className="w-full rounded-xl border border-slate-200 px-3.5 py-3" value={questionDraft.difficulty} onChange={(event) => setQuestionDraft({ ...questionDraft, difficulty: event.target.value as Difficulty })}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label><Input label="Points" type="number" min={1} value={questionDraft.points} onChange={(event) => setQuestionDraft({ ...questionDraft, points: Number(event.target.value) })} /></div>
        <div className="mt-4 space-y-3">{questionDraft.answers.map((answer, index) => <div key={index} className="grid gap-3 rounded-2xl border border-slate-200 p-3 md:grid-cols-[40px_1fr_120px_44px]"><div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 font-black">{String.fromCharCode(65 + index)}</div><input className="rounded-xl border border-slate-200 px-3 outline-none focus:ring-4 focus:ring-violet-100" value={answer.answerText} onChange={(event) => setQuestionDraft({ ...questionDraft, answers: questionDraft.answers.map((item, i) => i === index ? { ...item, answerText: event.target.value } : item) })} placeholder="Answer text" /><label className="flex items-center gap-2 text-sm font-bold"><input type="radio" checked={answer.isCorrect} onChange={() => setQuestionDraft({ ...questionDraft, answers: questionDraft.answers.map((item, i) => ({ ...item, isCorrect: i === index })) })} />Correct</label><button className="rounded-xl text-rose-600 hover:bg-rose-50" disabled={questionDraft.answers.length <= 2} onClick={() => setQuestionDraft({ ...questionDraft, answers: questionDraft.answers.filter((_, i) => i !== index) })} aria-label="Remove answer"><Trash2 className="mx-auto h-4 w-4" /></button></div>)}</div>
        <div className="mt-3"><Button variant="secondary" onClick={() => setQuestionDraft({ ...questionDraft, answers: [...questionDraft.answers, { id: 0, answerText: '', isCorrect: false }] })}><Plus className="h-4 w-4" />Add Answer</Button></div>
        <label className="mt-4 block"><span className="mb-2 block text-sm font-semibold text-slate-700">Explanation</span><textarea className="min-h-24 w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-4 focus:ring-violet-100" value={questionDraft.explanation ?? ''} onChange={(event) => setQuestionDraft({ ...questionDraft, explanation: event.target.value })} /></label>
        <div className="mt-5 flex flex-wrap gap-3"><Button loading={saving} onClick={saveQuestion}><Save className="h-4 w-4" />{editingQuestionId ? 'Update Question' : 'Add Question'}</Button>{editingQuestionId ? <Button variant="secondary" onClick={() => { setEditingQuestionId(null); setQuestionDraft(emptyQuestion()); }}>Cancel edit</Button> : null}</div>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Questions</h2>
        {!draft.questions?.length ? <StateBlock title="This quiz doesn't have any questions yet." message="Add the first question with four answers and one correct option." /> : <div className="mt-4 space-y-3">{draft.questions.map((question) => <div key={question.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><Badge tone={difficultyTone(question.difficulty)}>{question.difficulty}</Badge><p className="mt-2 font-black">{question.questionText}</p><p className="mt-1 text-sm text-slate-500">{question.answers.length} answers · {question.points} points</p></div><div className="flex gap-2"><Button variant="secondary" onClick={() => editQuestion(question)}><Edit3 className="h-4 w-4" />Edit</Button><Button variant="danger" onClick={() => void deleteQuestion(question.id)}><Trash2 className="h-4 w-4" />Delete</Button></div></div></div>)}</div>}
      </Card>
    </div>
  );
}

function NotFound() {
  return <StateBlock title="Page not found" message="The route you opened does not exist." action={<Link to="/"><Button>Go home</Button></Link>} />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicOnly><AuthPage mode="login" /></PublicOnly>} />
          <Route path="/signup" element={<PublicOnly><AuthPage mode="signup" /></PublicOnly>} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/quizzes" element={<Protected><Quizzes /></Protected>} />
          <Route path="/quizzes/:id" element={<Protected><QuizDetails /></Protected>} />
          <Route path="/quiz/:id/take" element={<Protected><TakeQuiz /></Protected>} />
          <Route path="/results/:attemptId" element={<Protected><Results /></Protected>} />
          <Route path="/history" element={<Protected><History /></Protected>} />
          <Route path="/leaderboard" element={<Protected><Leaderboard /></Protected>} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="/admin" element={<AdminProtected><AdminDashboard /></AdminProtected>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}
