# Vision France

Plateforme Next.js pour publier les bourses d'études de la France, recevoir les candidatures internationales et piloter leur traitement.

## Ce qui est deja implemente

- Interface publique avec hero editorial, catalogue des bourses, fiches detaillees et bouton `Postuler`
- Depot de candidature avec pieces justificatives
- Interface admin pour publier des bourses, suivre les candidatures et changer les statuts
- Emails de confirmation et de suivi via Resend si `RESEND_API_KEY` est configuré
- Adaptateur de donnees avec double mode :
  - `Supabase` si l'instance est configurée et que le schéma est disponible
  - `fallback local` JSON + fichiers sur disque si Supabase n'est pas pret

## Configuration

1. Installer les dependances :

```bash
npm install
```

2. Renseigner les variables d'environnement a partir de `.env.example`.

3. Pour activer Supabase proprement, executer le contenu de `supabase/schema.sql` dans l'editeur SQL Supabase.

4. Lancer le projet :

```bash
npm run dev
```

## Important sur Supabase

- Le projet est deja branche sur l'URL Supabase renseignee dans `.env.local`.
- Les cles actuellement renseignees couvrent le mode public / anon.
- Pour un backend distant complet et securise en production, il faut ajouter `SUPABASE_SERVICE_ROLE_KEY`.
- Sans `service role`, l'application tentera Supabase si le schema repond, sinon elle basculera automatiquement sur le stockage local pour ne pas bloquer le MVP.

## Identifiants admin par defaut

- Email : `admin@visionfrance.fr`
- Mot de passe : `VisionFrance2026!`

Change-les avant toute mise en production.
