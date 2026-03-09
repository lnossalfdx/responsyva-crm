import type { ReactElement } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { queryClient } from "@/services/query-client";
import { AiCenterPage } from "@/pages/ai-center-page";
import { AutomationsPage } from "@/pages/automations-page";
import { ClientPortalPage } from "@/pages/client-portal-page";
import { ClientsPage } from "@/pages/clients-page";
import { ContractsPage } from "@/pages/contracts-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { FinancePage } from "@/pages/finance-page";
import { LeadsPage } from "@/pages/leads-page";
import { LoginPage } from "@/pages/login-page";
import { PipelinePage } from "@/pages/pipeline-page";
import { ProjectDetailPage } from "@/pages/project-detail-page";
import { ProjectsPage } from "@/pages/projects-page";
import { ProposalsPage } from "@/pages/proposals-page";
import { SchedulesPage } from "@/pages/schedules-page";
import { SettingsPage } from "@/pages/settings-page";
import { canAccessFinance, canAccessSettings, isAuthenticated, loadCurrentUser } from "@/services/access-control";

function ProtectedRoute({
  allowed = true,
  children,
}: {
  allowed?: boolean;
  children: ReactElement;
}) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function LoginRoute() {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <LoginPage />;
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginRoute />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "leads", element: <LeadsPage /> },
      { path: "agendamentos", element: <SchedulesPage /> },
      { path: "clientes", element: <ClientsPage /> },
      { path: "pipeline", element: <PipelinePage /> },
      { path: "projetos", element: <ProjectsPage /> },
      { path: "projetos/:projectId", element: <ProjectDetailPage /> },
      { path: "propostas", element: <ProposalsPage /> },
      { path: "contratos", element: <ContractsPage /> },
      {
        path: "financeiro",
        element: (
          <ProtectedRoute allowed={canAccessFinance(loadCurrentUser())}>
            <FinancePage />
          </ProtectedRoute>
        ),
      },
      { path: "automacoes", element: <AutomationsPage /> },
      { path: "ia", element: <AiCenterPage /> },
      {
        path: "configuracoes",
        element: (
          <ProtectedRoute allowed={canAccessSettings(loadCurrentUser())}>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/portal/proposta/:publicId",
    element: <ClientPortalPage />,
  },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
