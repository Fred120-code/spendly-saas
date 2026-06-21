"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import { useUser } from "@clerk/nextjs";
import { getMyEndBudgetCountAction, getMyBudgetDistributionAction, getMyPieChartDataAction } from "@/modules/budgets/budget.actions";
import {
  getMyTotalTransactionAmountAction,
  getMyTotalTransactionCountAction,
  getMyLastTransactionsAction,
} from "@/modules/transactions/transaction.actions";
import { ArrowRightLeft, Landmark, Send, ShieldMinus } from "lucide-react";
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

const page = () => {
  const { user } = useUser();

  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [totalEndBuget, setTotalEndBuget] = useState<string | null>(null);
  const [budgetData, setBudgetData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transactions[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!user) return;

      const [amount, count, endBuget, budgetdata, piedata, lastransactions] = await Promise.all([
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
      console.error("Erreur lors de la recupération des données", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return (
    <Wrapper>
      {/* Page Header */}
      <div className="mb-8 pt-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Tableau de Bord
        </h1>
        <p className="text-gray-400 text-base md:text-lg">
          Vue d'ensemble de vos finances
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <span className="loading loading-dots loading-xl text-[#E0FF67]"></span>
            <p className="text-gray-400">Chargement de vos données...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8 pb-12">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Transactions Card */}
            <div className="group p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-[#E0FF67]/10 to-[#c4e933]/5 border border-[#E0FF67]/30 hover:border-[#E0FF67]/60 hover:bg-gradient-to-br hover:from-[#E0FF67]/20 hover:to-[#c4e933]/10 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm font-medium">
                    Nombre de transactions
                  </p>
                  <h3 className="text-3xl lg:text-4xl font-bold text-white group-hover:text-[#E0FF67] transition-colors">
                    {totalCount !== null ? totalCount : "—"}
                  </h3>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#E0FF67] to-[#c4e933] rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <ArrowRightLeft className="w-6 h-6 text-[#151425]" />
                </div>
              </div>
            </div>

            {/* Total Expenses Card */}
            <div className="group p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-[#E0FF67]/10 to-[#c4e933]/5 border border-[#E0FF67]/30 hover:border-[#E0FF67]/60 hover:bg-gradient-to-br hover:from-[#E0FF67]/20 hover:to-[#c4e933]/10 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm font-medium">
                    Total des dépenses
                  </p>
                  <h3 className="text-3xl lg:text-4xl font-bold text-white group-hover:text-[#E0FF67] transition-colors">
                    {totalAmount !== null ? `${totalAmount}` : "—"}
                  </h3>
                  <p className="text-xs text-gray-500">FCFA</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#E0FF67] to-[#c4e933] rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Landmark className="w-6 h-6 text-[#151425]" />
                </div>
              </div>
            </div>

            {/* Budget Status Card */}
            <div className="group p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-[#E0FF67]/10 to-[#c4e933]/5 border border-[#E0FF67]/30 hover:border-[#E0FF67]/60 hover:bg-gradient-to-br hover:from-[#E0FF67]/20 hover:to-[#c4e933]/10 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm font-medium">
                    Budget Atteint
                  </p>
                  <h3 className="text-3xl lg:text-4xl font-bold text-white group-hover:text-[#E0FF67] transition-colors">
                    {totalEndBuget || "—"}
                  </h3>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#E0FF67] to-[#c4e933] rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <ShieldMinus className="w-6 h-6 text-[#151425]" />
                </div>
              </div>
            </div>

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

            {/* Pie Chart */}
            <div className="p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-[#E0FF67]/20 hover:border-[#E0FF67]/40 transition-all duration-300">
              <h3 className="text-xl font-bold text-white mb-6">Répartition</h3>
              {pieData && pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
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
              ) : (
                <div className="flex items-center justify-center h-80 text-gray-400">
                  Aucune donnée
                </div>
              )}
            </div>
          </div>

          {/* Transactions List */}
          <div className="p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-[#E0FF67]/20 hover:border-[#E0FF67]/40 transition-all duration-300">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Send className="w-12 h-12 text-gray-600 mb-4" />
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
                        <div className="text-2xl">{tx.emoji}</div>
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

          {/* AI Chat Section */}
          <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/2 border border-[#E0FF67]/20 hover:border-[#E0FF67]/40 transition-all duration-300">
            <ChatIA />
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default page;
