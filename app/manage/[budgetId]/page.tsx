"use client";

import { deleteMyBudgetAction, getMyBudgetByIdAction } from "@/modules/budgets/budget.actions";
import { addTransactionAction, deleteMyTransactionAction } from "@/modules/transactions/transaction.actions";
import BudgetItem from "@/app/components/BudgetItem";
import Wrapper from "@/app/components/Wrapper";
import { Budgets } from "@/type";
import React, { useEffect, useState } from "react";
import Notification from "@/app/components/Notification";
import { ArrowLeft, Send, Trash, Plus, AlertCircle } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

const page = ({ params }: { params: Promise<{ budgetId: string }> }) => {
  const [budgetId, setBudgetID] = useState<string>("");
  const [budget, setBudget] = useState<Budgets>();
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [notification, setNotification] = useState<string>("");

  const closeNotification = () => {
    setNotification("");
  };

  async function fetchBudgetData(budgetId: string) {
    try {
      if (budgetId) {
        const budgetData = await getMyBudgetByIdAction(budgetId);
        if (budgetData) {
          setBudget(budgetData);
        }
      }
    } catch (error) {
      console.error("erreur lors de la recuperation", error);
    }
  }

  useEffect(() => {
    const getId = async () => {
      const resolvedParams = await params;
      setBudgetID(resolvedParams.budgetId);
      fetchBudgetData(resolvedParams.budgetId);
    };
    getId();
  }, []);

  const handleAddTransaction = async () => {
    if (!amount || !description) {
      setNotification("✗ Tous les champs sont requis");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    try {
      const amountNumber = parseFloat(amount);
      if (isNaN(amountNumber) || amountNumber < 0) {
        setNotification("✗ Veuillez entrer un montant positif");
        setTimeout(() => setNotification(""), 3000);
        return;
      }

      const newTransaction = await addTransactionAction({
        budgetId,
        amount: amountNumber,
        description,
      });

      setNotification("✓ Transaction ajoutée avec succès");
      fetchBudgetData(budgetId);
      setAmount("");
      setDescription("");
      setTimeout(() => setNotification(""), 3000);
    } catch (error) {
      setNotification("✗ Budget atteint ou erreur lors de l'ajout");
      setTimeout(() => setNotification(""), 3000);
    }
  };

  const handleDeletBudget = async () => {
    const confirmed = window.confirm(
      "Êtes-vous sûr ? Cette action est irréversible.",
    );
    if (confirmed) {
      try {
        await deleteMyBudgetAction(budgetId);
        setNotification("✓ Budget supprimé");
        setTimeout(() => redirect("/budgets"), 1500);
      } catch (error) {
        console.error("Erreur lors de la suppression du budget");
        setNotification("✗ Erreur lors de la suppression");
      }
    }
  };

  const handleDeletTransaction = async (transactionId: string) => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette transaction ?",
    );
    if (confirmed) {
      try {
        await deleteMyTransactionAction(transactionId);
        fetchBudgetData(budgetId);
        setNotification("✓ Transaction supprimée");
        setTimeout(() => setNotification(""), 3000);
      } catch (error) {
        console.error("Erreur lors de la suppression de la transaction");
        setNotification("✗ Erreur lors de la suppression");
      }
    }
  };

  // Calculer les statistiques
  const totalSpent =
    budget?.transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
  const remaining = (budget?.amount || 0) - totalSpent;
  const percentageUsed = budget ? (totalSpent / budget.amount) * 100 : 0;

  return (
    <Wrapper>
      {notification && (
        <Notification message={notification} onclose={closeNotification} />
      )}

      {/* Header with Back Button */}
      <div className="mb-8 pt-8 flex items-center justify-between">
        <div>
          <Link
            href="/budgets"
            className="inline-flex items-center gap-2 text-[#E0FF67] hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour aux budgets
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Gestion du budget
          </h1>
        </div>
      </div>

      {budget && (
        <div className="space-y-8">
          {/* Budget Overview Card */}
          <div className="p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-[#E0FF67]/20">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
              {/* Budget Info */}
              <div className="flex items-center gap-6 flex-1">
                <div className="text-6xl">{budget.emoji}</div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {budget.name}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Budget total:{" "}
                    <span className="font-bold text-[#E0FF67]">
                      {budget.amount.toLocaleString("fr-FR")} FCFA
                    </span>
                  </p>
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={handleDeletBudget}
                className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm font-medium"
              >
                Supprimer le budget
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-400 text-sm">Utilisation du budget</p>
                <p className="text-[#E0FF67] font-bold">
                  {percentageUsed.toFixed(1)}%
                </p>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-[#E0FF67]/20">
                <div
                  className={`h-full transition-all ${
                    percentageUsed > 100
                      ? "bg-red-500"
                      : percentageUsed > 75
                        ? "bg-yellow-500"
                        : "bg-gradient-to-r from-[#E0FF67] to-[#c4e933]"
                  }`}
                  style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#E0FF67]/10">
              <div>
                <p className="text-gray-400 text-xs mb-1">Dépensé</p>
                <p className="text-xl font-bold text-white">
                  {totalSpent.toLocaleString("fr-FR")}
                </p>
                <p className="text-xs text-gray-600">FCFA</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Restant</p>
                <p
                  className={`text-xl font-bold ${remaining < 0 ? "text-red-400" : "text-[#E0FF67]"}`}
                >
                  {remaining.toLocaleString("fr-FR")}
                </p>
                <p className="text-xs text-gray-600">FCFA</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Transactions</p>
                <p className="text-xl font-bold text-white">
                  {budget.transactions?.length || 0}
                </p>
                <p className="text-xs text-gray-600">total</p>
              </div>
            </div>
          </div>

          {/* Warning if Budget Exceeded */}
          {remaining < 0 && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">
                Budget dépassé de{" "}
                <span className="font-bold">
                  {Math.abs(remaining).toLocaleString("fr-FR")} FCFA
                </span>
              </p>
            </div>
          )}

          {/* Add Transaction Form */}
          <div className="p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-[#E0FF67]/20">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#E0FF67]" />
              Ajouter une dépense
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Courses, Essence, etc."
                  className="w-full px-4 py-3 bg-white/5 border border-[#E0FF67]/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#E0FF67] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Montant (FCFA)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-white/5 border border-[#E0FF67]/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#E0FF67] transition-all"
                />
              </div>

              <button
                onClick={handleAddTransaction}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#E0FF67] to-[#c4e933] text-[#151425] rounded-lg font-bold hover:shadow-lg hover:shadow-[#E0FF67]/50 transition-all"
              >
                Ajouter la dépense
              </button>
            </div>
          </div>

          {/* Transactions List */}
          <div className="p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-[#E0FF67]/20">
            {budget.transactions && budget.transactions.length > 0 ? (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">
                  Historique des transactions
                </h3>

                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E0FF67]/20">
                        <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">
                          Date
                        </th>
                        <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">
                          Heure
                        </th>
                        <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">
                          Description
                        </th>
                        <th className="text-right py-4 px-4 text-gray-400 font-semibold text-sm">
                          Montant
                        </th>
                        <th className="text-center py-4 px-4 text-gray-400 font-semibold text-sm">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {budget?.transactions?.map((transaction) => (
                        <tr
                          key={transaction.id}
                          className="border-b border-[#E0FF67]/10 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-4 px-4 text-white text-sm">
                            {transaction.createdAt.toLocaleDateString("fr-FR")}
                          </td>
                          <td className="py-4 px-4 text-white text-sm">
                            {transaction.createdAt.toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-4 px-4 text-gray-400 text-sm">
                            {transaction.description}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="inline-block px-3 py-1 bg-red-500/20 text-red-400 rounded-lg font-bold text-sm">
                              -{transaction.amount.toLocaleString("fr-FR")} FCFA
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              className="p-2 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all"
                              onClick={() =>
                                handleDeletTransaction(transaction.id)
                              }
                            >
                              <Trash className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-3">
                  {budget?.transactions?.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-4 rounded-xl bg-white/5 border border-[#E0FF67]/20 hover:border-[#E0FF67]/40 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-white">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.createdAt.toLocaleDateString("fr-FR")}{" "}
                            à{" "}
                            {transaction.createdAt.toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <button
                          className="p-2 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all"
                          onClick={() => handleDeletTransaction(transaction.id)}
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="font-bold text-red-400 text-right">
                        -{transaction.amount.toLocaleString("fr-FR")} FCFA
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Send className="w-12 h-12 text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg mb-2">
                  Aucune transaction pour le moment
                </p>
                <p className="text-gray-600 text-sm">
                  Commencez à ajouter vos premières dépenses
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default page;
