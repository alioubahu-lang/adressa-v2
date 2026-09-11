"use client";

import { Calendar, FileDown } from "lucide-react";

export function CollectivitesHero() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <a href="#contact-mairie" className="btn-primary bg-white text-adressa-deep hover:bg-adressa-light">
        <Calendar size={18} className="mr-2 inline-block" />
        Demander une démonstration Mairie
      </a>
      <a
        href="/adressa-brochure.pdf"
        download
        className="btn-secondary bg-transparent text-white border-white/30 hover:bg-white/10"
      >
        <FileDown size={18} className="mr-2 inline-block" />
        Télécharger la brochure institutionnelle
      </a>
    </div>
  );
}
