# ADRESSA — V2

**Chaque lieu a une identité.**

Infrastructure numérique d'adressage pour les bâtiments en Afrique. Pilote : Sébikotane, Sénégal (5 adresses : `SN-SBK-001` à `SN-SBK-005`).

---

## 1. Stack technique

- **Frontend** : Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend** : API routes Next.js
- **Base de données** : PostgreSQL + Prisma ORM
- **Authentification** : NextAuth (Credentials + bcrypt), rôles `SUPER_ADMIN / ADMIN / AGENT / MUNICIPAL / VIEWER`
- **Cartographie** : OpenStreetMap + Leaflet (react-leaflet)
- **QR dynamique** : librairie `qrcode`, généré à la volée, toujours pointé vers ADRESSA (jamais directement vers Google Maps)
- **Déploiement cible** : Vercel

## 2. Installation

```bash
npm install
cp .env.example .env
```

Renseignez dans `.env` :
- `DATABASE_URL` : votre base PostgreSQL (Neon, Supabase, Railway, RDS…)
- `NEXTAUTH_SECRET` : une chaîne aléatoire longue (`openssl rand -base64 32`)
- `SEED_ADMIN_PASSWORD` : le mot de passe du compte administrateur de démonstration

## 3. Base de données

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

Le seed crée :
- L'arborescence géographique Sénégal → Dakar → Rufisque → Sébikotane → Dogar
- Les 5 adresses pilotes avec leurs QR codes
- Un compte `SUPER_ADMIN` de démonstration (email `SEED_ADMIN_EMAIL`, mot de passe `SEED_ADMIN_PASSWORD`)

> ⚠️ **Important** : `prisma generate` et `prisma migrate` téléchargent le moteur de requête Prisma depuis `binaries.prisma.sh` — assurez-vous que votre réseau (local, CI ou Vercel) autorise cet accès. C'est un prérequis standard de tout projet Prisma.

## 4. Développement

```bash
npm run dev
```

- Site public : http://localhost:3000
- Fiche d'une adresse pilote : http://localhost:3000/a/SN-SBK-001
- Dashboard : http://localhost:3000/dashboard (connexion requise)

## 5. Build production

```bash
npm run build
npm start
```

## 6. Tests

```bash
npm test
```

Couvre notamment l'unicité et le format de génération des identifiants ADRESSA (`SN-SBK-001`, puis passage automatique à 6 chiffres au-delà de 999 adresses par commune, ex. `SN-DKR-000001`).

## 7. Déploiement (Vercel)

1. Poussez le projet sur GitHub.
2. Connectez le dépôt à Vercel.
3. Renseignez les variables d'environnement du `.env.example` dans les paramètres du projet Vercel.
4. Provisionnez une base PostgreSQL de production (Neon/Supabase recommandés, compatibles serverless).
5. Lancez `npx prisma migrate deploy` (via un job de build ou manuellement) puis `npm run seed` si besoin.
6. Déployez. Vérifiez HTTPS, le rendu mobile, le scan des QR codes et l'accès dashboard.
7. Configurez le domaine officiel (`adressa.sn` ou `adressa.africa`) dans Vercel une fois acheté.

## 8. Architecture des données

```
Country → Region → Department → Commune → Neighborhood → Street → Address
Address → QrCode → Scan
Address → AddressHistory (audit des modifications)
```

L'identifiant ADRESSA (`adresssaId`) est unique, généré automatiquement au format
`PAYS-COMMUNE-NUMERO` (ex. `SN-SBK-001`), avec bascule automatique vers un format à 6
chiffres pour les communes dépassant 999 adresses (ex. `SN-DKR-000001`), sans jamais
changer le format des identifiants déjà attribués.

## 9. Sécurité

- Mots de passe hashés (bcrypt), jamais en clair
- Contrôle des rôles sur chaque route API sensible (création, modification, suppression)
- Aucune clé secrète dans le code — tout passe par `.env`
- Aucune donnée personnelle des occupants stockée ou affichée publiquement
- Les scans QR n'enregistrent aucune donnée personnelle (user-agent tronqué, pas d'IP)

## 10. Ce qui est prêt vs. ce qui reste à brancher pour la V3

**Prêt et fonctionnel :**
API complète, dashboard, site public, carte, QR dynamique, recherche, authentification et
permissions, audit des modifications, seed du pilote, SEO (sitemap/robots), tests.

**Architecture prévue, à finaliser selon vos choix d'infrastructure :**
- Upload de photo vers un stockage cloud (`STORAGE_URL` déjà prévu dans `.env`) — actuellement le champ `photoUrl` accepte une URL, l'upload direct depuis mobile reste à connecter à votre solution (S3, Cloudinary, Supabase Storage…)
- Mode hors-ligne / PWA (synchronisation différée pour les agents terrain sans connexion)
- Intégration NFC
- Numéros d'urgence locaux (volontairement non inventés — à renseigner avec les vrais contacts municipaux)
- Internationalisation anglais (structure prête, français = langue actuelle unique)

---

*ADRESSA ne vend pas des plaques. ADRESSA construit une infrastructure d'identité géographique.*
