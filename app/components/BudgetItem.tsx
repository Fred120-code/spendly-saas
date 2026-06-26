import { Budgets } from "@/type";
import React from "react";

interface BudgetItemProps {
  budget: Budgets;
  enableHover?: number;
}

const BudgetItem: React.FC<BudgetItemProps> = ({ budget, enableHover }) => {
  const transactionCount = budget.transactions ? budget.transactions.length : 0;
  const totaltransactionAmount = budget.transactions
    ? budget.transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0,
      )
    : 0;

  const remainingAmount = budget.amount - totaltransactionAmount;
  const ratio = budget.amount > 0 ? totaltransactionAmount / budget.amount : 0;
  const progressvalue = Math.min(ratio * 100, 100);

  // Couleur de la barre / accent selon le niveau de dépense :
  // vert sous 70%, accent lime entre 70 et 100%, rouge au-delà.
  const status = ratio >= 1 ? "danger" : ratio >= 0.7 ? "warning" : "safe";

  const statusStyles = {
    safe: { bar: "#3EF583", text: "text-[#3EF583]" },
    warning: { bar: "#E0FF67", text: "text-[#E0FF67]" },
    danger: { bar: "#FF4C4C", text: "text-[#FF4C4C]" },
  }[status];

  const hoverClasse =
    enableHover === 1
      ? "hover:shadow-xl hover:shadow-black/30 hover:border-[#E0FF67]/50 hover:-translate-y-0.5"
      : "";

  return (
    <li
      key={budget.id}
      className={`rounded-2xl list-none p-5 bg-gradient-to-br from-white/5 to-white/2 border border-[#E0FF67]/20 transition-all duration-300 ${hoverClasse}`}
    >
      {/* En-tête du budget: emoji, nom et nombre de transactions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-[#E0FF67]/10 text-2xl h-11 w-11 rounded-xl flex justify-center items-center">
            {budget.emoji}
          </div>
          <div className="flex flex-col ml-3">
            <span className="font-bold text-lg text-white leading-tight">
              {budget.name}
            </span>
            <span className="text-gray-500 text-xs">
              {transactionCount} transaction{transactionCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Badge de statut */}
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded-full bg-white/5 ${statusStyles.text}`}
        >
          {Math.round(progressvalue)}%
        </span>
      </div>

      {/* Montant total alloué au budget */}
      <div className="text-2xl font-bold text-white mb-4">
        {budget.amount} <span className="text-sm text-gray-500">FCFA</span>
      </div>

      {/* Barre de progression visuelle */}
      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progressvalue}%`,
            backgroundColor: statusStyles.bar,
          }}
        />
      </div>

      {/* Résumé des dépenses et reste */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-gray-400 text-xs">
          {totaltransactionAmount} FCFA dépensé
        </span>
        <span className={`text-xs font-medium ${statusStyles.text}`}>
          {remainingAmount >= 0
            ? `${remainingAmount} FCFA restant`
            : `${Math.abs(remainingAmount)} FCFA dépassé`}
        </span>
      </div>
    </li>
  );
};

export default BudgetItem;
