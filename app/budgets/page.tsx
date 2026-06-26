"use client";

import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import { useUser } from "@clerk/nextjs";
import EmojiPicker from "emoji-picker-react";
import {
  createBudgetAction,
  getMyBudgetsAction,
} from "@/modules/budgets/budget.actions";
import Notification from "../components/Notification";
import {
  Plus,
  Wallet,
  X,
  TrendingDown,
  Banknote,
  PiggyBank,
} from "lucide-react";
import { Budgets } from "@/type";
import Link from "next/link";
import BudgetItem from "../components/BudgetItem";

const page = () => {
  const user = useUser();

  const [loading, setLoading] = useState(true);
  const [budgetName, setBudgetName] = useState<string>("");
  const [budgetAmount, setBudgetAmount] = useState<string>("");
  const [showEmoji, setShowEmoji] = useState<boolean>(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [notification, setNotification] = useState<string>("");
  const [budgets, setBudgets] = useState<Budgets[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeNotification = () => {
    setNotification("");
  };

  const handleEmjiSelect = (emojiObject: { emoji: string }) => {
    setSelectedEmoji(emojiObject.emoji);
    setShowEmoji(false);
  };

  const handleAddBuget = async () => {
    try {
      const amount = parseFloat(budgetAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Veuillez entrer un montant positif");
      }
      if (!budgetName.trim()) {
        throw new Error("Le nom du budget est requis");
      }
      if (!selectedEmoji) {
        throw new Error("Sélectionnez un emoji pour le budget");
      }

      await createBudgetAction({
        name: budgetName,
        amount,
        emoji: selectedEmoji,
      });

      fetchBudgets();
      setIsModalOpen(false);

      setNotification("✓ Nouveau budget créé avec succès");
      setBudgetName("");
      setBudgetAmount("");
      setSelectedEmoji("");
      setShowEmoji(false);

      setTimeout(() => setNotification(""), 3000);
    } catch (error) {
      setNotification(`✗ ${error}`);
      setTimeout(() => setNotification(""), 3000);
    }
  };

  const fetchBudgets = async () => {
    setLoading(true);
    if (user.user) {
      try {
        const userBudget = await getMyBudgetsAction();
        setBudgets(userBudget);
        setLoading(false);
      } catch (error) {
        setNotification("✗ Erreur lors de la récupération des budgets");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [user.user?.primaryEmailAddress?.emailAddress]);

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => setIsModalOpen(false);

  // --- Stats globales dérivées de la liste de budgets déjà chargée ---
  const totalAllocated = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce(
    (sum, b) => sum + (b.transactions?.reduce((s, t) => s + t.amount, 0) ?? 0),
    0,
  );
  const totalRemaining = totalAllocated - totalSpent;

  return (
    <Wrapper>
      {notification && (
        <Notification
          message={notification}
          onclose={closeNotification}
        ></Notification>
      )}

      {/* Page Header */}
      <div className="mb-8 pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Mes Budgets
            </h1>
            <p className="text-gray-400 text-base md:text-lg">
              Gérez vos budgets et suivez vos dépenses
            </p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E0FF67] to-[#c4e933] text-[#151425] rounded-xl font-bold hover:shadow-lg hover:shadow-[#E0FF67]/50 transition-all group shrink-0 self-start md:self-auto"
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Ajouter un budget
          </button>
        </div>

        {/* Bande de stats globales */}
        {!loading && budgets.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/2 border border-[#E0FF67]/20">
              <div className="p-2.5 rounded-lg bg-[#E0FF67]/10">
                <Wallet className="w-4 h-4 text-[#E0FF67]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Budget total alloué</p>
                <p className="text-lg font-bold text-white">
                  {totalAllocated} FCFA
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/2 border border-[#E0FF67]/20">
              <div className="p-2.5 rounded-lg bg-[#FF4C4C]/10">
                <TrendingDown className="w-4 h-4 text-[#FF4C4C]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total dépensé</p>
                <p className="text-lg font-bold text-white">
                  {totalSpent} FCFA
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/2 border border-[#E0FF67]/20">
              <div className="p-2.5 rounded-lg bg-[#3EF583]/10">
                <PiggyBank className="w-4 h-4 text-[#3EF583]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Reste disponible</p>
                <p className="text-lg font-bold text-white">
                  {totalRemaining} FCFA
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal personnalisé */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div className="relative bg-gradient-to-br from-white/5 to-white/2 border border-[#E0FF67]/20 rounded-2xl backdrop-blur-md p-6 w-full max-w-md mx-4 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-white">
                Créer un nouveau budget
              </h3>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Input Nom du budget */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Nom du budget
                </label>
                <input
                  type="text"
                  value={budgetName}
                  placeholder="Ex: Alimentation, Transport..."
                  onChange={(e) => setBudgetName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-[#E0FF67]/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#E0FF67] transition-all"
                />
              </div>

              {/* Input Montant */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Montant du budget (FCFA)
                </label>
                <div className="relative">
                  <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="number"
                    value={budgetAmount}
                    placeholder="0"
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-[#E0FF67]/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#E0FF67] transition-all"
                  />
                </div>
              </div>

              {/* Emoji Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Sélectionnez un emoji
                </label>
                <button
                  type="button"
                  onClick={() => setShowEmoji(!showEmoji)}
                  className="w-full px-4 py-3 bg-white/5 border border-[#E0FF67]/30 rounded-lg text-white hover:border-[#E0FF67] transition-all flex items-center justify-center text-2xl"
                >
                  {selectedEmoji || "📝"}
                </button>
                {showEmoji && (
                  <div className="mt-4 flex justify-center">
                    <EmojiPicker onEmojiClick={handleEmjiSelect} />
                  </div>
                )}
              </div>

              {/* Aperçu en direct */}
              {(budgetName || budgetAmount || selectedEmoji) && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-2xl">{selectedEmoji || "📝"}</span>
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {budgetName || "Nom du budget"}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {budgetAmount ? `${budgetAmount} FCFA` : "0 FCFA"}
                    </p>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 bg-white/5 border border-[#E0FF67]/30 text-white rounded-lg font-medium hover:border-[#E0FF67] transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddBuget}
                  disabled={!budgetName || !budgetAmount || !selectedEmoji}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#E0FF67] to-[#c4e933] text-[#151425] rounded-lg font-bold hover:shadow-lg hover:shadow-[#E0FF67]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Créer le budget
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budgets List */}
      <div className="w-full">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-white/5"
              />
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-96 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#E0FF67]/20 to-[#c4e933]/10 rounded-2xl flex items-center justify-center mb-6">
              <Wallet className="w-8 h-8 text-[#E0FF67]" />
            </div>
            <p className="text-gray-400 text-xl mb-3">
              Aucun budget pour le moment
            </p>
            <p className="text-gray-600 text-sm mb-6">
              Créez votre premier budget pour commencer à gérer vos dépenses
            </p>
            <button
              onClick={openModal}
              className="px-6 py-3 bg-gradient-to-r from-[#E0FF67] to-[#c4e933] text-[#151425] rounded-xl font-bold hover:shadow-lg hover:shadow-[#E0FF67]/50 transition-all"
            >
              Créer un budget
            </button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {budgets.map((budget) => (
                <Link href={`/manage/${budget.id}`} key={budget.id}>
                  <div className="group cursor-pointer">
                    <BudgetItem budget={budget} enableHover={1} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Wrapper>
  );
};

export default page;
