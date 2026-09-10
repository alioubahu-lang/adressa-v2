"use client";

import { useState } from "react";
import { Key, BookOpen } from "lucide-react";
import { ApiAccessModal } from "./ApiAccessModal";

export function EntreprisesHero() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => setModalOpen(true)} className="btn-primary">
          <Key size={18} className="mr-2 inline-block" />
          Obtenir une clé API test
        </button>
        <a href="#apercu-api" className="btn-secondary">
          <BookOpen size={18} className="mr-2 inline-block" />
          Consulter la documentation API
        </a>
      </div>

      <ApiAccessModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
