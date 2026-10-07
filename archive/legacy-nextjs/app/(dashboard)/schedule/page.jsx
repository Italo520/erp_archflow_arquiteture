'use client';

import React from 'react';

const Schedule = () => {
    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden relative">
            {/* Header & Stats */}
            <div className="flex-none p-6 pb-2 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Cronograma Geral</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Visão unificada de prazos e entregas de projetos ativos.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-200 dark:bg-[#233648] p-1 rounded-lg flex text-sm font-medium">
                            <button className="bg-white dark:bg-[#111a22] text-primary shadow-sm px-3 py-1.5 rounded-md transition-all">Gantt</button>
                            <button className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">Lista</button>
                            <button className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">Calendário</button>
                        </div>
                        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-background-dark px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all">
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            <span>Novo Marco</span>
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Projetos Ativos', val: '12', sub: '+2 novos', color: 'primary', icon: 'folder_open' },
                        { label: 'Entregas na Semana', val: '5', sub: 'Próx: Residência Villa', color: 'orange-500', icon: 'event_note' },
                        { label: 'Marcos Concluídos', val: '32', sub: '+12% vs mês ant.', color: 'emerald-500', icon: 'check_circle' },
                        { label: 'Em Atraso', val: '2', sub: '-1% vs mês ant.', color: 'rose-500', icon: 'warning' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-[#151f28] rounded-xl border border-gray-200 dark:border-slate-700/50 p-4 flex flex-col justify-between hover:border-primary/50 transition-colors cursor-pointer group">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.label}</span>
                                <span className={`material-symbols-outlined text-${stat.color} bg-${stat.color}/10 p-1.5 rounded-lg text-[20px]`} style={{ color: stat.color === 'primary' ? '#38e07b' : '' }}>{stat.icon}</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">{stat.val}</span>
                                <span className="text-xs text-gray-400 font-medium mb-1">{stat.sub}</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div className={`h-full rounded-full ${stat.color === 'primary' ? 'bg-primary' : `bg-${stat.color}`}`} style={{ width: '75%' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Gantt Area */}
            <div className="flex-1 flex flex-col p-6 pt-2 overflow-hidden">
                <div className="flex-1 bg-white dark:bg-[#151f28] border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden flex relative">
                    {/* Sidebar List */}
                    <div className="w-80 flex-none border-r border-gray-200 dark:border-slate-700 flex flex-col bg-white dark:bg-[#151f28] z-10">
                        <div className="h-12 border-b border-gray-200 dark:border-slate-700 flex items-center px-4 bg-slate-50 dark:bg-[#1a2632]">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex-1">Tarefa / Projeto</span>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20 text-right">Duração</span>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <div className="border-b border-gray-100 dark:border-slate-800/50">
                                <div className="flex items-center h-10 px-4 hover:bg-slate-50 dark:hover:bg-[#1e2a36] cursor-pointer group">
                                    <span className="material-symbols-outlined text-slate-400 text-[18px] mr-2">arrow_drop_down</span>
                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate flex-1">Residência Villa Lobos</span>
                                    <span className="text-xs text-slate-400">45d</span>
                                </div>
                                <div className="flex items-center h-10 pl-10 pr-4 bg-slate-50/50 dark:bg-[#111a22]/30 border-l-[3px] border-primary">
                                    <span className="text-sm text-slate-600 dark:text-slate-300 truncate flex-1">Estudo Preliminar</span>
                                    <span className="text-xs text-slate-400">12d</span>
                                </div>
                                <div className="flex items-center h-10 pl-10 pr-4 bg-slate-50/50 dark:bg-[#111a22]/30 border-l-[3px] border-transparent">
                                    <span className="text-sm text-slate-600 dark:text-slate-300 truncate flex-1">Projeto Legal</span>
                                    <span className="text-xs text-slate-400">15d</span>
                                </div>
                            </div>
                            <div className="border-b border-gray-100 dark:border-slate-800/50">
                                <div className="flex items-center h-10 px-4 hover:bg-slate-50 dark:hover:bg-[#1e2a36] cursor-pointer group">
                                    <span className="material-symbols-outlined text-slate-400 text-[18px] mr-2 -rotate-90">arrow_drop_down</span>
                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate flex-1">Edifício Horizon</span>
                                    <span className="text-xs text-slate-400">120d</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Bars (Visual Mockup) */}
                    <div className="flex-1 overflow-x-auto bg-slate-50/30 dark:bg-[#111a22]/50 relative">
                        <div className="h-12 border-b border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a2632] sticky top-0 z-20 flex min-w-[800px]">
                            {['01 - 07 Out', '08 - 14 Out', '15 - 21 Out'].map((week, i) => (
                                <div key={i} className="w-[300px] border-r border-slate-200 dark:border-slate-700 h-full flex flex-col justify-center px-4">
                                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">{week}</span>
                                </div>
                            ))}
                        </div>
                        <div className="relative min-w-[800px] pt-2">
                            <div className="absolute top-0 bottom-0 left-[180px] w-0.5 bg-primary z-10 pointer-events-none h-full opacity-50"></div>
                            <div className="h-10"></div> {/* Spacer for Project Header */}
                            <div className="h-10 relative flex items-center">
                                <div className="absolute left-[60px] w-[180px] h-6 bg-primary rounded-md shadow-sm flex items-center px-2">
                                    <span className="text-[10px] font-bold text-background-dark truncate">Estudo Preliminar</span>
                                </div>
                            </div>
                            <div className="h-10 relative flex items-center">
                                <div className="absolute left-[250px] w-[120px] h-6 bg-slate-400 dark:bg-slate-600 rounded-md shadow-sm flex items-center px-2 opacity-80">
                                    <span className="text-[10px] font-bold text-white truncate">Proj. Legal</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Schedule;
