"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import { useUser } from "@clerk/nextjs";
import {
  getMyEndBudgetCountAction,
  getMyBudgetDistributionAction,
  getMyPieChartDataAction,
} from "@/modules/budgets/budget.actions";
import {
  getMyTotalTransactionAmountAction,
  getMyTotalTransactionCountAction,
  getMyLastTransactionsAction,
} from "@/modules/transactions/transaction.actions";
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
  Pie,
  PieChart,
} from "recharts";
import { Transactions } from "@/type";
import ChatIA from "../components/ChatIA";
import RapportAI from "../components/RapportAI";

interface BudgetDistribution {
  budgetName: string;
  totalBudgetAmount: number;
  totalTransactionAmount: number;
}

interface PieDatum {
  name: string;
  value: number;
}

const page = () => {
  const { user } = useUser();

  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [totalEndBuget, setTotalEndBuget] = useState<string | null>(null);
  const [budgetData, setBudgetData] = useState<BudgetDistribution[]>([]);
  const [pieData, setPieData] = useState<PieDatum[]>([]);
  const [transactions, setTransactions] = useState<Transactions[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!user) return;

      const [amount, count, endBuget, budgetdata, piedata, lastransactions] =
        await Promise.all([
          getMyTotalTransactionAmountAction(),
          getMyTotalTransactionCountAction(),
          getMyEndBudgetCountAction(),
          getMyBudgetDistributionAction(),
          getMyPieChartDataAction(),
          getMyLastTransactionsAction(5),
        ]);

      setTotalAmount(amount ?? null);
      setTotalCount(count ?? null);
      setTotalEndBuget(endBuget ?? null);
      setBudgetData(budgetdata ?? []);
      setPieData(piedata ?? []);
      setTransactions(lastransactions ?? []);

      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bar Chart */}
            <div className="lg:col-span-2 p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-[#E0FF67]/20 hover:border-[#E0FF67]/40 transition-all duration-300">
              <h3 className="text-xl font-bold text-white mb-6">
                Suivi par Budget
              </h3>
              <div className="w-full overflow-x-auto">
                {budgetData && budgetData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={budgetData}
                      margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                    >
                      <XAxis dataKey="budgetName" stroke="#E0FF67" />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#151425",
                          border: "1px solid #E0FF67",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="totalBudgetAmount"
                        fill="#E0FF67"
                        radius={[8, 8, 0, 0]}
                      >
                        {budgetData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={["#E0FF67", "#c4e933", "#a8d600"][index % 3]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-80 text-gray-400">
                    Aucune donnée disponible
                  </div>
                )}
              </div>
            </div>

            {/* Pie Chart + légende */}
            <div className="p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-[#E0FF67]/20 hover:border-[#E0FF67]/40 transition-all duration-300">
              <h3 className="text-xl font-bold text-white mb-6">Répartition</h3>
              {pieData && pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`slice-${index}`}
                            fill={
                              [
                                "#E0FF67",
                                "#c4e933",
                                "#a8d600",
                                "#3EF583",
                                "#FF4C4C",
                              ][index % 5]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#151425",
                          border: "1px solid #E0FF67",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-3 mt-4 justify-center">
                    {pieData.map((entry, index) => (
                      <div
                        key={entry.name}
                        className="flex items-center gap-1.5"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: [
                              "#E0FF67",
                              "#c4e933",
                              "#a8d600",
                              "#3EF583",
                              "#FF4C4C",
                            ][index % 5],
                          }}
                        />
                        <span className="text-xs text-gray-400">
                          {entry.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-80 text-gray-400">
                  Aucune donnée
                </div>
              )}
            </div>
          </div>

          {/* Transactions + colonne IA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
      className={`group p-6 lg:p-7 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border ${toneStyles.border} transition-all duration-300`}
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

export default page;
