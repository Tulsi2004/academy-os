import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export const frCA: Dictionary = {
  common: {
    optional: "facultatif",
    save: "Enregistrer",
    saving: "Enregistrement…",
    previous: "Précédent",
    next: "Suivant",
    notSet: "Non défini",
    none: "—",
  },

  app: {
    name: "Academy OS",
  },

  nav: {
    dashboard: "Tableau de bord",
    enquiries: "Demandes",
    students: "Élèves",
    parents: "Parents",
    courses: "Cours",
    batches: "Groupes",
    teachers: "Enseignants",
    attendance: "Présences",
    fees: "Frais",
    events: "Événements",
    exams: "Examens",
    documents: "Documents",
    settings: "Paramètres",
    soon: "Bientôt",
    comingSoon: "{label} — bientôt disponible",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    search: "Rechercher",
    notifications: "Notifications",
  },

  languageSwitcher: {
    label: "Langue",
    change: "Changer de langue",
  },

  enquiries: {
    title: "Demandes",
    subtitle: "Toutes les personnes qui se sont informées — et qui rappeler ensuite.",
    tabs: {
      all: "Toutes les demandes",
      followUps: "À rappeler",
    },
    newEnquiry: "Nouvelle demande",
    backToList: "Retour aux demandes",
    search: {
      placeholder: "Rechercher par nom ou téléphone…",
      label: "Rechercher dans les demandes",
    },

    attention: {
      heading: "À traiter",
      overdue: "En retard",
      overdueHint: "La date de rappel est déjà passée",
      dueToday: "Pour aujourd'hui",
      dueTodayHint: "Un rappel a été promis pour aujourd'hui",
      uncontacted: "Jamais appelés",
      uncontactedHint: "La demande est arrivée, personne ne leur a parlé",
      allClear: "Rien en retard, et personne n'attend un appel.",
    },

    filters: {
      label: "Filtrer par état",
      all: "Toutes",
    },

    status: {
      NEW: "Nouvelle",
      CONTACTED: "Contactée",
      INTERESTED: "Intéressée",
      FOLLOW_UP: "À rappeler",
      ADMITTED: "Inscrit",
      LOST: "Ne s'inscrit pas",
    },
    statusHint: {
      NEW: "Vient d'arriver. Personne n'a encore appelé.",
      CONTACTED: "Nous leur avons parlé une fois.",
      INTERESTED: "Ils veulent s'inscrire. Des détails restent à régler.",
      FOLLOW_UP: "Un rappel est prévu à une date convenue.",
      ADMITTED: "Inscrit à l'académie — maintenant un élève.",
      LOST: "Ont décidé de ne pas s'inscrire.",
    },

    columns: {
      name: "Nom",
      phone: "Téléphone",
      interestedIn: "Veut apprendre",
      status: "État",
      followUp: "Rappel",
      added: "Demande reçue",
      actions: "Actions",
    },

    followUp: {
      none: "Aucune date",
      overdue: "En retard",
      overdueOn: "Prévu le {date}",
      today: "Aujourd'hui",
      tomorrow: "Demain",
      on: "{date}",
    },

    row: {
      call: "Appeler",
      whatsapp: "WhatsApp",
      callAria: "Appeler {name} au {phone}",
      whatsappAria: "Écrire à {name} sur WhatsApp",
      openAria: "Ouvrir la demande de {name}",
    },

    empty: {
      none: "Aucune demande pour l'instant.",
      noneHint:
        "Dès que quelqu'un s'informe des cours, inscrivez-le ici — ça prend une dizaine de secondes.",
      addFirst: "Ajouter une première demande",
      noMatch: "Aucun résultat pour cette recherche.",
      noMatchHint: "Essayez une partie du nom ou les derniers chiffres du numéro.",
      clearFilters: "Effacer les filtres",
    },

    pagination: {
      page: "Page {page} sur {pages}",
      countOne: "{count} demande",
      countOther: "{count} demandes",
    },

    capture: {
      title: "Nouvelle demande",
      description: "Le téléphone et le nom suffisent. Le reste est demandé à l'inscription.",
      phone: "Téléphone",
      phonePlaceholder: "98765 43210",
      studentName: "Nom de l'élève",
      studentNamePlaceholder: "Kavya Sharma",
      interestedIn: "Veut apprendre",
      interestedInPlaceholder: "Clavier, groupe de fin de semaine",
      course: "Cours",
      coursePlaceholder: "Pas encore décidé",
      note: "Note",
      notePlaceholder: "Passé sans rendez-vous, a demandé les tarifs",
      save: "Enregistrer",
      saveAndAnother: "Enregistrer et en ajouter une autre",
      saved: "{name} enregistré. Ajoutez la suivante.",
      duplicateEnquiry: "{name} s'est informé {when}",
      duplicateEnquiryWithStatus: "{name} s'est informé {when} — {status}",
      duplicateParent: "{name} est déjà enregistré comme parent",
      openExisting: "Ouvrir la demande existante",
      today: "aujourd'hui",
      yesterday: "hier",
      daysAgo: "il y a {count} jours",
    },

    detail: {
      receivedOn: "Demande reçue le {date}",
      joinedAs: "Inscrit sous le nom de {name}.",
      openStudent: "Ouvrir le dossier de l'élève",
      convert: "Inscrire comme élève",
      details: "Ses coordonnées",
      phone: "Téléphone",
      email: "Courriel",
      parent: "Parent / tuteur",
      interestedIn: "Veut apprendre",
      course: "Cours",
      experience: "Expérience",
      lastUpdated: "Dernière modification",
      update: "Mettre à jour cette demande",
      status: "Où ça en est",
      statusFixed: "Verrouillé — cette demande est déjà devenue un élève.",
      followUpDate: "Rappeler le",
      followUpHint: "Laissez vide si aucun rappel n'est nécessaire.",
      note: "Que s'est-il passé ?",
      notePlaceholder: "Ce qui a été discuté et ce qui suit.",
      noteHint: "Ajouté à l'historique ci-dessous. Rien de ce qui est écrit n'est remplacé.",
      saveChanges: "Enregistrer les modifications",
      updated: "Demande mise à jour.",
      history: "Historique",
      noHistory: "Rien d'enregistré pour l'instant. Ajoutez une note après le premier appel.",
      notRecorded: "Pas encore renseigné : {fields}",
    },

    experience: {
      NONE: "N'a jamais appris",
      BEGINNER: "Débutant",
      INTERMEDIATE: "Intermédiaire",
      ADVANCED: "Avancé",
    },

    convert: {
      back: "Retour à la demande",
      title: "Inscrire {name}",
      subtitle:
        "Cela crée les dossiers de l'élève et du parent, et ferme la demande comme inscrite.",
      studentSection: "Élève",
      firstName: "Prénom",
      lastName: "Nom de famille",
      dateOfBirth: "Date de naissance",
      experience: "Expérience",
      studentPhone: "Téléphone de l'élève",
      studentEmail: "Courriel de l'élève",
      address: "Adresse",
      parentSection: "Parent / tuteur",
      parentHint:
        "L'association se fait par téléphone — un parent existant avec ce numéro est réutilisé, pas dupliqué.",
      parentName: "Nom",
      parentPhone: "Téléphone",
      parentEmail: "Courriel",
      enrolmentSection: "Inscription",
      batch: "Groupe",
      batchPlaceholder: "Aucun groupe pour l'instant",
      noBatches:
        "Il n'existe aucun groupe pour l'instant, l'élève est donc inscrit sans groupe. Vous pourrez l'y placer quand le module Groupes sera prêt.",
      registrationFee: "Frais d'inscription (₹)",
      submit: "Inscrire comme élève",
      submitting: "Inscription…",
    },
  },

  followUps: {
    title: "À rappeler",
    subtitle: "Toutes les personnes que vous deviez rappeler aujourd'hui ou avant.",
    overdue: "En retard",
    today: "Aujourd'hui",
    empty: "Personne à rappeler pour l'instant.",
    emptyHint: "Les demandes apparaissent ici le jour où le rappel est dû.",
  },

  errors: {
    checkForm: "Vérifiez le formulaire et réessayez.",
    tooLong: "C'est trop long",
    phoneInvalid: "Entrez un numéro de mobile à 10 chiffres",
    studentNameRequired: "Le nom de l'élève est obligatoire",
    firstNameRequired: "Le prénom est obligatoire",
    parentNameRequired: "Le nom du parent est obligatoire",
    dateInvalid: "Entrez une date valide",
    emailInvalid: "Entrez une adresse courriel valide",
    feeInvalid: "Entrez un montant de zéro ou plus",
    courseGone: "Ce cours n'existe plus.",
    batchGone: "Ce groupe n'existe plus.",
    enquiryNotFound: "Demande introuvable.",
    alreadyConverted: "Cette demande est déjà devenue un élève.",
    saveFailed:
      "Impossible d'enregistrer la demande. Vérifiez votre connexion et réessayez.",
    convertFailed:
      "Impossible de terminer l'inscription. Rien n'a été enregistré — réessayez.",
  },
};
