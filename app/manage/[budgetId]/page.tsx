"use client";

import { deleteMyBudgetAction } from "@/modules/budgets/budget.actions";
import {
  addTransactionAction,
  deleteMyTransactionAction,
  updateMyTransactionAction,
} from "@/modules/transactions/transaction.actions";
import Wrapper from "@/app/components/Wrapper";
import { Transactions } from "@/type";
import React, { useEffect, useState } from "react";
import Notification from "@/app/components/Notification";
import {
  Send,
  Trash,
  AlertCircle,
  Pencil,
  X,
  ChevronLeftCircle,
  MoreVertical,
  Plus,
} from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchBudgetById,
  invalidateBudgetList,
  invalidateSelectedBudget,
  invalidateAll,
} from "@/store/budgetsSlice";
import { invalidateDashboard } from "@/store/dashboardSlice";
import ConfirmMoal from "@/app/components/ConfirmModal";

const page = ({ params }: { params: Promise<{ budgetId: string }> }) => {
  const dispatch = useAppDispatch();

  const [budgetId, setBudgetID] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [notification, setNotification] = useState<string>("");
  const [isOpenCreate, setIsOpenCreate] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transactions | null>(null);
  const [editDescription, setEditDescription] = useState<string>("");
  const [editAmount, setEditAmount] = useState<string>("");
  const [savingEdit, setSavingEdit] = useState<boolean>(false);
  const [isLoading, setIsloading] = useState<boolean>(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Supprimer",
    onConfirm: () => {},
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Ferme le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeConfirm = () =>
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));

  // Lecture depuis le store
  const { selectedBudget: budget, selectedLoading: loading } = useAppSelector(
    (state) => state.budgets,
  );

  const closeNotification = () => {
    setNotification("");
  };

  useEffect(() => {
    const getId = async () => {
      const resolvedParams = await params;
      const id = resolvedParams.budgetId;
      setBudgetID(id);
      dispatch(fetchBudgetById(id));
    };
    getId();
  }, []);

  const handleAddTransaction = async () => {
    setIsloading(true);

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

      await addTransactionAction({
        budgetId,
        amount: amountNumber,
        description,
      });

      dispatch(invalidateSelectedBudget());
      dispatch(invalidateBudgetList());
      dispatch(invalidateDashboard());
      dispatch(fetchBudgetById(budgetId));

      setNotification("✓ Transaction ajoutée avec succès");
      setAmount("");
      setDescription("");
      setIsOpenCreate(false);
      setTimeout(() => setNotification(""), 3000);
    } catch (error) {
      setNotification("✗ Budget atteint ou erreur lors de l'ajout");
      setTimeout(() => setNotification(""), 3000);
    } finally {
      setIsloading(false);
    }
  };

  const handleDeletBudget = async () => {
    setConfirmModal({
      isOpen: true,
      title: "Supprime le budget",
      message: `Vous êtes sur le point de supprimer le budget "${budget?.name}" et toutes ses transactions. Cette action est irréversible.`,
      confirmLabel: "Supprimer le budget",
      onConfirm: async () => {
        closeConfirm();

        try {
          await deleteMyBudgetAction(budgetId);

          // Le budget disparaît,invalide tout
          dispatch(invalidateAll());
          dispatch(invalidateDashboard());

          setNotification("✓ Budget supprimé");
          setTimeout(() => redirect("/budgets"), 1500);
        } catch (error) {
          console.error("Erreur lors de la suppression du budget");
          setNotification("✗ Erreur lors de la suppression");
        }
      },
    });
  };

  const handleDeletTransaction = async (transactionId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Supprimer la transaction",
      message:
        "Cette transaction sera supprimée définitivement. Voulez-vous continuer ?",
      confirmLabel: "Supprimer",
      onConfirm: async () => {
        closeConfirm();
        try {
          await deleteMyTransactionAction(transactionId);
          dispatch(invalidateSelectedBudget());
          dispatch(invalidateBudgetList());
          dispatch(invalidateDashboard());
          dispatch(fetchBudgetById(budgetId));
          setNotification("✓ Transaction supprimée");
          setTimeout(() => setNotification(""), 3000);
        } catch (error) {
          setNotification("✗ Erreur lors de la suppression");
        }
      },
    });
  };

  const handleOpenEdit = (transaction: Transactions) => {
    setEditingTransaction(transaction);
    setEditDescription(transaction.description);
    setEditAmount(String(transaction.amount));
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setEditDescription("");
    setEditAmount("");
  };

  const handleSaveEdit = async () => {
    if (!editingTransaction) return;

    const amountNumber = parseFloat(editAmount);

    if (isNaN(amountNumber) || amountNumber <= 0) {
      setNotification("✗ Veuillez entrer un montant positif");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    setSavingEdit(true);
    try {
      await updateMyTransactionAction(editingTransaction.id, {
        amount: amountNumber,
        description: editDescription,
      });

      dispatch(invalidateSelectedBudget());
      dispatch(invalidateBudgetList());
      dispatch(invalidateDashboard());
      dispatch(fetchBudgetById(budgetId));

      setNotification("✓ Transaction modifiée avec succès");
      handleCancelEdit();
    } catch (error) {
      setNotification(`✗ ${error}`);
    } finally {
      setSavingEdit(false);
      setTimeout(() => setNotification(""), 3000);
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
            className="inline-flex items-center gap-2 text-[#E0FF67] hover:text-white 
            transition-colors mb-4"
          >
            <ChevronLeftCircle className="w-5 h-5" />
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
          <div
            className="relative rounded-2xl overflow-hidden border border-[#E0FF67]/20
           hover:border-[#E0FF67]/35 transition-all duration-300"
          >
            {/* Fond avec dégradé directionnel */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/2" />
            {/* Halo accent discret en haut à droite */}
            <div
              className="absolute -top-16 -right-16 w-48 h-48 bg-[#E0FF67]/5 rounded-full
             blur-3xl pointer-events-none"
            />

            <div className="relative p-6 lg:p-8">
              {/* Header : identité du budget + menu trois points */}
              <div className="flex items-start justify-between gap-4 mb-8">
                {/* Emoji + nom + montant */}
                <div className="flex items-center gap-5">
                  {/* Emoji dans un cadre glassmorphism */}
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-[#E0FF67]/10 border border-[#E0FF67]/20 flex items-center justify-center text-4xl lg:text-5xl">
                      {budget.emoji}
                    </div>
                    {/* Indicateur de statut */}
                    <span
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#161f2e] ${
                        percentageUsed >= 100
                          ? "bg-[#FF4C4C]"
                          : percentageUsed >= 75
                            ? "bg-yellow-400"
                            : "bg-[#3EF583]"
                      }`}
                    />
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mb-1">
                      Budget
                    </p>
                    <h2 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
                      {budget.name}
                    </h2>
                    <p className="text-[#E0FF67] font-semibold text-sm mt-1">
                      {budget.amount.toLocaleString("fr-FR")} FCFA alloués
                    </p>
                  </div>
                </div>

                {/* Menu trois points */}
                <div className="relative shrink-0" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className={`p-2.5 rounded-xl border transition-all duration-200 ${
                      menuOpen
                        ? "bg-[#E0FF67]/10 border-[#E0FF67]/40 text-[#E0FF67]"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {/* Dropdown */}
                  {menuOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-[#121720] border border-white/10 shadow-2xl 
                    shadow-black/40 overflow-hidden z-20 "
                    >
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setIsOpenCreate(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-[#E0FF67]/10
                         hover:text-[#E0FF67] transition-colors cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#E0FF67]/10 flex items-center justify-center shrink-0">
                          <Plus className="w-4 h-4 text-[#E0FF67]" />
                        </div>
                        Ajouter une transaction
                      </button>

                      <div className="h-px bg-white/5 mx-3" />

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          handleDeletBudget();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 
                        hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <div
                          className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center 
                        justify-center shrink-0"
                        >
                          <Trash className="w-4 h-4 text-red-400" />
                        </div>
                        Supprimer le budget
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Barre de progression */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-xs font-medium">
                    Utilisation du budget
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      percentageUsed >= 100
                        ? "text-[#FF4C4C]"
                        : percentageUsed >= 75
                          ? "text-yellow-400"
                          : "text-[#E0FF67]"
                    }`}
                  >
                    {percentageUsed.toFixed(1)}%
                  </span>
                </div>
                {/* Track */}
                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(percentageUsed, 100)}%`,
                      background:
                        percentageUsed >= 100
                          ? "#FF4C4C"
                          : percentageUsed >= 75
                            ? "#FACC15"
                            : "linear-gradient(90deg, #E0FF67, #c4e933)",
                    }}
                  />
                </div>
                {/* Labels min/max */}
                <div className="flex justify-between mt-1.5">
                  <span className="text-gray-600 text-[10px]">0 FCFA</span>
                  <span className="text-gray-600 text-[10px]">
                    {budget.amount.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 pt-5 border-t border-white/5">
                <div className="flex flex-col gap-1">
                  <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">
                    Dépensé
                  </p>
                  <p className="text-lg lg:text-xl font-bold text-white">
                    {totalSpent.toLocaleString("fr-FR")}
                  </p>
                  <p className="text-[10px] text-gray-600">FCFA</p>
                </div>

                <div className="flex flex-col gap-1 border-x border-white/5 px-3">
                  <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">
                    Restant
                  </p>
                  <p
                    className={`text-lg lg:text-xl font-bold ${
                      remaining < 0 ? "text-[#FF4C4C]" : "text-[#E0FF67]"
                    }`}
                  >
                    {remaining.toLocaleString("fr-FR")}
                  </p>
                  <p className="text-[10px] text-gray-600">FCFA</p>
                </div>

                <div className="flex flex-col gap-1 pl-3">
                  <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">
                    Transactions
                  </p>
                  <p className="text-lg lg:text-xl font-bold text-white">
                    {budget.transactions?.length || 0}
                  </p>
                  <p className="text-[10px] text-gray-600">au total</p>
                </div>
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
          {isOpenCreate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setIsOpenCreate(false)}
              />
              <div
                className="relative lg:p-8 bg-gradient-to-br from-white/5 to-white/2 border
               border-[#E0FF67]/20 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl shadow-black/40"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-xl text-white">
                    Ajouter une transaction
                  </h3>
                  <button
                    onClick={() => setIsOpenCreate(false)}
                    className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-400 hover:text-white" />
                  </button>
                </div>

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
                      className="w-full px-4 py-3 bg-white/5 border border-[#E0FF67]/30 rounded-lg
                       text-white placeholder-gray-600 focus:outline-none focus:border-[#E0FF67] transition-all"
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
                      className="w-full px-4 py-3 bg-white/5 border border-[#E0FF67]/30 rounded-lg
                       text-white placeholder-gray-600 focus:outline-none focus:border-[#E0FF67] transition-all"
                    />
                  </div>

                  <button
                    onClick={handleAddTransaction}
                    disabled={isLoading ? true : false}
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#E0FF67] to-[#c4e933]  cursor-pointer
                    text-[#151425] rounded-lg font-bold hover:shadow-lg hover:shadow-[#E0FF67]/50 transition-all"
                  >
                    Ajouter la dépense
                  </button>
                </div>
              </div>
            </div>
          )}

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
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="p-2 hover:bg-[#E0FF67]/20 text-[#E0FF67] hover:text-white rounded-lg transition-all"
                                onClick={() => handleOpenEdit(transaction)}
                              >
                                <Pencil className="w-5 h-5" />
                              </button>
                              <button
                                className="p-2 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all"
                                onClick={() =>
                                  handleDeletTransaction(transaction.id)
                                }
                              >
                                <Trash className="w-5 h-5" />
                              </button>
                            </div>
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
                      <div className="flex justify-between">
                        <p className="font-bold text-red-400 ">
                          -{transaction.amount.toLocaleString("fr-FR")} FCFA
                        </p>
                        <button
                          className="flex items-center gap-1 text-xs text-[#E0FF67] hover:text-white transition-colors"
                          onClick={() => handleOpenEdit(transaction)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Modifier
                        </button>
                      </div>
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

      {/* Modal de modification d'une transaction */}
      {editingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCancelEdit}
          />
          <div
            className="relative bg-gradient-to-br from-white/5 to-white/2 border
           border-[#E0FF67]/20 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl shadow-black/40"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-white">
                Modifier la transaction
              </h3>
              <button
                onClick={handleCancelEdit}
                className="p-1 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-[#E0FF67]/30 rounded-lg text-white
                   placeholder-gray-600 focus:outline-none focus:border-[#E0FF67] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Montant (FCFA)
                </label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-[#E0FF67]/30 rounded-lg text-white
                   placeholder-gray-600 focus:outline-none focus:border-[#E0FF67] transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-4 py-3 bg-white/5 border border-[#E0FF67]/30 text-white rounded-lg 
                  font-medium hover:border-[#E0FF67] transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#E0FF67] to-[#c4e933] text-[#151425] 
                  rounded-lg font-bold hover:shadow-lg hover:shadow-[#E0FF67]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingEdit ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmMoal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />
    </Wrapper>
  );
};

export default page;
