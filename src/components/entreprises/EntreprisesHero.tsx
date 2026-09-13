"use client";

import { useState } from "react";
import { Calendar, TrendingUp } from "lucide-react";
import { ApiAccessModal } from "./ApiAccessModal";

export function EntreprisesHero() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => setModalOpen(true)} className="btn-primary bg-white text-adressa-deep hover:bg-adressa-light">
          <Calendar size={18} className="mr-2 inline-block" />
          Planifier une démonstration métier
        </button>
        <a href="#calculateur-impact" className="btn-secondary bg-transparent text-white border-white/30 hover:bg-white/10">
          <TrendingUp size={18} className="mr-2 inline-block" />
          Estimer mes gains opérationnels
        </a>
      </div>

      <ApiAccessModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
