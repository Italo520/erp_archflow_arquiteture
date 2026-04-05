'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Este wrapper lida com o carregamento dinâmico no lado do cliente
// para evitar erros de SSR em Server Components.
const DashboardCharts = dynamic(
    () => import("./DashboardCharts").then(mod => mod.DashboardCharts),
    { 
        ssr: false,
        loading: () => <div className="h-[350px] w-full animate-pulse bg-muted rounded-xl" />
    }
);

export function DashboardChartsWrapper(props) {
    return <DashboardCharts {...props} />;
}
