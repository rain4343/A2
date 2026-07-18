import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, Redirect } from 'wouter';
import { Shell } from '@/components/layout/Shell';
import { AuthProvider, useAuth } from '@/lib/auth';

import Dashboard from '@/pages/Dashboard';
import StaffList from '@/pages/StaffList';
import StaffForm from '@/pages/StaffForm';
import Departments from '@/pages/Departments';
import DepartmentDetail from '@/pages/DepartmentDetail';
import SystemAdmin from '@/pages/SystemAdmin';
import Documents from '@/pages/Documents';
import DocumentForm from '@/pages/DocumentForm';
import DocumentDetail from '@/pages/DocumentDetail';
import DocumentSign from '@/pages/DocumentSign';
import Profile from '@/pages/Profile';
import Chat from '@/pages/Chat';
import Login from '@/pages/Login';
import Cases from '@/pages/Cases';
import CaseDetail from '@/pages/CaseDetail';
import Reports from '@/pages/Reports';
import AuditLog from '@/pages/AuditLog';
import SearchPage from '@/pages/SearchPage';
import NotificationsPage from '@/pages/NotificationsPage';

const queryClient = new QueryClient();

function ProtectedRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Shell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/staff" component={StaffList} />
        <Route path="/staff/new">
          {user.is_system_admin ? <StaffForm /> : <Redirect to="/staff" />}
        </Route>
        <Route path="/staff/:id">
          {user.is_system_admin ? <StaffForm /> : <Redirect to="/staff" />}
        </Route>
        <Route path="/departments" component={Departments} />
        <Route path="/departments/:id" component={DepartmentDetail} />
        <Route path="/roles">
          {user.is_system_admin ? <SystemAdmin /> : <Redirect to="/" />}
        </Route>
        <Route path="/admin">
          {user.is_system_admin ? <SystemAdmin /> : <Redirect to="/" />}
        </Route>
        <Route path="/documents" component={Documents} />
        <Route path="/documents/new" component={DocumentForm} />
        <Route path="/documents/:id/sign" component={DocumentSign} />
        <Route path="/documents/:id/edit" component={DocumentForm} />
        <Route path="/documents/:id" component={DocumentDetail} />
        <Route path="/cases" component={Cases} />
        <Route path="/cases/:id" component={CaseDetail} />
        <Route path="/reports" component={Reports} />
        <Route path="/audit" component={AuditLog} />
        <Route path="/search" component={SearchPage} />
        <Route path="/notifications" component={NotificationsPage} />
        <Route path="/chat" component={Chat} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AuthProvider>
            <ProtectedRouter />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
