"use client";

import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import { useUser } from "@clerk/nextjs";
import EmojiPicker from "emoji-picker-react";
import { createBudgetAction, getMyBudgetsAction } from "@/modules/budgets/budget.actions";
import Notification from "../components/Notification";
import { Plus, Send, Wallet, X } from "lucide-react";
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
        setNotification(`✗ Erreur lors de la récupération des budgets`);
      }
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [user.user?.primaryEmailAddress?.emailAddress]);

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => setIsModalOpen(false);

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
        <div className="flex items-center justify-between mb-4">
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
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E0FF67] to-[#c4e933] text-[#151425] rounded-xl font-bold hover:shadow-lg hover:shadow-[#E0FF67]/50 transition-all group"
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Ajouter un budget
          </button>
        </div>
      </div>

      {/* Modal personnalisé */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div className="relative bg-gradient-to-br from-white/10 to-white/5 border border-[#E0FF67]/30 rounded-lg backdrop-blur-md p-6 w-full max-w-md mx-4">
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
                <input
                  type="number"
                  value={budgetAmount}
                  placeholder="0"
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-[#E0FF67]/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#E0FF67] transition-all"
                />
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

              {/* Buttons */}
              <div className="flex gap-3 pt-6">
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
          <div className="flex justify-center items-center min-h-96">
            <div className="flex flex-col items-center gap-4">
              <span className="loading loading-dots loading-xl text-[#E0FF67]"></span>
              <p className="text-gray-400">Chargement de vos budgets...</p>
            </div>
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
