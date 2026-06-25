"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import { useUser } from "@clerk/nextjs";
import { Transactions } from "@/type";
import { getMyTransactionsByPeriodAction } from "@/modules/transactions/transaction.actions";
import {
  Send,
  TrendingDown,
  Calendar,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const page = () => {
  const user = useUser();
  const [transactions, setTransactions] = useState<Transactions[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activePeriod, setActivePeriod] = useState("last30");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const periods = [
    { id: "last7", label: "7 derniers jours" },
    { id: "last30", label: "30 derniers jours" },
    { id: "last90", label: "90 derniers jours" },
    { id: "all", label: "Tous" },
  ];

  const fetchTransaction = async (period: string) => {
    if (user?.user) {
      setLoading(true);
      try {
        const transactionData = await getMyTransactionsByPeriodAction(period);
        setTransactions(transactionData);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la recuperation des transactions", error);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchTransaction(activePeriod);
  }, [activePeriod, user?.user?.primaryEmailAddress?.emailAddress]);

  // Filtrer les transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.budgetName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBudget =
      selectedBudget === null || tx.budgetName === selectedBudget;
    return matchesSearch && matchesBudget;
  });

  // Réinitialiser la page à 1 quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBudget, activePeriod]);

  // Calculer la pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex,
  );

  // Calculer les statistiques
  const totalAmount = filteredTransactions.reduce(
    (sum, tx) => sum + tx.amount,
    0,
  );
  const avgTransaction =
    filteredTransactions.length > 0
      ? totalAmount / filteredTransactions.length
      : 0;
  const highestTransaction = Math.max(
    ...(filteredTransactions.map((tx) => tx.amount) || [0]),
  );
  const budgets = Array.from(new Set(transactions.map((tx) => tx.budgetName)));

  return (
    <Wrapper>
      {/* Page Header */}
      <div className="mb-8 pt-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Transactions
        </h1>
        <p className="text-gray-400 text-base md:text-lg">
          Historique complet de vos transactions
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#E0FF67]/10 to-[#c4e933]/5 border border-[#E0FF67]/30 hover:border-[#E0FF67]/60 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm font-medium">Total</p>
            <TrendingDown className="w-5 h-5 text-[#E0FF67]" />
          </div>
          <h3 className="text-2xl lg:text-3xl font-bold text-white">
            {totalAmount.toLocaleString("fr-FR")}
          </h3>
          <p className="text-xs text-gray-500 mt-1">FCFA</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#E0FF67]/10 to-[#c4e933]/5 border border-[#E0FF67]/30 hover:border-[#E0FF67]/60 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm font-medium">Nombre</p>
            <Send className="w-5 h-5 text-[#E0FF67]" />
          </div>
          <h3 className="text-2xl lg:text-3xl font-bold text-white">
            {filteredTransactions.length}
          </h3>
          <p className="text-xs text-gray-500 mt-1">transactions</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#E0FF67]/10 to-[#c4e933]/5 border border-[#E0FF67]/30 hover:border-[#E0FF67]/60 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm font-medium">Moyenne</p>
            <Filter className="w-5 h-5 text-[#E0FF67]" />
          </div>
          <h3 className="text-2xl lg:text-3xl font-bold text-white">
            {avgTransaction.toLocaleString("fr-FR", {
              maximumFractionDigits: 0,
            })}
          </h3>
          <p className="text-xs text-gray-500 mt-1">par transaction</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#E0FF67]/10 to-[#c4e933]/5 border border-[#E0FF67]/30 hover:border-[#E0FF67]/60 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm font-medium">Plus élevée</p>
            <Calendar className="w-5 h-5 text-[#E0FF67]" />
          </div>
          <h3 className="text-2xl lg:text-3xl font-bold text-white">
            {highestTransaction.toLocaleString("fr-FR")}
          </h3>
          <p className="text-xs text-gray-500 mt-1">FCFA</p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-6 mb-8">
        {/* Period Filter */}
        <div className="flex flex-wrap gap-2">
          {periods.map((period) => (
            <button
              key={period.id}
              onClick={() => setActivePeriod(period.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                activePeriod === period.id
                  ? "bg-gradient-to-r from-[#E0FF67] to-[#c4e933] text-[#151425] shadow-lg"
                  : "bg-white/5 border border-[#E0FF67]/30 text-gray-300 hover:border-[#E0FF67]/60"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Search and Budget Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
            <input
              type="text"
              placeholder="Rechercher une transaction..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-[#E0FF67]/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#E0FF67] transition-all"
            />
          </div>

          {/* Budget Filter */}
          <select
            value={selectedBudget || ""}
            onChange={(e) => setSelectedBudget(e.target.value || null)}
            className="px-4 py-3 bg-white/5 border border-[#E0FF67]/30 rounded-lg text-white focus:outline-none focus:border-[#E0FF67] transition-all appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23E0FF67' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
              paddingRight: "2.5rem",
            }}
          >
            <option value="" className="text-black">
              Tous les budgets
            </option>
            {budgets.map((budget) => (
              <option key={budget} value={budget} className="text-black">
                {budget}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table/List */}
      <div className="p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-[#E0FF67]/20 hover:border-[#E0FF67]/40 transition-all duration-300">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-4">
              <span className="loading loading-dots loading-xl text-[#E0FF67]"></span>
              <p className="text-gray-400">Chargement des transactions...</p>
            </div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Send className="w-12 h-12 text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg mb-2">
              {searchTerm || selectedBudget
                ? "Aucune transaction trouvée"
                : "Aucune transaction pour le moment"}
            </p>
            <p className="text-gray-600 text-sm">
              {searchTerm || selectedBudget
                ? "Essayez une autre recherche ou un autre filtre"
                : "Commencez à ajouter vos transactions"}
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Historique des transactions
            </h2>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E0FF67]/20">
                    <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">
                      Date
                    </th>
                    <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">
                      Budget
                    </th>
                    <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">
                      Description
                    </th>
                    <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">
                      Catégorie
                    </th>
                    <th className="text-right py-4 px-4 text-gray-400 font-semibold text-sm">
                      Montant
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((tx, index) => (
                    <tr
                      key={tx.id}
                      className={`transition-colors ${
                        index % 2 === 0 ? "bg-white/2" : ""
                      } hover:bg-white/5 border-b border-[#E0FF67]/10`}
                    >
                      <td className="py-4 px-4 text-white text-sm">
                        {tx.createdAt.toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block px-3 py-1 bg-[#E0FF67]/20 text-[#E0FF67] rounded-full text-sm font-medium">
                          {tx.budgetName}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-sm">
                        {tx.description}
                      </td>
                      <td className="py-4 px-4 text-2xl text-center">
                        {tx.emoji}
                      </td>
                      <td className="py-4 px-4 text-right text-[#E0FF67] font-bold text-sm">
                        {tx.amount.toLocaleString("fr-FR")} FCFA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Affichage {startIndex + 1} à{" "}
                  {Math.min(endIndex, filteredTransactions.length)} sur{" "}
                  {filteredTransactions.length} transactions
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-[#E0FF67]/30 text-gray-300 hover:border-[#E0FF67]/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Précédent
                  </button>

                  <div className="flex items-center gap-2 px-4 py-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg font-medium transition-all duration-300 ${
                            currentPage === page
                              ? "bg-gradient-to-r from-[#E0FF67] to-[#c4e933] text-[#151425] shadow-lg"
                              : "bg-white/5 border border-[#E0FF67]/30 text-gray-300 hover:border-[#E0FF67]/60"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-[#E0FF67]/30 text-gray-300 hover:border-[#E0FF67]/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {paginatedTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 rounded-xl bg-white/5 border border-[#E0FF67]/20 hover:border-[#E0FF67]/40 transition-all hover:bg-white/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-2xl">{tx.emoji}</div>
                      <div>
                        <h4 className="font-semibold text-white">
                          {tx.budgetName}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {tx.createdAt.toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-[#E0FF67]">
                      {tx.amount.toLocaleString("fr-FR")} FCFA
                    </p>
                  </div>
                  <p className="text-sm text-gray-400">{tx.description}</p>
                </div>
              ))}

              {/* Mobile Pagination */}
              <div className="mt-6 pt-4 border-t border-[#E0FF67]/20 space-y-4">
                <div className="text-sm text-gray-400 text-center">
                  Page {currentPage} sur {totalPages}
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-[#E0FF67]/30 text-gray-300 hover:border-[#E0FF67]/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Précédent
                  </button>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-[#E0FF67]/30 text-gray-300 hover:border-[#E0FF67]/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </Wrapper>
  );
};

export default page;
