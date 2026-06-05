"use client";

import React, { useState } from "react";
import NotificationRBAC from "@/components/settings/NotificationRBAC";
import UserPreferences from "@/components/settings/UserPreferences";
import { User, Shield, Bell } from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="flex-1 layout-container flex flex-col w-full px-4 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-foreground text-3xl lg:text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
          Configurações da Conta
        </h1>
        <p className="text-muted-foreground text-base font-normal">
          Gerencie suas informações pessoais, preferências do sistema e
          segurança.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Side Nav */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-card rounded-2xl p-4 sticky top-6 border border-border">
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="px-3 text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
                  Geral
                </h3>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`flex items-center gap-3 px-3 py-3 rounded-full transition-all w-full text-left ${activeTab === "profile" ? "bg-primary text-background-dark shadow-lg shadow-primary/20 font-bold" : "text-muted-foreground hover:bg-muted font-medium"}`}
                  >
                    <User className="size-5" />
                    <span className="text-sm">Meu Perfil</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("security")}
                    className={`flex items-center gap-3 px-3 py-3 rounded-full transition-all w-full text-left ${activeTab === "security" ? "bg-primary text-background-dark shadow-lg shadow-primary/20 font-bold" : "text-muted-foreground hover:bg-muted font-medium"}`}
                  >
                    <Shield className="size-5" />
                    <span className="text-sm">Segurança</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("notifications")}
                    className={`flex items-center gap-3 px-3 py-3 rounded-full transition-all w-full text-left ${activeTab === "notifications" ? "bg-primary text-background-dark shadow-lg shadow-primary/20 font-bold" : "text-muted-foreground hover:bg-muted font-medium"}`}
                  >
                    <Bell className="size-5" />
                    <span className="text-sm">Notificações</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Form */}
        <main className="flex-1 flex flex-col gap-6 min-w-0">
          {activeTab === "profile" && (
            <>
              <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-border">
                <div className="flex flex-col md:flex-row items-center gap-6 w-full">
                  <div className="relative group cursor-pointer">
                    <div
                      className="bg-center bg-no-repeat bg-cover rounded-full size-24 md:size-32 border-4 border-gray-100 dark:border-[#264532]"
                      style={{
                        backgroundImage:
                          'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBwPeVBVhAdHhPTnjLu8NXUQXkHVXwECsmDnblR-iAGOgFLOzWz7J6Zfd8WrH0M5DlZUAmhVBYh8HZ2m_D531rmBQDGv38UuW93AQa5OixelhtnAMNKOwVL7HCaaK3J30MiYJTzFo8GzwWtCx53aGm3teMcqMQ0nGqBCDB8rwCyFwBdLxm-RraL4ComkoLYD7FezZUUWnjLqAcIMMxLp7cQ9T6KO-aGzRUCNixcXdRGmx5oq0HhIOXl-3UXW6nq_M4eumY8GXP374A")',
                      }}
                    ></div>
                  </div>
                  <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <h2 className="text-foreground text-2xl font-bold leading-tight">
                      Carlos Mendes
                    </h2>
                    <p className="text-muted-foreground text-base mb-1">
                      Arquiteto Sênior · ArchERP Pro
                    </p>
                    <p className="text-muted-foreground text-sm">
                      São Paulo, Brasil
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <button className="flex-1 md:flex-none h-10 px-6 bg-primary hover:bg-primary/90 text-background-dark text-sm font-bold rounded-full transition-colors whitespace-nowrap shadow-lg shadow-primary/20">
                    Alterar Foto
                  </button>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 md:p-8 border border-border">
                <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                  <span className="material-symbols-outlined text-primary">
                    badge
                  </span>
                  <h3 className="text-foreground text-xl font-bold">
                    Informações Pessoais
                  </h3>
                </div>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-muted-foreground text-sm font-medium ml-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      defaultValue="Carlos Mendes"
                      className="h-12 w-full rounded-xl bg-muted border-transparent focus:border-primary focus:ring-0 text-foreground px-4 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-muted-foreground text-sm font-medium ml-1">
                      Cargo
                    </label>
                    <input
                      type="text"
                      defaultValue="Arquiteto Sênior"
                      className="h-12 w-full rounded-xl bg-muted border-transparent focus:border-primary focus:ring-0 text-foreground px-4 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-muted-foreground text-sm font-medium ml-1">
                      Biografia
                    </label>
                    <textarea
                      rows={4}
                      defaultValue="Arquiteto com mais de 15 anos de experiência."
                      className="w-full rounded-xl bg-muted border-transparent focus:border-primary focus:ring-0 text-foreground px-4 py-3 transition-all resize-none"
                    ></textarea>
                  </div>
                </form>
                <div className="mt-8 pt-6 border-t border-border flex justify-end">
                  <button className="h-12 px-8 bg-primary hover:bg-primary/90 text-background-dark text-sm font-bold rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">
                      save
                    </span>
                    Salvar Alterações
                  </button>
                </div>
              </div>

              <UserPreferences />
            </>
          )}

          {activeTab === "security" && (
            <div className="bg-card rounded-2xl p-6 md:p-8 border border-border text-center">
              <Shield className="size-16 text-gray-300 dark:text-neutral-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                Segurança da Conta
              </h3>
              <p className="text-gray-500">
                Página de segurança em construção.
              </p>
            </div>
          )}

          {activeTab === "notifications" && <NotificationRBAC />}
        </main>
      </div>
    </div>
  );
};

export default Settings;
