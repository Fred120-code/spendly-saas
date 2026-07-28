"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import { useUser } from "@clerk/nextjs";
import {
  AlertTriangle,
  ArrowRightLeft,
  Landmark,
  PiggyBank,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  AreaChart,
  Area,
} from "recharts";
import ChatIA from "../components/ChatIA";
import RapportAI from "../components/RapportAI";
import { fetchDashboardData } from "@/store/dashboardSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getMyDailyExpenseAction } from "@/modules/transactions/transaction.actions";

const page = () => {
  const { user } = useUser();
  const dispatch = useAppDispatch();

  // On lit directement depuis le store Redux, plus de useState
  const {
    totalAmount,
    totalCount,
    totalEndBuget,
    budgetData,
    pieData,
    transactions,
    dailyExpenses,
    loading,
  } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    if (user) {
      dispatch(fetchDashboardData());
    }
  }, [user, dispatch]);

  // --- Statistiques dérivées, calculées à partir des données déjà chargées ---
  const totalRemaining = budgetData.reduce(
    (sum, b) => sum + (b.totalBudgetAmount - b.totalTransactionAmount),
    0,
  );

  const watchBudgets = budgetData.filter(
    (b) =>
      b.totalBudgetAmount > 0 &&
      b.totalTransactionAmount / b.totalBudgetAmount >= 0.9,
  );

  const avgPerTransaction =
    totalCount && totalCount > 0 && totalAmount !== null
      ? Math.round(totalAmount / totalCount)
      : 0;

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <Wrapper>
      {/* Page Header */}
      <div className="mb-8 pt-8 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Bonjour {user?.firstName ?? ""} 👋
          </h1>
          <p className="text-gray-400 text-base md:text-lg capitalize">
            {today} — voici un résumé de vos finances
          </p>
        </div>
        {avgPerTransaction > 0 && (
          <div className="text-sm text-gray-500">
            Dépense moyenne :{" "}
            <span className="text-[#E0FF67] font-semibold">
              {avgPerTransaction} FCFA
            </span>{" "}
            / transaction
          </div>
        )}
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-8 pb-12">
          {/* Bandeau d'alerte si des budgets approchent de leur limite */}
          {watchBudgets.length > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#FF4C4C]/10 border border-[#FF4C4C]/30">
              <AlertTriangle className="w-5 h-5 text-[#FF4C4C] shrink-0" />
              <p className="text-sm text-white">
                <span className="font-semibold text-[#FF4C4C]">
                  {watchBudgets.length} budget
                  {watchBudgets.length > 1 ? "s" : ""}
                </span>{" "}
                {watchBudgets.length > 1 ? "approchent" : "approche"} de leur
                limite : {watchBudgets.map((b) => b.budgetName).join(", ")}
              </p>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard
              label="Transactions"
              value={totalCount !== null ? String(totalCount) : "—"}
              icon={ArrowRightLeft}
            />
            <KpiCard
              label="Total des dépenses"
              value={totalAmount !== null ? `${totalAmount}` : "—"}
              suffix="FCFA"
              icon={Landmark}
            />
            <KpiCard
              label="Budget atteint"
              value={totalEndBuget || "—"}
              icon={ShieldCheck}
            />
            <KpiCard
              label="Reste disponible"
              value={`${totalRemaining}`}
              suffix="FCFA"
              icon={PiggyBank}
              tone={totalRemaining < 0 ? "danger" : "success"}
            />
          </div>
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Double BarChart — visible uniquement sur grand écran */}
            <div className="hidden lg:block p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-[#E0FF67]/20 hover:border-[#E0FF67]/40 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white">
                  Budget vs Dépenses
                </h3>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#E0FF67] inline-block" />
                    Alloué
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#FF4C4C] inline-block" />
                    Dépensé
                  </span>
                </div>
              </div>
              <p className="text-gray-500 text-xs mb-6">
                Comparaison par catégorie de budget
              </p>

              {budgetData && budgetData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={budgetData}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                    barCategoryGap="30%"
                    barGap={4}
                  >
                    <XAxis
                      dataKey="budgetName"
                      stroke="#4B5563"
                      tick={{ fill: "#9CA3AF", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1D283A",
                        border: "1px solid rgba(224,255,103,0.2)",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                      formatter={(value: number, name: string) => [
                        `${value.toLocaleString("fr-FR")} FCFA`,
                        name === "totalBudgetAmount" ? "Alloué" : "Dépensé",
                      ]}
                      cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    />
                    {/* Barre 1 : montant alloué */}
                    <Bar
                      dataKey="totalBudgetAmount"
                      fill="#E0FF67"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={32}
                    />
                    {/* Barre 2 : montant dépensé */}
                    <Bar
                      dataKey="totalTransactionAmount"
                      fill="#FF4C4C"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
                  Aucun budget créé pour le moment
                </div>
              )}
            </div>

            {/* AreaChart — évolution des dépenses sur 30 jours */}
            <DailyExpensesChart/>

            {/* Sur mobile : version simplifiée à la place du double BarChart */}
            <div className="lg:hidden p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-[#E0FF67]/20">
              <h3 className="text-lg font-bold text-white mb-4">Budgets</h3>
              <div className="space-y-4">
                {budgetData.map((b) => {
                  const pct =
                    b.totalBudgetAmount > 0
                      ? Math.min(
                          (b.totalTransactionAmount / b.totalBudgetAmount) *
                            100,
                          100,
                        )
                      : 0;
                  const status =
                    pct >= 100 ? "#FF4C4C" : pct >= 70 ? "#E0FF67" : "#3EF583";
                  return (
                    <div key={b.budgetName}>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{b.budgetName}</span>
                        <span style={{ color: status }}>
                          {b.totalTransactionAmount.toLocaleString("fr-FR")} /{" "}
                          {b.totalBudgetAmount.toLocaleString("fr-FR")} FCFA
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: status }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Transactions + colonne IA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 cursor-pointer">
            {/* Transactions List */}
            <div className="lg:col-span-2 p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-[#E0FF67]/20 hover:border-[#E0FF67]/40 transition-all duration-300">
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Receipt className="w-12 h-12 text-gray-600 mb-4" />
                  <p className="text-gray-400 text-lg">
                    Aucune transaction pour le moment
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    Commencez à ajouter vos transactions pour voir vos
                    statistiques
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Transactions Récentes
                  </h2>
                  <div className="space-y-0 divide-y divide-[#E0FF67]/10">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0 hover:bg-white/5 px-4 -mx-4 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#E0FF67]/10 text-xl shrink-0">
                            {tx.emoji}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">
                              {tx.budgetName}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {tx.description}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {tx.createdAt.toLocaleDateString("fr-FR")} à{" "}
                              {tx.createdAt.toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-[#E0FF67]">
                            {tx.amount} FCFA
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Colonne IA : rapport + chat */}
            {/* <div className="flex flex-col gap-6">
              <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/2 border border-[#E0FF67]/20 hover:border-[#E0FF67]/40 transition-all duration-300">
                <div className="p-1">
                  <RapportAI />
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/2 border border-[#E0FF67]/20 hover:border-[#E0FF67]/40 transition-all duration-300 flex-1">
                <ChatIA />
              </div>
            </div> */}
          </div>
        </div>
      )}
    </Wrapper>
  );
};

/** Carte KPI réutilisable, accent variable selon `tone`. */
function KpiCard({
  label,
  value,
  suffix,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  suffix?: string;
  icon: React.ElementType;
  tone?: "default" | "success" | "danger";
}) {
  const toneStyles = {
    default: {
      border: "border-[#E0FF67]/30 hover:border-[#E0FF67]/60",
      iconBg: "from-[#E0FF67] to-[#c4e933]",
      valueHover: "group-hover:text-[#E0FF67]",
    },
    success: {
      border: "border-[#3EF583]/30 hover:border-[#3EF583]/60",
      iconBg: "from-[#3EF583] to-[#a8d600]",
      valueHover: "group-hover:text-[#3EF583]",
    },
    danger: {
      border: "border-[#FF4C4C]/30 hover:border-[#FF4C4C]/60",
      iconBg: "from-[#FF4C4C] to-[#c4e933]",
      valueHover: "group-hover:text-[#FF4C4C]",
    },
  }[tone];

  return (
    <div
      className={`group p-6 lg:p-7 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border ${toneStyles.border} transition-all duration-300 cursor-pointer`}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-gray-400 text-sm font-medium">{label}</p>
          <h3
            className={`text-2xl lg:text-3xl font-bold text-white transition-colors ${toneStyles.valueHover}`}
          >
            {value}
          </h3>
          {suffix && <p className="text-xs text-gray-500">{suffix}</p>}
        </div>
        <div
          className={`p-3.5 bg-gradient-to-br ${toneStyles.iconBg} rounded-xl group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-5 h-5 text-[#151425]" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton affiché pendant le chargement, à la place du simple spinner. */
function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-white/5"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-white/5" />
        <div className="h-80 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-white/5" />
      </div>
      <div className="h-64 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-white/5" />
    </div>
  );
}

const PERIODS = [
  { label: "30j", days: 30 },
  { label: "90j", days: 90 },
  { label: "180j", days: 180 },
];

function DailyExpensesChart() {
  const [activeDays, setActiveDays] = useState(30);
  const [data, setData] = useState<{ date: string; montant: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getMyDailyExpenseAction(activeDays)
      .then(setData)
      .finally(() => setLoading(false));
  }, [activeDays]);

  // Calcul du total sur la période affichée
  const total = data.reduce((sum, d) => sum + d.montant, 0);

  // Jour avec la dépense la plus haute (pour l'annotation)
  const peak = data.reduce((max, d) => (d.montant > max.montant ? d : max), {
    date: "",
    montant: 0,
  });

  return (
    <div className="lg:col-span-1 p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-[#E0FF67]/20 hover:border-[#E0FF67]/40 transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">
            Évolution des dépenses
          </h3>
          <p className="text-gray-500 text-xs mt-1">
            Total sur la période :{" "}
            <span className="text-[#E0FF67] font-semibold">
              {total.toLocaleString("fr-FR")} FCFA
            </span>
          </p>
        </div>

        {/* Sélecteur de période */}
        <div className="flex items-center gap-1 bg-black/20 rounded-xl p-1 border border-white/5 shrink-0">
          {PERIODS.map(({ label, days }) => (
            <button
              key={days}
              onClick={() => setActiveDays(days)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeDays === days
                  ? "bg-[#E0FF67] text-[#151425] shadow-[0_0_10px_rgba(224,255,103,0.3)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Pic de dépense */}
      {peak.montant > 0 && !loading && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E0FF67] shrink-0" />
          <p className="text-xs text-gray-400">
            Journée la plus chargée :{" "}
            <span className="text-white font-medium">{peak.date}</span>
            {" — "}
            <span className="text-[#E0FF67] font-semibold">
              {peak.montant.toLocaleString("fr-FR")} FCFA
            </span>
          </p>
        </div>
      )}

      {/* Chart */}
      {loading ? (
        <div className="h-64 rounded-xl bg-white/5 animate-pulse" />
      ) : data.length === 0 || total === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 text-sm gap-2">
          Aucune dépense sur cette période
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 4, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E0FF67" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#E0FF67" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              stroke="#4B5563"
              tick={{ fill: "#6B7280", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              // Adapte automatiquement le nombre de labels à la période
              interval={activeDays === 30 ? 4 : activeDays === 90 ? 14 : 29}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1D283A",
                border: "1px solid rgba(224,255,103,0.2)",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "12px",
                padding: "8px 12px",
              }}
              formatter={(value: number) => [
                `${value.toLocaleString("fr-FR")} FCFA`,
                "Dépensé",
              ]}
              cursor={{ stroke: "rgba(224,255,103,0.15)", strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="montant"
              stroke="#E0FF67"
              strokeWidth={2}
              fill="url(#areaGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#E0FF67",
                stroke: "#151425",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default page;
