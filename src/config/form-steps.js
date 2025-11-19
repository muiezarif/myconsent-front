const contentReleaseRoles = {
    labelKey: "form.content-release.participants_label",
    descriptionKey: "form.content-release.participants_desc",
    id: "participants",
    type: "participants",
    min: 2,
    max: 10,
    defaultParticipants: [
        { firstName: '', lastName: '', email: '', role: 'Releasor' },
        { firstName: '', lastName: '', email: '', role: 'Releasee' },
    ],
    roleOptions: [
        { value: 'Releasor', labelKey: 'form.content-release.role_releasor_label', descriptionKey: 'form.content-release.role_releasor_desc' },
        { value: 'Releasee', labelKey: 'form.content-release.role_releasee_label', descriptionKey: 'form.content-release.role_releasee_desc' },
        { value: 'Additional Participant', labelKey: 'form.content-release.role_additional_label', descriptionKey: 'form.content-release.role_additional_desc' }
    ]
};

const generalConsentRoles = {
    labelKey: "form.general-consent.participants_label",
    descriptionKey: "form.general-consent.participants_desc",
    id: "participants",
    type: "participants",
    min: 2,
    max: 10,
    defaultParticipants: [
        { firstName: '', lastName: '', email: '', role: 'Party A' },
        { firstName: '', lastName: '', email: '', role: 'Party B' },
    ],
    roleOptions: [
        { value: 'Party A', labelKey: 'form.general-consent.role_partyA_label', descriptionKey: 'form.general-consent.role_partyA_desc' },
        { value: 'Party B', labelKey: 'form.general-consent.role_partyB_label', descriptionKey: 'form.general-consent.role_partyB_desc' },
        { value: 'Witness', labelKey: 'form.general-consent.role_witness_label', descriptionKey: 'form.general-consent.role_witness_desc' }
    ]
};

const ndaRoles = {
    labelKey: "form.nda.participants_label",
    descriptionKey: "form.nda.participants_desc",
    id: "participants",
    type: "participants",
    min: 2,
    max: 10,
    defaultParticipants: [
        { firstName: '', lastName: '', email: '', role: 'Disclosing Party' },
        { firstName: '', lastName: '', email: '', role: 'Receiving Party' },
    ],
    roleOptions: [
        { value: 'Disclosing Party', labelKey: 'form.nda.role_disclosing_label', descriptionKey: 'form.nda.role_disclosing_desc' },
        { value: 'Receiving Party', labelKey: 'form.nda.role_receiving_label', descriptionKey: 'form.nda.role_receiving_desc' },
        { value: 'Witness', labelKey: 'form.nda.role_witness_label', descriptionKey: 'form.nda.role_witness_desc' }
    ]
};


export const formSteps = {
  'content-release': [
    {
      titleKey: 'form.content-release.step1Title',
      fields: [ contentReleaseRoles ]
    },
    {
      titleKey: 'form.content-release.step2Title',
      fields: [
        { id: 'eventName', labelKey: 'form.content-release.eventName_label', type: 'text' },
        { id: 'date', labelKey: 'form.common.date', type: 'date' },
        { id: 'idPhoto', labelKey: 'form.common.idPhotoOptional', type: 'file' },
        { id: 'shareEmail', labelKey: 'form.common.shareEmail', type: 'email' },
      ]
    },
    {
      titleKey: 'form.content-release.step3Title',
      fields: [
        { id: 'socialMedia', labelKey: 'form.content-release.socialMedia_label', type: 'checkbox' },
        { id: 'commercial', labelKey: 'form.content-release.commercial_label', type: 'checkbox' },
        { id: 'marketing', labelKey: 'form.content-release.marketing_label', type: 'checkbox' },
        { id: 'noExpiration', labelKey: 'form.content-release.noExpiration_label', type: 'checkbox' }
      ]
    },
    {
      titleKey: 'form.content-release.step4Title',
      fields: [
        { id: 'compensation', labelKey: 'form.content-release.compensation_label', type: 'text' },
        { id: 'additionalTerms', labelKey: 'form.common.additionalTerms', type: 'textarea' }
      ]
    }
  ],
  'general-consent': [
    {
      titleKey: 'form.general-consent.step1Title',
      fields: [ generalConsentRoles ]
    },
    {
      titleKey: 'form.general-consent.step2Title',
      fields: [
        { id: 'activityName', labelKey: 'form.general-consent.activityName_label', type: 'text' },
        { id: 'idPhoto', labelKey: 'form.common.idPhotoOptional', type: 'file' },
        { id: 'shareEmail', labelKey: 'form.common.shareEmailOptional', type: 'email' },
      ]
    },
    {
      titleKey: 'form.general-consent.step3Title',
      fields: [
        { id: 'healthDisclosure', labelKey: 'form.general-consent.healthDisclosure_label', type: 'checkbox' },
        { id: 'voluntaryParticipation', labelKey: 'form.general-consent.voluntaryParticipation_label', type: 'checkbox' }
      ]
    }
  ],
  'nda': [
    {
      titleKey: 'form.nda.step1Title',
      fields: [
        ndaRoles,
        { id: 'effectiveDate', labelKey: 'form.nda.effectiveDate_label', type: 'date' }
      ]
    },
    {
      titleKey: 'form.nda.step2Title',
      fields: [
        { id: 'purpose', labelKey: 'form.nda.purpose_label', type: 'textarea' },
        { id: 'idPhoto', labelKey: 'form.common.idPhoto', type: 'file' },
        { id: 'shareEmail', labelKey: 'form.common.shareEmail', type: 'email' },
      ]
    },
    {
      titleKey: 'form.nda.step3Title',
      fields: [
        { id: 'duration', labelKey: 'form.nda.duration_label', type: 'number' },
        { id: 'returnMaterials', labelKey: 'form.nda.returnMaterials_label', type: 'checkbox' }
      ]
    },
    {
      titleKey: 'form.nda.step4Title',
      fields: [
        { id: 'jurisdiction', labelKey: 'form.nda.jurisdiction_label', type: 'text' },
        { id: 'additionalClauses', labelKey: 'form.common.additionalClauses', type: 'textarea' }
      ]
    }
  ]
};