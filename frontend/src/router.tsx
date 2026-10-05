import React from "react";
import {
  createRouter,
  createRoute,
  createRootRoute,
  Navigate,
  Outlet,
} from "@tanstack/react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { DashboardView } from "./views/DashboardView";
import { ProjectsKanbanView } from "./views/ProjectsKanbanView";
import { ProjectDetailView } from "./views/ProjectDetailView";
import { ClientsView } from "./views/ClientsView";
import { InspectionsView } from "./views/InspectionsView";
import { ActivitiesView } from "./views/ActivitiesView";
import { DocumentsView } from "./views/DocumentsView";
import { ReportsView } from "./views/ReportsView";
import { ScheduleView } from "./views/ScheduleView";
import { SettingsView } from "./views/SettingsView";
import { LoginView } from "./views/LoginView";

// Root Route com Shell de Layout
const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});

// Redirecionamento da raiz / para /dashboard
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Navigate to="/dashboard" replace />,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardView,
});

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects",
  component: ProjectsKanbanView,
});

const projectDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects/$projectId",
  component: ProjectDetailView,
});

const clientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/clients",
  component: ClientsView,
});

const inspectionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/inspections",
  component: InspectionsView,
});

const activitiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/activities",
  component: ActivitiesView,
});

const documentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/documents",
  component: DocumentsView,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  component: ReportsView,
});

const scheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/schedule",
  component: ScheduleView,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsView,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginView,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  projectsRoute,
  projectDetailRoute,
  clientsRoute,
  inspectionsRoute,
  activitiesRoute,
  documentsRoute,
  reportsRoute,
  scheduleRoute,
  settingsRoute,
  loginRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
